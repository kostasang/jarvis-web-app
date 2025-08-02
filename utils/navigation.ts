export function getBasePath(): string {
  // Mirror the basePath logic from next.config.js for manual redirects
  return process.env.NODE_ENV === 'production' ? '/jarvis-web-app' : ''
}

export function getFullPath(path: string): string {
  // Remove leading slash to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  const basePath = getBasePath()
  
  // Construct the full path
  return basePath ? `${basePath}/${cleanPath}` : `/${cleanPath}`
}

// Navigation helper for router.push (Next.js handles basePath automatically)
export function navigateTo(path: string): string {
  return path
}

// Navigation helper for window.location redirects
export function redirectTo(path: string): void {
  window.location.href = getFullPath(path)
} 