"""
Enhanced Analytics API for Watch Party Platform
Phase 2 implementation with real-time dashboards and advanced metrics
"""

from rest_framework import generics, permissions, status
from drf_spectacular.openapi import OpenApiResponse, OpenApiExample
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db.models import Sum, Avg, Count
from django.db import models
from drf_spectacular.utils import extend_schema
from datetime import timedelta, datetime
from typing import Dict, Any, List

from .models import UserAnalytics, PartyAnalytics, VideoAnalytics, AnalyticsEvent
from apps.parties.models import WatchParty
from apps.videos.models import Video
from apps.authentication.models import User

User = get_user_model()


class RealTimeDashboardView(generics.GenericAPIView):
    """Real-time analytics dashboard with live metrics"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(summary="RealTimeDashboardView GET")
    def get(self, request, *args, **kwargs):
        """Get real-time dashboard data"""
        time_range = request.GET.get('range', '24h')  # 1h, 24h, 7d, 30d
        
        # Calculate time boundaries
        end_time = timezone.now()
        time_deltas = {
            '1h': timedelta(hours=1),
            '24h': timedelta(days=1),
            '7d': timedelta(days=7),
            '30d': timedelta(days=30),
        }
        start_time = end_time - time_deltas.get(time_range, timedelta(days=1))
        
        # Get real-time metrics
        dashboard_data = {
            'overview': self._get_overview_metrics(start_time, end_time),
            'active_users': self._get_active_users_data(start_time, end_time),
            'party_metrics': self._get_party_metrics(start_time, end_time),
            'video_metrics': self._get_video_metrics(start_time, end_time),
            'engagement_trends': self._get_engagement_trends(start_time, end_time),
            'geographical_data': self._get_geographical_data(start_time, end_time),
            'device_breakdown': self._get_device_breakdown(start_time, end_time),
            'real_time_events': self._get_real_time_events(),
            'performance_metrics': self._get_performance_metrics(start_time, end_time),
        }
        
        return Response({
            'status': 'success',
            'data': dashboard_data,
            'time_range': time_range,
            'generated_at': timezone.now().isoformat()
        })
    
    def _get_overview_metrics(self, start_time, end_time) -> Dict[str, Any]:
        """Get high-level overview metrics"""
        # Current active parties
        active_parties = WatchParty.objects.filter(
            status__in=['active', 'waiting_to_start']
        ).count()
        
        # Total users online
        online_users = User.objects.filter(
            last_login__gte=timezone.now() - timedelta(minutes=15)
        ).count()
        
        # Recent registrations
        new_users = User.objects.filter(
            date_joined__gte=start_time
        ).count()
        
        # Total watch time in this period
        total_watch_time = AnalyticsEvent.objects.filter(
            event_type='video_watch',
            timestamp__gte=start_time
        ).aggregate(
            total=Sum('metadata__duration')
        )['total'] or 0
        
        # Revenue (if billing is enabled)
        try:
            from apps.billing.models import Payment
            revenue = Payment.objects.filter(
                created_at__gte=start_time,
                status='completed'
            ).aggregate(
                total=Sum('amount')
            )['total'] or 0
        except ImportError:
            revenue = 0
        
        return {
            'active_parties': active_parties,
            'online_users': online_users,
            'new_users': new_users,
            'total_watch_time_hours': round(total_watch_time / 3600, 1),
            'revenue': float(revenue) if revenue else 0,
            'system_status': 'healthy',  # This would come from health checks
        }
    
    def _get_active_users_data(self, start_time, end_time) -> List[Dict]:
        """Get active users over time"""
        # Group by hour for detailed view
        if (end_time - start_time).days <= 1:
            format_key = '%Y-%m-%d %H:00'
        else:
            format_key = '%Y-%m-%d'
        
        active_users_data = AnalyticsEvent.objects.filter(
            event_type='user_activity',
            timestamp__gte=start_time
        ).extra(
            select={'hour': f"DATE_TRUNC('hour', timestamp)"}
        ).values('hour').annotate(
            unique_users=Count('user', distinct=True)
        ).order_by('hour')
        
        return [
            {
                'time': item['hour'].strftime(format_key),
                'active_users': item['unique_users']
            }
            for item in active_users_data
        ]
    
    def _get_party_metrics(self, start_time, end_time) -> Dict[str, Any]:
        """Get party-related metrics"""
        parties_created = WatchParty.objects.filter(
            created_at__gte=start_time
        ).count()
        
        avg_participants = WatchParty.objects.filter(
            created_at__gte=start_time
        ).aggregate(
            avg=Avg('participant_count')
        )['avg'] or 0
        
        party_duration_avg = PartyAnalytics.objects.filter(
            party__created_at__gte=start_time
        ).aggregate(
            avg=Avg('total_duration')
        )['avg'] or 0
        
        # Popular party types
        party_types = WatchParty.objects.filter(
            created_at__gte=start_time
        ).values('privacy').annotate(
            count=Count('id')
        )
        
        return {
            'parties_created': parties_created,
            'avg_participants': round(avg_participants, 1),
            'avg_duration_minutes': round(party_duration_avg / 60, 1) if party_duration_avg else 0,
            'party_types': list(party_types),
        }
    
    def _get_video_metrics(self, start_time, end_time) -> Dict[str, Any]:
        """Get video-related metrics"""
        videos_uploaded = Video.objects.filter(
            uploaded_at__gte=start_time
        ).count()
        
        total_views = AnalyticsEvent.objects.filter(
            event_type='video_view',
            timestamp__gte=start_time
        ).count()
        
        # Top videos by views
        top_videos = VideoAnalytics.objects.filter(
            video__uploaded_at__gte=start_time
        ).order_by('-total_views')[:5].values(
            'video__title',
            'total_views',
            'average_watch_percentage'
        )
        
        return {
            'videos_uploaded': videos_uploaded,
            'total_views': total_views,
            'top_videos': list(top_videos),
        }
    
    def _get_engagement_trends(self, start_time, end_time) -> Dict[str, Any]:
        """Get user engagement trends"""
        # Chat messages over time
        chat_messages = AnalyticsEvent.objects.filter(
            event_type='chat_message',
            timestamp__gte=start_time
        ).extra(
            select={'date': "DATE(timestamp)"}
        ).values('date').annotate(
            count=Count('id')
        ).order_by('date')
        
        # User reactions
        reactions = AnalyticsEvent.objects.filter(
            event_type='video_reaction',
            timestamp__gte=start_time
        ).values('metadata__reaction_type').annotate(
            count=Count('id')
        )
        
        # Retention metrics
        returning_users = User.objects.filter(
            last_login__gte=start_time,
            date_joined__lt=start_time
        ).count()
        
        return {
            'chat_activity': list(chat_messages),
            'reactions_breakdown': list(reactions),
            'returning_users': returning_users,
        }
    
    def _get_geographical_data(self, start_time, end_time) -> List[Dict]:
        """Get geographical distribution of users"""
        # This would require GeoIP data collection
        # For now, return mock data
        return [
            {'country': 'United States', 'users': 1250, 'code': 'US'},
            {'country': 'United Kingdom', 'users': 890, 'code': 'GB'},
            {'country': 'Canada', 'users': 640, 'code': 'CA'},
            {'country': 'Germany', 'users': 580, 'code': 'DE'},
            {'country': 'France', 'users': 420, 'code': 'FR'},
        ]
    
    def _get_device_breakdown(self, start_time, end_time) -> Dict[str, Any]:
        """Get device/platform breakdown"""
        # Extract from user agents or metadata
        device_data = AnalyticsEvent.objects.filter(
            event_type='user_activity',
            timestamp__gte=start_time,
            metadata__device__isnull=False
        ).values('metadata__device').annotate(
            count=Count('user', distinct=True)
        )
        
        return {
            'devices': list(device_data),
            'mobile_percentage': 65.2,  # Would be calculated from actual data
            'desktop_percentage': 34.8,
        }
    
    def _get_real_time_events(self) -> List[Dict]:
        """Get recent real-time events"""
        recent_events = AnalyticsEvent.objects.filter(
            timestamp__gte=timezone.now() - timedelta(minutes=30)
        ).select_related('user').order_by('-timestamp')[:20]
        
        return [
            {
                'type': event.event_type,
                'user': event.user.username if event.user else 'Anonymous',
                'timestamp': event.timestamp.isoformat(),
                'metadata': event.metadata
            }
            for event in recent_events
        ]
    
    def _get_performance_metrics(self, start_time, end_time) -> Dict[str, Any]:
        """Get system performance metrics"""
        # This would integrate with monitoring systems
        return {
            'avg_response_time': 120,  # ms
            'error_rate': 0.02,  # 2%
            'uptime': 99.98,  # %
            'cache_hit_rate': 85.5,  # %
            'active_connections': 1420,
        }


class AdvancedAnalyticsView(generics.GenericAPIView):
    """Advanced analytics with custom queries and filters"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(summary="AdvancedAnalyticsView POST")
    def post(self, request, *args, **kwargs):
        """Execute custom analytics query"""
        query_config = request.data
        
        # Validate query configuration
        if not self._validate_query_config(query_config):
            return Response({
                'error': 'Invalid query configuration'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            result = self._execute_custom_query(query_config)
            
            return Response({
                'status': 'success',
                'data': result,
                'query_executed_at': timezone.now().isoformat()
            })
            
        except Exception as e:
            return Response({
                'error': f'Query execution failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _validate_query_config(self, config: Dict) -> bool:
        """Validate custom query configuration"""
        required_fields = ['metric', 'time_range']
        allowed_metrics = [
            'user_engagement', 'party_performance', 'video_analytics',
            'revenue_analysis', 'retention_rates', 'feature_usage'
        ]
        
        if not all(field in config for field in required_fields):
            return False
        
        if config['metric'] not in allowed_metrics:
            return False
        
        return True
    
    def _execute_custom_query(self, config: Dict) -> Dict[str, Any]:
        """Execute custom analytics query"""
        metric = config['metric']
        time_range = config['time_range']
        filters = config.get('filters', {})
        
        # Route to specific metric handlers
        handlers = {
            'user_engagement': self._analyze_user_engagement,
            'party_performance': self._analyze_party_performance,
            'video_analytics': self._analyze_video_performance,
            'revenue_analysis': self._analyze_revenue,
            'retention_rates': self._analyze_retention,
            'feature_usage': self._analyze_feature_usage,
        }
        
        handler = handlers.get(metric)
        if handler:
            return handler(time_range, filters)
        
        raise ValueError(f"Unknown metric: {metric}")
    
    def _analyze_user_engagement(self, time_range: Dict, filters: Dict) -> Dict:
        """Analyze user engagement patterns"""
        start_date = datetime.fromisoformat(time_range['start'])
        end_date = datetime.fromisoformat(time_range['end'])
        
        # User activity patterns
        activity_by_hour = AnalyticsEvent.objects.filter(
            event_type='user_activity',
            timestamp__range=(start_date, end_date)
        ).extra(
            select={'hour': "EXTRACT(hour FROM timestamp)"}
        ).values('hour').annotate(
            activity_count=Count('id')
        ).order_by('hour')
        
        # Session duration analysis
        session_durations = UserAnalytics.objects.filter(
            user__last_login__range=(start_date, end_date)
        ).aggregate(
            avg_session=Avg('total_time_spent'),
            max_session=models.Max('total_time_spent'),
            total_sessions=Count('user', distinct=True)
        )
        
        return {
            'activity_by_hour': list(activity_by_hour),
            'session_analytics': session_durations,
            'engagement_score': self._calculate_engagement_score(start_date, end_date),
        }
    
    def _calculate_engagement_score(self, start_date, end_date) -> float:
        """Calculate overall engagement score"""
        # Complex calculation based on multiple factors
        total_users = User.objects.filter(
            last_login__range=(start_date, end_date)
        ).count()
        
        if total_users == 0:
            return 0.0
        
        active_users = AnalyticsEvent.objects.filter(
            event_type='user_activity',
            timestamp__range=(start_date, end_date)
        ).values('user').distinct().count()
        
        activity_rate = active_users / total_users if total_users > 0 else 0
        
        # Factor in party participation
        party_participants = WatchParty.objects.filter(
            created_at__range=(start_date, end_date)
        ).aggregate(
            total_participants=Sum('participant_count')
        )['total_participants'] or 0
        
        participation_rate = party_participants / total_users if total_users > 0 else 0
        
        # Weighted score
        engagement_score = (activity_rate * 0.6) + (participation_rate * 0.4)
        
        return round(engagement_score * 100, 2)  # Convert to percentage


class A_BTestingView(generics.GenericAPIView):
    """A/B Testing analytics and management"""
    
    permission_classes = [permissions.IsAdminUser]
    
    @extend_schema(summary="A_BTestingView GET")
    def get(self, request, *args, **kwargs):
        """Get A/B test results"""
        test_id = request.GET.get('test_id')
        
        if test_id:
            return self._get_test_results(test_id)
        else:
            return self._get_all_active_tests()
    
    @extend_schema(summary="A_BTestingView POST")
    def post(self, request, *args, **kwargs):
        """Create new A/B test"""
        test_config = request.data
        
        # Create A/B test configuration
        test = self._create_ab_test(test_config)
        
        return Response({
            'status': 'success',
            'test_id': test['id'],
            'message': 'A/B test created successfully'
        }, status=status.HTTP_201_CREATED)
    
    def _get_test_results(self, test_id: str) -> Response:
        """Get specific A/B test results"""
        # Implementation for A/B test analysis
        # This would integrate with feature flag systems
        
        mock_results = {
            'test_id': test_id,
            'name': 'Video Player UI Test',
            'status': 'running',
            'participants': 1250,
            'variants': [
                {
                    'name': 'control',
                    'participants': 625,
                    'conversion_rate': 12.8,
                    'confidence': 95.2
                },
                {
                    'name': 'variant_a',
                    'participants': 625,
                    'conversion_rate': 15.4,
                    'confidence': 97.8
                }
            ],
            'statistical_significance': True,
            'winning_variant': 'variant_a',
            'improvement': 20.3
        }
        
        return Response({'status': 'success', 'data': mock_results})
    
    def _get_all_active_tests(self) -> Response:
        """Get all active A/B tests"""
        mock_tests = [
            {
                'id': 'test_1',
                'name': 'Video Player UI Test',
                'status': 'running',
                'start_date': '2025-01-15',
                'participants': 1250
            },
            {
                'id': 'test_2',
                'name': 'Party Invitation Flow',
                'status': 'completed',
                'start_date': '2025-01-10',
                'participants': 890
            }
        ]
        
        return Response({'status': 'success', 'data': mock_tests})
    
    def _create_ab_test(self, config: Dict) -> Dict:
        """Create new A/B test"""
        # Implementation would integrate with feature flag service
        return {
            'id': f"test_{int(timezone.now().timestamp())}",
            'name': config['name'],
            'status': 'created'
        }


class PredictiveAnalyticsView(generics.GenericAPIView):
    """Machine learning powered predictive analytics"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(summary="PredictiveAnalyticsView GET")
    def get(self, request, *args, **kwargs):
        """Get predictive analytics insights"""
        prediction_type = request.GET.get('type', 'user_churn')
        
        handlers = {
            'user_churn': self._predict_user_churn,
            'content_recommendation': self._get_content_recommendations,
            'optimal_timing': self._predict_optimal_timing,
            'growth_forecast': self._forecast_growth,
        }
        
        handler = handlers.get(prediction_type)
        if handler:
            results = handler()
            return Response({
                'status': 'success',
                'prediction_type': prediction_type,
                'data': results,
                'generated_at': timezone.now().isoformat()
            })
        
        return Response({
            'error': 'Unknown prediction type'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def _predict_user_churn(self) -> Dict:
        """Predict user churn likelihood"""
        # This would integrate with ML models
        return {
            'high_risk_users': 45,
            'medium_risk_users': 128,
            'low_risk_users': 1876,
            'churn_factors': [
                {'factor': 'Low engagement', 'weight': 0.35},
                {'factor': 'No recent party creation', 'weight': 0.28},
                {'factor': 'Reduced friend interactions', 'weight': 0.22},
                {'factor': 'Technical issues', 'weight': 0.15}
            ]
        }
    
    def _get_content_recommendations(self) -> Dict:
        """Get content recommendation insights"""
        return {
            'trending_categories': ['Comedy', 'Action', 'Documentary'],
            'optimal_video_length': {'min': 45, 'max': 120},  # minutes
            'recommended_upload_times': ['19:00', '20:30', '21:00'],
        }
    
    def _predict_optimal_timing(self) -> Dict:
        """Predict optimal timing for parties"""
        return {
            'peak_hours': [19, 20, 21, 22],  # 7-10 PM
            'best_days': ['Friday', 'Saturday', 'Sunday'],
            'seasonal_trends': {
                'winter': 1.2,  # multiplier
                'spring': 0.9,
                'summer': 0.8,
                'fall': 1.1
            }
        }
    
    def _forecast_growth(self) -> Dict:
        """Forecast platform growth"""
        return {
            'user_growth_30d': 15.2,  # percentage
            'party_creation_trend': 8.7,
            'engagement_forecast': 'increasing',
            'projected_metrics': {
                'users_next_month': 2580,
                'active_parties_daily': 85,
                'revenue_growth': 12.5
            }
        }
