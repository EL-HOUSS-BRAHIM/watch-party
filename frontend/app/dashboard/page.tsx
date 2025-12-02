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
  const [showWelcome, setShowWelcome] = useState(false)
  const [activeView, setActiveView] = useState<"overview" | "quick-actions" | "analytics">("overview")
  const [liveStats, setLiveStats] = useState<NormalizedRealTimeAnalytics>(initialRealTimeStats)

  useEffect(() => {
    loadDashboardData()
    loadRealTimeStats()

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
      // Use room_code for navigation instead of id
      const roomCode = (party as any).room_code || party.id
      router.push(`/party/${roomCode}`)
    } catch (error) {
      console.error("Failed to create party:", error)
    }
  }

  const quickStats: QuickStat[] = [
    {
      label: "Online Users",
      value: liveStats.onlineUsers.toLocaleString(),
      icon: "👥",
      color: "from-brand-blue to-brand-cyan"
    },
    {
      label: "Active Parties",
      value: liveStats.activeParties.toString(),
      icon: "🎬",
      color: "from-brand-purple to-brand-magenta"
    },
    {
      label: "System Load",
      value: `${liveStats.systemHealth.systemLoad.toFixed(1)}%`,
      icon: "🖥️",
      color: "from-brand-cyan to-brand-blue"
    },
    {
      label: "Messages / min",
      value: liveStats.engagement.messagesPerMinute.toLocaleString(),
      icon: "💬",
      color: "from-brand-orange to-brand-coral"
    }
  ]

  const getTimeOfDayGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 17) return "Good afternoon"
    return "Good evening"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="loading-reel mx-auto mb-6"></div>
          <p className="text-brand-navy/60 font-medium animate-pulse">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome Section */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="glass-card rounded-2xl p-4 xs:p-6 sm:rounded-3xl sm:p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-48 h-48 sm:w-64 sm:h-64 bg-gradient-to-br from-brand-purple/20 to-brand-magenta/20 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-700"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <div>
                <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-brand-purple/80">{getTimeOfDayGreeting()}</p>
                <h1 className="mt-2 text-2xl xs:text-3xl sm:text-4xl font-bold tracking-tight text-brand-navy">
                  Welcome back, <span className="gradient-text">{user?.first_name || user?.username || "Cinephile"}</span>!
                </h1>
                <p className="mt-2 sm:mt-3 text-sm sm:text-base lg:text-lg text-brand-navy/70 max-w-xl">
                  {showWelcome
                    ? "You're days away from your first unforgettable watch party—set the mood and invite your crew."
                    : "Pick up where you left off, schedule your next event, or explore what's trending."}
                </p>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 rounded-full border border-brand-cyan/30 bg-brand-cyan/5 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-brand-cyan backdrop-blur-sm w-fit">
                <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-cyan opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-brand-cyan"></span>
                </span>
                <span className="hidden xs:inline">Live sync online</span>
                <span className="xs:hidden">Online</span>
              </div>
            </div>

            <div className="mt-4 sm:mt-8 flex flex-wrap gap-2 sm:gap-3">
              {[{ key: "overview", label: "Overview", icon: "🏠" }, { key: "quick-actions", label: "Quick actions", icon: "⚡" }, { key: "analytics", label: "Analytics", icon: "📊" }].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveView(tab.key as typeof activeView)}
                  className={`flex items-center gap-1.5 sm:gap-2 rounded-full px-3 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-semibold transition-all duration-300 min-h-[40px] sm:min-h-[44px] ${
                    activeView === tab.key
                      ? "bg-brand-navy text-white shadow-lg shadow-brand-navy/20 scale-105"
                      : "bg-white/50 text-brand-navy/70 hover:bg-white hover:text-brand-navy border border-transparent hover:border-white/60"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span className="hidden xs:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Stats Card */}
        <div className="glass-card rounded-2xl p-4 xs:p-5 sm:rounded-3xl sm:p-6 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-brand-blue via-brand-purple to-brand-magenta opacity-50"></div>
          <h2 className="text-base sm:text-lg font-bold text-brand-navy flex items-center gap-2">
            <span className="text-lg sm:text-xl">⚡</span> Today's highlights
          </h2>
          <div className="mt-4 sm:mt-5 space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between rounded-xl sm:rounded-2xl bg-white/40 border border-white/50 px-3 py-2.5 sm:px-4 sm:py-3 transition-transform hover:scale-[1.02]">
              <span className="text-xs sm:text-sm text-brand-navy/70">Guests waiting</span>
              <span className="font-bold text-brand-blue text-sm sm:text-base">{liveStats.engagement.concurrentViewers.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl sm:rounded-2xl bg-white/40 border border-white/50 px-3 py-2.5 sm:px-4 sm:py-3 transition-transform hover:scale-[1.02]">
              <span className="text-xs sm:text-sm text-brand-navy/70">New reactions</span>
              <span className="font-bold text-brand-magenta text-sm sm:text-base">{liveStats.engagement.reactionsPerMinute.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl sm:rounded-2xl bg-white/40 border border-white/50 px-3 py-2.5 sm:px-4 sm:py-3 transition-transform hover:scale-[1.02]">
              <span className="text-xs sm:text-sm text-brand-navy/70">Messages / min</span>
              <span className="font-bold text-brand-orange-dark text-sm sm:text-base">{liveStats.engagement.messagesPerMinute.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {quickStats.map((stat, index) => (
          <div key={index} className="glass-card rounded-xl sm:rounded-2xl p-3 xs:p-4 sm:p-5 flex flex-col items-center justify-center text-center hover:bg-white/80 transition-colors group">
            <div className={`mb-2 sm:mb-3 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br ${stat.color} text-lg sm:text-xl text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              {stat.icon}
            </div>
            <div className="text-lg xs:text-xl sm:text-2xl font-bold text-brand-navy">{stat.value}</div>
            <div className="text-[10px] xs:text-xs font-medium text-brand-navy/50 uppercase tracking-wide mt-0.5 sm:mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      {activeView === "overview" && (
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
          {/* Create Party Card */}
          <div className="glass-panel rounded-2xl p-4 xs:p-6 sm:rounded-3xl sm:p-8 lg:col-span-1 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-brand-purple/10 rounded-full blur-2xl -mr-8 -mt-8 sm:-mr-10 sm:-mt-10"></div>
            
            <div className="relative z-10">
              <div className="mb-4 sm:mb-6 flex items-center gap-3 sm:gap-4">
                <div className="flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-brand-purple to-brand-blue text-xl sm:text-2xl text-white shadow-lg shadow-brand-purple/20">
                  🎬
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-brand-navy">Host a party</h3>
                  <p className="text-xs sm:text-sm text-brand-navy/60">Name it, invite, go live.</p>
                </div>
              </div>
              
              <form onSubmit={handleCreateParty} className="space-y-3 sm:space-y-4">
                <div className="group relative">
                  <input
                    type="text"
                    value={newPartyName}
                    onChange={(e) => setNewPartyName(e.target.value)}
                    placeholder="Movie night with friends..."
                    className="w-full rounded-xl sm:rounded-2xl border border-brand-navy/10 bg-white/50 px-4 py-3 sm:px-5 sm:py-4 text-sm sm:text-base text-brand-navy placeholder:text-brand-navy/40 focus:border-brand-purple focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-purple/10 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!newPartyName.trim()}
                  className="btn-gradient w-full rounded-lg sm:rounded-xl py-3 sm:py-4 text-xs sm:text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 min-h-[44px]"
                >
                  {loading ? "Creating..." : "Create & Launch Party"}
                </button>
              </form>
            </div>
          </div>

          {/* Recent Parties List */}
          <div className="glass-card rounded-2xl p-4 xs:p-6 sm:rounded-3xl sm:p-8 lg:col-span-2">
            <div className="mb-4 sm:mb-6 flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-bold text-brand-navy">Recent parties</h3>
              <Link href="/dashboard/parties" className="text-xs sm:text-sm font-semibold text-brand-blue hover:text-brand-blue-dark transition-colors">
                View all →
              </Link>
            </div>
            
            <div className="space-y-2 sm:space-y-3">
              {recentParties.length > 0 ? (
                recentParties.map((party) => (
                  <div key={party.id} className="group flex items-center gap-3 sm:gap-4 rounded-xl sm:rounded-2xl border border-transparent bg-white/40 px-3 py-2.5 sm:px-4 sm:py-3 transition-all hover:border-brand-purple/20 hover:bg-white hover:shadow-lg hover:shadow-brand-purple/5">
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br from-brand-navy to-brand-purple text-sm sm:text-lg font-bold text-white shadow-md group-hover:scale-105 transition-transform">
                      {party.title.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="truncate font-bold text-brand-navy text-sm sm:text-base">{party.title}</h4>
                      <div className="mt-0.5 flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] xs:text-xs font-medium text-brand-navy/50">
                        <span className="flex items-center gap-1">👥 {party.participant_count}</span>
                        <span className="hidden xs:inline">•</span>
                        <span className="hidden xs:inline">{new Date(party.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span
                        className={`hidden sm:inline-flex rounded-full px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-bold uppercase tracking-wide ${
                          party.status === "live"
                            ? "bg-red-100 text-red-600"
                            : party.status === "ended"
                              ? "bg-brand-navy/5 text-brand-navy/40"
                              : "bg-brand-blue/10 text-brand-blue"
                        }`}
                      >
                        {party.status === "live" ? "Live" : party.status === "ended" ? "Ended" : "Scheduled"}
                      </span>
                      <button
                        onClick={() => router.push(`/party/${party.id}`)}
                        className="rounded-md sm:rounded-lg bg-white border border-brand-navy/10 px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-bold text-brand-navy hover:bg-brand-navy hover:text-white transition-colors shadow-sm min-h-[36px] sm:min-h-[40px]"
                      >
                        Join
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center rounded-xl sm:rounded-2xl border-2 border-dashed border-brand-navy/10 bg-white/20 px-4 py-8 sm:px-6 sm:py-12 text-center">
                  <div className="text-3xl sm:text-4xl mb-2 sm:mb-3 opacity-50">🎬</div>
                  <p className="text-brand-navy/60 font-medium text-sm sm:text-base">No parties yet—start your first watch night!</p>
                  <button
                    onClick={() => router.push("/dashboard/parties/create")}
                    className="mt-3 sm:mt-4 text-xs sm:text-sm font-bold text-brand-purple hover:underline min-h-[44px] inline-flex items-center"
                  >
                    Create a party now
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeView === "quick-actions" && (
        <div className="grid gap-3 sm:gap-6 grid-cols-1 xs:grid-cols-2 lg:grid-cols-3">
          {[{
            title: "Upload content",
            description: "Add new videos to your library",
            icon: "📱",
            color: "from-brand-cyan to-brand-blue",
            action: () => router.push("/dashboard/videos/upload")
          }, {
            title: "Join community",
            description: "Meet other hosts and viewers",
            icon: "🌟",
            color: "from-brand-orange to-brand-coral",
            action: () => router.push("/dashboard/social")
          }, {
            title: "Discover events",
            description: "Browse upcoming public watch parties",
            icon: "📅",
            color: "from-brand-blue to-brand-cyan",
            action: () => router.push("/dashboard/events")
          }, {
            title: "Browse library",
            description: "Organise everything you've uploaded",
            icon: "📚",
            color: "from-brand-purple to-brand-magenta",
            action: () => router.push("/dashboard/videos")
          }, {
            title: "Find friends",
            description: "Invite co-hosts and regulars",
            icon: "👥",
            color: "from-brand-purple to-brand-blue",
            action: () => router.push("/dashboard/friends")
          }, {
            title: "Get support",
            description: "Reach our crew any time",
            icon: "🎫",
            color: "from-brand-blue to-brand-cyan",
            action: () => router.push("/dashboard/support")
          }].map((item, index) => (
            <button
              key={index}
              onClick={item.action}
              className="glass-card group flex h-full flex-col rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-left transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-navy/5 min-h-[120px] sm:min-h-[160px]"
            >
              <div className={`mb-3 sm:mb-4 flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br ${item.color} text-xl sm:text-2xl text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                {item.icon}
              </div>
              <h3 className="text-base sm:text-lg font-bold text-brand-navy">{item.title}</h3>
              <p className="mt-1 sm:mt-2 flex-1 text-xs sm:text-sm text-brand-navy/60">{item.description}</p>
              <span className="mt-3 sm:mt-4 inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-brand-blue group-hover:translate-x-1 transition-transform">
                Get started →
              </span>
            </button>
          ))}
        </div>
      )}

      {activeView === "analytics" && (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6">
            <h3 className="flex items-center gap-2 text-base sm:text-lg font-bold text-brand-navy">
              <span className="text-lg sm:text-xl">📊</span>
              Your activity
            </h3>
            <div className="mt-4 sm:mt-5 space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-white/40">
                <span className="text-xs sm:text-sm text-brand-navy/70">Total watch time</span>
                <span className="font-bold text-brand-purple text-sm sm:text-base">{Math.round((stats?.watch_time_minutes || 0) / 60)}h</span>
              </div>
              <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-white/40">
                <span className="text-xs sm:text-sm text-brand-navy/70">Parties hosted</span>
                <span className="font-bold text-brand-purple text-sm sm:text-base">{stats?.total_parties || 0}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-white/40">
                <span className="text-xs sm:text-sm text-brand-navy/70">Videos uploaded</span>
                <span className="font-bold text-brand-purple text-sm sm:text-base">{stats?.total_videos || 0}</span>
              </div>
            </div>
          </div>
          
          <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6">
            <h3 className="flex items-center gap-2 text-base sm:text-lg font-bold text-brand-navy">
              <span className="text-lg sm:text-xl">🌍</span>
              Platform pulse
            </h3>
            <div className="mt-4 sm:mt-5 space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-white/40">
                <span className="text-xs sm:text-sm text-brand-navy/70">Online users</span>
                <span className="font-bold text-brand-blue text-sm sm:text-base">{liveStats.onlineUsers.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-white/40">
                <span className="text-xs sm:text-sm text-brand-navy/70">Active parties</span>
                <span className="font-bold text-brand-purple text-sm sm:text-base">{liveStats.activeParties}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-white/40">
                <span className="text-xs sm:text-sm text-brand-navy/70">Concurrent viewers</span>
                <span className="font-bold text-brand-blue text-sm sm:text-base">{liveStats.engagement.concurrentViewers.toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 sm:col-span-2 xl:col-span-1">
            <h3 className="flex items-center gap-2 text-base sm:text-lg font-bold text-brand-navy">
              <span className="text-lg sm:text-xl">🛡️</span>
              System health
            </h3>
            <div className="mt-4 sm:mt-5 space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-white/40">
                <span className="text-xs sm:text-sm text-brand-navy/70">System load</span>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 sm:h-2 w-12 sm:w-16 rounded-full bg-brand-navy/10 overflow-hidden">
                    <div className="h-full bg-brand-cyan" style={{ width: `${Math.min(liveStats.systemHealth.systemLoad, 100)}%` }}></div>
                  </div>
                  <span className="font-bold text-brand-cyan text-[10px] sm:text-xs">{liveStats.systemHealth.systemLoad.toFixed(1)}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-white/40">
                <span className="text-xs sm:text-sm text-brand-navy/70">CPU usage</span>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 sm:h-2 w-12 sm:w-16 rounded-full bg-brand-navy/10 overflow-hidden">
                    <div className="h-full bg-brand-purple" style={{ width: `${Math.min(liveStats.systemHealth.cpuUsage, 100)}%` }}></div>
                  </div>
                  <span className="font-bold text-brand-purple text-[10px] sm:text-xs">{liveStats.systemHealth.cpuUsage.toFixed(1)}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-white/40">
                <span className="text-xs sm:text-sm text-brand-navy/70">Memory usage</span>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 sm:h-2 w-12 sm:w-16 rounded-full bg-brand-navy/10 overflow-hidden">
                    <div className="h-full bg-brand-magenta" style={{ width: `${Math.min(liveStats.systemHealth.memoryUsage, 100)}%` }}></div>
                  </div>
                  <span className="font-bold text-brand-magenta text-[10px] sm:text-xs">{liveStats.systemHealth.memoryUsage.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pro Tip Section */}
      <div className="glass-panel rounded-2xl p-4 xs:p-6 sm:rounded-3xl sm:p-8 relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 sm:-right-10 sm:-bottom-10 w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-tl from-brand-orange/20 to-brand-magenta/20 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-brand-navy">💡 Pro tip</h3>
            <p className="mt-1 sm:mt-2 text-sm sm:text-base text-brand-navy/70 max-w-2xl">
              {showWelcome
                ? "Connect your storage to preload trailers, playlists, and host notes before guests arrive."
                : "Let WatchParty curate your next marathon with AI-powered recommendations tuned to your crew."}
            </p>
          </div>
          <div className="flex flex-col xs:flex-row gap-2 sm:gap-3">
            <button
              onClick={() => router.push(showWelcome ? "/dashboard/integrations" : "/dashboard/search")}
              className="rounded-full bg-brand-navy text-white px-5 py-2.5 sm:px-6 sm:py-3 text-xs sm:text-sm font-bold shadow-lg hover:bg-brand-navy-light transition-colors min-h-[44px]"
            >
              {showWelcome ? "Connect services" : "Explore AI picks"}
            </button>
            <button className="rounded-full border border-brand-navy/20 px-5 py-2.5 sm:px-6 sm:py-3 text-xs sm:text-sm font-bold text-brand-navy hover:bg-white/50 transition-colors min-h-[44px]">
              Learn more
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
