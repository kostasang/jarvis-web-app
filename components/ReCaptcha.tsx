'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { config } from '@/config/env'

interface ReCaptchaProps {
  onVerify: (token: string | null) => void
  onExpired?: () => void
  onError?: () => void
  disabled?: boolean
}

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void
      render: (container: string | HTMLElement, parameters: {
        sitekey: string
        callback?: (token: string) => void
        'expired-callback'?: () => void
        'error-callback'?: () => void
        theme?: 'light' | 'dark'
        size?: 'normal' | 'compact'
      }) => number
      reset: (widgetId?: number) => void
      getResponse: (widgetId?: number) => string
    }
  }
}

export default function ReCaptcha({ onVerify, onExpired, onError, disabled = false }: ReCaptchaProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<number | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  // Store callback refs to avoid re-rendering on callback changes
  const onVerifyRef = useRef(onVerify)
  const onExpiredRef = useRef(onExpired)
  const onErrorRef = useRef(onError)

  // Update callback refs when props change
  useEffect(() => {
    onVerifyRef.current = onVerify
    onExpiredRef.current = onExpired
    onErrorRef.current = onError
  }, [onVerify, onExpired, onError])

  useEffect(() => {
    // Load the reCAPTCHA script if not already loaded
    if (!document.querySelector('script[src*="recaptcha"]')) {
      const script = document.createElement('script')
      script.src = 'https://www.google.com/recaptcha/api.js'
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }

    // Wait for reCAPTCHA to be ready
    const checkRecaptcha = () => {
      if (window.grecaptcha) {
        window.grecaptcha.ready(() => {
          setIsLoaded(true)
          setIsLoading(false)
        })
      } else {
        // Check again after a short delay
        setTimeout(checkRecaptcha, 100)
      }
    }

    checkRecaptcha()
  }, [])

  useEffect(() => {
    if (isLoaded && containerRef.current && !disabled) {
      // Check if container already has reCAPTCHA rendered
      const hasExistingRecaptcha = containerRef.current.hasChildNodes() && 
                                   containerRef.current.querySelector('iframe[src*="recaptcha"]')
      
      if (!hasExistingRecaptcha && widgetIdRef.current === null) {
        try {
          widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
            sitekey: config.recaptchaSiteKey,
            callback: (token: string) => {
              onVerifyRef.current(token)
            },
            'expired-callback': () => {
              onVerifyRef.current(null)
              onExpiredRef.current?.()
            },
            'error-callback': () => {
              onVerifyRef.current(null)
              onErrorRef.current?.()
            },
            theme: 'dark',
            size: 'normal'
          })
        } catch (error) {
          console.error('Error rendering reCAPTCHA:', error)
          onErrorRef.current?.()
          setIsLoading(false)
        }
      }
    }

    // Cleanup function
    return () => {
      if (widgetIdRef.current !== null && window.grecaptcha) {
        try {
          window.grecaptcha.reset(widgetIdRef.current)
        } catch (error) {
          // Silent error - widget might already be cleaned up
        }
      }
    }
  }, [isLoaded, disabled]) // Removed callback dependencies

  // Reset when disabled changes
  useEffect(() => {
    if (disabled && widgetIdRef.current !== null) {
      try {
        window.grecaptcha.reset(widgetIdRef.current)
        onVerifyRef.current(null)
      } catch (error) {
        console.error('Error resetting reCAPTCHA:', error)
      }
    }
  }, [disabled])

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (widgetIdRef.current !== null && containerRef.current) {
        // Clear the container content
        containerRef.current.innerHTML = ''
        widgetIdRef.current = null
      }
    }
  }, [])

  const handleReset = () => {
    if (widgetIdRef.current !== null) {
      try {
        window.grecaptcha.reset(widgetIdRef.current)
        onVerifyRef.current(null)
      } catch (error) {
        console.error('Error resetting reCAPTCHA:', error)
      }
    }
  }

  if (!config.recaptchaSiteKey) {
    return (
      <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
        <p className="text-red-300 text-sm">
          ⚠️ reCAPTCHA site key not configured. Please set NEXT_PUBLIC_RECAPTCHA_SITE_KEY in your environment.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2" style={{ overflow: 'visible' }}>
      {isLoading && (
        <div className="flex items-center gap-2 p-3 bg-dark-700/30 rounded border">
          <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-dark-300">Loading reCAPTCHA...</span>
        </div>
      )}
      
      <div 
        ref={containerRef}
        className={`${isLoading ? 'hidden' : 'block'} ${disabled ? 'opacity-50 pointer-events-none' : 'pointer-events-auto'}`}
        style={{ 
          overflow: 'visible',
          position: 'relative',
          zIndex: 1000
        }}
      />
      
      {!isLoading && !disabled && (
        <button
          type="button"
          onClick={handleReset}
          className="text-xs text-dark-400 hover:text-dark-200 transition-colors"
        >
          Reset reCAPTCHA
        </button>
      )}
    </div>
  )
} 