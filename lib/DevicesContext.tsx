'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react'
import { DeviceData } from '@/types/device'
import { deviceApi } from '@/lib/api'

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
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  
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
      
      // If it's an authentication error, stop the interval and clear data
      if (err.response?.status === 401) {
        console.log('Authentication failed, stopping device updates')
        stopInterval()
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
  
  const stopInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }
  
  const startInterval = () => {
    if (!intervalRef.current && isAuthenticated()) {
      intervalRef.current = setInterval(fetchDevices, 5000)
    }
  }

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

  useEffect(() => {
    // Initial load and setup if authenticated
    if (isAuthenticated()) {
      refreshDevices()
      startInterval()
    } else {
      // Clear data if not authenticated
      clearDeviceData()
    }

    // Monitor authentication state changes by checking periodically
    const authCheckInterval = setInterval(() => {
      const authenticated = isAuthenticated()
      
      if (authenticated && !intervalRef.current) {
        // User logged in, start device updates
        console.log('User logged in, starting device updates')
        refreshDevices()
        startInterval()
      } else if (!authenticated && intervalRef.current) {
        // User logged out, stop device updates
        console.log('User logged out, stopping device updates')
        stopInterval()
        clearDeviceData()
      }
    }, 1000) // Check every second

    // Cleanup on unmount
    return () => {
      stopInterval()
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