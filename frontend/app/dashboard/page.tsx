"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Play, Users, VideoIcon, Clock, TrendingUp, Plus, ArrowRight, Crown, Loader2 } from "lucide-react"
import {
  WatchPartyCard,
  WatchPartyCardContent,
  WatchPartyCardDescription,
  WatchPartyCardHeader,
  WatchPartyCardTitle,
} from "@/components/ui/watch-party-card"
import { WatchPartyButton } from "@/components/ui/watch-party-button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

interface DashboardStats {
  total_parties: number
  parties_hosted: number
  parties_joined: number
  total_videos: number
  watch_time_hours: number
  friends_count: number
  recent_activity: {
    parties_this_week: number
    videos_uploaded_this_week: number
    watch_time_this_week: number
  }
}

interface Party {
  id: string
  title: string
  participant_count: number
  status: string
  thumbnail?: string
  host: {
    name: string
    avatar?: string
  }
  started_at?: string
  scheduled_start?: string
}

interface Video {
  id: string
  title: string
  duration_formatted: string
  view_count: number
  thumbnail?: string
  created_at: string
}

interface Activity {
  id: string
  user: {
    name: string
    avatar?: string
  }
  action: string
  content: string
  timestamp: string
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentParties, setRecentParties] = useState<Party[]>([])
  const [recentVideos, setRecentVideos] = useState<Video[]>([])
  const [friendActivity, setFriendActivity] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        const token = localStorage.getItem("access_token")

        // Fetch dashboard stats
        try {
          const statsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/dashboard/stats/`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          if (statsResponse.ok) {
            const statsData = await statsResponse.json()
            console.log("Dashboard stats received:", statsData)
            setStats(statsData)
          } else {
            console.warn("Dashboard stats API failed:", statsResponse.status, statsResponse.statusText)
          }
        } catch (error) {
          console.error("Failed to fetch dashboard stats:", error)
        }

        // Fetch recent parties
        try {
          const partiesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/parties/?limit=5&ordering=-created_at`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          if (partiesResponse.ok) {
            const partiesData = await partiesResponse.json()
            setRecentParties(partiesData.results || [])
          } else {
            console.warn("Parties API failed:", partiesResponse.status, partiesResponse.statusText)
          }
        } catch (error) {
          console.error("Failed to fetch parties:", error)
        }

        // Fetch recent videos
        try {
          const videosResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/videos/?limit=4&ordering=-created_at`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          if (videosResponse.ok) {
            const videosData = await videosResponse.json()
            setRecentVideos(videosData.results || [])
          } else {
            console.warn("Videos API failed:", videosResponse.status, videosResponse.statusText)
          }
        } catch (error) {
          console.error("Failed to fetch videos:", error)
        }

        // Fetch friend activity
        try {
          const activityResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/activities/?limit=10`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          if (activityResponse.ok) {
            const activityData = await activityResponse.json()
            setFriendActivity(activityData.activities || [])
          } else {
            console.warn("Activity API failed:", activityResponse.status, activityResponse.statusText)
          }
        } catch (error) {
          console.error("Failed to fetch activity:", error)
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [toast])

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 60) {
      return `${diffMins} minutes ago`
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`
    } else {
      return `${diffDays} days ago`
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-watch-party-bg flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-watch-party-primary mx-auto mb-4" />
          <p className="text-watch-party-text-secondary">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-watch-party-bg">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="animate-slide-in-cinema">
            <h1 className="text-3xl lg:text-4xl font-bold text-watch-party-text-primary mb-2">
              Welcome back, {user?.first_name || "User"}! 👋
            </h1>
            <p className="text-watch-party-text-secondary text-lg">
              Here's what's happening with your watch parties and videos
            </p>
          </div>
          <div className="flex items-center gap-3">
            {user?.is_premium && (
              <Badge className="bg-watch-party-gradient text-white animate-glow-pulse">
                <Crown className="w-3 h-3 mr-1" />
                Premium
              </Badge>
            )}
            <WatchPartyButton variant="gradient" size="lg" className="shadow-watch-party-glow">
              <Plus className="w-4 h-4" />
              Create Party
            </WatchPartyButton>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <WatchPartyCard className="hover:shadow-watch-party-glow transition-all duration-300 animate-slide-in-cinema">
            <WatchPartyCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <WatchPartyCardTitle className="text-sm font-medium">Total Videos</WatchPartyCardTitle>
              <VideoIcon className="h-4 w-4 text-watch-party-secondary" />
            </WatchPartyCardHeader>
            <WatchPartyCardContent>
              <div className="text-2xl font-bold text-watch-party-text-primary">{stats?.total_videos || 0}</div>
              <p className="text-xs text-watch-party-text-secondary">
                <span className="text-watch-party-success">
                  +{stats?.recent_activity?.videos_uploaded_this_week || 0}
                </span>{" "}
                this week
              </p>
            </WatchPartyCardContent>
          </WatchPartyCard>

          <WatchPartyCard className="hover:shadow-watch-party-glow transition-all duration-300 animate-slide-in-cinema">
            <WatchPartyCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <WatchPartyCardTitle className="text-sm font-medium">Watch Parties</WatchPartyCardTitle>
              <Users className="h-4 w-4 text-watch-party-secondary" />
            </WatchPartyCardHeader>
            <WatchPartyCardContent>
              <div className="text-2xl font-bold text-watch-party-text-primary">{stats?.total_parties || 0}</div>
              <p className="text-xs text-watch-party-text-secondary">
                <span className="text-watch-party-success">+{stats?.recent_activity?.parties_this_week || 0}</span> this
                week
              </p>
            </WatchPartyCardContent>
          </WatchPartyCard>

          <WatchPartyCard className="hover:shadow-watch-party-glow transition-all duration-300 animate-slide-in-cinema">
            <WatchPartyCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <WatchPartyCardTitle className="text-sm font-medium">Friends</WatchPartyCardTitle>
              <Users className="h-4 w-4 text-watch-party-secondary" />
            </WatchPartyCardHeader>
            <WatchPartyCardContent>
              <div className="text-2xl font-bold text-watch-party-text-primary">{stats?.friends_count || 0}</div>
              <p className="text-xs text-watch-party-text-secondary">Total friends</p>
            </WatchPartyCardContent>
          </WatchPartyCard>

          <WatchPartyCard className="hover:shadow-watch-party-glow transition-all duration-300 animate-slide-in-cinema">
            <WatchPartyCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <WatchPartyCardTitle className="text-sm font-medium">Watch Time</WatchPartyCardTitle>
              <Clock className="h-4 w-4 text-watch-party-secondary" />
            </WatchPartyCardHeader>
            <WatchPartyCardContent>
              <div className="text-2xl font-bold text-watch-party-text-primary">{stats?.watch_time_hours || 0}h</div>
              <p className="text-xs text-watch-party-text-secondary">
                <span className="text-watch-party-success">+{stats?.recent_activity?.watch_time_this_week || 0}h</span>{" "}
                this week
              </p>
            </WatchPartyCardContent>
          </WatchPartyCard>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Watch Parties */}
          <WatchPartyCard className="lg:col-span-2 hover:shadow-watch-party-glow transition-all duration-300">
            <WatchPartyCardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <WatchPartyCardTitle className="text-xl">Recent Watch Parties</WatchPartyCardTitle>
                  <WatchPartyCardDescription>Your latest streaming sessions</WatchPartyCardDescription>
                </div>
                <WatchPartyButton variant="ghost" size="sm" asChild>
                  <Link href="/dashboard/parties">
                    View all
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </WatchPartyButton>
              </div>
            </WatchPartyCardHeader>
            <WatchPartyCardContent className="space-y-4">
              {recentParties.length > 0 ? (
                recentParties.map((party) => (
                  <div
                    key={party.id}
                    className="flex items-center space-x-4 p-4 rounded-lg bg-watch-party-elevation-1 hover:bg-watch-party-surface transition-colors duration-200"
                  >
                    <div className="relative">
                      <img
                        src={party.thumbnail || "/placeholder.svg?height=48&width=80"}
                        alt={party.title}
                        className="w-20 h-12 rounded object-cover"
                      />
                      {party.status === "live" && (
                        <Badge className="absolute -top-1 -right-1 bg-watch-party-error text-white text-xs animate-glow-pulse">
                          LIVE
                        </Badge>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-watch-party-text-primary">{party.title}</h4>
                      <div className="flex items-center space-x-4 text-sm text-watch-party-text-secondary mt-1">
                        <div className="flex items-center">
                          <Avatar className="w-4 h-4 mr-1">
                            <AvatarImage src={party.host.avatar || "/placeholder.svg?height=16&width=16"} />
                            <AvatarFallback className="text-xs">{party.host.name[0]}</AvatarFallback>
                          </Avatar>
                          {party.host.name}
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {party.participant_count}
                        </div>
                        <span>
                          {party.started_at
                            ? formatTimeAgo(party.started_at)
                            : party.scheduled_start
                              ? formatTimeAgo(party.scheduled_start)
                              : "Unknown"}
                        </span>
                      </div>
                    </div>
                    <WatchPartyButton size="sm" variant={party.status === "live" ? "glow" : "secondary"} asChild>
                      <Link href={`/watch/${party.id}`}>{party.status === "live" ? "Join" : "View"}</Link>
                    </WatchPartyButton>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-watch-party-text-secondary mb-4">No recent parties</p>
                  <WatchPartyButton variant="gradient" asChild>
                    <Link href="/dashboard/parties/create">Create Your First Party</Link>
                  </WatchPartyButton>
                </div>
              )}
            </WatchPartyCardContent>
          </WatchPartyCard>

          {/* Friend Activity */}
          <WatchPartyCard className="hover:shadow-watch-party-glow transition-all duration-300">
            <WatchPartyCardHeader>
              <WatchPartyCardTitle className="text-xl">Friend Activity</WatchPartyCardTitle>
              <WatchPartyCardDescription>See what your friends are watching</WatchPartyCardDescription>
            </WatchPartyCardHeader>
            <WatchPartyCardContent className="space-y-4">
              {friendActivity.length > 0 ? (
                friendActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={activity.user.avatar || "/placeholder.svg?height=32&width=32"} />
                      <AvatarFallback>{activity.user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-watch-party-text-primary">
                        <span className="font-medium">{activity.user.name}</span>{" "}
                        <span className="text-watch-party-text-secondary">{activity.action}</span>{" "}
                        <span className="font-medium">{activity.content}</span>
                      </p>
                      <p className="text-xs text-watch-party-text-secondary mt-1">
                        {formatTimeAgo(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-watch-party-text-secondary">No recent activity</p>
                </div>
              )}
              <WatchPartyButton variant="ghost" className="w-full text-sm">
                View all activity
              </WatchPartyButton>
            </WatchPartyCardContent>
          </WatchPartyCard>
        </div>

        {/* Recent Videos */}
        <WatchPartyCard className="hover:shadow-watch-party-glow transition-all duration-300">
          <WatchPartyCardHeader>
            <div className="flex items-center justify-between">
              <div>
                <WatchPartyCardTitle className="text-xl">Your Recent Videos</WatchPartyCardTitle>
                <WatchPartyCardDescription>Videos you've uploaded recently</WatchPartyCardDescription>
              </div>
              <WatchPartyButton variant="ghost" size="sm" asChild>
                <Link href="/dashboard/videos">
                  View all
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </WatchPartyButton>
            </div>
          </WatchPartyCardHeader>
          <WatchPartyCardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentVideos.length > 0 ? (
                recentVideos.map((video) => (
                  <div key={video.id} className="group cursor-pointer">
                    <div className="relative">
                      <img
                        src={video.thumbnail || "/placeholder.svg?height=128&width=192"}
                        alt={video.title}
                        className="w-full h-32 rounded-lg object-cover group-hover:opacity-80 transition-opacity"
                      />
                      <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                        {video.duration_formatted}
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-8 h-8 text-white shadow-watch-party-glow" />
                      </div>
                    </div>
                    <div className="mt-2">
                      <h4 className="font-medium text-sm truncate text-watch-party-text-primary">{video.title}</h4>
                      <div className="flex items-center justify-between text-xs text-watch-party-text-secondary mt-1">
                        <span>{video.view_count} views</span>
                        <span>{formatTimeAgo(video.created_at)}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-watch-party-text-secondary mb-4">No videos uploaded yet</p>
                  <WatchPartyButton variant="gradient" asChild>
                    <Link href="/dashboard/videos">Upload Your First Video</Link>
                  </WatchPartyButton>
                </div>
              )}
            </div>
          </WatchPartyCardContent>
        </WatchPartyCard>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <WatchPartyCard className="bg-gradient-to-br from-watch-party-primary/10 to-watch-party-primary/5 hover:shadow-watch-party-glow transition-all cursor-pointer group">
            <WatchPartyCardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-watch-party-gradient rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:shadow-watch-party-glow transition-all">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2 text-watch-party-text-primary">Create Watch Party</h3>
              <p className="text-sm text-watch-party-text-secondary mb-4">
                Start a new synchronized viewing session with friends
              </p>
              <WatchPartyButton variant="gradient" className="w-full">
                Get Started
              </WatchPartyButton>
            </WatchPartyCardContent>
          </WatchPartyCard>

          <WatchPartyCard className="bg-gradient-to-br from-watch-party-success/10 to-watch-party-success/5 hover:shadow-watch-party-glow transition-all cursor-pointer group">
            <WatchPartyCardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-watch-party-success rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:shadow-watch-party-glow transition-all">
                <VideoIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2 text-watch-party-text-primary">Upload Video</h3>
              <p className="text-sm text-watch-party-text-secondary mb-4">
                Add new videos from multiple sources and platforms
              </p>
              <WatchPartyButton variant="success" className="w-full">
                Upload Now
              </WatchPartyButton>
            </WatchPartyCardContent>
          </WatchPartyCard>

          <WatchPartyCard className="bg-gradient-to-br from-watch-party-secondary/10 to-watch-party-secondary/5 hover:shadow-watch-party-glow transition-all cursor-pointer group">
            <WatchPartyCardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-watch-party-secondary rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:shadow-watch-party-glow transition-all">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2 text-watch-party-text-primary">View Analytics</h3>
              <p className="text-sm text-watch-party-text-secondary mb-4">
                Track your video performance and engagement metrics
              </p>
              <WatchPartyButton variant="secondary" className="w-full">
                View Stats
              </WatchPartyButton>
            </WatchPartyCardContent>
          </WatchPartyCard>
        </div>
      </div>
    </div>
  )
}
