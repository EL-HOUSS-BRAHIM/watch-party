from datetime import timedelta
from unittest.mock import MagicMock, patch

from django.contrib.auth import get_user_model
from django.test import override_settings
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APITestCase

from apps.authentication.models import UserProfile


@override_settings(
    GOOGLE_DRIVE_CLIENT_ID='client',
    GOOGLE_DRIVE_CLIENT_SECRET='secret',
    ROOT_URLCONF='apps.authentication.tests.urls',
)
class GoogleDriveAuthViewTests(APITestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            email='auth@example.com',
            first_name='Auth',
            last_name='User',
            password='pass12345',
        )
        self.client.force_authenticate(self.user)

    def test_google_drive_callback_updates_profile(self):
        session = self.client.session
        session['google_oauth_state'] = 'expected-state'
        session.save()

        credentials = MagicMock()
        credentials.token = 'access-token'
        credentials.refresh_token = 'refresh-token'
        credentials.expiry = timezone.now()

        flow_instance = MagicMock()
        flow_instance.fetch_token.return_value = None
        flow_instance.credentials = credentials

        with patch('google_auth_oauthlib.flow.Flow') as flow_cls, \
             patch('apps.authentication.views.GoogleDriveService') as service_cls:
            flow_cls.from_client_config.return_value = flow_instance

            service_instance = MagicMock()
            service_instance.get_or_create_watch_party_folder.return_value = 'folder-123'
            service_cls.return_value = service_instance

            response = self.client.post(
                reverse('authentication:google_drive_auth'),
                {'code': 'auth-code', 'state': 'expected-state'},
                format='json'
            )

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertTrue(payload['success'])
        self.assertEqual(payload['folder_id'], 'folder-123')

        profile = UserProfile.objects.get(user=self.user)
        self.assertTrue(profile.google_drive_connected)
        self.assertEqual(profile.google_drive_folder_id, 'folder-123')
        self.assertEqual(profile.google_drive_token, 'access-token')
        self.assertEqual(profile.google_drive_refresh_token, 'refresh-token')
        self.assertEqual(profile.google_drive_token_expires_at, credentials.expiry)

        service_cls.assert_called_once_with(
            access_token='access-token',
            refresh_token='refresh-token',
            token_expiry=credentials.expiry,
        )
        flow_instance.fetch_token.assert_called_once_with(code='auth-code')
        self.assertNotIn('google_oauth_state', self.client.session)

    def test_google_drive_callback_rejects_invalid_state(self):
        session = self.client.session
        session['google_oauth_state'] = 'expected-state'
        session.save()

        response = self.client.post(
            reverse('authentication:google_drive_auth'),
            {'code': 'auth-code', 'state': 'wrong-state'},
            format='json'
        )

        self.assertEqual(response.status_code, 400)
        self.assertFalse(response.json()['success'])

    def test_google_drive_callback_handles_flow_errors(self):
        session = self.client.session
        session['google_oauth_state'] = 'expected-state'
        session.save()

        flow_instance = MagicMock()
        flow_instance.fetch_token.side_effect = Exception('boom')

        with patch('google_auth_oauthlib.flow.Flow') as flow_cls:
            flow_cls.from_client_config.return_value = flow_instance

            response = self.client.post(
                reverse('authentication:google_drive_auth'),
                {'code': 'auth-code', 'state': 'expected-state'},
                format='json'
            )

        self.assertEqual(response.status_code, 500)
        payload = response.json()
        self.assertFalse(payload['success'])
        self.assertIn('Failed to connect Google Drive', payload['message'])

    def test_google_drive_disconnect_clears_profile_tokens(self):
        expiry = timezone.now() + timedelta(hours=1)
        UserProfile.objects.create(
            user=self.user,
            google_drive_token='token',
            google_drive_refresh_token='refresh',
            google_drive_token_expires_at=expiry,
            google_drive_connected=True,
            google_drive_folder_id='folder-1',
        )

        response = self.client.post(reverse('authentication:google_drive_disconnect'))

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertTrue(payload['success'])

        profile = UserProfile.objects.get(user=self.user)
        self.assertEqual(profile.google_drive_token, '')
        self.assertEqual(profile.google_drive_refresh_token, '')
        self.assertIsNone(profile.google_drive_token_expires_at)
        self.assertFalse(profile.google_drive_connected)
        self.assertEqual(profile.google_drive_folder_id, '')
