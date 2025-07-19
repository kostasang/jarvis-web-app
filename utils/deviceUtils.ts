import { DeviceData, DeviceStats, DeviceFilter } from '@/types/device'
import { DEVICE_TYPES } from '@/config/deviceTypes'

export function getDeviceConfig(deviceType: number) {
  return DEVICE_TYPES[deviceType] || {
    category: 'control' as const,
    icon: '❓',
    description: 'Unknown Device',
    values: 'binary' as const,
  }
}

export function formatDeviceValue(device: DeviceData): string {
  const config = getDeviceConfig(device.type)
  
  if (device.latestValue === undefined || device.latestValue === null) {
    return 'No data'
  }

  if (config.values === 'continuous') {
    const rounded = config.round !== undefined 
      ? Number(device.latestValue.toFixed(config.round))
      : device.latestValue
    return `${rounded}${config.unit || ''}`
  } else {
    // Binary values
    const valueMap = config.valueMap?.[device.latestValue]
    return valueMap?.text || device.latestValue.toString()
  }
}

export function getDeviceValueColor(device: DeviceData): string {
  const config = getDeviceConfig(device.type)
  
  if (config.values === 'binary' && device.latestValue !== undefined && device.latestValue !== null) {
    const valueMap = config.valueMap?.[device.latestValue]
    return valueMap?.color || 'gray'
  }
  
  return 'blue' // Default color for continuous values
}

export function filterDevices(devices: DeviceData[], filter: DeviceFilter): DeviceData[] {
  return devices.filter(device => {
    const config = getDeviceConfig(device.type)
    
    // Category filter
    if (filter.category && config.category !== filter.category) {
      return false
    }
    
    // Area filter
    if (filter.areaId !== undefined) {
      if (filter.areaId === null) {
        // Show only unassigned devices
        if (device.areaId) {
          return false
        }
      } else {
        // Show devices in specific area
        if (device.areaId !== filter.areaId) {
          return false
        }
      }
    }
    

    
    // Search term filter
    if (filter.searchTerm) {
      const searchLower = filter.searchTerm.toLowerCase()
      const matchesName = device.name?.toLowerCase().includes(searchLower) || false
      const matchesDescription = config.description.toLowerCase().includes(searchLower)
      if (!matchesName && !matchesDescription) {
        return false
      }
    }
    
    return true
  })
}

export function calculateDeviceStats(devices: DeviceData[]): DeviceStats {
  const stats: DeviceStats = {
    total: devices.length,
    byCategory: {
      environmental: 0,
      security: 0,
      control: 0
    },
    byArea: {}
  }

  let lastUpdate: string | undefined

  devices.forEach(device => {
    // Category count
    const config = getDeviceConfig(device.type)
    stats.byCategory[config.category]++
    
    // Area count
    if (device.areaId) {
      stats.byArea[device.areaId] = (stats.byArea[device.areaId] || 0) + 1
    }

    // Track most recent update
    if (device.latestTimestamp) {
      if (!lastUpdate || new Date(device.latestTimestamp) > new Date(lastUpdate)) {
        lastUpdate = device.latestTimestamp
      }
    }
  })

  if (lastUpdate) {
    stats.lastUpdate = lastUpdate
  }

  return stats
}

export function getDevicesForHub(devices: DeviceData[], hubId: string): DeviceData[] {
  return devices.filter(device => device.hubId === hubId)
}

export function getDevicesForArea(devices: DeviceData[], areaId: string): DeviceData[] {
  return devices.filter(device => device.areaId === areaId)
} 