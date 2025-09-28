import { ArrowRight, Clock, Eye, Filter, Heart, Link, MoreHorizontal, Play, Plus, Search, Share, TrendingUp, User, Users, Video, Zap } from "lucide-react"
import { useEffect, useState , useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { dashboardAPI, partiesAPI, videosAPI, usersAPI } from "@/lib/api"

"use client"

interface DashboardStats {}
  total_parties: number;
  parties_hosted: number;
  parties_joined: number;
  total_videos: number;
  watch_time_hours: number;
  friends_count: number;
  recent_activity: {}
    parties_this_week: number;
    videos_uploaded_this_week: number;
    watch_time_this_week: number;
  }
}

interface Party {}
  id: string;
  title: string;
  participant_count: number;
  status: string;
  thumbnail?: string;
  host: {}
    name: string;
    avatar?: string;
  }
  started_at?: string;
  scheduled_start?: string;
  category: string;
  is_private: boolean;
}

interface Video {}
  id: string;
  title: string;
  duration_formatted: string;
  view_count: number;
  thumbnail?: string;
  created_at: string;
  category: string;
  likes: number;
}

interface FriendActivity {}
  id: string;
  user: {}
    name: string;
    avatar?: string;
  }
  action: string;
  content: string;
  timestamp: string;
  type: "party" | "video" | "friend" | "achievement"
}

interface Achievement {}
  id: string;
  title: string;
  description: string;
  icon: string;
  progress: number;
  max_progress: number;
  unlocked: boolean;
  rarity: "common" | "rare" | "epic" | "legendary"
}

export default function DashboardPage() {}
  const { user } = useAuth()
  const { toast } = useToast()

  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentParties, setRecentParties] = useState<Party[]>([])
  const [recentVideos, setRecentVideos] = useState<Video[]>([])
  const [friendActivity, setFriendActivity] = useState<FriendActivity[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {}
    const fetchDashboardData = async () => {}
      try {}
        setIsLoading(true)

        // Use proper API services instead of direct fetch calls;
        const [dashboardStats, partiesData, videosData, activityData, achievementsData] = await Promise.all([]
          dashboardAPI && dashboardAPI.getStats ? dashboardAPI.getStats() : Promise.resolve(null),
          partiesAPI && partiesAPI.getRecent ? partiesAPI.getRecent() : Promise.resolve([]),
          videosAPI && videosAPI.getVideos ? videosAPI.getVideos({ ordering: '-created_at', limit: 5 }) : Promise.resolve({ results: [] }),
          usersAPI && usersAPI.getActivity ? usersAPI.getActivity({ visibility: 'friends_only' }) : Promise.resolve({ results: [] }),
          // For achievements, we'll need to create mock data as there's no clear endpoint yet;
          Promise.resolve([])
        ])

        // Set stats from API or fallback to defaults;
        setStats(dashboardStats || {}
          total_parties: 0,
          parties_hosted: 0,
          parties_joined: 0,
          total_videos: 0,
          watch_time_hours: 0,
          friends_count: 0,
          recent_activity: {}
            parties_this_week: 0,
            videos_uploaded_this_week: 0,
            watch_time_this_week: 0,
          },
        })

        // Set data from API responses - handle paginated responses;
        setRecentParties(Array.isArray(partiesData) ? partiesData.slice(0, 3) : [])
        setRecentVideos(Array.isArray(videosData?.results) ? videosData.results.slice(0, 3) : [])
        setFriendActivity(Array.isArray(activityData?.results) ? activityData.results.slice(0, 4) : [])
        setAchievements(Array.isArray(achievementsData) ? achievementsData : [])
      } catch {}
        console.error("Failed to fetch dashboard data:", error)
        toast({title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        })
      } finally {}
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [toast])

  const formatTimeAgo = (dateString: string) => {}
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 60) {}
      return `${diffMins}m ago`
    } else if (diffHours < 24) {}
      return `${diffHours}h ago`
    } else {}
      return `${diffDays}d ago`
    }
  }

  const getRarityColor = (rarity: Achievement["rarity"]) => {}
    switch (rarity) {}
      case "common":
        return "text-gray-500"
      case "rare":
        return "text-blue-500"
      case "epic":
        return "text-purple-500"
      case "legendary":
        return "text-yellow-500"
      default:
        return "text-gray-500"
    }
  }

  if (isLoading) {}
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-500/30 rounded-full animate-spin border-t-purple-500"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent rounded-full animate-pulse border-t-pink-500"></div>
          </div>
          <div className="text-center space-y-2">
            <div className="text-white text-xl font-semibold">Loading Dashboard...</div>
            <div className="text-purple-300">Preparing your cinema experience</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">
                Welcome back, {user?.first_name || "User"}!
              </h1>
              <div className="text-3xl">👋</div>
            </div>
            <p className="text-purple-200 text-lg">Ready for your next cinematic adventure?</p>
          </div>

          <div className="flex items-center gap-3">
            {user?.is_premium && (
              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 px-4 py-2">
                <Crown className="w-4 h-4 mr-2" />
                Premium Member;
              </Badge>
            )}
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg">
              <Plus className="w-4 h-4 mr-2" />
              Create Party;
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-200">Total Videos</CardTitle>
              <div className="p-2 rounded-lg bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors">
                <VideoIcon className="h-5 w-5 text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-1">{stats?.total_videos || 0}</div>
              <p className="text-xs text-purple-300">
                <span className="text-green-400">+{stats?.recent_activity?.videos_uploaded_this_week || 0}</span> this;
                week;
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-200">Watch Parties</CardTitle>
              <div className="p-2 rounded-lg bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors">
                <Users className="h-5 w-5 text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-1">{stats?.total_parties || 0}</div>
              <p className="text-xs text-purple-300">
                <span className="text-green-400">+{stats?.recent_activity?.parties_this_week || 0}</span> this week;
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-200">Friends</CardTitle>
              <div className="p-2 rounded-lg bg-pink-500/20 group-hover:bg-pink-500/30 transition-colors">
                <Heart className="h-5 w-5 text-pink-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-1">{stats?.friends_count || 0}</div>
              <p className="text-xs text-purple-300">Connected souls</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-200">Watch Time</CardTitle>
              <div className="p-2 rounded-lg bg-green-500/20 group-hover:bg-green-500/30 transition-colors">
                <Clock className="h-5 w-5 text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-1">{stats?.watch_time_hours || 0}h</div>
              <p className="text-xs text-purple-300">
                <span className="text-green-400">+{stats?.recent_activity?.watch_time_this_week || 0}h</span> this week;
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white/10 backdrop-blur-md border-white/20 p-1">
            <TabsTrigger;
              value="overview"
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-purple-200"
            >
              Overview;
            </TabsTrigger>
            <TabsTrigger;
              value="parties"
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-purple-200"
            >
              Parties;
            </TabsTrigger>
            <TabsTrigger;
              value="videos"
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-purple-200"
            >
              Videos;
            </TabsTrigger>
            <TabsTrigger;
              value="achievements"
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-purple-200"
            >
              Achievements;
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Watch Parties */}
              <Card className="lg:col-span-2 bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-xl text-white flex items-center gap-2">
                        <Film className="w-5 h-5 text-purple-400" />
                        Recent Watch Parties;
                      </CardTitle>
                      <CardDescription className="text-purple-300">Your latest streaming sessions</CardDescription>
                    </div>
                    <Button;
                      variant="ghost"
                      size="sm"
                      asChild;
                      className="text-purple-300 hover:text-white hover:bg-white/10"
                    >
                      <Link href="/dashboard/parties">
                        View all;
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentParties.map((party) => (
                    <div;
                      key={party.id}
                      className="flex items-center space-x-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 group"
                    >
                      <div className="relative">
                        <img;
                          src={party.thumbnail || "/placeholder.svg"}
                          alt={party.title}
                          className="w-20 h-12 rounded-lg object-cover"
                        />
                        {party.status === "live" && (
                          <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs animate-pulse">
                            LIVE;
                          </Badge>
                        )}
                        {party.is_private && (
                          <div className="absolute bottom-1 left-1 w-3 h-3 bg-yellow-500 rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-white truncate">{party.title}</h4>
                        <div className="flex items-center space-x-4 text-sm text-purple-300 mt-1">
                          <div className="flex items-center gap-1">
                            <Avatar className="w-4 h-4">
                              <AvatarImage src={party.host.avatar || "/placeholder.svg"} />
                              <AvatarFallback className="text-xs bg-purple-500/20">{party.host.name[0]}</AvatarFallback>
                            </Avatar>
                            <span className="truncate">{party.host.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {party.participant_count}
                          </div>
                          <Badge variant="outline" className="text-xs border-purple-400/30 text-purple-300">
                            {party.category}
                          </Badge>
                        </div>
                      </div>
                      <Button;
                        size="sm"
                        className={}
                          party.status === "live"
                            ? "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0"
                            : "bg-white/10 hover:bg-white/20 text-white border-white/20"
                        }
                        asChild;
                      >
                        <Link href={`/watch/${party.id}`}>{party.status === &quot;live" ? "Join" : "View"}</Link>
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Friend Activity */}
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-xl text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-green-400" />
                    Friend Activity;
                  </CardTitle>
                  <CardDescription className="text-purple-300">See what your friends are up to</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {friendActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={activity.user.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="bg-purple-500/20 text-purple-300 text-xs">
                          {activity.user.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white">
                          <span className="font-medium">{activity.user.name}</span>{&quot; "}"
                          <span className="text-purple-300">{activity.action}</span>{&quot; "}"
                          <span className="font-medium text-purple-200">{activity.content}</span>
                        </p>
                        <p className="text-xs text-purple-400 mt-1">{formatTimeAgo(activity.timestamp)}</p>
                      </div>
                      <div;
                        className={`w-2 h-2 rounded-full ${}
                          activity.type === "party"
                            ? "bg-blue-400"
                            : activity.type === "video"
                              ? "bg-green-400"
                              : activity.type === "achievement"
                                ? "bg-yellow-400"
                                : "bg-purple-400"
                        }`}
                      />
                    </div>
                  ))}
                  <Button variant="ghost" className="w-full text-sm text-purple-300 hover:text-white hover:bg-white/10">
                    View all activity;
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="parties" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Your Watch Parties</h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-4 h-4" />
                  <Input;
                    placeholder="Search parties..."
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-purple-400"
                  />
                </div>
                <Button;
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-purple-300 hover:bg-white/10 bg-transparent"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filter;
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentParties.map((party) => (
                <Card;
                  key={party.id}
                  className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300 group overflow-hidden"
                >
                  <div className="aspect-video relative">
                    <img;
                      src={party.thumbnail || "/placeholder.svg"}
                      alt={party.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute top-3 left-3 flex gap-2">
                      {party.status === "live" && (
                        <Badge className="bg-red-500 text-white animate-pulse">
                          <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse" />
                          LIVE;
                        </Badge>
                      )}
                      {party.is_private && <Badge className="bg-yellow-500/80 text-black">Private</Badge>}
                    </div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-white font-semibold text-lg mb-1 line-clamp-2">{party.title}</h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-white/80 text-sm">
                          <Users className="w-4 h-4" />
                          {party.participant_count} joined;
                        </div>
                        <Badge variant="outline" className="border-white/30 text-white/80">
                          {party.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={party.host.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="text-xs bg-purple-500/20">{party.host.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-purple-300">{party.host.name}</span>
                      </div>
                      <Button;
                        size="sm"
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
                      >
                        {party.status === "live" ? "Join Now" : "View Details"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="videos" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Your Videos</h2>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0">
                <Plus className="w-4 h-4 mr-2" />
                Upload Video;
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentVideos.map((video) => (
                <Card;
                  key={video.id}
                  className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300 group overflow-hidden"
                >
                  <div className="aspect-video relative">
                    <img;
                      src={video.thumbnail || "/placeholder.svg"}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                      <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/75 text-white text-xs px-2 py-1 rounded">
                      {video.duration_formatted}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-white mb-2 line-clamp-2">{video.title}</h3>
                    <div className="flex items-center justify-between text-sm text-purple-300 mb-3">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {video.view_count.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {video.likes}
                        </div>
                      </div>
                      <span>{formatTimeAgo(video.created_at)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs border-purple-400/30 text-purple-300">
                        {video.category}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Button;
                          variant="ghost"
                          size="sm"
                          className="text-purple-300 hover:text-white hover:bg-white/10 p-2"
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                        <Button;
                          variant="ghost"
                          size="sm"
                          className="text-purple-300 hover:text-white hover:bg-white/10 p-2"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Achievements</h2>
              <div className="text-sm text-purple-300">
                {achievements.filter((a) => a.unlocked).length} of {achievements.length} unlocked;
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((achievement) => (
                <Card;
                  key={achievement.id}
                  className={`bg-white/10 backdrop-blur-md border-white/20 transition-all duration-300 ${}
                    achievement.unlocked ? "hover:bg-white/15" : "opacity-60"
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`text-4xl ${achievement.unlocked ? "" : "grayscale"}`}>{achievement.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-white">{achievement.title}</h3>
                          <Badge;
                            variant="outline"
                            className={`text-xs ${getRarityColor(achievement.rarity)} border-current`}
                          >
                            {achievement.rarity}
                          </Badge>
                        </div>
                        <p className="text-sm text-purple-300 mb-3">{achievement.description}</p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs text-purple-400">
                            <span>Progress</span>
                            <span>
                              {achievement.progress}/{achievement.max_progress}
                            </span>
                          </div>
                          <Progress value={(achievement.progress / achievement.max_progress) * 100} className="h-2" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="bg-gradient-to-br from-red-500/20 to-pink-500/20 border-red-500/30 hover:from-red-500/30 hover:to-pink-500/30 transition-all cursor-pointer group">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold mb-2 text-white text-lg">Create Watch Party</h3>
              <p className="text-sm text-purple-300 mb-4">Start a new synchronized viewing session with friends</p>
              <Button className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0 w-full">
                Get Started;
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-blue-500/30 hover:from-blue-500/30 hover:to-purple-500/30 transition-all cursor-pointer group">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <VideoIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold mb-2 text-white text-lg">Upload Video</h3>
              <p className="text-sm text-purple-300 mb-4">Add new videos from multiple sources and platforms</p>
              <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 w-full">
                Upload Now;
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/30 hover:from-yellow-500/30 hover:to-orange-500/30 transition-all cursor-pointer group">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold mb-2 text-white text-lg">View Analytics</h3>
              <p className="text-sm text-purple-300 mb-4">Track your video performance and engagement metrics</p>
              <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white border-0 w-full">
                View Stats;
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
