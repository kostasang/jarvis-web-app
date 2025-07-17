'use client'

import { DeviceData } from '@/types/device'
import { getDeviceConfig, formatDeviceValue, getDeviceValueColor } from '@/utils/deviceUtils'
import { Clock } from 'lucide-react'

interface DeviceCardProps {
  device: DeviceData
  showArea?: boolean
  areaName?: string
}

export default function DeviceCard({ device, showArea = false, areaName }: DeviceCardProps) {
  const config = getDeviceConfig(device.type)
  const value = formatDeviceValue(device)
  const valueColor = getDeviceValueColor(device)
  
  const getColorClass = (color: string) => {
    switch (color) {
      case 'red': return 'text-red-400'
      case 'green': return 'text-green-400'
      case 'blue': return 'text-blue-400'
      case 'yellow': return 'text-yellow-400'
      case 'orange': return 'text-orange-400'
      case 'gray': return 'text-gray-400'
      default: return 'text-white'
    }
  }



  return (
    <div className="glass-card p-4 hover:bg-dark-700/30 transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center mr-3">
            <span className="text-2xl">{config.icon}</span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">{device.name}</h3>
            <p className="text-xs text-dark-400">{config.description}</p>
          </div>
        </div>
      </div>

      {/* Value */}
      <div className="mb-3">
        <div className={`text-lg font-bold ${getColorClass(valueColor)}`}>
          {value}
        </div>
        {device.latestTimestamp && (
          <div className="flex items-center gap-1 text-xs text-dark-400 mt-1">
            <Clock className="w-3 h-3" />
            <span>{new Date(device.latestTimestamp).toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Area Info */}
      {showArea && areaName && (
        <div className="text-xs text-dark-400 bg-dark-800/50 px-2 py-1 rounded">
          📍 {areaName}
        </div>
      )}
      
      {/* Show unassigned if no area */}
      {showArea && !areaName && (
        <div className="text-xs text-dark-400 bg-dark-800/50 px-2 py-1 rounded">
          📍 Unassigned
        </div>
      )}
    </div>
  )
} 