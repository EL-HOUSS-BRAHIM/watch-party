import { Activity, BarChart, Clock, Download, Heart, PieChart, Play, Share, TrendingUp, User, Users, X } from "lucide-react"
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"

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
  Area,
  AreaChart;
} from 'recharts'

interface UserAnalyticsData {}
  user: {}
    id: string;
    displayName: string;
    avatar: string | null;
    joinDate: string;
  }
  summary: {}
    totalWatchTime: number;
    partiesHosted: number;
    partiesJoined: number;
    totalMessages: number;
    totalReactions: number;
    friendsCount: number;
    averagePartyDuration: number;
    favoriteGenres: string[]
  }
  activity: {}
    daily: { date: string; watchTime: number; parties: number }[]
    weekly: { week: string; watchTime: number; parties: number }[]
    monthly: { month: string; watchTime: number; parties: number }[]
  }
  engagement: {}
    messagesPerParty: number;
    reactionsPerParty: number;
    averageStayTime: number;
    participationRate: number;
    hostSuccessRate: number;
  }
  preferences: {}
    favoriteHours: { hour: number; count: number }[]
    deviceUsage: { device: string; percentage: number }[]
    contentTypes: { type: string; hours: number }[]
  }
  achievements: {}
    id: string;
    name: string;
    description: string;
    icon: string;
    unlockedAt: string;
    progress?: number;
    target?: number;
  }[]
  socialStats: {}
    friendsAdded: number;
    invitesSent: number;
    partiesShared: number;
    avgPartySize: number;
    topWatchPartners: {}
      user: { id: string; displayName: string; avatar: string | null }
      watchTime: number;
    }[]
  }
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#FF6B6B']

export function UserAnalytics() {}
  const [analytics, setAnalytics] = useState<UserAnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')
  const [activityView, setActivityView] = useState('daily')

  useEffect(() => {}
    loadAnalytics()
  }, [timeRange])

  const loadAnalytics = async () => {}
    try {}
      const response = await fetch(`/api/analytics/user?range=${timeRange}`)
      if (response.ok) {}
        const data = await response.json()
        setAnalytics(data)
      }
    } catch {}
      console.error('Failed to load user analytics:', error)
    } finally {}
      setLoading(false)
    }
  }

  const formatDuration = (seconds: number) => {}
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const formatNumber = (num: number) => {}
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const exportData = () => {}
    if (!analytics) return;
    const data = { user: analytics.user.displayName,
      totalWatchTime: formatDuration(analytics.summary.totalWatchTime),
      partiesHosted: analytics.summary.partiesHosted,
      partiesJoined: analytics.summary.partiesJoined,
      totalMessages: analytics.summary.totalMessages,
      achievements: analytics.achievements.length,
      exportedAt: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url;
    a.download = `user-analytics-${analytics.user.id}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getAchievementIcon = (icon: string) => {}
    const iconMap: { [key: string]: React.ComponentType<Record<string, unknown>> } = { trophy: Trophy,
      star: Star,
      target: Target,
      zap: Zap,
      heart: Heart,
      users: Users;
    }
    const IconComponent = iconMap[icon] || Trophy;
    return <IconComponent className="h-6 w-6" />
  }

  if (loading) {}
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    )
  }

  if (!analytics) {}
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-64">
          <Activity className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No analytics data</h3>
          <p className="text-muted-foreground text-center">
            Start watching parties to see your analytics!
          </p>
        </CardContent>
      </Card>
    )
  }

  const getActivityData = () => {}
    switch (activityView) {}
      case 'weekly': return analytics.activity.weekly;
      case 'monthly': return analytics.activity.monthly;
      default: return analytics.activity.daily;
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Your Analytics</h2>
          <p className="text-muted-foreground">
            Member since {new Date(analytics.user.joinDate).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 3 Months</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export;
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Watch Time</p>
                <p className="text-2xl font-bold">{formatDuration(analytics.summary.totalWatchTime)}</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Parties Hosted</p>
                <p className="text-2xl font-bold">{formatNumber(analytics.summary.partiesHosted)}</p>
              </div>
              <Play className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Parties Joined</p>
                <p className="text-2xl font-bold">{formatNumber(analytics.summary.partiesJoined)}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Messages Sent</p>
                <p className="text-2xl font-bold">{formatNumber(analytics.summary.totalMessages)}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Party Duration</p>
                <p className="text-xl font-semibold">{formatDuration(analytics.summary.averagePartyDuration)}</p>
              </div>
              <Activity className="h-6 w-6 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Reactions Given</p>
                <p className="text-xl font-semibold">{formatNumber(analytics.summary.totalReactions)}</p>
              </div>
              <Heart className="h-6 w-6 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Friends</p>
                <p className="text-xl font-semibold">{analytics.summary.friendsCount}</p>
              </div>
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Participation Rate</p>
                <p className="text-xl font-semibold">{analytics.engagement.participationRate}%</p>
              </div>
              <TrendingUp className="h-6 w-6 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics */}
      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Watch Activity</CardTitle>
              <Select value={activityView} onValueChange={setActivityView}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={getActivityData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis;
                      dataKey={activityView === 'daily' ? 'date' : activityView === 'weekly' ? 'week' : 'month'}
                      tickFormatter={(value) => {}
                        if (activityView === 'daily') return new Date(value).toLocaleDateString()
                        return value;
                      }}
                    />
                    <YAxis yAxisId="time" orientation="left" />
                    <YAxis yAxisId="parties" orientation="right" />
                    <Tooltip;
                      labelFormatter={(value) => {}
                        if (activityView === 'daily') return new Date(value).toLocaleDateString()
                        return value;
                      }}
                      formatter={(value, name) => {}
                        if (name === 'watchTime') return [formatDuration(value as number), 'Watch Time']
                        return [value, 'Parties']
                      }}
                    />
                    <Area;
                      yAxisId="time"
                      type="monotone" 
                      dataKey="watchTime" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.6}
                    />
                    <Line;
                      yAxisId="parties"
                      type="monotone" 
                      dataKey="parties" 
                      stroke="#00C49F" 
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Favorite Watch Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.preferences.favoriteHours}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis;
                        dataKey="hour" 
                        tickFormatter={(hour) => `${hour}:00`}
                      />
                      <YAxis />
                      <Tooltip;
                        labelFormatter={(hour) => `${hour}:00`}
                      />
                      <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie;
                        data={analytics.preferences.contentTypes}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ type, percent }) => `${type} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="hours"
                      >
                        {analytics.preferences.contentTypes.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [formatDuration(value as number), &apos;Watch Time']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Device Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.preferences.deviceUsage.map((device, index) => (
                  <div key={device.device} className="flex items-center justify-between">
                    <span className="font-medium">{device.device}</span>
                    <div className="flex items-center space-x-2 w-1/2">
                      <Progress value={device.percentage} className="flex-1" />
                      <span className="text-sm text-muted-foreground w-12 text-right">
                        {device.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Friends Added</p>
                    <p className="text-xl font-semibold">{analytics.socialStats.friendsAdded}</p>
                  </div>
                  <Users className="h-6 w-6 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Invites Sent</p>
                    <p className="text-xl font-semibold">{analytics.socialStats.invitesSent}</p>
                  </div>
                  <Share2 className="h-6 w-6 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Parties Shared</p>
                    <p className="text-xl font-semibold">{analytics.socialStats.partiesShared}</p>
                  </div>
                  <Share2 className="h-6 w-6 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Party Size</p>
                    <p className="text-xl font-semibold">{analytics.socialStats.avgPartySize}</p>
                  </div>
                  <Users className="h-6 w-6 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Watch Partners</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.socialStats.topWatchPartners.map((partner, index) => (
                  <div key={partner.user.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="w-8 h-8 rounded-full p-0 flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          {partner.user.displayName.charAt(0)}
                        </div>
                        <span className="font-medium">{partner.user.displayName}</span>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatDuration(partner.watchTime)} together;
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics.achievements.map((achievement) => (
              <Card key={achievement.id} className="relative overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 p-2 bg-primary/10 rounded-lg">
                      {getAchievementIcon(achievement.icon)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{achievement.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {achievement.description}
                      </p>
                      {achievement.progress !== undefined && achievement.target && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                            <span>Progress</span>
                            <span>{achievement.progress}/{achievement.target}</span>
                          </div>
                          <Progress;
                            value={(achievement.progress / achievement.target) * 100} 
                            className="h-2"
                          />
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Favorite Genres */}
      <Card>
        <CardHeader>
          <CardTitle>Favorite Genres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {analytics.summary.favoriteGenres.map((genre) => (
              <Badge key={genre} variant="secondary">
                {genre}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
