"""
URL configuration for the Interactive app.
Defines API endpoints for interactive features.
"""

from django.urls import path
from . import views

app_name = 'interactive'

urlpatterns = [
    # Live Reactions
    path(
        'parties/<uuid:party_id>/reactions/',
        views.get_live_reactions,
        name='get-live-reactions'
    ),
    path(
        'parties/<uuid:party_id>/reactions/create/',
        views.create_live_reaction,
        name='create-live-reaction'
    ),
    
    # Voice Chat
    path(
        'parties/<uuid:party_id>/voice-chat/',
        views.get_voice_chat_room,
        name='get-voice-chat-room'
    ),
    path(
        'parties/<uuid:party_id>/voice-chat/manage/',
        views.manage_voice_chat_room,
        name='manage-voice-chat-room'
    ),
    
    # Screen Sharing
    path(
        'parties/<uuid:party_id>/screen-shares/',
        views.get_active_screen_shares,
        name='get-screen-shares'
    ),
    path(
        'screen-shares/<uuid:share_id>/update/',
        views.update_screen_share,
        name='update-screen-share'
    ),
    path(
        'screen-shares/<uuid:share_id>/annotations/',
        views.get_screen_annotations,
        name='get-screen-annotations'
    ),
    
    # Interactive Polls
    path(
        'parties/<uuid:party_id>/polls/',
        views.get_party_polls,
        name='get-party-polls'
    ),
    path(
        'parties/<uuid:party_id>/polls/create/',
        views.create_poll,
        name='create-poll'
    ),
    path(
        'polls/<uuid:poll_id>/publish/',
        views.publish_poll,
        name='publish-poll'
    ),
    path(
        'polls/<uuid:poll_id>/respond/',
        views.submit_poll_response,
        name='submit-poll-response'
    ),
    
    # Analytics
    path(
        'parties/<uuid:party_id>/analytics/',
        views.get_interactive_analytics,
        name='get-analytics'
    ),
]
