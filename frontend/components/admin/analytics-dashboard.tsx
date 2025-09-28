"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { adminAPI } from "@/lib/api"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts"
import {
  TrendingUp,
  TrendingDown,
  Users,
  Video,
  DollarSign,
  Activity,
  Calendar,
  Download,
  Eye,
  CreditCard,
  Loader2,
} from "lucide-react"

interface AnalyticsData {
  user_growth: Array<{
    date: string
    total_users: number
    active_users: number
    new_users: number
  }>
  revenue_data: Array<{
    month: string
    revenue: number
    subscriptions: number
    avg_revenue: number
  }>
  engagement_data: Array<{
    hour: string
    parties: number
    viewers: number
    messages: number
  }>
  device_data: Array<{
    name: string
    value: number
    color: string
  }>
  content_data: Array<{
    category: string
    uploads: number
    views: number
    duration: number
  }>
  kpi_data: {
    total_users: { value: number; change: number; trend: string }
    active_users: { value: number; change: number; trend: string }
    total_revenue: { value: number; change: number; trend: string }
    avg_session_time: { value: number; change: number; trend: string }
    watch_parties: { value: number; change: number; trend: string }
    conversion_rate: { value: number; change: number; trend: string }
  }
}

export function AnalyticsDashboard() {
  const { toast } = useToast()
  const [timeRange, setTimeRange] = useState("7d")
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAnalyticsData()
  }, [timeRange])

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true)
      
      if (!adminAPI) {
        console.error('Admin API not available')
        return
      }
      
      const data = await adminAPI.getAnalytics()
      setAnalyticsData(data)
    } catch (error) {
      console.error("Failed to fetch analytics data:", error)
      toast({
        title: "Error",
        description: "Failed to load analytics data.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getTrendIcon = (trend: string) => {
    return trend === "up" ? (
      <TrendingUp className="w-4 h-4 text-green-600" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-600" />
    )
  }

  const getTrendColor = (trend: string) => {
    return trend === "up" ? "text-green-600" : "text-red-600"
  }

  const exportData = async () => {
    try {
      if (!adminAPI) {
        console.error('Admin API not available')
        return
      }
      
      const response = await adminAPI.exportAnalytics({ time_range: timeRange })
      
      // Handle export file download
      const link = document.createElement("a")
      link.href = response.download_url
      link.download = `analytics-export-${timeRange}-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Failed to export data:", error)
      toast({
        title: "Error",
        description: "Failed to export analytics data.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">No analytics data available</p>
        </div>
      </div>
    )
  }

  // Derived data for charts
  const kpiData = analyticsData.kpi_data
  const userGrowthData = analyticsData.user_growth
  const revenueData = analyticsData.revenue_data
  const engagementData = analyticsData.engagement_data
  const deviceData = analyticsData.device_data
  const contentData = analyticsData.content_data

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Comprehensive business metrics and user analytics</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={exportData}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.kpi_data.total_users.value.toLocaleString()}</div>
            <div className="flex items-center space-x-1 text-xs">
              {getTrendIcon(analyticsData.kpi_data.total_users.trend)}
              <span className={getTrendColor(analyticsData.kpi_data.total_users.trend)}>
                {analyticsData.kpi_data.total_users.change}% from last period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.kpi_data.active_users.value.toLocaleString()}</div>
            <div className="flex items-center space-x-1 text-xs">
              {getTrendIcon(analyticsData.kpi_data.active_users.trend)}
              <span className={getTrendColor(analyticsData.kpi_data.active_users.trend)}>
                {analyticsData.kpi_data.active_users.change}% from last period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${kpiData.total_revenue.value.toLocaleString()}</div>
            <div className="flex items-center space-x-1 text-xs">
              {getTrendIcon(kpiData.total_revenue.trend)}
              <span className={getTrendColor(kpiData.total_revenue.trend)}>
                {kpiData.total_revenue.change}% from last period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Session Time</CardTitle>
            <Eye className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.avg_session_time.value}m</div>
            <div className="flex items-center space-x-1 text-xs">
              {getTrendIcon(kpiData.avg_session_time.trend)}
              <span className={getTrendColor(kpiData.avg_session_time.trend)}>
                {Math.abs(kpiData.avg_session_time.change)}% from last period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Parties</CardTitle>
            <Video className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.watch_parties.value}</div>
            <div className="flex items-center space-x-1 text-xs">
              {getTrendIcon(kpiData.watch_parties.trend)}
              <span className={getTrendColor(kpiData.watch_parties.trend)}>
                {kpiData.watch_parties.change}% from last period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <CreditCard className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.conversion_rate.value}%</div>
            <div className="flex items-center space-x-1 text-xs">
              {getTrendIcon(kpiData.conversion_rate.trend)}
              <span className={getTrendColor(kpiData.conversion_rate.trend)}>
                {kpiData.conversion_rate.change}% from last period
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>Total and active users over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
                    <YAxis />
                    <Tooltip labelFormatter={(value) => new Date(value).toLocaleDateString()} />
                    <Area
                      type="monotone"
                      dataKey="users"
                      stackId="1"
                      stroke="#8884d8"
                      fill="#8884d8"
                      name="Total Users"
                    />
                    <Area
                      type="monotone"
                      dataKey="active"
                      stackId="2"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                      name="Active Users"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>New User Registrations</CardTitle>
                <CardDescription>Daily new user sign-ups</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
                    <YAxis />
                    <Tooltip labelFormatter={(value) => new Date(value).toLocaleDateString()} />
                    <Bar dataKey="new" fill="#ffc658" name="New Users" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Analytics</CardTitle>
              <CardDescription>Monthly revenue and subscription growth</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="revenue" fill="#8884d8" name="Revenue ($)" />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="subscriptions"
                    stroke="#82ca9d"
                    strokeWidth={2}
                    name="Subscriptions"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Engagement by Hour</CardTitle>
              <CardDescription>Watch parties, viewers, and chat activity throughout the day</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" tickFormatter={(value) => `${value}:00`} />
                  <YAxis />
                  <Tooltip labelFormatter={(value) => `${value}:00`} />
                  <Line type="monotone" dataKey="parties" stroke="#8884d8" strokeWidth={2} name="Active Parties" />
                  <Line type="monotone" dataKey="viewers" stroke="#82ca9d" strokeWidth={2} name="Total Viewers" />
                  <Line type="monotone" dataKey="messages" stroke="#ffc658" strokeWidth={2} name="Chat Messages" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Analytics</CardTitle>
              <CardDescription>Video uploads and viewing statistics by category</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={contentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="uploads" fill="#8884d8" name="Uploads" />
                  <Bar dataKey="views" fill="#82ca9d" name="Views" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Device Distribution</CardTitle>
                <CardDescription>User device preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={deviceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {deviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Device Statistics</CardTitle>
                <CardDescription>Detailed breakdown by device type</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {deviceData.map((device, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: device.color }} />
                      <span className="font-medium">{device.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{device.value}%</div>
                      <div className="text-xs text-muted-foreground">
                        {Math.round((device.value / 100) * 2847)} users
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AnalyticsDashboard
