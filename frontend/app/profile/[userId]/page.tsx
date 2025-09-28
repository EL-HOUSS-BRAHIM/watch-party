import { Activity, Award, Calendar, Clock, Eye, EyeOff, Flag, Image, Link, Lock, Mail, MapPin, MessageCircle, Play, Share, Shield, Star, Trophy, User, Users } from "lucide-react"
import { useState, useEffect , useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { usersAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"
import Link from "next/link"

"use client"

interface PublicProfile {}
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatar: string;
  coverImage: string;
  location: string;
  website: string;
  joinDate: string;
  isPublic: boolean;
  showEmail: boolean;
  showLocation: boolean;
  showBirthDate: boolean;
  email?: string;
  birthDate?: string;
  friendshipStatus: "none" | "pending" | "friends" | "blocked" | "self"
  mutualFriends: number;
  stats: {}
    watchParties: number;
    hoursWatched: number;
    friendsCount: number;
    achievementsCount: number;
    favoriteMovies: number;
    totalRatings: number;
    averageRating: number;
    streakDays: number;
  }
  recentActivity: Array<{}
    id: string;
    type: "party" | "rating" | "friend" | "achievement"
    title: string;
    description: string;
    timestamp: string;
    isPublic: boolean;
  }>
  achievements: Array<{}
    id: string;
    name: string;
    description: string;
    icon: string;
    unlockedAt: string;
    rarity: "common" | "rare" | "epic" | "legendary"
    isPublic: boolean;
  }>
  favoriteGenres: Array<{}
    name: string;
    count: number;
    percentage: number;
  }>
}

export default function PublicProfilePage() {}
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()

  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  const userId = params.userId as string;
  useEffect(() => {}
    if (userId) {}
      fetchProfile()
    }
  }, [userId])

  const fetchProfile = async () => {}
    try {}
      if (!usersAPI) {}
        console.error('Users API not available')
        return;
      }
      const data = await usersAPI.getUserProfile(userId)
      setProfile(data as PublicProfile)
    } catch {}
      console.error("Profile fetch error:", error)
      // Handle API errors;
      const apiError = error as Record<string, unknown>
      if (apiError?.status === 404) {}
        router.push("/not-found")
        return;
      } else if (apiError?.status === 403) {}
        setProfile({...({} as PublicProfile),
          isPublic: false,
          friendshipStatus: "blocked",
        })
        return;
      }
      // Mock data for demonstration when API fails;
      setProfile({id: userId,
        username: "sampleuser",
        displayName: "Sample User",
        bio: "Movie enthusiast and watch party host. Love discussing films and discovering new content!",
        avatar: "/placeholder-user.jpg",
        coverImage: "",
        location: "San Francisco, CA",
        website: "https://example.com",
        joinDate: "2023-06-15T00:00:00Z",
        isPublic: true,
        showEmail: false,
        showLocation: true,
        showBirthDate: false,
        friendshipStatus: "none",
        mutualFriends: 5,
        stats: {}
          watchParties: 42,
          hoursWatched: 256,
          friendsCount: 128,
          achievementsCount: 15,
          favoriteMovies: 89,
          totalRatings: 234,
          averageRating: 4.2,
          streakDays: 12,
        },
        recentActivity: []
          {}
            id: "1",
            type: "party",
            title: "Hosted Movie Night",
            description: "Hosted a watch party for The Matrix",
            timestamp: "2024-01-15T20:00:00Z",
            isPublic: true,
          },
          {}
            id: "2",
            type: "achievement",
            title: "Movie Marathon Master",
            description: "Watched 10 movies in a single week",
            timestamp: "2024-01-14T10:00:00Z",
            isPublic: true,
          },
        ],
        achievements: []
          {}
            id: "1",
            name: "Movie Marathon Master",
            description: "Watched 10 movies in a single week",
            icon: "🏃‍♂️",
            unlockedAt: "2024-01-14T10:00:00Z",
            rarity: "rare",
            isPublic: true,
          },
          {}
            id: "2",
            name: "Party Host",
            description: "Hosted your first watch party",
            icon: "🎉",
            unlockedAt: "2024-01-10T15:30:00Z",
            rarity: "common",
            isPublic: true,
          },
        ],
        favoriteGenres: []
          { name: "Action", count: 25, percentage: 28 },
          { name: "Comedy", count: 20, percentage: 22 },
          { name: "Drama", count: 18, percentage: 20 },
          { name: "Sci-Fi", count: 15, percentage: 17 },
          { name: "Horror", count: 11, percentage: 13 },
        ],
      })
    } finally {}
      setIsLoading(false)
    }
  }

  const handleFriendAction = async (action: "add" | "remove" | "accept" | "decline" | "cancel") => {}
    if (!user) {}
      router.push("/login")
      return;
    }

    setIsActionLoading(true)

    try {}
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`/api/users/${userId}/friendship/`, {}
        method: "POST",
        headers: {}
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      })

      if (response.ok) {}
        const data = await response.json()
        setProfile((prev) =>
          prev ? { ...prev, friendshipStatus: data.status, mutualFriends: data.mutualFriends } : null,
        )

        const messages = { add: "Friend request sent!",
          remove: "Friend removed.",
          accept: "Friend request accepted!",
          decline: "Friend request declined.",
          cancel: "Friend request cancelled.",
        }

        toast({title: "Success",
          description: messages[action],
        })
      } else {}
        const errorData = await response.json()
        throw new Error(errorData.message || "Action failed")
      }
    } catch {}
      console.error("Friend action error:", error)
      toast({title: "Error",
        description: error instanceof Error ? error.message : "Action failed.",
        variant: "destructive",
      })
    } finally {}
      setIsActionLoading(false)
    }
  }

  const handleBlock = async () => {}
    if (!user || !confirm("Are you sure you want to block this user?")) return;
    setIsActionLoading(true)

    try {}
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`/api/users/${userId}/block/`, {}
        method: "POST",
        headers: {}
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {}
        setProfile((prev) => (prev ? { ...prev, friendshipStatus: &quot;blocked" } : null))
        toast({title: "User Blocked",
          description: "This user has been blocked and can no longer interact with you.",
        })
      } else {}
        throw new Error("Failed to block user")
      }
    } catch {}
      console.error("Block error:", error)
      toast({title: "Error",
        description: "Failed to block user.",
        variant: "destructive",
      })
    } finally {}
      setIsActionLoading(false)
    }
  }

  const handleReport = async () => {}
    if (!user) {}
      router.push("/login")
      return;
    }

    toast({title: "Report Submitted",
      description: "Thank you for reporting. We'll review this profile.",
    })
  }

  const formatDate = (dateString: string): string => {}
    return new Date(dateString).toLocaleDateString("en-US", {}
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getRarityColor = (rarity: string): string => {}
    switch (rarity) {}
      case "common":
        return "bg-white/20 text-white border-white/30"
      case "rare":
        return "bg-white/30 text-white border-white/40"
      case "epic":
        return "bg-white/40 text-white border-white/50"
      case "legendary":
        return "bg-white/50 text-white border-white/60"
      default:
        return "bg-white/20 text-white border-white/30"
    }
  }

  const getActivityIcon = (type: string) => {}
    switch (type) {}
      case "party":
        return Play;
      case "rating":
        return Star;
      case "friend":
        return Users;
      case "achievement":
        return Trophy;
      default:
        return Activity;
    }
  }

  const getFriendButtonConfig = () => {}
    switch (profile?.friendshipStatus) {}
      case "none":
        return {}
          text: "Add Friend",
          icon: UserPlus,
          action: () => handleFriendAction("add"),
          variant: "default" as const,
          className: "bg-white text-black hover:bg-white/90",
        }
      case "pending":
        return {}
          text: "Cancel Request",
          icon: UserX,
          action: () => handleFriendAction("cancel"),
          variant: "outline" as const,
          className: "border-white/30 text-white hover:bg-white/10 bg-transparent",
        }
      case "friends":
        return {}
          text: "Remove Friend",
          icon: UserMinus,
          action: () => handleFriendAction("remove"),
          variant: "outline" as const,
          className: "border-white/30 text-white hover:bg-white/10 bg-transparent",
        }
      default:
        return null;
    }
  }

  if (isLoading) {}
    return (
      <div className="min-h-screen bg-black p-6">
        <div className="max-w-6xl mx-auto">
          <Card className="bg-white/10 border-white/20">
            <CardContent className="p-8">
              <div className="animate-pulse space-y-6">
                <div className="h-48 bg-white/20 rounded-lg"></div>
                <div className="flex items-center space-x-4">
                  <div className="w-24 h-24 bg-white/20 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-6 bg-white/20 rounded w-48"></div>
                    <div className="h-4 bg-white/20 rounded w-32"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!profile) {}
    return (
      <div className="min-h-screen bg-black p-6">
        <div className="max-w-6xl mx-auto">
          <Alert className="bg-white/10 border-white/20">
            <AlertCircle className="h-4 w-4 text-white" />
            <AlertDescription className="text-white">Failed to load profile data.</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  // Handle blocked or private profiles;
  if (
    profile.friendshipStatus === "blocked" ||
    (!profile.isPublic && profile.friendshipStatus !== "friends" && profile.friendshipStatus !== "self")
  ) {}
    return (
      <div className="min-h-screen bg-black p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-white/10 border-white/20 text-center">
            <CardContent className="p-12">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                {profile.friendshipStatus === "blocked" ? (
                  <Shield className="w-12 h-12 text-white" />
                ) : (
                  <Lock className="w-12 h-12 text-white" />
                )}
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">
                {profile.friendshipStatus === "blocked" ? "User Blocked" : "Private Profile"}
              </h1>
              <p className="text-white/70 mb-6">
                {profile.friendshipStatus === "blocked"
                  ? "This user has been blocked and their profile is not accessible."
                  : "This profile is private. You need to be friends to view their information."}
              </p>
              <Link href="/dashboard">
                <Button className="bg-white text-black hover:bg-white/90">
                  Back to Dashboard;
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const friendButtonConfig = getFriendButtonConfig()

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card className="bg-white/10 border-white/20 overflow-hidden">
          {/* Cover Image */}
          <div className="relative h-48 bg-white/5">
            {profile.coverImage && (
              <Image src={profile.coverImage || "/placeholder.svg"} alt="Cover" fill className="object-cover" />
            )}
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute top-4 right-4 flex space-x-2">
              <Button;
                size="sm"
                variant="outline"
                onClick={handleReport}
                className="bg-black/50 hover:bg-black/70 text-white border-white/20"
              >
                <Flag className="w-4 h-4" />
              </Button>
              <Button;
                size="sm"
                onClick={() => {}
                  navigator.share?.({}
                    title: `${profile.displayName}'s Profile`,
                    url: window.location.href,
                  }) || navigator.clipboard.writeText(window.location.href)
                  toast({ title: "Link copied to clipboard!" })
                }}
                className="bg-black/50 hover:bg-black/70 text-white"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share;
              </Button>
            </div>
          </div>

          {/* Profile Info */}
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6 -mt-16 md:-mt-12">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-white/20 p-1">
                  <div className="w-full h-full rounded-full overflow-hidden bg-black">
                    {profile.avatar ? (
                      <Image;
                        src={profile.avatar || "/placeholder.svg"}
                        alt={profile.displayName}
                        width={128}
                        height={128}
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <User className="w-12 h-12 text-white" />
                      </div>
                    )}
                  </div>
                </div>
                {profile.isPublic ? (
                  <Badge className="absolute -bottom-2 -right-2 bg-white/20 text-white border-white/30">
                    <Eye className="w-3 h-3 mr-1" />
                    Public;
                  </Badge>
                ) : (
                  <Badge className="absolute -bottom-2 -right-2 bg-white/30 text-white border-white/40">
                    <EyeOff className="w-3 h-3 mr-1" />
                    Private;
                  </Badge>
                )}
              </div>

              {/* Profile Details */}
              <div className="flex-1 space-y-3">
                <div>
                  <h1 className="text-3xl font-bold text-white">{profile.displayName}</h1>
                  <p className="text-white/70">@{profile.username}</p>
                  {profile.mutualFriends > 0 && (
                    <p className="text-sm text-white/60">
                      <Users className="w-4 h-4 inline mr-1" />
                      {profile.mutualFriends} mutual friend{profile.mutualFriends !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>

                {profile.bio && <p className="text-white/80 max-w-2xl">{profile.bio}</p>}

                <div className="flex flex-wrap items-center gap-4 text-sm text-white/60">
                  {profile.showEmail && profile.email && (
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      {profile.email}
                    </div>
                  )}
                  {profile.showLocation && profile.location && (
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      {profile.location}
                    </div>
                  )}
                  {profile.website && (
                    <div className="flex items-center">
                      <Globe className="w-4 h-4 mr-2" />
                      <a;
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white hover:text-white/80 transition-colors"
                      >
                        Website;
                      </a>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Joined {formatDate(profile.joinDate)}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="flex flex-wrap gap-6 pt-2">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{profile.stats.watchParties}</div>
                    <div className="text-xs text-white/60">Watch Parties</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{profile.stats.friendsCount}</div>
                    <div className="text-xs text-white/60">Friends</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{profile.stats.hoursWatched}</div>
                    <div className="text-xs text-white/60">Hours Watched</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{profile.stats.achievementsCount}</div>
                    <div className="text-xs text-white/60">Achievements</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {profile.friendshipStatus !== "self" && (
                <div className="flex flex-col space-y-2">
                  {friendButtonConfig && (
                    <Button;
                      onClick={friendButtonConfig.action}
                      disabled={isActionLoading}
                      variant={friendButtonConfig.variant}
                      className={friendButtonConfig.className}
                    >
                      {isActionLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      ) : (
                        <friendButtonConfig.icon className="w-4 h-4 mr-2" />
                      )}
                      {friendButtonConfig.text}
                    </Button>
                  )}
                  <Button;
                    variant="outline"
                    className="border-white/30 hover:bg-white/10 text-white bg-transparent"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Message;
                  </Button>
                  <Button;
                    variant="outline"
                    onClick={handleBlock}
                    disabled={isActionLoading}
                    className="border-white/30 hover:bg-white/10 text-white bg-transparent"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Block;
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Profile Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white/10 border border-white/20 p-1">
            <TabsTrigger;
              value="overview"
              className="data-[state=active]:bg-white data-[state=active]:text-black text-white"
            >
              <Activity className="w-4 h-4 mr-2" />
              Overview;
            </TabsTrigger>
            <TabsTrigger;
              value="achievements"
              className="data-[state=active]:bg-white data-[state=active]:text-black text-white"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Achievements;
            </TabsTrigger>
            <TabsTrigger;
              value="activity"
              className="data-[state=active]:bg-white data-[state=active]:text-black text-white"
            >
              <Clock className="w-4 h-4 mr-2" />
              Activity;
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Stats Cards */}
              <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="bg-white/10 border-white/20">
                    <CardContent className="p-4 text-center">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Play className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-2xl font-bold text-white">{profile.stats.watchParties}</div>
                      <div className="text-sm text-white/60">Watch Parties</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/10 border-white/20">
                    <CardContent className="p-4 text-center">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Clock className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-2xl font-bold text-white">{profile.stats.hoursWatched}</div>
                      <div className="text-sm text-white/60">Hours Watched</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/10 border-white/20">
                    <CardContent className="p-4 text-center">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-2xl font-bold text-white">{profile.stats.friendsCount}</div>
                      <div className="text-sm text-white/60">Friends</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/10 border-white/20">
                    <CardContent className="p-4 text-center">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Star className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-2xl font-bold text-white">{profile.stats.averageRating.toFixed(1)}</div>
                      <div className="text-sm text-white/60">Avg Rating</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Favorite Genres */}
                {profile.favoriteGenres.length > 0 && (
                  <Card className="bg-white/10 border-white/20">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <Film className="w-5 h-5 mr-2" />
                        Favorite Genres;
                      </CardTitle>
                      <CardDescription className="text-white/60">Most watched content categories</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {profile.favoriteGenres.slice(0, 5).map((genre, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-white">{genre.name}</span>
                          <Badge className="bg-white/20 text-white border-white/30">
                            {genre.count} movies;
                          </Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Recent Achievements */}
              <div className="space-y-6">
                <Card className="bg-white/10 border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Trophy className="w-5 h-5 mr-2" />
                      Recent Achievements;
                    </CardTitle>
                    <CardDescription className="text-white/60">Latest unlocked achievements</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {profile.achievements;
                      .filter((a) => a.isPublic)
                      .slice(0, 5)
                      .map((achievement) => (
                        <div key={achievement.id} className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                            <Award className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-white font-medium text-sm">{achievement.name}</h4>
                            <p className="text-white/60 text-xs">{achievement.description}</p>
                          </div>
                          <Badge className={`text-xs ${getRarityColor(achievement.rarity)}`}>
                            {achievement.rarity}
                          </Badge>
                        </div>
                      ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profile.achievements;
                .filter((a) => a.isPublic)
                .map((achievement) => (
                  <Card key={achievement.id} className="bg-white/10 border-white/20">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                          <Award className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="text-white font-medium">{achievement.name}</h3>
                            <Badge className={`text-xs ${getRarityColor(achievement.rarity)}`}>
                              {achievement.rarity}
                            </Badge>
                          </div>
                          <p className="text-white/60 text-sm mb-2">{achievement.description}</p>
                          <p className="text-xs text-white/50">Unlocked {formatDate(achievement.unlockedAt)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Recent Activity;
                </CardTitle>
                <CardDescription className="text-white/60">Public activities and interactions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.recentActivity;
                  .filter((a) => a.isPublic)
                  .map((activity) => {}
                    const IconComponent = getActivityIcon(activity.type)
                    return (
                      <div;
                        key={activity.id}
                        className="flex items-start space-x-3 p-3 bg-white/5 rounded-lg border border-white/10"
                      >
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                          <IconComponent className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-medium">{activity.title}</h4>
                          <p className="text-white/60 text-sm">{activity.description}</p>
                          <p className="text-xs text-white/50 mt-1">{formatDate(activity.timestamp)}</p>
                        </div>
                      </div>
                    )
                  })}
                {profile.recentActivity.filter((a) => a.isPublic).length === 0 && (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-white/60 mx-auto mb-4" />
                    <p className="text-white/60">No public activity to display</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

interface PublicProfile {}
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatar: string;
  coverImage: string;
  location: string;
  website: string;
  joinDate: string;
  isPublic: boolean;
  showEmail: boolean;
  showLocation: boolean;
  showBirthDate: boolean;
  email?: string;
  birthDate?: string;
  friendshipStatus: "none" | "pending" | "friends" | "blocked" | "self"
  mutualFriends: number;
  stats: {}
    watchParties: number;
    hoursWatched: number;
    friendsCount: number;
    achievementsCount: number;
    favoriteMovies: number;
    totalRatings: number;
    averageRating: number;
    streakDays: number;
  }
  recentActivity: Array<{}
    id: string;
    type: "party" | "rating" | "friend" | "achievement"
    title: string;
    description: string;
    timestamp: string;
    isPublic: boolean;
  }>
  achievements: Array<{}
    id: string;
    name: string;
    description: string;
    icon: string;
    unlockedAt: string;
    rarity: "common" | "rare" | "epic" | "legendary"
    isPublic: boolean;
  }>
  favoriteGenres: Array<{}
    name: string;
    count: number;
    percentage: number;
  }>
}

