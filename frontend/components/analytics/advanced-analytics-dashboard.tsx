import { BarChart, Calendar, DollarSign, Download, Eye, PieChart, Play, TrendingUp, User, Users, X } from "lucide-react"
import { useState, useEffect , useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { analyticsAPI } from "@/lib/api"

"use client"

  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
interface AnalyticsData {}
  overview: {}
    totalUsers: number;
    activeUsers: number;
    totalParties: number;
    totalRevenue: number;
    userGrowth: number;
    revenueGrowth: number;
    engagementRate: number;
    retentionRate: number;
  }
  userMetrics: {}
    daily: Array<{ date: string; users: number; newUsers: number }>
    retention: Array<{ cohort: string; day1: number; day7: number; day30: number }>
    engagement: Array<{ segment: string; sessions: number; duration: number }>
  }
  contentMetrics: {}
    topVideos: Array<{ title: string; views: number; engagement: number; revenue: number }>
    categoryPerformance: Array<{ category: string; views: number; engagement: number }>
    uploadTrends: Array<{ date: string; uploads: number; totalSize: number }>
  }
  revenueMetrics: {}
    monthly: Array<{ month: string; revenue: number; subscriptions: number }>
    plans: Array<{ plan: string; subscribers: number; revenue: number }>
    churn: Array<{ month: string; churnRate: number; newSubscribers: number }>
  }
  platformMetrics: {}
    performance: Array<{ metric: string; value: number; target: number }>
    errors: Array<{ date: string; errors: number; type: string }>
    usage: Array<{ feature: string; usage: number; growth: number }>
  }
}

const COLORS = ["#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"]

export function AdvancedAnalyticsDashboard() {}
  const { toast } = useToast()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({}
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date(),
  })
  const [selectedMetric, setSelectedMetric] = useState("users")

  useEffect(() => {}
    fetchAnalytics()
  }, [dateRange])

  const fetchAnalytics = async () => {}
    setLoading(true)
    try {}
      // Fetch advanced analytics data from API;
      const response = await analyticsAPI.getAdminAnalytics()

      // Transform API response to component format;
      const transformedData: AnalyticsData = { overview: {}
          totalUsers: response.overview?.total_users || 0,
          activeUsers: response.overview?.active_users || 0,
          totalParties: response.overview?.total_parties || 0,
          totalRevenue: response.overview?.total_revenue || 0,
          userGrowth: response.overview?.user_growth || 0,
          revenueGrowth: response.overview?.revenue_growth || 0,
          engagementRate: response.overview?.engagement_rate || 0,
          retentionRate: response.overview?.retention_rate || 0,
        },
        userMetrics: {}
          daily: response.user_metrics?.daily || [],
          retention: response.user_metrics?.retention || [],
          engagement: response.user_metrics?.engagement || [],
        },
        contentMetrics: {}
          topVideos: response.content_metrics?.top_videos || [],
          categoryPerformance: response.content_metrics?.category_performance || [],
          uploadTrends: response.content_metrics?.upload_trends || [],
        },
        revenueMetrics: {}
          monthly: response.revenue_metrics?.monthly || [],
          plans: response.revenue_metrics?.plans || [],
          churn: response.revenue_metrics?.churn || [],
        },
        platformMetrics: {}
          performance: response.platform_metrics?.performance || [],
          errors: response.platform_metrics?.errors || [],
          usage: response.platform_metrics?.usage || [],
        },
      }

      setData(transformedData)
    } catch {}
      console.error("Failed to fetch analytics:", error)
      toast({title: "Error",
        description: "Failed to load analytics data. Please try again.",
        variant: "destructive",
      })
      // Set empty data structure on error;
      setData({overview: {}
          totalUsers: 0,
          activeUsers: 0,
          totalParties: 0,
          totalRevenue: 0,
          userGrowth: 0,
          revenueGrowth: 0,
          engagementRate: 0,
          retentionRate: 0,
        },
        userMetrics: { daily: [], retention: [], engagement: [] },
        contentMetrics: { topVideos: [], categoryPerformance: [], uploadTrends: [] },
        revenueMetrics: { monthly: [], plans: [], churn: [] },
        platformMetrics: { performance: [], errors: [], usage: [] },
      })
    } finally {}
      setLoading(false)
    }
  }

  const exportData = async (format: "csv" | "excel") => {}
    try {}
      const exportResponse = await analyticsAPI.exportAnalytics({ format })
      // Create download link;
      const link = document.createElement('a')
      link.href = exportResponse.download_url;
      link.download = `analytics-${format}-${Date.now()}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast({title: "Export Successful",
        description: `Analytics data exported as ${format.toUpperCase()}`,
      })
    } catch {}
      console.error("Export failed:", error)
      toast({title: "Export Failed",
        description: "Failed to export analytics data. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {}
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!data) return null;
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Advanced Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400">Comprehensive insights into your platform performance</p>
        </div>

        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar;
                initialFocus;
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={(range) => range && setDateRange(range as { from: Date; to: Date })}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="users">Users</SelectItem>
              <SelectItem value="revenue">Revenue</SelectItem>
              <SelectItem value="content">Content</SelectItem>
              <SelectItem value="engagement">Engagement</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={() => exportData(&quot;csv")} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV;
          </Button>
          <Button onClick={() => exportData(&quot;excel")} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export PDF;
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalUsers.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3" />
              +{data.overview.userGrowth}% from last month;
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.activeUsers.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              Engagement: {data.overview.engagementRate}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Parties</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalParties.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              Retention: {data.overview.retentionRate}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.overview.totalRevenue.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3" />
              +{data.overview.revenueGrowth}% from last month;
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="platform">Platform</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>Daily active and new user registrations</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data.userMetrics.daily}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="users" stackId="1" stroke="#6366f1" fill="#6366f1" />
                    <Area type="monotone" dataKey="newUsers" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Retention</CardTitle>
                <CardDescription>Cohort retention rates over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.userMetrics.retention}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="cohort" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="day1" fill="#10b981" />
                    <Bar dataKey="day7" fill="#06b6d4" />
                    <Bar dataKey="day30" fill="#6366f1" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>User Engagement by Segment</CardTitle>
              <CardDescription>Session duration and frequency by user type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.userMetrics.engagement.map((segment, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{segment.segment}</h4>
                      <p className="text-sm text-muted-foreground">{segment.sessions} sessions</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{segment.duration}min</div>
                      <p className="text-sm text-muted-foreground">avg. duration</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Videos</CardTitle>
                <CardDescription>Most watched and engaging content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.contentMetrics.topVideos.slice(0, 5).map((video, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium truncate">{video.title}</h4>
                        <p className="text-sm text-muted-foreground">{video.views} views</p>
                      </div>
                      <div className="text-right">
                        <Badge className="mb-1">{video.engagement}% engagement</Badge>
                        <div className="text-sm text-green-600">${video.revenue}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
                <CardDescription>Views and engagement by content category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie;
                      data={data.contentMetrics.categoryPerformance}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, percent }) => `${category} ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="views"
                    >
                      {data.contentMetrics.categoryPerformance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Upload Trends</CardTitle>
              <CardDescription>Content upload frequency and storage usage</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.contentMetrics.uploadTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="uploads" fill="#6366f1" />
                  <Line yAxisId="right" type="monotone" dataKey="totalSize" stroke="#f59e0b" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue</CardTitle>
                <CardDescription>Revenue and subscription trends</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data.revenueMetrics.monthly}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="#10b981" />
                    <Area type="monotone" dataKey="subscriptions" stroke="#06b6d4" fill="#06b6d4" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subscription Plans</CardTitle>
                <CardDescription>Revenue distribution by plan type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.revenueMetrics.plans.map((plan, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{plan.plan}</h4>
                        <p className="text-sm text-muted-foreground">{plan.subscribers} subscribers</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">${plan.revenue}</div>
                        <Progress value={(plan.revenue / data.revenueMetrics.plans.reduce((sum, p) => sum + p.revenue, 0)) * 100} className=&quot;w-20" />"
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Churn Analysis</CardTitle>
              <CardDescription>Monthly churn rate and new subscriber acquisition</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.revenueMetrics.churn}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="churnRate" stroke="#ef4444" />
                  <Bar yAxisId="right" dataKey="newSubscribers" fill="#10b981" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Platform Tab */}
        <TabsContent value="platform" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Key platform performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.platformMetrics.performance.map((metric, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{metric.metric}</span>
                        <span className="text-sm text-muted-foreground">
                          {metric.value} / {metric.target}
                        </span>
                      </div>
                      <Progress value={(metric.value / metric.target) * 100} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Feature Usage</CardTitle>
                <CardDescription>Most and least used platform features</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.platformMetrics.usage} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="feature" type="category" width={80} />
                    <Tooltip />
                    <Bar dataKey="usage" fill="#6366f1" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Error Tracking</CardTitle>
              <CardDescription>System errors and issues over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.platformMetrics.errors}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="errors" stroke="#ef4444" fill="#ef4444" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Growth Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium text-green-600">Positive Trend</h4>
                    <p className="text-sm text-muted-foreground">User engagement up 15% this month</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium text-yellow-600">Opportunity</h4>
                    <p className="text-sm text-muted-foreground">Mobile usage growing faster than desktop</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium text-green-600">Strong Performance</h4>
                    <p className="text-sm text-muted-foreground">Premium subscriptions increasing</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium text-red-600">Attention Needed</h4>
                    <p className="text-sm text-muted-foreground">Churn rate slightly elevated</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium text-blue-600">Content Trend</h4>
                    <p className="text-sm text-muted-foreground">Short-form content performing well</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium text-purple-600">User Preference</h4>
                    <p className="text-sm text-muted-foreground">Comedy category most popular</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Recommendations</CardTitle>
              <CardDescription>Automated insights and suggestions for platform optimization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">Optimize Peak Hours</h4>
                    <p className="text-sm text-muted-foreground">
                      Consider scheduling maintenance during 3-5 AM when usage is lowest;
                    </p>
                    <Badge className="mt-2">High Impact</Badge>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900">
                    <Users className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">Target Inactive Users</h4>
                    <p className="text-sm text-muted-foreground">
                      Launch re-engagement campaign for users inactive 30+ days;
                    </p>
                    <Badge className="mt-2">Medium Impact</Badge>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900">
                    <Play className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">Content Strategy</h4>
                    <p className="text-sm text-muted-foreground">
                      Focus on comedy and short-form content based on engagement data;
                    </p>
                    <Badge className="mt-2">High Impact</Badge>
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
