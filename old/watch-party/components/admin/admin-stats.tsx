"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Activity, AlertTriangle, TrendingUp } from "lucide-react"

interface AdminStatsProps {
  stats: any
  isLoading: boolean
}

export function AdminStats({ stats, isLoading }: AdminStatsProps) {
  const defaultStats = {
    totalUsers: 0,
    activeParties: 0,
    reportedContent: 0,
    systemHealth: 100,
  }

  const data = stats || defaultStats

  const statCards = [
    {
      title: "Total Users",
      value: data.totalUsers?.toLocaleString() || "0",
      icon: Users,
      change: "+12%",
      changeType: "positive" as const,
    },
    {
      title: "Active Parties",
      value: data.activeParties || "0",
      icon: Activity,
      change: "+8%",
      changeType: "positive" as const,
    },
    {
      title: "Reports",
      value: data.reportedContent || "0",
      icon: AlertTriangle,
      change: "-15%",
      changeType: "negative" as const,
    },
    {
      title: "System Health",
      value: `${data.systemHealth || 100}%`,
      icon: TrendingUp,
      change: "Excellent",
      changeType: "positive" as const,
    },
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-secondary rounded w-20" />
              <div className="h-4 w-4 bg-secondary rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-secondary rounded w-16 mb-2" />
              <div className="h-3 bg-secondary rounded w-12" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            <p className={`text-xs ${stat.changeType === "positive" ? "text-success" : "text-warning"}`}>
              {stat.change} from last month
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
