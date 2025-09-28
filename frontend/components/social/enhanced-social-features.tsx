"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import {
  Users,
  UserPlus,
  Heart,
  MessageCircle,
  Share2,
  Trophy,
  Star,
  Crown,
  Zap,
  Gift,
  Calendar,
  MapPin,
  Search,
  Plus,
  Settings,
  CheckCircle,
} from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { socialAPI, usersAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface User {
  id: string
  username: string
  displayName: string
  avatar: string
  isOnline: boolean
  lastSeen: string
  mutualFriends: number
  commonInterests: string[]
  location?: string
  joinedDate: string
  friendshipStatus?: "none" | "pending_sent" | "pending_received" | "friends" | "blocked"
  stats: {
    partiesHosted: number
    partiesJoined: number
    friendsCount: number
    watchTime: number
  }
}

interface Community {
  id: string
  numericId?: number
  name: string
  description: string
  memberCount: number
  category: string
  isPrivate: boolean
  avatar: string
  tags: string[]
  createdBy: string
  createdAt: string
  recentActivity: string
}

interface ActivityFeedItem {
  id: string
  type: "party_created" | "friend_added" | "achievement_earned" | "community_joined" | "video_shared"
  user: User
  content: string
  timestamp: string
  likes: number
  comments: number
  isLiked: boolean
  metadata?: unknown
}

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: "social" | "content" | "engagement" | "milestone"
  rarity: "common" | "rare" | "epic" | "legendary"
  progress: number
  maxProgress: number
  unlockedAt?: string
  reward: {
    type: "badge" | "title" | "feature" | "cosmetic"
    value: string
  }
}

const fallbackId = (prefix: string) =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? `${prefix}-${crypto.randomUUID()}`
    : `${prefix}-${Math.random().toString(36).slice(2, 10)}`

const normalizeStats = (stats?: unknown, source?: unknown) => ({
  partiesHosted:
    stats?.parties_hosted ?? stats?.hosted ?? stats?.partiesHosted ?? source?.parties_hosted ?? source?.hosted ?? 0,
  partiesJoined:
    stats?.parties_joined ?? stats?.joined ?? stats?.partiesJoined ?? source?.parties_joined ?? source?.joined ?? 0,
  friendsCount:
    stats?.friends_count ?? stats?.friends ?? stats?.friendsCount ?? source?.friends_count ?? source?.friends ?? 0,
  watchTime: stats?.watch_time ?? stats?.watchTime ?? source?.watch_time ?? source?.watchTime ?? 0,
})

const normalizeUser = (friend: unknown): User => ({
  id: String(friend?.id ?? friend?.user_id ?? friend?.username ?? fallbackId("user")),
  username: friend?.username ?? friend?.handle ?? friend?.user?.username ?? "user",
  displayName:
    friend?.display_name ??
    friend?.name ??
    friend?.full_name ??
    friend?.user?.display_name ??
    friend?.username ??
    "User",
  avatar:
    friend?.avatar_url ??
    friend?.avatar ??
    friend?.profile_image ??
    friend?.user?.avatar ??
    "/placeholder-user.jpg",
  isOnline: Boolean(friend?.is_online ?? friend?.online ?? friend?.status === "online"),
  lastSeen: friend?.last_seen ?? friend?.last_activity ?? friend?.user?.last_seen ?? new Date().toISOString(),
  mutualFriends: friend?.mutual_friends_count ?? friend?.mutualFriends ?? friend?.mutual_friends ?? 0,
  commonInterests: Array.isArray(friend?.common_interests)
    ? friend.common_interests
    : Array.isArray(friend?.interests)
      ? friend.interests
      : Array.isArray(friend?.genres)
        ? friend.genres
        : [],
  location: friend?.location ?? friend?.city ?? friend?.user?.location,
  joinedDate: friend?.joined_at ?? friend?.created_at ?? friend?.user?.joined_at ?? new Date().toISOString(),
  friendshipStatus: friend?.friendship_status ?? friend?.status ?? "none",
  stats: normalizeStats(friend?.stats, friend),
})

const normalizeCommunity = (group: unknown): Community => {
  const tags = Array.isArray(group?.tags)
    ? group.tags
    : Array.isArray(group?.topics)
      ? group.topics
      : []

  const category = (group?.category ?? group?.type ?? "general").toString()
  const rawId = group?.id ?? group?.uuid ?? fallbackId("community")
  const numericCandidate = typeof rawId === "number" ? rawId : Number(rawId)
  const numericId = typeof numericCandidate === "number" && !Number.isNaN(numericCandidate)
    ? numericCandidate
    : undefined

  return {
    id: String(rawId),
    numericId,
    name: group?.name ?? group?.title ?? "Community",
    description: group?.description ?? group?.summary ?? "No description provided yet.",
    memberCount:
      group?.member_count ??
      group?.members_count ??
      (Array.isArray(group?.members) ? group.members.length : 0),
    category,
    isPrivate: Boolean(group?.is_private ?? group?.privacy === "private"),
    avatar: group?.avatar_url ?? group?.image ?? "/placeholder.svg",
    tags,
    createdBy: group?.owner?.username ?? group?.creator?.username ?? group?.owner_name ?? "Unknown",
    createdAt: group?.created_at ?? new Date().toISOString(),
    recentActivity:
      group?.recent_activity ??
      group?.latest_post ??
      `Active members: ${
        group?.member_count ??
        group?.members_count ??
        (Array.isArray(group?.members) ? group.members.length : 0)
      }`,
  }
}

const formatActivityContent = (activity: unknown): string => {
  if (!activity) {
    return "New activity"
  }

  if (typeof activity.content === "string") {
    return activity.content
  }

  if (activity.content && typeof activity.content === "object") {
    if (typeof activity.content.title === "string") {
      return activity.content.title
    }

    if (typeof activity.content.description === "string") {
      return activity.content.description
    }
  }

  if (typeof activity.message === "string") {
    return activity.message
  }

  if (typeof activity.summary === "string") {
    return activity.summary
  }

  const metadata = activity.metadata ?? {}

  if (metadata.party_name) {
    return `Created a watch party${metadata.party_name ? ` "${metadata.party_name}"` : ""}`
  }

  if (metadata.video_title) {
    return `Shared the video "${metadata.video_title}"`
  }

  if (metadata.friend_name) {
    return `Added ${metadata.friend_name}`
  }

  return "Shared an update"
}

const normalizeActivity = (activity: unknown): ActivityFeedItem => ({
  id: String(activity?.id ?? activity?.activity_id ?? fallbackId("activity")),
  type:
    (activity?.activity_type ??
      activity?.type ??
      "video_shared") as ActivityFeedItem["type"],
  user: normalizeUser(activity?.user ?? {}),
  content: formatActivityContent(activity),
  timestamp: activity?.created_at ?? activity?.timestamp ?? new Date().toISOString(),
  likes: activity?.like_count ?? activity?.likes ?? 0,
  comments: activity?.comment_count ?? activity?.comments ?? 0,
  isLiked: Boolean(activity?.is_liked ?? activity?.liked),
  metadata: activity?.metadata ?? {},
})

const normalizeAchievement = (achievement: unknown): Achievement => ({
  id: String(achievement?.id ?? achievement?.slug ?? fallbackId("achievement")),
  name: achievement?.name ?? achievement?.title ?? "Achievement",
  description: achievement?.description ?? achievement?.summary ?? "",
  icon: achievement?.icon ?? achievement?.emoji ?? "🏆",
  category: (achievement?.category ?? "engagement") as Achievement["category"],
  rarity: (achievement?.rarity ?? "common") as Achievement["rarity"],
  progress: achievement?.progress ?? achievement?.current_progress ?? 0,
  maxProgress: achievement?.max_progress ?? achievement?.total_required ?? achievement?.goal ?? 1,
  unlockedAt: achievement?.unlocked_at ?? achievement?.completed_at,
  reward: {
    type: achievement?.reward?.type ?? "badge",
    value: achievement?.reward?.value ?? achievement?.reward ?? "Reward",
  },
})

export function EnhancedSocialFeatures() {
  const [users, setUsers] = useState<User[]>([])
  const [communities, setCommunities] = useState<Community[]>([])
  const [activityFeed, setActivityFeed] = useState<ActivityFeedItem[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [createCommunityOpen, setCreateCommunityOpen] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState<ActivityFeedItem | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchSocialData()
  }, [])

  const fetchSocialData = async () => {
    setLoading(true)
    try {
      const [friendsResult, suggestionsResult, communitiesResult, activityResult, achievementsResult] =
        await Promise.allSettled([
          usersAPI.getFriends({ limit: 20 }),
          usersAPI.getFriendSuggestions({ limit: 20 }),
          socialAPI.getGroups({ page: 1, public_only: true }),
          usersAPI.getActivity({ page: 1 }),
          usersAPI.getAchievements(),
        ])

      const combinedUsers = new Map<string, User>()

      if (friendsResult.status === "fulfilled") {
        const friendResults = friendsResult.value?.results ?? []
        friendResults.forEach((friend: unknown) => {
          const normalized = normalizeUser(friend)
          combinedUsers.set(normalized.id, normalized)
        })
      }

      if (suggestionsResult.status === "fulfilled") {
        const suggestions = suggestionsResult.value ?? []
        suggestions.forEach((friend: unknown) => {
          const normalized = normalizeUser(friend)
          if (!combinedUsers.has(normalized.id)) {
            combinedUsers.set(normalized.id, normalized)
          }
        })
      }

      setUsers(Array.from(combinedUsers.values()))

      if (communitiesResult.status === "fulfilled") {
        const communityResults = communitiesResult.value?.results ?? []
        setCommunities(communityResults.map((community: unknown) => normalizeCommunity(community)))
      } else {
        setCommunities([])
      }

      if (activityResult.status === "fulfilled") {
        const activityResults = activityResult.value?.results ?? []
        setActivityFeed(activityResults.map((activity: unknown) => normalizeActivity(activity)))
      } else {
        setActivityFeed([])
      }

      if (achievementsResult.status === "fulfilled") {
        const achievementResults = achievementsResult.value ?? []
        setAchievements(achievementResults.map((achievement: unknown) => normalizeAchievement(achievement)))
      } else {
        setAchievements([])
      }
    } catch (error) {
      console.error("Failed to fetch social data:", error)
      toast({
        title: "Error",
        description: "Failed to load social data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLikeActivity = async (activityId: string) => {
    try {
      // Call API to like/unlike activity (placeholder - implement based on activity type)
      // await api.videos.like(activityId) // if it's a video
      // await api.parties.like(activityId) // if it's a party

      setActivityFeed((prev) =>
        prev.map((activity) =>
          activity.id === activityId
            ? {
                ...activity,
                isLiked: !activity.isLiked,
                likes: activity.isLiked ? activity.likes - 1 : activity.likes + 1,
              }
            : activity,
        ),
      )
    } catch (error) {
      console.error('Failed to like activity:', error)
      toast({
        title: "Error",
        description: "Failed to like activity. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleFollowUser = async (userId: string) => {
    try {
      await usersAPI.sendFriendRequestToUser(userId)
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId
            ? {
                ...user,
                friendshipStatus: "pending_sent",
              }
            : user,
        ),
      )
      toast({
        title: "Friend request sent",
        description: "Your friend request has been delivered.",
      })
    } catch (error) {
      console.error("Failed to send friend request:", error)
      toast({
        title: "Request failed",
        description: "We couldn't send that friend request. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleJoinCommunity = async (communityId: string) => {
    try {
      const targetCommunity = communities.find((community) => community.id === communityId)
      const numericId = targetCommunity?.numericId ?? Number(communityId)
      if (typeof numericId === "number" && !Number.isNaN(numericId)) {
        await socialAPI.joinGroup(numericId)
      }

      setCommunities((prev) =>
        prev.map((community) =>
          community.id === communityId
            ? { ...community, memberCount: community.memberCount + 1 }
            : community,
        ),
      )

      toast({
        title: "Joined community",
        description: "You're now part of this community.",
      })
    } catch (error) {
      console.error("Failed to join community:", error)
      toast({
        title: "Join failed",
        description: "Unable to join that community right now.",
        variant: "destructive",
      })
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "legendary":
        return "bg-gradient-to-r from-yellow-400 to-orange-500 text-white"
      case "epic":
        return "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
      case "rare":
        return "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
      case "common":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "party_created":
        return <Calendar className="h-4 w-4" />
      case "friend_added":
        return <UserPlus className="h-4 w-4" />
      case "achievement_earned":
        return <Trophy className="h-4 w-4" />
      case "community_joined":
        return <Users className="h-4 w-4" />
      case "video_shared":
        return <Share2 className="h-4 w-4" />
      default:
        return <Star className="h-4 w-4" />
    }
  }

  const communityCategories = useMemo(() => {
    const categories = new Set<string>()
    communities.forEach((community) => {
      if (community.category) {
        categories.add(community.category.toLowerCase())
      }
    })
    return Array.from(categories)
  }, [communities])

  useEffect(() => {
    if (selectedCategory !== "all" && !communityCategories.includes(selectedCategory)) {
      setSelectedCategory("all")
    }
  }, [communityCategories, selectedCategory])

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) {
      return users
    }

    const query = searchQuery.toLowerCase()
    return users.filter(
      (user) =>
        user.username.toLowerCase().includes(query) ||
        user.displayName.toLowerCase().includes(query),
    )
  }, [searchQuery, users])

  const filteredCommunities = useMemo(() => {
    const query = searchQuery.toLowerCase()
    return communities.filter((community) => {
      const matchesSearch =
        !searchQuery.trim() ||
        community.name.toLowerCase().includes(query) ||
        community.description.toLowerCase().includes(query)

      const matchesCategory =
        selectedCategory === "all" || community.category.toLowerCase() === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [communities, searchQuery, selectedCategory])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-muted-foreground">Loading your social hub…</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Social Hub</h1>
          <p className="text-gray-600 dark:text-gray-400">Connect, discover, and engage with the community</p>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => setCreateCommunityOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Community
          </Button>
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Social Tabs */}
      <Tabs defaultValue="feed" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="feed">Activity Feed</TabsTrigger>
          <TabsTrigger value="friends">Friend Suggestions</TabsTrigger>
          <TabsTrigger value="communities">Communities</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        {/* Activity Feed */}
        <TabsContent value="feed" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Activity Feed</CardTitle>
              <CardDescription>See what your friends and communities are up to</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {activityFeed.map((activity) => (
                    <div key={activity.id} className="flex gap-4 p-4 border rounded-lg">
                      <Avatar>
                        <AvatarImage src={activity.user.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{activity.user.displayName.charAt(0)}</AvatarFallback>
                      </Avatar>

                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          {getActivityIcon(activity.type)}
                          <span className="font-medium">{activity.user.displayName}</span>
                          <span className="text-sm text-muted-foreground">@{activity.user.username}</span>
                          <span className="text-sm text-muted-foreground">•</span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(activity.timestamp).toLocaleDateString()}
                          </span>
                        </div>

                        <p className="text-gray-700 dark:text-gray-300">{activity.content}</p>

                        <div className="flex items-center gap-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLikeActivity(activity.id)}
                            className={activity.isLiked ? "text-red-500" : ""}
                          >
                            <Heart className={`mr-1 h-4 w-4 ${activity.isLiked ? "fill-current" : ""}`} />
                            {activity.likes}
                          </Button>

                          <Button variant="ghost" size="sm">
                            <MessageCircle className="mr-1 h-4 w-4" />
                            {activity.comments}
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedActivity(activity)
                              setShareDialogOpen(true)
                            }}
                          >
                            <Share2 className="mr-1 h-4 w-4" />
                            Share
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Friend Suggestions */}
        <TabsContent value="friends" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Friend Suggestions</CardTitle>
                  <CardDescription>Discover new friends based on your interests</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 w-64"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredUsers.map((user) => (
                  <Card key={user.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="relative">
                          <Avatar>
                            <AvatarImage src={user.avatar || "/placeholder.svg"} />
                            <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          {user.isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{user.displayName}</h4>
                          <p className="text-sm text-muted-foreground">@{user.username}</p>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        {user.location && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {user.location}
                          </div>
                        )}
                        <p className="text-sm text-muted-foreground">{user.mutualFriends} mutual friends</p>
                        <div className="flex flex-wrap gap-1">
                          {user.commonInterests.slice(0, 2).map((interest) => (
                            <Badge key={interest} variant="secondary" className="text-xs">
                              {interest}
                            </Badge>
                          ))}
                          {user.commonInterests.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{user.commonInterests.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-center text-sm mb-4">
                        <div>
                          <p className="font-medium">{user.stats.partiesHosted}</p>
                          <p className="text-muted-foreground">Hosted</p>
                        </div>
                        <div>
                          <p className="font-medium">{user.stats.friendsCount}</p>
                          <p className="text-muted-foreground">Friends</p>
                        </div>
                      </div>

                      <Button
                        className="w-full"
                        onClick={() => handleFollowUser(user.id)}
                        disabled={user.friendshipStatus === "friends" || user.friendshipStatus === "pending_sent"}
                        variant={
                          user.friendshipStatus === "friends" || user.friendshipStatus === "pending_sent"
                            ? "outline"
                            : "default"
                        }
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        {user.friendshipStatus === "friends"
                          ? "Friends"
                          : user.friendshipStatus === "pending_sent"
                            ? "Request Sent"
                            : "Add Friend"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Communities */}
        <TabsContent value="communities" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Communities</CardTitle>
                  <CardDescription>Join communities that match your interests</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {communityCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search communities..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 w-64"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCommunities.map((community) => (
                  <Card key={community.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={community.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{community.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{community.name}</h4>
                            {community.isPrivate && <Badge variant="outline">Private</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{community.description}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{community.memberCount.toLocaleString()} members</span>
                            <span>•</span>
                            <span>{community.category}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-3">
                        {community.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="text-sm text-muted-foreground mb-4">
                        <p>{community.recentActivity}</p>
                      </div>

                      <Button className="w-full" onClick={() => handleJoinCommunity(community.id)}>
                        <Users className="mr-2 h-4 w-4" />
                        Join Community
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements */}
        <TabsContent value="achievements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Achievements & Badges</CardTitle>
              <CardDescription>Track your progress and unlock rewards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((achievement) => (
                  <Card key={achievement.id} className="relative overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="text-2xl">{achievement.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{achievement.name}</h4>
                            <Badge className={getRarityColor(achievement.rarity)} variant="secondary">
                              {achievement.rarity}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>
                            {achievement.progress}/{achievement.maxProgress}
                          </span>
                        </div>
                        <Progress value={(achievement.progress / achievement.maxProgress) * 100} className="h-2" />
                      </div>

                      {achievement.unlockedAt && (
                        <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-green-700 dark:text-green-400">
                              Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Gift className="h-4 w-4 text-purple-600" />
                          <span className="text-sm">
                            Reward: {achievement.reward.type} - {achievement.reward.value}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leaderboard */}
        <TabsContent value="leaderboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Community Leaderboard</CardTitle>
              <CardDescription>See how you rank among other users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user, index) => (
                  <div key={user.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800">
                      {index === 0 && <Crown className="h-4 w-4 text-yellow-500" />}
                      {index === 1 && <Trophy className="h-4 w-4 text-gray-400" />}
                      {index === 2 && <Trophy className="h-4 w-4 text-orange-500" />}
                      {index > 2 && <span className=&quot;text-sm font-medium">#{index + 1}</span>}
                    </div>

                    <Avatar>
                      <AvatarImage src={user.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <h4 className="font-medium">{user.displayName}</h4>
                      <p className="text-sm text-muted-foreground">@{user.username}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-center text-sm">
                      <div>
                        <p className="font-medium">{user.stats.partiesHosted}</p>
                        <p className="text-muted-foreground">Parties</p>
                      </div>
                      <div>
                        <p className="font-medium">{user.stats.friendsCount}</p>
                        <p className="text-muted-foreground">Friends</p>
                      </div>
                      <div>
                        <p className="font-medium">{Math.round(user.stats.watchTime / 60)}h</p>
                        <p className="text-muted-foreground">Watch Time</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium">
                        {user.stats.partiesHosted * 10 +
                          user.stats.friendsCount * 2 +
                          Math.round(user.stats.watchTime / 10)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Community Dialog */}
      <Dialog open={createCommunityOpen} onOpenChange={setCreateCommunityOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Community</DialogTitle>
            <DialogDescription>Start a new community for like-minded users</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="community-name">Community Name</Label>
              <Input id="community-name" placeholder="Enter community name" />
            </div>

            <div>
              <Label htmlFor="community-description">Description</Label>
              <Textarea id="community-description" placeholder="Describe your community" />
            </div>

            <div>
              <Label htmlFor="community-category">Category</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="genre">Genre</SelectItem>
                  <SelectItem value="language">Language</SelectItem>
                  <SelectItem value="region">Region</SelectItem>
                  <SelectItem value="hobby">Hobby</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="community-tags">Tags (comma-separated)</Label>
              <Input id="community-tags" placeholder="horror, thriller, suspense" />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="private-community">Private Community</Label>
              <Switch id="private-community" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateCommunityOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setCreateCommunityOpen(false)}>Create Community</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Activity</DialogTitle>
            <DialogDescription>Share this activity with your friends</DialogDescription>
          </DialogHeader>

          {selectedActivity && (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                <p>{selectedActivity.content}</p>
              </div>

              <div>
                <Label htmlFor="share-message">Add a message (optional)</Label>
                <Textarea id="share-message" placeholder="What do you think about this?" />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShareDialogOpen(false)}>Share</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
