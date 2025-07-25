"""
Advanced video analytics service for Watch Party Backend
"""

import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from django.contrib.auth import get_user_model
from django.db.models import Count, Sum, Avg, Q, F
from django.db.models.functions import Extract, TruncDate, TruncHour
from django.utils import timezone
from apps.videos.models import Video, VideoView
from apps.parties.models import WatchParty, PartyParticipant

User = get_user_model()
logger = logging.getLogger(__name__)


class VideoAnalyticsService:
    """Service for advanced video analytics and engagement tracking"""
    
    def __init__(self):
        self.logger = logger
    
    def get_video_analytics(self, video: Video, days: int = 30) -> Dict:
        """
        Get comprehensive analytics for a specific video
        
        Args:
            video: Video instance
            days: Number of days to analyze
        
        Returns:
            Dict with analytics data
        """
        end_date = timezone.now()
        start_date = end_date - timedelta(days=days)
        
        # Basic view metrics
        total_views = VideoView.objects.filter(video=video).count()
        unique_viewers = VideoView.objects.filter(video=video).values('user').distinct().count()
        period_views = VideoView.objects.filter(
            video=video,
            created_at__gte=start_date
        ).count()
        
        # Watch time analytics
        watch_time_data = VideoView.objects.filter(
            video=video,
            watch_duration__gt=0
        ).aggregate(
            total_watch_time=Sum('watch_duration'),
            avg_watch_time=Avg('watch_duration'),
            completion_rate=Avg(F('watch_duration') / video.duration * 100)
        )
        
        # Engagement metrics
        engagement_data = self._calculate_engagement_metrics(video)
        
        # Viewer demographics
        demographics = self._get_viewer_demographics(video)
        
        # Watch pattern analysis
        watch_patterns = self._analyze_watch_patterns(video, start_date, end_date)
        
        # Party integration metrics
        party_metrics = self._get_party_metrics(video)
        
        return {
            'video_id': str(video.id),
            'title': video.title,
            'duration': video.duration,
            'created_at': video.created_at,
            'metrics': {
                'total_views': total_views,
                'unique_viewers': unique_viewers,
                'period_views': period_views,
                'total_watch_time_seconds': watch_time_data['total_watch_time'] or 0,
                'avg_watch_time_seconds': watch_time_data['avg_watch_time'] or 0,
                'completion_rate': round(watch_time_data['completion_rate'] or 0, 2),
            },
            'engagement': engagement_data,
            'demographics': demographics,
            'watch_patterns': watch_patterns,
            'party_metrics': party_metrics,
        }
    
    def get_engagement_heatmap(self, video: Video) -> List[Dict]:
        """
        Generate engagement heatmap data for video timeline
        
        Args:
            video: Video instance
        
        Returns:
            List of time segments with engagement scores
        """
        if not video.duration or video.duration <= 0:
            return []
        
        # Divide video into 20-second segments
        segment_duration = 20  # seconds
        total_segments = int(video.duration / segment_duration) + 1
        
        heatmap_data = []
        
        for i in range(total_segments):
            start_time = i * segment_duration
            end_time = min((i + 1) * segment_duration, video.duration)
            
            # Count views that reached this segment
            views_at_segment = VideoView.objects.filter(
                video=video,
                watch_duration__gte=start_time
            ).count()
            
            # Calculate engagement score (percentage of total viewers)
            total_views = VideoView.objects.filter(video=video).count()
            engagement_score = (views_at_segment / total_views * 100) if total_views > 0 else 0
            
            heatmap_data.append({
                'start_time': start_time,
                'end_time': end_time,
                'views_count': views_at_segment,
                'engagement_score': round(engagement_score, 2)
            })
        
        return heatmap_data
    
    def get_retention_curve(self, video: Video) -> List[Dict]:
        """
        Generate viewer retention curve data
        
        Args:
            video: Video instance
        
        Returns:
            List of retention points throughout the video
        """
        if not video.duration or video.duration <= 0:
            return []
        
        # Create retention points every 10% of video duration
        retention_points = []
        total_views = VideoView.objects.filter(video=video).count()
        
        if total_views == 0:
            return []
        
        for percentage in range(0, 101, 10):
            time_point = (percentage / 100) * video.duration
            
            viewers_at_point = VideoView.objects.filter(
                video=video,
                watch_duration__gte=time_point
            ).count()
            
            retention_rate = (viewers_at_point / total_views) * 100
            
            retention_points.append({
                'percentage': percentage,
                'time_seconds': time_point,
                'viewers_remaining': viewers_at_point,
                'retention_rate': round(retention_rate, 2)
            })
        
        return retention_points
    
    def get_viewer_journey_analysis(self, video: Video) -> Dict:
        """
        Analyze viewer journey and behavior patterns
        
        Args:
            video: Video instance
        
        Returns:
            Dict with viewer journey insights
        """
        views = VideoView.objects.filter(video=video).select_related('user')
        
        if not views.exists():
            return {
                'total_viewers': 0,
                'journey_segments': [],
                'behavior_patterns': {}
            }
        
        # Categorize viewers by watch completion
        total_viewers = views.count()
        
        # Define journey segments
        journey_segments = {
            'immediate_bounce': 0,  # < 5% watched
            'early_dropout': 0,     # 5-25% watched
            'mid_dropout': 0,       # 25-75% watched
            'late_dropout': 0,      # 75-95% watched
            'complete_viewers': 0   # > 95% watched
        }
        
        for view in views:
            if not view.watch_duration or not video.duration:
                continue
                
            completion_rate = (view.watch_duration / video.duration) * 100
            
            if completion_rate < 5:
                journey_segments['immediate_bounce'] += 1
            elif completion_rate < 25:
                journey_segments['early_dropout'] += 1
            elif completion_rate < 75:
                journey_segments['mid_dropout'] += 1
            elif completion_rate < 95:
                journey_segments['late_dropout'] += 1
            else:
                journey_segments['complete_viewers'] += 1
        
        # Convert to percentages
        for segment in journey_segments:
            journey_segments[segment] = round(
                (journey_segments[segment] / total_viewers) * 100, 2
            )
        
        # Analyze behavior patterns
        behavior_patterns = {
            'avg_session_duration': views.aggregate(
                avg=Avg('watch_duration')
            )['avg'] or 0,
            'replay_rate': views.filter(user__isnull=False).values('user').annotate(
                view_count=Count('id')
            ).filter(view_count__gt=1).count() / total_viewers * 100 if total_viewers > 0 else 0,
            'peak_viewing_hour': self._get_peak_viewing_hour(video),
            'device_preferences': self._get_device_preferences(video)
        }
        
        return {
            'total_viewers': total_viewers,
            'journey_segments': journey_segments,
            'behavior_patterns': behavior_patterns
        }
    
    def get_comparative_analytics(self, video: Video) -> Dict:
        """
        Compare video performance against channel/platform averages
        
        Args:
            video: Video instance
        
        Returns:
            Dict with comparative metrics
        """
        # Get channel averages (videos by same uploader)
        channel_videos = Video.objects.filter(
            uploader=video.uploader
        ).exclude(id=video.id)
        
        if not channel_videos.exists():
            return {
                'channel_comparison': None,
                'platform_comparison': None
            }
        
        # Calculate channel averages
        channel_stats = self._calculate_channel_averages(channel_videos)
        
        # Get platform averages (last 30 days)
        platform_stats = self._calculate_platform_averages()
        
        # Current video stats
        video_views = VideoView.objects.filter(video=video).count()
        video_watch_time = VideoView.objects.filter(video=video).aggregate(
            avg=Avg('watch_duration')
        )['avg'] or 0
        
        return {
            'channel_comparison': {
                'views_vs_avg': self._calculate_percentage_difference(
                    video_views, channel_stats['avg_views']
                ),
                'watch_time_vs_avg': self._calculate_percentage_difference(
                    video_watch_time, channel_stats['avg_watch_time']
                ),
                'performance_score': self._calculate_performance_score(
                    video, channel_stats
                )
            },
            'platform_comparison': {
                'views_vs_platform': self._calculate_percentage_difference(
                    video_views, platform_stats['avg_views']
                ),
                'engagement_vs_platform': self._calculate_percentage_difference(
                    video_watch_time, platform_stats['avg_watch_time']
                )
            }
        }
    
    def get_trending_analysis(self, days: int = 7) -> List[Dict]:
        """
        Analyze trending videos and patterns
        
        Args:
            days: Number of days to analyze for trends
        
        Returns:
            List of trending videos with metrics
        """
        end_date = timezone.now()
        start_date = end_date - timedelta(days=days)
        
        # Get videos with recent activity
        trending_videos = Video.objects.filter(
            videoview__created_at__gte=start_date
        ).annotate(
            recent_views=Count('videoview', filter=Q(videoview__created_at__gte=start_date)),
            total_views=Count('videoview'),
            avg_watch_time=Avg('videoview__watch_duration')
        ).filter(
            recent_views__gt=0
        ).order_by('-recent_views')[:20]
        
        trending_data = []
        
        for video in trending_videos:
            # Calculate trend score
            trend_score = self._calculate_trend_score(video, start_date, end_date)
            
            trending_data.append({
                'video_id': str(video.id),
                'title': video.title,
                'uploader': video.uploader.username,
                'recent_views': video.recent_views,
                'total_views': video.total_views,
                'avg_watch_time': round(video.avg_watch_time or 0, 2),
                'trend_score': trend_score,
                'created_at': video.created_at
            })
        
        return sorted(trending_data, key=lambda x: x['trend_score'], reverse=True)
    
    def _calculate_engagement_metrics(self, video: Video) -> Dict:
        """Calculate engagement metrics for a video"""
        views = VideoView.objects.filter(video=video)
        
        if not views.exists():
            return {
                'likes_count': 0,
                'comments_count': 0,
                'shares_count': 0,
                'engagement_rate': 0,
                'average_view_duration': 0
            }
        
        total_views = views.count()
        
        # Mock engagement data (replace with actual models when available)
        engagement_data = {
            'likes_count': getattr(video, 'likes_count', 0),
            'comments_count': getattr(video, 'comments_count', 0),
            'shares_count': getattr(video, 'shares_count', 0),
            'average_view_duration': views.aggregate(avg=Avg('watch_duration'))['avg'] or 0
        }
        
        # Calculate engagement rate
        total_engagements = (
            engagement_data['likes_count'] + 
            engagement_data['comments_count'] + 
            engagement_data['shares_count']
        )
        
        engagement_data['engagement_rate'] = (
            (total_engagements / total_views) * 100 if total_views > 0 else 0
        )
        
        return engagement_data
    
    def _get_viewer_demographics(self, video: Video) -> Dict:
        """Get viewer demographics for a video"""
        views = VideoView.objects.filter(
            video=video,
            user__isnull=False
        ).select_related('user')
        
        if not views.exists():
            return {
                'total_unique_viewers': 0,
                'registered_vs_anonymous': {'registered': 0, 'anonymous': 0},
                'top_countries': [],
                'age_distribution': []
            }
        
        unique_viewers = views.values('user').distinct().count()
        total_views = VideoView.objects.filter(video=video).count()
        anonymous_views = total_views - views.count()
        
        return {
            'total_unique_viewers': unique_viewers,
            'registered_vs_anonymous': {
                'registered': views.count(),
                'anonymous': anonymous_views
            },
            'top_countries': [],  # Implement geo-location if needed
            'age_distribution': []  # Implement if user ages are available
        }
    
    def _analyze_watch_patterns(self, video: Video, start_date: datetime, end_date: datetime) -> Dict:
        """Analyze when people watch the video"""
        views = VideoView.objects.filter(
            video=video,
            created_at__gte=start_date,
            created_at__lte=end_date
        )
        
        # Daily distribution
        daily_views = views.extra(
            {'day': 'date(created_at)'}
        ).values('day').annotate(count=Count('id')).order_by('day')
        
        # Hourly distribution
        hourly_views = views.annotate(
            hour=Extract('created_at', 'hour')
        ).values('hour').annotate(count=Count('id')).order_by('hour')
        
        return {
            'daily_distribution': list(daily_views),
            'hourly_distribution': list(hourly_views),
            'peak_day': max(daily_views, key=lambda x: x['count'])['day'] if daily_views else None,
            'peak_hour': max(hourly_views, key=lambda x: x['count'])['hour'] if hourly_views else None
        }
    
    def _get_party_metrics(self, video: Video) -> Dict:
        """Get metrics related to party viewing"""
        party_views = WatchParty.objects.filter(video=video)
        
        if not party_views.exists():
            return {
                'total_parties': 0,
                'total_party_participants': 0,
                'avg_party_size': 0,
                'party_completion_rate': 0
            }
        
        total_parties = party_views.count()
        total_participants = PartyParticipant.objects.filter(
            party__video=video
        ).count()
        
        return {
            'total_parties': total_parties,
            'total_party_participants': total_participants,
            'avg_party_size': round(total_participants / total_parties, 2) if total_parties > 0 else 0,
            'party_completion_rate': 0  # Implement based on party completion tracking
        }
    
    def _get_peak_viewing_hour(self, video: Video) -> int:
        """Get the hour when the video gets most views"""
        hourly_views = VideoView.objects.filter(video=video).annotate(
            hour=Extract('created_at', 'hour')
        ).values('hour').annotate(count=Count('id')).order_by('-count')
        
        return hourly_views.first()['hour'] if hourly_views else 0
    
    def _get_device_preferences(self, video: Video) -> Dict:
        """Get device preferences for viewing (mock implementation)"""
        return {
            'mobile': 60,
            'desktop': 35,
            'tablet': 5
        }
    
    def _calculate_channel_averages(self, channel_videos) -> Dict:
        """Calculate average metrics for a channel"""
        channel_views = VideoView.objects.filter(video__in=channel_videos)
        
        return {
            'avg_views': channel_views.values('video').annotate(
                view_count=Count('id')
            ).aggregate(avg=Avg('view_count'))['avg'] or 0,
            'avg_watch_time': channel_views.aggregate(
                avg=Avg('watch_duration')
            )['avg'] or 0
        }
    
    def _calculate_platform_averages(self) -> Dict:
        """Calculate platform-wide averages"""
        thirty_days_ago = timezone.now() - timedelta(days=30)
        recent_views = VideoView.objects.filter(created_at__gte=thirty_days_ago)
        
        return {
            'avg_views': recent_views.values('video').annotate(
                view_count=Count('id')
            ).aggregate(avg=Avg('view_count'))['avg'] or 0,
            'avg_watch_time': recent_views.aggregate(
                avg=Avg('watch_duration')
            )['avg'] or 0
        }
    
    def _calculate_percentage_difference(self, current: float, average: float) -> float:
        """Calculate percentage difference from average"""
        if average == 0:
            return 0
        return round(((current - average) / average) * 100, 2)
    
    def _calculate_performance_score(self, video: Video, channel_stats: Dict) -> float:
        """Calculate overall performance score"""
        # Simple scoring algorithm (can be enhanced)
        video_views = VideoView.objects.filter(video=video).count()
        video_watch_time = VideoView.objects.filter(video=video).aggregate(
            avg=Avg('watch_duration')
        )['avg'] or 0
        
        views_score = min(video_views / max(channel_stats['avg_views'], 1), 2) * 50
        engagement_score = min(video_watch_time / max(channel_stats['avg_watch_time'], 1), 2) * 50
        
        return round(views_score + engagement_score, 2)
    
    def _calculate_trend_score(self, video: Video, start_date: datetime, end_date: datetime) -> float:
        """Calculate trending score for a video"""
        recent_views = video.recent_views
        total_views = video.total_views
        days_since_upload = (timezone.now() - video.created_at).days or 1
        
        # Trending score algorithm
        recency_factor = max(1, 30 - days_since_upload) / 30
        velocity = recent_views / 7  # views per day in recent period
        momentum = recent_views / max(total_views, 1)  # recent vs total views ratio
        
        trend_score = (velocity * 0.4 + momentum * 0.4 + recency_factor * 0.2) * 100
        
        return round(trend_score, 2)


# Create service instance
video_analytics_service = VideoAnalyticsService()
