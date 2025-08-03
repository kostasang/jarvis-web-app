'use client'

import { useState, useEffect } from 'react'
import { HubData, HubReadings } from '@/types/hub'
import { DeviceData } from '@/types/device'
import { AreaData } from '@/types/area'
import { hubApi, areaApi } from '@/lib/api'
import { useDevicesForHub, useDevices } from '@/lib/DevicesContext'
import { calculateDeviceStats } from '@/utils/deviceUtils'
import { formatTimestamp, formatTimestampSafe } from '@/utils/dateUtils'
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
  Power,
  Home,
  BarChart3,
  AlertCircle,
  Radio,
  CheckCircle
} from 'lucide-react'

interface HubModalProps {
  hub: HubData | null
  isOpen: boolean
  onClose: () => void
  onHubUpdate?: () => void
}

export default function HubModal({ hub, isOpen, onClose, onHubUpdate }: HubModalProps) {
  const [isEditingNickname, setIsEditingNickname] = useState(false)
  const [nickname, setNickname] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [areas, setAreas] = useState<AreaData[]>([])
  const [pairingLoading, setPairingLoading] = useState(false)
  const [pairingSuccess, setPairingSuccess] = useState(false)
  const [pairingError, setPairingError] = useState('')
  
  // Get devices for this hub
  const { devices: hubDevices } = useDevicesForHub(hub?.id || null)
  const deviceStats = calculateDeviceStats(hubDevices)
  
  // Get hub readings from context
  const { getHubReadings } = useDevices()
  const hubReadings = hub?.id ? getHubReadings(hub.id) : null

  useEffect(() => {
    if (hub) {
      setNickname(hub.nickname || '')
      setIsEditingNickname(false)
      // Reset pairing states when hub changes
      setPairingSuccess(false)
      setPairingError('')
    }
  }, [hub])

  useEffect(() => {
    const fetchAreas = async () => {
      if (isOpen && hub?.id) {
        try {
          const areasData = await areaApi.getAreas(hub.id)
          setAreas(areasData)
        } catch (error) {
          console.error('Failed to fetch areas:', error)
        }
      }
    }

    fetchAreas()
  }, [isOpen, hub?.id])

  if (!isOpen || !hub) return null

  const handleSaveNickname = async () => {
    if (!nickname.trim() || !hub.id) return

    setIsLoading(true)
    try {
      await hubApi.setHubNickname({
        hub_id: hub.id,
        hub_nickname: nickname.trim(),
      })
      setIsEditingNickname(false)
      onHubUpdate?.()
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

  const handlePairDevice = async () => {
    if (!hub?.id) return

    setPairingLoading(true)
    setPairingError('')
    setPairingSuccess(false)

    try {
      await hubApi.pairDevice(hub.id)
      setPairingSuccess(true)
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setPairingSuccess(false)
      }, 5000)
    } catch (error: any) {
      console.error('Failed to pair device:', error)
      setPairingError(error.response?.data?.detail || 'Failed to initiate device pairing. Please try again.')
    } finally {
      setPairingLoading(false)
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'online': return 'text-green-400'
      case 'offline': return 'text-red-400'
      default: return 'text-yellow-400'
    }
  }

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'online': return 'Online'
      case 'offline': return 'Offline'
      default: return 'Unknown'
    }
  }



  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${minutes}m`
    }
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-400'
      case 'unhealthy': return 'text-yellow-400'
      case 'critical': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getPowerStatusColor = (powerStatus: string) => {
    switch (powerStatus) {
      case 'main': return 'text-green-400'
      case 'battery': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  const isHubOffline = (lastSeen?: string) => {
    if (!lastSeen) return true
    const lastSeenTime = new Date(lastSeen).getTime()
    const currentTime = new Date().getTime()
    const diffMinutes = (currentTime - lastSeenTime) / (1000 * 60)
    return diffMinutes > 3
  }

  const getOfflineMessage = (lastSeen?: string) => {
    if (!lastSeen) return null
    const lastSeenTime = new Date(lastSeen).getTime()
    const currentTime = new Date().getTime()
    const diffMinutes = (currentTime - lastSeenTime) / (1000 * 60)
    
    if (diffMinutes >= 2 && diffMinutes <= 3) {
      return 'Hub hasn\'t been seen for a few minutes'
    }
    return null
  }

  // Determine if hub is offline and prepare display data
  const isOffline = isHubOffline(hubReadings?.last_seen)
  const offlineMessage = getOfflineMessage(hubReadings?.last_seen)
  const displayReadings = isOffline ? null : hubReadings

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={() => {
          // Reset pairing states when closing modal
          setPairingSuccess(false)
          setPairingError('')
          onClose()
        }}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-dark-600">
            <div className="flex items-center">
              <div className="w-16 h-16 rounded-xl flex items-center justify-center mr-4 bg-gradient-to-br from-primary-600 to-secondary-600">
                <Home className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                {isEditingNickname ? (
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      className="input-field text-xl font-bold"
                      placeholder="Hub nickname"
                      autoFocus
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
                    <h2 className="text-2xl font-bold text-white">
                      {hub.nickname || `Hub ${hub.id?.slice(0, 8)}`}
                    </h2>
                    <button
                      onClick={() => setIsEditingNickname(true)}
                      className="p-2 text-dark-400 hover:text-dark-200 transition-colors"
                    >
                      <Edit3 className="w-5 h-5" />
                    </button>
                  </div>
                )}
                <p className="text-dark-400 mt-1">Smart Home Hub</p>
              </div>
            </div>
            <button
              onClick={() => {
                // Reset pairing states when closing modal
                setPairingSuccess(false)
                setPairingError('')
                onClose()
              }}
              className="p-2 text-dark-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Offline Warning */}
            {offlineMessage && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 px-4 py-3 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {offlineMessage}
              </div>
            )}

            {isOffline && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Hub is offline - last seen {formatTimestampSafe(hubReadings?.last_seen, 'unknown time')}
              </div>
            )}





            {/* Hub Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-dark-600 pb-2">
                  Hub Information
                </h3>
                
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Hash className="w-5 h-5 text-dark-400" />
                      <div>
                        <div className="text-sm text-dark-400">Hub ID</div>
                        <div className="text-white font-mono">{hub.id}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Activity className={`w-5 h-5 ${displayReadings ? getHealthColor(displayReadings.health) : 'text-gray-400'}`} />
                      <div>
                        <div className="text-sm text-dark-400">Health Status</div>
                        <div className={`font-medium ${displayReadings ? getHealthColor(displayReadings.health) : 'text-gray-400'}`}>
                          {displayReadings ? displayReadings.health.charAt(0).toUpperCase() + displayReadings.health.slice(1) : '—'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Power className={`w-5 h-5 ${displayReadings ? getPowerStatusColor(displayReadings.power_status) : 'text-gray-400'}`} />
                      <div>
                        <div className="text-sm text-dark-400">Power Status</div>
                        <div className={`font-medium ${displayReadings ? getPowerStatusColor(displayReadings.power_status) : 'text-gray-400'}`}>
                          {displayReadings ? (displayReadings.power_status === 'main' ? 'Main Power' : 'Battery') : '—'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-dark-400" />
                      <div>
                        <div className="text-sm text-dark-400">Uptime</div>
                        <div className="text-white">
                          {displayReadings ? formatUptime(displayReadings.uptime) : '—'}
                        </div>
                      </div>
                    </div>

                    {displayReadings?.firmware_version && (
                      <div className="flex items-center gap-3">
                        <Hash className="w-5 h-5 text-dark-400" />
                        <div>
                          <div className="text-sm text-dark-400">Firmware</div>
                          <div className="text-white font-mono">{displayReadings.firmware_version}</div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-dark-400" />
                      <div>
                        <div className="text-sm text-dark-400">Last Seen</div>
                        <div className="text-white">{formatTimestampSafe(hubReadings?.last_seen || hub.last_seen, 'Never')}</div>
                      </div>
                    </div>
                  </div>
              </div>

              {/* Statistics */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-dark-600 pb-2">
                  Statistics
                </h3>
                
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="w-5 h-5 text-primary-500" />
                      <div>
                        <div className="text-sm text-dark-400">Total Devices</div>
                        <div className="text-2xl font-bold text-white">{deviceStats.total}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-secondary-500" />
                      <div>
                        <div className="text-sm text-dark-400">Areas</div>
                        <div className="text-2xl font-bold text-white">{areas.length}</div>
                      </div>
                    </div>

                    {deviceStats.lastUpdate && (
                      <div className="flex items-center gap-3">
                        <Activity className="w-5 h-5 text-dark-400" />
                        <div>
                          <div className="text-sm text-dark-400">Last Device Update</div>
                          <div className="text-white text-sm">
                            {formatTimestamp(deviceStats.lastUpdate)}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
              </div>
            </div>

            {/* Areas List */}
            {areas.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-dark-600 pb-2">
                  Areas ({areas.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {areas.map((area) => (
                    <div key={area.id} className="bg-dark-800/50 rounded-lg p-4 border border-dark-600">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-secondary-600/20 rounded-lg flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-secondary-500" />
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-medium">{area.name}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Areas Message */}
            {areas.length === 0 && (
              <div className="bg-dark-800/30 rounded-lg p-6 text-center">
                <AlertCircle className="w-12 h-12 text-dark-400 mx-auto mb-3" />
                <p className="text-dark-400">No areas configured for this hub yet</p>
              </div>
            )}

            {/* Hub Tools Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white border-b border-dark-600 pb-2">
                Hub Tools
              </h3>
              
              {/* Pairing Success Message */}
              {pairingSuccess && (
                <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-lg flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Pairing signal sent successfully! Devices in pairing mode should now connect.
                </div>
              )}

              {/* Pairing Error Message */}
              {pairingError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {pairingError}
                </div>
              )}

              {/* Device Pairing Tool */}
              <div className="bg-gradient-to-r from-primary-600/10 to-secondary-600/10 border border-primary-500/20 rounded-lg p-6">
                <div className="flex items-center gap-6">
                  <button
                    onClick={handlePairDevice}
                    disabled={pairingLoading || isOffline}
                    className="w-16 h-16 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-2xl flex items-center justify-center flex-shrink-0 hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed hover:from-primary-500 hover:to-secondary-500"
                    title={pairingLoading ? "Pairing in progress..." : "Click to pair new devices"}
                  >
                    {pairingLoading ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent"></div>
                    ) : (
                      <Radio className="w-8 h-8 text-white" />
                    )}
                  </button>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-white mb-2">Pair New Devices</h4>
                    <p className="text-dark-300 leading-relaxed">
                      {pairingLoading 
                        ? "Sending pairing signal to nearby devices..." 
                        : "Click the radio icon to send a pairing signal to devices in pairing mode nearby"
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}