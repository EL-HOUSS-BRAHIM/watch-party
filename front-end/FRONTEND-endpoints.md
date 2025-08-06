# Watch Party API Documentation

This document provides a comprehensive overview of all API endpoints used in the Watch Party frontend application.

## Base Configuration

- **Base URL**: `process.env.NEXT_PUBLIC_API_URL` or `http://localhost:8000`
- **WebSocket URL**: `process.env.NEXT_PUBLIC_WS_URL` or `ws://localhost:8000/ws`
- **Timeout**: 30 seconds
- **Content-Type**: `application/json`
- **Authentication**: Bearer token in Authorization header

## Authentication Endpoints

### Register User
- **Endpoint**: `POST /api/auth/register/`
- **Request Body**:
  \`\`\`typescript
  {
    email: string
    password: string
    confirm_password: string
    first_name: string
    last_name: string
    promo_code?: string
  }
  \`\`\`
- **Response**:
  \`\`\`typescript
  {
    success: boolean
    access_token: string
    refresh_token: string
    user: User
    verification_sent?: boolean
  }
  \`\`\`

### Login User
- **Endpoint**: `POST /api/auth/login/`
- **Request Body**:
  \`\`\`typescript
  {
    email: string
    password: string
  }
  \`\`\`
- **Response**:
  \`\`\`typescript
  {
    success: boolean
    access_token: string
    refresh_token: string
    user: User
  }
  \`\`\`

### Logout User
- **Endpoint**: `POST /api/auth/logout/`
- **Request Body**:
  \`\`\`typescript
  {
    refresh_token: string
  }
  \`\`\`
- **Response**:
  \`\`\`typescript
  {
    success: boolean
    message?: string
  }
  \`\`\`

### Refresh Token
- **Endpoint**: `POST /api/auth/refresh/`
- **Request Body**:
  \`\`\`typescript
  {
    refresh: string
  }
  \`\`\`
- **Response**:
  \`\`\`typescript
  {
    access: string
  }
  \`\`\`

### Forgot Password
- **Endpoint**: `POST /api/auth/forgot-password/`
- **Request Body**:
  \`\`\`typescript
  {
    email: string
  }
  \`\`\`
- **Response**:
  \`\`\`typescript
  {
    success: boolean
    message?: string
  }
  \`\`\`

### Reset Password
- **Endpoint**: `POST /api/auth/reset-password/`
- **Request Body**:
  \`\`\`typescript
  {
    token: string
    new_password: string
    confirm_password: string
  }
  \`\`\`
- **Response**:
  \`\`\`typescript
  {
    success: boolean
    message?: string
  }
  \`\`\`

### Change Password
- **Endpoint**: `POST /api/auth/change-password/`
- **Request Body**:
  \`\`\`typescript
  {
    current_password: string
    new_password: string
    confirm_password: string
  }
  \`\`\`
- **Response**:
  \`\`\`typescript
  {
    success: boolean
    message?: string
  }
  \`\`\`

### Verify Email
- **Endpoint**: `POST /api/auth/verify-email/`
- **Request Body**:
  \`\`\`typescript
  {
    token: string
  }
  \`\`\`
- **Response**:
  \`\`\`typescript
  {
    success: boolean
    message?: string
  }
  \`\`\`

### Get User Profile
- **Endpoint**: `GET /api/auth/profile/`
- **Response**:
  \`\`\`typescript
  User
  \`\`\`

### Setup 2FA
- **Endpoint**: `POST /api/auth/2fa/setup/`
- **Response**:
  \`\`\`typescript
  {
    success: boolean
    qr_code: string
    secret: string
    backup_codes: string[]
  }
  \`\`\`

### Verify 2FA
- **Endpoint**: `POST /api/auth/2fa/verify/`
- **Request Body**:
  \`\`\`typescript
  {
    code: string
  }
  \`\`\`
- **Response**:
  \`\`\`typescript
  {
    success: boolean
    access_token: string
    refresh_token: string
    user: User
  }
  \`\`\`

## Users Endpoints

### Get Dashboard Stats
- **Endpoint**: `GET /api/users/dashboard/stats/`
- **Response**:
  \`\`\`typescript
  {
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
  \`\`\`

### Get User Profile
- **Endpoint**: `GET /api/users/profile/`
- **Response**:
  \`\`\`typescript
  User & { profile: UserProfile }
  \`\`\`

### Update User Profile
- **Endpoint**: `PUT /api/users/profile/`
- **Request Body**: `Partial<UserProfile>`
- **Response**:
  \`\`\`typescript
  User & { profile: UserProfile }
  \`\`\`

### Upload Avatar
- **Endpoint**: `POST /api/users/avatar/upload/`
- **Request**: FormData with file
- **Response**:
  \`\`\`typescript
  {
    success: boolean
    avatar_url: string
  }
  \`\`\`

### Get Friends List
- **Endpoint**: `GET /api/users/friends/`
- **Query Parameters**:
  - `page?: number`
  - `limit?: number`
- **Response**: `PaginatedResponse<Friend>`

### Send Friend Request
- **Endpoint**: `POST /api/users/friends/request/`
- **Request Body**: `FriendRequest`
- **Response**:
  \`\`\`typescript
  {
    success: boolean
    message?: string
  }
  \`\`\`

### Search Users
- **Endpoint**: `GET /api/users/search/`
- **Query Parameters**:
  - `q: string`
  - `limit?: number`
- **Response**: `PaginatedResponse<Friend>`

### Get User Notifications
- **Endpoint**: `GET /api/users/notifications/`
- **Query Parameters**:
  - `page?: number`
  - `unread?: boolean`
  - `type?: string`
- **Response**:
  \`\`\`typescript
  PaginatedResponse<Notification> & { unread_count: number }
  \`\`\`

## Videos Endpoints

### Get Videos List
- **Endpoint**: `GET /api/videos/`
- **Query Parameters**:
  - `page?: number`
  - `search?: string`
  - `visibility?: 'public' | 'private' | 'unlisted'`
  - `uploader?: string`
  - `ordering?: string`
- **Response**: `PaginatedResponse<Video>`

### Create Video
- **Endpoint**: `POST /api/videos/`
- **Request Body**:
  \`\`\`typescript
  {
    title: string
    description: string
    visibility: 'public' | 'private' | 'unlisted'
    allow_download?: boolean
    require_premium?: boolean
  }
  \`\`\`
- **Response**: `Video`

### Get Video Details
- **Endpoint**: `GET /api/videos/{id}/`
- **Response**: `Video`

### Update Video
- **Endpoint**: `PATCH /api/videos/{id}/`
- **Request Body**: `Partial<Video>`
- **Response**: `Video`

### Delete Video
- **Endpoint**: `DELETE /api/videos/{id}/`
- **Response**:
  \`\`\`typescript
  {
    success: boolean
    message?: string
  }
  \`\`\`

### Upload Video
- **Endpoint**: `POST /api/videos/upload/`
- **Request**: FormData with file and metadata
- **Response**: `VideoUpload`

### Get Upload Status
- **Endpoint**: `GET /api/videos/upload/{uploadId}/status/`
- **Response**: `VideoUploadStatus`

### Get Video Stream
- **Endpoint**: `GET /api/videos/{id}/stream/`
- **Response**: `VideoStreamInfo`

### Like Video
- **Endpoint**: `POST /api/videos/{id}/like/`
- **Request Body**:
  \`\`\`typescript
  {
    is_like: boolean
  }
  \`\`\`
- **Response**:
  \`\`\`typescript
  {
    success: boolean
    is_liked: boolean
    like_count: number
  }
  \`\`\`

### Search Videos
- **Endpoint**: `GET /api/videos/search/`
- **Query Parameters**:
  - `q: string`
  - `category?: string`
  - `duration_min?: number`
  - `duration_max?: number`
  - `quality?: string`
  - `ordering?: string`
- **Response**:
  \`\`\`typescript
  PaginatedResponse<Video> & {
    facets: {
      categories: Array<{ name: string; count: number }>
      qualities: Array<{ name: string; count: number }>
    }
  }
  \`\`\`

## Parties Endpoints

### Get Parties List
- **Endpoint**: `GET /api/parties/`
- **Query Parameters**:
  - `status?: 'scheduled' | 'live' | 'paused' | 'ended'`
  - `visibility?: 'public' | 'private'`
  - `search?: string`
  - `page?: number`
- **Response**: `PaginatedResponse<WatchParty>`

### Create Party
- **Endpoint**: `POST /api/parties/`
- **Request Body**:
  \`\`\`typescript
  {
    title: string
    description: string
    video: string
    visibility: 'public' | 'private'
    max_participants?: number
    scheduled_start?: string
    require_approval?: boolean
    allow_chat?: boolean
    allow_reactions?: boolean
  }
  \`\`\`
- **Response**: `WatchParty`

### Get Party Details
- **Endpoint**: `GET /api/parties/{id}/`
- **Response**: `WatchParty`

### Update Party
- **Endpoint**: `PATCH /api/parties/{id}/`
- **Request Body**: `Partial<WatchParty>`
- **Response**: `WatchParty`

### Delete Party
- **Endpoint**: `DELETE /api/parties/{id}/`
- **Response**:
  \`\`\`typescript
  {
    success: boolean
    message?: string
  }
  \`\`\`

### Join Party
- **Endpoint**: `POST /api/parties/{id}/join/`
- **Request Body**:
  \`\`\`typescript
  {
    message?: string
  }
  \`\`\`
- **Response**:
  \`\`\`typescript
  {
    success: boolean
    message: string
    participant: {
      user: {
        id: string
        name: string
        avatar: string
      }
      role: string
      status: string
      joined_at: string
    }
  }
  \`\`\`

### Leave Party
- **Endpoint**: `POST /api/parties/{id}/leave/`
- **Response**:
  \`\`\`typescript
  {
    success: boolean
    message?: string
  }
  \`\`\`

### Control Video
- **Endpoint**: `POST /api/parties/{id}/control/`
- **Request Body**: `PartyControl`
- **Response**:
  \`\`\`typescript
  {
    success: boolean
    action: string
    timestamp?: number
    synced_at: string
  }
  \`\`\`

### Get Participants
- **Endpoint**: `GET /api/parties/{id}/participants/`
- **Response**:
  \`\`\`typescript
  PaginatedResponse<PartyParticipant> & {
    online_count: number
  }
  \`\`\`

### Join by Code
- **Endpoint**: `POST /api/parties/join-by-code/`
- **Request Body**:
  \`\`\`typescript
  {
    room_code: string
  }
  \`\`\`
- **Response**: `PartyJoinResponse`

## Chat Endpoints

### Get Messages
- **Endpoint**: `GET /api/chat/{partyId}/messages/`
- **Query Parameters**:
  - `page?: number`
  - `limit?: number`
- **Response**: `PaginatedResponse<ChatMessage>`

### Send Message
- **Endpoint**: `POST /api/chat/{partyId}/messages/send/`
- **Request Body**:
  \`\`\`typescript
  {
    message: string
    message_type: 'text' | 'emoji'
  }
  \`\`\`
- **Response**: `ChatMessage`

### Get Chat Settings
- **Endpoint**: `GET /api/chat/{roomId}/settings/`
- **Response**: `ChatSettings`

### Update Chat Settings
- **Endpoint**: `PUT /api/chat/{roomId}/settings/`
- **Request Body**: `Partial<ChatSettings>`
- **Response**: `ChatSettings`

## Billing Endpoints

### Get Plans
- **Endpoint**: `GET /api/billing/plans/`
- **Response**:
  \`\`\`typescript
  {
    plans: SubscriptionPlan[]
  }
  \`\`\`

### Subscribe
- **Endpoint**: `POST /api/billing/subscribe/`
- **Request Body**:
  \`\`\`typescript
  {
    plan_id: string
    payment_method_id: string
    promo_code?: string
  }
  \`\`\`
- **Response**:
  \`\`\`typescript
  {
    success: boolean
    subscription: Subscription
    next_payment: {
      amount: number
      date: string
    }
  }
  \`\`\`

### Get Subscription
- **Endpoint**: `GET /api/billing/subscription/`
- **Response**:
  \`\`\`typescript
  {
    subscription: Subscription
    usage: {
      storage_used: string
      storage_limit: string
      parties_hosted_this_month: number
      videos_uploaded_this_month: number
    }
    next_payment: {
      amount: number
      date: string
      payment_method: string
    }
  }
  \`\`\`

### Cancel Subscription
- **Endpoint**: `POST /api/billing/subscription/cancel/`
- **Response**:
  \`\`\`typescript
  {
    success: boolean
    message?: string
  }
  \`\`\`

### Get Payment Methods
- **Endpoint**: `GET /api/billing/payment-methods/`
- **Response**:
  \`\`\`typescript
  {
    payment_methods: PaymentMethod[]
    default_payment_method: string
  }
  \`\`\`

### Add Payment Method
- **Endpoint**: `POST /api/billing/payment-methods/`
- **Request Body**:
  \`\`\`typescript
  {
    payment_method_id: string
  }
  \`\`\`
- **Response**: `PaymentMethod`

### Delete Payment Method
- **Endpoint**: `DELETE /api/billing/payment-methods/{methodId}/`
- **Response**:
  \`\`\`typescript
  {
    success: boolean
    message?: string
  }
  \`\`\`

### Set Default Payment Method
- **Endpoint**: `POST /api/billing/payment-methods/{methodId}/set-default/`
- **Response**:
  \`\`\`typescript
  {
    success: boolean
    message?: string
  }
  \`\`\`

### Get Billing History
- **Endpoint**: `GET /api/billing/history/`
- **Query Parameters**:
  - `page?: number`
- **Response**: `PaginatedResponse<BillingHistory>`

### Download Invoice
- **Endpoint**: `GET /api/billing/history/{invoiceId}/download/`
- **Response**: `Blob` (PDF file)

## Analytics Endpoints

### Get Analytics Dashboard
- **Endpoint**: `GET /api/analytics/dashboard/`
- **Query Parameters**:
  - `time_range?: string`
- **Response**: `AnalyticsDashboard`

### Get User Analytics
- **Endpoint**: `GET /api/analytics/user/`
- **Response**: `UserAnalytics`

### Get Video Analytics
- **Endpoint**: `GET /api/analytics/video/{videoId}/`
- **Response**:
  \`\`\`typescript
  {
    video: {
      id: string
      title: string
      views: number
      completion_rate: number
    }
    engagement: {
      likes: number
      comments: number
      shares: number
      average_rating: number
    }
    view_chart: Array<{
      date: string
      views: number
    }>
    audience: {
      age_groups: Array<{
        range: string
        percentage: number
      }>
      countries: Array<{
        country: string
        percentage: number
      }>
    }
  }
  \`\`\`

## Notifications Endpoints

### Get Notifications
- **Endpoint**: `GET /api/notifications/`
- **Query Parameters**:
  - `unread?: boolean`
  - `type?: string`
  - `page?: number`
- **Response**:
  \`\`\`typescript
  PaginatedResponse<Notification> & {
    unread_count: number
  }
  \`\`\`

### Mark as Read
- **Endpoint**: `POST /api/notifications/{notificationId}/mark-read/`
- **Response**:
  \`\`\`typescript
  {
    success: boolean
    message?: string
  }
  \`\`\`

### Mark All as Read
- **Endpoint**: `POST /api/notifications/mark-all-read/`
- **Response**:
  \`\`\`typescript
  {
    success: boolean
    message?: string
  }
  \`\`\`

### Delete Notification
- **Endpoint**: `DELETE /api/notifications/{notificationId}/`
- **Response**:
  \`\`\`typescript
  {
    success: boolean
    message?: string
  }
  \`\`\`

### Get Preferences
- **Endpoint**: `GET /api/notifications/preferences/`
- **Response**: `NotificationPreferences`

### Update Preferences
- **Endpoint**: `PUT /api/notifications/preferences/`
- **Request Body**: `Partial<NotificationPreferences>`
- **Response**: `NotificationPreferences`

### Update Push Token
- **Endpoint**: `POST /api/notifications/push/token/update/`
- **Request Body**:
  \`\`\`typescript
  {
    token: string
    platform: 'ios' | 'android' | 'web'
  }
  \`\`\`
- **Response**:
  \`\`\`typescript
  {
    success: boolean
    message?: string
  }
  \`\`\`

## Admin Endpoints

### Get Admin Dashboard
- **Endpoint**: `GET /api/admin/dashboard/`
- **Response**: `AdminDashboard`

### Get Users (Admin)
- **Endpoint**: `GET /api/admin/users/`
- **Query Parameters**:
  - `search?: string`
  - `status?: 'active' | 'suspended' | 'banned'`
  - `subscription?: 'active' | 'inactive'`
  - `page?: number`
- **Response**: `PaginatedResponse<User>`

### Get System Health
- **Endpoint**: `GET /api/admin/system-health/`
- **Response**: `SystemHealth`

### Suspend User
- **Endpoint**: `POST /api/admin/users/{userId}/suspend/`
- **Request Body**:
  \`\`\`typescript
  {
    reason?: string
  }
  \`\`\`
- **Response**:
  \`\`\`typescript
  {
    success: boolean
    message?: string
  }
  \`\`\`

### Unsuspend User
- **Endpoint**: `POST /api/admin/users/{userId}/unsuspend/`
- **Response**:
  \`\`\`typescript
  {
    success: boolean
    message?: string
  }
  \`\`\`

### Ban User
- **Endpoint**: `POST /api/admin/users/{userId}/ban/`
- **Request Body**:
  \`\`\`typescript
  {
    reason?: string
  }
  \`\`\`
- **Response**:
  \`\`\`typescript
  {
    success: boolean
    message?: string
  }
  \`\`\`

### Unban User
- **Endpoint**: `POST /api/admin/users/{userId}/unban/`
- **Response**:
  \`\`\`typescript
  {
    success: boolean
    message?: string
  }
  \`\`\`

## Integration Endpoints

### Google Drive Auth URL
- **Endpoint**: `GET /api/integrations/google-drive/auth-url/`

### Google Drive Files
- **Endpoint**: `GET /api/integrations/google-drive/files/`

### S3 Presigned Upload
- **Endpoint**: `POST /api/integrations/s3/presigned-upload/`

## Interactive Features Endpoints

### Get Reactions
- **Endpoint**: `GET /api/interactive/parties/{partyId}/reactions/`

### Create Reaction
- **Endpoint**: `POST /api/interactive/parties/{partyId}/reactions/create/`

### Create Poll
- **Endpoint**: `POST /api/interactive/parties/{partyId}/polls/create/`

## Moderation Endpoints

### Get Reports
- **Endpoint**: `GET /api/moderation/reports/`

### Get Report Types
- **Endpoint**: `GET /api/moderation/report-types/`

## Dashboard Endpoints

### Get Dashboard Stats
- **Endpoint**: `GET /api/dashboard/stats/`

### Get Activities
- **Endpoint**: `GET /api/dashboard/activities/`

## WebSocket Endpoints

### Chat WebSocket
- **Endpoint**: `WS /ws/chat/{partyId}/`

### Party Sync WebSocket
- **Endpoint**: `WS /ws/party/{partyId}/sync/`

### Interactive WebSocket
- **Endpoint**: `WS /ws/interactive/{partyId}/`

## Common Response Types

### APIResponse
\`\`\`typescript
{
  success: boolean
  message?: string
  data?: T
  errors?: Record<string, string[]>
}
\`\`\`

### PaginatedResponse
\`\`\`typescript
{
  results: T[]
  count: number
  next: string | null
  previous: string | null
  page_size: number
  current_page: number
  total_pages: number
}
\`\`\`

### User
\`\`\`typescript
{
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
\`\`\`

## Error Handling

All endpoints return standardized error responses with appropriate HTTP status codes:

- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Permission denied
- **404 Not Found**: Resource not found
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server error

Error Response Format:
\`\`\`typescript
{
  success: false
  errors?: Record<string, string[]>
  detail?: string
}
\`\`\`

## Authentication

Most endpoints require authentication via Bearer token in the Authorization header:
\`\`\`
Authorization: Bearer <access_token>
\`\`\`

Tokens can be obtained via the login endpoint and refreshed using the refresh token endpoint.
