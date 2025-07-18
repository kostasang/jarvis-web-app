'use client'

import { useState } from 'react'
import { 
  Camera, 
  Edit3,
  Check,
  X,
  Play,
  Trash2
} from 'lucide-react'
import { CameraData } from '@/types/camera'
import { cameraApi } from '@/lib/api'

interface CameraCardProps {
  camera: CameraData
  onCameraUpdate: () => void
  onViewStream?: (camera: CameraData) => void
}

export default function CameraCard({ camera, onCameraUpdate, onViewStream }: CameraCardProps) {
  const [isEditingNickname, setIsEditingNickname] = useState(false)
  const [nickname, setNickname] = useState(camera?.nickname || '')
  const [isLoading, setIsLoading] = useState(false)
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  // Guard clause for invalid camera data
  if (!camera || !camera.id) {
    return (
      <div className="glass-card p-6 border-red-500/20">
        <div className="text-center text-red-400">
          <p>Invalid camera data</p>
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
      setIsEditingNickname(false)
      onCameraUpdate()
    } catch (error) {
      console.error('Failed to update camera nickname:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setNickname(camera?.nickname || '')
    setIsEditingNickname(false)
  }

  const handleViewStream = () => {
    if (onViewStream) {
      onViewStream(camera)
    }
  }

  const handleRemoveCamera = async () => {
    if (!camera.id) return

    setIsRemoving(true)
    try {
      await cameraApi.unclaimCamera({
        camera_id: camera.id,
      })
      setShowRemoveConfirm(false)
      onCameraUpdate()
    } catch (error) {
      console.error('Failed to remove camera:', error)
      setShowRemoveConfirm(false)
    } finally {
      setIsRemoving(false)
    }
  }

  return (
    <div className="glass-card p-6 hover:bg-dark-700/30 transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center flex-1">
          <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mr-3">
            <Camera className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            {isEditingNickname ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="input-field !py-1 !px-2 text-sm w-32"
                  placeholder="Camera nickname"
                  autoFocus
                />
                <button
                  onClick={handleSaveNickname}
                  disabled={isLoading || !nickname.trim()}
                  className="p-1 text-green-400 hover:text-green-300 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="p-1 text-red-400 hover:text-red-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-white">
                  {camera.nickname || `Camera ${camera.id?.slice(0, 8) || 'Unknown'}`}
                </h3>
                <button
                  onClick={() => setIsEditingNickname(true)}
                  className="p-1 text-dark-400 hover:text-dark-200 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            )}
            <p className="text-sm text-dark-400">ID: {camera.id?.slice(0, 8) || 'N/A'}...</p>
          </div>
        </div>

        {/* Remove Button */}
        <div className="relative">
          {showRemoveConfirm ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-400">Remove?</span>
              <button
                onClick={handleRemoveCamera}
                disabled={isRemoving}
                className="p-1 text-red-400 hover:text-red-300 disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowRemoveConfirm(false)}
                className="p-1 text-dark-400 hover:text-dark-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowRemoveConfirm(true)}
              className="p-2 text-dark-400 hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>



      {/* Action Buttons */}
      <div className="space-y-2">
        <button 
          onClick={handleViewStream}
          className="btn-primary flex items-center justify-center gap-2 py-3 w-full"
        >
          <Play className="w-4 h-4" />
          <span>View Live Stream</span>
        </button>
      </div>
    </div>
  )
} 