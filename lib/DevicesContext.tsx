'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react'
import { DeviceData } from '@/types/device'
import { HubReadings } from '@/types/hub'
import { deviceApi, hubApi } from '@/lib/api'
import { config } from '@/config/env'

interface DevicesContextType {
  devices: DeviceData[]
  hubReadings: Record<string, HubReadings>
  isLoading: boolean
  lastUpdate: string | null
  error: string | null
  refreshDevices: () => Promise<void>
  getHubReadings: (hubId: string) => HubReadings | null
}

const DevicesContext = createContext<DevicesContextType | undefined>(undefined)

interface DevicesProviderProps {
  children: ReactNode
}

export function DevicesProvider({ children }: DevicesProviderProps) {
  const [devices, setDevices] = useState<DeviceData[]>([])
  const [hubReadings, setHubReadings] = useState<Record<string, HubReadings>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Debouncing refs
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isRefreshingRef = useRef(false)
  
  // WebSocket refs
  const wsRef = useRef<WebSocket | null>(null)
  const wsReconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isConnectingRef = useRef(false)
  const lastAuthStateRef = useRef<boolean>(false)
  
  // Fallback polling refs
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const periodicSyncIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const wsRetryCountRef = useRef(0)
  const maxWsRetries = 3 // Try WebSocket 3 times before falling back to polling
  
  // Check if user is authenticated
  const isAuthenticated = () => {
    if (typeof window === 'undefined') return false
    return !!localStorage.getItem('jarvis_token')
  }

  const fetchDevices = async () => {
    // Don't make API calls if user is not authenticated
    if (!isAuthenticated()) {
      return
    }
    
    try {
      const devicesData = await deviceApi.getDevicesLatestData()
      setDevices(devicesData)
      setLastUpdate(new Date().toISOString())
      setError(null)
    } catch (err: any) {
      console.error('Failed to fetch devices data:', err)
      
            // If it's an authentication error, stop WebSocket and clear data
      if (err.response?.status === 401) {
        console.log('Authentication failed, stopping device updates')
        disconnectWebSocket()
        stopPolling()
        clearDeviceData()
        return
      }
      
      setError('Failed to fetch devices data')
      // Don't throw error to avoid disrupting the app
    }
  }
  
  const clearDeviceData = () => {
    setDevices([])
    setHubReadings({})
    setLastUpdate(null)
    setError(null)
    setIsLoading(false)
  }

  // Update individual device from WebSocket message
  const updateDeviceFromWebSocket = (deviceMessage: any) => {
    setDevices(prevDevices => {
      return prevDevices.map(device => {
        if (device.id === deviceMessage.device_id) {
          return {
            ...device,
            latestValue: deviceMessage.device_data ?? deviceMessage.device_state ?? device.latestValue,
            latestTimestamp: deviceMessage.timestamp,
            batteryLevel: deviceMessage.battery_level ?? device.batteryLevel,
            deviceVersion: deviceMessage.device_version ?? device.deviceVersion,
          }
        }
        return device
      })
    })
    setLastUpdate(new Date().toISOString())
  }

  // Update hub readings from WebSocket message
  const updateHubReadingsFromWebSocket = (statusMessage: any) => {
    setHubReadings(prev => ({
      ...prev,
      [statusMessage.hub_id]: {
        hub_id: statusMessage.hub_id,
        health: statusMessage.health,
        power_status: statusMessage.power_status,
        uptime: statusMessage.uptime,
        firmware_version: statusMessage.firmware_version,
        last_seen: statusMessage.last_seen,
      }
    }))
  }

  // Get hub readings for a specific hub
  const getHubReadings = (hubId: string): HubReadings | null => {
    return hubReadings[hubId] || null
  }

  // Fetch all hub readings using hub IDs from devices or hubs API
  const fetchAllHubReadings = async () => {
    if (!isAuthenticated()) return

    try {
      let hubIds: string[] = []

      // First try to get hub IDs from devices
      const deviceHubIds = Array.from(new Set(devices.map(device => device.hubId)))
      
      if (deviceHubIds.length > 0) {
        hubIds = deviceHubIds
      } else {
        // If no devices available, fetch hubs directly to get hub IDs
        console.log('No hub IDs from devices, fetching from hubs API')
        try {
          const hubs = await hubApi.getHubs()
          hubIds = hubs.map(hub => hub.id).filter(Boolean)
        } catch (error) {
          console.error('Failed to fetch hubs for hub readings:', error)
          return
        }
      }
      
      if (hubIds.length === 0) {
        console.log('No hub IDs found, skipping hub readings fetch')
        return
      }
      
      console.log('Fetching hub readings for hubs:', hubIds)
      
      for (const hubId of hubIds) {
        try {
          const readings = await hubApi.getHubReadings(hubId)
          setHubReadings(prev => ({
            ...prev,
            [hubId]: readings
          }))
        } catch (error) {
          console.error(`Failed to fetch readings for hub ${hubId}:`, error)
        }
      }
    } catch (error) {
      console.error('Failed to fetch hub readings:', error)
    }
  }

  // Start periodic sync every 30 seconds
  const startPeriodicSync = useCallback(() => {
    if (!isAuthenticated()) return

    // Clear any existing interval
    if (periodicSyncIntervalRef.current) {
      clearInterval(periodicSyncIntervalRef.current)
    }

    console.log('Starting periodic sync every 30 seconds')
    
    periodicSyncIntervalRef.current = setInterval(async () => {
      if (isAuthenticated()) {
        console.log('Periodic sync: Fetching devices and hub readings')
        await fetchDevices()
        await fetchAllHubReadings()
      }
    }, 30000) // 30 seconds
  }, [])

  // Stop periodic sync
  const stopPeriodicSync = () => {
    if (periodicSyncIntervalRef.current) {
      clearInterval(periodicSyncIntervalRef.current)
      periodicSyncIntervalRef.current = null
      console.log('Stopped periodic sync')
    }
  }
  
  const startPolling = useCallback(() => {
    if (!isAuthenticated()) return
    
    // Don't start polling if WebSocket is connected
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      return
    }
    
    // Don't start if already polling
    if (pollingIntervalRef.current) {
      return
    }
    
    console.log('WebSocket: Starting fallback polling (5 second intervals)')
    pollingIntervalRef.current = setInterval(() => {
      fetchDevices()
    }, 5000)
    
    // Also fetch immediately
    fetchDevices()
  }, [])
  
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      console.log('WebSocket: Stopping fallback polling')
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
  }, [])

  const refreshDevices = useCallback(async () => {
    // Don't refresh if not authenticated
    if (!isAuthenticated()) {
      return
    }
    
    // If already refreshing, don't start another refresh
    if (isRefreshingRef.current) {
      return
    }

    // Clear any pending refresh
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current)
    }

    // Debounce multiple rapid calls to 200ms for better batching
    refreshTimeoutRef.current = setTimeout(async () => {
      // Double-check if still needed (another call might have occurred)
      if (isRefreshingRef.current || !isAuthenticated()) {
        return
      }
      
      isRefreshingRef.current = true
      setIsLoading(true)
      
      try {
        await fetchDevices()
      } finally {
        setIsLoading(false)
        isRefreshingRef.current = false
      }
    }, 200)
  }, [])
  
  const connectWebSocket = useCallback(() => {
    if (!isAuthenticated()) {
      console.log('WebSocket: Not authenticated, skipping connection')
      return
    }
    
    // Prevent multiple simultaneous connection attempts
    if (isConnectingRef.current) {
      console.log('WebSocket: Already connecting, skipping duplicate attempt')
      return
    }
    
    // Check if already connected
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log('WebSocket: Already connected, skipping')
      return
    }
    
    const token = localStorage.getItem('jarvis_token')
    if (!token) {
      console.log('WebSocket: No token found, skipping connection')
      return
    }
    
    isConnectingRef.current = true
    console.log(`WebSocket: Starting connection attempt... (retry ${wsRetryCountRef.current + 1}/${maxWsRetries})`)
    
    // Close existing connection if any
    if (wsRef.current) {
      console.log('WebSocket: Closing existing connection')
      wsRef.current.close()
      wsRef.current = null
    }
    
    try {
      const ws = new WebSocket(`${config.websocketUrl}/get_live_notifications?token=${token}`)
      
      ws.onopen = () => {
        console.log('WebSocket: Connected successfully for device notifications')
        isConnectingRef.current = false
        wsRetryCountRef.current = 0 // Reset retry count on successful connection
        
        // Stop polling since WebSocket is now working
        stopPolling()
        
        // Start periodic sync for data freshness
        startPeriodicSync()
        
        // Clear any reconnection timeout
        if (wsReconnectTimeoutRef.current) {
          clearTimeout(wsReconnectTimeoutRef.current)
          wsReconnectTimeoutRef.current = null
        }
      }
      
      ws.onmessage = (event) => {
        console.log('WebSocket: Message content:', event.data)
        
        try {
          const message = JSON.parse(event.data)
          
          // Handle device updates
          if (message.topic_description === 'devices') {
            updateDeviceFromWebSocket(message)
          }
          // Handle hub status updates
          else if (message.topic_description === 'status') {
            updateHubReadingsFromWebSocket(message)
          }
        } catch (error) {
          console.error('WebSocket: Failed to parse message:', error)
        }
      }
      
      ws.onclose = (event) => {
        console.log(`WebSocket: Disconnected - Code: ${event.code}, Reason: ${event.reason}`)
        wsRef.current = null
        isConnectingRef.current = false
        
        // Only attempt reconnection if still authenticated and not a clean close
        if (isAuthenticated() && event.code !== 1000) {
          wsRetryCountRef.current++
          
          if (wsRetryCountRef.current < maxWsRetries) {
            console.log(`WebSocket: Attempting to reconnect in 5 seconds... (attempt ${wsRetryCountRef.current + 1}/${maxWsRetries})`)
            wsReconnectTimeoutRef.current = setTimeout(() => {
              connectWebSocket()
            }, 5000)
          } else {
            console.log('WebSocket: Max retries reached, falling back to polling')
            wsRetryCountRef.current = 0 // Reset for future attempts
            stopPeriodicSync()
            startPolling()
          }
        }
      }
      
      ws.onerror = (error) => {
        console.error('WebSocket: Connection error:', error)
        isConnectingRef.current = false
      }
      
      wsRef.current = ws
    } catch (error) {
      console.error('WebSocket: Failed to create connection:', error)
      isConnectingRef.current = false
      
      // Increment retry count and decide whether to retry or fall back
      wsRetryCountRef.current++
      if (wsRetryCountRef.current < maxWsRetries) {
        console.log(`WebSocket: Retrying connection in 5 seconds... (attempt ${wsRetryCountRef.current + 1}/${maxWsRetries})`)
        wsReconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket()
        }, 5000)
      } else {
        console.log('WebSocket: Max retries reached, falling back to polling')
        wsRetryCountRef.current = 0
        stopPeriodicSync()
        startPolling()
      }
    }
  }, [startPolling, stopPolling, refreshDevices])

  const disconnectWebSocket = useCallback(() => {
    console.log('WebSocket: Disconnecting...')
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnected')
      wsRef.current = null
    }
    
    if (wsReconnectTimeoutRef.current) {
      clearTimeout(wsReconnectTimeoutRef.current)
      wsReconnectTimeoutRef.current = null
    }
    
    stopPolling()
    stopPeriodicSync()
    isConnectingRef.current = false
    wsRetryCountRef.current = 0
  }, [stopPolling, stopPeriodicSync])

  useEffect(() => {
    const currentAuthState = isAuthenticated()
    lastAuthStateRef.current = currentAuthState
    
    // Initial load and setup if authenticated
    if (currentAuthState) {
      const initializeData = async () => {
        console.log('Initializing app data...')
        await fetchDevices()
        await fetchAllHubReadings()
        setIsLoading(false)
      }
      initializeData()
      connectWebSocket()
    } else {
      // Clear data if not authenticated
      clearDeviceData()
    }

    // Monitor authentication state changes by checking periodically
    const authCheckInterval = setInterval(() => {
      const authenticated = isAuthenticated()
      const wasAuthenticated = lastAuthStateRef.current
      
      // Only act on actual state changes
      if (authenticated && !wasAuthenticated) {
        // User just logged in
        console.log('User logged in, starting device updates via WebSocket')
        const initializeData = async () => {
          await fetchDevices()
          await fetchAllHubReadings()
        }
        initializeData()
        connectWebSocket()
        lastAuthStateRef.current = true
      } else if (!authenticated && wasAuthenticated) {
        // User just logged out
        console.log('User logged out, stopping device updates')
        disconnectWebSocket()
        stopPolling()
        stopPeriodicSync()
        clearDeviceData()
        lastAuthStateRef.current = false
      }
    }, 1000) // Check every second

    // Cleanup on unmount
    return () => {
      disconnectWebSocket()
      stopPolling()
      stopPeriodicSync()
      clearInterval(authCheckInterval)
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
    }
  }, [])

  const value: DevicesContextType = {
    devices,
    hubReadings,
    isLoading,
    lastUpdate,
    error,
    refreshDevices,
    getHubReadings
  }

  return (
    <DevicesContext.Provider value={value}>
      {children}
    </DevicesContext.Provider>
  )
}

export function useDevices() {
  const context = useContext(DevicesContext)
  if (context === undefined) {
    throw new Error('useDevices must be used within a DevicesProvider')
  }
  return context
}

// Helper hooks for filtered device data
export function useDevicesForHub(hubId: string | null) {
  const { devices, isLoading, lastUpdate, error } = useDevices()
  
  const hubDevices = React.useMemo(() => {
    if (!hubId) return []
    return devices.filter(device => device.hubId === hubId)
  }, [devices, hubId])

  // Return a stable reference to prevent unnecessary re-renders
  return React.useMemo(() => ({
    devices: hubDevices,
    isLoading,
    lastUpdate,
    error
  }), [hubDevices, isLoading, lastUpdate, error])
}

export function useDevicesForArea(areaId: string) {
  const { devices, isLoading, lastUpdate, error } = useDevices()
  
  const areaDevices = React.useMemo(() => {
    return devices.filter(device => device.areaId === areaId)
  }, [devices, areaId])

  return React.useMemo(() => ({
    devices: areaDevices,
    isLoading,
    lastUpdate,
    error
  }), [areaDevices, isLoading, lastUpdate, error])
}

export function useUnassignedDevices(hubId: string | null) {
  const { devices, isLoading, lastUpdate, error } = useDevices()
  
  const unassignedDevices = React.useMemo(() => {
    if (!hubId) return []
    return devices.filter(device => device.hubId === hubId && !device.areaId)
  }, [devices, hubId])

  return React.useMemo(() => ({
    devices: unassignedDevices,
    isLoading,
    lastUpdate,
    error
  }), [unassignedDevices, isLoading, lastUpdate, error])
}

export function useDevice(deviceId: string | null) {
  const { devices, isLoading, lastUpdate, error } = useDevices()
  
  const device = React.useMemo(() => {
    if (!deviceId) return null
    return devices.find(device => device.id === deviceId) || null
  }, [devices, deviceId])

  return React.useMemo(() => ({
    device,
    isLoading,
    lastUpdate,
    error
  }), [device, isLoading, lastUpdate, error])
} 