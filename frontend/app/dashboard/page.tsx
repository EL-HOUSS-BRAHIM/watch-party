"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Play, Users, Video, Clock, TrendingUp, Plus, ArrowRight, Crown, Loader2 } from "lucide-react"
import Link from "next/link"

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
        const token = localStorage.getItem("accessToken")

        // Fetch dashboard stats
        const statsResponse = await fetch("/api/users/dashboard/stats/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setStats(statsData)
        }

        // Fetch recent parties
        const partiesResponse = await fetch("/api/parties/?limit=5&ordering=-created_at", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (partiesResponse.ok) {
          const partiesData = await partiesResponse.json()
          setRecentParties(partiesData.results || [])
        }

        // Fetch recent videos
        const videosResponse = await fetch("/api/videos/?limit=4&ordering=-created_at", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (videosResponse.ok) {
          const videosData = await videosResponse.json()
          setRecentVideos(videosData.results || [])
        }

        // Fetch friend activity
        const activityResponse = await fetch("/api/dashboard/activities/?limit=10", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (activityResponse.ok) {
          const activityData = await activityResponse.json()
          setFriendActivity(activityData.activities || [])
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
      <div className="space-y-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display">Welcome back, {user?.first_name}! 👋</h1>
          <p className="text-muted-foreground mt-2">Here's what's happening with your watch parties and videos</p>
        </div>
        <div className="flex items-center space-x-3">
          {user?.is_premium && (
            <Badge variant="secondary" className="bg-accent-premium/20 text-accent-premium">
              <Crown className="w-3 h-3 mr-1" />
              Premium
            </Badge>
          )}
          <Button className="shadow-glow">
            <Plus className="w-4 h-4 mr-2" />
            Create Party
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Videos</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_videos || 0}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-accent-success">+{stats?.recent_activity.videos_uploaded_this_week || 0}</span> this week
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Watch Parties</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_parties || 0}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-accent-success">+{stats?.recent_activity.parties_this_week || 0}</span> this week
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Friends</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.friends_count || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total friends
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Watch Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.watch_time_hours || 0}h</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-accent-success">+{stats?.recent_activity.watch_time_this_week || 0}h</span> this week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Watch Parties */}
        <Card className="lg:col-span-2 border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Watch Parties</CardTitle>
                <CardDescription>Your latest streaming sessions</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/parties">
                  View all
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentParties.length > 0 ? (
              recentParties.map((party) => (
                <div
                  key={party.id}
                  className="flex items-center space-x-4 p-4 rounded-lg bg-background-secondary/50 hover:bg-background-secondary transition-colors"
                >
                  <div className="relative">
                    <img
                      src={party.thumbnail || "/placeholder.svg"}
                      alt={party.title}
                      className="w-20 h-12 rounded object-cover"
                    />
                    {party.status === "live" && (
                      <Badge className="absolute -top-1 -right-1 bg-accent-error text-white text-xs">LIVE</Badge>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{party.title}</h4>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                      <div className="flex items-center">
                        <Avatar className="w-4 h-4 mr-1">
                          <AvatarImage src={party.host.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{party.host.name[0]}</AvatarFallback>
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
                            : "Unknown"
                        }
                      </span>
                    </div>
                  </div>
                  <Button size="sm" variant={party.status === "live" ? "default" : "secondary"} asChild>
                    <Link href={`/watch/${party.id}`}>
                      {party.status === "live" ? "Join" : "View"}
                    </Link>
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No recent parties</p>
                <Button className="mt-4" asChild>
                  <Link href="/dashboard/parties/create">Create Your First Party</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Friend Activity */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Friend Activity</CardTitle>
            <CardDescription>See what your friends are watching</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {friendActivity.length > 0 ? (
              friendActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={activity.user.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{activity.user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{activity.user.name}</span>{" "}
                      <span className="text-muted-foreground">{activity.action}</span>{" "}
                      <span className="font-medium">{activity.content}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatTimeAgo(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No recent activity</p>
              </div>
            )}
            <Button variant="ghost" className="w-full text-sm">
              View all activity
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Videos */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Your Recent Videos</CardTitle>
              <CardDescription>Videos you've uploaded recently</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/videos">
                View all
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentVideos.length > 0 ? (
              recentVideos.map((video) => (
                <div key={video.id} className="group cursor-pointer">
                  <div className="relative">
                    <img
                      src={video.thumbnail || "/placeholder.svg"}
                      alt={video.title}
                      className="w-full h-32 rounded-lg object-cover group-hover:opacity-80 transition-opacity"
                    />
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                      {video.duration_formatted}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="mt-2">
                    <h4 className="font-medium text-sm truncate">{video.title}</h4>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                      <span>{video.view_count} views</span>
                      <span>{formatTimeAgo(video.created_at)}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">No videos uploaded yet</p>
                <Button className="mt-4" asChild>
                  <Link href="/dashboard/videos">Upload Your First Video</Link>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border/50 bg-gradient-to-br from-accent-primary/10 to-accent-primary/5 hover:shadow-glow transition-all cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-accent-primary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Plus className="w-6 h-6 text-accent-primary" />
            </div>
            <h3 className="font-semibold mb-2">Create Watch Party</h3>
            <p className="text-sm text-muted-foreground mb-4">Start a new synchronized viewing session with friends</p>
            <Button className="w-full">Get Started</Button>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-gradient-to-br from-accent-success/10 to-accent-success/5 hover:shadow-glow transition-all cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-accent-success/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Video className="w-6 h-6 text-accent-success" />
            </div>
            <h3 className="font-semibold mb-2">Upload Video</h3>
            <p className="text-sm text-muted-foreground mb-4">Add new videos from multiple sources and platforms</p>
            <Button variant="secondary" className="w-full">
              Upload Now
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-gradient-to-br from-support-violet/10 to-support-violet/5 hover:shadow-glow transition-all cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-support-violet/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-support-violet" />
            </div>
            <h3 className="font-semibold mb-2">View Analytics</h3>
            <p className="text-sm text-muted-foreground mb-4">Track your video performance and engagement metrics</p>
            <Button variant="secondary" className="w-full">
              View Stats
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
