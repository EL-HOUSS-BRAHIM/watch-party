"""
WebSocket authentication middleware for Django Channels
"""

from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from jwt import decode as jwt_decode
from django.conf import settings
from urllib.parse import parse_qs
import logging

logger = logging.getLogger(__name__)
User = get_user_model()


@database_sync_to_async
def get_user(user_id):
    """Get user from database"""
    try:
        return User.objects.get(id=user_id)
    except User.DoesNotExist:
        return AnonymousUser()


class JWTAuthMiddleware(BaseMiddleware):
    """JWT authentication middleware for WebSocket connections"""
    
    def __init__(self, inner):
        super().__init__(inner)
    
    async def __call__(self, scope, receive, send):
        """Authenticate WebSocket connection using JWT token"""
        
        # Extract token from query string
        query_string = scope.get('query_string', b'').decode('utf-8')
        query_params = parse_qs(query_string)
        token = query_params.get('token', [None])[0]
        
        # Initialize user as anonymous
        scope['user'] = AnonymousUser()
        
        if token and token != 'undefined' and token != 'null':
            try:
                # Validate JWT token
                validated_token = UntypedToken(token)
                user_id = validated_token['user_id']
                
                # Get user from database
                user = await get_user(user_id)
                scope['user'] = user
                
                logger.info(f"WebSocket authenticated user: {user_id}")
                
            except (InvalidToken, TokenError, KeyError) as e:
                logger.warning(f"WebSocket authentication failed: {str(e)}")
                scope['user'] = AnonymousUser()
            except Exception as e:
                logger.error(f"WebSocket authentication error: {str(e)}")
                scope['user'] = AnonymousUser()
        else:
            logger.warning(f"WebSocket connection without valid token: {token}")
        
        return await super().__call__(scope, receive, send)


class TokenAuthMiddleware(BaseMiddleware):
    """
    Alternative token authentication middleware for WebSocket connections
    """
    
    def __init__(self, inner):
        super().__init__(inner)
    
    async def __call__(self, scope, receive, send):
        """Authenticate WebSocket connection using token"""
        
        # Get token from headers or query params
        token = None
        
        # Try to get token from query string first
        query_string = scope.get('query_string', b'').decode('utf-8')
        query_params = parse_qs(query_string)
        token = query_params.get('token', [None])[0]
        
        # If no token in query, try headers
        if not token:
            headers = dict(scope.get('headers', []))
            auth_header = headers.get(b'authorization', b'').decode('utf-8')
            if auth_header.startswith('Bearer '):
                token = auth_header[7:]
        
        # Initialize user as anonymous
        scope['user'] = AnonymousUser()
        
        if token and token not in ['undefined', 'null', '']:
            try:
                # Validate token and get user
                user = await self.get_user_from_token(token)
                scope['user'] = user
                
                logger.info(f"WebSocket authenticated user: {user.id if user.is_authenticated else 'anonymous'}")
                
            except Exception as e:
                logger.error(f"WebSocket token authentication error: {str(e)}")
                scope['user'] = AnonymousUser()
        else:
            logger.warning(f"WebSocket connection without valid token")
        
        return await super().__call__(scope, receive, send)
    
    @database_sync_to_async
    def get_user_from_token(self, token):
        """Get user from JWT token"""
        try:
            # Decode the token
            decoded_token = jwt_decode(
                token,
                settings.SECRET_KEY,
                algorithms=['HS256']
            )
            
            user_id = decoded_token.get('user_id')
            if user_id:
                user = User.objects.get(id=user_id)
                return user
            
        except (User.DoesNotExist, Exception) as e:
            logger.warning(f"Failed to get user from token: {str(e)}")
        
        return AnonymousUser()


# Helper function to stack middleware
def JWTAuthMiddlewareStack(inner):
    """Stack JWT authentication middleware"""
    return JWTAuthMiddleware(inner)
