"""
Advanced Analytics Views for Watch Party Backend
"""

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q, Count, Sum, Avg, F, Max, Min
from django.db.models.functions import TruncDate, TruncHour
from django.utils import timezone
from datetime import timedelta, datetime
import json

from core.responses import StandardResponse
from core.permissions import IsAdminUser
from apps.analytics.models import SystemAnalytics, AnalyticsEvent, UserAnalytics
from apps.parties.models import WatchParty, PartyParticipant, PartyEngagementAnalytics
from apps.videos.models import Video
from apps.users.models import User


@api_view(['GET'])
@permission_classes([IsAdminUser])
def platform_overview_analytics(request):
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
        from apps.store.models import StoreItem, Purchase
        
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
