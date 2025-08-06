"use client"

import { useState, useEffect } from "react"
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
import { toast } from "@/hooks/use-toast"
import { api } from "@/lib/api/client"
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
  stats: {
    partiesHosted: number
    partiesJoined: number
    friendsCount: number
    watchTime: number
  }
}

interface Community {
  id: string
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
  metadata?: any
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

const mockUsers: User[] = [
  {
    id: "1",
    username: "moviebuff2024",
    displayName: "Alex Chen",
    avatar: "/placeholder-user.jpg",
    isOnline: true,
    lastSeen: "now",
    mutualFriends: 12,
    commonInterests: ["Action Movies", "Sci-Fi", "Horror"],
    location: "San Francisco, CA",
    joinedDate: "2023-06-15",
    stats: {
      partiesHosted: 45,
      partiesJoined: 128,
      friendsCount: 89,
      watchTime: 2400,
    },
  },
  {
    id: "2",
    username: "cinephile_sarah",
    displayName: "Sarah Johnson",
    avatar: "/placeholder-user.jpg",
    isOnline: false,
    lastSeen: "2 hours ago",
    mutualFriends: 8,
    commonInterests: ["Documentaries", "Foreign Films", "Indie"],
    location: "New York, NY",
    joinedDate: "2023-03-22",
    stats: {
      partiesHosted: 23,
      partiesJoined: 67,
      friendsCount: 156,
      watchTime: 1800,
    },
  },
]

const mockCommunities: Community[] = [
  {
    id: "1",
    name: "Horror Movie Enthusiasts",
    description: "For fans of spine-chilling horror films and thrillers",
    memberCount: 2847,
    category: "Genre",
    isPrivate: false,
    avatar: "/placeholder.svg?height=40&width=40&text=HME",
    tags: ["Horror", "Thriller", "Suspense"],
    createdBy: "horror_master",
    createdAt: "2023-01-15",
    recentActivity: "New discussion: Best Horror Films of 2024",
  },
  {
    id: "2",
    name: "Anime Watch Parties",
    description: "Weekly anime watch parties and discussions",
    memberCount: 5632,
    category: "Genre",
    isPrivate: false,
    avatar: "/placeholder.svg?height=40&width=40&text=AWP",
    tags: ["Anime", "Manga", "Japanese Culture"],
    createdBy: "otaku_leader",
    createdAt: "2022-11-08",
    recentActivity: "Scheduled: Attack on Titan finale watch party",
  },
]

const mockActivityFeed: ActivityFeedItem[] = [
  {
    id: "1",
    type: "party_created",
    user: mockUsers[0],
    content: "Created a new watch party for 'Dune: Part Two'",
    timestamp: "2024-01-28T14:30:00Z",
    likes: 24,
    comments: 8,
    isLiked: false,
    metadata: { partyId: "party123", movieTitle: "Dune: Part Two" },
  },
  {
    id: "2",
    type: "achievement_earned",
    user: mockUsers[1],
    content: "Earned the 'Social Butterfly' achievement for making 100 friends!",
    timestamp: "2024-01-28T13:15:00Z",
    likes: 67,
    comments: 15,
    isLiked: true,
    metadata: { achievementId: "social_butterfly" },
  },
]

const mockAchievements: Achievement[] = [
  {
    id: "1",
    name: "First Steps",
    description: "Join your first watch party",
    icon: "🎬",
    category: "milestone",
    rarity: "common",
    progress: 1,
    maxProgress: 1,
    unlockedAt: "2024-01-15T10:00:00Z",
    reward: { type: "badge", value: "Newcomer" },
  },
  {
    id: "2",
    name: "Social Butterfly",
    description: "Make 100 friends on the platform",
    icon: "🦋",
    category: "social",
    rarity: "rare",
    progress: 89,
    maxProgress: 100,
    reward: { type: "title", value: "Social Butterfly" },
  },
  {
    id: "3",
    name: "Movie Marathon Master",
    description: "Host 50 watch parties",
    icon: "🏆",
    category: "content",
    rarity: "epic",
    progress: 23,
    maxProgress: 50,
    reward: { type: "feature", value: "Custom Party Themes" },
  },
]

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
      // Fetch social data from API
      const [friendsData, communitiesData, activityData, achievementsData] = await Promise.all([
        api.users.getFriends(),
        // Mock API calls for now - these would be actual API endpoints
        Promise.resolve({ results: [] }),
        Promise.resolve({ results: [] }),
        Promise.resolve({ results: [] })
      ])

      // Transform API data to component format
      const transformedUsers: User[] = (friendsData.results || []).map((friend: any) => ({
        id: friend.id,
        username: friend.username,
        displayName: friend.display_name || friend.username,
        avatar: friend.avatar_url || '/placeholder-user.jpg',
        isOnline: friend.is_online || false,
        lastSeen: friend.last_seen || new Date().toISOString(),
        mutualFriends: friend.mutual_friends_count || 0,
        commonInterests: friend.common_interests || [],
        location: friend.location,
        joinedDate: friend.created_at,
        stats: {
          partiesHosted: friend.stats?.parties_hosted || 0,
          partiesJoined: friend.stats?.parties_joined || 0,
          friendsCount: friend.stats?.friends_count || 0,
          watchTime: friend.stats?.watch_time || 0,
        }
      })) || []

      const transformedCommunities: Community[] = (communitiesData.results || []).map((community: any) => ({
        id: community.id,
        name: community.name,
        description: community.description,
        memberCount: community.member_count,
        category: community.category,
        isPrivate: community.is_private,
        avatar: community.avatar_url || '/placeholder.jpg',
        tags: community.tags || [],
        createdBy: community.creator?.username || 'Unknown',
        createdAt: community.created_at,
        recentActivity: community.recent_activity || 'No recent activity'
      })) || []

      const transformedActivityFeed: ActivityFeedItem[] = (activityData.results || []).map((activity: any) => ({
        id: activity.id,
        type: activity.activity_type,
        user: {
          id: activity.user.id,
          username: activity.user.username,
          displayName: activity.user.display_name || activity.user.username,
          avatar: activity.user.avatar_url || '/placeholder-user.jpg',
          isOnline: activity.user.is_online || false,
          lastSeen: activity.user.last_seen || new Date().toISOString(),
          mutualFriends: 0,
          commonInterests: [],
          joinedDate: activity.user.created_at,
          stats: {
            partiesHosted: 0,
            partiesJoined: 0,
            friendsCount: 0,
            watchTime: 0,
          }
        },
        content: activity.content,
        timestamp: activity.created_at,
        likes: activity.like_count || 0,
        comments: activity.comment_count || 0,
        isLiked: activity.is_liked || false,
        metadata: activity.metadata
      })) || []

      const transformedAchievements: Achievement[] = (achievementsData.results || []).map((achievement: any) => ({
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon || 'trophy',
        category: achievement.category,
        rarity: achievement.rarity,
        progress: achievement.progress,
        maxProgress: achievement.max_progress,
        unlockedAt: achievement.unlocked_at,
        reward: {
          type: achievement.reward?.type || 'badge',
          value: achievement.reward?.value || 'Achievement Badge'
        }
      })) || []

      setUsers(transformedUsers)
      setCommunities(transformedCommunities)
      setActivityFeed(transformedActivityFeed)
      setAchievements(transformedAchievements)
    } catch (error) {
      console.error('Failed to fetch social data:', error)
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

  const handleFollowUser = (userId: string) => {
    // Implement follow user logic
    console.log("Following user:", userId)
  }

  const handleJoinCommunity = (communityId: string) => {
    setCommunities((prev) =>
      prev.map((community) =>
        community.id === communityId ? { ...community, memberCount: community.memberCount + 1 } : community,
      ),
    )
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

  const filteredUsers = users.filter(
    (user) =>
      searchQuery === "" ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.displayName.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredCommunities = communities.filter((community) => {
    const matchesSearch =
      searchQuery === "" ||
      community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      community.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || community.category.toLowerCase() === selectedCategory
    return matchesSearch && matchesCategory
  })

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

                      <Button className="w-full" onClick={() => handleFollowUser(user.id)}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add Friend
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
                      <SelectItem value="genre">Genre</SelectItem>
                      <SelectItem value="language">Language</SelectItem>
                      <SelectItem value="region">Region</SelectItem>
                      <SelectItem value="hobby">Hobby</SelectItem>
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
                      {index > 2 && <span className="text-sm font-medium">#{index + 1}</span>}
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
