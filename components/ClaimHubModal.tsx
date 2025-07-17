'use client'

import { useState } from 'react'
import { X, Wifi, AlertCircle } from 'lucide-react'
import { hubApi } from '@/lib/api'

interface ClaimHubModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function ClaimHubModal({ isOpen, onClose, onSuccess }: ClaimHubModalProps) {
  const [hubId, setHubId] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      await hubApi.claimHub({
        hub_id: hubId.trim(),
        verification_code: verificationCode.trim(),
      })
      
      // Reset form
      setHubId('')
      setVerificationCode('')
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to claim hub. Please check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass-card max-w-md w-full p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-dark-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Wifi className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Claim New Hub</h2>
          <p className="text-dark-400">
            Connect your Raspberry Pi hub to your smart home system
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
            <label htmlFor="hubId" className="block text-sm font-medium text-dark-200 mb-2">
              Hub ID
            </label>
            <input
              id="hubId"
              type="text"
              required
              className="input-field"
              placeholder="Enter hub UUID"
              value={hubId}
              onChange={(e) => setHubId(e.target.value)}
            />
            <p className="text-xs text-dark-400 mt-1">
              Found on your Raspberry Pi configuration
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
              Security code displayed on your hub's screen
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !hubId.trim() || !verificationCode.trim()}
              className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Claiming...
                </div>
              ) : (
                'Claim Hub'
              )}
            </button>
          </div>
        </form>

        {/* Instructions */}
        <div className="mt-6 pt-4 border-t border-dark-700">
          <h4 className="text-sm font-medium text-dark-200 mb-2">How to find your credentials:</h4>
          <ul className="text-xs text-dark-400 space-y-1">
            <li>• Hub ID: Check your Raspberry Pi's configuration file</li>
            <li>• Verification Code: Displayed on connected screen or terminal</li>
            <li>• Make sure your hub is powered on and connected</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 