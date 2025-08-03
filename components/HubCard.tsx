'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Home, 
  MapPin,
  Edit3,
  Check,
  X,
  BarChart3
} from 'lucide-react'
import { HubData } from '@/types/hub'
import { DeviceData } from '@/types/device'
import { hubApi } from '@/lib/api'
import { useDevicesForHub } from '@/lib/DevicesContext'
import { calculateDeviceStats } from '@/utils/deviceUtils'
import { formatTimestamp } from '@/utils/dateUtils'
import { navigateTo } from '@/utils/navigation'
import HubModal from './HubModal'

interface HubCardProps {
  hub: HubData
  onHubUpdate: () => void
}

export default function HubCard({ hub, onHubUpdate }: HubCardProps) {
  const router = useRouter()
  const [isEditingNickname, setIsEditingNickname] = useState(false)
  const [nickname, setNickname] = useState(hub?.nickname || '')
  const [isLoading, setIsLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

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

  // Use centralized device data
  const { devices: hubDevices } = useDevicesForHub(hub.id)
  const deviceStats = React.useMemo(() => calculateDeviceStats(hubDevices), [hubDevices])

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

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't open modal if clicking on buttons or input fields
    if (
      (e.target as HTMLElement).closest('button') ||
      (e.target as HTMLElement).closest('input') ||
      isEditingNickname
    ) {
      return
    }
    setIsModalOpen(true)
  }



  return (
    <>
    <div 
      className="glass-card p-6 hover:bg-dark-700/30 transition-all duration-200 relative cursor-pointer hover:scale-[1.02]"
      onClick={handleCardClick}
    >
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
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSaveNickname()
                  }}
                  disabled={isLoading || !nickname.trim()}
                  className="p-1 text-green-400 hover:text-green-300 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCancelEdit()
                  }}
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
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsEditingNickname(true)
                  }}
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
              ? formatTimestamp(deviceStats.lastUpdate) 
              : 'No data'
            }
          </div>
          <div className="text-xs text-dark-400">Last Update</div>
        </div>
      </div>



      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={(e) => {
            e.stopPropagation()
            router.push(navigateTo(`/areas?hubId=${hub.id}`))
          }}
          className="bg-secondary-600/20 border border-secondary-500/30 text-secondary-400 hover:bg-secondary-600/30 hover:text-secondary-300 rounded-lg flex items-center justify-center gap-2 py-4 px-3 relative w-full transition-all duration-200"
          title="Manage rooms and locations"
        >
          <MapPin className="w-5 h-5 text-secondary-500" />
          <span className="hidden sm:inline font-medium">Areas</span>
        </button>
        <button 
          onClick={(e) => {
            e.stopPropagation()
            router.push(navigateTo(`/devices?hubId=${hub.id}`))
          }}
          className="btn-primary flex items-center justify-center gap-2 py-4 px-3 relative w-full"
          title="View all devices with filtering"
        >
          <BarChart3 className="w-5 h-5 text-white" />
          <span className="hidden sm:inline font-medium">Devices</span>
        </button>
      </div>
    </div>

    {/* Hub Modal */}
    <HubModal
      hub={hub}
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      onHubUpdate={onHubUpdate}
    />
    </>
  )
} 