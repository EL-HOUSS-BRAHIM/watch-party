import requests
import logging
from datetime import datetime, timedelta
from typing import Dict, Optional
from urllib.parse import urlencode, parse_qs, urlparse

from django.conf import settings
from django.utils import timezone

from ..models import SocialOAuthProvider, UserServiceConnection

logger = logging.getLogger(__name__)


class SocialOAuthService:
    """Service for social OAuth integrations (Google, Discord, GitHub)"""
    
    # Provider configurations
    PROVIDER_CONFIGS = {
        'google': {
            'auth_url': 'https://accounts.google.com/o/oauth2/v2/auth',
            'token_url': 'https://oauth2.googleapis.com/token',
            'user_info_url': 'https://www.googleapis.com/oauth2/v2/userinfo',
            'scopes': ['openid', 'email', 'profile']
        },
        'discord': {
            'auth_url': 'https://discord.com/api/oauth2/authorize',
            'token_url': 'https://discord.com/api/oauth2/token',
            'user_info_url': 'https://discord.com/api/users/@me',
            'scopes': ['identify', 'email']
        },
        'github': {
            'auth_url': 'https://github.com/login/oauth/authorize',
            'token_url': 'https://github.com/login/oauth/access_token',
            'user_info_url': 'https://api.github.com/user',
            'scopes': ['user:email', 'read:user']
        }
    }
    
    def __init__(self, provider: str):
        """Initialize OAuth service for specific provider"""
        self.provider_name = provider
        self.provider_config = self.PROVIDER_CONFIGS.get(provider)
        if not self.provider_config:
            raise ValueError(f"Unsupported OAuth provider: {provider}")
        
        # Get provider configuration from database
        try:
            self.provider_db = SocialOAuthProvider.objects.get(
                provider=provider,
                is_active=True
            )
        except SocialOAuthProvider.DoesNotExist:
            raise Exception(f"OAuth provider '{provider}' not configured in database")
    
    def get_authorization_url(self, redirect_uri: str, state: str = None) -> str:
        """Generate OAuth authorization URL"""
        params = {
            'client_id': self.provider_db.client_id,
            'response_type': 'code',
            'scope': self.provider_db.scope or ' '.join(self.provider_config['scopes']),
            'redirect_uri': redirect_uri,
        }
        
        if state:
            params['state'] = state
        
        # Provider-specific parameters
        if self.provider_name == 'google':
            params['access_type'] = 'offline'
            params['prompt'] = 'consent'
        elif self.provider_name == 'discord':
            params['permissions'] = '0'
        
        return f"{self.provider_config['auth_url']}?{urlencode(params)}"
    
    def exchange_code_for_tokens(self, code: str, redirect_uri: str) -> Dict:
        """Exchange authorization code for access tokens"""
        token_data = {
            'client_id': self.provider_db.client_id,
            'client_secret': self.provider_db.client_secret,
            'code': code,
            'grant_type': 'authorization_code',
            'redirect_uri': redirect_uri,
        }
        
        headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded'
        }
        
        # GitHub requires different Accept header
        if self.provider_name == 'github':
            headers['Accept'] = 'application/json'
        
        try:
            response = requests.post(
                self.provider_config['token_url'],
                data=token_data,
                headers=headers
            )
            response.raise_for_status()
            
            token_response = response.json()
            
            # Validate response
            if 'access_token' not in token_response:
                logger.error(f"No access token in response: {token_response}")
                raise Exception("No access token received")
            
            return token_response
            
        except requests.RequestException as e:
            logger.error(f"Error exchanging code for tokens ({self.provider_name}): {str(e)}")
            raise Exception(f"Failed to exchange code for tokens: {str(e)}")
    
    def get_user_info(self, access_token: str) -> Dict:
        """Get user information from OAuth provider"""
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Accept': 'application/json'
        }
        
        # GitHub uses different auth header format in some cases
        if self.provider_name == 'github':
            headers['User-Agent'] = 'WatchParty-App'
        
        try:
            response = requests.get(
                self.provider_config['user_info_url'],
                headers=headers
            )
            response.raise_for_status()
            
            user_data = response.json()
            
            # Standardize user data format
            return self._normalize_user_data(user_data)
            
        except requests.RequestException as e:
            logger.error(f"Error getting user info ({self.provider_name}): {str(e)}")
            raise Exception(f"Failed to get user information: {str(e)}")
    
    def refresh_access_token(self, refresh_token: str) -> Dict:
        """Refresh access token using refresh token"""
        if self.provider_name == 'discord':
            # Discord doesn't support refresh tokens in the same way
            raise Exception("Discord doesn't support token refresh")
        
        token_data = {
            'client_id': self.provider_db.client_id,
            'client_secret': self.provider_db.client_secret,
            'refresh_token': refresh_token,
            'grant_type': 'refresh_token',
        }
        
        headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded'
        }
        
        try:
            response = requests.post(
                self.provider_config['token_url'],
                data=token_data,
                headers=headers
            )
            response.raise_for_status()
            
            return response.json()
            
        except requests.RequestException as e:
            logger.error(f"Error refreshing token ({self.provider_name}): {str(e)}")
            raise Exception(f"Failed to refresh token: {str(e)}")
    
    def revoke_access_token(self, access_token: str) -> bool:
        """Revoke access token"""
        revoke_urls = {
            'google': 'https://oauth2.googleapis.com/revoke',
            'discord': None,  # Discord doesn't have a revoke endpoint
            'github': f'https://api.github.com/applications/{self.provider_db.client_id}/token'
        }
        
        revoke_url = revoke_urls.get(self.provider_name)
        if not revoke_url:
            logger.warning(f"Token revocation not supported for {self.provider_name}")
            return True
        
        try:
            if self.provider_name == 'google':
                response = requests.post(
                    revoke_url,
                    data={'token': access_token},
                    headers={'Content-Type': 'application/x-www-form-urlencoded'}
                )
            elif self.provider_name == 'github':
                response = requests.delete(
                    revoke_url,
                    auth=(self.provider_db.client_id, self.provider_db.client_secret),
                    json={'access_token': access_token}
                )
            
            return response.status_code == 200
            
        except requests.RequestException as e:
            logger.error(f"Error revoking token ({self.provider_name}): {str(e)}")
            return False
    
    def _normalize_user_data(self, raw_data: Dict) -> Dict:
        """Normalize user data from different providers"""
        if self.provider_name == 'google':
            return {
                'id': raw_data.get('id'),
                'email': raw_data.get('email'),
                'name': raw_data.get('name'),
                'first_name': raw_data.get('given_name'),
                'last_name': raw_data.get('family_name'),
                'picture': raw_data.get('picture'),
                'verified_email': raw_data.get('verified_email', False),
                'locale': raw_data.get('locale'),
                'raw_data': raw_data
            }
        
        elif self.provider_name == 'discord':
            return {
                'id': raw_data.get('id'),
                'email': raw_data.get('email'),
                'name': raw_data.get('global_name') or raw_data.get('username'),
                'username': raw_data.get('username'),
                'discriminator': raw_data.get('discriminator'),
                'picture': self._get_discord_avatar_url(raw_data),
                'verified_email': raw_data.get('verified', False),
                'locale': raw_data.get('locale'),
                'raw_data': raw_data
            }
        
        elif self.provider_name == 'github':
            return {
                'id': raw_data.get('id'),
                'email': raw_data.get('email'),
                'name': raw_data.get('name'),
                'username': raw_data.get('login'),
                'picture': raw_data.get('avatar_url'),
                'bio': raw_data.get('bio'),
                'location': raw_data.get('location'),
                'blog': raw_data.get('blog'),
                'raw_data': raw_data
            }
        
        return raw_data
    
    def _get_discord_avatar_url(self, user_data: Dict) -> str:
        """Generate Discord avatar URL"""
        user_id = user_data.get('id')
        avatar_hash = user_data.get('avatar')
        
        if not user_id:
            return ''
        
        if avatar_hash:
            return f"https://cdn.discordapp.com/avatars/{user_id}/{avatar_hash}.png"
        else:
            # Default avatar
            discriminator = user_data.get('discriminator', '0')
            default_avatar_num = int(discriminator) % 5
            return f"https://cdn.discordapp.com/embed/avatars/{default_avatar_num}.png"
    
    @classmethod
    def get_supported_providers(cls) -> Dict[str, Dict]:
        """Get list of supported OAuth providers"""
        return cls.PROVIDER_CONFIGS.copy()
    
    @classmethod
    def create_connection(
        cls,
        user,
        provider: str,
        token_data: Dict,
        user_data: Dict
    ) -> UserServiceConnection:
        """Create or update user service connection"""
        from ..models import ExternalService
        
        try:
            # Get or create external service
            service, _ = ExternalService.objects.get_or_create(
                name=f'{provider}_oauth',
                defaults={
                    'is_active': True,
                    'configuration': {'provider': provider}
                }
            )
            
            # Create or update connection
            connection, created = UserServiceConnection.objects.get_or_create(
                user=user,
                service=service,
                defaults={
                    'access_token': token_data.get('access_token'),
                    'refresh_token': token_data.get('refresh_token'),
                    'external_user_id': str(user_data.get('id')),
                    'external_username': user_data.get('username', ''),
                    'external_email': user_data.get('email', ''),
                    'is_connected': True,
                    'is_active': True,
                }
            )
            
            if not created:
                # Update existing connection
                connection.access_token = token_data.get('access_token')
                connection.refresh_token = token_data.get('refresh_token')
                connection.external_username = user_data.get('username', '')
                connection.external_email = user_data.get('email', '')
                connection.is_connected = True
                connection.last_sync_at = timezone.now()
            
            # Set token expiration if available
            if token_data.get('expires_in'):
                expires_in = int(token_data['expires_in'])
                connection.token_expires_at = timezone.now() + timedelta(seconds=expires_in)
            
            # Store additional metadata
            connection.metadata = {
                'user_data': user_data,
                'token_type': token_data.get('token_type', 'Bearer'),
                'scope': token_data.get('scope', ''),
                'connected_at': timezone.now().isoformat()
            }
            
            connection.save()
            
            logger.info(f"Created/updated {provider} connection for user {user.username}")
            return connection
            
        except Exception as e:
            logger.error(f"Error creating service connection: {str(e)}")
            raise Exception(f"Failed to create service connection: {str(e)}")
