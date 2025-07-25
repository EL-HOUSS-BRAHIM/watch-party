"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  Video,
  Calendar,
  AlertTriangle,
  Shield,
  Settings,
  FileText,
  Activity,
  DollarSign,
  Crown,
  Loader2,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import UserManagement from "@/components/admin/user-management"
import ContentModeration from "@/components/admin/content-moderation"
import SystemLogs from "@/components/admin/system-logs"
import SystemSettings from "@/components/admin/system-settings"
import AnalyticsDashboard from "@/components/admin/analytics-dashboard"

interface AdminStats {
  users: {
    total: number
    active: number
    new: number
    banned: number
  }
  parties: {
    total: number
    active: number
    scheduled: number
  }
  videos: {
    total: number
    processing: number
    storage: string
  }
  reports: {
    pending: number
    resolved: number
    total: number
  }
  revenue: {
    monthly: number
    total: number
    subscriptions: number
  }
  system: {
    uptime: string
    version: string
    lastUpdate: string
  }
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  const { user } = useAuth()

  useEffect(() => {
    loadAdminStats()
  }, [])

  const loadAdminStats = async () => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch("/api/admin/dashboard/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Failed to load admin stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (user?.role !== "admin") {
    return (
      <div className="text-center py-8">
        <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Access Denied</h3>
        <p className="text-gray-600">You don't have permission to access the admin dashboard.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Admin Dashboard
          </h1>
          <p className="text-gray-600">Manage your watch party platform</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Crown className="h-3 w-3" />
            Administrator
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="moderation">Moderation</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="logs">System Logs</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Loading dashboard...</p>
            </div>
          ) : stats ? (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Users</p>
                        <p className="text-3xl font-bold">{stats.users.total.toLocaleString()}</p>
                        <p className="text-sm text-green-600">+{stats.users.new} new</p>
                      </div>
                      <Users className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Active Parties</p>
                        <p className="text-3xl font-bold">{stats.parties.active}</p>
                        <p className="text-sm text-gray-500">{stats.parties.total} total</p>
                      </div>
                      <Calendar className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Videos</p>
                        <p className="text-3xl font-bold">{stats.videos.total.toLocaleString()}</p>
                        <p className="text-sm text-yellow-600">{stats.videos.processing} processing</p>
                      </div>
                      <Video className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                        <p className="text-3xl font-bold">${stats.revenue.monthly.toLocaleString()}</p>
                        <p className="text-sm text-green-600">{stats.revenue.subscriptions} subscriptions</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Status Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      Pending Reports
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-orange-600">{stats.reports.pending}</p>
                        <p className="text-sm text-gray-500">Require attention</p>
                      </div>
                      <Badge variant="outline" className="text-orange-600">
                        {stats.reports.total} total
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Activity className="h-5 w-5 text-green-500" />
                      System Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Uptime</span>
                        <Badge variant="default" className="bg-green-500">
                          {stats.system.uptime}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Version</span>
                        <span className="text-sm font-mono">{stats.system.version}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-500" />
                      User Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Active Users</span>
                        <span className="text-sm font-semibold text-green-600">{stats.users.active}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Banned Users</span>
                        <span className="text-sm font-semibold text-red-600">{stats.users.banned}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common administrative tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button
                      onClick={() => setActiveTab("users")}
                      className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                      <Users className="h-6 w-6 text-blue-500 mb-2" />
                      <p className="font-medium">Manage Users</p>
                      <p className="text-sm text-gray-500">View and moderate users</p>
                    </button>

                    <button
                      onClick={() => setActiveTab("moderation")}
                      className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                      <Shield className="h-6 w-6 text-orange-500 mb-2" />
                      <p className="font-medium">Content Moderation</p>
                      <p className="text-sm text-gray-500">Review reported content</p>
                    </button>

                    <button
                      onClick={() => setActiveTab("logs")}
                      className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                      <FileText className="h-6 w-6 text-purple-500 mb-2" />
                      <p className="font-medium">System Logs</p>
                      <p className="text-sm text-gray-500">Monitor system activity</p>
                    </button>

                    <button
                      onClick={() => setActiveTab("settings")}
                      className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                      <Settings className="h-6 w-6 text-gray-500 mb-2" />
                      <p className="font-medium">System Settings</p>
                      <p className="text-sm text-gray-500">Configure platform</p>
                    </button>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Failed to Load Dashboard</h3>
              <p className="text-gray-600">Unable to load admin dashboard data.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        <TabsContent value="moderation">
          <ContentModeration />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsDashboard />
        </TabsContent>

        <TabsContent value="logs">
          <SystemLogs />
        </TabsContent>

        <TabsContent value="settings">
          <SystemSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}
