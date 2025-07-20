'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react'
import { DeviceData } from '@/types/device'
import { deviceApi } from '@/lib/api'
import { config } from '@/config/env'

interface DevicesContextType {
  devices: DeviceData[]
  isLoading: boolean
  lastUpdate: string | null
  error: string | null
  refreshDevices: () => Promise<void>
}

const DevicesContext = createContext<DevicesContextType | undefined>(undefined)

interface DevicesProviderProps {
  children: ReactNode
}

export function DevicesProvider({ children }: DevicesProviderProps) {
  const [devices, setDevices] = useState<DeviceData[]>([])
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
    setLastUpdate(null)
    setError(null)
    setIsLoading(false)
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
        
        // Clear any reconnection timeout
        if (wsReconnectTimeoutRef.current) {
          clearTimeout(wsReconnectTimeoutRef.current)
          wsReconnectTimeoutRef.current = null
        }
      }
      
      ws.onmessage = (event) => {
        // When we receive a message, fetch latest devices data
        console.log('WebSocket: Received device update notification, fetching latest data')
        fetchDevices()
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
        startPolling()
      }
    }
  }, [startPolling, stopPolling])

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
    isConnectingRef.current = false
    wsRetryCountRef.current = 0
  }, [stopPolling])

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
  }, [connectWebSocket])

  useEffect(() => {
    const currentAuthState = isAuthenticated()
    lastAuthStateRef.current = currentAuthState
    
    // Initial load and setup if authenticated
    if (currentAuthState) {
      refreshDevices()
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
        refreshDevices()
        connectWebSocket()
        lastAuthStateRef.current = true
      } else if (!authenticated && wasAuthenticated) {
        // User just logged out
        console.log('User logged out, stopping device updates')
        disconnectWebSocket()
        stopPolling()
        clearDeviceData()
        lastAuthStateRef.current = false
      }
    }, 1000) // Check every second

    // Cleanup on unmount
    return () => {
      disconnectWebSocket()
      stopPolling()
      clearInterval(authCheckInterval)
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
    }
  }, [])

  const value: DevicesContextType = {
    devices,
    isLoading,
    lastUpdate,
    error,
    refreshDevices
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