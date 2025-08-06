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
    resendVerification: '/api/auth/resend-verification/',
    profile: '/api/auth/profile/',
    twoFactorSetup: '/api/auth/2fa/setup/',
    twoFactorVerify: '/api/auth/2fa/verify/',
    twoFactorDisable: '/api/auth/2fa/disable/',
    sessions: '/api/auth/sessions/',
    sessionDelete: (sessionId: string) => `/api/auth/sessions/${sessionId}/`,
    // Social Authentication
    socialAuth: (provider: string) => `/api/auth/social/${provider}/`,
    googleAuth: '/api/auth/social/google/',
    githubAuth: '/api/auth/social/github/',
    // Google Drive Integration
    googleDriveAuth: '/api/auth/google-drive/auth/',
    googleDriveDisconnect: '/api/auth/google-drive/disconnect/',
    googleDriveStatus: '/api/auth/google-drive/status/',
  },

  // Users endpoints - MASSIVE EXPANSION for social features
  users: {
    dashboardStats: '/api/users/dashboard/stats/',
    profile: '/api/users/profile/',
    profileUpdate: '/api/users/profile/update/',
    avatarUpload: '/api/users/avatar/upload/',
    achievements: '/api/users/achievements/',
    stats: '/api/users/stats/',
    onboarding: '/api/users/onboarding/',
    password: '/api/users/password/',
    inventory: '/api/users/inventory/',
    
    // Session Management
    sessions: '/api/users/sessions/',
    sessionDelete: (sessionId: string) => `/api/users/sessions/${sessionId}/`,
    revokeAllSessions: '/api/users/sessions/revoke-all/',
    
    // Two-Factor Authentication
    twoFactorEnable: '/api/users/2fa/enable/',
    twoFactorDisable: '/api/users/2fa/disable/',
    twoFactorSetup: '/api/users/2fa/setup/',
    
    // Friends & Social System
    friends: '/api/users/friends/',
    friendRequest: '/api/users/friends/request/',
    friendSuggestions: '/api/users/friends/suggestions/',
    friendRequests: '/api/users/friends/requests/',
    acceptFriendRequest: (requestId: string) => `/api/users/friends/${requestId}/accept/`,
    declineFriendRequest: (requestId: string) => `/api/users/friends/${requestId}/decline/`,
    sendFriendRequest: (userId: string) => `/api/users/${userId}/friend-request/`,
    blockUser: (userId: string) => `/api/users/${userId}/block/`,
    acceptFriendship: (friendshipId: string) => `/api/users/friends/${friendshipId}/accept/`,
    declineFriendship: (friendshipId: string) => `/api/users/friends/${friendshipId}/decline/`,
    removeFriend: (username: string) => `/api/users/friends/${username}/remove/`,
    activity: '/api/users/activity/',
    suggestions: '/api/users/suggestions/',
    block: '/api/users/block/',
    unblock: '/api/users/unblock/',
    userProfile: (userId: string) => `/api/users/${userId}/profile/`,
    mutualFriends: (userId: string) => `/api/users/${userId}/mutual-friends/`,
    onlineStatus: '/api/users/online-status/',
    watchHistory: '/api/users/watch-history/',
    favorites: '/api/users/favorites/',
    addFavorite: '/api/users/favorites/add/',
    removeFavorite: (favoriteId: string) => `/api/users/favorites/${favoriteId}/remove/`,
    readNotification: (notificationId: string) => `/api/users/notifications/${notificationId}/read/`,
    markAllNotificationsRead: '/api/users/notifications/mark-all-read/',
    reportUser: '/api/users/report/',
    
    // User Search & Discovery
    search: '/api/users/search/',
    notifications: '/api/users/notifications/',
    
    // Settings
    settings: '/api/users/settings/',
    notificationSettings: '/api/users/notifications/settings/',
    privacySettings: '/api/users/privacy/settings/',
    
    // Data Management
    exportData: '/api/users/export-data/',
    deleteAccount: '/api/users/delete-account/',
  },

  // Videos endpoints - Enhanced with analytics, comments, and Google Drive
  videos: {
    list: '/api/videos/',
    create: '/api/videos/',
    detail: (id: string) => `/api/videos/${id}/`,
    upload: '/api/videos/upload/',
    uploadStatus: (uploadId: string) => `/api/videos/upload/${uploadId}/status/`,
    stream: (id: string) => `/api/videos/${id}/stream/`,
    like: (id: string) => `/api/videos/${id}/like/`,
    search: '/api/videos/search/',
    
    // Video Comments & Interactions
    comments: (id: string) => `/api/videos/${id}/comments/`,
    download: (id: string) => `/api/videos/${id}/download/`,
    
    // Upload Management
    uploadS3: '/api/videos/upload/s3/',
    completeUpload: (uploadId: string) => `/api/videos/upload/${uploadId}/complete/`,
    
    // Video Metadata & Processing
    thumbnail: (videoId: string) => `/api/videos/${videoId}/thumbnail/`,
    analytics: (videoId: string) => `/api/videos/${videoId}/analytics/`,
    processingStatus: (videoId: string) => `/api/videos/${videoId}/processing-status/`,
    qualityVariants: (videoId: string) => `/api/videos/${videoId}/quality-variants/`,
    regenerateThumbnail: (videoId: string) => `/api/videos/${videoId}/regenerate-thumbnail/`,
    share: (videoId: string) => `/api/videos/${videoId}/share/`,
    
    // Advanced Analytics
    detailedAnalytics: (videoId: string) => `/api/videos/${videoId}/analytics/detailed/`,
    heatmapAnalytics: (videoId: string) => `/api/videos/${videoId}/analytics/heatmap/`,
    retentionAnalytics: (videoId: string) => `/api/videos/${videoId}/analytics/retention/`,
    journeyAnalytics: (videoId: string) => `/api/videos/${videoId}/analytics/journey/`,
    comparativeAnalytics: (videoId: string) => `/api/videos/${videoId}/analytics/comparative/`,
    
    // Channel Analytics
    channelAnalytics: '/api/videos/analytics/channel/',
    trending: '/api/videos/analytics/trending/',
    
    // Video Management
    validateUrl: '/api/videos/validate-url/',
    advancedSearch: '/api/videos/search/advanced/',
    
    // Google Drive Integration
    gdrive: '/api/videos/gdrive/',
    gdriveUpload: '/api/videos/gdrive/upload/',
    gdriveDelete: (videoId: string) => `/api/videos/gdrive/${videoId}/delete/`,
    gdriveStream: (videoId: string) => `/api/videos/gdrive/${videoId}/stream/`,
    
    // Video Proxy
    proxy: (videoId: string) => `/api/videos/${videoId}/proxy/`,
  },

  // Parties endpoints - Enhanced with advanced features and invitations
  parties: {
    list: '/api/parties/',
    create: '/api/parties/',
    detail: (id: string) => `/api/parties/${id}/`,
    join: (id: string) => `/api/parties/${id}/join/`,
    leave: (id: string) => `/api/parties/${id}/leave/`,
    control: (id: string) => `/api/parties/${id}/control/`,
    participants: (id: string) => `/api/parties/${id}/participants/`,
    joinByCode: '/api/parties/join-by-code/',
    
    // Special Discovery Endpoints
    recent: '/api/parties/recent/',
    public: '/api/parties/public/',
    trending: '/api/parties/trending/',
    recommendations: '/api/parties/recommendations/',
    joinByInvite: '/api/parties/join-by-invite/',
    search: '/api/parties/search/',
    report: '/api/parties/report/',
    
    // Party-Specific Enhanced Features
    generateInvite: (partyId: string) => `/api/parties/${partyId}/generate-invite/`,
    analytics: (partyId: string) => `/api/parties/${partyId}/analytics/`,
    updateAnalytics: (partyId: string) => `/api/parties/${partyId}/update-analytics/`,
    
    // Party CRUD Extensions
    start: (id: string) => `/api/parties/${id}/start/`,
    chat: (id: string) => `/api/parties/${id}/chat/`,
    react: (id: string) => `/api/parties/${id}/react/`,
    invite: (id: string) => `/api/parties/${id}/invite/`,
    selectGdriveMovie: (id: string) => `/api/parties/${id}/select_gdrive_movie/`,
    syncState: (id: string) => `/api/parties/${id}/sync_state/`,
    
    // Invitations System
    invitations: '/api/parties/invitations/',
    invitationDetail: (id: string) => `/api/parties/invitations/${id}/`,
    acceptInvitation: (id: string) => `/api/parties/invitations/${id}/accept/`,
    declineInvitation: (id: string) => `/api/parties/invitations/${id}/decline/`,
    invitationAnalytics: (id: string) => `/api/parties/invitations/${id}/analytics/`,
    joinByCodeInvitation: (id: string) => `/api/parties/invitations/${id}/join_by_code/`,
    kickParticipant: (id: string) => `/api/parties/invitations/${id}/kick_participant/`,
    promoteParticipant: (id: string) => `/api/parties/invitations/${id}/promote_participant/`,
  },

  // Chat endpoints - Enhanced with moderation and management
  chat: {
    messages: (partyId: string) => `/api/chat/${partyId}/messages/`,
    send: (partyId: string) => `/api/chat/${partyId}/messages/send/`,
    settings: (roomId: string) => `/api/chat/${roomId}/settings/`,
    
    // Chat Room Management
    join: (roomId: string) => `/api/chat/${roomId}/join/`,
    leave: (roomId: string) => `/api/chat/${roomId}/leave/`,
    activeUsers: (roomId: string) => `/api/chat/${roomId}/active-users/`,
    
    // Chat Moderation
    moderate: (roomId: string) => `/api/chat/${roomId}/moderate/`,
    ban: (roomId: string) => `/api/chat/${roomId}/ban/`,
    unban: (roomId: string) => `/api/chat/${roomId}/unban/`,
    moderationLog: (roomId: string) => `/api/chat/${roomId}/moderation-log/`,
    
    // Chat Statistics
    stats: (roomId: string) => `/api/chat/${roomId}/stats/`,
    
    // Legacy Routes
    history: (partyId: string) => `/api/chat/history/${partyId}/`,
    generalModerate: '/api/chat/moderate/',
  },

  // Billing endpoints - Complete implementation
  billing: {
    plans: '/api/billing/plans/',
    subscription: '/api/billing/subscription/',
    subscribe: '/api/billing/subscribe/',
    paymentMethods: '/api/billing/payment-methods/',
    history: '/api/billing/history/',
    
    // Enhanced Billing Features
    resumeSubscription: '/api/billing/subscription/resume/',
    setDefaultPaymentMethod: (methodId: string) => `/api/billing/payment-methods/${methodId}/set-default/`,
    invoice: (invoiceId: string) => `/api/billing/invoices/${invoiceId}/`,
    downloadInvoice: (invoiceId: string) => `/api/billing/invoices/${invoiceId}/download/`,
    address: '/api/billing/address/',
    validatePromoCode: '/api/billing/promo-code/validate/',
    stripeWebhook: '/api/billing/webhooks/stripe/',
  },

  // Analytics endpoints - MASSIVE EXPANSION for business intelligence
  analytics: {
    dashboard: '/api/analytics/dashboard/',
    user: '/api/analytics/user/',
    video: (videoId: string) => `/api/analytics/video/${videoId}/`,
    
    // Basic Analytics
    basic: '/api/analytics/',
    userStats: '/api/analytics/user-stats/',
    partyStats: (partyId: string) => `/api/analytics/party-stats/${partyId}/`,
    adminAnalytics: '/api/analytics/admin/analytics/',
    export: '/api/analytics/export/',
    
    // Dashboard Analytics
    party: (partyId: string) => `/api/analytics/party/${partyId}/`,
    system: '/api/analytics/system/',
    performance: '/api/analytics/system/performance/',
    revenue: '/api/analytics/revenue/',
    retention: '/api/analytics/retention/',
    content: '/api/analytics/content/',
    events: '/api/analytics/events/',
    
    // Advanced Analytics
    realtime: '/api/analytics/dashboard/realtime/',
    advancedQuery: '/api/analytics/advanced/query/',
    abTesting: '/api/analytics/ab-testing/',
    predictive: '/api/analytics/predictive/',
    
    // Extended Analytics
    platformOverview: '/api/analytics/platform-overview/',
    userBehavior: '/api/analytics/user-behavior/',
    contentPerformance: '/api/analytics/content-performance/',
    revenueAdvanced: '/api/analytics/revenue-advanced/',
    personal: '/api/analytics/personal/',
    realTimeData: '/api/analytics/real-time/',
  },

  // Notifications endpoints - Complete implementation with admin features
  notifications: {
    list: '/api/notifications/',
    markRead: (id: string) => `/api/notifications/${id}/mark-read/`,
    preferences: '/api/notifications/preferences/',
    pushTokenUpdate: '/api/notifications/push/token/update/',
    
    // Enhanced Notification Management
    delete: (id: string) => `/api/notifications/${id}/`,
    clearAll: '/api/notifications/clear-all/',
    updatePreferences: '/api/notifications/preferences/update/',
    removePushToken: '/api/notifications/push/token/remove/',
    testPush: '/api/notifications/push/test/',
    broadcast: '/api/notifications/push/broadcast/',
    
    // Admin Features
    templates: '/api/notifications/templates/',
    templateDetail: (id: string) => `/api/notifications/templates/${id}/`,
    channels: '/api/notifications/channels/',
    
    // Statistics & Bulk Operations
    stats: '/api/notifications/stats/',
    deliveryStats: '/api/notifications/delivery-stats/',
    bulkSend: '/api/notifications/bulk/send/',
    cleanup: '/api/notifications/cleanup/',
  },

  // Integrations endpoints - Enhanced with multiple providers
  integrations: {
    googleDriveAuthUrl: '/api/integrations/google-drive/auth-url/',
    googleDriveFiles: '/api/integrations/google-drive/files/',
    s3PresignedUpload: '/api/integrations/s3/presigned-upload/',
    
    // Additional Integration Features
    authUrl: (provider: string) => `/api/integrations/${provider}/auth-url/`,
    callback: (provider: string) => `/api/integrations/${provider}/callback/`,
    health: '/api/integrations/health/',
    gdriveStreamingUrl: (fileId: string) => `/api/integrations/files/${fileId}/streaming-url/`,
  },

  // Interactive features endpoints - Complete implementation
  interactive: {
    reactions: (partyId: string) => `/api/interactive/parties/${partyId}/reactions/`,
    createReaction: (partyId: string) => `/api/interactive/parties/${partyId}/reactions/create/`,
    createPoll: (partyId: string) => `/api/interactive/parties/${partyId}/polls/create/`,
    
    // Voice Chat Features
    voiceChat: (partyId: string) => `/api/interactive/parties/${partyId}/voice-chat/`,
    manageVoiceChat: (partyId: string) => `/api/interactive/parties/${partyId}/voice-chat/manage/`,
    
    // Screen Sharing Features
    screenShares: (partyId: string) => `/api/interactive/parties/${partyId}/screen-shares/`,
    updateScreenShare: (shareId: string) => `/api/interactive/screen-shares/${shareId}/update/`,
    screenShareAnnotations: (shareId: string) => `/api/interactive/screen-shares/${shareId}/annotations/`,
    
    // Interactive Polls (Enhanced)
    publishPoll: (pollId: string) => `/api/interactive/polls/${pollId}/publish/`,
    respondToPoll: (pollId: string) => `/api/interactive/polls/${pollId}/respond/`,
    
    // Analytics
    analytics: (partyId: string) => `/api/interactive/parties/${partyId}/analytics/`,
  },

  // Moderation endpoints - Enhanced features
  moderation: {
    reports: '/api/moderation/reports/',
    reportTypes: '/api/moderation/report-types/',
    contentTypes: '/api/moderation/content-types/',
  },

  // Admin panel endpoints - MASSIVE EXPANSION for complete admin system
  admin: {
    dashboard: '/api/admin/dashboard/',
    users: '/api/admin/users/',
    systemHealth: '/api/admin/system-health/',
    
    // Dashboard & Analytics
    analytics: '/api/admin/analytics/',
    
    // User Management
    suspendUser: (userId: string) => `/api/admin/users/${userId}/suspend/`,
    unsuspendUser: (userId: string) => `/api/admin/users/${userId}/unsuspend/`,
    bulkUserAction: '/api/admin/users/bulk-action/',
    exportUsers: '/api/admin/users/export/',
    userActions: (userId: string) => `/api/admin/users/${userId}/actions/`,
    
    // Party Management
    parties: '/api/admin/parties/',
    deleteParty: (partyId: string) => `/api/admin/parties/${partyId}/delete/`,
    
    // Video Management
    videos: '/api/admin/videos/',
    deleteVideo: (videoId: string) => `/api/admin/videos/${videoId}/delete/`,
    
    // Content Reports
    reports: '/api/admin/reports/',
    resolveReport: (reportId: string) => `/api/admin/reports/${reportId}/resolve/`,
    
    // System Management
    logs: '/api/admin/logs/',
    maintenance: '/api/admin/maintenance/',
    
    // Communication
    broadcast: '/api/admin/broadcast/',
    sendNotification: '/api/admin/notifications/send/',
    
    // Settings
    settings: '/api/admin/settings/',
    updateSettings: '/api/admin/settings/update/',
    
    // Health Monitoring
    healthCheck: '/api/admin/health/check/',
    healthStatus: '/api/admin/health/status/',
    healthMetrics: '/api/admin/health/metrics/',
  },

  // Dashboard endpoints
  dashboard: {
    stats: '/api/dashboard/stats/',
    activities: '/api/dashboard/activities/',
  },

  // Events API - Event scheduling and management system
  events: {
    list: '/api/events/',
    create: '/api/events/',
    detail: (id: string) => `/api/events/${id}/`,
    update: (id: string) => `/api/events/${id}/`,
    delete: (id: string) => `/api/events/${id}/`,
    
    // Event Management
    join: (id: string) => `/api/events/${id}/join/`,
    leave: (id: string) => `/api/events/${id}/leave/`,
    cancel: (id: string) => `/api/events/${id}/cancel/`,
    
    // RSVP Management
    rsvp: (id: string) => `/api/events/${id}/rsvp/`,
    attendees: (id: string) => `/api/events/${id}/attendees/`,
    invitations: (id: string) => `/api/events/${id}/invitations/`,
    sendInvitation: (id: string) => `/api/events/${id}/invite/`,
    
    // Event Discovery
    upcoming: '/api/events/upcoming/',
    my: '/api/events/my/',
    hosted: '/api/events/hosted/',
    search: '/api/events/search/',
    featured: '/api/events/featured/',
    
    // Event Analytics
    analytics: (id: string) => `/api/events/${id}/analytics/`,
    statistics: '/api/events/statistics/',
  },

  // === COMPLETELY NEW API SECTIONS ===

  // Store API - Complete commerce system
  store: {
    items: '/api/store/items/',
    purchase: '/api/store/purchase/',
    inventory: '/api/store/inventory/',
    achievements: '/api/store/achievements/',
    rewards: '/api/store/rewards/',
    claimReward: (rewardId: number) => `/api/store/rewards/${rewardId}/claim/`,
    stats: '/api/store/stats/',
  },

  // Search API - Global search and discovery
  search: {
    global: '/api/search/',
    discover: '/api/search/discover/',
  },

  // Social API - Groups and social features
  social: {
    groups: '/api/social/groups/',
    groupDetail: (groupId: number) => `/api/social/groups/${groupId}/`,
    joinGroup: (groupId: number) => `/api/social/groups/${groupId}/join/`,
    leaveGroup: (groupId: number) => `/api/social/groups/${groupId}/leave/`,
  },

  // Messaging API - Direct messaging system
  messaging: {
    conversations: '/api/messaging/conversations/',
    messages: (conversationId: number) => `/api/messaging/conversations/${conversationId}/messages/`,
  },

  // Support API - Customer support system
  support: {
    faqCategories: '/api/support/faq/categories/',
    faq: '/api/support/faq/',
    voteFaq: (faqId: string) => `/api/support/faq/${faqId}/vote/`,
    viewFaq: (faqId: string) => `/api/support/faq/${faqId}/view/`,
    tickets: '/api/support/tickets/',
    ticketDetail: (ticketId: string) => `/api/support/tickets/${ticketId}/`,
    ticketMessages: (ticketId: string) => `/api/support/tickets/${ticketId}/messages/`,
    feedback: '/api/support/feedback/',
    voteFeedback: (feedbackId: string) => `/api/support/feedback/${feedbackId}/vote/`,
    search: '/api/support/search/',
  },

  // Mobile API - Mobile app support
  mobile: {
    config: '/api/mobile/config/',
    home: '/api/mobile/home/',
    sync: '/api/mobile/sync/',
    pushToken: '/api/mobile/push-token/',
    appInfo: '/api/mobile/app-info/',
  },
} as const

// WebSocket endpoints
export const WS_ENDPOINTS = {
  chat: (partyId: string) => `/ws/chat/${partyId}/`,
  partySync: (partyId: string) => `/ws/party/${partyId}/sync/`,
  interactive: (partyId: string) => `/ws/interactive/${partyId}/`,
} as const
