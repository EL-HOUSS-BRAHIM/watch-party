"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Play, Users, Heart, MessageCircle, Share, Crown, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface ActivityItem {
  id: string
  type: "party_created" | "party_joined" | "video_uploaded" | "friend_added" | "party_ended"
  user: {
    id: string
    username: string
    avatar?: string
    first_name: string
    last_name: string
  }
  timestamp: string
  data: {
    party_title?: string
    party_id?: string
    video_title?: string
    video_id?: string
    friend_name?: string
    participants?: number
    duration?: string
  }
  likes: number
  comments: number
  is_liked: boolean
}

// Mock activity data
const mockActivities: ActivityItem[] = [
  {
    id: "1",
    type: "party_created",
    user: {
      id: "user-1",
      username: "sarah_j",
      avatar: "/placeholder.svg?height=40&width=40",
      first_name: "Sarah",
      last_name: "Johnson",
    },
    timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
    data: {
      party_title: "Marvel Movie Marathon",
      party_id: "party-1",
      participants: 8,
    },
    likes: 12,
    comments: 3,
    is_liked: false,
  },
  {
    id: "2",
    type: "party_joined",
    user: {
      id: "user-2",
      username: "mike_c",
      avatar: "/placeholder.svg?height=40&width=40",
      first_name: "Mike",
      last_name: "Chen",
    },
    timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    data: {
      party_title: "Documentary Night",
      party_id: "party-2",
    },
    likes: 5,
    comments: 1,
    is_liked: true,
  },
  {
    id: "3",
    type: "video_uploaded",
    user: {
      id: "user-3",
      username: "alex_r",
      avatar: "/placeholder.svg?height=40&width=40",
      first_name: "Alex",
      last_name: "Rivera",
    },
    timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    data: {
      video_title: "Vacation Highlights 2024",
      video_id: "video-1",
    },
    likes: 18,
    comments: 7,
    is_liked: false,
  },
  {
    id: "4",
    type: "friend_added",
    user: {
      id: "user-4",
      username: "emma_w",
      avatar: "/placeholder.svg?height=40&width=40",
      first_name: "Emma",
      last_name: "Wilson",
    },
    timestamp: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
    data: {
      friend_name: "David Miller",
    },
    likes: 8,
    comments: 2,
    is_liked: true,
  },
  {
    id: "5",
    type: "party_ended",
    user: {
      id: "user-1",
      username: "sarah_j",
      avatar: "/placeholder.svg?height=40&width=40",
      first_name: "Sarah",
      last_name: "Johnson",
    },
    timestamp: new Date(Date.now() - 14400000).toISOString(), // 4 hours ago
    data: {
      party_title: "Comedy Night",
      party_id: "party-3",
      participants: 15,
      duration: "2h 30m",
    },
    likes: 25,
    comments: 8,
    is_liked: false,
  },
]

export function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>(mockActivities)

  const toggleLike = (activityId: string) => {
    setActivities((prev) =>
      prev.map((activity) =>
        activity.id === activityId
          ? {
              ...activity,
              is_liked: !activity.is_liked,
              likes: activity.is_liked ? activity.likes - 1 : activity.likes + 1,
            }
          : activity,
      ),
    )
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "party_created":
        return <Crown className="w-4 h-4 text-accent-premium" />
      case "party_joined":
        return <Users className="w-4 h-4 text-accent-primary" />
      case "video_uploaded":
        return <Play className="w-4 h-4 text-accent-success" />
      case "friend_added":
        return <Users className="w-4 h-4 text-accent-primary" />
      case "party_ended":
        return <Clock className="w-4 h-4 text-muted-foreground" />
      default:
        return <Play className="w-4 h-4 text-muted-foreground" />
    }
  }

  const getActivityText = (activity: ActivityItem) => {
    switch (activity.type) {
      case "party_created":
        return (
          <>
            created a new watch party <span className="font-medium text-foreground">"{activity.data.party_title}"</span>
            {activity.data.participants && (
              <Badge variant="secondary" className="ml-2">
                {activity.data.participants} joined
              </Badge>
            )}
          </>
        )
      case "party_joined":
        return (
          <>
            joined <span className="font-medium text-foreground">"{activity.data.party_title}"</span>
          </>
        )
      case "video_uploaded":
        return (
          <>
            uploaded a new video <span className="font-medium text-foreground">"{activity.data.video_title}"</span>
          </>
        )
      case "friend_added":
        return (
          <>
            is now friends with <span className="font-medium text-foreground">{activity.data.friend_name}</span>
          </>
        )
      case "party_ended":
        return (
          <>
            finished hosting <span className="font-medium text-foreground">"{activity.data.party_title}"</span>
            {activity.data.duration && (
              <Badge variant="secondary" className="ml-2">
                {activity.data.duration}
              </Badge>
            )}
          </>
        )
      default:
        return "had some activity"
    }
  }

  const renderActivity = (activity: ActivityItem) => (
    <Card key={activity.id} className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-glow transition-all">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="relative">
            <Avatar className="w-10 h-10">
              <AvatarImage src={activity.user.avatar || "/placeholder.svg"} />
              <AvatarFallback>
                {activity.user.first_name[0]}
                {activity.user.last_name[0]}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-background rounded-full flex items-center justify-center border border-border">
              {getActivityIcon(activity.type)}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-medium">
                {activity.user.first_name} {activity.user.last_name}
              </span>
              <span className="text-sm text-muted-foreground">@{activity.user.username}</span>
            </div>

            <p className="text-sm text-muted-foreground mb-2">{getActivityText(activity)}</p>

            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
              </p>

              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => toggleLike(activity.id)}>
                  <Heart
                    className={`w-4 h-4 mr-1 ${
                      activity.is_liked ? "fill-accent-error text-accent-error" : "text-muted-foreground"
                    }`}
                  />
                  <span className="text-xs">{activity.likes}</span>
                </Button>

                <Button variant="ghost" size="sm" className="h-8 px-2">
                  <MessageCircle className="w-4 h-4 mr-1 text-muted-foreground" />
                  <span className="text-xs">{activity.comments}</span>
                </Button>

                <Button variant="ghost" size="sm" className="h-8 px-2">
                  <Share className="w-4 h-4 text-muted-foreground" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Recent Activity</h2>
        <Badge variant="secondary">{activities.length} updates</Badge>
      </div>

      {activities.length === 0 ? (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No recent activity</h3>
            <p className="text-muted-foreground">
              When your friends create parties, upload videos, or make connections, you'll see it here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">{activities.map(renderActivity)}</div>
      )}
    </div>
  )
}
