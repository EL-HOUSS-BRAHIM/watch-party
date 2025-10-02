"""Social service for managing user social features."""

import logging
import uuid
from typing import Any, Dict, List, Optional, Set

from django.contrib.auth import get_user_model
from django.core.exceptions import FieldDoesNotExist
from django.db import transaction
from django.db.models import Q
from django.utils import timezone

from apps.users.models import Friendship, UserActivity

logger = logging.getLogger(__name__)
User = get_user_model()


class SocialService:
    """Service for handling user-to-user social interactions."""

    FRIEND_REQUEST_ACTIVITY = "friend_request_sent"
    FRIEND_ACCEPTED_ACTIVITY = "friend_request_accepted"
    FRIEND_DECLINED_ACTIVITY = "friend_request_declined"
    USER_BLOCKED_ACTIVITY = "user_blocked"
    USER_UNBLOCKED_ACTIVITY = "user_unblocked"

    def get_friends_list(self, user: User) -> List[Dict[str, Any]]:
        """Return serialized list of accepted friends for ``user``."""

        logger.info("Fetching friends list", extra={"user_id": str(user.id)})

        friendships = (
            Friendship.objects.select_related("from_user", "to_user")
            .filter(
                Q(from_user=user, status="accepted")
                | Q(to_user=user, status="accepted")
            )
            .order_by("-updated_at")
        )

        friends: List[Dict[str, Any]] = []
        for friendship in friendships:
            friend = friendship.to_user if friendship.from_user == user else friendship.from_user
            friends.append(self._serialize_user(friend, current_user=user, friendship=friendship))

        return friends

    def send_friend_request(self, user: User, username: str) -> Dict[str, Any]:
        """Create a friend request from ``user`` to ``username``."""

        logger.info(
            "Attempting to send friend request",
            extra={"from_user": str(user.id), "to_username": username},
        )

        target_user = self._get_user_by_identifier(username)
        if not target_user:
            logger.warning(
                "Target user not found for friend request",
                extra={"from_user": str(user.id), "to_username": username},
            )
            return {"success": False, "message": "User not found"}

        if target_user == user:
            return {"success": False, "message": "You cannot send a friend request to yourself"}

        if hasattr(target_user, "settings") and not target_user.settings.allow_friend_requests:
            return {"success": False, "message": "This user is not accepting friend requests"}

        existing_friendship = Friendship.objects.filter(
            Q(from_user=user, to_user=target_user)
            | Q(from_user=target_user, to_user=user)
        ).first()

        if existing_friendship:
            if existing_friendship.status == "accepted":
                return {"success": False, "message": "You are already friends"}
            if existing_friendship.status == "pending":
                # If the target already sent a request, accept it immediately.
                if existing_friendship.from_user == target_user:
                    logger.info(
                        "Target user already sent request - auto accepting",
                        extra={"friendship_id": str(existing_friendship.id)},
                    )
                    return self.accept_friend_request(user, existing_friendship.id)
                return {"success": False, "message": "Friend request already sent"}
            if existing_friendship.status == "blocked":
                return {"success": False, "message": "This user is blocked"}

        with transaction.atomic():
            friendship = Friendship.objects.create(
                from_user=user,
                to_user=target_user,
                status="pending",
            )

            self._record_activity(
                user,
                self.FRIEND_REQUEST_ACTIVITY,
                f"Sent friend request to {self._get_user_display(target_user)}",
                object_id=str(target_user.id),
            )

        logger.info(
            "Friend request sent",
            extra={"friendship_id": str(friendship.id), "from_user": str(user.id)},
        )

        return {
            "success": True,
            "message": f"Friend request sent to {target_user.username}",
            "friendship_id": str(friendship.id),
            "status": friendship.status,
        }

    def accept_friend_request(self, user: User, friendship_id: str) -> Dict[str, Any]:
        """Accept a pending friend request."""

        logger.info(
            "Accepting friend request",
            extra={"user_id": str(user.id), "friendship_id": str(friendship_id)},
        )

        try:
            friendship = Friendship.objects.select_related("from_user", "to_user").get(
                id=friendship_id, to_user=user
            )
        except Friendship.DoesNotExist:
            return {"success": False, "message": "Friend request not found"}

        if friendship.status != "pending":
            return {"success": False, "message": "Friend request is not pending"}

        friendship.status = "accepted"
        friendship.updated_at = timezone.now()
        friendship.save(update_fields=["status", "updated_at"])

        self._record_activity(
            user,
            self.FRIEND_ACCEPTED_ACTIVITY,
            f"Accepted friend request from {self._get_user_display(friendship.from_user)}",
            object_id=str(friendship.from_user.id),
        )
        self._record_activity(
            friendship.from_user,
            self.FRIEND_ACCEPTED_ACTIVITY,
            f"Friend request accepted by {self._get_user_display(user)}",
            object_id=str(user.id),
        )

        return {
            "success": True,
            "message": "Friend request accepted",
            "friendship": self._serialize_friendship(friendship, current_user=user),
        }

    def decline_friend_request(self, user: User, friendship_id: str) -> Dict[str, Any]:
        """Decline (delete) a pending friend request."""

        logger.info(
            "Declining friend request",
            extra={"user_id": str(user.id), "friendship_id": str(friendship_id)},
        )

        try:
            friendship = Friendship.objects.get(id=friendship_id, to_user=user, status="pending")
        except Friendship.DoesNotExist:
            return {"success": False, "message": "Friend request not found"}

        from_user = friendship.from_user
        friendship.delete()

        self._record_activity(
            user,
            self.FRIEND_DECLINED_ACTIVITY,
            f"Declined friend request from {self._get_user_display(from_user)}",
            object_id=str(from_user.id),
        )

        return {"success": True, "message": "Friend request declined"}

    def remove_friend(self, user: User, username: str) -> Dict[str, Any]:
        """Remove an accepted friend relationship."""

        logger.info(
            "Removing friend",
            extra={"user_id": str(user.id), "friend_username": username},
        )

        friend = self._get_user_by_identifier(username)
        if not friend:
            return {"success": False, "message": "User not found"}

        friendship = Friendship.objects.filter(
            Q(from_user=user, to_user=friend, status="accepted")
            | Q(from_user=friend, to_user=user, status="accepted")
        ).first()

        if not friendship:
            return {"success": False, "message": "You are not friends with this user"}

        friendship.delete()

        logger.info(
            "Friend removed",
            extra={"user_id": str(user.id), "friend_id": str(friend.id)},
        )

        return {
            "success": True,
            "message": f"Removed {self._get_user_display(friend)} from friends",
        }

    def get_friend_requests(self, user: User, request_type: str = "received") -> List[Dict[str, Any]]:
        """Return pending friend requests either received or sent."""

        logger.debug(
            "Fetching friend requests",
            extra={"user_id": str(user.id), "type": request_type},
        )

        if request_type == "sent":
            qs = Friendship.objects.filter(from_user=user, status="pending").select_related(
                "from_user", "to_user"
            )
        else:
            qs = Friendship.objects.filter(to_user=user, status="pending").select_related(
                "from_user", "to_user"
            )

        return [self._serialize_friendship(friendship, current_user=user) for friendship in qs]

    def search_users(self, query: str, current_user: User, limit: int = 20) -> List[Dict[str, Any]]:
        """Search for users by username or name, excluding blocked/friends."""

        logger.info(
            "Searching users",
            extra={"user_id": str(current_user.id), "query": query, "limit": limit},
        )

        blocked_ids = self._get_blocked_user_ids(current_user)
        excluded_ids = blocked_ids | {current_user.id}
        excluded_ids |= self._get_related_user_ids(current_user, statuses={"accepted", "pending"})

        search_filters = Q(first_name__icontains=query) | Q(last_name__icontains=query)

        try:
            User._meta.get_field("username")
        except FieldDoesNotExist:
            search_filters |= Q(email__icontains=query)
            order_field = "email"
        else:
            search_filters |= Q(username__icontains=query) | Q(email__icontains=query)
            order_field = "username"

        users_qs = (
            User.objects.filter(search_filters)
            .exclude(id__in=excluded_ids)
            .order_by(order_field)[:limit]
        )

        return [self._serialize_user(user, current_user=current_user) for user in users_qs]

    def get_activity_feed(self, user: User, limit: int = 50) -> List[Dict[str, Any]]:
        """Return combined activity feed for user and accepted friends."""

        friend_ids = self._get_related_user_ids(user, statuses={"accepted"})
        actor_ids = list(friend_ids | {user.id})

        activities = (
            UserActivity.objects.select_related("user")
            .filter(user_id__in=actor_ids)
            .order_by("-created_at")[:limit]
        )

        feed: List[Dict[str, Any]] = []
        for activity in activities:
            feed.append(
                {
                    "id": str(activity.id),
                    "user": self._serialize_user(activity.user, current_user=user),
                    "activity_type": activity.activity_type,
                    "description": activity.description,
                    "object_type": activity.object_type,
                    "object_id": activity.object_id,
                    "extra_data": activity.extra_data,
                    "created_at": self._format_datetime(activity.created_at),
                }
            )

        return feed

    def get_friend_suggestions(self, user: User, limit: int = 10) -> List[Dict[str, Any]]:
        """Suggest users that ``user`` might know based on mutual friends."""

        logger.debug(
            "Generating friend suggestions",
            extra={"user_id": str(user.id), "limit": limit},
        )

        existing_ids = self._get_related_user_ids(user, statuses={"accepted", "pending", "blocked"})
        existing_ids.add(user.id)
        blocked_ids = self._get_blocked_user_ids(user)
        excluded_ids = existing_ids | blocked_ids

        candidates = (
            User.objects.exclude(id__in=excluded_ids)
            .order_by("-date_joined")[: limit * 2]
        )

        suggestions: List[Dict[str, Any]] = []
        for candidate in candidates:
            mutual_count = self._count_mutual_friends(user, candidate)
            suggestions.append(
                self._serialize_user(
                    candidate,
                    current_user=user,
                    extra={"mutual_friends_count": mutual_count},
                )
            )

        suggestions.sort(key=lambda entry: entry.get("mutual_friends_count", 0), reverse=True)
        return suggestions[:limit]

    def block_user(self, user: User, username: str) -> Dict[str, Any]:
        """Block a user and remove any existing friendship."""

        logger.info(
            "Blocking user",
            extra={"user_id": str(user.id), "target_username": username},
        )

        target_user = self._get_user_by_identifier(username)
        if not target_user:
            return {"success": False, "message": "User not found"}

        if target_user == user:
            return {"success": False, "message": "You cannot block yourself"}

        Friendship.objects.filter(
            Q(from_user=user, to_user=target_user)
            | Q(from_user=target_user, to_user=user)
        ).delete()

        friendship, _ = Friendship.objects.get_or_create(
            from_user=user,
            to_user=target_user,
            defaults={"status": "blocked"},
        )
        if friendship.status != "blocked":
            friendship.status = "blocked"
            friendship.save(update_fields=["status", "updated_at"])

        self._record_activity(
            user,
            self.USER_BLOCKED_ACTIVITY,
            f"Blocked user {self._get_user_display(target_user)}",
            object_id=str(target_user.id),
        )

        return {
            "success": True,
            "message": f"User {self._get_user_display(target_user)} blocked",
        }

    def unblock_user(self, user: User, username: str) -> Dict[str, Any]:
        """Unblock a previously blocked user."""

        logger.info(
            "Unblocking user",
            extra={"user_id": str(user.id), "target_username": username},
        )

        target_user = self._get_user_by_identifier(username)
        if not target_user:
            return {"success": False, "message": "User not found"}

        friendship = Friendship.objects.filter(
            from_user=user, to_user=target_user, status="blocked"
        ).first()

        if not friendship:
            return {"success": False, "message": "User is not blocked"}

        friendship.delete()

        self._record_activity(
            user,
            self.USER_UNBLOCKED_ACTIVITY,
            f"Unblocked user {self._get_user_display(target_user)}",
            object_id=str(target_user.id),
        )

        return {
            "success": True,
            "message": f"User {self._get_user_display(target_user)} unblocked",
        }

    # ------------------------------------------------------------------
    # Helper methods
    # ------------------------------------------------------------------

    def _get_user_display(self, user: User) -> str:
        """Return a human-readable identifier for a user."""

        return getattr(user, "username", None) or getattr(user, "email", "") or str(user.id)

    def _serialize_user(
        self,
        user: User,
        *,
        current_user: Optional[User] = None,
        friendship: Optional[Friendship] = None,
        extra: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Serialize a user object for API responses."""

        data: Dict[str, Any] = {
            "id": str(user.id),
            "username": getattr(user, "username", None) or getattr(user, "email", ""),
            "first_name": user.first_name,
            "last_name": user.last_name,
            "full_name": user.get_full_name(),
            "is_online": self._is_user_online(user),
            "last_seen": self._format_datetime(getattr(user, "last_activity", None) or user.last_login),
            "avatar": user.avatar.url if getattr(user, "avatar", None) else None,
        }

        if friendship:
            data["friendship_status"] = friendship.status
            data["friendship_id"] = str(friendship.id)
            data["friendship_created_at"] = self._format_datetime(friendship.created_at)

        if current_user and user != current_user:
            data["is_friend"] = Friendship.objects.filter(
                Q(from_user=current_user, to_user=user, status="accepted")
                | Q(from_user=user, to_user=current_user, status="accepted")
            ).exists()
            data["mutual_friends_count"] = self._count_mutual_friends(current_user, user)

        if extra:
            data.update(extra)

        return data

    def _serialize_friendship(self, friendship: Friendship, *, current_user: Optional[User] = None) -> Dict[str, Any]:
        """Serialize a friendship instance."""

        friend = friendship.to_user if current_user == friendship.from_user else friendship.from_user
        return {
            "id": str(friendship.id),
            "status": friendship.status,
            "created_at": self._format_datetime(friendship.created_at),
            "updated_at": self._format_datetime(friendship.updated_at),
            "from_user": self._serialize_user(friendship.from_user, current_user=current_user),
            "to_user": self._serialize_user(friendship.to_user, current_user=current_user),
            "friend": self._serialize_user(friend, current_user=current_user, friendship=friendship),
        }

    def _get_related_user_ids(self, user: User, statuses: Optional[Set[str]] = None) -> Set[Any]:
        """Return IDs for users connected to ``user`` with the given statuses."""

        statuses = statuses or {"accepted"}
        friendships = Friendship.objects.filter(
            Q(from_user=user, status__in=statuses) | Q(to_user=user, status__in=statuses)
        ).values_list("from_user_id", "to_user_id")

        related: Set[Any] = set()
        for from_id, to_id in friendships:
            related.add(to_id if from_id == user.id else from_id)
        return related

    def _count_mutual_friends(self, user: User, other: User) -> int:
        """Return the number of mutual friends between two users."""

        user_friends = self._get_friend_ids(user)
        other_friends = self._get_friend_ids(other)
        return len(user_friends & other_friends)

    def _get_friend_ids(self, user: User) -> Set[Any]:
        """Return accepted friend IDs for a user."""

        friendships = Friendship.objects.filter(
            Q(from_user=user, status="accepted") | Q(to_user=user, status="accepted")
        ).values_list("from_user_id", "to_user_id")

        friend_ids: Set[Any] = set()
        for from_id, to_id in friendships:
            friend_ids.add(to_id if from_id == user.id else from_id)
        return friend_ids

    def _get_blocked_user_ids(self, user: User) -> Set[Any]:
        """Return IDs for users blocked by ``user`` or who have blocked ``user``."""

        blocked_friendships = Friendship.objects.filter(
            Q(from_user=user, status="blocked") | Q(to_user=user, status="blocked")
        ).values_list("from_user_id", "to_user_id")

        blocked_ids: Set[Any] = set()
        for from_id, to_id in blocked_friendships:
            blocked_ids.add(to_id if from_id == user.id else from_id)
        return blocked_ids

    def _record_activity(
        self,
        user: User,
        activity_type: str,
        description: str,
        *,
        object_id: Optional[str] = None,
        object_type: str = "user",
        extra_data: Optional[Dict[str, Any]] = None,
    ) -> None:
        """Persist a ``UserActivity`` entry with safe logging."""

        if not user:
            return

        UserActivity.objects.create(
            user=user,
            activity_type=activity_type,
            description=description,
            object_type=object_type,
            object_id=object_id or "",
            extra_data=extra_data or {},
        )

    def _is_user_online(self, user: User) -> bool:
        """Determine if a user is online based on status or recent activity."""

        if getattr(user, "is_online", False):
            return True

        last_active = getattr(user, "last_activity", None) or user.last_login
        if not last_active:
            return False

        threshold = timezone.now() - timezone.timedelta(minutes=5)
        return last_active >= threshold

    def _format_datetime(self, value: Optional[timezone.datetime]) -> Optional[str]:
        """Format datetime values for API responses."""

        if not value:
            return None
        if timezone.is_naive(value):
            value = timezone.make_aware(value)
        return value.isoformat()

    def _get_user_by_identifier(self, identifier: str) -> Optional[User]:
        """Retrieve a user by username, email, or UUID string."""

        if not identifier:
            return None

        lookups = []

        try:
            User._meta.get_field("username")
        except FieldDoesNotExist:
            pass
        else:
            lookups.append({"username": identifier})

        lookups.append({"email": identifier})

        try:
            uuid_candidate = uuid.UUID(str(identifier))
        except (ValueError, AttributeError, TypeError):
            uuid_candidate = None
        else:
            lookups.append({"id": uuid_candidate})

        for lookup in lookups:
            try:
                return User.objects.get(**lookup)
            except User.DoesNotExist:
                continue

        return None


# Global service instance
social_service = SocialService()
