"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
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
  UserPlus,
  Globe,
  Search,
  ChevronRight,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Flame,
  Zap,
  Crown,
  MapPin,
  ArrowRight,
  Sparkles,
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
  color: string
}

export default function DiscoverPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState("trending")
  const [timeFilter, setTimeFilter] = useState("week")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  const [trendingVideos, setTrendingVideos] = useState<TrendingVideo[]>([])
  const [featuredParties, setFeaturedParties] = useState<FeaturedParty[]>([])
  const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([])
  const [trendingCategories, setTrendingCategories] = useState<TrendingCategory[]>([])

  const [stats, setStats] = useState({
    totalUsers: 125847,
    activeParties: 342,
    videosWatched: 2847291,
    newUsersToday: 1247,
  })

  useEffect(() => {
    loadDiscoverData()
  }, [timeFilter, categoryFilter])

  const loadDiscoverData = async () => {
    setIsLoading(true)
    try {
      // Simulate API call with mock data
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setTrendingVideos([
        {
          id: "1",
          title: "Epic Movie Night: The Matrix Trilogy Marathon",
          description: "Join us for an incredible journey through the Matrix universe",
          thumbnail: "/placeholder.svg?height=200&width=350&text=Matrix+Marathon",
          duration: 8640,
          views: 45231,
          likes: 3421,
          createdAt: "2024-01-15T10:00:00Z",
          author: {
            id: "user1",
            username: "CinemaKing",
            avatar: "/placeholder-user.jpg",
            isVerified: true,
          },
          tags: ["Action", "Sci-Fi", "Marathon"],
          trendingScore: 95,
        },
        {
          id: "2",
          title: "Horror Movie Collection: Best Scares of 2024",
          description: "Spine-chilling collection of the year's best horror films",
          thumbnail: "/placeholder.svg?height=200&width=350&text=Horror+Collection",
          duration: 5400,
          views: 32156,
          likes: 2847,
          createdAt: "2024-01-14T15:30:00Z",
          author: {
            id: "user2",
            username: "ScreamQueen",
            avatar: "/placeholder-user.jpg",
            isVerified: false,
          },
          tags: ["Horror", "Thriller", "2024"],
          trendingScore: 88,
        },
      ])

      setFeaturedParties([
        {
          id: "party1",
          name: "Friday Night Movie Club",
          description: "Weekly gathering for movie enthusiasts. Tonight: Classic 80s films!",
          thumbnail: "/placeholder.svg?height=200&width=350&text=Movie+Club",
          host: {
            id: "host1",
            username: "MovieMaster",
            avatar: "/placeholder-user.jpg",
            isVerified: true,
          },
          scheduledFor: "2024-01-19T20:00:00Z",
          isActive: true,
          participantCount: 47,
          maxParticipants: 100,
          tags: ["Weekly", "80s", "Classics"],
          category: "Movies",
          isFeatured: true,
        },
        {
          id: "party2",
          name: "Anime Marathon Weekend",
          description: "48-hour anime marathon featuring the best series of all time",
          thumbnail: "/placeholder.svg?height=200&width=350&text=Anime+Marathon",
          host: {
            id: "host2",
            username: "AnimeGuru",
            avatar: "/placeholder-user.jpg",
            isVerified: true,
          },
          scheduledFor: "2024-01-20T12:00:00Z",
          isActive: false,
          participantCount: 156,
          maxParticipants: 200,
          tags: ["Anime", "Marathon", "Weekend"],
          category: "Anime",
          isFeatured: true,
        },
      ])

      setSuggestedUsers([
        {
          id: "suggest1",
          username: "FilmBuff2024",
          firstName: "Alex",
          lastName: "Johnson",
          avatar: "/placeholder-user.jpg",
          bio: "Movie enthusiast and part-time film critic. Love discussing plot twists!",
          location: "Los Angeles, CA",
          isOnline: true,
          isVerified: false,
          mutualFriends: 12,
          commonInterests: ["Action Movies", "Sci-Fi", "Film Analysis"],
          stats: {
            videosUploaded: 23,
            partiesHosted: 8,
            friendsCount: 156,
          },
          reasonForSuggestion: "mutual_friends",
        },
        {
          id: "suggest2",
          username: "CinematicSoul",
          firstName: "Sarah",
          lastName: "Chen",
          avatar: "/placeholder-user.jpg",
          bio: "Independent filmmaker and cinema lover. Always up for a good discussion!",
          location: "New York, NY",
          isOnline: false,
          isVerified: true,
          mutualFriends: 8,
          commonInterests: ["Independent Films", "Documentaries", "Film Making"],
          stats: {
            videosUploaded: 45,
            partiesHosted: 15,
            friendsCount: 289,
          },
          reasonForSuggestion: "common_interests",
        },
      ])

      setTrendingCategories([
        {
          id: "action",
          name: "Action & Adventure",
          description: "High-octane thrills and epic adventures",
          icon: "⚡",
          videoCount: 1247,
          isGrowing: true,
          color: "from-red-500 to-orange-500",
        },
        {
          id: "comedy",
          name: "Comedy",
          description: "Laugh-out-loud moments and feel-good content",
          icon: "😂",
          videoCount: 892,
          isGrowing: true,
          color: "from-yellow-500 to-pink-500",
        },
        {
          id: "horror",
          name: "Horror & Thriller",
          description: "Spine-chilling scares and suspenseful moments",
          icon: "👻",
          videoCount: 634,
          isGrowing: false,
          color: "from-purple-500 to-red-500",
        },
        {
          id: "scifi",
          name: "Sci-Fi & Fantasy",
          description: "Futuristic worlds and magical realms",
          icon: "🚀",
          videoCount: 756,
          isGrowing: true,
          color: "from-blue-500 to-purple-500",
        },
      ])
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
      setSuggestedUsers((prev) => prev.filter((u) => u.id !== userId))
      toast({
        title: "Friend Request Sent",
        description: "Your friend request has been sent successfully.",
      })
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

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto pt-20 pb-8 px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 space-y-4 lg:space-y-0">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Compass className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Discover</h1>
                  <p className="text-gray-400">Explore trending content and connect with the community</p>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full sm:w-64 bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder-gray-400 focus:border-purple-500/50"
                />
              </div>

              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-full sm:w-32 bg-white/10 backdrop-blur-sm border-white/20 text-white">
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
                <SelectTrigger className="w-full sm:w-40 bg-white/10 backdrop-blur-sm border-white/20 text-white">
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
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-5 h-5 text-blue-400" />
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                  +12%
                </Badge>
              </div>
              <div className="text-2xl font-bold text-white">{stats.totalUsers.toLocaleString()}</div>
              <div className="text-sm text-gray-400">Total Users</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <Video className="w-5 h-5 text-green-400" />
                <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
                  Live
                </Badge>
              </div>
              <div className="text-2xl font-bold text-white">{stats.activeParties}</div>
              <div className="text-sm text-gray-400">Active Parties</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <Eye className="w-5 h-5 text-purple-400" />
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                  +8%
                </Badge>
              </div>
              <div className="text-2xl font-bold text-white">{stats.videosWatched.toLocaleString()}</div>
              <div className="text-sm text-gray-400">Videos Watched</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <Sparkles className="w-5 h-5 text-orange-400" />
                <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                  New
                </Badge>
              </div>
              <div className="text-2xl font-bold text-white">{stats.newUsersToday}</div>
              <div className="text-sm text-gray-400">New Today</div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-sm border border-white/20">
            <TabsTrigger value="trending" className="data-[state=active]:bg-white/20 text-white">
              <Flame className="w-4 h-4 mr-2" />
              Trending
            </TabsTrigger>
            <TabsTrigger value="parties" className="data-[state=active]:bg-white/20 text-white">
              <Zap className="w-4 h-4 mr-2" />
              Parties
            </TabsTrigger>
            <TabsTrigger value="people" className="data-[state=active]:bg-white/20 text-white">
              <UserPlus className="w-4 h-4 mr-2" />
              People
            </TabsTrigger>
            <TabsTrigger value="categories" className="data-[state=active]:bg-white/20 text-white">
              <Globe className="w-4 h-4 mr-2" />
              Categories
            </TabsTrigger>
          </TabsList>

          {isLoading ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 space-y-4">
                    <Skeleton className="h-48 w-full rounded-lg bg-white/20" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-3/4 bg-white/20" />
                      <Skeleton className="h-3 w-1/2 bg-white/20" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              <TabsContent value="trending" className="space-y-8">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <Flame className="w-6 h-6 text-red-500" />
                      <h2 className="text-2xl font-bold text-white">Trending Videos</h2>
                      <Badge className="bg-red-500/20 text-red-300 border-red-500/30">Hot</Badge>
                    </div>
                    <Button variant="ghost" className="text-purple-400 hover:text-purple-300">
                      View All
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>

                  {trendingVideos.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {trendingVideos.map((video, index) => (
                        <div
                          key={video.id}
                          className="group bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden border border-white/20 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 cursor-pointer"
                        >
                          <div className="relative aspect-video">
                            <img
                              src={video.thumbnail || "/placeholder.svg"}
                              alt={video.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center">
                              <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>

                            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />#{index + 1}
                            </div>

                            <div className="absolute bottom-2 right-2 bg-black/75 text-white text-xs px-2 py-1 rounded">
                              {formatDuration(video.duration)}
                            </div>

                            <div className="absolute top-2 right-2">
                              <Button size="sm" variant="ghost" className="w-8 h-8 p-0 bg-black/50 hover:bg-black/70">
                                <Bookmark className="w-3 h-3 text-white" />
                              </Button>
                            </div>
                          </div>

                          <div className="p-4 space-y-3">
                            <h3 className="font-semibold text-white line-clamp-2 group-hover:text-purple-300 transition-colors">
                              {video.title}
                            </h3>

                            <div className="flex items-center space-x-2">
                              <Avatar className="w-6 h-6">
                                <AvatarImage src={video.author.avatar || "/placeholder.svg"} />
                                <AvatarFallback className="text-xs bg-purple-500 text-white">
                                  {video.author.username[0]}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm text-gray-300">{video.author.username}</span>
                              {video.author.isVerified && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
                            </div>

                            <div className="flex items-center justify-between text-xs text-gray-400">
                              <div className="flex items-center space-x-3">
                                <div className="flex items-center space-x-1">
                                  <Eye className="w-3 h-3" />
                                  <span>{video.views.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Heart className="w-3 h-3" />
                                  <span>{video.likes.toLocaleString()}</span>
                                </div>
                              </div>
                              <span>{formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}</span>
                            </div>

                            {video.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {video.tags.slice(0, 2).map((tag) => (
                                  <Badge key={tag} variant="outline" className="text-xs border-white/30 text-gray-300">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            <div className="flex items-center justify-between pt-2">
                              <div className="flex space-x-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="w-8 h-8 p-0 text-gray-400 hover:text-white"
                                >
                                  <MessageCircle className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="w-8 h-8 p-0 text-gray-400 hover:text-white"
                                >
                                  <Share2 className="w-3 h-3" />
                                </Button>
                              </div>
                              <Button size="sm" variant="ghost" className="w-8 h-8 p-0 text-gray-400 hover:text-white">
                                <MoreHorizontal className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 text-center">
                      <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-semibold mb-2 text-white">No Trending Videos</h3>
                      <p className="text-gray-400">Check back later for trending content.</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="parties" className="space-y-8">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <Zap className="w-6 h-6 text-yellow-500" />
                      <h2 className="text-2xl font-bold text-white">Featured Parties</h2>
                      <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">Editor's Choice</Badge>
                    </div>
                    <Button variant="ghost" className="text-purple-400 hover:text-purple-300">
                      View All
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>

                  {featuredParties.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {featuredParties.map((party) => (
                        <div
                          key={party.id}
                          className="group bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden border border-white/20 hover:border-yellow-500/50 transition-all duration-300 hover:scale-105 cursor-pointer"
                        >
                          {party.thumbnail && (
                            <div className="relative aspect-video">
                              <img
                                src={party.thumbnail || "/placeholder.svg"}
                                alt={party.name}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200" />

                              {party.isFeatured && (
                                <div className="absolute top-2 left-2 bg-yellow-500 text-black text-xs px-2 py-1 rounded-full flex items-center gap-1 font-medium">
                                  <Crown className="w-3 h-3" />
                                  Featured
                                </div>
                              )}

                              <div className="absolute top-2 right-2">
                                <Badge
                                  className={party.isActive ? "bg-green-500 text-white" : "bg-gray-500 text-white"}
                                >
                                  {party.isActive ? "Live" : "Scheduled"}
                                </Badge>
                              </div>
                            </div>
                          )}

                          <div className="p-6 space-y-4">
                            <div>
                              <h3 className="font-semibold text-lg text-white mb-2 group-hover:text-yellow-300 transition-colors">
                                {party.name}
                              </h3>
                              <p className="text-sm text-gray-400 line-clamp-2">{party.description}</p>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Avatar className="w-6 h-6">
                                <AvatarImage src={party.host.avatar || "/placeholder.svg"} />
                                <AvatarFallback className="text-xs bg-yellow-500 text-black">
                                  {party.host.username[0]}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm text-gray-300">Hosted by {party.host.username}</span>
                              {party.host.isVerified && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
                            </div>

                            <div className="flex items-center justify-between text-sm text-gray-400">
                              <div className="flex items-center space-x-1">
                                <Users className="w-4 h-4" />
                                <span>{party.participantCount} joined</span>
                                {party.maxParticipants && <span>/ {party.maxParticipants}</span>}
                              </div>
                              {party.scheduledFor && !party.isActive && (
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>{formatDistanceToNow(new Date(party.scheduledFor), { addSuffix: true })}</span>
                                </div>
                              )}
                            </div>

                            {party.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {party.tags.slice(0, 3).map((tag) => (
                                  <Badge key={tag} variant="outline" className="text-xs border-white/30 text-gray-300">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            <Button
                              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-medium"
                              onClick={() => router.push(`/watch/${party.id}`)}
                            >
                              {party.isActive ? "Join Party" : "RSVP"}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 text-center">
                      <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-semibold mb-2 text-white">No Featured Parties</h3>
                      <p className="text-gray-400">Check back later for featured parties.</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="people" className="space-y-8">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <UserPlus className="w-6 h-6 text-blue-500" />
                      <h2 className="text-2xl font-bold text-white">People You Might Know</h2>
                    </div>
                    <Button variant="ghost" className="text-purple-400 hover:text-purple-300">
                      View All
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>

                  {suggestedUsers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {suggestedUsers.map((suggestedUser) => (
                        <div
                          key={suggestedUser.id}
                          className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:border-blue-500/50 transition-all duration-300 hover:scale-105"
                        >
                          <div className="text-center mb-4">
                            <div className="relative inline-block mb-4">
                              <Avatar className="w-20 h-20">
                                <AvatarImage src={suggestedUser.avatar || "/placeholder.svg"} />
                                <AvatarFallback className="text-lg bg-blue-500 text-white">
                                  {suggestedUser.firstName[0]}
                                  {suggestedUser.lastName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div
                                className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white ${
                                  suggestedUser.isOnline ? "bg-green-500" : "bg-gray-400"
                                }`}
                              />
                            </div>

                            <div className="flex items-center justify-center space-x-2 mb-2">
                              <h3 className="font-semibold text-white">
                                {suggestedUser.firstName} {suggestedUser.lastName}
                              </h3>
                              {suggestedUser.isVerified && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                            </div>

                            <p className="text-sm text-gray-400 mb-2">@{suggestedUser.username}</p>

                            {suggestedUser.bio && (
                              <p className="text-sm text-gray-300 mb-3 line-clamp-2">{suggestedUser.bio}</p>
                            )}

                            <div className="flex items-center justify-center space-x-1 text-xs text-gray-400 mb-3">
                              {getSuggestionIcon(suggestedUser.reasonForSuggestion)}
                              <span>{getSuggestionReasonText(suggestedUser.reasonForSuggestion)}</span>
                            </div>
                          </div>

                          <div className="space-y-3 mb-4">
                            {suggestedUser.mutualFriends > 0 && (
                              <div className="text-center text-sm text-gray-400">
                                {suggestedUser.mutualFriends} mutual friends
                              </div>
                            )}

                            {suggestedUser.location && (
                              <div className="flex items-center justify-center space-x-1 text-sm text-gray-400">
                                <MapPin className="w-3 h-3" />
                                <span>{suggestedUser.location}</span>
                              </div>
                            )}

                            {suggestedUser.commonInterests.length > 0 && (
                              <div className="text-center">
                                <div className="text-xs text-gray-500 mb-1">Common Interests</div>
                                <div className="flex flex-wrap justify-center gap-1">
                                  {suggestedUser.commonInterests.slice(0, 3).map((interest) => (
                                    <Badge
                                      key={interest}
                                      variant="outline"
                                      className="text-xs border-white/30 text-gray-300"
                                    >
                                      {interest}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="grid grid-cols-3 gap-2 text-center text-xs">
                              <div>
                                <div className="font-semibold text-white">{suggestedUser.stats.videosUploaded}</div>
                                <div className="text-gray-500">Videos</div>
                              </div>
                              <div>
                                <div className="font-semibold text-white">{suggestedUser.stats.partiesHosted}</div>
                                <div className="text-gray-500">Parties</div>
                              </div>
                              <div>
                                <div className="font-semibold text-white">{suggestedUser.stats.friendsCount}</div>
                                <div className="text-gray-500">Friends</div>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Button
                              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                              onClick={() => handleSendFriendRequest(suggestedUser.id)}
                            >
                              <UserPlus className="w-4 h-4 mr-2" />
                              Add Friend
                            </Button>
                            <Button
                              variant="outline"
                              className="w-full border-white/30 text-gray-300 hover:bg-white/10 bg-transparent"
                              onClick={() => router.push(`/profile/${suggestedUser.id}`)}
                            >
                              View Profile
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 text-center">
                      <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-semibold mb-2 text-white">No Suggestions Available</h3>
                      <p className="text-gray-400">Check back later for people you might know.</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="categories" className="space-y-8">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <Globe className="w-6 h-6 text-green-500" />
                      <h2 className="text-2xl font-bold text-white">Trending Categories</h2>
                    </div>
                    <Button variant="ghost" className="text-purple-400 hover:text-purple-300">
                      View All
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>

                  {trendingCategories.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {trendingCategories.map((category) => (
                        <div
                          key={category.id}
                          className="group bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:border-green-500/50 transition-all duration-300 hover:scale-105 cursor-pointer"
                        >
                          <div className="text-center space-y-4">
                            <div
                              className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center text-2xl`}
                            >
                              {category.icon}
                            </div>

                            <div>
                              <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-green-300 transition-colors">
                                {category.name}
                              </h3>
                              <p className="text-gray-400 text-sm">{category.description}</p>
                            </div>

                            <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
                              <div className="flex items-center space-x-1">
                                <Video className="w-4 h-4" />
                                <span>{category.videoCount.toLocaleString()} videos</span>
                              </div>
                              {category.isGrowing && (
                                <div className="flex items-center space-x-1 text-green-400">
                                  <TrendingUp className="w-4 h-4" />
                                  <span>Growing</span>
                                </div>
                              )}
                            </div>

                            <Button
                              variant="outline"
                              className="w-full border-white/30 text-gray-300 hover:bg-white/10 group-hover:border-green-500/50 group-hover:text-green-300 bg-transparent"
                              onClick={() => router.push(`/search?q=&type=videos&category=${category.id}`)}
                            >
                              Explore {category.name}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 text-center">
                      <Globe className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-semibold mb-2 text-white">No Categories Available</h3>
                      <p className="text-gray-400">Check back later for trending categories.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </div>
  )
}
