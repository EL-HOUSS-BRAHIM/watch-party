"""
Google Drive Service for Watch Party Backend
Handles Google Drive API interactions for movie management
"""

import os
import logging
from typing import List, Dict, Optional, Any
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from django.conf import settings

logger = logging.getLogger(__name__)


class GoogleDriveService:
    """Service class for Google Drive API interactions"""
    
    SCOPES = [
        'https://www.googleapis.com/auth/drive.readonly',
        'https://www.googleapis.com/auth/drive.file'
    ]
    
    VIDEO_MIME_TYPES = [
        'video/mp4',
        'video/avi',
        'video/mov',
        'video/mkv',
        'video/webm',
        'video/quicktime',
        'video/x-msvideo',
        'video/x-matroska'
    ]
    
    def __init__(self, access_token: str, refresh_token: str = None):
        """Initialize Google Drive service with user credentials"""
        self.access_token = access_token
        self.refresh_token = refresh_token
        self.service = None
        self._build_service()
    
    def _build_service(self):
        """Build Google Drive API service"""
        try:
            creds = Credentials(
                token=self.access_token,
                refresh_token=self.refresh_token,
                token_uri='https://oauth2.googleapis.com/token',
                client_id=getattr(settings, 'GOOGLE_OAUTH2_CLIENT_ID', ''),
                client_secret=getattr(settings, 'GOOGLE_OAUTH2_CLIENT_SECRET', ''),
                scopes=self.SCOPES
            )
            
            # Refresh token if expired
            if creds.expired and creds.refresh_token:
                creds.refresh(Request())
                self.access_token = creds.token
            
            self.service = build('drive', 'v3', credentials=creds)
            
        except Exception as e:
            logger.error(f"Failed to build Google Drive service: {str(e)}")
            raise
    
    def list_videos(self, folder_id: str = None, page_size: int = 50) -> List[Dict[str, Any]]:
        """List video files from Google Drive"""
        try:
            query_parts = [f"mimeType='{mime}'" for mime in self.VIDEO_MIME_TYPES]
            query = f"({' or '.join(query_parts)}) and trashed=false"
            
            if folder_id:
                query += f" and '{folder_id}' in parents"
            
            results = self.service.files().list(
                q=query,
                pageSize=page_size,
                fields="nextPageToken, files(id, name, size, mimeType, thumbnailLink, videoMediaMetadata, createdTime, modifiedTime)"
            ).execute()
            
            items = results.get('files', [])
            
            # Format the response
            videos = []
            for item in items:
                video_data = {
                    'id': item['id'],
                    'name': item['name'],
                    'size': int(item.get('size', 0)),
                    'mime_type': item['mimeType'],
                    'thumbnail_url': item.get('thumbnailLink', ''),
                    'created_time': item.get('createdTime'),
                    'modified_time': item.get('modifiedTime'),
                    'duration': None,
                    'resolution': None
                }
                
                # Extract video metadata if available
                if 'videoMediaMetadata' in item:
                    metadata = item['videoMediaMetadata']
                    video_data['duration'] = metadata.get('durationMillis')
                    video_data['resolution'] = f"{metadata.get('width', 0)}x{metadata.get('height', 0)}"
                
                videos.append(video_data)
            
            return videos
            
        except HttpError as e:
            logger.error(f"Failed to list videos from Google Drive: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error listing videos: {str(e)}")
            raise
    
    def get_file_info(self, file_id: str) -> Dict[str, Any]:
        """Get detailed information about a specific file"""
        try:
            file_info = self.service.files().get(
                fileId=file_id,
                fields="id, name, size, mimeType, thumbnailLink, videoMediaMetadata, createdTime, modifiedTime, webContentLink"
            ).execute()
            
            return {
                'id': file_info['id'],
                'name': file_info['name'],
                'size': int(file_info.get('size', 0)),
                'mime_type': file_info['mimeType'],
                'thumbnail_url': file_info.get('thumbnailLink', ''),
                'download_url': file_info.get('webContentLink', ''),
                'created_time': file_info.get('createdTime'),
                'modified_time': file_info.get('modifiedTime'),
                'video_metadata': file_info.get('videoMediaMetadata', {})
            }
            
        except HttpError as e:
            logger.error(f"Failed to get file info from Google Drive: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error getting file info: {str(e)}")
            raise
    
    def get_download_url(self, file_id: str) -> str:
        """Get download URL for a file"""
        try:
            # For video files, we need to use webContentLink or generate a direct download link
            file_info = self.service.files().get(
                fileId=file_id,
                fields="webContentLink"
            ).execute()
            
            download_url = file_info.get('webContentLink')
            if not download_url:
                # Generate direct download link
                download_url = f"https://drive.google.com/uc?id={file_id}&export=download"
            
            return download_url
            
        except HttpError as e:
            logger.error(f"Failed to get download URL from Google Drive: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error getting download URL: {str(e)}")
            raise
    
    def upload_file(self, file_path: str, name: str, folder_id: str = None) -> Dict[str, Any]:
        """Upload a file to Google Drive"""
        try:
            from googleapiclient.http import MediaFileUpload
            
            # Detect MIME type
            import mimetypes
            mime_type, _ = mimetypes.guess_type(file_path)
            if not mime_type:
                mime_type = 'application/octet-stream'
            
            file_metadata = {
                'name': name
            }
            
            if folder_id:
                file_metadata['parents'] = [folder_id]
            
            media = MediaFileUpload(file_path, mimetype=mime_type, resumable=True)
            
            file = self.service.files().create(
                body=file_metadata,
                media_body=media,
                fields='id, name, size, mimeType'
            ).execute()
            
            return {
                'id': file['id'],
                'name': file['name'],
                'size': int(file.get('size', 0)),
                'mime_type': file['mimeType']
            }
            
        except HttpError as e:
            logger.error(f"Failed to upload file to Google Drive: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error uploading file: {str(e)}")
            raise
    
    def delete_file(self, file_id: str) -> bool:
        """Delete a file from Google Drive"""
        try:
            self.service.files().delete(fileId=file_id).execute()
            return True
            
        except HttpError as e:
            logger.error(f"Failed to delete file from Google Drive: {str(e)}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error deleting file: {str(e)}")
            return False
    
    def create_folder(self, name: str, parent_folder_id: str = None) -> Dict[str, Any]:
        """Create a folder in Google Drive"""
        try:
            file_metadata = {
                'name': name,
                'mimeType': 'application/vnd.google-apps.folder'
            }
            
            if parent_folder_id:
                file_metadata['parents'] = [parent_folder_id]
            
            folder = self.service.files().create(
                body=file_metadata,
                fields='id, name'
            ).execute()
            
            return {
                'id': folder['id'],
                'name': folder['name']
            }
            
        except HttpError as e:
            logger.error(f"Failed to create folder in Google Drive: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error creating folder: {str(e)}")
            raise
    
    def get_or_create_watch_party_folder(self) -> str:
        """Get or create the Watch Party folder in user's Google Drive"""
        try:
            # Search for existing Watch Party folder
            results = self.service.files().list(
                q="name='Watch Party Movies' and mimeType='application/vnd.google-apps.folder' and trashed=false",
                spaces='drive',
                fields='files(id, name)'
            ).execute()
            
            folders = results.get('files', [])
            
            if folders:
                return folders[0]['id']
            else:
                # Create the folder
                folder = self.create_folder('Watch Party Movies')
                return folder['id']
                
        except Exception as e:
            logger.error(f"Failed to get or create Watch Party folder: {str(e)}")
            raise
    
    def generate_streaming_url(self, file_id: str) -> str:
        """Generate a streaming URL for video playback"""
        # For streaming, we use the file ID to create a direct streaming link
        # This would typically be proxied through our backend for security
        return f"https://drive.google.com/file/d/{file_id}/preview"


def get_drive_service(user) -> GoogleDriveService:
    """Factory function to create GoogleDriveService for a user"""
    if not hasattr(user, 'profile') or not user.profile.google_drive_connected:
        raise ValueError("User does not have Google Drive connected")
    
    return GoogleDriveService(
        access_token=user.profile.google_drive_token,
        refresh_token=user.profile.google_drive_refresh_token
    )
