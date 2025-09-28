"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity, Users, Video, Crown, Heart, ThumbsUp, Trophy, Star, Play, UserPlus, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { usersAPI } from "@/lib/api"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

interface ActivityItem {
  id: string
  type: "friend_added" | "party_joined" | "party_created" | "video_watched" | "achievement_unlocked" | "party_completed"
  user: {
    id: string
    username: string
    firstName: string
    lastName: string
    avatar?: string
    isPremium: boolean
  }
  timestamp: string
  data: {
    friendName?: string
    partyName?: string
    partyId?: string
    videoTitle?: string
    videoId?: string
    achievementName?: string
    achievementIcon?: string
    participantCount?: number
    duration?: number
  }
  isPublic: boolean
  reactions?: {
    likes: number
    hearts: number
    userReacted?: "like" | "heart" | null
  }
}

interface ActivityFeedProps {
  userId?: string // If provided, show activities for specific user
  className?: string
}

export default function ActivityFeed({ userId, className }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    loadActivities()
  }, [activeTab, userId])

  const loadActivities = async (pageNum = 1) => {
    try {
      if (!usersAPI) {
        console.error('Users API not available')
        return
      }

      const params: Record<string, string | number> = {
        page: pageNum,
        filter: activeTab,
      }

      if (userId) {
        params.user_id = userId
      }

      const response = await usersAPI.getActivity(params)
      
      if (pageNum === 1) {
        setActivities(response.results || [])
      } else {
        setActivities((prev) => [...prev, ...(response.results || [])])
      }
      setHasMore(!!response.next)
      setPage(pageNum)
    } catch {
      console.error("Failed to load activity feed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadMore = () => {
    if (hasMore && !isLoading) {
      loadActivities(page + 1)
    }
  }

  const reactToActivity = async (activityId: string, reactionType: "like" | "heart") => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`/api/users/activity/${activityId}/react/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reaction: reactionType }),
      })

      if (response.ok) {
        const data = await response.json()
        setActivities((prev) =>
          prev.map((activity) => (activity.id === activityId ? { ...activity, reactions: data.reactions } : activity)),
        )
      }
    } catch {
      console.error("Failed to react to activity:", error)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "friend_added":
        return <UserPlus className="h-5 w-5 text-blue-500" />
      case "party_joined":
        return <Users className="h-5 w-5 text-green-500" />
      case "party_created":
        return <Video className="h-5 w-5 text-purple-500" />
      case "video_watched":
        return <Play className="h-5 w-5 text-red-500" />
      case "achievement_unlocked":
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case "party_completed":
        return <Star className="h-5 w-5 text-indigo-500" />
      default:
        return <Activity className="h-5 w-5 text-gray-500" />
    }
  }

  const getActivityText = (activity: ActivityItem) => {
    const userName = `${activity.user.firstName} ${activity.user.lastName}`

    switch (activity.type) {
      case "friend_added":
        return `${userName} became friends with ${activity.data.friendName}`
      case "party_joined":
        return `${userName} joined "${activity.data.partyName}"`
      case "party_created":
        return `${userName} created a new watch party "${activity.data.partyName}"`
      case "video_watched":
        return `${userName} watched "${activity.data.videoTitle}"`
      case "achievement_unlocked":
        return `${userName} unlocked the "${activity.data.achievementName}" achievement`
      case "party_completed":
        return `${userName} completed a watch party with ${activity.data.participantCount} participants`
      default:
        return `${userName} had some activity`
    }
  }

  const getActivitySubtext = (activity: ActivityItem) => {
    switch (activity.type) {
      case "party_joined":
      case "party_created":
        return activity.data.participantCount
          ? `${activity.data.participantCount} participant${activity.data.participantCount !== 1 ? "s" : ""}`
          : null
      case "video_watched":
        return activity.data.duration ? `${Math.floor(activity.data.duration / 60)} minutes` : null
      case "party_completed":
        return activity.data.duration ? `Watched for ${Math.floor(activity.data.duration / 60)} minutes` : null
      default:
        return null
    }
  }

  const getUserInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const ActivityCard = ({ activity }: { activity: ActivityItem }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarImage src={activity.user.avatar || "/placeholder.svg"} />
                <AvatarFallback className="text-sm">
                  {getUserInitials(activity.user.firstName, activity.user.lastName)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1">
                {getActivityIcon(activity.type)}
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{getActivityText(activity)}</span>
                  {activity.user.isPremium && <Crown className="h-4 w-4 text-yellow-500" />}
                </div>

                {getActivitySubtext(activity) && (
                  <p className="text-sm text-gray-600 mb-2">{getActivitySubtext(activity)}</p>
                )}

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}</span>

                  {activity.reactions && (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => reactToActivity(activity.id, &quot;like&quot;)}
                        className={cn(
                          "flex items-center gap-1 hover:text-blue-600 transition-colors",
                          activity.reactions.userReacted === "like" && "text-blue-600",
                        )}
                      >
                        <ThumbsUp className="h-4 w-4" />
                        {activity.reactions.likes > 0 && activity.reactions.likes}
                      </button>

                      <button
                        onClick={() => reactToActivity(activity.id, &quot;heart&quot;)}
                        className={cn(
                          "flex items-center gap-1 hover:text-red-600 transition-colors",
                          activity.reactions.userReacted === "heart" && "text-red-600",
                        )}
                      >
                        <Heart className="h-4 w-4" />
                        {activity.reactions.hearts > 0 && activity.reactions.hearts}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Achievement badge for achievement activities */}
            {activity.type === "achievement_unlocked" && (
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  <span className="font-medium text-yellow-800">{activity.data.achievementName}</span>
                </div>
              </div>
            )}

            {/* Party info for party activities */}
            {(activity.type === "party_joined" || activity.type === "party_created") && activity.data.partyId && (
              <div className="mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => (window.location.href = `/watch/${activity.data.partyId}`)}
                >
                  <Video className="mr-2 h-4 w-4" />
                  View Party
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className={cn("space-y-6", className)}>
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Activity className="h-6 w-6" />
          {userId ? "User Activity" : "Activity Feed"}
        </h2>
        <p className="text-gray-600">
          {userId ? "See what this user has been up to" : "Stay updated with your friends' activities"}
        </p>
      </div>

      {!userId && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Activity</TabsTrigger>
            <TabsTrigger value="friends">Friends</TabsTrigger>
            <TabsTrigger value="parties">Parties</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      <div className="space-y-4">
        {isLoading && activities.length === 0 ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading activity feed...</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No activity yet</h3>
            <p className="text-gray-600">
              {userId
                ? "This user hasn't had any recent activity."
                : "Follow some friends to see their activities here!"}
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {activities.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}

              {hasMore && (
                <div className="text-center py-4">
                  <Button variant="outline" onClick={loadMore} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "Load More"
                    )}
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  )
}
