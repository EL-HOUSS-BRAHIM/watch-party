from datetime import timedelta

from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from apps.analytics.models import AnalyticsEvent
from apps.authentication.models import User
from apps.parties.models import WatchParty
from apps.videos.models import Video


class DashboardViewsTests(APITestCase):
    """Regression tests for analytics dashboard views."""

    def setUp(self):
        self.user = User.objects.create_user(
            email='owner@example.com',
            password='TestPass123!',
            first_name='Video',
            last_name='Owner',
        )
        self.client.force_authenticate(self.user)

        self.video = Video.objects.create(
            title='Feature Film',
            description='A test video',
            uploader=self.user,
            duration=timedelta(minutes=5),
            visibility='public',
        )
        self.party = WatchParty.objects.create(
            title='Launch Party',
            description='Testing analytics tracking',
            host=self.user,
            video=self.video,
        )

    def test_dashboard_stats_includes_event_payload(self):
        """The dashboard recent activity feed should expose stored event data."""
        AnalyticsEvent.objects.create(
            user=self.user,
            event_type='video_play',
            event_data={'note': 'payload-propagated'},
            session_id='session-1',
            timestamp=timezone.now(),
        )

        response = self.client.get(reverse('analytics:dashboard-stats'))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        recent_activity = response.data.get('recent_activity', [])
        self.assertTrue(recent_activity, 'Expected recent activity to include the seeded event')
        self.assertEqual(recent_activity[0]['data'], {'note': 'payload-propagated'})

    def test_track_event_persists_party_and_video_links(self):
        """Posting to the track-event endpoint should persist FK links and payload data."""
        url = reverse('analytics:track-event')
        payload = {
            'event_type': 'party_join',
            'party_id': str(self.party.id),
            'video_id': str(self.video.id),
            'data': {'note': 'joined party'},
        }

        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        event = AnalyticsEvent.objects.get(id=response.data['event_id'])
        self.assertEqual(event.user, self.user)
        self.assertEqual(event.party, self.party)
        self.assertEqual(event.video, self.video)
        self.assertEqual(event.event_data, {'note': 'joined party'})
        self.assertEqual(event.session_id, '')
