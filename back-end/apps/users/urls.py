"""
User URLs for Watch Party Backend
"""

from django.urls import path
from rest_framework.routers import DefaultRouter
from . import views
from . import social_views

app_name = 'users'

urlpatterns = [
    # Dashboard stats
    path('dashboard/stats/', views.DashboardStatsView.as_view(), name='dashboard_stats'),
    
    # User profile management
    path('profile/', views.UserProfileView.as_view(), name='profile'),
    path('profile/update/', views.UpdateProfileView.as_view(), name='update_profile'),
    path('avatar/upload/', views.AvatarUploadView.as_view(), name='upload_avatar'),
    path('achievements/', views.UserAchievementsView.as_view(), name='achievements'),
    path('stats/', views.UserStatsView.as_view(), name='user_stats'),
    path('sessions/', views.UserSessionsView.as_view(), name='sessions'),
    path('sessions/<str:session_id>/', views.RevokeSessionView.as_view(), name='revoke_session'),
    path('sessions/revoke-all/', views.RevokeAllSessionsView.as_view(), name='revoke_all_sessions'),
    path('2fa/enable/', views.Enable2FAView.as_view(), name='enable_2fa'),
    path('2fa/disable/', views.Disable2FAView.as_view(), name='disable_2fa'),
    path('2fa/setup/', views.Setup2FAView.as_view(), name='setup_2fa'),
    path('onboarding/', views.OnboardingView.as_view(), name='onboarding'),
    path('password/', views.UpdatePasswordView.as_view(), name='update_password'),
    path('inventory/', views.UserInventoryView.as_view(), name='inventory'),
    path('friends/suggestions/', views.FriendSuggestionsView.as_view(), name='friend_suggestions'),
    path('friends/requests/', views.FriendRequestsView.as_view(), name='friend_requests'),
    path('friends/<str:request_id>/accept/', views.AcceptFriendRequestView.as_view(), name='accept_friend_request'),
    path('friends/<str:request_id>/decline/', views.DeclineFriendRequestView.as_view(), name='decline_friend_request'),
    path('<str:user_id>/friend-request/', views.SendFriendRequestView.as_view(), name='send_friend_request'),
    path('<str:user_id>/block/', views.BlockUserView.as_view(), name='block_user'),
    
    # Enhanced Social Features
    path('friends/', social_views.friends_list, name='friends_list'),
    path('friends/request/', social_views.send_friend_request, name='send_friend_request'),
    path('friends/<uuid:friendship_id>/accept/', social_views.accept_friend_request, name='accept_friend_request'),
    path('friends/<uuid:friendship_id>/decline/', social_views.decline_friend_request, name='decline_friend_request'),
    path('friends/<str:username>/remove/', social_views.remove_friend, name='remove_friend'),
    path('friends/requests/', social_views.friend_requests, name='friend_requests'),
    path('search/', social_views.search_users, name='search_users'),
    path('activity/', social_views.activity_feed, name='activity_feed'),
    path('suggestions/', social_views.friend_suggestions, name='friend_suggestions'),
    path('block/', social_views.block_user, name='block_user'),
    path('unblock/', social_views.unblock_user, name='unblock_user'),
    path('<uuid:user_id>/profile/', social_views.user_profile, name='user_profile'),
    
    # Legacy friend system (keeping for compatibility)
    path('friends/legacy/', views.FriendsListView.as_view(), name='legacy_friends_list'),
    path('friends/legacy/requests/', views.FriendRequestsView.as_view(), name='legacy_friend_requests'),
    path('friends/legacy/send/', views.SendFriendRequestView.as_view(), name='legacy_send_friend_request'),
    path('friends/legacy/<uuid:request_id>/accept/', views.AcceptFriendRequestView.as_view(), name='legacy_accept_friend_request'),
    path('friends/legacy/<uuid:request_id>/decline/', views.DeclineFriendRequestView.as_view(), name='legacy_decline_friend_request'),
    path('friends/legacy/<uuid:friend_id>/remove/', views.RemoveFriendView.as_view(), name='legacy_remove_friend'),
    path('users/<uuid:user_id>/block/', views.BlockUserView.as_view(), name='legacy_block_user'),
    path('users/<uuid:user_id>/unblock/', views.UnblockUserView.as_view(), name='legacy_unblock_user'),
    
    # User search and discovery (legacy)
    path('legacy/search/', views.UserSearchView.as_view(), name='legacy_user_search'),
    path('<uuid:user_id>/public-profile/', views.PublicProfileView.as_view(), name='legacy_public_profile'),
    
    # Settings and preferences
    path('settings/', views.UserSettingsView.as_view(), name='user_settings'),
    path('notifications/settings/', views.NotificationSettingsView.as_view(), name='notification_settings'),
    path('privacy/settings/', views.PrivacySettingsView.as_view(), name='privacy_settings'),
    
    # Data export and account management (GDPR compliance)
    path('export-data/', views.ExportUserDataView.as_view(), name='export_user_data'),
    path('delete-account/', views.DeleteAccountView.as_view(), name='delete_account'),
    
    # Enhanced social features
    path('<uuid:user_id>/mutual-friends/', views.UserMutualFriendsView.as_view(), name='mutual_friends'),
    path('online-status/', views.UserOnlineStatusView.as_view(), name='online_status'),
    
    # Activity and history
    path('legacy/activity/', views.UserActivityView.as_view(), name='legacy_user_activity'),
    path('watch-history/', views.WatchHistoryView.as_view(), name='watch_history'),
    path('favorites/', views.FavoritesView.as_view(), name='favorites'),
    path('favorites/add/', views.AddFavoriteView.as_view(), name='add_favorite'),
    path('favorites/<uuid:favorite_id>/remove/', views.RemoveFavoriteView.as_view(), name='remove_favorite'),
    
    # Notifications
    path('notifications/', views.NotificationsView.as_view(), name='notifications'),
    path('notifications/<uuid:notification_id>/read/', views.MarkNotificationReadView.as_view(), name='mark_notification_read'),
    path('notifications/mark-all-read/', views.MarkAllNotificationsReadView.as_view(), name='mark_all_notifications_read'),
    
    # Reports
    path('report/', views.UserReportView.as_view(), name='report_user'),
]
