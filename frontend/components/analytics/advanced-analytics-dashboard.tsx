"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Download, TrendingUp, Users, Play, DollarSign, Eye } from "lucide-react"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { format } from "date-fns"

interface AnalyticsData {
  overview: {
    totalUsers: number
    activeUsers: number
    totalParties: number
    totalRevenue: number
    userGrowth: number
    revenueGrowth: number
    engagementRate: number
    retentionRate: number
  }
  userMetrics: {
    daily: Array<{ date: string; users: number; newUsers: number }>
    retention: Array<{ cohort: string; day1: number; day7: number; day30: number }>
    engagement: Array<{ segment: string; sessions: number; duration: number }>
  }
  contentMetrics: {
    topVideos: Array<{ title: string; views: number; engagement: number; revenue: number }>
    categoryPerformance: Array<{ category: string; views: number; engagement: number }>
    uploadTrends: Array<{ date: string; uploads: number; totalSize: number }>
  }
  revenueMetrics: {
    monthly: Array<{ month: string; revenue: number; subscriptions: number }>
    plans: Array<{ plan: string; subscribers: number; revenue: number }>
    churn: Array<{ month: string; churnRate: number; newSubscribers: number }>
  }
  platformMetrics: {
    performance: Array<{ metric: string; value: number; target: number }>
    errors: Array<{ date: string; errors: number; type: string }>
    usage: Array<{ feature: string; usage: number; growth: number }>
  }
}

const COLORS = ["#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"]

export function AdvancedAnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date(),
  })
  const [selectedMetric, setSelectedMetric] = useState("users")

  useEffect(() => {
    // Simulate API call
    const fetchAnalytics = async () => {
      setLoading(true)
      // Mock data - replace with actual API call
      const mockData: AnalyticsData = {
        overview: {
          totalUsers: 125430,
          activeUsers: 89234,
          totalParties: 45678,
          totalRevenue: 234567,
          userGrowth: 12.5,
          revenueGrowth: 18.3,
          engagementRate: 76.8,
          retentionRate: 68.2,
        },
        userMetrics: {
          daily: Array.from({ length: 30 }, (_, i) => ({
            date: format(new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000), "MMM dd"),
            users: Math.floor(Math.random() * 5000) + 15000,
            newUsers: Math.floor(Math.random() * 500) + 200,
          })),
          retention: [
            { cohort: "Jan 2024", day1: 85, day7: 65, day30: 45 },
            { cohort: "Feb 2024", day1: 88, day7: 68, day30: 48 },
            { cohort: "Mar 2024", day1: 82, day7: 62, day30: 42 },
          ],
          engagement: [
            { segment: "Power Users", sessions: 15.2, duration: 45.6 },
            { segment: "Regular Users", sessions: 8.4, duration: 28.3 },
            { segment: "Casual Users", sessions: 3.1, duration: 12.7 },
          ],
        },
        contentMetrics: {
          topVideos: [
            { title: "Movie Night Classics", views: 45678, engagement: 89.2, revenue: 2345 },
            { title: "Anime Marathon", views: 38901, engagement: 92.1, revenue: 1987 },
            { title: "Documentary Series", views: 32456, engagement: 76.8, revenue: 1654 },
          ],
          categoryPerformance: [
            { category: "Movies", views: 234567, engagement: 78.9 },
            { category: "TV Shows", views: 189234, engagement: 82.1 },
            { category: "Documentaries", views: 98765, engagement: 85.3 },
          ],
          uploadTrends: Array.from({ length: 12 }, (_, i) => ({
            date: format(new Date(2024, i, 1), "MMM"),
            uploads: Math.floor(Math.random() * 1000) + 500,
            totalSize: Math.floor(Math.random() * 5000) + 2000,
          })),
        },
        revenueMetrics: {
          monthly: Array.from({ length: 12 }, (_, i) => ({
            month: format(new Date(2024, i, 1), "MMM"),
            revenue: Math.floor(Math.random() * 50000) + 20000,
            subscriptions: Math.floor(Math.random() * 1000) + 500,
          })),
          plans: [
            { plan: "Basic", subscribers: 45678, revenue: 45678 },
            { plan: "Pro", subscribers: 23456, revenue: 117280 },
            { plan: "Premium", subscribers: 12345, revenue: 185175 },
          ],
          churn: Array.from({ length: 12 }, (_, i) => ({
            month: format(new Date(2024, i, 1), "MMM"),
            churnRate: Math.random() * 10 + 2,
            newSubscribers: Math.floor(Math.random() * 500) + 200,
          })),
        },
        platformMetrics: {
          performance: [
            { metric: "Page Load Time", value: 1.2, target: 2.0 },
            { metric: "API Response Time", value: 150, target: 200 },
            { metric: "Uptime", value: 99.9, target: 99.5 },
            { metric: "Error Rate", value: 0.1, target: 0.5 },
          ],
          errors: Array.from({ length: 7 }, (_, i) => ({
            date: format(new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000), "MMM dd"),
            errors: Math.floor(Math.random() * 50) + 10,
            type: ["4xx", "5xx", "Network"][Math.floor(Math.random() * 3)],
          })),
          usage: [
            { feature: "Watch Parties", usage: 89234, growth: 12.5 },
            { feature: "Chat", usage: 76543, growth: 8.9 },
            { feature: "Video Upload", usage: 34567, growth: 15.2 },
            { feature: "Social Features", usage: 56789, growth: 22.1 },
          ],
        },
      }

      setTimeout(() => {
        setData(mockData)
        setLoading(false)
      }, 1000)
    }

    fetchAnalytics()
  }, [dateRange])

  const exportData = (format: "csv" | "pdf") => {
    // Implement export functionality
    console.log(`Exporting data as ${format}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Advanced Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400">Comprehensive platform insights and metrics</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto bg-transparent">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(dateRange.from, "MMM dd")} - {format(dateRange.to, "MMM dd")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(range) => range && setDateRange(range)}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select metric" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="users">User Metrics</SelectItem>
              <SelectItem value="content">Content Metrics</SelectItem>
              <SelectItem value="revenue">Revenue Metrics</SelectItem>
              <SelectItem value="platform">Platform Metrics</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={() => exportData("csv")} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalUsers.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />+{data.overview.userGrowth}% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.activeUsers.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              {data.overview.engagementRate}% engagement rate
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Parties</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalParties.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              {data.overview.retentionRate}% retention rate
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.overview.totalRevenue.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />+{data.overview.revenueGrowth}% from last month
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users">User Analytics</TabsTrigger>
          <TabsTrigger value="content">Content Analytics</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Analytics</TabsTrigger>
          <TabsTrigger value="platform">Platform Analytics</TabsTrigger>
        </TabsList>

        {/* User Analytics */}
        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Active Users</CardTitle>
                <CardDescription>User activity over the selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data.userMetrics.daily}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="users"
                      stackId="1"
                      stroke="#6366f1"
                      fill="#6366f1"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="newUsers"
                      stackId="1"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Retention</CardTitle>
                <CardDescription>Cohort retention analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.userMetrics.retention}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="cohort" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="day1" fill="#6366f1" />
                    <Bar dataKey="day7" fill="#8b5cf6" />
                    <Bar dataKey="day30" fill="#06b6d4" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>User Engagement Segments</CardTitle>
              <CardDescription>User behavior by engagement level</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.userMetrics.engagement.map((segment, index) => (
                  <div key={segment.segment} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{segment.segment}</h4>
                      <p className="text-sm text-muted-foreground">
                        {segment.sessions} avg sessions • {segment.duration}min avg duration
                      </p>
                    </div>
                    <Badge variant={index === 0 ? "default" : index === 1 ? "secondary" : "outline"}>
                      {segment.sessions > 10 ? "High" : segment.sessions > 5 ? "Medium" : "Low"} Engagement
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Analytics */}
        <TabsContent value="content" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Videos</CardTitle>
                <CardDescription>Most viewed and engaging content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.contentMetrics.topVideos.map((video, index) => (
                    <div key={video.title} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{video.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {video.views.toLocaleString()} views • {video.engagement}% engagement
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${video.revenue}</p>
                        <Badge variant={index === 0 ? "default" : "secondary"}>#{index + 1}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
                <CardDescription>Content performance by category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.contentMetrics.categoryPerformance}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="views"
                    >
                      {data.contentMetrics.categoryPerformance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Upload Trends</CardTitle>
              <CardDescription>Content upload patterns over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.contentMetrics.uploadTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="uploads" fill="#6366f1" />
                  <Line yAxisId="right" type="monotone" dataKey="totalSize" stroke="#8b5cf6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Analytics */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue</CardTitle>
                <CardDescription>Revenue and subscription trends</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data.revenueMetrics.monthly}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subscription Plans</CardTitle>
                <CardDescription>Revenue distribution by plan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.revenueMetrics.plans.map((plan) => (
                    <div key={plan.plan} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{plan.plan}</span>
                        <span>${plan.revenue.toLocaleString()}</span>
                      </div>
                      <Progress
                        value={(plan.revenue / Math.max(...data.revenueMetrics.plans.map((p) => p.revenue))) * 100}
                        className="h-2"
                      />
                      <p className="text-sm text-muted-foreground">{plan.subscribers.toLocaleString()} subscribers</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Churn Analysis</CardTitle>
              <CardDescription>Subscription churn and acquisition trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.revenueMetrics.churn}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="churnRate" stroke="#ef4444" strokeWidth={2} />
                  <Bar yAxisId="right" dataKey="newSubscribers" fill="#10b981" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Platform Analytics */}
        <TabsContent value="platform" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>System performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.platformMetrics.performance.map((metric) => (
                    <div key={metric.metric} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{metric.metric}</span>
                        <span className={metric.value <= metric.target ? "text-green-600" : "text-red-600"}>
                          {metric.value}
                          {metric.metric.includes("Time") ? "s" : metric.metric.includes("Rate") ? "%" : ""}
                        </span>
                      </div>
                      <Progress value={(metric.value / metric.target) * 100} className="h-2" />
                      <p className="text-sm text-muted-foreground">
                        Target: {metric.target}
                        {metric.metric.includes("Time") ? "s" : metric.metric.includes("Rate") ? "%" : ""}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Error Tracking</CardTitle>
                <CardDescription>System errors over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.platformMetrics.errors}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="errors" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Feature Usage</CardTitle>
              <CardDescription>Platform feature adoption and growth</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.platformMetrics.usage.map((feature) => (
                  <div key={feature.feature} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{feature.feature}</h4>
                      <p className="text-sm text-muted-foreground">{feature.usage.toLocaleString()} total usage</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center">
                        <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                        <span className="text-green-600">+{feature.growth}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
