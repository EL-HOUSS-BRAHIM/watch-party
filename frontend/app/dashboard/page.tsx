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
      router.push(`/party/${party.id}`)
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
      <div className="flex items-center justify-center min-h-[400px] text-brand-navy/60">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-brand-purple border-t-transparent"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 text-brand-navy">
      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="rounded-3xl border border-brand-navy/10 bg-white p-8 shadow-[0_28px_80px_rgba(28,28,46,0.12)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-brand-purple/70">{getTimeOfDayGreeting()}</p>
              <h1 className="mt-3 text-4xl font-bold tracking-tight">
                Welcome back, {user?.first_name || user?.username || "Cinephile"}!
              </h1>
              <p className="mt-3 text-brand-navy/70">
                {showWelcome
                  ? "You’re days away from your first unforgettable watch party—set the mood and invite your crew."
                  : "Pick up where you left off, schedule your next event, or explore what’s trending."}
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-full border border-brand-cyan/30 bg-brand-cyan/10 px-4 py-2 text-sm font-semibold text-brand-cyan">
              <span className="h-2 w-2 rounded-full bg-brand-coral animate-pulse" />
              Live sync online
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            {[{ key: "overview", label: "Overview", icon: "🏠" }, { key: "quick-actions", label: "Quick actions", icon: "⚡" }, { key: "analytics", label: "Analytics", icon: "📊" }].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveView(tab.key as typeof activeView)}
                className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                  activeView === tab.key
                    ? "border-brand-purple bg-brand-purple/10 text-brand-purple"
                    : "border-transparent bg-brand-neutral/60 text-brand-navy/60 hover:border-brand-navy/20"
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-brand-navy/10 bg-white p-6 shadow-[0_28px_80px_rgba(28,28,46,0.1)]">
          <h2 className="text-lg font-semibold">Today’s highlights</h2>
          <div className="mt-4 space-y-3 text-sm text-brand-navy/70">
            <div className="flex items-center justify-between rounded-2xl border border-brand-blue/15 bg-brand-blue/5 px-4 py-3">
              <span>Guests waiting in lobby</span>
              <span className="font-semibold text-brand-blue">{liveStats.engagement.concurrentViewers.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-brand-magenta/15 bg-brand-magenta/5 px-4 py-3">
              <span>New reactions in last hour</span>
              <span className="font-semibold text-brand-magenta">{liveStats.engagement.reactionsPerMinute.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-brand-orange/20 bg-brand-orange/5 px-4 py-3">
              <span>Messages flying per minute</span>
              <span className="font-semibold text-brand-orange-dark">{liveStats.engagement.messagesPerMinute.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-brand-navy/10 bg-white p-6 shadow-[0_28px_80px_rgba(28,28,46,0.1)]">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {quickStats.map((stat, index) => (
            <div key={index} className="flex flex-col items-center justify-center gap-3 text-center">
              <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.color} text-2xl text-white shadow-lg`}>
                {stat.icon}
              </div>
              <div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-brand-navy/60">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {activeView === "overview" && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-brand-purple/20 bg-white p-8 shadow-[0_28px_90px_rgba(74,46,160,0.15)] lg:col-span-1">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-purple to-brand-blue text-2xl text-white shadow-lg">🎬</div>
              <div>
                <h3 className="text-2xl font-bold">Host a party</h3>
                <p className="text-sm text-brand-navy/60">Name it, invite friends, go live.</p>
              </div>
            </div>
            <form onSubmit={handleCreateParty} className="space-y-4">
              <input
                type="text"
                value={newPartyName}
                onChange={(e) => setNewPartyName(e.target.value)}
                placeholder="Movie night with friends"
                className="w-full rounded-2xl border border-brand-purple/30 bg-brand-purple/5 px-5 py-3 text-base text-brand-navy focus:border-brand-purple focus:outline-none focus:ring-2 focus:ring-brand-purple/30"
              />
              <button
                type="submit"
                disabled={!newPartyName.trim()}
                className="w-full rounded-full bg-gradient-to-r from-brand-purple to-brand-blue px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating..." : "Create & launch"}
              </button>
            </form>
          </div>
          <div className="rounded-3xl border border-brand-blue/20 bg-white p-8 shadow-[0_28px_90px_rgba(45,156,219,0.15)] lg:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-2xl font-bold">Recent parties</h3>
              <Link href="/dashboard/parties" className="inline-flex items-center gap-2 rounded-full border border-brand-blue/30 px-4 py-2 text-sm font-semibold text-brand-blue hover:bg-brand-blue/10">
                View all →
              </Link>
            </div>
            <div className="space-y-4">
              {recentParties.length > 0 ? (
                recentParties.map((party) => (
                  <div key={party.id} className="flex items-center gap-4 rounded-2xl border border-brand-navy/10 bg-brand-neutral px-4 py-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-purple to-brand-magenta text-lg font-bold text-white">
                      {party.title.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="truncate text-lg font-semibold">{party.title}</h4>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-brand-navy/60">
                        <span>👥 {party.participant_count} watching</span>
                        <span>•</span>
                        <span>{new Date(party.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          party.status === "live"
                            ? "bg-brand-cyan/15 text-brand-cyan"
                            : party.status === "ended"
                              ? "bg-brand-orange/10 text-brand-orange-dark"
                              : "bg-brand-purple/10 text-brand-purple"
                        }`}
                      >
                        {party.status === "live" ? "🔴 Live" : party.status === "ended" ? "Ended" : "Scheduled"}
                      </span>
                      <button
                        onClick={() => router.push(`/party/${party.id}`)}
                        className="rounded-full border border-brand-blue/30 px-4 py-2 text-xs font-semibold text-brand-blue hover:bg-brand-blue/10"
                      >
                        Join
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-brand-navy/20 bg-brand-neutral px-6 py-16 text-center">
                  <div className="text-5xl">🎬</div>
                  <p className="mt-4 text-brand-navy/70">No parties yet—start your first watch night!</p>
                  <button
                    onClick={() => router.push("/dashboard/parties/create")}
                    className="mt-6 rounded-full bg-gradient-to-r from-brand-purple to-brand-blue px-6 py-3 text-sm font-semibold text-white shadow-lg hover:-translate-y-0.5"
                  >
                    Create a party
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeView === "quick-actions" && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
            description: "Organise everything you’ve uploaded",
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
              className="flex h-full flex-col rounded-3xl border border-brand-navy/10 bg-white p-6 text-left shadow-[0_24px_80px_rgba(28,28,46,0.12)] transition-all hover:-translate-y-1 hover:shadow-[0_32px_110px_rgba(28,28,46,0.16)]"
            >
              <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} text-2xl text-white shadow-lg`}>
                {item.icon}
              </div>
              <h3 className="text-xl font-semibold">{item.title}</h3>
              <p className="mt-2 flex-1 text-sm text-brand-navy/60">{item.description}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-blue">
                Get started →
              </span>
            </button>
          ))}
        </div>
      )}

      {activeView === "analytics" && (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-3xl border border-brand-navy/10 bg-white p-6 shadow-[0_24px_80px_rgba(28,28,46,0.12)]">
            <h3 className="flex items-center gap-2 text-xl font-bold">
              <span>📊</span>
              Your activity
            </h3>
            <div className="mt-5 space-y-4 text-sm text-brand-navy/70">
              <div className="flex items-center justify-between">
                <span>Total watch time</span>
                <span className="font-semibold text-brand-purple">{Math.round((stats?.watch_time_minutes || 0) / 60)}h</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Parties hosted</span>
                <span className="font-semibold text-brand-purple">{stats?.total_parties || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Videos uploaded</span>
                <span className="font-semibold text-brand-purple">{stats?.total_videos || 0}</span>
              </div>
            </div>
          </div>
          <div className="rounded-3xl border border-brand-navy/10 bg-white p-6 shadow-[0_24px_80px_rgba(28,28,46,0.12)]">
            <h3 className="flex items-center gap-2 text-xl font-bold">
              <span>🌍</span>
              Platform pulse
            </h3>
            <div className="mt-5 space-y-4 text-sm text-brand-navy/70">
              <div className="flex items-center justify-between">
                <span>Online users</span>
                <span className="font-semibold text-brand-blue">{liveStats.onlineUsers.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Active parties</span>
                <span className="font-semibold text-brand-purple">{liveStats.activeParties}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Concurrent viewers</span>
                <span className="font-semibold text-brand-blue">{liveStats.engagement.concurrentViewers.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Messages per minute</span>
                <span className="font-semibold text-brand-cyan">{liveStats.engagement.messagesPerMinute.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Reactions per minute</span>
                <span className="font-semibold text-brand-orange-dark">{liveStats.engagement.reactionsPerMinute.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <div className="rounded-3xl border border-brand-navy/10 bg-white p-6 shadow-[0_24px_80px_rgba(28,28,46,0.12)]">
            <h3 className="flex items-center gap-2 text-xl font-bold">
              <span>🛡️</span>
              System health
            </h3>
            <div className="mt-5 space-y-4 text-sm text-brand-navy/70">
              <div className="flex items-center justify-between">
                <span>System load</span>
                <span className="font-semibold text-brand-cyan">{liveStats.systemHealth.systemLoad.toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span>CPU usage</span>
                <span className="font-semibold text-brand-cyan">{liveStats.systemHealth.cpuUsage.toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Memory usage</span>
                <span className="font-semibold text-brand-cyan">{liveStats.systemHealth.memoryUsage.toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Disk usage</span>
                <span className="font-semibold text-brand-cyan">{liveStats.systemHealth.diskUsage.toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Network traffic</span>
                <span className="font-semibold text-brand-cyan">{liveStats.systemHealth.networkTraffic.toFixed(1)} MB/s</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-3xl border border-brand-navy/10 bg-white p-8 shadow-[0_24px_80px_rgba(28,28,46,0.12)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-2xl font-bold">Pro tip</h3>
            <p className="mt-2 text-brand-navy/70">
              {showWelcome
                ? "Connect your storage to preload trailers, playlists, and host notes before guests arrive."
                : "Let WatchParty curate your next marathon with AI-powered recommendations tuned to your crew."}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => router.push(showWelcome ? "/dashboard/integrations" : "/dashboard/search")}
              className="rounded-full bg-gradient-to-r from-brand-magenta to-brand-orange px-6 py-3 text-sm font-semibold text-white shadow-lg hover:-translate-y-0.5"
            >
              {showWelcome ? "Connect services" : "Explore AI picks"}
            </button>
            <button className="rounded-full border border-brand-navy/15 px-6 py-3 text-sm font-semibold text-brand-navy hover:bg-brand-neutral">
              Learn more
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
