"use client"

import { useQuery } from "@tanstack/react-query"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { RecentParties } from "@/components/dashboard/recent-parties"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { api } from "@/lib/api"

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => api.get("/dashboard/stats"),
  })

  const { data: recentParties, isLoading: partiesLoading } = useQuery({
    queryKey: ["recent-parties"],
    queryFn: () => api.get("/parties/recent"),
  })

  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ["activities"],
    queryFn: () => api.get("/activities/recent"),
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening with your watch parties.</p>
      </div>

      <DashboardStats stats={stats} isLoading={statsLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <RecentParties parties={recentParties} isLoading={partiesLoading} />
          <ActivityFeed activities={activities} isLoading={activitiesLoading} />
        </div>

        <div>
          <QuickActions />
        </div>
      </div>
    </div>
  )
}
