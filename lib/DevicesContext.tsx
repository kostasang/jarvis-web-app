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

  const fetchDevices = async () => {
    try {
      const devicesData = await deviceApi.getDevicesLatestData()
      setDevices(devicesData)
      setLastUpdate(new Date().toISOString())
      setError(null)
    } catch (err: any) {
      console.error('Failed to fetch devices data:', err)
      setError('Failed to fetch devices data')
      // Don't throw error to avoid disrupting the app
    }
  }

  const refreshDevices = useCallback(async () => {
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
      if (isRefreshingRef.current) {
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
    // Initial load
    refreshDevices()

    // Set up periodic refresh every 5 seconds
    const interval = setInterval(fetchDevices, 5000)

    // Cleanup interval and timeout on unmount
    return () => {
      clearInterval(interval)
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