"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { adminAPI } from "@/lib/api"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts"
import {
  TrendingUp,
  Users,
  Play,
  Clock,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Star,
  Trophy,
  Activity,
  Globe,
  MapPin,
  Loader2,
  ChevronDown,
  Info,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  TrendingDown
} from "lucide-react"
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns"

interface AnalyticsData {
  party_analytics: {
    total_parties: number
    active_parties: number
    completed_parties: number
    average_duration_minutes: number
    total_watch_time_hours: number
    unique_participants: number
    total_participants: number
    average_participants_per_party: number
    popular_genres: Array<{ genre: string; count: number; percentage: number }>
    peak_hours: Array<{ hour: number; party_count: number }>
    engagement_metrics: {
      total_messages: number
      total_reactions: number
      average_messages_per_party: number
      average_reactions_per_party: number
    }
  }
  host_analytics: {
    top_hosts: Array<{
      id: string
      username: string
      avatar?: string
      parties_hosted: number
      total_participants: number
      average_rating: number
      total_watch_time: number
    }>
    host_distribution: Array<{ range: string; count: number }>
    retention_rate: number
  }
  time_series: {
    daily_parties: Array<{ date: string; parties: number; participants: number }>
    weekly_growth: Array<{ week: string; new_parties: number; growth_rate: number }>
    monthly_trends: Array<{ month: string; parties: number; users: number; watch_time: number }>
  }
  geographic_data: Array<{
    country: string
    country_code: string
    parties: number
    users: number
    percentage: number
  }>
  content_analytics: {
    most_watched: Array<{
      title: string
      genre: string
      times_watched: number
      total_duration: number
      average_rating: number
    }>
    content_distribution: Array<{ type: string; count: number; percentage: number }>
  }
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe', '#00c49f', '#ffbb28', '#ff8042']

export default function PartyAnalyticsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("7d")
  const [chartType, setChartType] = useState("daily")
  const [selectedMetric, setSelectedMetric] = useState("parties")

  useEffect(() => {
    // Check if user has admin permissions
    if (!user?.is_staff && !user?.is_superuser) {
      router.push("/dashboard")
      return
    }
    loadAnalytics()
  }, [user, router, timeRange])

  const loadAnalytics = async () => {
    try {
      const data = await adminAPI.getAnalytics()
      setAnalytics(data)
    } catch (error) {
      console.error("Failed to load analytics:", error)
      if ((error as any)?.response?.status === 403) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access this page.",
          variant: "destructive",
        })
        router.push("/dashboard")
      } else {
        toast({
          title: "Error",
          description: "Failed to load analytics data.",
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const exportAnalytics = async () => {
    try {
      // Since there's no direct export analytics method in adminAPI, 
      // we can use a generic approach or extend the API
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`/api/admin/analytics/export/?time_range=${timeRange}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `party-analytics-${timeRange}-${format(new Date(), "yyyy-MM-dd")}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        toast({
          title: "Export Complete",
          description: "Analytics data has been exported successfully.",
        })
      }
    } catch (error) {
      console.error("Export error:", error)
      toast({
        title: "Error",
        description: "Failed to export analytics data.",
        variant: "destructive",
      })
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const formatWatchTime = (hours: number) => {
    if (hours < 24) return `${hours}h`
    const days = Math.floor(hours / 24)
    const remainingHours = hours % 24
    return `${days}d ${remainingHours}h`
  }

  const getGrowthColor = (rate: number) => {
    if (rate > 0) return "text-green-600"
    if (rate < 0) return "text-red-600"
    return "text-gray-600"
  }

  const getGrowthIcon = (rate: number) => {
    if (rate > 0) return <TrendingUp className="h-4 w-4" />
    if (rate < 0) return <TrendingDown className="h-4 w-4" />
    return <Activity className="h-4 w-4" />
  }

  if (!user?.is_staff && !user?.is_superuser) {
    return null // Will redirect in useEffect
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            No analytics data available. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <BarChart3 className="h-8 w-8" />
              Party Analytics
            </h1>
            <p className="text-gray-600 mt-2">Platform performance and usage insights</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={exportAnalytics}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" onClick={loadAnalytics}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Parties</p>
                  <p className="text-3xl font-bold">{analytics.party_analytics.total_parties.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {analytics.party_analytics.active_parties} currently active
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Play className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Participants</p>
                  <p className="text-3xl font-bold">{analytics.party_analytics.total_participants.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {analytics.party_analytics.average_participants_per_party.toFixed(1)} avg per party
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Watch Time</p>
                  <p className="text-3xl font-bold">{formatWatchTime(analytics.party_analytics.total_watch_time_hours)}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatDuration(analytics.party_analytics.average_duration_minutes)} avg duration
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Engagement</p>
                  <p className="text-3xl font-bold">{analytics.party_analytics.engagement_metrics.total_messages.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {analytics.party_analytics.engagement_metrics.total_reactions.toLocaleString()} reactions
                  </p>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <MessageCircle className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Daily Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChartIcon className="h-5 w-5" />
                Daily Activity Trends
              </CardTitle>
              <CardDescription>
                Party creation and participation over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.time_series.daily_parties}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(date) => format(new Date(date), "MMM d")}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      labelFormatter={(date) => format(new Date(date), "MMM d, yyyy")}
                      formatter={(value, name) => [value, name === "parties" ? "Parties" : "Participants"]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="parties" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      dot={{ fill: "#8884d8", strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="participants" 
                      stroke="#82ca9d" 
                      strokeWidth={2}
                      dot={{ fill: "#82ca9d", strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Genre Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5" />
                Popular Genres
              </CardTitle>
              <CardDescription>
                Content preferences across all parties
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.party_analytics.popular_genres}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ genre, percentage }) => `${genre} (${percentage.toFixed(1)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {analytics.party_analytics.popular_genres.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Peak Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Peak Activity Hours
              </CardTitle>
              <CardDescription>
                When users are most active (24-hour format)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.party_analytics.peak_hours}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="hour" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(hour) => `${hour}:00`}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      labelFormatter={(hour) => `${hour}:00 - ${(hour + 1) % 24}:00`}
                      formatter={(value) => [value, "Parties Created"]}
                    />
                    <Bar dataKey="party_count" fill="#8884d8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Geographic Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Geographic Distribution
              </CardTitle>
              <CardDescription>
                Top countries by party activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.geographic_data.slice(0, 8).map((country, index) => (
                  <div key={country.country_code} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{country.country}</p>
                        <p className="text-sm text-gray-600">{country.parties} parties</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{country.percentage.toFixed(1)}%</p>
                      <p className="text-sm text-gray-600">{country.users} users</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Hosts */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Top Party Hosts
            </CardTitle>
            <CardDescription>
              Most active and successful party hosts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analytics.host_analytics.top_hosts.slice(0, 6).map((host, index) => (
                <Card key={host.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{host.username}</p>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }, (_, i) => (
                              <Star 
                                key={i} 
                                className={`h-3 w-3 ${i < Math.floor(host.average_rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                              />
                            ))}
                            <span className="text-xs text-gray-600 ml-1">{host.average_rating.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => router.push(`/dashboard/admin/users/${host.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Parties Hosted:</span>
                        <span className="font-medium">{host.parties_hosted}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Participants:</span>
                        <span className="font-medium">{host.total_participants}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Watch Time:</span>
                        <span className="font-medium">{formatWatchTime(host.total_watch_time)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Most Watched Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Most Watched Content
            </CardTitle>
            <CardDescription>
              Popular movies and shows across all parties
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3 font-medium">Title</th>
                    <th className="text-left p-3 font-medium">Genre</th>
                    <th className="text-left p-3 font-medium">Times Watched</th>
                    <th className="text-left p-3 font-medium">Total Duration</th>
                    <th className="text-left p-3 font-medium">Avg Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.content_analytics.most_watched.slice(0, 10).map((content, index) => (
                    <tr key={`${content.title}-${index}`} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded flex items-center justify-center text-white text-xs font-bold">
                            {index + 1}
                          </div>
                          <span className="font-medium">{content.title}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline">{content.genre}</Badge>
                      </td>
                      <td className="p-3 font-medium">{content.times_watched}</td>
                      <td className="p-3">{formatDuration(content.total_duration)}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span>{content.average_rating.toFixed(1)}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
