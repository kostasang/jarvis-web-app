'use client'

import { useState } from 'react'
import { X, MapPin, AlertCircle } from 'lucide-react'
import { areaApi } from '@/lib/api'

interface CreateAreaModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  hubId: string
  hubName: string
}

export default function CreateAreaModal({ isOpen, onClose, onSuccess, hubId, hubName }: CreateAreaModalProps) {
  const [areaName, setAreaName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!areaName.trim()) return

    setIsLoading(true)
    setError('')

    try {
      await areaApi.createArea({
        hub_id: hubId,
        area_name: areaName.trim(),
      })
      
      // Reset form
      setAreaName('')
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create area. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setAreaName('')
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
          <div className="w-16 h-16 bg-secondary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Create New Area</h2>
          <p className="text-dark-400">
            Add a new area to <span className="text-white font-medium">{hubName}</span>
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
            <label htmlFor="areaName" className="block text-sm font-medium text-dark-200 mb-2">
              Area Name
            </label>
            <input
              id="areaName"
              type="text"
              required
              className="input-field"
              placeholder="e.g., Kitchen, Living Room, Basement"
              value={areaName}
              onChange={(e) => setAreaName(e.target.value)}
              maxLength={50}
            />
            <p className="text-xs text-dark-400 mt-1">
              Choose a descriptive name for this area of your home
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
              disabled={isLoading || !areaName.trim()}
              className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating...
                </div>
              ) : (
                'Create Area'
              )}
            </button>
          </div>
        </form>

        {/* Examples */}
        <div className="mt-6 pt-4 border-t border-dark-700">
          <h4 className="text-sm font-medium text-dark-200 mb-2">Popular area names:</h4>
          <div className="flex flex-wrap gap-2">
            {['Kitchen', 'Living Room', 'Bedroom', 'Bathroom', 'Garage', 'Garden'].map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => setAreaName(example)}
                className="px-3 py-1 bg-dark-700 hover:bg-dark-600 text-dark-300 text-xs rounded-md transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 