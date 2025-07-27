# Watch Party Backend API Documentation

This document provides a comprehensive overview of all API endpoints in the Watch Party backend, including their flags, options, and examples of requests and responses.

## Base URL
```
http://localhost:8000/api
```

## Root Endpoints
- **API Root**: `/api/` - Lists all available endpoints
- **Test Endpoint**: `/api/test/` - Server health check

**Test Endpoint Response**:
```json
{
  "message": "Server is working!",
  "authenticated": true,
  "user_id": "uuid",
  "timestamp": "2025-07-27T10:00:00Z"
}
```

- **API Documentation**: `/api/docs/` - Interactive Swagger UI
- **API Schema**: `/api/schema/` - OpenAPI schema
- **ReDoc Documentation**: `/api/redoc/` - Alternative documentation

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Table of Contents

1. [Authentication Endpoints](#authentication-endpoints)
2. [Users Endpoints](#users-endpoints)
3. [Videos Endpoints](#videos-endpoints)
4. [Parties Endpoints](#parties-endpoints)
5. [Chat Endpoints](#chat-endpoints)
6. [Billing Endpoints](#billing-endpoints)
7. [Analytics Endpoints](#analytics-endpoints)
8. [Notifications Endpoints](#notifications-endpoints)
9. [Integrations Endpoints](#integrations-endpoints)
10. [Interactive Features Endpoints](#interactive-features-endpoints)
11. [Moderation Endpoints](#moderation-endpoints)
12. [Admin Panel Endpoints](#admin-panel-endpoints)
13. [WebSocket Endpoints](#websocket-endpoints)

---

## Authentication Endpoints

### Register User
- **URL**: `/api/auth/register/`
- **Method**: `POST`
- **Authentication**: None required
- **Rate Limit**: Applied

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Response (201)**:
```json
{
  "success": true,
  "message": "Registration successful. Please verify your email.",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "full_name": "John Doe",
    "avatar_url": null,
    "is_premium": false,
    "date_joined": "2025-07-27T10:00:00Z"
  },
  "access_token": "jwt_access_token",
  "refresh_token": "jwt_refresh_token",
  "verification_sent": true
}
```

### Login User
- **URL**: `/api/auth/login/`
- **Method**: `POST`
- **Authentication**: None required
- **Rate Limit**: Applied

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (200)**:
```json
{
  "success": true,
  "access_token": "jwt_access_token",
  "refresh_token": "jwt_refresh_token",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "full_name": "John Doe",
    "avatar_url": null,
    "is_premium": false,
    "date_joined": "2025-07-27T10:00:00Z"
  }
}
```

### Refresh Token
- **URL**: `/api/auth/refresh/`
- **Method**: `POST`
- **Authentication**: None required

**Request Body**:
```json
{
  "refresh": "jwt_refresh_token"
}
```

### Logout
- **URL**: `/api/auth/logout/`
- **Method**: `POST`
- **Authentication**: Required

### Social Authentication
- **Google OAuth**: `/api/auth/social/google/`
- **GitHub OAuth**: `/api/auth/social/github/`
- **Method**: `POST`

### Password Management
- **Forgot Password**: `/api/auth/forgot-password/`
- **Reset Password**: `/api/auth/reset-password/`
- **Change Password**: `/api/auth/change-password/`

### Two-Factor Authentication
- **Setup 2FA**: `/api/auth/2fa/setup/`
- **Verify 2FA**: `/api/auth/2fa/verify/`
- **Disable 2FA**: `/api/auth/2fa/disable/`

### Email Verification
- **Verify Email**: `/api/auth/verify-email/`
- **Resend Verification**: `/api/auth/resend-verification/`

### User Profile
- **Get/Update Profile**: `/api/auth/profile/`

### Google Drive Integration (Legacy - use integrations endpoints)
- **Google Drive Auth**: `/api/auth/google-drive/auth/`
- **Google Drive Disconnect**: `/api/auth/google-drive/disconnect/`
- **Google Drive Status**: `/api/auth/google-drive/status/`

### Session Management
- **List Sessions**: `/api/auth/sessions/`
- **Revoke Session**: `/api/auth/sessions/<session_id>/`

---

## Users Endpoints

### Dashboard Stats
- **URL**: `/api/users/dashboard/stats/`
- **Method**: `GET`
- **Authentication**: Required

**Response**:
```json
{
  "total_watch_time": 1234,
  "parties_hosted": 5,
  "parties_joined": 12,
  "videos_uploaded": 8,
  "friends_count": 25
}
```

**Alternative Dashboard Endpoints**:
- **Main Dashboard Stats**: `/api/dashboard/stats/`

**Response** (Main Dashboard):
```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "stats": {
    "total_parties": 12,
    "recent_parties": 3,
    "total_videos": 8,
    "recent_videos": 2,
    "watch_time_minutes": 0
  },
  "timestamp": "2025-07-27T10:00:00Z"
}
```

- **Recent Activities**: `/api/dashboard/activities/`

**Response** (Recent Activities):
```json
{
  "activities": [
    {
      "id": "uuid",
      "type": "party_joined",
      "timestamp": "2025-07-27T09:30:00Z",
      "data": {},
      "party": {
        "id": "uuid",
        "title": "Movie Night"
      },
      "video": {
        "id": "uuid",
        "title": "Great Movie"
      }
    }
  ],
  "total": 5
}
```

### User Profile Management
- **Get Profile**: `/api/users/profile/`
- **Update Profile**: `/api/users/profile/update/`
- **Upload Avatar**: `/api/users/avatar/upload/`

### Friends Management
- **List Friends**: `/api/users/friends/`
- **Send Friend Request**: `/api/users/friends/request/`
- **Accept Friend Request**: `/api/users/friends/<friendship_id>/accept/`
- **Decline Friend Request**: `/api/users/friends/<friendship_id>/decline/`
- **Remove Friend**: `/api/users/friends/<username>/remove/`
- **Friend Requests**: `/api/users/friends/requests/`
- **Search Users**: `/api/users/search/`
- **User Suggestions**: `/api/users/suggestions/`
- **Block User**: `/api/users/block/`
- **Unblock User**: `/api/users/unblock/`
- **User Profile**: `/api/users/<user_id>/profile/`

### Legacy Friends System (Compatibility)
- **Legacy Friends List**: `/api/users/friends/legacy/`
- **Legacy Friend Requests**: `/api/users/friends/legacy/requests/`
- **Legacy Send Request**: `/api/users/friends/legacy/send/`
- **Legacy Accept Request**: `/api/users/friends/legacy/<request_id>/accept/`
- **Legacy Decline Request**: `/api/users/friends/legacy/<request_id>/decline/`
- **Legacy Remove Friend**: `/api/users/friends/legacy/<friend_id>/remove/`
- **Legacy Block User**: `/api/users/users/<user_id>/block/`
- **Legacy Unblock User**: `/api/users/users/<user_id>/unblock/`

### Enhanced User Features
- **Mutual Friends**: `/api/users/<user_id>/mutual-friends/`
- **Online Status**: `/api/users/online-status/`
- **Public Profile**: `/api/users/<user_id>/public-profile/`

### User Settings
- **Get/Update Settings**: `/api/users/settings/`
- **Notification Settings**: `/api/users/notifications/settings/`
- **Privacy Settings**: `/api/users/privacy/settings/`

### User Data & Activity
- **Export User Data**: `/api/users/export-data/`
- **Delete Account**: `/api/users/delete-account/`
- **Watch History**: `/api/users/watch-history/`
- **Favorites**: `/api/users/favorites/`
- **Add Favorite**: `/api/users/favorites/add/`
- **Remove Favorite**: `/api/users/favorites/<favorite_id>/remove/`
- **Activity Feed**: `/api/users/activity/`
- **Legacy User Activity**: `/api/users/legacy/activity/`

### Notifications
- **List Notifications**: `/api/users/notifications/`
- **Mark as Read**: `/api/users/notifications/<notification_id>/read/`
- **Mark All as Read**: `/api/users/notifications/mark-all-read/`

### User Reports
- **Report User**: `/api/users/report/`

---

## Videos Endpoints

### Video CRUD Operations
- **List Videos**: `/api/videos/`
  - **Query Parameters**:
    - `source_type`: `upload`, `gdrive`, `s3`, `youtube`, `url`
    - `visibility`: `public`, `friends`, `private`
    - `uploader`: User ID
    - `require_premium`: `true`/`false`
    - `search`: Search in title/description
    - `ordering`: `created_at`, `title`, `view_count`, `like_count` (prefix with `-` for descending)

**Request Body** (Create Video):
```json
{
  "title": "My Awesome Video",
  "description": "A great video for watching together",
  "source_type": "upload",
  "visibility": "public",
  "allow_download": true,
  "require_premium": false
}
```

**Response** (Video List with Filters):
```json
{
  "count": 25,
  "next": "http://localhost:8000/api/videos/?page=2",
  "previous": null,
  "results": [
    {
      "id": "uuid",
      "title": "My Video",
      "description": "Video description",
      "uploader": {
        "id": "uuid",
        "name": "John Doe",
        "avatar": "http://example.com/avatar.jpg",
        "is_premium": true
      },
      "thumbnail": "http://example.com/thumbnail.jpg",
      "duration": 3600,
      "duration_formatted": "1:00:00",
      "file_size": 104857600,
      "file_size_formatted": "100 MB",
      "source_type": "upload",
      "resolution": "1920x1080",
      "visibility": "public",
      "status": "ready",
      "view_count": 150,
      "like_count": 25,
      "is_liked": true,
      "can_edit": false,
      "created_at": "2025-07-27T10:00:00Z",
      "updated_at": "2025-07-27T10:00:00Z"
    }
  ]
}

### Video Actions
- **Like/Unlike Video**: `/api/videos/<video_id>/like/` (POST)

**Request Body** (Like Video):
```json
{
  "is_like": true
}
```

**Response** (Like Action):
```json
{
  "liked": true,
  "disliked": false,
  "like_count": 26
}
```

- **Get Comments**: `/api/videos/<video_id>/comments/` (GET)
- **Add Comment**: `/api/videos/<video_id>/comments/` (POST)
- **Stream Video**: `/api/videos/<video_id>/stream/`
- **Download Video**: `/api/videos/<video_id>/download/`

### Video Upload
- **Upload Video**: `/api/videos/upload/`
- **S3 Upload**: `/api/videos/upload/s3/`
- **Upload Status**: `/api/videos/upload/<upload_id>/status/`
- **Complete Upload**: `/api/videos/upload/<upload_id>/complete/`

### Video Management
- **Streaming URL**: `/api/videos/<video_id>/stream/`
- **Thumbnail**: `/api/videos/<video_id>/thumbnail/`
- **Analytics**: `/api/videos/<video_id>/analytics/`
- **Processing Status**: `/api/videos/<video_id>/processing-status/`
- **Quality Variants**: `/api/videos/<video_id>/quality-variants/`
- **Regenerate Thumbnail**: `/api/videos/<video_id>/regenerate-thumbnail/`
- **Share Video**: `/api/videos/<video_id>/share/`

### Advanced Video Analytics
- **Detailed Analytics**: `/api/videos/<video_id>/analytics/detailed/`
- **Engagement Heatmap**: `/api/videos/<video_id>/analytics/heatmap/`
- **Retention Curve**: `/api/videos/<video_id>/analytics/retention/`
- **Viewer Journey**: `/api/videos/<video_id>/analytics/journey/`
- **Comparative Analytics**: `/api/videos/<video_id>/analytics/comparative/`

### Channel Analytics
- **Channel Analytics**: `/api/videos/analytics/channel/`
- **Trending Analytics**: `/api/videos/analytics/trending/`

### Video Validation
- **Validate Video URL**: `/api/videos/validate-url/`

### Video Proxy
- **Video Proxy**: `/api/videos/<video_id>/proxy/`

### Video Search
- **Basic Search**: `/api/videos/search/`
- **Advanced Search**: `/api/videos/search/advanced/`

### Google Drive Integration
- **List GDrive Movies**: `/api/videos/gdrive/`
- **Upload from GDrive**: `/api/videos/gdrive/upload/`
- **Delete GDrive Video**: `/api/videos/gdrive/<video_id>/delete/`
- **Stream GDrive Video**: `/api/videos/gdrive/<video_id>/stream/`

---

## Parties Endpoints

### Party CRUD Operations
- **List Parties**: `/api/parties/`
  - **Query Parameters**:
    - `status`: `scheduled`, `live`, `paused`, `ended`
    - `visibility`: `public`, `friends`, `private`
    - `host`: User ID
    - `search`: Search in title/description
    - `ordering`: `created_at`, `title`, `scheduled_start`

- **Create Party**: `/api/parties/` (POST)
- **Get Party Details**: `/api/parties/<party_id>/`
- **Update Party**: `/api/parties/<party_id>/` (PUT/PATCH)
- **Delete Party**: `/api/parties/<party_id>/` (DELETE)

### Party Actions
- **Join Party**: `/api/parties/<party_id>/join/` (POST)
- **Leave Party**: `/api/parties/<party_id>/leave/` (POST)
- **Start Party**: `/api/parties/<party_id>/start/` (POST)
- **Control Playback**: `/api/parties/<party_id>/control/` (POST)
- **Get Participants**: `/api/parties/<party_id>/participants/`
- **Invite Users**: `/api/parties/<party_id>/invite/` (POST)
- **Add Reaction**: `/api/parties/<party_id>/react/` (POST)
- **Chat Messages**: `/api/parties/<party_id>/chat/` (GET/POST)
- **Select GDrive Movie**: `/api/parties/<party_id>/select-gdrive-movie/` (POST)
- **Sync State**: `/api/parties/<party_id>/sync-state/` (GET)
- **Party Analytics**: `/api/parties/<party_id>/analytics/` (GET)
- **Kick Participant**: `/api/parties/<party_id>/kick-participant/` (POST)
- **Promote Participant**: `/api/parties/<party_id>/promote-participant/` (POST)

### Party Discovery
- **Recent Parties**: `/api/parties/recent/`
- **Public Parties**: `/api/parties/public/`
- **Join by Code**: `/api/parties/join-by-code/`
- **Search Parties**: `/api/parties/search/`
- **Report Party**: `/api/parties/report/`

### Party Invitations
- **List Invitations**: `/api/parties/invitations/`
- **Get Invitation**: `/api/parties/invitations/<invitation_id>/`
- **Accept Invitation**: `/api/parties/invitations/<invitation_id>/accept/`
- **Decline Invitation**: `/api/parties/invitations/<invitation_id>/decline/`

---

## Chat Endpoints

### Chat Messages
- **Get Chat History**: `/api/chat/<party_id>/messages/`
- **Send Message**: `/api/chat/<party_id>/messages/send/`

### Chat Room Management
- **Join Chat Room**: `/api/chat/<room_id>/join/`
- **Leave Chat Room**: `/api/chat/<room_id>/leave/`
- **Get Active Users**: `/api/chat/<room_id>/active-users/`
- **Chat Settings**: `/api/chat/<room_id>/settings/`

### Chat Moderation
- **Moderate Chat**: `/api/chat/<room_id>/moderate/`
- **Ban User**: `/api/chat/<room_id>/ban/`
- **Unban User**: `/api/chat/<room_id>/unban/`
- **Moderation Log**: `/api/chat/<room_id>/moderation-log/`

### Chat Statistics
- **Chat Stats**: `/api/chat/<room_id>/stats/`

---

## Billing Endpoints

### Subscription Management
- **List Plans**: `/api/billing/plans/`
- **Create Subscription**: `/api/billing/subscribe/`
- **Get Subscription**: `/api/billing/subscription/`
- **Cancel Subscription**: `/api/billing/subscription/cancel/`
- **Resume Subscription**: `/api/billing/subscription/resume/`

### Payment Methods
- **List Payment Methods**: `/api/billing/payment-methods/`
- **Add Payment Method**: `/api/billing/payment-methods/` (POST)
- **Get Payment Method**: `/api/billing/payment-methods/<method_id>/`
- **Delete Payment Method**: `/api/billing/payment-methods/<method_id>/` (DELETE)
- **Set Default**: `/api/billing/payment-methods/<method_id>/set-default/`

### Billing History
- **Billing History**: `/api/billing/history/`
- **Invoice Details**: `/api/billing/invoices/<invoice_id>/`
- **Download Invoice**: `/api/billing/invoices/<invoice_id>/download/`

### Billing Address
- **Get/Update Address**: `/api/billing/address/`

### Promotional Codes
- **Validate Promo Code**: `/api/billing/promo-code/validate/`

### Webhooks
- **Stripe Webhook**: `/api/billing/webhooks/stripe/`

---

## Analytics Endpoints

### Basic Analytics
- **Analytics Overview**: `/api/analytics/`
- **User Stats**: `/api/analytics/user-stats/`
- **Party Stats**: `/api/analytics/party-stats/<party_id>/`
- **Admin Analytics**: `/api/analytics/admin/analytics/`
- **Export Analytics**: `/api/analytics/export/`

### Dashboard Analytics
- **Dashboard Stats**: `/api/dashboard/stats/`
- **Recent Activities**: `/api/dashboard/activities/`
- **Analytics Dashboard**: `/api/analytics/dashboard/`
- **User Analytics**: `/api/analytics/user/`
- **Video Analytics**: `/api/analytics/video/<video_id>/`
- **Party Analytics**: `/api/analytics/party/<party_id>/`
- **System Analytics**: `/api/analytics/system/`
- **Track Event**: `/api/analytics/events/` (POST)

### Advanced Analytics
- **Real-time Dashboard**: `/api/analytics/dashboard/realtime/`
- **Advanced Query**: `/api/analytics/advanced/query/`
- **A/B Testing**: `/api/analytics/ab-testing/`
- **Predictive Analytics**: `/api/analytics/predictive/`

### Performance Analytics
- **System Performance**: `/api/analytics/system/performance/`
- **Revenue Analytics**: `/api/analytics/revenue/`
- **User Retention**: `/api/analytics/retention/`
- **Content Analytics**: `/api/analytics/content/`

---

## Notifications Endpoints

### Notification Management
- **List Notifications**: `/api/notifications/`
- **Get Notification**: `/api/notifications/<notification_id>/`
- **Mark as Read**: `/api/notifications/<notification_id>/mark-read/`
- **Mark All as Read**: `/api/notifications/mark-all-read/`
- **Clear All**: `/api/notifications/clear-all/`

### Notification Preferences
- **Get Preferences**: `/api/notifications/preferences/`
- **Update Preferences**: `/api/notifications/preferences/update/`

### Push Notifications
- **Update Push Token**: `/api/notifications/push/token/update/`
- **Remove Push Token**: `/api/notifications/push/token/remove/`
- **Test Push**: `/api/notifications/push/test/`
- **Broadcast Push**: `/api/notifications/push/broadcast/`

### Templates & Channels (Admin)
- **List Templates**: `/api/notifications/templates/`
- **Get Template**: `/api/notifications/templates/<template_id>/`
- **List Channels**: `/api/notifications/channels/`

### Notification Statistics
- **Notification Stats**: `/api/notifications/stats/`
- **Delivery Stats**: `/api/notifications/delivery-stats/`

### Bulk Operations
- **Bulk Send**: `/api/notifications/bulk/send/`
- **Cleanup Old**: `/api/notifications/cleanup/`

---

## Integrations Endpoints

### Google Drive Integration
- **Get Auth URL**: `/api/integrations/google-drive/auth-url/`
- **OAuth Callback**: `/api/integrations/google-drive/oauth-callback/`
- **List Files**: `/api/integrations/google-drive/files/`
- **Get Streaming URL**: `/api/integrations/google-drive/files/<file_id>/streaming-url/`

### AWS S3 Integration
- **Presigned Upload URL**: `/api/integrations/s3/presigned-upload/`
- **Upload File**: `/api/integrations/s3/upload/`
- **Get Streaming URL**: `/api/integrations/s3/files/<file_key>/streaming-url/`

### Social OAuth
- **Get Auth URL**: `/api/integrations/oauth/<provider>/auth-url/`
- **OAuth Callback**: `/api/integrations/oauth/<provider>/callback/`

### General Integration
- **List Connections**: `/api/integrations/connections/`
- **Disconnect Service**: `/api/integrations/connections/<connection_id>/disconnect/`

---

## Interactive Features Endpoints

### Live Reactions
- **Get Reactions**: `/api/interactive/parties/<party_id>/reactions/`
- **Create Reaction**: `/api/interactive/parties/<party_id>/reactions/create/`

### Voice Chat
- **Get Voice Chat Room**: `/api/interactive/parties/<party_id>/voice-chat/`
- **Manage Voice Chat**: `/api/interactive/parties/<party_id>/voice-chat/manage/`

### Screen Sharing
- **Get Screen Shares**: `/api/interactive/parties/<party_id>/screen-shares/`
- **Update Screen Share**: `/api/interactive/screen-shares/<share_id>/update/`
- **Get Annotations**: `/api/interactive/screen-shares/<share_id>/annotations/`

### Interactive Polls
- **Get Party Polls**: `/api/interactive/parties/<party_id>/polls/`
- **Create Poll**: `/api/interactive/parties/<party_id>/polls/create/`
- **Publish Poll**: `/api/interactive/polls/<poll_id>/publish/`
- **Submit Response**: `/api/interactive/polls/<poll_id>/respond/`

### Analytics
- **Interactive Analytics**: `/api/interactive/parties/<party_id>/analytics/`

---

## Moderation Endpoints

### Content Reports
- **List/Create Reports**: `/api/moderation/reports/`
- **Get Report**: `/api/moderation/reports/<report_id>/`

### Admin Moderation
- **Moderation Queue**: `/api/moderation/admin/queue/`
- **Moderation Stats**: `/api/moderation/admin/stats/`
- **Moderation Dashboard**: `/api/moderation/admin/dashboard/`

### Report Actions
- **Assign Report**: `/api/moderation/admin/reports/<report_id>/assign/`
- **Resolve Report**: `/api/moderation/admin/reports/<report_id>/resolve/`
- **Dismiss Report**: `/api/moderation/admin/reports/<report_id>/dismiss/`
- **Report Actions**: `/api/moderation/admin/reports/<report_id>/actions/`

### Bulk Operations
- **Bulk Report Action**: `/api/moderation/admin/reports/bulk-action/`

### Utility
- **Report Types**: `/api/moderation/report-types/`
- **Content Types**: `/api/moderation/content-types/`

---

## Admin Panel Endpoints

### Dashboard
- **Admin Dashboard**: `/api/admin/dashboard/`
- **Analytics Overview**: `/api/admin/analytics/`

### User Management
- **List Users**: `/api/admin/users/`
- **Suspend User**: `/api/admin/users/<user_id>/suspend/`
- **Unsuspend User**: `/api/admin/users/<user_id>/unsuspend/`
- **Bulk User Action**: `/api/admin/users/bulk-action/`
- **Export Users**: `/api/admin/users/export/`
- **User Action History**: `/api/admin/users/<user_id>/actions/`

### Content Management
- **List Parties**: `/api/admin/parties/`
- **Delete Party**: `/api/admin/parties/<party_id>/delete/`
- **Video Management**: `/api/admin/videos/`
- **Delete Video**: `/api/admin/videos/<video_id>/delete/`

### System Management
- **System Logs**: `/api/admin/logs/`
- **System Health**: `/api/admin/system-health/`
- **System Maintenance**: `/api/admin/maintenance/`

### Communication
- **Broadcast Message**: `/api/admin/broadcast/`
- **Send Notification**: `/api/admin/notifications/send/`

### Settings
- **Get Settings**: `/api/admin/settings/`
- **Update Settings**: `/api/admin/settings/update/`

---

## WebSocket Endpoints

### Chat WebSockets
- **Chat Room**: `ws://localhost:8000/ws/chat/<party_id>/`
- **Video Sync**: `ws://localhost:8000/ws/party/<party_id>/sync/`
- **Notifications**: `ws://localhost:8000/ws/notifications/`
- **Test WebSocket**: `ws://localhost:8000/ws/test/`

### Interactive WebSockets
- **Interactive Features**: `ws://localhost:8000/ws/interactive/<party_id>/`
- **Voice Chat**: `ws://localhost:8000/ws/voice-chat/room/<room_id>/`
- **Screen Share**: `ws://localhost:8000/ws/screen-share/<share_id>/`

### Party WebSockets
- **Party Updates**: `ws://localhost:8000/ws/party/<party_id>/`
- **Party Lobby**: `ws://localhost:8000/ws/party/<party_id>/lobby/`

---

## Common Response Formats

### Success Response
```json
{
  "success": true,
  "data": {...},
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": {...}
}
```

### Pagination
```json
{
  "count": 100,
  "next": "http://example.com/api/endpoint/?page=2",
  "previous": null,
  "results": [...]
}
```

---

## Status Codes

- **200**: OK - Request successful
- **201**: Created - Resource created successfully
- **400**: Bad Request - Invalid request data
- **401**: Unauthorized - Authentication required
- **403**: Forbidden - Insufficient permissions
- **404**: Not Found - Resource not found
- **429**: Too Many Requests - Rate limit exceeded
- **500**: Internal Server Error - Server error

---

## Rate Limiting

Rate limits are applied to authentication endpoints and other sensitive operations:
- Authentication endpoints: Limited per IP address
- API endpoints: Limited per user account
- WebSocket connections: Limited per user

---

## Data Models

### User Model Fields
- `id`: UUID primary key
- `email`: Unique email address
- `first_name`, `last_name`: User names
- `avatar`: Profile picture
- `is_premium`: Premium subscription status
- `subscription_expires`: Premium subscription expiry
- `is_email_verified`: Email verification status
- `date_joined`, `last_login`: Timestamps

### Video Model Fields
- `id`: UUID primary key
- `title`, `description`: Video metadata
- `uploader`: Foreign key to User
- `source_type`: `upload`, `gdrive`, `s3`, `youtube`, `url`
- `visibility`: `public`, `friends`, `private`
- `status`: `uploading`, `processing`, `ready`, `failed`, `deleted`
- `duration`, `file_size`, `resolution`: Video properties
- `view_count`, `like_count`: Engagement metrics

### Party Model Fields
- `id`: UUID primary key
- `title`, `description`: Party metadata
- `host`: Foreign key to User
- `video`: Foreign key to Video
- `status`: `scheduled`, `live`, `paused`, `ended`
- `visibility`: `public`, `friends`, `private`
- `max_participants`: Maximum number of participants
- `scheduled_start`: When party is scheduled to start

This documentation covers all major endpoints in the Watch Party backend API. For detailed request/response schemas for specific endpoints, refer to the OpenAPI documentation at `/api/docs/`.

---

## API Implementation Status

✅ **Fully Implemented & Verified**:
- Authentication endpoints (all 15+ endpoints verified)
- User management endpoints (profile, friends, settings)
- Video CRUD operations with ViewSet actions
- Party management with all ViewSet actions
- Chat functionality and moderation
- Billing and subscription management
- Analytics (basic, dashboard, and advanced)
- Notifications management
- Integration services (Google Drive, S3, OAuth)
- Interactive features (reactions, polls, voice chat)
- Content moderation system
- Admin panel functionality
- WebSocket endpoints for real-time features

✅ **Special Endpoints**:
- `/api/` - API root with endpoint discovery
- `/api/test/` - Health check endpoint
- `/api/dashboard/stats/` - Main dashboard statistics
- `/api/dashboard/activities/` - Recent user activities
- Legacy redirects for backward compatibility

✅ **Documentation & Schema**:
- `/api/docs/` - Swagger UI documentation
- `/api/schema/` - OpenAPI 3.0 schema
- `/api/redoc/` - ReDoc documentation

All endpoints listed in this documentation are confirmed to be implemented in the backend codebase with proper URL routing, view classes, serializers, and permissions.
