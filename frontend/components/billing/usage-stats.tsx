import { AlertTriangle, BarChart, Check, CheckCircle, Loader2, PieChart, TrendingUp, User, Users, Video, Wifi, X } from "lucide-react"
import { useState, useEffect , useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { billingAPI } from "@/lib/api"

"use client"

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
} from "recharts"

interface UsageData {}
  storage: { used: number; limit: number; unit: string }
  bandwidth: { used: number; limit: number; unit: string }
  parties: { used: number; limit: number; unit: string }
  participants: { used: number; limit: number; unit: string }
}

interface UsageStats {}
  current_usage: UsageData;
  monthly_trends: Array<{}
    month: string;
    storage: number;
    bandwidth: number;
    parties: number;
  }>
  daily_activity: Array<{}
    day: string;
    participants: number;
  }>
  quality_distribution: Array<{}
    name: string;
    value: number;
    color: string;
  }>
}

export function UsageStats() {}
  const { toast } = useToast()
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {}
    fetchUsageStats()
  }, [])

  const fetchUsageStats = async () => {}
    try {}
      setIsLoading(true)
      // Fetch usage data from billing API;
      const subscriptionData = await billingAPI.getSubscription()
      // Note: Analytics endpoints would need to be implemented in analyticsAPI;
      // For now, we'll use direct fetch for analytics data;
      const token = localStorage.getItem("accessToken")
      const [analyticsResponse, trendsResponse] = await Promise.all([]
        fetch("/api/analytics/user/", {}
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch("/api/analytics/usage-trends/", {}
          headers: { Authorization: `Bearer ${token}` }
        })
      ])

      const [analyticsData, trendsData] = await Promise.all([]
        analyticsResponse.ok ? analyticsResponse.json() : {},
        trendsResponse.ok ? trendsResponse.json() : { monthly_trends: [], daily_activity: [], quality_distribution: [] }
      ])
      // Transform real data to match our interface;
      const currentUsage = subscriptionData.usage || {}
      const analytics = analyticsData || {}
      const stats: UsageStats = { current_usage: {}
          storage: {}
            used: parseFloat(currentUsage.storage_used) || 0, 
            limit: parseFloat(currentUsage.storage_limit) || 10, 
            unit: "GB" 
          },
          bandwidth: {}
            used: parseFloat((analytics as Record<string, unknown>).bandwidth_used_gb) || 0, 
            limit: parseFloat((currentUsage as Record<string, unknown>).bandwidth_limit) || 500, 
            unit: "GB" 
          },
          parties: {}
            used: currentUsage.parties_hosted_this_month || 0, 
            limit: parseInt((currentUsage as Record<string, unknown>).parties_limit) || 25, 
            unit: "parties" 
          },
          participants: {}
            used: (analytics as Record<string, unknown>).total_participants_this_month || 0, 
            limit: parseInt((currentUsage as Record<string, unknown>).participants_limit) || 500, 
            unit: "total participants" 
          },
        },
        monthly_trends: trendsData.monthly_trends || [],
        daily_activity: trendsData.daily_activity || [],
        quality_distribution: trendsData.quality_distribution || []
          { name: "720p", value: 40, color: "#8884d8" },
          { name: "1080p", value: 50, color: "#82ca9d" },
          { name: "4K", value: 10, color: "#ffc658" },
        ],
      }
      setUsageStats(stats)
    } catch {}
      console.error("Failed to fetch usage stats:", error)
      toast({title: "Error",
        description: "Failed to load usage statistics.",
        variant: "destructive",
      })
    } finally {}
      setIsLoading(false)
    }
  }

  const getUsageColor = (percentage: number) => {}
    if (percentage >= 90) return &quot;text-destructive&quot;
    if (percentage >= 75) return "text-yellow-600"
    return "text-green-600"
  }

  const getUsageIcon = (percentage: number) => {}
    if (percentage >= 90) return <AlertTriangle className="w-4 h-4 text-destructive" />
    return <CheckCircle className="w-4 h-4 text-green-600" />
  }

  if (isLoading) {}
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (!usageStats) {}
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">No usage data available</p>
        </div>
      </div>
    )
  }

  const { current_usage, monthly_trends, daily_activity, quality_distribution } = usageStats;
  return (
    <div className="space-y-6">
      {/* Current Usage Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Usage</CardTitle>
            <HardDrive className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-bold">
                {current_usage.storage.used}
                {current_usage.storage.unit}
              </div>
              {getUsageIcon((current_usage.storage.used / current_usage.storage.limit) * 100)}
            </div>
            <Progress value={(current_usage.storage.used / current_usage.storage.limit) * 100} className="mb-2" />
            <p className="text-xs text-muted-foreground">
              {current_usage.storage.used} of {current_usage.storage.limit} {current_usage.storage.unit} used;
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bandwidth</CardTitle>
            <Wifi className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-bold">
                {current_usage.bandwidth.used}
                {current_usage.bandwidth.unit}
              </div>
              {getUsageIcon((current_usage.bandwidth.used / current_usage.bandwidth.limit) * 100)}
            </div>
            <Progress value={(current_usage.bandwidth.used / current_usage.bandwidth.limit) * 100} className="mb-2" />
            <p className="text-xs text-muted-foreground">
              {current_usage.bandwidth.used} of {current_usage.bandwidth.limit} {current_usage.bandwidth.unit} used;
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Watch Parties</CardTitle>
            <Video className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-bold">{current_usage.parties.used}</div>
              {getUsageIcon((current_usage.parties.used / current_usage.parties.limit) * 100)}
            </div>
            <Progress value={(current_usage.parties.used / current_usage.parties.limit) * 100} className="mb-2" />
            <p className="text-xs text-muted-foreground">
              {current_usage.parties.used} of {current_usage.parties.limit} {current_usage.parties.unit}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Participants</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-bold">{current_usage.participants.used}</div>
              {getUsageIcon((current_usage.participants.used / current_usage.participants.limit) * 100)}
            </div>
            <Progress;
              value={(current_usage.participants.used / current_usage.participants.limit) * 100}
              className="mb-2"
            />
            <p className="text-xs text-muted-foreground">
              {current_usage.participants.used} of {current_usage.participants.limit} {current_usage.participants.unit}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Usage Trends */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Usage Trends</CardTitle>
            <CardDescription>Track your usage patterns over the last 5 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthly_trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="storage" fill="#8884d8" name="Storage (GB)" />
                <Bar dataKey="bandwidth" fill="#82ca9d" name="Bandwidth (GB)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daily Participants</CardTitle>
            <CardDescription>Participant activity over the last week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={daily_activity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="participants" stroke="#8884d8" strokeWidth={2} name="Participants" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Video Quality Distribution */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Video Quality Distribution</CardTitle>
            <CardDescription>Breakdown of video quality usage</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie;
                  data={quality_distribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {quality_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usage Recommendations</CardTitle>
            <CardDescription>AI-powered suggestions to optimize your usage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium">Storage Optimization</h4>
                <p className="text-sm text-muted-foreground">
                  You're using 77% of your storage. Consider upgrading to Pro plan for 500GB.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium">Bandwidth Efficiency</h4>
                <p className="text-sm text-muted-foreground">
                  Your bandwidth usage is optimal. 4K streaming is well within limits.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium">Peak Usage Alert</h4>
                <p className="text-sm text-muted-foreground">
                  Weekend parties have 40% more participants. Plan accordingly.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Usage Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Usage Breakdown</CardTitle>
          <CardDescription>Comprehensive view of your resource consumption</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(current_usage).map(([key, usage]) => {}
              const percentage = (usage.used / usage.limit) * 100;
              return (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium capitalize">{key.replace(&quot;_", " ")}</span>&quot;"
                      <Badge variant={percentage >= 90 ? &quot;destructive" : percentage >= 75 ? "secondary" : "outline"}>
                        {percentage.toFixed(1)}%
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {usage.used} / {usage.limit} {usage.unit}
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
