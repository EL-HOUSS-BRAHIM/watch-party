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
  is_staff?: boolean
  is_superuser?: boolean
  isVerified?: boolean
  onboarding_completed?: boolean
}

export interface AuthResponse {
  success: boolean
  access_token: string
  refresh_token: string
  user: User
  verification_sent?: boolean
}

// Additional User Types
export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlocked_at?: string
  progress?: number
  total_required?: number
}

export interface UserStats {
  total_watch_time: number
  videos_watched: number
  parties_joined: number
  friends_count: number
  achievements_unlocked: number
}

export interface UserSession {
  id: string
  device: string
  location: string
  last_activity: string
  is_current: boolean
}

export interface UserSettings {
  notifications_enabled: boolean
  email_notifications: boolean
  party_invites_enabled: boolean
  friend_requests_enabled: boolean
  privacy_level: 'public' | 'friends' | 'private'
}

export interface WatchHistoryItem {
  id: string
  video: Video
  watched_at: string
  progress: number
  completed: boolean
}

export interface Favorite {
  id: string
  content_type: string
  content_id: string
  created_at: string
}

// Store Types
export interface StoreItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

export interface UserInventory {
  id: string
  item: StoreItem
  quantity: number
  acquired_at: string
}

export interface Reward {
  id: number
  name: string
  description: string
  requirements: object
  items: StoreItem[]
  is_claimed: boolean
  available_until?: string
}

// Search Types
export interface SearchResult {
  id: string
  type: 'video' | 'party' | 'user'
  title: string
  description?: string
  thumbnail?: string
  relevance_score: number
}

export interface DiscoverContent {
  trending_videos: Video[]
  popular_parties: Party[]
  suggested_users: User[]
}

// Social Types
export interface SocialGroup {
  id: number
  name: string
  description: string
  is_public: boolean
  member_count: number
  created_at: string
  owner: User
  is_member: boolean
}

// Messaging Types
export interface Conversation {
  id: number
  participants: User[]
  last_message?: Message
  unread_count: number
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  conversation: number
  sender: User
  content: string
  message_type: 'text' | 'image' | 'file'
  sent_at: string
  is_read: boolean
}

// Support Types
export interface FAQCategory {
  id: string
  name: string
  description: string
  faq_count: number
}

export interface FAQ {
  id: string
  category: FAQCategory
  question: string
  answer: string
  helpful_count: number
  view_count: number
  is_helpful?: boolean
}

export interface SupportTicket {
  id: string
  subject: string
  description: string
  category: string
  status: 'open' | 'pending' | 'closed'
  priority: 'low' | 'medium' | 'high'
  created_at: string
  updated_at: string
}

export interface TicketMessage {
  id: string
  ticket: string
  sender: User
  message: string
  sent_at: string
  attachments: string[]
}

export interface Feedback {
  id: string
  category: string
  title: string
  description: string
  rating?: number
  vote_count: number
  user_vote?: 'up' | 'down'
  created_at: string
}

// Mobile Types
export interface MobileConfig {
  app_version: string
  min_supported_version: string
  features: string[]
  settings: object
}

export interface MobileHomeData {
  featured_videos: Video[]
  recent_parties: Party[]
  notifications_count: number
  quick_actions: object[]
}

export interface PushToken {
  token: string
  device_type: 'ios' | 'android'
  device_id: string
}

// Interactive Types
export interface Reaction {
  id: string
  emoji: string
  user: User
  timestamp: number
  created_at: string
}

export interface Poll {
  id: string
  question: string
  options: string[]
  votes: number[]
  duration: number
  anonymous: boolean
  user_vote?: number
  created_at: string
  expires_at: string
}

export interface VoiceChat {
  id: string
  is_active: boolean
  participants: User[]
  settings: object
}

export interface ScreenShare {
  id: string
  user: User
  quality: 'low' | 'medium' | 'high'
  fps: number
  audio_enabled: boolean
  is_active: boolean
}

// Moderation Types
export interface ModerationReport {
  id: string
  content_type: string
  content_id: string
  report_type: string
  description: string
  status: 'pending' | 'reviewed' | 'resolved'
  reporter: User
  created_at: string
}

export interface ReportType {
  id: string
  name: string
  description: string
}

export interface ContentType {
  id: string
  name: string
  model: string
}

// Chat Types
export interface ChatUser {
  id: string
  username: string
  avatar?: string
  is_moderator: boolean
  is_online: boolean
}

export interface ModerationLog {
  id: string
  action: string
  moderator: User
  target_user?: User
  reason?: string
  duration?: number
  created_at: string
}

export interface ChatStats {
  total_messages: number
  active_users: number
  moderator_actions: number
  average_response_time: number
}

// Integration Types
export interface IntegrationFile {
  id: string
  name: string
  size: number
  mime_type: string
  url: string
  thumbnail?: string
}

export interface PresignedUpload {
  upload_url: string
  fields: object
  expires_at: string
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  services: Array<{
    name: string
    status: 'up' | 'down'
    response_time?: number
  }>
}

// Video Types
export interface VideoComment {
  id: string
  video: string
  user: User
  content: string
  created_at: string
  updated_at: string
  likes_count: number
  is_liked?: boolean
}

export interface VideoAnalytics {
  view_count: number
  like_count: number
  comment_count: number
  share_count: number
  average_view_duration: number
  engagement_rate: number
  watch_time_analytics: object
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

// Party alias for backward compatibility
export type Party = WatchParty

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

export interface InteractivePoll {
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
  users: {
    total: number
    active: number
    new: number
    verified: number
    premium: number
  }
  parties: {
    total: number
    active: number
    completed: number
    scheduled: number
  }
  videos: {
    total: number
    uploaded: number
    processed: number
    storage: number
  }
  system: {
    uptime: number
    cpu: number
    memory: number
    storage: number
    bandwidth: number
  }
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

// Events API Types
export interface WatchEvent {
  id: string
  title: string
  description: string
  start_time: string
  end_time: string
  timezone: string
  status: 'scheduled' | 'live' | 'completed' | 'cancelled'
  privacy: 'public' | 'private' | 'invite-only'
  max_attendees: number
  current_attendees: number
  video?: {
    id: string
    title: string
    thumbnail: string
    duration: number
  }
  host: {
    id: string
    name: string
    avatar: string
  }
  location?: string
  is_virtual: boolean
  meeting_link?: string
  tags: string[]
  reminders: string[]
  rsvp_deadline?: string
  allow_guest_invites: boolean
  require_approval: boolean
  is_host: boolean
  rsvp_status?: 'going' | 'maybe' | 'not-going' | 'pending'
  created_at: string
  updated_at: string
}

export interface EventAttendee {
  id: string
  user: {
    id: string
    name: string
    avatar: string
    email: string
  }
  status: 'going' | 'maybe' | 'not-going' | 'pending'
  rsvp_date: string
  role: 'host' | 'co-host' | 'attendee'
  invited_by?: {
    id: string
    name: string
  }
}

export interface EventInvitation {
  id: string
  event: WatchEvent
  invitee: {
    id: string
    name: string
    email: string
    avatar: string
  }
  inviter: {
    id: string
    name: string
  }
  status: 'pending' | 'accepted' | 'declined'
  sent_at: string
  responded_at?: string
  message?: string
}

export interface EventRSVP {
  status: 'going' | 'maybe' | 'not-going'
  message?: string
  plus_one?: boolean
}

export interface CreateEventRequest {
  title: string
  description: string
  start_time: string
  end_time: string
  timezone?: string
  privacy: 'public' | 'private' | 'invite-only'
  max_attendees?: number
  video_id?: string
  location?: string
  is_virtual: boolean
  meeting_link?: string
  tags?: string[]
  reminders?: string[]
  rsvp_deadline?: string
  allow_guest_invites?: boolean
  require_approval?: boolean
}

export interface UpdateEventRequest extends Partial<CreateEventRequest> {
  id: string
}

export interface EventAnalytics {
  event_id: string
  total_views: number
  total_rsvps: number
  rsvp_breakdown: {
    going: number
    maybe: number
    not_going: number
    pending: number
  }
  attendance_rate: number
  peak_concurrent_attendees: number
  average_session_duration: number
  engagement_metrics: {
    chat_messages: number
    reactions: number
    polls_created: number
  }
  demographics: {
    age_groups: Record<string, number>
    locations: Record<string, number>
  }
}

export interface EventStatistics {
  total_events: number
  events_this_month: number
  events_by_status: {
    scheduled: number
    live: number
    completed: number
    cancelled: number
  }
  popular_tags: Array<{
    tag: string
    count: number
  }>
  average_attendees: number
  top_hosts: Array<{
    user: User
    events_count: number
    total_attendees: number
  }>
}

export interface EventSearchParams {
  query?: string
  tags?: string[]
  status?: 'scheduled' | 'live' | 'completed' | 'cancelled'
  privacy?: 'public' | 'private' | 'invite-only'
  start_date?: string
  end_date?: string
  max_attendees?: number
  is_virtual?: boolean
  page?: number
  limit?: number
}
