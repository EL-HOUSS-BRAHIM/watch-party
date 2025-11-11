"""
AWS Credential Rotation Service

Handles automatic rotation of AWS credentials from Secrets Manager.
Credentials rotate every 30 minutes and are cached to minimize API calls.
"""

import logging
import time
from datetime import datetime, timedelta
from threading import Thread, Lock
from typing import Dict, Any, Optional
import os

from .aws import get_optional_secret

logger = logging.getLogger(__name__)


class CredentialRotationService:
    """
    Service for managing automatic credential rotation from AWS Secrets Manager.
    
    Credentials are fetched on startup and refreshed every 30 minutes.
    Thread-safe caching prevents excessive API calls.
    """
    
    def __init__(self, rotation_interval_minutes: int = 30):
        self.rotation_interval = rotation_interval_minutes * 60  # Convert to seconds
        self.credentials_cache: Dict[str, Dict[str, Any]] = {}
        self.last_rotation: Dict[str, datetime] = {}
        self.lock = Lock()
        self.rotation_thread: Optional[Thread] = None
        self.running = False
        
        # AWS region from environment
        self.region = os.getenv('AWS_DEFAULT_REGION', 'eu-west-3')
        
        # Environment (production or staging)
        self.environment = os.getenv('ENVIRONMENT', 'production')
        
    def start(self):
        """Start the credential rotation background service."""
        if self.running:
            logger.warning("Credential rotation service already running")
            return
            
        self.running = True
        self.rotation_thread = Thread(target=self._rotation_loop, daemon=True)
        self.rotation_thread.start()
        logger.info(f"Credential rotation service started (interval: {self.rotation_interval}s)")
        
    def stop(self):
        """Stop the credential rotation background service."""
        self.running = False
        if self.rotation_thread:
            self.rotation_thread.join(timeout=5)
        logger.info("Credential rotation service stopped")
        
    def _rotation_loop(self):
        """Background loop that rotates credentials at specified intervals."""
        # Initial load
        self._rotate_all_credentials()
        
        while self.running:
            try:
                time.sleep(self.rotation_interval)
                if self.running:  # Check again after sleep
                    self._rotate_all_credentials()
            except Exception as e:
                logger.error(f"Error in credential rotation loop: {e}", exc_info=True)
                # Continue running even if rotation fails
                time.sleep(60)  # Wait 1 minute before retry
                
    def _rotate_all_credentials(self):
        """Rotate all registered credentials."""
        logger.info(f"Starting credential rotation cycle for {self.environment} environment")
        
        # RDS Database Credentials
        self._rotate_credential(
            'rds',
            'rds!db-44fd826c-d576-4afd-8bf3-38f59d5cd4ae',
            'RDS database credentials'
        )
        
        # Valkey (Redis) Credentials
        self._rotate_credential(
            'valkey',
            'watch-party-valkey-001-auth-token',
            'Valkey/Redis auth token'
        )
        
        # AWS SES SMTP Credentials
        self._rotate_credential(
            'ses_smtp',
            'watch-party/ses-smtp',
            'AWS SES SMTP credentials'
        )
        
        # Environment-specific Stripe credentials
        self._rotate_credential(
            'stripe',
            f'watch-party/{self.environment}/stripe',
            f'Stripe credentials ({self.environment})'
        )
        
        # Environment-specific Google OAuth credentials
        self._rotate_credential(
            'google_oauth',
            f'watch-party/{self.environment}/google-oauth',
            f'Google OAuth credentials ({self.environment})'
        )
        
        logger.info(f"Credential rotation cycle completed for {self.environment}")
        
    def _rotate_credential(self, key: str, secret_name: str, description: str):
        """
        Rotate a single credential from AWS Secrets Manager.
        
        Args:
            key: Cache key for this credential
            secret_name: AWS Secrets Manager secret name
            description: Human-readable description for logging
        """
        try:
            with self.lock:
                secret = get_optional_secret(secret_name, region=self.region)
                if secret:
                    self.credentials_cache[key] = secret
                    self.last_rotation[key] = datetime.now()
                    logger.info(f"✓ Rotated {description} (secret: {secret_name})")
                else:
                    if key not in self.credentials_cache:
                        logger.warning(f"⚠ Could not fetch {description}, no cached value available")
                    else:
                        logger.warning(f"⚠ Could not fetch {description}, using cached value from {self.last_rotation.get(key)}")
        except Exception as e:
            logger.error(f"✗ Failed to rotate {description}: {e}", exc_info=True)
            
    def get_credential(self, key: str) -> Optional[Dict[str, Any]]:
        """
        Get a credential from cache.
        
        Args:
            key: Cache key (e.g., 'rds', 'valkey')
            
        Returns:
            Credential dictionary or None if not available
        """
        with self.lock:
            credential = self.credentials_cache.get(key)
            if not credential:
                logger.warning(f"Credential '{key}' not found in cache")
            return credential
            
    def get_rds_credentials(self) -> Optional[Dict[str, Any]]:
        """Get current RDS database credentials."""
        return self.get_credential('rds')
        
    def get_valkey_credentials(self) -> Optional[Dict[str, Any]]:
        """Get current Valkey/Redis credentials."""
        return self.get_credential('valkey')
        
    def get_ses_smtp_credentials(self) -> Optional[Dict[str, Any]]:
        """Get current AWS SES SMTP credentials."""
        return self.get_credential('ses_smtp')
        
    def get_stripe_credentials(self) -> Optional[Dict[str, Any]]:
        """Get current Stripe credentials."""
        return self.get_credential('stripe')
        
    def get_google_oauth_credentials(self) -> Optional[Dict[str, Any]]:
        """Get current Google OAuth credentials."""
        return self.get_credential('google_oauth')
        
    def force_rotation(self):
        """Force immediate rotation of all credentials."""
        logger.info("Forcing immediate credential rotation")
        self._rotate_all_credentials()
        
    def get_status(self) -> Dict[str, Any]:
        """
        Get current status of credential rotation service.
        
        Returns:
            Dictionary with service status information
        """
        with self.lock:
            return {
                'running': self.running,
                'rotation_interval_seconds': self.rotation_interval,
                'cached_credentials': list(self.credentials_cache.keys()),
                'last_rotations': {
                    key: timestamp.isoformat()
                    for key, timestamp in self.last_rotation.items()
                },
                'next_rotation_in_seconds': self.rotation_interval - (
                    (datetime.now() - min(self.last_rotation.values())).total_seconds()
                    if self.last_rotation else 0
                )
            }


# Global singleton instance
_credential_service: Optional[CredentialRotationService] = None


def get_credential_service() -> CredentialRotationService:
    """
    Get the global credential rotation service instance.
    
    Creates and starts the service if it doesn't exist.
    """
    global _credential_service
    
    if _credential_service is None:
        rotation_interval = int(os.getenv('AWS_CREDENTIAL_ROTATION_MINUTES', '30'))
        _credential_service = CredentialRotationService(rotation_interval_minutes=rotation_interval)
        
        # Start service unless explicitly disabled
        if not os.getenv('DISABLE_CREDENTIAL_ROTATION'):
            _credential_service.start()
            
    return _credential_service


def get_database_credentials() -> Optional[Dict[str, Any]]:
    """Helper to get current database credentials."""
    return get_credential_service().get_rds_credentials()


def get_redis_credentials() -> Optional[Dict[str, Any]]:
    """Helper to get current Redis/Valkey credentials."""
    return get_credential_service().get_valkey_credentials()


def get_ses_credentials() -> Optional[Dict[str, Any]]:
    """Helper to get current SES SMTP credentials."""
    return get_credential_service().get_ses_smtp_credentials()


def get_stripe_credentials() -> Optional[Dict[str, Any]]:
    """Helper to get current Stripe credentials."""
    return get_credential_service().get_stripe_credentials()


def get_google_oauth_credentials() -> Optional[Dict[str, Any]]:
    """Helper to get current Google OAuth credentials."""
    return get_credential_service().get_google_oauth_credentials()
