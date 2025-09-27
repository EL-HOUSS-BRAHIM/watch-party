"""
URL patterns for messaging endpoints
"""

from django.urls import path
from .views import ConversationsView, MessagesView

app_name = 'messaging'

urlpatterns = [
    path('conversations/', ConversationsView.as_view(), name='conversations'),
    path('conversations/<int:conversation_id>/messages/', MessagesView.as_view(), name='messages'),
]
