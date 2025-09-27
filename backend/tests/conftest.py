"""Shared pytest fixtures for Watch Party backend tests."""

import pytest
from rest_framework.test import APIClient


@pytest.fixture
def api_client() -> APIClient:
    """Return a DRF API client instance."""
    return APIClient()


@pytest.fixture
def user_factory():
    """Factory wrapper to create users with sensible defaults."""

    def _create_user(**kwargs):
        from tests.factories import UserFactory

        return UserFactory(**kwargs)

    return _create_user


@pytest.fixture
def video_factory():
    """Factory wrapper to create videos for tests."""

    def _create_video(**kwargs):
        from tests.factories import VideoFactory

        return VideoFactory(**kwargs)

    return _create_video


@pytest.fixture
def watch_party_factory():
    """Factory wrapper to create watch parties for tests."""

    def _create_party(**kwargs):
        from tests.factories import WatchPartyFactory

        return WatchPartyFactory(**kwargs)

    return _create_party


@pytest.fixture
def analytics_event_factory():
    """Factory wrapper to create analytics events for tests."""

    def _create_event(**kwargs):
        from tests.factories import AnalyticsEventFactory

        return AnalyticsEventFactory(**kwargs)

    return _create_event


@pytest.fixture
def authenticated_client(api_client, user_factory):
    """Return an authenticated API client and the associated user."""
    user = user_factory()
    api_client.force_authenticate(user=user)
    return api_client, user
