"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { analyticsApi, NormalizedRealTimeAnalytics } from "@/lib/api-client"
import AnalyticsCard from "@/components/analytics/AnalyticsCard"
import LineChart from "@/components/analytics/LineChart"
import BarChart from "@/components/analytics/BarChart"
import RealTimeActivityFeed from "@/components/analytics/RealTimeActivityFeed"

export default function AnalyticsPage() {
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [personalData, setPersonalData] = useState<any>(null)
  const [realtimeData, setRealtimeData] = useState<NormalizedRealTimeAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"overview" | "personal" | "realtime" | "platform">("overview")

  useEffect(() => {
    loadAnalyticsData()

    const interval = setInterval(() => {
      if (activeTab === "realtime") {
        loadRealtimeData()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [activeTab])

  const loadAnalyticsData = async () => {
    setLoading(true)
    try {
      const [dashboard, personal, realtime] = await Promise.all([
        analyticsApi.getDashboard(),
        analyticsApi.getPersonal(),
        analyticsApi.getRealTime()
      ])

      setDashboardData(dashboard)
      setPersonalData(personal)
      setRealtimeData(realtime)
    } catch (error) {
      console.error("Failed to load analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadRealtimeData = async () => {
    try {
      const realtime = await analyticsApi.getRealTime()
      setRealtimeData(realtime)
    } catch (error) {
      console.error("Failed to load realtime data:", error)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M"
    if (num >= 1000) return (num / 1000).toFixed(1) + "K"
    return num?.toString() || "0"
  }

  const mapRealtimeEventType = (
    eventType: string
  ): "user_joined" | "party_created" | "video_uploaded" | "message_sent" | "user_left" => {
    const normalized = eventType.toLowerCase()

    if (normalized.includes("leave") || normalized.includes("logout")) {
      return "user_left"
    }

    if (normalized.includes("message") || normalized.includes("chat")) {
      return "message_sent"
    }

    if (normalized.includes("video")) {
      return "video_uploaded"
    }

    if (normalized.includes("party") || normalized.includes("watch")) {
      return "party_created"
    }

    return "user_joined"
  }

  const realtimeFeed = (realtimeData?.recentActivity ?? []).map((activity, index) => {
    const eventType = activity.eventType || "activity"
    const count = activity.count ?? 0
    const description = `${count.toLocaleString()} ${eventType.replace(/_/g, " ")} events in the last hour`

    return {
      id: `${eventType}-${index}`,
      type: mapRealtimeEventType(eventType),
      description,
      timestamp: realtimeData?.timestamp || new Date().toISOString()
    }
  })

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center text-brand-navy/60">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-brand-purple border-t-transparent" />
          <p className="text-sm font-semibold uppercase tracking-[0.3em]">Loading analytics…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      <header className="glass-panel rounded-3xl p-8 border-brand-navy/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-brand-purple/10 to-brand-blue/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="inline-flex items-center gap-2 text-sm font-bold text-brand-blue transition-colors hover:text-brand-blue-dark group"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to overview
            </button>
            <div>
              <h1 className="text-3xl font-bold text-brand-navy">Analytics control room</h1>
              <p className="mt-2 max-w-2xl text-sm font-medium text-brand-navy/70">
                Monitor growth, engagement, and reliability across WatchParty. Switch between tabs to explore your personal impact or global platform momentum.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-blue/20 bg-brand-blue/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.3em] text-brand-blue-dark shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-blue opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-blue"></span>
              </span>
              Live data synced
            </span>
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-navy/10 bg-white/50 px-4 py-2 text-xs font-bold uppercase tracking-[0.3em] text-brand-navy/60 backdrop-blur-sm">
              Updated {realtimeData?.timestamp ? new Date(realtimeData.timestamp).toLocaleTimeString() : "recently"}
            </div>
          </div>
        </div>

        <nav className="mt-8 flex flex-wrap gap-3 relative z-10">
          {[
            { id: "overview", label: "Overview", icon: "📊" },
            { id: "personal", label: "Your impact", icon: "👤" },
            { id: "realtime", label: "Live pulse", icon: "⚡" },
            { id: "platform", label: "Platform", icon: "🌐" }
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
        </nav>
      </header>

      {activeTab === "overview" && (
        <section className="space-y-10">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <AnalyticsCard
              title="Total users"
              value={formatNumber(dashboardData?.total_users || 0)}
              change={dashboardData?.user_growth}
              icon="👥"
              color="blue"
            />
            <AnalyticsCard
              title="Active parties"
              value={formatNumber(dashboardData?.active_parties || 0)}
              change={dashboardData?.party_growth}
              icon="🎬"
              color="green"
            />
            <AnalyticsCard
              title="Watch time"
              value={`${formatNumber(dashboardData?.total_watch_time || 0)} hrs`}
              change={dashboardData?.watch_time_growth}
              icon="⏱️"
              color="purple"
            />
            <AnalyticsCard
              title="New subscriptions"
              value={formatNumber(dashboardData?.new_subscriptions || 0)}
              change={dashboardData?.subscription_growth}
              icon="⭐"
              color="yellow"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="glass-card rounded-3xl p-6">
              <LineChart
                title="Engagement over time"
                data={(dashboardData?.engagement_over_time || []).map((item: any) => ({
                  label: item.label,
                  value: item.value,
                  date: item.date
                }))}
                color="#3B82F6"
                height={260}
              />
            </div>

            <div className="glass-card rounded-3xl p-6">
              <BarChart
                title="Top party categories"
                data={(dashboardData?.top_categories || []).map((item: any) => ({
                  label: item.category,
                  value: item.value
                }))}
              />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
            <RealTimeActivityFeed activities={realtimeFeed} maxItems={8} />

            <div className="glass-card rounded-3xl p-6">
              <h3 className="text-lg font-bold text-brand-navy flex items-center gap-2">
                <span className="text-xl">🏆</span> Platform highlights
              </h3>
              <div className="mt-5 space-y-4 text-sm text-brand-navy/70">
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/40 border border-white/50">
                  <span className="font-medium">Total watch parties hosted</span>
                  <span className="rounded-full border border-brand-purple/20 bg-brand-purple/5 px-3 py-1 text-sm font-bold text-brand-purple">
                    {formatNumber(dashboardData?.total_parties || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/40 border border-white/50">
                  <span className="font-medium">Average party duration</span>
                  <span className="rounded-full border border-brand-blue/20 bg-brand-blue/5 px-3 py-1 text-sm font-bold text-brand-blue-dark">
                    {Math.round((dashboardData?.average_party_duration || 0) / 60)} mins
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/40 border border-white/50">
                  <span className="font-medium">Peak concurrency</span>
                  <span className="rounded-full border border-brand-cyan/20 bg-brand-cyan/5 px-3 py-1 text-sm font-bold text-brand-cyan-dark">
                    {formatNumber(dashboardData?.peak_concurrent_users || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/40 border border-white/50">
                  <span className="font-medium">Engagement score</span>
                  <span className="rounded-full border border-brand-orange/20 bg-brand-orange/5 px-3 py-1 text-sm font-bold text-brand-orange-dark">
                    {(dashboardData?.average_engagement_score || 0).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {activeTab === "personal" && (
        <section className="space-y-10">
          <div className="grid gap-6 lg:grid-cols-[1fr,1.2fr,1fr]">
            <div className="glass-card rounded-3xl p-6">
              <h3 className="text-lg font-bold text-brand-navy flex items-center gap-2">
                <span className="text-xl">👤</span> Personal overview
              </h3>
              <div className="mt-5 space-y-4 text-sm text-brand-navy/70">
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/40 border border-white/50">
                  <span className="font-medium">Parties hosted</span>
                  <span className="font-bold text-brand-purple">{personalData?.parties_hosted || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/40 border border-white/50">
                  <span className="font-medium">Average attendance</span>
                  <span className="font-bold text-brand-blue-dark">{personalData?.average_attendance || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/40 border border-white/50">
                  <span className="font-medium">Total watch time</span>
                  <span className="font-bold text-brand-magenta-dark">{formatNumber(personalData?.watch_time || 0)} hrs</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/40 border border-white/50">
                  <span className="font-medium">Engagement score</span>
                  <span className="font-bold text-brand-orange-dark">{personalData?.engagement_score || 0}%</span>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-3xl p-6">
              <BarChart
                title="Top performing parties"
                data={(personalData?.top_parties || []).map((party: any) => ({
                  label: party.title,
                  value: party.attendance
                }))}
                horizontal
              />
            </div>

            <div className="glass-card rounded-3xl p-6">
              <LineChart
                title="Messages & reactions"
                data={(personalData?.engagement_trends || []).map((trend: any) => ({
                  label: trend.label,
                  value: trend.value
                }))}
                color="#8B5CF6"
                height={220}
              />
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6">
            <h3 className="text-lg font-bold text-brand-navy flex items-center gap-2">
              <span className="text-xl">🏅</span> Milestones unlocked
            </h3>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {["First 100 viewers", "Highest rated party", "Top community host"].map((milestone, index) => (
                <div key={index} className="flex items-center gap-4 rounded-2xl border border-brand-navy/10 bg-white/40 p-4 transition-transform hover:scale-[1.02]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-purple to-brand-magenta text-white shadow-lg shadow-brand-purple/20 font-bold text-lg">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-brand-navy">{milestone}</p>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-brand-navy/40 font-bold mt-1">Unlocked milestone badge</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {activeTab === "realtime" && realtimeData && (
        <section className="space-y-10">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Online users", value: realtimeData.onlineUsers, icon: "👥", color: "from-brand-blue to-brand-cyan" },
              { label: "Active parties", value: realtimeData.activeParties, icon: "🎬", color: "from-brand-purple to-brand-magenta" },
              { label: "Messages per min", value: realtimeData.engagement.messagesPerMinute, icon: "💬", color: "from-brand-orange to-brand-coral" },
              { label: "Reactions per min", value: realtimeData.engagement.reactionsPerMinute, icon: "🎉", color: "from-brand-magenta to-brand-purple" }
            ].map((stat, index) => (
              <div
                key={index}
                className="glass-card rounded-3xl p-6 text-brand-navy relative overflow-hidden group"
              >
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-10 rounded-full blur-2xl -mr-8 -mt-8 group-hover:opacity-20 transition-opacity`}></div>
                <div className="text-xs font-bold uppercase tracking-[0.35em] text-brand-navy/50">{stat.label}</div>
                <div className="mt-3 flex items-baseline gap-2 text-3xl font-bold text-brand-navy">
                  {formatNumber(stat.value)}
                  <span className="text-xs font-bold uppercase tracking-[0.3em] text-brand-navy/40">Now</span>
                </div>
                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-brand-cyan/20 bg-brand-cyan/5 px-3 py-1 text-xs font-bold uppercase tracking-[0.3em] text-brand-cyan-dark">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-cyan opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-brand-cyan"></span>
                  </span>
                  Live feed
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
            <div className="glass-card rounded-3xl p-6">
              <LineChart
                title="Concurrent viewers"
                data={(realtimeData.engagementHistory || []).map((item: any) => ({
                  label: item.label,
                  value: item.value,
                  date: item.timestamp
                }))}
                color="#06B6D4"
                height={240}
              />
            </div>

            <div className="glass-card rounded-3xl p-6">
              <h3 className="text-lg font-bold text-brand-navy flex items-center gap-2">
                <span className="text-xl">🖥️</span> System health
              </h3>
              <div className="mt-5 space-y-4 text-sm text-brand-navy/70">
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/40 border border-white/50">
                  <span className="font-medium">System load</span>
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 w-24 bg-brand-navy/5 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-cyan" style={{ width: `${Math.min(realtimeData.systemHealth.systemLoad, 100)}%` }}></div>
                    </div>
                    <span className="font-bold text-brand-cyan-dark w-12 text-right">{realtimeData.systemHealth.systemLoad.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/40 border border-white/50">
                  <span className="font-medium">CPU usage</span>
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 w-24 bg-brand-navy/5 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-purple" style={{ width: `${Math.min(realtimeData.systemHealth.cpuUsage, 100)}%` }}></div>
                    </div>
                    <span className="font-bold text-brand-cyan-dark w-12 text-right">{realtimeData.systemHealth.cpuUsage.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/40 border border-white/50">
                  <span className="font-medium">Memory usage</span>
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 w-24 bg-brand-navy/5 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-magenta" style={{ width: `${Math.min(realtimeData.systemHealth.memoryUsage, 100)}%` }}></div>
                    </div>
                    <span className="font-bold text-brand-cyan-dark w-12 text-right">{realtimeData.systemHealth.memoryUsage.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/40 border border-white/50">
                  <span className="font-medium">Disk usage</span>
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 w-24 bg-brand-navy/5 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-orange" style={{ width: `${Math.min(realtimeData.systemHealth.diskUsage, 100)}%` }}></div>
                    </div>
                    <span className="font-bold text-brand-cyan-dark w-12 text-right">{realtimeData.systemHealth.diskUsage.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/40 border border-white/50">
                  <span className="font-medium">Network traffic</span>
                  <span className="font-bold text-brand-cyan-dark">{realtimeData.systemHealth.networkTraffic.toFixed(1)} MB/s</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {activeTab === "platform" && (
        <section className="space-y-10">
          <div className="grid gap-6 lg:grid-cols-[1fr,1.2fr,1fr]">
            <div className="glass-card rounded-3xl p-6">
              <h3 className="text-lg font-bold text-brand-navy flex items-center gap-2">
                <span className="text-xl">📈</span> Growth snapshot
              </h3>
              <div className="mt-5 space-y-4 text-sm text-brand-navy/70">
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/40 border border-white/50">
                  <span className="font-medium">New users (30d)</span>
                  <span className="font-bold text-brand-blue-dark">{formatNumber(dashboardData?.new_users_30d || 0)}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/40 border border-white/50">
                  <span className="font-medium">Returning users</span>
                  <span className="font-bold text-brand-magenta-dark">{formatNumber(dashboardData?.returning_users || 0)}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/40 border border-white/50">
                  <span className="font-medium">Conversion rate</span>
                  <span className="font-bold text-brand-orange-dark">{(dashboardData?.conversion_rate || 0).toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/40 border border-white/50">
                  <span className="font-medium">Churn rate</span>
                  <span className="font-bold text-brand-coral-dark">{(dashboardData?.churn_rate || 0).toFixed(1)}%</span>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-3xl p-6">
              <BarChart
                title="Top regions"
                data={(dashboardData?.top_regions || []).map((region: any) => ({
                  label: region.region,
                  value: region.users
                }))}
                horizontal
              />
            </div>

            <div className="glass-card rounded-3xl p-6">
              <LineChart
                title="Feature adoption"
                data={(dashboardData?.feature_adoption || []).map((item: any) => ({
                  label: item.label,
                  value: item.value
                }))}
                color="#F59E0B"
                height={220}
              />
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6">
            <h3 className="text-lg font-bold text-brand-navy flex items-center gap-2">
              <span className="text-xl">🌟</span> Top performing hosts
            </h3>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(dashboardData?.top_hosts || []).map((host: any, index: number) => (
                <div key={host.username} className="flex items-center gap-4 rounded-2xl border border-brand-navy/10 bg-white/40 p-4 transition-transform hover:scale-[1.02]">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-neutral/70 text-xs font-bold text-brand-navy shadow-sm">
                    #{index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-brand-navy truncate">{host.username}</p>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-brand-navy/40 font-bold mt-0.5">{formatNumber(host.watch_time || 0)} hrs watched</p>
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-navy/40 whitespace-nowrap">
                    {formatNumber(host.parties_hosted || 0)} parties
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
