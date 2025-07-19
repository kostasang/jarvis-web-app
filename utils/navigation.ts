export function getBasePath(): string {
  // In production, Next.js automatically sets the basePath from next.config.js
  return process.env.NODE_ENV === 'production' ? '/jarvis-web-app' : ''
}

export function getFullPath(path: string): string {
  // Remove leading slash to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  const basePath = getBasePath()
  
  // Construct the full path
  return basePath ? `${basePath}/${cleanPath}` : `/${cleanPath}`
}

// Navigation helper for router.push
export function navigateTo(path: string): string {
  return getFullPath(path)
}

// Navigation helper for window.location redirects
export function redirectTo(path: string): void {
  window.location.href = getFullPath(path)
} 