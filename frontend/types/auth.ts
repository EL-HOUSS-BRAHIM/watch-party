export interface User {
  id: string
  username: string
  email: string
  first_name: string
  last_name: string
  avatar?: string
  is_premium: boolean
  is_verified: boolean
  created_at: string
  updated_at: string
  preferences: UserPreferences
}

export interface UserPreferences {
  theme: "light" | "dark" | "system"
  language: string
  timezone: string
  notifications: NotificationSettings
  privacy: PrivacySettings
  video: VideoSettings
}

export interface NotificationSettings {
  email: boolean
  push: boolean
  chat: boolean
  friend_requests: boolean
  party_invites: boolean
  system_updates: boolean
}

export interface PrivacySettings {
  profile_visibility: "public" | "friends" | "private"
  show_online_status: boolean
  allow_friend_requests: boolean
  show_watch_history: boolean
}

export interface VideoSettings {
  default_quality: "auto" | "480p" | "720p" | "1080p" | "4k"
  autoplay: boolean
  subtitles: boolean
  volume: number
}

export interface LoginCredentials {
  email: string
  password: string
  remember_me?: boolean
}

export interface RegisterData {
  email: string
  password: string
  first_name: string
  last_name: string
  confirm_password?: string
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  user: User
}

export interface PasswordResetRequest {
  email: string
}

export interface PasswordReset {
  token: string
  password: string
  password_confirm: string
}

export interface TwoFactorSetup {
  secret: string
  qr_code: string
  backup_codes: string[]
}

export interface TwoFactorVerification {
  code: string
}
