// Environment configuration
export const config = {
  // API Configuration
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'https://jarvis-core.ddns.net',
  
  // Media Server Configuration
  mediaServerUrl: process.env.NEXT_PUBLIC_MEDIA_SERVER_URL || 'https://jarvis-core.ddns.net:8889',
  
  // Google reCAPTCHA Configuration
  recaptchaSiteKey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6LfbyesqAAAAAP6i8KxIXFKei_TFzW-j8N-02GZT'
}

// Validation - ensure required environment variables are set
if (!config.recaptchaSiteKey) {
  console.warn('Warning: NEXT_PUBLIC_RECAPTCHA_SITE_KEY is not set in environment variables')
}

export default config 