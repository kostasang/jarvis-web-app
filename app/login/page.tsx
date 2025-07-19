'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Zap, Shield, Home, Mail, UserPlus } from 'lucide-react'
import { authApi } from '@/lib/api'
import SignupModal from '@/components/SignupModal'
import ForgotPasswordModal from '@/components/ForgotPasswordModal'
import { navigateTo } from '@/utils/navigation'

export default function LoginPage() {
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const token = await authApi.login(credentials)
      localStorage.setItem('jarvis_token', token.access_token)
      router.push(navigateTo('/dashboard'))
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleContactClick = () => {
    router.push(navigateTo('/contact'))
  }

  const handleSignupSuccess = () => {
    // Clear any existing errors and optionally show a success message
    setError('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-primary-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-secondary-600/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to Jarvis</h1>
          <p className="text-dark-400">Your intelligent smart home companion</p>
        </div>

        {/* Login Form */}
        <div className="glass-card p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-dark-200 mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                required
                className="input-field"
                placeholder="Enter your username"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-dark-200 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="input-field pr-12"
                  placeholder="Enter your password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-dark-400 hover:text-dark-200 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>

            {/* Forgot Password Link */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsForgotPasswordModalOpen(true)}
                className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
              >
                Forgot your password?
              </button>
            </div>

            {/* Sign Up Button */}
            <button
              type="button"
              onClick={() => setIsSignupModalOpen(true)}
              className="w-full btn-secondary flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Create New Account
            </button>
          </form>

          {/* Features */}
          <div className="mt-8 pt-6 border-t border-dark-700">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center text-dark-300">
                <Shield className="w-4 h-4 text-primary-500 mr-2" />
                <span>Secure Access</span>
              </div>
              <div className="flex items-center text-dark-300">
                <Home className="w-4 h-4 text-secondary-500 mr-2" />
                <span>Smart Control</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-dark-400 text-sm space-y-3">
          <button
            onClick={handleContactClick}
            className="flex items-center justify-center gap-2 text-primary-400 hover:text-primary-300 transition-colors mx-auto"
          >
            <Mail className="w-4 h-4" />
            Need help? Contact Support
          </button>
          <p>© 2024 Jarvis Smart Home System</p>
        </div>
      </div>

      {/* Signup Modal */}
      <SignupModal
        isOpen={isSignupModalOpen}
        onClose={() => setIsSignupModalOpen(false)}
        onSuccess={handleSignupSuccess}
      />

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotPasswordModalOpen}
        onClose={() => setIsForgotPasswordModalOpen(false)}
      />
    </div>
  )
} 