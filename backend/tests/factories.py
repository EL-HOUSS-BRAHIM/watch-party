"""Factory Boy definitions used across pytest suites."""

from datetime import timedelta

import factory
from django.utils import timezone

from apps.analytics.models import AnalyticsEvent
from apps.authentication.models import User
from apps.parties.models import WatchParty
from apps.videos.models import Video


class UserFactory(factory.django.DjangoModelFactory):
    """Create application users with a predictable password."""

    class Meta:
        model = User
        django_get_or_create = ("email",)

    email = factory.Sequence(lambda n: f"user{n}@example.com")
    first_name = factory.Faker("first_name")
    last_name = factory.Faker("last_name")
    is_active = True
    is_email_verified = True
    password = factory.PostGenerationMethodCall("set_password", "TestPass123!")


class VideoFactory(factory.django.DjangoModelFactory):
    """Create ready-to-stream video records."""

    class Meta:
        model = Video

    title = factory.Sequence(lambda n: f"Feature #{n}")
    description = factory.Faker("sentence")
    uploader = factory.SubFactory(UserFactory)
    duration = timedelta(minutes=5)
    visibility = "public"
    status = "ready"


class WatchPartyFactory(factory.django.DjangoModelFactory):
    """Create watch parties linked to a host and video."""

    class Meta:
        model = WatchParty

    title = factory.Sequence(lambda n: f"Watch Party {n}")
    description = factory.Faker("sentence")
    host = factory.SubFactory(UserFactory)
    video = factory.SubFactory(VideoFactory, uploader=factory.SelfAttribute("..host"))
    room_code = factory.Sequence(lambda n: f"ROOM{n:04d}")
    invite_code = factory.Sequence(lambda n: f"INVITE{n:06d}")
    visibility = "public"
    status = "live"
    allow_chat = True
    allow_reactions = True


class AnalyticsEventFactory(factory.django.DjangoModelFactory):
    """Create analytics events tied to watch parties and videos."""

    class Meta:
        model = AnalyticsEvent

    user = factory.SubFactory(UserFactory)
    party = factory.SubFactory(WatchPartyFactory)
    event_type = "party_join"
    event_data = factory.LazyFunction(lambda: {"note": "factory-event"})
    duration = timedelta(seconds=30)
    session_id = factory.Sequence(lambda n: f"session-{n}")
    timestamp = factory.LazyFunction(timezone.now)

    @factory.lazy_attribute
    def video(self):
        if self.party and self.party.video:
            return self.party.video
        return VideoFactory()
