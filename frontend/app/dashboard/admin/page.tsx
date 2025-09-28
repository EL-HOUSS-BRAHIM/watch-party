"use client"

import { Activity, AlertTriangle, BarChart, Calendar, Check, CheckCircle, Download, Loader2, Play, Refresh, Server, Settings, Shield, TrendingUp, User, Users, Video, X, XCircle } from "lucide-react"
import { useState, useEffect , useCallback } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { adminAPI } from "@/lib/api"
import { format } from "date-fns"

interface SystemStats {}
  users: {}
    total: number
    active: number
    new: number
    verified: number
    premium: number
  }
  parties: {}
    total: number
    active: number
    completed: number
    scheduled: number
  }
  videos: {}
    total: number
    uploaded: number
    processed: number
    storage: number // in GB
  }
  system: {}
    uptime: number
    cpu: number
    memory: number
    storage: number
    bandwidth: number
  }
}

interface RecentActivity {}
  id: string
  type: "user_registered" | "party_created" | "video_uploaded" | "user_banned" | "system_alert"
  description: string
  user?: {}
    id: string
    username: string
    avatar?: string
  }
  timestamp: string
  severity: "low" | "medium" | "high"
}

interface SystemAlert {}
  id: string
  type: "error" | "warning" | "info"
  title: string
  message: string
  timestamp: string
  resolved: boolean
  priority: "low" | "medium" | "high" | "critical"
}

interface PerformanceMetric {}
  timestamp: string
  cpu: number
  memory: number
  activeUsers: number
  activeParties: number
  responseTime: number
}

export default function AdminDashboardPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const [stats, setStats] = useState<SystemStats>({}
    users: { total: 0, active: 0, new: 0, verified: 0, premium: 0 },
    parties: { total: 0, active: 0, completed: 0, scheduled: 0 },
    videos: { total: 0, uploaded: 0, processed: 0, storage: 0 },
    system: { uptime: 0, cpu: 0, memory: 0, storage: 0, bandwidth: 0 },
  })

  const [recentActivity] = useState<RecentActivity[]>([])
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([])
  const [performanceData] = useState<PerformanceMetric[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // Check if user is admin
  useEffect(() => {
    if (user && !user.is_staff && !user.is_superuser) {
      router.push("/dashboard")
      return
    }
  }, [user, router])

  const loadDashboardData = async () => {
    if (!user?.is_staff && !user?.is_superuser) return
    setIsLoading(true)
    try {
      // Load system stats
      const statsData = await adminAPI.getDashboard()
      // We need to transform the AdminDashboard type to fit SystemStats
      // For now, let's handle this properly
      const transformedStats = { users: statsData.users || { total: 0, active: 0, new: 0, verified: 0, premium: 0 },
        parties: statsData.parties || { total: 0, active: 0, completed: 0, scheduled: 0 },
        videos: statsData.videos || { total: 0, uploaded: 0, processed: 0, storage: 0 },
        system: statsData.system || { uptime: 0, cpu: 0, memory: 0, storage: 0, bandwidth: 0 },
      }
      setStats(transformedStats)

      // Load system health
      await adminAPI.getSystemHealth()
      // Update stats with health data if needed
      setLastUpdated(new Date())
    } catch (err) {
      console.error("Failed to load admin dashboard data:", error)
      toast({title: "Error",
        description: "Failed to load dashboard data.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()

    // Set up auto-refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000)
    return () => clearInterval(interval)
  }, [loadDashboardData])

  const resolveAlert = async (alertId: string) => {}
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`/api/admin/alerts/${alertId}/resolve/`, {}
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        setSystemAlerts((prev) => prev.map((alert) => (alert.id === alertId ? { ...alert, resolved: true } : alert)))
        toast({title: "Alert Resolved",
          description: "The alert has been marked as resolved.",
        })
      }
    } catch (err) {
      console.error("Failed to resolve alert:", error)
      toast({title: "Error",
        description: "Failed to resolve alert.",
        variant: "destructive",
      })
    }
  }

  const exportData = async (type: "users" | "parties" | "videos" | "analytics") => {}
    try {
      let downloadData
      switch (type) {
        case "users":
          downloadData = await adminAPI.exportUsers({ format: 'csv' })
          break
        default:
          // For other types, we can extend the adminAPI or use a generic export
          const token = localStorage.getItem("accessToken")
          const response = await fetch(`/api/admin/export/${type}/`, {}
            headers: { Authorization: `Bearer ${token}` },
          })

          if (response.ok) {
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `${type}-export-${format(new Date(), "yyyy-MM-dd")}.csv`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            window.URL.revokeObjectURL(url)

            toast({title: "Export Complete",
              description: `${type} data has been exported successfully.`,
            })
            return
          }
          break
      }

      if (downloadData?.download_url) {
        // Handle the download URL from the API
        const a = document.createElement("a")
        a.href = downloadData.download_url
        a.download = `${type}-export-${format(new Date(), "yyyy-MM-dd")}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)

        toast({title: "Export Complete",
          description: `${type} data has been exported successfully.`,
        })
      }
    } catch (err) {
      console.error("Failed to export data:", error)
      toast({title: "Export Failed",
        description: "Failed to export data.",
        variant: "destructive",
      })
    }
  }

  const getActivityIcon = (type: string) => {}
    switch (type) {
      case "user_registered":
        return <UserCheck className="h-4 w-4 text-green-500" />
      case "party_created":
        return <PlayCircle className="h-4 w-4 text-blue-500" />
      case "video_uploaded":
        return <Video className="h-4 w-4 text-purple-500" />
      case "user_banned":
        return <UserX className="h-4 w-4 text-red-500" />
      case "system_alert":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getAlertIcon = (type: string) => {}
    switch (type) {
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "info":
        return <CheckCircle className="h-5 w-5 text-blue-500" />
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />
    }
  }

  const formatUptime = (seconds: number) => {}
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${days}d ${hours}h ${minutes}m`
  }

  const formatBytes = (bytes: number) => {}
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
    if (bytes === 0) return "0 Bytes"
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
  }



  if (!user?.is_staff && !user?.is_superuser) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-4">You don&apos;t have permission to access the admin dashboard.</p>
          <Button onClick={() => router.push(&quot;/dashboard&quot;)}>Back to Dashboard</Button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="h-8 w-8" />
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">System overview and management tools</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Last updated: {format(lastUpdated, &quot;HH:mm:ss&quot;)}</span>
            <Button variant="outline" onClick={loadDashboardData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* System Alerts */}
        {systemAlerts.filter((alert) => !alert.resolved).length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Active Alerts ({systemAlerts.filter((alert) => !alert.resolved).length})
            </h2>
            <div className="space-y-3">
              {systemAlerts
                .filter((alert) => !alert.resolved)
                .slice(0, 3)
                .map((alert) => (
                  <Alert
                    key={alert.id}
                    className={`${}
                      alert.priority === "critical"
                        ? "border-red-500"
                        : alert.priority === "high"
                          ? "border-yellow-500"
                          : "border-blue-500"
                    }`}
                  >
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{alert.title}</h4>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={}
                              alert.priority === "critical"
                                ? "destructive"
                                : alert.priority === "high"
                                  ? "default"
                                  : "secondary"
                            }
                          >
                            {alert.priority}
                          </Badge>
                          <Button variant="outline" size="sm" onClick={() => resolveAlert(alert.id)}>
                            Resolve
                          </Button>
                        </div>
                      </div>
                      <AlertDescription className="mt-1">{alert.message}</AlertDescription>
                      <p className="text-xs text-muted-foreground mt-2">
                        {format(new Date(alert.timestamp), "MMM dd, yyyy 'at' HH:mm")}
                      </p>
                    </div>
                  </Alert>
                ))}
            </div>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Users */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.users.total.toLocaleString()}</div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{stats.users.active} active</span>
                <span>•</span>
                <span>{stats.users.new} new today</span>
              </div>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Verified: {stats.users.verified}</span>
                  <span>Premium: {stats.users.premium}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Parties */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Watch Parties</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.parties.total.toLocaleString()}</div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{stats.parties.active} active</span>
                <span>•</span>
                <span>{stats.parties.scheduled} scheduled</span>
              </div>
              <div className="mt-2">
                <div className="text-xs text-muted-foreground">{stats.parties.completed} completed</div>
              </div>
            </CardContent>
          </Card>

          {/* Videos */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Videos</CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.videos.total.toLocaleString()}</div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{stats.videos.uploaded} uploaded</span>
                <span>•</span>
                <span>{stats.videos.processed} processed</span>
              </div>
              <div className="mt-2">
                <div className="text-xs text-muted-foreground">
                  Storage: {formatBytes(stats.videos.storage * 1024 * 1024 * 1024)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Health */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Health</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Healthy</div>
              <div className="text-xs text-muted-foreground">Uptime: {formatUptime(stats.system.uptime)}</div>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-xs">
                  <span>CPU</span>
                  <span>{stats.system.cpu}%</span>
                </div>
                <Progress value={stats.system.cpu} className="h-1" />
                <div className="flex justify-between text-xs">
                  <span>Memory</span>
                  <span>{stats.system.memory}%</span>
                </div>
                <Progress value={stats.system.memory} className="h-1" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="management">Management</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* System Resources */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cpu className="h-5 w-5" />
                    System Resources
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>CPU Usage</span>
                      <span>{stats.system.cpu}%</span>
                    </div>
                    <Progress value={stats.system.cpu} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Memory Usage</span>
                      <span>{stats.system.memory}%</span>
                    </div>
                    <Progress value={stats.system.memory} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Storage Usage</span>
                      <span>{stats.system.storage}%</span>
                    </div>
                    <Progress value={stats.system.storage} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Bandwidth Usage</span>
                      <span>{stats.system.bandwidth}%</span>
                    </div>
                    <Progress value={stats.system.bandwidth} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => router.push(&quot;/dashboard/admin/users&quot;)}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Manage Users
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => router.push(&quot;/dashboard/admin/reports&quot;)}
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    View Reports
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => router.push(&quot;/dashboard/admin/analytics&quot;)}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Analytics
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => exportData(&quot;analytics&quot;)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.slice(0, 10).map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      {getActivityIcon(activity.type)}
                      <div className="flex-1">
                        <p className="text-sm">{activity.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(activity.timestamp), "MMM dd, HH:mm")}
                          </span>
                          <Badge
                            variant={}
                              activity.severity === "high"
                                ? "destructive"
                                : activity.severity === "medium"
                                  ? "default"
                                  : "secondary"
                            }
                            className="text-xs"
                          >
                            {activity.severity}
                          </Badge>
                        </div>
                      </div>
                      {activity.user && (
                        <div className="flex items-center gap-2">
                          <img
                            src={activity.user.avatar || "/placeholder.svg"}
                            alt={activity.user.username}
                            className="w-6 h-6 rounded-full"
                          />
                          <span className="text-xs text-muted-foreground">{activity.user.username}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {performanceData[performanceData.length - 1]?.responseTime || 0}ms
                        </div>
                        <div className="text-sm text-muted-foreground">Avg Response Time</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {performanceData[performanceData.length - 1]?.activeUsers || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">Active Users</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {performanceData[performanceData.length - 1]?.activeParties || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">Active Parties</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">99.9%</div>
                        <div className="text-sm text-muted-foreground">Uptime</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Database</span>
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Healthy
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">API Server</span>
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Healthy
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">WebSocket</span>
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Healthy
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">File Storage</span>
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Healthy
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">CDN</span>
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Healthy
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="management" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Data Export</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => exportData(&quot;users&quot;)}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Export User Data
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => exportData(&quot;parties&quot;)}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Export Party Data
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => exportData(&quot;videos&quot;)}
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Export Video Data
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => exportData(&quot;analytics&quot;)}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Export Analytics
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => router.push(&quot;/dashboard/admin/users&quot;)}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    User Management
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => router.push(&quot;/dashboard/admin/reports&quot;)}
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Content Moderation
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => router.push(&quot;/dashboard/admin/analytics&quot;)}
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Advanced Analytics
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent" onClick={loadDashboardData}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Data
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
