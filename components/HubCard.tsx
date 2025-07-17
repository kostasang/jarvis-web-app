'use client'

import { useState, useEffect } from 'react'
import { 
  Home, 
  MapPin,
  Edit3,
  Check,
  X,
  ChevronDown,
  BarChart3
} from 'lucide-react'
import { HubData } from '@/types/hub'
import { DeviceData } from '@/types/device'
import { hubApi, deviceApi } from '@/lib/api'
import { getDevicesForHub, calculateDeviceStats } from '@/utils/deviceUtils'

interface HubCardProps {
  hub: HubData
  onHubUpdate: () => void
}

export default function HubCard({ hub, onHubUpdate }: HubCardProps) {
  const [isEditingNickname, setIsEditingNickname] = useState(false)
  const [nickname, setNickname] = useState(hub?.nickname || '')
  const [isLoading, setIsLoading] = useState(false)
  const [showNavOptions, setShowNavOptions] = useState(false)
  const [deviceStats, setDeviceStats] = useState({ total: 0, lastUpdate: undefined as string | undefined })

  // Guard clause for invalid hub data
  if (!hub || !hub.id) {
    return (
      <div className="glass-card p-6 border-red-500/20">
        <div className="text-center text-red-400">
          <p>Invalid hub data</p>
        </div>
      </div>
    )
  }

  // Fetch device statistics for this hub
  useEffect(() => {
    const fetchDeviceStats = async () => {
      try {
        const devices = await deviceApi.getDevicesLatestData()
        const hubDevices = getDevicesForHub(devices, hub.id)
        const stats = calculateDeviceStats(hubDevices)
        setDeviceStats({
          total: stats.total,
          lastUpdate: stats.lastUpdate
        })
      } catch (error) {
        console.error('Failed to fetch device stats:', error)
      }
    }

    fetchDeviceStats()
    
    // Set up periodic refresh every 5 seconds
    const interval = setInterval(fetchDeviceStats, 5000)
    
    // Cleanup interval on unmount
    return () => clearInterval(interval)
  }, [hub.id])

  const handleSaveNickname = async () => {
    if (!nickname.trim() || !hub.id) return

    setIsLoading(true)
    try {
      await hubApi.setHubNickname({
        hub_id: hub.id,
        hub_nickname: nickname.trim(),
      })
      setIsEditingNickname(false)
      onHubUpdate()
    } catch (error) {
      console.error('Failed to update nickname:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setNickname(hub?.nickname || '')
    setIsEditingNickname(false)
  }



  return (
    <div className="glass-card p-6 hover:bg-dark-700/30 transition-all duration-200 relative">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mr-3">
            <Home className="w-6 h-6 text-white" />
          </div>
          <div>
            {isEditingNickname ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="input-field !py-1 !px-2 text-sm w-32"
                  placeholder="Hub nickname"
                  autoFocus
                />
                <button
                  onClick={handleSaveNickname}
                  disabled={isLoading || !nickname.trim()}
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
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-white">
                  {hub.nickname || `Hub ${hub.id?.slice(0, 8) || 'Unknown'}`}
                </h3>
                <button
                  onClick={() => setIsEditingNickname(true)}
                  className="p-1 text-dark-400 hover:text-dark-200 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            )}
            <p className="text-sm text-dark-400">ID: {hub.id?.slice(0, 8) || 'N/A'}...</p>
          </div>
        </div>
        

      </div>

      {/* Enhanced Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center">
          <div className="text-xl font-bold text-white">{deviceStats.total}</div>
          <div className="text-xs text-dark-400">Total Devices</div>
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

      {/* Navigation Options */}
      {showNavOptions && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50">
          <div className="glass-card p-4 border border-dark-600">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-white mb-3">Navigate to:</h4>
              <a 
                href={`/hub/${hub.id}/areas`}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-dark-700/50 transition-colors text-white no-underline"
              >
                <MapPin className="w-5 h-5 text-secondary-500" />
                <div>
                  <div className="font-medium">Areas</div>
                  <div className="text-xs text-dark-400">Manage rooms and locations</div>
                </div>
              </a>
              <a 
                href={`/hub/${hub.id}/devices`}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-dark-700/50 transition-colors text-white no-underline"
              >
                <BarChart3 className="w-5 h-5 text-primary-500" />
                <div>
                  <div className="font-medium">Devices & Sensors</div>
                  <div className="text-xs text-dark-400">View all devices with filtering</div>
                </div>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="w-full">
        <button 
          onClick={() => setShowNavOptions(!showNavOptions)}
          className="btn-primary flex items-center justify-center gap-2 py-3 relative w-full"
        >
          <Home className="w-4 h-4" />
          <span>Manage Hub</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${showNavOptions ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Click outside to close */}
      {showNavOptions && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setShowNavOptions(false)}
        />
      )}
    </div>
  )
} 