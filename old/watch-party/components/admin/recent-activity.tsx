"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Users, Flag, Shield, Activity } from "lucide-react"

interface RecentActivityProps {
  activities: any
  isLoading: boolean
}

export function RecentActivity({ activities, isLoading }: RecentActivityProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="h-8 w-8 bg-secondary rounded-full" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-secondary rounded w-3/4" />
                  <div className="h-3 bg-secondary rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const recentActivities = activities?.data || [
    {
      id: 1,
      type: "user_registered",
      user: { name: "John Doe", avatar: null },
      message: "New user registered",
      time: "2 minutes ago",
      severity: "info",
    },
    {
      id: 2,
      type: "content_reported",
      user: { name: "Sarah Chen", avatar: "/placeholder.svg?height=32&width=32&text=SC" },
      message: "Reported inappropriate content in party chat",
      time: "15 minutes ago",
      severity: "warning",
    },
    {
      id: 3,
      type: "party_created",
      user: { name: "Mike Johnson", avatar: "/placeholder.svg?height=32&width=32&text=MJ" },
      message: "Created a new watch party",
      time: "1 hour ago",
      severity: "info",
    },
    {
      id: 4,
      type: "user_banned",
      user: { name: "Admin", avatar: null },
      message: "Banned user for violating community guidelines",
      time: "2 hours ago",
      severity: "critical",
    },
    {
      id: 5,
      type: "system_alert",
      user: { name: "System", avatar: null },
      message: "High server load detected",
      time: "3 hours ago",
      severity: "warning",
    },
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "user_registered":
      case "user_banned":
        return <Users className="h-4 w-4 text-primary" />
      case "content_reported":
        return <Flag className="h-4 w-4 text-warning" />
      case "party_created":
        return <Activity className="h-4 w-4 text-success" />
      case "system_alert":
        return <Shield className="h-4 w-4 text-destructive" />
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return <Badge variant="destructive">Critical</Badge>
      case "warning":
        return <Badge className="bg-warning text-warning-foreground">Warning</Badge>
      case "info":
        return <Badge variant="secondary">Info</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivities.map((activity: any) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={activity.user.avatar || "/placeholder.svg"} />
                <AvatarFallback>{activity.user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  {getActivityIcon(activity.type)}
                  <p className="text-sm text-foreground">
                    <span className="font-medium">{activity.user.name}</span> {activity.message}
                  </p>
                  {getSeverityBadge(activity.severity)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
