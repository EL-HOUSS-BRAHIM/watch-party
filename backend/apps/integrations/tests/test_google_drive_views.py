"""Tests for Google Drive integration API views."""

from datetime import timedelta
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from django.test import override_settings
from rest_framework import status
from rest_framework.test import APITestCase

from apps.authentication.models import UserProfile


@override_settings(GOOGLE_DRIVE_CLIENT_ID='client-id', GOOGLE_DRIVE_CLIENT_SECRET='client-secret')
class GoogleDriveIntegrationViewsTests(APITestCase):
    """Test suite for the Google Drive integration endpoints."""

    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(
            email='user@example.com',
            first_name='First',
            last_name='Last',
            password='password123',
        )
        self.profile = UserProfile.objects.create(user=self.user)
        self.client.force_authenticate(self.user)

    def test_google_drive_auth_url_success(self):
        """The auth-url endpoint returns the Google authorization link."""
        flow_mock = MagicMock()
        flow_mock.authorization_url.return_value = ('https://auth.example.com', 'state-123')

        with patch('google_auth_oauthlib.flow.Flow.from_client_config', return_value=flow_mock):
            response = self.client.get(reverse('integrations:google_drive_auth_url'))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        payload = response.json()
        self.assertTrue(payload['success'])
        self.assertIn('authorization_url', payload['data'])
        self.assertEqual(payload['data']['state'], 'state-123')
        self.assertIn('redirect_uri', payload['data'])
        self.assertIn('google_drive_oauth_state', self.client.session)

    def test_google_drive_auth_url_handles_configuration_errors(self):
        """Configuration issues surface as server errors."""
        with patch('apps.authentication.views.GoogleDriveAuthView._build_client_config', side_effect=ValueError('bad config')):
            response = self.client.get(reverse('integrations:google_drive_auth_url'))

        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        payload = response.json()
        self.assertFalse(payload['success'])
        self.assertEqual(payload['message'], 'bad config')

    def test_google_drive_callback_successfully_connects_profile(self):
        """The callback endpoint exchanges the code and updates the user profile."""
        flow_mock = MagicMock()
        credentials = SimpleNamespace(
            token='access-token',
            refresh_token='refresh-token',
            expiry=timezone.now() + timedelta(hours=1),
        )
        flow_mock.credentials = credentials

        service_mock = MagicMock()
        service_mock.get_or_create_watch_party_folder.return_value = 'folder-123'

        session = self.client.session
        session['google_drive_oauth_state'] = 'state-abc'
        session.save()

        with patch('google_auth_oauthlib.flow.Flow.from_client_config', return_value=flow_mock), \
                patch('apps.integrations.views.GoogleDriveService', return_value=service_mock):
            response = self.client.get(
                reverse('integrations:google_drive_oauth_callback'),
                {'code': 'auth-code', 'state': 'state-abc'}
            )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        payload = response.json()
        self.assertTrue(payload['success'])
        self.assertTrue(payload['data']['connected'])
        self.assertEqual(payload['data']['folder_id'], 'folder-123')

        self.profile.refresh_from_db()
        self.assertTrue(self.profile.google_drive_connected)
        self.assertEqual(self.profile.google_drive_folder_id, 'folder-123')
        self.assertEqual(self.profile.google_drive_token, 'access-token')
        self.assertEqual(self.profile.google_drive_refresh_token, 'refresh-token')
        self.assertIsNotNone(self.profile.google_drive_token_expires_at)

    def test_google_drive_callback_rejects_invalid_state(self):
        """A mismatched state parameter returns a 400 response."""
        session = self.client.session
        session['google_drive_oauth_state'] = 'state-original'
        session.save()

        response = self.client.get(
            reverse('integrations:google_drive_oauth_callback'),
            {'code': 'auth-code', 'state': 'wrong-state'}
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        payload = response.json()
        self.assertFalse(payload['success'])
        self.assertEqual(payload['message'], 'Invalid state parameter')

    def test_google_drive_callback_requires_authorization_code(self):
        """The callback endpoint validates that the authorization code exists."""
        response = self.client.get(reverse('integrations:google_drive_oauth_callback'))

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        payload = response.json()
        self.assertFalse(payload['success'])
        self.assertEqual(payload['message'], 'Authorization code is required')

    def test_google_drive_list_files_returns_results(self):
        """The list files endpoint surfaces the Drive response."""
        drive_service = MagicMock()
        drive_service.list_files.return_value = {
            'files': [
                {'id': '1', 'name': 'Movie.mp4'},
                {'id': '2', 'name': 'Clip.mp4'},
            ]
        }

        with patch('apps.integrations.views.get_drive_service_for_user', return_value=drive_service):
            response = self.client.get(reverse('integrations:google_drive_list_files'))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        payload = response.json()
        self.assertTrue(payload['success'])
        self.assertEqual(payload['data']['total'], 2)
        self.assertEqual(len(payload['data']['files']), 2)

    def test_google_drive_list_files_handles_missing_connection(self):
        """A user without a valid connection receives a 400 response."""
        with patch('apps.integrations.views.get_drive_service_for_user', side_effect=ValueError('not connected')):
            response = self.client.get(reverse('integrations:google_drive_list_files'))

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        payload = response.json()
        self.assertFalse(payload['success'])
        self.assertEqual(payload['message'], 'not connected')

    def test_google_drive_streaming_url_returns_urls(self):
        """The streaming-url endpoint returns both streaming and download links."""
        drive_service = MagicMock()
        drive_service.get_streaming_url.return_value = 'https://stream.example.com/file'
        drive_service.get_download_url.return_value = 'https://download.example.com/file'

        with patch('apps.integrations.views.get_drive_service_for_user', return_value=drive_service):
            response = self.client.get(reverse('integrations:google_drive_streaming_url', args=['file-123']))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        payload = response.json()
        self.assertTrue(payload['success'])
        self.assertEqual(payload['data']['file_id'], 'file-123')
        self.assertEqual(payload['data']['streaming_url'], 'https://stream.example.com/file')
        self.assertEqual(payload['data']['download_url'], 'https://download.example.com/file')

    def test_google_drive_streaming_url_requires_connection(self):
        """Missing Drive credentials surface as a bad request."""
        with patch('apps.integrations.views.get_drive_service_for_user', side_effect=ValueError('not connected')):
            response = self.client.get(reverse('integrations:google_drive_streaming_url', args=['file-123']))

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        payload = response.json()
        self.assertFalse(payload['success'])
        self.assertEqual(payload['message'], 'not connected')
