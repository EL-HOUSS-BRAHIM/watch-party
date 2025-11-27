/**
 * Comprehensive API Client for Watch Party Platform
 * This client covers ALL backend endpoints from the API schema
 * Handles authentication, error handling, and type safety
 * 
 * Auth endpoints use frontend API routes for cookie management
 * All other endpoints go directly to the backend
 */

// Get backend URL from environment variable
const getBackendUrl = () => {
  const url = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://be-watch-party.brahim-elhouss.me'
  return url.replace(/\/+$/, "") // Remove trailing slashes
}

const BACKEND_URL = getBackendUrl()

// Detect VS Code Simple Browser
const isVSCodeBrowser = typeof navigator !== 'undefined' && 
  (navigator.userAgent.includes('vscode') || navigator.userAgent.includes('VSCode'))

const buildUrl = (endpoint: string) => {
  // If endpoint is already a full URL, return it as-is
  if (/^https?:\/\//i.test(endpoint)) {
    return endpoint
  }

  // Ensure endpoint starts with /
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  
  // ALL /api/ requests go to the backend URL directly
  // This ensures proper routing to the Django backend
  if (normalizedEndpoint.startsWith('/api/')) {
    return `${BACKEND_URL}${normalizedEndpoint}`
  }
  
  // Non-API endpoints (if any) go to backend directly
  return `${BACKEND_URL}${normalizedEndpoint}`
}

// Core Types (matching the API schema)
export interface User {
  id: string
  username: string
  email: string
  first_name?: string
  last_name?: string
  full_name?: string
  avatar?: string
  is_verified?: boolean
  is_premium?: boolean
  is_staff?: boolean
  is_active?: boolean
  is_online?: boolean
  last_seen?: string
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
  room_code?: string // Unique room code for sharing
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
  is_host?: boolean // Whether current user is the host
  settings?: {
    max_members?: number
    is_public?: boolean
    allow_guest_chat?: boolean
    video_sync_enabled?: boolean
    reactions_enabled?: boolean
    polls_enabled?: boolean
    games_enabled?: boolean
  }
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
  content: string
  message: string
  template_type: string
  type: string
  status: string
  is_read: boolean
  created_at: string
  read_at?: string | null
  action_url?: string
  action_text?: string
  icon?: string
  color?: string
  priority?: string
  requires_action?: boolean
  metadata?: Record<string, any>
  data?: Record<string, any>
  html_content?: string
  expires_at?: string | null
  time_since_created?: string
  [key: string]: unknown
}

const normalizeNotification = (notification: any): Notification => {
  if (!notification || typeof notification !== "object") {
    return {
      id: "",
      title: "",
      content: "",
      message: "",
      template_type: "system",
      type: "system",
      status: "delivered",
      is_read: false,
      created_at: new Date().toISOString(),
    }
  }

  const raw = notification as Record<string, any>
  const content = raw.content ?? raw.message ?? raw.body ?? ""
  const templateType = raw.template_type ?? raw.type ?? raw.notification_type ?? "system"
  const status = raw.status ?? (raw.is_read ? "read" : "delivered")
  const isRead = typeof raw.is_read === "boolean" ? raw.is_read : status === "read"
  const metadata = raw.metadata ?? raw.data

  return {
    ...raw,
    id: raw.id ?? "",
    title: raw.title ?? "",
    created_at: raw.created_at ?? new Date().toISOString(),
    content,
    message: content,
    template_type: templateType,
    type: templateType,
    status,
    is_read: isRead,
    metadata: metadata ?? undefined,
    data: raw.data ?? raw.metadata ?? undefined,
  }
}

const normalizeNotificationPayload = <T>(payload: T): any => {
  if (!payload) {
    return payload
  }

  if (Array.isArray(payload)) {
    return payload.map(normalizeNotification)
  }

  if (typeof payload === "object") {
    const typedPayload = payload as Record<string, any>

    if (Array.isArray(typedPayload.results)) {
      return {
        ...typedPayload,
        results: typedPayload.results.map(normalizeNotification),
      }
    }

    if (typedPayload.notification) {
      return {
        ...typedPayload,
        notification: normalizeNotification(typedPayload.notification),
      }
    }

    return normalizeNotification(typedPayload)
  }

  return payload
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
 * Helper function to get cookie value by name
 */
function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined
  
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift()
  }
  
  return undefined
}

/**
 * Generic fetch wrapper with comprehensive error handling
 * Makes direct requests to the Django backend
 */
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = buildUrl(endpoint)
  
  // Get access token from cookie
  const accessToken = getCookie('access_token')
  
  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
  }
  
  // Add Authorization header if we have an access token
  if (accessToken) {
    defaultHeaders['Authorization'] = `Bearer ${accessToken}`
  }

  const config: RequestInit = {
    credentials: 'include', // Important: Include cookies for authentication
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

      // Backend can return error in 'message', 'error', or 'detail' fields
      const errorMessage = errorData.message || (errorData as any).error || (errorData as any).detail || `API request failed: ${response.statusText}`
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

    const responseText = await response.text()

    if (!responseText) {
      return undefined as T
    }

    try {
      return JSON.parse(responseText) as T
    } catch (_parseError) {
      return responseText as unknown as T
    }
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
    apiFetch<{ success: boolean; user?: User; message?: string; error?: string }>('/api/auth/login/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  register: (data: { first_name: string; last_name: string; email: string; password: string; confirm_password: string }) =>
    apiFetch<{ user: User; access_token: string; refresh_token: string; success: boolean; message: string }>('/api/auth/register/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  logout: () =>
    apiFetch<{ success: boolean; message?: string }>('/api/auth/logout/', {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  refreshToken: (_refresh?: string) =>
    apiFetch<{ access?: string; access_token?: string; refresh?: string; refresh_token?: string; success?: boolean; message?: string; error?: string }>(
      '/api/auth/refresh/',
      {
        method: 'POST',
        body: JSON.stringify({}),
      }
    ),

  forgotPassword: (email: string) =>
    apiFetch<{ message: string }>('/api/auth/forgot-password/', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (data: { token: string; password: string }) =>
    apiFetch<{ message: string }>('/api/auth/reset-password/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  verifyEmail: (token: string) =>
    apiFetch<{ message: string }>('/api/auth/verify-email/', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }),

  resendVerification: (data: { email: string }) =>
    apiFetch<{ message: string }>('/api/auth/resend-verification/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getProfile: () =>
    apiFetch<User>('/api/auth/profile/', {}),

  updateProfile: (data: Partial<User>) =>
    apiFetch<User>('/api/auth/profile/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  changePassword: (data: { old_password: string; new_password: string }) =>
    apiFetch<{ message: string }>('/api/auth/change-password/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 2FA endpoints
  setup2FA: () =>
    apiFetch<{ qr_code: string; secret: string }>('/api/auth/2fa/setup/', {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  verify2FA: (token: string) =>
    apiFetch<{ message: string }>('/api/auth/2fa/verify/', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }),

  disable2FA: (token: string) =>
    apiFetch<{ message: string }>('/api/auth/2fa/disable/', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }),

  // Social auth
  googleAuth: (access_token: string) =>
    apiFetch<{ access: string; refresh: string; user: User }>('/api/auth/social/google/', {
      method: 'POST',
      body: JSON.stringify({ access_token }),
    }),

  githubAuth: (access_token: string) =>
    apiFetch<{ access: string; refresh: string; user: User }>('/api/auth/social/github/', {
      method: 'POST',
      body: JSON.stringify({ access_token }),
    }),

  // Google Drive integration
  getGoogleDriveAuthUrl: async () => {
    const response = await apiFetch<{ data: { authorization_url: string; state?: string } }>(
      '/api/auth/google-drive/auth/',
      {})

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
    }),

  disconnectGoogleDrive: () =>
    apiFetch<{ message: string }>('/api/auth/google-drive/disconnect/', {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  getGoogleDriveStatus: () =>
    apiFetch<{ connected: boolean }>('/api/auth/google-drive/status/', {}),
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
    return apiFetch<PaginatedResponse<WatchParty>>(`/api/parties/${queryString}`, {})
  },

  create: (data: { 
    title: string; 
    description?: string; 
    visibility?: string; 
    max_participants?: number;
    video_id?: string;
    scheduled_start?: string;
  }) =>
    apiFetch<WatchParty>('/api/parties/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getById: (id: string) =>
    apiFetch<WatchParty>(`/api/parties/${id}/`, {}),

  update: (id: string, data: Partial<WatchParty>) =>
    apiFetch<WatchParty>(`/api/parties/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch<void>(`/api/parties/${id}/`, {
      method: 'DELETE',
    }),

  join: (id: string) =>
    apiFetch<{ message: string }>(`/api/parties/${id}/join/`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  leave: (id: string) =>
    apiFetch<{ message: string }>(`/api/parties/${id}/leave/`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  getParticipants: (id: string) =>
    apiFetch<User[]>(`/api/parties/${id}/participants/`, {}),

  generateInvite: (id: string) =>
    apiFetch<{ invite_code: string }>(`/api/parties/${id}/generate-invite/`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  joinByCode: (code: string) =>
    apiFetch<{ party: WatchParty }>('/api/parties/join-by-code/', {
      method: 'POST',
      body: JSON.stringify({ code }),
    }),

  control: (id: string, action: { type: 'play' | 'pause' | 'seek'; timestamp?: number }) =>
    apiFetch<{ message: string }>(`/api/parties/${id}/control/`, {
      method: 'POST',
      body: JSON.stringify(action),
    }),

  getSyncState: (id: string) =>
    apiFetch<{ playing: boolean; current_time: number; last_update: string }>(`/api/parties/${id}/sync_state/`, {}),

  selectGDriveMovie: (id: string, fileId: string) =>
    apiFetch<{ message: string }>(`/api/parties/${id}/select_gdrive_movie/`, {
      method: 'POST',
      body: JSON.stringify({ file_id: fileId }),
    }),

  start: (id: string) =>
    apiFetch<{ message: string }>(`/api/parties/${id}/start/`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  react: (id: string, reaction: string) =>
    apiFetch<{ message: string }>(`/api/parties/${id}/react/`, {
      method: 'POST',
      body: JSON.stringify({ reaction }),
    }),

  // Party discovery
  getPublic: (params?: { page?: number; page_size?: number }) =>
    apiFetch<PaginatedResponse<WatchParty>>('/api/parties/public/' + (params ? '?' + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString() : ''), {}),

  getRecent: (params?: { page?: number; page_size?: number }) =>
    apiFetch<PaginatedResponse<WatchParty>>('/api/parties/recent/' + (params ? '?' + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString() : ''), {}),

  getTrending: async () => {
    const response = await apiFetch<StandardResponse<WatchParty[] | {
      trending_parties?: WatchParty[]
    }>>('/api/parties/trending/', {})

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
    }>>('/api/parties/recommendations/', {})

    if (Array.isArray(response.data)) {
      return response.data
    }

    if (response.data && Array.isArray(response.data.recommended_parties)) {
      return response.data.recommended_parties
    }

    return []
  },

  search: (query: string, filters?: any) =>
    apiFetch<PaginatedResponse<WatchParty>>('/api/parties/search/?' + new URLSearchParams({ q: query, ...filters }).toString(), {}),

  // Party analytics
  getAnalytics: (id: string) =>
    apiFetch<any>(`/api/parties/${id}/analytics/`, {}),

  updateAnalytics: (id: string, data: any) =>
    apiFetch<{ message: string }>(`/api/parties/${id}/update-analytics/`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}

/**
 * Chat API - Complete implementation
 */
export const chatApi = {
  getMessages: (partyId: string, params?: { page?: number; page_size?: number; search?: string }) =>
    apiFetch<PaginatedResponse<ChatMessage>>(`/api/chat/${partyId}/messages/` + (params ? '?' + new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])).toString() : ''), {}),

  sendMessage: (partyId: string, content: string) =>
    apiFetch<ChatMessage>(`/api/chat/${partyId}/messages/send/`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  getActiveUsers: (roomId: string) =>
    apiFetch<User[]>(`/api/chat/${roomId}/active-users/`, {}),

  joinRoom: (roomId: string) =>
    apiFetch<{ message: string }>(`/api/chat/${roomId}/join/`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  leaveRoom: (roomId: string) =>
    apiFetch<{ message: string }>(`/api/chat/${roomId}/leave/`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  banUser: (roomId: string, userId: string, reason?: string) =>
    apiFetch<{ message: string }>(`/api/chat/${roomId}/ban/`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, reason }),
    }),

  unbanUser: (roomId: string, userId: string) =>
    apiFetch<{ message: string }>(`/api/chat/${roomId}/unban/`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    }),

  moderate: (roomId: string, action: any) =>
    apiFetch<{ message: string }>(`/api/chat/${roomId}/moderate/`, {
      method: 'POST',
      body: JSON.stringify(action),
    }),

  getSettings: (roomId: string) =>
    apiFetch<any>(`/api/chat/${roomId}/settings/`, {}),

  updateSettings: (roomId: string, settings: any) =>
    apiFetch<any>(`/api/chat/${roomId}/settings/`, {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),

  getStats: (roomId: string) =>
    apiFetch<any>(`/api/chat/${roomId}/stats/`, {}),

  getModerationLog: (roomId: string, params?: { page?: number; page_size?: number }) =>
    apiFetch<PaginatedResponse<any>>(`/api/chat/${roomId}/moderation-log/` + (params ? '?' + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString() : ''), {}),

  getHistory: (partyId: string, params?: { page?: number; page_size?: number }) =>
    apiFetch<PaginatedResponse<ChatMessage>>(`/api/chat/history/${partyId}/` + (params ? '?' + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString() : ''), {}),

  // Missing methods for ModerationPanel
  getBannedUsers: (partyId: string) =>
    apiFetch<User[]>(`/api/chat/${partyId}/banned-users/`, {}),

  getModerationHistory: (partyId: string) =>
    apiFetch<any[]>(`/api/chat/${partyId}/moderation-history/`, {}),

  kickUser: (partyId: string, userId: string, reason?: string) =>
    apiFetch<{ message: string }>(`/api/chat/${partyId}/kick/`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, reason }),
    }),

  clearChat: (partyId: string) =>
    apiFetch<{ message: string }>(`/api/chat/${partyId}/clear/`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  // Missing method for EmojiPicker
  getCustomEmojis: () =>
    apiFetch<ChatEmoji[]>('/api/chat/emojis/', {}),
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
    return apiFetch<PaginatedResponse<VideoSummary>>(`/api/videos/${queryString}`, {})
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
      })
    } else {
      return apiFetch<VideoSummary>('/api/videos/', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    }
  },

  getById: (id: string) =>
    apiFetch<VideoSummary>(`/api/videos/${id}/`, {}),

  update: (id: string, data: Partial<VideoSummary>) =>
    apiFetch<VideoSummary>(`/api/videos/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch<void>(`/api/videos/${id}/`, {
      method: 'DELETE',
    }),

  getStreamUrl: (id: string) =>
    apiFetch<{ stream_url: string }>(`/api/videos/${id}/stream/`, {}),

  download: (id: string) =>
    apiFetch<{ download_url: string }>(`/api/videos/${id}/download/`, {}),

  like: (id: string) =>
    apiFetch<{ message: string }>(`/api/videos/${id}/like/`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  share: (id: string, platform: string) =>
    apiFetch<{ share_url: string }>(`/api/videos/${id}/share/`, {
      method: 'POST',
      body: JSON.stringify({ platform }),
    }),

  getComments: (id: string, params?: { page?: number; page_size?: number }) =>
    apiFetch<PaginatedResponse<any>>(`/api/videos/${id}/comments/` + (params ? '?' + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString() : ''), {}),

  addComment: (id: string, content: string) =>
    apiFetch<any>(`/api/videos/${id}/comments/`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  getAnalytics: (id: string) =>
    apiFetch<any>(`/api/videos/${id}/analytics/`, {}),

  getProcessingStatus: (id: string) =>
    apiFetch<{ status: string; progress: number }>(`/api/videos/${id}/processing-status/`, {}),

  getQualityVariants: (id: string) =>
    apiFetch<{ variants: string[] }>(`/api/videos/${id}/quality-variants/`, {}),

  regenerateThumbnail: (id: string) =>
    apiFetch<{ message: string }>(`/api/videos/${id}/regenerate-thumbnail/`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  search: (query: string, filters?: any) =>
    apiFetch<PaginatedResponse<VideoSummary>>('/api/videos/search/?' + new URLSearchParams({ q: query, ...filters }).toString(), {}),

  validateUrl: (url: string) =>
    apiFetch<{ valid: boolean; metadata?: any }>('/api/videos/validate-url/', {
      method: 'POST',
      body: JSON.stringify({ url }),
    }),

  // Google Drive videos
  getGDriveVideos: (params?: { page?: number; page_size?: number }) =>
    apiFetch<PaginatedResponse<any>>('/api/videos/gdrive/' + (params ? '?' + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString() : ''), {}),

  uploadFromGDrive: (fileId: string) =>
    apiFetch<VideoSummary>('/api/videos/gdrive/upload/', {
      method: 'POST',
      body: JSON.stringify({ file_id: fileId }),
    }),

  getGDriveStream: (id: string) =>
    apiFetch<{ stream_url: string }>(`/api/videos/gdrive/${id}/stream/`, {}),

  deleteGDriveVideo: (id: string) =>
    apiFetch<void>(`/api/videos/gdrive/${id}/delete/`, {
      method: 'DELETE',
    }),
}

/**
 * Dashboard API
 */
export const dashboardApi = {
  getStats: (): Promise<DashboardStatsResponse> => 
    apiFetch<DashboardStatsResponse>("/api/analytics/dashboard/", {}),
  
  getActivities: () => 
    apiFetch<PaginatedResponse<any>>('/api/dashboard/activities/', {}),
}

/**
 * User/Profile API - Complete implementation  
 */
export const userApi = {
  getProfile: (): Promise<User> => 
    apiFetch<User>("/api/auth/profile/", {}),

  updateProfile: (data: Partial<User>): Promise<User> =>
    apiFetch<User>("/api/auth/profile/", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  getUserProfile: (userId: string) =>
    apiFetch<User>(`/api/users/${userId}/profile/`, {}),

  getPublicProfile: (userId: string) =>
    apiFetch<User>(`/api/users/${userId}/public-profile/`, {}),

  search: (query: string) =>
    apiFetch<PaginatedResponse<User>>('/api/users/search/?' + new URLSearchParams({ q: query }).toString(), {}),

  // Friends system
  getFriends: () =>
    apiFetch<PaginatedResponse<User>>('/api/users/friends/', {}),

  getFriendRequests: () =>
    apiFetch<PaginatedResponse<any>>('/api/users/friends/requests/', {}),

  sendFriendRequest: (userId: string) =>
    apiFetch<{ message: string }>('/api/users/friends/request/', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    }),

  acceptFriendRequest: (requestId: string) =>
    apiFetch<{ message: string }>(`/api/users/friends/${requestId}/accept/`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  declineFriendRequest: (requestId: string) =>
    apiFetch<{ message: string }>(`/api/users/friends/${requestId}/decline/`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  removeFriend: (username: string) =>
    apiFetch<void>(`/api/users/friends/${username}/remove/`, {
      method: 'DELETE',
    }),

  getFriendSuggestions: () =>
    apiFetch<PaginatedResponse<User>>('/api/users/friends/suggestions/', {}),

  getMutualFriends: (userId: string) =>
    apiFetch<PaginatedResponse<User>>(`/api/users/${userId}/mutual-friends/`, {}),

  // User settings and preferences
  getSettings: () =>
    apiFetch<any>('/api/users/settings/', {}),

  updateSettings: (settings: any) =>
    apiFetch<any>('/api/users/settings/', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),

  getNotificationSettings: () =>
    apiFetch<any>('/api/users/notifications/settings/', {}),

  updateNotificationSettings: (settings: any) =>
    apiFetch<any>('/api/users/notifications/settings/', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),

  getPrivacySettings: () =>
    apiFetch<any>('/api/users/privacy/settings/', {}),

  updatePrivacySettings: (settings: any) =>
    apiFetch<any>('/api/users/privacy/settings/', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),

  // User activity and stats
  getActivity: () =>
    apiFetch<PaginatedResponse<any>>('/api/users/activity/', {}),

  getStats: () =>
    apiFetch<any>('/api/users/stats/', {}),

  getDashboardStats: () =>
    apiFetch<Analytics>('/api/users/dashboard/stats/', {}),

  getWatchHistory: () =>
    apiFetch<PaginatedResponse<any>>('/api/users/watch-history/', {}),

  // User notifications
  getNotifications: (params?: { page?: number; page_size?: number }) =>
    apiFetch<any>('/api/users/notifications/' + (params ? '?' + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString() : ''), {}).then(normalizeNotificationPayload),

  markNotificationAsRead: (notificationId: string) =>
    apiFetch<void>(`/api/notifications/${notificationId}/mark-read/`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  markAllNotificationsAsRead: () =>
    apiFetch<void>('/api/notifications/mark-all-read/', {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  // User blocking
  blockUser: (userId: string) =>
    apiFetch<{ message: string }>(`/api/users/${userId}/block/`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  unblockUser: (userId: string) =>
    apiFetch<{ message: string }>('/api/users/unblock/', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    }),

  // User favorites
  getFavorites: () =>
    apiFetch<PaginatedResponse<any>>('/api/users/favorites/', {}),

  addFavorite: (itemId: string, itemType: string) =>
    apiFetch<{ message: string }>('/api/users/favorites/add/', {
      method: 'POST',
      body: JSON.stringify({ item_id: itemId, item_type: itemType }),
    }),

  removeFavorite: (favoriteId: string) =>
    apiFetch<{ message: string }>(`/api/users/favorites/${favoriteId}/remove/`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  // User achievements
  getAchievements: () =>
    apiFetch<PaginatedResponse<any>>('/api/users/achievements/', {}),

  getInventory: () =>
    apiFetch<PaginatedResponse<any>>('/api/users/inventory/', {}),

  // Account management
  changePassword: (data: { old_password: string; new_password: string }) =>
    apiFetch<{ message: string }>('/api/users/password/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  uploadAvatar: (file: File) => {
    const formData = new FormData()
    formData.append('avatar', file)
    return apiFetch<{ avatar_url: string }>('/api/users/avatar/upload/', {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set content-type
    })
  },

  exportData: () =>
    apiFetch<{ download_url: string }>('/api/users/export-data/', {}),

  deleteAccount: (password: string) =>
    apiFetch<{ message: string }>('/api/users/delete-account/', {
      method: 'POST',
      body: JSON.stringify({ password }),
    }),

  getOnlineStatus: () =>
    apiFetch<{ online: boolean; last_seen?: string }>('/api/users/online-status/', {}),

  // User reports
  reportUser: (data: { user_id: string; report_type: string; reason: string }) =>
    apiFetch<{ message: string }>('/api/users/report/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}

/**
 * Analytics API - Complete implementation
 */
export const analyticsApi = {
  getUserStats: (): Promise<Record<string, unknown>> => 
    apiFetch<Record<string, unknown>>("/api/analytics/user-stats/", {}),

  getPartyStats: (partyId: string): Promise<Record<string, unknown>> => 
    apiFetch<Record<string, unknown>>(`/api/analytics/party-stats/${partyId}/`, {}),

  getDashboard: () =>
    apiFetch<any>('/api/analytics/dashboard/', {}),

  exportData: (params: any) =>
    apiFetch<{ download_url: string }>('/api/analytics/export/', {
      method: 'POST',
      body: JSON.stringify(params),
    }),

  getPersonal: () =>
    apiFetch<any>('/api/analytics/personal/', {}),

  getRealTime: async (): Promise<NormalizedRealTimeAnalytics> => {
    const response = await apiFetch<
      StandardApiResponse<RealTimeAnalyticsResponse> | RealTimeAnalyticsResponse
    >('/api/analytics/real-time/', {})

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
    apiFetch<any>('/api/analytics/platform-overview/', {}),

  getRetention: () =>
    apiFetch<any>('/api/analytics/retention/', {}),

  getUserBehavior: () =>
    apiFetch<any>('/api/analytics/user-behavior/', {}),

  getRevenue: () =>
    apiFetch<any>('/api/analytics/revenue/', {}),

  trackEvent: (event: any) =>
    apiFetch<any>('/api/analytics/track/', {
      method: 'POST',
      body: JSON.stringify(event),
    }),
}

/**
 * Admin API - Complete implementation
 */
const appendQueryParams = (endpoint: string, params?: Record<string, any>) => {
  if (!params || Object.keys(params).length === 0) {
    return endpoint
  }

  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return
    }

    if (Array.isArray(value)) {
      value.forEach((item) => searchParams.append(key, String(item)))
      return
    }

    searchParams.append(key, String(value))
  })

  const queryString = searchParams.toString()
  if (!queryString) {
    return endpoint
  }

  return `${endpoint}${endpoint.includes('?') ? '&' : '?'}${queryString}`
}

export const adminApi = {
  // System stats and health
  getSystemStats: (): Promise<SystemStats> =>
    apiFetch<SystemStats>('/api/admin/system/stats/', {}),

  getServerHealth: (): Promise<ServerHealth> =>
    apiFetch<ServerHealth>('/api/admin/system/health/', {}),

  // User management
  getUsers: (params?: Record<string, any>) => {
    const endpoint = appendQueryParams('/api/admin/users/', params)

    return apiFetch<PaginatedResponse<User>>(endpoint, {
      method: 'GET',
    })
  },

  banUser: (userId: string, reason: string) =>
    apiFetch<{ message: string }>(`/api/admin/users/${userId}/ban/`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  unbanUser: (userId: string) =>
    apiFetch<{ message: string }>(`/api/admin/users/${userId}/unban/`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  verifyUser: (userId: string) =>
    apiFetch<{ message: string }>(`/api/admin/users/${userId}/verify/`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  // Content moderation
  getVideos: (params?: Record<string, any>) => {
    const endpoint = appendQueryParams('/api/admin/videos/', params)

    return apiFetch<PaginatedResponse<VideoSummary>>(endpoint, {
      method: 'GET',
    })
  },

  moderateVideo: (videoId: string, action: "approve" | "reject", reason?: string) =>
    apiFetch<{ message: string }>(`/api/admin/videos/${videoId}/moderate/`, {
      method: 'POST',
      body: JSON.stringify({ action, reason }),
    }),

  // System operations
  restartService: (service: string) =>
    apiFetch<{ message: string }>('/api/admin/system/restart/', {
      method: 'POST',
      body: JSON.stringify({ service }),
    }),

  clearCache: () =>
    apiFetch<{ message: string }>('/api/admin/system/clear-cache/', {
      method: 'POST',
      body: JSON.stringify({}),
    }),
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
    apiFetch<any>('/api/billing/plans/', {}),

  getCurrentSubscription: () =>
    apiFetch<any>('/api/billing/subscription/', {}),

  subscribe: (planId: string) =>
    apiFetch<any>('/api/billing/subscribe/', {
      method: 'POST',
      body: JSON.stringify({ plan_id: planId }),
    }),

  cancelSubscription: () =>
    apiFetch<any>('/api/billing/cancel/', {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  reactivateSubscription: () =>
    apiFetch<any>('/api/billing/reactivate/', {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  // Payment methods
  updatePaymentMethod: () =>
    apiFetch<any>('/api/billing/update-payment-method/', {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  // Billing history
  getBillingHistory: () =>
    apiFetch<any>('/api/billing/history/', {}),

  downloadInvoice: (invoiceId: string) =>
    apiFetch<any>(`/api/billing/invoice/${invoiceId}/download/`, {}),
}

/**
 * Store API - Complete implementation
 */
export const storeApi = {
  // Store items
  getItems: (_params?: any) =>
    apiFetch<any>('/api/store/items/', {}),

  purchaseItem: (itemId: string) =>
    apiFetch<any>('/api/store/purchase/', {
      method: 'POST',
      body: JSON.stringify({ item_id: itemId }),
    }),

  // Purchase history
  getPurchases: () =>
    apiFetch<any>('/api/store/purchases/', {}),
}

/**
 * Notifications API - dedicated helper for dashboard notification flows
 */
export const notificationsApi = {
  list: (params?: Record<string, string | number | boolean>) => {
    const queryString = params
      ? '?' + new URLSearchParams(
        Object.entries(params)
          .filter(([, value]) => value !== undefined && value !== null)
          .map(([key, value]) => [key, String(value)])
      ).toString()
      : ''

    return apiFetch<any>(`/api/notifications/${queryString}`, {}).then(normalizeNotificationPayload)
  },

  getUnreadCount: () =>
    apiFetch<{ count: number }>('/api/notifications/unread-count/', {}),

  markAsRead: (notificationId: string) =>
    apiFetch<void>(`/api/notifications/${notificationId}/mark-read/`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  markAllAsRead: () =>
    apiFetch<void>(`/api/notifications/mark-all-read/`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  dismiss: (notificationId: string) =>
    apiFetch<void>(`/api/notifications/${notificationId}/`, {
      method: 'DELETE',
    }),

  delete: (notificationId: string) => notificationsApi.dismiss(notificationId),

  getSettings: () =>
    apiFetch<Record<string, boolean>>('/api/notifications/settings/', {}),

  updateSettings: (settings: Record<string, boolean>) =>
    apiFetch<{ message?: string }>('/api/notifications/settings/', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),

  sendTestNotification: (data: { type: string; title: string; message: string }) =>
    apiFetch<{ message: string }>('/api/notifications/test/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}

/**
 * Interactive API - Complete implementation
 */
export const interactiveApi = {
  // Polls
  getPolls: (partyId: string) =>
    apiFetch<any>(`/api/parties/${partyId}/polls/`, {}),

  createPoll: (partyId: string, data: any) =>
    apiFetch<any>(`/api/parties/${partyId}/polls/`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deletePoll: (partyId: string, pollId: string) =>
    apiFetch<any>(`/api/parties/${partyId}/polls/${pollId}/`, {
      method: 'DELETE',
    }),

  vote: (partyId: string, pollId: string, optionId: string) =>
    apiFetch<any>(`/api/parties/${partyId}/polls/${pollId}/vote/`, {
      method: 'POST',
      body: JSON.stringify({ option_id: optionId }),
    }),

  // Reactions
  getReactions: (partyId: string) =>
    apiFetch<any>(`/api/parties/${partyId}/reactions/`, {}),

  addReaction: (partyId: string, emoji: string) =>
    apiFetch<any>(`/api/parties/${partyId}/reactions/`, {
      method: 'POST',
      body: JSON.stringify({ emoji }),
    }),

  clearReactions: (partyId: string) =>
    apiFetch<any>(`/api/parties/${partyId}/reactions/`, {
      method: 'DELETE',
    }),

  // Sync Controls
  getSyncState: (partyId: string) =>
    apiFetch<any>(`/api/parties/${partyId}/sync/`, {}),

  updateSyncState: (partyId: string, data: any) =>
    apiFetch<any>(`/api/parties/${partyId}/sync/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // Games
  getCurrentGame: (partyId: string) =>
    apiFetch<any>(`/api/parties/${partyId}/games/current/`, {}),

  startGame: (partyId: string, gameType: string) =>
    apiFetch<any>(`/api/parties/${partyId}/games/`, {
      method: 'POST',
      body: JSON.stringify({ game_type: gameType }),
    }),

  endGame: (partyId: string, gameId: string) =>
    apiFetch<any>(`/api/parties/${partyId}/games/${gameId}/`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active: false }),
    }),

  joinGame: (partyId: string, gameId: string) =>
    apiFetch<any>(`/api/parties/${partyId}/games/${gameId}/join/`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  leaveGame: (partyId: string, gameId: string) =>
    apiFetch<any>(`/api/parties/${partyId}/games/${gameId}/leave/`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  submitAnswer: (partyId: string, gameId: string, answer: string) =>
    apiFetch<any>(`/api/parties/${partyId}/games/${gameId}/answer/`, {
      method: 'POST',
      body: JSON.stringify({ answer }),
    }),
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
    return apiFetch<any>(`/api/search/?${queryString}`, {})
  },

  // Search suggestions
  getSuggestions: (query: string, scope?: string) => {
    const params = new URLSearchParams({ q: query })
    if (scope) params.append('scope', scope)
    return apiFetch<any>(`/api/search/suggestions/?${params.toString()}`, {})
  },

  // Advanced search
  advancedSearch: (searchData: any) =>
    apiFetch<any>('/api/search/advanced/', {
      method: 'POST',
      body: JSON.stringify(searchData),
    }),

  // Search by type
  searchParties: (params: any) => {
    const queryString = new URLSearchParams(
      Object.entries({ ...params, type: 'parties' })
        .filter(([, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => [key, String(value)])
    ).toString()
    return apiFetch<any>(`/api/search/?${queryString}`, {})
  },

  searchUsers: (params: any) => {
    const queryString = new URLSearchParams(
      Object.entries({ ...params, type: 'users' })
        .filter(([, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => [key, String(value)])
    ).toString()
    return apiFetch<any>(`/api/search/?${queryString}`, {})
  },

  searchVideos: (params: any) => {
    const queryString = new URLSearchParams(
      Object.entries({ ...params, type: 'videos' })
        .filter(([, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => [key, String(value)])
    ).toString()
    return apiFetch<any>(`/api/search/?${queryString}`, {})
  },

  // Save search
  saveSearch: (searchQuery: string) =>
    apiFetch<any>('/api/search/save/', {
      method: 'POST',
      body: JSON.stringify({ query: searchQuery }),
    }),

  // Get saved searches
  getSavedSearches: () =>
    apiFetch<any>('/api/search/saved/', {}),

  // Delete saved search
  deleteSavedSearch: (searchId: string) =>
    apiFetch<any>(`/api/search/saved/${searchId}/`, {
      method: 'DELETE',
    }),
}

/**
 * Support API - Complete implementation
 */
export const supportApi = {
  // Support Tickets
  getTickets: () =>
    apiFetch<any>('/api/support/tickets/', {}),

  createTicket: (ticketData: any) =>
    apiFetch<any>('/api/support/tickets/', {
      method: 'POST',
      body: JSON.stringify(ticketData),
    }),

  getTicket: (ticketId: string) =>
    apiFetch<any>(`/api/support/tickets/${ticketId}/`, {}),

  updateTicket: (ticketId: string, updates: any) =>
    apiFetch<any>(`/api/support/tickets/${ticketId}/`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),

  addTicketMessage: (ticketId: string, message: any) =>
    apiFetch<any>(`/api/support/tickets/${ticketId}/messages/`, {
      method: 'POST',
      body: JSON.stringify(message),
    }),

  // FAQ
  getFAQs: (params?: any) => {
    const queryString = params ? '?' + new URLSearchParams(
      Object.entries(params)
        .filter(([, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => [key, String(value)])
    ).toString() : ''
    return apiFetch<any>(`/api/support/faq/${queryString}`, {})
  },

  getFAQCategories: () =>
    apiFetch<any>('/api/support/faq/categories/', {}),

  viewFAQ: (faqId: string) =>
    apiFetch<any>(`/api/support/faq/${faqId}/view/`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  voteFAQ: (faqId: string, vote: 'helpful' | 'unhelpful') =>
    apiFetch<any>(`/api/support/faq/${faqId}/vote/`, {
      method: 'POST',
      body: JSON.stringify({ vote }),
    }),

  // Documentation
  getDocs: (params?: any) => {
    const queryString = params ? '?' + new URLSearchParams(
      Object.entries(params)
        .filter(([, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => [key, String(value)])
    ).toString() : ''
    return apiFetch<any>(`/api/support/docs/${queryString}`, {})
  },

  getDocsCategories: () =>
    apiFetch<any>('/api/support/docs/categories/', {}),

  viewDoc: (docId: string) =>
    apiFetch<any>(`/api/support/docs/${docId}/view/`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  markDocHelpful: (docId: string, helpful: boolean) =>
    apiFetch<any>(`/api/support/docs/${docId}/helpful/`, {
      method: 'POST',
      body: JSON.stringify({ helpful }),
    }),

  search: (query: string) => {
    const queryString = query ? '?' + new URLSearchParams({ q: query }).toString() : ''
    return apiFetch<any>(`/api/support/search/${queryString}`, {})
  },

  // Feedback
  getFeedback: (params?: Record<string, string | number | boolean | null | undefined>) => {
    const queryString = params ? '?' + new URLSearchParams(
      Object.entries(params)
        .filter(([, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => [key, String(value)])
    ).toString() : ''
    return apiFetch<any>(`/api/support/feedback/${queryString}`, {})
  },

  submitFeedback: (feedbackData: { title: string; description: string; feedback_type: string }) =>
    apiFetch<any>('/api/support/feedback/', {
      method: 'POST',
      body: JSON.stringify(feedbackData),
    }),

  voteFeedback: (feedbackId: string, vote: 'up' | 'down') =>
    apiFetch<any>(`/api/support/feedback/${feedbackId}/vote/`, {
      method: 'POST',
      body: JSON.stringify({ vote }),
    }),

  // Community
  getCommunityPosts: (params?: any) => {
    const queryString = params ? '?' + new URLSearchParams(
      Object.entries(params)
        .filter(([, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => [key, String(value)])
    ).toString() : ''
    return apiFetch<any>(`/api/support/community/${queryString}`, {})
  },

  createCommunityPost: (postData: any) =>
    apiFetch<any>('/api/support/community/', {
      method: 'POST',
      body: JSON.stringify(postData),
    }),

  viewCommunityPost: (postId: string) =>
    apiFetch<any>(`/api/support/community/${postId}/view/`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  voteCommunityPost: (postId: string, vote: 'up' | 'down') =>
    apiFetch<any>(`/api/support/community/${postId}/vote/`, {
      method: 'POST',
      body: JSON.stringify({ vote }),
    }),

  getCommunityReplies: (postId: string) =>
    apiFetch<any>(`/api/support/community/${postId}/replies/`, {}),

  createCommunityReply: (postId: string, replyData: any) =>
    apiFetch<any>(`/api/support/community/${postId}/replies/`, {
      method: 'POST',
      body: JSON.stringify(replyData),
    }),

  voteCommunityReply: (replyId: string, vote: 'up' | 'down') =>
    apiFetch<any>(`/api/support/community/replies/${replyId}/vote/`, {
      method: 'POST',
      body: JSON.stringify({ vote }),
    }),

  markReplySolution: (replyId: string) =>
    apiFetch<any>(`/api/support/community/replies/${replyId}/solution/`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),
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
    return apiFetch<T>(`${url}${queryString}`, {})
  },
  
  post: <T = any>(url: string, data?: any) =>
    apiFetch<T>(url, {
      method: 'POST',
      ...(data && { body: JSON.stringify(data) })
    }),
    
  put: <T = any>(url: string, data?: any) =>
    apiFetch<T>(url, {
      method: 'PUT',
      ...(data && { body: JSON.stringify(data) })
    }),
    
  patch: <T = any>(url: string, data?: any) =>
    apiFetch<T>(url, {
      method: 'PATCH',
      ...(data && { body: JSON.stringify(data) })
    }),
    
  delete: <T = any>(url: string) =>
    apiFetch<T>(url, { method: 'DELETE' }),
}

export default apiClient
export const api = apiClient

// Export individual modules for convenience
export { authApi as auth, partiesApi as parties, videosApi as videos, userApi as users, chatApi as chat, adminApi as admin, billingApi as billing, storeApi as store, notificationsApi as notifications, interactiveApi as interactive, searchApi as search, supportApi as support, analyticsApi as analytics }

// Export types for convenience  
export type Video = VideoSummary
export type Party = WatchParty
