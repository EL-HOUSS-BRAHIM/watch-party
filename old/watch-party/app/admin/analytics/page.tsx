"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { BarChart3, TrendingUp, Users, Activity, Clock, Globe } from "lucide-react"
import { api } from "@/lib/api"

export default function AdminAnalyticsPage() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: () => api.get("/admin/analytics"),
  })

  const mockData = {
    overview: {
      totalUsers: 15420,
      activeUsers: 8934,
      totalParties: 2847,
      totalWatchTime: 45680, // minutes
    },
    growth: {
      userGrowth: 12.5,
      partyGrowth: 18.3,
      engagementGrowth: 8.7,
    },
    demographics: [
      { region: "North America", users: 6234, percentage: 40.4 },
      { region: "Europe", users: 4926, percentage: 31.9 },
      { region: "Asia", users: 2847, percentage: 18.5 },
      { region: "Other", users: 1413, percentage: 9.2 },
    ],
    engagement: {
      averageSessionTime: 127, // minutes
      messagesPerParty: 45,
      returnRate: 73.2,
      satisfactionScore: 4.6,
    },
    topContent: [
      { title: "Champions League", views: 1234, engagement: 89 },
      { title: "Premier League", views: 987, engagement: 85 },
      { title: "World Cup", views: 756, engagement: 92 },
      { title: "La Liga", views: 543, engagement: 78 },
    ],
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Platform Analytics</h1>
          <p className="text-muted-foreground">Comprehensive insights into platform performance and user behavior.</p>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{mockData.overview.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-success">+{mockData.growth.userGrowth}% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{mockData.overview.activeUsers.toLocaleString()}</div>
            <p className="text-xs text-success">+{mockData.growth.engagementGrowth}% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Parties</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{mockData.overview.totalParties.toLocaleString()}</div>
            <p className="text-xs text-success">+{mockData.growth.partyGrowth}% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Watch Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {Math.floor(mockData.overview.totalWatchTime / 60)}k hours
            </div>
            <p className="text-xs text-success">+15% from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Demographics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              User Demographics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockData.demographics.map((region) => (
              <div key={region.region} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{region.region}</span>
                  <span className="text-sm text-muted-foreground">
                    {region.users.toLocaleString()} ({region.percentage}%)
                  </span>
                </div>
                <Progress value={region.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Engagement Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Engagement Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{mockData.engagement.averageSessionTime}m</div>
                <div className="text-sm text-muted-foreground">Avg. Session Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-success">{mockData.engagement.messagesPerParty}</div>
                <div className="text-sm text-muted-foreground">Messages per Party</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-premium">{mockData.engagement.returnRate}%</div>
                <div className="text-sm text-muted-foreground">Return Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-violet-400">{mockData.engagement.satisfactionScore}/5</div>
                <div className="text-sm text-muted-foreground">Satisfaction Score</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Content */}
      <Card>
        <CardHeader>
          <CardTitle>Top Content Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockData.topContent.map((content, index) => (
              <div key={content.title} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{content.title}</div>
                    <div className="text-sm text-muted-foreground">{content.views} total views</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-foreground">{content.engagement}%</div>
                  <div className="text-xs text-muted-foreground">engagement</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Peak Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground mb-2">Weekend Evenings</div>
              <p className="text-sm text-muted-foreground">Highest activity between 7-10 PM on Saturdays and Sundays</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Popular Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Live Chat</span>
                <span className="text-sm font-medium">94%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Video Sync</span>
                <span className="text-sm font-medium">89%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Reactions</span>
                <span className="text-sm font-medium">76%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-2xl font-bold text-success mb-2">99.8%</div>
              <p className="text-sm text-muted-foreground">Uptime this month</p>
              <div className="mt-4">
                <div className="text-sm text-muted-foreground">Avg. Response Time</div>
                <div className="text-lg font-semibold text-foreground">145ms</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
