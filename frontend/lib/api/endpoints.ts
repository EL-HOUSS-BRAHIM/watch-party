/**
 * API Endpoints Configuration
 * Based on the backend API documentation
 */

export const API_ENDPOINTS = {
  // Authentication endpoints - matching backend API.md
  auth: {
    register: '/api/auth/register/',
    login: '/api/auth/login/',
    logout: '/api/auth/logout/',
    refresh: '/api/auth/refresh/',
    forgotPassword: '/api/auth/forgot-password/',
    resetPassword: '/api/auth/reset-password/',
    changePassword: '/api/auth/change-password/',
    verifyEmail: '/api/auth/verify-email/',
    profile: '/api/auth/profile/',
    twoFactorSetup: '/api/auth/2fa/setup/',
    twoFactorVerify: '/api/auth/2fa/verify/',
  },

  // Users endpoints
  users: {
    dashboardStats: '/api/users/dashboard/stats/',
    profile: '/api/users/profile/',
    avatarUpload: '/api/users/avatar/upload/',
    friends: '/api/users/friends/',
    friendRequest: '/api/users/friends/request/',
    search: '/api/users/search/',
    notifications: '/api/users/notifications/',
  },

  // Videos endpoints
  videos: {
    list: '/api/videos/',
    create: '/api/videos/',
    detail: (id: string) => `/api/videos/${id}/`,
    upload: '/api/videos/upload/',
    uploadStatus: (uploadId: string) => `/api/videos/upload/${uploadId}/status/`,
    stream: (id: string) => `/api/videos/${id}/stream/`,
    like: (id: string) => `/api/videos/${id}/like/`,
    search: '/api/videos/search/',
  },

  // Parties endpoints
  parties: {
    list: '/api/parties/',
    create: '/api/parties/',
    detail: (id: string) => `/api/parties/${id}/`,
    join: (id: string) => `/api/parties/${id}/join/`,
    leave: (id: string) => `/api/parties/${id}/leave/`,
    control: (id: string) => `/api/parties/${id}/control/`,
    participants: (id: string) => `/api/parties/${id}/participants/`,
    joinByCode: '/api/parties/join-by-code/',
  },

  // Chat endpoints
  chat: {
    messages: (partyId: string) => `/api/chat/${partyId}/messages/`,
    send: (partyId: string) => `/api/chat/${partyId}/messages/send/`,
    settings: (roomId: string) => `/api/chat/${roomId}/settings/`,
  },

  // Billing endpoints
  billing: {
    plans: '/api/billing/plans/',
    subscription: '/api/billing/subscription/',
    subscribe: '/api/billing/subscribe/',
    paymentMethods: '/api/billing/payment-methods/',
    history: '/api/billing/history/',
  },

  // Analytics endpoints
  analytics: {
    dashboard: '/api/analytics/dashboard/',
    user: '/api/analytics/user/',
    video: (videoId: string) => `/api/analytics/video/${videoId}/`,
  },

  // Notifications endpoints
  notifications: {
    list: '/api/notifications/',
    markRead: (id: string) => `/api/notifications/${id}/mark-read/`,
    preferences: '/api/notifications/preferences/',
    pushTokenUpdate: '/api/notifications/push/token/update/',
  },

  // Integrations endpoints
  integrations: {
    googleDriveAuthUrl: '/api/integrations/google-drive/auth-url/',
    googleDriveFiles: '/api/integrations/google-drive/files/',
    s3PresignedUpload: '/api/integrations/s3/presigned-upload/',
  },

  // Interactive features endpoints
  interactive: {
    reactions: (partyId: string) => `/api/interactive/parties/${partyId}/reactions/`,
    createReaction: (partyId: string) => `/api/interactive/parties/${partyId}/reactions/create/`,
    createPoll: (partyId: string) => `/api/interactive/parties/${partyId}/polls/create/`,
  },

  // Moderation endpoints
  moderation: {
    reports: '/api/moderation/reports/',
    reportTypes: '/api/moderation/report-types/',
  },

  // Admin panel endpoints
  admin: {
    dashboard: '/api/admin/dashboard/',
    users: '/api/admin/users/',
    systemHealth: '/api/admin/system-health/',
  },

  // Dashboard endpoints
  dashboard: {
    stats: '/api/dashboard/stats/',
    activities: '/api/dashboard/activities/',
  },
} as const

// WebSocket endpoints
export const WS_ENDPOINTS = {
  chat: (partyId: string) => `/ws/chat/${partyId}/`,
  partySync: (partyId: string) => `/ws/party/${partyId}/sync/`,
  interactive: (partyId: string) => `/ws/interactive/${partyId}/`,
} as const
