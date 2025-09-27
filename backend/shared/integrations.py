"""
Advanced integration framework for third-party services
"""

import aiohttp
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
from dataclasses import dataclass
from enum import Enum
from django.conf import settings
from django.core.cache import cache
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)


class IntegrationType(Enum):
    """Types of integrations supported"""
    STREAMING = "streaming"
    SOCIAL = "social"
    PAYMENT = "payment"
    ANALYTICS = "analytics"
    CONTENT = "content"
    NOTIFICATION = "notification"


@dataclass
class IntegrationConfig:
    """Configuration for an integration"""
    name: str
    type: IntegrationType
    api_key: str
    api_secret: Optional[str] = None
    base_url: str = ""
    timeout: int = 30
    rate_limit: int = 100  # requests per minute
    enabled: bool = True
    webhook_url: Optional[str] = None
    extra_config: Dict[str, Any] = None


class BaseIntegration(ABC):
    """Base class for all integrations"""
    
    def __init__(self, config: IntegrationConfig):
        self.config = config
        self.session = None
        self._rate_limit_key = f"integration_rate_limit_{config.name}"
    
    async def __aenter__(self):
        """Async context manager entry"""
        self.session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=self.config.timeout),
            headers=self.get_default_headers()
        )
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        if self.session:
            await self.session.close()
    
    def get_default_headers(self) -> Dict[str, str]:
        """Get default headers for API requests"""
        return {
            'User-Agent': 'WatchParty/1.0',
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.config.api_key}'
        }
    
    def check_rate_limit(self) -> bool:
        """Check if rate limit allows the request"""
        current_count = cache.get(self._rate_limit_key, 0)
        if current_count >= self.config.rate_limit:
            return False
        
        cache.set(self._rate_limit_key, current_count + 1, timeout=60)
        return True
    
    async def make_request(self, method: str, endpoint: str, **kwargs) -> Dict[str, Any]:
        """Make an API request with error handling"""
        if not self.check_rate_limit():
            raise IntegrationError("Rate limit exceeded")
        
        url = f"{self.config.base_url.rstrip('/')}/{endpoint.lstrip('/')}"
        
        try:
            async with self.session.request(method, url, **kwargs) as response:
                response.raise_for_status()
                return await response.json()
        except aiohttp.ClientError as e:
            logger.error(f"Integration {self.config.name} request failed: {e}")
            raise IntegrationError(f"Request failed: {e}")
        except Exception as e:
            logger.error(f"Unexpected error in integration {self.config.name}: {e}")
            raise IntegrationError(f"Unexpected error: {e}")
    
    @abstractmethod
    async def test_connection(self) -> bool:
        """Test the integration connection"""
    
    @abstractmethod
    async def get_capabilities(self) -> List[str]:
        """Get list of capabilities this integration supports"""


class IntegrationError(Exception):
    """Custom exception for integration errors"""


class StreamingIntegration(BaseIntegration):
    """Integration for streaming services like YouTube, Twitch, etc."""
    
    async def test_connection(self) -> bool:
        """Test streaming service connection"""
        try:
            result = await self.make_request('GET', '/api/v1/user')
            return 'id' in result
        except:
            return False
    
    async def get_capabilities(self) -> List[str]:
        """Get streaming capabilities"""
        return ['upload_video', 'stream_live', 'get_analytics', 'manage_playlists']
    
    async def upload_video(self, video_data: Dict[str, Any]) -> Dict[str, Any]:
        """Upload video to streaming service"""
        payload = {
            'title': video_data.get('title'),
            'description': video_data.get('description'),
            'tags': video_data.get('tags', []),
            'privacy': video_data.get('privacy', 'private'),
            'video_url': video_data.get('video_url')
        }
        
        return await self.make_request('POST', '/api/v1/videos', json=payload)
    
    async def get_video_analytics(self, video_id: str) -> Dict[str, Any]:
        """Get analytics for a specific video"""
        return await self.make_request('GET', f'/api/v1/videos/{video_id}/analytics')
    
    async def create_live_stream(self, stream_config: Dict[str, Any]) -> Dict[str, Any]:
        """Create a live stream"""
        payload = {
            'title': stream_config.get('title'),
            'description': stream_config.get('description'),
            'privacy': stream_config.get('privacy', 'private'),
            'quality': stream_config.get('quality', '720p')
        }
        
        return await self.make_request('POST', '/api/v1/streams', json=payload)


class SocialIntegration(BaseIntegration):
    """Integration for social media platforms"""
    
    async def test_connection(self) -> bool:
        """Test social media connection"""
        try:
            result = await self.make_request('GET', '/me')
            return 'id' in result
        except:
            return False
    
    async def get_capabilities(self) -> List[str]:
        """Get social media capabilities"""
        return ['post_update', 'share_content', 'get_profile', 'get_friends']
    
    async def post_update(self, content: str, media_url: Optional[str] = None) -> Dict[str, Any]:
        """Post an update to social media"""
        payload = {
            'message': content,
            'media_url': media_url
        }
        
        return await self.make_request('POST', '/posts', json=payload)
    
    async def share_party(self, party_data: Dict[str, Any]) -> Dict[str, Any]:
        """Share a watch party on social media"""
        content = f"Join me for a watch party: {party_data.get('title')}! {party_data.get('invite_url')}"
        return await self.post_update(content)
    
    async def get_profile_info(self) -> Dict[str, Any]:
        """Get user profile information"""
        return await self.make_request('GET', '/me')


class PaymentIntegration(BaseIntegration):
    """Integration for payment processors"""
    
    async def test_connection(self) -> bool:
        """Test payment processor connection"""
        try:
            result = await self.make_request('GET', '/account')
            return 'account_id' in result
        except:
            return False
    
    async def get_capabilities(self) -> List[str]:
        """Get payment capabilities"""
        return ['process_payment', 'create_subscription', 'refund_payment', 'get_transactions']
    
    async def create_payment_intent(self, amount: int, currency: str = 'usd') -> Dict[str, Any]:
        """Create a payment intent"""
        payload = {
            'amount': amount,
            'currency': currency,
            'payment_method_types': ['card', 'paypal']
        }
        
        return await self.make_request('POST', '/payment_intents', json=payload)
    
    async def create_subscription(self, customer_id: str, plan_id: str) -> Dict[str, Any]:
        """Create a subscription"""
        payload = {
            'customer': customer_id,
            'plan': plan_id,
            'payment_behavior': 'default_incomplete'
        }
        
        return await self.make_request('POST', '/subscriptions', json=payload)
    
    async def process_refund(self, payment_id: str, amount: Optional[int] = None) -> Dict[str, Any]:
        """Process a refund"""
        payload = {
            'payment_intent': payment_id
        }
        if amount:
            payload['amount'] = amount
        
        return await self.make_request('POST', '/refunds', json=payload)


class AnalyticsIntegration(BaseIntegration):
    """Integration for analytics services"""
    
    async def test_connection(self) -> bool:
        """Test analytics service connection"""
        try:
            result = await self.make_request('GET', '/account/summary')
            return 'account_id' in result
        except:
            return False
    
    async def get_capabilities(self) -> List[str]:
        """Get analytics capabilities"""
        return ['track_event', 'track_pageview', 'get_reports', 'create_funnel']
    
    async def track_event(self, event_name: str, properties: Dict[str, Any]) -> Dict[str, Any]:
        """Track an analytics event"""
        payload = {
            'event': event_name,
            'properties': properties,
            'timestamp': timezone.now().isoformat()
        }
        
        return await self.make_request('POST', '/track', json=payload)
    
    async def track_pageview(self, page_url: str, user_id: str) -> Dict[str, Any]:
        """Track a page view"""
        payload = {
            'page': page_url,
            'user_id': user_id,
            'timestamp': timezone.now().isoformat()
        }
        
        return await self.make_request('POST', '/pageview', json=payload)
    
    async def get_analytics_report(self, report_type: str, date_range: Dict[str, str]) -> Dict[str, Any]:
        """Get analytics report"""
        params = {
            'type': report_type,
            'start_date': date_range.get('start'),
            'end_date': date_range.get('end')
        }
        
        return await self.make_request('GET', '/reports', params=params)


class IntegrationManager:
    """Manager for all integrations"""
    
    def __init__(self):
        self.integrations: Dict[str, BaseIntegration] = {}
        self.configs: Dict[str, IntegrationConfig] = {}
    
    def register_integration(self, integration_class: type, config: IntegrationConfig):
        """Register a new integration"""
        if not config.enabled:
            logger.info(f"Integration {config.name} is disabled, skipping registration")
            return
        
        integration = integration_class(config)
        self.integrations[config.name] = integration
        self.configs[config.name] = config
        
        logger.info(f"Registered integration: {config.name} ({config.type.value})")
    
    async def test_all_integrations(self) -> Dict[str, bool]:
        """Test all registered integrations"""
        results = {}
        
        for name, integration in self.integrations.items():
            try:
                async with integration:
                    results[name] = await integration.test_connection()
            except Exception as e:
                logger.error(f"Failed to test integration {name}: {e}")
                results[name] = False
        
        return results
    
    async def get_integration_capabilities(self) -> Dict[str, List[str]]:
        """Get capabilities of all integrations"""
        capabilities = {}
        
        for name, integration in self.integrations.items():
            try:
                async with integration:
                    capabilities[name] = await integration.get_capabilities()
            except Exception as e:
                logger.error(f"Failed to get capabilities for {name}: {e}")
                capabilities[name] = []
        
        return capabilities
    
    def get_integrations_by_type(self, integration_type: IntegrationType) -> List[BaseIntegration]:
        """Get all integrations of a specific type"""
        return [
            integration for name, integration in self.integrations.items()
            if self.configs[name].type == integration_type
        ]
    
    async def execute_integration_action(self, integration_name: str, action: str, **kwargs) -> Dict[str, Any]:
        """Execute an action on a specific integration"""
        if integration_name not in self.integrations:
            raise IntegrationError(f"Integration {integration_name} not found")
        
        integration = self.integrations[integration_name]
        
        if not hasattr(integration, action):
            raise IntegrationError(f"Action {action} not supported by {integration_name}")
        
        try:
            async with integration:
                method = getattr(integration, action)
                return await method(**kwargs)
        except Exception as e:
            logger.error(f"Failed to execute {action} on {integration_name}: {e}")
            raise IntegrationError(f"Action failed: {e}")


# Global integration manager instance
integration_manager = IntegrationManager()


def setup_default_integrations():
    """Setup default integrations from settings"""
    
    # YouTube integration
    if hasattr(settings, 'YOUTUBE_API_KEY') and settings.YOUTUBE_API_KEY:
        youtube_config = IntegrationConfig(
            name='youtube',
            type=IntegrationType.STREAMING,
            api_key=settings.YOUTUBE_API_KEY,
            base_url='https://www.googleapis.com/youtube/v3',
            rate_limit=10000  # YouTube quota
        )
        integration_manager.register_integration(StreamingIntegration, youtube_config)
    
    # Twitter integration
    if hasattr(settings, 'TWITTER_API_KEY') and settings.TWITTER_API_KEY:
        twitter_config = IntegrationConfig(
            name='twitter',
            type=IntegrationType.SOCIAL,
            api_key=settings.TWITTER_API_KEY,
            api_secret=getattr(settings, 'TWITTER_API_SECRET', None),
            base_url='https://api.twitter.com/2',
            rate_limit=300  # Twitter rate limit
        )
        integration_manager.register_integration(SocialIntegration, twitter_config)
    
    # Stripe integration
    if hasattr(settings, 'STRIPE_SECRET_KEY') and settings.STRIPE_SECRET_KEY:
        stripe_config = IntegrationConfig(
            name='stripe',
            type=IntegrationType.PAYMENT,
            api_key=settings.STRIPE_SECRET_KEY,
            base_url='https://api.stripe.com/v1',
            rate_limit=1000  # Stripe rate limit
        )
        integration_manager.register_integration(PaymentIntegration, stripe_config)
    
    # Google Analytics integration
    if hasattr(settings, 'GOOGLE_ANALYTICS_API_KEY') and settings.GOOGLE_ANALYTICS_API_KEY:
        ga_config = IntegrationConfig(
            name='google_analytics',
            type=IntegrationType.ANALYTICS,
            api_key=settings.GOOGLE_ANALYTICS_API_KEY,
            base_url='https://analyticsreporting.googleapis.com/v4',
            rate_limit=2000  # GA rate limit
        )
        integration_manager.register_integration(AnalyticsIntegration, ga_config)


async def broadcast_to_social_media(party_data: Dict[str, Any]) -> Dict[str, Any]:
    """Broadcast party information to all connected social media"""
    social_integrations = integration_manager.get_integrations_by_type(IntegrationType.SOCIAL)
    results = {}
    
    for integration in social_integrations:
        try:
            async with integration:
                result = await integration.share_party(party_data)
                results[integration.config.name] = {
                    'success': True,
                    'post_id': result.get('id'),
                    'url': result.get('url')
                }
        except Exception as e:
            logger.error(f"Failed to share on {integration.config.name}: {e}")
            results[integration.config.name] = {
                'success': False,
                'error': str(e)
            }
    
    return results


async def track_analytics_event(event_name: str, properties: Dict[str, Any]) -> Dict[str, Any]:
    """Track event across all analytics integrations"""
    analytics_integrations = integration_manager.get_integrations_by_type(IntegrationType.ANALYTICS)
    results = {}
    
    for integration in analytics_integrations:
        try:
            async with integration:
                result = await integration.track_event(event_name, properties)
                results[integration.config.name] = {
                    'success': True,
                    'event_id': result.get('id')
                }
        except Exception as e:
            logger.error(f"Failed to track event on {integration.config.name}: {e}")
            results[integration.config.name] = {
                'success': False,
                'error': str(e)
            }
    
    return results


# Initialize default integrations when module is imported
try:
    setup_default_integrations()
except Exception as e:
    logger.warning(f"Failed to setup default integrations: {e}")
