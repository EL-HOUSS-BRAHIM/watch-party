from django.core.management.base import BaseCommand
from django.conf import settings
from apps.integrations.models import ExternalService, SocialOAuthProvider, AWSS3Configuration


class Command(BaseCommand):
    help = 'Initialize external integrations with default configurations'
    
    def handle(self, *args, **options):
        self.stdout.write('Setting up external integrations...')
        
        # Create External Services
        self.setup_external_services()
        
        # Setup Social OAuth Providers
        self.setup_social_oauth_providers()
        
        # Setup AWS S3 Configuration
        self.setup_aws_s3_configuration()
        
        self.stdout.write(
            self.style.SUCCESS('Successfully initialized external integrations!')
        )
    
    def setup_external_services(self):
        """Create external service entries"""
        services = [
            {
                'name': 'google_drive',
                'is_active': True,
                'configuration': {
                    'scopes': [
                        'https://www.googleapis.com/auth/drive.readonly',
                        'https://www.googleapis.com/auth/drive.metadata.readonly',
                        'https://www.googleapis.com/auth/userinfo.profile',
                        'https://www.googleapis.com/auth/userinfo.email'
                    ],
                    'supported_mime_types': [
                        'video/mp4',
                        'video/quicktime',
                        'video/x-msvideo',
                        'video/webm',
                        'video/ogg'
                    ]
                }
            },
            {
                'name': 'aws_s3',
                'is_active': True,
                'configuration': {
                    'max_file_size': 5368709120,  # 5GB
                    'supported_formats': ['mp4', 'mov', 'avi', 'webm', 'ogg']
                }
            },
            {
                'name': 'google_oauth',
                'is_active': True,
                'configuration': {'provider': 'google'}
            },
            {
                'name': 'discord_oauth',
                'is_active': True,
                'configuration': {'provider': 'discord'}
            },
            {
                'name': 'github_oauth',
                'is_active': True,
                'configuration': {'provider': 'github'}
            }
        ]
        
        for service_data in services:
            service, created = ExternalService.objects.get_or_create(
                name=service_data['name'],
                defaults={
                    'is_active': service_data['is_active'],
                    'configuration': service_data['configuration']
                }
            )
            
            if created:
                self.stdout.write(f'Created external service: {service.name}')
            else:
                self.stdout.write(f'External service already exists: {service.name}')
    
    def setup_social_oauth_providers(self):
        """Create social OAuth provider configurations"""
        providers = [
            {
                'provider': 'google',
                'client_id': getattr(settings, 'GOOGLE_OAUTH_CLIENT_ID', ''),
                'client_secret': getattr(settings, 'GOOGLE_OAUTH_CLIENT_SECRET', ''),
                'scope': 'openid email profile',
                'redirect_uri': 'http://localhost:3000/auth/google/callback',
                'additional_settings': {
                    'access_type': 'offline',
                    'prompt': 'consent'
                }
            },
            {
                'provider': 'discord',
                'client_id': getattr(settings, 'DISCORD_CLIENT_ID', ''),
                'client_secret': getattr(settings, 'DISCORD_CLIENT_SECRET', ''),
                'scope': 'identify email',
                'redirect_uri': 'http://localhost:3000/auth/discord/callback',
                'additional_settings': {
                    'permissions': '0'
                }
            },
            {
                'provider': 'github',
                'client_id': getattr(settings, 'GITHUB_CLIENT_ID', ''),
                'client_secret': getattr(settings, 'GITHUB_CLIENT_SECRET', ''),
                'scope': 'user:email read:user',
                'redirect_uri': 'http://localhost:3000/auth/github/callback',
                'additional_settings': {}
            }
        ]
        
        for provider_data in providers:
            provider, created = SocialOAuthProvider.objects.get_or_create(
                provider=provider_data['provider'],
                defaults={
                    'client_id': provider_data['client_id'],
                    'client_secret': provider_data['client_secret'],
                    'scope': provider_data['scope'],
                    'redirect_uri': provider_data['redirect_uri'],
                    'additional_settings': provider_data['additional_settings'],
                    'is_active': bool(provider_data['client_id'])  # Only active if client_id is set
                }
            )
            
            if created:
                self.stdout.write(f'Created OAuth provider: {provider.provider}')
                if not provider_data['client_id']:
                    self.stdout.write(
                        self.style.WARNING(
                            f'  -> {provider.provider} is inactive (no client_id configured)'
                        )
                    )
            else:
                self.stdout.write(f'OAuth provider already exists: {provider.provider}')
    
    def setup_aws_s3_configuration(self):
        """Create AWS S3 configuration"""
        aws_config_data = {
            'name': 'default',
            'bucket_name': getattr(settings, 'AWS_STORAGE_BUCKET_NAME', ''),
            'region': getattr(settings, 'AWS_S3_REGION_NAME', 'us-east-1'),
            'access_key_id': getattr(settings, 'AWS_ACCESS_KEY_ID', ''),
            'secret_access_key': getattr(settings, 'AWS_SECRET_ACCESS_KEY', ''),
            'cloudfront_domain': getattr(settings, 'AWS_S3_CUSTOM_DOMAIN', ''),
            'use_cloudfront': bool(getattr(settings, 'AWS_S3_CUSTOM_DOMAIN', '')),
            'max_file_size': 5368709120,  # 5GB
            'allowed_file_types': [
                'video/mp4',
                'video/quicktime',
                'video/x-msvideo',
                'video/webm',
                'video/ogg',
                'image/jpeg',
                'image/png',
                'image/webp'
            ],
            'default_acl': getattr(settings, 'AWS_DEFAULT_ACL', 'private'),
            'enable_encryption': True,
            'is_active': bool(getattr(settings, 'AWS_STORAGE_BUCKET_NAME', ''))
        }
        
        config, created = AWSS3Configuration.objects.get_or_create(
            name=aws_config_data['name'],
            defaults=aws_config_data
        )
        
        if created:
            self.stdout.write('Created AWS S3 configuration: default')
            if not aws_config_data['bucket_name']:
                self.stdout.write(
                    self.style.WARNING(
                        '  -> AWS S3 is inactive (no bucket configured)'
                    )
                )
        else:
            self.stdout.write('AWS S3 configuration already exists: default')
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force update existing configurations',
        )
