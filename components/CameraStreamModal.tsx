'use client'

import { useState, useEffect } from 'react'
import { X, Camera, AlertCircle, Edit3, Check } from 'lucide-react'
import { CameraData } from '@/types/camera'
import { cameraApi } from '@/lib/api'
import { config } from '@/config/env'

interface CameraStreamModalProps {
  camera: CameraData | null
  isOpen: boolean
  onClose: () => void
  onCameraUpdate?: () => void
}

export default function CameraStreamModal({ camera, isOpen, onClose, onCameraUpdate }: CameraStreamModalProps) {
  const [isEditingNickname, setIsEditingNickname] = useState(false)
  const [nickname, setNickname] = useState(camera?.nickname || '')
  const [isLoading, setIsLoading] = useState(false)
  const [currentNickname, setCurrentNickname] = useState(camera?.nickname || '')

  // Update local state when camera prop changes
  useEffect(() => {
    if (camera) {
      setNickname(camera.nickname || '')
      setCurrentNickname(camera.nickname || '')
    }
  }, [camera])

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

  const handleSaveNickname = async () => {
    if (!nickname.trim() || !camera.id) return

    setIsLoading(true)
    try {
      await cameraApi.setCameraNickname({
        camera_id: camera.id,
        nickname: nickname.trim(),
      })
      // Update local state immediately to show the new name
      setCurrentNickname(nickname.trim())
      setIsEditingNickname(false)
      if (onCameraUpdate) {
        onCameraUpdate()
      }
    } catch (error) {
      console.error('Failed to update camera nickname:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setNickname(currentNickname)
    setIsEditingNickname(false)
  }

  // Construct the iframe source URL
  const streamUrl = `${config.mediaServerUrl}/${camera.id}/?token=${accessToken}`

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 z-50">
      <div className="bg-dark-800 rounded-2xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-dark-700">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              {isEditingNickname ? (
                <div className="flex items-center gap-2 mb-1">
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="input-field !py-1 !px-2 text-lg font-bold bg-dark-700 border-dark-600"
                    placeholder="Camera nickname"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveNickname()
                      if (e.key === 'Escape') handleCancelEdit()
                    }}
                  />
                  <button
                    onClick={handleSaveNickname}
                    disabled={isLoading || !nickname.trim()}
                    className="p-1 text-green-400 hover:text-green-300 disabled:opacity-50"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="p-1 text-red-400 hover:text-red-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold text-white">
                    {currentNickname || `Camera ${camera.id}`}
                  </h2>
                  <button
                    onClick={() => setIsEditingNickname(true)}
                    className="p-1 text-dark-400 hover:text-dark-200 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              )}
              <p className="text-sm text-dark-400 font-mono">{camera.id}</p>
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
        <div className="p-3">
          <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
            <iframe
              src={streamUrl}
              sandbox="allow-scripts"
              className="w-full h-full border-0"
              title={`Live stream for ${currentNickname || camera.id}`}
              allow="autoplay; fullscreen"
            />
          </div>
        </div>

        {/* Camera Info */}
        <div className="px-3 pb-4">
          <div className="glass-card p-4">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Camera Info
            </h3>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-dark-400 mb-1">Camera ID</div>
                <div className="text-sm text-white font-mono break-all">{camera.id}</div>
              </div>
              <div>
                <div className="text-xs text-dark-400 mb-1">Nickname</div>
                <div className="text-sm text-white">{currentNickname || 'Not set'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 