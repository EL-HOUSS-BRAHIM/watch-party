import os
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from urllib.parse import urlencode

from django.conf import settings
from django.utils import timezone
from google.oauth2.credentials import Credentials
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from google.auth.transport.requests import Request

from ..models import UserServiceConnection, GoogleDriveFile

logger = logging.getLogger(__name__)


class GoogleDriveService:
    """Service for Google Drive API integration"""
    
    # Video MIME types supported for streaming
    SUPPORTED_VIDEO_TYPES = [
        'video/mp4',
        'video/quicktime',
        'video/x-msvideo',  # AVI
        'video/x-ms-wmv',   # WMV
        'video/webm',
        'video/ogg',
        'video/3gpp',
        'video/x-flv',
        'video/x-matroska', # MKV
    ]
    
    # OAuth2 scopes needed
    SCOPES = [
        'https://www.googleapis.com/auth/drive.readonly',
        'https://www.googleapis.com/auth/drive.metadata.readonly',
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
    ]
    
    def __init__(self, user_connection: Optional[UserServiceConnection] = None):
        """Initialize Google Drive service"""
        self.user_connection = user_connection
        self.service = None
        self._initialize_service()
    
    def _initialize_service(self) -> None:
        """Initialize Google Drive API service"""
        try:
            if self.user_connection and self.user_connection.access_token:
                # Use user's OAuth credentials
                credentials = self._get_user_credentials()
            else:
                # Use service account for server-to-server operations
                credentials = self._get_service_account_credentials()
            
            if credentials:
                self.service = build('drive', 'v3', credentials=credentials)
            else:
                logger.error("Failed to initialize Google Drive credentials")
                
        except Exception as e:
            logger.error(f"Error initializing Google Drive service: {str(e)}")
    
    def _get_user_credentials(self) -> Optional[Credentials]:
        """Get user OAuth2 credentials"""
        if not self.user_connection:
            return None
        
        try:
            credentials = Credentials(
                token=self.user_connection.access_token,
                refresh_token=self.user_connection.refresh_token,
                token_uri='https://oauth2.googleapis.com/token',
                client_id=settings.GOOGLE_DRIVE_CLIENT_ID,
                client_secret=settings.GOOGLE_DRIVE_CLIENT_SECRET
            )
            
            # Refresh token if needed
            if credentials.expired and credentials.refresh_token:
                request = Request()
                credentials.refresh(request)
                
                # Update stored tokens
                self.user_connection.access_token = credentials.token
                self.user_connection.token_expires_at = timezone.now() + timedelta(seconds=credentials.expiry)
                self.user_connection.save()
            
            return credentials
            
        except Exception as e:
            logger.error(f"Error getting user credentials: {str(e)}")
            return None
    
    def _get_service_account_credentials(self) -> Optional[Credentials]:
        """Get service account credentials"""
        try:
            if settings.GOOGLE_SERVICE_ACCOUNT_FILE and os.path.exists(settings.GOOGLE_SERVICE_ACCOUNT_FILE):
                return service_account.Credentials.from_service_account_file(
                    settings.GOOGLE_SERVICE_ACCOUNT_FILE,
                    scopes=self.SCOPES
                )
            else:
                logger.warning("Service account file not found or not configured")
                return None
        except Exception as e:
            logger.error(f"Error loading service account credentials: {str(e)}")
            return None
    
    def get_oauth_url(self, redirect_uri: str, state: str = None) -> str:
        """Generate OAuth2 authorization URL"""
        base_url = 'https://accounts.google.com/o/oauth2/v2/auth'
        params = {
            'client_id': settings.GOOGLE_DRIVE_CLIENT_ID,
            'response_type': 'code',
            'scope': ' '.join(self.SCOPES),
            'redirect_uri': redirect_uri,
            'access_type': 'offline',
            'prompt': 'consent',
        }
        
        if state:
            params['state'] = state
        
        return f"{base_url}?{urlencode(params)}"
    
    def exchange_code_for_tokens(self, code: str, redirect_uri: str) -> Dict:
        """Exchange authorization code for access tokens"""
        import requests
        
        token_url = 'https://oauth2.googleapis.com/token'
        data = {
            'client_id': settings.GOOGLE_DRIVE_CLIENT_ID,
            'client_secret': settings.GOOGLE_DRIVE_CLIENT_SECRET,
            'code': code,
            'grant_type': 'authorization_code',
            'redirect_uri': redirect_uri,
        }
        
        try:
            response = requests.post(token_url, data=data)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            logger.error(f"Error exchanging code for tokens: {str(e)}")
            raise Exception(f"Failed to exchange code for tokens: {str(e)}")
    
    def get_user_info(self) -> Dict:
        """Get user info from Google"""
        if not self.service:
            raise Exception("Google Drive service not initialized")
        
        try:
            # Get user info from Google+ API
            user_service = build('oauth2', 'v2', credentials=self.service._http.credentials)
            user_info = user_service.userinfo().get().execute()
            return user_info
        except HttpError as e:
            logger.error(f"Error getting user info: {str(e)}")
            raise Exception(f"Failed to get user info: {str(e)}")
    
    def list_files(self, page_size: int = 50, page_token: str = None, query: str = None) -> Dict:
        """List files from user's Google Drive"""
        if not self.service:
            raise Exception("Google Drive service not initialized")
        
        try:
            # Build query for video files
            if not query:
                video_queries = [f"mimeType='{mime}'" for mime in self.SUPPORTED_VIDEO_TYPES]
                query = f"({' or '.join(video_queries)}) and trashed=false"
            
            request_params = {
                'pageSize': min(page_size, 1000),
                'fields': 'nextPageToken, files(id, name, mimeType, size, createdTime, modifiedTime, parents, webViewLink, thumbnailLink, videoMediaMetadata)',
                'q': query,
                'orderBy': 'modifiedTime desc'
            }
            
            if page_token:
                request_params['pageToken'] = page_token
            
            result = self.service.files().list(**request_params).execute()
            
            # Process files and update database
            files_data = result.get('files', [])
            self._sync_files_to_database(files_data)
            
            return {
                'files': files_data,
                'next_page_token': result.get('nextPageToken'),
                'total_count': len(files_data)
            }
            
        except HttpError as e:
            logger.error(f"Error listing files: {str(e)}")
            raise Exception(f"Failed to list files: {str(e)}")
    
    def get_file_info(self, file_id: str) -> Dict:
        """Get detailed file information"""
        if not self.service:
            raise Exception("Google Drive service not initialized")
        
        try:
            file_info = self.service.files().get(
                fileId=file_id,
                fields='id, name, mimeType, size, createdTime, modifiedTime, webViewLink, thumbnailLink, videoMediaMetadata, parents'
            ).execute()
            
            # Update database
            self._sync_single_file_to_database(file_info)
            
            return file_info
            
        except HttpError as e:
            logger.error(f"Error getting file info for {file_id}: {str(e)}")
            raise Exception(f"Failed to get file info: {str(e)}")
    
    def get_streaming_url(self, file_id: str, force_refresh: bool = False) -> str:
        """Get direct streaming URL for a video file"""
        if not self.service:
            raise Exception("Google Drive service not initialized")
        
        try:
            # Check if we have a cached valid URL
            if not force_refresh and self.user_connection:
                drive_file = GoogleDriveFile.objects.filter(
                    connection=self.user_connection,
                    file_id=file_id
                ).first()
                
                if drive_file and drive_file.is_stream_url_valid():
                    return drive_file.stream_url
            
            # Generate new streaming URL
            # Note: Google Drive doesn't provide direct streaming URLs easily
            # We'll use the webViewLink and extract streaming URL or use export
            file_info = self.get_file_info(file_id)
            
            # For video files, we can try to get export URL
            if file_info.get('mimeType') in self.SUPPORTED_VIDEO_TYPES:
                # Try to get the download URL (requires permission)
                try:
                    export_url = f"https://drive.google.com/uc?id={file_id}&export=download"
                    
                    # Update database with new URL and expiration
                    if self.user_connection:
                        drive_file, created = GoogleDriveFile.objects.get_or_create(
                            connection=self.user_connection,
                            file_id=file_id,
                            defaults={'file_name': file_info.get('name', '')}
                        )
                        drive_file.stream_url = export_url
                        drive_file.stream_url_expires_at = timezone.now() + timedelta(hours=1)
                        drive_file.save()
                    
                    return export_url
                    
                except Exception as e:
                    logger.warning(f"Could not get direct download URL: {str(e)}")
            
            # Fallback to web view URL
            return file_info.get('webViewLink', '')
            
        except HttpError as e:
            logger.error(f"Error getting streaming URL for {file_id}: {str(e)}")
            raise Exception(f"Failed to get streaming URL: {str(e)}")
    
    def _sync_files_to_database(self, files_data: List[Dict]) -> None:
        """Sync file list to database"""
        if not self.user_connection:
            return
        
        for file_data in files_data:
            self._sync_single_file_to_database(file_data)
    
    def _sync_single_file_to_database(self, file_data: Dict) -> GoogleDriveFile:
        """Sync single file to database"""
        if not self.user_connection:
            return None
        
        try:
            file_obj, created = GoogleDriveFile.objects.get_or_create(
                connection=self.user_connection,
                file_id=file_data['id'],
                defaults={
                    'file_name': file_data.get('name', ''),
                    'mime_type': file_data.get('mimeType', ''),
                }
            )
            
            # Update file information
            file_obj.file_name = file_data.get('name', '')
            file_obj.mime_type = file_data.get('mimeType', '')
            file_obj.file_size = int(file_data.get('size', 0)) if file_data.get('size') else None
            file_obj.is_video = file_data.get('mimeType') in self.SUPPORTED_VIDEO_TYPES
            file_obj.thumbnail_url = file_data.get('thumbnailLink', '')
            
            # Video metadata
            video_metadata = file_data.get('videoMediaMetadata', {})
            if video_metadata:
                file_obj.duration = timedelta(milliseconds=int(video_metadata.get('durationMillis', 0)))
                file_obj.resolution = f"{video_metadata.get('width', 0)}x{video_metadata.get('height', 0)}"
            
            # Store full metadata
            file_obj.drive_metadata = file_data
            file_obj.can_stream = file_obj.is_video
            
            file_obj.save()
            
            if created:
                logger.info(f"Created new GoogleDriveFile: {file_obj.file_name}")
            
            return file_obj
            
        except Exception as e:
            logger.error(f"Error syncing file to database: {str(e)}")
            return None
    
    def search_files(self, query: str, file_type: str = 'video') -> List[Dict]:
        """Search files in Google Drive"""
        if not self.service:
            raise Exception("Google Drive service not initialized")
        
        try:
            # Build search query
            search_query = f"name contains '{query}' and trashed=false"
            
            if file_type == 'video':
                video_queries = [f"mimeType='{mime}'" for mime in self.SUPPORTED_VIDEO_TYPES]
                search_query += f" and ({' or '.join(video_queries)})"
            
            result = self.service.files().list(
                q=search_query,
                pageSize=50,
                fields='files(id, name, mimeType, size, thumbnailLink, videoMediaMetadata)'
            ).execute()
            
            files = result.get('files', [])
            self._sync_files_to_database(files)
            
            return files
            
        except HttpError as e:
            logger.error(f"Error searching files: {str(e)}")
            raise Exception(f"Failed to search files: {str(e)}")
    
    def check_file_permissions(self, file_id: str) -> Dict:
        """Check file permissions and sharing settings"""
        if not self.service:
            raise Exception("Google Drive service not initialized")
        
        try:
            permissions = self.service.permissions().list(fileId=file_id).execute()
            
            file_info = self.service.files().get(
                fileId=file_id,
                fields='id, name, shared, webViewLink'
            ).execute()
            
            return {
                'file_info': file_info,
                'permissions': permissions.get('permissions', []),
                'is_public': any(p.get('type') == 'anyone' for p in permissions.get('permissions', [])),
                'can_stream': True  # Will be determined based on permissions
            }
            
        except HttpError as e:
            logger.error(f"Error checking file permissions: {str(e)}")
            return {
                'file_info': {},
                'permissions': [],
                'is_public': False,
                'can_stream': False
            }
