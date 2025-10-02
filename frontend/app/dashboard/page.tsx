"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  partiesApi,
  userApi,
  analyticsApi,
  WatchParty,
  Analytics,
  User,
  NormalizedRealTimeAnalytics
} from "@/lib/api-client"

interface QuickStat {
  label: string
  value: string | number
  icon: string
  color?: string
}

const initialRealTimeStats: NormalizedRealTimeAnalytics = {
  timestamp: "",
  onlineUsers: 0,
  activeParties: 0,
  recentActivity: [],
  engagement: {
    concurrentViewers: 0,
    messagesPerMinute: 0,
    reactionsPerMinute: 0
  },
  systemHealth: {
    systemLoad: 0,
    cpuUsage: 0,
    memoryUsage: 0,
    diskUsage: 0,
    networkTraffic: 0
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<Analytics | null>(null)
  const [recentParties, setRecentParties] = useState<WatchParty[]>([])
  const [loading, setLoading] = useState(true)
  const [newPartyName, setNewPartyName] = useState("")
  const [movieUrl, setMovieUrl] = useState("")
  const [showWelcome, setShowWelcome] = useState(false)
  const [activeView, setActiveView] = useState<"overview" | "quick-actions" | "analytics">("overview")
  const [liveStats, setLiveStats] = useState<NormalizedRealTimeAnalytics>(initialRealTimeStats)

  useEffect(() => {
    loadDashboardData()
    loadRealTimeStats()
    
    // Fetch real-time stats every 30 seconds
    const interval = setInterval(() => {
      loadRealTimeStats()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const loadRealTimeStats = async () => {
    try {
      const realTimeData = await analyticsApi.getRealTime()
      setLiveStats(realTimeData)
    } catch (error) {
      console.error("Failed to load real-time stats:", error)
      // Keep existing values on error
    }
  }

  const loadDashboardData = async () => {
    try {
      const [userResponse, statsResponse, partiesResponse] = await Promise.all([
        userApi.getProfile(),
        analyticsApi.getUserStats(),
        partiesApi.getRecent({ page_size: 5 })
      ])
      
      setUser(userResponse)
      setStats(statsResponse as Analytics)
      setRecentParties(partiesResponse.results || [])
      
      // Show welcome message for new users
      if (userResponse.date_joined) {
        const joinedDate = new Date(userResponse.date_joined)
        const daysSinceJoined = Math.floor((Date.now() - joinedDate.getTime()) / (1000 * 60 * 60 * 24))
        setShowWelcome(daysSinceJoined <= 7)
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateParty = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newPartyName.trim()) {
      return
    }

    try {
      const party = await partiesApi.create({
        title: newPartyName,
        description: "Created from dashboard",
        visibility: "public"
      })
      
      setNewPartyName("")
      router.push(`/party/${party.id}`)
    } catch (error) {
      console.error("Failed to create party:", error)
    }
  }

  const handleAddMovie = async () => {
    if (!movieUrl.trim()) {
      return
    }

    try {
      // TODO: Add video validation and creation
      setMovieUrl("")
      // Could show success toast here
    } catch (error) {
      console.error("Failed to add movie:", error)
    }
  }

  const handleConnectDrive = async () => {
    try {
      const response = await userApi.getProfile() // Check if already connected via profile
      // Redirect to Google Drive auth
      router.push("/dashboard/integrations")
    } catch (error) {
      console.error("Failed to connect drive:", error)
    }
  }

  const quickStats: QuickStat[] = [
    {
      label: "Online Users",
      value: liveStats.onlineUsers.toLocaleString(),
      icon: "👥",
      color: "from-blue-500 to-cyan-500"
    },
    {
      label: "Active Parties",
      value: liveStats.activeParties.toString(),
      icon: "🎬",
      color: "from-purple-500 to-pink-500"
    },
    {
      label: "System Load",
      value: `${liveStats.systemHealth.systemLoad.toFixed(1)}%`,
      icon: "🖥️",
      color: "from-green-500 to-emerald-500"
    },
    {
      label: "Messages / min",
      value: liveStats.engagement.messagesPerMinute.toLocaleString(),
      icon: "💬",
      color: "from-orange-500 to-red-500"
    }
  ]

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case "up": return "📈"
      case "down": return "📉"
      default: return "➡️"
    }
  }

  const getTimeOfDayGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 17) return "Good afternoon"
    return "Good evening"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white/60">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header with Navigation Pills */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
              {getTimeOfDayGreeting()}, {user?.first_name || user?.username || "Cinephile"}!
            </h1>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-sm font-medium">Live</span>
            </div>
          </div>
          <p className="text-white/70 text-lg">
            {showWelcome 
              ? "Welcome to the ultimate movie experience! Let's create some magic ✨"
              : "Ready to dive into today's cinematic adventures?"
            }
          </p>
        </div>
        
        {/* View Toggle Pills */}
        <div className="flex items-center gap-2 bg-black/20 p-1 rounded-xl border border-white/10">
          {[
            { key: "overview", label: "Overview", icon: "🏠" },
            { key: "quick-actions", label: "Quick Actions", icon: "⚡" },
            { key: "analytics", label: "Analytics", icon: "📊" }
          ].map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setActiveView(key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeView === key
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              <span>{icon}</span>
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Global Stats Bar */}
      <div className="bg-gradient-to-r from-black/20 via-purple-900/20 to-black/20 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {quickStats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className={`w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br ${stat.color || 'from-gray-500 to-gray-600'} flex items-center justify-center text-2xl shadow-lg`}>
                {stat.icon}
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-white/60">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dynamic Content Based on Active View */}
      {activeView === "overview" && (
        <>
          {/* Featured Actions Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Create Party - Enhanced */}
            <div className="lg:col-span-1 bg-gradient-to-br from-purple-900/30 via-purple-800/20 to-blue-900/30 border border-purple-500/20 rounded-2xl p-8 backdrop-blur-sm hover:border-purple-400/40 transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg">
                  🎬
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Host a Party</h3>
                  <p className="text-white/60">Start watching in seconds</p>
                </div>
              </div>
              
              <form onSubmit={handleCreateParty} className="space-y-4">
                <input
                  type="text"
                  value={newPartyName}
                  onChange={(e) => setNewPartyName(e.target.value)}
                  placeholder="Give your party an epic name..."
                  className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 backdrop-blur-sm"
                />
                <button
                  type="submit"
                  disabled={!newPartyName.trim()}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                      Creating...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <span>✨</span>
                      Create & Launch Party
                    </div>
                  )}
                </button>
              </form>
            </div>

            {/* Recent Activity */}
            <div className="lg:col-span-2 bg-gradient-to-br from-blue-900/30 via-slate-800/20 to-gray-900/30 border border-blue-500/20 rounded-2xl p-8 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span>📺</span>
                  Recent Parties
                </h3>
                <Link 
                  href="/dashboard/parties" 
                  className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-2 hover:bg-white/10 px-3 py-2 rounded-lg transition-all"
                >
                  View All
                  <span>→</span>
                </Link>
              </div>
              
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {recentParties.length > 0 ? (
                  recentParties.map((party) => (
                    <div key={party.id} className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-200 group">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                        {party.title.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-semibold truncate">{party.title}</h4>
                        <div className="flex items-center gap-3 text-sm text-white/60">
                          <span>👥 {party.participant_count} watching</span>
                          <span>•</span>
                          <span>{new Date(party.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                          party.status === "live" ? "bg-green-600/20 text-green-400 animate-pulse" :
                          party.status === "ended" ? "bg-gray-600/20 text-gray-400" :
                          "bg-blue-600/20 text-blue-400"
                        }`}>
                          {party.status === "live" ? "🔴 Live" : 
                           party.status === "ended" ? "✅ Ended" : 
                           "📅 Scheduled"}
                        </span>
                        <button 
                          onClick={() => router.push(`/party/${party.id}`)}
                          className="opacity-0 group-hover:opacity-100 px-3 py-1 bg-blue-600/20 text-blue-400 rounded-lg text-sm font-medium transition-all hover:bg-blue-600/30"
                        >
                          Join
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🎬</div>
                    <p className="text-white/60 mb-6">No recent parties</p>
                    <button
                      onClick={() => router.push("/dashboard/parties/create")}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-200"
                    >
                      Create Your First Party
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {activeView === "quick-actions" && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          {[
            {
              title: "Upload Content",
              description: "Add videos to your library",
              icon: "📱",
              color: "from-green-500 to-emerald-600",
              action: () => router.push("/dashboard/videos/upload")
            },
            {
              title: "Join Community",
              description: "Connect with other movie lovers",
              icon: "🌟",
              color: "from-orange-500 to-red-600",
              action: () => router.push("/dashboard/social")
            },
            {
              title: "Discover Events",
              description: "Find exciting watch events",
              icon: "📅",
              color: "from-blue-500 to-cyan-600",
              action: () => router.push("/dashboard/events")
            },
            {
              title: "Browse Library",
              description: "Explore your video collection",
              icon: "📚",
              color: "from-purple-500 to-pink-600",
              action: () => router.push("/dashboard/videos")
            },
            {
              title: "Find Friends",
              description: "Connect with other users",
              icon: "👥",
              color: "from-indigo-500 to-purple-600",
              action: () => router.push("/dashboard/friends")
            },
            {
              title: "Get Support",
              description: "Help when you need it",
              icon: "🎫",
              color: "from-gray-500 to-slate-600",
              action: () => router.push("/dashboard/support")
            }
          ].map((item, index) => (
            <div
              key={index}
              onClick={item.action}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 cursor-pointer group hover:border-white/20 hover:shadow-lg"
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-200 shadow-lg`}>
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
              <p className="text-white/60 mb-4">{item.description}</p>
              <div className="text-blue-400 font-medium group-hover:text-blue-300 transition-colors">
                Get Started →
              </div>
            </div>
          ))}
        </div>
      )}

      {activeView === "analytics" && (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Watch Time Chart */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span>📊</span>
              Your Activity
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-white/70">Total Watch Time</span>
                <span className="text-white font-bold">{Math.round((stats?.watch_time_minutes || 0) / 60)}h</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70">Parties Hosted</span>
                <span className="text-white font-bold">{stats?.total_parties || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70">Videos Uploaded</span>
                <span className="text-white font-bold">{stats?.total_videos || 0}</span>
              </div>
            </div>
          </div>

          {/* Community Stats */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span>🌍</span>
              Platform Pulse
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-white/70">Online Users</span>
                <span className="text-green-400 font-bold">{liveStats.onlineUsers.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70">Active Parties</span>
                <span className="text-purple-400 font-bold">{liveStats.activeParties}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70">Concurrent Viewers</span>
                <span className="text-blue-400 font-bold">{liveStats.engagement.concurrentViewers.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70">Messages / Minute</span>
                <span className="text-cyan-400 font-bold">{liveStats.engagement.messagesPerMinute.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70">Reactions / Minute</span>
                <span className="text-amber-400 font-bold">{liveStats.engagement.reactionsPerMinute.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span>🛡️</span>
              System Health
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-white/70">System Load</span>
                <span className="text-emerald-400 font-bold">{liveStats.systemHealth.systemLoad.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70">CPU Usage</span>
                <span className="text-emerald-400 font-bold">{liveStats.systemHealth.cpuUsage.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70">Memory Usage</span>
                <span className="text-emerald-400 font-bold">{liveStats.systemHealth.memoryUsage.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70">Disk Usage</span>
                <span className="text-emerald-400 font-bold">{liveStats.systemHealth.diskUsage.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70">Network Traffic</span>
                <span className="text-emerald-400 font-bold">{liveStats.systemHealth.networkTraffic.toFixed(1)} MB/s</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Pro Tip Section */}
      <div className="bg-gradient-to-r from-purple-900/40 via-blue-900/40 to-purple-900/40 border border-purple-500/30 rounded-2xl p-8 backdrop-blur-sm">
        <div className="flex items-start gap-6">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg">
            💡
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-white mb-3">Pro Tip</h3>
            <p className="text-white/80 text-lg mb-4 leading-relaxed">
              {showWelcome 
                ? "Start by connecting your streaming services and invite friends to create the ultimate synchronized watch experience!"
                : "Use our AI-powered recommendations to discover content that matches your group's mood and preferences perfectly."
              }
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => router.push(showWelcome ? "/dashboard/integrations" : "/dashboard/search")}
                className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-yellow-500/25"
              >
                {showWelcome ? "Connect Services" : "Explore AI Picks"}
              </button>
              <button className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-medium transition-all duration-200">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
