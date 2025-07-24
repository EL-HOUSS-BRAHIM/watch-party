"""
Chat URLs for Watch Party Backend
"""

from django.urls import path
from . import views

app_name = 'chat'

urlpatterns = [
    # HTTP endpoints for chat history, moderation, etc.
    # WebSocket chat endpoints are handled by Django Channels
    path('history/<uuid:party_id>/', views.ChatHistoryView.as_view(), name='chat_history'),
    path('moderate/', views.ModerateChatView.as_view(), name='moderate_chat'),
]
