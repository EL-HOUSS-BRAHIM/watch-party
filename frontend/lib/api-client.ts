/**
 * Comprehensive API Client for Watch Party Platform
 * This client covers ALL backend endpoints from the API schema
 * Handles authentication, error handling, and type safety
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://be-watch-party.brahim-elhouss.me"
const FRONTEND_API_BASE = process.env.NEXT_PUBLIC_FRONTEND_API || '/api'

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
  const url = `${baseUrl}${endpoint}`
  
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
      const errorData: APIError = await response.json().catch(() => ({
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
 * Authentication API
 */
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    apiFetch<{ access: string; refresh: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  register: (data: { username: string; email: string; password: string }) =>
    apiFetch<{ user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  logout: () =>
    apiFetch<{ message: string }>('/v2/auth/logout/', {
      method: 'POST',
    }, true),

  refreshToken: (refresh: string) =>
    apiFetch<{ access: string }>('/v2/auth/refresh/', {
      method: 'POST',
      body: JSON.stringify({ refresh }),
    }, true),

  forgotPassword: (email: string) =>
    apiFetch<{ message: string }>('/v2/auth/forgot-password/', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }, true),

  resetPassword: (data: { token: string; password: string }) =>
    apiFetch<{ message: string }>('/v2/auth/reset-password/', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true),

  verifyEmail: (token: string) =>
    apiFetch<{ message: string }>('/v2/auth/verify-email/', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }, true),

  getProfile: () =>
    apiFetch<User>('/v2/auth/profile/', {}, true),

  updateProfile: (data: Partial<User>) =>
    apiFetch<User>('/v2/auth/profile/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }, true),

  changePassword: (data: { old_password: string; new_password: string }) =>
    apiFetch<{ message: string }>('/v2/auth/change-password/', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true),

  // 2FA endpoints
  setup2FA: () =>
    apiFetch<{ qr_code: string; secret: string }>('/v2/auth/2fa/setup/', {
      method: 'POST',
    }, true),

  verify2FA: (token: string) =>
    apiFetch<{ message: string }>('/v2/auth/2fa/verify/', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }, true),

  disable2FA: (token: string) =>
    apiFetch<{ message: string }>('/v2/auth/2fa/disable/', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }, true),

  // Social auth
  googleAuth: (access_token: string) =>
    apiFetch<{ access: string; refresh: string; user: User }>('/v2/auth/social/google/', {
      method: 'POST',
      body: JSON.stringify({ access_token }),
    }, true),

  githubAuth: (access_token: string) =>
    apiFetch<{ access: string; refresh: string; user: User }>('/v2/auth/social/github/', {
      method: 'POST',
      body: JSON.stringify({ access_token }),
    }, true),

  // Google Drive integration
  getGoogleDriveAuthUrl: () =>
    apiFetch<{ auth_url: string }>('/v2/auth/google-drive/auth/', {}, true),

  connectGoogleDrive: (code: string) =>
    apiFetch<{ message: string }>('/v2/auth/google-drive/auth/', {
      method: 'POST',
      body: JSON.stringify({ code }),
    }, true),

  disconnectGoogleDrive: () =>
    apiFetch<{ message: string }>('/v2/auth/google-drive/disconnect/', {
      method: 'POST',
    }, true),

  getGoogleDriveStatus: () =>
    apiFetch<{ connected: boolean }>('/v2/auth/google-drive/status/', {}, true),
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
    return apiFetch<PaginatedResponse<WatchParty>>(`/v2/parties/${queryString}`, {}, true)
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
    apiFetch<WatchParty>(`/v2/parties/${id}/`, {}, true),

  update: (id: string, data: Partial<WatchParty>) =>
    apiFetch<WatchParty>(`/v2/parties/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }, true),

  delete: (id: string) =>
    apiFetch<void>(`/v2/parties/${id}/`, {
      method: 'DELETE',
    }, true),

  join: (id: string) =>
    apiFetch<{ message: string }>(`/v2/parties/${id}/join/`, {
      method: 'POST',
    }, true),

  leave: (id: string) =>
    apiFetch<{ message: string }>(`/v2/parties/${id}/leave/`, {
      method: 'POST',
    }, true),

  getParticipants: (id: string) =>
    apiFetch<User[]>(`/v2/parties/${id}/participants/`, {}, true),

  generateInvite: (id: string) =>
    apiFetch<{ invite_code: string }>(`/v2/parties/${id}/generate-invite/`, {
      method: 'POST',
    }, true),

  joinByCode: (code: string) =>
    apiFetch<{ party: WatchParty }>('/v2/parties/join-by-code/', {
      method: 'POST',
      body: JSON.stringify({ code }),
    }, true),

  control: (id: string, action: { type: 'play' | 'pause' | 'seek'; timestamp?: number }) =>
    apiFetch<{ message: string }>(`/v2/parties/${id}/control/`, {
      method: 'POST',
      body: JSON.stringify(action),
    }, true),

  getSyncState: (id: string) =>
    apiFetch<{ playing: boolean; current_time: number; last_update: string }>(`/v2/parties/${id}/sync_state/`, {}, true),

  selectGDriveMovie: (id: string, fileId: string) =>
    apiFetch<{ message: string }>(`/v2/parties/${id}/select_gdrive_movie/`, {
      method: 'POST',
      body: JSON.stringify({ file_id: fileId }),
    }, true),

  start: (id: string) =>
    apiFetch<{ message: string }>(`/v2/parties/${id}/start/`, {
      method: 'POST',
    }, true),

  react: (id: string, reaction: string) =>
    apiFetch<{ message: string }>(`/v2/parties/${id}/react/`, {
      method: 'POST',
      body: JSON.stringify({ reaction }),
    }, true),

  // Party discovery
  getPublic: (params?: { page?: number; page_size?: number }) =>
    apiFetch<PaginatedResponse<WatchParty>>('/v2/parties/public/' + (params ? '?' + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString() : ''), {}, true),

  getRecent: (params?: { page?: number; page_size?: number }) =>
    apiFetch<PaginatedResponse<WatchParty>>('/v2/parties/recent/' + (params ? '?' + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString() : ''), {}, true),

  getTrending: () =>
    apiFetch<PaginatedResponse<WatchParty>>('/v2/parties/trending/', {}, true),

  getRecommendations: () =>
    apiFetch<PaginatedResponse<WatchParty>>('/v2/parties/recommendations/', {}, true),

  search: (query: string, filters?: any) =>
    apiFetch<PaginatedResponse<WatchParty>>('/v2/parties/search/?' + new URLSearchParams({ q: query, ...filters }).toString(), {}, true),

  // Party analytics
  getAnalytics: (id: string) =>
    apiFetch<any>(`/v2/parties/${id}/analytics/`, {}, true),

  updateAnalytics: (id: string, data: any) =>
    apiFetch<{ message: string }>(`/v2/parties/${id}/update-analytics/`, {
      method: 'POST',
      body: JSON.stringify(data),
    }, true),
}

/**
 * Chat API - Complete implementation
 */
export const chatApi = {
  getMessages: (partyId: string, params?: { page?: number; page_size?: number; search?: string }) =>
    apiFetch<PaginatedResponse<ChatMessage>>(`/v2/chat/${partyId}/messages/` + (params ? '?' + new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])).toString() : ''), {}, true),

  sendMessage: (partyId: string, content: string) =>
    apiFetch<ChatMessage>(`/v2/chat/${partyId}/messages/send/`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }, true),

  getActiveUsers: (roomId: string) =>
    apiFetch<User[]>(`/v2/chat/${roomId}/active-users/`, {}, true),

  joinRoom: (roomId: string) =>
    apiFetch<{ message: string }>(`/v2/chat/${roomId}/join/`, {
      method: 'POST',
    }, true),

  leaveRoom: (roomId: string) =>
    apiFetch<{ message: string }>(`/v2/chat/${roomId}/leave/`, {
      method: 'POST',
    }, true),

  banUser: (roomId: string, userId: string, reason?: string) =>
    apiFetch<{ message: string }>(`/v2/chat/${roomId}/ban/`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, reason }),
    }, true),

  unbanUser: (roomId: string, userId: string) =>
    apiFetch<{ message: string }>(`/v2/chat/${roomId}/unban/`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    }, true),

  moderate: (roomId: string, action: any) =>
    apiFetch<{ message: string }>(`/v2/chat/${roomId}/moderate/`, {
      method: 'POST',
      body: JSON.stringify(action),
    }, true),

  getSettings: (roomId: string) =>
    apiFetch<any>(`/v2/chat/${roomId}/settings/`, {}, true),

  updateSettings: (roomId: string, settings: any) =>
    apiFetch<any>(`/v2/chat/${roomId}/settings/`, {
      method: 'PUT',
      body: JSON.stringify(settings),
    }, true),

  getStats: (roomId: string) =>
    apiFetch<any>(`/v2/chat/${roomId}/stats/`, {}, true),

  getModerationLog: (roomId: string, params?: { page?: number; page_size?: number }) =>
    apiFetch<PaginatedResponse<any>>(`/v2/chat/${roomId}/moderation-log/` + (params ? '?' + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString() : ''), {}, true),

  getHistory: (partyId: string, params?: { page?: number; page_size?: number }) =>
    apiFetch<PaginatedResponse<ChatMessage>>(`/v2/chat/history/${partyId}/` + (params ? '?' + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString() : ''), {}, true),

  // Missing methods for ModerationPanel
  getBannedUsers: (partyId: string) =>
    apiFetch<User[]>(`/v2/chat/${partyId}/banned-users/`, {}, true),

  getModerationHistory: (partyId: string) =>
    apiFetch<any[]>(`/v2/chat/${partyId}/moderation-history/`, {}, true),

  kickUser: (partyId: string, userId: string, reason?: string) =>
    apiFetch<{ message: string }>(`/v2/chat/${partyId}/kick/`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, reason }),
    }, true),

  clearChat: (partyId: string) =>
    apiFetch<{ message: string }>(`/v2/chat/${partyId}/clear/`, {
      method: 'POST',
    }, true),

  // Missing method for EmojiPicker
  getCustomEmojis: () =>
    apiFetch<ChatEmoji[]>('/v2/chat/emojis/', {}, true),
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
    return apiFetch<PaginatedResponse<VideoSummary>>(`/v2/videos/${queryString}`, {}, true)
  },

  create: (data: FormData | { 
    title: string; 
    description?: string; 
    source_type?: string; 
    source_url?: string; 
    visibility?: string;
  }) => {
    if (data instanceof FormData) {
      return apiFetch<VideoSummary>('/v2/videos/', {
        method: 'POST',
        body: data,
        headers: {}, // Let browser set content-type for FormData
      }, true)
    } else {
      return apiFetch<VideoSummary>('/v2/videos/', {
        method: 'POST',
        body: JSON.stringify(data),
      }, true)
    }
  },

  getById: (id: string) =>
    apiFetch<VideoSummary>(`/v2/videos/${id}/`, {}, true),

  update: (id: string, data: Partial<VideoSummary>) =>
    apiFetch<VideoSummary>(`/v2/videos/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }, true),

  delete: (id: string) =>
    apiFetch<void>(`/v2/videos/${id}/`, {
      method: 'DELETE',
    }, true),

  getStreamUrl: (id: string) =>
    apiFetch<{ stream_url: string }>(`/v2/videos/${id}/stream/`, {}, true),

  download: (id: string) =>
    apiFetch<{ download_url: string }>(`/v2/videos/${id}/download/`, {}, true),

  like: (id: string) =>
    apiFetch<{ message: string }>(`/v2/videos/${id}/like/`, {
      method: 'POST',
    }, true),

  share: (id: string, platform: string) =>
    apiFetch<{ share_url: string }>(`/v2/videos/${id}/share/`, {
      method: 'POST',
      body: JSON.stringify({ platform }),
    }, true),

  getComments: (id: string, params?: { page?: number; page_size?: number }) =>
    apiFetch<PaginatedResponse<any>>(`/v2/videos/${id}/comments/` + (params ? '?' + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString() : ''), {}, true),

  addComment: (id: string, content: string) =>
    apiFetch<any>(`/v2/videos/${id}/comments/`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }, true),

  getAnalytics: (id: string) =>
    apiFetch<any>(`/v2/videos/${id}/analytics/`, {}, true),

  getProcessingStatus: (id: string) =>
    apiFetch<{ status: string; progress: number }>(`/v2/videos/${id}/processing-status/`, {}, true),

  getQualityVariants: (id: string) =>
    apiFetch<{ variants: string[] }>(`/v2/videos/${id}/quality-variants/`, {}, true),

  regenerateThumbnail: (id: string) =>
    apiFetch<{ message: string }>(`/v2/videos/${id}/regenerate-thumbnail/`, {
      method: 'POST',
    }, true),

  search: (query: string, filters?: any) =>
    apiFetch<PaginatedResponse<VideoSummary>>('/v2/videos/search/?' + new URLSearchParams({ q: query, ...filters }).toString(), {}, true),

  validateUrl: (url: string) =>
    apiFetch<{ valid: boolean; metadata?: any }>('/v2/videos/validate-url/', {
      method: 'POST',
      body: JSON.stringify({ url }),
    }, true),

  // Google Drive videos
  getGDriveVideos: (params?: { page?: number; page_size?: number }) =>
    apiFetch<PaginatedResponse<any>>('/v2/videos/gdrive/' + (params ? '?' + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString() : ''), {}, true),

  uploadFromGDrive: (fileId: string) =>
    apiFetch<VideoSummary>('/v2/videos/gdrive/upload/', {
      method: 'POST',
      body: JSON.stringify({ file_id: fileId }),
    }, true),

  getGDriveStream: (id: string) =>
    apiFetch<{ stream_url: string }>(`/v2/videos/gdrive/${id}/stream/`, {}, true),

  deleteGDriveVideo: (id: string) =>
    apiFetch<void>(`/v2/videos/gdrive/${id}/delete/`, {
      method: 'DELETE',
    }, true),
}

/**
 * Dashboard API
 */
export const dashboardApi = {
  getStats: (): Promise<DashboardStatsResponse> => 
    apiFetch<DashboardStatsResponse>("/v2/analytics/dashboard/", {}, true),
  
  getActivities: () => 
    apiFetch<PaginatedResponse<any>>('/v2/dashboard/activities/', {}, true),
}

/**
 * User/Profile API - Complete implementation  
 */
export const userApi = {
  getProfile: (): Promise<User> => 
    apiFetch<User>("/v2/auth/profile/", {}, true),

  updateProfile: (data: Partial<User>): Promise<User> =>
    apiFetch<User>("/v2/auth/profile/", {
      method: "PATCH",
      body: JSON.stringify(data),
    }, true),

  getUserProfile: (userId: string) =>
    apiFetch<User>(`/v2/users/${userId}/profile/`, {}, true),

  getPublicProfile: (userId: string) =>
    apiFetch<User>(`/v2/users/${userId}/public-profile/`, {}, true),

  search: (query: string) =>
    apiFetch<PaginatedResponse<User>>('/v2/users/search/?' + new URLSearchParams({ q: query }).toString(), {}, true),

  // Friends system
  getFriends: () =>
    apiFetch<PaginatedResponse<User>>('/v2/users/friends/', {}, true),

  getFriendRequests: () =>
    apiFetch<PaginatedResponse<any>>('/v2/users/friends/requests/', {}, true),

  sendFriendRequest: (userId: string) =>
    apiFetch<{ message: string }>('/v2/users/friends/request/', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    }, true),

  acceptFriendRequest: (requestId: string) =>
    apiFetch<{ message: string }>(`/v2/users/friends/${requestId}/accept/`, {
      method: 'POST',
    }, true),

  declineFriendRequest: (requestId: string) =>
    apiFetch<{ message: string }>(`/v2/users/friends/${requestId}/decline/`, {
      method: 'POST',
    }, true),

  removeFriend: (username: string) =>
    apiFetch<void>(`/v2/users/friends/${username}/remove/`, {
      method: 'DELETE',
    }, true),

  getFriendSuggestions: () =>
    apiFetch<PaginatedResponse<User>>('/v2/users/friends/suggestions/', {}, true),

  getMutualFriends: (userId: string) =>
    apiFetch<PaginatedResponse<User>>(`/v2/users/${userId}/mutual-friends/`, {}, true),

  // User settings and preferences
  getSettings: () =>
    apiFetch<any>('/v2/users/settings/', {}, true),

  updateSettings: (settings: any) =>
    apiFetch<any>('/v2/users/settings/', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }, true),

  getNotificationSettings: () =>
    apiFetch<any>('/v2/users/notifications/settings/', {}, true),

  updateNotificationSettings: (settings: any) =>
    apiFetch<any>('/v2/users/notifications/settings/', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }, true),

  getPrivacySettings: () =>
    apiFetch<any>('/v2/users/privacy/settings/', {}, true),

  updatePrivacySettings: (settings: any) =>
    apiFetch<any>('/v2/users/privacy/settings/', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }, true),

  // User activity and stats
  getActivity: () =>
    apiFetch<PaginatedResponse<any>>('/v2/users/activity/', {}, true),

  getStats: () =>
    apiFetch<any>('/v2/users/stats/', {}, true),

  getDashboardStats: () =>
    apiFetch<Analytics>('/v2/users/dashboard/stats/', {}, true),

  getWatchHistory: () =>
    apiFetch<PaginatedResponse<any>>('/v2/users/watch-history/', {}, true),

  // User notifications
  getNotifications: (params?: { page?: number; page_size?: number }) =>
    apiFetch<PaginatedResponse<Notification>>('/v2/users/notifications/' + (params ? '?' + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString() : ''), {}, true),

  markNotificationAsRead: (notificationId: string) =>
    apiFetch<{ message: string }>(`/v2/users/notifications/${notificationId}/read/`, {
      method: 'POST',
    }, true),

  markAllNotificationsAsRead: () =>
    apiFetch<{ message: string }>('/v2/users/notifications/mark-all-read/', {
      method: 'POST',
    }, true),

  // User blocking
  blockUser: (userId: string) =>
    apiFetch<{ message: string }>(`/v2/users/${userId}/block/`, {
      method: 'POST',
    }, true),

  unblockUser: (userId: string) =>
    apiFetch<{ message: string }>('/v2/users/unblock/', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    }, true),

  // User favorites
  getFavorites: () =>
    apiFetch<PaginatedResponse<any>>('/v2/users/favorites/', {}, true),

  addFavorite: (itemId: string, itemType: string) =>
    apiFetch<{ message: string }>('/v2/users/favorites/add/', {
      method: 'POST',
      body: JSON.stringify({ item_id: itemId, item_type: itemType }),
    }, true),

  removeFavorite: (favoriteId: string) =>
    apiFetch<{ message: string }>(`/v2/users/favorites/${favoriteId}/remove/`, {
      method: 'POST',
    }, true),

  // User achievements
  getAchievements: () =>
    apiFetch<PaginatedResponse<any>>('/v2/users/achievements/', {}, true),

  getInventory: () =>
    apiFetch<PaginatedResponse<any>>('/v2/users/inventory/', {}, true),

  // Account management
  changePassword: (data: { old_password: string; new_password: string }) =>
    apiFetch<{ message: string }>('/v2/users/password/', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true),

  uploadAvatar: (file: File) => {
    const formData = new FormData()
    formData.append('avatar', file)
    return apiFetch<{ avatar_url: string }>('/v2/users/avatar/upload/', {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set content-type
    }, true)
  },

  exportData: () =>
    apiFetch<{ download_url: string }>('/v2/users/export-data/', {}, true),

  deleteAccount: (password: string) =>
    apiFetch<{ message: string }>('/v2/users/delete-account/', {
      method: 'POST',
      body: JSON.stringify({ password }),
    }, true),

  getOnlineStatus: () =>
    apiFetch<{ online: boolean; last_seen?: string }>('/v2/users/online-status/', {}, true),

  // User reports
  reportUser: (data: { user_id: string; report_type: string; reason: string }) =>
    apiFetch<{ message: string }>('/v2/users/report/', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true),
}

/**
 * Analytics API - Complete implementation
 */
export const analyticsApi = {
  getUserStats: (): Promise<Record<string, unknown>> => 
    apiFetch<Record<string, unknown>>("/v2/analytics/user-stats/", {}, true),

  getPartyStats: (partyId: string): Promise<Record<string, unknown>> => 
    apiFetch<Record<string, unknown>>(`/v2/analytics/party-stats/${partyId}/`, {}, true),

  getDashboard: () =>
    apiFetch<any>('/v2/analytics/dashboard/', {}, true),

  exportData: (params: any) =>
    apiFetch<{ download_url: string }>('/v2/analytics/export/', {
      method: 'POST',
      body: JSON.stringify(params),
    }, true),

  getPersonal: () =>
    apiFetch<any>('/v2/analytics/personal/', {}, true),

  getRealTime: () =>
    apiFetch<any>('/v2/analytics/real-time/', {}, true),

  getPlatformOverview: () =>
    apiFetch<any>('/v2/analytics/platform-overview/', {}, true),

  getRetention: () =>
    apiFetch<any>('/v2/analytics/retention/', {}, true),

  getUserBehavior: () =>
    apiFetch<any>('/v2/analytics/user-behavior/', {}, true),

  getRevenue: () =>
    apiFetch<any>('/v2/analytics/revenue/', {}, true),

  trackEvent: (event: any) =>
    apiFetch<any>('/v2/analytics/track/', {
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
    apiFetch<SystemStats>('/v2/admin/system/stats/', {}, true),

  getServerHealth: (): Promise<ServerHealth> =>
    apiFetch<ServerHealth>('/v2/admin/system/health/', {}, true),

  // User management
  getUsers: (params?: any) =>
    apiFetch<PaginatedResponse<User>>('/v2/admin/users/', { 
      method: 'GET',
      ...(params && { body: JSON.stringify(params) })
    }, true),

  banUser: (userId: string, reason: string) =>
    apiFetch<{ message: string }>(`/v2/admin/users/${userId}/ban/`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }, true),

  unbanUser: (userId: string) =>
    apiFetch<{ message: string }>(`/v2/admin/users/${userId}/unban/`, {
      method: 'POST',
    }, true),

  verifyUser: (userId: string) =>
    apiFetch<{ message: string }>(`/v2/admin/users/${userId}/verify/`, {
      method: 'POST',
    }, true),

  // Content moderation
  getVideos: (params?: any) =>
    apiFetch<PaginatedResponse<VideoSummary>>('/v2/admin/videos/', { 
      method: 'GET',
      ...(params && { body: JSON.stringify(params) })
    }, true),

  moderateVideo: (videoId: string, action: "approve" | "reject", reason?: string) =>
    apiFetch<{ message: string }>(`/v2/admin/videos/${videoId}/moderate/`, {
      method: 'POST',
      body: JSON.stringify({ action, reason }),
    }, true),

  // System operations
  restartService: (service: string) =>
    apiFetch<{ message: string }>('/v2/admin/system/restart/', {
      method: 'POST',
      body: JSON.stringify({ service }),
    }, true),

  clearCache: () =>
    apiFetch<{ message: string }>('/v2/admin/system/clear-cache/', {
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
    apiFetch<any>('/v2/billing/plans/', {}, true),

  getCurrentSubscription: () =>
    apiFetch<any>('/v2/billing/subscription/', {}, true),

  subscribe: (planId: string) =>
    apiFetch<any>('/v2/billing/subscribe/', {
      method: 'POST',
      body: JSON.stringify({ plan_id: planId }),
    }, true),

  cancelSubscription: () =>
    apiFetch<any>('/v2/billing/cancel/', {
      method: 'POST',
    }, true),

  reactivateSubscription: () =>
    apiFetch<any>('/v2/billing/reactivate/', {
      method: 'POST',
    }, true),

  // Payment methods
  updatePaymentMethod: () =>
    apiFetch<any>('/v2/billing/update-payment-method/', {
      method: 'POST',
    }, true),

  // Billing history
  getBillingHistory: () =>
    apiFetch<any>('/v2/billing/history/', {}, true),

  downloadInvoice: (invoiceId: string) =>
    apiFetch<any>(`/v2/billing/invoice/${invoiceId}/download/`, {}, true),
}

/**
 * Store API - Complete implementation
 */
export const storeApi = {
  // Store items
  getItems: (_params?: any) =>
    apiFetch<any>('/v2/store/items/', {}, true),

  purchaseItem: (itemId: string) =>
    apiFetch<any>('/v2/store/purchase/', {
      method: 'POST',
      body: JSON.stringify({ item_id: itemId }),
    }, true),

  // Purchase history
  getPurchases: () =>
    apiFetch<any>('/v2/store/purchases/', {}, true),
}

/**
 * Interactive API - Complete implementation
 */
export const interactiveApi = {
  // Polls
  getPolls: (partyId: string) =>
    apiFetch<any>(`/v2/parties/${partyId}/polls/`, {}, true),

  createPoll: (partyId: string, data: any) =>
    apiFetch<any>(`/v2/parties/${partyId}/polls/`, {
      method: 'POST',
      body: JSON.stringify(data),
    }, true),

  deletePoll: (partyId: string, pollId: string) =>
    apiFetch<any>(`/v2/parties/${partyId}/polls/${pollId}/`, {
      method: 'DELETE',
    }, true),

  vote: (partyId: string, pollId: string, optionId: string) =>
    apiFetch<any>(`/v2/parties/${partyId}/polls/${pollId}/vote/`, {
      method: 'POST',
      body: JSON.stringify({ option_id: optionId }),
    }, true),

  // Reactions
  getReactions: (partyId: string) =>
    apiFetch<any>(`/v2/parties/${partyId}/reactions/`, {}, true),

  addReaction: (partyId: string, emoji: string) =>
    apiFetch<any>(`/v2/parties/${partyId}/reactions/`, {
      method: 'POST',
      body: JSON.stringify({ emoji }),
    }, true),

  clearReactions: (partyId: string) =>
    apiFetch<any>(`/v2/parties/${partyId}/reactions/`, {
      method: 'DELETE',
    }, true),

  // Sync Controls
  getSyncState: (partyId: string) =>
    apiFetch<any>(`/v2/parties/${partyId}/sync/`, {}, true),

  updateSyncState: (partyId: string, data: any) =>
    apiFetch<any>(`/v2/parties/${partyId}/sync/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }, true),

  // Games
  getCurrentGame: (partyId: string) =>
    apiFetch<any>(`/v2/parties/${partyId}/games/current/`, {}, true),

  startGame: (partyId: string, gameType: string) =>
    apiFetch<any>(`/v2/parties/${partyId}/games/`, {
      method: 'POST',
      body: JSON.stringify({ game_type: gameType }),
    }, true),

  endGame: (partyId: string, gameId: string) =>
    apiFetch<any>(`/v2/parties/${partyId}/games/${gameId}/`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active: false }),
    }, true),

  joinGame: (partyId: string, gameId: string) =>
    apiFetch<any>(`/v2/parties/${partyId}/games/${gameId}/join/`, {
      method: 'POST',
    }, true),

  leaveGame: (partyId: string, gameId: string) =>
    apiFetch<any>(`/v2/parties/${partyId}/games/${gameId}/leave/`, {
      method: 'POST',
    }, true),

  submitAnswer: (partyId: string, gameId: string, answer: string) =>
    apiFetch<any>(`/v2/parties/${partyId}/games/${gameId}/answer/`, {
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
    return apiFetch<any>(`/v2/search/?${queryString}`, {}, true)
  },

  // Search suggestions
  getSuggestions: (query: string, scope?: string) => {
    const params = new URLSearchParams({ q: query })
    if (scope) params.append('scope', scope)
    return apiFetch<any>(`/v2/search/suggestions/?${params.toString()}`, {}, true)
  },

  // Advanced search
  advancedSearch: (searchData: any) =>
    apiFetch<any>('/v2/search/advanced/', {
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
    return apiFetch<any>(`/v2/search/?${queryString}`, {}, true)
  },

  searchUsers: (params: any) => {
    const queryString = new URLSearchParams(
      Object.entries({ ...params, type: 'users' })
        .filter(([, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => [key, String(value)])
    ).toString()
    return apiFetch<any>(`/v2/search/?${queryString}`, {}, true)
  },

  searchVideos: (params: any) => {
    const queryString = new URLSearchParams(
      Object.entries({ ...params, type: 'videos' })
        .filter(([, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => [key, String(value)])
    ).toString()
    return apiFetch<any>(`/v2/search/?${queryString}`, {}, true)
  },

  // Save search
  saveSearch: (searchQuery: string) =>
    apiFetch<any>('/v2/search/save/', {
      method: 'POST',
      body: JSON.stringify({ query: searchQuery }),
    }, true),

  // Get saved searches
  getSavedSearches: () =>
    apiFetch<any>('/v2/search/saved/', {}, true),

  // Delete saved search
  deleteSavedSearch: (searchId: string) =>
    apiFetch<any>(`/v2/search/saved/${searchId}/`, {
      method: 'DELETE',
    }, true),
}

/**
 * Support API - Complete implementation
 */
export const supportApi = {
  // Support Tickets
  getTickets: () =>
    apiFetch<any>('/v2/support/tickets/', {}, true),

  createTicket: (ticketData: any) =>
    apiFetch<any>('/v2/support/tickets/', {
      method: 'POST',
      body: JSON.stringify(ticketData),
    }, true),

  getTicket: (ticketId: string) =>
    apiFetch<any>(`/v2/support/tickets/${ticketId}/`, {}, true),

  updateTicket: (ticketId: string, updates: any) =>
    apiFetch<any>(`/v2/support/tickets/${ticketId}/`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }, true),

  addTicketMessage: (ticketId: string, message: any) =>
    apiFetch<any>(`/v2/support/tickets/${ticketId}/messages/`, {
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
    return apiFetch<any>(`/v2/support/faq/${queryString}`, {}, true)
  },

  getFAQCategories: () =>
    apiFetch<any>('/v2/support/faq/categories/', {}, true),

  markFAQHelpful: (faqId: string, helpful: boolean) =>
    apiFetch<any>(`/v2/support/faq/${faqId}/helpful/`, {
      method: 'POST',
      body: JSON.stringify({ helpful }),
    }, true),

  // Documentation
  getDocs: (params?: any) => {
    const queryString = params ? '?' + new URLSearchParams(
      Object.entries(params)
        .filter(([, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => [key, String(value)])
    ).toString() : ''
    return apiFetch<any>(`/v2/support/docs/${queryString}`, {}, true)
  },

  getDocsCategories: () =>
    apiFetch<any>('/v2/support/docs/categories/', {}, true),

  viewDoc: (docId: string) =>
    apiFetch<any>(`/v2/support/docs/${docId}/view/`, {
      method: 'POST',
    }, true),

  markDocHelpful: (docId: string, helpful: boolean) =>
    apiFetch<any>(`/v2/support/docs/${docId}/helpful/`, {
      method: 'POST',
      body: JSON.stringify({ helpful }),
    }, true),

  // Community
  getCommunityPosts: (params?: any) => {
    const queryString = params ? '?' + new URLSearchParams(
      Object.entries(params)
        .filter(([, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => [key, String(value)])
    ).toString() : ''
    return apiFetch<any>(`/v2/support/community/${queryString}`, {}, true)
  },

  createCommunityPost: (postData: any) =>
    apiFetch<any>('/v2/support/community/', {
      method: 'POST',
      body: JSON.stringify(postData),
    }, true),

  viewCommunityPost: (postId: string) =>
    apiFetch<any>(`/v2/support/community/${postId}/view/`, {
      method: 'POST',
    }, true),

  voteCommunityPost: (postId: string, vote: 'up' | 'down') =>
    apiFetch<any>(`/v2/support/community/${postId}/vote/`, {
      method: 'POST',
      body: JSON.stringify({ vote }),
    }, true),

  getCommunityReplies: (postId: string) =>
    apiFetch<any>(`/v2/support/community/${postId}/replies/`, {}, true),

  createCommunityReply: (postId: string, replyData: any) =>
    apiFetch<any>(`/v2/support/community/${postId}/replies/`, {
      method: 'POST',
      body: JSON.stringify(replyData),
    }, true),

  voteCommunityReply: (replyId: string, vote: 'up' | 'down') =>
    apiFetch<any>(`/v2/support/community/replies/${replyId}/vote/`, {
      method: 'POST',
      body: JSON.stringify({ vote }),
    }, true),

  markReplySolution: (replyId: string) =>
    apiFetch<any>(`/v2/support/community/replies/${replyId}/solution/`, {
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
export { authApi as auth, partiesApi as parties, videosApi as videos, userApi as users, chatApi as chat, adminApi as admin, billingApi as billing, storeApi as store, interactiveApi as interactive, searchApi as search, supportApi as support, analyticsApi as analytics }

// Export types for convenience  
export type Video = VideoSummary
export type Party = WatchParty
