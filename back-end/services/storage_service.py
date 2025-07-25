"""
Multi-Cloud Storage Service for Watch Party Backend
Provides unified interface for multiple cloud storage providers
"""

import os
import uuid
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
from django.conf import settings
from io import BytesIO
import json
import logging
from urllib.parse import urlparse
from datetime import datetime, timedelta

# Optional imports for different cloud providers
try:
    import boto3
    AWS_AVAILABLE = True
except ImportError:
    AWS_AVAILABLE = False
    boto3 = None

try:
    from google.oauth2.credentials import Credentials
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaIoBaseDownload, MediaFileUpload
    GOOGLE_AVAILABLE = True
except ImportError:
    GOOGLE_AVAILABLE = False
    Credentials = None
    build = None
    MediaIoBaseDownload = None
    MediaFileUpload = None

try:
    import dropbox
    DROPBOX_AVAILABLE = True
except ImportError:
    DROPBOX_AVAILABLE = False
    dropbox = None

try:
    from msal import ConfidentialClientApplication
    ONEDRIVE_AVAILABLE = True
except ImportError:
    ONEDRIVE_AVAILABLE = False
    ConfidentialClientApplication = None

try:
    import requests
    REQUESTS_AVAILABLE = True
except ImportError:
    REQUESTS_AVAILABLE = False
    requests = None

try:
    import ftplib
    FTP_AVAILABLE = True
except ImportError:
    FTP_AVAILABLE = False
    ftplib = None

logger = logging.getLogger(__name__)


class StorageServiceError(Exception):
    """Base exception for storage service errors"""
    pass


class StorageQuotaExceededError(StorageServiceError):
    """Raised when storage quota is exceeded"""
    pass


class FileNotFoundError(StorageServiceError):
    """Raised when file is not found in storage"""
    pass


class BaseStorageService(ABC):
    """Abstract base class for storage services"""
    
    def __init__(self, user_credentials: Dict[str, Any]):
        self.user_credentials = user_credentials
        self.client = None
        self._initialize_client()
    
    @abstractmethod
    def _initialize_client(self):
        """Initialize the storage client"""
        pass
    
    @abstractmethod
    def upload_file(self, file_path: str, file_name: str, folder_id: str = None) -> Dict[str, Any]:
        """Upload file to storage"""
        pass
    
    @abstractmethod
    def download_file(self, file_id: str, destination_path: str) -> bool:
        """Download file from storage"""
        pass
    
    @abstractmethod
    def get_file_info(self, file_id: str) -> Dict[str, Any]:
        """Get file metadata"""
        pass
    
    @abstractmethod
    def delete_file(self, file_id: str) -> bool:
        """Delete file from storage"""
        pass
    
    @abstractmethod
    def list_files(self, folder_id: str = None, limit: int = 100) -> List[Dict[str, Any]]:
        """List files in folder"""
        pass
    
    @abstractmethod
    def create_folder(self, folder_name: str, parent_folder_id: str = None) -> Dict[str, Any]:
        """Create a new folder"""
        pass
    
    @abstractmethod
    def get_streaming_url(self, file_id: str, expires_in: int = 3600) -> str:
        """Get streaming URL for video files"""
        pass
    
    @abstractmethod
    def get_storage_quota(self) -> Dict[str, Any]:
        """Get storage quota information"""
        pass


class GoogleDriveStorage(BaseStorageService):
    """Google Drive storage implementation"""
    
    def _initialize_client(self):
        """Initialize Google Drive client"""
        if not GOOGLE_AVAILABLE:
            logger.warning("Google APIs not available. Install google-api-python-client")
            return
            
        try:
            credentials = Credentials(
                token=self.user_credentials.get('access_token'),
                refresh_token=self.user_credentials.get('refresh_token'),
                token_uri='https://oauth2.googleapis.com/token',
                client_id=settings.GOOGLE_OAUTH2_CLIENT_ID,
                client_secret=settings.GOOGLE_OAUTH2_CLIENT_SECRET
            )
            self.client = build('drive', 'v3', credentials=credentials)
        except Exception as e:
            raise StorageServiceError(f"Failed to initialize Google Drive client: {str(e)}")
    
    def upload_file(self, file_path: str, file_name: str, folder_id: str = None) -> Dict[str, Any]:
        """Upload file to Google Drive"""
        if not GOOGLE_AVAILABLE:
            raise StorageServiceError("Google APIs not available. Install google-api-python-client")
        
        try:
            file_metadata = {
                'name': file_name,
                'parents': [folder_id] if folder_id else []
            }
            
            media = MediaFileUpload(file_path, resumable=True)
            
            file = self.client.files().create(
                body=file_metadata,
                media_body=media,
                fields='id,name,size,mimeType,webViewLink,webContentLink'
            ).execute()
            
            # Make file shareable for streaming
            self.client.permissions().create(
                fileId=file['id'],
                body={'role': 'reader', 'type': 'anyone'}
            ).execute()
            
            return {
                'file_id': file['id'],
                'name': file['name'],
                'size': int(file.get('size', 0)),
                'mime_type': file['mimeType'],
                'view_link': file['webViewLink'],
                'download_link': file.get('webContentLink'),
                'streaming_url': f"https://drive.google.com/uc?id={file['id']}&export=download"
            }
            
        except Exception as e:
            raise StorageServiceError(f"Failed to upload file to Google Drive: {str(e)}")
    
    def download_file(self, file_id: str, destination_path: str) -> bool:
        """Download file from Google Drive"""
        try:
            request = self.client.files().get_media(fileId=file_id)
            
            with open(destination_path, 'wb') as f:
                downloader = MediaIoBaseDownload(f, request)
                done = False
                while done is False:
                    status, done = downloader.next_chunk()
            
            return True
            
        except Exception as e:
            raise StorageServiceError(f"Failed to download file from Google Drive: {str(e)}")
    
    def get_file_info(self, file_id: str) -> Dict[str, Any]:
        """Get file metadata from Google Drive"""
        try:
            file = self.client.files().get(
                fileId=file_id,
                fields='id,name,size,mimeType,createdTime,modifiedTime,webViewLink'
            ).execute()
            
            return {
                'file_id': file['id'],
                'name': file['name'],
                'size': int(file.get('size', 0)),
                'mime_type': file['mimeType'],
                'created_at': file['createdTime'],
                'modified_at': file['modifiedTime'],
                'view_link': file['webViewLink']
            }
            
        except Exception as e:
            raise FileNotFoundError(f"File not found in Google Drive: {str(e)}")
    
    def delete_file(self, file_id: str) -> bool:
        """Delete file from Google Drive"""
        try:
            self.client.files().delete(fileId=file_id).execute()
            return True
        except Exception as e:
            raise StorageServiceError(f"Failed to delete file from Google Drive: {str(e)}")
    
    def list_files(self, folder_id: str = None, limit: int = 100) -> List[Dict[str, Any]]:
        """List files in Google Drive folder"""
        try:
            query = f"'{folder_id}' in parents" if folder_id else "trashed=false"
            
            results = self.client.files().list(
                q=query,
                pageSize=limit,
                fields="files(id,name,size,mimeType,createdTime)"
            ).execute()
            
            files = []
            for file in results.get('files', []):
                files.append({
                    'file_id': file['id'],
                    'name': file['name'],
                    'size': int(file.get('size', 0)),
                    'mime_type': file['mimeType'],
                    'created_at': file['createdTime']
                })
            
            return files
            
        except Exception as e:
            raise StorageServiceError(f"Failed to list files from Google Drive: {str(e)}")
    
    def create_folder(self, folder_name: str, parent_folder_id: str = None) -> Dict[str, Any]:
        """Create folder in Google Drive"""
        try:
            file_metadata = {
                'name': folder_name,
                'mimeType': 'application/vnd.google-apps.folder',
                'parents': [parent_folder_id] if parent_folder_id else []
            }
            
            folder = self.client.files().create(body=file_metadata, fields='id,name').execute()
            
            return {
                'folder_id': folder['id'],
                'name': folder['name']
            }
            
        except Exception as e:
            raise StorageServiceError(f"Failed to create folder in Google Drive: {str(e)}")
    
    def get_streaming_url(self, file_id: str, expires_in: int = 3600) -> str:
        """Get streaming URL for Google Drive file"""
        return f"https://drive.google.com/uc?id={file_id}&export=download"
    
    def get_storage_quota(self) -> Dict[str, Any]:
        """Get Google Drive storage quota"""
        try:
            about = self.client.about().get(fields='storageQuota').execute()
            quota = about['storageQuota']
            
            return {
                'total': int(quota.get('limit', 0)),
                'used': int(quota.get('usage', 0)),
                'available': int(quota.get('limit', 0)) - int(quota.get('usage', 0))
            }
            
        except Exception as e:
            raise StorageServiceError(f"Failed to get Google Drive quota: {str(e)}")


class AWSStorage(BaseStorageService):
    """AWS S3 storage implementation"""
    
    def _initialize_client(self):
        """Initialize AWS S3 client"""
        if not AWS_AVAILABLE:
            logger.warning("boto3 not available. Install boto3 for AWS S3 support")
            return
            
        try:
            self.client = boto3.client(
                's3',
                aws_access_key_id=self.user_credentials.get('access_key'),
                aws_secret_access_key=self.user_credentials.get('secret_key'),
                region_name=self.user_credentials.get('region', 'us-west-2')
            )
            self.bucket_name = self.user_credentials.get('bucket_name')
        except Exception as e:
            raise StorageServiceError(f"Failed to initialize AWS S3 client: {str(e)}")
    
    def upload_file(self, file_path: str, file_name: str, folder_id: str = None) -> Dict[str, Any]:
        """Upload file to AWS S3"""
        try:
            key = f"{folder_id}/{file_name}" if folder_id else file_name
            
            # Upload file
            self.client.upload_file(file_path, self.bucket_name, key)
            
            # Get file info
            response = self.client.head_object(Bucket=self.bucket_name, Key=key)
            
            return {
                'file_id': key,
                'name': file_name,
                'size': response['ContentLength'],
                'mime_type': response.get('ContentType', 'application/octet-stream'),
                'etag': response['ETag'].strip('"'),
                'last_modified': response['LastModified'].isoformat(),
                'url': f"https://{self.bucket_name}.s3.amazonaws.com/{key}"
            }
            
        except Exception as e:
            raise StorageServiceError(f"Failed to upload file to AWS S3: {str(e)}")
    
    def download_file(self, file_id: str, destination_path: str) -> bool:
        """Download file from AWS S3"""
        try:
            self.client.download_file(self.bucket_name, file_id, destination_path)
            return True
        except Exception as e:
            raise StorageServiceError(f"Failed to download file from AWS S3: {str(e)}")
    
    def get_file_info(self, file_id: str) -> Dict[str, Any]:
        """Get file metadata from AWS S3"""
        try:
            response = self.client.head_object(Bucket=self.bucket_name, Key=file_id)
            
            return {
                'file_id': file_id,
                'name': file_id.split('/')[-1],
                'size': response['ContentLength'],
                'mime_type': response.get('ContentType', 'application/octet-stream'),
                'etag': response['ETag'].strip('"'),
                'last_modified': response['LastModified'].isoformat()
            }
            
        except Exception as e:
            raise FileNotFoundError(f"File not found in AWS S3: {str(e)}")
    
    def delete_file(self, file_id: str) -> bool:
        """Delete file from AWS S3"""
        try:
            self.client.delete_object(Bucket=self.bucket_name, Key=file_id)
            return True
        except Exception as e:
            raise StorageServiceError(f"Failed to delete file from AWS S3: {str(e)}")
    
    def list_files(self, folder_id: str = None, limit: int = 100) -> List[Dict[str, Any]]:
        """List files in AWS S3 bucket"""
        try:
            kwargs = {'Bucket': self.bucket_name, 'MaxKeys': limit}
            if folder_id:
                kwargs['Prefix'] = folder_id + '/'
            
            response = self.client.list_objects_v2(**kwargs)
            
            files = []
            for obj in response.get('Contents', []):
                files.append({
                    'file_id': obj['Key'],
                    'name': obj['Key'].split('/')[-1],
                    'size': obj['Size'],
                    'last_modified': obj['LastModified'].isoformat()
                })
            
            return files
            
        except Exception as e:
            raise StorageServiceError(f"Failed to list files from AWS S3: {str(e)}")
    
    def create_folder(self, folder_name: str, parent_folder_id: str = None) -> Dict[str, Any]:
        """Create folder in AWS S3 (simulate with empty object)"""
        try:
            key = f"{parent_folder_id}/{folder_name}/" if parent_folder_id else f"{folder_name}/"
            
            self.client.put_object(Bucket=self.bucket_name, Key=key, Body=b'')
            
            return {
                'folder_id': key.rstrip('/'),
                'name': folder_name
            }
            
        except Exception as e:
            raise StorageServiceError(f"Failed to create folder in AWS S3: {str(e)}")
    
    def get_streaming_url(self, file_id: str, expires_in: int = 3600) -> str:
        """Get streaming URL for AWS S3 file"""
        try:
            url = self.client.generate_presigned_url(
                'get_object',
                Params={'Bucket': self.bucket_name, 'Key': file_id},
                ExpiresIn=expires_in
            )
            return url
        except Exception as e:
            raise StorageServiceError(f"Failed to generate streaming URL for AWS S3: {str(e)}")
    
    def get_storage_quota(self) -> Dict[str, Any]:
        """Get AWS S3 storage quota (not applicable, return unlimited)"""
        return {
            'total': -1,  # Unlimited
            'used': 0,    # Would need CloudWatch metrics
            'available': -1  # Unlimited
        }


class DropboxStorage(BaseStorageService):
    """Dropbox storage implementation"""
    
    def _initialize_client(self):
        """Initialize Dropbox client"""
        try:
            self.client = dropbox.Dropbox(self.user_credentials.get('access_token'))
        except Exception as e:
            raise StorageServiceError(f"Failed to initialize Dropbox client: {str(e)}")
    
    def upload_file(self, file_path: str, file_name: str, folder_id: str = None) -> Dict[str, Any]:
        """Upload file to Dropbox"""
        try:
            dropbox_path = f"/{folder_id}/{file_name}" if folder_id else f"/{file_name}"
            
            with open(file_path, 'rb') as f:
                file_size = os.path.getsize(file_path)
                
                if file_size <= 4 * 1024 * 1024:  # 4MB
                    # Simple upload for small files
                    result = self.client.files_upload(f.read(), dropbox_path)
                else:
                    # Chunked upload for large files
                    CHUNK_SIZE = 4 * 1024 * 1024
                    
                    session_start_result = self.client.files_upload_session_start(f.read(CHUNK_SIZE))
                    cursor = dropbox.files.UploadSessionCursor(
                        session_id=session_start_result.session_id,
                        offset=f.tell()
                    )
                    
                    while f.tell() < file_size:
                        if (file_size - f.tell()) <= CHUNK_SIZE:
                            # Final chunk
                            result = self.client.files_upload_session_finish(
                                f.read(CHUNK_SIZE),
                                cursor,
                                dropbox.files.CommitInfo(path=dropbox_path)
                            )
                        else:
                            self.client.files_upload_session_append_v2(f.read(CHUNK_SIZE), cursor)
                            cursor.offset = f.tell()
            
            return {
                'file_id': result.id,
                'name': result.name,
                'size': result.size,
                'path': result.path_display,
                'modified_at': result.client_modified.isoformat()
            }
            
        except Exception as e:
            raise StorageServiceError(f"Failed to upload file to Dropbox: {str(e)}")
    
    def download_file(self, file_id: str, destination_path: str) -> bool:
        """Download file from Dropbox"""
        try:
            with open(destination_path, 'wb') as f:
                metadata, response = self.client.files_download(path=file_id)
                f.write(response.content)
            return True
        except Exception as e:
            raise StorageServiceError(f"Failed to download file from Dropbox: {str(e)}")
    
    def get_file_info(self, file_id: str) -> Dict[str, Any]:
        """Get file metadata from Dropbox"""
        try:
            metadata = self.client.files_get_metadata(file_id)
            
            return {
                'file_id': metadata.id,
                'name': metadata.name,
                'size': metadata.size,
                'path': metadata.path_display,
                'modified_at': metadata.client_modified.isoformat()
            }
            
        except Exception as e:
            raise FileNotFoundError(f"File not found in Dropbox: {str(e)}")
    
    def delete_file(self, file_id: str) -> bool:
        """Delete file from Dropbox"""
        try:
            self.client.files_delete_v2(file_id)
            return True
        except Exception as e:
            raise StorageServiceError(f"Failed to delete file from Dropbox: {str(e)}")
    
    def list_files(self, folder_id: str = None, limit: int = 100) -> List[Dict[str, Any]]:
        """List files in Dropbox folder"""
        try:
            folder_path = f"/{folder_id}" if folder_id else ""
            
            result = self.client.files_list_folder(folder_path, limit=limit)
            
            files = []
            for entry in result.entries:
                if isinstance(entry, dropbox.files.FileMetadata):
                    files.append({
                        'file_id': entry.id,
                        'name': entry.name,
                        'size': entry.size,
                        'path': entry.path_display,
                        'modified_at': entry.client_modified.isoformat()
                    })
            
            return files
            
        except Exception as e:
            raise StorageServiceError(f"Failed to list files from Dropbox: {str(e)}")
    
    def create_folder(self, folder_name: str, parent_folder_id: str = None) -> Dict[str, Any]:
        """Create folder in Dropbox"""
        try:
            folder_path = f"/{parent_folder_id}/{folder_name}" if parent_folder_id else f"/{folder_name}"
            
            result = self.client.files_create_folder_v2(folder_path)
            
            return {
                'folder_id': result.metadata.id,
                'name': result.metadata.name
            }
            
        except Exception as e:
            raise StorageServiceError(f"Failed to create folder in Dropbox: {str(e)}")
    
    def get_streaming_url(self, file_id: str, expires_in: int = 3600) -> str:
        """Get streaming URL for Dropbox file"""
        try:
            result = self.client.files_get_temporary_link(file_id)
            return result.link
        except Exception as e:
            raise StorageServiceError(f"Failed to generate streaming URL for Dropbox: {str(e)}")
    
    def get_storage_quota(self) -> Dict[str, Any]:
        """Get Dropbox storage quota"""
        try:
            account_info = self.client.users_get_space_usage()
            
            return {
                'total': account_info.allocation.get_individual().allocated,
                'used': account_info.used,
                'available': account_info.allocation.get_individual().allocated - account_info.used
            }
            
        except Exception as e:
            raise StorageServiceError(f"Failed to get Dropbox quota: {str(e)}")


class StorageServiceFactory:
    """Factory class for creating storage service instances"""
    
    STORAGE_SERVICES = {
        'google_drive': GoogleDriveStorage,
        'aws_s3': AWSStorage,
        'dropbox': DropboxStorage,
    }
    
    @classmethod
    def create_service(cls, service_type: str, user_credentials: Dict[str, Any]) -> BaseStorageService:
        """Create storage service instance"""
        if service_type not in cls.STORAGE_SERVICES:
            raise ValueError(f"Unsupported storage service: {service_type}")
        
        service_class = cls.STORAGE_SERVICES[service_type]
        return service_class(user_credentials)
    
    @classmethod
    def get_available_services(cls) -> List[str]:
        """Get list of available storage services"""
        return list(cls.STORAGE_SERVICES.keys())


# Utility functions for storage management
def get_user_storage_services(user):
    """Get all connected storage services for a user"""
    from apps.integrations.models import CloudStorage
    
    connected_services = []
    storage_connections = CloudStorage.objects.filter(user=user, is_active=True)
    
    for connection in storage_connections:
        try:
            service = StorageServiceFactory.create_service(
                connection.provider,
                connection.get_decrypted_credentials()
            )
            connected_services.append({
                'id': connection.id,
                'provider': connection.provider,
                'service': service,
                'connected_at': connection.created_at
            })
        except Exception as e:
            # Log error but continue with other services
            pass
    
    return connected_services


def upload_video_to_all_services(user, file_path, file_name):
    """Upload video to all connected storage services"""
    services = get_user_storage_services(user)
    upload_results = []
    
    for service_info in services:
        try:
            result = service_info['service'].upload_file(file_path, file_name)
            result['provider'] = service_info['provider']
            result['connection_id'] = service_info['id']
            upload_results.append(result)
        except Exception as e:
            upload_results.append({
                'provider': service_info['provider'],
                'connection_id': service_info['id'],
                'error': str(e),
                'success': False
            })
    
    return upload_results


class OneDriveStorageService(BaseStorageService):
    """Microsoft OneDrive storage service implementation"""
    
    def __init__(self, user_credentials: Dict[str, Any]):
        self.client_id = getattr(settings, 'ONEDRIVE_CLIENT_ID', '')
        self.client_secret = getattr(settings, 'ONEDRIVE_CLIENT_SECRET', '')
        self.tenant_id = getattr(settings, 'ONEDRIVE_TENANT_ID', 'common')
        self.redirect_uri = getattr(settings, 'ONEDRIVE_REDIRECT_URI', '')
        super().__init__(user_credentials)
    
    def _initialize_client(self):
        """Initialize Microsoft Graph API client"""
        try:
            self.app = ConfidentialClientApplication(
                client_id=self.client_id,
                client_credential=self.client_secret,
                authority=f"https://login.microsoftonline.com/{self.tenant_id}"
            )
            
            # Get access token from stored credentials
            access_token = self.user_credentials.get('access_token')
            refresh_token = self.user_credentials.get('refresh_token')
            
            if not access_token:
                raise StorageServiceError("OneDrive access token not found")
            
            self.access_token = access_token
            self.refresh_token = refresh_token
            
        except Exception as e:
            raise StorageServiceError(f"Failed to initialize OneDrive client: {str(e)}")
    
    def _refresh_access_token(self):
        """Refresh the access token using refresh token"""
        try:
            result = self.app.acquire_token_by_refresh_token(
                refresh_token=self.refresh_token,
                scopes=['https://graph.microsoft.com/Files.ReadWrite']
            )
            
            if 'access_token' in result:
                self.access_token = result['access_token']
                # Update stored credentials
                self.user_credentials['access_token'] = self.access_token
                return True
            else:
                raise StorageServiceError("Failed to refresh OneDrive token")
                
        except Exception as e:
            raise StorageServiceError(f"Token refresh failed: {str(e)}")
    
    def _make_request(self, method: str, endpoint: str, **kwargs):
        """Make authenticated request to Microsoft Graph API"""
        headers = {
            'Authorization': f'Bearer {self.access_token}',
            'Content-Type': 'application/json'
        }
        
        if 'headers' in kwargs:
            headers.update(kwargs['headers'])
        kwargs['headers'] = headers
        
        base_url = 'https://graph.microsoft.com/v1.0'
        url = f"{base_url}{endpoint}"
        
        response = requests.request(method, url, **kwargs)
        
        # Handle token expiration
        if response.status_code == 401:
            self._refresh_access_token()
            headers['Authorization'] = f'Bearer {self.access_token}'
            response = requests.request(method, url, **kwargs)
        
        if not response.ok:
            raise StorageServiceError(f"OneDrive API error: {response.text}")
        
        return response
    
    def upload_file(self, file_path: str, remote_name: str = None, folder_path: str = None) -> Dict[str, Any]:
        """Upload file to OneDrive"""
        try:
            if not os.path.exists(file_path):
                raise FileNotFoundError(f"Local file not found: {file_path}")
            
            file_name = remote_name or os.path.basename(file_path)
            file_size = os.path.getsize(file_path)
            
            # For large files (>4MB), use resumable upload
            if file_size > 4 * 1024 * 1024:
                return self._upload_large_file(file_path, file_name, folder_path)
            else:
                return self._upload_small_file(file_path, file_name, folder_path)
                
        except Exception as e:
            raise StorageServiceError(f"Failed to upload file to OneDrive: {str(e)}")
    
    def _upload_small_file(self, file_path: str, file_name: str, folder_path: str = None):
        """Upload small file (<4MB) to OneDrive"""
        endpoint = f"/me/drive/root:/{file_name}:/content"
        if folder_path:
            endpoint = f"/me/drive/root:/{folder_path}/{file_name}:/content"
        
        with open(file_path, 'rb') as f:
            response = self._make_request(
                'PUT',
                endpoint,
                data=f.read(),
                headers={'Content-Type': 'application/octet-stream'}
            )
        
        file_info = response.json()
        return {
            'file_id': file_info['id'],
            'name': file_info['name'],
            'size': file_info['size'],
            'download_url': file_info.get('webUrl'),
            'success': True
        }
    
    def _upload_large_file(self, file_path: str, file_name: str, folder_path: str = None):
        """Upload large file (>4MB) using resumable upload"""
        endpoint = f"/me/drive/root:/{file_name}:/createUploadSession"
        if folder_path:
            endpoint = f"/me/drive/root:/{folder_path}/{file_name}:/createUploadSession"
        
        # Create upload session
        session_data = {
            "item": {
                "@microsoft.graph.conflictBehavior": "rename",
                "name": file_name
            }
        }
        
        response = self._make_request('POST', endpoint, json=session_data)
        upload_url = response.json()['uploadUrl']
        
        # Upload file in chunks
        chunk_size = 320 * 1024  # 320KB chunks
        file_size = os.path.getsize(file_path)
        
        with open(file_path, 'rb') as f:
            bytes_uploaded = 0
            while bytes_uploaded < file_size:
                chunk = f.read(chunk_size)
                chunk_length = len(chunk)
                
                headers = {
                    'Content-Range': f'bytes {bytes_uploaded}-{bytes_uploaded + chunk_length - 1}/{file_size}',
                    'Content-Length': str(chunk_length)
                }
                
                response = requests.put(upload_url, data=chunk, headers=headers)
                
                if response.status_code in [200, 201, 202]:
                    bytes_uploaded += chunk_length
                else:
                    raise StorageServiceError(f"Upload chunk failed: {response.text}")
        
        # Get final file info
        file_info = response.json()
        return {
            'file_id': file_info['id'],
            'name': file_info['name'],
            'size': file_info['size'],
            'download_url': file_info.get('webUrl'),
            'success': True
        }
    
    def get_file_url(self, file_id: str, expires_in: int = 3600) -> str:
        """Get temporary download URL for OneDrive file"""
        try:
            response = self._make_request('GET', f"/me/drive/items/{file_id}")
            file_info = response.json()
            
            # OneDrive files have a webUrl for viewing, but for direct download
            # we need to use the @microsoft.graph.downloadUrl
            if '@microsoft.graph.downloadUrl' in file_info:
                return file_info['@microsoft.graph.downloadUrl']
            else:
                return file_info.get('webUrl', '')
                
        except Exception as e:
            raise StorageServiceError(f"Failed to get OneDrive file URL: {str(e)}")
    
    def delete_file(self, file_id: str) -> bool:
        """Delete file from OneDrive"""
        try:
            self._make_request('DELETE', f"/me/drive/items/{file_id}")
            return True
        except Exception as e:
            raise StorageServiceError(f"Failed to delete file from OneDrive: {str(e)}")
    
    def get_file_info(self, file_id: str) -> Dict[str, Any]:
        """Get file metadata from OneDrive"""
        try:
            response = self._make_request('GET', f"/me/drive/items/{file_id}")
            file_info = response.json()
            
            return {
                'file_id': file_info['id'],
                'name': file_info['name'],
                'size': file_info.get('size', 0),
                'mime_type': file_info.get('file', {}).get('mimeType', ''),
                'created_at': file_info['createdDateTime'],
                'modified_at': file_info['lastModifiedDateTime'],
                'download_url': file_info.get('@microsoft.graph.downloadUrl', ''),
                'view_link': file_info.get('webUrl', '')
            }
            
        except Exception as e:
            raise FileNotFoundError(f"File not found in OneDrive: {str(e)}")
    
    def list_files(self, folder_id: str = None, limit: int = 100) -> List[Dict[str, Any]]:
        """List files in OneDrive folder"""
        try:
            endpoint = "/me/drive/root/children" if not folder_id else f"/me/drive/items/{folder_id}/children"
            endpoint += f"?$top={limit}"
            
            response = self._make_request('GET', endpoint)
            files_data = response.json()
            
            files = []
            for file_info in files_data.get('value', []):
                files.append({
                    'file_id': file_info['id'],
                    'name': file_info['name'],
                    'size': file_info.get('size', 0),
                    'created_at': file_info['createdDateTime'],
                    'is_folder': 'folder' in file_info
                })
            
            return files
            
        except Exception as e:
            raise StorageServiceError(f"Failed to list OneDrive files: {str(e)}")


class DropboxStorageService(BaseStorageService):
    """Dropbox storage service implementation"""
    
    def _initialize_client(self):
        """Initialize Dropbox client"""
        try:
            access_token = self.user_credentials.get('access_token')
            if not access_token:
                raise StorageServiceError("Dropbox access token not found")
            
            self.client = dropbox.Dropbox(access_token)
            
        except Exception as e:
            raise StorageServiceError(f"Failed to initialize Dropbox client: {str(e)}")
    
    def upload_file(self, file_path: str, remote_name: str = None, folder_path: str = None) -> Dict[str, Any]:
        """Upload file to Dropbox"""
        try:
            if not os.path.exists(file_path):
                raise FileNotFoundError(f"Local file not found: {file_path}")
            
            file_name = remote_name or os.path.basename(file_path)
            remote_path = f"/{file_name}"
            
            if folder_path:
                remote_path = f"/{folder_path.strip('/')}/{file_name}"
            
            file_size = os.path.getsize(file_path)
            
            # For large files (>150MB), use upload session
            if file_size > 150 * 1024 * 1024:
                return self._upload_large_file(file_path, remote_path, file_size)
            else:
                return self._upload_small_file(file_path, remote_path)
                
        except Exception as e:
            raise StorageServiceError(f"Failed to upload file to Dropbox: {str(e)}")
    
    def _upload_small_file(self, file_path: str, remote_path: str):
        """Upload small file to Dropbox"""
        with open(file_path, 'rb') as f:
            file_metadata = self.client.files_upload(
                f.read(),
                remote_path,
                mode=dropbox.files.WriteMode.overwrite
            )
        
        return {
            'file_id': file_metadata.id,
            'name': file_metadata.name,
            'size': file_metadata.size,
            'path': file_metadata.path_display,
            'success': True
        }
    
    def _upload_large_file(self, file_path: str, remote_path: str, file_size: int):
        """Upload large file using upload session"""
        chunk_size = 4 * 1024 * 1024  # 4MB chunks
        
        with open(file_path, 'rb') as f:
            # Start upload session
            session_start_result = self.client.files_upload_session_start(
                f.read(chunk_size)
            )
            session_id = session_start_result.session_id
            cursor = dropbox.files.UploadSessionCursor(
                session_id=session_id,
                offset=f.tell()
            )
            
            # Upload remaining chunks
            while f.tell() < file_size:
                chunk = f.read(chunk_size)
                if len(chunk) <= chunk_size:
                    # Last chunk
                    commit_info = dropbox.files.CommitInfo(
                        path=remote_path,
                        mode=dropbox.files.WriteMode.overwrite
                    )
                    file_metadata = self.client.files_upload_session_finish(
                        chunk, cursor, commit_info
                    )
                    break
                else:
                    # Regular chunk
                    self.client.files_upload_session_append_v2(chunk, cursor)
                    cursor.offset = f.tell()
        
        return {
            'file_id': file_metadata.id,
            'name': file_metadata.name,
            'size': file_metadata.size,
            'path': file_metadata.path_display,
            'success': True
        }
    
    def get_file_url(self, file_path: str, expires_in: int = 3600) -> str:
        """Get temporary download URL for Dropbox file"""
        try:
            # Create temporary link
            shared_link = self.client.files_get_temporary_link(file_path)
            return shared_link.link
            
        except Exception as e:
            raise StorageServiceError(f"Failed to get Dropbox file URL: {str(e)}")
    
    def delete_file(self, file_path: str) -> bool:
        """Delete file from Dropbox"""
        try:
            self.client.files_delete_v2(file_path)
            return True
        except Exception as e:
            raise StorageServiceError(f"Failed to delete file from Dropbox: {str(e)}")
    
    def get_file_info(self, file_path: str) -> Dict[str, Any]:
        """Get file metadata from Dropbox"""
        try:
            metadata = self.client.files_get_metadata(file_path)
            
            return {
                'file_id': metadata.id,
                'name': metadata.name,
                'size': getattr(metadata, 'size', 0),
                'path': metadata.path_display,
                'created_at': getattr(metadata, 'client_modified', None),
                'modified_at': getattr(metadata, 'server_modified', None)
            }
            
        except Exception as e:
            raise FileNotFoundError(f"File not found in Dropbox: {str(e)}")
    
    def list_files(self, folder_path: str = "", limit: int = 100) -> List[Dict[str, Any]]:
        """List files in Dropbox folder"""
        try:
            if not folder_path:
                folder_path = ""
            
            result = self.client.files_list_folder(folder_path, limit=limit)
            
            files = []
            for entry in result.entries:
                files.append({
                    'file_id': entry.id,
                    'name': entry.name,
                    'path': entry.path_display,
                    'size': getattr(entry, 'size', 0),
                    'is_folder': isinstance(entry, dropbox.files.FolderMetadata)
                })
            
            return files
            
        except Exception as e:
            raise StorageServiceError(f"Failed to list Dropbox files: {str(e)}")


# Factory function to create appropriate storage service
def get_storage_service(provider: str, credentials: Dict[str, Any]) -> BaseStorageService:
    """Factory function to create storage service based on provider"""
    
    providers = {
        'aws_s3': AWSStorage,
        'google_drive': GoogleDriveStorage,
        'onedrive': OneDriveStorageService,
        'dropbox': DropboxStorageService,
    }
    
    if provider not in providers:
        raise ValueError(f"Unsupported storage provider: {provider}")
    
    return providers[provider](credentials)


class StorageService:
    """Main storage service with multi-cloud support"""
    
    def __init__(self):
        self.providers = {}
        
    def add_provider(self, provider_name: str, credentials: Dict[str, Any]):
        """Add a storage provider"""
        self.providers[provider_name] = get_storage_service(provider_name, credentials)
    
    def upload_to_s3(self, file_path: str, file_name: str, bucket: str = None) -> Dict[str, Any]:
        """Upload file to AWS S3"""
        if 'aws_s3' not in self.providers:
            # Create S3 service with default credentials
            self.providers['aws_s3'] = AWSStorage({})
        
        return self.providers['aws_s3'].upload_file(file_path, file_name, bucket)
    
    def upload_to_onedrive(self, file_path: str, file_name: str, folder_path: str = None) -> Dict[str, Any]:
        """Upload file to OneDrive"""
        if 'onedrive' not in self.providers:
            self.providers['onedrive'] = OneDriveStorageService({})
        
        return self.providers['onedrive'].upload_file(file_path, file_name, folder_path)
    
    def upload_to_dropbox(self, file_path: str, file_name: str, folder_path: str = None) -> Dict[str, Any]:
        """Upload file to Dropbox"""
        if 'dropbox' not in self.providers:
            self.providers['dropbox'] = DropboxStorageService({})
        
        return self.providers['dropbox'].upload_file(file_path, file_name, folder_path)
    
    def upload_to_google_drive(self, file_path: str, file_name: str, folder_id: str = None) -> Dict[str, Any]:
        """Upload file to Google Drive"""
        if 'google_drive' not in self.providers:
            self.providers['google_drive'] = GoogleDriveStorage({})
        
        return self.providers['google_drive'].upload_file(file_path, file_name, folder_id)
