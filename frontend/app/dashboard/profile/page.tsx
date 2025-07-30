"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { usersAPI } from "@/lib/api"
import {
  User as UserIcon,
  Edit,
  Camera,
  Trophy,
  Clock,
  Users,
  Video,
  Play,
  Heart,
  Star,
  MapPin,
  Calendar,
  Mail,
  Settings,
  Crown,
  ArrowLeft,
  Loader2,
} from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"
import Link from "next/link"

interface UserProfile {
  id: string
  first_name: string
  last_name: string
  username: string
  email: string
  avatar?: string
  bio?: string
  location?: string
  website?: string
  is_premium: boolean
  date_joined: string
  last_login?: string
  profile: {
    timezone: string
    language: string
    notification_preferences: {
      email_notifications: boolean
      friend_requests: boolean
    }
    social_links: {
      twitter?: string
      instagram?: string
    }
    privacy_settings: {
      profile_visibility: 'public' | 'friends' | 'private'
      allow_friend_requests: boolean
    }
  }
}

interface UserStats {
  total_watch_time: number
  videos_watched: number
  parties_joined: number
  friends_count: number
  achievements_unlocked: number
}

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlocked_at?: string
  progress?: number
  total_required?: number
}

interface WatchHistoryItem {
  id: string
  video: {
    id: string
    title: string
    thumbnail?: string
    duration: number
  }
  watched_at: string
  progress: number
  completed: boolean
}

export default function ProfilePage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [watchHistory, setWatchHistory] = useState<WatchHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    loadProfileData()
  }, [])

  const loadProfileData = async () => {
    try {
      setIsLoading(true)
      
      // Load profile data
      const [profileData, statsData, achievementsData, historyData] = await Promise.all([
        usersAPI.getProfile(),
        usersAPI.getStats(),
        usersAPI.getAchievements(),
        usersAPI.getWatchHistory({ page: 1 })
      ])

      setProfile(profileData as unknown as UserProfile)
      setStats(statsData)
      setAchievements(achievementsData)
      // Fix the thumbnail and duration type mismatches
      const fixedHistoryData = (historyData.results || []).map(item => ({
        ...item,
        video: {
          ...item.video,
          thumbnail: item.video.thumbnail || undefined,
          duration: typeof item.video.duration === 'string' ? parseInt(item.video.duration) || 0 : item.video.duration || 0
        }
      }))
      setWatchHistory(fixedHistoryData)
    } catch (error) {
      console.error("Failed to load profile data:", error)
      toast({
        title: "Error",
        description: "Failed to load profile data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const uploadAvatar = async (file: File) => {
    try {
      const response = await usersAPI.uploadAvatar(file)
      setProfile(prev => prev ? { ...prev, avatar: response.avatar_url } : null)
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully.",
      })
    } catch (error) {
      console.error("Failed to upload avatar:", error)
      toast({
        title: "Error",
        description: "Failed to upload avatar. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        })
        return
      }
      uploadAvatar(file)
    }
  }

  const getUserInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  }

  const formatWatchTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`
    }
    return `${remainingMinutes}m`
  }

  const getAchievementProgress = (achievement: Achievement) => {
    if (!achievement.progress || !achievement.total_required) return 100
    return (achievement.progress / achievement.total_required) * 100
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <UserIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Profile not found</h2>
          <p className="text-muted-foreground mb-4">
            We couldn't load your profile information.
          </p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => router.back()} className="p-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <UserIcon className="h-8 w-8" />
              My Profile
            </h1>
            <p className="text-muted-foreground mt-2">Manage your profile and view your activity</p>
          </div>
          <Link href="/dashboard/profile/edit">
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </Link>
        </div>

        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={profile.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="text-2xl">
                    {getUserInitials(profile.first_name, profile.last_name)}
                  </AvatarFallback>
                </Avatar>
                <label className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary/90 transition-colors">
                  <Camera className="h-4 w-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold">
                    {profile.first_name} {profile.last_name}
                  </h2>
                  {profile.is_premium && (
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                      <Crown className="h-3 w-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </div>
                
                <p className="text-muted-foreground mb-3">@{profile.username}</p>
                
                {profile.bio && (
                  <p className="text-gray-700 mb-4">{profile.bio}</p>
                )}

                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  {profile.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {profile.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Joined {format(new Date(profile.date_joined), "MMMM yyyy")}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {profile.email}
                  </span>
                  {profile.last_login && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Last active {formatDistanceToNow(new Date(profile.last_login), { addSuffix: true })}
                    </span>
                  )}
                </div>
              </div>

              <Link href="/dashboard/profile/edit">
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-bold">{formatWatchTime(stats.total_watch_time)}</div>
                <p className="text-sm text-muted-foreground">Watch Time</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Video className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <div className="text-2xl font-bold">{stats.videos_watched}</div>
                <p className="text-sm text-muted-foreground">Videos Watched</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                <div className="text-2xl font-bold">{stats.parties_joined}</div>
                <p className="text-sm text-muted-foreground">Parties Joined</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Heart className="h-8 w-8 mx-auto mb-2 text-red-500" />
                <div className="text-2xl font-bold">{stats.friends_count}</div>
                <p className="text-sm text-muted-foreground">Friends</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                <div className="text-2xl font-bold">{stats.achievements_unlocked}</div>
                <p className="text-sm text-muted-foreground">Achievements</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Profile Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="achievements">
              Achievements
              {achievements.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {achievements.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="history">Watch History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="space-y-6">
              {/* Recent Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Recent Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {achievements.slice(0, 3).length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      No achievements unlocked yet. Keep watching to earn your first achievement!
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {achievements.slice(0, 3).map((achievement) => (
                        <div key={achievement.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                          <div className="text-2xl">{achievement.icon}</div>
                          <div className="flex-1">
                            <h4 className="font-semibold">{achievement.name}</h4>
                            <p className="text-sm text-muted-foreground">{achievement.description}</p>
                            {achievement.unlocked_at && (
                              <p className="text-xs text-muted-foreground">
                                Unlocked {formatDistanceToNow(new Date(achievement.unlocked_at), { addSuffix: true })}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Watch History */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="h-5 w-5 text-blue-500" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {watchHistory.slice(0, 5).length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      No recent activity. Start watching videos to see your history here!
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {watchHistory.slice(0, 5).map((item) => (
                        <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                          <img
                            src={item.video.thumbnail || "/placeholder.svg"}
                            alt={item.video.title}
                            className="w-16 h-10 object-cover rounded"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium line-clamp-1">{item.video.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Progress value={item.progress} className="flex-1 h-2" />
                              <span className="text-xs text-muted-foreground">
                                {Math.round(item.progress)}%
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Watched {formatDistanceToNow(new Date(item.watched_at), { addSuffix: true })}
                            </p>
                          </div>
                          {item.completed && (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              <Star className="h-3 w-3 mr-1" />
                              Completed
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  All Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                {achievements.length === 0 ? (
                  <div className="text-center py-12">
                    <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No achievements yet</h3>
                    <p className="text-muted-foreground">
                      Start watching videos and joining parties to unlock achievements!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {achievements.map((achievement) => (
                      <div key={achievement.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                        <div className="text-center mb-3">
                          <div className="text-4xl mb-2">{achievement.icon}</div>
                          <h4 className="font-semibold">{achievement.name}</h4>
                          <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        </div>
                        
                        {achievement.progress !== undefined && achievement.total_required && !achievement.unlocked_at && (
                          <div className="space-y-2">
                            <Progress value={getAchievementProgress(achievement)} className="h-2" />
                            <p className="text-xs text-center text-muted-foreground">
                              {achievement.progress} / {achievement.total_required}
                            </p>
                          </div>
                        )}
                        
                        {achievement.unlocked_at && (
                          <Badge variant="outline" className="w-full justify-center bg-green-50 text-green-700 border-green-200">
                            Unlocked {formatDistanceToNow(new Date(achievement.unlocked_at), { addSuffix: true })}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  Watch History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {watchHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <Play className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No watch history</h3>
                    <p className="text-muted-foreground">
                      Your viewing history will appear here as you watch videos.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {watchHistory.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow">
                        <img
                          src={item.video.thumbnail || "/placeholder.svg"}
                          alt={item.video.title}
                          className="w-20 h-12 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium line-clamp-2">{item.video.title}</h4>
                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center gap-2 flex-1">
                              <Progress value={item.progress} className="flex-1 h-2" />
                              <span className="text-sm text-muted-foreground">
                                {Math.round(item.progress)}%
                              </span>
                            </div>
                            {item.completed && (
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                <Star className="h-3 w-3 mr-1" />
                                Completed
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Watched {formatDistanceToNow(new Date(item.watched_at), { addSuffix: true })}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          <Play className="h-4 w-4 mr-2" />
                          Continue
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}