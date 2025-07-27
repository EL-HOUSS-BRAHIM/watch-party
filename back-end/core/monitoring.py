"""
Advanced monitoring and alerting system
"""

import asyncio
import smtplib
import logging
import psutil
import time
import json
from datetime import timedelta, datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
from enum import Enum
from django.conf import settings
from django.core.cache import cache
from django.utils import timezone
from django.core.mail import send_mail
from django.db import connection
from django.template.loader import render_to_string

logger = logging.getLogger(__name__)


class AlertSeverity(Enum):
    """Alert severity levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class AlertChannel(Enum):
    """Alert notification channels"""
    EMAIL = "email"
    SLACK = "slack"
    DISCORD = "discord"
    WEBHOOK = "webhook"
    SMS = "sms"


@dataclass
class Alert:
    """Alert data structure"""
    id: str
    title: str
    message: str
    severity: AlertSeverity
    component: str
    metric_name: str
    current_value: float
    threshold_value: float
    timestamp: datetime
    resolved: bool = False
    resolved_at: Optional[datetime] = None
    metadata: Dict[str, Any] = None


@dataclass
class MetricThreshold:
    """Metric threshold configuration"""
    metric_name: str
    warning_threshold: float
    critical_threshold: float
    comparison: str  # 'gt', 'lt', 'eq'
    enabled: bool = True
    check_interval: int = 60  # seconds
    description: str = ""


@dataclass
class MonitoringRule:
    """Monitoring rule configuration"""
    name: str
    component: str
    thresholds: List[MetricThreshold]
    alert_channels: List[AlertChannel]
    cooldown_minutes: int = 15
    enabled: bool = True


class SystemMetricsCollector:
    """Collect system-level metrics"""
    
    def get_cpu_metrics(self) -> Dict[str, float]:
        """Get CPU-related metrics"""
        return {
            'cpu_percent': psutil.cpu_percent(interval=1),
            'cpu_count': psutil.cpu_count(),
            'load_avg_1min': psutil.getloadavg()[0] if hasattr(psutil, 'getloadavg') else 0,
            'load_avg_5min': psutil.getloadavg()[1] if hasattr(psutil, 'getloadavg') else 0,
            'load_avg_15min': psutil.getloadavg()[2] if hasattr(psutil, 'getloadavg') else 0,
        }
    
    def get_memory_metrics(self) -> Dict[str, float]:
        """Get memory-related metrics"""
        memory = psutil.virtual_memory()
        swap = psutil.swap_memory()
        
        return {
            'memory_percent': memory.percent,
            'memory_available_gb': memory.available / (1024**3),
            'memory_used_gb': memory.used / (1024**3),
            'memory_total_gb': memory.total / (1024**3),
            'swap_percent': swap.percent,
            'swap_used_gb': swap.used / (1024**3),
            'swap_total_gb': swap.total / (1024**3),
        }
    
    def get_disk_metrics(self) -> Dict[str, float]:
        """Get disk-related metrics"""
        disk_usage = psutil.disk_usage('/')
        disk_io = psutil.disk_io_counters()
        
        metrics = {
            'disk_percent': disk_usage.percent,
            'disk_used_gb': disk_usage.used / (1024**3),
            'disk_free_gb': disk_usage.free / (1024**3),
            'disk_total_gb': disk_usage.total / (1024**3),
        }
        
        if disk_io:
            metrics.update({
                'disk_read_bytes': disk_io.read_bytes,
                'disk_write_bytes': disk_io.write_bytes,
                'disk_read_count': disk_io.read_count,
                'disk_write_count': disk_io.write_count,
            })
        
        return metrics
    
    def get_network_metrics(self) -> Dict[str, float]:
        """Get network-related metrics"""
        net_io = psutil.net_io_counters()
        net_connections = len(psutil.net_connections())
        
        return {
            'network_bytes_sent': net_io.bytes_sent,
            'network_bytes_recv': net_io.bytes_recv,
            'network_packets_sent': net_io.packets_sent,
            'network_packets_recv': net_io.packets_recv,
            'network_connections_count': net_connections,
        }
    
    def get_process_metrics(self) -> Dict[str, float]:
        """Get process-related metrics"""
        processes = list(psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent']))
        
        python_processes = [p for p in processes if 'python' in p.info['name'].lower()]
        total_processes = len(processes)
        
        return {
            'total_processes': total_processes,
            'python_processes': len(python_processes),
            'zombie_processes': len([p for p in processes if p.info.get('status') == 'zombie']),
        }


class DatabaseMetricsCollector:
    """Collect database-related metrics"""
    
    def get_connection_metrics(self) -> Dict[str, float]:
        """Get database connection metrics"""
        try:
            with connection.cursor() as cursor:
                # Get connection count
                cursor.execute("SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'active';")
                active_connections = cursor.fetchone()[0]
                
                # Get database size
                cursor.execute("SELECT pg_database_size(current_database());")
                db_size_bytes = cursor.fetchone()[0]
                
                # Get table sizes
                cursor.execute("""
                    SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
                    FROM pg_tables 
                    WHERE schemaname = 'public' 
                    ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC 
                    LIMIT 5;
                """)
                table_sizes = cursor.fetchall()
                
                return {
                    'db_active_connections': active_connections,
                    'db_size_gb': db_size_bytes / (1024**3),
                    'db_largest_tables': len(table_sizes),
                }
        except Exception as e:
            logger.error(f"Failed to collect database metrics: {e}")
            return {
                'db_active_connections': 0,
                'db_size_gb': 0,
                'db_largest_tables': 0,
            }
    
    def get_query_performance_metrics(self) -> Dict[str, float]:
        """Get query performance metrics"""
        try:
            with connection.cursor() as cursor:
                # Get slow queries count
                cursor.execute("""
                    SELECT COUNT(*) FROM pg_stat_statements 
                    WHERE mean_time > 1000;  -- queries taking more than 1 second
                """)
                slow_queries = cursor.fetchone()[0] if cursor.fetchone() else 0
                
                # Get index usage
                cursor.execute("""
                    SELECT 
                        schemaname,
                        tablename,
                        attname,
                        n_distinct,
                        correlation
                    FROM pg_stats
                    WHERE schemaname = 'public'
                    LIMIT 5;
                """)
                
                return {
                    'db_slow_queries': slow_queries,
                    'db_query_efficiency': 95.0,  # Simplified metric
                }
        except Exception as e:
            logger.error(f"Failed to collect query performance metrics: {e}")
            return {
                'db_slow_queries': 0,
                'db_query_efficiency': 100.0,
            }


class ApplicationMetricsCollector:
    """Collect application-specific metrics"""
    
    def get_user_activity_metrics(self) -> Dict[str, float]:
        """Get user activity metrics"""
        try:
            from django.contrib.auth import get_user_model
            from apps.parties.models import WatchParty
            from apps.videos.models import Video
            
            User = get_user_model()
            
            # Active users in last 24 hours
            day_ago = timezone.now() - timedelta(days=1)
            active_users_24h = User.objects.filter(last_login__gte=day_ago).count()
            
            # Active parties
            active_parties = WatchParty.objects.filter(is_active=True).count()
            
            # Recent video uploads
            recent_uploads = Video.objects.filter(created_at__gte=day_ago).count()
            
            return {
                'active_users_24h': active_users_24h,
                'active_parties': active_parties,
                'video_uploads_24h': recent_uploads,
                'total_users': User.objects.count(),
                'total_videos': Video.objects.count(),
            }
        except Exception as e:
            logger.error(f"Failed to collect user activity metrics: {e}")
            return {
                'active_users_24h': 0,
                'active_parties': 0,
                'video_uploads_24h': 0,
                'total_users': 0,
                'total_videos': 0,
            }
    
    def get_api_metrics(self) -> Dict[str, float]:
        """Get API performance metrics"""
        try:
            # Get cached API metrics if available
            api_metrics = cache.get('api_performance_metrics', {})
            
            return {
                'api_avg_response_time': api_metrics.get('avg_response_time', 0),
                'api_requests_per_minute': api_metrics.get('requests_per_minute', 0),
                'api_error_rate': api_metrics.get('error_rate', 0),
                'api_cache_hit_rate': api_metrics.get('cache_hit_rate', 0),
            }
        except Exception as e:
            logger.error(f"Failed to collect API metrics: {e}")
            return {
                'api_avg_response_time': 0,
                'api_requests_per_minute': 0,
                'api_error_rate': 0,
                'api_cache_hit_rate': 0,
            }


class AlertManager:
    """Manage alerts and notifications"""
    
    def __init__(self):
        self.active_alerts: Dict[str, Alert] = {}
        self.alert_history: List[Alert] = []
        self.notification_channels = {
            AlertChannel.EMAIL: self._send_email_alert,
            AlertChannel.SLACK: self._send_slack_alert,
            AlertChannel.DISCORD: self._send_discord_alert,
            AlertChannel.WEBHOOK: self._send_webhook_alert,
        }
    
    def create_alert(self, title: str, message: str, severity: AlertSeverity, 
                    component: str, metric_name: str, current_value: float,
                    threshold_value: float, metadata: Dict[str, Any] = None) -> Alert:
        """Create a new alert"""
        alert_id = f"{component}_{metric_name}_{int(time.time())}"
        
        alert = Alert(
            id=alert_id,
            title=title,
            message=message,
            severity=severity,
            component=component,
            metric_name=metric_name,
            current_value=current_value,
            threshold_value=threshold_value,
            timestamp=timezone.now(),
            metadata=metadata or {}
        )
        
        self.active_alerts[alert_id] = alert
        self.alert_history.append(alert)
        
        return alert
    
    def resolve_alert(self, alert_id: str) -> bool:
        """Resolve an active alert"""
        if alert_id in self.active_alerts:
            alert = self.active_alerts[alert_id]
            alert.resolved = True
            alert.resolved_at = timezone.now()
            del self.active_alerts[alert_id]
            return True
        return False
    
    async def send_alert(self, alert: Alert, channels: List[AlertChannel]):
        """Send alert through specified channels"""
        for channel in channels:
            if channel in self.notification_channels:
                try:
                    await self.notification_channels[channel](alert)
                except Exception as e:
                    logger.error(f"Failed to send alert via {channel.value}: {e}")
    
    async def _send_email_alert(self, alert: Alert):
        """Send alert via email"""
        try:
            subject = f"[{alert.severity.value.upper()}] {alert.title}"
            
            html_content = render_to_string('emails/alert_notification.html', {
                'alert': alert,
                'severity_color': {
                    AlertSeverity.LOW: '#28a745',
                    AlertSeverity.MEDIUM: '#ffc107',
                    AlertSeverity.HIGH: '#fd7e14',
                    AlertSeverity.CRITICAL: '#dc3545'
                }.get(alert.severity, '#6c757d')
            })
            
            send_mail(
                subject=subject,
                message=alert.message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[settings.ADMIN_EMAIL],
                html_message=html_content,
                fail_silently=False
            )
        except Exception as e:
            logger.error(f"Failed to send email alert: {e}")
    
    async def _send_slack_alert(self, alert: Alert):
        """Send alert via Slack webhook"""
        if not hasattr(settings, 'SLACK_WEBHOOK_URL'):
            return
        
        import aiohttp
        
        color_map = {
            AlertSeverity.LOW: 'good',
            AlertSeverity.MEDIUM: 'warning',
            AlertSeverity.HIGH: 'danger',
            AlertSeverity.CRITICAL: 'danger'
        }
        
        payload = {
            "attachments": [
                {
                    "color": color_map.get(alert.severity, 'warning'),
                    "title": alert.title,
                    "text": alert.message,
                    "fields": [
                        {
                            "title": "Component",
                            "value": alert.component,
                            "short": True
                        },
                        {
                            "title": "Severity",
                            "value": alert.severity.value.upper(),
                            "short": True
                        },
                        {
                            "title": "Current Value",
                            "value": str(alert.current_value),
                            "short": True
                        },
                        {
                            "title": "Threshold",
                            "value": str(alert.threshold_value),
                            "short": True
                        }
                    ],
                    "timestamp": alert.timestamp.timestamp()
                }
            ]
        }
        
        async with aiohttp.ClientSession() as session:
            await session.post(settings.SLACK_WEBHOOK_URL, json=payload)
    
    async def _send_discord_alert(self, alert: Alert):
        """Send alert via Discord webhook"""
        if not hasattr(settings, 'DISCORD_WEBHOOK_URL'):
            return
        
        import aiohttp
        
        color_map = {
            AlertSeverity.LOW: 0x28a745,
            AlertSeverity.MEDIUM: 0xffc107,
            AlertSeverity.HIGH: 0xfd7e14,
            AlertSeverity.CRITICAL: 0xdc3545
        }
        
        embed = {
            "title": alert.title,
            "description": alert.message,
            "color": color_map.get(alert.severity, 0x6c757d),
            "fields": [
                {"name": "Component", "value": alert.component, "inline": True},
                {"name": "Severity", "value": alert.severity.value.upper(), "inline": True},
                {"name": "Current Value", "value": str(alert.current_value), "inline": True},
                {"name": "Threshold", "value": str(alert.threshold_value), "inline": True},
            ],
            "timestamp": alert.timestamp.isoformat()
        }
        
        payload = {"embeds": [embed]}
        
        async with aiohttp.ClientSession() as session:
            await session.post(settings.DISCORD_WEBHOOK_URL, json=payload)
    
    async def _send_webhook_alert(self, alert: Alert):
        """Send alert via custom webhook"""
        if not hasattr(settings, 'CUSTOM_ALERT_WEBHOOK_URL'):
            return
        
        import aiohttp
        
        payload = {
            "alert": asdict(alert),
            "timestamp": alert.timestamp.isoformat(),
            "severity": alert.severity.value,
            "component": alert.component
        }
        
        async with aiohttp.ClientSession() as session:
            await session.post(settings.CUSTOM_ALERT_WEBHOOK_URL, json=payload)


class MonitoringEngine:
    """Main monitoring engine that coordinates metrics collection and alerting"""
    
    def __init__(self):
        self.system_collector = SystemMetricsCollector()
        self.database_collector = DatabaseMetricsCollector()
        self.app_collector = ApplicationMetricsCollector()
        self.alert_manager = AlertManager()
        self.monitoring_rules = self._load_monitoring_rules()
        self.is_running = False
    
    def _load_monitoring_rules(self) -> List[MonitoringRule]:
        """Load monitoring rules configuration"""
        return [
            MonitoringRule(
                name="CPU Monitoring",
                component="system",
                thresholds=[
                    MetricThreshold("cpu_percent", 70.0, 90.0, "gt", description="CPU usage percentage"),
                    MetricThreshold("load_avg_1min", 2.0, 4.0, "gt", description="1-minute load average"),
                ],
                alert_channels=[AlertChannel.EMAIL, AlertChannel.SLACK],
                cooldown_minutes=15
            ),
            MonitoringRule(
                name="Memory Monitoring",
                component="system",
                thresholds=[
                    MetricThreshold("memory_percent", 80.0, 95.0, "gt", description="Memory usage percentage"),
                    MetricThreshold("memory_available_gb", 1.0, 0.5, "lt", description="Available memory in GB"),
                ],
                alert_channels=[AlertChannel.EMAIL, AlertChannel.DISCORD],
                cooldown_minutes=10
            ),
            MonitoringRule(
                name="Disk Monitoring",
                component="system",
                thresholds=[
                    MetricThreshold("disk_percent", 85.0, 95.0, "gt", description="Disk usage percentage"),
                    MetricThreshold("disk_free_gb", 5.0, 1.0, "lt", description="Free disk space in GB"),
                ],
                alert_channels=[AlertChannel.EMAIL],
                cooldown_minutes=30
            ),
            MonitoringRule(
                name="Database Monitoring",
                component="database",
                thresholds=[
                    MetricThreshold("db_active_connections", 50, 80, "gt", description="Active database connections"),
                    MetricThreshold("db_slow_queries", 10, 25, "gt", description="Number of slow queries"),
                ],
                alert_channels=[AlertChannel.EMAIL, AlertChannel.WEBHOOK],
                cooldown_minutes=20
            ),
            MonitoringRule(
                name="Application Monitoring",
                component="application",
                thresholds=[
                    MetricThreshold("api_avg_response_time", 2000.0, 5000.0, "gt", description="Average API response time (ms)"),
                    MetricThreshold("api_error_rate", 5.0, 10.0, "gt", description="API error rate percentage"),
                ],
                alert_channels=[AlertChannel.EMAIL, AlertChannel.SLACK],
                cooldown_minutes=10
            ),
        ]
    
    async def collect_all_metrics(self) -> Dict[str, Dict[str, float]]:
        """Collect all metrics from different sources"""
        try:
            metrics = {
                'system': {
                    **self.system_collector.get_cpu_metrics(),
                    **self.system_collector.get_memory_metrics(),
                    **self.system_collector.get_disk_metrics(),
                    **self.system_collector.get_network_metrics(),
                    **self.system_collector.get_process_metrics(),
                },
                'database': {
                    **self.database_collector.get_connection_metrics(),
                    **self.database_collector.get_query_performance_metrics(),
                },
                'application': {
                    **self.app_collector.get_user_activity_metrics(),
                    **self.app_collector.get_api_metrics(),
                }
            }
            
            # Store metrics in cache for API access
            cache.set('latest_monitoring_metrics', metrics, timeout=300)
            
            return metrics
        except Exception as e:
            logger.error(f"Failed to collect metrics: {e}")
            return {}
    
    async def check_thresholds(self, metrics: Dict[str, Dict[str, float]]):
        """Check all thresholds and create alerts if needed"""
        for rule in self.monitoring_rules:
            if not rule.enabled:
                continue
            
            component_metrics = metrics.get(rule.component, {})
            
            for threshold in rule.thresholds:
                if not threshold.enabled or threshold.metric_name not in component_metrics:
                    continue
                
                current_value = component_metrics[threshold.metric_name]
                
                # Check if alert should be triggered
                should_alert = False
                severity = None
                threshold_value = None
                
                if threshold.comparison == 'gt':
                    if current_value > threshold.critical_threshold:
                        should_alert = True
                        severity = AlertSeverity.CRITICAL
                        threshold_value = threshold.critical_threshold
                    elif current_value > threshold.warning_threshold:
                        should_alert = True
                        severity = AlertSeverity.HIGH
                        threshold_value = threshold.warning_threshold
                elif threshold.comparison == 'lt':
                    if current_value < threshold.critical_threshold:
                        should_alert = True
                        severity = AlertSeverity.CRITICAL
                        threshold_value = threshold.critical_threshold
                    elif current_value < threshold.warning_threshold:
                        should_alert = True
                        severity = AlertSeverity.HIGH
                        threshold_value = threshold.warning_threshold
                
                if should_alert:
                    # Check cooldown
                    cooldown_key = f"alert_cooldown_{rule.component}_{threshold.metric_name}"
                    if cache.get(cooldown_key):
                        continue
                    
                    # Create and send alert
                    alert = self.alert_manager.create_alert(
                        title=f"{rule.name}: {threshold.description}",
                        message=f"Metric {threshold.metric_name} is {current_value:.2f}, threshold: {threshold_value:.2f}",
                        severity=severity,
                        component=rule.component,
                        metric_name=threshold.metric_name,
                        current_value=current_value,
                        threshold_value=threshold_value,
                        metadata={
                            'rule_name': rule.name,
                            'comparison': threshold.comparison,
                            'all_metrics': component_metrics
                        }
                    )
                    
                    await self.alert_manager.send_alert(alert, rule.alert_channels)
                    
                    # Set cooldown
                    cache.set(cooldown_key, True, timeout=rule.cooldown_minutes * 60)
    
    async def run_monitoring_cycle(self):
        """Run a single monitoring cycle"""
        try:
            # Collect metrics
            metrics = await self.collect_all_metrics()
            
            # Check thresholds
            await self.check_thresholds(metrics)
            
            logger.info("Monitoring cycle completed successfully")
        except Exception as e:
            logger.error(f"Monitoring cycle failed: {e}")
    
    async def start_monitoring(self, interval: int = 60):
        """Start continuous monitoring"""
        self.is_running = True
        logger.info("Starting monitoring engine...")
        
        while self.is_running:
            await self.run_monitoring_cycle()
            await asyncio.sleep(interval)
    
    def stop_monitoring(self):
        """Stop monitoring"""
        self.is_running = False
        logger.info("Monitoring engine stopped")
    
    def get_alert_summary(self) -> Dict[str, Any]:
        """Get summary of active alerts"""
        active_alerts = list(self.alert_manager.active_alerts.values())
        
        return {
            'total_active_alerts': len(active_alerts),
            'alerts_by_severity': {
                severity.value: len([a for a in active_alerts if a.severity == severity])
                for severity in AlertSeverity
            },
            'alerts_by_component': {
                component: len([a for a in active_alerts if a.component == component])
                for component in set(a.component for a in active_alerts)
            },
            'latest_alerts': [asdict(alert) for alert in active_alerts[-10:]],
        }


# Global monitoring engine instance
monitoring_engine = MonitoringEngine()
