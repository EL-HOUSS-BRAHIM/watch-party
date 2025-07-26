"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import {
  Compass,
  TrendingUp,
  Star,
  Users,
  Video,
  Calendar,
  Eye,
  Heart,
  Play,
  Clock,
  MapPin,
  UserPlus,
  Sparkles,
  Crown,
  Fire,
  Zap,
  Globe,
  Filter,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface TrendingVideo {
  id: string
  title: string
  description: string
  thumbnail: string
  duration: number
  views: number
  likes: number
  createdAt: string
  author: {
    id: string
    username: string
    avatar?: string
    isVerified: boolean
  }
  tags: string[]
  trendingScore: number
}

interface FeaturedParty {
  id: string
  name: string
  description: string
  thumbnail?: string
  host: {
    id: string
    username: string
    avatar?: string
    isVerified: boolean
  }
  scheduledFor?: string
  isActive: boolean
  participantCount: number
  maxParticipants?: number
  tags: string[]
  category: string
  isFeatured: boolean
}

interface SuggestedUser {
  id: string
  username: string
  firstName: string
  lastName: string
  avatar?: string
  bio?: string
  location?: string
  isOnline: boolean
  isVerified: boolean
  mutualFriends: number
  commonInterests: string[]
  stats: {
    videosUploaded: number
    partiesHosted: number
    friendsCount: number
  }
  reasonForSuggestion: "mutual_friends" | "common_interests" | "popular" | "new_user"
}

interface TrendingCategory {
  id: string
  name: string
  description: string
  icon: string
  videoCount: number
  isGrowing: boolean
}

export default function DiscoverPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState("trending")
  const [timeFilter, setTimeFilter] = useState("week")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)

  const [trendingVideos, setTrendingVideos] = useState<TrendingVideo[]>([])
  const [featuredParties, setFeaturedParties] = useState<FeaturedParty[]>([])
  const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([])
  const [trendingCategories, setTrendingCategories] = useState<TrendingCategory[]>([])

  const [stats, setStats] = useState({
    totalUsers: 0,
    activeParties: 0,
    videosWatched: 0,
    newUsersToday: 0,
  })

  useEffect(() => {
    loadDiscoverData()
  }, [timeFilter, categoryFilter])

  const loadDiscoverData = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("accessToken")
      const params = new URLSearchParams({
        time_filter: timeFilter,
        category: categoryFilter,
      })

      const response = await fetch(`/api/discover/?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setTrendingVideos(data.trending_videos || [])
        setFeaturedParties(data.featured_parties || [])
        setSuggestedUsers(data.suggested_users || [])
        setTrendingCategories(data.trending_categories || [])
        setStats(data.stats || stats)
      }
    } catch (error) {
      console.error("Failed to load discover data:", error)
      toast({
        title: "Error",
        description: "Failed to load discover content. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendFriendRequest = async (userId: string) => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch("/api/users/friends/request/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ user_id: userId }),
      })

      if (response.ok) {
        setSuggestedUsers(prev => prev.filter(u => u.id !== userId))
        toast({
          title: "Friend Request Sent",
          description: "Your friend request has been sent.",
        })
      }
    } catch (error) {
      console.error("Failed to send friend request:", error)
      toast({
        title: "Error",
        description: "Failed to send friend request.",
        variant: "destructive",
      })
    }
  }

  const getSuggestionReasonText = (reason: SuggestedUser["reasonForSuggestion"]) => {
    switch (reason) {
      case "mutual_friends":
        return "Mutual friends"
      case "common_interests":
        return "Common interests"
      case "popular":
        return "Popular user"
      case "new_user":
        return "New to platform"
      default:
        return "Suggested for you"
    }
  }

  const getSuggestionIcon = (reason: SuggestedUser["reasonForSuggestion"]) => {
    switch (reason) {
      case "mutual_friends":
        return <Users className="w-3 h-3" />
      case "common_interests":
        return <Heart className="w-3 h-3" />
      case "popular":
        return <Crown className="w-3 h-3" />
      case "new_user":
        return <Sparkles className="w-3 h-3" />
      default:
        return <Star className="w-3 h-3" />
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Compass className="h-8 w-8" />
              Discover
            </h1>
            <p className="text-gray-600 mt-2">Explore trending content, featured parties, and connect with new people</p>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="gaming">Gaming</SelectItem>
                <SelectItem value="movies">Movies</SelectItem>
                <SelectItem value="music">Music</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="sports">Sports</SelectItem>
                <SelectItem value="comedy">Comedy</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Platform Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
              <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Users</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Video className="w-6 h-6 text-green-500" />
              </div>
              <div className="text-2xl font-bold">{stats.activeParties}</div>
              <div className="text-sm text-gray-600">Active Parties</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Eye className="w-6 h-6 text-purple-500" />
              </div>
              <div className="text-2xl font-bold">{stats.videosWatched.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Videos Watched</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Sparkles className="w-6 h-6 text-orange-500" />
              </div>
              <div className="text-2xl font-bold">{stats.newUsersToday}</div>
              <div className="text-sm text-gray-600">New Today</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="parties">Featured Parties</TabsTrigger>
          <TabsTrigger value="people">People</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading discover content...</p>
          </div>
        ) : (
          <>
            <TabsContent value="trending" className="space-y-8">
              {/* Trending Videos */}
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <Fire className="w-6 h-6 text-red-500" />
                  <h2 className="text-2xl font-bold">Trending Videos</h2>
                  <Badge variant="destructive" className="ml-2">Hot</Badge>
                </div>

                {trendingVideos.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {trendingVideos.map((video, index) => (
                      <Card key={video.id} className="overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow">
                        <div className="aspect-video bg-gray-200 relative">
                          <img
                            src={video.thumbnail || "/placeholder.jpg"}
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                            <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          
                          {/* Trending Badge */}
                          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            #{index + 1}
                          </div>

                          {/* Duration */}
                          <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                            {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, "0")}
                          </div>
                        </div>

                        <CardContent className="p-4">
                          <h3 className="font-semibold mb-2 line-clamp-2">{video.title}</h3>
                          <div className="flex items-center gap-2 mb-3">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={video.author.avatar || "/placeholder-user.jpg"} />
                              <AvatarFallback className="text-xs">{video.author.username[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-gray-600">{video.author.username}</span>
                            {video.author.isVerified && <Star className="w-3 h-3 text-yellow-500" />}
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                            <div className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {video.views.toLocaleString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              {video.likes.toLocaleString()}
                            </div>
                            <span>{formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}</span>
                          </div>

                          {video.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {video.tags.slice(0, 2).map((tag) => (
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
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-semibold mb-2">No Trending Videos</h3>
                      <p className="text-gray-600">Check back later for trending content.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="parties" className="space-y-8">
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <Zap className="w-6 h-6 text-yellow-500" />
                  <h2 className="text-2xl font-bold">Featured Parties</h2>
                  <Badge variant="secondary" className="ml-2">Editor's Choice</Badge>
                </div>

                {featuredParties.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featuredParties.map((party) => (
                      <Card key={party.id} className="overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow">
                        {party.thumbnail && (
                          <div className="aspect-video bg-gray-200 relative">
                            <img
                              src={party.thumbnail || "/placeholder.jpg"}
                              alt={party.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200" />
                            
                            {party.isFeatured && (
                              <div className="absolute top-2 left-2 bg-yellow-500 text-black text-xs px-2 py-1 rounded-full flex items-center gap-1 font-medium">
                                <Crown className="w-3 h-3" />
                                Featured
                              </div>
                            )}

                            <div className="absolute top-2 right-2">
                              <Badge variant={party.isActive ? "default" : "outline"}>
                                {party.isActive ? "Live" : "Scheduled"}
                              </Badge>
                            </div>
                          </div>
                        )}

                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-2">{party.name}</h3>
                              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{party.description}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mb-4">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={party.host.avatar || "/placeholder-user.jpg"} />
                              <AvatarFallback className="text-xs">{party.host.username[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-gray-600">Hosted by {party.host.username}</span>
                            {party.host.isVerified && <Star className="w-3 h-3 text-yellow-500" />}
                          </div>

                          <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {party.participantCount} joined
                              {party.maxParticipants && ` / ${party.maxParticipants}`}
                            </div>
                            {party.scheduledFor && !party.isActive && (
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {formatDistanceToNow(new Date(party.scheduledFor), { addSuffix: true })}
                              </div>
                            )}
                          </div>

                          {party.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-4">
                              {party.tags.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}

                          <Button className="w-full" onClick={() => router.push(`/watch/${party.id}`)}>
                            {party.isActive ? "Join Party" : "RSVP"}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-semibold mb-2">No Featured Parties</h3>
                      <p className="text-gray-600">Check back later for featured parties.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="people" className="space-y-8">
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <UserPlus className="w-6 h-6 text-blue-500" />
                  <h2 className="text-2xl font-bold">People You Might Know</h2>
                </div>

                {suggestedUsers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {suggestedUsers.map((suggestedUser) => (
                      <Card key={suggestedUser.id} className="p-6 hover:shadow-lg transition-shadow">
                        <div className="text-center mb-4">
                          <Avatar className="w-20 h-20 mx-auto mb-4">
                            <AvatarImage src={suggestedUser.avatar || "/placeholder-user.jpg"} />
                            <AvatarFallback className="text-lg">
                              {suggestedUser.firstName[0]}{suggestedUser.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <h3 className="font-semibold">
                              {suggestedUser.firstName} {suggestedUser.lastName}
                            </h3>
                            {suggestedUser.isVerified && <Star className="w-4 h-4 text-yellow-500" />}
                            <div className={`w-3 h-3 rounded-full ${suggestedUser.isOnline ? "bg-green-500" : "bg-gray-400"}`} />
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-2">@{suggestedUser.username}</p>
                          
                          {suggestedUser.bio && (
                            <p className="text-sm text-gray-700 mb-3 line-clamp-2">{suggestedUser.bio}</p>
                          )}

                          <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mb-3">
                            {getSuggestionIcon(suggestedUser.reasonForSuggestion)}
                            <span>{getSuggestionReasonText(suggestedUser.reasonForSuggestion)}</span>
                          </div>
                        </div>

                        <div className="space-y-3 mb-4">
                          {suggestedUser.mutualFriends > 0 && (
                            <div className="text-center text-sm text-gray-600">
                              {suggestedUser.mutualFriends} mutual friends
                            </div>
                          )}

                          {suggestedUser.location && (
                            <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
                              <MapPin className="w-3 h-3" />
                              {suggestedUser.location}
                            </div>
                          )}

                          {suggestedUser.commonInterests.length > 0 && (
                            <div className="text-center">
                              <div className="text-xs text-gray-500 mb-1">Common Interests</div>
                              <div className="flex flex-wrap justify-center gap-1">
                                {suggestedUser.commonInterests.slice(0, 3).map((interest) => (
                                  <Badge key={interest} variant="outline" className="text-xs">
                                    {interest}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-3 gap-2 text-center text-xs">
                            <div>
                              <div className="font-semibold">{suggestedUser.stats.videosUploaded}</div>
                              <div className="text-gray-500">Videos</div>
                            </div>
                            <div>
                              <div className="font-semibold">{suggestedUser.stats.partiesHosted}</div>
                              <div className="text-gray-500">Parties</div>
                            </div>
                            <div>
                              <div className="font-semibold">{suggestedUser.stats.friendsCount}</div>
                              <div className="text-gray-500">Friends</div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Button 
                            className="w-full" 
                            onClick={() => handleSendFriendRequest(suggestedUser.id)}
                          >
                            <UserPlus className="w-4 h-4 mr-2" />
                            Add Friend
                          </Button>
                          <Button 
                            variant="outline" 
                            className="w-full" 
                            onClick={() => router.push(`/profile/${suggestedUser.id}`)}
                          >
                            View Profile
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-semibold mb-2">No Suggestions Available</h3>
                      <p className="text-gray-600">Check back later for people you might know.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="categories" className="space-y-8">
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <Globe className="w-6 h-6 text-green-500" />
                  <h2 className="text-2xl font-bold">Trending Categories</h2>
                </div>

                {trendingCategories.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {trendingCategories.map((category) => (
                      <Card key={category.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer group">
                        <div className="text-center">
                          <div className="text-4xl mb-4">{category.icon}</div>
                          <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                            {category.name}
                          </h3>
                          <p className="text-gray-600 mb-4">{category.description}</p>
                          
                          <div className="flex items-center justify-center gap-4 text-sm text-gray-500 mb-4">
                            <div className="flex items-center gap-1">
                              <Video className="w-4 h-4" />
                              {category.videoCount.toLocaleString()} videos
                            </div>
                            {category.isGrowing && (
                              <div className="flex items-center gap-1 text-green-600">
                                <TrendingUp className="w-4 h-4" />
                                Growing
                              </div>
                            )}
                          </div>

                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => router.push(`/search?q=&type=videos&category=${category.id}`)}
                          >
                            Explore {category.name}
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Globe className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-semibold mb-2">No Categories Available</h3>
                      <p className="text-gray-600">Check back later for trending categories.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  )
}
