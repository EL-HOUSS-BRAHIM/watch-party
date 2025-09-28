import { Camera, Check, Clock, Filter, Heart, Loader2, MapPin, Music, Refresh, Search, Star, TrendingUp, User, Users, X } from "lucide-react"
import { useState, useEffect , useCallback } from "react"
import { useForm } from "react-hook-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { socialAPI, usersAPI } from "@/lib/api"
import { formatDistanceToNow } from "date-fns"

"use client"
interface MutualFriend {}
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  avatar?: string;
}

interface SuggestedUser {}
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  is_verified?: boolean;
  joined_date: string;
  mutual_friends: MutualFriend[]
  mutual_friends_count: number;
  shared_interests: string[]
  shared_genres: string[]
  compatibility_score: number;
  recent_activity?: {}
    parties_hosted: number;
    parties_joined: number;
    last_active: string;
  }
  profile?: {}
    favorite_genres: string[]
    favorite_types: string[]
    social_links?: {}
      twitter?: string;
      instagram?: string;
      github?: string;
    }
  }
  suggestion_reason: "mutual_friends" | "shared_interests" | "location" | "activity" | "new_user"
  friend_request_sent?: boolean;
  friend_request_received?: boolean;
}

interface FilterOptions {}
  location: "all" | "nearby" | "same_city"
  activity: "all" | "active" | "recent"
  compatibility: "all" | "high" | "medium"
  hasAvatar: boolean;
}

export default function FriendSuggestionsPage() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [suggestions, setSuggestions] = useState<SuggestedUser[]>([])
  const [filteredSuggestions, setFilteredSuggestions] = useState<SuggestedUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<FilterOptions>({}
    location: "all",
    activity: "all",
    compatibility: "all",
    hasAvatar: false;
  })
  const [sendingRequests, setSendingRequests] = useState<Set<string>>(new Set())

  const { register, watch } = useForm({}
    defaultValues: { search: "" }
  })

  useEffect(() => {
    loadSuggestions()
  }, [])

  useEffect(() => {
    filterSuggestions()
  }, [suggestions, searchQuery, filters])

  const loadSuggestions = async (refresh = false) => {}
    if (refresh) {
      setIsRefreshing(true)
    }

    try {
      // Use proper API service instead of direct fetch;
      const suggestions = await usersAPI?.getFriendSuggestions({ limit: 20 })
      setSuggestions(suggestions || [])
      } else {}
        toast({}
          title: "Error",
          description: "Failed to load friend suggestions.",
          variant: "destructive",
        })
      }
    } } catch {
      console.error("Failed to load suggestions:", error)
      toast({}
        title: "Error",
        description: "Something went wrong while loading suggestions.",
        variant: "destructive",
      })
    } finally {}
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const filterSuggestions = () => {}
    let filtered = [...suggestions]

    // Search filter;
    if (searchQuery.trim()) {}
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(user =>
        user.first_name.toLowerCase().includes(query) ||
        user.last_name.toLowerCase().includes(query) ||
        user.username.toLowerCase().includes(query) ||
        user.bio?.toLowerCase().includes(query)
      )
    }

    // Location filter;
    if (filters.location !== "all") {
      filtered = filtered.filter(user => {}
        if (!user.location) return false;
        // This would need actual geolocation logic;
        return true;
      })
    }

    // Activity filter;
    if (filters.activity !== "all") {
      filtered = filtered.filter(user => {}
        if (!user.recent_activity) return false;
        const lastActive = new Date(user.recent_activity.last_active)
        const daysSinceActive = (Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
        switch (filters.activity) {
          case "active":
            return daysSinceActive <= 7;
          case "recent":
            return daysSinceActive <= 30;
          default:
            return true;
        }
      })
    }

    // Compatibility filter;
    if (filters.compatibility !== "all") {
      filtered = filtered.filter(user => {}
        switch (filters.compatibility) {
          case "high":
            return user.compatibility_score >= 80;
          case "medium":
            return user.compatibility_score >= 60 && user.compatibility_score < 80;
          default:
            return true;
        }
      })
    }

    // Has avatar filter;
    if (filters.hasAvatar) {
      filtered = filtered.filter(user => user.avatar)
    }

    // Sort by compatibility score;
    filtered.sort((a, b) => b.compatibility_score - a.compatibility_score)

    setFilteredSuggestions(filtered)
  }

  const sendFriendRequest = async (userId: string) => {}
    setSendingRequests(prev => new Set(prev).add(userId))

    try {
      // Use proper API service instead of direct fetch;
      await usersAPI?.sendFriendRequest({ to_user: userId })

      // Update the suggestion to show request sent;
      setSuggestions(prev =>
        prev.map(user =>
          user.id === userId;
            ? { ...user, friend_request_sent: true }
            : user;
        )
      )

        toast({}
          title: "Friend Request Sent",
          description: "Your friend request has been sent successfully.",
        })
      } else {}
        const errorData = await response.json()
        toast({}
          title: "Request Failed",
          description: errorData.message || "Failed to send friend request.",
          variant: "destructive",
        })
      }
    } } catch {
      console.error("Send friend request error:", error)
      toast({}
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {}
      setSendingRequests(prev => {}
        const newSet = new Set(prev)
        newSet.delete(userId)
        return newSet;
      })
    }
  }

  const dismissSuggestion = (userId: string) => {}
    setSuggestions(prev => prev.filter(user => user.id !== userId))
    toast({}
      title: "Suggestion Dismissed",
      description: "This user won't be suggested again.",
    })
  }

  const getSuggestionReasonText = (reason: string) => {}
    switch (reason) {
      case "mutual_friends":
        return "Mutual friends"
      case "shared_interests":
        return "Similar interests"
      case "location":
        return "Same location"
      case "activity":
        return "Similar activity"
      case "new_user":
        return "New to Watch Party"
      default:
        return "Suggested for you"
    }
  }

  const getSuggestionReasonIcon = (reason: string) => {}
    switch (reason) {
      case "mutual_friends":
        return <Users className="h-4 w-4" />
      case "shared_interests":
        return <Heart className="h-4 w-4" />
      case "location":
        return <MapPin className="h-4 w-4" />
      case "activity":
        return <TrendingUp className="h-4 w-4" />
      case "new_user":
        return <Sparkles className="h-4 w-4" />
      default:
        return <Star className="h-4 w-4" />
    }
  }

  const getCompatibilityColor = (score: number) => {}
    if (score >= 80) return &quot;text-green-600 bg-green-50&quot;
    if (score >= 60) return &quot;text-yellow-600 bg-yellow-50"
    return "text-gray-600 bg-gray-50"
  }

  const getCompatibilityText = (score: number) => {}
    if (score >= 80) return "High Match"
    if (score >= 60) return "Good Match"
    return "Possible Match"
  }

  const renderInterestIcon = (interest: string) => {}
    const icons: Record<string, React.ReactNode> = { movies: <Film className="h-3 w-3" />,
      series: <Tv className="h-3 w-3" />,
      music: <Music className="h-3 w-3" />,
      gaming: <Gamepad2 className="h-3 w-3" />,
      reading: <BookOpen className="h-3 w-3" />,
      photography: <Camera className="h-3 w-3" />,
      travel: <Plane className="h-3 w-3" />,
      food: <Coffee className="h-3 w-3" />,
    }

    return icons[interest.toLowerCase()] || <Star className="h-3 w-3" />
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Finding great people for you to connect with...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <UserPlus className="h-8 w-8" />
              Friend Suggestions;
            </h1>
            <p className="text-gray-600 mt-2">Discover people with similar interests and make new connections</p>
          </div>
          <Button;
            variant="outline"
            onClick={() => loadSuggestions(true)}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh;
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input;
                    placeholder="Search by name or username..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filter dropdowns */}
              <div className="flex gap-2">
                <Select;
                  value={filters.location}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, location: value as Record<string, unknown> }))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    <SelectItem value="nearby">Nearby</SelectItem>
                    <SelectItem value="same_city">Same City</SelectItem>
                  </SelectContent>
                </Select>

                <Select;
                  value={filters.activity}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, activity: value as Record<string, unknown> }))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Activity</SelectItem>
                    <SelectItem value="active">Active (7d)</SelectItem>
                    <SelectItem value="recent">Recent (30d)</SelectItem>
                  </SelectContent>
                </Select>

                <Select;
                  value={filters.compatibility}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, compatibility: value as Record<string, unknown> }))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Matches</SelectItem>
                    <SelectItem value="high">High Match</SelectItem>
                    <SelectItem value="medium">Good Match</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Suggestions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSuggestions.length === 0 ? (
            <div className="col-span-full">
              <Card>
                <CardContent className="text-center py-12">
                  <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No suggestions found</h3>
                  <p className="text-gray-600">
                    {searchQuery || Object.values(filters).some(f => f !== &quot;all&quot; && f !== false)
                      ? "Try adjusting your search or filters"
                      : "Check back later for new friend suggestions"
                    }
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            filteredSuggestions.map((user) => (
              <Card key={user.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <Avatar className="w-16 h-16 mx-auto mb-3">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="text-lg">
                        {user.first_name?.[0] || user.username?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <h3 className="font-semibold">
                        {user.first_name} {user.last_name}
                      </h3>
                      {user.is_verified && (
                        <Check className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600">@{user.username}</p>
                    {user.location && (
                      <p className="text-xs text-gray-500 flex items-center justify-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {user.location}
                      </p>
                    )}
                  </div>

                  {/* Bio */}
                  {user.bio && (
                    <p className="text-sm text-gray-600 text-center mb-4 line-clamp-2">
                      {user.bio}
                    </p>
                  )}

                  {/* Compatibility & Suggestion Reason */}
                  <div className="flex justify-between items-center mb-4">
                    <Badge;
                      variant="outline"
                      className={`text-xs ${getCompatibilityColor(user.compatibility_score)}`}
                    >
                      {user.compatibility_score}% {getCompatibilityText(user.compatibility_score)}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {getSuggestionReasonIcon(user.suggestion_reason)}
                      <span className="ml-1">{getSuggestionReasonText(user.suggestion_reason)}</span>
                    </Badge>
                  </div>

                  {/* Mutual Friends */}
                  {user.mutual_friends_count > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-medium text-gray-700 mb-2">
                        {user.mutual_friends_count} mutual friend{user.mutual_friends_count !== 1 ? 's' : ''}
                      </p>
                      <div className="flex -space-x-1">
                        {user.mutual_friends.slice(0, 3).map((friend) => (
                          <Avatar key={friend.id} className="w-6 h-6 border-2 border-white">
                            <AvatarImage src={friend.avatar} />
                            <AvatarFallback className="text-xs">
                              {friend.first_name?.[0] || friend.username?.[0]}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {user.mutual_friends_count > 3 && (
                          <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                            <span className="text-xs text-gray-600">+{user.mutual_friends_count - 3}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Shared Interests */}
                  {user.shared_interests.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-medium text-gray-700 mb-2">Shared interests</p>
                      <div className="flex flex-wrap gap-1">
                        {user.shared_interests.slice(0, 4).map((interest) => (
                          <Badge key={interest} variant="secondary" className="text-xs">
                            {renderInterestIcon(interest)}
                            <span className="ml-1">{interest}</span>
                          </Badge>
                        ))}
                        {user.shared_interests.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{user.shared_interests.length - 4}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Recent Activity */}
                  {user.recent_activity && (
                    <div className="mb-4 text-xs text-gray-500">
                      <div className="flex justify-between">
                        <span>Parties hosted:</span>
                        <span>{user.recent_activity.parties_hosted}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Parties joined:</span>
                        <span>{user.recent_activity.parties_joined}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last active:</span>
                        <span>{formatDistanceToNow(new Date(user.recent_activity.last_active), { addSuffix: true })}</span>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {user.friend_request_sent ? (
                      <Button variant="outline" className="flex-1" disabled>
                        <UserCheck className="h-4 w-4 mr-2" />
                        Request Sent;
                      </Button>
                    ) : user.friend_request_received ? (
                      <Button variant="outline" className="flex-1" disabled>
                        <Clock className="h-4 w-4 mr-2" />
                        Pending Response;
                      </Button>
                    ) : (
                      <Button;
                        onClick={() => sendFriendRequest(user.id)}
                        disabled={sendingRequests.has(user.id)}
                        className="flex-1"
                      >
                        {sendingRequests.has(user.id) ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <UserPlus className="h-4 w-4 mr-2" />
                        )}
                        Add Friend;
                      </Button>
                    )}
                    <Button;
                      variant="outline"
                      size="sm"
                      onClick={() => dismissSuggestion(user.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Load More */}
        {filteredSuggestions.length >= 12 && (
          <div className="text-center mt-8">
            <Button variant="outline" onClick={() => loadSuggestions()}>
              Load More Suggestions;
            </Button>
          </div>
        )}

        {/* Tips */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Tips for Making Friends;
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Complete your profile</h4>
                <p className="text-gray-600">
                  Add a bio, avatar, and interests to help others discover you and improve your suggestions.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Join public parties</h4>
                <p className="text-gray-600">
                  Participate in public watch parties to meet people with similar viewing preferences.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Be active</h4>
                <p className="text-gray-600">
                  Regular activity helps our algorithm find better matches and shows you're an engaged user.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Connect through friends</h4>
                <p className="text-gray-600">
                  Friends of friends often make great connections since you likely have shared interests.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
