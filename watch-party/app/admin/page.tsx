"use client"

import { useQuery } from "@tanstack/react-query"
import { AdminStats } from "@/components/admin/admin-stats"
import { SystemHealth } from "@/components/admin/system-health"
import { RecentActivity } from "@/components/admin/recent-activity"
import { QuickActions } from "@/components/admin/quick-actions"
import { api } from "@/lib/api"

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => api.get("/admin/stats"),
  })

  const { data: systemHealth, isLoading: healthLoading } = useQuery({
    queryKey: ["system-health"],
    queryFn: () => api.get("/admin/system/health"),
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ["admin-activities"],
    queryFn: () => api.get("/admin/activities"),
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Admin Dashboard</h1>
        <p className="text-text-secondary">System overview and management controls.</p>
      </div>

      <AdminStats stats={stats} isLoading={statsLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <SystemHealth health={systemHealth} isLoading={healthLoading} />
          <RecentActivity activities={activities} isLoading={activitiesLoading} />
        </div>

        <div>
          <QuickActions />
        </div>
      </div>
    </div>
  )
}
