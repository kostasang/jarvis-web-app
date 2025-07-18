'use client'

import { useState } from 'react'
import { X, Camera, AlertCircle } from 'lucide-react'
import { cameraApi } from '@/lib/api'

interface ClaimCameraModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function ClaimCameraModal({ isOpen, onClose, onSuccess }: ClaimCameraModalProps) {
  const [cameraId, setCameraId] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [nickname, setNickname] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      await cameraApi.claimCamera({
        camera_id: cameraId.trim(),
        verification_code: verificationCode.trim(),
        nickname: nickname.trim(),
      })
      
      // Reset form
      setCameraId('')
      setVerificationCode('')
      setNickname('')
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to claim camera. Please check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setCameraId('')
    setVerificationCode('')
    setNickname('')
    setError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass-card max-w-md w-full p-6 relative">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-dark-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Camera className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Claim New Camera</h2>
          <p className="text-dark-400">
            Connect your Jarvis camera to your security system
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div>
            <label htmlFor="cameraId" className="block text-sm font-medium text-dark-200 mb-2">
              Camera ID
            </label>
            <input
              id="cameraId"
              type="text"
              required
              className="input-field"
              placeholder="Enter camera UUID"
              value={cameraId}
              onChange={(e) => setCameraId(e.target.value)}
            />
            <p className="text-xs text-dark-400 mt-1">
              Printed on your camera's label
            </p>
          </div>

          <div>
            <label htmlFor="verificationCode" className="block text-sm font-medium text-dark-200 mb-2">
              Verification Code
            </label>
            <input
              id="verificationCode"
              type="password"
              required
              className="input-field"
              placeholder="Enter verification code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
            />
            <p className="text-xs text-dark-400 mt-1">
              Printed on your camera's label
            </p>
          </div>

          <div>
            <label htmlFor="nickname" className="block text-sm font-medium text-dark-200 mb-2">
              Camera Nickname
            </label>
            <input
              id="nickname"
              type="text"
              required
              className="input-field"
              placeholder="e.g., Front Door, Living Room, Garage"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={50}
            />
            <p className="text-xs text-dark-400 mt-1">
              Choose a descriptive name for this camera
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !cameraId.trim() || !verificationCode.trim() || !nickname.trim()}
              className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Claiming...
                </div>
              ) : (
                'Claim Camera'
              )}
            </button>
          </div>
        </form>

        {/* Instructions */}
        <div className="mt-6 pt-4 border-t border-dark-700">
          <h4 className="text-sm font-medium text-dark-200 mb-2">How to find your credentials:</h4>
          <ul className="text-xs text-dark-400 space-y-1">
            <li>• Camera ID: Printed on your camera's label</li>
            <li>• Verification Code: Printed on your camera's label</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 