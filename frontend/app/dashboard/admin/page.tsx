"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { adminApi, User, SystemStats } from "@/lib/api-client"
import UserManagement from "@/components/admin/UserManagement"
import ContentModeration from "@/components/admin/ContentModeration"
import SystemManagement from "@/components/admin/SystemManagement"

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [recentUsers, setRecentUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "parties" | "content" | "system">("overview")

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [statsResponse, usersResponse] = await Promise.all([
        adminApi.getSystemStats(),
        adminApi.getUsers({ page_size: 10, ordering: "-date_joined" })
      ])
      
      setStats(statsResponse)
      setRecentUsers(Array.isArray(usersResponse) ? usersResponse : (usersResponse.results || []))
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-brand-blue border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-white/60">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      {/* Header */}
      <div className="bg-black/20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/dashboard")}
                className="text-white/60 hover:text-white transition-colors"
              >
                ←
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-white/60 text-sm">System administration and monitoring</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-red-600/20 text-brand-coral-light rounded-full text-sm font-medium">
                🛡️ Admin Access
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-black/10 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-8">
            {[
              { id: "overview", label: "Overview", icon: "📊" },
              { id: "users", label: "Users", icon: "👥" },
              { id: "parties", label: "Parties", icon: "🎬" },
              { id: "content", label: "Content", icon: "📹" },
              { id: "system", label: "System", icon: "⚙️" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "text-brand-blue-light border-blue-400"
                    : "text-white/60 border-transparent hover:text-white"
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm">Total Users</p>
                    <p className="text-2xl font-bold text-white">{stats?.total_users?.toLocaleString() || "0"}</p>
                  </div>
                  <div className="text-3xl">👥</div>
                </div>
                <div className="mt-2">
                  <span className="text-brand-cyan-light text-sm">
                    +{stats?.new_users_today || 0} today
                  </span>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm">Active Parties</p>
                    <p className="text-2xl font-bold text-white">{stats?.active_parties?.toLocaleString() || "0"}</p>
                  </div>
                  <div className="text-3xl">🎬</div>
                </div>
                <div className="mt-2">
                  <span className="text-brand-blue-light text-sm">
                    {stats?.parties_today || 0} created today
                  </span>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm">Videos Uploaded</p>
                    <p className="text-2xl font-bold text-white">{stats?.total_videos?.toLocaleString() || "0"}</p>
                  </div>
                  <div className="text-3xl">📹</div>
                </div>
                <div className="mt-2">
                  <span className="text-brand-purple-light text-sm">
                    {stats?.videos_today || 0} uploaded today
                  </span>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm">System Health</p>
                    <p className="text-2xl font-bold text-brand-cyan-light">Healthy</p>
                  </div>
                  <div className="text-3xl">💚</div>
                </div>
                <div className="mt-2">
                  <span className="text-white/60 text-sm">
                    {stats?.uptime || "99.9%"} uptime
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Users */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Recent Users</h3>
                  <button
                    onClick={() => setActiveTab("users")}
                    className="text-brand-blue-light hover:text-brand-blue-light text-sm"
                  >
                    View All →
                  </button>
                </div>

                <div className="space-y-4">
                  {recentUsers.slice(0, 5).map((user) => (
                    <div key={user.id} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-white/60">
                            {user.username?.charAt(0).toUpperCase() || "?"}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-white">{user.username}</p>
                          {user.is_verified && (
                            <span className="text-brand-cyan-light text-sm">✓</span>
                          )}
                          {user.is_premium && (
                            <span className="text-brand-orange-light text-sm">⭐</span>
                          )}
                        </div>
                        <p className="text-white/60 text-sm">{user.email}</p>
                      </div>
                      <div className="text-white/40 text-xs">
                        {new Date(user.date_joined || "").toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* System Metrics */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-6">System Metrics</h3>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-white/60">CPU Usage</span>
                      <span className="text-white">{stats?.cpu_usage || 45}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div 
                        className="bg-brand-blue h-2 rounded-full" 
                        style={{ width: `${stats?.cpu_usage || 45}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-white/60">Memory Usage</span>
                      <span className="text-white">{stats?.memory_usage || 62}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div 
                        className="bg-brand-cyan h-2 rounded-full" 
                        style={{ width: `${stats?.memory_usage || 62}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-white/60">Storage Usage</span>
                      <span className="text-white">{stats?.storage_usage || 78}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div 
                        className="bg-brand-orange h-2 rounded-full" 
                        style={{ width: `${stats?.storage_usage || 78}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-white/60">Active Connections</span>
                      <span className="text-white">{stats?.active_connections || 1247}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Quick Actions</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab("users")}
                  className="p-4 bg-blue-600/20 hover:bg-blue-600/30 text-brand-blue-light rounded-lg transition-colors text-left"
                >
                  <div className="text-2xl mb-2">👥</div>
                  <h4 className="font-medium mb-1">Manage Users</h4>
                  <p className="text-sm text-brand-blue-light/80">View, edit, and moderate users</p>
                </button>

                <button
                  onClick={() => setActiveTab("content")}
                  className="p-4 bg-purple-600/20 hover:bg-purple-600/30 text-brand-purple-light rounded-lg transition-colors text-left"
                >
                  <div className="text-2xl mb-2">📹</div>
                  <h4 className="font-medium mb-1">Content Review</h4>
                  <p className="text-sm text-brand-purple-light/80">Moderate videos and content</p>
                </button>

                <button
                  onClick={() => setActiveTab("system")}
                  className="p-4 bg-green-600/20 hover:bg-green-600/30 text-brand-cyan-light rounded-lg transition-colors text-left"
                >
                  <div className="text-2xl mb-2">⚙️</div>
                  <h4 className="font-medium mb-1">System Settings</h4>
                  <p className="text-sm text-brand-cyan-light/80">Configure system parameters</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <UserManagement onBack={() => setActiveTab("overview")} />
        )}

        {activeTab === "content" && (
          <ContentModeration onBack={() => setActiveTab("overview")} />
        )}

        {activeTab === "system" && (
          <SystemManagement onBack={() => setActiveTab("overview")} />
        )}

        {activeTab === "parties" && (
          <div className="bg-white/5 border border-white/10 rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">🚧</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Party Management
            </h3>
            <p className="text-white/60 mb-6">
              This section is under development. Advanced party management tools will be available here.
            </p>
            <button
              onClick={() => setActiveTab("overview")}
              className="px-6 py-3 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-lg font-medium transition-colors"
            >
              Back to Overview
            </button>
          </div>
        )}
      </div>
    </div>
  )
}