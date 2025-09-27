/**
 * React hooks for API calls
 * Provides convenient hooks for common API operations
 */

import { useCallback, useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { api, apiClient } from "@/lib/api"
import type {
  Video,
  WatchParty,
  Notification,
  DashboardStats,
  PaginatedResponse,
} from "@/lib/api/types"

// Generic hook for API calls with loading and error states
export function useAPICall<T>() {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const execute = useCallback(async (apiCall: () => Promise<T>) => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await apiCall()
      setData(result)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error")
      setError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  return { data, loading, error, execute }
}

// Hook for dashboard stats
export function useDashboardStats() {
  const { isAuthenticated } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const loadStats = useCallback(async () => {
    if (!isAuthenticated) return

    setLoading(true)
    setError(null)

    try {
      const data = await api.users.getDashboardStats()
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load stats"))
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  return { stats, loading, error, refresh: loadStats }
}

// Hook for videos list
export function useVideos(filters?: {
  search?: string
  visibility?: 'public' | 'private' | 'unlisted'
  page?: number
}) {
  const [videos, setVideos] = useState<PaginatedResponse<Video> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const loadVideos = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await api.videos.getVideos(filters)
      setVideos(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load videos"))
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    loadVideos()
  }, [loadVideos])

  return { videos, loading, error, refresh: loadVideos }
}

// Hook for parties list
export function useParties(filters?: {
  status?: 'scheduled' | 'live' | 'paused' | 'ended'
  visibility?: 'public' | 'private'
  search?: string
  page?: number
}) {
  const [parties, setParties] = useState<PaginatedResponse<WatchParty> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const loadParties = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await api.parties.getParties(filters)
      setParties(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load parties"))
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    loadParties()
  }, [loadParties])

  return { parties, loading, error, refresh: loadParties }
}

// Hook for notifications
export function useNotifications() {
  const { isAuthenticated } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const loadNotifications = useCallback(async () => {
    if (!isAuthenticated) return

    setLoading(true)
    setError(null)

    try {
      const data = await api.notifications.getNotifications()
      setNotifications(data.results)
      setUnreadCount(data.unread_count)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load notifications"))
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await api.notifications.markAsRead(notificationId)
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      throw err instanceof Error ? err : new Error("Failed to mark as read")
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    try {
      await api.notifications.markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch (err) {
      throw err instanceof Error ? err : new Error("Failed to mark all as read")
    }
  }, [])

  useEffect(() => {
    loadNotifications()
  }, [loadNotifications])

  return { 
    notifications, 
    unreadCount, 
    loading, 
    error, 
    refresh: loadNotifications,
    markAsRead,
    markAllAsRead
  }
}

// Hook for video upload
export function useVideoUpload() {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<Error | null>(null)

  const uploadVideo = useCallback(async (
    file: File,
    metadata: {
      title: string
      description: string
      visibility?: "public" | "private" | "unlisted"
    }
  ) => {
    setUploading(true)
    setProgress(0)
    setError(null)

    try {
      const result = await api.videos.uploadVideo(
        file,
        metadata,
        (progress) => setProgress(progress)
      )
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Upload failed")
      setError(error)
      throw error
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }, [])

  return { uploadVideo, uploading, progress, error }
}

// Hook for party management
export function usePartyActions() {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<Error | null>(null)

  const joinParty = useCallback(async (partyId: string, message?: string) => {
    setLoading("join")
    setError(null)

    try {
      const result = await api.parties.joinParty(partyId, message)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to join party")
      setError(error)
      throw error
    } finally {
      setLoading(null)
    }
  }, [])

  const leaveParty = useCallback(async (partyId: string) => {
    setLoading("leave")
    setError(null)

    try {
      await api.parties.leaveParty(partyId)
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to leave party")
      setError(error)
      throw error
    } finally {
      setLoading(null)
    }
  }, [])

  const controlVideo = useCallback(async (
    partyId: string,
    action: "play" | "pause" | "seek" | "stop",
    timestamp?: number
  ) => {
    setLoading("control")
    setError(null)

    try {
      await api.parties.controlVideo(partyId, { action, timestamp })
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to control video")
      setError(error)
      throw error
    } finally {
      setLoading(null)
    }
  }, [])

  return { joinParty, leaveParty, controlVideo, loading, error }
}

// Main useApi hook with HTTP methods
export function useApi() {
  const [data, setData] = useState<unknown>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const normalizeEndpoint = useCallback((endpoint: string) => {
    if (!endpoint || typeof endpoint !== "string") {
      return endpoint
    }

    if (endpoint.startsWith("http://") || endpoint.startsWith("https://")) {
      return endpoint
    }

    if (!endpoint.startsWith("/")) {
      return endpoint
    }

    if (endpoint === "/api" || endpoint.startsWith("/api/")) {
      return endpoint
    }

    return `/api${endpoint}`
  }, [])

  const execute = useCallback(async (apiCall: () => Promise<unknown>) => {
    setLoading(true)
    setError(null)

    try {
      const result = await apiCall()
      setData(result)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error")
      setError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const get = useCallback(async (endpoint: string, config?: any) => {
    const result = await execute(() => apiClient.get(normalizeEndpoint(endpoint), config))
    return { data: result }
  }, [execute, normalizeEndpoint])

  const post = useCallback(async (endpoint: string, data?: any, config?: any) => {
    const result = await execute(() => apiClient.post(normalizeEndpoint(endpoint), data, config))
    return { data: result }
  }, [execute, normalizeEndpoint])

  const put = useCallback(async (endpoint: string, data?: any, config?: any) => {
    const result = await execute(() => apiClient.put(normalizeEndpoint(endpoint), data, config))
    return { data: result }
  }, [execute, normalizeEndpoint])

  const patch = useCallback(async (endpoint: string, data?: any, config?: any) => {
    const result = await execute(() => apiClient.patch(normalizeEndpoint(endpoint), data, config))
    return { data: result }
  }, [execute, normalizeEndpoint])

  const deleteMethod = useCallback(async (endpoint: string, config?: any) => {
    const result = await execute(() => apiClient.delete(normalizeEndpoint(endpoint), config))
    return { data: result }
  }, [execute, normalizeEndpoint])

  return {
    data,
    loading,
    error, 
    execute,
    get,
    post,
    put,
    patch,
    delete: deleteMethod
  }
}
