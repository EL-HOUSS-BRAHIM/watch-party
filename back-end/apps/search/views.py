"""
Views for Global Search functionality
"""

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Count, F, Case, When, IntegerField, Value
from django.apps import apps
from django.utils import timezone
from datetime import timedelta

from core.responses import StandardResponse


class GlobalSearchView(APIView):
    """
    Global search across users, videos, parties, and other content with advanced filtering
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Search across multiple models with filters and sorting"""
        query = request.GET.get('q', '').strip()
        if not query:
            return StandardResponse.error("Query parameter 'q' is required")
        
        if len(query) < 2:
            return StandardResponse.error("Query must be at least 2 characters long")
        
        # Get search parameters
        search_type = request.GET.get('type', 'all')  # all, users, videos, parties, groups
        sort_by = request.GET.get('sort', 'relevance')  # relevance, date, popularity, alphabetical
        date_filter = request.GET.get('date_filter', 'all')  # all, today, week, month, year
        category = request.GET.get('category', '')
        limit = min(int(request.GET.get('limit', 10)), 50)  # Max 50 results
        
        # Get models
        User = apps.get_model('authentication', 'User')
        Video = apps.get_model('videos', 'Video')
        WatchParty = apps.get_model('parties', 'WatchParty')
        SocialGroup = apps.get_model('social', 'SocialGroup')
        
        # Search users (excluding current user)
        users = User.objects.filter(
            Q(username__icontains=query) | 
            Q(first_name__icontains=query) |
            Q(last_name__icontains=query) |
            Q(email__icontains=query),
            is_active=True
        ).exclude(id=request.user.id)[:5]
        
        # Search videos
        videos = Video.objects.filter(
            Q(title__icontains=query) | 
            Q(description__icontains=query),
            is_active=True
        )[:10]
        
        # Search parties
        parties = WatchParty.objects.filter(
            Q(title__icontains=query) | 
            Q(description__icontains=query),
            is_active=True
        )[:5]
        
        # Serialize results
        users_data = []
        for user in users:
            users_data.append({
                'id': user.id,
                'username': user.username,
                'name': user.get_full_name(),
                'email': user.email,
                'profile_picture': user.profile_picture.url if user.profile_picture else None,
                'is_online': getattr(user, 'is_online', False),
            })
        
        videos_data = []
        for video in videos:
            videos_data.append({
                'id': video.id,
                'title': video.title,
                'description': video.description[:200] + '...' if len(video.description) > 200 else video.description,
                'thumbnail': video.thumbnail.url if video.thumbnail else None,
                'duration': video.duration,
                'uploaded_by': {
                    'id': video.uploaded_by.id,
                    'username': video.uploaded_by.username,
                    'name': video.uploaded_by.get_full_name(),
                },
                'created_at': video.created_at,
                'views': getattr(video, 'view_count', 0),
            })
        
        parties_data = []
        for party in parties:
            parties_data.append({
                'id': party.id,
                'title': party.title,
                'description': party.description[:200] + '...' if len(party.description) > 200 else party.description,
                'host': {
                    'id': party.host.id,
                    'username': party.host.username,
                    'name': party.host.get_full_name(),
                },
                'is_public': party.is_public,
                'is_live': party.is_active,
                'participant_count': party.participants.filter(is_active=True).count(),
                'created_at': party.created_at,
            })
        
        total_results = len(users_data) + len(videos_data) + len(parties_data)
        
        return StandardResponse.success(
            data={
                'query': query,
                'results': {
                    'users': users_data,
                    'videos': videos_data,
                    'parties': parties_data,
                },
                'counts': {
                    'users': len(users_data),
                    'videos': len(videos_data),
                    'parties': len(parties_data),
                    'total': total_results,
                },
                'has_more': {
                    'users': users.count() >= 5,
                    'videos': videos.count() >= 10,
                    'parties': parties.count() >= 5,
                }
            },
            message=f"Found {total_results} results for '{query}'"
        )


class DiscoverContentView(APIView):
    """
    Content discovery based on user preferences and trending content
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get personalized content recommendations"""
        user = request.user
        
        # Get models
        Video = apps.get_model('videos', 'Video')
        WatchParty = apps.get_model('parties', 'WatchParty')
        User = apps.get_model('authentication', 'User')
        
        # Get trending videos (most viewed recently)
        from django.utils import timezone
        from datetime import timedelta
        
        one_week_ago = timezone.now() - timedelta(days=7)
        
        trending_videos = Video.objects.filter(
            is_active=True,
            created_at__gte=one_week_ago
        ).order_by('-view_count', '-created_at')[:8]
        
        # Get active parties
        active_parties = WatchParty.objects.filter(
            is_active=True,
            is_public=True
        ).order_by('-created_at')[:6]
        
        # Get suggested users (random for now, could be based on mutual friends/interests)
        suggested_users = User.objects.filter(
            is_active=True
        ).exclude(id=user.id).order_by('?')[:8]
        
        # Get featured content (recent uploads from popular creators)
        featured_videos = Video.objects.filter(
            is_active=True
        ).select_related('uploaded_by').order_by('-created_at')[:6]
        
        # Serialize data
        trending_videos_data = []
        for video in trending_videos:
            trending_videos_data.append({
                'id': video.id,
                'title': video.title,
                'description': video.description[:150] + '...' if len(video.description) > 150 else video.description,
                'thumbnail': video.thumbnail.url if video.thumbnail else None,
                'duration': video.duration,
                'uploaded_by': {
                    'id': video.uploaded_by.id,
                    'username': video.uploaded_by.username,
                    'name': video.uploaded_by.get_full_name(),
                },
                'views': getattr(video, 'view_count', 0),
                'created_at': video.created_at,
            })
        
        active_parties_data = []
        for party in active_parties:
            active_parties_data.append({
                'id': party.id,
                'title': party.title,
                'description': party.description[:150] + '...' if len(party.description) > 150 else party.description,
                'host': {
                    'id': party.host.id,
                    'username': party.host.username,
                    'name': party.host.get_full_name(),
                },
                'participant_count': party.participants.filter(is_active=True).count(),
                'is_live': party.is_active,
                'created_at': party.created_at,
            })
        
        suggested_users_data = []
        for suggested_user in suggested_users:
            suggested_users_data.append({
                'id': suggested_user.id,
                'username': suggested_user.username,
                'name': suggested_user.get_full_name(),
                'profile_picture': suggested_user.profile_picture.url if suggested_user.profile_picture else None,
                'is_online': getattr(suggested_user, 'is_online', False),
            })
        
        featured_videos_data = []
        for video in featured_videos:
            featured_videos_data.append({
                'id': video.id,
                'title': video.title,
                'description': video.description[:150] + '...' if len(video.description) > 150 else video.description,
                'thumbnail': video.thumbnail.url if video.thumbnail else None,
                'duration': video.duration,
                'uploaded_by': {
                    'id': video.uploaded_by.id,
                    'username': video.uploaded_by.username,
                    'name': video.uploaded_by.get_full_name(),
                },
                'created_at': video.created_at,
            })
        
        return StandardResponse.success(
            data={
                'sections': {
                    'trending_videos': {
                        'title': 'Trending This Week',
                        'items': trending_videos_data,
                    },
                    'active_parties': {
                        'title': 'Live Watch Parties',
                        'items': active_parties_data,
                    },
                    'suggested_users': {
                        'title': 'People You Might Know',
                        'items': suggested_users_data,
                    },
                    'featured_videos': {
                        'title': 'Recently Added',
                        'items': featured_videos_data,
                    },
                }
            },
            message="Discovery content retrieved successfully"
        )
