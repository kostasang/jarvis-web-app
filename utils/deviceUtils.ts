import { DeviceData, DeviceStats, DeviceFilter } from '@/types/device'
import { DEVICE_TYPES } from '@/config/deviceTypes'
import { isValidTimestamp } from './dateUtils'

// Helper function to safely parse timestamps for comparison
function parseTimestampSafely(timestamp: string): Date | null {
  try {
    // Handle backend timestamp formats
    if (timestamp.includes(' EEST') || timestamp.includes(' EET')) {
      const cleanTimestamp = timestamp.replace(/ EEST| EET/g, '')
      const date = new Date(cleanTimestamp)
      return isNaN(date.getTime()) ? null : date
    } else {
      const date = new Date(timestamp)
      return isNaN(date.getTime()) ? null : date
    }
  } catch {
    return null
  }
}

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
  console.log('calculateDeviceStats: Processing', devices.length, 'devices')

  devices.forEach(device => {
    // Category count
    const config = getDeviceConfig(device.type)
    stats.byCategory[config.category]++
    
    // Area count
    if (device.areaId) {
      stats.byArea[device.areaId] = (stats.byArea[device.areaId] || 0) + 1
    }

    // Track most recent update
    if (device.latestTimestamp && isValidTimestamp(device.latestTimestamp)) {
      console.log('calculateDeviceStats: Processing device', device.id, 'with timestamp', device.latestTimestamp)
      if (!lastUpdate) {
        lastUpdate = device.latestTimestamp
        console.log('calculateDeviceStats: Set initial lastUpdate to', lastUpdate)
      } else {
        // Parse timestamps safely for comparison
        try {
          const deviceDate = parseTimestampSafely(device.latestTimestamp)
          const lastUpdateDate = parseTimestampSafely(lastUpdate)
          
          if (deviceDate && lastUpdateDate && deviceDate > lastUpdateDate) {
            console.log('calculateDeviceStats: Updating lastUpdate from', lastUpdate, 'to', device.latestTimestamp)
            lastUpdate = device.latestTimestamp
          } else if (deviceDate && !lastUpdateDate) {
            console.log('calculateDeviceStats: Setting lastUpdate to', device.latestTimestamp, '(previous was invalid)')
            lastUpdate = device.latestTimestamp
          }
        } catch (error) {
          console.warn('Error comparing timestamps:', error)
        }
      }
    } else {
      console.log('calculateDeviceStats: Skipping device', device.id, '- no valid timestamp (', device.latestTimestamp, ')')
    }
  })

  if (lastUpdate) {
    stats.lastUpdate = lastUpdate
    console.log('calculateDeviceStats: Final lastUpdate set to', lastUpdate)
  } else {
    console.log('calculateDeviceStats: No valid lastUpdate found')
  }

  return stats
}

export function getDevicesForHub(devices: DeviceData[], hubId: string): DeviceData[] {
  return devices.filter(device => device.hubId === hubId)
}

export function getDevicesForArea(devices: DeviceData[], areaId: string): DeviceData[] {
  return devices.filter(device => device.areaId === areaId)
} 