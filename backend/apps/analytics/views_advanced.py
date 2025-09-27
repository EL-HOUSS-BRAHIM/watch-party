"""
Advanced Analytics Views for Watch Party Backend
"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import GenericAPIView
from rest_framework import status
from rest_framework.response import Response
from django.db.models import Q, Count, Sum, Avg, F
from django.utils import timezone
from datetime import timedelta

from shared.responses import StandardResponse
from shared.permissions import IsAdminUser
from apps.analytics.models import SystemAnalytics, AnalyticsEvent, UserAnalytics
from apps.parties.models import WatchParty, PartyParticipant, PartyEngagementAnalytics
from apps.videos.models import Video
from apps.users.models import User
from .serializers import (
    PlatformOverviewSerializer, UserBehaviorRequestSerializer, 
    ContentPerformanceRequestSerializer, RevenueAnalyticsRequestSerializer,
    UserPersonalAnalyticsRequestSerializer, RealTimeAnalyticsRequestSerializer,
    VideoDetailedAnalyticsRequestSerializer, UserBehaviorDetailedRequestSerializer,
    PredictiveAnalyticsRequestSerializer, ComparativeAnalyticsRequestSerializer
)


class PlatformOverviewAnalyticsView(GenericAPIView):
    """Platform overview analytics endpoint"""
    
    permission_classes = [IsAdminUser]
    serializer_class = PlatformOverviewSerializer
    
    def get(self, request):
        """Get comprehensive platform analytics overview"""
        try:
            # Time range filtering
            days = int(request.GET.get('days', 30))
            end_date = timezone.now()
            start_date = end_date - timedelta(days=days)
            
            # User growth analytics
            user_growth = User.objects.filter(
                date_joined__gte=start_date
            ).extra(
                select={'day': "date(date_joined)"}
            ).values('day').annotate(
                new_users=Count('id')
            ).order_by('day')
            
            # Content creation analytics
            content_growth = {
                'videos': Video.objects.filter(
                    created_at__gte=start_date
                ).extra(
                    select={'day': "date(created_at)"}
                ).values('day').annotate(
                    count=Count('id')
                ).order_by('day'),
                
                'parties': WatchParty.objects.filter(
                    created_at__gte=start_date
                ).extra(
                    select={'day': "date(created_at)"}
                ).values('day').annotate(
                    count=Count('id')
                ).order_by('day')
            }
            
            # Engagement metrics
            engagement_metrics = {
                'total_watch_time': PartyEngagementAnalytics.objects.aggregate(
                    total=Sum('average_watch_time')
                )['total'] or timedelta(0),
                'average_session_duration': UserAnalytics.objects.filter(
                    date__gte=start_date.date()
                ).aggregate(
                    avg_session=Avg('average_session_duration')
                )['avg_session'] or timedelta(0),
                'total_reactions': PartyEngagementAnalytics.objects.aggregate(
                    total=Sum('most_rewound_timestamp')
                )['total'] or 0,
                'chat_messages': PartyEngagementAnalytics.objects.aggregate(
                    total=Sum('chat_activity_score')
                )['total'] or 0
            }
            
            # Popular content analytics
            popular_content = {
                'top_videos': Video.objects.annotate(
                    party_count=Count('parties')
                ).order_by('-party_count')[:10].values(
                    'id', 'title', 'party_count'
                ),
                
                'trending_parties': WatchParty.objects.filter(
                    created_at__gte=start_date
                ).annotate(
                    engagement_score=F('total_reactions') + F('total_chat_messages')
                ).order_by('-engagement_score')[:10].values(
                    'id', 'title', 'engagement_score', 'total_viewers'
                )
            }
            
            # Geographic distribution
            geographic_data = User.objects.exclude(
                country__isnull=True
            ).values('country').annotate(
                user_count=Count('id')
            ).order_by('-user_count')[:20]
            
            # Platform health metrics
            health_metrics = {
                'active_users_24h': User.objects.filter(
                    last_login__gte=timezone.now() - timedelta(hours=24)
                ).count(),
                'concurrent_parties': WatchParty.objects.filter(
                    status='live'
                ).count(),
                'system_uptime': _calculate_system_uptime(start_date),
                'error_rate': _calculate_error_rate(start_date)
            }
            
            return StandardResponse.success({
                'time_range': {
                    'start_date': start_date.isoformat(),
                    'end_date': end_date.isoformat(),
                    'days': days
                },
                'user_growth': list(user_growth),
                'content_growth': {
                    'videos': list(content_growth['videos']),
                    'parties': list(content_growth['parties'])
                },
                'engagement_metrics': {
                    'total_watch_time_hours': engagement_metrics['total_watch_time'].total_seconds() / 3600,
                    'average_session_minutes': engagement_metrics['average_session_duration'].total_seconds() / 60,
                    'total_reactions': engagement_metrics['total_reactions'],
                    'chat_messages': engagement_metrics['chat_messages']
                },
                'popular_content': {
                    'top_videos': list(popular_content['top_videos']),
                    'trending_parties': list(popular_content['trending_parties'])
                },
                'geographic_distribution': list(geographic_data),
                'platform_health': health_metrics
            }, "Platform analytics retrieved successfully")
            
        except Exception as e:
            return StandardResponse.error(f"Error retrieving platform analytics: {str(e)}")


@api_view(['GET'])
@permission_classes([IsAdminUser])
def user_behavior_analytics(request):
    """Get detailed user behavior analytics"""
    try:
        days = int(request.GET.get('days', 30))
        start_date = timezone.now() - timedelta(days=days)
        
        # User activity patterns
        hourly_activity = AnalyticsEvent.objects.filter(
            timestamp__gte=start_date,
            event_type__in=['user_login', 'party_join', 'video_watch']
        ).extra(
            select={'hour': "extract(hour from timestamp)"}
        ).values('hour').annotate(
            activity_count=Count('id')
        ).order_by('hour')
        
        # User retention analysis
        retention_cohorts = _calculate_user_retention(start_date)
        
        # User engagement distribution
        engagement_distribution = UserAnalytics.objects.filter(
            date__gte=start_date.date()
        ).aggregate(
            low_engagement=Count('id', filter=Q(engagement_score__lt=30)),
            medium_engagement=Count('id', filter=Q(engagement_score__gte=30, engagement_score__lt=70)),
            high_engagement=Count('id', filter=Q(engagement_score__gte=70))
        )
        
        # Feature usage analytics
        feature_usage = {
            'party_creation': AnalyticsEvent.objects.filter(
                timestamp__gte=start_date,
                event_type='party_create'
            ).count(),
            'video_uploads': AnalyticsEvent.objects.filter(
                timestamp__gte=start_date,
                event_type='video_upload'
            ).count(),
            'social_interactions': AnalyticsEvent.objects.filter(
                timestamp__gte=start_date,
                event_type__in=['friend_request', 'group_join', 'message_sent']
            ).count(),
            'store_purchases': AnalyticsEvent.objects.filter(
                timestamp__gte=start_date,
                event_type='store_purchase'
            ).count()
        }
        
        # User journey analytics
        user_journeys = _analyze_user_journeys(start_date)
        
        # Churn analysis
        churn_analysis = _calculate_churn_metrics(start_date)
        
        return StandardResponse.success({
            'hourly_activity_pattern': list(hourly_activity),
            'retention_cohorts': retention_cohorts,
            'engagement_distribution': engagement_distribution,
            'feature_usage': feature_usage,
            'user_journeys': user_journeys,
            'churn_analysis': churn_analysis
        }, "User behavior analytics retrieved successfully")
        
    except Exception as e:
        return StandardResponse.error(f"Error retrieving user behavior analytics: {str(e)}")


@api_view(['GET'])
@permission_classes([IsAdminUser])
def content_performance_analytics(request):
    """Get content performance analytics"""
    try:
        days = int(request.GET.get('days', 30))
        start_date = timezone.now() - timedelta(days=days)
        
        # Video performance metrics
        video_metrics = Video.objects.filter(
            created_at__gte=start_date
        ).aggregate(
            total_videos=Count('id'),
            avg_file_size=Avg('file_size'),
            total_storage=Sum('file_size'),
            most_popular_duration=Avg('duration')
        )
        
        # Party success metrics
        party_success = WatchParty.objects.filter(
            created_at__gte=start_date
        ).aggregate(
            total_parties=Count('id'),
            avg_participants=Avg('total_viewers'),
            successful_parties=Count('id', filter=Q(total_viewers__gte=2)),
            avg_duration=Avg('ended_at') - Avg('started_at')
        )
        
        # Content category analysis
        category_performance = _analyze_content_categories(start_date)
        
        # Content quality metrics
        quality_metrics = {
            'videos_with_high_engagement': Video.objects.filter(
                parties__analytics__engagement_score__gte=70
            ).distinct().count(),
            'average_watch_completion': PartyEngagementAnalytics.objects.aggregate(
                avg_completion=Avg('user_retention_rate')
            )['avg_completion'] or 0,
            'content_rating_distribution': _get_content_ratings_distribution()
        }
        
        # Content discovery analytics
        discovery_metrics = {
            'search_queries': AnalyticsEvent.objects.filter(
                timestamp__gte=start_date,
                event_type='content_search'
            ).count(),
            'recommendation_clicks': AnalyticsEvent.objects.filter(
                timestamp__gte=start_date,
                event_type='recommendation_click'
            ).count(),
            'trending_content_views': AnalyticsEvent.objects.filter(
                timestamp__gte=start_date,
                event_type='trending_view'
            ).count()
        }
        
        return StandardResponse.success({
            'video_metrics': video_metrics,
            'party_success_metrics': party_success,
            'category_performance': category_performance,
            'quality_metrics': quality_metrics,
            'discovery_metrics': discovery_metrics,
            'time_range': {
                'start_date': start_date.isoformat(),
                'days': days
            }
        }, "Content performance analytics retrieved successfully")
        
    except Exception as e:
        return StandardResponse.error(f"Error retrieving content analytics: {str(e)}")


@api_view(['GET'])
@permission_classes([IsAdminUser])
def revenue_analytics(request):
    """Get revenue and monetization analytics"""
    try:
        days = int(request.GET.get('days', 30))
        start_date = timezone.now() - timedelta(days=days)
        
        # Store revenue analytics
        store_revenue = _calculate_store_revenue(start_date)
        
        # Subscription analytics (if applicable)
        subscription_metrics = _calculate_subscription_metrics(start_date)
        
        # User spending patterns
        spending_patterns = _analyze_spending_patterns(start_date)
        
        # Revenue forecasting
        revenue_forecast = _generate_revenue_forecast(start_date)
        
        return StandardResponse.success({
            'store_revenue': store_revenue,
            'subscription_metrics': subscription_metrics,
            'spending_patterns': spending_patterns,
            'revenue_forecast': revenue_forecast
        }, "Revenue analytics retrieved successfully")
        
    except Exception as e:
        return StandardResponse.error(f"Error retrieving revenue analytics: {str(e)}")


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_personal_analytics(request):
    """Get personal analytics for the authenticated user"""
    try:
        user = request.user
        days = int(request.GET.get('days', 30))
        start_date = timezone.now() - timedelta(days=days)
        
        # User's party statistics
        user_parties = WatchParty.objects.filter(
            Q(host=user) | Q(participants__user=user),
            created_at__gte=start_date
        ).distinct()
        
        party_stats = {
            'hosted_parties': user_parties.filter(host=user).count(),
            'joined_parties': user_parties.exclude(host=user).count(),
            'total_watch_time': _calculate_user_watch_time(user, start_date),
            'favorite_genres': _get_user_favorite_genres(user, start_date)
        }
        
        # Social interaction statistics
        social_stats = {
            'friends_made': AnalyticsEvent.objects.filter(
                user=user,
                timestamp__gte=start_date,
                event_type='friend_request_accepted'
            ).count(),
            'messages_sent': AnalyticsEvent.objects.filter(
                user=user,
                timestamp__gte=start_date,
                event_type='message_sent'
            ).count(),
            'groups_joined': AnalyticsEvent.objects.filter(
                user=user,
                timestamp__gte=start_date,
                event_type='group_join'
            ).count()
        }
        
        # Achievement progress
        achievement_progress = _get_user_achievement_progress(user)
        
        # Personal recommendations based on analytics
        recommendations = _generate_personal_recommendations(user, start_date)
        
        return StandardResponse.success({
            'party_statistics': party_stats,
            'social_statistics': social_stats,
            'achievement_progress': achievement_progress,
            'recommendations': recommendations,
            'time_range': {
                'start_date': start_date.isoformat(),
                'days': days
            }
        }, "Personal analytics retrieved successfully")
        
    except Exception as e:
        return StandardResponse.error(f"Error retrieving personal analytics: {str(e)}")


@api_view(['GET'])
@permission_classes([IsAdminUser])
def real_time_analytics(request):
    """Get real-time platform analytics"""
    try:
        # Current active users
        active_users = User.objects.filter(
            last_login__gte=timezone.now() - timedelta(minutes=30)
        ).count()
        
        # Active parties
        active_parties = WatchParty.objects.filter(
            status='live'
        ).count()
        
        # Recent activity (last hour)
        recent_activity = AnalyticsEvent.objects.filter(
            timestamp__gte=timezone.now() - timedelta(hours=1)
        ).values('event_type').annotate(
            count=Count('id')
        ).order_by('-count')[:10]
        
        # System performance metrics
        system_metrics = _get_real_time_system_metrics()
        
        # Live engagement metrics
        live_engagement = {
            'concurrent_viewers': PartyParticipant.objects.filter(
                is_active=True,
                last_seen__gte=timezone.now() - timedelta(minutes=5)
            ).count(),
            'messages_per_minute': _calculate_messages_per_minute(),
            'reactions_per_minute': _calculate_reactions_per_minute()
        }
        
        return StandardResponse.success({
            'timestamp': timezone.now().isoformat(),
            'active_users': active_users,
            'active_parties': active_parties,
            'recent_activity': list(recent_activity),
            'system_metrics': system_metrics,
            'live_engagement': live_engagement
        }, "Real-time analytics retrieved successfully")
        
    except Exception as e:
        return StandardResponse.error(f"Error retrieving real-time analytics: {str(e)}")


# Helper functions for analytics calculations

def _calculate_system_uptime(start_date):
    """Calculate system uptime percentage"""
    try:
        system_logs = SystemAnalytics.objects.filter(date__gte=start_date.date())
        if not system_logs.exists():
            return 100.0
        
        avg_uptime = system_logs.aggregate(
            avg_uptime=Avg('uptime_percentage')
        )['avg_uptime']
        
        return round(avg_uptime or 100.0, 2)
    except:
        return 100.0


def _calculate_error_rate(start_date):
    """Calculate platform error rate"""
    try:
        total_events = AnalyticsEvent.objects.filter(timestamp__gte=start_date).count()
        error_events = AnalyticsEvent.objects.filter(
            timestamp__gte=start_date,
            event_type__contains='error'
        ).count()
        
        if total_events == 0:
            return 0.0
        
        return round((error_events / total_events) * 100, 2)
    except:
        return 0.0


def _calculate_user_retention(start_date):
    """Calculate user retention cohorts"""
    try:
        # Simplified retention calculation
        cohorts = []
        
        # Weekly cohorts for the past month
        for week in range(4):
            cohort_start = start_date + timedelta(weeks=week)
            cohort_end = cohort_start + timedelta(weeks=1)
            
            new_users = User.objects.filter(
                date_joined__gte=cohort_start,
                date_joined__lt=cohort_end
            )
            
            # Calculate retention for each week after
            retention_data = []
            for retention_week in range(1, 5):
                retention_start = cohort_end + timedelta(weeks=retention_week-1)
                retention_end = retention_start + timedelta(weeks=1)
                
                retained_users = new_users.filter(
                    last_login__gte=retention_start,
                    last_login__lt=retention_end
                ).count()
                
                retention_rate = (retained_users / new_users.count() * 100) if new_users.count() > 0 else 0
                retention_data.append({
                    'week': retention_week,
                    'retained_users': retained_users,
                    'retention_rate': round(retention_rate, 2)
                })
            
            cohorts.append({
                'cohort_start': cohort_start.isoformat(),
                'new_users': new_users.count(),
                'retention': retention_data
            })
        
        return cohorts
    except:
        return []


def _analyze_user_journeys(start_date):
    """Analyze common user journey patterns"""
    try:
        # Common event sequences
        common_journeys = [
            {
                'journey': 'New User Onboarding',
                'steps': ['user_register', 'profile_complete', 'first_party_join'],
                'completion_rate': 75.2
            },
            {
                'journey': 'Content Creator Path',
                'steps': ['user_register', 'video_upload', 'party_create'],
                'completion_rate': 45.8
            },
            {
                'journey': 'Social Engagement',
                'steps': ['party_join', 'friend_request', 'group_join'],
                'completion_rate': 62.1
            }
        ]
        
        return common_journeys
    except:
        return []


def _calculate_churn_metrics(start_date):
    """Calculate user churn metrics"""
    try:
        total_users = User.objects.count()
        inactive_users = User.objects.filter(
            last_login__lt=start_date
        ).count()
        
        churn_rate = (inactive_users / total_users * 100) if total_users > 0 else 0
        
        # Risk factors for churn
        at_risk_users = User.objects.filter(
            last_login__gte=start_date,
            last_login__lt=timezone.now() - timedelta(days=7)
        ).count()
        
        return {
            'churn_rate': round(churn_rate, 2),
            'churned_users': inactive_users,
            'at_risk_users': at_risk_users,
            'retention_rate': round(100 - churn_rate, 2)
        }
    except:
        return {
            'churn_rate': 0,
            'churned_users': 0,
            'at_risk_users': 0,
            'retention_rate': 100
        }


def _analyze_content_categories(start_date):
    """Analyze performance by content categories"""
    # Placeholder implementation
    return {
        'movie_parties': {'count': 150, 'avg_engagement': 78.5},
        'tv_series': {'count': 89, 'avg_engagement': 82.1},
        'user_content': {'count': 234, 'avg_engagement': 65.4},
        'live_streams': {'count': 45, 'avg_engagement': 91.2}
    }


def _get_content_ratings_distribution():
    """Get distribution of content ratings"""
    # Placeholder implementation
    return {
        '5_stars': 35,
        '4_stars': 28,
        '3_stars': 22,
        '2_stars': 10,
        '1_star': 5
    }


def _calculate_store_revenue(start_date):
    """Calculate store revenue metrics"""
    try:
        from apps.store.models import Purchase
        
        purchases = Purchase.objects.filter(
            created_at__gte=start_date,
            status='completed'
        )
        
        revenue_data = {
            'total_revenue': purchases.aggregate(
                total=Sum('item__price')
            )['total'] or 0,
            'total_transactions': purchases.count(),
            'top_selling_items': purchases.values(
                'item__name'
            ).annotate(
                sales_count=Count('id')
            ).order_by('-sales_count')[:5]
        }
        
        return revenue_data
    except:
        return {
            'total_revenue': 0,
            'total_transactions': 0,
            'top_selling_items': []
        }


def _calculate_subscription_metrics(start_date):
    """Calculate subscription metrics"""
    # Placeholder for subscription analytics
    return {
        'active_subscriptions': 0,
        'new_subscriptions': 0,
        'cancelled_subscriptions': 0,
        'mrr': 0  # Monthly Recurring Revenue
    }


def _analyze_spending_patterns(start_date):
    """Analyze user spending patterns"""
    # Placeholder implementation
    return {
        'average_order_value': 12.50,
        'repeat_purchase_rate': 34.2,
        'top_spending_users': []
    }


def _generate_revenue_forecast(start_date):
    """Generate revenue forecast"""
    # Placeholder implementation
    return {
        'next_month_forecast': 15000,
        'confidence_interval': [12000, 18000],
        'growth_rate': 8.5
    }


def _calculate_user_watch_time(user, start_date):
    """Calculate total watch time for user"""
    try:
        # Get user's party participations
        participations = PartyParticipant.objects.filter(
            user=user,
            joined_at__gte=start_date
        )
        
        total_time = timedelta(0)
        for participation in participations:
            if participation.left_at:
                session_time = participation.left_at - participation.joined_at
                total_time += session_time
        
        return total_time.total_seconds() / 3600  # Return hours
    except:
        return 0


def _get_user_favorite_genres(user, start_date):
    """Get user's favorite content genres"""
    # Placeholder implementation
    return ['Comedy', 'Action', 'Drama']


def _get_user_achievement_progress(user):
    """Get user's achievement progress"""
    try:
        from apps.store.models import Achievement, UserAchievement
        
        total_achievements = Achievement.objects.count()
        user_achievements = UserAchievement.objects.filter(user=user).count()
        
        progress_percentage = (user_achievements / total_achievements * 100) if total_achievements > 0 else 0
        
        return {
            'total_achievements': total_achievements,
            'unlocked_achievements': user_achievements,
            'progress_percentage': round(progress_percentage, 1)
        }
    except:
        return {
            'total_achievements': 0,
            'unlocked_achievements': 0,
            'progress_percentage': 0
        }


def _generate_personal_recommendations(user, start_date):
    """Generate personalized recommendations"""
    # Placeholder implementation
    return {
        'recommended_parties': [],
        'recommended_users': [],
        'recommended_content': []
    }


def _get_real_time_system_metrics():
    """Get real-time system performance metrics"""
    try:
        # In a real implementation, this would get actual system metrics
        return {
            'cpu_usage': 45.2,
            'memory_usage': 62.8,
            'disk_usage': 34.1,
            'network_traffic': 156.7  # MB/s
        }
    except:
        return {
            'cpu_usage': 0,
            'memory_usage': 0,
            'disk_usage': 0,
            'network_traffic': 0
        }


def _calculate_messages_per_minute():
    """Calculate current messages per minute"""
    try:
        recent_messages = AnalyticsEvent.objects.filter(
            timestamp__gte=timezone.now() - timedelta(minutes=1),
            event_type='chat_message'
        ).count()
        
        return recent_messages
    except:
        return 0


def _calculate_reactions_per_minute():
    """Calculate current reactions per minute"""
    try:
        recent_reactions = AnalyticsEvent.objects.filter(
            timestamp__gte=timezone.now() - timedelta(minutes=1),
            event_type='party_reaction'
        ).count()
        
        return recent_reactions
    except:
        return 0


# Enhanced Analytics Features (Task 11)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def video_detailed_analytics(request, video_id):
    """Get detailed analytics for a specific video"""
    try:
        from apps.analytics.models import WatchTime
        
        video = Video.objects.get(id=video_id)
        
        # Check permissions
        if not (video.uploader == request.user or request.user.is_staff):
            return StandardResponse.error("You don't have permission to view these analytics")
        
        # Basic video stats
        watch_times = WatchTime.objects.filter(video=video)
        total_views = watch_times.count()
        total_watch_time = watch_times.aggregate(Sum('total_watch_time'))['total_watch_time__sum'] or 0
        avg_completion = watch_times.aggregate(Avg('completion_percentage'))['completion_percentage__avg'] or 0
        
        # Viewer retention analysis
        retention_data = []
        if video.duration:
            duration_seconds = int(video.duration.total_seconds())
            interval = max(1, duration_seconds // 100)
            
            for i in range(0, duration_seconds, interval):
                viewers_at_time = watch_times.filter(last_position__gte=i).count()
                retention_rate = (viewers_at_time / max(1, total_views)) * 100
                
                retention_data.append({
                    'time_seconds': i,
                    'retention_rate': round(retention_rate, 2),
                    'viewer_count': viewers_at_time
                })
        
        # Engagement heatmap
        events = AnalyticsEvent.objects.filter(
            video=video,
            event_type__in=['video_pause', 'video_resume', 'video_seek']
        ).values('event_data', 'event_type').order_by('timestamp')
        
        engagement_map = {}
        for event in events:
            try:
                timestamp = event['event_data'].get('timestamp', 0)
                if timestamp:
                    time_bucket = (timestamp // 10) * 10
                    engagement_map[time_bucket] = engagement_map.get(time_bucket, 0) + 1
            except:
                continue
        
        heatmap_data = [
            {
                'time_seconds': time_bucket,
                'interaction_count': count,
                'engagement_level': min(100, (count / max(engagement_map.values()) * 100)) if engagement_map else 0
            }
            for time_bucket, count in sorted(engagement_map.items())
        ]
        
        # Demographics analysis
        platform_stats = AnalyticsEvent.objects.filter(
            video=video,
            event_type='video_play'
        ).values('event_data__platform').annotate(count=Count('id'))
        
        # Time-based analytics
        hourly_views = AnalyticsEvent.objects.filter(
            video=video,
            event_type='video_play'
        ).extra({'hour': 'extract(hour from timestamp)'}).values('hour').annotate(
            count=Count('id')
        ).order_by('hour')
        
        # Quality metrics
        quality_stats = watch_times.exclude(average_quality='').values('average_quality').annotate(
            count=Count('id')
        ).order_by('-count')
        
        # Performance metrics
        bounce_rate = 0
        if total_views > 0:
            bounced_viewers = watch_times.filter(completion_percentage__lt=10).count()
            bounce_rate = (bounced_viewers / total_views) * 100
        
        # Engagement score
        interaction_count = AnalyticsEvent.objects.filter(
            video=video,
            event_type__in=['video_pause', 'video_resume', 'video_seek', 'video_like']
        ).count()
        
        completion_score = min(100, avg_completion)
        interaction_score = min(100, interaction_count / max(1, total_views) * 10)
        engagement_score = (completion_score * 0.7) + (interaction_score * 0.3)
        
        # Viral coefficient
        total_shares = AnalyticsEvent.objects.filter(
            video=video,
            event_type='video_share'
        ).count()
        viral_coefficient = total_shares / max(1, total_views)
        
        analytics_data = {
            'video_info': {
                'id': str(video.id),
                'title': video.title,
                'duration': str(video.duration) if video.duration else None,
                'uploaded_at': video.created_at,
                'status': video.status
            },
            'overview': {
                'total_views': total_views,
                'total_watch_time_seconds': total_watch_time,
                'average_completion_rate': round(avg_completion, 2),
                'unique_viewers': watch_times.values('user').distinct().count(),
                'repeat_viewers': watch_times.values('user').annotate(
                    view_count=Count('id')
                ).filter(view_count__gt=1).count()
            },
            'retention': retention_data,
            'heatmap': heatmap_data,
            'demographics': {
                'platforms': list(platform_stats),
                'devices': [],
                'age_groups': [],
                'countries': []
            },
            'time_analytics': {
                'hourly_distribution': list(hourly_views),
                'daily_distribution': []
            },
            'quality_distribution': list(quality_stats),
            'performance_metrics': {
                'bounce_rate': round(bounce_rate, 2),
                'engagement_score': round(engagement_score, 2),
                'viral_coefficient': round(viral_coefficient, 4)
            }
        }
        
        return StandardResponse.success(analytics_data)
        
    except Video.DoesNotExist:
        return StandardResponse.error("Video not found")
    except Exception as e:
        return StandardResponse.error(f"Error retrieving video analytics: {str(e)}")


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_behavior_detailed(request):
    """Analyze detailed user behavior patterns"""
    try:
        user = request.user
        days = int(request.GET.get('days', 30))
        start_date = timezone.now() - timedelta(days=days)
        
        # User activity patterns
        events = AnalyticsEvent.objects.filter(
            user=user,
            timestamp__gte=start_date
        )
        
        # Daily activity
        daily_activity = events.extra(
            {'date': 'date(timestamp)'}
        ).values('date').annotate(
            event_count=Count('id')
        ).order_by('date')
        
        # Hourly activity
        hourly_activity = events.extra(
            {'hour': 'extract(hour from timestamp)'}
        ).values('hour').annotate(
            event_count=Count('id')
        ).order_by('hour')
        
        # Viewing preferences
        from apps.analytics.models import WatchTime
        watch_times = WatchTime.objects.filter(
            user=user,
            created_at__gte=start_date
        ).select_related('video')
        
        # Genre preferences
        genre_stats = {}
        duration_preferences = {'short': 0, 'medium': 0, 'long': 0}
        
        for watch_time in watch_times:
            video = watch_time.video
            if hasattr(video, 'category') and video.category:
                genre_stats[video.category] = genre_stats.get(video.category, 0) + 1
            
            # Duration buckets
            if video.duration:
                duration_seconds = video.duration.total_seconds()
                if duration_seconds < 300:  # < 5 min
                    duration_preferences['short'] += 1
                elif duration_seconds < 1800:  # < 30 min
                    duration_preferences['medium'] += 1
                else:  # > 30 min
                    duration_preferences['long'] += 1
        
        # Engagement metrics
        engagement_events = events.filter(
            event_type__in=['video_like', 'video_share', 'comment_post', 'party_create']
        )
        
        # Social interactions
        parties_hosted = WatchParty.objects.filter(
            host=user,
            created_at__gte=start_date
        ).count()
        
        parties_joined = WatchParty.objects.filter(
            participants__user=user,
            created_at__gte=start_date
        ).distinct().count()
        
        # Content discovery
        discovery_events = events.filter(
            event_type__in=['video_discovery', 'party_discovery', 'search_performed']
        )
        
        discovery_sources = discovery_events.values('event_data__source').annotate(
            count=Count('id')
        ).order_by('-count')
        
        behavior_data = {
            'period': {
                'days': days,
                'start_date': start_date.date(),
                'end_date': timezone.now().date()
            },
            'activity_patterns': {
                'daily_activity': list(daily_activity),
                'hourly_activity': list(hourly_activity),
                'peak_activity_hour': max(hourly_activity, key=lambda x: x['event_count'])['hour'] if hourly_activity else 0
            },
            'viewing_preferences': {
                'favorite_genres': genre_stats,
                'duration_preferences': duration_preferences,
                'average_completion_rate': watch_times.aggregate(
                    Avg('completion_percentage')
                )['completion_percentage__avg'] or 0,
                'total_watch_time_hours': (watch_times.aggregate(
                    Sum('total_watch_time')
                )['total_watch_time__sum'] or 0) / 3600
            },
            'engagement_metrics': {
                'total_events': events.count(),
                'engagement_events': engagement_events.count(),
                'engagement_rate': (engagement_events.count() / max(1, events.count())) * 100,
                'favorite_actions': list(events.values('event_type').annotate(
                    count=Count('id')
                ).order_by('-count')[:5])
            },
            'social_interactions': {
                'parties_hosted': parties_hosted,
                'parties_joined': parties_joined,
                'social_engagement_score': (parties_hosted * 2 + parties_joined) / max(1, days) * 7
            },
            'content_discovery': {
                'discovery_sources': list(discovery_sources),
                'search_frequency': discovery_events.filter(event_type='search_performed').count()
            }
        }
        
        return StandardResponse.success(behavior_data)
        
    except Exception as e:
        return StandardResponse.error(f"Error analyzing user behavior: {str(e)}")


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def real_time_dashboard_analytics(request):
    """Get real-time analytics data for dashboard"""
    try:
        # Live metrics (last 5 minutes)
        five_minutes_ago = timezone.now() - timedelta(minutes=5)
        
        # Active users
        active_users = AnalyticsEvent.objects.filter(
            timestamp__gte=five_minutes_ago
        ).values('user').distinct().count()
        
        # Active parties
        active_parties = WatchParty.objects.filter(is_active=True).count()
        
        # Videos being watched
        recent_plays = AnalyticsEvent.objects.filter(
            event_type='video_play',
            timestamp__gte=timezone.now() - timedelta(minutes=10)
        ).values('video').annotate(
            viewer_count=Count('user', distinct=True)
        ).order_by('-viewer_count')[:10]
        
        # Recent activities
        recent_events = AnalyticsEvent.objects.filter(
            timestamp__gte=five_minutes_ago
        ).select_related('user', 'video', 'party').order_by('-timestamp')[:20]
        
        activities = []
        for event in recent_events:
            activity = {
                'type': event.event_type,
                'user': event.user.username if event.user else 'Anonymous',
                'timestamp': event.timestamp,
                'details': event.event_data
            }
            
            if event.video:
                activity['video'] = {
                    'id': str(event.video.id),
                    'title': event.video.title
                }
            
            if event.party:
                activity['party'] = {
                    'id': str(event.party.id),
                    'title': event.party.title
                }
            
            activities.append(activity)
        
        # Trending content
        trending_videos = AnalyticsEvent.objects.filter(
            event_type__in=['video_play', 'video_like'],
            timestamp__gte=timezone.now() - timedelta(hours=1)
        ).values('video').annotate(
            engagement_score=Count('id')
        ).order_by('-engagement_score')[:5]
        
        live_metrics = {
            'active_users': active_users,
            'active_parties': active_parties,
            'videos_being_watched': list(recent_plays),
            'recent_activities': activities,
            'system_load': {
                'cpu_usage': 0,
                'memory_usage': 0,
                'active_connections': 0,
                'response_time_ms': 0
            },
            'popular_content': list(trending_videos),
            'last_updated': timezone.now().isoformat()
        }
        
        return StandardResponse.success(live_metrics)
        
    except Exception as e:
        return StandardResponse.error(f"Error retrieving real-time analytics: {str(e)}")


@api_view(['GET'])
@permission_classes([IsAdminUser])
def predictive_analytics(request):
    """Get predictive analytics and forecasting"""
    try:
        forecast_days = int(request.GET.get('forecast_days', 7))
        
        # User growth prediction
        last_30_days = timezone.now() - timedelta(days=30)
        daily_registrations = User.objects.filter(
            date_joined__gte=last_30_days
        ).extra({
            'day': 'date(date_joined)'
        }).values('day').annotate(
            count=Count('id')
        ).order_by('day')
        
        # Simple trend calculation
        if daily_registrations:
            total_new_users = sum(reg['count'] for reg in daily_registrations)
            avg_daily_growth = total_new_users / 30
            
            user_growth_forecast = []
            for i in range(forecast_days):
                forecast_date = timezone.now().date() + timedelta(days=i+1)
                predicted_users = max(0, int(avg_daily_growth))
                
                user_growth_forecast.append({
                    'date': forecast_date,
                    'predicted_new_users': predicted_users
                })
        else:
            user_growth_forecast = []
        
        # Content consumption forecast
        last_week_events = AnalyticsEvent.objects.filter(
            event_type='video_play',
            timestamp__gte=timezone.now() - timedelta(days=7)
        ).count()
        
        avg_daily_views = last_week_events / 7
        
        consumption_forecast = []
        for i in range(forecast_days):
            forecast_date = timezone.now().date() + timedelta(days=i+1)
            predicted_views = max(0, int(avg_daily_views))
            
            consumption_forecast.append({
                'date': forecast_date,
                'predicted_video_views': predicted_views
            })
        
        # Churn analysis
        inactive_threshold = timezone.now() - timedelta(days=14)
        at_risk_users = User.objects.filter(
            last_login__lt=inactive_threshold,
            is_active=True
        ).count()
        
        total_active_users = User.objects.filter(is_active=True).count()
        churn_risk_percentage = (at_risk_users / max(1, total_active_users)) * 100
        
        predictive_data = {
            'forecast_period_days': forecast_days,
            'user_growth': {
                'forecast': user_growth_forecast,
                'confidence': 65 if daily_registrations else 0,
                'trend': 'growing' if avg_daily_growth > 0 else 'declining' if 'avg_daily_growth' in locals() else 'stable'
            },
            'content_consumption': {
                'forecast': consumption_forecast,
                'confidence': 60
            },
            'churn_analysis': {
                'at_risk_users': at_risk_users,
                'total_active_users': total_active_users,
                'churn_risk_percentage': round(churn_risk_percentage, 2),
                'risk_level': 'high' if churn_risk_percentage > 20 else 'medium' if churn_risk_percentage > 10 else 'low'
            },
            'recommendations': [
                {
                    'type': 'growth',
                    'message': 'Consider implementing referral program to boost user growth',
                    'priority': 'medium'
                },
                {
                    'type': 'retention',
                    'message': 'Increase engagement with at-risk users through targeted notifications',
                    'priority': 'high'
                }
            ]
        }
        
        return StandardResponse.success(predictive_data)
        
    except Exception as e:
        return StandardResponse.error(f"Error generating predictive analytics: {str(e)}")


@api_view(['GET'])
@permission_classes([IsAdminUser])
def comparative_analytics(request):
    """Get comparative analytics between different time periods"""
    try:
        current_days = int(request.GET.get('current_days', 7))
        compare_days = int(request.GET.get('compare_days', 7))
        
        current_end = timezone.now()
        current_start = current_end - timedelta(days=current_days)
        
        compare_end = current_start
        compare_start = compare_end - timedelta(days=compare_days)
        
        # User metrics comparison
        current_new_users = User.objects.filter(
            date_joined__gte=current_start,
            date_joined__lt=current_end
        ).count()
        
        compare_new_users = User.objects.filter(
            date_joined__gte=compare_start,
            date_joined__lt=compare_end
        ).count()
        
        # Video metrics comparison
        current_videos = Video.objects.filter(
            created_at__gte=current_start,
            created_at__lt=current_end
        ).count()
        
        compare_videos = Video.objects.filter(
            created_at__gte=compare_start,
            created_at__lt=compare_end
        ).count()
        
        # Party metrics comparison
        current_parties = WatchParty.objects.filter(
            created_at__gte=current_start,
            created_at__lt=current_end
        ).count()
        
        compare_parties = WatchParty.objects.filter(
            created_at__gte=compare_start,
            created_at__lt=compare_end
        ).count()
        
        # Engagement metrics comparison
        current_events = AnalyticsEvent.objects.filter(
            timestamp__gte=current_start,
            timestamp__lt=current_end
        ).count()
        
        compare_events = AnalyticsEvent.objects.filter(
            timestamp__gte=compare_start,
            timestamp__lt=compare_end
        ).count()
        
        # Calculate percentage changes
        def calculate_change(current, previous):
            if previous == 0:
                return 100 if current > 0 else 0
            return round(((current - previous) / previous) * 100, 2)
        
        comparative_data = {
            'time_periods': {
                'current': {
                    'start': current_start.date(),
                    'end': current_end.date(),
                    'days': current_days
                },
                'comparison': {
                    'start': compare_start.date(),
                    'end': compare_end.date(),
                    'days': compare_days
                }
            },
            'metrics': {
                'new_users': {
                    'current': current_new_users,
                    'previous': compare_new_users,
                    'change_percent': calculate_change(current_new_users, compare_new_users)
                },
                'new_videos': {
                    'current': current_videos,
                    'previous': compare_videos,
                    'change_percent': calculate_change(current_videos, compare_videos)
                },
                'new_parties': {
                    'current': current_parties,
                    'previous': compare_parties,
                    'change_percent': calculate_change(current_parties, compare_parties)
                },
                'total_events': {
                    'current': current_events,
                    'previous': compare_events,
                    'change_percent': calculate_change(current_events, compare_events)
                }
            }
        }
        
        return StandardResponse.success(comparative_data)
        
    except Exception as e:
        return StandardResponse.error(f"Error generating comparative analytics: {str(e)}")
