import { Calendar, Eye, Flag, Heart, MapPin, MessageCircle, Settings, Share, Shield, TrendingUp, User, Users, Video } from "lucide-react"
import { useState, useEffect , useCallback } from "react"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { apiClient } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"

"use client"

interface UserProfile {}
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  bio?: string;
  location?: string;
  joinedDate: string;
  isOnline: boolean;
  lastSeen?: string;
  isVerified: boolean;
  stats: {}
    videosUploaded: number;
    partiesHosted: number;
    partiesAttended: number;
    friendsCount: number;
    totalWatchTime: number;
    favoriteGenres: string[]
  }
  privacy: {}
    showEmail: boolean;
    showActivity: boolean;
    showFriends: boolean;
    allowFriendRequests: boolean;
  }
  friendshipStatus: "none" | "pending_sent" | "pending_received" | "friends" | "blocked"
  mutualFriends: Array<{}
    id: string;
    username: string;
    avatar?: string;
  }>
  recentActivity: Array<{}
    id: string;
    type: "video_upload" | "party_host" | "party_join" | "achievement"
    description: string;
    createdAt: string;
    metadata?: unknown;
  }>
}

interface UserVideo {}
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: number;
  views: number;
  likes: number;
  createdAt: string;
  privacy: "public" | "friends" | "private"
}

export default function UserProfilePage() {}
  const params = useParams()
  const router = useRouter()
  const { user: currentUser } = useAuth()
  const { toast } = useToast()
  const userId = params.userId as string;
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [videos, setVideos] = useState<UserVideo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {}
    if (userId) {}
      loadUserProfile()
      loadUserVideos()
    }
  }, [userId])

  const loadUserProfile = async () => {}
    try {}
      const response = await apiClient.get(`/api/users/${userId}/profile/`)

      if (response.status === 200) {}
        const data = response.data;
        setProfile(data)
      } else if (response.status === 404) {}
        toast({title: "User not found",
          description: "The user profile you're looking for doesn't exist.",
          variant: "destructive",
        })
        router.push("/dashboard")
      }
    } catch {}
      console.error("Failed to load user profile:", error)
      toast({title: "Error",
        description: "Failed to load user profile. Please try again.",
        variant: "destructive",
      })
    } finally {}
      setIsLoading(false)
    }
  }

  const loadUserVideos = async () => {}
    try {}
      const response = await apiClient.get(`/api/users/${userId}/videos/`)

      if (response.status === 200) {}
        const data = response.data;
        setVideos(data.results || data.videos || [])
      }
    } catch {}
      console.error("Failed to load user videos:", error)
    }
  }

  const handleFriendAction = async (action: "send_request" | "accept" | "decline" | "remove" | "block") => {}
    try {}
      let endpoint = ""

      switch (action) {}
        case "send_request":
          endpoint = "/api/users/friends/request/"
          break;
        case "accept":
          endpoint = `/api/users/friends/${profile?.id}/accept/`
          break;
        case "decline":
          endpoint = `/api/users/friends/${profile?.id}/decline/`
          break;
        case "remove":
          endpoint = `/api/users/friends/${profile?.username}/remove/`
          break;
        case "block":
          endpoint = "/api/users/block/"
          break;
      }

      let response;
      const data = { username: profile?.username,
        user_id: profile?.id,
      }

      if (action === "remove") {}
        response = await apiClient.delete(endpoint, { data })
      } else {}
        response = await apiClient.post(endpoint, data)
      }

      if (response.status === 200) {}
        await loadUserProfile() // Refresh profile to update friendship status;
        toast({title: "Success",
          description: `Friend ${action.replace("_", " ")} successful.`,
        })
      }
    } catch {}
      console.error(`Failed to ${action}:`, error)
      toast({title: "Error",
        description: `Failed to ${action.replace("_", " ")}. Please try again.`,
        variant: "destructive",
      })
    }
  }

  const handleReportUser = async () => {}
    try {}
      const response = await apiClient.post("/api/users/report/", {}
        reported_user: profile?.id,
        reason: "inappropriate_behavior",
        description: "Reported from profile page",
      })

      if (response.status === 200) {}
        toast({title: "Report Submitted",
          description: "Thank you for reporting. We'll review this user.",
        })
      }
    } catch {}
      console.error("Failed to report user:", error)
      toast({title: "Error",
        description: "Failed to submit report. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getFriendshipButton = () => {}
    if (!profile || profile.id === currentUser?.id) return null;
    switch (profile.friendshipStatus) {}
      case "none":
        return (
          <Button onClick={() => handleFriendAction(&quot;send_request")} className="flex items-center gap-2">"
            <UserPlus className="w-4 h-4" />
            Add Friend;
          </Button>
        )
      case "pending_sent":
        return (
          <Button variant="outline" disabled>
            Friend Request Sent;
          </Button>
        )
      case "pending_received":
        return (
          <div className="flex gap-2">
            <Button onClick={() => handleFriendAction(&quot;accept")} size="sm">
              Accept;
            </Button>
            <Button onClick={() => handleFriendAction(&quot;decline")} variant="outline" size="sm">
              Decline;
            </Button>
          </div>
        )
      case "friends":
        return (
          <Button onClick={() => handleFriendAction(&quot;remove")} variant="outline" className="flex items-center gap-2">"
            <UserMinus className="w-4 h-4" />
            Remove Friend;
          </Button>
        )
      case "blocked":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            Blocked;
          </Badge>
        )
      default:
        return null;
    }
  }

  const isOwnProfile = profile?.id === currentUser?.id;
  if (isLoading) {}
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {}
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
        <p className="text-gray-600 mb-4">The user profile you&apos;re looking for doesn't exist.</p>
        <Button onClick={() => router.push(&quot;/dashboard")}>Return to Dashboard</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Profile Header */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar and Basic Info */}
            <div className="flex flex-col items-center md:items-start">
              <Avatar className="w-32 h-32 mb-4">
                <AvatarImage src={profile.avatar || "/placeholder-user.jpg"} />
                <AvatarFallback className="text-2xl">
                  {profile.firstName[0]}{profile.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${profile.isOnline ? "bg-green-500" : "bg-gray-400"}`} />
                <span className="text-sm text-gray-600">
                  {profile.isOnline;
                    ? "Online"
                    : profile.lastSeen;
                      ? `Last seen ${formatDistanceToNow(new Date(profile.lastSeen), { addSuffix: true })}`
                      : "Offline"}
                </span>
              </div>
              {profile.isVerified && (
                <Badge variant="default" className="mb-2">
                  <Shield className="w-3 h-3 mr-1" />
                  Verified;
                </Badge>
              )}
            </div>

            {/* Profile Details */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    {profile.firstName} {profile.lastName}
                  </h1>
                  <p className="text-gray-600 mb-2">@{profile.username}</p>
                  {profile.bio && <p className="text-gray-700 mb-4">{profile.bio}</p>}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {getFriendshipButton()}
                  {isOwnProfile ? (
                    <Button onClick={() => router.push(&quot;/dashboard/settings")} variant="outline">
                      <Settings className="w-4 h-4 mr-2" />
                      Edit Profile;
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" size="icon">
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="icon">
                        <Share className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={handleReportUser}>
                        <Flag className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Profile Metadata */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {profile.location && (
                  <div className="flex items-center gap-1 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    {profile.location}
                  </div>
                )}
                <div className="flex items-center gap-1 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  Joined {formatDistanceToNow(new Date(profile.joinedDate), { addSuffix: true })}
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <Users className="w-4 h-4" />
                  {profile.stats.friendsCount} friends;
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <Video className="w-4 h-4" />
                  {profile.stats.videosUploaded} videos;
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="friends">Friends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Videos Uploaded</span>
                  <span className="font-semibold">{profile.stats.videosUploaded}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Parties Hosted</span>
                  <span className="font-semibold">{profile.stats.partiesHosted}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Parties Attended</span>
                  <span className="font-semibold">{profile.stats.partiesAttended}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Watch Time</span>
                  <span className="font-semibold">{Math.round(profile.stats.totalWatchTime / 60)} hours</span>
                </div>
              </CardContent>
            </Card>

            {/* Mutual Friends */}
            {!isOwnProfile && profile.mutualFriends.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Mutual Friends ({profile.mutualFriends.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {profile.mutualFriends.slice(0, 5).map((friend) => (
                      <div key={friend.id} className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={friend.avatar || "/placeholder-user.jpg"} />
                          <AvatarFallback className="text-xs">{friend.username[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{friend.username}</span>
                      </div>
                    ))}
                    {profile.mutualFriends.length > 5 && (
                      <p className="text-sm text-gray-600">+{profile.mutualFriends.length - 5} more</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Favorite Genres */}
            {profile.stats.favoriteGenres.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Favorite Genres</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profile.stats.favoriteGenres.map((genre) => (
                      <Badge key={genre} variant="outline">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="videos" className="space-y-6">
          {videos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => (
                <Card key={video.id} className="overflow-hidden">
                  <div className="aspect-video bg-gray-200 relative">
                    <img;
                      src={video.thumbnail || "/placeholder.jpg"}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                      {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, "0")}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2 line-clamp-2">{video.title}</h3>
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {video.views.toLocaleString()} views;
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {video.likes}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Video className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">No Videos Yet</h3>
                <p className="text-gray-600">
                  {isOwnProfile ? "Upload your first video to get started!" : "This user hasn't uploaded any videos yet."}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          {profile.recentActivity.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profile.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 pb-4 border-b last:border-b-0">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm">{activity.description}</p>
                        <p className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">No Recent Activity</h3>
                <p className="text-gray-600">No recent activity to show.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="friends" className="space-y-6">
          {profile.privacy.showFriends || isOwnProfile ? (
            <Card>
              <CardHeader>
                <CardTitle>Friends ({profile.stats.friendsCount})</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Friends list will be implemented here.</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">Friends List Private</h3>
                <p className="text-gray-600">This user&apos;s friends list is private.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
