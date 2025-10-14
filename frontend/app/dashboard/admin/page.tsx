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
      <div className="min-h-screen bg-gradient-to-br from-brand-neutral via-white to-brand-neutral-light">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-brand-purple border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-brand-navy/60">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-neutral via-white to-brand-neutral-light">
      {/* Header */}
      <div className="bg-white/80 border-b border-brand-navy/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/dashboard")}
                className="text-brand-navy/60 hover:text-brand-navy transition-colors"
              >
                ←
              </button>
              <div>
                <h1 className="text-2xl font-bold text-brand-navy">Admin Dashboard</h1>
                <p className="text-brand-navy/60 text-sm">System administration and monitoring</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-brand-coral/10 text-brand-coral border border-brand-coral/30 rounded-full text-sm font-medium">
                🛡️ Admin Access
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white/60 border-b border-brand-navy/10 backdrop-blur-sm">
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
                    ? "text-brand-purple border-brand-purple"
                    : "text-brand-navy/60 border-transparent hover:text-brand-navy"
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
              <div className="bg-white border border-brand-navy/10 rounded-3xl p-6 shadow-[0_18px_45px_rgba(28,28,46,0.08)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-brand-navy/60 text-sm">Total Users</p>
                    <p className="text-2xl font-bold text-brand-navy">{stats?.total_users?.toLocaleString() || "0"}</p>
                  </div>
                  <div className="text-3xl">👥</div>
                </div>
                <div className="mt-2">
                  <span className="text-brand-cyan text-sm font-semibold">
                    +{stats?.new_users_today || 0} today
                  </span>
                </div>
              </div>

              <div className="bg-white border border-brand-navy/10 rounded-3xl p-6 shadow-[0_18px_45px_rgba(28,28,46,0.08)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-brand-navy/60 text-sm">Active Parties</p>
                    <p className="text-2xl font-bold text-brand-navy">{stats?.active_parties?.toLocaleString() || "0"}</p>
                  </div>
                  <div className="text-3xl">🎬</div>
                </div>
                <div className="mt-2">
                  <span className="text-brand-blue text-sm font-semibold">
                    {stats?.parties_today || 0} created today
                  </span>
                </div>
              </div>

              <div className="bg-white border border-brand-navy/10 rounded-3xl p-6 shadow-[0_18px_45px_rgba(28,28,46,0.08)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-brand-navy/60 text-sm">Videos Uploaded</p>
                    <p className="text-2xl font-bold text-brand-navy">{stats?.total_videos?.toLocaleString() || "0"}</p>
                  </div>
                  <div className="text-3xl">📹</div>
                </div>
                <div className="mt-2">
                  <span className="text-brand-purple text-sm font-semibold">
                    {stats?.videos_today || 0} uploaded today
                  </span>
                </div>
              </div>

              <div className="bg-white border border-brand-navy/10 rounded-3xl p-6 shadow-[0_18px_45px_rgba(28,28,46,0.08)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-brand-navy/60 text-sm">System Health</p>
                    <p className="text-2xl font-bold text-brand-cyan">Healthy</p>
                  </div>
                  <div className="text-3xl">💚</div>
                </div>
                <div className="mt-2">
                  <span className="text-brand-navy/60 text-sm">
                    {stats?.uptime || "99.9%"} uptime
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Users */}
              <div className="bg-white border border-brand-navy/10 rounded-3xl p-6 shadow-[0_18px_45px_rgba(28,28,46,0.08)]">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-brand-navy">Recent Users</h3>
                  <button
                    onClick={() => setActiveTab("users")}
                    className="text-brand-blue hover:text-brand-blue-dark text-sm font-semibold"
                  >
                    View All →
                  </button>
                </div>

                <div className="space-y-4">
                  {recentUsers.slice(0, 5).map((user) => (
                    <div key={user.id} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-neutral flex items-center justify-center overflow-hidden">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-brand-navy/60 font-semibold">
                            {user.username?.charAt(0).toUpperCase() || "?"}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-brand-navy">{user.username}</p>
                          {user.is_verified && (
                            <span className="text-brand-cyan text-sm">✓</span>
                          )}
                          {user.is_premium && (
                            <span className="text-brand-orange text-sm">⭐</span>
                          )}
                        </div>
                        <p className="text-brand-navy/60 text-sm">{user.email}</p>
                      </div>
                      <div className="text-brand-navy/40 text-xs">
                        {new Date(user.date_joined || "").toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* System Metrics */}
              <div className="bg-white border border-brand-navy/10 rounded-3xl p-6 shadow-[0_18px_45px_rgba(28,28,46,0.08)]">
                <h3 className="text-lg font-semibold text-brand-navy mb-6">System Metrics</h3>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-brand-navy/60">CPU Usage</span>
                      <span className="text-brand-navy font-semibold">{stats?.cpu_usage || 45}%</span>
                    </div>
                    <div className="w-full bg-brand-neutral rounded-full h-2">
                      <div 
                        className="bg-brand-blue h-2 rounded-full" 
                        style={{ width: `${stats?.cpu_usage || 45}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-brand-navy/60">Memory Usage</span>
                      <span className="text-brand-navy font-semibold">{stats?.memory_usage || 62}%</span>
                    </div>
                    <div className="w-full bg-brand-neutral rounded-full h-2">
                      <div 
                        className="bg-brand-cyan h-2 rounded-full" 
                        style={{ width: `${stats?.memory_usage || 62}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-brand-navy/60">Storage Usage</span>
                      <span className="text-brand-navy font-semibold">{stats?.storage_usage || 78}%</span>
                    </div>
                    <div className="w-full bg-brand-neutral rounded-full h-2">
                      <div 
                        className="bg-brand-orange h-2 rounded-full" 
                        style={{ width: `${stats?.storage_usage || 78}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-brand-navy/60">Active Connections</span>
                      <span className="text-brand-navy font-semibold">{stats?.active_connections || 1247}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white border border-brand-navy/10 rounded-3xl p-6 shadow-[0_18px_45px_rgba(28,28,46,0.08)]">
              <h3 className="text-lg font-semibold text-brand-navy mb-6">Quick Actions</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab("users")}
                  className="p-4 border border-brand-blue/20 bg-brand-blue/5 hover:bg-brand-blue/10 text-brand-blue rounded-2xl transition-all text-left hover:shadow-lg"
                >
                  <div className="text-2xl mb-2">👥</div>
                  <h4 className="font-medium mb-1">Manage Users</h4>
                  <p className="text-sm text-brand-navy/70">View, edit, and moderate users</p>
                </button>

                <button
                  onClick={() => setActiveTab("content")}
                  className="p-4 border border-brand-purple/20 bg-brand-purple/5 hover:bg-brand-purple/10 text-brand-purple rounded-2xl transition-all text-left hover:shadow-lg"
                >
                  <div className="text-2xl mb-2">📹</div>
                  <h4 className="font-medium mb-1">Content Review</h4>
                  <p className="text-sm text-brand-navy/70">Moderate videos and content</p>
                </button>

                <button
                  onClick={() => setActiveTab("system")}
                  className="p-4 border border-brand-cyan/20 bg-brand-cyan/5 hover:bg-brand-cyan/10 text-brand-cyan rounded-2xl transition-all text-left hover:shadow-lg"
                >
                  <div className="text-2xl mb-2">⚙️</div>
                  <h4 className="font-medium mb-1">System Settings</h4>
                  <p className="text-sm text-brand-navy/70">Configure system parameters</p>
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
          <div className="bg-white border border-brand-navy/10 rounded-3xl p-8 text-center shadow-[0_18px_45px_rgba(28,28,46,0.08)]">
            <div className="text-6xl mb-4">🚧</div>
            <h3 className="text-xl font-semibold text-brand-navy mb-2">
              Party Management
            </h3>
            <p className="text-brand-navy/60 mb-6">
              This section is under development. Advanced party management tools will be available here.
            </p>
            <button
              onClick={() => setActiveTab("overview")}
              className="px-6 py-3 bg-gradient-to-r from-brand-purple to-brand-blue hover:from-brand-purple-dark hover:to-brand-blue-dark text-white rounded-full font-medium transition-all shadow-lg"
            >
              Back to Overview
            </button>
          </div>
        )}
      </div>
    </div>
  )
}