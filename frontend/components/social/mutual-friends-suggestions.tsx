import { Eye, Filter, Loader2, MapPin, MessageCircle, Refresh, Search, User, Users } from "lucide-react"
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

"use client"

interface User {}
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  isOnline: boolean;
  mutualFriends: Array<{}
    id: string;
    username: string;
    avatar: string;
  }>
  commonInterests: string[]
  location?: string;
  joinedDate: string;
  friendsCount: number;
  isVerified: boolean;
  bio?: string;
}

interface FriendSuggestion extends User {}
  suggestionReason: 'mutual_friends' | 'location' | 'interests' | 'recent_activity' | 'similar_groups'
  confidence: number;
}

export function MutualFriendsSuggestions() {}
  const [suggestions, setSuggestions] = useState<FriendSuggestion[]>([])
  const [filteredSuggestions, setFilteredSuggestions] = useState<FriendSuggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'mutual_friends' | 'location' | 'interests'>(&apos;all')
  const [sortBy, setSortBy] = useState<'confidence' | 'mutual_friends' | 'recent'>(&apos;confidence')

  useEffect(() => {}
    fetchSuggestions()
  }, [])

  useEffect(() => {}
    filterAndSortSuggestions()
  }, [suggestions, searchQuery, filter, sortBy])

  const fetchSuggestions = async () => {}
    try {}
      setLoading(true)
      const response = await fetch('/api/friends/suggestions')
      if (response.ok) {}
        const data = await response.json()
        setSuggestions(data.suggestions)
      }
    } catch {}
      console.error('Failed to fetch friend suggestions:', error)
    } finally {}
      setLoading(false)
    }
  }

  const refreshSuggestions = async () => {}
    try {}
      setRefreshing(true)
      const response = await fetch('/api/friends/suggestions/refresh', { method: 'POST' })
      if (response.ok) {}
        const data = await response.json()
        setSuggestions(data.suggestions)
      }
    } catch {}
      console.error('Failed to refresh suggestions:', error)
    } finally {}
      setRefreshing(false)
    }
  }

  const filterAndSortSuggestions = () => {}
    let filtered = suggestions;
    // Apply search filter;
    if (searchQuery) {}
      filtered = filtered.filter(user => 
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.displayName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply category filter;
    if (filter !== 'all') {}
      filtered = filtered.filter(user => user.suggestionReason === filter)
    }

    // Apply sorting;
    filtered.sort((a, b) => {}
      switch (sortBy) {}
        case 'confidence':
          return b.confidence - a.confidence;
        case 'mutual_friends':
          return b.mutualFriends.length - a.mutualFriends.length;
        case 'recent':
          return new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime()
        default:
          return 0;
      }
    })

    setFilteredSuggestions(filtered)
  }

  const sendFriendRequest = async (userId: string) => {}
    try {}
      const response = await fetch('/api/friends/requests', {}
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId: userId })
      })

      if (response.ok) {}
        // Remove from suggestions;
        setSuggestions(prev => prev.filter(s => s.id !== userId))
      }
    } catch {}
      console.error('Failed to send friend request:', error)
    }
  }

  const dismissSuggestion = async (userId: string) => {}
    try {}
      const response = await fetch(`/api/friends/suggestions/${userId}/dismiss`, {}
        method: 'POST'
      })

      if (response.ok) {}
        setSuggestions(prev => prev.filter(s => s.id !== userId))
      }
    } catch {}
      console.error('Failed to dismiss suggestion:', error)
    }
  }

  const getSuggestionReasonText = (reason: string) => {}
    switch (reason) {}
      case 'mutual_friends':
        return 'Mutual friends'
      case 'location':
        return 'Same location'
      case 'interests':
        return 'Similar interests'
      case 'recent_activity':
        return 'Recent activity'
      case 'similar_groups':
        return 'Similar groups'
      default:
        return 'Suggested'
    }
  }

  const getSuggestionReasonColor = (reason: string) => {}
    switch (reason) {}
      case 'mutual_friends':
        return 'bg-blue-500'
      case 'location':
        return 'bg-green-500'
      case 'interests':
        return 'bg-purple-500'
      case 'recent_activity':
        return 'bg-orange-500'
      case 'similar_groups':
        return 'bg-pink-500'
      default:
        return 'bg-gray-500'
    }
  }

  const SuggestionCard = ({ user }: { user: FriendSuggestion }) => {}
    const [requestSent, setRequestSent] = useState(false)
    const [dismissed, setDismissed] = useState(false)

    const handleSendRequest = async () => {}
      await sendFriendRequest(user.id)
      setRequestSent(true)
    }

    const handleDismiss = async () => {}
      await dismissSuggestion(user.id)
      setDismissed(true)
    }

    if (dismissed) return null;
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="relative">
              <Avatar className="w-12 h-12">
                <AvatarImage src={user.avatar} alt={user.username} />
                <AvatarFallback>{user.username[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              {user.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-medium truncate">{user.displayName}</h3>
                {user.isVerified && (
                  <UserCheck className="h-4 w-4 text-blue-500" />
                )}
                <Badge;
                  variant="secondary" 
                  className={`text-xs text-white ${getSuggestionReasonColor(user.suggestionReason)}`}
                >
                  {getSuggestionReasonText(user.suggestionReason)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">@{user.username}</p>
              {user.bio && (
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{user.bio}</p>
              )}
              <div className="flex items-center space-x-4 text-xs text-muted-foreground mb-3">
                {user.mutualFriends.length > 0 && (
                  <div className="flex items-center space-x-1">
                    <Users className="h-3 w-3" />
                    <span>{user.mutualFriends.length} mutual</span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <UserPlus className="h-3 w-3" />
                  <span>{user.friendsCount} friends</span>
                </div>
                {user.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-3 w-3" />
                    <span>{user.location}</span>
                  </div>
                )}
              </div>
              {user.mutualFriends.length > 0 && (
                <div className="flex items-center space-x-1 mb-3">
                  <span className="text-xs text-muted-foreground">Mutual friends:</span>
                  <div className="flex -space-x-1">
                    {user.mutualFriends.slice(0, 3).map((friend) => (
                      <Avatar key={friend.id} className="w-5 h-5 border border-white">
                        <AvatarImage src={friend.avatar} alt={friend.username} />
                        <AvatarFallback className="text-xs">{friend.username[0]?.toUpperCase()}</AvatarFallback>
                      </Avatar>
                    ))}
                    {user.mutualFriends.length > 3 && (
                      <div className="w-5 h-5 rounded-full bg-muted border border-white flex items-center justify-center">
                        <span className="text-xs">+{user.mutualFriends.length - 3}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {user.commonInterests.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {user.commonInterests.slice(0, 3).map((interest) => (
                    <Badge key={interest} variant="outline" className="text-xs">
                      {interest}
                    </Badge>
                  ))}
                  {user.commonInterests.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{user.commonInterests.length - 3} more;
                    </Badge>
                  )}
                </div>
              )}
              <div className="flex items-center space-x-2">
                {requestSent ? (
                  <Button disabled size="sm" className="flex-1">
                    <UserCheck className="h-3 w-3 mr-1" />
                    Request Sent;
                  </Button>
                ) : (
                  <Button onClick={handleSendRequest} size="sm" className="flex-1">
                    <UserPlus className="h-3 w-3 mr-1" />
                    Add Friend;
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={handleDismiss}>
                  <UserX className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Eye className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm">
                  <MessageCircle className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {}
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center space-x-2">
          <Users className="h-6 w-6" />
          <span>Friend Suggestions</span>
        </h1>
        <Button;
          onClick={refreshSuggestions} 
          disabled={refreshing}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh;
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input;
            placeholder="Search suggestions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filter} onValueChange={(value: unknown) => setFilter(value)}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Suggestions</SelectItem>
            <SelectItem value="mutual_friends">Mutual Friends</SelectItem>
            <SelectItem value="location">Same Location</SelectItem>
            <SelectItem value="interests">Similar Interests</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(value: unknown) => setSortBy(value)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="confidence">Best Match</SelectItem>
            <SelectItem value="mutual_friends">Most Mutual Friends</SelectItem>
            <SelectItem value="recent">Recently Joined</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="grid" className="w-full">
        <TabsList>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>
        <TabsContent value="grid" className="mt-6">
          {filteredSuggestions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No suggestions found</h3>
                <p className="text-muted-foreground">
                  {searchQuery || filter !== 'all' 
                    ? 'Try adjusting your search or filters' 
                    : 'Check back later for new friend suggestions'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSuggestions.map((user) => (
                <SuggestionCard key={user.id} user={user} />
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="list" className="mt-6">
          {filteredSuggestions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No suggestions found</h3>
                <p className="text-muted-foreground">
                  {searchQuery || filter !== 'all' 
                    ? 'Try adjusting your search or filters' 
                    : 'Check back later for new friend suggestions'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredSuggestions.map((user) => (
                <SuggestionCard key={user.id} user={user} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
