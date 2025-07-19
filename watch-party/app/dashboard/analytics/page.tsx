"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, TrendingUp, Users, Clock, Calendar, Video } from "lucide-react"
import { api } from "@/lib/api"

export default function AnalyticsPage() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["analytics"],
    queryFn: () => api.get("/analytics"),
  })

  const mockData = {
    overview: {
      totalParties: 24,
      totalWatchTime: 1440, // minutes
      averageParticipants: 6.5,
      mostPopularDay: "Saturday",
    },
    monthlyStats: [
      { month: "Jan", parties: 8, watchTime: 480 },
      { month: "Feb", parties: 12, watchTime: 720 },
      { month: "Mar", parties: 15, watchTime: 900 },
      { month: "Apr", parties: 18, watchTime: 1080 },
      { month: "May", parties: 22, watchTime: 1320 },
      { month: "Jun", parties: 24, watchTime: 1440 },
    ],
    topVideos: [
      { title: "Champions League Final", views: 45, duration: "2h 15m" },
      { title: "El Clasico", views: 38, duration: "1h 55m" },
      { title: "World Cup Highlights", views: 32, duration: "45m" },
    ],
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">Track your watch party performance and engagement.</p>
        </div>

        <Select defaultValue="30d">
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Parties</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{mockData.overview.totalParties}</div>
            <p className="text-xs text-success">+15% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Watch Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {Math.floor(mockData.overview.totalWatchTime / 60)}h {mockData.overview.totalWatchTime % 60}m
            </div>
            <p className="text-xs text-success">+22% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{mockData.overview.averageParticipants}</div>
            <p className="text-xs text-success">+8% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Most Popular Day</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{mockData.overview.mostPopularDay}</div>
            <p className="text-xs text-muted-foreground">Peak activity day</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Monthly Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockData.monthlyStats.map((stat, index) => (
                <div key={stat.month} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 text-sm font-medium text-muted-foreground">{stat.month}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <div className="text-sm font-medium text-foreground">{stat.parties} parties</div>
                        <div className="text-xs text-muted-foreground">
                          ({Math.floor(stat.watchTime / 60)}h {stat.watchTime % 60}m)
                        </div>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2 mt-1">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${(stat.parties / 24) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Videos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Top Videos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockData.topVideos.map((video, index) => (
                <div key={video.title} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{video.title}</div>
                      <div className="text-sm text-muted-foreground">{video.duration}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-foreground">{video.views}</div>
                    <div className="text-xs text-muted-foreground">views</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Engagement Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">85%</div>
              <div className="text-sm text-muted-foreground">Average Retention Rate</div>
              <p className="text-xs text-muted-foreground mt-1">Participants stay until the end</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-success mb-2">92%</div>
              <div className="text-sm text-muted-foreground">Chat Participation</div>
              <p className="text-xs text-muted-foreground mt-1">Users actively chat during parties</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-premium mb-2">4.8</div>
              <div className="text-sm text-muted-foreground">Average Rating</div>
              <p className="text-xs text-muted-foreground mt-1">Party satisfaction score</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
