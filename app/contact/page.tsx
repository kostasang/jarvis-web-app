'use client'

import { Mail, Linkedin, Zap, Home, ExternalLink } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { navigateTo } from '@/utils/navigation'

export default function ContactPage() {
  const router = useRouter()

  const handleEmailClick = () => {
    window.location.href = 'mailto:kostas.ang97@gmail.com'
  }

  const handleLinkedInClick = () => {
    window.open('https://www.linkedin.com/in/konstantinos-anagnostopoulos-9182a513b/', '_blank')
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
                <span className="text-dark-400">Contact</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4">
        {/* Contact Cards */}
        <div className="grid gap-6 md:grid-cols-2 mt-8">
          {/* Email Card */}
          <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-6 hover:border-primary-500/50 transition-colors">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-primary-500/20 rounded-lg">
                <Mail className="w-6 h-6 text-primary-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Email</h2>
                <p className="text-dark-400">Send me a direct message</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <p className="text-dark-300">
                Have questions, feedback, or need support? I'd love to hear from you!
              </p>
              
              <button
                onClick={handleEmailClick}
                className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                <Mail className="w-4 h-4" />
                kostas.ang97@gmail.com
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* LinkedIn Card */}
          <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-6 hover:border-blue-500/50 transition-colors">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Linkedin className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">LinkedIn</h2>
                <p className="text-dark-400">Connect professionally</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <p className="text-dark-300">
                Let's connect on LinkedIn! Feel free to reach out for professional networking or collaboration opportunities.
              </p>
              
              <button
                onClick={handleLinkedInClick}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                <Linkedin className="w-4 h-4" />
                Konstantinos Anagnostopoulos
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="mt-8 bg-dark-800/30 border border-dark-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-3">About Jarvis</h3>
          <p className="text-dark-300 leading-relaxed">
            Jarvis is a comprehensive end-to-end smart home ecosystem that seamlessly integrates 
            physical devices, intelligent hubs, and this web application to provide complete home automation. 
            The system encompasses everything from sensor nodes and control devices to centralized hubs 
            that coordinate your entire smart home network, all managed through an intuitive web interface 
            that gives you real-time monitoring and intelligent control capabilities.
          </p>
          
          <div className="mt-4 p-4 bg-dark-700/50 rounded-lg">
            <p className="text-sm text-dark-400">
              <strong className="text-dark-200">Developer:</strong> Konstantinos Anagnostopoulos
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 