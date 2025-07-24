"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"
import { Play, Users, Video, Clock, TrendingUp, Plus, ArrowRight, Crown } from "lucide-react"
import Link from "next/link"

// Mock data
const recentParties = [
  {
    id: "1",
    title: "Movie Night: The Matrix",
    participants: 8,
    status: "live",
    thumbnail: "/placeholder.svg?height=100&width=150",
    host: { name: "Sarah Johnson", avatar: "/placeholder.svg?height=32&width=32" },
    started_at: "2 hours ago",
  },
  {
    id: "2",
    title: "Documentary Series",
    participants: 5,
    status: "scheduled",
    thumbnail: "/placeholder.svg?height=100&width=150",
    host: { name: "Mike Chen", avatar: "/placeholder.svg?height=32&width=32" },
    started_at: "Tomorrow 8:00 PM",
  },
]

const recentVideos = [
  {
    id: "1",
    title: "Vacation Highlights 2024",
    duration: "12:34",
    views: 156,
    thumbnail: "/placeholder.svg?height=100&width=150",
    uploaded_at: "3 days ago",
  },
  {
    id: "2",
    title: "Cooking Tutorial",
    duration: "25:18",
    views: 89,
    thumbnail: "/placeholder.svg?height=100&width=150",
    uploaded_at: "1 week ago",
  },
]

const friendActivity = [
  {
    id: "1",
    user: { name: "Alex Rivera", avatar: "/placeholder.svg?height=32&width=32" },
    action: "started watching",
    content: "The Office S01E01",
    time: "5 minutes ago",
  },
  {
    id: "2",
    user: { name: "Emma Wilson", avatar: "/placeholder.svg?height=32&width=32" },
    action: "created a party",
    content: "Friday Movie Night",
    time: "1 hour ago",
  },
]

export default function DashboardPage() {
  const { user } = useAuth()

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
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-accent-success">+2</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Watch Parties</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-accent-success">+4</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-accent-success">+12%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Watch Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">48h</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-accent-success">+8h</span> from last month
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
            {recentParties.map((party) => (
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
                      {party.participants}
                    </div>
                    <span>{party.started_at}</span>
                  </div>
                </div>
                <Button size="sm" variant={party.status === "live" ? "default" : "secondary"}>
                  {party.status === "live" ? "Join" : "Schedule"}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Friend Activity */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Friend Activity</CardTitle>
            <CardDescription>See what your friends are watching</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {friendActivity.map((activity) => (
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
                  <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
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
            {recentVideos.map((video) => (
              <div key={video.id} className="group cursor-pointer">
                <div className="relative">
                  <img
                    src={video.thumbnail || "/placeholder.svg"}
                    alt={video.title}
                    className="w-full h-32 rounded-lg object-cover group-hover:opacity-80 transition-opacity"
                  />
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="mt-2">
                  <h4 className="font-medium text-sm truncate">{video.title}</h4>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                    <span>{video.views} views</span>
                    <span>{video.uploaded_at}</span>
                  </div>
                </div>
              </div>
            ))}
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
