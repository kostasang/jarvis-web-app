'use client'

import { useState, useEffect } from 'react'
import { 
  MapPin, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { AreaData } from '@/types/area'
import { DeviceData } from '@/types/device'
import { areaApi, deviceApi } from '@/lib/api'
import { getDevicesForArea, calculateDeviceStats } from '@/utils/deviceUtils'
import DeviceCard from './DeviceCard'

interface AreaCardProps {
  area: AreaData
  hubId: string
  onAreaUpdate: () => void
}

export default function AreaCard({ area, hubId, onAreaUpdate }: AreaCardProps) {
  const [isEditingName, setIsEditingName] = useState(false)
  const [newName, setNewName] = useState(area.name)
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showDevices, setShowDevices] = useState(false)
  const [devices, setDevices] = useState<DeviceData[]>([])
  const [deviceStats, setDeviceStats] = useState({ total: 0, lastUpdate: undefined as string | undefined })

  // Fetch devices for this area
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const allDevices = await deviceApi.getDevicesLatestData()
        const areaDevices = getDevicesForArea(allDevices, area.id)
        const stats = calculateDeviceStats(areaDevices)
        setDevices(areaDevices)
        setDeviceStats({
          total: stats.total,
          lastUpdate: stats.lastUpdate
        })
      } catch (error) {
        console.error('Failed to fetch devices for area:', error)
      }
    }

    fetchDevices()
    
    // Set up periodic refresh every 5 seconds
    const interval = setInterval(fetchDevices, 5000)
    
    // Cleanup interval on unmount
    return () => clearInterval(interval)
  }, [area.id])

  const handleSaveName = async () => {
    if (!newName.trim() || newName === area.name) {
      setIsEditingName(false)
      setNewName(area.name)
      return
    }

    setIsLoading(true)
    try {
      console.log('Renaming area:', { hub_id: hubId, area_id: area.id, new_area_name: newName.trim() })
      await areaApi.renameArea({
        hub_id: hubId,
        area_id: area.id,
        new_area_name: newName.trim(),
      })
      setIsEditingName(false)
      onAreaUpdate()
    } catch (error) {
      console.error('Failed to rename area:', error)
      setNewName(area.name)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setNewName(area.name)
    setIsEditingName(false)
  }

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      console.log('Deleting area:', { hub_id: hubId, area_id: area.id })
      await areaApi.deleteArea({
        hub_id: hubId,
        area_id: area.id,
      })
      onAreaUpdate()
    } catch (error) {
      console.error('Failed to delete area:', error)
    } finally {
      setIsLoading(false)
      setShowDeleteConfirm(false)
    }
  }

  return (
    <div className="glass-card hover:bg-dark-700/30 transition-all duration-200">
      {/* Main Card Content */}
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center flex-1">
            <div className="w-10 h-10 bg-secondary-600 rounded-lg flex items-center justify-center mr-3">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            
            {isEditingName ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="input-field !py-1 !px-2 text-sm flex-1"
                  placeholder="Area name"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveName()
                    if (e.key === 'Escape') handleCancelEdit()
                  }}
                />
                <button
                  onClick={handleSaveName}
                  disabled={isLoading || !newName.trim()}
                  className="p-1 text-green-400 hover:text-green-300 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="p-1 text-red-400 hover:text-red-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-1">
                <h3 className="text-lg font-semibold text-white">{area.name}</h3>
                <button
                  onClick={() => setIsEditingName(true)}
                  className="p-1 text-dark-400 hover:text-dark-200 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Actions Menu */}
          <div className="relative">
            {showDeleteConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-red-400">Delete?</span>
                <button
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="p-1 text-red-400 hover:text-red-300 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="p-1 text-dark-400 hover:text-dark-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 text-dark-400 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-lg font-bold text-white">{deviceStats.total}</div>
            <div className="text-xs text-dark-400">Devices</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-bold text-secondary-400">
              {deviceStats.lastUpdate 
                ? new Date(deviceStats.lastUpdate).toLocaleString() 
                : 'No data'
              }
            </div>
            <div className="text-xs text-dark-400">Last Update</div>
          </div>
        </div>

        {/* Toggle Devices Button */}
        {deviceStats.total > 0 && (
          <button
            onClick={() => setShowDevices(!showDevices)}
            className="w-full btn-secondary flex items-center justify-center gap-2 py-2 text-sm"
          >
            <span>Show Devices ({deviceStats.total})</span>
            {showDevices ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Devices Dropdown */}
      {showDevices && deviceStats.total > 0 && (
        <div className="border-t border-dark-700 p-4 bg-dark-800/30">
          <div className="space-y-3">
            {devices.map((device) => (
              <DeviceCard 
                key={device.id} 
                device={device}
                showArea={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* No Devices Message */}
      {showDevices && deviceStats.total === 0 && (
        <div className="border-t border-dark-700 p-4 bg-dark-800/30 text-center">
          <p className="text-dark-400 text-sm">No devices assigned to this area yet</p>
        </div>
      )}
    </div>
  )
} 