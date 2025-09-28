"use client"

import { Activity, BarChart, Calendar, Clock, Download, Heart, Loader2, MapPin, MessageCircle, PieChart, Share, Star, User, Users, Video, X } from "lucide-react"
import { useState, useEffect, useCallback, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

import { format, parseISO } from "date-fns"

  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts"
interface PartyAnalytics {}
  party: {}
    id: string
    title: string
    description: string
    created_at: string
    updated_at: string
    status: "upcoming" | "live" | "ended"
    host: {}
      id: string
      username: string
      display_name: string
      avatar_url: string
    }
    video: {}
      title: string
      url: string
      duration: number
      thumbnail: string
      platform: string
    }
    settings: {}
      is_public: boolean
      max_participants: number
      auto_start: boolean
      allow_chat: boolean
    }
  }
  overview: {}
    total_participants: number
    peak_concurrent: number
    total_duration: number
    total_messages: number
    engagement_rate: number
    completion_rate: number
    average_watch_time: number
    unique_viewers: number
  }
  participants: Array<{}
    id: string
    user: {}
      id: string
      username: string
      display_name: string
      avatar_url: string
    }
    joined_at: string
    left_at?: string
    watch_time: number
    messages_sent: number
    reactions_sent: number
    engagement_score: number
    completion_percentage: number
  }>
  timeline: Array<{}
    timestamp: string
    event_type: "join" | "leave" | "play" | "pause" | "seek" | "message" | "reaction"
    user_id?: string
    data?: Record<string, unknown>
  }>
  engagement: {}
    chat_activity: Array<{}
      time: string
      message_count: number
      active_users: number
    }>
    viewer_count: Array<{}
      time: string
      count: number
    }>
    reactions: Array<{}
      type: string
      count: number
      timestamp: string
    }>
  }
  demographics: {}
    by_location: Array<{ country: string; count: number }>
    by_device: Array<{ device_type: string; count: number }>
    by_timezone: Array<{ timezone: string; count: number }>
    by_join_time: Array<{ hour: number; count: number }>
  }
  performance: {}
    loading_times: Array<{ timestamp: string; duration: number }>
    error_rates: Array<{ timestamp: string; error_count: number }>
    sync_quality: Array<{ timestamp: string; sync_offset: number }>
  }
}

function PartyAnalyticsContent() {
  const searchParams = useSearchParams()
  const partyId = searchParams.get('id')
  const { toast } = useToast()

  const [analytics, setAnalytics] = useState<PartyAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<string>(&quot;all&quot;)
  const [activeTab, setActiveTab] = useState("overview")

  const loadPartyAnalytics = useCallback(async () => {
    if (!partyId) return
    try {
      setIsLoading(true)
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`/api/parties/${partyId}/analytics/?timeRange=${timeRange}`, {}
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      } else {}
        throw new Error("Failed to load analytics")
      }
    } catch (err) {
      console.error("Failed to load party analytics:", error)
      toast({title: "Error",
        description: "Failed to load party analytics.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [partyId, timeRange, toast])

  useEffect(() => {
    if (partyId) {
      loadPartyAnalytics()
    }
  }, [partyId, loadPartyAnalytics])

  const exportAnalytics = async () => {
    if (!partyId) return
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`/api/parties/${partyId}/analytics/export/`, {}
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `party-${partyId}-analytics.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        toast({title: "Export Complete",
          description: "Analytics data has been downloaded.",
        })
      }
    } catch (err) {
      console.error("Export failed:", error)
      toast({title: "Export Failed",
        description: "Failed to export analytics data.",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {}
    switch (status) {
      case "live":
        return "bg-green-500"
      case "upcoming":
        return "bg-blue-500"
      case "ended":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const getEngagementColor = (score: number) => {}
    if (score >= 80) return &quot;text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const formatDuration = (seconds: number) => {}
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    }
    return `${minutes}m ${secs}s`
  }

  const formatPercentage = (value: number) => {}
    return `${Math.round(value * 100) / 100}%`
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading party analytics...</p>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Not Available</h3>
            <p className="text-gray-600">
              Analytics data is not available for this party. This may be because:
            </p>
            <ul className="text-gray-600 text-sm mt-2 space-y-1">
              <li>• The party hasn&apos;t started yet</li>
              <li>• You don&apos;t have permission to view this data</li>
              <li>• The party ID is invalid</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    )
  }

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0']

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">Party Analytics</h1>
              <Badge className={`${getStatusColor(analytics.party.status)} text-white`}>
                {analytics.party.status.charAt(0).toUpperCase() + analytics.party.status.slice(1)}
              </Badge>
            </div>
            <h2 className="text-xl text-gray-600 mb-2">{analytics.party.title}</h2>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                Hosted by {analytics.party.host.display_name}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(parseISO(analytics.party.created_at), "MMM dd, yyyy")}
              </span>
              <span className="flex items-center gap-1">
                <Video className="h-4 w-4" />
                {analytics.party.video.platform}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={exportAnalytics} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="participants">Participants</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="demographics">Demographics</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Participants</p>
                      <p className="text-2xl font-bold">{analytics.overview.total_participants}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-500" />
                  </div>
                  <div className="mt-2 flex items-center text-sm">
                    <span className="text-gray-600">Peak: {analytics.overview.peak_concurrent} concurrent</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Watch Time</p>
                      <p className="text-2xl font-bold">{formatDuration(analytics.overview.total_duration)}</p>
                    </div>
                    <Clock className="h-8 w-8 text-green-500" />
                  </div>
                  <div className="mt-2 flex items-center text-sm">
                    <span className="text-gray-600">Avg: {formatDuration(analytics.overview.average_watch_time)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Messages</p>
                      <p className="text-2xl font-bold">{analytics.overview.total_messages.toLocaleString()}</p>
                    </div>
                    <MessageCircle className="h-8 w-8 text-purple-500" />
                  </div>
                  <div className="mt-2 flex items-center text-sm">
                    <span className="text-gray-600">
                      {(analytics.overview.total_messages / analytics.overview.total_participants).toFixed(1)} per user
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Engagement Rate</p>
                      <p className={`text-2xl font-bold ${getEngagementColor(analytics.overview.engagement_rate)}`}>
                        {formatPercentage(analytics.overview.engagement_rate)}
                      </p>
                    </div>
                    <Activity className="h-8 w-8 text-orange-500" />
                  </div>
                  <div className="mt-2 flex items-center text-sm">
                    <span className="text-gray-600">
                      {formatPercentage(analytics.overview.completion_rate)} completion
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Viewer Count Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Viewer Count Over Time</CardTitle>
                <CardDescription>Number of active viewers throughout the party</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.engagement.viewer_count}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="time" 
                        tickFormatter={(value) => format(parseISO(value), &quot;HH:mm&quot;)}
                      />
                      <YAxis />
                      <Tooltip
                        labelFormatter={(value) => format(parseISO(value), &quot;HH:mm:ss&quot;)}
                        formatter={(value: number) => [value, &quot;Viewers"]}
                      />
                      <Area
                        type="monotone" 
                        dataKey="count" 
                        stroke="#8884d8" 
                        fill="#8884d8" 
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Chat Activity Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Chat Activity</CardTitle>
                <CardDescription>Messages sent and active users over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.engagement.chat_activity}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="time" 
                        tickFormatter={(value) => format(parseISO(value), &quot;HH:mm&quot;)}
                      />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip
                        labelFormatter={(value) => format(parseISO(value), &quot;HH:mm:ss&quot;)}
                      />
                      <Bar yAxisId="left" dataKey="message_count" fill="#8884d8" name="Messages" />
                      <Line
                        yAxisId="right" 
                        type="monotone" 
                        dataKey="active_users" 
                        stroke="#82ca9d" 
                        name="Active Users"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="participants" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Participant Details ({analytics.participants.length})</CardTitle>
                <CardDescription>Individual participant statistics and engagement metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.participants.map((participant) => (
                    <div key={participant.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                          {participant.user.display_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{participant.user.display_name}</p>
                          <p className="text-sm text-gray-600">@{participant.user.username}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <p className="font-medium">{formatDuration(participant.watch_time)}</p>
                          <p className="text-gray-600">Watch Time</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium">{participant.messages_sent}</p>
                          <p className="text-gray-600">Messages</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium">{participant.reactions_sent}</p>
                          <p className="text-gray-600">Reactions</p>
                        </div>
                        <div className="text-center">
                          <p className={`font-medium ${getEngagementColor(participant.engagement_score)}`}>
                            {formatPercentage(participant.engagement_score)}
                          </p>
                          <p className="text-gray-600">Engagement</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium">{formatPercentage(participant.completion_percentage)}</p>
                          <p className="text-gray-600">Completion</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {analytics.participants.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No participants data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="engagement" className="space-y-6">
            {/* Reactions */}
            <Card>
              <CardHeader>
                <CardTitle>Reactions</CardTitle>
                <CardDescription>Breakdown of reactions sent during the party</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.engagement.reactions}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ type, percent }) => `${type} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {analytics.engagement.reactions.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Engagement Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">
                    {analytics.engagement.reactions.find(r => r.type === &apos;heart&apos;)?.count || 0}
                  </p>
                  <p className="text-gray-600">Hearts</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">
                    {analytics.engagement.reactions.find(r => r.type === &apos;star&apos;)?.count || 0}
                  </p>
                  <p className="text-gray-600">Stars</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Share2 className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">
                    {analytics.engagement.reactions.find(r => r.type === &apos;share&apos;)?.count || 0}
                  </p>
                  <p className="text-gray-600">Shares</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Event Timeline</CardTitle>
                <CardDescription>Chronological list of all party events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {analytics.timeline.map((event, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border-l-2 border-gray-200 bg-gray-50 rounded-r">
                      <div className="text-xs text-gray-500 w-20">
                        {format(parseISO(event.timestamp), "HH:mm:ss")}
                      </div>
                      <div className="flex-1">
                        {event.event_type === 'join' && (
                          <span className="text-green-600">User joined the party</span>
                        )}
                        {event.event_type === 'leave' && (
                          <span className="text-red-600">User left the party</span>
                        )}
                        {event.event_type === 'play' && (
                          <span className="text-blue-600">Video started playing</span>
                        )}
                        {event.event_type === 'pause' && (
                          <span className="text-orange-600">Video paused</span>
                        )}
                        {event.event_type === 'message' && (
                          <span className="text-purple-600">Message sent</span>
                        )}
                        {event.event_type === 'reaction' && (
                          <span className="text-pink-600">Reaction sent</span>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {event.event_type}
                      </Badge>
                    </div>
                  ))}
                  {analytics.timeline.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No timeline events available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="demographics" className="space-y-6">
            {/* Location Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
                <CardDescription>Participants by country/region</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.demographics.by_location.slice(0, 10).map((location) => (
                    <div key={location.country} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>{location.country}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${(location.count / analytics.overview.total_participants) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8">{location.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Device Types */}
            <Card>
              <CardHeader>
                <CardTitle>Device Types</CardTitle>
                <CardDescription>Breakdown by device category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.demographics.by_device}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ device_type, percent }) => `${device_type} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {analytics.demographics.by_device.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Join Time Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Join Times</CardTitle>
                <CardDescription>When participants joined throughout the day</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.demographics.by_join_time}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" tickFormatter={(value) => `${value}:00`} />
                      <YAxis />
                      <Tooltip
                        labelFormatter={(value) => `${value}:00`}
                        formatter={(value: number) => [value, &quot;Participants&quot;]}
                      />
                      <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            {/* Loading Times */}
            <Card>
              <CardHeader>
                <CardTitle>Loading Performance</CardTitle>
                <CardDescription>Average loading times throughout the party</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.performance.loading_times}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="timestamp" 
                        tickFormatter={(value) => format(parseISO(value), &quot;HH:mm&quot;)}
                      />
                      <YAxis />
                      <Tooltip
                        labelFormatter={(value) => format(parseISO(value), &quot;HH:mm:ss&quot;)}
                        formatter={(value: number) => [`${value}ms`, &quot;Loading Time"]}
                      />
                      <Line
                        type="monotone" 
                        dataKey="duration" 
                        stroke="#8884d8" 
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Sync Quality */}
            <Card>
              <CardHeader>
                <CardTitle>Synchronization Quality</CardTitle>
                <CardDescription>How well participants stayed in sync</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.performance.sync_quality}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="timestamp" 
                        tickFormatter={(value) => format(parseISO(value), &quot;HH:mm&quot;)}
                      />
                      <YAxis />
                      <Tooltip
                        labelFormatter={(value) => format(parseISO(value), &quot;HH:mm:ss&quot;)}
                        formatter={(value: number) => [`${value}ms`, &quot;Sync Offset"]}
                      />
                      <Area
                        type="monotone" 
                        dataKey="sync_offset" 
                        stroke="#82ca9d" 
                        fill="#82ca9d" 
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Error Rates */}
            <Card>
              <CardHeader>
                <CardTitle>Error Tracking</CardTitle>
                <CardDescription>Technical issues and error rates over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.performance.error_rates}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="timestamp" 
                        tickFormatter={(value) => format(parseISO(value), &quot;HH:mm&quot;)}
                      />
                      <YAxis />
                      <Tooltip
                        labelFormatter={(value) => format(parseISO(value), &quot;HH:mm:ss&quot;)}
                        formatter={(value: number) => [value, &quot;Errors"]}
                      />
                      <Bar dataKey="error_count" fill="#ff7300" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default function PartyAnalyticsPage() {
  return (
    <Suspense fallback={} />
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading party analytics...</p>
        </div>
      </div>
    }>
      <PartyAnalyticsContent />
    </Suspense>
  )
}
