'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, MessageCircle, Play, Users, Clock, Sparkles } from 'lucide-react';

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

export default function FriendsActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | ActivityItem['type']>('all');
  const [timeframe, setTimeframe] = useState('today');

  useEffect(() => {
    fetchActivities();
  }, [filter, timeframe]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockActivities: ActivityItem[] = [
        {
          id: '1',
          userId: 'user1',
          user: {
            id: 'user1',
            username: 'alex_movie_fan',
            displayName: 'Alex Chen',
            avatar: '/placeholder-user.jpg',
            isOnline: true,
          },
          type: 'watch_video',
          content: {
            title: 'Watched "The Matrix"',
            description: 'Completed watching in Party Room #42',
            thumbnail: '/placeholder.jpg',
            videoId: 'video123',
            partyId: 'party42',
          },
          timestamp: '2 minutes ago',
          privacy: 'friends_only',
        },
        {
          id: '2',
          userId: 'user2',
          user: {
            id: 'user2',
            username: 'sarah_streamer',
            displayName: 'Sarah Johnson',
            avatar: '/placeholder-user.jpg',
            isOnline: true,
          },
          type: 'achievement',
          content: {
            title: 'Unlocked "Movie Marathon" achievement',
            description: 'Watched 10 movies this week!',
            achievementId: 'marathon',
          },
          timestamp: '15 minutes ago',
          privacy: 'public',
        },
        {
          id: '3',
          userId: 'user3',
          user: {
            id: 'user3',
            username: 'mike_director',
            displayName: 'Mike Rodriguez',
            avatar: '/placeholder-user.jpg',
            isOnline: false,
            lastSeen: '1 hour ago',
          },
          type: 'join_party',
          content: {
            title: 'Joined "Horror Movie Night"',
            description: 'Now watching with 12 other people',
            partyId: 'party789',
          },
          timestamp: '1 hour ago',
          privacy: 'friends_only',
        },
        {
          id: '4',
          userId: 'user4',
          user: {
            id: 'user4',
            username: 'emma_critic',
            displayName: 'Emma Watson',
            avatar: '/placeholder-user.jpg',
            isOnline: true,
          },
          type: 'like_video',
          content: {
            title: 'Liked "Inception"',
            description: 'Great cinematography and storytelling!',
            thumbnail: '/placeholder.jpg',
            videoId: 'video456',
          },
          timestamp: '2 hours ago',
          privacy: 'public',
        },
        {
          id: '5',
          userId: 'user5',
          user: {
            id: 'user5',
            username: 'david_casual',
            displayName: 'David Kim',
            avatar: '/placeholder-user.jpg',
            isOnline: false,
            lastSeen: '3 hours ago',
          },
          type: 'friend_added',
          content: {
            title: 'Added 3 new friends',
            description: 'Connected through Movie Club group',
          },
          timestamp: '4 hours ago',
          privacy: 'friends_only',
        },
        {
          id: '6',
          userId: 'user6',
          user: {
            id: 'user6',
            username: 'lisa_reviewer',
            displayName: 'Lisa Park',
            avatar: '/placeholder-user.jpg',
            isOnline: true,
          },
          type: 'comment',
          content: {
            title: 'Commented on "Dune"',
            description: 'Amazing visuals! Hans Zimmer\'s score is incredible.',
            thumbnail: '/placeholder.jpg',
            videoId: 'video789',
          },
          timestamp: '6 hours ago',
          privacy: 'public',
        },
      ];

      await new Promise(resolve => setTimeout(resolve, 1000));
      setActivities(mockActivities);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setLoading(false);
    }
  };

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
                <p className="text-muted-foreground">Your friends haven't been active recently.</p>
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
                          {activity.user.displayName.split(' ').map(n => n[0]).join('')}
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
