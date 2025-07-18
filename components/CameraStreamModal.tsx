'use client'

import { X, Camera, AlertCircle } from 'lucide-react'
import { CameraData } from '@/types/camera'
import { config } from '@/config/env'

interface CameraStreamModalProps {
  camera: CameraData | null
  isOpen: boolean
  onClose: () => void
}

export default function CameraStreamModal({ camera, isOpen, onClose }: CameraStreamModalProps) {
  if (!isOpen || !camera) return null

  // Get access token from localStorage
  const accessToken = localStorage.getItem('jarvis_token')
  
  if (!accessToken) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="glass-card max-w-md w-full p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Authentication Required</h3>
            <p className="text-dark-400 mb-4">
              Please log in again to view camera streams.
            </p>
            <button onClick={onClose} className="btn-primary">
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Construct the iframe source URL
  const streamUrl = `${config.mediaServerUrl}/${camera.id}/?token=${accessToken}`

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-dark-800 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {camera.nickname || `Camera ${camera.id.slice(0, 8)}`}
              </h2>
              <p className="text-sm text-dark-400">Live Stream</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-dark-400 hover:text-white transition-colors rounded-lg hover:bg-dark-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Stream Container */}
        <div className="p-6">
          <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
            <iframe
              src={streamUrl}
              sandbox="allow-scripts"
              className="w-full h-full border-0"
              title={`Live stream for ${camera.nickname || camera.id}`}
              allow="autoplay; fullscreen"
            />
          </div>
          
          {/* Stream Info */}
          <div className="mt-4 flex items-center justify-between text-sm text-dark-400">
            <div className="flex items-center gap-4">
              <span>🔴 Live</span>
              <span>Camera ID: {camera.id.slice(0, 8)}...</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Connected</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Close Stream
            </button>
            <button
              onClick={() => {
                // TODO: Implement fullscreen mode
                console.log('Fullscreen mode for camera:', camera.id)
              }}
              className="btn-primary px-6"
            >
              Fullscreen
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 