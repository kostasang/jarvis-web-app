'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Home, Zap, Wrench, Wifi, QrCode, Camera, X, Eye, EyeOff } from 'lucide-react'
import { navigateTo } from '@/utils/navigation'

export default function ToolsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [showWifiSetup, setShowWifiSetup] = useState(false)
  const [wifiName, setWifiName] = useState('')
  const [wifiPassword, setWifiPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('jarvis_token')
    if (!token) {
      router.push(navigateTo('/login'))
      return
    }
    setIsLoading(false)
  }, [router])

  const generateQRCode = async () => {
    if (!wifiName.trim()) {
      return
    }

    setIsGenerating(true)
    
    try {
      // Create WiFi QR code data in standard format
      const wifiData = `WIFI:T:WPA;S:${wifiName.trim()};P:${wifiPassword};H:false;;`
      
      // Use QR Server API to generate QR code
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(wifiData)}`
      
      setQrCodeUrl(qrUrl)
    } catch (error) {
      console.error('Failed to generate QR code:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCloseSetup = () => {
    setShowWifiSetup(false)
    setWifiName('')
    setWifiPassword('')
    setQrCodeUrl('')
    setShowPassword(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-dark-400">Loading tools...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-dark-800/50 backdrop-blur-sm border-b border-dark-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 ml-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push(navigateTo('/dashboard'))}
                className="mr-4 p-2 text-dark-400 hover:text-white transition-colors"
              >
                <Home className="w-5 h-5" />
              </button>
              <div className="flex items-center">
                <Zap className="w-8 h-8 text-primary-500 mr-2" />
                <span className="text-xl font-bold text-white">Jarvis</span>
              </div>
              <div className="ml-6 hidden md:block">
                <span className="text-dark-400">Tools & Utilities</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Tools & Utilities</h1>
          <p className="text-dark-400">Advanced configuration and setup tools for your Jarvis system</p>
        </div>

        {/* Tools Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Camera WiFi Setup */}
          <div className="glass-card p-6 hover:bg-dark-700/30 transition-all duration-200">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-secondary-600 rounded-xl flex items-center justify-center mr-3">
                <Wifi className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Camera WiFi Setup</h3>
                <p className="text-sm text-dark-400">Configure WiFi for new cameras</p>
              </div>
            </div>
            
            <p className="text-dark-300 mb-4 text-sm">
              Generate a QR code with WiFi credentials that cameras can scan to automatically connect to your network.
            </p>
            
            <button
              onClick={() => setShowWifiSetup(true)}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <QrCode className="w-4 h-4" />
              Setup Camera WiFi
            </button>
          </div>

          {/* Placeholder for future tools */}
          <div className="glass-card p-6 opacity-50">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gray-600 rounded-xl flex items-center justify-center mr-3">
                <Wrench className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">System Diagnostics</h3>
                <p className="text-sm text-dark-400">Coming soon</p>
              </div>
            </div>
            <p className="text-dark-300 mb-4 text-sm">
              Network diagnostics and system health monitoring tools.
            </p>
            <button className="btn-secondary w-full" disabled>
              Coming Soon
            </button>
          </div>

          <div className="glass-card p-6 opacity-50">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gray-600 rounded-xl flex items-center justify-center mr-3">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Device Manager</h3>
                <p className="text-sm text-dark-400">Coming soon</p>
              </div>
            </div>
            <p className="text-dark-300 mb-4 text-sm">
              Advanced device configuration and firmware updates.
            </p>
            <button className="btn-secondary w-full" disabled>
              Coming Soon
            </button>
          </div>
        </div>
      </main>

      {/* WiFi Setup Modal */}
      {showWifiSetup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="glass-card max-w-md w-full p-6 relative my-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={handleCloseSetup}
              className="absolute top-4 right-4 text-dark-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-secondary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Wifi className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Camera WiFi Setup</h2>
              <p className="text-dark-400">
                Enter your WiFi credentials to generate a setup QR code
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                  WiFi Network Name (SSID)
                </label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="Enter WiFi network name"
                  value={wifiName}
                  onChange={(e) => setWifiName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                  WiFi Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input-field pr-12"
                    placeholder="Enter WiFi password"
                    value={wifiPassword}
                    onChange={(e) => setWifiPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-dark-400 hover:text-dark-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {!qrCodeUrl ? (
                <button
                  onClick={generateQRCode}
                  disabled={!wifiName.trim() || isGenerating}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Generating QR Code...
                    </>
                  ) : (
                    <>
                      <QrCode className="w-4 h-4" />
                      Generate QR Code
                    </>
                  )}
                </button>
              ) : (
                <div className="text-center">
                  <div className="bg-white p-4 rounded-lg mb-4 inline-block">
                    <img src={qrCodeUrl} alt="WiFi Setup QR Code" className="w-64 h-64" />
                  </div>
                  <p className="text-sm text-dark-400 mb-4">
                    Show this QR code to your camera to configure WiFi automatically
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setQrCodeUrl('')}
                      className="flex-1 btn-secondary"
                    >
                      Generate New
                    </button>
                    <button
                      onClick={handleCloseSetup}
                      className="flex-1 btn-primary"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>

            {qrCodeUrl && (
              <div className="mt-6 pt-4 border-t border-dark-700">
                <h4 className="text-sm font-medium text-dark-200 mb-2">Instructions:</h4>
                <ul className="text-xs text-dark-400 space-y-1">
                  <li>• Point your camera at the QR code</li>
                  <li>• Wait for the camera to scan and process</li>
                  <li>• Camera will automatically connect to WiFi</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 