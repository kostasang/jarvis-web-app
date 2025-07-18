'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Camera, Video, AlertCircle, Home, Zap } from 'lucide-react'
import { cameraApi } from '@/lib/api'
import { CameraData } from '@/types/camera'
import CameraCard from '@/components/CameraCard'
import ClaimCameraModal from '@/components/ClaimCameraModal'
import CameraStreamModal from '@/components/CameraStreamModal'

export default function CamerasPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [cameras, setCameras] = useState<CameraData[]>([])
  const [error, setError] = useState('')
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false)
  const [selectedCamera, setSelectedCamera] = useState<CameraData | null>(null)
  const [isStreamModalOpen, setIsStreamModalOpen] = useState(false)
  const router = useRouter()

  const fetchCameras = async () => {
    try {
      const cameraData = await cameraApi.getCameras()
      console.log('Camera data received:', cameraData) // Debug log
      setCameras(cameraData || [])
      setError('')
    } catch (err: any) {
      console.error('Failed to fetch cameras:', err)
      if (err.response?.status !== 401) {
        setError('Failed to load cameras. Please try refreshing the page.')
      }
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('jarvis_token')
    if (!token) {
      router.push('/login')
      return
    }

    const loadCameras = async () => {
      setIsLoading(true)
      await fetchCameras()
      setIsLoading(false)
    }

    loadCameras()
  }, [router])

  const handleClaimSuccess = async () => {
    await fetchCameras()
  }

  const handleViewStream = (camera: CameraData) => {
    setSelectedCamera(camera)
    setIsStreamModalOpen(true)
  }

  const handleCloseStream = () => {
    setSelectedCamera(null)
    setIsStreamModalOpen(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-dark-400">Loading your cameras...</p>
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
                <span className="text-dark-400">Camera Dashboard</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {cameras.length === 0 ? (
          /* No Cameras - Show Welcome Screen */
          <div className="text-center max-w-2xl mx-auto">
            <div className="glass-card p-12">
              <div className="w-24 h-24 bg-primary-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Video className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-4">Welcome to Camera Management!</h1>
              <p className="text-dark-300 mb-8 text-lg">
                Get started by connecting your first security camera. Monitor your property with live video feeds and recordings.
              </p>
              <button
                className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-3"
                onClick={() => setIsClaimModalOpen(true)}
              >
                <Plus className="w-5 h-5" />
                Claim Your First Camera
              </button>
            </div>
          </div>
        ) : (
          /* Has Cameras - Show Camera Grid */
          <div>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Your Security Cameras</h1>
                <p className="text-dark-400">
                  {cameras.length} camera{cameras.length !== 1 ? 's' : ''} connected
                </p>
              </div>
              <button
                className="btn-primary flex items-center gap-2"
                onClick={() => setIsClaimModalOpen(true)}
              >
                <Plus className="w-4 h-4" />
                Add Camera
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {cameras.map((camera) => (
                <CameraCard 
                  key={camera.id} 
                  camera={camera} 
                  onCameraUpdate={fetchCameras}
                  onViewStream={handleViewStream}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Claim Camera Modal */}
      <ClaimCameraModal
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        onSuccess={handleClaimSuccess}
      />

      {/* Camera Stream Modal */}
      <CameraStreamModal
        camera={selectedCamera}
        isOpen={isStreamModalOpen}
        onClose={handleCloseStream}
        onCameraUpdate={fetchCameras}
      />
    </div>
  )
} 