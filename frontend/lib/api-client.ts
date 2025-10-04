/**
 * Comprehensive API Client for Watch Party Platform
 * This client covers ALL backend endpoints from the API schema
 * Handles authentication, error handling, and type safety
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://be-watch-party.brahim-elhouss.me"

const normalizeBase = (value: string) => value.replace(/\/+$/, "")

const FRONTEND_API_BASE =
  process.env.NEXT_PUBLIC_FRONTEND_API && process.env.NEXT_PUBLIC_FRONTEND_API.trim().length > 0
    ? process.env.NEXT_PUBLIC_FRONTEND_API
    : `${normalizeBase(API_BASE_URL)}/api`

const buildUrl = (base: string, endpoint: string) => {
  if (/^https?:\/\//i.test(endpoint)) {
    return endpoint
  }

  const normalizedBase = normalizeBase(base)

  if (endpoint.startsWith('/')) {
    return `${normalizedBase}${endpoint}`
  }

  return `${normalizedBase}/${endpoint}`
}

// Core Types (matching the API schema)
export interface User {
  id: string
  username: string
  email: string
  first_name?: string
  last_name?: string
  avatar?: string
  is_verified?: boolean
  is_premium?: boolean
  is_staff?: boolean
  is_active?: boolean
  date_joined?: string
  last_login?: string
  created_at: string
  updated_at: string
}

export interface WatchParty {
  id: string
  title: string
  name?: string // Alias for title for backward compatibility
  description?: string
  host: User
  status: 'scheduled' | 'live' | 'paused' | 'ended' | 'cancelled'
  visibility: 'public' | 'friends' | 'private'
  participant_count: number
  participants_count?: number // Alias for participant_count
  member_count?: number // Alternative naming
  max_participants?: number
  scheduled_start?: string
  started_at?: string
  ended_at?: string
  invite_code?: string
  video_url?: string
  video?: VideoSummary
  is_public?: boolean
  is_active?: boolean
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  id: string
  user: User
  content: string
  message_type: 'text' | 'system' | 'reaction'
  timestamp: string
  edited_at?: string
  reply_to?: string
}

export interface VideoSummary {
  id: string
  title: string
  description?: string
  source_type?: string
  source_url?: string
  duration?: number
  duration_formatted?: string
  file_size?: number
  thumbnail_url?: string
  thumbnail?: string // Alias for thumbnail_url
  stream_url?: string
  upload_status?: 'pending' | 'processing' | 'ready' | 'failed'
  processing_status?: 'pending' | 'processing' | 'completed' | 'failed'
  moderation_status?: 'pending' | 'approved' | 'rejected'
  moderation_reason?: string
  quality_variants?: string[]
  visibility?: 'public' | 'friends' | 'private'
  uploaded_by?: User
  video_file?: string
  created_at: string
  updated_at: string
}

export interface Analytics {
  total_parties?: number
  total_videos?: number
  total_users?: number
  watch_time_minutes?: number
  recent_parties?: number
  recent_videos?: number
}

export interface StandardApiResponse<T> {
  success: boolean
  message: string
  data?: T
  status?: string
  timestamp?: string
}

export interface RealTimeAnalyticsResponse {
  timestamp?: string
  online_users?: number
  active_parties?: number
  recent_activity?: { event_type?: string; count?: number }[]
  engagement?: {
    concurrent_viewers?: number
    messages_per_minute?: number
    reactions_per_minute?: number
  }
  system_health?: {
    system_load?: number
    cpu_usage?: number
    memory_usage?: number
    disk_usage?: number
    network_traffic?: number
  }
}

export interface NormalizedRealTimeAnalytics {
  timestamp: string
  onlineUsers: number
  activeParties: number
  recentActivity: { eventType: string; count: number }[]
  engagement: {
    concurrentViewers: number
    messagesPerMinute: number
    reactionsPerMinute: number
  }
  engagementHistory?: { label: string; value: number; timestamp: string }[]
  systemHealth: {
    systemLoad: number
    cpuUsage: number
    memoryUsage: number
    diskUsage: number
    networkTraffic: number
  }
}

export interface Notification {
  id: string
  title: string
  message: string
  type: string
  is_read: boolean
  created_at: string
  action_url?: string
  data?: Record<string, any>
}

export interface Integration {
  id: string
  type: string
  status: 'connected' | 'disconnected' | 'pending'
  name: string
  created_at: string
}

export interface Event {
  id: string
  title: string
  description?: string
  start_time: string
  end_time?: string
  organizer: User
  attendee_count: number
  max_attendees?: number
  status: 'upcoming' | 'live' | 'ended' | 'cancelled'
  created_at: string
}

// API Response Types
export interface PaginatedResponse<T> {
  results: T[]
  count: number
  next?: string
  previous?: string
}

export interface APIError {
  success: false
  error: string
  message: string
  details?: Record<string, string[]>
}

export interface ApiClientError extends Error {
  status?: number
  code?: string
  details?: Record<string, string[]>
}

export interface StandardResponse<T> {
  success: boolean
  message: string
  data?: T
  meta?: Record<string, unknown>
}

export type DashboardStatsResponse = {
  stats: Analytics
}

export type PartySummary = WatchParty

// Legacy types for backward compatibility
export type UserProfile = User

/**
 * Generic fetch wrapper with comprehensive error handling
 */
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  useBackend = false
): Promise<T> {
  const baseUrl = useBackend ? API_BASE_URL : FRONTEND_API_BASE
  const url = buildUrl(baseUrl, endpoint)
  
  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
  }

  // Get JWT token from localStorage or cookies
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token")
    if (token) {
      defaultHeaders["Authorization"] = `Bearer ${token}`
    }
  }

  const config: RequestInit = {
    credentials: 'include',
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  }

  try {
    const response = await fetch(url, config)
    
    if (!response.ok) {
      const errorData: Partial<APIError> = await response.json().catch(() => ({
        success: false,
        error: "network_error",
        message: `HTTP ${response.status}: ${response.statusText}`,
      }))

      const errorMessage = errorData.message || `API request failed: ${response.statusText}`
      const apiError = new Error(errorMessage) as ApiClientError
      apiError.status = response.status
      if (errorData.error) {
        apiError.code = errorData.error
      }
      if (errorData.details) {
        apiError.details = errorData.details
      }

      throw apiError
    }

    const data = await response.json()
    return data as T
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error)
    throw error
  }
}

/**
 * Authentication API
 */
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    apiFetch<{ access_token: string; refresh_token: string; user: User; success: boolean }>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  register: (data: { first_name: string; last_name: string; email: string; password: string; confirm_password: string }) =>
    apiFetch<{ user: User; access_token: string; refresh_token: string; success: boolean; message: string }>('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  logout: () =>
    apiFetch<{ message: string }>('/api/auth/logout/', {
      method: 'POST',
    }, true),

  refreshToken: (refresh: string) =>
    apiFetch<{ access: string }>('/api/auth/refresh/', {
      method: 'POST',
      body: JSON.stringify({ refresh }),
    }, true),

  forgotPassword: (email: string) =>
    apiFetch<{ message: string }>('/api/auth/forgot-password/', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }, true),

  resetPassword: (data: { token: string; password: string }) =>
    apiFetch<{ message: string }>('/api/auth/reset-password/', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true),

  verifyEmail: (token: string) =>
    apiFetch<{ message: string }>('/api/auth/verify-email/', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }, true),

  resendVerification: (data: { email: string }) =>
    apiFetch<{ message: string }>('/api/auth/resend-verification/', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true),

  getProfile: () =>
    apiFetch<User>('/api/auth/profile/', {}, true),

  updateProfile: (data: Partial<User>) =>
    apiFetch<User>('/api/auth/profile/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }, true),

  changePassword: (data: { old_password: string; new_password: string }) =>
    apiFetch<{ message: string }>('/api/auth/change-password/', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true),

  // 2FA endpoints
  setup2FA: () =>
    apiFetch<{ qr_code: string; secret: string }>('/api/auth/2fa/setup/', {
      method: 'POST',
    }, true),

  verify2FA: (token: string) =>
    apiFetch<{ message: string }>('/api/auth/2fa/verify/', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }, true),

  disable2FA: (token: string) =>
    apiFetch<{ message: string }>('/api/auth/2fa/disable/', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }, true),

  // Social auth
  googleAuth: (access_token: string) =>
    apiFetch<{ access: string; refresh: string; user: User }>('/api/auth/social/google/', {
      method: 'POST',
      body: JSON.stringify({ access_token }),
    }, true),

  githubAuth: (access_token: string) =>
    apiFetch<{ access: string; refresh: string; user: User }>('/api/auth/social/github/', {
      method: 'POST',
      body: JSON.stringify({ access_token }),
    }, true),

  // Google Drive integration
  getGoogleDriveAuthUrl: async () => {
    const response = await apiFetch<{ data: { authorization_url: string; state?: string } }>(
      '/api/auth/google-drive/auth/',
      {},
      true
    )

    const { authorization_url: authorizationUrl, state } = response.data || {}
    if (!authorizationUrl) {
      throw new Error('Authorization URL was not provided by the server.')
    }

    if (state && !authorizationUrl.includes('state=')) {
      try {
        const url = new URL(authorizationUrl)
        url.searchParams.set('state', state)
        return url.toString()
      } catch {
        const separator = authorizationUrl.includes('?') ? '&' : '?'
        return `${authorizationUrl}${separator}state=${encodeURIComponent(state)}`
      }
    }

    return authorizationUrl
  },

  connectGoogleDrive: (code: string) =>
    apiFetch<{ message: string }>('/api/auth/google-drive/auth/', {
      method: 'POST',
      body: JSON.stringify({ code }),
    }, true),

  disconnectGoogleDrive: () =>
    apiFetch<{ message: string }>('/api/auth/google-drive/disconnect/', {
      method: 'POST',
    }, true),

  getGoogleDriveStatus: () =>
    apiFetch<{ connected: boolean }>('/api/auth/google-drive/status/', {}, true),
}

/**
 * Parties API - Complete implementation
 */
export const partiesApi = {
  list: (params?: { 
    page?: number; 
    page_size?: number; 
    search?: string; 
    status?: string; 
    visibility?: string;
    host?: string;
    is_public?: boolean;
  }) => {
    const queryString = params ? '?' + new URLSearchParams(
      Object.entries(params)
        .filter(([, value]) => value !== undefined && value !== null)
        .map(([key, value]) => [key, String(value)])
    ).toString() : ''
    return apiFetch<PaginatedResponse<WatchParty>>(`/api/parties/${queryString}`, {}, true)
  },

  create: (data: { 
    title: string; 
    description?: string; 
    visibility?: string; 
    max_participants?: number;
    video_id?: string;
    scheduled_start?: string;
  }) =>
    apiFetch<WatchParty>('/parties', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getById: (id: string) =>
    apiFetch<WatchParty>(`/api/parties/${id}/`, {}, true),

  update: (id: string, data: Partial<WatchParty>) =>
    apiFetch<WatchParty>(`/api/parties/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }, true),

  delete: (id: string) =>
    apiFetch<void>(`/api/parties/${id}/`, {
      method: 'DELETE',
    }, true),

  join: (id: string) =>
    apiFetch<{ message: string }>(`/api/parties/${id}/join/`, {
      method: 'POST',
    }, true),

  leave: (id: string) =>
    apiFetch<{ message: string }>(`/api/parties/${id}/leave/`, {
      method: 'POST',
    }, true),

  getParticipants: (id: string) =>
    apiFetch<User[]>(`/api/parties/${id}/participants/`, {}, true),

  generateInvite: (id: string) =>
    apiFetch<{ invite_code: string }>(`/api/parties/${id}/generate-invite/`, {
      method: 'POST',
    }, true),

  joinByCode: (code: string) =>
    apiFetch<{ party: WatchParty }>('/api/parties/join-by-code/', {
      method: 'POST',
      body: JSON.stringify({ code }),
    }, true),

  control: (id: string, action: { type: 'play' | 'pause' | 'seek'; timestamp?: number }) =>
    apiFetch<{ message: string }>(`/api/parties/${id}/control/`, {
      method: 'POST',
      body: JSON.stringify(action),
    }, true),

  getSyncState: (id: string) =>
    apiFetch<{ playing: boolean; current_time: number; last_update: string }>(`/api/parties/${id}/sync_state/`, {}, true),

  selectGDriveMovie: (id: string, fileId: string) =>
    apiFetch<{ message: string }>(`/api/parties/${id}/select_gdrive_movie/`, {
      method: 'POST',
      body: JSON.stringify({ file_id: fileId }),
    }, true),

  start: (id: string) =>
    apiFetch<{ message: string }>(`/api/parties/${id}/start/`, {
      method: 'POST',
    }, true),

  react: (id: string, reaction: string) =>
    apiFetch<{ message: string }>(`/api/parties/${id}/react/`, {
      method: 'POST',
      body: JSON.stringify({ reaction }),
    }, true),

  // Party discovery
  getPublic: (params?: { page?: number; page_size?: number }) =>
    apiFetch<PaginatedResponse<WatchParty>>('/api/parties/public/' + (params ? '?' + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString() : ''), {}, true),

  getRecent: (params?: { page?: number; page_size?: number }) =>
    apiFetch<PaginatedResponse<WatchParty>>('/api/parties/recent/' + (params ? '?' + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString() : ''), {}, true),

  getTrending: async () => {
    const response = await apiFetch<StandardResponse<WatchParty[] | {
      trending_parties?: WatchParty[]
    }>>('/api/parties/trending/', {}, true)

    if (Array.isArray(response.data)) {
      return response.data
    }

    if (response.data && Array.isArray(response.data.trending_parties)) {
      return response.data.trending_parties
    }

    return []
  },

  getRecommendations: async () => {
    const response = await apiFetch<StandardResponse<WatchParty[] | {
      recommended_parties?: WatchParty[]
    }>>('/api/parties/recommendations/', {}, true)

    if (Array.isArray(response.data)) {
      return response.data
    }

    if (response.data && Array.isArray(response.data.recommended_parties)) {
      return response.data.recommended_parties
    }

    return []
  },

  search: (query: string, filters?: any) =>
    apiFetch<PaginatedResponse<WatchParty>>('/api/parties/search/?' + new URLSearchParams({ q: query, ...filters }).toString(), {}, true),

  // Party analytics
  getAnalytics: (id: string) =>
    apiFetch<any>(`/api/parties/${id}/analytics/`, {}, true),

  updateAnalytics: (id: string, data: any) =>
    apiFetch<{ message: string }>(`/api/parties/${id}/update-analytics/`, {
      method: 'POST',
      body: JSON.stringify(data),
    }, true),
}

/**
 * Chat API - Complete implementation
 */
export const chatApi = {
  getMessages: (partyId: string, params?: { page?: number; page_size?: number; search?: string }) =>
    apiFetch<PaginatedResponse<ChatMessage>>(`/api/chat/${partyId}/messages/` + (params ? '?' + new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])).toString() : ''), {}, true),

  sendMessage: (partyId: string, content: string) =>
    apiFetch<ChatMessage>(`/api/chat/${partyId}/messages/send/`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }, true),

  getActiveUsers: (roomId: string) =>
    apiFetch<User[]>(`/api/chat/${roomId}/active-users/`, {}, true),

  joinRoom: (roomId: string) =>
    apiFetch<{ message: string }>(`/api/chat/${roomId}/join/`, {
      method: 'POST',
    }, true),

  leaveRoom: (roomId: string) =>
    apiFetch<{ message: string }>(`/api/chat/${roomId}/leave/`, {
      method: 'POST',
    }, true),

  banUser: (roomId: string, userId: string, reason?: string) =>
    apiFetch<{ message: string }>(`/api/chat/${roomId}/ban/`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, reason }),
    }, true),

  unbanUser: (roomId: string, userId: string) =>
    apiFetch<{ message: string }>(`/api/chat/${roomId}/unban/`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    }, true),

  moderate: (roomId: string, action: any) =>
    apiFetch<{ message: string }>(`/api/chat/${roomId}/moderate/`, {
      method: 'POST',
      body: JSON.stringify(action),
    }, true),

  getSettings: (roomId: string) =>
    apiFetch<any>(`/api/chat/${roomId}/settings/`, {}, true),

  updateSettings: (roomId: string, settings: any) =>
    apiFetch<any>(`/api/chat/${roomId}/settings/`, {
      method: 'PUT',
      body: JSON.stringify(settings),
    }, true),

  getStats: (roomId: string) =>
    apiFetch<any>(`/api/chat/${roomId}/stats/`, {}, true),

  getModerationLog: (roomId: string, params?: { page?: number; page_size?: number }) =>
    apiFetch<PaginatedResponse<any>>(`/api/chat/${roomId}/moderation-log/` + (params ? '?' + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString() : ''), {}, true),

  getHistory: (partyId: string, params?: { page?: number; page_size?: number }) =>
    apiFetch<PaginatedResponse<ChatMessage>>(`/api/chat/history/${partyId}/` + (params ? '?' + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString() : ''), {}, true),

  // Missing methods for ModerationPanel
  getBannedUsers: (partyId: string) =>
    apiFetch<User[]>(`/api/chat/${partyId}/banned-users/`, {}, true),

  getModerationHistory: (partyId: string) =>
    apiFetch<any[]>(`/api/chat/${partyId}/moderation-history/`, {}, true),

  kickUser: (partyId: string, userId: string, reason?: string) =>
    apiFetch<{ message: string }>(`/api/chat/${partyId}/kick/`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, reason }),
    }, true),

  clearChat: (partyId: string) =>
    apiFetch<{ message: string }>(`/api/chat/${partyId}/clear/`, {
      method: 'POST',
    }, true),

  // Missing method for EmojiPicker
  getCustomEmojis: () =>
    apiFetch<ChatEmoji[]>('/api/chat/emojis/', {}, true),
}

/**
 * Videos API - Complete implementation
 */
export const videosApi = {
  list: (params?: { 
    page?: number; 
    page_size?: number; 
    search?: string;
    source_type?: string;
    visibility?: string;
  }) => {
    const queryString = params ? '?' + new URLSearchParams(
      Object.entries(params)
        .filter(([, value]) => value !== undefined && value !== null)
        .map(([key, value]) => [key, String(value)])
    ).toString() : ''
    return apiFetch<PaginatedResponse<VideoSummary>>(`/api/videos/${queryString}`, {}, true)
  },

  create: (data: FormData | { 
    title: string; 
    description?: string; 
    source_type?: string; 
    source_url?: string; 
    visibility?: string;
  }) => {
    if (data instanceof FormData) {
      return apiFetch<VideoSummary>('/api/videos/', {
        method: 'POST',
        body: data,
        headers: {}, // Let browser set content-type for FormData
      }, true)
    } else {
      return apiFetch<VideoSummary>('/api/videos/', {
        method: 'POST',
        body: JSON.stringify(data),
      }, true)
    }
  },

  getById: (id: string) =>
    apiFetch<VideoSummary>(`/api/videos/${id}/`, {}, true),

  update: (id: string, data: Partial<VideoSummary>) =>
    apiFetch<VideoSummary>(`/api/videos/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }, true),

  delete: (id: string) =>
    apiFetch<void>(`/api/videos/${id}/`, {
      method: 'DELETE',
    }, true),

  getStreamUrl: (id: string) =>
    apiFetch<{ stream_url: string }>(`/api/videos/${id}/stream/`, {}, true),

  download: (id: string) =>
    apiFetch<{ download_url: string }>(`/api/videos/${id}/download/`, {}, true),

  like: (id: string) =>
    apiFetch<{ message: string }>(`/api/videos/${id}/like/`, {
      method: 'POST',
    }, true),

  share: (id: string, platform: string) =>
    apiFetch<{ share_url: string }>(`/api/videos/${id}/share/`, {
      method: 'POST',
      body: JSON.stringify({ platform }),
    }, true),

  getComments: (id: string, params?: { page?: number; page_size?: number }) =>
    apiFetch<PaginatedResponse<any>>(`/api/videos/${id}/comments/` + (params ? '?' + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString() : ''), {}, true),

  addComment: (id: string, content: string) =>
    apiFetch<any>(`/api/videos/${id}/comments/`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }, true),

  getAnalytics: (id: string) =>
    apiFetch<any>(`/api/videos/${id}/analytics/`, {}, true),

  getProcessingStatus: (id: string) =>
    apiFetch<{ status: string; progress: number }>(`/api/videos/${id}/processing-status/`, {}, true),

  getQualityVariants: (id: string) =>
    apiFetch<{ variants: string[] }>(`/api/videos/${id}/quality-variants/`, {}, true),

  regenerateThumbnail: (id: string) =>
    apiFetch<{ message: string }>(`/api/videos/${id}/regenerate-thumbnail/`, {
      method: 'POST',
    }, true),

  search: (query: string, filters?: any) =>
    apiFetch<PaginatedResponse<VideoSummary>>('/api/videos/search/?' + new URLSearchParams({ q: query, ...filters }).toString(), {}, true),

  validateUrl: (url: string) =>
    apiFetch<{ valid: boolean; metadata?: any }>('/api/videos/validate-url/', {
      method: 'POST',
      body: JSON.stringify({ url }),
    }, true),

  // Google Drive videos
  getGDriveVideos: (params?: { page?: number; page_size?: number }) =>
    apiFetch<PaginatedResponse<any>>('/api/videos/gdrive/' + (params ? '?' + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString() : ''), {}, true),

  uploadFromGDrive: (fileId: string) =>
    apiFetch<VideoSummary>('/api/videos/gdrive/upload/', {
      method: 'POST',
      body: JSON.stringify({ file_id: fileId }),
    }, true),

  getGDriveStream: (id: string) =>
    apiFetch<{ stream_url: string }>(`/api/videos/gdrive/${id}/stream/`, {}, true),

  deleteGDriveVideo: (id: string) =>
    apiFetch<void>(`/api/videos/gdrive/${id}/delete/`, {
      method: 'DELETE',
    }, true),
}

/**
 * Dashboard API
 */
export const dashboardApi = {
  getStats: (): Promise<DashboardStatsResponse> => 
    apiFetch<DashboardStatsResponse>("/api/analytics/dashboard/", {}, true),
  
  getActivities: () => 
    apiFetch<PaginatedResponse<any>>('/api/dashboard/activities/', {}, true),
}

/**
 * User/Profile API - Complete implementation  
 */
export const userApi = {
  getProfile: (): Promise<User> => 
    apiFetch<User>("/api/auth/profile/", {}, true),

  updateProfile: (data: Partial<User>): Promise<User> =>
    apiFetch<User>("/api/auth/profile/", {
      method: "PATCH",
      body: JSON.stringify(data),
    }, true),

  getUserProfile: (userId: string) =>
    apiFetch<User>(`/api/users/${userId}/profile/`, {}, true),

  getPublicProfile: (userId: string) =>
    apiFetch<User>(`/api/users/${userId}/public-profile/`, {}, true),

  search: (query: string) =>
    apiFetch<PaginatedResponse<User>>('/api/users/search/?' + new URLSearchParams({ q: query }).toString(), {}, true),

  // Friends system
  getFriends: () =>
    apiFetch<PaginatedResponse<User>>('/api/users/friends/', {}, true),

  getFriendRequests: () =>
    apiFetch<PaginatedResponse<any>>('/api/users/friends/requests/', {}, true),

  sendFriendRequest: (userId: string) =>
    apiFetch<{ message: string }>('/api/users/friends/request/', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    }, true),

  acceptFriendRequest: (requestId: string) =>
    apiFetch<{ message: string }>(`/api/users/friends/${requestId}/accept/`, {
      method: 'POST',
    }, true),

  declineFriendRequest: (requestId: string) =>
    apiFetch<{ message: string }>(`/api/users/friends/${requestId}/decline/`, {
      method: 'POST',
    }, true),

  removeFriend: (username: string) =>
    apiFetch<void>(`/api/users/friends/${username}/remove/`, {
      method: 'DELETE',
    }, true),

  getFriendSuggestions: () =>
    apiFetch<PaginatedResponse<User>>('/api/users/friends/suggestions/', {}, true),

  getMutualFriends: (userId: string) =>
    apiFetch<PaginatedResponse<User>>(`/api/users/${userId}/mutual-friends/`, {}, true),

  // User settings and preferences
  getSettings: () =>
    apiFetch<any>('/api/users/settings/', {}, true),

  updateSettings: (settings: any) =>
    apiFetch<any>('/api/users/settings/', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }, true),

  getNotificationSettings: () =>
    apiFetch<any>('/api/users/notifications/settings/', {}, true),

  updateNotificationSettings: (settings: any) =>
    apiFetch<any>('/api/users/notifications/settings/', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }, true),

  getPrivacySettings: () =>
    apiFetch<any>('/api/users/privacy/settings/', {}, true),

  updatePrivacySettings: (settings: any) =>
    apiFetch<any>('/api/users/privacy/settings/', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }, true),

  // User activity and stats
  getActivity: () =>
    apiFetch<PaginatedResponse<any>>('/api/users/activity/', {}, true),

  getStats: () =>
    apiFetch<any>('/api/users/stats/', {}, true),

  getDashboardStats: () =>
    apiFetch<Analytics>('/api/users/dashboard/stats/', {}, true),

  getWatchHistory: () =>
    apiFetch<PaginatedResponse<any>>('/api/users/watch-history/', {}, true),

  // User notifications
  getNotifications: (params?: { page?: number; page_size?: number }) =>
    apiFetch<PaginatedResponse<Notification>>('/api/users/notifications/' + (params ? '?' + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString() : ''), {}, true),

  markNotificationAsRead: (notificationId: string) =>
    apiFetch<{ message: string }>(`/api/users/notifications/${notificationId}/read/`, {
      method: 'POST',
    }, true),

  markAllNotificationsAsRead: () =>
    apiFetch<{ message: string }>('/api/users/notifications/mark-all-read/', {
      method: 'POST',
    }, true),

  // User blocking
  blockUser: (userId: string) =>
    apiFetch<{ message: string }>(`/api/users/${userId}/block/`, {
      method: 'POST',
    }, true),

  unblockUser: (userId: string) =>
    apiFetch<{ message: string }>('/api/users/unblock/', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    }, true),

  // User favorites
  getFavorites: () =>
    apiFetch<PaginatedResponse<any>>('/api/users/favorites/', {}, true),

  addFavorite: (itemId: string, itemType: string) =>
    apiFetch<{ message: string }>('/api/users/favorites/add/', {
      method: 'POST',
      body: JSON.stringify({ item_id: itemId, item_type: itemType }),
    }, true),

  removeFavorite: (favoriteId: string) =>
    apiFetch<{ message: string }>(`/api/users/favorites/${favoriteId}/remove/`, {
      method: 'POST',
    }, true),

  // User achievements
  getAchievements: () =>
    apiFetch<PaginatedResponse<any>>('/api/users/achievements/', {}, true),

  getInventory: () =>
    apiFetch<PaginatedResponse<any>>('/api/users/inventory/', {}, true),

  // Account management
  changePassword: (data: { old_password: string; new_password: string }) =>
    apiFetch<{ message: string }>('/api/users/password/', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true),

  uploadAvatar: (file: File) => {
    const formData = new FormData()
    formData.append('avatar', file)
    return apiFetch<{ avatar_url: string }>('/api/users/avatar/upload/', {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set content-type
    }, true)
  },

  exportData: () =>
    apiFetch<{ download_url: string }>('/api/users/export-data/', {}, true),

  deleteAccount: (password: string) =>
    apiFetch<{ message: string }>('/api/users/delete-account/', {
      method: 'POST',
      body: JSON.stringify({ password }),
    }, true),

  getOnlineStatus: () =>
    apiFetch<{ online: boolean; last_seen?: string }>('/api/users/online-status/', {}, true),

  // User reports
  reportUser: (data: { user_id: string; report_type: string; reason: string }) =>
    apiFetch<{ message: string }>('/api/users/report/', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true),
}

/**
 * Analytics API - Complete implementation
 */
export const analyticsApi = {
  getUserStats: (): Promise<Record<string, unknown>> => 
    apiFetch<Record<string, unknown>>("/api/analytics/user-stats/", {}, true),

  getPartyStats: (partyId: string): Promise<Record<string, unknown>> => 
    apiFetch<Record<string, unknown>>(`/api/analytics/party-stats/${partyId}/`, {}, true),

  getDashboard: () =>
    apiFetch<any>('/api/analytics/dashboard/', {}, true),

  exportData: (params: any) =>
    apiFetch<{ download_url: string }>('/api/analytics/export/', {
      method: 'POST',
      body: JSON.stringify(params),
    }, true),

  getPersonal: () =>
    apiFetch<any>('/api/analytics/personal/', {}, true),

  getRealTime: async (): Promise<NormalizedRealTimeAnalytics> => {
    const response = await apiFetch<
      StandardApiResponse<RealTimeAnalyticsResponse> | RealTimeAnalyticsResponse
    >('/api/analytics/real-time/', {}, true)

    const payload: RealTimeAnalyticsResponse =
      response && typeof response === 'object' && 'success' in response
        ? (response.data ?? {})
        : (response as RealTimeAnalyticsResponse)

    const engagement = payload.engagement ?? {}
    const systemHealth = payload.system_health ?? {}

    const normalized: NormalizedRealTimeAnalytics = {
      timestamp: payload.timestamp ?? new Date().toISOString(),
      onlineUsers: payload.online_users ?? 0,
      activeParties: payload.active_parties ?? 0,
      recentActivity: (payload.recent_activity ?? []).map((activity) => ({
        eventType: activity?.event_type ?? 'unknown',
        count: activity?.count ?? 0,
      })),
      engagement: {
        concurrentViewers: engagement.concurrent_viewers ?? 0,
        messagesPerMinute: engagement.messages_per_minute ?? 0,
        reactionsPerMinute: engagement.reactions_per_minute ?? 0,
      },
      systemHealth: {
        systemLoad: systemHealth.system_load ?? systemHealth.cpu_usage ?? 0,
        cpuUsage: systemHealth.cpu_usage ?? 0,
        memoryUsage: systemHealth.memory_usage ?? 0,
        diskUsage: systemHealth.disk_usage ?? 0,
        networkTraffic: systemHealth.network_traffic ?? 0,
      },
    }

    return normalized
  },

  getPlatformOverview: () =>
    apiFetch<any>('/api/analytics/platform-overview/', {}, true),

  getRetention: () =>
    apiFetch<any>('/api/analytics/retention/', {}, true),

  getUserBehavior: () =>
    apiFetch<any>('/api/analytics/user-behavior/', {}, true),

  getRevenue: () =>
    apiFetch<any>('/api/analytics/revenue/', {}, true),

  trackEvent: (event: any) =>
    apiFetch<any>('/api/analytics/track/', {
      method: 'POST',
      body: JSON.stringify(event),
    }, true),
}

/**
 * Admin API - Complete implementation
 */
export const adminApi = {
  // System stats and health
  getSystemStats: (): Promise<SystemStats> =>
    apiFetch<SystemStats>('/api/admin/system/stats/', {}, true),

  getServerHealth: (): Promise<ServerHealth> =>
    apiFetch<ServerHealth>('/api/admin/system/health/', {}, true),

  // User management
  getUsers: (params?: any) =>
    apiFetch<PaginatedResponse<User>>('/api/admin/users/', { 
      method: 'GET',
      ...(params && { body: JSON.stringify(params) })
    }, true),

  banUser: (userId: string, reason: string) =>
    apiFetch<{ message: string }>(`/api/admin/users/${userId}/ban/`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }, true),

  unbanUser: (userId: string) =>
    apiFetch<{ message: string }>(`/api/admin/users/${userId}/unban/`, {
      method: 'POST',
    }, true),

  verifyUser: (userId: string) =>
    apiFetch<{ message: string }>(`/api/admin/users/${userId}/verify/`, {
      method: 'POST',
    }, true),

  // Content moderation
  getVideos: (params?: any) =>
    apiFetch<PaginatedResponse<VideoSummary>>('/api/admin/videos/', { 
      method: 'GET',
      ...(params && { body: JSON.stringify(params) })
    }, true),

  moderateVideo: (videoId: string, action: "approve" | "reject", reason?: string) =>
    apiFetch<{ message: string }>(`/api/admin/videos/${videoId}/moderate/`, {
      method: 'POST',
      body: JSON.stringify({ action, reason }),
    }, true),

  // System operations
  restartService: (service: string) =>
    apiFetch<{ message: string }>('/api/admin/system/restart/', {
      method: 'POST',
      body: JSON.stringify({ service }),
    }, true),

  clearCache: () =>
    apiFetch<{ message: string }>('/api/admin/system/clear-cache/', {
      method: 'POST',
    }, true),
}

// Admin types
export interface SystemStats {
  total_users: number
  new_users_today: number
  active_parties: number
  parties_today: number
  total_videos: number
  videos_today: number
  uptime: string
  cpu_usage: number
  memory_usage: number
  storage_usage: number
  active_connections: number
}

export interface ServerHealth {
  overall_status: "healthy" | "warning" | "critical"
  services: Array<{
    name: string
    status: "healthy" | "warning" | "critical"
    response_time: number
  }>
}

export interface ModerationAction {
  id: string
  action_type: "ban" | "kick" | "unban" | "warn"
  target_user?: User
  moderator?: User
  reason: string
  timestamp: string
}

export interface ChatEmoji {
  id: string
  name: string
  image_url: string
  created_by?: User
}



/**
 * Billing API - Complete implementation
 */
export const billingApi = {
  // Subscription management
  getPlans: () =>
    apiFetch<any>('/api/billing/plans/', {}, true),

  getCurrentSubscription: () =>
    apiFetch<any>('/api/billing/subscription/', {}, true),

  subscribe: (planId: string) =>
    apiFetch<any>('/api/billing/subscribe/', {
      method: 'POST',
      body: JSON.stringify({ plan_id: planId }),
    }, true),

  cancelSubscription: () =>
    apiFetch<any>('/api/billing/cancel/', {
      method: 'POST',
    }, true),

  reactivateSubscription: () =>
    apiFetch<any>('/api/billing/reactivate/', {
      method: 'POST',
    }, true),

  // Payment methods
  updatePaymentMethod: () =>
    apiFetch<any>('/api/billing/update-payment-method/', {
      method: 'POST',
    }, true),

  // Billing history
  getBillingHistory: () =>
    apiFetch<any>('/api/billing/history/', {}, true),

  downloadInvoice: (invoiceId: string) =>
    apiFetch<any>(`/api/billing/invoice/${invoiceId}/download/`, {}, true),
}

/**
 * Store API - Complete implementation
 */
export const storeApi = {
  // Store items
  getItems: (_params?: any) =>
    apiFetch<any>('/api/store/items/', {}, true),

  purchaseItem: (itemId: string) =>
    apiFetch<any>('/api/store/purchase/', {
      method: 'POST',
      body: JSON.stringify({ item_id: itemId }),
    }, true),

  // Purchase history
  getPurchases: () =>
    apiFetch<any>('/api/store/purchases/', {}, true),
}

/**
 * Notifications API - dedicated helper for dashboard notification flows
 */
export const notificationsApi = {
  list: (params?: Record<string, string | number | boolean>) => {
    const queryString = params ? '?' + new URLSearchParams(
      Object.entries(params)
        .filter(([, value]) => value !== undefined && value !== null)
        .map(([key, value]) => [key, String(value)])
    ).toString() : ''

    return apiFetch<PaginatedResponse<Notification>>(`/api/notifications/${queryString}`, {}, true)
  },

  markAsRead: (notificationId: string) =>
    apiFetch<Notification>(`/api/notifications/${notificationId}/`, {
      method: 'PATCH',
      body: JSON.stringify({ is_read: true }),
    }, true),

  markAllAsRead: () =>
    apiFetch<{ message: string }>(`/api/notifications/mark-all-read/`, {
      method: 'POST',
    }, true),

  delete: (notificationId: string) =>
    apiFetch<{ message: string }>(`/api/notifications/${notificationId}/`, {
      method: 'DELETE',
    }, true),

  getSettings: () =>
    apiFetch<Record<string, boolean>>('/api/notifications/settings/', {}, true),

  updateSettings: (settings: Record<string, boolean>) =>
    apiFetch<{ message?: string }>('/api/notifications/settings/', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }, true),

  sendTestNotification: (data: { type: string; title: string; message: string }) =>
    apiFetch<{ message: string }>('/api/notifications/test/', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true),
}

/**
 * Interactive API - Complete implementation
 */
export const interactiveApi = {
  // Polls
  getPolls: (partyId: string) =>
    apiFetch<any>(`/api/parties/${partyId}/polls/`, {}, true),

  createPoll: (partyId: string, data: any) =>
    apiFetch<any>(`/api/parties/${partyId}/polls/`, {
      method: 'POST',
      body: JSON.stringify(data),
    }, true),

  deletePoll: (partyId: string, pollId: string) =>
    apiFetch<any>(`/api/parties/${partyId}/polls/${pollId}/`, {
      method: 'DELETE',
    }, true),

  vote: (partyId: string, pollId: string, optionId: string) =>
    apiFetch<any>(`/api/parties/${partyId}/polls/${pollId}/vote/`, {
      method: 'POST',
      body: JSON.stringify({ option_id: optionId }),
    }, true),

  // Reactions
  getReactions: (partyId: string) =>
    apiFetch<any>(`/api/parties/${partyId}/reactions/`, {}, true),

  addReaction: (partyId: string, emoji: string) =>
    apiFetch<any>(`/api/parties/${partyId}/reactions/`, {
      method: 'POST',
      body: JSON.stringify({ emoji }),
    }, true),

  clearReactions: (partyId: string) =>
    apiFetch<any>(`/api/parties/${partyId}/reactions/`, {
      method: 'DELETE',
    }, true),

  // Sync Controls
  getSyncState: (partyId: string) =>
    apiFetch<any>(`/api/parties/${partyId}/sync/`, {}, true),

  updateSyncState: (partyId: string, data: any) =>
    apiFetch<any>(`/api/parties/${partyId}/sync/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }, true),

  // Games
  getCurrentGame: (partyId: string) =>
    apiFetch<any>(`/api/parties/${partyId}/games/current/`, {}, true),

  startGame: (partyId: string, gameType: string) =>
    apiFetch<any>(`/api/parties/${partyId}/games/`, {
      method: 'POST',
      body: JSON.stringify({ game_type: gameType }),
    }, true),

  endGame: (partyId: string, gameId: string) =>
    apiFetch<any>(`/api/parties/${partyId}/games/${gameId}/`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active: false }),
    }, true),

  joinGame: (partyId: string, gameId: string) =>
    apiFetch<any>(`/api/parties/${partyId}/games/${gameId}/join/`, {
      method: 'POST',
    }, true),

  leaveGame: (partyId: string, gameId: string) =>
    apiFetch<any>(`/api/parties/${partyId}/games/${gameId}/leave/`, {
      method: 'POST',
    }, true),

  submitAnswer: (partyId: string, gameId: string, answer: string) =>
    apiFetch<any>(`/api/parties/${partyId}/games/${gameId}/answer/`, {
      method: 'POST',
      body: JSON.stringify({ answer }),
    }, true),
}

/**
 * Search API - Complete implementation
 */
export const searchApi = {
  // Global search
  search: (params: any) => {
    const queryString = new URLSearchParams(
      Object.entries(params)
        .filter(([, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => [key, String(value)])
    ).toString()
    return apiFetch<any>(`/api/search/?${queryString}`, {}, true)
  },

  // Search suggestions
  getSuggestions: (query: string, scope?: string) => {
    const params = new URLSearchParams({ q: query })
    if (scope) params.append('scope', scope)
    return apiFetch<any>(`/api/search/suggestions/?${params.toString()}`, {}, true)
  },

  // Advanced search
  advancedSearch: (searchData: any) =>
    apiFetch<any>('/api/search/advanced/', {
      method: 'POST',
      body: JSON.stringify(searchData),
    }, true),

  // Search by type
  searchParties: (params: any) => {
    const queryString = new URLSearchParams(
      Object.entries({ ...params, type: 'parties' })
        .filter(([, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => [key, String(value)])
    ).toString()
    return apiFetch<any>(`/api/search/?${queryString}`, {}, true)
  },

  searchUsers: (params: any) => {
    const queryString = new URLSearchParams(
      Object.entries({ ...params, type: 'users' })
        .filter(([, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => [key, String(value)])
    ).toString()
    return apiFetch<any>(`/api/search/?${queryString}`, {}, true)
  },

  searchVideos: (params: any) => {
    const queryString = new URLSearchParams(
      Object.entries({ ...params, type: 'videos' })
        .filter(([, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => [key, String(value)])
    ).toString()
    return apiFetch<any>(`/api/search/?${queryString}`, {}, true)
  },

  // Save search
  saveSearch: (searchQuery: string) =>
    apiFetch<any>('/api/search/save/', {
      method: 'POST',
      body: JSON.stringify({ query: searchQuery }),
    }, true),

  // Get saved searches
  getSavedSearches: () =>
    apiFetch<any>('/api/search/saved/', {}, true),

  // Delete saved search
  deleteSavedSearch: (searchId: string) =>
    apiFetch<any>(`/api/search/saved/${searchId}/`, {
      method: 'DELETE',
    }, true),
}

/**
 * Support API - Complete implementation
 */
export const supportApi = {
  // Support Tickets
  getTickets: () =>
    apiFetch<any>('/api/support/tickets/', {}, true),

  createTicket: (ticketData: any) =>
    apiFetch<any>('/api/support/tickets/', {
      method: 'POST',
      body: JSON.stringify(ticketData),
    }, true),

  getTicket: (ticketId: string) =>
    apiFetch<any>(`/api/support/tickets/${ticketId}/`, {}, true),

  updateTicket: (ticketId: string, updates: any) =>
    apiFetch<any>(`/api/support/tickets/${ticketId}/`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }, true),

  addTicketMessage: (ticketId: string, message: any) =>
    apiFetch<any>(`/api/support/tickets/${ticketId}/messages/`, {
      method: 'POST',
      body: JSON.stringify(message),
    }, true),

  // FAQ
  getFAQs: (params?: any) => {
    const queryString = params ? '?' + new URLSearchParams(
      Object.entries(params)
        .filter(([, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => [key, String(value)])
    ).toString() : ''
    return apiFetch<any>(`/api/support/faq/${queryString}`, {}, true)
  },

  getFAQCategories: () =>
    apiFetch<any>('/api/support/faq/categories/', {}, true),

  viewFAQ: (faqId: string) =>
    apiFetch<any>(`/api/support/faq/${faqId}/view/`, {
      method: 'POST',
    }, true),

  voteFAQ: (faqId: string, vote: 'helpful' | 'unhelpful') =>
    apiFetch<any>(`/api/support/faq/${faqId}/vote/`, {
      method: 'POST',
      body: JSON.stringify({ vote }),
    }, true),

  // Documentation
  getDocs: (params?: any) => {
    const queryString = params ? '?' + new URLSearchParams(
      Object.entries(params)
        .filter(([, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => [key, String(value)])
    ).toString() : ''
    return apiFetch<any>(`/api/support/docs/${queryString}`, {}, true)
  },

  getDocsCategories: () =>
    apiFetch<any>('/api/support/docs/categories/', {}, true),

  viewDoc: (docId: string) =>
    apiFetch<any>(`/api/support/docs/${docId}/view/`, {
      method: 'POST',
    }, true),

  markDocHelpful: (docId: string, helpful: boolean) =>
    apiFetch<any>(`/api/support/docs/${docId}/helpful/`, {
      method: 'POST',
      body: JSON.stringify({ helpful }),
    }, true),

  search: (query: string) => {
    const queryString = query ? '?' + new URLSearchParams({ q: query }).toString() : ''
    return apiFetch<any>(`/api/support/search/${queryString}`, {}, true)
  },

  // Feedback
  getFeedback: (params?: Record<string, string | number | boolean | null | undefined>) => {
    const queryString = params ? '?' + new URLSearchParams(
      Object.entries(params)
        .filter(([, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => [key, String(value)])
    ).toString() : ''
    return apiFetch<any>(`/api/support/feedback/${queryString}`, {}, true)
  },

  submitFeedback: (feedbackData: { title: string; description: string; feedback_type: string }) =>
    apiFetch<any>('/api/support/feedback/', {
      method: 'POST',
      body: JSON.stringify(feedbackData),
    }, true),

  voteFeedback: (feedbackId: string, vote: 'up' | 'down') =>
    apiFetch<any>(`/api/support/feedback/${feedbackId}/vote/`, {
      method: 'POST',
      body: JSON.stringify({ vote }),
    }, true),

  // Community
  getCommunityPosts: (params?: any) => {
    const queryString = params ? '?' + new URLSearchParams(
      Object.entries(params)
        .filter(([, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => [key, String(value)])
    ).toString() : ''
    return apiFetch<any>(`/api/support/community/${queryString}`, {}, true)
  },

  createCommunityPost: (postData: any) =>
    apiFetch<any>('/api/support/community/', {
      method: 'POST',
      body: JSON.stringify(postData),
    }, true),

  viewCommunityPost: (postId: string) =>
    apiFetch<any>(`/api/support/community/${postId}/view/`, {
      method: 'POST',
    }, true),

  voteCommunityPost: (postId: string, vote: 'up' | 'down') =>
    apiFetch<any>(`/api/support/community/${postId}/vote/`, {
      method: 'POST',
      body: JSON.stringify({ vote }),
    }, true),

  getCommunityReplies: (postId: string) =>
    apiFetch<any>(`/api/support/community/${postId}/replies/`, {}, true),

  createCommunityReply: (postId: string, replyData: any) =>
    apiFetch<any>(`/api/support/community/${postId}/replies/`, {
      method: 'POST',
      body: JSON.stringify(replyData),
    }, true),

  voteCommunityReply: (replyId: string, vote: 'up' | 'down') =>
    apiFetch<any>(`/api/support/community/replies/${replyId}/vote/`, {
      method: 'POST',
      body: JSON.stringify({ vote }),
    }, true),

  markReplySolution: (replyId: string) =>
    apiFetch<any>(`/api/support/community/replies/${replyId}/solution/`, {
      method: 'POST',
    }, true),
}

// Export all API modules
const apiClient = {
  auth: authApi,
  dashboard: dashboardApi,
  parties: partiesApi,
  videos: videosApi,
  user: userApi,
  analytics: analyticsApi,
  notifications: notificationsApi,
  chat: chatApi,
  admin: adminApi,
  billing: billingApi,
  store: storeApi,
  interactive: interactiveApi,
  search: searchApi,
  support: supportApi,
  
  // Generic HTTP methods for backward compatibility
  get: <T = any>(url: string, options?: { params?: any }) => {
    const queryString = options?.params ? '?' + new URLSearchParams(
      Object.entries(options.params)
        .filter(([, value]) => value !== undefined && value !== null)
        .map(([key, value]) => [key, String(value)])
    ).toString() : ''
    return apiFetch<T>(`${url}${queryString}`, {}, true)
  },
  
  post: <T = any>(url: string, data?: any) =>
    apiFetch<T>(url, {
      method: 'POST',
      ...(data && { body: JSON.stringify(data) })
    }, true),
    
  put: <T = any>(url: string, data?: any) =>
    apiFetch<T>(url, {
      method: 'PUT',
      ...(data && { body: JSON.stringify(data) })
    }, true),
    
  patch: <T = any>(url: string, data?: any) =>
    apiFetch<T>(url, {
      method: 'PATCH',
      ...(data && { body: JSON.stringify(data) })
    }, true),
    
  delete: <T = any>(url: string) =>
    apiFetch<T>(url, { method: 'DELETE' }, true),
}

export default apiClient
export const api = apiClient

// Export individual modules for convenience
export { authApi as auth, partiesApi as parties, videosApi as videos, userApi as users, chatApi as chat, adminApi as admin, billingApi as billing, storeApi as store, notificationsApi as notifications, interactiveApi as interactive, searchApi as search, supportApi as support, analyticsApi as analytics }

// Export types for convenience  
export type Video = VideoSummary
export type Party = WatchParty
