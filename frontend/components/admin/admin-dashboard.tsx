"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  Server,
  Database,
  Cpu,
  HardDrive,
  Users,
  Video,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Activity,
} from "lucide-react"

export function AdminDashboard() {
  // Mock system metrics
  const systemMetrics = {
    cpu: 45,
    memory: 68,
    disk: 34,
    network: 23,
  }

  const recentActivity = [
    { time: "2 min ago", action: "New user registered", user: "john@example.com", type: "user" },
    { time: "5 min ago", action: "Watch party created", user: "sarah@example.com", type: "party" },
    { time: "8 min ago", action: "Video uploaded", user: "mike@example.com", type: "content" },
    { time: "12 min ago", action: "Payment processed", user: "lisa@example.com", type: "billing" },
    { time: "15 min ago", action: "User reported content", user: "admin@example.com", type: "moderation" },
  ]

  const userGrowth = [
    { month: "Jul", users: 1200, active: 980 },
    { month: "Aug", users: 1450, active: 1180 },
    { month: "Sep", users: 1680, active: 1350 },
    { month: "Oct", users: 2100, active: 1680 },
    { month: "Nov", users: 2847, active: 2280 },
  ]

  const subscriptionDistribution = [
    { name: "Free", value: 65, color: "#8884d8" },
    { name: "Premium", value: 25, color: "#82ca9d" },
    { name: "Pro", value: 8, color: "#ffc658" },
    { name: "Enterprise", value: 2, color: "#ff7300" },
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "user":
        return <Users className="w-4 h-4 text-blue-500" />
      case "party":
        return <Video className="w-4 h-4 text-green-500" />
      case "content":
        return <HardDrive className="w-4 h-4 text-purple-500" />
      case "billing":
        return <TrendingUp className="w-4 h-4 text-yellow-500" />
      case "moderation":
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      default:
        return <Activity className="w-4 h-4 text-gray-500" />
    }
  }

  const getMetricColor = (value: number) => {
    if (value >= 80) return "text-red-600"
    if (value >= 60) return "text-yellow-600"
    return "text-green-600"
  }

  return (
    <div className="space-y-6">
      {/* System Health */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Cpu className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <div className={`text-2xl font-bold ${getMetricColor(systemMetrics.cpu)}`}>{systemMetrics.cpu}%</div>
              {systemMetrics.cpu < 80 ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-600" />
              )}
            </div>
            <Progress value={systemMetrics.cpu} className="mb-2" />
            <p className="text-xs text-muted-foreground">Average load across all servers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <Server className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <div className={`text-2xl font-bold ${getMetricColor(systemMetrics.memory)}`}>
                {systemMetrics.memory}%
              </div>
              {systemMetrics.memory < 80 ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-600" />
              )}
            </div>
            <Progress value={systemMetrics.memory} className="mb-2" />
            <p className="text-xs text-muted-foreground">RAM utilization</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
            <HardDrive className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <div className={`text-2xl font-bold ${getMetricColor(systemMetrics.disk)}`}>{systemMetrics.disk}%</div>
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <Progress value={systemMetrics.disk} className="mb-2" />
            <p className="text-xs text-muted-foreground">Storage utilization</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network I/O</CardTitle>
            <Database className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <div className={`text-2xl font-bold ${getMetricColor(systemMetrics.network)}`}>
                {systemMetrics.network}%
              </div>
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <Progress value={systemMetrics.network} className="mb-2" />
            <p className="text-xs text-muted-foreground">Bandwidth utilization</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>Total and active users over the last 5 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="#8884d8" strokeWidth={2} name="Total Users" />
                <Line type="monotone" dataKey="active" stroke="#82ca9d" strokeWidth={2} name="Active Users" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription Distribution</CardTitle>
            <CardDescription>Breakdown of user subscription plans</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={subscriptionDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {subscriptionDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest system events and user actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 rounded-lg border">
                <div className="flex-shrink-0">{getActivityIcon(activity.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.user}</p>
                </div>
                <div className="flex-shrink-0">
                  <Badge variant="outline" className="text-xs">
                    {activity.time}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          <div className="pt-4">
            <Button variant="outline" className="w-full bg-transparent">
              View All Activity
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>System Maintenance</CardTitle>
            <CardDescription>Perform system maintenance tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <Server className="w-4 h-4 mr-2" />
              Restart Services
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <Database className="w-4 h-4 mr-2" />
              Clear Cache
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <HardDrive className="w-4 h-4 mr-2" />
              Cleanup Storage
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Quick user administration actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <Users className="w-4 h-4 mr-2" />
              View All Users
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Flagged Accounts
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <TrendingUp className="w-4 h-4 mr-2" />
              Export User Data
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content Moderation</CardTitle>
            <CardDescription>Review and moderate platform content</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <Video className="w-4 h-4 mr-2" />
              Review Videos
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Reported Content
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve Pending
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
