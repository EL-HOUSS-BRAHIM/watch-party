"""
Chat URLs for Watch Party Backend
"""

from django.urls import path
from . import views

app_name = 'chat'

urlpatterns = [
    # Chat history and messaging
    path('<uuid:party_id>/messages/', views.ChatHistoryView.as_view(), name='chat_history'),
    path('<uuid:party_id>/messages/send/', views.SendMessageView.as_view(), name='send_message'),
    
    # Chat room management
    path('<uuid:room_id>/join/', views.join_chat_room, name='join_chat_room'),
    path('<uuid:room_id>/leave/', views.leave_chat_room, name='leave_chat_room'),
    path('<uuid:room_id>/active-users/', views.get_active_users, name='get_active_users'),
    path('<uuid:room_id>/settings/', views.ChatSettingsView.as_view(), name='chat_settings'),
    
    # Chat moderation
    path('<uuid:room_id>/moderate/', views.ModerateChatView.as_view(), name='moderate_chat'),
    path('<uuid:room_id>/ban/', views.BanUserView.as_view(), name='ban_user'),
    path('<uuid:room_id>/unban/', views.UnbanUserView.as_view(), name='unban_user'),
    path('<uuid:room_id>/moderation-log/', views.ChatModerationLogView.as_view(), name='moderation_log'),
    
    # Chat statistics
    path('<uuid:room_id>/stats/', views.ChatStatsView.as_view(), name='chat_stats'),
    
    # Legacy endpoint (keeping for compatibility)
    path('history/<uuid:party_id>/', views.ChatHistoryView.as_view(), name='legacy_chat_history'),
    path('moderate/', views.ModerateChatView.as_view(), name='legacy_moderate_chat'),
]
