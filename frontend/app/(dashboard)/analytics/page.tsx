"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { analyticsApi } from "@/lib/api-client"
import AnalyticsCard from "@/components/analytics/AnalyticsCard"
import LineChart from "@/components/analytics/LineChart"
import BarChart from "@/components/analytics/BarChart"
// DonutChart component available but not currently used in this view
import RealTimeActivityFeed from "@/components/analytics/RealTimeActivityFeed"

export default function AnalyticsPage() {
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [personalData, setPersonalData] = useState<any>(null)
  const [realtimeData, setRealtimeData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"overview" | "personal" | "realtime" | "platform">("overview")

  useEffect(() => {
    loadAnalyticsData()
    
    // Auto-refresh realtime data every 30 seconds
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
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num?.toString() || '0'
  }

  const formatPercentage = (num: number) => {
    return `${(num || 0).toFixed(1)}%`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-white/60">Loading analytics...</p>
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
                <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
                <p className="text-white/60 text-sm">Insights into platform performance and user engagement</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm font-medium">
                📊 Live Data
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
              { id: "personal", label: "Personal", icon: "👤" },
              { id: "realtime", label: "Real-time", icon: "⚡" },
              { id: "platform", label: "Platform", icon: "🌐" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "text-blue-400 border-blue-400"
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
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <AnalyticsCard
                title="Total Users"
                value={formatNumber(dashboardData?.total_users || 0)}
                change={dashboardData?.user_growth}
                icon="👥"
                color="blue"
              />
              
              <AnalyticsCard
                title="Active Parties"
                value={formatNumber(dashboardData?.active_parties || 0)}
                change={dashboardData?.party_growth}
                icon="🎬"
                color="green"
              />
              
              <AnalyticsCard
                title="Watch Time"
                value={`${formatNumber(dashboardData?.total_watch_time || 0)}h`}
                change={dashboardData?.watch_time_growth}
                icon="⏱️"
                color="purple"
              />
              
              <AnalyticsCard
                title="Engagement Rate"
                value={formatPercentage(dashboardData?.engagement_rate || 0)}
                icon="💬"
                color="yellow"
              />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* User Activity Chart */}
              <LineChart
                data={dashboardData?.daily_activity?.map((day: any) => ({
                  label: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
                  value: day.active_users || 0,
                  date: day.date
                })) || []}
                title="User Activity (Last 7 Days)"
                color="#3b82f6"
              />

              {/* Popular Content */}
              <BarChart
                data={dashboardData?.popular_videos?.map((video: any, index: number) => ({
                  label: video.title?.substring(0, 15) + (video.title?.length > 15 ? '...' : '') || `Video ${index + 1}`,
                  value: video.view_count || 0
                })) || []}
                title="Popular Videos"
                horizontal={true}
              />
            </div>

            {/* Platform Stats */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Platform Statistics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">
                    {formatNumber(dashboardData?.total_messages || 0)}
                  </div>
                  <p className="text-white/60">Total Messages</p>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    {formatNumber(dashboardData?.total_videos || 0)}
                  </div>
                  <p className="text-white/60">Videos Uploaded</p>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">
                    {formatNumber(dashboardData?.total_parties_created || 0)}
                  </div>
                  <p className="text-white/60">Parties Created</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Personal Tab */}
        {activeTab === "personal" && (
          <div className="space-y-8">
            {/* Personal Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <AnalyticsCard
                title="Parties Hosted"
                value={personalData?.parties_hosted || 0}
                icon="🎬"
                color="blue"
              />
              
              <AnalyticsCard
                title="Parties Joined"
                value={personalData?.parties_joined || 0}
                icon="👥"
                color="green"
              />
              
              <AnalyticsCard
                title="Watch Time"
                value={`${formatNumber(personalData?.total_watch_time || 0)}h`}
                icon="⏱️"
                color="purple"
              />
              
              <AnalyticsCard
                title="Messages Sent"
                value={formatNumber(personalData?.messages_sent || 0)}
                icon="💬"
                color="yellow"
              />
            </div>

            {/* Recent Activity */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Your Recent Activity</h3>
              
              <div className="space-y-4">
                {personalData?.recent_activities?.map((activity: any, index: number) => (
                  <div key={index} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                      <span className="text-xl">
                        {activity.type === "party_created" ? "🎬" :
                         activity.type === "party_joined" ? "👥" :
                         activity.type === "video_uploaded" ? "📹" : "💬"}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{activity.description}</p>
                      <p className="text-white/60 text-sm">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8">
                    <p className="text-white/60">No recent activity</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Real-time Tab */}
        {activeTab === "realtime" && (
          <div className="space-y-8">
            {/* Live Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <AnalyticsCard
                title="Online Users"
                value={realtimeData?.online_users || 0}
                icon="🟢"
                color="green"
              />
              
              <AnalyticsCard
                title="Active Parties"
                value={realtimeData?.active_parties || 0}
                icon="🎬"
                color="blue"
              />
              
              <AnalyticsCard
                title="Live Messages"
                value={`${realtimeData?.messages_per_minute || 0}/min`}
                icon="💬"
                color="purple"
              />
              
              <AnalyticsCard
                title="Server Load"
                value={`${realtimeData?.server_load || 0}%`}
                icon="⚡"
                color="yellow"
              />
            </div>

            {/* Live Activity Feed */}
            <RealTimeActivityFeed
              activities={realtimeData?.live_activities || []}
              maxItems={15}
            />
          </div>
        )}

        {/* Platform Tab */}
        {activeTab === "platform" && (
          <div className="bg-white/5 border border-white/10 rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">🚧</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Platform Analytics
            </h3>
            <p className="text-white/60 mb-6">
              Advanced platform analytics and insights coming soon.
            </p>
            <button
              onClick={() => setActiveTab("overview")}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Back to Overview
            </button>
          </div>
        )}
      </div>
    </div>
  )
}