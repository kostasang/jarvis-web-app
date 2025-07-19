'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Plus, Home, Zap, MapPin, AlertCircle, Package } from 'lucide-react'
import { areaApi, hubApi, deviceApi } from '@/lib/api'
import { AreaData } from '@/types/area'
import { HubData } from '@/types/hub'
import { DeviceData } from '@/types/device'
import { getDevicesForHub } from '@/utils/deviceUtils'
import AreaCard from '@/components/AreaCard'
import CreateAreaModal from '@/components/CreateAreaModal'
import DeviceCard from '@/components/DeviceCard'
import DeviceModal from '@/components/DeviceModal'

export default function HubAreasPage() {
  const router = useRouter()
  const params = useParams()
  const hubId = params.hubId as string

  const [hub, setHub] = useState<HubData | null>(null)
  const [areas, setAreas] = useState<AreaData[]>([])
  const [unassignedDevices, setUnassignedDevices] = useState<DeviceData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [error, setError] = useState('')
  const [selectedDevice, setSelectedDevice] = useState<DeviceData | null>(null)
  const [selectedDeviceAreaName, setSelectedDeviceAreaName] = useState<string | undefined>(undefined)
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false)
  const [totalDeviceCount, setTotalDeviceCount] = useState(0)

  const fetchHubAndAreas = async () => {
    try {
      setError('')
      
      // Fetch hub details, areas, and devices in parallel
      const [hubsData, areasData, devicesData] = await Promise.all([
        hubApi.getHubs(),
        areaApi.getAreas(hubId),
        deviceApi.getDevicesLatestData()
      ])

      // Find the specific hub
      const currentHub = hubsData.find(h => h.id === hubId)
      if (!currentHub) {
        router.push('/dashboard')
        return
      }

      // Get devices for this hub and filter unassigned ones
      const hubDevices = getDevicesForHub(devicesData, hubId)
      const unassigned = hubDevices.filter(device => !device.areaId)

      setHub(currentHub)
      setAreas(areasData)
      setUnassignedDevices(unassigned)
      setTotalDeviceCount(hubDevices.length)
    } catch (err: any) {
      console.error('Failed to fetch hub and areas:', err)
      if (err.response?.status === 401) {
        router.push('/login')
      } else {
        setError('Failed to load areas. Please try refreshing the page.')
      }
    }
  }

  useEffect(() => {
    if (!hubId) {
      router.push('/dashboard')
      return
    }

    const loadData = async () => {
      setIsLoading(true)
      await fetchHubAndAreas()
      setIsLoading(false)
    }

    loadData()
    
    // Set up periodic refresh every 5 seconds
    const interval = setInterval(async () => {
      await fetchHubAndAreas()
    }, 5000)
    
    // Cleanup interval on unmount
    return () => clearInterval(interval)
  }, [hubId, router])

  const handleCreateSuccess = async () => {
    await fetchHubAndAreas()
  }

  const handleAreaUpdate = async () => {
    await fetchHubAndAreas()
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

  if (!hub) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-400">Hub not found</p>
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
                onClick={() => router.push('/dashboard')}
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
                  {hub.nickname || `Hub ${hub.id.slice(0, 8)}`} Areas
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Hub Info */}
        <div className="glass-card p-6 mb-8">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mr-4">
              <Home className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {hub.nickname || `Hub ${hub.id.slice(0, 8)}`}
              </h1>
              <p className="text-dark-400">
                {areas.length} area{areas.length !== 1 ? 's' : ''} • {totalDeviceCount} devices total
              </p>
            </div>
          </div>
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
                    hubId={hubId}
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
                        onDeviceUpdate={fetchHubAndAreas}
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
        hubId={hubId}
        hubName={hub.nickname || `Hub ${hub.id.slice(0, 8)}`}
      />

      {/* Device Modal */}
      <DeviceModal
        device={selectedDevice}
        isOpen={isDeviceModalOpen}
        onClose={handleCloseDeviceModal}
        onDeviceUpdate={fetchHubAndAreas}
        areaName={selectedDeviceAreaName}
        hubId={hubId}
      />
    </div>
  )
} 