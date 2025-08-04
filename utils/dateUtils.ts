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
    const diffMinutes = diffSeconds / 60

    if (diffSeconds < 30) {
      return 'Just now'
    } else if (diffMinutes < 1.5) {
      return 'Less than 1 minute ago'
    } else if (diffMinutes < 5) {
      return 'Less than 5 minutes ago'
    } else {
      return 'More than 5 minutes ago'
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
    const diffSeconds = Math.floor(diffMs / 1000)
    const diffMinutes = diffSeconds / 60

    if (diffSeconds < 30) {
      return 'text-green-400'  // Just now
    } else if (diffMinutes < 1.5) {
      return 'text-green-400'  // Less than a minute ago
    } else if (diffMinutes < 5) {
      return 'text-orange-400'  // Less than five minutes ago
    } else {
      return 'text-red-400'  // More than 5 minutes ago
    }
  } catch {
    return 'text-red-400'
  }
}