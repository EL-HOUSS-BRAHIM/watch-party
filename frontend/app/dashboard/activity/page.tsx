"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import {
  Activity,
  Users,
  Play,
  Heart,
  MessageCircle,
  Share2,
  UserPlus,
  Calendar,
  Clock,
  TrendingUp,
  Filter,
  Search,
  RefreshCw,
  Settings,
  Bell,
  BellOff,
  Eye,
  EyeOff,
  Star,
  Trophy,
  Gift,
  Gamepad2,
  Music,
  Video,
  Camera,
  Mic,
  Volume2,
  Loader2,
  ChevronDown,
  MoreHorizontal,
  BookOpen,
  Coffee,
  MapPin,
  Globe,
  Zap,
  Sparkles,
  Target,
  Award
} from "lucide-react"
import { formatDistanceToNow, format, parseISO } from "date-fns"

interface ActivityItem {
  id: string
  type: "party_created" | "party_joined" | "party_completed" | "friend_added" | "achievement_earned" | "content_liked" | "milestone_reached" | "party_shared" | "review_posted" | "badge_earned"
  user: {
    id: string
    username: string
    display_name: string
    avatar?: string
    is_verified: boolean
    is_premium: boolean
  }
  timestamp: string
  data: any
  privacy: "public" | "friends" | "private"
  is_trending: boolean
  engagement: {
    likes: number
    comments: number
    shares: number
  }
  location?: string
}

interface FilterOptions {
  type: string
  timeRange: string
  privacy: string
  friends: boolean
  trending: boolean
}

interface NotificationSettings {
  new_friends: boolean
  friend_parties: boolean
  trending_content: boolean
  achievements: boolean
  recommendations: boolean
  weekly_digest: boolean
}

export default function ActivityFeedPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()

  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [filteredActivities, setFilteredActivities] = useState<ActivityItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<FilterOptions>({
    type: "all",
    timeRange: "week",
    privacy: "all",
    friends: false,
    trending: false
  })
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    new_friends: true,
    friend_parties: true,
    trending_content: true,
    achievements: true,
    recommendations: true,
    weekly_digest: false
  })
  const [engagingWith, setEngagingWith] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadActivities(true)
  }, [filters])

  useEffect(() => {
    filterActivities()
  }, [activities, searchQuery])

  const loadActivities = async (reset = false) => {
    if (reset) {
      setIsLoading(true)
      setPage(1)
    } else {
      setIsLoadingMore(true)
    }

    try {
      const token = localStorage.getItem("accessToken")
      const params = new URLSearchParams({
        page: reset ? "1" : page.toString(),
        limit: "20",
        type: filters.type,
        time_range: filters.timeRange,
        privacy: filters.privacy,
        friends_only: filters.friends.toString(),
        trending_only: filters.trending.toString()
      })

      const response = await fetch(`/api/social/activity/?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        const newActivities = data.results || data.activities || []
        
        if (reset) {
          setActivities(newActivities)
        } else {
          setActivities(prev => [...prev, ...newActivities])
        }
        
        setHasMore(data.has_next || newActivities.length === 20)
        if (!reset) setPage(prev => prev + 1)
      } else {
        throw new Error("Failed to load activities")
      }
    } catch (error) {
      console.error("Failed to load activities:", error)
      toast({
        title: "Error",
        description: "Failed to load activity feed.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }

  const filterActivities = () => {
    let filtered = [...activities]

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(activity =>
        activity.user.username.toLowerCase().includes(query) ||
        activity.user.display_name.toLowerCase().includes(query) ||
        JSON.stringify(activity.data).toLowerCase().includes(query)
      )
    }

    setFilteredActivities(filtered)
  }

  const loadNotificationSettings = async () => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch("/api/users/notification-settings/", {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setNotificationSettings(data)
      }
    } catch (error) {
      console.error("Failed to load notification settings:", error)
    }
  }

  const updateNotificationSettings = async (settings: Partial<NotificationSettings>) => {
    try {
      const token = localStorage.getItem("accessToken")
      const newSettings = { ...notificationSettings, ...settings }
      
      const response = await fetch("/api/users/notification-settings/", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newSettings),
      })

      if (response.ok) {
        setNotificationSettings(newSettings)
        toast({
          title: "Settings Updated",
          description: "Your notification preferences have been saved.",
        })
      }
    } catch (error) {
      console.error("Failed to update settings:", error)
      toast({
        title: "Error",
        description: "Failed to update notification settings.",
        variant: "destructive",
      })
    }
  }

  const engageWithActivity = async (activityId: string, action: "like" | "comment" | "share") => {
    setEngagingWith(prev => new Set(prev).add(activityId))

    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`/api/social/activity/${activityId}/engage/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      })

      if (response.ok) {
        const data = await response.json()
        setActivities(prev => 
          prev.map(activity => 
            activity.id === activityId 
              ? { ...activity, engagement: data.engagement }
              : activity
          )
        )
        
        if (action === "like") {
          toast({
            title: "Liked!",
            description: "You liked this activity.",
          })
        }
      }
    } catch (error) {
      console.error("Engagement error:", error)
      toast({
        title: "Error",
        description: "Failed to engage with activity.",
        variant: "destructive",
      })
    } finally {
      setEngagingWith(prev => {
        const newSet = new Set(prev)
        newSet.delete(activityId)
        return newSet
      })
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "party_created":
        return <Play className="h-4 w-4 text-blue-600" />
      case "party_joined":
        return <Users className="h-4 w-4 text-green-600" />
      case "party_completed":
        return <Trophy className="h-4 w-4 text-yellow-600" />
      case "friend_added":
        return <UserPlus className="h-4 w-4 text-purple-600" />
      case "achievement_earned":
        return <Award className="h-4 w-4 text-orange-600" />
      case "content_liked":
        return <Heart className="h-4 w-4 text-red-600" />
      case "milestone_reached":
        return <Target className="h-4 w-4 text-indigo-600" />
      case "party_shared":
        return <Share2 className="h-4 w-4 text-cyan-600" />
      case "review_posted":
        return <Star className="h-4 w-4 text-yellow-500" />
      case "badge_earned":
        return <Sparkles className="h-4 w-4 text-pink-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getActivityMessage = (activity: ActivityItem) => {
    const { type, data, user } = activity
    
    switch (type) {
      case "party_created":
        return `created a watch party for "${data.title}"`
      case "party_joined":
        return `joined ${data.host_name}'s watch party`
      case "party_completed":
        return `completed watching "${data.title}" with ${data.participants} friends`
      case "friend_added":
        return `became friends with ${data.friend_name}`
      case "achievement_earned":
        return `earned the "${data.achievement_name}" achievement`
      case "content_liked":
        return `liked "${data.title}"`
      case "milestone_reached":
        return `reached ${data.milestone_name}!`
      case "party_shared":
        return `shared a watch party for "${data.title}"`
      case "review_posted":
        return `posted a ${data.rating}-star review for "${data.title}"`
      case "badge_earned":
        return `earned the "${data.badge_name}" badge`
      default:
        return "had some activity"
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case "party_created":
        return "border-l-blue-500"
      case "party_joined":
        return "border-l-green-500"
      case "party_completed":
        return "border-l-yellow-500"
      case "friend_added":
        return "border-l-purple-500"
      case "achievement_earned":
        return "border-l-orange-500"
      case "content_liked":
        return "border-l-red-500"
      case "milestone_reached":
        return "border-l-indigo-500"
      case "party_shared":
        return "border-l-cyan-500"
      case "review_posted":
        return "border-l-yellow-400"
      case "badge_earned":
        return "border-l-pink-500"
      default:
        return "border-l-gray-500"
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading activity feed...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Activity className="h-8 w-8" />
              Activity Feed
            </h1>
            <p className="text-gray-600 mt-2">Stay updated with your friends' watch party activities</p>
          </div>
          
          <div className="flex items-center gap-2">
            {filters.trending && (
              <Badge variant="secondary" className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                <TrendingUp className="h-3 w-3 mr-1" />
                Trending
              </Badge>
            )}
            {filters.friends && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                <Users className="h-3 w-3 mr-1" />
                Friends Only
              </Badge>
            )}
            <Button variant="outline" onClick={() => loadActivities(true)}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <Tabs defaultValue="feed" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="feed">Activity Feed</TabsTrigger>
            <TabsTrigger value="settings">Notification Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Search */}
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search activities..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Filter controls */}
                  <div className="flex gap-2">
                    <Select
                      value={filters.type}
                      onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Activities</SelectItem>
                        <SelectItem value="party_created">Parties Created</SelectItem>
                        <SelectItem value="party_joined">Parties Joined</SelectItem>
                        <SelectItem value="friend_added">New Friends</SelectItem>
                        <SelectItem value="achievement_earned">Achievements</SelectItem>
                        <SelectItem value="content_liked">Liked Content</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={filters.timeRange}
                      onValueChange={(value) => setFilters(prev => ({ ...prev, timeRange: value }))}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="day">Today</SelectItem>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                        <SelectItem value="all">All Time</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      variant={filters.friends ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilters(prev => ({ ...prev, friends: !prev.friends }))}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Friends
                    </Button>

                    <Button
                      variant={filters.trending ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilters(prev => ({ ...prev, trending: !prev.trending }))}
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Trending
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Activity Feed */}
            <div className="space-y-4">
              {filteredActivities.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No activities found</h3>
                    <p className="text-gray-600">
                      {searchQuery || Object.values(filters).some(f => f !== "all" && f !== false)
                        ? "Try adjusting your search or filters"
                        : "Follow friends to see their watch party activities here"
                      }
                    </p>
                    <Button 
                      className="mt-4" 
                      onClick={() => router.push("/dashboard/social/discover")}
                    >
                      Discover Friends
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                filteredActivities.map((activity) => (
                  <Card key={activity.id} className={`border-l-4 ${getActivityColor(activity.type)} hover:shadow-md transition-shadow`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={activity.user.avatar} />
                          <AvatarFallback>
                            {activity.user.display_name?.[0] || activity.user.username?.[0]}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {getActivityIcon(activity.type)}
                            <span className="font-medium text-sm">
                              {activity.user.display_name || activity.user.username}
                            </span>
                            {activity.user.is_verified && (
                              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                                <Star className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                            {activity.user.is_premium && (
                              <Badge variant="secondary" className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                                <Sparkles className="h-3 w-3 mr-1" />
                                Premium
                              </Badge>
                            )}
                            {activity.is_trending && (
                              <Badge variant="secondary" className="text-xs bg-gradient-to-r from-orange-500 to-red-500 text-white">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                Trending
                              </Badge>
                            )}
                          </div>

                          <p className="text-gray-900 mb-2">
                            {getActivityMessage(activity)}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDistanceToNow(parseISO(activity.timestamp), { addSuffix: true })}
                              </span>
                              {activity.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {activity.location}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => engageWithActivity(activity.id, "like")}
                                disabled={engagingWith.has(activity.id)}
                                className="text-gray-600 hover:text-red-600"
                              >
                                <Heart className="h-4 w-4 mr-1" />
                                {activity.engagement.likes}
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => engageWithActivity(activity.id, "comment")}
                                disabled={engagingWith.has(activity.id)}
                                className="text-gray-600 hover:text-blue-600"
                              >
                                <MessageCircle className="h-4 w-4 mr-1" />
                                {activity.engagement.comments}
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => engageWithActivity(activity.id, "share")}
                                disabled={engagingWith.has(activity.id)}
                                className="text-gray-600 hover:text-green-600"
                              >
                                <Share2 className="h-4 w-4 mr-1" />
                                {activity.engagement.shares}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}

              {/* Load More */}
              {hasMore && filteredActivities.length > 0 && (
                <div className="text-center">
                  <Button
                    variant="outline"
                    onClick={() => loadActivities(false)}
                    disabled={isLoadingMore}
                    className="w-full"
                  >
                    {isLoadingMore ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading more activities...
                      </>
                    ) : (
                      "Load More Activities"
                    )}
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Control what activity notifications you receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">New Friends</p>
                      <p className="text-sm text-gray-600">When someone adds you as a friend</p>
                    </div>
                    <Button
                      variant={notificationSettings.new_friends ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateNotificationSettings({ new_friends: !notificationSettings.new_friends })}
                    >
                      {notificationSettings.new_friends ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Friend Parties</p>
                      <p className="text-sm text-gray-600">When friends create or join watch parties</p>
                    </div>
                    <Button
                      variant={notificationSettings.friend_parties ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateNotificationSettings({ friend_parties: !notificationSettings.friend_parties })}
                    >
                      {notificationSettings.friend_parties ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Trending Content</p>
                      <p className="text-sm text-gray-600">Popular activities and parties</p>
                    </div>
                    <Button
                      variant={notificationSettings.trending_content ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateNotificationSettings({ trending_content: !notificationSettings.trending_content })}
                    >
                      {notificationSettings.trending_content ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Achievements</p>
                      <p className="text-sm text-gray-600">When you or friends earn achievements</p>
                    </div>
                    <Button
                      variant={notificationSettings.achievements ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateNotificationSettings({ achievements: !notificationSettings.achievements })}
                    >
                      {notificationSettings.achievements ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Recommendations</p>
                      <p className="text-sm text-gray-600">Personalized content and party suggestions</p>
                    </div>
                    <Button
                      variant={notificationSettings.recommendations ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateNotificationSettings({ recommendations: !notificationSettings.recommendations })}
                    >
                      {notificationSettings.recommendations ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Weekly Digest</p>
                      <p className="text-sm text-gray-600">Summary of weekly activity from friends</p>
                    </div>
                    <Button
                      variant={notificationSettings.weekly_digest ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateNotificationSettings({ weekly_digest: !notificationSettings.weekly_digest })}
                    >
                      {notificationSettings.weekly_digest ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
