'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  Users, 
  Heart, 
  MessageSquare, 
  Video, 
  Star, 
  ChevronDown, 
  ChevronUp,
  Check,
  CheckCheck,
  Trash2,
  MoreHorizontal,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { notificationsAPI, partiesAPI, usersAPI } from '@/lib/api';
import type { Notification as APINotification } from '@/lib/api';

type NotificationWithMeta = APINotification & {
  avatar?: string | null;
  actionable: boolean;
  metadata?: Record<string, any>;
};

interface NotificationGroup {
  id: string;
  type: string;
  title: string;
  count: number;
  latestTimestamp: string;
  notifications: NotificationWithMeta[];
  collapsed: boolean;
}

interface PaginationState {
  currentPage: number;
  next: string | null;
  count: number;
}

const FALLBACK_AVATAR = '/placeholder-user.jpg';

const getGroupTitle = (type: string): string => {
  switch (type) {
    case 'friend_request':
      return 'Friend Requests';
    case 'like':
      return 'Likes';
    case 'comment':
      return 'Comments';
    case 'party_invite':
      return 'Party Invitations';
    case 'achievement':
      return 'Achievements';
    case 'video_upload':
      return 'Video Updates';
    default:
      return 'Notifications';
  }
};

const enhanceNotification = (notification: APINotification): NotificationWithMeta => {
  const metadata = notification.action_data ?? {};
  const userData = metadata.user ?? metadata.sender ?? metadata.requester ?? {};
  const avatar =
    metadata.avatar ??
    metadata.user_avatar ??
    userData.avatar ??
    userData.avatar_url ??
    userData.image ??
    FALLBACK_AVATAR;

  const actionableTypes = new Set(['friend_request', 'party_invite']);

  return {
    ...notification,
    avatar,
    actionable: actionableTypes.has(notification.type),
    metadata,
  };
};

const NotificationIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'friend_request':
      return <Users className="h-4 w-4 text-blue-500" />;
    case 'like':
      return <Heart className="h-4 w-4 text-red-500" />;
    case 'comment':
      return <MessageSquare className="h-4 w-4 text-green-500" />;
    case 'party_invite':
      return <Video className="h-4 w-4 text-purple-500" />;
    case 'achievement':
      return <Star className="h-4 w-4 text-yellow-500" />;
    case 'video_upload':
      return <Video className="h-4 w-4 text-indigo-500" />;
    default:
      return <Bell className="h-4 w-4 text-gray-500" />;
  }
};

export default function GroupedNotifications() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<NotificationWithMeta[]>([]);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'actionable'>('all');
  const [pagination, setPagination] = useState<PaginationState>({ currentPage: 1, next: null, count: 0 });

  const fetchNotifications = useCallback(
    async (page = 1, append = false) => {
      setLoading(true);
      try {
        const response = await notificationsAPI.getNotifications({
          page,
          unread: filter === 'unread' ? true : undefined,
        });

        const items = Array.isArray(response?.results) ? response.results : [];
        const enhanced = items.map(enhanceNotification);

        setNotifications((prev) => (append ? [...prev, ...enhanced] : enhanced));
        setPagination({
          currentPage: page,
          next: response?.next ?? null,
          count: response?.count ?? enhanced.length,
        });
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
        toast({
          title: 'Unable to load notifications',
          description: 'Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    },
    [filter, toast],
  );

  useEffect(() => {
    void fetchNotifications(1, false);
  }, [fetchNotifications]);

  const filteredNotifications = useMemo(() => {
    if (filter === 'unread') {
      return notifications.filter((notification) => !notification.is_read);
    }

    if (filter === 'actionable') {
      return notifications.filter((notification) => notification.actionable);
    }

    return notifications;
  }, [notifications, filter]);

  const groupedNotifications = useMemo(() => {
    const groups = new Map<string, NotificationGroup>();

    filteredNotifications.forEach((notification) => {
      const groupKey = notification.type ?? 'system';

      if (!groups.has(groupKey)) {
        groups.set(groupKey, {
          id: groupKey,
          type: groupKey,
          title: getGroupTitle(groupKey),
          count: 0,
          latestTimestamp: notification.created_at,
          notifications: [],
          collapsed: Boolean(collapsedGroups[groupKey]),
        });
      }

      const group = groups.get(groupKey)!;
      group.notifications.push(notification);
      group.count += 1;

      if (new Date(notification.created_at).getTime() > new Date(group.latestTimestamp).getTime()) {
        group.latestTimestamp = notification.created_at;
      }
    });

    return Array.from(groups.values()).sort(
      (a, b) => new Date(b.latestTimestamp).getTime() - new Date(a.latestTimestamp).getTime(),
    );
  }, [filteredNotifications, collapsedGroups]);

  const unreadCount = useMemo(
    () => notifications.reduce((total, notification) => total + (notification.is_read ? 0 : 1), 0),
    [notifications],
  );

  const actionableCount = useMemo(
    () => notifications.reduce((total, notification) => total + (notification.actionable ? 1 : 0), 0),
    [notifications],
  );

  const totalCount = pagination.count ?? notifications.length;

  const toggleGroup = useCallback((groupId: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  }, []);

  const handleMarkAsRead = useCallback(
    async (notificationId: string) => {
      try {
        await notificationsAPI.markAsRead(notificationId);
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === notificationId ? { ...notification, is_read: true } : notification,
          ),
        );
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
        toast({
          title: 'Unable to update notification',
          description: 'Please try again later.',
          variant: 'destructive',
        });
      }
    },
    [toast],
  );

  const handleMarkGroupAsRead = useCallback(
    async (groupId: string) => {
      const groupNotifications = notifications.filter(
        (notification) => notification.type === groupId && !notification.is_read,
      );

      if (groupNotifications.length === 0) {
        return;
      }

      try {
        await Promise.all(groupNotifications.map((notification) => notificationsAPI.markAsRead(notification.id)));
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.type === groupId ? { ...notification, is_read: true } : notification,
          ),
        );
      } catch (error) {
        console.error('Failed to mark notifications as read:', error);
        toast({
          title: 'Unable to update notifications',
          description: 'Please try again later.',
          variant: 'destructive',
        });
      }
    },
    [notifications, toast],
  );

  const handleMarkAllRead = useCallback(async () => {
    if (notifications.length === 0 || unreadCount === 0) {
      return;
    }

    try {
      await notificationsAPI.markAllAsRead();
      setNotifications((prev) => prev.map((notification) => ({ ...notification, is_read: true })));
      toast({
        title: 'All notifications marked as read',
        description: 'You are all caught up.',
      });
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      toast({
        title: 'Unable to update notifications',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  }, [notifications.length, unreadCount, toast]);

  const handleDeleteNotification = useCallback(
    async (notificationId: string) => {
      try {
        await notificationsAPI.deleteNotification(notificationId);
        setNotifications((prev) => prev.filter((notification) => notification.id !== notificationId));
        setPagination((prev) => ({
          ...prev,
          count: Math.max(0, prev.count - 1),
        }));
      } catch (error) {
        console.error('Failed to delete notification:', error);
        toast({
          title: 'Unable to delete notification',
          description: 'Please try again later.',
          variant: 'destructive',
        });
      }
    },
    [toast],
  );

  const handleClearAll = useCallback(async () => {
    if (notifications.length === 0) {
      return;
    }

    try {
      await notificationsAPI.clearAll();
      setNotifications([]);
      setPagination({ currentPage: 1, next: null, count: 0 });
      toast({
        title: 'Notifications cleared',
        description: 'All notifications have been removed.',
      });
    } catch (error) {
      console.error('Failed to clear notifications:', error);
      toast({
        title: 'Unable to clear notifications',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  }, [notifications.length, toast]);

  const handleLoadMore = useCallback(() => {
    if (!pagination.next) {
      return;
    }

    void fetchNotifications(pagination.currentPage + 1, true);
  }, [fetchNotifications, pagination]);

  const handleFriendRequest = useCallback(
    async (notification: NotificationWithMeta, action: 'accept' | 'decline') => {
      try {
        const metadata = notification.metadata ?? {};
        const requestId =
          metadata.request_id ?? metadata.id ?? metadata.friend_request_id ?? metadata.user_id;

        if (requestId) {
          if (action === 'accept') {
            await usersAPI.acceptFriendRequest(String(requestId));
          } else {
            await usersAPI.declineFriendRequest(String(requestId));
          }
        }

        await notificationsAPI.markAsRead(notification.id);
        setNotifications((prev) => prev.filter((item) => item.id !== notification.id));

        toast({
          title: action === 'accept' ? 'Friend request accepted' : 'Friend request declined',
          description:
            action === 'accept'
              ? 'You are now connected.'
              : 'The request has been declined.',
        });
      } catch (error) {
        console.error('Failed to handle friend request:', error);
        toast({
          title: 'Unable to update friend request',
          description: 'Please try again later.',
          variant: 'destructive',
        });
      }
    },
    [toast],
  );

  const handlePartyInvite = useCallback(
    async (notification: NotificationWithMeta, action: 'accept' | 'decline') => {
      try {
        const metadata = notification.metadata ?? {};

        if (action === 'accept') {
          const inviteCode = metadata.invite_code ?? metadata.code;
          const partyId = metadata.party_id ?? metadata.id;

          if (inviteCode) {
            await partiesAPI.joinByInvite({ invite_code: String(inviteCode) });
          } else if (partyId) {
            await partiesAPI.joinParty(String(partyId));
          }
        }

        await notificationsAPI.markAsRead(notification.id);
        setNotifications((prev) => prev.filter((item) => item.id !== notification.id));

        toast({
          title: action === 'accept' ? 'Party invite accepted' : 'Party invite dismissed',
          description:
            action === 'accept'
              ? 'You have joined the watch party.'
              : 'The invitation has been dismissed.',
        });
      } catch (error) {
        console.error('Failed to handle party invite:', error);
        toast({
          title: 'Unable to update party invite',
          description: 'Please try again later.',
          variant: 'destructive',
        });
      }
    },
    [toast],
  );

  if (loading && notifications.length === 0) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-6 w-6 bg-gray-300 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : "You're all caught up!"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={notifications.length === 0 || unreadCount === 0}
            onClick={handleMarkAllRead}
          >
            <CheckCheck className="h-4 w-4 mr-1" />
            Mark All Read
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={notifications.length === 0}
            onClick={handleClearAll}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        </div>
      </div>

      <Tabs value={filter} onValueChange={(value) => setFilter(value as typeof filter)}>
        <TabsList>
          <TabsTrigger value="all">All ({totalCount})</TabsTrigger>
          <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
          <TabsTrigger value="actionable">Action Required ({actionableCount})</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="space-y-4 mt-6">
          {groupedNotifications.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No notifications</h3>
                <p className="text-muted-foreground">
                  {filter === 'unread'
                    ? "You're all caught up!"
                    : filter === 'actionable'
                    ? 'No actions required'
                    : "You don't have any notifications yet"}
                </p>
              </CardContent>
            </Card>
          ) : (
            groupedNotifications.map((group) => (
              <Card key={group.id}>
                <CardHeader
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleGroup(group.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <NotificationIcon type={group.type} />
                      <div>
                        <CardTitle className="text-lg">{group.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {group.count} notification{group.count !== 1 ? 's' : ''} •{' '}
                          {formatDistanceToNow(new Date(group.latestTimestamp), { addSuffix: true })}
                        </p>
                      </div>
                      <Badge variant="secondary">{group.count}</Badge>
                      {group.notifications.some((notification) => !notification.is_read) && (
                        <Badge variant="destructive">
                          {group.notifications.filter((notification) => !notification.is_read).length}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(event) => {
                          event.stopPropagation();
                          void handleMarkGroupAsRead(group.id);
                        }}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      {group.collapsed ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronUp className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                </CardHeader>

                {!group.collapsed && (
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {group.notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
                            !notification.is_read ? 'bg-blue-50 border-blue-200' : 'bg-background'
                          }`}
                        >
                          {notification.avatar && (
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={notification.avatar} />
                              <AvatarFallback>
                                <NotificationIcon type={notification.type} />
                              </AvatarFallback>
                            </Avatar>
                          )}

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-medium text-sm">{notification.title}</h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-muted-foreground mt-2">
                                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                </p>
                              </div>
                              <div className="flex items-center gap-1">
                                {!notification.is_read && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => void handleMarkAsRead(notification.id)}
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => void handleDeleteNotification(notification.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            {notification.actionable && (
                              <div className="flex gap-2 mt-3">
                                {notification.type === 'friend_request' && (
                                  <>
                                    <Button
                                      size="sm"
                                      onClick={() => void handleFriendRequest(notification, 'accept')}
                                    >
                                      Accept
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => void handleFriendRequest(notification, 'decline')}
                                    >
                                      Decline
                                    </Button>
                                  </>
                                )}
                                {notification.type === 'party_invite' && (
                                  <>
                                    <Button
                                      size="sm"
                                      onClick={() => void handlePartyInvite(notification, 'accept')}
                                    >
                                      Join Party
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => void handlePartyInvite(notification, 'decline')}
                                    >
                                      Decline
                                    </Button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))
          )}
          {pagination.next && groupedNotifications.length > 0 && (
            <div className="flex justify-center pt-2">
              <Button variant="outline" onClick={handleLoadMore} disabled={loading}>
                Load More
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
