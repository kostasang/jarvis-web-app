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