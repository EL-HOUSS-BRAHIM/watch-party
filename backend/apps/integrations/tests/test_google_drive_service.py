import os
from datetime import timedelta
from unittest.mock import MagicMock, patch

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.testing")

import django

django.setup()

from django.core.management import call_command

call_command('migrate', run_syncdb=True, verbosity=0)

from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from django.utils import timezone

from apps.authentication.models import UserProfile
from apps.integrations.services.google_drive import (
    GoogleDriveService,
    GoogleDriveServiceError,
    get_drive_service_for_user,
)


class GoogleDriveServiceHelperTests(TestCase):
    @override_settings(GOOGLE_DRIVE_CLIENT_ID='client', GOOGLE_DRIVE_CLIENT_SECRET='secret')
    def test_get_drive_service_for_user_requires_credentials(self):
        user = get_user_model().objects.create_user(
            email='user@example.com',
            first_name='Integration',
            last_name='Tester',
            password='pass12345',
        )

        with self.assertRaises(ValueError):
            get_drive_service_for_user(user)

        UserProfile.objects.create(user=user, google_drive_connected=True)

        with self.assertRaises(ValueError):
            get_drive_service_for_user(user)

    @override_settings(GOOGLE_DRIVE_CLIENT_ID='client', GOOGLE_DRIVE_CLIENT_SECRET='secret')
    def test_get_drive_service_for_user_updates_profile_tokens(self):
        user = get_user_model().objects.create_user(
            email='drive@example.com',
            first_name='Drive',
            last_name='Tester',
            password='pass12345',
        )
        existing_expiry = timezone.now() + timedelta(minutes=10)

        profile = UserProfile.objects.create(
            user=user,
            google_drive_connected=True,
            google_drive_token='token-123',
            google_drive_refresh_token='refresh-123',
            google_drive_token_expires_at=existing_expiry,
        )

        with patch('apps.integrations.services.google_drive.GoogleDriveService') as service_cls:
            service_instance = MagicMock()
            service_cls.return_value = service_instance

            result = get_drive_service_for_user(user)

            service_cls.assert_called_once()
            kwargs = service_cls.call_args.kwargs
            self.assertEqual(kwargs['access_token'], 'token-123')
            self.assertEqual(kwargs['refresh_token'], 'refresh-123')
            self.assertEqual(kwargs['token_expiry'], existing_expiry)
            self.assertIn('on_credentials_updated', kwargs)
            callback = kwargs['on_credentials_updated']
            self.assertTrue(callable(callback))

            refreshed_expiry = (timezone.now() + timedelta(hours=1)).replace(tzinfo=None)
            credentials = MagicMock(
                token='new-token',
                refresh_token='new-refresh',
                expiry=refreshed_expiry,
            )
            callback(credentials)
            profile.refresh_from_db()
            self.assertEqual(profile.google_drive_token, 'new-token')
            self.assertEqual(profile.google_drive_refresh_token, 'new-refresh')
            expected_expiry = timezone.make_aware(refreshed_expiry)
            self.assertEqual(profile.google_drive_token_expires_at, expected_expiry)
            self.assertTrue(timezone.is_aware(profile.google_drive_token_expires_at))
            self.assertIs(result, service_instance)


class GoogleDriveServiceUnitTests(TestCase):
    def test_get_or_create_watch_party_folder_returns_existing(self):
        files_api = MagicMock()
        files_api.list.return_value.execute.return_value = {
            'files': [{'id': 'existing-folder'}]
        }

        drive_service = MagicMock()
        drive_service.files.return_value = files_api

        service = GoogleDriveService(drive_service=drive_service, credentials=MagicMock())
        folder_id = service.get_or_create_watch_party_folder()

        self.assertEqual(folder_id, 'existing-folder')
        files_api.create.assert_not_called()

    def test_get_or_create_watch_party_folder_creates_when_missing(self):
        files_api = MagicMock()
        files_api.list.return_value.execute.return_value = {'files': []}
        files_api.create.return_value.execute.return_value = {'id': 'created-folder'}

        drive_service = MagicMock()
        drive_service.files.return_value = files_api

        service = GoogleDriveService(drive_service=drive_service, credentials=MagicMock())
        folder_id = service.get_or_create_watch_party_folder('Custom Folder')

        self.assertEqual(folder_id, 'created-folder')
        files_api.create.assert_called_once()

    def test_list_videos_formats_metadata(self):
        file_data = {
            'id': 'file-123',
            'name': 'Movie',
            'mimeType': 'video/mp4',
            'size': '123',
            'thumbnailLink': 'thumb.jpg',
            'createdTime': '2024-01-01T00:00:00Z',
            'modifiedTime': '2024-01-02T00:00:00Z',
            'videoMediaMetadata': {
                'durationMillis': '6000',
                'width': 1920,
                'height': 1080,
            },
        }

        service = GoogleDriveService(drive_service=MagicMock(), credentials=MagicMock())
        with patch.object(service, 'list_files', return_value={'files': [file_data]}):
            videos = service.list_videos(folder_id='folder-1')

        self.assertEqual(len(videos), 1)
        video = videos[0]
        self.assertEqual(video['id'], 'file-123')
        self.assertEqual(video['duration'], 6)
        self.assertEqual(video['resolution'], '1920x1080')
        self.assertEqual(video['size'], 123)
        self.assertEqual(video['thumbnail_url'], 'thumb.jpg')

    @patch("apps.integrations.services.google_drive.MediaFileUpload")
    def test_upload_file_success(self, media_upload_cls):
        files_api = MagicMock()
        files_api.create.return_value.execute.return_value = {'id': 'file-001'}
        files_api.get.return_value.execute.return_value = {
            'id': 'file-001',
            'name': 'Movie.mp4',
            'mimeType': 'video/mp4',
            'size': '2048',
            'webContentLink': 'https://drive.google.com/file/d/file-001/view',
            'webViewLink': 'https://drive.google.com/file/d/file-001/preview',
        }

        drive_service = MagicMock()
        drive_service.files.return_value = files_api

        credentials = MagicMock()
        credentials.expired = False
        service = GoogleDriveService(drive_service=drive_service, credentials=credentials)

        with patch.object(service, '_refresh_credentials_if_needed') as refresh_mock:
            result = service.upload_file(
                file_path='/tmp/movie.mp4',
                name='Movie.mp4',
                folder_id='folder-123',
                mime_type='video/mp4',
            )

        refresh_mock.assert_called_once()
        media_upload_cls.assert_called_once_with('/tmp/movie.mp4', mimetype='video/mp4', resumable=True)
        files_api.create.assert_called_once()
        self.assertEqual(result['id'], 'file-001')
        self.assertEqual(result['download_url'], 'https://drive.google.com/file/d/file-001/view')
        self.assertEqual(result['streaming_url'], 'https://drive.google.com/file/d/file-001/view')

    @patch("apps.integrations.services.google_drive.MediaFileUpload")
    def test_upload_file_failure_raises(self, media_upload_cls):
        files_api = MagicMock()
        files_api.create.return_value.execute.side_effect = RuntimeError('boom')

        drive_service = MagicMock()
        drive_service.files.return_value = files_api

        service = GoogleDriveService(drive_service=drive_service, credentials=MagicMock())

        with self.assertRaises(GoogleDriveServiceError):
            service.upload_file(file_path='/tmp/movie.mp4')

    def test_delete_file_success(self):
        files_api = MagicMock()
        files_api.get.return_value.execute.return_value = {
            'id': 'file-123',
            'name': 'Sample.mp4',
            'mimeType': 'video/mp4',
            'size': '4096',
            'webContentLink': 'https://drive.google.com/file/d/file-123/view',
        }
        drive_service = MagicMock()
        drive_service.files.return_value = files_api

        service = GoogleDriveService(drive_service=drive_service, credentials=MagicMock())

        result = service.delete_file('file-123')
        self.assertTrue(result['deleted'])
        self.assertEqual(result['id'], 'file-123')
        self.assertEqual(result['download_url'], 'https://drive.google.com/file/d/file-123/view')
        files_api.delete.assert_called_once_with(fileId='file-123')
        files_api.delete.return_value.execute.assert_called_once()

    def test_delete_file_failure_raises_error(self):
        files_api = MagicMock()
        files_api.get.return_value.execute.return_value = {'id': 'file-123'}
        files_api.delete.return_value.execute.side_effect = RuntimeError('nope')

        drive_service = MagicMock()
        drive_service.files.return_value = files_api

        service = GoogleDriveService(drive_service=drive_service, credentials=MagicMock())

        with self.assertRaises(GoogleDriveServiceError):
            service.delete_file('file-123')

    def test_generate_streaming_url_uses_web_content_link(self):
        files_api = MagicMock()
        files_api.get.return_value.execute.return_value = {
            'id': 'file-456',
            'mimeType': 'video/mp4',
            'size': '5120',
            'webContentLink': 'https://drive.google.com/file/d/file-456/view',
            'webViewLink': 'https://drive.google.com/file/d/file-456/preview',
        }

        drive_service = MagicMock()
        drive_service.files.return_value = files_api

        credentials = MagicMock(refresh_token='refresh-token', expired=False)
        service = GoogleDriveService(drive_service=drive_service, credentials=credentials)

        with patch.object(service, '_refresh_credentials_if_needed') as refresh_mock:
            payload = service.generate_streaming_url('file-456')

        refresh_mock.assert_called_once()
        self.assertEqual(payload['id'], 'file-456')
        self.assertEqual(payload['streaming_url'], 'https://drive.google.com/file/d/file-456/view')
        self.assertEqual(payload['mime_type'], 'video/mp4')
        self.assertEqual(payload['size'], 5120)

    def test_generate_streaming_url_force_refresh(self):
        files_api = MagicMock()
        files_api.get.return_value.execute.return_value = {
            'id': 'file-789',
            'mimeType': 'video/mp4',
            'size': '100',
            'webContentLink': 'link'
        }

        drive_service = MagicMock()
        drive_service.files.return_value = files_api

        credentials = MagicMock(refresh_token='refresh-token', expired=False)
        credentials.refresh = MagicMock()
        service = GoogleDriveService(drive_service=drive_service, credentials=credentials)

        with patch.object(service, '_refresh_credentials_if_needed') as refresh_mock:
            payload = service.generate_streaming_url('file-789', force_refresh=True)

        credentials.refresh.assert_called_once()
        refresh_mock.assert_called_once()
        self.assertEqual(payload['streaming_url'], 'link')

    def test_generate_streaming_url_missing_link_falls_back(self):
        files_api = MagicMock()
        files_api.get.return_value.execute.return_value = {
            'id': 'file-111',
            'mimeType': 'video/mp4',
            'size': '256',
        }

        drive_service = MagicMock()
        drive_service.files.return_value = files_api

        credentials = MagicMock()
        credentials.refresh_token = None
        service = GoogleDriveService(drive_service=drive_service, credentials=credentials)

        payload = service.generate_streaming_url('file-111')
        expected_url = service.get_download_url('file-111')
        self.assertEqual(payload['streaming_url'], expected_url)
        self.assertEqual(payload['download_url'], expected_url)

    def test_get_file_info_returns_extended_metadata(self):
        files_api = MagicMock()
        files_api.get.return_value.execute.return_value = {
            'id': 'file-321',
            'name': 'Sample.mp4',
            'mimeType': 'video/mp4',
            'size': '1024',
            'thumbnailLink': 'thumb',
            'webContentLink': 'content',
            'webViewLink': 'view',
            'videoMediaMetadata': {'durationMillis': '5000', 'width': 1280, 'height': 720},
        }

        drive_service = MagicMock()
        drive_service.files.return_value = files_api

        service = GoogleDriveService(drive_service=drive_service, credentials=MagicMock())

        with patch.object(service, '_refresh_credentials_if_needed') as refresh_mock:
            info = service.get_file_info('file-321')

        refresh_mock.assert_called_once()
        self.assertEqual(info['download_url'], 'content')
        self.assertEqual(info['video_metadata']['width'], 1280)

    def test_generate_streaming_url_error_raises(self):
        files_api = MagicMock()
        files_api.get.return_value.execute.side_effect = RuntimeError('fail')

        drive_service = MagicMock()
        drive_service.files.return_value = files_api

        service = GoogleDriveService(drive_service=drive_service, credentials=MagicMock())

        with self.assertRaises(GoogleDriveServiceError):
            service.generate_streaming_url('file-000')

    def test_refresh_credentials_triggers_callback_updates_tokens(self):
        refreshed_expiry = timezone.now() + timedelta(hours=2)

        credentials = MagicMock()
        credentials.expired = True
        credentials.refresh_token = 'refresh-token'
        credentials.token = 'initial-token'
        credentials.expiry = timezone.now() - timedelta(minutes=5)

        def refresh(_request):
            credentials.token = 'refreshed-token'
            credentials.expiry = refreshed_expiry

        credentials.refresh.side_effect = refresh

        captured = {}

        def on_credentials_updated(updated_credentials):
            captured['token'] = updated_credentials.token
            captured['expiry'] = updated_credentials.expiry

        service = GoogleDriveService(
            credentials=credentials,
            drive_service=MagicMock(),
            on_credentials_updated=on_credentials_updated,
        )

        service._refresh_credentials_if_needed()

        credentials.refresh.assert_called_once()
        self.assertEqual(captured['token'], 'refreshed-token')
        self.assertEqual(captured['expiry'], refreshed_expiry)
