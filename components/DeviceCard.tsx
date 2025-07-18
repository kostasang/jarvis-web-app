'use client'

import { useState } from 'react'
import { DeviceData } from '@/types/device'
import { getDeviceConfig, formatDeviceValue, getDeviceValueColor } from '@/utils/deviceUtils'
import { Clock, Edit3, Check, X, Power } from 'lucide-react'
import { deviceApi } from '@/lib/api'

interface DeviceCardProps {
  device: DeviceData
  showArea?: boolean
  areaName?: string
  onDeviceUpdate?: () => void
  onDeviceClick?: (device: DeviceData, areaName?: string) => void
}

export default function DeviceCard({ device, showArea = false, areaName, onDeviceUpdate, onDeviceClick }: DeviceCardProps) {
  const [isEditingName, setIsEditingName] = useState(false)
  const [nickname, setNickname] = useState(device.name)
  const [isLoading, setIsLoading] = useState(false)
  
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

  const handleSaveNickname = async () => {
    if (!nickname.trim() || !device.id) return

    setIsLoading(true)
    try {
      await deviceApi.setDeviceNickname(device.id, nickname.trim())
      setIsEditingName(false)
      if (onDeviceUpdate) {
        onDeviceUpdate()
      }
    } catch (error) {
      console.error('Failed to update device nickname:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setNickname(device.name)
    setIsEditingName(false)
  }

  const handleCardClick = () => {
    if (!isEditingName && onDeviceClick) {
      onDeviceClick(device, areaName)
    }
  }

  const handleToggleDevice = async (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click
    
    if (device.latestValue === undefined || device.latestValue === null) {
      console.log('Cannot toggle device: no current value')
      return
    }

    // Toggle binary value: 0 -> 1, 1 -> 0
    const targetValue = device.latestValue === 0 ? 1 : 0
    
    console.log(`Toggle device ${device.name} (${device.id}): ${device.latestValue} -> ${targetValue}`)
    
    try {
      await deviceApi.commandDevice(device.id, targetValue)
      console.log('Device command sent successfully')
    } catch (error) {
      console.error('Failed to send device command:', error)
    }
  }

  return (
    <div 
      className={`glass-card p-4 hover:bg-dark-700/30 transition-all duration-200 ${
        onDeviceClick && !isEditingName ? 'cursor-pointer' : ''
      }`}
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center flex-1">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center mr-3">
            <span className="text-2xl">{config.icon}</span>
          </div>
          <div className="flex-1">
            {isEditingName ? (
              <div className="flex items-center gap-2 mb-1">
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="input-field !py-1 !px-2 text-xs w-full"
                  placeholder="Device name"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveNickname()
                    if (e.key === 'Escape') handleCancelEdit()
                  }}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSaveNickname()
                  }}
                  disabled={isLoading || !nickname.trim()}
                  className="p-1 text-green-400 hover:text-green-300 disabled:opacity-50"
                >
                  <Check className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCancelEdit()
                  }}
                  className="p-1 text-red-400 hover:text-red-300"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-semibold text-white">{device.name}</h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsEditingName(true)
                  }}
                  className="p-1 text-dark-400 hover:text-dark-200 transition-colors"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
              </div>
            )}
            <p className="text-xs text-dark-400">{config.description}</p>
          </div>
        </div>
      </div>

      {/* Value */}
      <div className="mb-3">
        <div className="flex items-center justify-between">
          <div className={`text-lg font-bold ${getColorClass(valueColor)}`}>
            {value}
          </div>
          {/* Control Button - Only for control devices */}
          {config.category === 'control' && device.latestValue !== undefined && device.latestValue !== null && (
            <button
              onClick={handleToggleDevice}
              className={`p-2 rounded-lg transition-colors ${
                device.latestValue === 1 
                  ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30' 
                  : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
              }`}
              title={`Turn ${device.latestValue === 1 ? 'Off' : 'On'}`}
            >
              <Power className="w-4 h-4" />
            </button>
          )}
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