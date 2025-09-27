"""
Views for Global Search functionality with enhanced features
"""

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.db.models import Q, Count, F
from django.apps import apps
from django.utils import timezone
from django.contrib.postgres.search import SearchVector, SearchQuery, SearchRank
from django.core.cache import cache
from drf_spectacular.utils import extend_schema
from datetime import timedelta
import time

from shared.responses import StandardResponse
from .models import SearchQuery as SearchQueryModel, SavedSearch, TrendingQuery, SearchSuggestion, SearchAnalytics


class GlobalSearchView(APIView):
    """
    Global search across users, videos, parties, and other content with advanced filtering
    """
    permission_classes = [IsAuthenticated]
    
    @extend_schema(summary="GlobalSearchView GET")
    def get(self, request):
        """Search across multiple models with filters and sorting"""
        start_time = time.time()
        
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
        page = int(request.GET.get('page', 1))
        offset = (page - 1) * limit
        
        # Get client info for analytics
        session_id = request.GET.get('session_id', '')
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        ip_address = self.get_client_ip(request)
        
        # Check cache first
        cache_key = f"search:{query}:{search_type}:{sort_by}:{date_filter}:{category}:{limit}:{page}"
        cached_result = cache.get(cache_key)
        if cached_result:
            return StandardResponse.success(data=cached_result)
        
        # Get models
        User = apps.get_model('authentication', 'User')
        Video = apps.get_model('videos', 'Video')
        WatchParty = apps.get_model('parties', 'WatchParty')
        
        # Apply date filters
        date_filter_q = Q()
        if date_filter != 'all':
            now = timezone.now()
            if date_filter == 'today':
                date_filter_q = Q(created_at__date=now.date())
            elif date_filter == 'week':
                date_filter_q = Q(created_at__gte=now - timedelta(days=7))
            elif date_filter == 'month':
                date_filter_q = Q(created_at__gte=now - timedelta(days=30))
            elif date_filter == 'year':
                date_filter_q = Q(created_at__gte=now - timedelta(days=365))
        
        results = {}
        total_results = 0
        
        # Search users (excluding current user)
        if search_type in ['all', 'users']:
            users_q = Q(
                Q(username__icontains=query) | 
                Q(first_name__icontains=query) |
                Q(last_name__icontains=query),
                is_active=True
            ) & date_filter_q
            
            users_queryset = User.objects.filter(users_q).exclude(id=request.user.id)
            
            if sort_by == 'alphabetical':
                users_queryset = users_queryset.order_by('username')
            elif sort_by == 'date':
                users_queryset = users_queryset.order_by('-date_joined')
            else:  # relevance
                users_queryset = users_queryset.order_by('-is_active', 'username')
            
            users = users_queryset[offset:offset + limit]
            users_count = users_queryset.count()
            total_results += users_count
            
            users_data = []
            for user in users:
                users_data.append({
                    'id': user.id,
                    'username': user.username,
                    'name': user.get_full_name(),
                    'profile_picture': user.profile_picture.url if user.profile_picture else None,
                    'is_online': getattr(user, 'is_online', False),
                    'followers_count': getattr(user, 'followers_count', 0),
                    'date_joined': user.date_joined,
                })
            
            results['users'] = {
                'items': users_data,
                'count': users_count,
                'has_more': users_count > offset + limit
            }
        
        # Search videos with full-text search
        if search_type in ['all', 'videos']:
            videos_q = Q(
                Q(title__icontains=query) | 
                Q(description__icontains=query) |
                Q(tags__icontains=query),
                is_active=True
            ) & date_filter_q
            
            if category:
                videos_q &= Q(category__icontains=category)
                
            videos_queryset = Video.objects.filter(videos_q).select_related('uploaded_by')
            
            if sort_by == 'popularity':
                videos_queryset = videos_queryset.order_by('-view_count', '-created_at')
            elif sort_by == 'date':
                videos_queryset = videos_queryset.order_by('-created_at')
            elif sort_by == 'alphabetical':
                videos_queryset = videos_queryset.order_by('title')
            else:  # relevance - use PostgreSQL full-text search if available
                try:
                    # Use PostgreSQL full-text search for better relevance
                    search_vector = SearchVector('title', weight='A') + SearchVector('description', weight='B')
                    search_query = SearchQuery(query)
                    videos_queryset = videos_queryset.annotate(
                        search=search_vector,
                        rank=SearchRank(search_vector, search_query)
                    ).filter(search=search_query).order_by('-rank', '-view_count')
                except:
                    # Fallback to simple ordering
                    videos_queryset = videos_queryset.order_by('-view_count', '-created_at')
            
            videos = videos_queryset[offset:offset + limit]
            videos_count = videos_queryset.count()
            total_results += videos_count
            
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
                    'likes': getattr(video, 'likes_count', 0),
                    'category': getattr(video, 'category', ''),
                    'tags': getattr(video, 'tags', []),
                })
            
            results['videos'] = {
                'items': videos_data,
                'count': videos_count,
                'has_more': videos_count > offset + limit
            }
        
        # Search parties
        if search_type in ['all', 'parties']:
            parties_q = Q(
                Q(title__icontains=query) | 
                Q(description__icontains=query),
                is_active=True
            ) & date_filter_q
            
            parties_queryset = WatchParty.objects.filter(parties_q).select_related('host')
            
            if sort_by == 'popularity':
                parties_queryset = parties_queryset.annotate(
                    participant_count=Count('participants')
                ).order_by('-participant_count', '-created_at')
            elif sort_by == 'date':
                parties_queryset = parties_queryset.order_by('-created_at')
            elif sort_by == 'alphabetical':
                parties_queryset = parties_queryset.order_by('title')
            else:  # relevance
                parties_queryset = parties_queryset.order_by('-is_active', '-created_at')
            
            parties = parties_queryset[offset:offset + limit]
            parties_count = parties_queryset.count()
            total_results += parties_count
            
            parties_data = []
            for party in parties:
                participant_count = party.participants.filter(is_active=True).count()
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
                    'participant_count': participant_count,
                    'max_participants': getattr(party, 'max_participants', None),
                    'created_at': party.created_at,
                    'scheduled_start': getattr(party, 'scheduled_start', None),
                })
            
            results['parties'] = {
                'items': parties_data,
                'count': parties_count,
                'has_more': parties_count > offset + limit
            }
        
        # Calculate search duration
        search_duration_ms = int((time.time() - start_time) * 1000)
        
        # Track search analytics (async)
        self.track_search_analytics(
            user=request.user,
            query=query,
            search_type=search_type,
            filters={
                'sort_by': sort_by,
                'date_filter': date_filter,
                'category': category,
            },
            results_count=total_results,
            session_id=session_id,
            ip_address=ip_address,
            user_agent=user_agent,
            search_duration_ms=search_duration_ms
        )
        
        response_data = {
            'query': query,
            'results': results,
            'pagination': {
                'page': page,
                'limit': limit,
                'total_results': total_results,
                'has_more': total_results > offset + limit
            },
            'search_meta': {
                'search_type': search_type,
                'sort_by': sort_by,
                'date_filter': date_filter,
                'category': category,
                'duration_ms': search_duration_ms,
            }
        }
        
        # Cache results for 5 minutes
        cache.set(cache_key, response_data, 300)
        
        return StandardResponse.success(
            data=response_data,
            message=f"Found {total_results} results for '{query}'"
        )
    
    def get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
    def track_search_analytics(self, **kwargs):
        """Track search analytics asynchronously"""
        try:
            SearchQueryModel.objects.create(**kwargs)
            
            # Update trending queries
            query_text = kwargs['query']
            today = timezone.now().date()
            
            trending, created = TrendingQuery.objects.get_or_create(
                query=query_text,
                period='daily',
                date=today,
                defaults={'search_count': 1, 'unique_users': 1}
            )
            
            if not created:
                trending.search_count = F('search_count') + 1
                trending.save(update_fields=['search_count', 'last_updated'])
                
        except Exception as e:
            # Log error but don't fail the search
            print(f"Error tracking search analytics: {e}")


class SearchSuggestionsView(APIView):
    """
    Get search suggestions and autocomplete
    """
    permission_classes = [IsAuthenticated]
    
    @extend_schema(summary="SearchSuggestionsView GET")
    def get(self, request):
        """Get search suggestions"""
        query = request.GET.get('q', '').strip()
        suggestion_type = request.GET.get('type', 'all')
        limit = min(int(request.GET.get('limit', 10)), 20)
        
        if not query or len(query) < 2:
            # Return trending suggestions
            trending = TrendingQuery.objects.filter(
                date=timezone.now().date(),
                period='daily'
            ).order_by('-search_count')[:limit]
            
            suggestions = []
            for trend in trending:
                suggestions.append({
                    'text': trend.query,
                    'type': 'trending',
                    'popularity_score': trend.search_count,
                    'metadata': {'search_count': trend.search_count}
                })
            
            return StandardResponse.success(
                data={'suggestions': suggestions},
                message="Trending suggestions retrieved"
            )
        
        # Get matching suggestions
        suggestions_q = Q(text__icontains=query, is_active=True)
        
        if suggestion_type != 'all':
            suggestions_q &= Q(suggestion_type=suggestion_type)
        
        suggestions = SearchSuggestion.objects.filter(
            suggestions_q
        ).order_by('-popularity_score', '-click_count')[:limit]
        
        suggestions_data = []
        for suggestion in suggestions:
            suggestions_data.append({
                'id': suggestion.id,
                'text': suggestion.text,
                'type': suggestion.suggestion_type,
                'popularity_score': suggestion.popularity_score,
                'click_count': suggestion.click_count,
                'metadata': suggestion.metadata,
            })
        
        return StandardResponse.success(
            data={'suggestions': suggestions_data},
            message=f"Found {len(suggestions_data)} suggestions"
        )
    
    @extend_schema(summary="SearchSuggestionsView POST")
    def post(self, request):
        """Track suggestion click"""
        suggestion_id = request.data.get('suggestion_id')
        request.data.get('text')
        
        if suggestion_id:
            try:
                suggestion = SearchSuggestion.objects.get(id=suggestion_id)
                suggestion.click_count = F('click_count') + 1
                suggestion.save(update_fields=['click_count'])
            except SearchSuggestion.DoesNotExist:
                pass
        
        return StandardResponse.success(message="Suggestion click tracked")


class SavedSearchView(APIView):
    """
    Manage user's saved searches
    """
    permission_classes = [IsAuthenticated]
    
    @extend_schema(summary="SavedSearchView GET")
    def get(self, request):
        """Get user's saved searches"""
        saved_searches = SavedSearch.objects.filter(
            user=request.user
        ).order_by('-times_used', '-created_at')
        
        searches_data = []
        for search in saved_searches:
            searches_data.append({
                'id': search.id,
                'name': search.name,
                'query': search.query,
                'search_type': search.search_type,
                'filters': search.filters,
                'notification_enabled': search.notification_enabled,
                'times_used': search.times_used,
                'last_checked': search.last_checked,
                'created_at': search.created_at,
            })
        
        return StandardResponse.success(
            data={'saved_searches': searches_data},
            message=f"Retrieved {len(searches_data)} saved searches"
        )
    
    @extend_schema(summary="SavedSearchView POST")
    def post(self, request):
        """Save a new search"""
        name = request.data.get('name', '').strip()
        query = request.data.get('query', '').strip()
        search_type = request.data.get('search_type', 'global')
        filters = request.data.get('filters', {})
        notification_enabled = request.data.get('notification_enabled', False)
        
        if not name or not query:
            return StandardResponse.error("Name and query are required")
        
        # Check if name already exists for this user
        if SavedSearch.objects.filter(user=request.user, name=name).exists():
            return StandardResponse.error("A saved search with this name already exists")
        
        saved_search = SavedSearch.objects.create(
            user=request.user,
            name=name,
            query=query,
            search_type=search_type,
            filters=filters,
            notification_enabled=notification_enabled
        )
        
        return StandardResponse.success(
            data={
                'id': saved_search.id,
                'name': saved_search.name,
                'query': saved_search.query,
                'search_type': saved_search.search_type,
                'filters': saved_search.filters,
                'notification_enabled': saved_search.notification_enabled,
                'created_at': saved_search.created_at,
            },
            message="Search saved successfully"
        )
    
    @extend_schema(summary="SavedSearchView PUT")
    def put(self, request, search_id):
        """Update a saved search"""
        try:
            saved_search = SavedSearch.objects.get(id=search_id, user=request.user)
        except SavedSearch.DoesNotExist:
            return StandardResponse.error("Saved search not found", status.HTTP_404_NOT_FOUND)
        
        name = request.data.get('name', saved_search.name).strip()
        notification_enabled = request.data.get('notification_enabled', saved_search.notification_enabled)
        
        # Check if new name conflicts
        if name != saved_search.name and SavedSearch.objects.filter(
            user=request.user, name=name
        ).exists():
            return StandardResponse.error("A saved search with this name already exists")
        
        saved_search.name = name
        saved_search.notification_enabled = notification_enabled
        saved_search.save(update_fields=['name', 'notification_enabled', 'updated_at'])
        
        return StandardResponse.success(message="Saved search updated successfully")
    
    @extend_schema(summary="SavedSearchView DELETE")
    def delete(self, request, search_id):
        """Delete a saved search"""
        try:
            saved_search = SavedSearch.objects.get(id=search_id, user=request.user)
            saved_search.delete()
            return StandardResponse.success(message="Saved search deleted successfully")
        except SavedSearch.DoesNotExist:
            return StandardResponse.error("Saved search not found", status.HTTP_404_NOT_FOUND)


class TrendingSearchView(APIView):
    """
    Get trending search queries
    """
    permission_classes = [IsAuthenticated]
    
    @extend_schema(summary="TrendingSearchView GET")
    def get(self, request):
        """Get trending searches"""
        period = request.GET.get('period', 'daily')  # daily, weekly, monthly
        limit = min(int(request.GET.get('limit', 10)), 50)
        
        # Get date range based on period
        if period == 'weekly':
            date_threshold = timezone.now().date() - timedelta(days=7)
        elif period == 'monthly':
            date_threshold = timezone.now().date() - timedelta(days=30)
        else:  # daily
            date_threshold = timezone.now().date()
        
        trending = TrendingQuery.objects.filter(
            period=period,
            date__gte=date_threshold
        ).order_by('-search_count')[:limit]
        
        trending_data = []
        for trend in trending:
            trending_data.append({
                'query': trend.query,
                'search_count': trend.search_count,
                'unique_users': trend.unique_users,
                'period': trend.period,
                'date': trend.date,
            })
        
        return StandardResponse.success(
            data={'trending_searches': trending_data},
            message=f"Retrieved {len(trending_data)} trending searches"
        )


class SearchAnalyticsView(APIView):
    """
    Search analytics for admin users
    """
    permission_classes = [IsAuthenticated]
    
    @extend_schema(summary="SearchAnalyticsView GET")
    def get(self, request):
        """Get search analytics data"""
        if not request.user.is_staff:
            return StandardResponse.error("Admin access required", status.HTTP_403_FORBIDDEN)
        
        date_from = request.GET.get('date_from')
        date_to = request.GET.get('date_to')
        
        # Default to last 30 days
        if not date_from:
            date_from = timezone.now().date() - timedelta(days=30)
        if not date_to:
            date_to = timezone.now().date()
        
        # Get search analytics
        analytics = SearchAnalytics.objects.filter(
            date__range=[date_from, date_to]
        ).order_by('-date')
        
        # Aggregate data
        total_searches = sum(a.total_searches for a in analytics)
        unique_users = sum(a.unique_users for a in analytics)
        avg_duration = sum(a.avg_search_duration_ms for a in analytics) / len(analytics) if analytics else 0
        avg_results = sum(a.avg_results_per_search for a in analytics) / len(analytics) if analytics else 0
        
        # Get top queries from recent data
        recent_queries = SearchQueryModel.objects.filter(
            created_at__date__range=[date_from, date_to]
        ).values('query').annotate(
            count=Count('id')
        ).order_by('-count')[:20]
        
        analytics_data = []
        for analytic in analytics:
            analytics_data.append({
                'date': analytic.date,
                'total_searches': analytic.total_searches,
                'unique_users': analytic.unique_users,
                'avg_results_per_search': analytic.avg_results_per_search,
                'avg_search_duration_ms': analytic.avg_search_duration_ms,
                'click_through_rate': analytic.click_through_rate,
                'zero_results_rate': analytic.zero_results_rate,
                'top_queries': analytic.top_queries,
                'search_types_distribution': analytic.search_types_distribution,
            })
        
        return StandardResponse.success(
            data={
                'summary': {
                    'total_searches': total_searches,
                    'unique_users': unique_users,
                    'avg_search_duration_ms': avg_duration,
                    'avg_results_per_search': avg_results,
                },
                'daily_analytics': analytics_data,
                'top_queries': list(recent_queries),
                'date_range': {
                    'from': date_from,
                    'to': date_to,
                }
            },
            message="Search analytics retrieved successfully"
        )
        
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
    
    @extend_schema(summary="DiscoverContentView GET")
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
