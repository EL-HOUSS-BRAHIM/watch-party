'use client';

import { useState, useEffect } from 'react';
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
  MoreHorizontal
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  type: 'friend_request' | 'like' | 'comment' | 'party_invite' | 'achievement' | 'system';
  title: string;
  message: string;
  avatar?: string;
  timestamp: string;
  read: boolean;
  actionable?: boolean;
  data?: {
    userId?: string;
    videoId?: string;
    partyId?: string;
    achievementId?: string;
  };
}

interface NotificationGroup {
  id: string;
  type: string;
  title: string;
  count: number;
  latestTimestamp: string;
  notifications: Notification[];
  collapsed: boolean;
}

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
    default:
      return <Bell className="h-4 w-4 text-gray-500" />;
  }
};

export default function GroupedNotifications() {
  const [notificationGroups, setNotificationGroups] = useState<NotificationGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'actionable'>('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockNotifications: Notification[] = [
        // Friend requests
        {
          id: '1',
          type: 'friend_request',
          title: 'New friend request',
          message: 'Alex Chen wants to be your friend',
          avatar: '/placeholder-user.jpg',
          timestamp: '2024-01-15T10:30:00Z',
          read: false,
          actionable: true,
          data: { userId: 'user1' },
        },
        {
          id: '2',
          type: 'friend_request',
          title: 'New friend request',
          message: 'Sarah Johnson wants to be your friend',
          avatar: '/placeholder-user.jpg',
          timestamp: '2024-01-15T09:15:00Z',
          read: false,
          actionable: true,
          data: { userId: 'user2' },
        },
        
        // Likes
        {
          id: '3',
          type: 'like',
          title: 'Video liked',
          message: 'Mike Rodriguez liked your video "Movie Review: Dune"',
          avatar: '/placeholder-user.jpg',
          timestamp: '2024-01-15T08:45:00Z',
          read: true,
          data: { userId: 'user3', videoId: 'video1' },
        },
        {
          id: '4',
          type: 'like',
          title: 'Video liked',
          message: 'Emma Watson liked your video "Top 10 Sci-Fi Movies"',
          avatar: '/placeholder-user.jpg',
          timestamp: '2024-01-15T08:30:00Z',
          read: true,
          data: { userId: 'user4', videoId: 'video2' },
        },
        {
          id: '5',
          type: 'like',
          title: 'Video liked',
          message: '3 others liked your video "Movie Review: Dune"',
          timestamp: '2024-01-15T08:00:00Z',
          read: true,
          data: { videoId: 'video1' },
        },

        // Comments
        {
          id: '6',
          type: 'comment',
          title: 'New comment',
          message: 'Lisa Park commented on your video: "Great analysis of the cinematography!"',
          avatar: '/placeholder-user.jpg',
          timestamp: '2024-01-15T07:30:00Z',
          read: false,
          data: { userId: 'user5', videoId: 'video1' },
        },

        // Party invites
        {
          id: '7',
          type: 'party_invite',
          title: 'Party invitation',
          message: 'David Kim invited you to "Horror Movie Marathon"',
          avatar: '/placeholder-user.jpg',
          timestamp: '2024-01-15T06:00:00Z',
          read: false,
          actionable: true,
          data: { userId: 'user6', partyId: 'party1' },
        },

        // Achievements
        {
          id: '8',
          type: 'achievement',
          title: 'Achievement unlocked!',
          message: 'You earned the "Movie Buff" badge for watching 100 movies!',
          timestamp: '2024-01-14T20:00:00Z',
          read: false,
          data: { achievementId: 'movie_buff' },
        },
      ];

      // Group notifications by type
      const groups = groupNotifications(mockNotifications);
      setNotificationGroups(groups);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupNotifications = (notifications: Notification[]): NotificationGroup[] => {
    const groupedMap = new Map<string, NotificationGroup>();

    notifications.forEach(notification => {
      const groupKey = notification.type;
      
      if (!groupedMap.has(groupKey)) {
        groupedMap.set(groupKey, {
          id: groupKey,
          type: notification.type,
          title: getGroupTitle(notification.type),
          count: 0,
          latestTimestamp: notification.timestamp,
          notifications: [],
          collapsed: false,
        });
      }

      const group = groupedMap.get(groupKey)!;
      group.notifications.push(notification);
      group.count++;
      
      // Update latest timestamp if this notification is newer
      if (new Date(notification.timestamp) > new Date(group.latestTimestamp)) {
        group.latestTimestamp = notification.timestamp;
      }
    });

    // Convert to array and sort by latest timestamp
    return Array.from(groupedMap.values())
      .sort((a, b) => new Date(b.latestTimestamp).getTime() - new Date(a.latestTimestamp).getTime());
  };

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
      case 'system':
        return 'System Notifications';
      default:
        return 'Notifications';
    }
  };

  const toggleGroup = (groupId: string) => {
    setNotificationGroups(groups =>
      groups.map(group =>
        group.id === groupId ? { ...group, collapsed: !group.collapsed } : group
      )
    );
  };

  const markAsRead = (notificationId: string) => {
    setNotificationGroups(groups =>
      groups.map(group => ({
        ...group,
        notifications: group.notifications.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        ),
      }))
    );
  };

  const markGroupAsRead = (groupId: string) => {
    setNotificationGroups(groups =>
      groups.map(group =>
        group.id === groupId
          ? {
              ...group,
              notifications: group.notifications.map(notification => ({
                ...notification,
                read: true,
              })),
            }
          : group
      )
    );
  };

  const deleteNotification = (notificationId: string) => {
    setNotificationGroups(groups =>
      groups.map(group => ({
        ...group,
        notifications: group.notifications.filter(n => n.id !== notificationId),
        count: group.notifications.filter(n => n.id !== notificationId).length,
      })).filter(group => group.count > 0)
    );
  };

  const handleFriendRequest = async (notificationId: string, action: 'accept' | 'decline') => {
    try {
      // Handle friend request action
      console.log(`${action} friend request:`, notificationId);
      
      // Remove notification after action
      deleteNotification(notificationId);
    } catch (error) {
      console.error('Failed to handle friend request:', error);
    }
  };

  const handlePartyInvite = async (notificationId: string, action: 'accept' | 'decline') => {
    try {
      // Handle party invite action
      console.log(`${action} party invite:`, notificationId);
      
      // Remove notification after action
      deleteNotification(notificationId);
    } catch (error) {
      console.error('Failed to handle party invite:', error);
    }
  };

  const filteredGroups = notificationGroups.filter(group => {
    if (filter === 'unread') {
      return group.notifications.some(n => !n.read);
    }
    if (filter === 'actionable') {
      return group.notifications.some(n => n.actionable);
    }
    return true;
  });

  const unreadCount = notificationGroups.reduce(
    (total, group) => total + group.notifications.filter(n => !n.read).length,
    0
  );

  const actionableCount = notificationGroups.reduce(
    (total, group) => total + group.notifications.filter(n => n.actionable).length,
    0
  );

  if (loading) {
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
            {unreadCount > 0 ? `${unreadCount} unread notifications` : 'You\'re all caught up!'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <CheckCheck className="h-4 w-4 mr-1" />
            Mark All Read
          </Button>
          <Button variant="outline" size="sm">
            <Trash2 className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        </div>
      </div>

      <Tabs value={filter} onValueChange={(value) => setFilter(value as typeof filter)}>
        <TabsList>
          <TabsTrigger value="all">
            All ({notificationGroups.reduce((total, group) => total + group.count, 0)})
          </TabsTrigger>
          <TabsTrigger value="unread">
            Unread ({unreadCount})
          </TabsTrigger>
          <TabsTrigger value="actionable">
            Action Required ({actionableCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="space-y-4 mt-6">
          {filteredGroups.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No notifications</h3>
                <p className="text-muted-foreground">
                  {filter === 'unread' 
                    ? "You're all caught up!" 
                    : filter === 'actionable'
                    ? "No actions required"
                    : "You don't have any notifications yet"
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredGroups.map((group) => (
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
                          {group.count} notification{group.count !== 1 ? 's' : ''} • {' '}
                          {formatDistanceToNow(new Date(group.latestTimestamp), { addSuffix: true })}
                        </p>
                      </div>
                      <Badge variant="secondary">{group.count}</Badge>
                      {group.notifications.some(n => !n.read) && (
                        <Badge variant="destructive">
                          {group.notifications.filter(n => !n.read).length}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          markGroupAsRead(group.id);
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
                            !notification.read ? 'bg-blue-50 border-blue-200' : 'bg-background'
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
                                  {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                                </p>
                              </div>
                              <div className="flex items-center gap-1">
                                {!notification.read && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => markAsRead(notification.id)}
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteNotification(notification.id)}
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
                                      onClick={() => handleFriendRequest(notification.id, 'accept')}
                                    >
                                      Accept
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleFriendRequest(notification.id, 'decline')}
                                    >
                                      Decline
                                    </Button>
                                  </>
                                )}
                                {notification.type === 'party_invite' && (
                                  <>
                                    <Button
                                      size="sm"
                                      onClick={() => handlePartyInvite(notification.id, 'accept')}
                                    >
                                      Join Party
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handlePartyInvite(notification.id, 'decline')}
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
