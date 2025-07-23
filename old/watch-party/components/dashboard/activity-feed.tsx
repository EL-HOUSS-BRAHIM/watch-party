"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, MessageSquare, Users, Video } from "lucide-react"

interface ActivityFeedProps {
  activities: any
  isLoading: boolean
}

export function ActivityFeed({ activities, isLoading }: ActivityFeedProps) {
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
      type: "party_created",
      user: { name: "You", avatar: null },
      message: "created a new watch party",
      target: "Liverpool vs Arsenal",
      time: "2 hours ago",
    },
    {
      id: 2,
      type: "friend_joined",
      user: { name: "Sarah Chen", avatar: "/placeholder.svg?height=32&width=32&text=SC" },
      message: "joined your party",
      target: "Champions League Final",
      time: "4 hours ago",
    },
    {
      id: 3,
      type: "message_sent",
      user: { name: "Mike Johnson", avatar: "/placeholder.svg?height=32&width=32&text=MJ" },
      message: "sent a message in",
      target: "El Clasico Watch Party",
      time: "1 day ago",
    },
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "party_created":
        return <Calendar className="h-4 w-4 text-primary" />
      case "friend_joined":
        return <Users className="h-4 w-4 text-success" />
      case "message_sent":
        return <MessageSquare className="h-4 w-4 text-premium" />
      case "video_uploaded":
        return <Video className="h-4 w-4 text-violet-400" />
      default:
        return <Calendar className="h-4 w-4 text-muted-foreground" />
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
                    <span className="font-medium">{activity.user.name}</span> {activity.message}{" "}
                    <span className="font-medium">{activity.target}</span>
                  </p>
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
