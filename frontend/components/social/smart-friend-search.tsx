import { Calendar, Filter, MapPin, Refresh, Search, Star, User, Users } from "lucide-react"
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usersAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

'use client';
interface User {}
  id: string
  username: string
  displayName: string
  avatar: string
  isOnline: boolean
  mutualFriends: number
  commonInterests: string[];
  location?: string
  joinedDate: string
  watchedGenres: string[];
  favoriteMovies: string[];
  isVerified: boolean
  friendshipStatus: 'none' | 'pending_sent' | 'pending_received' | 'friends' | 'blocked';
  bio?: string
  stats: {}
    moviesWatched: number
    partiesHosted: number
    friendsCount: number
  };
}

interface SearchFilters {}
  sortBy: 'relevance' | 'mutual_friends' | 'activity' | 'recent';
  location: 'any' | 'nearby' | 'same_city';
  hasAvatar: boolean
  isOnline: boolean
  verifiedOnly: boolean
  minMutualFriends: number
  genres: string[];
}

const fallbackId = (prefix: string) =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? `${prefix}-${crypto.randomUUID()}`
    : `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

const normalizeSearchUser = (user: unknown): User => ({}
  id: String(user?.id ?? user?.user_id ?? user?.username ?? fallbackId('user')),
  username: user?.username ?? user?.handle ?? 'user',
  displayName:
    user?.display_name ??
    user?.name ??
    user?.full_name ??
    user?.user?.display_name ??
    user?.username ??
    'User',
  avatar:
    user?.avatar_url ??
    user?.avatar ??
    user?.profile_image ??
    user?.user?.avatar ??
    '/placeholder-user.jpg',
  isOnline: Boolean(user?.is_online ?? user?.online ?? user?.status === 'online'),
  mutualFriends: user?.mutual_friends_count ?? user?.mutual_friends ?? user?.mutualFriends ?? 0,
  commonInterests: Array.isArray(user?.common_interests)
    ? user.common_interests
    : Array.isArray(user?.interests)
      ? user.interests
      : Array.isArray(user?.genres)
        ? user.genres
        : [],
  location: user?.location ?? user?.city ?? user?.region,
  joinedDate: user?.joined_at ?? user?.created_at ?? new Date().toISOString(),
  watchedGenres: Array.isArray(user?.watched_genres)
    ? user.watched_genres
    : Array.isArray(user?.favorite_genres)
      ? user.favorite_genres
      : [],
  favoriteMovies: Array.isArray(user?.favorite_movies) ? user.favorite_movies : [],
  isVerified: Boolean(user?.is_verified ?? user?.verified),
  friendshipStatus: user?.friendship_status ?? 'none',
  bio: user?.bio ?? user?.about ?? '',
  stats: {}
    moviesWatched: user?.stats?.movies_watched ?? user?.movies_watched ?? 0,
    partiesHosted: user?.stats?.parties_hosted ?? user?.parties_hosted ?? 0,
    friendsCount: user?.stats?.friends_count ?? user?.friends_count ?? 0,
  },
});

const buildSearchParams = (searchTerm: string, filters: SearchFilters) => {}
  const result = { q: searchTerm || '',
    limit: 20,
    sort: filters.sortBy,
  } as Record<string, unknown>;

  if (filters.location !== 'any') {
    result.location = filters.location
  }

  if (filters.hasAvatar) {
    result.has_avatar = true
  }

  if (filters.isOnline) {
    result.is_online = true
  }

  if (filters.verifiedOnly) {
    result.verified = true
  }

  if (filters.minMutualFriends > 0) {
    result.min_mutual_friends = filters.minMutualFriends
  }

  if (filters.genres.length > 0) {
    result.genres = filters.genres
  }

  return result
};

export default function SmartFriendSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({}
    sortBy: 'relevance',
    location: 'any',
    hasAvatar: false,
    isOnline: false,
    verifiedOnly: false,
    minMutualFriends: 0,
    genres: [],
  });
  const { toast } = useToast();

  const availableGenres = []
    'Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi',
    'Romance', 'Thriller', 'Documentary', 'Animation', 'Fantasy'
  ];

  const loadSuggestions = useCallback(async () => {
    setLoadingSuggestions(true);
    try {
      const response = await usersAPI.getFriendSuggestions({ limit: 12 });
      const normalized = (response ?? []).map((item: unknown) => normalizeSearchUser(item));
      setSuggestions(normalized);
    } catch (err) {
      console.error('Failed to load friend suggestions:', error);
      toast({title: 'Unable to load suggestions',
        description: 'Please try refreshing suggestions in a moment.',
        variant: 'destructive',
      });
    } finally {
      setLoadingSuggestions(false);
    }
  }, [toast]);

  useEffect(() => {
    if (searchTerm.length > 2) {
      searchUsers();
    } else {}
      setUsers([]);
    }
  }, [searchTerm, filters]);

  useEffect(() => {
    loadSuggestions();
  }, [loadSuggestions]);

  const searchUsers = async () => {
    setLoading(true);
    try {
      const params = buildSearchParams(searchTerm, filters);
      const response = await usersAPI.searchUsers(params);
      const results = response?.results ?? [];
      setUsers(results.map((result: unknown) => normalizeSearchUser(result)));
    } catch (err) {
      console.error('Failed to search users:', error);
      toast({title: 'Search failed',
        description: 'We could not complete that search. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (list: User[]) => {}
    const filtered = list.filter(user => {}
      if (filters.hasAvatar && !user.avatar) return false
      if (filters.isOnline && !user.isOnline) return false
      if (filters.verifiedOnly && !user.isVerified) return false
      if (user.mutualFriends < filters.minMutualFriends) return false
      if (filters.genres.length > 0) {
        const hasCommonGenre = filters.genres.some(genre => user.watchedGenres.includes(genre));
        if (!hasCommonGenre) return false
      }
      return true
    });

    const sorted = [...filtered];

    switch (filters.sortBy) {
      case 'mutual_friends':
        sorted.sort((a, b) => b.mutualFriends - a.mutualFriends);
        break
      case 'activity':
        sorted.sort((a, b) => b.stats.moviesWatched - a.stats.moviesWatched);
        break
      case 'recent':
        sorted.sort((a, b) => new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime());
        break
      default:
        sorted.sort((a, b) => {}
          const aScore = a.mutualFriends * 2 + a.commonInterests.length
          const bScore = b.mutualFriends * 2 + b.commonInterests.length
          return bScore - aScore
        });
    }

    return sorted
  };

  const filteredUsers = useMemo(() => applyFilters(users), [users, filters]);
  const filteredSuggestions = useMemo(() => applyFilters(suggestions), [suggestions, filters]);

  const UserCard = ({ user }: { user: User }) => (
    <Card key={user.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="relative">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatar} alt={user.displayName} />
              <AvatarFallback>
                {user.displayName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
            {user.isOnline && (
              <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-background"></div>
            )}
            {user.isVerified && (
              <div className="absolute -top-1 -right-1">
                <Star className="h-5 w-5 text-blue-500 fill-current" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">{user.displayName}</h3>
              <span className="text-muted-foreground">@{user.username}</span>
            </div>

            {user.bio && <p className="text-sm text-muted-foreground mb-3">{user.bio}</p>}

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
              {user.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {user.location}
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Joined {new Date(user.joinedDate).toLocaleDateString()}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4 text-center">
              <div>
                <div className="font-semibold">{user.stats.moviesWatched}</div>
                <div className="text-xs text-muted-foreground">Movies</div>
              </div>
              <div>
                <div className="font-semibold">{user.stats.partiesHosted}</div>
                <div className="text-xs text-muted-foreground">Parties</div>
              </div>
              <div>
                <div className="font-semibold">{user.stats.friendsCount}</div>
                <div className="text-xs text-muted-foreground">Friends</div>
              </div>
            </div>

            {user.mutualFriends > 0 && (
              <div className="mb-3">
                <Badge variant="secondary" className="mb-2">
                  {user.mutualFriends} mutual friends
                </Badge>
              </div>
            )}

            {user.commonInterests.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {user.commonInterests.map((interest, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {interest}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            {getFriendshipButton(user)}
            <Button variant="ghost" size="sm">
              View Profile
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const handleSendFriendRequest = async (userId: string) => {}
    try {
      await usersAPI.sendFriendRequestToUser(userId);

      setUsers(prev =>
        prev.map(user =>
          user.id === userId
            ? { ...user, friendshipStatus: 'pending_sent' }
            : user
        )
      );

      setSuggestions(prev =>
        prev.map(user =>
          user.id === userId
            ? { ...user, friendshipStatus: 'pending_sent' }
            : user
        )
      );

      toast({title: 'Friend request sent',
        description: 'We let them know you want to connect.',
      });
    } catch (err) {
      console.error('Failed to send friend request:', error);
      toast({title: 'Unable to send request',
        description: 'Please try again in a moment.',
        variant: 'destructive',
      });
    }
  };

  const handleAcceptFriendRequest = async (userId: string) => {}
    try {
      // API call to accept friend request
      console.log('Accepting friend request from:', userId);

      setUsers(prev =>
        prev.map(user =>
          user.id === userId
            ? { ...user, friendshipStatus: 'friends' }
            : user
        )
      );

      setSuggestions(prev =>
        prev.map(user =>
          user.id === userId
            ? { ...user, friendshipStatus: 'friends' }
            : user
        )
      );

      toast({title: 'Friend request accepted',
        description: 'You are now connected.',
      });
    } catch (err) {
      console.error('Failed to accept friend request:', error);
      toast({title: 'Unable to update request',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  const getFriendshipButton = (user: User) => {}
    switch (user.friendshipStatus) {
      case 'none':
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSendFriendRequest(user.id)}
          >
            <UserPlus className="h-4 w-4 mr-1" />
            Add Friend
          </Button>
        );
      case 'pending_sent':
        return (
          <Button variant="outline" size="sm" disabled>
            Request Sent
          </Button>
        );
      case 'pending_received':
        return (
          <Button
            variant="default"
            size="sm"
            onClick={() => handleAcceptFriendRequest(user.id)}
          >
            Accept Request
          </Button>
        );
      case 'friends':
        return (
          <Badge variant="secondary">
            <Users className="h-4 w-4 mr-1" />
            Friends
          </Badge>
        );
      default:
        return null
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for friends by name, username, or interests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Advanced Filters
        </Button>
      </div>

      <Tabs defaultValue="search" className="space-y-6">
        <TabsList>
          <TabsTrigger value="search">Search Results</TabsTrigger>
          <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
          <TabsTrigger value="filters">Filters</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="h-16 w-16 bg-gray-300 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                        <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <UserCard key={user.id} user={user} />
              ))}
            </div>
          ) : searchTerm.length > 2 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No users found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search terms or filters
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Start searching</h3>
                <p className="text-muted-foreground">
                  Enter at least 3 characters to search for users
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Suggested connections</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={loadSuggestions}
              disabled={loadingSuggestions}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              {loadingSuggestions ? 'Refreshing…' : 'Refresh'}
            </Button>
          </div>

          {loadingSuggestions ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="h-16 w-16 bg-gray-300 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                        <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredSuggestions.length > 0 ? (
            <div className="space-y-4">
              {filteredSuggestions.map((user) => (
                <UserCard key={`suggestion-${user.id}`} user={user} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No suggestions just yet</h3>
                <p className="text-muted-foreground">
                  Check back later as we learn more about your watch history and friends.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="filters" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Search Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sort by</label>
                  <Select
                    value={filters.sortBy}
                    onValueChange={(value: SearchFilters['sortBy']) =>
                      setFilters({ ...filters, sortBy: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Relevance</SelectItem>
                      <SelectItem value="mutual_friends">Mutual Friends</SelectItem>
                      <SelectItem value="activity">Most Active</SelectItem>
                      <SelectItem value="recent">Recently Joined</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Location</label>
                  <Select
                    value={filters.location}
                    onValueChange={(value: SearchFilters['location']) =>
                      setFilters({ ...filters, location: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Anywhere</SelectItem>
                      <SelectItem value="nearby">Nearby</SelectItem>
                      <SelectItem value="same_city">Same City</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Minimum Mutual Friends</label>
                  <Select
                    value={filters.minMutualFriends.toString()}
                    onValueChange={(value) =>
                      setFilters({ ...filters, minMutualFriends: parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Any</SelectItem>
                      <SelectItem value="1">1+</SelectItem>
                      <SelectItem value="5">5+</SelectItem>
                      <SelectItem value="10">10+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Favorite Genres</label>
                  <div className="flex flex-wrap gap-2">
                    {availableGenres.map((genre) => (
                      <Badge
                        key={genre}
                        variant={filters.genres.includes(genre) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {}
                          const newGenres = filters.genres.includes(genre)
                            ? filters.genres.filter(g => g !== genre)
                            : [...filters.genres, genre];
                          setFilters({ ...filters, genres: newGenres });
                        }}
                      >
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
