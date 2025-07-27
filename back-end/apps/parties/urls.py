"""
Party URLs for Watch Party Backend
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    WatchPartyViewSet, JoinByCodeView, PartySearchView,
    PartyInvitationViewSet, PartyReportView, RecentPartiesView, PublicPartiesView
)
from .views_enhanced import (
    generate_party_invite_code, join_by_invite_code, party_analytics,
    trending_parties, update_party_analytics, party_recommendations
)

app_name = 'parties'

# Create router for ViewSets
router = DefaultRouter()
router.register(r'', WatchPartyViewSet, basename='party')
router.register(r'invitations', PartyInvitationViewSet, basename='invitation')

urlpatterns = [
    # Special endpoints first (before router includes)
    path('recent/', RecentPartiesView.as_view(), name='recent'),
    path('public/', PublicPartiesView.as_view(), name='public'),
    path('trending/', trending_parties, name='trending'),
    path('recommendations/', party_recommendations, name='recommendations'),
    path('join-by-code/', JoinByCodeView.as_view(), name='join_by_code'),
    path('join-by-invite/', join_by_invite_code, name='join_by_invite'),
    path('search/', PartySearchView.as_view(), name='search'),
    path('report/', PartyReportView.as_view(), name='report'),
    
    # Party-specific enhanced endpoints
    path('<uuid:party_id>/generate-invite/', generate_party_invite_code, name='generate_invite'),
    path('<uuid:party_id>/analytics/', party_analytics, name='analytics'),
    path('<uuid:party_id>/update-analytics/', update_party_analytics, name='update_analytics'),
    
    # Party CRUD operations (handled by ViewSet)
    path('', include(router.urls)),
]

# ViewSet generates these URLs:
# GET    /api/parties/                        - List parties
# POST   /api/parties/                        - Create party
# GET    /api/parties/{id}/                   - Get party details
# PUT    /api/parties/{id}/                   - Update party
# PATCH  /api/parties/{id}/                   - Partial update party
# DELETE /api/parties/{id}/                   - Delete party
# POST   /api/parties/{id}/join/              - Join party
# POST   /api/parties/{id}/leave/             - Leave party
# POST   /api/parties/{id}/start/             - Start party (host only)
# POST   /api/parties/{id}/control/           - Control video playback
# GET    /api/parties/{id}/chat/              - Get chat messages
# POST   /api/parties/{id}/chat/              - Send chat message
# POST   /api/parties/{id}/react/             - Add reaction
# GET    /api/parties/{id}/participants/      - Get participants
# POST   /api/parties/{id}/invite/            - Invite users

# Invitation URLs:
# GET    /api/parties/invitations/            - List invitations
# GET    /api/parties/invitations/{id}/       - Get invitation details
# POST   /api/parties/invitations/{id}/accept/ - Accept invitation
# POST   /api/parties/invitations/{id}/decline/ - Decline invitation
