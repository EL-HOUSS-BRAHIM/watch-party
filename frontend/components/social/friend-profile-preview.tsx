"use client"

import { Activity, Calendar, Clock, Flag, MapPin, MessageCircle, MoreHorizontal, Play, Shield, Star, Trophy, User, Users } from "lucide-react"
import { useState, useEffect , useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"


import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDistanceToNow, format } from "date-fns"

  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
interface Achievement {}
  id: string
  name: string
  description: string
  icon: string
  rarity: "common" | "rare" | "epic" | "legendary"
  unlockedAt: string
  progress: number
  maxProgress: number
}

interface WatchHistory {}
  id: string
  videoTitle: string
  watchedAt: string
  duration: number
  completionRate: number
}

interface FriendProfile {}
  id: string
  username: string
  firstName: string
  lastName: string
  email: string
  avatar?: string
  bio?: string
  location?: string
  isOnline: boolean
  lastActive: string
  joinedDate: string
  friendshipStatus: "none" | "friends" | "pending_sent" | "pending_received" | "blocked"
  stats: {}
    partiesHosted: number
    partiesJoined: number
    friendsCount: number
    totalWatchTime: number
    favoriteGenres: string[]
    averageRating: number
    reviewsCount: number
  }
  achievements: Achievement[]
  recentActivity: WatchHistory[]
  mutualFriends: {}
    id: string
    username: string
    firstName: string
    lastName: string
    avatar?: string
  }[]
  preferences: {}
    profileVisibility: "public" | "friends" | "private"
    showActivity: boolean
    showWatchHistory: boolean
  }
}

interface FriendProfilePreviewProps {}
  userId: string
  isOpen: boolean
  onClose: () => void
  className?: string
}

export default function FriendProfilePreview({ userId, isOpen, onClose, className }: FriendProfilePreviewProps) {}
  const [profile, setProfile] = useState<FriendProfile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isActioning, setIsActioning] = useState(false)

  const { toast } = useToast()

  useEffect(() => {
    if (isOpen && userId) {
      loadProfile()
    }
  }, [isOpen, userId])

  const loadProfile = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`/api/users/${userId}/profile/`, {}
        headers: {}
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data.profile)
      } else {}
        throw new Error("Failed to load profile")
      }
    } catch (err) {
      console.error("Failed to load profile:", error)
      toast({title: "Failed to load profile",
        description: "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const sendFriendRequest = async () => {
    if (!profile) return
    setIsActioning(true)
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`/api/users/${profile.id}/friend-request/`, {}
        method: "POST",
        headers: {}
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setProfile(prev => prev ? { ...prev, friendshipStatus: "pending_sent" } : null)
        toast({title: "Friend request sent",
          description: `Friend request sent to ${profile.firstName}`,
        })
      } else {}
        throw new Error("Failed to send friend request")
      }
    } catch (err) {
      console.error("Failed to send friend request:", error)
      toast({title: "Failed to send request",
        description: "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsActioning(false)
    }
  }

  const removeFriend = async () => {
    if (!profile) return
    setIsActioning(true)
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`/api/users/${profile.id}/unfriend/`, {}
        method: "DELETE",
        headers: {}
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setProfile(prev => prev ? { ...prev, friendshipStatus: "none" } : null)
        toast({title: "Friend removed",
          description: `Removed ${profile.firstName} from your friends`,
        })
      } else {}
        throw new Error("Failed to remove friend")
      }
    } catch (err) {
      console.error("Failed to remove friend:", error)
      toast({title: "Failed to remove friend",
        description: "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsActioning(false)
    }
  }

  const blockUser = async () => {
    if (!profile) return
    setIsActioning(true)
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`/api/users/${profile.id}/block/`, {}
        method: "POST",
        headers: {}
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setProfile(prev => prev ? { ...prev, friendshipStatus: "blocked" } : null)
        toast({title: "User blocked",
          description: `${profile.firstName} has been blocked`,
        })
        onClose()
      } else {}
        throw new Error("Failed to block user")
      }
    } catch (err) {
      console.error("Failed to block user:", error)
      toast({title: "Failed to block user",
        description: "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsActioning(false)
    }
  }

  const getUserInitials = (firstName: string, lastName: string) => {}
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase()
  }

  const getAchievementIcon = (achievement: Achievement) => {}
    // Map achievement icons to components
    const iconMap: Record<string, any> = { trophy: Trophy,
      star: Star,
      award: Award,
      gift: Gift,
      heart: Heart,
      play: Play,
    }
    const IconComponent = iconMap[achievement.icon] || Trophy
    return <IconComponent className="h-4 w-4" />
  }

  const getRarityColor = (rarity: string) => {}
    switch (rarity) {
      case "legendary": return "text-yellow-500"
      case "epic": return "text-purple-500"
      case "rare": return "text-blue-500"
      default: return "text-gray-500"
    }
  }

  const getFriendshipButton = () => {}
    if (!profile) return null
    switch (profile.friendshipStatus) {
      case "friends":
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={isActioning}>
                <Users className="h-4 w-4 mr-2" />
                Friends
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={removeFriend}>
                <UserMinus className="h-4 w-4 mr-2" />
                Remove Friend
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      case "pending_sent":
        return (
          <Button variant="outline" disabled>
            <Clock className="h-4 w-4 mr-2" />
            Request Sent
          </Button>
        )
      case "pending_received":
        return (
          <Button onClick={sendFriendRequest} disabled={isActioning}>
            <UserPlus className="h-4 w-4 mr-2" />
            Accept Request
          </Button>
        )
      case "blocked":
        return (
          <Badge variant="destructive">
            <Shield className="h-4 w-4 mr-1" />
            Blocked
          </Badge>
        )
      default:
        return (
          <Button onClick={sendFriendRequest} disabled={isActioning}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Friend
          </Button>
        )
    }
  }

  if (!isOpen) return null
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading profile...</span>
          </div>
        ) : profile ? (
          <div className="space-y-6">
            {/* Header */}
            <DialogHeader>
              <div className="flex items-start gap-4">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profile.avatar} />
                    <AvatarFallback className="text-lg">
                      {getUserInitials(profile.firstName, profile.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  {profile.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>

                <div className="flex-1">
                  <DialogTitle className="text-2xl">
                    {profile.firstName} {profile.lastName}
                  </DialogTitle>
                  <DialogDescription className="text-base">
                    @{profile.username}
                  </DialogDescription>

                  {profile.bio && (
                    <p className="text-sm text-muted-foreground mt-2">{profile.bio}</p>
                  )}

                  <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                    {profile.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {profile.location}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Joined {format(new Date(profile.joinedDate), "MMM yyyy")}
                    </div>
                    <div className="flex items-center gap-1">
                      <Activity className="h-4 w-4" />
                      {profile.isOnline ? "Online now" : `Last seen ${formatDistanceToNow(new Date(profile.lastActive), { addSuffix: true })}`}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {getFriendshipButton()}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Send Message
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Flag className="h-4 w-4 mr-2" />
                        Report User
                      </DropdownMenuItem>
                      {profile.friendshipStatus !== "blocked" && (
                        <DropdownMenuItem onClick={blockUser} className="text-red-600">
                          <Shield className="h-4 w-4 mr-2" />
                          Block User
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </DialogHeader>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">{profile.stats.friendsCount}</div>
                  <div className="text-sm text-muted-foreground">Friends</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">{profile.stats.partiesHosted}</div>
                  <div className="text-sm text-muted-foreground">Hosted</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">{profile.stats.partiesJoined}</div>
                  <div className="text-sm text-muted-foreground">Joined</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">{Math.round(profile.stats.totalWatchTime / 60)}h</div>
                  <div className="text-sm text-muted-foreground">Watched</div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs Content */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="achievements">Achievements</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="friends">Friends</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                {/* Favorite Genres */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Favorite Genres</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {profile.stats.favoriteGenres.map((genre) => (
                        <Badge key={genre} variant="secondary">
                          {genre}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Reviews */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Reviews</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-yellow-500" />
                        <span className="text-xl font-bold">{profile.stats.averageRating.toFixed(1)}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {profile.stats.reviewsCount} reviews
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="achievements" className="space-y-4">
                {profile.achievements.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No achievements yet</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {profile.achievements.map((achievement) => (
                      <Card key={achievement.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className={`p-2 rounded-lg bg-muted ${getRarityColor(achievement.rarity)}`}>
                              {getAchievementIcon(achievement)}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold">{achievement.name}</h3>
                              <p className="text-sm text-muted-foreground mb-2">
                                {achievement.description}
                              </p>
                              {achievement.progress < achievement.maxProgress && (}
                                <div className="space-y-1">
                                  <div className="flex justify-between text-xs">
                                    <span>Progress</span>
                                    <span>{achievement.progress}/{achievement.maxProgress}</span>
                                  </div>
                                  <Progress
                                    value={(achievement.progress / achievement.maxProgress) * 100} 
                                    className="h-2"
                                  />
                                </div>
                              )}
                            </div>
                            <div className="text-right text-xs text-muted-foreground">
                              <Badge variant="outline" className={getRarityColor(achievement.rarity)}>
                                {achievement.rarity}
                              </Badge>
                              {achievement.progress >= achievement.maxProgress && (
                                <div className="mt-1">
                                  {formatDistanceToNow(new Date(achievement.unlockedAt), { addSuffix: true })}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="activity" className="space-y-4">
                {!profile.preferences.showActivity ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Activity is private</p>
                  </div>
                ) : profile.recentActivity.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No recent activity</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {profile.recentActivity.map((activity) => (
                      <Card key={activity.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <Play className="h-4 w-4 text-primary" />
                            <div className="flex-1">
                              <h4 className="font-medium">{activity.videoTitle}</h4>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>{formatDistanceToNow(new Date(activity.watchedAt), { addSuffix: true })}</span>
                                <span>{Math.round(activity.duration / 60)} min</span>
                                <span>{Math.round(activity.completionRate * 100)}% watched</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="friends" className="space-y-4">
                {profile.mutualFriends.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No mutual friends</p>
                  </div>
                ) : (
                  <>
                    <div className="text-sm text-muted-foreground">
                      {profile.mutualFriends.length} mutual friend{profile.mutualFriends.length === 1 ? '' : 's'}
                    </div>
                    <div className="grid gap-3">
                      {profile.mutualFriends.map((friend) => (
                        <Card key={friend.id}>
                          <CardContent className="p-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={friend.avatar} />
                                <AvatarFallback className="text-xs">
                                  {getUserInitials(friend.firstName, friend.lastName)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-medium text-sm">
                                  {friend.firstName} {friend.lastName}
                                </h4>
                                <p className="text-xs text-muted-foreground">@{friend.username}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </>
                )}
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="text-center py-8">
            <p>Failed to load profile</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
