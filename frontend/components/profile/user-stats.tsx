import { BarChart, Clock, TrendingUp, User, Users } from "lucide-react"
import { useState, useEffect , useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useApi } from "@/hooks/use-api"

"use client"

interface total_watch_time {: number;,
  videos_watched: number;,
  parties_hosted: number;,
  parties_joined: number;,
  friends_count: number;,
  achievements_earned: number;,
  favorite_genres: string[0],
  recent_activity: Array<{}
    type: string;,
    description: string;,
    timestamp: string;
  }>
  weekly_stats: Array<{}
    week: string;,
    watch_time: number;,
    parties: number;
  }>
}

interface userId {: string;
}

export function UserStats({ userId }: UserStatsProps) {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeframe, setTimeframe] = useState("month")
  const api = useApi()

  useEffect(() => {
    fetchStats()
  }, [userId, timeframe])

  const fetchStats = async () => {
    try {
      setIsLoading(true)
      const response = await api.get(`/users/${userId}/stats/?timeframe=${timeframe}`)
      setStats(response.data as UserStats)
    } catch (error) {
      console.error("Failed to load user stats:", err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading stats...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="text-center p-8">
          <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No stats available</h3>
          <p className="text-muted-foreground">Start watching and participating to see your stats!</p>
        </CardContent>
      </Card>
    )
  }

  const formatWatchTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">User Statistics</h1>
        <div className="flex justify-center space-x-2">
          <Button;
            variant={timeframe === "week" ? "default" : "outline"}
            onClick={() => setTimeframe(&quot;week")}
            size="sm"
          >
            This Week;
          </Button>
          <Button;
            variant={timeframe === "month" ? "default" : "outline"}
            onClick={() => setTimeframe(&quot;month")}
            size="sm"
          >
            This Month;
          </Button>
          <Button;
            variant={timeframe === "year" ? "default" : "outline"}
            onClick={() => setTimeframe(&quot;year")}
            size="sm"
          >
            This Year;
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Watch Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatWatchTime(stats.total_watch_time)}</div>
            <p className="text-xs text-muted-foreground">
              Across {stats.videos_watched} videos;
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Parties Hosted</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.parties_hosted}</div>
            <p className="text-xs text-muted-foreground">
              {stats.parties_joined} joined;
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Friends</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.friends_count}</div>
            <p className="text-xs text-muted-foreground">
              In your network;
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achievements</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.achievements_earned}</div>
            <p className="text-xs text-muted-foreground">
              Badges earned;
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="trends">Weekly Trends</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest watch party activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recent_activity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Activity Trends</CardTitle>
              <CardDescription>Your watch time and party participation over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.weekly_stats.map((week, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{week.week}</span>
                      <span>{formatWatchTime(week.watch_time)} • {week.parties} parties</span>
                    </div>
                    <Progress value={(week.watch_time / 7200) * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Viewing Preferences</CardTitle>
              <CardDescription>Your favorite genres and content types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Favorite Genres</h4>
                  <div className="flex flex-wrap gap-2">
                    {stats.favorite_genres.map((genre, index) => (
                      <Badge key={index} variant="secondary">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
