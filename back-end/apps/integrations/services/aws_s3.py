import os
import boto3
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, BinaryIO
from urllib.parse import urlparse
from botocore.exceptions import ClientError, NoCredentialsError

from django.conf import settings
from django.core.files.storage import Storage
from django.core.files.base import ContentFile
from django.utils import timezone

from ..models import AWSS3Configuration

logger = logging.getLogger(__name__)


class AWSS3Service:
    """Service for AWS S3 integration and CloudFront CDN"""
    
    # Supported video file types for upload
    SUPPORTED_VIDEO_TYPES = [
        'video/mp4',
        'video/quicktime',
        'video/x-msvideo',  # AVI
        'video/webm',
        'video/ogg',
        'video/x-matroska', # MKV
    ]
    
    # Supported image types for thumbnails
    SUPPORTED_IMAGE_TYPES = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif'
    ]
    
    def __init__(self, config_name: str = None, configuration: AWSS3Configuration = None):
        """Initialize AWS S3 service with configuration"""
        self.config = configuration or self._get_configuration(config_name)
        self.s3_client = None
        self.cloudfront_client = None
        self._initialize_clients()
    
    def _get_configuration(self, config_name: str = None) -> AWSS3Configuration:
        """Get S3 configuration from database or settings"""
        if config_name:
            try:
                return AWSS3Configuration.objects.get(name=config_name, is_active=True)
            except AWSS3Configuration.DoesNotExist:
                logger.error(f"S3 configuration '{config_name}' not found")
                raise Exception(f"S3 configuration '{config_name}' not found")
        else:
            # Use default configuration from settings
            return AWSS3Configuration(
                name='default',
                bucket_name=settings.AWS_STORAGE_BUCKET_NAME,
                region=settings.AWS_S3_REGION_NAME,
                access_key_id=settings.AWS_ACCESS_KEY_ID,
                secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                cloudfront_domain=settings.AWS_S3_CUSTOM_DOMAIN,
                use_cloudfront=bool(settings.AWS_S3_CUSTOM_DOMAIN),
                default_acl=settings.AWS_DEFAULT_ACL or 'private'
            )
    
    def _initialize_clients(self) -> None:
        """Initialize AWS clients"""
        try:
            session = boto3.Session(
                aws_access_key_id=self.config.access_key_id,
                aws_secret_access_key=self.config.secret_access_key,
                region_name=self.config.region
            )
            
            self.s3_client = session.client('s3')
            
            if self.config.use_cloudfront and self.config.cloudfront_domain:
                self.cloudfront_client = session.client('cloudfront')
            
        except NoCredentialsError:
            logger.error("AWS credentials not found")
            raise Exception("AWS credentials not configured")
        except Exception as e:
            logger.error(f"Error initializing AWS clients: {str(e)}")
            raise Exception(f"Failed to initialize AWS clients: {str(e)}")
    
    def upload_file(
        self,
        file_obj: BinaryIO,
        file_name: str,
        content_type: str = None,
        folder: str = 'uploads',
        make_public: bool = False
    ) -> Dict:
        """Upload file to S3"""
        if not self.s3_client:
            raise Exception("S3 client not initialized")
        
        try:
            # Validate file type
            if content_type and not self._is_allowed_file_type(content_type):
                raise Exception(f"File type '{content_type}' not allowed")
            
            # Generate S3 key
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            s3_key = f"{folder}/{timestamp}_{file_name}"
            
            # Upload parameters
            upload_params = {
                'Bucket': self.config.bucket_name,
                'Key': s3_key,
                'Body': file_obj,
            }
            
            if content_type:
                upload_params['ContentType'] = content_type
            
            # Set ACL
            if make_public:
                upload_params['ACL'] = 'public-read'
            else:
                upload_params['ACL'] = self.config.default_acl
            
            # Add encryption if enabled
            if self.config.enable_encryption:
                upload_params['ServerSideEncryption'] = 'AES256'
            
            # Upload file
            self.s3_client.upload_fileobj(**upload_params)
            
            # Generate URLs
            file_url = self._generate_file_url(s3_key)
            public_url = self._generate_public_url(s3_key) if make_public else None
            
            return {
                'success': True,
                'file_key': s3_key,
                'file_url': file_url,
                'public_url': public_url,
                'bucket': self.config.bucket_name,
                'size': file_obj.tell() if hasattr(file_obj, 'tell') else None
            }
            
        except ClientError as e:
            error_code = e.response['Error']['Code']
            logger.error(f"S3 upload error ({error_code}): {str(e)}")
            raise Exception(f"Failed to upload file: {error_code}")
        except Exception as e:
            logger.error(f"Error uploading file: {str(e)}")
            raise Exception(f"Failed to upload file: {str(e)}")
    
    def generate_presigned_upload_url(
        self,
        file_name: str,
        content_type: str,
        folder: str = 'uploads',
        expiration: int = 3600,
        max_file_size: int = None
    ) -> Dict:
        """Generate presigned URL for direct client upload"""
        if not self.s3_client:
            raise Exception("S3 client not initialized")
        
        try:
            # Validate file type
            if not self._is_allowed_file_type(content_type):
                raise Exception(f"File type '{content_type}' not allowed")
            
            # Generate S3 key
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            s3_key = f"{folder}/{timestamp}_{file_name}"
            
            # Upload conditions
            conditions = [
                {'bucket': self.config.bucket_name},
                {'key': s3_key},
                {'Content-Type': content_type},
                {'acl': self.config.default_acl}
            ]
            
            # Add file size limit
            if max_file_size or self.config.max_file_size:
                size_limit = max_file_size or self.config.max_file_size
                conditions.append(['content-length-range', 1, size_limit])
            
            # Generate presigned POST
            presigned_post = self.s3_client.generate_presigned_post(
                Bucket=self.config.bucket_name,
                Key=s3_key,
                Fields={
                    'Content-Type': content_type,
                    'acl': self.config.default_acl
                },
                Conditions=conditions,
                ExpiresIn=expiration
            )
            
            return {
                'upload_url': presigned_post['url'],
                'fields': presigned_post['fields'],
                'file_key': s3_key,
                'expires_in': expiration,
                'file_url': self._generate_file_url(s3_key)
            }
            
        except ClientError as e:
            logger.error(f"Error generating presigned URL: {str(e)}")
            raise Exception("Failed to generate upload URL")
    
    def get_file_info(self, file_key: str) -> Dict:
        """Get file metadata from S3"""
        if not self.s3_client:
            raise Exception("S3 client not initialized")
        
        try:
            response = self.s3_client.head_object(
                Bucket=self.config.bucket_name,
                Key=file_key
            )
            
            return {
                'key': file_key,
                'size': response.get('ContentLength'),
                'content_type': response.get('ContentType'),
                'last_modified': response.get('LastModified'),
                'etag': response.get('ETag', '').strip('"'),
                'metadata': response.get('Metadata', {}),
                'file_url': self._generate_file_url(file_key)
            }
            
        except ClientError as e:
            if e.response['Error']['Code'] == 'NoSuchKey':
                return None
            logger.error(f"Error getting file info: {str(e)}")
            raise Exception("Failed to get file information")
    
    def generate_streaming_url(
        self,
        file_key: str,
        expiration: int = 3600,
        response_headers: Dict = None
    ) -> str:
        """Generate presigned URL for streaming"""
        if not self.s3_client:
            raise Exception("S3 client not initialized")
        
        try:
            # If CloudFront is configured, use CloudFront URL
            if self.config.use_cloudfront and self.config.cloudfront_domain:
                return self._generate_cloudfront_streaming_url(file_key, expiration)
            
            # Generate presigned S3 URL
            params = {
                'Bucket': self.config.bucket_name,
                'Key': file_key
            }
            
            if response_headers:
                params['ResponseContentType'] = response_headers.get('Content-Type')
                params['ResponseContentDisposition'] = response_headers.get('Content-Disposition')
            
            url = self.s3_client.generate_presigned_url(
                'get_object',
                Params=params,
                ExpiresIn=expiration
            )
            
            return url
            
        except ClientError as e:
            logger.error(f"Error generating streaming URL: {str(e)}")
            raise Exception("Failed to generate streaming URL")
    
    def delete_file(self, file_key: str) -> bool:
        """Delete file from S3"""
        if not self.s3_client:
            raise Exception("S3 client not initialized")
        
        try:
            self.s3_client.delete_object(
                Bucket=self.config.bucket_name,
                Key=file_key
            )
            
            # Invalidate CloudFront cache if configured
            if self.config.use_cloudfront and self.cloudfront_client:
                self._invalidate_cloudfront_cache([file_key])
            
            return True
            
        except ClientError as e:
            logger.error(f"Error deleting file: {str(e)}")
            return False
    
    def list_files(self, prefix: str = '', max_keys: int = 1000) -> List[Dict]:
        """List files in S3 bucket"""
        if not self.s3_client:
            raise Exception("S3 client not initialized")
        
        try:
            response = self.s3_client.list_objects_v2(
                Bucket=self.config.bucket_name,
                Prefix=prefix,
                MaxKeys=max_keys
            )
            
            files = []
            for obj in response.get('Contents', []):
                files.append({
                    'key': obj['Key'],
                    'size': obj['Size'],
                    'last_modified': obj['LastModified'],
                    'etag': obj['ETag'].strip('"'),
                    'file_url': self._generate_file_url(obj['Key'])
                })
            
            return files
            
        except ClientError as e:
            logger.error(f"Error listing files: {str(e)}")
            raise Exception("Failed to list files")
    
    def _generate_file_url(self, file_key: str) -> str:
        """Generate file URL (CloudFront or S3)"""
        if self.config.use_cloudfront and self.config.cloudfront_domain:
            return f"https://{self.config.cloudfront_domain}/{file_key}"
        else:
            return f"https://{self.config.bucket_name}.s3.{self.config.region}.amazonaws.com/{file_key}"
    
    def _generate_public_url(self, file_key: str) -> str:
        """Generate public URL for public files"""
        return self._generate_file_url(file_key)
    
    def _generate_cloudfront_streaming_url(self, file_key: str, expiration: int) -> str:
        """Generate CloudFront signed URL for streaming"""
        # This would require implementing CloudFront signed URLs
        # For now, return the standard CloudFront URL
        return self._generate_file_url(file_key)
    
    def _invalidate_cloudfront_cache(self, paths: List[str]) -> None:
        """Invalidate CloudFront cache for given paths"""
        if not self.cloudfront_client:
            return
        
        try:
            # This would require CloudFront distribution ID
            # Implementation depends on your CloudFront setup
            logger.info(f"CloudFront cache invalidation requested for paths: {paths}")
        except Exception as e:
            logger.error(f"Error invalidating CloudFront cache: {str(e)}")
    
    def _is_allowed_file_type(self, content_type: str) -> bool:
        """Check if file type is allowed for upload"""
        if not self.config.allowed_file_types:
            # If no restrictions, allow video and image types
            return (content_type in self.SUPPORTED_VIDEO_TYPES or 
                   content_type in self.SUPPORTED_IMAGE_TYPES)
        
        return content_type in self.config.allowed_file_types
