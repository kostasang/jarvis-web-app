'use client'

import { useState } from 'react'
import { X, Eye, EyeOff, User, Mail, Lock, CheckCircle, AlertCircle } from 'lucide-react'
import { authApi } from '@/lib/api'
import { SignupCredentials } from '@/types/auth'
import ReCaptcha from './ReCaptcha'

interface SignupModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function SignupModal({ isOpen, onClose, onSuccess }: SignupModalProps) {
  const [credentials, setCredentials] = useState<SignupCredentials>({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [recaptchaToken, setRecaptchaToken] = useState('')

  const validateForm = () => {
    if (!credentials.username.trim()) {
      setError('Username is required')
      return false
    }
    if (credentials.username.length < 3) {
      setError('Username must be at least 3 characters long')
      return false
    }
    if (!credentials.email.trim()) {
      setError('Email is required')
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email)) {
      setError('Please enter a valid email address')
      return false
    }
    if (!credentials.password) {
      setError('Password is required')
      return false
    }
    if (credentials.password.length < 8) {
      setError('Password must be at least 8 characters long')
      return false
    }
    if (credentials.password !== credentials.confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    if (!recaptchaToken) {
      setError('Please complete the reCAPTCHA verification')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!validateForm()) return

    setIsLoading(true)
    try {
      const response = await authApi.signup(credentials, recaptchaToken)
      setSuccess('Account created successfully! You can now sign in.')
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 2000)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Signup failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token || '')
    if (error && token) {
      setError('')
    }
  }

  const handleClose = () => {
    setCredentials({
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    })
    setError('')
    setSuccess('')
    setRecaptchaToken('')
    setShowPassword(false)
    setShowConfirmPassword(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onClick={(e) => {
        // Only close if clicking the backdrop, not the modal content
        if (e.target === e.currentTarget) {
          handleClose()
        }
      }}
    >
      <div 
        className="bg-dark-800 rounded-xl border border-dark-700 w-full max-w-md max-h-[90vh] relative z-[101]"
        onClick={(e) => e.stopPropagation()}
        style={{ overflow: 'visible' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-700">
          <h2 className="text-xl font-bold text-white">Create Account</h2>
          <button
            onClick={handleClose}
            className="p-2 text-dark-400 hover:text-white transition-colors rounded-lg hover:bg-dark-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="max-h-[70vh] overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input
                  type="text"
                  value={credentials.username}
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                  className="input-field pl-10"
                  placeholder="Enter username"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input
                  type="email"
                  value={credentials.email}
                  onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                  className="input-field pl-10"
                  placeholder="Enter email address"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  className="input-field pl-10 pr-10"
                  placeholder="Enter password"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-dark-400 hover:text-dark-200"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={credentials.confirmPassword}
                  onChange={(e) => setCredentials({ ...credentials, confirmPassword: e.target.value })}
                  className="input-field pl-10 pr-10"
                  placeholder="Confirm password"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-dark-400 hover:text-dark-200"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* reCAPTCHA */}
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">
                Security Verification
              </label>
              <div className="relative" style={{ overflow: 'visible' }}>
                <ReCaptcha
                  onVerify={handleRecaptchaChange}
                  onExpired={() => {
                    setRecaptchaToken('')
                    if (error) setError('')
                  }}
                  onError={() => {
                    setRecaptchaToken('')
                    setError('reCAPTCHA verification failed. Please try again.')
                  }}
                  disabled={isLoading || !!success}
                />
              </div>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{success}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 text-center text-sm text-dark-400 border-t border-dark-700">
          Already have an account?{' '}
          <button
            onClick={handleClose}
            className="text-primary-400 hover:text-primary-300 transition-colors"
          >
            Sign in instead
          </button>
        </div>
      </div>
    </div>
  )
} 