'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  ArrowLeft, 
  Filter, 
  Search, 
  Home, 
  Zap, 
  AlertCircle,
  Wifi,
  WifiOff,
  BarChart3,
  X
} from 'lucide-react'
import { deviceApi, hubApi, areaApi } from '@/lib/api'
import { DeviceData, DeviceFilter } from '@/types/device'
import { HubData } from '@/types/hub'
import { AreaData } from '@/types/area'
import { getDevicesForHub, filterDevices, calculateDeviceStats } from '@/utils/deviceUtils'
import { DEVICE_CATEGORIES } from '@/config/deviceTypes'
import DeviceCard from '@/components/DeviceCard'
import DeviceModal from '@/components/DeviceModal'

export default function HubDevicesPage() {
  const router = useRouter()
  const params = useParams()
  const hubId = params.hubId as string

  const [hub, setHub] = useState<HubData | null>(null)
  const [areas, setAreas] = useState<AreaData[]>([])
  const [allDevices, setAllDevices] = useState<DeviceData[]>([])
  const [filteredDevices, setFilteredDevices] = useState<DeviceData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState<DeviceData | null>(null)
  const [selectedDeviceAreaName, setSelectedDeviceAreaName] = useState<string | undefined>(undefined)
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false)
  
  const [filter, setFilter] = useState<DeviceFilter>({
    category: undefined,
    areaId: undefined,
    searchTerm: '',
  })

  const fetchData = async () => {
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

      // Filter devices for this hub
      const hubDevices = getDevicesForHub(devicesData, hubId)

      setHub(currentHub)
      setAreas(areasData)
      setAllDevices(hubDevices)
      setFilteredDevices(hubDevices)
    } catch (err: any) {
      console.error('Failed to fetch hub and devices:', err)
      if (err.response?.status === 401) {
        router.push('/login')
      } else {
        setError('Failed to load devices. Please try refreshing the page.')
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
      await fetchData()
      setIsLoading(false)
    }

    loadData()
    
    // Set up periodic refresh every 5 seconds
    const interval = setInterval(async () => {
      await fetchData()
    }, 5000)
    
    // Cleanup interval on unmount
    return () => clearInterval(interval)
  }, [hubId, router])

  // Apply filters when filter state changes
  useEffect(() => {
    const filtered = filterDevices(allDevices, filter)
    setFilteredDevices(filtered)
  }, [allDevices, filter])

  const stats = calculateDeviceStats(filteredDevices)
  const totalStats = calculateDeviceStats(allDevices)

  const clearFilters = () => {
    setFilter({
      category: undefined,
      areaId: undefined,
      searchTerm: '',
    })
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

  const hasActiveFilters = filter.category || filter.areaId || filter.searchTerm

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-dark-400">Loading devices...</p>
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
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="mr-4 p-2 text-dark-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center">
                <Zap className="w-8 h-8 text-primary-500 mr-2" />
                <span className="text-xl font-bold text-white">Jarvis</span>
              </div>
              <div className="ml-6 hidden md:block">
                <span className="text-dark-400">
                  {hub.nickname || `Hub ${hub.id.slice(0, 8)}`} Devices
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-secondary flex items-center gap-2 ${showFilters ? 'bg-primary-600 text-white' : ''}`}
            >
              <Filter className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-dark-800/50 border-b border-dark-700 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto py-4">
            <div className="grid gap-4 md:grid-cols-3">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-400" />
                  <input
                    type="text"
                    placeholder="Device name..."
                    className="input-field pl-10"
                    value={filter.searchTerm}
                    onChange={(e) => setFilter({ ...filter, searchTerm: e.target.value })}
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">Category</label>
                <select
                  className="input-field"
                  value={filter.category || ''}
                  onChange={(e) => setFilter({ ...filter, category: e.target.value as any || undefined })}
                >
                  <option value="">All Categories</option>
                  {Object.entries(DEVICE_CATEGORIES).map(([key, category]) => (
                    <option key={key} value={key}>{category.name}</option>
                  ))}
                </select>
              </div>

              {/* Area Filter */}
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">Area</label>
                <select
                  className="input-field"
                  value={filter.areaId === null ? 'unassigned' : (filter.areaId || '')}
                  onChange={(e) => {
                    const value = e.target.value
                    setFilter({ 
                      ...filter, 
                      areaId: value === 'unassigned' ? null : (value || undefined)
                    })
                  }}
                >
                  <option value="">All Areas</option>
                  {areas.map((area) => (
                    <option key={area.id} value={area.id}>{area.name}</option>
                  ))}
                  <option value="unassigned">Unassigned</option>
                </select>
              </div>


            </div>

            {hasActiveFilters && (
              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={clearFilters}
                  className="btn-secondary text-sm flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Clear Filters
                </button>
                <span className="text-sm text-dark-400">
                  Showing {filteredDevices.length} of {allDevices.length} devices
                </span>
              </div>
            )}
          </div>
        </div>
      )}

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
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mr-4">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {hub.nickname || `Hub ${hub.id.slice(0, 8)}`} Devices
                </h1>
                <p className="text-dark-400">
                  {totalStats.total} total devices
                  {totalStats.lastUpdate && (
                    <span> • Last update: {new Date(totalStats.lastUpdate).toLocaleString()}</span>
                  )}
                </p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              hub.status === 'online' 
                ? 'bg-green-500/20 text-green-400' 
                : hub.status === 'offline'
                ? 'bg-red-500/20 text-red-400'
                : 'bg-yellow-500/20 text-yellow-400'
            }`}>
              {hub.status || 'unknown'}
            </div>
          </div>
        </div>

        {/* Collapsed Stats Cards */}
        <details className="glass-card mb-8">
          <summary className="p-4 cursor-pointer hover:bg-dark-700/30 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-white">Device Statistics</h3>
                <span className="text-sm text-dark-400">({stats.total} devices)</span>
              </div>
              <span className="text-dark-400">Click to expand</span>
            </div>
          </summary>
          <div className="p-4 pt-0 border-t border-dark-700">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{stats.total}</div>
                <div className="text-sm text-dark-400">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.byCategory.environmental}</div>
                <div className="text-sm text-dark-400">Environmental</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.byCategory.security}</div>
                <div className="text-sm text-dark-400">Security</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.byCategory.control}</div>
                <div className="text-sm text-dark-400">Control</div>
              </div>
            </div>
          </div>
        </details>

        {/* Devices Grid */}
        {filteredDevices.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredDevices.map((device) => {
              const areaName = areas.find(area => area.id === device.areaId)?.name
              return (
                <DeviceCard 
                  key={device.id} 
                  device={device}
                  showArea={true}
                  areaName={areaName}
                  onDeviceUpdate={fetchData}
                  onDeviceClick={handleDeviceClick}
                />
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="glass-card p-8 max-w-md mx-auto">
              <BarChart3 className="w-16 h-16 text-dark-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Devices Found</h3>
              <p className="text-dark-400">
                {hasActiveFilters 
                  ? 'No devices match your current filters. Try adjusting your search criteria.'
                  : 'This hub doesn\'t have any devices connected yet.'
                }
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="btn-primary mt-4"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Device Modal */}
      <DeviceModal
        device={selectedDevice}
        isOpen={isDeviceModalOpen}
        onClose={handleCloseDeviceModal}
        onDeviceUpdate={fetchData}
        areaName={selectedDeviceAreaName}
      />
    </div>
  )
} 