"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { 
  Play, 
  Users, 
  VideoIcon, 
  Clock, 
  TrendingUp, 
  Plus, 
  ArrowRight, 
  Crown, 
  Loader2,
  Star,
  Eye,
  Calendar,
  Activity
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { usersAPI, partiesAPI, videosAPI } from "@/lib/api"

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

        // Mock data for demo purposes since API might not be available
        setStats({
          total_parties: 12,
          parties_hosted: 8,
          parties_joined: 4,
          total_videos: 23,
          watch_time_hours: 45,
          friends_count: 15,
          recent_activity: {
            parties_this_week: 3,
            videos_uploaded_this_week: 2,
            watch_time_this_week: 8
          }
        })

        setRecentParties([
          {
            id: "1",
            title: "Marvel Movie Marathon",
            participant_count: 8,
            status: "live",
            thumbnail: "/placeholder.jpg",
            host: { name: "Sarah Chen", avatar: "/placeholder-user.jpg" },
            started_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          },
          {
            id: "2", 
            title: "Anime Night",
            participant_count: 5,
            status: "scheduled",
            thumbnail: "/placeholder.jpg",
            host: { name: "Mike Rodriguez", avatar: "/placeholder-user.jpg" },
            scheduled_start: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          }
        ])

        setRecentVideos([
          {
            id: "1",
            title: "Epic Action Sequence",
            duration_formatted: "2:34:12",
            view_count: 156,
            thumbnail: "/placeholder.jpg",
            created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: "2",
            title: "Comedy Special",
            duration_formatted: "1:23:45",
            view_count: 89,
            thumbnail: "/placeholder.jpg",
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
          }
        ])

        setFriendActivity([
          {
            id: "1",
            user: { name: "Alex Johnson", avatar: "/placeholder-user.jpg" },
            action: "watched",
            content: "Sci-Fi Thriller",
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString()
          },
          {
            id: "2",
            user: { name: "Emma Wilson", avatar: "/placeholder-user.jpg" },
            action: "created party",
            content: "Horror Movie Night",
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          }
        ])

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
      <div className="min-h-screen bg-cinema-deep flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Loader2 className="w-8 h-8 animate-spin text-neon-red" />
            <div className="absolute inset-0 w-8 h-8 rounded-full border-2 border-neon-red/20" />
          </div>
          <div className="text-center">
            <div className="text-white font-medium">Loading Dashboard...</div>
            <div className="text-gray-400 text-sm">Preparing your cinema experience</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="animate-fade-in">
          <h1 className="heading-lg mb-2">
            Welcome back, {user?.first_name || "User"}! 👋
          </h1>
          <p className="body-large">
            Here's what's happening with your watch parties and videos
          </p>
        </div>
        <div className="flex items-center gap-3 animate-fade-in">
          {user?.is_premium && (
            <Badge className="bg-neon-gold/20 text-neon-gold border-neon-gold/30 glow-gold">
              <Crown className="w-3 h-3 mr-1" />
              Premium
            </Badge>
          )}
          <Button className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Create Party
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card border-white/20 hover:border-neon-red/30 transition-all duration-300 hover:scale-105 group animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Videos</CardTitle>
            <div className="p-2 rounded-lg bg-neon-blue/20 group-hover:bg-neon-blue/30 transition-colors">
              <VideoIcon className="h-4 w-4 text-neon-blue" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-1">{stats?.total_videos || 0}</div>
            <p className="text-xs text-gray-400">
              <span className="text-neon-green">+{stats?.recent_activity?.videos_uploaded_this_week || 0}</span> this week
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/20 hover:border-neon-purple/30 transition-all duration-300 hover:scale-105 group animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Watch Parties</CardTitle>
            <div className="p-2 rounded-lg bg-neon-purple/20 group-hover:bg-neon-purple/30 transition-colors">
              <Users className="h-4 w-4 text-neon-purple" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-1">{stats?.total_parties || 0}</div>
            <p className="text-xs text-gray-400">
              <span className="text-neon-green">+{stats?.recent_activity?.parties_this_week || 0}</span> this week
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/20 hover:border-neon-gold/30 transition-all duration-300 hover:scale-105 group animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Friends</CardTitle>
            <div className="p-2 rounded-lg bg-neon-gold/20 group-hover:bg-neon-gold/30 transition-colors">
              <Users className="h-4 w-4 text-neon-gold" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-1">{stats?.friends_count || 0}</div>
            <p className="text-xs text-gray-400">Total connections</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/20 hover:border-neon-green/30 transition-all duration-300 hover:scale-105 group animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Watch Time</CardTitle>
            <div className="p-2 rounded-lg bg-neon-green/20 group-hover:bg-neon-green/30 transition-colors">
              <Clock className="h-4 w-4 text-neon-green" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-1">{stats?.watch_time_hours || 0}h</div>
            <p className="text-xs text-gray-400">
              <span className="text-neon-green">+{stats?.recent_activity?.watch_time_this_week || 0}h</span> this week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Watch Parties */}
        <Card className="lg:col-span-2 glass-card border-white/20 animate-slide-up">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl text-white">Recent Watch Parties</CardTitle>
                <CardDescription className="text-gray-400">Your latest streaming sessions</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild className="hover:bg-white/10">
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
                  className="flex items-center space-x-4 p-4 rounded-xl glass-card border border-white/10 hover:border-white/20 transition-all duration-300"
                >
                  <div className="relative">
                    <img
                      src={party.thumbnail || "/placeholder.jpg"}
                      alt={party.title}
                      className="w-20 h-12 rounded-lg object-cover"
                    />
                    {party.status === "live" && (
                      <Badge className="absolute -top-1 -right-1 bg-neon-red text-white text-xs animate-pulse glow-red">
                        LIVE
                      </Badge>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-white">{party.title}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                      <div className="flex items-center">
                        <Avatar className="w-4 h-4 mr-1">
                          <AvatarImage src={party.host.avatar || "/placeholder-user.jpg"} />
                          <AvatarFallback className="text-xs bg-neon-purple/20">{party.host.name[0]}</AvatarFallback>
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
                  <Button size="sm" className={party.status === "live" ? "btn-primary" : "btn-secondary"} asChild>
                    <Link href={`/watch/${party.id}`}>{party.status === "live" ? "Join" : "View"}</Link>
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                  <Users className="w-8 h-8 text-gray-500" />
                </div>
                <p className="text-gray-400 mb-4">No recent parties</p>
                <Button className="btn-primary" asChild>
                  <Link href="/dashboard/parties/create">Create Your First Party</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Friend Activity */}
        <Card className="glass-card border-white/20 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <CardHeader>
            <CardTitle className="text-xl text-white flex items-center">
              <Activity className="w-5 h-5 mr-2 text-neon-blue" />
              Friend Activity
            </CardTitle>
            <CardDescription className="text-gray-400">See what your friends are watching</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {friendActivity.length > 0 ? (
              friendActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={activity.user.avatar || "/placeholder-user.jpg"} />
                    <AvatarFallback className="bg-neon-blue/20 text-neon-blue">{activity.user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white">
                      <span className="font-medium">{activity.user.name}</span>{" "}
                      <span className="text-gray-400">{activity.action}</span>{" "}
                      <span className="font-medium text-neon-blue">{activity.content}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTimeAgo(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white/5 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-gray-500" />
                </div>
                <p className="text-gray-400 text-sm">No recent activity</p>
              </div>
            )}
            <Button variant="ghost" className="w-full text-sm hover:bg-white/10">
              View all activity
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card border border-neon-red/30 bg-gradient-to-br from-neon-red/10 to-neon-red/5 hover:scale-105 transition-all cursor-pointer group animate-scale-in">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-neon-red to-neon-purple rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform glow-red">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold mb-2 text-white">Create Watch Party</h3>
            <p className="text-sm text-gray-400 mb-4">
              Start a new synchronized viewing session with friends
            </p>
            <Button className="btn-primary w-full">
              Get Started
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-card border border-neon-blue/30 bg-gradient-to-br from-neon-blue/10 to-neon-blue/5 hover:scale-105 transition-all cursor-pointer group animate-scale-in" style={{ animationDelay: "0.1s" }}>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-neon-blue to-neon-purple rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform glow-blue">
              <VideoIcon className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold mb-2 text-white">Upload Video</h3>
            <p className="text-sm text-gray-400 mb-4">
              Add new videos from multiple sources and platforms
            </p>
            <Button className="bg-neon-blue hover:bg-neon-blue/80 text-white w-full">
              Upload Now
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-card border border-neon-gold/30 bg-gradient-to-br from-neon-gold/10 to-neon-gold/5 hover:scale-105 transition-all cursor-pointer group animate-scale-in" style={{ animationDelay: "0.2s" }}>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-neon-gold to-neon-red rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform glow-gold">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold mb-2 text-white">View Analytics</h3>
            <p className="text-sm text-gray-400 mb-4">
              Track your video performance and engagement metrics
            </p>
            <Button className="bg-neon-gold hover:bg-neon-gold/80 text-white w-full">
              View Stats
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
