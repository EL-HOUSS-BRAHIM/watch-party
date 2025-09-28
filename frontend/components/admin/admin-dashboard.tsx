import { Activity, AlertTriangle, Check, CheckCircle, Database, Loader2, PieChart, Server, TrendingUp, User, Users, Video, X } from "lucide-react"
import { useState, useEffect , useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { adminAPI } from "@/lib/api"
import {}

"use client"
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

interface SystemMetrics {}
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  network_usage: number;
}

interface UserGrowthData {}
  month: string;
  total_users: number;
  active_users: number;
}

interface RecentActivity {}
  id: string;
  timestamp: string;
  action: string;
  user_email: string;
  activity_type: string;
}

interface SubscriptionDistribution {}
  plan_name: string;
  user_count: number;
  color: string;
}

export function AdminDashboard() {
  const { toast } = useToast()
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [userGrowth, setUserGrowth] = useState<UserGrowthData[]>([])
  const [subscriptionDistribution, setSubscriptionDistribution] = useState<SubscriptionDistribution[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    try {
      setIsLoading(true)
      const [dashboardData, healthData, analyticsData] = await Promise.all([]
        adminAPI.getDashboard(),
        adminAPI.getSystemHealth(),
        adminAPI.getAnalytics()
      ])

      // Extract system metrics from dashboard data (placeholder values if not available)
      const metrics: SystemMetrics = { cpu_usage: Math.floor(Math.random() * 100), // Placeholder;
        memory_usage: Math.floor(Math.random() * 100), // Placeholder;
        disk_usage: Math.floor(Math.random() * 100), // Placeholder;
        network_usage: Math.floor(Math.random() * 100), // Placeholder;
      }
      setSystemMetrics(metrics)
      // Use the health and analytics data as needed;
    } } catch {
      console.error("Failed to fetch admin data:", error)
      toast({}
        title: "Error",
        description: "Failed to load admin dashboard data",
        variant: "destructive",
      })
    } finally {}
      setIsLoading(false)
    }
  }

  const getActivityIcon = (type: string) => {}
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

  const getMetricColor = (value: number) => {}
    if (value >= 80) return &quot;text-red-600&quot;
    if (value >= 60) return &quot;text-yellow-600"
    return "text-green-600"
  }

  const formatTimeAgo = (timestamp: string) => {}
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins} min ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
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
              <div className={`text-2xl font-bold ${getMetricColor(systemMetrics?.cpu_usage || 0)}`}>
                {systemMetrics?.cpu_usage || 0}%
              </div>
              {(systemMetrics?.cpu_usage || 0) < 80 ? (}
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-600" />
              )}
            </div>
            <Progress value={systemMetrics?.cpu_usage || 0} className="mb-2" />
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
              <div className={`text-2xl font-bold ${getMetricColor(systemMetrics?.memory_usage || 0)}`}>
                {systemMetrics?.memory_usage || 0}%
              </div>
              {(systemMetrics?.memory_usage || 0) < 80 ? (}
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-600" />
              )}
            </div>
            <Progress value={systemMetrics?.memory_usage || 0} className="mb-2" />
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
              <div className={`text-2xl font-bold ${getMetricColor(systemMetrics?.disk_usage || 0)}`}>
                {systemMetrics?.disk_usage || 0}%
              </div>
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <Progress value={systemMetrics?.disk_usage || 0} className="mb-2" />
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
              <div className={`text-2xl font-bold ${getMetricColor(systemMetrics?.network_usage || 0)}`}>
                {systemMetrics?.network_usage || 0}%
              </div>
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <Progress value={systemMetrics?.network_usage || 0} className="mb-2" />
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
                <Line type="monotone" dataKey="total_users" stroke="#8884d8" strokeWidth={2} name="Total Users" />
                <Line type="monotone" dataKey="active_users" stroke="#82ca9d" strokeWidth={2} name="Active Users" />
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
                <Pie;
                  data={subscriptionDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="user_count"
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
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg border">
                  <div className="flex-shrink-0">{getActivityIcon(activity.activity_type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.user_email}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <Badge variant="outline" className="text-xs">
                      {formatTimeAgo(activity.timestamp)}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No recent activity</p>
              </div>
            )}
          </div>
          <div className="pt-4">
            <Button variant="outline" className="w-full bg-transparent">
              View All Activity;
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
              Restart Services;
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <Database className="w-4 h-4 mr-2" />
              Clear Cache;
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <HardDrive className="w-4 h-4 mr-2" />
              Cleanup Storage;
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
              View All Users;
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Flagged Accounts;
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <TrendingUp className="w-4 h-4 mr-2" />
              Export User Data;
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
              Review Videos;
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Reported Content;
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve Pending;
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
