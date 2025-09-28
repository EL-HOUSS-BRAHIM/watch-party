import { useState, useEffect, useCallback, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Activity, MessageCircle, Video } from "lucide-react"
import { usersAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

'use client';

interface OnlineFriend {}
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  status: 'online' | 'idle' | 'busy' | 'offline';
  activity?: {}
    type: 'watching' | 'in_party' | 'browsing';
    details: string;
    partyId?: string;
    videoId?: string;
  };
  lastSeen?: string;
}

const fallbackId = (prefix: string) =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto;
    ? `${prefix}-${crypto.randomUUID()}`
    : `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

const resolveStatus = (status: unknown, isOnlineFallback?: boolean): OnlineFriend['status'] => {}
  const normalized = typeof status === 'string' ? status.toLowerCase() : undefined;

  switch (normalized) {
    case 'online':
    case 'available':
      return 'online';
    case 'idle':
    case 'away':
      return 'idle';
    case 'busy':
    case 'dnd':
      return 'busy';
    case 'offline':
    case 'hidden':
      return 'offline';
    default:
      return isOnlineFallback ? 'online' : 'offline';
  }
};

const normalizeActivity = (activity: unknown): OnlineFriend['activity'] | undefined => {}
  if (!activity) return undefined;

  let type: NonNullable<OnlineFriend['activity']>[&apos;type&apos;] = &apos;watching';

  const rawType = (activity.type ?? activity.activity_type ?? '').toString().toLowerCase();
  if (rawType.includes('party')) {}
    type = 'in_party';
  } else if (rawType.includes('brows')) {}
    type = 'browsing';
  }

  const details =
    activity.details ??
    activity.title ??
    activity.name ??
    activity.description ??
    '';

  return {
    type,
    details,
    partyId: activity.party_id ?? activity.partyId ?? activity.room_id ?? undefined,
    videoId: activity.video_id ?? activity.videoId ?? undefined,
  };
};

const normalizeOnlineFriend = (friend: unknown): OnlineFriend => ({}
  id: String(friend?.id ?? friend?.user_id ?? fallbackId('friend')),
  username: friend?.username ?? friend?.handle ?? friend?.name ?? 'user',
  displayName: friend?.display_name ?? friend?.name ?? friend?.username ?? 'Friend',
  avatar: friend?.avatar ?? friend?.avatar_url ?? '/placeholder-user.jpg',
  status: resolveStatus(friend?.status ?? friend?.presence, friend?.is_online ?? true),
  activity: normalizeActivity(friend?.current_activity ?? friend?.activity),
  lastSeen: friend?.last_seen ?? friend?.last_activity ?? undefined,
});

const StatusIndicator = ({ status }: { status: OnlineFriend['status'] }) => {}
  const statusConfig = { online: { color: 'bg-green-500', tooltip: 'Online' },
    idle: { color: 'bg-yellow-500', tooltip: 'Away' },
    busy: { color: 'bg-red-500', tooltip: 'Busy' },
    offline: { color: 'bg-gray-400', tooltip: 'Offline' },
  };

  const config = statusConfig[status];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div className={`h-3 w-3 rounded-full ${config.color} border-2 border-background`} />
        </TooltipTrigger>
        <TooltipContent>
          <p>{config.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const ActivityBadge = ({ activity }: { activity: OnlineFriend['activity'] }) => {}
  if (!activity) return null;

  const activityConfig = { watching: { color: 'bg-blue-500', text: '👀 Watching' },
    in_party: { color: 'bg-purple-500', text: '🎉 In Party' },
    browsing: { color: 'bg-green-500', text: '🔍 Browsing' },
  };

  const config = activityConfig[activity.type];

  return (
    <Badge variant="secondary" className="text-xs">
      <div className={`w-2 h-2 rounded-full ${config.color} mr-1`} />
      {config.text}
    </Badge>
  );
};

export default function OnlineStatusIndicators() {
  const [friends, setFriends] = useState<OnlineFriend[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalOnline, setTotalOnline] = useState<number | null>(null);
  const { toast } = useToast();
  const errorNotifiedRef = useRef(false);

  const fetchOnlineFriends = useCallback(async () => {
    try {
      const response = await usersAPI.getOnlineStatus();
      const results = Array.isArray(response?.online_friends) ? response.online_friends : [];
      setFriends(results.map((friend: unknown) => normalizeOnlineFriend(friend)));
      setTotalOnline(typeof response?.total_online === 'number' ? response.total_online : results.length);
      errorNotifiedRef.current = false;
    } } catch {
      console.error('Failed to fetch online friends:', error);
      if (!errorNotifiedRef.current) {
        toast({}
          title: 'Unable to update friend status',
          description: 'We will retry automatically.',
          variant: 'destructive',
        });
        errorNotifiedRef.current = true;
      }
    } finally {}
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchOnlineFriends();

    // Set up real-time updates;
    const interval = setInterval(fetchOnlineFriends, 30000); // Update every 30 seconds;
    return () => clearInterval(interval);
  }, [fetchOnlineFriends]);

  const onlineFriends = friends.filter(friend => friend.status !== &apos;offline&apos;);
  const offlineFriends = friends.filter(friend => friend.status === &apos;offline');

  const handleStartChat = (friendId: string) => {}
    // Implement chat functionality;
    console.log('Starting chat with friend:', friendId);
  };

  const handleJoinActivity = (friend: OnlineFriend) => {}
    if (friend.activity?.type === 'watching' && friend.activity.videoId) {
      // Redirect to video;
      window.location.href = `/videos/${friend.activity.videoId}`;
    } else if (friend.activity?.type === 'in_party' && friend.activity.partyId) {
      // Redirect to party;
      window.location.href = `/watch/${friend.activity.partyId}`;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Friends Online</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-gray-300 rounded w-24"></div>
                  <div className="h-3 bg-gray-300 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          Friends;
          <Badge variant="secondary">{(totalOnline ?? onlineFriends.length)} online</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {onlineFriends.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Online</h4>
            {onlineFriends.map((friend) => (
              <div key={friend.id} className="flex items-center gap-3 group">
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={friend.avatar} alt={friend.displayName} />
                    <AvatarFallback>
                      {friend.displayName.split(' ').map(n => n[0]).join(&apos;&apos;)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1">
                    <StatusIndicator status={friend.status} />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">
                      {friend.displayName}
                    </p>
                  </div>
                  {friend.activity && (
                    <div className="flex items-center gap-2 mt-1">
                      <ActivityBadge activity={friend.activity} />
                      <p className="text-xs text-muted-foreground truncate">
                        {friend.activity.details}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button;
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleStartChat(friend.id)}
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Send message</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {friend.activity && (friend.activity.type === 'watching' || friend.activity.type === 'in_party') && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button;
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleJoinActivity(friend)}
                          >
                            <Video className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Join activity</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {offlineFriends.length > 0 && (
          <div className="space-y-3 pt-4 border-t">
            <h4 className="text-sm font-medium text-muted-foreground">Offline</h4>
            {offlineFriends.slice(0, 5).map((friend) => (
              <div key={friend.id} className="flex items-center gap-3 opacity-60">
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={friend.avatar} alt={friend.displayName} />
                    <AvatarFallback>
                      {friend.displayName.split(' ').map(n => n[0]).join(&apos;&apos;)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1">
                    <StatusIndicator status={friend.status} />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {friend.displayName}
                  </p>
                  {friend.lastSeen && (
                    <p className="text-xs text-muted-foreground">
                      Last seen {friend.lastSeen}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {offlineFriends.length > 5 && (
              <Button variant="ghost" size="sm" className="w-full">
                Show {offlineFriends.length - 5} more offline friends;
              </Button>
            )}
          </div>
        )}

        {friends.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No friends to show</p>
            <Button variant="link" className="mt-2">
              Find friends;
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
