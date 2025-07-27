"""
Advanced analytics dashboard views
"""

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.db.models import Count, Avg, Sum, Q, F, Case, When, Value, IntegerField
from django.utils import timezone
from datetime import datetime, timedelta
from django.contrib.auth import get_user_model
from django.core.cache import cache

from core.responses import StandardResponse
from core.api_documentation import api_response_documentation

User = get_user_model()


class PersonalAnalyticsView(APIView):
    """
    Personal analytics dashboard for individual users
    """
    permission_classes = [IsAuthenticated]
    
    @api_response_documentation(
        summary="Get personal analytics",
        description="Retrieve detailed analytics for the authenticated user",
        tags=['Analytics', 'User']
    )
    def get(self, request):
        """Get personal analytics for user"""
        user = request.user
        time_range = request.GET.get('time_range', '30d')  # 7d, 30d, 90d, 1y
        
        # Calculate date range
        end_date = timezone.now()
        if time_range == '7d':
            start_date = end_date - timedelta(days=7)
        elif time_range == '30d':
            start_date = end_date - timedelta(days=30)
        elif time_range == '90d':
            start_date = end_date - timedelta(days=90)
        elif time_range == '1y':
            start_date = end_date - timedelta(days=365)
        else:
            start_date = end_date - timedelta(days=30)
        
        analytics_data = self.calculate_personal_analytics(user, start_date, end_date)
        
        return StandardResponse.success(analytics_data, "Personal analytics retrieved successfully")
    
    def calculate_personal_analytics(self, user, start_date, end_date):
        """Calculate comprehensive personal analytics"""
        from apps.parties.models import WatchParty, PartyParticipant
        from apps.videos.models import Video
        from apps.analytics.models import AnalyticsEvent
        from apps.chat.models import ChatMessage
        from apps.social.models import GroupMembership
        from apps.store.models import UserInventory, UserAchievement
        
        # Basic user stats
        hosted_parties = WatchParty.objects.filter(
            host=user,
            created_at__range=[start_date, end_date]
        )
        
        joined_parties = PartyParticipant.objects.filter(
            user=user,
            is_active=True,
            joined_at__range=[start_date, end_date]
        )
        
        uploaded_videos = Video.objects.filter(
            uploaded_by=user,
            created_at__range=[start_date, end_date]
        )
        
        analytics_events = AnalyticsEvent.objects.filter(
            user=user,
            timestamp__range=[start_date, end_date]
        )
        
        chat_messages = ChatMessage.objects.filter(
            user=user,
            timestamp__range=[start_date, end_date],
            is_deleted=False
        )
        
        # Watch time calculation
        watch_events = analytics_events.filter(event_type='video_watch')
        total_watch_time = sum([
            event.event_data.get('duration', 0) 
            for event in watch_events 
            if event.event_data and 'duration' in event.event_data
        ])
        
        # Party engagement
        party_engagement = self.calculate_party_engagement(user, start_date, end_date)
        
        # Social metrics
        social_metrics = self.calculate_social_metrics(user, start_date, end_date)
        
        # Achievement progress
        achievement_progress = self.calculate_achievement_progress(user, start_date, end_date)
        
        # Activity trends (daily breakdown)
        activity_trends = self.calculate_activity_trends(user, start_date, end_date)
        
        # Preferences and interests
        interests = self.calculate_user_interests(user, start_date, end_date)
        
        return {
            'time_range': {
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat(),
                'days': (end_date - start_date).days
            },
            'overview': {
                'parties_hosted': hosted_parties.count(),
                'parties_joined': joined_parties.count(),
                'videos_uploaded': uploaded_videos.count(),
                'total_watch_time_minutes': total_watch_time // 60,
                'messages_sent': chat_messages.count(),
                'events_tracked': analytics_events.count()
            },
            'party_engagement': party_engagement,
            'social_metrics': social_metrics,
            'achievement_progress': achievement_progress,
            'activity_trends': activity_trends,
            'interests': interests,
            'milestones': self.calculate_milestones(user),
            'recommendations': self.generate_recommendations(user)
        }
    
    def calculate_party_engagement(self, user, start_date, end_date):
        """Calculate party engagement metrics"""
        from apps.parties.models import WatchParty, PartyParticipant
        from apps.analytics.models import AnalyticsEvent
        
        # Parties hosted
        hosted_parties = WatchParty.objects.filter(
            host=user,
            created_at__range=[start_date, end_date]
        )
        
        # Average party duration
        party_durations = []
        for party in hosted_parties:
            duration_events = AnalyticsEvent.objects.filter(
                party=party,
                event_type='party_ended'
            ).first()
            if duration_events and duration_events.event_data:
                party_durations.append(duration_events.event_data.get('duration', 0))
        
        avg_party_duration = sum(party_durations) / len(party_durations) if party_durations else 0
        
        # Participation stats
        participated_parties = PartyParticipant.objects.filter(
            user=user,
            joined_at__range=[start_date, end_date]
        )
        
        # Average participants in hosted parties
        avg_participants = hosted_parties.aggregate(
            avg_participants=Avg('participants__user')
        )['avg_participants'] or 0
        
        return {
            'parties_hosted': hosted_parties.count(),
            'parties_joined': participated_parties.count(),
            'avg_party_duration_minutes': avg_party_duration // 60,
            'avg_participants_in_hosted_parties': round(avg_participants, 1),
            'most_popular_party_day': self.get_most_popular_day(hosted_parties),
            'hosting_streak': self.calculate_hosting_streak(user)
        }
    
    def calculate_social_metrics(self, user, start_date, end_date):
        """Calculate social interaction metrics"""
        from apps.social.models import GroupMembership, GroupPost
        from apps.messaging.models import Message
        from apps.authentication.models import User
        
        # Group activities
        group_memberships = GroupMembership.objects.filter(
            user=user,
            joined_at__range=[start_date, end_date]
        )
        
        group_posts = GroupPost.objects.filter(
            author=user,
            created_at__range=[start_date, end_date]
        )
        
        # Messages sent
        messages_sent = Message.objects.filter(
            sender=user,
            sent_at__range=[start_date, end_date]
        )
        
        # Friend interactions
        friend_interactions = self.calculate_friend_interactions(user, start_date, end_date)
        
        return {
            'groups_joined': group_memberships.count(),
            'group_posts': group_posts.count(),
            'messages_sent': messages_sent.count(),
            'friend_interactions': friend_interactions,
            'social_score': self.calculate_social_score(user, start_date, end_date)
        }
    
    def calculate_achievement_progress(self, user, start_date, end_date):
        """Calculate achievement progress"""
        from apps.store.models import Achievement, UserAchievement
        
        unlocked_achievements = UserAchievement.objects.filter(
            user=user,
            unlocked_at__range=[start_date, end_date]
        )
        
        total_achievements = Achievement.objects.count()
        user_achievements = UserAchievement.objects.filter(user=user).count()
        
        # Progress towards next achievements
        next_achievements = self.get_next_achievements(user)
        
        return {
            'achievements_unlocked': unlocked_achievements.count(),
            'total_achievements': user_achievements,
            'completion_percentage': round((user_achievements / total_achievements) * 100, 1),
            'next_achievements': next_achievements,
            'achievement_points': sum([
                ach.achievement.points for ach in UserAchievement.objects.filter(user=user)
            ])
        }
    
    def calculate_activity_trends(self, user, start_date, end_date):
        """Calculate daily activity trends"""
        from apps.analytics.models import AnalyticsEvent
        
        # Daily activity breakdown
        daily_activity = []
        current_date = start_date.date()
        
        while current_date <= end_date.date():
            day_start = timezone.make_aware(datetime.combine(current_date, datetime.min.time()))
            day_end = day_start + timedelta(days=1)
            
            events = AnalyticsEvent.objects.filter(
                user=user,
                timestamp__range=[day_start, day_end]
            )
            
            daily_activity.append({
                'date': current_date.isoformat(),
                'events': events.count(),
                'event_types': list(events.values_list('event_type', flat=True).distinct()),
                'peak_hour': self.get_peak_hour(events)
            })
            
            current_date += timedelta(days=1)
        
        return {
            'daily_breakdown': daily_activity,
            'most_active_day': max(daily_activity, key=lambda x: x['events']) if daily_activity else None,
            'activity_score': self.calculate_activity_score(daily_activity)
        }
    
    def calculate_user_interests(self, user, start_date, end_date):
        """Calculate user interests based on activity"""
        from apps.videos.models import Video
        from apps.analytics.models import AnalyticsEvent
        
        # Video categories watched
        watched_videos = AnalyticsEvent.objects.filter(
            user=user,
            event_type='video_watch',
            timestamp__range=[start_date, end_date]
        ).values_list('video__category', flat=True)
        
        category_counts = {}
        for category in watched_videos:
            if category:
                category_counts[category] = category_counts.get(category, 0) + 1
        
        # Sort by frequency
        top_categories = sorted(category_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        
        return {
            'top_video_categories': [{'category': cat, 'count': count} for cat, count in top_categories],
            'preferred_party_size': self.get_preferred_party_size(user),
            'active_hours': self.get_active_hours(user, start_date, end_date)
        }
    
    def calculate_milestones(self, user):
        """Calculate user milestones"""
        from apps.parties.models import WatchParty
        from apps.videos.models import Video
        from apps.store.models import UserAchievement
        
        total_parties = WatchParty.objects.filter(host=user).count()
        total_videos = Video.objects.filter(uploaded_by=user).count()
        total_achievements = UserAchievement.objects.filter(user=user).count()
        
        milestones = []
        
        # Party hosting milestones
        party_milestones = [1, 5, 10, 25, 50, 100]
        for milestone in party_milestones:
            if total_parties >= milestone:
                milestones.append({
                    'type': 'parties_hosted',
                    'value': milestone,
                    'achieved': True,
                    'date_achieved': user.date_joined.isoformat()  # Simplified
                })
            else:
                milestones.append({
                    'type': 'parties_hosted',
                    'value': milestone,
                    'achieved': False,
                    'progress': total_parties
                })
                break
        
        return milestones
    
    def generate_recommendations(self, user):
        """Generate personalized recommendations"""
        recommendations = []
        
        # Based on activity patterns
        recommendations.append({
            'type': 'activity',
            'title': 'Host More Parties',
            'description': 'You have great engagement! Consider hosting more parties.',
            'action': 'Create a new party',
            'priority': 'medium'
        })
        
        return recommendations
    
    # Helper methods
    def get_most_popular_day(self, parties):
        """Get most popular day for hosting parties"""
        if not parties:
            return None
        
        day_counts = {}
        for party in parties:
            day = party.created_at.strftime('%A')
            day_counts[day] = day_counts.get(day, 0) + 1
        
        return max(day_counts.items(), key=lambda x: x[1])[0] if day_counts else None
    
    def calculate_hosting_streak(self, user):
        """Calculate current hosting streak"""
        # Simplified implementation
        return 0
    
    def calculate_friend_interactions(self, user, start_date, end_date):
        """Calculate friend interaction metrics"""
        # Simplified implementation
        return {
            'messages_to_friends': 0,
            'parties_with_friends': 0,
            'new_friends': 0
        }
    
    def calculate_social_score(self, user, start_date, end_date):
        """Calculate social engagement score"""
        # Simplified implementation
        return 75
    
    def get_next_achievements(self, user):
        """Get next available achievements"""
        from apps.store.models import Achievement, UserAchievement
        
        unlocked_ids = UserAchievement.objects.filter(user=user).values_list('achievement_id', flat=True)
        next_achievements = Achievement.objects.exclude(id__in=unlocked_ids)[:3]
        
        return [
            {
                'id': ach.id,
                'name': ach.name,
                'description': ach.description,
                'points': ach.points,
                'progress': 0  # Calculate actual progress
            }
            for ach in next_achievements
        ]
    
    def get_peak_hour(self, events):
        """Get peak activity hour for events"""
        if not events:
            return None
        
        hour_counts = {}
        for event in events:
            hour = event.timestamp.hour
            hour_counts[hour] = hour_counts.get(hour, 0) + 1
        
        return max(hour_counts.items(), key=lambda x: x[1])[0] if hour_counts else None
    
    def calculate_activity_score(self, daily_activity):
        """Calculate overall activity score"""
        if not daily_activity:
            return 0
        
        total_events = sum([day['events'] for day in daily_activity])
        return min(100, total_events)  # Simplified scoring
    
    def get_preferred_party_size(self, user):
        """Get user's preferred party size"""
        # Simplified implementation
        return 'small'  # small, medium, large
    
    def get_active_hours(self, user, start_date, end_date):
        """Get user's most active hours"""
        from apps.analytics.models import AnalyticsEvent
        
        events = AnalyticsEvent.objects.filter(
            user=user,
            timestamp__range=[start_date, end_date]
        )
        
        hour_counts = {}
        for event in events:
            hour = event.timestamp.hour
            hour_counts[hour] = hour_counts.get(hour, 0) + 1
        
        return sorted(hour_counts.items(), key=lambda x: x[1], reverse=True)[:3]
