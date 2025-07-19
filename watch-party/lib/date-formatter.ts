/**
 * Date and time formatting utilities for the watch party app
 */

export const dateFormatter = {
  /**
   * Format a date for display in the UI
   */
  formatDate: (date: Date | string | number, options?: Intl.DateTimeFormatOptions): string => {
    const d = new Date(date)
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
    return d.toLocaleDateString('en-US', { ...defaultOptions, ...options })
  },

  /**
   * Format time for display
   */
  formatTime: (date: Date | string | number, options?: Intl.DateTimeFormatOptions): string => {
    const d = new Date(date)
    const defaultOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
    }
    return d.toLocaleTimeString('en-US', { ...defaultOptions, ...options })
  },

  /**
   * Format date and time together
   */
  formatDateTime: (date: Date | string | number): string => {
    const d = new Date(date)
    return `${dateFormatter.formatDate(d)} at ${dateFormatter.formatTime(d)}`
  },

  /**
   * Get relative time (e.g., "5 minutes ago", "2 hours ago")
   */
  getRelativeTime: (date: Date | string | number): string => {
    const d = new Date(date)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000)

    if (diffInSeconds < 0) {
      return 'in the future'
    }

    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
    }

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(diffInSeconds / secondsInUnit)
      if (interval >= 1) {
        return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`
      }
    }

    return 'just now'
  },

  /**
   * Format duration in seconds to readable format
   */
  formatDuration: (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = Math.floor(seconds % 60)

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  },

  /**
   * Get countdown to a future date
   */
  getCountdown: (targetDate: Date | string | number): {
    days: number
    hours: number
    minutes: number
    seconds: number
    isExpired: boolean
  } => {
    const target = new Date(targetDate)
    const now = new Date()
    const diffInMs = target.getTime() - now.getTime()

    if (diffInMs <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true }
    }

    const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diffInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diffInMs % (1000 * 60)) / 1000)

    return { days, hours, minutes, seconds, isExpired: false }
  },

  /**
   * Check if a date is today
   */
  isToday: (date: Date | string | number): boolean => {
    const d = new Date(date)
    const today = new Date()
    return d.toDateString() === today.toDateString()
  },

  /**
   * Check if a date is this week
   */
  isThisWeek: (date: Date | string | number): boolean => {
    const d = new Date(date)
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    return d >= oneWeekAgo && d <= now
  },

  /**
   * Get timezone-aware scheduling time
   */
  formatScheduleTime: (date: Date | string | number, timezone?: string): string => {
    const d = new Date(date)
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    }

    if (timezone) {
      options.timeZone = timezone
    }

    return d.toLocaleString('en-US', options)
  }
}
