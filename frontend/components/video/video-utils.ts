/**
 * Video utility functions for formatting and styling
 */

/**
 * Get Tailwind CSS classes for video status badges
 */
export function getStatusColor(status?: string): string {
  switch (status) {
    case "ready":
      return "text-brand-cyan-light bg-green-400/20"
    case "processing":
      return "text-brand-orange-light bg-yellow-400/20"
    case "pending":
      return "text-brand-blue-light bg-blue-400/20"
    case "failed":
      return "text-brand-coral-light bg-red-400/20"
    default:
      return "text-white/60 bg-white/10"
  }
}

/**
 * Format file size in bytes to human-readable string
 */
export function formatFileSize(bytes?: number | string): string {
  if (!bytes) return "Unknown size"
  
  const units = ["B", "KB", "MB", "GB"]
  let size = typeof bytes === "string" ? Number.parseFloat(bytes) : bytes
  
  if (!Number.isFinite(size)) return "Unknown size"
  
  let unitIndex = 0
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`
}

/**
 * Format duration in seconds to HH:MM:SS or MM:SS string
 */
export function formatDuration(seconds?: number): string {
  if (!seconds) return "Unknown"
  
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }
  
  return `${minutes}:${secs.toString().padStart(2, "0")}`
}
