"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
} from "lucide-react"
import { useState } from "react"

export function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState("7d")

  // Mock analytics data
  const userGrowthData = [
    { date: "2024-01-14", users: 2100, active: 1680, new: 45 },
    { date: "2024-01-15", users: 2145, active: 1720, new: 52 },
    { date: "2024-01-16", users: 2197, active: 1758, new: 48 },
    { date: "2024-01-17", users: 2245, active: 1796, new: 61 },
    { date: "2024-01-18", users: 2306, active: 1845, new: 58 },
    { date: "2024-01-19", users: 2364, active: 1891, new: 67 },
    { date: "2024-01-20", users: 2431, active: 1945, new: 73 },
  ]

  const revenueData = [
    { month: "Jul", revenue: 12500, subscriptions: 125, avg_revenue: 100 },
    { month: "Aug", revenue: 15800, subscriptions: 158, avg_revenue: 100 },
    { month: "Sep", revenue: 18900, subscriptions: 189, avg_revenue: 100 },
    { month: "Oct", revenue: 23400, subscriptions: 234, avg_revenue: 100 },
    { month: "Nov", revenue: 28700, subscriptions: 287, avg_revenue: 100 },
  ]

  const engagementData = [
    { hour: "00", parties: 12, viewers: 156, messages: 1240 },
    { hour: "04", parties: 8, viewers: 98, messages: 780 },
    { hour: "08", parties: 25, viewers: 340, messages: 2100 },
    { hour: "12", parties: 45, viewers: 680, messages: 4200 },
    { hour: "16", parties: 67, viewers: 890, messages: 5800 },
    { hour: "20", parties: 89, viewers: 1200, messages: 7500 },
  ]

  const deviceData = [
    { name: "Desktop", value: 65, color: "#8884d8" },
    { name: "Mobile", value: 28, color: "#82ca9d" },
    { name: "Tablet", value: 7, color: "#ffc658" },
  ]

  const contentData = [
    { category: "Movies", uploads: 145, views: 12500, duration: 180 },
    { category: "TV Shows", uploads: 89, views: 8900, duration: 45 },
    { category: "Documentaries", uploads: 34, views: 3400, duration: 90 },
    { category: "Anime", uploads: 67, views: 6700, duration: 25 },
    { category: "Sports", uploads: 23, views: 2300, duration: 120 },
  ]

  const kpiData = {
    totalUsers: { value: 2847, change: 12.5, trend: "up" },
    activeUsers: { value: 2280, change: 8.3, trend: "up" },
    totalRevenue: { value: 28700, change: 22.6, trend: "up" },
    avgSessionTime: { value: 45, change: -2.1, trend: "down" },
    watchParties: { value: 156, change: 15.8, trend: "up" },
    conversionRate: { value: 3.2, change: 0.8, trend: "up" },
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
          <Button variant="outline" size="sm">
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
            <div className="text-2xl font-bold">{kpiData.totalUsers.value.toLocaleString()}</div>
            <div className="flex items-center space-x-1 text-xs">
              {getTrendIcon(kpiData.totalUsers.trend)}
              <span className={getTrendColor(kpiData.totalUsers.trend)}>
                {kpiData.totalUsers.change}% from last period
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
            <div className="text-2xl font-bold">{kpiData.activeUsers.value.toLocaleString()}</div>
            <div className="flex items-center space-x-1 text-xs">
              {getTrendIcon(kpiData.activeUsers.trend)}
              <span className={getTrendColor(kpiData.activeUsers.trend)}>
                {kpiData.activeUsers.change}% from last period
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
            <div className="text-2xl font-bold">${kpiData.totalRevenue.value.toLocaleString()}</div>
            <div className="flex items-center space-x-1 text-xs">
              {getTrendIcon(kpiData.totalRevenue.trend)}
              <span className={getTrendColor(kpiData.totalRevenue.trend)}>
                {kpiData.totalRevenue.change}% from last period
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
            <div className="text-2xl font-bold">{kpiData.avgSessionTime.value}m</div>
            <div className="flex items-center space-x-1 text-xs">
              {getTrendIcon(kpiData.avgSessionTime.trend)}
              <span className={getTrendColor(kpiData.avgSessionTime.trend)}>
                {Math.abs(kpiData.avgSessionTime.change)}% from last period
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
            <div className="text-2xl font-bold">{kpiData.watchParties.value}</div>
            <div className="flex items-center space-x-1 text-xs">
              {getTrendIcon(kpiData.watchParties.trend)}
              <span className={getTrendColor(kpiData.watchParties.trend)}>
                {kpiData.watchParties.change}% from last period
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
            <div className="text-2xl font-bold">{kpiData.conversionRate.value}%</div>
            <div className="flex items-center space-x-1 text-xs">
              {getTrendIcon(kpiData.conversionRate.trend)}
              <span className={getTrendColor(kpiData.conversionRate.trend)}>
                {kpiData.conversionRate.change}% from last period
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
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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
