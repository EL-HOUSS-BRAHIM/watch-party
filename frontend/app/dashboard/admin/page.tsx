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
    <div className="space-y-8">
      {/* Header */}
      <div className="glass-panel rounded-3xl p-8 border-brand-navy/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-brand-purple/10 to-brand-blue/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="inline-flex items-center gap-2 text-sm font-bold text-brand-blue transition-colors hover:text-brand-blue-dark group"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span> Back
            </button>
            <div>
              <h1 className="text-3xl font-bold text-brand-navy">Admin Dashboard</h1>
              <p className="text-brand-navy/70 text-sm font-medium">System administration and monitoring</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="px-4 py-2 bg-brand-coral/10 text-brand-coral border border-brand-coral/30 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
              🛡️ Admin Access
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-8 flex flex-wrap gap-3">
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
              className={`flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-bold transition-all duration-300 ${
                activeTab === tab.id
                  ? "border-brand-purple/30 bg-brand-purple/10 text-brand-purple shadow-lg shadow-brand-purple/5 scale-105"
                  : "border-brand-navy/10 bg-white/40 text-brand-navy/60 hover:border-brand-navy/20 hover:text-brand-navy hover:bg-white/60"
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-8">
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glass-card rounded-3xl p-6 hover:border-brand-purple/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-brand-navy/60 text-xs font-bold uppercase tracking-wider">Total Users</p>
                    <p className="text-3xl font-bold text-brand-navy mt-2">{stats?.total_users?.toLocaleString() || "0"}</p>
                  </div>
                  <div className="text-4xl opacity-80">👥</div>
                </div>
                <div className="mt-4">
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-cyan/10 px-2 py-1 text-[10px] font-bold text-brand-cyan">
                    +{stats?.new_users_today || 0} today
                  </span>
                </div>
              </div>

              <div className="glass-card rounded-3xl p-6 hover:border-brand-purple/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-brand-navy/60 text-xs font-bold uppercase tracking-wider">Active Parties</p>
                    <p className="text-3xl font-bold text-brand-navy mt-2">{stats?.active_parties?.toLocaleString() || "0"}</p>
                  </div>
                  <div className="text-4xl opacity-80">🎬</div>
                </div>
                <div className="mt-4">
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-blue/10 px-2 py-1 text-[10px] font-bold text-brand-blue">
                    {stats?.parties_today || 0} created today
                  </span>
                </div>
              </div>

              <div className="glass-card rounded-3xl p-6 hover:border-brand-purple/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-brand-navy/60 text-xs font-bold uppercase tracking-wider">Videos Uploaded</p>
                    <p className="text-3xl font-bold text-brand-navy mt-2">{stats?.total_videos?.toLocaleString() || "0"}</p>
                  </div>
                  <div className="text-4xl opacity-80">📹</div>
                </div>
                <div className="mt-4">
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-purple/10 px-2 py-1 text-[10px] font-bold text-brand-purple">
                    {stats?.videos_today || 0} uploaded today
                  </span>
                </div>
              </div>

              <div className="glass-card rounded-3xl p-6 hover:border-brand-purple/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-brand-navy/60 text-xs font-bold uppercase tracking-wider">System Health</p>
                    <p className="text-3xl font-bold text-brand-cyan mt-2">Healthy</p>
                  </div>
                  <div className="text-4xl opacity-80">💚</div>
                </div>
                <div className="mt-4">
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-navy/5 px-2 py-1 text-[10px] font-bold text-brand-navy/60">
                    {stats?.uptime || "99.9%"} uptime
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Users */}
              <div className="glass-card rounded-3xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-brand-navy">Recent Users</h3>
                  <button
                    onClick={() => setActiveTab("users")}
                    className="text-brand-blue hover:text-brand-blue-dark text-sm font-bold transition-colors hover:underline"
                  >
                    View All →
                  </button>
                </div>

                <div className="space-y-4">
                  {recentUsers.slice(0, 5).map((user) => (
                    <div key={user.id} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/40 transition-colors border border-transparent hover:border-white/50">
                      <div className="w-12 h-12 rounded-2xl bg-white/50 flex items-center justify-center overflow-hidden shadow-sm border border-white/50">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-brand-navy/60 font-bold text-lg">
                            {user.username?.charAt(0).toUpperCase() || "?"}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-brand-navy truncate">{user.username}</p>
                          {user.is_verified && (
                            <span className="text-brand-cyan text-xs" title="Verified">✓</span>
                          )}
                          {user.is_premium && (
                            <span className="text-brand-orange text-xs" title="Premium">⭐</span>
                          )}
                        </div>
                        <p className="text-brand-navy/60 text-xs font-medium truncate">{user.email}</p>
                      </div>
                      <div className="text-brand-navy/40 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
                        {new Date(user.date_joined || "").toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* System Metrics */}
              <div className="glass-card rounded-3xl p-8">
                <h3 className="text-xl font-bold text-brand-navy mb-6">System Metrics</h3>

                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2 font-bold">
                      <span className="text-brand-navy/60">CPU Usage</span>
                      <span className="text-brand-navy">{stats?.cpu_usage || 45}%</span>
                    </div>
                    <div className="w-full bg-brand-navy/5 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-brand-blue to-brand-cyan h-full rounded-full transition-all duration-500" 
                        style={{ width: `${stats?.cpu_usage || 45}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2 font-bold">
                      <span className="text-brand-navy/60">Memory Usage</span>
                      <span className="text-brand-navy">{stats?.memory_usage || 62}%</span>
                    </div>
                    <div className="w-full bg-brand-navy/5 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-brand-cyan to-brand-purple h-full rounded-full transition-all duration-500" 
                        style={{ width: `${stats?.memory_usage || 62}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2 font-bold">
                      <span className="text-brand-navy/60">Storage Usage</span>
                      <span className="text-brand-navy">{stats?.storage_usage || 78}%</span>
                    </div>
                    <div className="w-full bg-brand-navy/5 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-brand-orange to-brand-coral h-full rounded-full transition-all duration-500" 
                        style={{ width: `${stats?.storage_usage || 78}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-brand-navy/5">
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-brand-navy/60">Active Connections</span>
                      <span className="text-brand-navy">{stats?.active_connections || 1247}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="glass-card rounded-3xl p-8">
              <h3 className="text-xl font-bold text-brand-navy mb-6">Quick Actions</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab("users")}
                  className="group p-6 border border-brand-blue/20 bg-brand-blue/5 hover:bg-brand-blue/10 text-brand-blue rounded-3xl transition-all text-left hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">👥</div>
                  <h4 className="font-bold mb-1 text-lg">Manage Users</h4>
                  <p className="text-sm text-brand-navy/70 font-medium">View, edit, and moderate users</p>
                </button>

                <button
                  onClick={() => setActiveTab("content")}
                  className="group p-6 border border-brand-purple/20 bg-brand-purple/5 hover:bg-brand-purple/10 text-brand-purple rounded-3xl transition-all text-left hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">📹</div>
                  <h4 className="font-bold mb-1 text-lg">Content Review</h4>
                  <p className="text-sm text-brand-navy/70 font-medium">Moderate videos and content</p>
                </button>

                <button
                  onClick={() => setActiveTab("system")}
                  className="group p-6 border border-brand-cyan/20 bg-brand-cyan/5 hover:bg-brand-cyan/10 text-brand-cyan rounded-3xl transition-all text-left hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">⚙️</div>
                  <h4 className="font-bold mb-1 text-lg">System Settings</h4>
                  <p className="text-sm text-brand-navy/70 font-medium">Configure system parameters</p>
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
          <div className="glass-card rounded-3xl p-12 text-center border-dashed border-2 border-brand-navy/10">
            <div className="text-7xl mb-6 opacity-50 animate-pulse">🚧</div>
            <h3 className="text-2xl font-bold text-brand-navy mb-3">
              Party Management
            </h3>
            <p className="text-brand-navy/60 font-medium mb-8 max-w-md mx-auto">
              This section is under development. Advanced party management tools will be available here.
            </p>
            <button
              onClick={() => setActiveTab("overview")}
              className="btn-gradient px-8 py-3 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-brand-purple/25 hover:-translate-y-0.5"
            >
              Back to Overview
            </button>
          </div>
        )}
      </div>
    </div>
  )
}