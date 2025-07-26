/**
 * Enhanced API Types based on backend API documentation
 */

// Common API response types
export interface APIResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  errors?: Record<string, string[]>
}

export interface PaginatedResponse<T> {
  results: T[]
  count: number
  next: string | null
  previous: string | null
}

export interface APIError {
  success: false
  errors?: Record<string, string[]>
  detail?: string
}

// Authentication types - matching backend responses
export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  full_name: string
  avatar: string | null
  is_premium: boolean
  subscription_expires: string | null
  is_subscription_active: boolean
  date_joined: string
  last_login: string | null
}

export interface AuthResponse {
  success: boolean
  access_token: string
  refresh_token: string
  user: User
  verification_sent?: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  confirm_password: string
  first_name: string
  last_name: string
  promo_code?: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  new_password: string
  confirm_password: string
}

export interface ChangePasswordRequest {
  current_password: string
  new_password: string
  confirm_password: string
}

// User Dashboard & Profile types
export interface DashboardStats {
  total_parties: number
  parties_hosted: number
  parties_joined: number
  total_videos: number
  watch_time_hours: number
  friends_count: number
  recent_activity: {
    parties_this_week: number
    videos_uploaded_this_week: number
    watch_time_this_week: number
  }
}

export interface UserProfile {
  bio: string
  timezone: string
  language: string
  notification_preferences: {
    email_notifications: boolean
    friend_requests: boolean
  }
  social_links: {
    twitter?: string
    instagram?: string
  }
  privacy_settings: {
    profile_visibility: 'public' | 'friends' | 'private'
    allow_friend_requests: boolean
  }
}

// Video types - matching backend structure
export interface Video {
  id: string
  title: string
  description: string
  uploader: {
    id: string
    name: string
    avatar: string
    is_premium: boolean
  }
  thumbnail: string | null
  duration: string | null
  file_size: number | null
  source_type: 'upload' | 'url' | 'drive'
  source_url?: string
  resolution?: string
  codec?: string
  bitrate?: number
  fps?: number
  visibility: 'public' | 'private' | 'unlisted'
  status: 'pending' | 'processing' | 'ready' | 'failed'
  allow_download: boolean
  require_premium: boolean
  view_count: number
  like_count: number
  comments_count: number
  is_liked: boolean
  can_edit: boolean
  can_download: boolean
  created_at: string
  updated_at: string
}

export interface VideoUpload {
  success: boolean
  upload_id: string
  video_id: string
  message: string
}

export interface VideoUploadStatus {
  upload_id: string
  status: 'uploading' | 'processing' | 'ready' | 'failed'
  progress: number
  message: string
  estimated_completion?: string
  video_id?: string
}

export interface VideoStreamInfo {
  streaming_url: string
  thumbnail_url: string
  quality_variants: Array<{
    quality: string
    bitrate: number
  }>
}

// Party types - matching backend structure
export interface WatchParty {
  id: string
  title: string
  description: string
  host: {
    id: string
    name: string
    avatar: string
    is_premium: boolean
  }
  video: {
    id: string
    title: string
    thumbnail: string
  }
  room_code: string
  visibility: 'public' | 'private'
  max_participants: number
  participant_count: number
  status: 'scheduled' | 'live' | 'paused' | 'ended'
  scheduled_start?: string
  require_approval: boolean
  allow_chat: boolean
  allow_reactions: boolean
  can_join: boolean
  can_edit: boolean
  created_at: string
}

export interface PartyParticipant {
  user: {
    id: string
    name: string
    avatar: string
  }
  role: 'host' | 'moderator' | 'participant'
  status: 'active' | 'away' | 'disconnected'
  joined_at: string
  last_seen: string
}

export interface PartyControl {
  action: 'play' | 'pause' | 'seek' | 'stop'
  timestamp?: number
}

export interface PartyJoinResponse {
  success: boolean
  party: {
    id: string
    title: string
    room_code: string
  }
  redirect_url: string
}

// Chat types - matching backend structure
export interface ChatMessage {
  id: string
  user: {
    id: string
    name: string
    avatar: string
  }
  message: string
  message_type: 'text' | 'system' | 'emoji'
  timestamp: string
  is_system: boolean
  reactions: Array<{
    emoji: string
    count: number
    users: string[]
  }>
}

export interface ChatSettings {
  slow_mode: boolean
  slow_mode_interval: number
  allow_links: boolean
  profanity_filter: boolean
  max_message_length: number
  moderators: string[]
}

// Friend types
export interface Friend {
  id: string
  name: string
  avatar: string
  is_premium: boolean
  mutual_friends_count: number
}

export interface FriendRequest {
  username: string
  message?: string
}

// Billing types - matching backend structure
export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price: number
  currency: string
  interval: 'monthly' | 'yearly'
  features: string[]
  is_popular: boolean
}

export interface Subscription {
  id: string
  plan: SubscriptionPlan
  status: 'active' | 'canceled' | 'past_due'
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
}

export interface PaymentMethod {
  id: string
  type: 'card' | 'paypal'
  last_four: string
  brand: string
  expires_month: number
  expires_year: number
  is_default: boolean
  created_at: string
}

export interface BillingHistory {
  id: string
  amount: number
  currency: string
  status: 'paid' | 'pending' | 'failed'
  description: string
  created_at: string
  download_url?: string
}

// Notification types
export interface Notification {
  id: string
  type: 'friend_request' | 'party_invite' | 'video_upload' | 'system'
  title: string
  message: string
  action_data?: Record<string, any>
  action_url?: string
  is_read: boolean
  created_at: string
}

export interface NotificationPreferences {
  email_notifications: boolean
  push_notifications: boolean
  party_invites: boolean
  friend_requests: boolean
  video_uploads: boolean
  system_updates: boolean
  marketing: boolean
}

// Analytics types
export interface AnalyticsDashboard {
  overview: {
    total_users: number
    active_users_today: number
    total_parties: number
    total_watch_time_hours: number
  }
  trends: Record<string, any>
  top_videos: Array<Record<string, any>>
  user_activity: {
    peak_hours: number[]
    popular_days: string[]
  }
}

export interface UserAnalytics {
  watch_time: {
    total_hours: number
    average_session: number
  }
  party_stats: {
    hosted: number
    joined: number
    favorite_genres: string[]
  }
  activity_chart: Array<{
    date: string
    hours: number
  }>
  achievements: Array<Record<string, any>>
}

// Interactive features
export interface LiveReaction {
  emoji: string
  timestamp: number
}

export interface Poll {
  id: string
  question: string
  options: Array<{
    id: string
    text: string
    votes: number
  }>
  status: 'active' | 'ended'
  duration_minutes: number
  allow_multiple_choice: boolean
  created_at: string
}

// Moderation types
export interface ContentReport {
  content_type: 'video' | 'chat' | 'user'
  content_id: string
  report_type: string
  description: string
  additional_context?: string
}

export interface ReportType {
  id: string
  name: string
  description: string
  category: string
}

// Integration types
export interface GoogleDriveFile {
  id: string
  name: string
  size: number
  mimeType: string
  thumbnailLink?: string
  webViewLink: string
}

export interface S3PresignedUpload {
  upload_url: string
  upload_id: string
  fields: Record<string, string>
}

// Admin types
export interface AdminDashboard {
  system_stats: {
    total_users: number
    active_sessions: number
    bandwidth_used_today: string
    storage_used: string
  }
  recent_activity: Array<Record<string, any>>
  alerts: Array<{
    type: 'warning' | 'error' | 'info'
    message: string
    timestamp: string
  }>
}

export interface SystemHealth {
  overall_status: 'healthy' | 'warning' | 'critical'
  services: Record<string, {
    status: 'up' | 'down' | 'degraded'
    response_time?: number
    last_check: string
  }>
  metrics: {
    cpu_usage: number
    memory_usage: number
    disk_usage: number
    network_io: string
  }
}

// Upload progress callback type
export type UploadProgressCallback = (progress: number) => void
