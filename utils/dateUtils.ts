/**
 * Robust date formatting utilities for handling various timestamp formats
 */

export function formatTimestamp(timestamp?: string | null): string {
  if (!timestamp) {
    return 'No data available'
  }

  try {
    // Try to create a Date object from the timestamp
    let date: Date

    // Handle common backend timestamp formats
    if (timestamp.includes(' EEST') || timestamp.includes(' EET')) {
      // Remove timezone abbreviations that JS doesn't understand well
      const cleanTimestamp = timestamp.replace(/ EEST| EET/g, '')
      date = new Date(cleanTimestamp)
    } else {
      date = new Date(timestamp)
    }

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid timestamp format:', timestamp)
      return 'Invalid date format'
    }

    return date.toLocaleString()
  } catch (error) {
    console.error('Error formatting timestamp:', timestamp, error)
    return 'Invalid date'
  }
}

export function formatTimestampSafe(timestamp?: string | null, fallback: string = 'Never'): string {
  if (!timestamp) {
    return fallback
  }

  const formatted = formatTimestamp(timestamp)
  if (formatted === 'Invalid date format' || formatted === 'Invalid date') {
    return fallback
  }

  return formatted
}

export function isValidTimestamp(timestamp?: string | null): boolean {
  if (!timestamp) return false
  
  try {
    let date: Date
    
    if (timestamp.includes(' EEST') || timestamp.includes(' EET')) {
      const cleanTimestamp = timestamp.replace(/ EEST| EET/g, '')
      date = new Date(cleanTimestamp)
    } else {
      date = new Date(timestamp)
    }
    
    return !isNaN(date.getTime())
  } catch {
    return false
  }
}

/**
 * Format timestamp as relative time (e.g., "2 minutes ago", "3 hours ago")
 */
export function formatRelativeTime(timestamp?: string | null): string {
  if (!timestamp || !isValidTimestamp(timestamp)) {
    return 'No data'
  }

  try {
    let date: Date
    
    if (timestamp.includes(' EEST') || timestamp.includes(' EET')) {
      const cleanTimestamp = timestamp.replace(/ EEST| EET/g, '')
      date = new Date(cleanTimestamp)
    } else {
      date = new Date(timestamp)
    }

    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    
    // If timestamp is in the future, show "just now"
    if (diffMs < 0) {
      return 'Just now'
    }

    const diffSeconds = Math.floor(diffMs / 1000)
    const diffMinutes = Math.floor(diffSeconds / 60)
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffSeconds < 60) {
      return diffSeconds <= 1 ? 'Just now' : `${diffSeconds}s ago`
    } else if (diffMinutes < 60) {
      return diffMinutes === 1 ? '1 min ago' : `${diffMinutes}m ago`
    } else if (diffHours < 24) {
      return diffHours === 1 ? '1 hr ago' : `${diffHours}h ago`
    } else if (diffDays < 7) {
      return diffDays === 1 ? '1 day ago' : `${diffDays}d ago`
    } else {
      // For older dates, show the actual date
      return date.toLocaleDateString()
    }
  } catch (error) {
    console.error('Error formatting relative time:', timestamp, error)
    return 'Invalid date'
  }
}

/**
 * Get color class based on how recent the timestamp is
 */
export function getTimestampColorClass(timestamp?: string | null): string {
  if (!timestamp || !isValidTimestamp(timestamp)) {
    return 'text-red-400'
  }

  try {
    let date: Date
    
    if (timestamp.includes(' EEST') || timestamp.includes(' EET')) {
      const cleanTimestamp = timestamp.replace(/ EEST| EET/g, '')
      date = new Date(cleanTimestamp)
    } else {
      date = new Date(timestamp)
    }

    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))

    if (diffMinutes < 5) {
      return 'text-green-400'  // Very recent
    } else if (diffMinutes < 30) {
      return 'text-secondary-400'  // Recent
    } else if (diffMinutes < 120) {
      return 'text-yellow-400'  // Somewhat old
    } else {
      return 'text-red-400'  // Old
    }
  } catch {
    return 'text-red-400'
  }
}