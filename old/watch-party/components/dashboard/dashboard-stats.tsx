"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calendar, Clock, TrendingUp } from "lucide-react"

interface DashboardStatsProps {
  stats: any
  isLoading: boolean
}

export function DashboardStats({ stats, isLoading }: DashboardStatsProps) {
  const defaultStats = {
    totalParties: 0,
    totalWatchTime: 0,
    friendsCount: 0,
    thisMonthParties: 0,
  }

  const data = stats || defaultStats

  const statCards = [
    {
      title: "Total Parties",
      value: data.totalParties,
      icon: Calendar,
      change: "+12%",
      changeType: "positive" as const,
    },
    {
      title: "Watch Time",
      value: `${Math.floor(data.totalWatchTime / 60)}h`,
      icon: Clock,
      change: "+8%",
      changeType: "positive" as const,
    },
    {
      title: "Friends",
      value: data.friendsCount,
      icon: Users,
      change: "+3",
      changeType: "positive" as const,
    },
    {
      title: "This Month",
      value: data.thisMonthParties,
      icon: TrendingUp,
      change: "+25%",
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
            <p className="text-xs text-success">{stat.change} from last month</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
