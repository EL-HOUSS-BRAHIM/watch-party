# Watch Party API Endpoints

## Main API Routes

### API Root
- `/api/`
- `/`

### Test & Dashboard
- `/api/test/`
- `/api/dashboard/stats/`
- `/api/dashboard/activities/`

### API Documentation
- `/api/schema/`
- `/api/docs/`
- `/api/redoc/`

---

## Authentication API (`/api/auth/`)

### User Registration & Login
- `/api/auth/register/`
- `/api/auth/login/`
- `/api/auth/logout/`
- `/api/auth/refresh/`

### Social Authentication
- `/api/auth/social/<str:provider>/`
- `/api/auth/social/google/`
- `/api/auth/social/github/`

### Password Management
- `/api/auth/forgot-password/`
- `/api/auth/reset-password/`
- `/api/auth/change-password/`

### Account Verification
- `/api/auth/verify-email/`
- `/api/auth/resend-verification/`

### User Profile
- `/api/auth/profile/`

### Google Drive Integration
- `/api/auth/google-drive/auth/`
- `/api/auth/google-drive/disconnect/`
- `/api/auth/google-drive/status/`

### Two-Factor Authentication
- `/api/auth/2fa/setup/`
- `/api/auth/2fa/verify/`
- `/api/auth/2fa/disable/`

### Session Management
- `/api/auth/sessions/`
- `/api/auth/sessions/<uuid:session_id>/`

---

## Users API (`/api/users/`)

### Dashboard
- `/api/users/dashboard/stats/`

### Profile Management
- `/api/users/profile/`
- `/api/users/profile/update/`
- `/api/users/avatar/upload/`
- `/api/users/achievements/`
- `/api/users/stats/`
- `/api/users/onboarding/`
- `/api/users/password/`
- `/api/users/inventory/`

### Session Management
- `/api/users/sessions/`
- `/api/users/sessions/<str:session_id>/`
- `/api/users/sessions/revoke-all/`

### Two-Factor Authentication
- `/api/users/2fa/enable/`
- `/api/users/2fa/disable/`
- `/api/users/2fa/setup/`

### Friends & Social
- `/api/users/friends/suggestions/`
- `/api/users/friends/requests/`
- `/api/users/friends/<str:request_id>/accept/`
- `/api/users/friends/<str:request_id>/decline/`
- `/api/users/<str:user_id>/friend-request/`
- `/api/users/<str:user_id>/block/`
- `/api/users/friends/`
- `/api/users/friends/request/`
- `/api/users/friends/<uuid:friendship_id>/accept/`
- `/api/users/friends/<uuid:friendship_id>/decline/`
- `/api/users/friends/<str:username>/remove/`
- `/api/users/search/`
- `/api/users/activity/`
- `/api/users/suggestions/`
- `/api/users/block/`
- `/api/users/unblock/`
- `/api/users/<uuid:user_id>/profile/`

### Legacy Routes
- `/api/users/friends/legacy/`
- `/api/users/friends/legacy/requests/`
- `/api/users/friends/legacy/send/`
- `/api/users/friends/legacy/<uuid:request_id>/accept/`
- `/api/users/friends/legacy/<uuid:request_id>/decline/`
- `/api/users/friends/legacy/<uuid:friend_id>/remove/`
- `/api/users/users/<uuid:user_id>/block/`
- `/api/users/users/<uuid:user_id>/unblock/`
- `/api/users/legacy/search/`
- `/api/users/<uuid:user_id>/public-profile/`

### Settings
- `/api/users/settings/`
- `/api/users/notifications/settings/`
- `/api/users/privacy/settings/`

### Data Management
- `/api/users/export-data/`
- `/api/users/delete-account/`

### Additional Features
- `/api/users/<uuid:user_id>/mutual-friends/`
- `/api/users/online-status/`
- `/api/users/legacy/activity/`
- `/api/users/watch-history/`
- `/api/users/favorites/`
- `/api/users/favorites/add/`
- `/api/users/favorites/<uuid:favorite_id>/remove/`

### Notifications
- `/api/users/notifications/`
- `/api/users/notifications/<uuid:notification_id>/read/`
- `/api/users/notifications/mark-all-read/`

### Reporting
- `/api/users/report/`

---

## Videos API (`/api/videos/`)

### Video CRUD (ViewSet)
- `/api/videos/` (GET - List videos, POST - Create video)
- `/api/videos/<uuid:id>/` (GET - Get details, PUT - Update, PATCH - Partial update, DELETE - Delete)
- `/api/videos/<uuid:id>/like/`
- `/api/videos/<uuid:id>/comments/`
- `/api/videos/<uuid:id>/stream/`
- `/api/videos/<uuid:id>/download/`

### Upload Endpoints
- `/api/videos/upload/`
- `/api/videos/upload/s3/`
- `/api/videos/upload/<uuid:upload_id>/complete/`
- `/api/videos/upload/<uuid:upload_id>/status/`

### Video Processing & Streaming
- `/api/videos/<uuid:video_id>/stream/`
- `/api/videos/<uuid:video_id>/thumbnail/`
- `/api/videos/<uuid:video_id>/analytics/`
- `/api/videos/<uuid:video_id>/processing-status/`
- `/api/videos/<uuid:video_id>/quality-variants/`
- `/api/videos/<uuid:video_id>/regenerate-thumbnail/`
- `/api/videos/<uuid:video_id>/share/`

### Advanced Video Analytics
- `/api/videos/<uuid:video_id>/analytics/detailed/`
- `/api/videos/<uuid:video_id>/analytics/heatmap/`
- `/api/videos/<uuid:video_id>/analytics/retention/`
- `/api/videos/<uuid:video_id>/analytics/journey/`
- `/api/videos/<uuid:video_id>/analytics/comparative/`

### Channel Analytics
- `/api/videos/analytics/channel/`
- `/api/videos/analytics/trending/`

### Video Validation & Search
- `/api/videos/validate-url/`
- `/api/videos/search/`
- `/api/videos/search/advanced/`

### Google Drive Integration
- `/api/videos/gdrive/`
- `/api/videos/gdrive/upload/`
- `/api/videos/gdrive/<uuid:video_id>/delete/`
- `/api/videos/gdrive/<uuid:video_id>/stream/`

### Video Proxy
- `/api/videos/<uuid:video_id>/proxy/`

---

## Parties API (`/api/parties/`)

### Special Endpoints
- `/api/parties/recent/`
- `/api/parties/public/`
- `/api/parties/trending/`
- `/api/parties/recommendations/`
- `/api/parties/join-by-code/`
- `/api/parties/join-by-invite/`
- `/api/parties/search/`
- `/api/parties/report/`

### Party-Specific Enhanced
- `/api/parties/<uuid:party_id>/generate-invite/`
- `/api/parties/<uuid:party_id>/analytics/`
- `/api/parties/<uuid:party_id>/update-analytics/`

### Party CRUD (ViewSet)
- `/api/parties/` (GET - List parties, POST - Create party)
- `/api/parties/<uuid:id>/` (GET - Get details, PUT - Update, PATCH - Partial update, DELETE - Delete)
- `/api/parties/<uuid:id>/join/`
- `/api/parties/<uuid:id>/leave/`
- `/api/parties/<uuid:id>/start/`
- `/api/parties/<uuid:id>/control/`
- `/api/parties/<uuid:id>/chat/`
- `/api/parties/<uuid:id>/react/`
- `/api/parties/<uuid:id>/participants/`
- `/api/parties/<uuid:id>/invite/`
- `/api/parties/<uuid:id>/select_gdrive_movie/`
- `/api/parties/<uuid:id>/sync_state/`

### Invitations (ViewSet)
- `/api/parties/invitations/` (GET - List invitations)
- `/api/parties/invitations/<uuid:id>/` (GET - Get invitation details)
- `/api/parties/invitations/<uuid:id>/accept/`
- `/api/parties/invitations/<uuid:id>/decline/`
- `/api/parties/invitations/<uuid:id>/analytics/`
- `/api/parties/invitations/<uuid:id>/join_by_code/`
- `/api/parties/invitations/<uuid:id>/kick_participant/`
- `/api/parties/invitations/<uuid:id>/promote_participant/`

---

## Chat API (`/api/chat/`)

### Chat Messages
- `/api/chat/<uuid:party_id>/messages/`
- `/api/chat/<uuid:party_id>/messages/send/`

### Chat Room Management
- `/api/chat/<uuid:room_id>/join/`
- `/api/chat/<uuid:room_id>/leave/`
- `/api/chat/<uuid:room_id>/active-users/`
- `/api/chat/<uuid:room_id>/settings/`

### Chat Moderation
- `/api/chat/<uuid:room_id>/moderate/`
- `/api/chat/<uuid:room_id>/ban/`
- `/api/chat/<uuid:room_id>/unban/`
- `/api/chat/<uuid:room_id>/moderation-log/`

### Chat Statistics
- `/api/chat/<uuid:room_id>/stats/`

### Legacy Routes
- `/api/chat/history/<uuid:party_id>/`
- `/api/chat/moderate/`

---

## Billing API (`/api/billing/`)

### Subscription Management
- `/api/billing/plans/`
- `/api/billing/subscribe/`
- `/api/billing/subscription/`
- `/api/billing/subscription/cancel/`
- `/api/billing/subscription/resume/`

### Payment Methods
- `/api/billing/payment-methods/`
- `/api/billing/payment-methods/<uuid:pk>/`
- `/api/billing/payment-methods/<uuid:pk>/set-default/`

### Billing History
- `/api/billing/history/`
- `/api/billing/invoices/<uuid:invoice_id>/`
- `/api/billing/invoices/<uuid:invoice_id>/download/`

### Billing Address
- `/api/billing/address/`

### Promotional Codes
- `/api/billing/promo-code/validate/`

### Webhooks
- `/api/billing/webhooks/stripe/`

---

## Analytics API (`/api/analytics/`)

### Basic Analytics
- `/api/analytics/`
- `/api/analytics/user-stats/`
- `/api/analytics/party-stats/<uuid:party_id>/`
- `/api/analytics/admin/analytics/`
- `/api/analytics/export/`

### Dashboard Analytics
- `/api/analytics/dashboard/`
- `/api/analytics/user/`
- `/api/analytics/video/<uuid:video_id>/`
- `/api/analytics/party/<uuid:party_id>/`
- `/api/analytics/system/`
- `/api/analytics/system/performance/`
- `/api/analytics/revenue/`
- `/api/analytics/retention/`
- `/api/analytics/content/`
- `/api/analytics/events/`

### Advanced Analytics
- `/api/analytics/dashboard/realtime/`
- `/api/analytics/advanced/query/`
- `/api/analytics/ab-testing/`
- `/api/analytics/predictive/`

### Extended Analytics
- `/api/analytics/platform-overview/`
- `/api/analytics/user-behavior/`
- `/api/analytics/content-performance/`
- `/api/analytics/revenue-advanced/`
- `/api/analytics/personal/`
- `/api/analytics/real-time/`

---

## Notifications API (`/api/notifications/`)

### Notification Management
- `/api/notifications/`
- `/api/notifications/<uuid:pk>/`
- `/api/notifications/<uuid:pk>/mark-read/`
- `/api/notifications/mark-all-read/`
- `/api/notifications/clear-all/`

### Notification Preferences
- `/api/notifications/preferences/`
- `/api/notifications/preferences/update/`

### Mobile Push Notifications
- `/api/notifications/push/token/update/`
- `/api/notifications/push/token/remove/`
- `/api/notifications/push/test/`
- `/api/notifications/push/broadcast/`

### Templates & Channels (Admin)
- `/api/notifications/templates/`
- `/api/notifications/templates/<uuid:pk>/`
- `/api/notifications/channels/`

### Statistics & Bulk Operations
- `/api/notifications/stats/`
- `/api/notifications/delivery-stats/`
- `/api/notifications/bulk/send/`
- `/api/notifications/cleanup/`

---

## Integrations API (`/api/integrations/`)

### Google Drive
- `/api/integrations/auth-url/`
- `/api/integrations/oauth-callback/`
- `/api/integrations/files/`
- `/api/integrations/files/<str:file_id>/streaming-url/`

### S3 Integration
- `/api/integrations/presigned-upload/`
- `/api/integrations/upload/`
- `/api/integrations/files/<path:file_key>/streaming-url/`

### Social OAuth
- `/api/integrations/<str:provider>/auth-url/`
- `/api/integrations/<str:provider>/callback/`

### Integration Management
- `/api/integrations/health/`
- `/api/integrations/status/`
- `/api/integrations/management/`
- `/api/integrations/test/`
- `/api/integrations/types/`

### User Connections
- `/api/integrations/connections/`
- `/api/integrations/connections/<int:connection_id>/disconnect/`

### Sub-routes
- `/api/integrations/google-drive/` (includes Google Drive patterns)
- `/api/integrations/s3/` (includes S3 patterns)
- `/api/integrations/oauth/` (includes Social OAuth patterns)

---

## Interactive API (`/api/interactive/`)

### Live Reactions
- `/api/interactive/parties/<uuid:party_id>/reactions/`
- `/api/interactive/parties/<uuid:party_id>/reactions/create/`

### Voice Chat
- `/api/interactive/parties/<uuid:party_id>/voice-chat/`
- `/api/interactive/parties/<uuid:party_id>/voice-chat/manage/`

### Screen Sharing
- `/api/interactive/parties/<uuid:party_id>/screen-shares/`
- `/api/interactive/screen-shares/<uuid:share_id>/update/`
- `/api/interactive/screen-shares/<uuid:share_id>/annotations/`

### Interactive Polls
- `/api/interactive/parties/<uuid:party_id>/polls/`
- `/api/interactive/parties/<uuid:party_id>/polls/create/`
- `/api/interactive/polls/<uuid:poll_id>/publish/`
- `/api/interactive/polls/<uuid:poll_id>/respond/`

### Analytics
- `/api/interactive/parties/<uuid:party_id>/analytics/`

---

## Moderation API (`/api/moderation/`)

### Content Reports
- `/api/moderation/reports/`
- `/api/moderation/reports/<uuid:pk>/`

### Admin Moderation
- `/api/moderation/admin/queue/`
- `/api/moderation/admin/stats/`
- `/api/moderation/admin/dashboard/`

### Report Management
- `/api/moderation/admin/reports/<uuid:report_id>/assign/`
- `/api/moderation/admin/reports/<uuid:report_id>/resolve/`
- `/api/moderation/admin/reports/<uuid:report_id>/dismiss/`
- `/api/moderation/admin/reports/<uuid:report_id>/actions/`

### Bulk Operations
- `/api/moderation/admin/reports/bulk-action/`

### Reference Data
- `/api/moderation/report-types/`
- `/api/moderation/content-types/`

---

## Store API (`/api/store/`)

### Store Items
- `/api/store/items/`
- `/api/store/purchase/`

### User Inventory
- `/api/store/inventory/`

### Achievements & Rewards
- `/api/store/achievements/`
- `/api/store/rewards/`
- `/api/store/rewards/<int:reward_id>/claim/`

### Statistics
- `/api/store/stats/`

---

## Search API (`/api/search/`)

### Global Search
- `/api/search/`
- `/api/search/discover/`

---

## Social API (`/api/social/`)

### Social Groups
- `/api/social/groups/`
- `/api/social/groups/<int:group_id>/`
- `/api/social/groups/<int:group_id>/join/`
- `/api/social/groups/<int:group_id>/leave/`

---

## Messaging API (`/api/messaging/`)

### Conversations & Messages
- `/api/messaging/conversations/`
- `/api/messaging/conversations/<int:conversation_id>/messages/`

---

## Support API (`/api/support/`)

### FAQ
- `/api/support/faq/categories/`
- `/api/support/faq/`
- `/api/support/faq/<uuid:faq_id>/vote/`
- `/api/support/faq/<uuid:faq_id>/view/`

### Support Tickets
- `/api/support/tickets/`
- `/api/support/tickets/<uuid:ticket_id>/`
- `/api/support/tickets/<uuid:ticket_id>/messages/`

### Feedback
- `/api/support/feedback/`
- `/api/support/feedback/<uuid:feedback_id>/vote/`

### Search
- `/api/support/search/`

---

## Mobile API (`/api/mobile/`)

### Mobile App Features
- `/api/mobile/config/`
- `/api/mobile/home/`
- `/api/mobile/sync/`
- `/api/mobile/push-token/`
- `/api/mobile/app-info/`

---

## Admin Panel API (`/api/admin/`)

### Dashboard & Analytics
- `/api/admin/dashboard/`
- `/api/admin/analytics/`

### User Management
- `/api/admin/users/`
- `/api/admin/users/<uuid:user_id>/suspend/`
- `/api/admin/users/<uuid:user_id>/unsuspend/`
- `/api/admin/users/bulk-action/`
- `/api/admin/users/export/`
- `/api/admin/users/<uuid:user_id>/actions/`

### Party Management
- `/api/admin/parties/`
- `/api/admin/parties/<uuid:party_id>/delete/`

### Video Management
- `/api/admin/videos/`
- `/api/admin/videos/<uuid:video_id>/delete/`

### Content Reports
- `/api/admin/reports/`
- `/api/admin/reports/<uuid:report_id>/resolve/`

### System Management
- `/api/admin/logs/`
- `/api/admin/system-health/`
- `/api/admin/maintenance/`

### Communication
- `/api/admin/broadcast/`
- `/api/admin/notifications/send/`

### Settings
- `/api/admin/settings/`
- `/api/admin/settings/update/`

### Health Monitoring
- `/api/admin/health/check/`
- `/api/admin/health/status/`
- `/api/admin/health/metrics/`

---

## Legacy Redirects

### Old Endpoints (Redirect to API)
- `/auth/<path:remaining>` → `/api/auth/`
- `/users/<path:remaining>` → `/api/users/`
- `/videos/<path:remaining>` → `/api/videos/`
- `/parties/<path:remaining>` → `/api/parties/`

---

## Static Files (Development Only)
- `/media/` (Media files)
- `/static/` (Static files)
- `/__debug__/` (Debug toolbar)
