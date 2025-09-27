"""Analytics API smoke tests exercising shared fixtures."""

from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient


class AnalyticsDashboardTests(TestCase):
    """Exercise the dashboard endpoint using factory-generated data."""

    client_class = APIClient

    def test_dashboard_stats_reports_recent_activity(self):
        from tests.factories import AnalyticsEventFactory, UserFactory, WatchPartyFactory

        user = UserFactory()
        self.client.force_authenticate(user=user)
        party = WatchPartyFactory(host=user)
        AnalyticsEventFactory(user=user, party=party)

        response = self.client.get(reverse("analytics:dashboard-stats"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        recent_activity = response.data.get("recent_activity", [])
        self.assertTrue(recent_activity, "Expected at least one analytics event in the recent activity feed")
        event_payload = recent_activity[0]
        self.assertEqual(event_payload["event_type"], "party_join")
        self.assertEqual(event_payload["data"].get("note"), "factory-event")
