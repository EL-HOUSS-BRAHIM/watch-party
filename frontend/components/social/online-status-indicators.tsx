'use client';

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MessageCircle, Phone, Video, MoreHorizontal } from 'lucide-react';

interface OnlineFriend {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  status: 'online' | 'idle' | 'busy' | 'offline';
  activity?: {
    type: 'watching' | 'in_party' | 'browsing';
    details: string;
    partyId?: string;
    videoId?: string;
  };
  lastSeen?: string;
}

const StatusIndicator = ({ status }: { status: OnlineFriend['status'] }) => {
  const statusConfig = {
    online: { color: 'bg-green-500', tooltip: 'Online' },
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

const ActivityBadge = ({ activity }: { activity: OnlineFriend['activity'] }) => {
  if (!activity) return null;

  const activityConfig = {
    watching: { color: 'bg-blue-500', text: '👀 Watching' },
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

  useEffect(() => {
    fetchOnlineFriends();
    
    // Set up real-time updates
    const interval = setInterval(fetchOnlineFriends, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const fetchOnlineFriends = async () => {
    try {
      // Mock data - replace with actual API call
      const mockFriends: OnlineFriend[] = [
        {
          id: '1',
          username: 'alex_movie_fan',
          displayName: 'Alex Chen',
          avatar: '/placeholder-user.jpg',
          status: 'online',
          activity: {
            type: 'watching',
            details: 'The Matrix',
            videoId: 'video123',
          },
        },
        {
          id: '2',
          username: 'sarah_streamer',
          displayName: 'Sarah Johnson',
          avatar: '/placeholder-user.jpg',
          status: 'online',
          activity: {
            type: 'in_party',
            details: 'Horror Movie Night',
            partyId: 'party456',
          },
        },
        {
          id: '3',
          username: 'mike_director',
          displayName: 'Mike Rodriguez',
          avatar: '/placeholder-user.jpg',
          status: 'idle',
          activity: {
            type: 'browsing',
            details: 'Exploring new releases',
          },
        },
        {
          id: '4',
          username: 'emma_critic',
          displayName: 'Emma Watson',
          avatar: '/placeholder-user.jpg',
          status: 'busy',
        },
        {
          id: '5',
          username: 'david_casual',
          displayName: 'David Kim',
          avatar: '/placeholder-user.jpg',
          status: 'offline',
          lastSeen: '2 hours ago',
        },
      ];

      setFriends(mockFriends);
    } catch (error) {
      console.error('Failed to fetch online friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const onlineFriends = friends.filter(friend => friend.status !== 'offline');
  const offlineFriends = friends.filter(friend => friend.status === 'offline');

  const handleStartChat = (friendId: string) => {
    // Implement chat functionality
    console.log('Starting chat with friend:', friendId);
  };

  const handleJoinActivity = (friend: OnlineFriend) => {
    if (friend.activity?.type === 'watching' && friend.activity.videoId) {
      // Redirect to video
      window.location.href = `/videos/${friend.activity.videoId}`;
    } else if (friend.activity?.type === 'in_party' && friend.activity.partyId) {
      // Redirect to party
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
          Friends
          <Badge variant="secondary">{onlineFriends.length} online</Badge>
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
                      {friend.displayName.split(' ').map(n => n[0]).join('')}
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
                        <Button
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
                          <Button
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
                      {friend.displayName.split(' ').map(n => n[0]).join('')}
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
                Show {offlineFriends.length - 5} more offline friends
              </Button>
            )}
          </div>
        )}

        {friends.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No friends to show</p>
            <Button variant="link" className="mt-2">
              Find friends
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
