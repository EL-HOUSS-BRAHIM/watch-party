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
      <header className="rounded-3xl border border-brand-navy/10 bg-white/90 p-8 shadow-[0_28px_80px_rgba(28,28,46,0.12)]">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-blue transition-colors hover:text-brand-blue-dark"
            >
              ← Back to overview
            </button>
            <div>
              <h1 className="text-3xl font-bold text-brand-navy">Analytics control room</h1>
              <p className="mt-2 max-w-2xl text-sm text-brand-navy/70">
                Monitor growth, engagement, and reliability across WatchParty. Switch between tabs to explore your personal impact or global platform momentum.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-blue/20 bg-brand-blue/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-brand-blue-dark">
              📊 Live data synced
            </span>
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-navy/10 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-brand-navy/60">
              Updated {realtimeData?.timestamp ? new Date(realtimeData.timestamp).toLocaleTimeString() : "recently"}
            </div>
          </div>
        </div>

        <nav className="mt-8 flex flex-wrap gap-3">
          {[
            { id: "overview", label: "Overview", icon: "📊" },
            { id: "personal", label: "Your impact", icon: "👤" },
            { id: "realtime", label: "Live pulse", icon: "⚡" },
            { id: "platform", label: "Platform", icon: "🌐" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? "border-brand-purple/30 bg-brand-purple/10 text-brand-purple"
                  : "border-brand-navy/10 bg-white/60 text-brand-navy/60 hover:border-brand-navy/20 hover:text-brand-navy"
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

            <BarChart
              title="Top party categories"
              data={(dashboardData?.top_categories || []).map((item: any) => ({
                label: item.category,
                value: item.value
              }))}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
            <RealTimeActivityFeed activities={realtimeFeed} maxItems={8} />

            <div className="rounded-3xl border border-brand-navy/10 bg-white/90 p-6 shadow-[0_18px_45px_rgba(28,28,46,0.08)]">
              <h3 className="text-lg font-semibold text-brand-navy">Platform highlights</h3>
              <div className="mt-5 space-y-4 text-sm text-brand-navy/70">
                <div className="flex items-center justify-between">
                  <span>Total watch parties hosted</span>
                  <span className="rounded-full border border-brand-purple/20 bg-brand-purple/5 px-3 py-1 text-sm font-semibold text-brand-purple">
                    {formatNumber(dashboardData?.total_parties || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Average party duration</span>
                  <span className="rounded-full border border-brand-blue/20 bg-brand-blue/5 px-3 py-1 text-sm font-semibold text-brand-blue-dark">
                    {Math.round((dashboardData?.average_party_duration || 0) / 60)} mins
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Peak concurrency</span>
                  <span className="rounded-full border border-brand-cyan/20 bg-brand-cyan/5 px-3 py-1 text-sm font-semibold text-brand-cyan-dark">
                    {formatNumber(dashboardData?.peak_concurrent_users || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Engagement score</span>
                  <span className="rounded-full border border-brand-orange/20 bg-brand-orange/5 px-3 py-1 text-sm font-semibold text-brand-orange-dark">
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
            <div className="rounded-3xl border border-brand-navy/10 bg-white/90 p-6 shadow-[0_18px_45px_rgba(28,28,46,0.08)]">
              <h3 className="text-lg font-semibold text-brand-navy">Personal overview</h3>
              <div className="mt-5 space-y-4 text-sm text-brand-navy/70">
                <div className="flex items-center justify-between">
                  <span>Parties hosted</span>
                  <span className="font-semibold text-brand-purple">{personalData?.parties_hosted || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Average attendance</span>
                  <span className="font-semibold text-brand-blue-dark">{personalData?.average_attendance || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Total watch time</span>
                  <span className="font-semibold text-brand-magenta-dark">{formatNumber(personalData?.watch_time || 0)} hrs</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Engagement score</span>
                  <span className="font-semibold text-brand-orange-dark">{personalData?.engagement_score || 0}%</span>
                </div>
              </div>
            </div>

            <BarChart
              title="Top performing parties"
              data={(personalData?.top_parties || []).map((party: any) => ({
                label: party.title,
                value: party.attendance
              }))}
              horizontal
            />

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

          <div className="rounded-3xl border border-brand-navy/10 bg-white/90 p-6 shadow-[0_18px_45px_rgba(28,28,46,0.08)]">
            <h3 className="text-lg font-semibold text-brand-navy">Milestones unlocked</h3>
            <div className="mt-5 space-y-4">
              {["First 100 viewers", "Highest rated party", "Top community host"].map((milestone, index) => (
                <div key={index} className="flex items-center gap-4 rounded-2xl border border-brand-navy/10 bg-white/70 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-purple to-brand-magenta text-white">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-brand-navy">{milestone}</p>
                    <p className="text-xs uppercase tracking-[0.3em] text-brand-navy/40">Unlocked milestone badge</p>
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
              { label: "Online users", value: realtimeData.onlineUsers, icon: "👥" },
              { label: "Active parties", value: realtimeData.activeParties, icon: "🎬" },
              { label: "Messages per min", value: realtimeData.engagement.messagesPerMinute, icon: "💬" },
              { label: "Reactions per min", value: realtimeData.engagement.reactionsPerMinute, icon: "🎉" }
            ].map((stat, index) => (
              <div
                key={index}
                className="rounded-3xl border border-brand-navy/10 bg-white/90 p-6 text-brand-navy shadow-[0_18px_45px_rgba(28,28,46,0.08)]"
              >
                <div className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-navy/50">{stat.label}</div>
                <div className="mt-3 flex items-baseline gap-2 text-3xl font-bold text-brand-navy">
                  {formatNumber(stat.value)}
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-navy/40">Now</span>
                </div>
                <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-brand-cyan/20 bg-brand-cyan/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-brand-cyan-dark">
                  {stat.icon} Live feed
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
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

            <div className="rounded-3xl border border-brand-navy/10 bg-white/90 p-6 text-brand-navy shadow-[0_18px_45px_rgba(28,28,46,0.08)]">
              <h3 className="text-lg font-semibold">System health</h3>
              <div className="mt-5 space-y-4 text-sm text-brand-navy/70">
                <div className="flex items-center justify-between">
                  <span>System load</span>
                  <span className="font-semibold text-brand-cyan-dark">{realtimeData.systemHealth.systemLoad.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>CPU usage</span>
                  <span className="font-semibold text-brand-cyan-dark">{realtimeData.systemHealth.cpuUsage.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Memory usage</span>
                  <span className="font-semibold text-brand-cyan-dark">{realtimeData.systemHealth.memoryUsage.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Disk usage</span>
                  <span className="font-semibold text-brand-cyan-dark">{realtimeData.systemHealth.diskUsage.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Network traffic</span>
                  <span className="font-semibold text-brand-cyan-dark">{realtimeData.systemHealth.networkTraffic.toFixed(1)} MB/s</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {activeTab === "platform" && (
        <section className="space-y-10">
          <div className="grid gap-6 lg:grid-cols-[1fr,1.2fr,1fr]">
            <div className="rounded-3xl border border-brand-navy/10 bg-white/90 p-6 shadow-[0_18px_45px_rgba(28,28,46,0.08)]">
              <h3 className="text-lg font-semibold text-brand-navy">Growth snapshot</h3>
              <div className="mt-5 space-y-4 text-sm text-brand-navy/70">
                <div className="flex items-center justify-between">
                  <span>New users (30d)</span>
                  <span className="font-semibold text-brand-blue-dark">{formatNumber(dashboardData?.new_users_30d || 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Returning users</span>
                  <span className="font-semibold text-brand-magenta-dark">{formatNumber(dashboardData?.returning_users || 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Conversion rate</span>
                  <span className="font-semibold text-brand-orange-dark">{(dashboardData?.conversion_rate || 0).toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Churn rate</span>
                  <span className="font-semibold text-brand-coral-dark">{(dashboardData?.churn_rate || 0).toFixed(1)}%</span>
                </div>
              </div>
            </div>

            <BarChart
              title="Top regions"
              data={(dashboardData?.top_regions || []).map((region: any) => ({
                label: region.region,
                value: region.users
              }))}
              horizontal
            />

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

          <div className="rounded-3xl border border-brand-navy/10 bg-white/90 p-6 shadow-[0_18px_45px_rgba(28,28,46,0.08)]">
            <h3 className="text-lg font-semibold text-brand-navy">Top performing hosts</h3>
            <div className="mt-5 space-y-4">
              {(dashboardData?.top_hosts || []).map((host: any, index: number) => (
                <div key={host.username} className="flex items-center gap-4 rounded-2xl border border-brand-navy/10 bg-white/70 p-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-neutral/70 text-xs font-semibold text-brand-navy">
                    #{index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-brand-navy">{host.username}</p>
                    <p className="text-xs uppercase tracking-[0.3em] text-brand-navy/40">{formatNumber(host.watch_time || 0)} hrs watched</p>
                  </div>
                  <div className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-navy/40">
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
