"""
User URLs for Watch Party Backend
"""

from django.urls import path
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'users'

urlpatterns = [
    # Dashboard stats
    path('dashboard/stats/', views.DashboardStatsView.as_view(), name='dashboard_stats'),
    
    # User profile management
    path('profile/', views.UserProfileView.as_view(), name='profile'),
    path('profile/update/', views.UpdateProfileView.as_view(), name='update_profile'),
    path('avatar/upload/', views.AvatarUploadView.as_view(), name='upload_avatar'),
    
    # Friend system
    path('friends/', views.FriendsListView.as_view(), name='friends_list'),
    path('friends/requests/', views.FriendRequestsView.as_view(), name='friend_requests'),
    path('friends/send/', views.SendFriendRequestView.as_view(), name='send_friend_request'),
    path('friends/<uuid:request_id>/accept/', views.AcceptFriendRequestView.as_view(), name='accept_friend_request'),
    path('friends/<uuid:request_id>/decline/', views.DeclineFriendRequestView.as_view(), name='decline_friend_request'),
    path('friends/<uuid:friend_id>/remove/', views.RemoveFriendView.as_view(), name='remove_friend'),
    path('users/<uuid:user_id>/block/', views.BlockUserView.as_view(), name='block_user'),
    path('users/<uuid:user_id>/unblock/', views.UnblockUserView.as_view(), name='unblock_user'),
    
    # User search and discovery
    path('search/', views.UserSearchView.as_view(), name='user_search'),
    path('<uuid:user_id>/public-profile/', views.PublicProfileView.as_view(), name='public_profile'),
    
    # Settings and preferences
    path('settings/', views.UserSettingsView.as_view(), name='user_settings'),
    path('notifications/settings/', views.NotificationSettingsView.as_view(), name='notification_settings'),
    path('privacy/settings/', views.PrivacySettingsView.as_view(), name='privacy_settings'),
    
    # Activity and history
    path('activity/', views.UserActivityView.as_view(), name='user_activity'),
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
