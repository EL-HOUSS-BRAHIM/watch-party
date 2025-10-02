from urllib.parse import quote

from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from django.urls import path
from rest_framework.test import APIClient

from apps.users.models import Friendship, UserActivity
from apps.users import social_views


User = get_user_model()


urlpatterns = [
    path('api/users/friends/', social_views.friends_list, name='friends_list'),
    path('api/users/friends/request/', social_views.send_friend_request, name='send_friend_request'),
    path('api/users/friends/<uuid:friendship_id>/accept/', social_views.accept_friend_request, name='accept_friend_request'),
    path('api/users/friends/<uuid:friendship_id>/decline/', social_views.decline_friend_request, name='decline_friend_request'),
    path('api/users/friends/<str:username>/remove/', social_views.remove_friend, name='remove_friend'),
    path('api/users/friends/requests/', social_views.friend_requests, name='friend_requests'),
    path('api/users/search/', social_views.search_users, name='search_users'),
    path('api/users/activity/', social_views.activity_feed, name='activity_feed'),
    path('api/users/suggestions/', social_views.friend_suggestions, name='friend_suggestions'),
    path('api/users/block/', social_views.block_user, name='block_user'),
    path('api/users/unblock/', social_views.unblock_user, name='unblock_user'),
]


@override_settings(ROOT_URLCONF=__name__)
class SocialViewsTests(TestCase):
    """Integration tests for social API views using the social service."""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="user1@example.com",
            first_name="User",
            last_name="One",
            password="Password123!",
        )
        self.friend = User.objects.create_user(
            email="friend@example.com",
            first_name="Friend",
            last_name="User",
            password="Password123!",
        )
        self.client.force_authenticate(self.user)

    def test_get_friends_list_returns_accepted_friends(self):
        Friendship.objects.create(from_user=self.user, to_user=self.friend, status="accepted")

        response = self.client.get("/api/users/friends/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["friends"]), 1)
        self.assertEqual(response.data["friends"][0]["username"], self.friend.email)
        self.assertEqual(response.data["friends"][0]["friendship_status"], "accepted")

    def test_send_friend_request_creates_pending_friendship(self):
        target = User.objects.create_user(
            email="target@example.com",
            first_name="Target",
            last_name="User",
            password="Password123!",
        )

        response = self.client.post(
            "/api/users/friends/request/",
            {"username": target.email},
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertTrue(response.data["success"])
        friendship = Friendship.objects.get(id=response.data["friendship_id"])
        self.assertEqual(friendship.from_user, self.user)
        self.assertEqual(friendship.to_user, target)
        self.assertEqual(friendship.status, "pending")

    def test_accept_friend_request_updates_status(self):
        friendship = Friendship.objects.create(
            from_user=self.friend,
            to_user=self.user,
            status="pending",
        )

        response = self.client.post(f"/api/users/friends/{friendship.id}/accept/")

        friendship.refresh_from_db()
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["success"])
        self.assertEqual(friendship.status, "accepted")

    def test_decline_friend_request_removes_request(self):
        friendship = Friendship.objects.create(
            from_user=self.friend,
            to_user=self.user,
            status="pending",
        )

        response = self.client.post(f"/api/users/friends/{friendship.id}/decline/")

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["success"])
        self.assertFalse(Friendship.objects.filter(id=friendship.id).exists())

    def test_remove_friend_deletes_relationship(self):
        Friendship.objects.create(from_user=self.user, to_user=self.friend, status="accepted")

        encoded_email = quote(self.friend.email)
        response = self.client.delete(f"/api/users/friends/{encoded_email}/remove/")

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["success"])
        self.assertFalse(
            Friendship.objects.filter(
                from_user=self.user,
                to_user=self.friend,
                status="accepted",
            ).exists()
        )

    def test_friend_requests_lists_received_and_sent(self):
        incoming = Friendship.objects.create(
            from_user=self.friend,
            to_user=self.user,
            status="pending",
        )
        pending_target = User.objects.create_user(
            email="pending@example.com",
            first_name="Pending",
            last_name="User",
            password="Password123!",
        )
        outgoing = Friendship.objects.create(
            from_user=self.user,
            to_user=pending_target,
            status="pending",
        )

        received_response = self.client.get("/api/users/friends/requests/?type=received")
        sent_response = self.client.get("/api/users/friends/requests/?type=sent")

        self.assertEqual(received_response.status_code, 200)
        self.assertEqual(sent_response.status_code, 200)
        self.assertEqual(len(received_response.data["requests"]), 1)
        self.assertEqual(len(sent_response.data["requests"]), 1)
        self.assertEqual(received_response.data["requests"][0]["id"], str(incoming.id))
        self.assertEqual(sent_response.data["requests"][0]["id"], str(outgoing.id))

    def test_search_users_returns_matching_results(self):
        search_user = User.objects.create_user(
            email="search@example.com",
            first_name="Search",
            last_name="User",
            password="Password123!",
        )

        response = self.client.get("/api/users/search/?q=search")

        self.assertEqual(response.status_code, 200)
        usernames = [entry["username"] for entry in response.data["users"]]
        self.assertIn(search_user.email, usernames)
        self.assertNotIn(self.user.email, usernames)

    def test_activity_feed_includes_user_and_friend_activity(self):
        Friendship.objects.create(from_user=self.user, to_user=self.friend, status="accepted")
        UserActivity.objects.create(
            user=self.user,
            activity_type="login",
            description="User logged in",
        )
        UserActivity.objects.create(
            user=self.friend,
            activity_type="friend_request_sent",
            description="Friend sent a request",
        )

        response = self.client.get("/api/users/activity/")

        self.assertEqual(response.status_code, 200)
        self.assertGreaterEqual(len(response.data["activities"]), 2)
        activity_types = {activity["activity_type"] for activity in response.data["activities"]}
        self.assertIn("login", activity_types)
        self.assertIn("friend_request_sent", activity_types)

    def test_friend_suggestions_includes_new_users(self):
        suggested = User.objects.create_user(
            email="suggest@example.com",
            first_name="Suggest",
            last_name="User",
            password="Password123!",
        )

        response = self.client.get("/api/users/suggestions/")

        self.assertEqual(response.status_code, 200)
        usernames = [entry["username"] for entry in response.data["suggestions"]]
        self.assertIn(suggested.email, usernames)

    def test_block_and_unblock_user_flow(self):
        response_block = self.client.post(
            "/api/users/block/",
            {"username": self.friend.email},
            format="json",
        )

        self.assertEqual(response_block.status_code, 200)
        self.assertTrue(response_block.data["success"])
        blocked = Friendship.objects.get(from_user=self.user, to_user=self.friend, status="blocked")

        response_unblock = self.client.post(
            "/api/users/unblock/",
            {"username": self.friend.email},
            format="json",
        )

        self.assertEqual(response_unblock.status_code, 200)
        self.assertTrue(response_unblock.data["success"])
        self.assertFalse(Friendship.objects.filter(id=blocked.id).exists())
