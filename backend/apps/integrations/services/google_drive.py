"""Google Drive integration service."""
import logging
import mimetypes
import os
from datetime import timedelta
from typing import Dict, List, Optional, Callable, Any

from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist
from django.utils import timezone
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

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

        scopes = getattr(
            settings,
            'GOOGLE_DRIVE_SCOPES',
            [
                'https://www.googleapis.com/auth/drive.readonly',
                'https://www.googleapis.com/auth/drive.file',
            ],
        )

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
                scopes=scopes
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
        self._refresh_credentials_if_needed()
        file_info = self.drive_service.files().get(
            fileId=file_id,
            fields=(
                "id,name,mimeType,size,thumbnailLink,videoMediaMetadata,"
                "webContentLink,webViewLink"
            )
        ).execute()

        download_url = file_info.get('webContentLink')
        if not download_url:
            download_url = self.get_download_url(file_info.get('id', file_id))

        video_metadata = file_info.get('videoMediaMetadata') or {}

        return {
            'id': file_info['id'],
            'name': file_info['name'],
            'mime_type': file_info['mimeType'],
            'size': int(file_info.get('size', 0)),
            'thumbnail_url': file_info.get('thumbnailLink', ''),
            'download_url': download_url,
            'web_view_link': file_info.get('webViewLink', ''),
            'video_metadata': video_metadata,
        }

    def get_download_url(self, file_id: str) -> str:
        """Get download URL for a file."""
        return f"https://drive.google.com/uc?export=download&id={file_id}"

    def upload_file(
        self,
        file_path: str,
        name: Optional[str] = None,
        folder_id: Optional[str] = None,
        mime_type: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Upload a file to Google Drive."""
        self._refresh_credentials_if_needed()

        resolved_name = name or os.path.basename(file_path)
        resolved_mime = mime_type or mimetypes.guess_type(resolved_name)[0] or 'application/octet-stream'

        metadata: Dict[str, Any] = {'name': resolved_name}
        if folder_id:
            metadata['parents'] = [folder_id]

        media = MediaFileUpload(file_path, mimetype=resolved_mime, resumable=True)

        try:
            request = self.drive_service.files().create(
                body=metadata,
                media_body=media,
                fields="id,name,mimeType,size,webContentLink",
            )
            result = request.execute()
        except Exception as exc:  # pragma: no cover - defensive logging
            logger.error("Failed to upload file to Google Drive: %s", exc)
            raise

        file_id = result.get('id')

        return {
            'id': file_id,
            'name': result.get('name', resolved_name),
            'mime_type': result.get('mimeType', resolved_mime),
            'size': int(result.get('size', 0)),
            'download_url': result.get('webContentLink') or (
                self.get_download_url(file_id) if file_id else ''
            ),
        }

    def delete_file(self, file_id: str) -> bool:
        """Delete a file from Google Drive."""
        self._refresh_credentials_if_needed()
        try:
            self.drive_service.files().delete(fileId=file_id).execute()
            return True
        except Exception as exc:  # pragma: no cover - defensive logging
            logger.error("Failed to delete file %s from Google Drive: %s", file_id, exc)
            return False

    def generate_streaming_url(self, file_id: str, force_refresh: bool = False) -> str:
        """Generate a streaming URL for a file."""
        if force_refresh and self.credentials and self.credentials.refresh_token:
            try:
                self.credentials.refresh(Request())
                if self.on_credentials_updated:
                    self.on_credentials_updated(self.credentials)
            except Exception as exc:  # pragma: no cover - defensive logging
                logger.error("Forced refresh of Google Drive credentials failed: %s", exc)
                raise

        self._refresh_credentials_if_needed()

        try:
            file_info = self.drive_service.files().get(
                fileId=file_id,
                fields="id,webContentLink",
            ).execute()
        except Exception as exc:  # pragma: no cover - defensive logging
            logger.error("Failed to generate streaming URL for %s: %s", file_id, exc)
            raise

        streaming_url = file_info.get('webContentLink')
        if not streaming_url:
            streaming_url = self.get_download_url(file_id)

        if not streaming_url:
            raise ValueError("Streaming URL not available")

        return streaming_url


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