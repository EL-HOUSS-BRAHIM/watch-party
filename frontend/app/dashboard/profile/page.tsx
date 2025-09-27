"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  User,
  Mail,
  MapPin,
  Calendar,
  Globe,
  Edit,
  Settings,
  Trophy,
  Play,
  Users,
  Clock,
  Star,
  Heart,
  Share2,
  Eye,
  EyeOff,
  Award,
  Zap,
  Target,
  TrendingUp,
  Activity,
  Film,
  Sparkles,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface UserProfile {
  id: string
  username: string
  email: string
  displayName: string
  bio: string
  avatar: string
  coverImage: string
  location: string
  website: string
  birthDate: string
  joinDate: string
  isPublic: boolean
  showEmail: boolean
  showLocation: boolean
  showBirthDate: boolean
  stats: {
    watchParties: number
    hoursWatched: number
    friendsCount: number
    achievementsCount: number
    favoriteMovies: number
    totalRatings: number
    averageRating: number
    streakDays: number
  }
  recentActivity: Array<{
    id: string
    type: "party" | "rating" | "friend" | "achievement"
    title: string
    description: string
    timestamp: string
    icon: string
  }>
  achievements: Array<{
    id: string
    name: string
    description: string
    icon: string
    unlockedAt: string
    rarity: "common" | "rare" | "epic" | "legendary"
  }>
  favoriteGenres: Array<{
    name: string
    count: number
    percentage: number
  }>
}

export default function ProfilePage() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch("/api/users/profile/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data)
      } else {
        throw new Error("Failed to fetch profile")
      }
    } catch (error) {
      console.error("Profile fetch error:", error)
      toast({
        title: "Error",
        description: "Failed to load profile data.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getRarityColor = (rarity: string): string => {
    switch (rarity) {
      case "common":
        return "text-gray-400 border-gray-400/30"
      case "rare":
        return "text-blue-400 border-blue-400/30"
      case "epic":
        return "text-purple-400 border-purple-400/30"
      case "legendary":
        return "text-yellow-400 border-yellow-400/30"
      default:
        return "text-gray-400 border-gray-400/30"
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "party":
        return Play
      case "rating":
        return Star
      case "friend":
        return Users
      case "achievement":
        return Trophy
      default:
        return Activity
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="glass-card p-8 rounded-2xl border border-white/20">
            <div className="animate-pulse space-y-6">
              <div className="h-48 bg-white/10 rounded-lg"></div>
              <div className="flex items-center space-x-4">
                <div className="w-24 h-24 bg-white/10 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-6 bg-white/10 rounded w-48"></div>
                  <div className="h-4 bg-white/10 rounded w-32"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-6xl mx-auto">
          <Card className="glass-card border-red-500/30 bg-red-500/10">
            <CardContent className="p-6 text-center">
              <p className="text-red-400">Failed to load profile data.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card className="glass-card border-white/20 bg-white/5 overflow-hidden">
          {/* Cover Image */}
          <div className="relative h-48 bg-gradient-to-r from-purple-500/20 to-pink-500/20">
            {profile.coverImage && (
              <Image src={profile.coverImage || "/placeholder.svg"} alt="Cover" fill className="object-cover" />
            )}
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute top-4 right-4">
              <Link href="/dashboard/profile/edit">
                <Button size="sm" className="bg-black/50 hover:bg-black/70 text-white">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </Link>
            </div>
          </div>

          {/* Profile Info */}
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6 -mt-16 md:-mt-12">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 p-1">
                  <div className="w-full h-full rounded-full overflow-hidden bg-slate-800">
                    {profile.avatar ? (
                      <Image
                        src={profile.avatar || "/placeholder.svg"}
                        alt={profile.displayName}
                        width={128}
                        height={128}
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <User className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>
                {profile.isPublic ? (
                  <Badge className="absolute -bottom-2 -right-2 bg-green-500/20 text-green-300 border-green-500/30">
                    <Eye className="w-3 h-3 mr-1" />
                    Public
                  </Badge>
                ) : (
                  <Badge className="absolute -bottom-2 -right-2 bg-orange-500/20 text-orange-300 border-orange-500/30">
                    <EyeOff className="w-3 h-3 mr-1" />
                    Private
                  </Badge>
                )}
              </div>

              {/* Profile Details */}
              <div className="flex-1 space-y-3">
                <div>
                  <h1 className="text-3xl font-bold text-white">{profile.displayName}</h1>
                  <p className="text-purple-300">@{profile.username}</p>
                </div>

                {profile.bio && <p className="text-gray-300 max-w-2xl">{profile.bio}</p>}

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                  {profile.showEmail && profile.email && (
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      {profile.email}
                    </div>
                  )}
                  {profile.showLocation && profile.location && (
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      {profile.location}
                    </div>
                  )}
                  {profile.website && (
                    <div className="flex items-center">
                      <Globe className="w-4 h-4 mr-2" />
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-300 hover:text-purple-200 transition-colors"
                      >
                        Website
                      </a>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Joined {formatDate(profile.joinDate)}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="flex flex-wrap gap-6 pt-2">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{profile.stats.watchParties}</div>
                    <div className="text-xs text-gray-400">Watch Parties</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{profile.stats.friendsCount}</div>
                    <div className="text-xs text-gray-400">Friends</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{profile.stats.hoursWatched}</div>
                    <div className="text-xs text-gray-400">Hours Watched</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{profile.stats.achievementsCount}</div>
                    <div className="text-xs text-gray-400">Achievements</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col space-y-2">
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Profile
                </Button>
                <Link href="/dashboard/settings">
                  <Button
                    variant="outline"
                    className="glass-card border-white/20 hover:border-purple-500/50 text-white bg-transparent"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="glass-card border border-white/20 bg-white/5 p-1">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300"
            >
              <Activity className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="stats"
              className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Statistics
            </TabsTrigger>
            <TabsTrigger
              value="achievements"
              className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Achievements
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300"
            >
              <Clock className="w-4 h-4 mr-2" />
              Activity
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Stats Cards */}
              <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="glass-card border-white/20 bg-white/5">
                    <CardContent className="p-4 text-center">
                      <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Play className="w-6 h-6 text-purple-400" />
                      </div>
                      <div className="text-2xl font-bold text-white">{profile.stats.watchParties}</div>
                      <div className="text-sm text-gray-400">Watch Parties</div>
                    </CardContent>
                  </Card>

                  <Card className="glass-card border-white/20 bg-white/5">
                    <CardContent className="p-4 text-center">
                      <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Clock className="w-6 h-6 text-blue-400" />
                      </div>
                      <div className="text-2xl font-bold text-white">{profile.stats.hoursWatched}</div>
                      <div className="text-sm text-gray-400">Hours Watched</div>
                    </CardContent>
                  </Card>

                  <Card className="glass-card border-white/20 bg-white/5">
                    <CardContent className="p-4 text-center">
                      <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Users className="w-6 h-6 text-green-400" />
                      </div>
                      <div className="text-2xl font-bold text-white">{profile.stats.friendsCount}</div>
                      <div className="text-sm text-gray-400">Friends</div>
                    </CardContent>
                  </Card>

                  <Card className="glass-card border-white/20 bg-white/5">
                    <CardContent className="p-4 text-center">
                      <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Zap className="w-6 h-6 text-yellow-400" />
                      </div>
                      <div className="text-2xl font-bold text-white">{profile.stats.streakDays}</div>
                      <div className="text-sm text-gray-400">Day Streak</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Favorite Genres */}
                <Card className="glass-card border-white/20 bg-white/5">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Film className="w-5 h-5 mr-2" />
                      Favorite Genres
                    </CardTitle>
                    <CardDescription className="text-gray-400">Your most watched content categories</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {profile.favoriteGenres.map((genre, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-white">{genre.name}</span>
                          <span className="text-gray-400">{genre.count} movies</span>
                        </div>
                        <Progress value={genre.percentage} className="h-2" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Recent Achievements */}
              <div className="space-y-6">
                <Card className="glass-card border-white/20 bg-white/5">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Trophy className="w-5 h-5 mr-2" />
                      Recent Achievements
                    </CardTitle>
                    <CardDescription className="text-gray-400">Your latest unlocked achievements</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {profile.achievements.slice(0, 5).map((achievement) => (
                      <div key={achievement.id} className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                          <Award className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-medium text-sm">{achievement.name}</h4>
                          <p className="text-gray-400 text-xs">{achievement.description}</p>
                        </div>
                        <Badge className={`text-xs ${getRarityColor(achievement.rarity)}`}>{achievement.rarity}</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="glass-card border-white/20 bg-white/5">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Target className="w-5 h-5 mr-2" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Link href="/dashboard/parties/create">
                      <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                        <Play className="w-4 h-4 mr-2" />
                        Create Watch Party
                      </Button>
                    </Link>
                    <Link href="/dashboard/friends">
                      <Button
                        variant="outline"
                        className="w-full glass-card border-white/20 hover:border-blue-500/50 text-white bg-transparent"
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Find Friends
                      </Button>
                    </Link>
                    <Link href="/discover">
                      <Button
                        variant="outline"
                        className="w-full glass-card border-white/20 hover:border-green-500/50 text-white bg-transparent"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Discover Content
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="glass-card border-white/20 bg-white/5">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Star className="w-5 h-5 mr-2" />
                    Rating Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-400">{profile.stats.averageRating.toFixed(1)}</div>
                    <div className="text-sm text-gray-400">Average Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{profile.stats.totalRatings}</div>
                    <div className="text-sm text-gray-400">Total Ratings Given</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-white/20 bg-white/5">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Heart className="w-5 h-5 mr-2" />
                    Favorites
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-400">{profile.stats.favoriteMovies}</div>
                    <div className="text-sm text-gray-400">Favorite Movies</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-white/20 bg-white/5">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Zap className="w-5 h-5 mr-2" />
                    Activity Streak
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400">{profile.stats.streakDays}</div>
                    <div className="text-sm text-gray-400">Days Active</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profile.achievements.map((achievement) => (
                <Card key={achievement.id} className="glass-card border-white/20 bg-white/5">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-white font-medium">{achievement.name}</h3>
                          <Badge className={`text-xs ${getRarityColor(achievement.rarity)}`}>
                            {achievement.rarity}
                          </Badge>
                        </div>
                        <p className="text-gray-400 text-sm mb-2">{achievement.description}</p>
                        <p className="text-xs text-gray-500">Unlocked {formatDate(achievement.unlockedAt)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card className="glass-card border-white/20 bg-white/5">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Recent Activity
                </CardTitle>
                <CardDescription className="text-gray-400">Your latest actions and interactions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.recentActivity.map((activity) => {
                  const IconComponent = getActivityIcon(activity.type)
                  return (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-3 p-3 glass-card rounded-lg border border-white/10"
                    >
                      <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                        <IconComponent className="w-5 h-5 text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-medium">{activity.title}</h4>
                        <p className="text-gray-400 text-sm">{activity.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{formatDate(activity.timestamp)}</p>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
