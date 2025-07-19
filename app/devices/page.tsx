'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
  X,
  Clock,
  ChevronDown,
  Check
} from 'lucide-react'
import { hubApi, areaApi } from '@/lib/api'
import { DeviceData, DeviceFilter } from '@/types/device'
import { HubData } from '@/types/hub'
import { AreaData } from '@/types/area'
import { useDevicesForHub, useDevices } from '@/lib/DevicesContext'
import { filterDevices, calculateDeviceStats } from '@/utils/deviceUtils'
import { DEVICE_CATEGORIES } from '@/config/deviceTypes'
import DeviceCard from '@/components/DeviceCard'
import DeviceModal from '@/components/DeviceModal'
import { navigateTo } from '@/utils/navigation'

export default function HubDevicesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const hubIdFromUrl = searchParams.get('hubId')

  const [hub, setHub] = useState<HubData | null>(null)
  const [allHubs, setAllHubs] = useState<HubData[]>([])
  const [selectedHubId, setSelectedHubId] = useState<string | null>(hubIdFromUrl || null)
  const [showHubSelector, setShowHubSelector] = useState(false)
  const [areas, setAreas] = useState<AreaData[]>([])
  const [filteredDevices, setFilteredDevices] = useState<DeviceData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState<DeviceData | null>(null)
  const [selectedDeviceAreaName, setSelectedDeviceAreaName] = useState<string | undefined>(undefined)
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false)
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [showAreaDropdown, setShowAreaDropdown] = useState(false)
  
  // Use centralized device data
  const { refreshDevices } = useDevices()
  const { devices: allDevices } = useDevicesForHub(selectedHubId)
  
  const [filter, setFilter] = useState<DeviceFilter>({
    category: undefined,
    areaId: undefined,
    searchTerm: '',
  })

  const fetchHubAndAreas = async () => {
    if (!selectedHubId) return
    
    try {
      setError('')
      
      // Fetch hub details and areas (devices handled by DevicesProvider)
      const [hubsData, areasData] = await Promise.all([
        hubApi.getHubs(),
        areaApi.getAreas(selectedHubId)
      ])

      // Find the specific hub
      const currentHub = hubsData.find((h: any) => h.id === selectedHubId)
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
      await fetchHubAndAreas()
      setIsLoading(false)
    }

    loadData()
    
    // No periodic refresh needed - DevicesProvider handles device updates
  }, [selectedHubId])

  // Apply filters when filter state or devices change
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
                  {hub?.nickname || `Hub ${hub?.id.slice(0, 8)}`} Devices
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
      
      {/* Click outside to close dropdowns */}
      {(showHubSelector || showCategoryDropdown || showAreaDropdown) && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowHubSelector(false)
            setShowCategoryDropdown(false)
            setShowAreaDropdown(false)
          }}
        />
      )}

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-dark-800/50 border-b border-dark-700 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto py-6">
            <div className="grid gap-6 md:grid-cols-3">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-400" />
                  <input
                    type="text"
                    placeholder="Device name..."
                    className="input-field pl-10 hover:bg-dark-700/50 transition-colors"
                    value={filter.searchTerm}
                    onChange={(e) => setFilter({ ...filter, searchTerm: e.target.value })}
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="relative">
                <label className="block text-sm font-medium text-dark-200 mb-2">Category</label>
                <button
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  className="input-field flex items-center justify-between w-full hover:bg-dark-700/50 transition-colors"
                >
                  <span className={filter.category ? 'text-white' : 'text-dark-400'}>
                    {filter.category ? DEVICE_CATEGORIES[filter.category]?.name : 'All Categories'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-dark-400 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showCategoryDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 z-50">
                    <div className="bg-dark-800/95 backdrop-blur-md border border-dark-600/50 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                      <div className="p-2">
                        <button
                          onClick={() => {
                            setFilter({ ...filter, category: undefined })
                            setShowCategoryDropdown(false)
                          }}
                          className={`w-full text-left p-3 rounded-lg transition-all duration-200 hover:bg-dark-700/50 flex items-center justify-between ${
                            !filter.category ? 'bg-primary-600/20 text-primary-400' : 'text-white'
                          }`}
                        >
                          <span>All Categories</span>
                          {!filter.category && <Check className="w-4 h-4" />}
                        </button>
                        {Object.entries(DEVICE_CATEGORIES).map(([key, category]) => (
                          <button
                            key={key}
                            onClick={() => {
                              setFilter({ ...filter, category: key as any })
                              setShowCategoryDropdown(false)
                            }}
                            className={`w-full text-left p-3 rounded-lg transition-all duration-200 hover:bg-dark-700/50 flex items-center justify-between ${
                              filter.category === key ? 'bg-primary-600/20 text-primary-400' : 'text-white'
                            }`}
                          >
                            <span>{category.name}</span>
                            {filter.category === key && <Check className="w-4 h-4" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Area Filter */}
              <div className="relative">
                <label className="block text-sm font-medium text-dark-200 mb-2">Area</label>
                <button
                  onClick={() => setShowAreaDropdown(!showAreaDropdown)}
                  className="input-field flex items-center justify-between w-full hover:bg-dark-700/50 transition-colors"
                >
                  <span className={filter.areaId !== undefined ? 'text-white' : 'text-dark-400'}>
                    {filter.areaId === null ? 'Unassigned' : 
                     filter.areaId ? areas.find(area => area.id === filter.areaId)?.name : 'All Areas'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-dark-400 transition-transform ${showAreaDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showAreaDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 z-50">
                    <div className="bg-dark-800/95 backdrop-blur-md border border-dark-600/50 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                      <div className="p-2">
                        <button
                          onClick={() => {
                            setFilter({ ...filter, areaId: undefined })
                            setShowAreaDropdown(false)
                          }}
                          className={`w-full text-left p-3 rounded-lg transition-all duration-200 hover:bg-dark-700/50 flex items-center justify-between ${
                            filter.areaId === undefined ? 'bg-primary-600/20 text-primary-400' : 'text-white'
                          }`}
                        >
                          <span>All Areas</span>
                          {filter.areaId === undefined && <Check className="w-4 h-4" />}
                        </button>
                        {areas.map((area) => (
                          <button
                            key={area.id}
                            onClick={() => {
                              setFilter({ ...filter, areaId: area.id })
                              setShowAreaDropdown(false)
                            }}
                            className={`w-full text-left p-3 rounded-lg transition-all duration-200 hover:bg-dark-700/50 flex items-center justify-between ${
                              filter.areaId === area.id ? 'bg-primary-600/20 text-primary-400' : 'text-white'
                            }`}
                          >
                            <span>{area.name}</span>
                            {filter.areaId === area.id && <Check className="w-4 h-4" />}
                          </button>
                        ))}
                        <button
                          onClick={() => {
                            setFilter({ ...filter, areaId: null })
                            setShowAreaDropdown(false)
                          }}
                          className={`w-full text-left p-3 rounded-lg transition-all duration-200 hover:bg-dark-700/50 flex items-center justify-between ${
                            filter.areaId === null ? 'bg-primary-600/20 text-primary-400' : 'text-white'
                          }`}
                        >
                          <span>Unassigned</span>
                          {filter.areaId === null && <Check className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>


            </div>

            {hasActiveFilters && (
              <div className="mt-6 pt-4 border-t border-dark-600/50 flex items-center gap-3">
                <button
                  onClick={clearFilters}
                  className="btn-secondary text-sm flex items-center gap-2 hover:scale-105 transition-transform"
                >
                  <X className="w-4 h-4" />
                  Clear Filters
                </button>
                <span className="text-sm text-dark-400">
                  Showing <span className="text-primary-400 font-medium">{filteredDevices.length}</span> of <span className="text-white">{allDevices.length}</span> devices
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

        {/* Hub Selector Card */}
        <div className="relative mb-8">
          <button
            onClick={() => setShowHubSelector(!showHubSelector)}
            className="glass-card p-6 w-full text-left hover:bg-dark-700/30 transition-all duration-200 hover:scale-[1.02] cursor-pointer border-2 border-transparent hover:border-primary-500/30"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mr-4">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white mb-1">
                    {hub?.nickname || `Hub ${hub?.id.slice(0, 8)}`} Devices
                  </h1>
                  <p className="text-dark-400">
                    {totalStats.total} total devices
                    {totalStats.lastUpdate && (
                      <span> • Last update: {new Date(totalStats.lastUpdate).toLocaleString()}</span>
                    )}
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
                              <BarChart3 className="w-4 h-4 text-white" />
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
                            <BarChart3 className="w-4 h-4 text-white" />
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
                  onDeviceUpdate={refreshDevices}
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
        onDeviceUpdate={refreshDevices}
        areaName={selectedDeviceAreaName}
        hubId={selectedHubId!}
      />
    </div>
  )
} 