'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from "next/image"
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, MessageCircle, Play, Users, Clock, Sparkles } from 'lucide-react';
import { usersAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface ActivityItem {
  id: string;
  userId: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
    isOnline: boolean;
    lastSeen?: string;
  };
  type: 'watch_video' | 'join_party' | 'like_video' | 'comment' | 'achievement' | 'friend_added';
  content: {
    title: string;
    description?: string;
    thumbnail?: string;
    videoId?: string;
    partyId?: string;
    achievementId?: string;
  };
  timestamp: string;
  privacy: 'public' | 'friends_only' | 'private';
}

const ActivityIcon = ({ type }: { type: ActivityItem['type'] }) => {
  switch (type) {
    case 'watch_video':
      return <Play className="h-4 w-4 text-blue-500" />;
    case 'join_party':
      return <Users className="h-4 w-4 text-green-500" />;
    case 'like_video':
      return <Heart className="h-4 w-4 text-red-500" />;
    case 'comment':
      return <MessageCircle className="h-4 w-4 text-purple-500" />;
    case 'achievement':
      return <Sparkles className="h-4 w-4 text-yellow-500" />;
    case 'friend_added':
      return <Users className="h-4 w-4 text-pink-500" />;
    default:
      return <Clock className="h-4 w-4 text-gray-500" />;
  }
};

const fallbackId = (prefix: string) =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? `${prefix}-${crypto.randomUUID()}`
    : `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

const resolveActivityType = (rawType: unknown): ActivityItem['type'] => {
  const type = typeof rawType === 'string' ? rawType.toLowerCase() : '';

  if (type.includes('friend')) return 'friend_added';
  if (type.includes('achievement')) return 'achievement';
  if (type.includes('comment')) return 'comment';
  if (type.includes('like')) return 'like_video';
  if (type.includes('party')) return 'join_party';
  return 'watch_video';
};

const normalizePrivacy = (privacy: unknown): ActivityItem['privacy'] => {
  const value = typeof privacy === 'string' ? privacy.toLowerCase() : '';
  if (value === 'friends' || value === 'friends_only') return 'friends_only';
  if (value === 'private') return 'private';
  return 'public';
};

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }
  return date.toLocaleString();
};

const normalizeActivity = (activity: unknown): ActivityItem => {
  const activityType = resolveActivityType(activity?.activity_type ?? activity?.type);
  const user = activity?.user ?? {};
  const metadata = activity?.metadata ?? activity?.content ?? {};

  const title =
    metadata.title ??
    metadata.name ??
    metadata.video_title ??
    metadata.party_name ??
    metadata.achievement_name ??
    'Activity update';

  const description = metadata.description ?? metadata.summary ?? null;

  return {
    id: String(activity?.id ?? fallbackId('activity')),
    userId: String(user?.id ?? activity?.user_id ?? fallbackId('user')),
    user: {
      id: String(user?.id ?? activity?.user_id ?? fallbackId('user')),
      username: user?.username ?? user?.handle ?? 'user',
      displayName: user?.display_name ?? user?.name ?? user?.username ?? 'Friend',
      avatar: user?.avatar ?? user?.avatar_url ?? '/placeholder-user.jpg',
      isOnline: Boolean(user?.is_online ?? false),
      lastSeen: user?.last_seen ?? user?.last_activity ?? undefined,
    },
    type: activityType,
    content: {
      title,
      description: description ?? undefined,
      thumbnail: metadata.thumbnail ?? metadata.thumbnail_url ?? undefined,
      videoId: metadata.video_id ?? metadata.videoId ?? activity?.video_id ?? undefined,
      partyId: metadata.party_id ?? metadata.partyId ?? activity?.party_id ?? undefined,
      achievementId: metadata.achievement_id ?? metadata.achievementId ?? undefined,
    },
    timestamp: formatTimestamp(activity?.created_at ?? activity?.timestamp ?? new Date().toISOString()),
    privacy: normalizePrivacy(activity?.privacy ?? activity?.visibility),
  };
};

export default function FriendsActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | ActivityItem['type']>(&apos;all&apos;);
  const [timeframe, setTimeframe] = useState('today');
  const { toast } = useToast();

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page: 1 };
      if (filter !== 'all') {
        params.type = filter;
      }
      if (timeframe) {
        params.timeframe = timeframe;
      }

      const response = await usersAPI.getActivity(params);
      const results = Array.isArray(response?.results) ? response.results : [];
      setActivities(results.map((item: unknown) => normalizeActivity(item)));
    } catch {
      console.error('Failed to fetch activities:', error);
      toast({
        title: 'Could not load friend activity',
        description: 'Please try again later.',
        variant: 'destructive',
      });
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, [filter, timeframe, toast]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const filteredActivities = activities.filter(activity => 
    filter === 'all' || activity.type === filter
  );

  const getActivityText = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'watch_video':
        return 'watched a video';
      case 'join_party':
        return 'joined a watch party';
      case 'like_video':
        return 'liked a video';
      case 'comment':
        return 'commented on a video';
      case 'achievement':
        return 'earned an achievement';
      case 'friend_added':
        return 'made new friends';
      default:
        return 'was active';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 bg-gray-300 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
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
          <h1 className="text-2xl font-bold">Friends Activity</h1>
          <p className="text-muted-foreground">See what your friends are up to</p>
        </div>
        <div className="flex gap-4">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={filter} onValueChange={(value) => setFilter(value as typeof filter)}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="watch_video">Videos</TabsTrigger>
          <TabsTrigger value="join_party">Parties</TabsTrigger>
          <TabsTrigger value="like_video">Likes</TabsTrigger>
          <TabsTrigger value="comment">Comments</TabsTrigger>
          <TabsTrigger value="achievement">Achievements</TabsTrigger>
          <TabsTrigger value="friend_added">Friends</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="space-y-4 mt-6">
          {filteredActivities.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No activity yet</h3>
                <p className="text-muted-foreground">Your friends haven&apos;t been active recently.</p>
              </CardContent>
            </Card>
          ) : (
            filteredActivities.map((activity) => (
              <Card key={activity.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={activity.user.avatar} alt={activity.user.displayName} />
                        <AvatarFallback>
                          {activity.user.displayName.split(' ').map(n => n[0]).join(&apos;&apos;)}
                        </AvatarFallback>
                      </Avatar>
                      {activity.user.isOnline && (
                        <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-background"></div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">{activity.user.displayName}</span>
                        <span className="text-muted-foreground">
                          {getActivityText(activity)}
                        </span>
                        <ActivityIcon type={activity.type} />
                        <Badge variant="outline" className="ml-auto">
                          {activity.privacy === 'public' ? 'Public' : 'Friends'}
                        </Badge>
                      </div>

                      <div className="flex items-start gap-4">
                        {activity.content.thumbnail && (
                          <img
                            src={activity.content.thumbnail}
                            alt=""
                            className="w-16 h-12 object-cover rounded border"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium text-sm mb-1">
                            {activity.content.title}
                          </h4>
                          {activity.content.description && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {activity.content.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <span className="text-sm text-muted-foreground">
                          {activity.timestamp}
                        </span>
                        <div className="flex gap-2">
                          {activity.type === 'watch_video' && activity.content.videoId && (
                            <Button variant="outline" size="sm">
                              Watch Too
                            </Button>
                          )}
                          {activity.type === 'join_party' && activity.content.partyId && (
                            <Button variant="outline" size="sm">
                              Join Party
                            </Button>
                          )}
                          <Button variant="ghost" size="sm">
                            <Heart className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
