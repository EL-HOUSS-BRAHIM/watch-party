"""Google Drive integration service."""
import logging
from datetime import timedelta
from typing import Dict, List, Optional, Callable, Any

from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist
from django.utils import timezone
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

logger = logging.getLogger(__name__)


class GoogleDriveService:
    """Service for interacting with Google Drive API."""
    
    def __init__(
        self,
        access_token: str = None,
        refresh_token: str = None,
        token_expiry = None,
        on_credentials_updated: Optional[Callable] = None,
        drive_service=None,
        credentials=None
    ):
        """Initialize Google Drive service."""
        self.on_credentials_updated = on_credentials_updated
        
        if drive_service:
            self.drive_service = drive_service
            self.credentials = credentials
        else:
            # Create credentials from tokens
            self.credentials = Credentials(
                token=access_token,
                refresh_token=refresh_token,
                token_uri='https://oauth2.googleapis.com/token',
                client_id=getattr(settings, 'GOOGLE_DRIVE_CLIENT_ID', ''),
                client_secret=getattr(settings, 'GOOGLE_DRIVE_CLIENT_SECRET', ''),
                scopes=['https://www.googleapis.com/auth/drive.readonly']
            )
            
            if token_expiry:
                self.credentials.expiry = token_expiry
                
            self._refresh_credentials_if_needed()
            self.drive_service = build('drive', 'v3', credentials=self.credentials)
    
    def _refresh_credentials_if_needed(self):
        """Refresh credentials if they are expired."""
        if self.credentials and self.credentials.expired and self.credentials.refresh_token:
            try:
                self.credentials.refresh(Request())
                if self.on_credentials_updated:
                    self.on_credentials_updated(self.credentials)
                logger.info("Google Drive credentials refreshed successfully")
            except Exception as e:
                logger.error(f"Failed to refresh Google Drive credentials: {e}")
                raise
    
    def get_or_create_watch_party_folder(self, folder_name: str = 'Watch Party') -> str:
        """Get or create the Watch Party folder in Google Drive."""
        # Search for existing folder
        query = f"name='{folder_name}' and mimeType='application/vnd.google-apps.folder' and trashed=false"
        results = self.drive_service.files().list(q=query).execute()
        files = results.get('files', [])
        
        if files:
            return files[0]['id']
        
        # Create new folder
        folder_metadata = {
            'name': folder_name,
            'mimeType': 'application/vnd.google-apps.folder'
        }
        folder = self.drive_service.files().create(body=folder_metadata).execute()
        return folder.get('id')
    
    def list_files(self, folder_id: str = None, mime_type: str = None) -> Dict[str, List]:
        """List files in Google Drive."""
        query_parts = ["trashed=false"]
        
        if folder_id:
            query_parts.append(f"'{folder_id}' in parents")
        if mime_type:
            query_parts.append(f"mimeType='{mime_type}'")
            
        query = " and ".join(query_parts)
        
        results = self.drive_service.files().list(
            q=query,
            fields="files(id,name,mimeType,size,thumbnailLink,createdTime,modifiedTime,videoMediaMetadata)"
        ).execute()
        
        return results
    
    def list_videos(self, folder_id: str = None) -> List[Dict[str, Any]]:
        """List video files with formatted metadata."""
        results = self.list_files(folder_id=folder_id, mime_type="video/*")
        videos = []
        
        for file_data in results.get('files', []):
            video_meta = file_data.get('videoMediaMetadata', {})
            video = {
                'id': file_data['id'],
                'name': file_data['name'],
                'mime_type': file_data['mimeType'],
                'size': int(file_data.get('size', 0)),
                'thumbnail_url': file_data.get('thumbnailLink', ''),
                'created_time': file_data.get('createdTime', ''),
                'modified_time': file_data.get('modifiedTime', ''),
                'duration': int(video_meta.get('durationMillis', 0)) // 1000,  # Convert to seconds
                'resolution': f"{video_meta.get('width', 0)}x{video_meta.get('height', 0)}" if video_meta.get('width') else '',
            }
            videos.append(video)
            
        return videos
    
    def get_file_info(self, file_id: str) -> Dict[str, Any]:
        """Get file information."""
        file_info = self.drive_service.files().get(
            fileId=file_id,
            fields="id,name,mimeType,size,thumbnailLink,videoMediaMetadata"
        ).execute()
        
        return {
            'id': file_info['id'],
            'name': file_info['name'],
            'mime_type': file_info['mimeType'],
            'size': int(file_info.get('size', 0)),
            'thumbnail_url': file_info.get('thumbnailLink', ''),
        }
    
    def get_download_url(self, file_id: str) -> str:
        """Get download URL for a file."""
        return f"https://drive.google.com/uc?export=download&id={file_id}"
    
    def get_streaming_url(self, file_id: str, force_refresh: bool = False) -> str:
        """Get streaming URL for a video file."""
        # For now, use the download URL as streaming URL
        return self.get_download_url(file_id)


def get_drive_service_for_user(user) -> GoogleDriveService:
    """Get Google Drive service instance for a user."""
    try:
        profile = user.profile
    except ObjectDoesNotExist as exc:
        raise ValueError("User profile not found") from exc
    
    if not profile.google_drive_connected:
        raise ValueError("User has not connected Google Drive")
    
    if not profile.google_drive_token or not profile.google_drive_refresh_token:
        raise ValueError("User Google Drive credentials are incomplete")
    
    def on_credentials_updated(credentials):
        """Update user profile with refreshed credentials."""
        profile.google_drive_token = credentials.token
        profile.google_drive_refresh_token = credentials.refresh_token
        if credentials.expiry:
            profile.google_drive_token_expires_at = timezone.make_aware(credentials.expiry)
        profile.save()
    
    return GoogleDriveService(
        access_token=profile.google_drive_token,
        refresh_token=profile.google_drive_refresh_token,
        token_expiry=profile.google_drive_token_expires_at,
        on_credentials_updated=on_credentials_updated
    )


# Alias for backward compatibility
get_drive_service = get_drive_service_for_user