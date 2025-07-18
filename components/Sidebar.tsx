'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  X, 
  LogOut, 
  Home, 
  Settings, 
  Zap, 
  User,
  Mail,
  Shield,
  Wrench,
  Camera
} from 'lucide-react'
import { authApi } from '@/lib/api'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  // Handle animation state
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true)
      // Delay the visibility to trigger opening animation
      const timer = setTimeout(() => setIsVisible(true), 10)
      return () => clearTimeout(timer)
    } else {
      setIsVisible(false)
      // Delay hiding to allow close animation
      const timer = setTimeout(() => setIsAnimating(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent background scrolling when sidebar is open
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await authApi.logout()
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      localStorage.removeItem('jarvis_token')
      router.push('/login')
    } finally {
      setIsLoggingOut(false)
    }
  }

  const navigateHome = () => {
    router.push('/dashboard')
    onClose()
  }

  const navigateProfile = () => {
    router.push('/profile')
    onClose()
  }

  const navigateContact = () => {
    router.push('/contact')
    onClose()
  }

  const navigateCameras = () => {
    router.push('/cameras')
    onClose()
  }

  const menuItems = [
    {
      icon: Home,
      label: 'Dashboard',
      description: 'Return to main dashboard',
      onClick: navigateHome,
      available: true
    },
    {
      icon: Camera,
      label: 'Cameras',
      description: 'Manage your security cameras',
      onClick: navigateCameras,
      available: true
    },
    {
      icon: Settings,
      label: 'Settings',
      description: 'App preferences and configuration',
      onClick: () => {}, // TODO: Implement settings
      available: false
    },
    {
      icon: User,
      label: 'Profile',
      description: 'Manage your account',
      onClick: navigateProfile,
      available: true
    },
    {
      icon: Shield,
      label: 'Security',
      description: 'Security settings and logs',
      onClick: () => {}, // TODO: Implement security
      available: false
    },
    {
      icon: Wrench,
      label: 'Tools',
      description: 'Advanced utilities and diagnostics',
      onClick: () => {}, // TODO: Implement tools
      available: false
    },
    {
      icon: Mail,
      label: 'Contact',
      description: 'Get in touch with the developer',
      onClick: navigateContact,
      available: true
    }
  ]

  if (!isOpen && !isAnimating) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 backdrop-blur-sm z-50 transition-all duration-300 ease-in-out ${
          isVisible ? 'bg-black/50 opacity-100' : 'bg-black/0 opacity-0'
        }`}
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-80 glass-card border-r border-dark-600/50 z-[60] shadow-2xl overflow-y-auto transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Header */}
        <div className="p-6 border-b border-dark-600/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-xl flex items-center justify-center mr-3">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Jarvis</h2>
                <p className="text-xs text-dark-400">Smart Home Control</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-dark-400 hover:text-white transition-colors rounded-lg hover:bg-dark-700/50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="p-4">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-dark-300 uppercase tracking-wider px-3 py-2">
              Navigation
            </h3>
            
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={item.available ? item.onClick : undefined}
                disabled={!item.available}
                className={`
                  w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all text-left
                  ${item.available 
                    ? 'hover:bg-dark-700/50 text-white cursor-pointer' 
                    : 'text-dark-500 cursor-not-allowed opacity-60'
                  }
                `}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.label}</span>
                    {!item.available && (
                      <span className="text-xs bg-dark-600 text-dark-400 px-2 py-0.5 rounded-full">
                        Soon
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-dark-400 mt-0.5">{item.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Section - Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-dark-600/50 bg-dark-800/80 backdrop-blur-sm">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg bg-red-600/10 hover:bg-red-600/20 text-red-400 hover:text-red-300 transition-all border border-red-600/20 disabled:opacity-50"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">
              {isLoggingOut ? 'Signing out...' : 'Sign Out'}
            </span>
            {isLoggingOut && (
              <div className="ml-auto w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
            )}
          </button>
          
          <div className="mt-3 text-center">
            <p className="text-xs text-dark-500">© 2024 Jarvis Smart Home</p>
          </div>
        </div>
      </div>
    </>
  )
} 