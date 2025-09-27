"""
Background task processing for heavy operations
"""

import logging
from datetime import timedelta, datetime

from celery import shared_task
from django.core.cache import cache
from django.db import models
from django.utils import timezone

from shared.observability import observability

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def process_search_analytics(self, date_str=None):
    """
    Process and aggregate search analytics data
    """
    try:
        from apps.search.models import SearchQuery, SearchAnalytics

        if date_str:
            date = datetime.fromisoformat(date_str).date()
        else:
            date = timezone.now().date() - timedelta(days=1)  # Yesterday

        tags = {"worker": "analytics.search", "date": date.isoformat()}

        with observability.span("analytics.search.process", tags=tags):
            # Aggregate search data for the date
            search_queries = SearchQuery.objects.filter(created_at__date=date)

            if not search_queries.exists():
                observability.record_event(
                    "analytics.search.empty",
                    f"No search queries found for {date}",
                    tags=tags,
                )
                logger.info(f"No search queries found for {date}")
                return

            # Calculate metrics
            total_searches = search_queries.count()
            unique_users = search_queries.values('user').distinct().count()
            avg_results_per_search = search_queries.aggregate(
                avg_results=models.Avg('results_count')
            )['avg_results'] or 0

            avg_search_duration = search_queries.filter(
                search_duration_ms__isnull=False
            ).aggregate(
                avg_duration=models.Avg('search_duration_ms')
            )['avg_duration'] or 0

            # Top queries
            top_queries = list(search_queries.values('query').annotate(
                count=models.Count('id')
            ).order_by('-count')[:20])

            # Click through rate
            clicked_searches = search_queries.filter(
                clicked_result_id__isnull=False
            ).count()
            click_through_rate = (clicked_searches / total_searches * 100) if total_searches > 0 else 0

            # Zero results rate
            zero_results = search_queries.filter(results_count=0).count()
            zero_results_rate = (zero_results / total_searches * 100) if total_searches > 0 else 0

            # Search types distribution
            search_types = search_queries.values('search_type').annotate(
                count=models.Count('id')
            )
            search_types_distribution = {item['search_type']: item['count'] for item in search_types}

            # Create or update analytics record
            SearchAnalytics.objects.update_or_create(
                date=date,
                defaults={
                    'total_searches': total_searches,
                    'unique_users': unique_users,
                    'avg_results_per_search': avg_results_per_search,
                    'avg_search_duration_ms': avg_search_duration,
                    'top_queries': top_queries,
                    'click_through_rate': click_through_rate,
                    'zero_results_rate': zero_results_rate,
                    'search_types_distribution': search_types_distribution,
                }
            )

            observability.record_metric("analytics.search.total_queries", total_searches, tags=tags)
            observability.record_metric("analytics.search.unique_users", unique_users, tags=tags)
            observability.record_metric(
                "analytics.search.click_through_rate", click_through_rate, tags=tags
            )
            observability.record_metric(
                "analytics.search.zero_results_rate", zero_results_rate, tags=tags
            )
            observability.record_metric(
                "analytics.search.avg_duration_ms", avg_search_duration, tags=tags
            )

            # Update trending queries
            update_trending_queries.delay(date.isoformat())
            observability.record_event(
                "analytics.search.processed",
                f"Processed search analytics for {date}",
                tags={**tags, "total_searches": str(total_searches)},
            )

        logger.info(f"Processed search analytics for {date}: {total_searches} searches")

    except Exception as exc:
        logger.error(f"Error processing search analytics: {exc}")
        observability.record_event(
            "analytics.search.error",
            f"Failed to process search analytics for {date_str or 'yesterday'}",
            severity="error",
            tags={"worker": "analytics.search"},
        )
        raise self.retry(exc=exc, countdown=60 * (self.request.retries + 1))


@shared_task(bind=True, max_retries=3)
def update_trending_queries(self, date_str):
    """
    Update trending search queries
    """
    try:
        from apps.search.models import SearchQuery, TrendingQuery

        date = datetime.fromisoformat(date_str).date()
        tags = {"worker": "analytics.search", "date": date.isoformat()}

        with observability.span("analytics.search.trending", tags=tags):
            # Get query counts for the date
            query_counts = SearchQuery.objects.filter(
                created_at__date=date
            ).values('query').annotate(
                search_count=models.Count('id'),
                unique_users=models.Count('user', distinct=True)
            ).order_by('-search_count')

            if not query_counts:
                observability.record_event(
                    "analytics.search.trending.empty",
                    f"No trending queries to update for {date}",
                    tags=tags,
                )
            else:
                # Update trending queries
                for query_data in query_counts:
                    TrendingQuery.objects.update_or_create(
                        query=query_data['query'],
                        period='daily',
                        date=date,
                        defaults={
                            'search_count': query_data['search_count'],
                            'unique_users': query_data['unique_users'],
                        }
                    )

            # Update weekly trending (if it's Sunday)
            if date.weekday() == 6:  # Sunday
                week_start = date - timedelta(days=6)
                weekly_queries = SearchQuery.objects.filter(
                    created_at__date__range=[week_start, date]
                ).values('query').annotate(
                    search_count=models.Count('id'),
                    unique_users=models.Count('user', distinct=True)
                ).order_by('-search_count')

                for query_data in weekly_queries:
                    TrendingQuery.objects.update_or_create(
                        query=query_data['query'],
                        period='weekly',
                        date=date,
                        defaults={
                            'search_count': query_data['search_count'],
                            'unique_users': query_data['unique_users'],
                        }
                    )

                if weekly_queries:
                    observability.record_metric(
                        "analytics.search.weekly_trending", len(weekly_queries), tags=tags
                    )

            observability.record_metric(
                "analytics.search.daily_trending", len(query_counts), tags=tags
            )
            observability.record_event(
                "analytics.search.trending_updated",
                f"Trending queries updated for {date}",
                tags=tags,
            )

        logger.info(f"Updated trending queries for {date}")

    except Exception as exc:
        logger.error(f"Error updating trending queries: {exc}")
        observability.record_event(
            "analytics.search.trending_error",
            f"Failed to update trending queries for {date_str}",
            severity="error",
            tags={"worker": "analytics.search"},
        )
        raise self.retry(exc=exc, countdown=60 * (self.request.retries + 1))


@shared_task(bind=True, max_retries=3)
def process_notification_analytics(self, date_str=None):
    """
    Process notification delivery analytics
    """
    try:
        from apps.notifications.models import (
            Notification, NotificationAnalytics, NotificationDelivery
        )

        if date_str:
            date = datetime.fromisoformat(date_str).date()
        else:
            date = timezone.now().date() - timedelta(days=1)

        tags = {"worker": "notifications.analytics", "date": date.isoformat()}

        with observability.span("notifications.analytics.process", tags=tags):
            # Get notifications for the date
            notifications = Notification.objects.filter(created_at__date=date)

            if not notifications.exists():
                logger.info(f"No notifications found for {date}")
                observability.record_event(
                    "notifications.analytics.empty",
                    f"No notification activity for {date}",
                    tags=tags,
                )
                return

            # Overall statistics
            total_sent = notifications.filter(status__in=['sent', 'delivered', 'read']).count()
            total_delivered = notifications.filter(status__in=['delivered', 'read']).count()
            total_failed = notifications.filter(status='failed').count()
            total_read = notifications.filter(is_read=True).count()

            # Channel breakdown
            deliveries = NotificationDelivery.objects.filter(
                notification__created_at__date=date
            )

            in_app_sent = deliveries.filter(channel__channel_type='in_app').count()
            email_sent = deliveries.filter(channel__channel_type='email').count()
            push_sent = deliveries.filter(channel__channel_type='push').count()
            sms_sent = deliveries.filter(channel__channel_type='sms').count()

            # Calculate rates
            delivery_rate = (total_delivered / total_sent * 100) if total_sent > 0 else 0
            read_rate = (total_read / total_delivered * 100) if total_delivered > 0 else 0
            failure_rate = (total_failed / total_sent * 100) if total_sent > 0 else 0

            # Performance metrics
            delivered_notifications = notifications.filter(
                delivered_at__isnull=False,
                sent_at__isnull=False
            )

            avg_delivery_time = 0
            if delivered_notifications.exists():
                delivery_times = [
                    (notif.delivered_at - notif.sent_at).total_seconds()
                    for notif in delivered_notifications
                ]
                avg_delivery_time = sum(delivery_times) / len(delivery_times)

            read_notifications = notifications.filter(
                read_at__isnull=False,
                delivered_at__isnull=False
            )

            avg_read_time = 0
            if read_notifications.exists():
                read_times = [
                    (notif.read_at - notif.delivered_at).total_seconds() / 60
                    for notif in read_notifications
                ]
                avg_read_time = sum(read_times) / len(read_times)

            # Process by notification type
            notification_types = notifications.values('template__notification_type').annotate(
                count=models.Count('id')
            ).distinct()

            for nt in notification_types:
                notification_type = nt['template__notification_type']
                type_notifications = notifications.filter(template__notification_type=notification_type)

                type_sent = type_notifications.filter(status__in=['sent', 'delivered', 'read']).count()
                type_delivered = type_notifications.filter(status__in=['delivered', 'read']).count()
                type_failed = type_notifications.filter(status='failed').count()
                type_read = type_notifications.filter(is_read=True).count()

                type_delivery_rate = (type_delivered / type_sent * 100) if type_sent > 0 else 0
                type_read_rate = (type_read / type_delivered * 100) if type_delivered > 0 else 0

                NotificationAnalytics.objects.update_or_create(
                    date=date,
                    notification_type=notification_type,
                    defaults={
                        'total_sent': type_sent,
                        'total_delivered': type_delivered,
                        'total_failed': type_failed,
                        'total_read': type_read,
                        'delivery_rate': type_delivery_rate,
                        'read_rate': type_read_rate,
                        'avg_delivery_time_seconds': avg_delivery_time,
                        'avg_read_time_minutes': avg_read_time,
                    }
                )

            # Overall analytics
            NotificationAnalytics.objects.update_or_create(
                date=date,
                notification_type='',  # Empty for overall stats
                defaults={
                    'total_sent': total_sent,
                    'total_delivered': total_delivered,
                    'total_failed': total_failed,
                    'total_read': total_read,
                    'in_app_sent': in_app_sent,
                    'email_sent': email_sent,
                    'push_sent': push_sent,
                    'sms_sent': sms_sent,
                    'delivery_rate': delivery_rate,
                    'read_rate': read_rate,
                    'avg_delivery_time_seconds': avg_delivery_time,
                    'avg_read_time_minutes': avg_read_time,
                }
            )

            observability.record_metric("notifications.analytics.sent", total_sent, tags=tags)
            observability.record_metric(
                "notifications.analytics.delivered", total_delivered, tags=tags
            )
            observability.record_metric("notifications.analytics.failed", total_failed, tags=tags)
            observability.record_metric("notifications.analytics.read", total_read, tags=tags)
            observability.record_metric(
                "notifications.analytics.delivery_rate", delivery_rate, tags=tags
            )
            observability.record_metric(
                "notifications.analytics.read_rate", read_rate, tags=tags
            )
            observability.record_metric(
                "notifications.analytics.failure_rate", failure_rate, tags=tags
            )
            observability.record_metric(
                "notifications.analytics.avg_delivery_time_s", avg_delivery_time, tags=tags
            )
            observability.record_metric(
                "notifications.analytics.avg_read_time_min", avg_read_time, tags=tags
            )

            severity = None
            if failure_rate >= 25:
                severity = "error"
            elif failure_rate >= 10:
                severity = "warning"

            if severity:
                observability.record_event(
                    "notifications.analytics.failure_rate",
                    f"Failure rate at {failure_rate:.2f}%",
                    severity=severity,
                    tags={**tags, "failure_rate": f"{failure_rate:.2f}"},
                )

            observability.record_event(
                "notifications.analytics.processed",
                f"Processed notification analytics for {date}",
                tags={**tags, "total_sent": str(total_sent)},
            )

        logger.info(f"Processed notification analytics for {date}: {total_sent} notifications")

    except Exception as exc:
        logger.error(f"Error processing notification analytics: {exc}")
        observability.record_event(
            "notifications.analytics.error",
            f"Failed to process notification analytics for {date_str or 'yesterday'}",
            severity="error",
            tags={"worker": "notifications.analytics"},
        )
        raise self.retry(exc=exc, countdown=60 * (self.request.retries + 1))


@shared_task(bind=True, max_retries=3)
def cleanup_expired_data(self):
    """
    Clean up expired data to maintain database performance
    """
    try:
        from apps.search.models import SearchQuery
        from apps.notifications.models import Notification
        
        cleanup_date = timezone.now() - timedelta(days=90)  # Keep 90 days
        
        # Clean up old search queries
        old_searches = SearchQuery.objects.filter(created_at__lt=cleanup_date)
        search_count = old_searches.count()
        old_searches.delete()
        
        # Clean up expired notifications
        expired_notifications = Notification.objects.filter(
            expires_at__lt=timezone.now()
        )
        notification_count = expired_notifications.count()
        expired_notifications.delete()
        
        # Clean up old cache entries
        cache.clear()
        
        logger.info(
            f"Cleaned up {search_count} old searches and "
            f"{notification_count} expired notifications"
        )
        
    except Exception as exc:
        logger.error(f"Error during cleanup: {exc}")
        raise self.retry(exc=exc, countdown=60 * (self.request.retries + 1))


@shared_task(bind=True, max_retries=3)
def optimize_database_indexes(self):
    """
    Analyze and optimize database indexes
    """
    try:
        from django.db import connection
        
        # Get slow query log data
        slow_queries = cache.get_many(cache.keys("slow_request:*"))
        
        # Analyze patterns and suggest optimizations
        optimization_suggestions = []
        
        for key, data in slow_queries.items():
            if data['query_time'] > 1000:  # > 1 second
                suggestion = {
                    'path': data['path'],
                    'query_time': data['query_time'],
                    'suggestion': 'Consider adding database indexes',
                    'timestamp': data['timestamp']
                }
                optimization_suggestions.append(suggestion)
        
        # Store optimization suggestions
        if optimization_suggestions:
            cache.set(
                'db_optimization_suggestions',
                optimization_suggestions,
                timeout=86400  # 24 hours
            )
            
            logger.info(f"Generated {len(optimization_suggestions)} optimization suggestions")
        
        # Run database maintenance if using PostgreSQL
        with connection.cursor() as cursor:
            try:
                cursor.execute("ANALYZE;")
                logger.info("Database analysis completed")
            except Exception as e:
                logger.warning(f"Could not run database analysis: {e}")
        
    except Exception as exc:
        logger.error(f"Error optimizing database: {exc}")
        raise self.retry(exc=exc, countdown=60 * (self.request.retries + 1))


@shared_task(bind=True, max_retries=3)
def generate_performance_report(self, date_str=None):
    """
    Generate daily performance report
    """
    try:
        if date_str:
            date = datetime.fromisoformat(date_str).date()
        else:
            date = timezone.now().date() - timedelta(days=1)

        tags = {"worker": "analytics.performance", "date": date.isoformat()}

        with observability.span("analytics.performance.report", tags=tags):
            # Collect performance metrics from cache
            metrics_keys = cache.keys("api_metrics:*")
            total_requests = 0
            total_response_time = 0
            slow_requests = 0

            for key in metrics_keys:
                metrics = cache.get(key, {})
                total_requests += metrics.get('request_count', 0)
                total_response_time += metrics.get('total_response_time', 0)
                slow_requests += metrics.get('slow_requests', 0)

            avg_response_time = (total_response_time / total_requests) if total_requests > 0 else 0
            slow_request_rate = (slow_requests / total_requests * 100) if total_requests > 0 else 0

            # Get database optimization suggestions
            optimization_suggestions = cache.get('db_optimization_suggestions', [])

            # Create performance report
            report = {
                'date': date.isoformat(),
                'total_requests': total_requests,
                'avg_response_time_ms': avg_response_time,
                'slow_requests': slow_requests,
                'slow_request_rate': slow_request_rate,
                'optimization_suggestions': len(optimization_suggestions),
                'generated_at': timezone.now().isoformat(),
            }

            observability.record_metric(
                "analytics.performance.total_requests", total_requests, tags=tags
            )
            observability.record_metric(
                "analytics.performance.avg_response_time_ms", avg_response_time, tags=tags
            )
            observability.record_metric(
                "analytics.performance.slow_requests", slow_requests, tags=tags
            )
            observability.record_metric(
                "analytics.performance.slow_request_rate", slow_request_rate, tags=tags
            )
            observability.record_metric(
                "analytics.performance.optimization_suggestions",
                len(optimization_suggestions),
                tags=tags,
            )
            observability.record_event(
                "analytics.performance.report_generated",
                f"Performance report generated for {date}",
                tags={**tags, "slow_request_rate": f"{slow_request_rate:.2f}"},
            )

        # Store report
        cache.set(f"performance_report:{date}", report, timeout=86400 * 7)  # 7 days

        logger.info(f"Generated performance report for {date}")
        return report

    except Exception as exc:
        logger.error(f"Error generating performance report: {exc}")
        observability.record_event(
            "analytics.performance.error",
            f"Failed to generate performance report for {date_str or 'yesterday'}",
            severity="error",
            tags={"worker": "analytics.performance"},
        )
        raise self.retry(exc=exc, countdown=60 * (self.request.retries + 1))


# Periodic task registration
@shared_task
def schedule_daily_tasks():
    """
    Schedule daily background tasks
    """
    yesterday = (timezone.now() - timedelta(days=1)).date().isoformat()
    
    # Schedule analytics processing
    process_search_analytics.delay(yesterday)
    process_notification_analytics.delay(yesterday)
    
    # Schedule maintenance tasks
    cleanup_expired_data.delay()
    optimize_database_indexes.delay()
    generate_performance_report.delay(yesterday)
    
    logger.info("Scheduled daily background tasks")


# Utility functions for task management
def get_task_status(task_id):
    """
    Get status of a background task
    """
    from celery.result import AsyncResult
    
    result = AsyncResult(task_id)
    return {
        'task_id': task_id,
        'status': result.status,
        'result': result.result,
        'traceback': result.traceback,
    }


def cancel_task(task_id):
    """
    Cancel a background task
    """
    from celery.result import AsyncResult
    
    result = AsyncResult(task_id)
    result.revoke(terminate=True)
    return True


def queue_heavy_operation(operation_name, *args, **kwargs):
    """
    Queue a heavy operation for background processing
    """
    task_map = {
        'search_analytics': process_search_analytics,
        'notification_analytics': process_notification_analytics,
        'cleanup': cleanup_expired_data,
        'optimize_db': optimize_database_indexes,
        'performance_report': generate_performance_report,
    }
    
    task = task_map.get(operation_name)
    if task:
        result = task.delay(*args, **kwargs)
        return result.id
    else:
        raise ValueError(f"Unknown operation: {operation_name}")
