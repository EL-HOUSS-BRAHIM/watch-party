"""Google Drive integration service."""

import logging
import mimetypes
import os
from datetime import timedelta
from http import HTTPStatus
from typing import Any, Callable, Dict, List, Optional

from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist
from django.utils import timezone
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from googleapiclient.http import MediaFileUpload


class GoogleDriveServiceError(Exception):
    """Raised when an interaction with Google Drive fails."""

    def __init__(self, message: str, status_code: int = HTTPStatus.INTERNAL_SERVER_ERROR):
        super().__init__(message)
        self.status_code = int(status_code)

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
                # Google's Credentials.expired compares against datetime.utcnow() (naive)
                # So we need to convert timezone-aware datetime to naive UTC
                if timezone.is_aware(token_expiry):
                    token_expiry = token_expiry.replace(tzinfo=None)
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
                logger.error("Failed to refresh Google Drive credentials: %s", e)
                raise

    @staticmethod
    def _extract_status_code(exc: Exception) -> int:
        """Best-effort extraction of an HTTP status code from Drive errors."""
        if isinstance(exc, GoogleDriveServiceError):
            return exc.status_code

        if isinstance(exc, HttpError):
            response = getattr(exc, 'resp', None)
            if response is not None:
                status = getattr(response, 'status', None)
                if status:
                    return int(status)

        status_code = getattr(exc, 'status_code', None)
        if status_code:
            return int(status_code)

        response = getattr(exc, 'resp', None)
        if response is not None:
            status = getattr(response, 'status', None)
            if status:
                return int(status)

        return HTTPStatus.INTERNAL_SERVER_ERROR

    def _build_file_payload(
        self,
        file_resource: Dict[str, Any],
        *,
        streaming_url: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Format a Drive file resource into the payload expected by consumers."""

        file_id = file_resource.get('id') or ''
        download_url = file_resource.get('webContentLink') or self.get_download_url(file_id)
        resolved_streaming = streaming_url or file_resource.get('webContentLink')
        if not resolved_streaming:
            resolved_streaming = file_resource.get('webViewLink') or download_url

        return {
            'id': file_id,
            'name': file_resource.get('name', ''),
            'mime_type': file_resource.get('mimeType', ''),
            'size': int(file_resource.get('size', 0) or 0),
            'download_url': download_url,
            'streaming_url': resolved_streaming,
        }

    def _fetch_file_metadata(self, file_id: str, fields: Optional[str] = None) -> Dict[str, Any]:
        """Retrieve file metadata from Drive for subsequent processing."""

        metadata_fields = fields or "id,name,mimeType,size,webContentLink,webViewLink"
        try:
            request = self.drive_service.files().get(
                fileId=file_id,
                fields=metadata_fields,
            )
            return request.execute()
        except Exception as exc:  # pragma: no cover - defensive logging
            logger.error("Failed to fetch metadata for Google Drive file %s: %s", file_id, exc)
            status_code = self._extract_status_code(exc)
            raise GoogleDriveServiceError(
                f"Unable to retrieve metadata for file '{file_id}'",
                status_code=status_code,
            ) from exc
    
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
            # Use 'contains' for wildcard mime types like 'video/*', exact match otherwise
            if mime_type.endswith('/*'):
                base_type = mime_type[:-2]  # Remove '/*' -> 'video'
                query_parts.append(f"mimeType contains '{base_type}/'")
            else:
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
                fields="id",
            )
            result = request.execute()
        except Exception as exc:  # pragma: no cover - defensive logging
            logger.error("Failed to upload file to Google Drive: %s", exc)
            status_code = self._extract_status_code(exc)
            raise GoogleDriveServiceError(
                f"Failed to upload file '{resolved_name}' to Google Drive",
                status_code=status_code,
            ) from exc

        file_id = result.get('id')
        if not file_id:
            raise GoogleDriveServiceError(
                "Google Drive did not return a file identifier for the upload",
                status_code=HTTPStatus.BAD_GATEWAY,
            )

        metadata = self._fetch_file_metadata(file_id)
        return self._build_file_payload(metadata)

    def delete_file(self, file_id: str) -> Dict[str, Any]:
        """Delete a file from Google Drive."""
        self._refresh_credentials_if_needed()
        metadata = self._fetch_file_metadata(file_id)
        try:
            self.drive_service.files().delete(fileId=file_id).execute()
        except Exception as exc:  # pragma: no cover - defensive logging
            logger.error("Failed to delete file %s from Google Drive: %s", file_id, exc)
            status_code = self._extract_status_code(exc)
            raise GoogleDriveServiceError(
                f"Failed to delete Google Drive file '{file_id}'",
                status_code=status_code,
            ) from exc

        payload = self._build_file_payload(metadata)
        payload['deleted'] = True
        return payload

    def generate_streaming_url(self, file_id: str, force_refresh: bool = False) -> Dict[str, Any]:
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

        metadata = self._fetch_file_metadata(file_id)

        streaming_url = metadata.get('webContentLink') or metadata.get('webViewLink')
        if not streaming_url:
            streaming_url = self.get_download_url(file_id)

        if not streaming_url:
            raise GoogleDriveServiceError(
                f"Streaming URL not available for file '{file_id}'",
                status_code=HTTPStatus.NOT_FOUND,
            )

        return self._build_file_payload(metadata, streaming_url=streaming_url)


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
