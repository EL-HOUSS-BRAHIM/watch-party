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

export interface PaginationLinks {
  next: string | null
  previous: string | null
  total?: number
  page?: number
  page_size?: number
}

export interface PaginatedResponse<T> {
  results: T[]
  pagination?: PaginationLinks
  count?: number
  next?: string | null
  previous?: string | null
}

export interface APIError {
  success: false
  errors?: Record<string, string[]>
  detail?: string
}

// Authentication types - matching backend responses
export interface RawUser {
  id: string
  email: string
  username: string
  first_name?: string
  last_name?: string
  full_name?: string
  display_name?: string
  avatar?: string | null
  is_premium?: boolean
  subscription_expires?: string | null
  is_subscription_active?: boolean
  date_joined?: string
  last_login?: string | null
  role?: string
  status?: string
  is_online?: boolean
  last_seen?: string
  last_active?: string
  is_staff?: boolean
  is_superuser?: boolean
  is_verified?: boolean
  is_email_verified?: boolean
  two_factor_enabled?: boolean
  onboarding_completed?: boolean
  [key: string]: unknown
}

export interface User {
  id: string
  email?: string
  username: string
  firstName?: string
  lastName?: string
  fullName?: string
  displayName?: string
  /** @deprecated use camelCase properties */
  first_name?: string
  /** @deprecated use camelCase properties */
  last_name?: string
  /** @deprecated use camelCase properties */
  full_name?: string
  /** @deprecated use camelCase properties */
  display_name?: string
  avatar?: string | null
  isPremium?: boolean
  subscriptionExpires?: string | null
  isSubscriptionActive?: boolean
  dateJoined?: string
  lastLogin?: string | null
  role?: string
  status?: string
  isOnline?: boolean
  lastSeen?: string
  lastActive?: string
  isStaff?: boolean
  isSuperuser?: boolean
  is_admin?: boolean
  isVerified?: boolean
  isEmailVerified?: boolean
  twoFactorEnabled?: boolean
  onboardingCompleted?: boolean
  /** @deprecated use camelCase properties */
  is_premium?: boolean
  /** @deprecated use camelCase properties */
  subscription_expires?: string | null
  /** @deprecated use camelCase properties */
  is_subscription_active?: boolean
  /** @deprecated use camelCase properties */
  date_joined?: string
  /** @deprecated use camelCase properties */
  last_login?: string | null
  /** @deprecated use camelCase properties */
  is_verified?: boolean
  /** @deprecated use camelCase properties */
  is_email_verified?: boolean
  /** @deprecated use camelCase properties */
  two_factor_enabled?: boolean
  /** @deprecated use camelCase properties */
  onboarding_completed?: boolean
  /** @deprecated use camelCase properties */
  is_staff?: boolean
  /** @deprecated use camelCase properties */
  is_superuser?: boolean
}

export interface RawAuthResponse {
  success: boolean
  access_token: string
  refresh_token: string
  user: RawUser
  verification_sent?: boolean
  requires_2fa?: boolean
  temp_token?: string
  email?: string
  message?: string
}

export interface AuthResponse extends Omit<RawAuthResponse, "user"> {
  user: User
}

export interface TwoFactorSetupResponse {
  success?: boolean
  qr_code?: string
  secret: string
  backup_codes?: string[]
}

export interface RawTwoFactorVerifyResponse {
  success: boolean
  backup_codes?: string[]
  access_token?: string
  refresh_token?: string
  user?: RawUser
  message?: string
}

export interface TwoFactorVerifyResponse extends Omit<RawTwoFactorVerifyResponse, "user"> {
  user?: User
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

export interface DiscoverRecommendation {
  type?: string
  metadata?: Record<string, any>
  [key: string]: any
}

export interface DiscoverCategory {
  id?: string | number
  name: string
  description?: string
  icon?: string
  content_count?: number
  video_count?: number
  item_count?: number
  trend_direction?: 'up' | 'down' | 'steady'
  is_growing?: boolean
  [key: string]: any
}

export interface DiscoverContent {
  featured_videos?: Array<Record<string, any>>
  trending_parties?: Array<Record<string, any>>
  recommended_content?: DiscoverRecommendation[]
  popular_categories?: DiscoverCategory[]
  platform_stats?: Record<string, any>
}

// Dashboard Types
export interface DashboardStatsSummary {
  user: {
    id: string
    name: string
    email: string
  }
  stats: {
    total_parties: number
    recent_parties: number
    total_videos: number
    recent_videos: number
    watch_time_minutes: number
  }
  trends?: Record<string, number | Record<string, number>>
  timestamp: string
}

export interface DashboardActivity {
  id: string
  type: string
  timestamp: string
  status?: "unread" | "read" | "dismissed"
  actor?: {
    id: string
    name: string
    avatar?: string | null
  }
  party?: {
    id: string
    title: string
  }
  video?: {
    id: string
    title: string
  }
  data?: Record<string, any>
}

export interface DashboardActivityAcknowledgePayload {
  status: "read" | "dismissed"
  note?: string
}

// Documentation Types
export type DocumentationStatus = "draft" | "review" | "published" | "archived"
export type DocumentationType = "guide" | "api" | "tutorial" | "reference" | "changelog"

export interface DocumentationCategory {
  id: string
  slug: string
  name: string
  description?: string
  color?: string
  document_count: number
}

export interface DocumentationDocument {
  id: string
  slug: string
  title: string
  summary?: string
  type: DocumentationType
  status: DocumentationStatus
  category: DocumentationCategory
  tags: string[]
  author: {
    id: string
    name: string
    avatar?: string | null
  }
  content: string
  created_at: string
  updated_at: string
  version: string
  view_count?: number
  metadata?: Record<string, any>
}

export interface DocumentationVersion {
  id: string
  version: string
  status: DocumentationStatus
  created_at: string
  created_by: {
    id: string
    name: string
  }
  changelog?: string
}

export interface DocumentationUpsertInput {
  title: string
  content: string
  category: string
  status?: DocumentationStatus
  summary?: string
  tags?: string[]
  type?: DocumentationType
  metadata?: Record<string, any>
}

export interface DocumentationCategoryInput {
  name: string
  description?: string
  color?: string
  slug?: string
}

export interface DocumentationListFilters {
  search?: string
  status?: DocumentationStatus
  category?: string
  tags?: string[]
  author?: string
  page?: number
  pageSize?: number
}

export interface DocumentationSearchResult {
  id: string
  title: string
  summary: string
  path: string
  relevance: number
  highlights?: Record<string, string[]>
}

// Localization Types
export interface LocalizationLanguage {
  code: string
  name: string
  native_name: string
  progress: number
  strings_total: number
  strings_translated: number
  reviewers?: Array<{ id: string; name: string }>
  updated_at: string
}

export interface LocalizationProjectLanguage {
  code: string
  status: "draft" | "in_review" | "complete"
  completion: number
  reviewers: Array<{ id: string; name: string }>
}

export interface LocalizationProject {
  id: string
  slug: string
  name: string
  description?: string
  languages: LocalizationProjectLanguage[]
  owner?: { id: string; name: string }
  updated_at: string
  created_at: string
}

export type LocalizationStringStatus = "draft" | "in_review" | "approved" | "rejected"

export interface LocalizationStringTranslation {
  language: string
  text: string
  status: LocalizationStringStatus
  updated_at: string
  updated_by?: { id: string; name: string }
  feedback?: string
}

export interface LocalizationString {
  id: string
  key: string
  context?: string
  description?: string
  screenshots?: string[]
  source_text: string
  status: LocalizationStringStatus
  translations: LocalizationStringTranslation[]
  metadata?: Record<string, any>
  updated_at: string
}

export interface LocalizationSubmissionPayload {
  key: string
  language: string
  translation: string
  context?: string
  metadata?: Record<string, any>
}

export interface LocalizationApproval {
  id: string
  string_id: string
  language: string
  status: LocalizationStringStatus
  assigned_to: { id: string; name: string }
  submitted_at: string
  updated_at: string
  notes?: string
}

// Analytics Types (extended for Phase 1)
export interface AnalyticsRealtimeUser {
  id: string
  username: string
  location?: string
  device_type?: string
  current_activity?: string
  current_room_id?: string
  session_start?: string
}

export interface AnalyticsRealtimeRoom {
  id: string
  name: string
  viewer_count: number
  max_viewers?: number
  duration_seconds?: number
  video?: {
    id?: string
    title?: string
    duration?: number
    current_time?: number
  }
}

export interface AnalyticsRealtimeSeriesPoint {
  timestamp: string
  active_users: number
  concurrent_streams: number
  messages_per_minute: number
  bandwidth_tb_per_hour: number
}

export interface AnalyticsRealtimeSnapshot {
  active_users: number
  concurrent_streams: number
  messages_per_minute: number
  bandwidth_usage: number
  active_parties?: number
  user_growth_rate?: number
  stream_growth_rate?: number
  chat_activity_rate?: number
  bandwidth_growth_rate?: number
  live_users?: AnalyticsRealtimeUser[]
  active_rooms?: AnalyticsRealtimeRoom[]
  geo_distribution?: Array<{ country: string; users: number }>
  device_breakdown?: Array<{ device: string; percentage: number }>
  time_series?: AnalyticsRealtimeSeriesPoint[]
}

export interface AnalyticsAdvancedQueryInput {
  metrics: string[]
  dimensions?: string[]
  filters?: Record<string, any>
  date_range?: {
    start: string
    end: string
  }
  granularity?: "hour" | "day" | "week" | "month"
  limit?: number
  order_by?: string[]
}

export interface AnalyticsAdvancedQueryResponse {
  columns: string[]
  rows: Array<Record<string, any>>
  metadata?: Record<string, any>
}

// Social Types
export interface SocialGroupMembership {
  role?: 'owner' | 'admin' | 'moderator' | 'member'
  status?: string
  joined_at?: string
  last_active?: string
}

export interface SocialGroup {
  id: number
  name: string
  description: string
  is_public: boolean
  member_count: number
  created_at: string
  owner: User
  is_member: boolean
  is_owner?: boolean
  avatar?: string
  image?: string
  category?: string
  tags?: string[]
  max_members?: number
  privacy?: 'public' | 'private' | 'invite-only'
  requires_invite?: boolean
  membership?: SocialGroupMembership
}

export interface SocialGroupMember {
  id: number | string
  user: User
  role?: 'owner' | 'admin' | 'moderator' | 'member'
  joined_at?: string
  last_active?: string
  status?: string
  is_active?: boolean
  is_banned?: boolean
}

export interface SocialGroupDetail extends SocialGroup {
  members?: SocialGroupMember[]
  pending_members?: SocialGroupMember[]
}

// Messaging Types
export interface RawConversation {
  id: number | string
  type?: 'direct' | 'group'
  name?: string
  participants: Array<RawUser | User>
  last_message?: RawMessage
  unread_count: number
  created_at: string
  updated_at: string
  [key: string]: unknown
}

export interface RawMessage {
  id: string
  conversation: number | string
  sender: RawUser | User
  content: string
  message_type: 'text' | 'image' | 'file' | 'system'
  sent_at?: string
  created_at?: string
  is_read: boolean
  attachments?: Array<{ id: string; name: string; url: string; type: string; size?: number }>
  reply_to?: string
  [key: string]: unknown
}

export interface Conversation {
  id: string
  type: 'direct' | 'group'
  name?: string
  participants: User[]
  lastMessage?: Message
  unreadCount: number
  createdAt: string
  updatedAt: string
}

export interface Message {
  id: string
  conversationId: string
  sender: User
  senderId?: string
  content: string
  type: 'text' | 'image' | 'file' | 'system'
  createdAt: string
  isRead: boolean
  attachments?: Array<{ id: string; name: string; url: string; type: string; size?: number }>
  replyTo?: string
}

// Support Types
export interface FAQCategory {
  id: string
  name: string
  slug?: string
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
  is_published?: boolean
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
  avatar?: string | null
  avatar_url?: string | null
  display_name?: string
  is_moderator?: boolean
  is_online?: boolean
  last_seen?: string
  is_typing?: boolean
}

export interface ChatActiveUsersResponse {
  active_users: ChatUser[]
  total_active: number
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
  metadata?: Record<string, any>
}

export interface IntegrationDefinition {
  id: string
  provider: string
  name: string
  description: string
  capabilities: string[]
  categories?: string[]
  icon?: string
  scopes?: string[]
}

export interface IntegrationConnection {
  id: string
  provider: string
  display_name: string
  status: 'connected' | 'pending' | 'error'
  connected_at?: string
  account_email?: string
  permissions?: string[]
  expires_at?: string
  last_error?: string | null
  metadata?: Record<string, any>
}

export interface IntegrationStatusOverview {
  provider: string
  status: 'available' | 'degraded' | 'unavailable'
  last_checked_at?: string
  issues?: string[]
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
  // Integration-specific health status
  google_drive?: boolean
  s3_storage?: boolean
  discord?: boolean
  slack?: boolean
  webhooks?: boolean
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
export interface RawVideo {
  id: string
  title: string
  description: string
  uploader: {
    id: string
    username?: string
    first_name?: string
    last_name?: string
    display_name?: string
    avatar?: string
    is_premium?: boolean
  }
  thumbnail?: string | null
  duration?: number | string | null
  file_size?: number | null
  source_type?: 'upload' | 'url' | 'drive'
  source_url?: string
  resolution?: string
  codec?: string
  bitrate?: number
  fps?: number
  visibility?: 'public' | 'private' | 'unlisted'
  status?: 'pending' | 'processing' | 'ready' | 'failed'
  allow_download?: boolean
  require_premium?: boolean
  view_count?: number
  like_count?: number
  comments_count?: number
  is_liked?: boolean
  can_edit?: boolean
  can_download?: boolean
  created_at?: string
  updated_at?: string
  uploaded_at?: string
  upload_progress?: number
  format?: string
  [key: string]: unknown
}

export interface Video {
  id: string
  title: string
  description: string
  uploader: User & {
    displayName?: string
  }
  thumbnail?: string | null
  duration?: number
  duration_formatted?: string  // Added for UI compatibility
  file_size?: number           // Added for UI compatibility (renamed from size)
  size?: number | null
  sourceType?: 'upload' | 'url' | 'drive'
  sourceUrl?: string
  resolution?: string
  codec?: string
  bitrate?: number
  fps?: number
  visibility?: 'public' | 'private' | 'unlisted'
  status?: 'pending' | 'processing' | 'ready' | 'failed'
  allowDownload?: boolean
  requirePremium?: boolean
  views: number
  view_count: number           // Added for UI compatibility
  likes: number
  comments: number
  isLiked?: boolean
  canEdit?: boolean
  canDownload?: boolean
  createdAt?: string
  created_at?: string          // Added for UI compatibility
  updatedAt?: string
  uploadedAt?: string
  uploadProgress?: number
  format?: string
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
  type: string
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
    total_users?: number
    active_users_today?: number
    active_parties?: number
    total_parties?: number
    total_watch_time_hours?: number
    total_watch_time?: number
    videos_watched?: number
    watch_time?: number
    new_users_today?: number
    [key: string]: any
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
