'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Plus, Home, Zap, MapPin, AlertCircle, Package, ChevronDown } from 'lucide-react'
import { areaApi, hubApi } from '@/lib/api'
import { AreaData } from '@/types/area'
import { HubData } from '@/types/hub'
import { DeviceData } from '@/types/device'
import { useUnassignedDevices, useDevicesForHub, useDevices } from '@/lib/DevicesContext'
import { calculateDeviceStats } from '@/utils/deviceUtils'
import AreaCard from '@/components/AreaCard'
import CreateAreaModal from '@/components/CreateAreaModal'
import DeviceCard from '@/components/DeviceCard'
import DeviceModal from '@/components/DeviceModal'
import { navigateTo } from '@/utils/navigation'

export default function HubAreasPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const hubIdFromUrl = searchParams.get('hubId')

  const [hub, setHub] = useState<HubData | null>(null)
  const [allHubs, setAllHubs] = useState<HubData[]>([])
  const [selectedHubId, setSelectedHubId] = useState<string | null>(hubIdFromUrl || null)
  const [showHubSelector, setShowHubSelector] = useState(false)
  const [areas, setAreas] = useState<AreaData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [error, setError] = useState('')
  const [selectedDevice, setSelectedDevice] = useState<DeviceData | null>(null)
  const [selectedDeviceAreaName, setSelectedDeviceAreaName] = useState<string | undefined>(undefined)
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false)
  
  // Use centralized device data
  const { refreshDevices } = useDevices()
  const { devices: unassignedDevices } = useUnassignedDevices(selectedHubId)
  const { devices: allHubDevices } = useDevicesForHub(selectedHubId)
  const totalDeviceCount = allHubDevices.length

  const fetchHubAndAreas = async () => {
    if (!selectedHubId) return
    
    try {
      setError('')
      
      // Fetch hub details and areas (called once or when areas change)
      const [hubsData, areasData] = await Promise.all([
        hubApi.getHubs(),
        areaApi.getAreas(selectedHubId)
      ])

      // Find the specific hub
      const currentHub = hubsData.find(h => h.id === selectedHubId)
      if (!currentHub) {
        setSelectedHubId(null)
        return
      }

      setHub(currentHub)
      setAllHubs(hubsData)
      setAreas(areasData)
    } catch (err: any) {
      console.error('Failed to fetch hub and areas:', err)
      if (err.response?.status === 401) {
        router.push(navigateTo('/login'))
      } else {
        setError('Failed to load areas. Please try refreshing the page.')
      }
    }
  }



  useEffect(() => {
    const loadHubs = async () => {
      try {
        const hubsData = await hubApi.getHubs()
        setAllHubs(hubsData)
        
        // If no hub selected and hubs available, select first one
        if (!selectedHubId && hubsData.length > 0) {
          setSelectedHubId(hubsData[0].id)
        }
      } catch (err: any) {
        console.error('Failed to fetch hubs:', err)
        if (err.response?.status === 401) {
          router.push(navigateTo('/login'))
        }
      }
    }
    
    loadHubs()
  }, [router])

  useEffect(() => {
    if (!selectedHubId) {
      setIsLoading(false)
      return
    }

    const loadData = async () => {
      setIsLoading(true)
      // Load hub/areas data (device data is handled by DevicesProvider)
      await fetchHubAndAreas()
      setIsLoading(false)
    }

    loadData()
    
    // No need for periodic device refresh - handled by DevicesProvider
  }, [selectedHubId])

  const handleCreateSuccess = async () => {
    // When area is created, refresh areas list and device data
    await Promise.all([
      fetchHubAndAreas(),
      refreshDevices()
    ])
  }

  const handleAreaUpdate = async () => {
    // When area is updated/deleted, refresh areas list and device data
    await Promise.all([
      fetchHubAndAreas(),
      refreshDevices()
    ])
  }

  const handleDeviceClick = (device: DeviceData, areaName?: string) => {
    setSelectedDevice(device)
    setSelectedDeviceAreaName(areaName)
    setIsDeviceModalOpen(true)
  }

  const handleCloseDeviceModal = () => {
    setIsDeviceModalOpen(false)
    setSelectedDevice(null)
    setSelectedDeviceAreaName(undefined)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-dark-400">Loading areas...</p>
        </div>
      </div>
    )
  }

  if (!selectedHubId || allHubs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-400">No hubs available. Please go to dashboard to add a hub.</p>
          <button
            onClick={() => router.push(navigateTo('/dashboard'))}
            className="btn-primary mt-4"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-dark-800/50 backdrop-blur-sm border-b border-dark-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 ml-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push(navigateTo('/dashboard'))}
                className="mr-4 p-2 text-dark-400 hover:text-white transition-colors"
              >
                <Home className="w-5 h-5" />
              </button>
              <div className="flex items-center">
                <Zap className="w-8 h-8 text-primary-500 mr-2" />
                <span className="text-xl font-bold text-white">Jarvis</span>
              </div>
              <div className="ml-6 hidden md:block">
                <span className="text-dark-400">
                  {hub?.nickname || `Hub ${hub?.id.slice(0, 8)}`} Areas
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Click outside to close hub selector */}
      {showHubSelector && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setShowHubSelector(false)}
        />
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Hub Selector Card */}
        <div className="relative mb-8">
          <button
            onClick={() => setShowHubSelector(!showHubSelector)}
            className="glass-card p-6 w-full text-left hover:bg-dark-700/30 transition-all duration-200 hover:scale-[1.02] cursor-pointer border-2 border-transparent hover:border-primary-500/30"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mr-4">
                  <Home className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white mb-1">
                    {hub?.nickname || `Hub ${hub?.id.slice(0, 8)}`}
                  </h1>
                  <p className="text-dark-400">
                    {areas.length} area{areas.length !== 1 ? 's' : ''} • {totalDeviceCount} devices total
                  </p>
                  {allHubs.length > 1 && (
                    <p className="text-sm text-primary-400 mt-1 flex items-center gap-1">
                      <span className="hidden sm:inline">Tap to switch hub</span>
                      <span className="sm:hidden">Tap to switch</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${showHubSelector ? 'rotate-180' : ''}`} />
                    </p>
                  )}
                </div>
              </div>
              <div className="text-dark-400">
                <ChevronDown className={`w-6 h-6 transition-transform ${showHubSelector ? 'rotate-180' : ''}`} />
              </div>
            </div>
          </button>
          
          {/* Hub Selection Dropdown */}
          {showHubSelector && (
            <div className="absolute top-full left-0 right-0 mt-2 z-50">
              <div className="bg-dark-800/90 backdrop-blur-md border border-dark-600/50 rounded-lg p-4 shadow-xl">
                <div className="space-y-2">
                  {allHubs.length > 1 ? (
                    <>
                      <h3 className="text-sm font-medium text-white mb-3">Select Hub:</h3>
                      {allHubs.map((hubOption) => (
                        <button
                          key={hubOption.id}
                          onClick={() => {
                            setSelectedHubId(hubOption.id)
                            setShowHubSelector(false)
                          }}
                          className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                            hubOption.id === selectedHubId 
                              ? 'bg-primary-600/30 border border-primary-500/50 text-primary-400 scale-[1.02]' 
                              : 'text-white hover:bg-dark-700/50 hover:scale-[1.01]'
                          }`}
                        >
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center mr-3">
                              <Home className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <div className="font-medium">{hubOption.nickname || `Hub ${hubOption.id.slice(0, 8)}`}</div>
                              <div className="text-xs text-dark-400">{hubOption.id.slice(0, 16)}...</div>
                            </div>
                            {hubOption.id === selectedHubId && (
                              <div className="ml-auto">
                                <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </>
                  ) : (
                    <>
                      <h3 className="text-sm font-medium text-white mb-3">Current Hub:</h3>
                      <div className="p-3 rounded-lg bg-primary-600/30 border border-primary-500/50">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center mr-3">
                            <Home className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <div className="font-medium text-primary-400">{hub?.nickname || `Hub ${hub?.id.slice(0, 8)}`}</div>
                            <div className="text-xs text-dark-400">{hub?.id}</div>
                          </div>
                          <div className="ml-auto">
                            <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
                          </div>
                        </div>
                      </div>

                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {areas.length === 0 ? (
          /* No Areas - Show Welcome Screen */
          <div className="text-center max-w-2xl mx-auto">
            <div className="glass-card p-12">
              <div className="w-24 h-24 bg-secondary-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Create Your First Area</h2>
              <p className="text-dark-300 mb-8 text-lg">
                Organize your devices by creating areas like Kitchen, Living Room, or Bedroom. 
                This makes it easier to manage and control your smart home.
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-3"
              >
                <Plus className="w-5 h-5" />
                Create First Area
              </button>
              
              <div className="mt-12 pt-8 border-t border-dark-700">
                <h3 className="text-lg font-semibold text-white mb-4">Why use areas?</h3>
                <div className="grid md:grid-cols-3 gap-6 text-left">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-medium text-white mb-2">Organization</h4>
                    <p className="text-sm text-dark-400">Group devices by location for easy management</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-medium text-white mb-2">Control</h4>
                    <p className="text-sm text-dark-400">Control multiple devices in an area at once</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <AlertCircle className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-medium text-white mb-2">Monitoring</h4>
                    <p className="text-sm text-dark-400">Monitor sensors and activity by room</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Has Areas - Show Area Grid */
          <div>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Areas</h2>
                <p className="text-dark-400">
                  Manage your smart home by area
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Area
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {areas.map((area) => (
                                  <AreaCard 
                    key={area.id} 
                    area={area} 
                    hubId={selectedHubId!}
                    onAreaUpdate={handleAreaUpdate}
                    onDeviceClick={handleDeviceClick}
                  />
              ))}
            </div>

            {/* Unassigned Devices Section */}
            {unassignedDevices.length > 0 && (
              <div className="mt-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Unassigned Devices</h3>
                    <p className="text-dark-400">{unassignedDevices.length} device{unassignedDevices.length !== 1 ? 's' : ''} not assigned to any area</p>
                  </div>
                </div>
                
                <div className="glass-card p-6">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {unassignedDevices.map((device) => (
                      <DeviceCard 
                        key={device.id} 
                        device={device}
                        showArea={false}
                        onDeviceUpdate={refreshDevices}
                        onDeviceClick={handleDeviceClick}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Create Area Modal */}
      <CreateAreaModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
        hubId={selectedHubId!}
        hubName={hub?.nickname || `Hub ${hub?.id.slice(0, 8)}`}
      />

      {/* Device Modal */}
      <DeviceModal
        device={selectedDevice}
        isOpen={isDeviceModalOpen}
        onClose={handleCloseDeviceModal}
        onDeviceUpdate={refreshDevices}
        areaName={selectedDeviceAreaName}
        hubId={selectedHubId!}
      />
    </div>
  )
} 