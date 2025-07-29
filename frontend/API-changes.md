# Watch Party API Changes Required

This document outlines the discrepancies between the backend API endpoints and the frontend implementation, and provides a roadmap for aligning them.

## Overview

After comparing the backend API documentation (`BACKEND-endpoints.md`) with the frontend implementation (`FRONTEND-endpoints.md` and `lib/api/endpoints.ts`), several gaps have been identified where the frontend is not utilizing all available backend endpoints.

## 🔴 CRITICAL MISSING ENDPOINTS

### Authentication API
#### Missing from Frontend:
- `POST /api/auth/resend-verification/` - Resend email verification
- `POST /api/auth/2fa/disable/` - Disable 2FA
- `GET /api/auth/sessions/` - List user sessions
- `DELETE /api/auth/sessions/{session_id}/` - Delete specific session
- **Social Authentication:**
  - `GET /api/auth/social/google/` - Google OAuth
  - `GET /api/auth/social/github/` - GitHub OAuth
  - `GET /api/auth/social/{provider}/` - Generic social auth
- **Google Drive Integration:**
  - `GET /api/auth/google-drive/auth/` - Google Drive auth
  - `POST /api/auth/google-drive/disconnect/` - Disconnect Google Drive
  - `GET /api/auth/google-drive/status/` - Google Drive status

#### Action Required:
```typescript
// Add to auth section in endpoints.ts
auth: {
  // ... existing endpoints
  resendVerification: '/api/auth/resend-verification/',
  twoFactorDisable: '/api/auth/2fa/disable/',
  sessions: '/api/auth/sessions/',
  sessionDelete: (sessionId: string) => `/api/auth/sessions/${sessionId}/`,
  socialAuth: (provider: string) => `/api/auth/social/${provider}/`,
  googleAuth: '/api/auth/social/google/',
  githubAuth: '/api/auth/social/github/',
  googleDriveAuth: '/api/auth/google-drive/auth/',
  googleDriveDisconnect: '/api/auth/google-drive/disconnect/',
  googleDriveStatus: '/api/auth/google-drive/status/',
},
```

### Users API
#### Missing from Frontend:
- `PUT /api/users/profile/update/` - Separate update endpoint
- `GET /api/users/achievements/` - User achievements
- `GET /api/users/stats/` - User statistics
- `POST /api/users/onboarding/` - Onboarding flow
- `POST /api/users/password/` - Change password (different from auth)
- `GET /api/users/inventory/` - User inventory
- **Session Management:**
  - `GET /api/users/sessions/` - User sessions
  - `DELETE /api/users/sessions/{session_id}/` - Delete session
  - `POST /api/users/sessions/revoke-all/` - Revoke all sessions
- **Two-Factor Authentication:**
  - `POST /api/users/2fa/enable/` - Enable 2FA
  - `POST /api/users/2fa/disable/` - Disable 2FA
  - `POST /api/users/2fa/setup/` - Setup 2FA
- **Friends & Social (MAJOR GAP):**
  - `GET /api/users/friends/suggestions/` - Friend suggestions
  - `GET /api/users/friends/requests/` - Friend requests
  - `POST /api/users/friends/{request_id}/accept/` - Accept friend request
  - `POST /api/users/friends/{request_id}/decline/` - Decline friend request
  - `POST /api/users/{user_id}/friend-request/` - Send friend request to user
  - `POST /api/users/{user_id}/block/` - Block user
  - `POST /api/users/friends/{friendship_id}/accept/` - Accept friendship
  - `POST /api/users/friends/{friendship_id}/decline/` - Decline friendship
  - `DELETE /api/users/friends/{username}/remove/` - Remove friend
  - `GET /api/users/activity/` - User activity
  - `GET /api/users/suggestions/` - User suggestions
  - `POST /api/users/block/` - Block user
  - `POST /api/users/unblock/` - Unblock user
  - `GET /api/users/{user_id}/profile/` - Get user profile by ID
  - `GET /api/users/{user_id}/mutual-friends/` - Mutual friends
  - `GET /api/users/online-status/` - Online status
  - `GET /api/users/watch-history/` - Watch history
  - `GET /api/users/favorites/` - User favorites
  - `POST /api/users/favorites/add/` - Add to favorites
  - `DELETE /api/users/favorites/{favorite_id}/remove/` - Remove favorite
  - `POST /api/users/notifications/{notification_id}/read/` - Mark notification read
  - `POST /api/users/notifications/mark-all-read/` - Mark all notifications read
  - `POST /api/users/report/` - Report user
- **Settings:**
  - `GET /api/users/settings/` - User settings
  - `GET /api/users/notifications/settings/` - Notification settings
  - `GET /api/users/privacy/settings/` - Privacy settings
- **Data Management:**
  - `POST /api/users/export-data/` - Export user data
  - `POST /api/users/delete-account/` - Delete account

#### Action Required:
```typescript
// Massive expansion needed for users section
users: {
  // ... existing endpoints
  profileUpdate: '/api/users/profile/update/',
  achievements: '/api/users/achievements/',
  stats: '/api/users/stats/',
  onboarding: '/api/users/onboarding/',
  password: '/api/users/password/',
  inventory: '/api/users/inventory/',
  
  // Sessions
  sessions: '/api/users/sessions/',
  sessionDelete: (sessionId: string) => `/api/users/sessions/${sessionId}/`,
  revokeAllSessions: '/api/users/sessions/revoke-all/',
  
  // 2FA
  twoFactorEnable: '/api/users/2fa/enable/',
  twoFactorDisable: '/api/users/2fa/disable/',
  twoFactorSetup: '/api/users/2fa/setup/',
  
  // Friends & Social
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
  
  // Settings
  settings: '/api/users/settings/',
  notificationSettings: '/api/users/notifications/settings/',
  privacySettings: '/api/users/privacy/settings/',
  
  // Data Management
  exportData: '/api/users/export-data/',
  deleteAccount: '/api/users/delete-account/',
},
```

### Videos API
#### Missing from Frontend:
- `GET /api/videos/{id}/comments/` - Video comments
- `GET /api/videos/{id}/download/` - Download video
- `POST /api/videos/upload/s3/` - S3 upload
- `POST /api/videos/upload/{upload_id}/complete/` - Complete upload
- `GET /api/videos/{video_id}/thumbnail/` - Video thumbnail
- `GET /api/videos/{video_id}/analytics/` - Video analytics
- `GET /api/videos/{video_id}/processing-status/` - Processing status
- `GET /api/videos/{video_id}/quality-variants/` - Quality variants
- `POST /api/videos/{video_id}/regenerate-thumbnail/` - Regenerate thumbnail
- `POST /api/videos/{video_id}/share/` - Share video
- **Advanced Analytics:**
  - `GET /api/videos/{video_id}/analytics/detailed/` - Detailed analytics
  - `GET /api/videos/{video_id}/analytics/heatmap/` - Heatmap analytics
  - `GET /api/videos/{video_id}/analytics/retention/` - Retention analytics
  - `GET /api/videos/{video_id}/analytics/journey/` - Journey analytics
  - `GET /api/videos/{video_id}/analytics/comparative/` - Comparative analytics
- **Channel Analytics:**
  - `GET /api/videos/analytics/channel/` - Channel analytics
  - `GET /api/videos/analytics/trending/` - Trending videos
- **Video Management:**
  - `POST /api/videos/validate-url/` - Validate video URL
  - `GET /api/videos/search/advanced/` - Advanced search
- **Google Drive Integration:**
  - `GET /api/videos/gdrive/` - Google Drive videos
  - `POST /api/videos/gdrive/upload/` - Upload to Google Drive
  - `DELETE /api/videos/gdrive/{video_id}/delete/` - Delete from Google Drive
  - `GET /api/videos/gdrive/{video_id}/stream/` - Stream from Google Drive
- **Video Proxy:**
  - `GET /api/videos/{video_id}/proxy/` - Video proxy

#### Action Required:
```typescript
videos: {
  // ... existing endpoints
  comments: (id: string) => `/api/videos/${id}/comments/`,
  download: (id: string) => `/api/videos/${id}/download/`,
  uploadS3: '/api/videos/upload/s3/',
  completeUpload: (uploadId: string) => `/api/videos/upload/${uploadId}/complete/`,
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
```

### Parties API
#### Missing from Frontend:
- **Special Endpoints:**
  - `GET /api/parties/recent/` - Recent parties
  - `GET /api/parties/public/` - Public parties
  - `GET /api/parties/trending/` - Trending parties
  - `GET /api/parties/recommendations/` - Party recommendations
  - `POST /api/parties/join-by-invite/` - Join by invite
  - `GET /api/parties/search/` - Search parties
  - `POST /api/parties/report/` - Report party
- **Party-Specific Enhanced:**
  - `POST /api/parties/{party_id}/generate-invite/` - Generate invite
  - `GET /api/parties/{party_id}/analytics/` - Party analytics
  - `POST /api/parties/{party_id}/update-analytics/` - Update analytics
- **Party CRUD Extensions:**
  - `POST /api/parties/{id}/start/` - Start party
  - `POST /api/parties/{id}/chat/` - Party chat
  - `POST /api/parties/{id}/react/` - React in party
  - `POST /api/parties/{id}/invite/` - Invite to party
  - `POST /api/parties/{id}/select_gdrive_movie/` - Select Google Drive movie
  - `GET /api/parties/{id}/sync_state/` - Get sync state
- **Invitations System:**
  - `GET /api/parties/invitations/` - List invitations
  - `GET /api/parties/invitations/{id}/` - Get invitation details
  - `POST /api/parties/invitations/{id}/accept/` - Accept invitation
  - `POST /api/parties/invitations/{id}/decline/` - Decline invitation
  - `GET /api/parties/invitations/{id}/analytics/` - Invitation analytics
  - `POST /api/parties/invitations/{id}/join_by_code/` - Join by code
  - `POST /api/parties/invitations/{id}/kick_participant/` - Kick participant
  - `POST /api/parties/invitations/{id}/promote_participant/` - Promote participant

#### Action Required:
```typescript
parties: {
  // ... existing endpoints
  recent: '/api/parties/recent/',
  public: '/api/parties/public/',
  trending: '/api/parties/trending/',
  recommendations: '/api/parties/recommendations/',
  joinByInvite: '/api/parties/join-by-invite/',
  search: '/api/parties/search/',
  report: '/api/parties/report/',
  
  // Party-Specific Enhanced
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
```

### Chat API
#### Missing from Frontend:
- **Chat Room Management:**
  - `POST /api/chat/{room_id}/join/` - Join chat room
  - `POST /api/chat/{room_id}/leave/` - Leave chat room
  - `GET /api/chat/{room_id}/active-users/` - Active users
- **Chat Moderation:**
  - `POST /api/chat/{room_id}/moderate/` - Moderate chat
  - `POST /api/chat/{room_id}/ban/` - Ban user from chat
  - `POST /api/chat/{room_id}/unban/` - Unban user from chat
  - `GET /api/chat/{room_id}/moderation-log/` - Moderation log
- **Chat Statistics:**
  - `GET /api/chat/{room_id}/stats/` - Chat statistics
- **Legacy Routes:**
  - `GET /api/chat/history/{party_id}/` - Chat history
  - `POST /api/chat/moderate/` - General moderation

#### Action Required:
```typescript
chat: {
  // ... existing endpoints
  join: (roomId: string) => `/api/chat/${roomId}/join/`,
  leave: (roomId: string) => `/api/chat/${roomId}/leave/`,
  activeUsers: (roomId: string) => `/api/chat/${roomId}/active-users/`,
  moderate: (roomId: string) => `/api/chat/${roomId}/moderate/`,
  ban: (roomId: string) => `/api/chat/${roomId}/ban/`,
  unban: (roomId: string) => `/api/chat/${roomId}/unban/`,
  moderationLog: (roomId: string) => `/api/chat/${roomId}/moderation-log/`,
  stats: (roomId: string) => `/api/chat/${roomId}/stats/`,
  history: (partyId: string) => `/api/chat/history/${partyId}/`,
  generalModerate: '/api/chat/moderate/',
},
```

### Billing API
#### Missing from Frontend:
- `POST /api/billing/subscription/resume/` - Resume subscription
- `POST /api/billing/payment-methods/{pk}/set-default/` - Set default payment method
- `GET /api/billing/invoices/{invoice_id}/` - Get invoice details
- `GET /api/billing/invoices/{invoice_id}/download/` - Download invoice
- `GET /api/billing/address/` - Get billing address
- `PUT /api/billing/address/` - Update billing address
- `POST /api/billing/promo-code/validate/` - Validate promo code
- `POST /api/billing/webhooks/stripe/` - Stripe webhooks

#### Action Required:
```typescript
billing: {
  // ... existing endpoints
  resumeSubscription: '/api/billing/subscription/resume/',
  setDefaultPaymentMethod: (methodId: string) => `/api/billing/payment-methods/${methodId}/set-default/`,
  invoice: (invoiceId: string) => `/api/billing/invoices/${invoiceId}/`,
  downloadInvoice: (invoiceId: string) => `/api/billing/invoices/${invoiceId}/download/`,
  address: '/api/billing/address/',
  validatePromoCode: '/api/billing/promo-code/validate/',
  stripeWebhook: '/api/billing/webhooks/stripe/',
},
```

## 🟡 MAJOR MISSING FEATURES

### Analytics API (Massive Gap)
Currently frontend only has basic analytics. Backend has extensive analytics:

#### Missing from Frontend:
- **Basic Analytics:**
  - `GET /api/analytics/` - Basic analytics
  - `GET /api/analytics/user-stats/` - User stats
  - `GET /api/analytics/party-stats/{party_id}/` - Party stats
  - `GET /api/analytics/admin/analytics/` - Admin analytics
  - `GET /api/analytics/export/` - Export analytics
- **Dashboard Analytics:**
  - `GET /api/analytics/party/{party_id}/` - Party analytics
  - `GET /api/analytics/system/` - System analytics
  - `GET /api/analytics/system/performance/` - Performance analytics
  - `GET /api/analytics/revenue/` - Revenue analytics
  - `GET /api/analytics/retention/` - Retention analytics
  - `GET /api/analytics/content/` - Content analytics
  - `GET /api/analytics/events/` - Events analytics
- **Advanced Analytics:**
  - `GET /api/analytics/dashboard/realtime/` - Real-time dashboard
  - `POST /api/analytics/advanced/query/` - Advanced query
  - `GET /api/analytics/ab-testing/` - A/B testing
  - `GET /api/analytics/predictive/` - Predictive analytics
- **Extended Analytics:**
  - `GET /api/analytics/platform-overview/` - Platform overview
  - `GET /api/analytics/user-behavior/` - User behavior
  - `GET /api/analytics/content-performance/` - Content performance
  - `GET /api/analytics/revenue-advanced/` - Advanced revenue
  - `GET /api/analytics/personal/` - Personal analytics
  - `GET /api/analytics/real-time/` - Real-time analytics

#### Action Required:
```typescript
analytics: {
  // ... existing endpoints
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
```

### Notifications API (Significant Gap)
#### Missing from Frontend:
- `DELETE /api/notifications/{pk}/` - Delete notification
- `POST /api/notifications/clear-all/` - Clear all notifications
- `PUT /api/notifications/preferences/update/` - Update preferences
- `POST /api/notifications/push/token/remove/` - Remove push token
- `POST /api/notifications/push/test/` - Test push notification
- `POST /api/notifications/push/broadcast/` - Broadcast notification
- **Admin Features:**
  - `GET /api/notifications/templates/` - Notification templates
  - `GET /api/notifications/templates/{pk}/` - Template details
  - `GET /api/notifications/channels/` - Notification channels
- **Statistics & Bulk Operations:**
  - `GET /api/notifications/stats/` - Notification stats
  - `GET /api/notifications/delivery-stats/` - Delivery stats
  - `POST /api/notifications/bulk/send/` - Bulk send
  - `POST /api/notifications/cleanup/` - Cleanup notifications

#### Action Required:
```typescript
notifications: {
  // ... existing endpoints
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
```

### Interactive API (Partial Implementation)
#### Missing from Frontend:
- **Voice Chat:**
  - `GET /api/interactive/parties/{party_id}/voice-chat/` - Voice chat
  - `POST /api/interactive/parties/{party_id}/voice-chat/manage/` - Manage voice chat
- **Screen Sharing:**
  - `GET /api/interactive/parties/{party_id}/screen-shares/` - Screen shares
  - `PUT /api/interactive/screen-shares/{share_id}/update/` - Update screen share
  - `POST /api/interactive/screen-shares/{share_id}/annotations/` - Screen share annotations
- **Interactive Polls (Partial):**
  - `POST /api/interactive/polls/{poll_id}/publish/` - Publish poll
  - `POST /api/interactive/polls/{poll_id}/respond/` - Respond to poll
- **Analytics:**
  - `GET /api/interactive/parties/{party_id}/analytics/` - Interactive analytics

#### Action Required:
```typescript
interactive: {
  // ... existing endpoints
  voiceChat: (partyId: string) => `/api/interactive/parties/${partyId}/voice-chat/`,
  manageVoiceChat: (partyId: string) => `/api/interactive/parties/${partyId}/voice-chat/manage/`,
  screenShares: (partyId: string) => `/api/interactive/parties/${partyId}/screen-shares/`,
  updateScreenShare: (shareId: string) => `/api/interactive/screen-shares/${shareId}/update/`,
  screenShareAnnotations: (shareId: string) => `/api/interactive/screen-shares/${shareId}/annotations/`,
  publishPoll: (pollId: string) => `/api/interactive/polls/${pollId}/publish/`,
  respondToPoll: (pollId: string) => `/api/interactive/polls/${pollId}/respond/`,
  analytics: (partyId: string) => `/api/interactive/parties/${partyId}/analytics/`,
},
```

### Admin API (Significant Gap)
#### Missing from Frontend:
- **Dashboard & Analytics:**
  - `GET /api/admin/analytics/` - Admin analytics
- **User Management:**
  - `POST /api/admin/users/{user_id}/suspend/` - Suspend user
  - `POST /api/admin/users/{user_id}/unsuspend/` - Unsuspend user
  - `POST /api/admin/users/bulk-action/` - Bulk user actions
  - `GET /api/admin/users/export/` - Export users
  - `GET /api/admin/users/{user_id}/actions/` - User actions
- **Party Management:**
  - `GET /api/admin/parties/` - Admin parties
  - `DELETE /api/admin/parties/{party_id}/delete/` - Delete party
- **Video Management:**
  - `GET /api/admin/videos/` - Admin videos
  - `DELETE /api/admin/videos/{video_id}/delete/` - Delete video
- **Content Reports:**
  - `GET /api/admin/reports/` - Admin reports
  - `POST /api/admin/reports/{report_id}/resolve/` - Resolve report
- **System Management:**
  - `GET /api/admin/logs/` - System logs
  - `GET /api/admin/maintenance/` - System maintenance
- **Communication:**
  - `POST /api/admin/broadcast/` - Broadcast message
  - `POST /api/admin/notifications/send/` - Send notification
- **Settings:**
  - `GET /api/admin/settings/` - Admin settings
  - `PUT /api/admin/settings/update/` - Update settings
- **Health Monitoring:**
  - `GET /api/admin/health/check/` - Health check
  - `GET /api/admin/health/status/` - Health status
  - `GET /api/admin/health/metrics/` - Health metrics

#### Action Required:
```typescript
admin: {
  // ... existing endpoints
  analytics: '/api/admin/analytics/',
  suspendUser: (userId: string) => `/api/admin/users/${userId}/suspend/`,
  unsuspendUser: (userId: string) => `/api/admin/users/${userId}/unsuspend/`,
  bulkUserAction: '/api/admin/users/bulk-action/',
  exportUsers: '/api/admin/users/export/',
  userActions: (userId: string) => `/api/admin/users/${userId}/actions/`,
  parties: '/api/admin/parties/',
  deleteParty: (partyId: string) => `/api/admin/parties/${partyId}/delete/`,
  videos: '/api/admin/videos/',
  deleteVideo: (videoId: string) => `/api/admin/videos/${videoId}/delete/`,
  reports: '/api/admin/reports/',
  resolveReport: (reportId: string) => `/api/admin/reports/${reportId}/resolve/`,
  logs: '/api/admin/logs/',
  maintenance: '/api/admin/maintenance/',
  broadcast: '/api/admin/broadcast/',
  sendNotification: '/api/admin/notifications/send/',
  settings: '/api/admin/settings/',
  updateSettings: '/api/admin/settings/update/',
  healthCheck: '/api/admin/health/check/',
  healthStatus: '/api/admin/health/status/',
  healthMetrics: '/api/admin/health/metrics/',
},
```

## 🟢 ENTIRELY MISSING FEATURES

### Store API (Complete Missing)
The backend has a complete store/commerce system:
```typescript
store: {
  items: '/api/store/items/',
  purchase: '/api/store/purchase/',
  inventory: '/api/store/inventory/',
  achievements: '/api/store/achievements/',
  rewards: '/api/store/rewards/',
  claimReward: (rewardId: number) => `/api/store/rewards/${rewardId}/claim/`,
  stats: '/api/store/stats/',
},
```

### Search API (Complete Missing)
```typescript
search: {
  global: '/api/search/',
  discover: '/api/search/discover/',
},
```

### Social API (Complete Missing)
```typescript
social: {
  groups: '/api/social/groups/',
  groupDetail: (groupId: number) => `/api/social/groups/${groupId}/`,
  joinGroup: (groupId: number) => `/api/social/groups/${groupId}/join/`,
  leaveGroup: (groupId: number) => `/api/social/groups/${groupId}/leave/`,
},
```

### Messaging API (Complete Missing)
```typescript
messaging: {
  conversations: '/api/messaging/conversations/',
  messages: (conversationId: number) => `/api/messaging/conversations/${conversationId}/messages/`,
},
```

### Support API (Complete Missing)
```typescript
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
```

### Mobile API (Complete Missing)
```typescript
mobile: {
  config: '/api/mobile/config/',
  home: '/api/mobile/home/',
  sync: '/api/mobile/sync/',
  pushToken: '/api/mobile/push-token/',
  appInfo: '/api/mobile/app-info/',
},
```

### Additional Integrations (Partial Missing)
#### Currently Missing:
```typescript
integrations: {
  // ... existing endpoints
  authUrl: (provider: string) => `/api/integrations/${provider}/auth-url/`,
  callback: (provider: string) => `/api/integrations/${provider}/callback/`,
  health: '/api/integrations/health/',
  status: '/api/integrations/status/',
  management: '/api/integrations/management/',
  test: '/api/integrations/test/',
  types: '/api/integrations/types/',
  connections: '/api/integrations/connections/',
  disconnectConnection: (connectionId: number) => `/api/integrations/connections/${connectionId}/disconnect/`,
  
  // S3 Integration
  upload: '/api/integrations/upload/',
  streamingUrl: (fileKey: string) => `/api/integrations/files/${fileKey}/streaming-url/`,
  
  // Google Drive Integration
  gdriveOauthCallback: '/api/integrations/oauth-callback/',
  gdriveFiles: '/api/integrations/files/',
  gdriveStreamingUrl: (fileId: string) => `/api/integrations/files/${fileId}/streaming-url/`,
},
```

### Enhanced Moderation (Partial Missing)
```typescript
moderation: {
  // ... existing endpoints
  reportDetail: (reportId: string) => `/api/moderation/reports/${reportId}/`,
  adminQueue: '/api/moderation/admin/queue/',
  adminStats: '/api/moderation/admin/stats/',
  adminDashboard: '/api/moderation/admin/dashboard/',
  assignReport: (reportId: string) => `/api/moderation/admin/reports/${reportId}/assign/`,
  resolveReport: (reportId: string) => `/api/moderation/admin/reports/${reportId}/resolve/`,
  dismissReport: (reportId: string) => `/api/moderation/admin/reports/${reportId}/dismiss/`,
  reportActions: (reportId: string) => `/api/moderation/admin/reports/${reportId}/actions/`,
  bulkAction: '/api/moderation/admin/reports/bulk-action/',
  contentTypes: '/api/moderation/content-types/',
},
```

## 🔧 IMPLEMENTATION PRIORITY

### Phase 1 (Critical - Immediate Implementation Needed)
1. **Authentication Social Features** - Users expect Google/GitHub login
2. **Users Friends System** - Core social functionality missing
3. **Video Comments & Analytics** - Basic video features missing
4. **Party Advanced Features** - Enhanced party management
5. **Notifications Complete Implementation** - User engagement critical

### Phase 2 (High Priority - Next Sprint)
1. **Analytics Complete Implementation** - Business intelligence critical
2. **Admin Panel Complete** - Management tools needed
3. **Chat Advanced Features** - Moderation and management
4. **Interactive Features Complete** - Voice chat, screen sharing
5. **Billing Complete Features** - Revenue features missing

### Phase 3 (Medium Priority - Following Sprint)
1. **Store System** - Revenue generation
2. **Support System** - Customer service
3. **Search & Discovery** - User experience
4. **Social Groups** - Community features
5. **Messaging System** - Direct communication

### Phase 4 (Low Priority - Future Releases)
1. **Mobile API Integration** - If mobile app planned
2. **Advanced Integrations** - Extended third-party connections
3. **Legacy Support** - Backward compatibility

## 🛠️ IMPLEMENTATION STEPS

### Step 1: Update endpoints.ts
Create the comprehensive endpoints file with all missing endpoints.

### Step 2: Create API Service Functions
For each major category, create service functions that use these endpoints.

### Step 3: Update TypeScript Types
Create/update TypeScript interfaces for all request/response types.

### Step 4: Implement Frontend Components
Build UI components that utilize the new API endpoints.

### Step 5: Testing & Integration
Thorough testing of all new endpoint integrations.

## 📋 CONCLUSION

The frontend is currently utilizing only about **30% of the available backend API**. There are **200+ missing endpoints** that need to be integrated for full functionality. Priority should be given to social features (friends system), video enhancements, and analytics as these are core to the user experience.

This represents a significant development effort that should be planned across multiple sprints with clear priorities based on user impact and business value.
