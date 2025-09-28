"use client"

import { Calendar, Clock, Eye, Filter, Heart, MapPin, Play, Search, Star, TrendingUp, User, Users, X } from "lucide-react"
import { useState, useEffect, useCallback, Suspense } from "react"
import Image from "next/image"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { useDebounce } from "@/hooks/use-debounce"
import { formatDistanceToNow } from "date-fns"

interface SearchUser {}
  id: string
  username: string
  firstName: string
  lastName: string
  avatar?: string
  bio?: string
  location?: string
  isOnline: boolean
  friendshipStatus: "none" | "pending_sent" | "pending_received" | "friends" | "blocked"
  mutualFriends: number
  isVerified: boolean
}

interface SearchVideo {}
  id: string
  title: string
  description: string
  thumbnail: string
  duration: number
  views: number
  likes: number
  createdAt: string
  author: {}
    id: string
    username: string
    avatar?: string
  }
  privacy: "public" | "friends" | "private"
  tags: string[]
}

interface SearchParty {}
  id: string
  name: string
  description: string
  host: {}
    id: string
    username: string
    avatar?: string
  }
  scheduledFor?: string
  isActive: boolean
  participantCount: number
  maxParticipants?: number
  isPrivate: boolean
  tags: string[]
}

interface SearchFilters {}
  type: "all" | "users" | "videos" | "parties"
  sortBy: "relevance" | "date" | "popularity"
  dateRange: "all" | "today" | "week" | "month" | "year"
  userFilters: {}
    location?: string
    isOnline?: boolean
    isVerified?: boolean
  }
  videoFilters: {}
    duration?: "short" | "medium" | "long"
    minViews?: number
  }
  partyFilters: {}
    status: "all" | "active" | "scheduled"
    availability: "all" | "open" | "full"
  }
}

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()

  const initialQuery = searchParams.get("q") || ""
  const initialType = (searchParams.get("type") as SearchFilters["type"]) || "all"

  const [query, setQuery] = useState(initialQuery)
  const [activeTab, setActiveTab] = useState(initialType)
  const [isLoading, setIsLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const [users, setUsers] = useState<SearchUser[]>([])
  const [videos, setVideos] = useState<SearchVideo[]>([])
  const [parties, setParties] = useState<SearchParty[]>([])
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [popularSearches] = useState([]
    "gaming videos", "movie night", "anime party", "study group", "music videos", "comedy shows"
  ])

  const [filters, setFilters] = useState<SearchFilters>({}
    type: "all",
    sortBy: "relevance",
    dateRange: "all",
    userFilters: {},
    videoFilters: {},
    partyFilters: {}
      status: "all",
      availability: "all",
    },
  })

  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    const savedHistory = localStorage.getItem("searchHistory")
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory))
    }
  }, [])

  useEffect(() => {
    if (debouncedQuery.trim()) {}
      performSearch(debouncedQuery)
      updateURL()
    } else {}
      clearResults()
    }
  }, [debouncedQuery, filters, activeTab])

  const updateURL = useCallback(() => {}
    const params = new URLSearchParams()
    if (query.trim()) params.set("q", query.trim())
    if (activeTab !== "all") params.set("type", activeTab)
    const newURL = `/search${params.toString() ? `?${params.toString()}` : ""}`
    router.replace(newURL, { scroll: false })
  }, [query, activeTab, router])

  const performSearch = async (searchQuery: string) => {}
    if (!searchQuery.trim()) return
    setIsLoading(true)
    try {
      const token = localStorage.getItem("accessToken")
      const params = new URLSearchParams({q: searchQuery,
        type: activeTab,
        sort: filters.sortBy,
        date_range: filters.dateRange,
        ...Object.fromEntries(
          Object.entries(filters.userFilters).filter(([_, v]) => v !== undefined)
        ),
        ...Object.fromEntries(
          Object.entries(filters.videoFilters).filter(([_, v]) => v !== undefined)
        ),
        ...Object.fromEntries(
          Object.entries(filters.partyFilters).filter(([_, v]) => v !== undefined && v !== "all")
        ),
      })

      const response = await fetch(`/api/search/?${params}`, {}
        headers: {}
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (activeTab === "all" || activeTab === "users") {
          setUsers(data.users || [])
        }
        if (activeTab === "all" || activeTab === "videos") {
          setVideos(data.videos || [])
        }
        if (activeTab === "all" || activeTab === "parties") {
          setParties(data.parties || [])
        }

        // Add to search history
        addToSearchHistory(searchQuery)
      }
    } catch (err) {
      console.error("Search failed:", error)
      toast({title: "Search Error",
        description: "Failed to perform search. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addToSearchHistory = (searchQuery: string) => {}
    const newHistory = [searchQuery, ...searchHistory.filter(q => q !== searchQuery)].slice(0, 10)
    setSearchHistory(newHistory)
    localStorage.setItem("searchHistory", JSON.stringify(newHistory))
  }

  const clearResults = () => {}
    setUsers([])
    setVideos([])
    setParties([])
  }

  const handleSearchSubmit = (e: React.FormEvent) => {}
    e.preventDefault()
    if (query.trim()) {}
      performSearch(query.trim())
    }
  }

  const handleSendFriendRequest = async (userId: string) => {}
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch("/api/users/friends/request/", {}
        method: "POST",
        headers: {}
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ user_id: userId }),
      })

      if (response.ok) {
        setUsers(prev => prev.map(u => 
          u.id === userId ? { ...u, friendshipStatus: "pending_sent" } : u
        ))
        toast({title: "Friend Request Sent",
          description: "Your friend request has been sent.",
        })
      }
    } catch (err) {
      console.error("Failed to send friend request:", error)
      toast({title: "Error",
        description: "Failed to send friend request.",
        variant: "destructive",
      })
    }
  }

  const getFriendshipStatusBadge = (status: SearchUser["friendshipStatus"]) => {}
    switch (status) {
      case "friends":
        return <Badge variant="default">Friends</Badge>
      case "pending_sent":
        return <Badge variant="outline">Request Sent</Badge>
      case "pending_received":
        return <Badge variant="secondary">Request Received</Badge>
      case "blocked":
        return <Badge variant="destructive">Blocked</Badge>
      default:
        return null
    }
  }

  const hasResults = users.length > 0 || videos.length > 0 || parties.length > 0
  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2 mb-4">
          <Search className="h-8 w-8" />
          Search
        </h1>
        {/* Search Form */}
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search for users, videos, or parties..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 text-lg h-12"
              />
              {query && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuery("")}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Button type="submit" size="lg" disabled={!query.trim() || isLoading}>
              {isLoading ? "Searching..." : "Search"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>

          {/* Search Suggestions */}
          {!query && (
            <div className="space-y-4">
              {searchHistory.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Recent Searches</h3>
                  <div className="flex flex-wrap gap-2">
                    {searchHistory.map((term, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => setQuery(term)}
                        className="text-xs"
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        {term}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Popular Searches</h3>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((term, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => setQuery(term)}
                      className="text-xs"
                    >
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {term}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Filters Panel */}
        {showFilters && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">Search Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Sort By</label>
                  <Select value={filters.sortBy} onValueChange={(value) => 
                    setFilters(prev => ({ ...prev, sortBy: value as Record<string, unknown> }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Relevance</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="popularity">Popularity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Date Range</label>
                  <Select value={filters.dateRange} onValueChange={(value) => 
                    setFilters(prev => ({ ...prev, dateRange: value as Record<string, unknown> }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="year">This Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {activeTab === "parties" && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Party Status</label>
                    <Select value={filters.partyFilters.status} onValueChange={(value) => 
                      setFilters(prev => ({}
                        ...prev, 
                        partyFilters: { ...prev.partyFilters, status: value as Record<string, unknown> }
                      }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Parties</SelectItem>
                        <SelectItem value="active">Active Now</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Results */}
      {query && (
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as SearchFilters["type"])}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="all">All Results</TabsTrigger>
            <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
            <TabsTrigger value="videos">Videos ({videos.length})</TabsTrigger>
            <TabsTrigger value="parties">Parties ({parties.length})</TabsTrigger>
          </TabsList>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Searching...</p>
            </div>
          ) : !hasResults && query ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Search className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
                <p className="text-gray-600 mb-4">
                  No results found for "{query}". Try adjusting your search terms or filters.
                </p>
                <Button variant="outline" onClick={() => setQuery("")}>
                  Clear Search
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <TabsContent value="all" className="space-y-6">
                {users.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Users</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {users.slice(0, 6).map((user) => (
                        <Card key={user.id} className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={user.avatar || "/placeholder-user.jpg"} />
                              <AvatarFallback>{user.firstName[0]}{user.lastName[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold truncate">
                                  {user.firstName} {user.lastName}
                                </h3>
                                {user.isVerified && <Star className="w-4 h-4 text-yellow-500" />}
                              </div>
                              <p className="text-sm text-gray-600">@{user.username}</p>
                              {user.mutualFriends > 0 && (
                                <p className="text-xs text-gray-500">{user.mutualFriends} mutual friends</p>
                              )}
                            </div>
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            {getFriendshipStatusBadge(user.friendshipStatus)}
                            {user.friendshipStatus === "none" && (
                              <Button size="sm" onClick={() => handleSendFriendRequest(user.id)}>
                                <UserPlus className="w-3 h-3 mr-1" />
                                Add
                              </Button>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {videos.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Videos</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {videos.slice(0, 6).map((video) => (
                        <Card key={video.id} className="overflow-hidden">
                          <div className="aspect-video bg-gray-200 relative group cursor-pointer">
                            <img
                              src={video.thumbnail || "/placeholder.jpg"}
                              alt={video.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                              <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                              {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, "0")}
                            </div>
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-semibold mb-2 line-clamp-2">{video.title}</h3>
                            <div className="flex items-center gap-2 mb-2">
                              <Avatar className="w-6 h-6">
                                <AvatarImage src={video.author.avatar || "/placeholder-user.jpg"} />
                                <AvatarFallback className="text-xs">{video.author.username[0]}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm text-gray-600">{video.author.username}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {video.views.toLocaleString()}
                              </div>
                              <span>{formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {parties.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Parties</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {parties.slice(0, 4).map((party) => (
                        <Card key={party.id} className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-semibold mb-1">{party.name}</h3>
                              <p className="text-sm text-gray-600 mb-2">{party.description}</p>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Avatar className="w-5 h-5">
                                  <AvatarImage src={party.host.avatar || "/placeholder-user.jpg"} />
                                  <AvatarFallback className="text-xs">{party.host.username[0]}</AvatarFallback>
                                </Avatar>
                                <span>Hosted by {party.host.username}</span>
                              </div>
                            </div>
                            <Badge variant={party.isActive ? "default" : "outline"}>
                              {party.isActive ? "Live" : "Scheduled"}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {party.participantCount}{party.maxParticipants && `/${party.maxParticipants}`}
                              </div>
                              {party.scheduledFor && !party.isActive && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {formatDistanceToNow(new Date(party.scheduledFor), { addSuffix: true })}
                                </div>
                              )}
                            </div>
                            <Button size="sm">
                              {party.isActive ? "Join" : "RSVP"}
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="users" className="space-y-4">
                {users.map((user) => (
                  <Card key={user.id} className="p-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={user.avatar || "/placeholder-user.jpg"} />
                        <AvatarFallback className="text-lg">{user.firstName[0]}{user.lastName[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold">
                            {user.firstName} {user.lastName}
                          </h3>
                          {user.isVerified && <Star className="w-5 h-5 text-yellow-500" />}
                          <div className={`w-3 h-3 rounded-full ${user.isOnline ? "bg-green-500" : "bg-gray-400"}`} />
                        </div>
                        <p className="text-gray-600 mb-1">@{user.username}</p>
                        {user.bio && <p className="text-sm text-gray-700 mb-2">{user.bio}</p>}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          {user.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {user.location}
                            </div>
                          )}
                          {user.mutualFriends > 0 && (
                            <span>{user.mutualFriends} mutual friends</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getFriendshipStatusBadge(user.friendshipStatus)}
                        {user.friendshipStatus === "none" && (
                          <Button onClick={() => handleSendFriendRequest(user.id)}>
                            <UserPlus className="w-4 h-4 mr-2" />
                            Add Friend
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          onClick={() => router.push(`/profile/${user.id}`)}
                        >
                          View Profile
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="videos" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {videos.map((video) => (
                    <Card key={video.id} className="overflow-hidden">
                      <div className="aspect-video bg-gray-200 relative group cursor-pointer">
                        <img
                          src={video.thumbnail || "/placeholder.jpg"}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                          <Play className="w-16 h-16 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                          {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, "0")}
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2 line-clamp-2">{video.title}</h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{video.description}</p>
                        <div className="flex items-center gap-2 mb-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={video.author.avatar || "/placeholder-user.jpg"} />
                            <AvatarFallback className="text-xs">{video.author.username[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{video.author.username}</p>
                            <p className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {video.views.toLocaleString()} views
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            {video.likes}
                          </div>
                        </div>
                        {video.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {video.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="parties" className="space-y-4">
                {parties.map((party) => (
                  <Card key={party.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-semibold">{party.name}</h3>
                          <Badge variant={party.isActive ? "default" : "outline"}>
                            {party.isActive ? "Live Now" : "Scheduled"}
                          </Badge>
                          {party.isPrivate && (
                            <Badge variant="secondary">Private</Badge>
                          )}
                        </div>
                        <p className="text-gray-600 mb-3">{party.description}</p>
                        <div className="flex items-center gap-2 mb-3">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={party.host.avatar || "/placeholder-user.jpg"} />
                            <AvatarFallback className="text-xs">{party.host.username[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-gray-600">Hosted by {party.host.username}</span>
                        </div>
                        {party.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {party.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-6 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {party.participantCount} participants
                            {party.maxParticipants && ` (max ${party.maxParticipants})`}
                          </div>
                          {party.scheduledFor && !party.isActive && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDistanceToNow(new Date(party.scheduledFor), { addSuffix: true })}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline">
                          View Details
                        </Button>
                        <Button>
                          {party.isActive ? "Join Party" : "RSVP"}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </TabsContent>
            </>
          )}
        </Tabs>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={} />
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading search...</p>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}
