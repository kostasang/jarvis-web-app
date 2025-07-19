'use client'

import { useState, useEffect } from 'react'
import { DeviceData } from '@/types/device'
import { AreaData } from '@/types/area'
import { getDeviceConfig, formatDeviceValue, getDeviceValueColor } from '@/utils/deviceUtils'
import { deviceApi, areaApi } from '@/lib/api'
import { useDevice } from '@/lib/DevicesContext'
import DeviceHistoryChart from './DeviceHistoryChart'
import { 
  X, 
  Edit3, 
  Check, 
  Clock, 
  MapPin, 
  Wifi,
  Hash,
  Calendar,
  Activity,
  Power
} from 'lucide-react'

interface DeviceModalProps {
  device: DeviceData | null
  isOpen: boolean
  onClose: () => void
  onDeviceUpdate?: () => void
  areaName?: string
  hubId?: string
}

export default function DeviceModal({ device, isOpen, onClose, onDeviceUpdate, areaName, hubId }: DeviceModalProps) {
  const [isEditingName, setIsEditingName] = useState(false)
  const [nickname, setNickname] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [areas, setAreas] = useState<AreaData[]>([])
  const [currentAreaId, setCurrentAreaId] = useState<string | undefined>(undefined)
  const [isChangingArea, setIsChangingArea] = useState(false)
  // Use centralized device data for live updates
  const { device: liveDevice } = useDevice(device?.id || null)

  useEffect(() => {
    if (device) {
      setNickname(device.name || '')
      setCurrentAreaId(device.areaId)
      setIsEditingName(false)
    }
  }, [device])

  // Update nickname and area when live device data changes
  useEffect(() => {
    if (liveDevice && !isEditingName) {
      setNickname(liveDevice.name || '')
      setCurrentAreaId(liveDevice.areaId)
    }
  }, [liveDevice?.name, liveDevice?.areaId, isEditingName])

  useEffect(() => {
    const fetchAreas = async () => {
      if (isOpen && hubId) {
        try {
          const areasData = await areaApi.getAreas(hubId)
          setAreas(areasData)
        } catch (error) {
          console.error('Failed to fetch areas:', error)
        }
      }
    }

    fetchAreas()
  }, [isOpen, hubId])

  if (!isOpen || !device) return null

  // Use live device data for dynamic values, fallback to original device
  const currentDevice = liveDevice || device
  const config = getDeviceConfig(device.type)
  const value = formatDeviceValue(currentDevice)
  const valueColor = getDeviceValueColor(currentDevice)

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

  const handleToggleDevice = async () => {
    if (!currentDevice || currentDevice.latestValue === undefined || currentDevice.latestValue === null) {
      console.log('Cannot toggle device: no current value')
      return
    }

    // Toggle binary value: 0 -> 1, 1 -> 0
    const targetValue = currentDevice.latestValue === 0 ? 1 : 0
    
          console.log(`Toggle device ${currentDevice.name || device?.id} (${device?.id}): ${currentDevice.latestValue} -> ${targetValue}`)
    
    try {
      await deviceApi.commandDevice(device.id, targetValue)
      console.log('Device command sent successfully')
    } catch (error) {
      console.error('Failed to send device command:', error)
    }
  }

  const handleCancelEdit = () => {
    setNickname(device?.name || '')
    setIsEditingName(false)
  }

  const handleAreaAssignment = async (areaId: string) => {
    if (!device?.id) return

    setIsChangingArea(true)
    try {
      await deviceApi.assignDeviceToArea(device.id, areaId)
      setCurrentAreaId(areaId)
      if (onDeviceUpdate) {
        onDeviceUpdate()
      }
    } catch (error) {
      console.error('Failed to assign device to area:', error)
    } finally {
      setIsChangingArea(false)
    }
  }

  const handleRemoveFromArea = async () => {
    if (!device?.id) return

    setIsChangingArea(true)
    try {
      await deviceApi.removeDeviceFromArea(device.id)
      setCurrentAreaId(undefined)
      if (onDeviceUpdate) {
        onDeviceUpdate()
      }
    } catch (error) {
      console.error('Failed to remove device from area:', error)
    } finally {
      setIsChangingArea(false)
    }
  }

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return 'No data available'
    return new Date(timestamp).toLocaleString()
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-dark-600">
            <div className="flex items-center">
              <div className="w-16 h-16 rounded-xl flex items-center justify-center mr-4 bg-gradient-to-br from-primary-600 to-secondary-600">
                <span className="text-3xl">{config.icon}</span>
              </div>
              <div className="flex-1">
                {isEditingName ? (
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      className="input-field !py-2 !px-3 text-lg font-semibold flex-1"
                      placeholder="Device name"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveNickname()
                        if (e.key === 'Escape') handleCancelEdit()
                      }}
                    />
                    <button
                      onClick={handleSaveNickname}
                      disabled={isLoading || !nickname.trim()}
                      className="p-2 text-green-400 hover:text-green-300 disabled:opacity-50"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="p-2 text-red-400 hover:text-red-300"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-white">{nickname}</h2>
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="p-2 text-dark-400 hover:text-dark-200 transition-colors"
                    >
                      <Edit3 className="w-5 h-5" />
                    </button>
                  </div>
                )}
                <p className="text-dark-400 mt-1">{config.description}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-dark-400">
                  <span className="flex items-center gap-1">
                    <Hash className="w-4 h-4" />
                    {device.id?.slice(0, 8)}...
                  </span>
                  <span className="px-2 py-1 bg-primary-600/20 text-primary-400 rounded-full text-xs font-medium">
                    {config.category}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-dark-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Current Reading */}
            <div className="glass-card p-6 bg-gradient-to-br from-primary-600/10 to-secondary-600/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Current Reading
                </h3>
                <div className="flex items-center gap-2 text-sm text-dark-400">
                  <Wifi className="w-4 h-4" />
                  Live
                </div>
              </div>
              <div className="flex items-center justify-between mb-2">
                <div className={`text-4xl font-bold ${getColorClass(valueColor)}`}>
                  {value}
                </div>
                {/* Control Button - Only for control devices */}
                {config.category === 'control' && currentDevice.latestValue !== undefined && currentDevice.latestValue !== null && (
                  <button
                    onClick={handleToggleDevice}
                    className={`p-3 rounded-xl transition-all transform hover:scale-105 ${
                      currentDevice.latestValue === 1 
                        ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 shadow-lg shadow-yellow-500/20' 
                        : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30 shadow-lg shadow-gray-500/20'
                    }`}
                    title={`Turn ${currentDevice.latestValue === 1 ? 'Off' : 'On'}`}
                  >
                    <Power className="w-6 h-6" />
                  </button>
                )}
              </div>
              {currentDevice.latestTimestamp && (
                <div className="flex items-center gap-2 text-sm text-dark-400">
                  <Clock className="w-4 h-4" />
                  <span>Last updated: {formatTimestamp(currentDevice.latestTimestamp)}</span>
                </div>
              )}
            </div>

            {/* Device Information */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Location */}
              <div className="glass-card p-4">
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location
                </h4>
                <div className="space-y-3">
                  {/* Current Assignment */}
                  <div className="text-dark-400">
                    {currentAreaId ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">
                            {areas.find(area => area.id === currentAreaId)?.name || 'Unknown Area'}
                          </span>
                          <span className="px-2 py-1 bg-secondary-600/20 text-secondary-400 rounded text-xs">
                            Area
                          </span>
                        </div>
                        <button
                          onClick={handleRemoveFromArea}
                          disabled={isChangingArea}
                          className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-400">Unassigned</span>
                        <span className="px-2 py-1 bg-yellow-600/20 text-yellow-400 rounded text-xs">
                          No Area
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Area Assignment */}
                  {areas.length > 0 && (
                    <div>
                      <label className="text-xs text-dark-400 mb-2 block">
                        {currentAreaId ? 'Change Area:' : 'Assign to Area:'}
                      </label>
                      <select
                        className="input-field text-sm w-full"
                        value=""
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAreaAssignment(e.target.value)
                          }
                        }}
                        disabled={isChangingArea}
                      >
                        <option value="">Select an area...</option>
                        {areas
                          .filter(area => area.id !== currentAreaId)
                          .map(area => (
                            <option key={area.id} value={area.id}>
                              {area.name}
                            </option>
                          ))
                        }
                      </select>
                    </div>
                  )}

                  {isChangingArea && (
                    <div className="text-xs text-dark-400 flex items-center gap-2">
                      <div className="animate-spin rounded-full h-3 w-3 border-b border-primary-500"></div>
                      Updating assignment...
                    </div>
                  )}
                </div>
              </div>

              {/* Device Type */}
              <div className="glass-card p-4">
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Device Type
                </h4>
                                 <div className="space-y-2">
                   <div className="text-white font-medium">{config.description}</div>
                   <div className="text-xs text-dark-400">ID: {device.type}</div>
                 </div>
              </div>

              {/* Data History */}
              <div className="glass-card p-4 md:col-span-2">
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Data History
                </h4>
                <DeviceHistoryChart device={currentDevice} />
              </div>
            </div>

            {/* Raw Data (for debugging) */}
            <div className="glass-card p-4 bg-dark-800/30">
              <h4 className="text-sm font-semibold text-white mb-3">Raw Device Data</h4>
              <div className="text-xs text-dark-400 font-mono bg-dark-900/50 p-3 rounded overflow-x-auto">
                <div>Device ID: {device.id}</div>
                <div>Hub ID: {device.hubId}</div>
                <div>Area ID: {currentDevice.areaId || 'null'}</div>
                <div>Type: {device.type}</div>
                <div>Latest Value: {currentDevice.latestValue}</div>
                <div>Timestamp: {currentDevice.latestTimestamp}</div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-dark-600 bg-dark-800/30">
            <div className="flex justify-between items-center">
              <div className="text-sm text-dark-400">
                Device dashboard • More features coming soon
              </div>
              <button
                onClick={onClose}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 