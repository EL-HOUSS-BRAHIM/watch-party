'use client';

import { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, UserPlus, Users, Star, MapPin, Calendar } from 'lucide-react';

interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  isOnline: boolean;
  mutualFriends: number;
  commonInterests: string[];
  location?: string;
  joinedDate: string;
  watchedGenres: string[];
  favoriteMovies: string[];
  isVerified: boolean;
  friendshipStatus: 'none' | 'pending_sent' | 'pending_received' | 'friends' | 'blocked';
  bio?: string;
  stats: {
    moviesWatched: number;
    partiesHosted: number;
    friendsCount: number;
  };
}

interface SearchFilters {
  sortBy: 'relevance' | 'mutual_friends' | 'activity' | 'recent';
  location: 'any' | 'nearby' | 'same_city';
  hasAvatar: boolean;
  isOnline: boolean;
  verifiedOnly: boolean;
  minMutualFriends: number;
  genres: string[];
}

export default function SmartFriendSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    sortBy: 'relevance',
    location: 'any',
    hasAvatar: false,
    isOnline: false,
    verifiedOnly: false,
    minMutualFriends: 0,
    genres: [],
  });

  const availableGenres = [
    'Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 
    'Romance', 'Thriller', 'Documentary', 'Animation', 'Fantasy'
  ];

  useEffect(() => {
    if (searchTerm.length > 2) {
      searchUsers();
    } else {
      setUsers([]);
    }
  }, [searchTerm, filters]);

  const searchUsers = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockUsers: User[] = [
        {
          id: '1',
          username: 'movie_buff_alex',
          displayName: 'Alex Chen',
          avatar: '/placeholder-user.jpg',
          isOnline: true,
          mutualFriends: 12,
          commonInterests: ['Sci-Fi', 'Thriller', 'Action'],
          location: 'San Francisco, CA',
          joinedDate: '2023-01-15',
          watchedGenres: ['Sci-Fi', 'Action', 'Thriller'],
          favoriteMovies: ['The Matrix', 'Inception', 'Blade Runner'],
          isVerified: true,
          friendshipStatus: 'none',
          bio: 'Love discussing plot twists and cinematography. Always up for a good sci-fi marathon!',
          stats: {
            moviesWatched: 245,
            partiesHosted: 18,
            friendsCount: 89,
          },
        },
        {
          id: '2',
          username: 'sarah_movie_nights',
          displayName: 'Sarah Johnson',
          avatar: '/placeholder-user.jpg',
          isOnline: false,
          mutualFriends: 8,
          commonInterests: ['Horror', 'Comedy'],
          location: 'New York, NY',
          joinedDate: '2023-03-22',
          watchedGenres: ['Horror', 'Comedy', 'Drama'],
          favoriteMovies: ['Get Out', 'Hereditary', 'The Office'],
          isVerified: false,
          friendshipStatus: 'pending_sent',
          bio: 'Horror movie enthusiast and comedy lover. Host weekly movie nights!',
          stats: {
            moviesWatched: 189,
            partiesHosted: 25,
            friendsCount: 156,
          },
        },
        {
          id: '3',
          username: 'mike_cinema_critic',
          displayName: 'Mike Rodriguez',
          avatar: '/placeholder-user.jpg',
          isOnline: true,
          mutualFriends: 15,
          commonInterests: ['Drama', 'Documentary', 'Foreign Films'],
          location: 'Los Angeles, CA',
          joinedDate: '2022-11-08',
          watchedGenres: ['Drama', 'Documentary', 'Romance'],
          favoriteMovies: ['Parasite', 'The Godfather', 'Citizen Kane'],
          isVerified: true,
          friendshipStatus: 'friends',
          bio: 'Film school graduate. Love analyzing cinematography and storytelling techniques.',
          stats: {
            moviesWatched: 412,
            partiesHosted: 8,
            friendsCount: 203,
          },
        },
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      setUsers(mockUsers);
    } catch (error) {
      console.error('Failed to search users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    let filtered = users.filter(user => {
      if (filters.hasAvatar && !user.avatar) return false;
      if (filters.isOnline && !user.isOnline) return false;
      if (filters.verifiedOnly && !user.isVerified) return false;
      if (user.mutualFriends < filters.minMutualFriends) return false;
      if (filters.genres.length > 0) {
        const hasCommonGenre = filters.genres.some(genre => 
          user.watchedGenres.includes(genre)
        );
        if (!hasCommonGenre) return false;
      }
      return true;
    });

    // Sort results
    switch (filters.sortBy) {
      case 'mutual_friends':
        filtered.sort((a, b) => b.mutualFriends - a.mutualFriends);
        break;
      case 'activity':
        filtered.sort((a, b) => b.stats.moviesWatched - a.stats.moviesWatched);
        break;
      case 'recent':
        filtered.sort((a, b) => new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime());
        break;
      default: // relevance
        filtered.sort((a, b) => {
          const aScore = a.mutualFriends * 2 + a.commonInterests.length;
          const bScore = b.mutualFriends * 2 + b.commonInterests.length;
          return bScore - aScore;
        });
    }

    return filtered;
  }, [users, filters]);

  const handleSendFriendRequest = async (userId: string) => {
    try {
      // API call to send friend request
      console.log('Sending friend request to:', userId);
      
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, friendshipStatus: 'pending_sent' }
          : user
      ));
    } catch (error) {
      console.error('Failed to send friend request:', error);
    }
  };

  const handleAcceptFriendRequest = async (userId: string) => {
    try {
      // API call to accept friend request
      console.log('Accepting friend request from:', userId);
      
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, friendshipStatus: 'friends' }
          : user
      ));
    } catch (error) {
      console.error('Failed to accept friend request:', error);
    }
  };

  const getFriendshipButton = (user: User) => {
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
        return null;
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
                <Card key={user.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={user.avatar} alt={user.displayName} />
                          <AvatarFallback>
                            {user.displayName.split(' ').map(n => n[0]).join('')}
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

                        {user.bio && (
                          <p className="text-sm text-muted-foreground mb-3">{user.bio}</p>
                        )}

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
                        onClick={() => {
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
