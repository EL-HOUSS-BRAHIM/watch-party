"""
Analytics tasks for Watch Party Backend
"""

from celery import shared_task
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.db.models import Count, Avg, Sum, F, Q
from datetime import datetime, timedelta
import json
import logging

from .models import AnalyticsEvent, UserSession, WatchTime, PartyAnalytics
from apps.parties.models import WatchParty
from apps.videos.models import Video

User = get_user_model()
logger = logging.getLogger(__name__)


@shared_task
def process_analytics_events():
    """Process pending analytics events and update aggregated data"""
    try:
        # Get unprocessed events from the last hour
        one_hour_ago = timezone.now() - timedelta(hours=1)
        
        events = AnalyticsEvent.objects.filter(
            processed=False,
            timestamp__gte=one_hour_ago
        )
        
        processed_count = 0
        
        for event in events:
            try:
                process_single_event(event)
                event.processed = True
                event.save()
                processed_count += 1
            except Exception as e:
                logger.error(f"Error processing event {event.id}: {str(e)}")
        
        logger.info(f"Processed {processed_count} analytics events")
        return f"Processed {processed_count} events"
        
    except Exception as e:
        logger.error(f"Error in process_analytics_events: {str(e)}")
        return f"Error: {str(e)}"


def process_single_event(event):
    """Process a single analytics event"""
    event_data = json.loads(event.event_data) if event.event_data else {}
    
    if event.event_type == 'video_play':
        _process_video_play_event(event, event_data)
    elif event.event_type == 'video_pause':
        _process_video_pause_event(event, event_data)
    elif event.event_type == 'party_join':
        _process_party_join_event(event, event_data)
    elif event.event_type == 'party_leave':
        _process_party_leave_event(event, event_data)
    elif event.event_type == 'chat_message':
        _process_chat_message_event(event, event_data)
    elif event.event_type == 'user_login':
        _process_user_login_event(event, event_data)
    elif event.event_type == 'user_logout':
        _process_user_logout_event(event, event_data)


def _process_video_play_event(event, data):
    """Process video play event"""
    video_id = data.get('video_id')
    party_id = data.get('party_id')
    position = data.get('position', 0)
    
    if video_id:
        # Update or create watch time record
        WatchTime.objects.update_or_create(
            user_id=event.user_id,
            video_id=video_id,
            party_id=party_id,
            defaults={
                'last_position': position,
                'updated_at': timezone.now()
            }
        )


def _process_video_pause_event(event, data):
    """Process video pause event"""
    video_id = data.get('video_id')
    party_id = data.get('party_id')
    position = data.get('position', 0)
    watch_duration = data.get('watch_duration', 0)
    
    if video_id and watch_duration > 0:
        # Update watch time record
        try:
            watch_time = WatchTime.objects.get(
                user_id=event.user_id,
                video_id=video_id,
                party_id=party_id
            )
            watch_time.total_watch_time += watch_duration
            watch_time.last_position = position
            watch_time.updated_at = timezone.now()
            watch_time.save()
        except WatchTime.DoesNotExist:
            WatchTime.objects.create(
                user_id=event.user_id,
                video_id=video_id,
                party_id=party_id,
                total_watch_time=watch_duration,
                last_position=position
            )


def _process_party_join_event(event, data):
    """Process party join event"""
    party_id = data.get('party_id')
    
    if party_id:
        # Update party analytics
        analytics, created = PartyAnalytics.objects.get_or_create(
            party_id=party_id,
            defaults={'total_participants': 0}
        )
        
        analytics.total_participants = F('total_participants') + 1
        analytics.save()


def _process_party_leave_event(event, data):
    """Process party leave event"""
    party_id = data.get('party_id')
    session_duration = data.get('session_duration', 0)
    
    if party_id:
        # Update party analytics with session duration
        try:
            analytics = PartyAnalytics.objects.get(party_id=party_id)
            if session_duration > 0:
                if analytics.avg_session_duration:
                    # Calculate new average
                    total_duration = analytics.avg_session_duration * analytics.total_participants
                    analytics.avg_session_duration = (total_duration + session_duration) / (analytics.total_participants + 1)
                else:
                    analytics.avg_session_duration = session_duration
                analytics.save()
        except PartyAnalytics.DoesNotExist:
            pass


def _process_chat_message_event(event, data):
    """Process chat message event"""
    party_id = data.get('party_id')
    
    if party_id:
        # Update party analytics
        try:
            analytics = PartyAnalytics.objects.get(party_id=party_id)
            analytics.total_messages = F('total_messages') + 1
            analytics.save()
        except PartyAnalytics.DoesNotExist:
            PartyAnalytics.objects.create(
                party_id=party_id,
                total_messages=1
            )


def _process_user_login_event(event, data):
    """Process user login event"""
    session_id = data.get('session_id')
    
    if session_id:
        # Create or update user session
        UserSession.objects.update_or_create(
            session_id=session_id,
            defaults={
                'user_id': event.user_id,
                'start_time': event.timestamp,
                'ip_address': event.ip_address,
                'user_agent': event.user_agent
            }
        )


def _process_user_logout_event(event, data):
    """Process user logout event"""
    session_id = data.get('session_id')
    
    if session_id:
        # Update user session with end time
        try:
            session = UserSession.objects.get(session_id=session_id)
            session.end_time = event.timestamp
            session.duration = int((session.end_time - session.start_time).total_seconds())
            session.save()
        except UserSession.DoesNotExist:
            pass


@shared_task
def generate_daily_reports():
    """Generate daily analytics reports"""
    try:
        yesterday = timezone.now().date() - timedelta(days=1)
        
        # Generate user activity report
        user_stats = generate_user_activity_report(yesterday)
        
        # Generate party statistics report
        party_stats = generate_party_statistics_report(yesterday)
        
        # Generate video engagement report
        video_stats = generate_video_engagement_report(yesterday)
        
        logger.info(f"Generated daily reports for {yesterday}")
        
        return {
            'date': yesterday.isoformat(),
            'user_stats': user_stats,
            'party_stats': party_stats,
            'video_stats': video_stats
        }
        
    except Exception as e:
        logger.error(f"Error generating daily reports: {str(e)}")
        return f"Error: {str(e)}"


def generate_user_activity_report(date):
    """Generate user activity report for a specific date"""
    start_date = datetime.combine(date, datetime.min.time())
    end_date = datetime.combine(date, datetime.max.time())
    
    # Active users
    active_users = User.objects.filter(
        last_login__range=[start_date, end_date]
    ).count()
    
    # New registrations
    new_users = User.objects.filter(
        date_joined__range=[start_date, end_date]
    ).count()
    
    # Session statistics
    sessions = UserSession.objects.filter(
        start_time__range=[start_date, end_date]
    )
    
    avg_session_duration = sessions.filter(
        duration__isnull=False
    ).aggregate(avg_duration=Avg('duration'))['avg_duration'] or 0
    
    return {
        'active_users': active_users,
        'new_users': new_users,
        'total_sessions': sessions.count(),
        'avg_session_duration_minutes': round(avg_session_duration / 60, 2)
    }


def generate_party_statistics_report(date):
    """Generate party statistics report for a specific date"""
    start_date = datetime.combine(date, datetime.min.time())
    end_date = datetime.combine(date, datetime.max.time())
    
    # Parties created
    parties_created = WatchParty.objects.filter(
        created_at__range=[start_date, end_date]
    ).count()
    
    # Active parties
    active_parties = WatchParty.objects.filter(
        actual_start__range=[start_date, end_date]
    ).count()
    
    # Party engagement
    party_analytics = PartyAnalytics.objects.filter(
        created_at__range=[start_date, end_date]
    )
    
    avg_participants = party_analytics.aggregate(
        avg_participants=Avg('total_participants')
    )['avg_participants'] or 0
    
    total_messages = party_analytics.aggregate(
        total_messages=Sum('total_messages')
    )['total_messages'] or 0
    
    return {
        'parties_created': parties_created,
        'active_parties': active_parties,
        'avg_participants_per_party': round(avg_participants, 2),
        'total_chat_messages': total_messages
    }


def generate_video_engagement_report(date):
    """Generate video engagement report for a specific date"""
    start_date = datetime.combine(date, datetime.min.time())
    end_date = datetime.combine(date, datetime.max.time())
    
    # Videos uploaded
    videos_uploaded = Video.objects.filter(
        created_at__range=[start_date, end_date]
    ).count()
    
    # Watch time statistics
    watch_times = WatchTime.objects.filter(
        created_at__range=[start_date, end_date]
    )
    
    total_watch_time = watch_times.aggregate(
        total_time=Sum('total_watch_time')
    )['total_time'] or 0
    
    avg_watch_time = watch_times.aggregate(
        avg_time=Avg('total_watch_time')
    )['avg_time'] or 0
    
    # Most watched videos
    popular_videos = watch_times.values('video_id').annotate(
        total_views=Count('id'),
        total_duration=Sum('total_watch_time')
    ).order_by('-total_views')[:5]
    
    return {
        'videos_uploaded': videos_uploaded,
        'total_watch_time_hours': round(total_watch_time / 3600, 2),
        'avg_watch_time_minutes': round(avg_watch_time / 60, 2),
        'unique_viewers': watch_times.values('user_id').distinct().count(),
        'popular_videos': list(popular_videos)
    }


@shared_task
def cleanup_old_analytics():
    """Clean up old analytics data based on retention policy"""
    try:
        retention_days = 365  # Keep 1 year of data
        cutoff_date = timezone.now() - timedelta(days=retention_days)
        
        # Delete old events
        deleted_events = AnalyticsEvent.objects.filter(
            timestamp__lt=cutoff_date
        ).delete()[0]
        
        # Delete old sessions
        deleted_sessions = UserSession.objects.filter(
            start_time__lt=cutoff_date
        ).delete()[0]
        
        logger.info(f"Cleaned up {deleted_events} events and {deleted_sessions} sessions")
        
        return f"Cleaned up {deleted_events} events and {deleted_sessions} sessions"
        
    except Exception as e:
        logger.error(f"Error in cleanup_old_analytics: {str(e)}")
        return f"Error: {str(e)}"


@shared_task
def track_user_engagement():
    """Track user engagement metrics"""
    try:
        now = timezone.now()
        week_ago = now - timedelta(days=7)
        
        # Calculate engagement metrics
        total_users = User.objects.count()
        active_users_week = User.objects.filter(
            last_login__gte=week_ago
        ).count()
        
        # Users who joined parties
        party_participants = User.objects.filter(
            party_participants__joined_at__gte=week_ago
        ).distinct().count()
        
        # Users who uploaded videos
        video_uploaders = User.objects.filter(
            uploaded_videos__created_at__gte=week_ago
        ).distinct().count()
        
        # Users who sent chat messages
        chat_users = User.objects.filter(
            chat_messages__created_at__gte=week_ago
        ).distinct().count()
        
        engagement_metrics = {
            'total_users': total_users,
            'weekly_active_users': active_users_week,
            'weekly_party_participants': party_participants,
            'weekly_video_uploaders': video_uploaders,
            'weekly_chat_users': chat_users,
            'engagement_rate': round((active_users_week / total_users) * 100, 2) if total_users > 0 else 0
        }
        
        logger.info(f"User engagement metrics: {engagement_metrics}")
        return engagement_metrics
        
    except Exception as e:
        logger.error(f"Error tracking user engagement: {str(e)}")
        return f"Error: {str(e)}"


@shared_task
def generate_real_time_stats():
    """Generate real-time statistics for dashboard"""
    try:
        now = timezone.now()
        
        # Current active sessions
        active_sessions = UserSession.objects.filter(
            start_time__gte=now - timedelta(hours=1),
            end_time__isnull=True
        ).count()
        
        # Active parties
        active_parties = WatchParty.objects.filter(
            is_active=True,
            actual_start__isnull=False,
            ended_at__isnull=True
        ).count()
        
        # Recent events (last 5 minutes)
        recent_events = AnalyticsEvent.objects.filter(
            timestamp__gte=now - timedelta(minutes=5)
        ).count()
        
        # Popular videos (last 24 hours)
        popular_videos = WatchTime.objects.filter(
            updated_at__gte=now - timedelta(hours=24)
        ).values('video_id').annotate(
            viewer_count=Count('user_id', distinct=True)
        ).order_by('-viewer_count')[:5]
        
        real_time_stats = {
            'timestamp': now.isoformat(),
            'active_sessions': active_sessions,
            'active_parties': active_parties,
            'recent_events': recent_events,
            'popular_videos': list(popular_videos)
        }
        
        return real_time_stats
        
    except Exception as e:
        logger.error(f"Error generating real-time stats: {str(e)}")
        return f"Error: {str(e)}"


@shared_task
def calculate_user_metrics():
    """Calculate detailed user metrics"""
    try:
        users = User.objects.all()
        
        for user in users:
            # Calculate user's total watch time
            total_watch_time = WatchTime.objects.filter(
                user=user
            ).aggregate(total=Sum('total_watch_time'))['total'] or 0
            
            # Calculate parties hosted
            parties_hosted = WatchParty.objects.filter(host=user).count()
            
            # Calculate parties joined
            parties_joined = user.party_participants.count()
            
            # Calculate videos uploaded
            videos_uploaded = user.uploaded_videos.count()
            
            # Update user analytics (you might want to create a UserAnalytics model)
            # For now, we'll just log the metrics
            logger.info(f"User {user.id} metrics: "
                       f"watch_time={total_watch_time}, "
                       f"parties_hosted={parties_hosted}, "
                       f"parties_joined={parties_joined}, "
                       f"videos_uploaded={videos_uploaded}")
        
        return f"Calculated metrics for {users.count()} users"
        
    except Exception as e:
        logger.error(f"Error calculating user metrics: {str(e)}")
        return f"Error: {str(e)}"
