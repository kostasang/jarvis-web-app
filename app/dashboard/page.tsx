'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Home, Zap, AlertCircle } from 'lucide-react'
import { hubApi } from '@/lib/api'
import { HubData } from '@/types/hub'
import HubCard from '@/components/HubCard'
import ClaimHubModal from '@/components/ClaimHubModal'
import { navigateTo } from '@/utils/navigation'

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [hubs, setHubs] = useState<HubData[]>([])
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const fetchHubs = async () => {
    try {
      const hubData = await hubApi.getHubs()
      console.log('Hub data received:', hubData) // Debug log
      setHubs(hubData || [])
      setError('')
    } catch (err: any) {
      console.error('Failed to fetch hubs:', err)
      if (err.response?.status !== 401) {
        setError('Failed to load hubs. Please try refreshing the page.')
      }
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('jarvis_token')
    if (!token) {
      router.push(navigateTo('/login'))
      return
    }

    const loadDashboard = async () => {
      setIsLoading(true)
      await fetchHubs()
      setIsLoading(false)
    }

    loadDashboard()
  }, [router])



  const handleClaimSuccess = async () => {
    await fetchHubs()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-dark-400">Loading your smart home...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-dark-800/50 backdrop-blur-sm border-b border-dark-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 ml-16">
            <div className="flex items-center">
              <div className="mr-4 p-2">
                {/* Invisible spacer to match home button spacing on other pages */}
              </div>
              <div className="flex items-center">
                <Zap className="w-8 h-8 text-primary-500 mr-2" />
                <span className="text-xl font-bold text-white">Jarvis</span>
              </div>
              <div className="ml-6 hidden md:block">
                <span className="text-dark-400">Smart Home Control Center</span>
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

        {hubs.length === 0 ? (
          /* No Hubs - Show Welcome Screen */
          <div className="text-center max-w-2xl mx-auto">
            <div className="glass-card p-12">
              <div className="w-24 h-24 bg-primary-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Home className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-4">Welcome to Jarvis!</h1>
              <p className="text-dark-300 mb-8 text-lg">
                Get started by connecting your first smart home hub. Each hub manages the devices in one location.
              </p>
              <button
                onClick={() => setIsClaimModalOpen(true)}
                className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-3"
              >
                <Plus className="w-5 h-5" />
                Claim Your First Hub
              </button>
              
              <div className="mt-12 pt-8 border-t border-dark-700">
                <h3 className="text-lg font-semibold text-white mb-4">What you can do with Jarvis:</h3>
                <div className="grid md:grid-cols-3 gap-6 text-left">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-secondary-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Home className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-medium text-white mb-2">Multiple Locations</h4>
                    <p className="text-sm text-dark-400">Manage different homes or buildings with separate hubs</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-secondary-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-medium text-white mb-2">Smart Control</h4>
                    <p className="text-sm text-dark-400">Control lights, sensors, and devices remotely</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-secondary-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <AlertCircle className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-medium text-white mb-2">Real-time Data</h4>
                    <p className="text-sm text-dark-400">Monitor sensors and receive instant notifications</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Has Hubs - Show Hub Grid */
          <div>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Your Smart Homes</h1>
                <p className="text-dark-400">
                  {hubs.length} hub{hubs.length !== 1 ? 's' : ''} connected
                </p>
              </div>
              <button
                onClick={() => setIsClaimModalOpen(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Hub
              </button>
            </div>

                         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
               {hubs.map((hub, index) => (
                 <HubCard 
                   key={hub.id || `hub-${index}`} 
                   hub={hub} 
                   onHubUpdate={fetchHubs}
                 />
               ))}
             </div>
          </div>
        )}
      </main>

      {/* Claim Hub Modal */}
      <ClaimHubModal
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        onSuccess={handleClaimSuccess}
      />
    </div>
  )
} 