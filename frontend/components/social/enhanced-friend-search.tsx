"use client"

import { useState, useEffect, useCallback } from "react"
import { Activity, Clock, Loader2, MapPin, Search, Star, User, UserCheck, UserPlus, Users, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"


interface User {}
  id: string
  username: string
  firstName: string
  lastName: string
  email: string
  avatar?: string
  bio?: string
  location?: string
  isOnline: boolean
  friendshipStatus: "none" | "friends" | "pending_sent" | "pending_received" | "blocked"
  mutualFriends: number
  compatibilityScore: number
  lastActive: string
  joinedDate: string
  stats: {}
    partiesHosted: number
    partiesJoined: number
    friendsCount: number
  }
}

interface Suggestion {}
  id: string
  user: User
  reason: "mutual_friends" | "location" | "interests" | "activity" | "new_user"
  strength: number
  details: string
}

interface EnhancedFriendSearchProps {}
  className?: string
}

export default function EnhancedFriendSearch({ className }: EnhancedFriendSearchProps) {}
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(true)
  const [sendingRequests, setSendingRequests] = useState<Set<string>>(new Set())

  const { toast } = useToast()

  // Perform search function
  const performSearch = useCallback(async (query: string) => {}
    if (!query.trim()) {}
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`/api/users/search/?q=${encodeURIComponent(query)}&limit=20`, {}
        headers: {}
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.users || [])
      }
    } catch (err) {
      console.error("Search failed:", error)
      toast({title: "Search failed",
        description: "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }, [toast])

  const debouncedSearch = useCallback((query: string) => {}
    performSearch(query)
  }, [performSearch])

  useEffect(() => {
    debouncedSearch(searchQuery)
  }, [searchQuery, debouncedSearch])

  useEffect(() => {
    loadSuggestions()
  }, [])

  const loadSuggestions = async () => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch("/api/users/friends/suggestions/", {}
        headers: {}
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setSuggestions(data.suggestions || [])
      }
    } catch (err) {
      console.error("Failed to load suggestions:", error)
    } finally {
      setIsLoadingSuggestions(false)
    }
  }

  const sendFriendRequest = async (userId: string) => {}
    setSendingRequests(prev => new Set(prev).add(userId))

    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`/api/users/${userId}/friend-request/`, {}
        method: "POST",
        headers: {}
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        // Update both search results and suggestions
        setSearchResults(prev => 
          prev.map(user => 
            user.id === userId
              ? { ...user, friendshipStatus: "pending_sent" } 
              : user
          )
        )
        setSuggestions(prev => 
          prev.map(suggestion => 
            suggestion.user.id === userId
              ? { ...suggestion, user: { ...suggestion.user, friendshipStatus: "pending_sent" } }
              : suggestion
          )
        )

        toast({title: "Friend request sent",
          description: "Your friend request has been sent successfully.",
        })
      } else {}
        throw new Error("Failed to send friend request")
      }
    } catch (err) {
      console.error("Failed to send friend request:", error)
      toast({title: "Failed to send request",
        description: "Please try again",
        variant: "destructive",
      })
    } finally {
      setSendingRequests(prev => {}
        const newSet = new Set(prev)
        newSet.delete(userId)
        return newSet
      })
    }
  }

  const getUserInitials = (firstName: string, lastName: string) => {}
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase()
  }

  const getReasonIcon = (reason: string) => {}
    switch (reason) {
      case "mutual_friends":
        return <Users className="h-4 w-4 text-blue-500" />
      case "location":
        return <MapPin className="h-4 w-4 text-green-500" />
      case "interests":
        return <Star className="h-4 w-4 text-yellow-500" />
      case "activity":
        return <Activity className="h-4 w-4 text-purple-500" />
      default:
        return <UserPlus className="h-4 w-4 text-gray-500" />
    }
  }

  const getReasonText = (reason: string, details: string) => {}
    switch (reason) {
      case "mutual_friends":
        return `${details} mutual friends`
      case "location":
        return `Same location: ${details}`
      case "interests":
        return `Similar interests in ${details}`
      case "activity":
        return `Recently active in ${details}`
      default:
        return details
    }
  }

  const getFriendshipStatusButton = (user: User) => {}
    const isRequesting = sendingRequests.has(user.id)

    switch (user.friendshipStatus) {
      case "friends":
        return (
          <Badge variant="secondary" className="text-sm">
            <UserCheck className="h-3 w-3 mr-1" />
            Friends
          </Badge>
        )
      case "pending_sent":
        return (
          <Badge variant="outline" className="text-sm">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case "pending_received":
        return (
          <Button size="sm" variant="default">
            Accept Request
          </Button>
        )
      case "blocked":
        return (
          <Badge variant="destructive" className="text-sm">
            <X className="h-3 w-3 mr-1" />
            Blocked
          </Badge>
        )
      default:
        return (
          <Button
            size="sm" 
            onClick={() => sendFriendRequest(user.id)}
            disabled={isRequesting}
          >
            {isRequesting ? (
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            ) : (
              <UserPlus className="h-3 w-3 mr-1" />
            )}
            Add Friend
          </Button>
        )
    }
  }

  const UserCard = ({ user, reason, details }: { user: User; reason?: string; details?: string }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="relative">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{getUserInitials(user.firstName, user.lastName)}</AvatarFallback>
            </Avatar>
            {user.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-lg">
                  {user.firstName} {user.lastName}
                </h3>
                <p className="text-sm text-muted-foreground">@{user.username}</p>
              </div>
              {getFriendshipStatusButton(user)}
            </div>

            {user.bio && (
              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{user.bio}</p>
            )}

            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
              {user.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {user.location}
                </div>
              )}
              {user.mutualFriends > 0 && (
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {user.mutualFriends} mutual
                </div>
              )}
              <div className="flex items-center gap-1">
                <Activity className="h-3 w-3" />
                {user.stats.partiesJoined} parties
              </div>
            </div>

            {reason && details && (
              <div className="flex items-center gap-2 mt-2">
                {getReasonIcon(reason)}
                <span className="text-xs text-muted-foreground">
                  {getReasonText(reason, details)}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Find Friends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="search" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="search">Search Users</TabsTrigger>
              <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
            </TabsList>

            <TabsContent value="search" className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, username, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Search Results */}
              {isSearching && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Searching...</span>
                </div>
              )}

              {!isSearching && searchQuery && searchResults.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No users found matching "{searchQuery}&quot
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="space-y-4">
                  {searchResults.map((user) => (
                    <UserCard key={user.id} user={user} />
                  ))}
                </div>
              )}

              {!searchQuery && (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Start typing to search for users</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="suggestions" className="space-y-4">
              {isLoadingSuggestions ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading suggestions...</span>
                </div>
              ) : suggestions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No friend suggestions available</p>
                  <p className="text-sm">Connect with more friends to get better suggestions!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {suggestions.map((suggestion) => (
                    <UserCard
                      key={suggestion.id} 
                      user={suggestion.user}
                      reason={suggestion.reason}
                      details={suggestion.details}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
