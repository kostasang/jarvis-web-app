'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import Sidebar from './Sidebar'

interface LayoutWrapperProps {
  children: React.ReactNode
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const pathname = usePathname()

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem('jarvis_token')
    setIsAuthenticated(!!token)
  }, [pathname])

  // Close sidebar when not authenticated or on login page
  useEffect(() => {
    if (!isAuthenticated || pathname === '/login') {
      setIsSidebarOpen(false)
    }
  }, [isAuthenticated, pathname])

  // Don't show sidebar on login page
  const showSidebar = isAuthenticated && pathname !== '/login'

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const closeSidebar = () => {
    setIsSidebarOpen(false)
  }

  return (
    <>
      {/* Global Hamburger Menu Button - Only show when authenticated and not on login */}
      {showSidebar && (
        <button
          onClick={toggleSidebar}
          className="fixed top-2.5 left-4 z-50 p-3 glass-card hover:bg-dark-700/50 transition-all duration-200 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
          title="Open Menu"
        >
          <Menu className={`w-5 h-5 text-white transition-transform duration-200 ${
            isSidebarOpen ? 'rotate-90' : 'rotate-0'
          }`} />
        </button>
      )}

      {/* Sidebar - Only show when authenticated */}
      {showSidebar && <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />}

      {/* Main Content */}
      <div className="relative">
        {children}
      </div>
    </>
  )
} 