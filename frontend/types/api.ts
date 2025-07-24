export interface APIResponse<T> {
  data: T
  message?: string
  status: "success" | "error"
}

export interface PaginatedResponse<T> {
  results: T[]
  count: number
  next: string | null
  previous: string | null
  page_size: number
  current_page: number
  total_pages: number
}

export interface APIError {
  message: string
  code: string
  details?: Record<string, string[]>
  status: number
}

// Video types
export interface Video {
  id: string
  title: string
  description: string
  thumbnail: string
  duration: number
  file_size: number
  quality: VideoQuality[]
  source_type: "upload" | "url" | "drive" | "s3"
  source_url?: string
  created_at: string
  updated_at: string
  owner: {
    id: string
    username: string
    avatar?: string
  }
  is_public: boolean
  view_count: number
  like_count: number
  tags: string[]
}

export interface VideoQuality {
  resolution: string
  bitrate: number
  file_url: string
  file_size: number
}

// Party types
export interface WatchParty {
  id: string
  title: string
  description: string
  room_code: string
  video: Video
  host: {
    id: string
    username: string
    avatar?: string
  }
  participants: PartyParticipant[]
  is_public: boolean
  max_participants: number
  current_time: number
  is_playing: boolean
  created_at: string
  started_at?: string
  ended_at?: string
  settings: PartySettings
}

export interface PartyParticipant {
  id: string
  user: {
    id: string
    username: string
    avatar?: string
  }
  joined_at: string
  is_host: boolean
  permissions: ParticipantPermissions
}

export interface ParticipantPermissions {
  can_control_video: boolean
  can_chat: boolean
  can_invite: boolean
  can_kick: boolean
}

export interface PartySettings {
  allow_chat: boolean
  allow_reactions: boolean
  sync_tolerance: number
  auto_pause_on_disconnect: boolean
  require_approval: boolean
}

// Chat types
export interface ChatMessage {
  id: string
  content: string
  user: {
    id: string
    username: string
    avatar?: string
  }
  timestamp: string
  type: "message" | "system" | "reaction"
  reply_to?: string
  reactions: MessageReaction[]
}

export interface MessageReaction {
  emoji: string
  count: number
  users: string[]
}

// Friend types
export interface Friend {
  id: string
  user: {
    id: string
    username: string
    avatar?: string
    is_online: boolean
    last_seen?: string
  }
  status: "pending" | "accepted" | "blocked"
  created_at: string
}

// Notification types
export interface Notification {
  id: string
  type: "friend_request" | "party_invite" | "system" | "chat_mention"
  title: string
  message: string
  data?: Record<string, any>
  is_read: boolean
  created_at: string
  expires_at?: string
}

// Billing types
export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price: number
  currency: string
  interval: "month" | "year"
  features: string[]
  is_popular: boolean
  max_participants: number
  max_storage: number
  max_parties: number
}

export interface Subscription {
  id: string
  plan: SubscriptionPlan
  status: "active" | "canceled" | "past_due" | "unpaid"
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  created_at: string
}

export interface PaymentMethod {
  id: string
  type: "card" | "paypal" | "crypto"
  last_four?: string
  brand?: string
  expires_at?: string
  is_default: boolean
  created_at: string
}

export interface Invoice {
  id: string
  amount: number
  currency: string
  status: "paid" | "pending" | "failed"
  description: string
  created_at: string
  due_date: string
  pdf_url?: string
}
