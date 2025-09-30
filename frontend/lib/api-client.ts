/**
 * API Client for Watch Party Backend
 * Handles all API requests with proper error handling and authentication
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://be-watch-party.brahim-elhouss.me"

interface ApiError {
  success: false
  error: string
  message: string
  details?: Record<string, string[]>
}

export type DashboardStatsResponse = {
  stats?: {
    total_parties?: number
    recent_parties?: number
    total_videos?: number
    recent_videos?: number
    watch_time_minutes?: number
  }
}

export type PartySummary = {
  id?: string
  title?: string
  description?: string
  visibility?: "public" | "friends" | "private"
  participant_count?: number
  status?: string
  scheduled_start?: string
  video?: {
    title?: string
  }
}

type PartyCreateInput = {
  title: string
  description?: string
  video_id: string
  visibility?: "public" | "friends" | "private"
  max_participants?: number
  scheduled_start?: string
}

export type VideoSummary = {
  id?: string
  title?: string
  description?: string
  source_type?: string
  source_url?: string
  duration_formatted?: string
  visibility?: string
}

type VideoCreateInput = {
  title: string
  description?: string
  source_type?: string
  source_url?: string
  visibility?: "public" | "friends" | "private"
}

export type UserProfile = {
  first_name?: string
  last_name?: string
  email?: string
  is_premium?: boolean
}

type ApiListResponse<T> = {
  results?: T[]
} & Record<string, unknown>

/**
 * Generic fetch wrapper with error handling
 */
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  
  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
  }

  // Get JWT token from localStorage if available
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token")
    if (token) {
      defaultHeaders["Authorization"] = `Bearer ${token}`
    }
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  }

  try {
    const response = await fetch(url, config)
    
    if (!response.ok) {
      const errorData: ApiError = await response.json().catch(() => ({
        success: false,
        error: "network_error",
        message: `HTTP ${response.status}: ${response.statusText}`,
      }))
      
      throw new Error(errorData.message || `API request failed: ${response.statusText}`)
    }

    const data = await response.json()
    return data as T
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error)
    throw error
  }
}

/**
 * Dashboard API
 */
export const dashboardApi = {
  /**
   * Get dashboard statistics for authenticated user
   * @returns Dashboard stats including parties, videos, and watch time
   */
  getStats: (): Promise<DashboardStatsResponse> => apiFetch("/analytics/dashboard/"),
}

/**
 * Parties API
 */
export const partiesApi = {
  /**
   * List user's parties
   * @param params Optional query parameters (page, search, is_public, host)
   */
  list: (params?: { page?: number; search?: string; is_public?: boolean; host?: string }): Promise<ApiListResponse<PartySummary>> => {
    const queryString = params
      ? (() => {
          const searchParams = new URLSearchParams()
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              searchParams.append(key, String(value))
            }
          })
          const result = searchParams.toString()
          return result ? `?${result}` : ""
        })()
      : ""
    return apiFetch(`/parties/${queryString}`)
  },

  /**
   * Get party details by ID
   */
  getById: (partyId: string): Promise<PartySummary> => apiFetch(`/parties/${partyId}/`),

  /**
   * Create a new party
   */
  create: (data: PartyCreateInput): Promise<PartySummary> =>
    apiFetch("/parties/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /**
   * Get recent parties
   */
  getRecent: (): Promise<ApiListResponse<PartySummary> | PartySummary[]> => apiFetch("/parties/recent/"),

  /**
   * Get public parties
   */
  getPublic: (): Promise<ApiListResponse<PartySummary> | PartySummary[]> => apiFetch("/parties/public/"),
}

/**
 * Videos API
 */
export const videosApi = {
  /**
   * List videos
   * @param params Optional query parameters (page, search, source_type, visibility)
   */
  list: (params?: {
    page?: number
    search?: string
    source_type?: string
    visibility?: string
  }): Promise<ApiListResponse<VideoSummary>> => {
    const queryString = params
      ? (() => {
          const searchParams = new URLSearchParams()
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              searchParams.append(key, String(value))
            }
          })
          const result = searchParams.toString()
          return result ? `?${result}` : ""
        })()
      : ""
    return apiFetch(`/videos/${queryString}`)
  },

  /**
   * Get video details by ID
   */
  getById: (videoId: string): Promise<VideoSummary> => apiFetch(`/videos/${videoId}/`),

  /**
   * Create a new video
   */
  create: (data: VideoCreateInput): Promise<VideoSummary> =>
    apiFetch("/videos/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
}

/**
 * User/Profile API
 */
export const userApi = {
  /**
   * Get current user profile
   */
  getProfile: (): Promise<UserProfile> => apiFetch("/auth/profile/"),

  /**
   * Update user profile
   */
  updateProfile: (data: Partial<UserProfile>): Promise<UserProfile> =>
    apiFetch("/auth/profile/", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
}

/**
 * Analytics API
 */
export const analyticsApi = {
  /**
   * Get user analytics/stats
   */
  getUserStats: (): Promise<Record<string, unknown>> => apiFetch("/analytics/user-stats/"),

  /**
   * Get party analytics
   */
  getPartyStats: (partyId: string): Promise<Record<string, unknown>> => apiFetch(`/analytics/party-stats/${partyId}/`),
}

const apiClient = {
  dashboard: dashboardApi,
  parties: partiesApi,
  videos: videosApi,
  user: userApi,
  analytics: analyticsApi,
}

export default apiClient
