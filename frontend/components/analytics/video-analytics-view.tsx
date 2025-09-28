'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { analyticsAPI } from '@/lib/api'

interface VideoAnalyticsProps {
  videoId: string
}

interface VideoStats {
  views: number
  likes: number
  dislikes: number
  shares: number
  comments: number
  watchTime: number
  avgWatchTime: number
  retentionRate: number
  completionRate: number
}

interface ViewerData {
  timestamp: string
  viewers: number
  country?: string
  device?: string
  age?: string
  gender?: string
}

const VideoAnalyticsView = ({ videoId }: VideoAnalyticsProps) => {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('7d')
  const [stats, setStats] = useState<VideoStats>({
    views: 0,
    likes: 0,
    dislikes: 0,
    shares: 0,
    comments: 0,
    watchTime: 0,
    avgWatchTime: 0,
    retentionRate: 0,
    completionRate: 0
  })
  const [viewerData, setViewerData] = useState<ViewerData[]>([])

  useEffect(() => {
    fetchAnalytics()
  }, [videoId, dateRange])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await analyticsAPI.getVideoAnalytics(videoId)
      
      if (response) {
        setStats({
          views: response.video?.views || 0,
          likes: response.engagement?.likes || 0,
          dislikes: 0, // Not provided by API
          shares: response.engagement?.shares || 0,
          comments: response.engagement?.comments || 0,
          watchTime: 0, // Not provided by API
          avgWatchTime: 0, // Not provided by API
          retentionRate: response.video?.completion_rate || 0,
          completionRate: response.video?.completion_rate || 0
        })
        
        // Transform view chart data to match expected format
        const transformedViewerData = response.view_chart?.map((item: unknown) => ({
          timestamp: item.date,
          viewers: item.views,
          country: 'Unknown',
          device: 'Unknown',
          age: 'Unknown',
          gender: 'Unknown'
        })) || []
        
        setViewerData(transformedViewerData)
      }
    } catch {
      console.error('Failed to fetch video analytics:', error)
      toast({
        title: "Error",
        description: "Failed to load video analytics. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const exportData = async (format: 'csv' | 'json') => {
    try {
      const response = await analyticsAPI.exportAnalytics({
        format,
        metrics: ['video_analytics'],
        date_range: dateRange
      })
      
      // Create download link
      const link = document.createElement('a')
      link.href = response.download_url
      link.download = `video-${videoId}-analytics.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast({
        title: "Export Successful",
        description: `Video analytics exported as ${format.toUpperCase()}`
      })
    } catch {
      console.error('Export failed:', error)
      toast({
        title: "Export Failed",
        description: "Failed to export video analytics. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Video Analytics</h2>
          <p className="text-muted-foreground">Detailed performance metrics for video {videoId}</p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => exportData(&apos;csv&apos;)}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => exportData(&apos;json&apos;)}>
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
            <TabsTrigger value="demographics">Demographics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(stats.views)}</div>
                  <p className="text-xs text-muted-foreground">
                    +12% from last period
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Engagement</CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(stats.likes)}</div>
                  <p className="text-xs text-muted-foreground">
                    Likes & interactions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Watch Time</CardTitle>
                  <Play className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatDuration(stats.watchTime)}</div>
                  <p className="text-xs text-muted-foreground">
                    Total across all viewers
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completion</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.completionRate.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">
                    Average view completion
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>
                  Key performance indicators for your video
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Retention Rate</span>
                      <span className="text-sm text-muted-foreground">
                        {stats.retentionRate.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={stats.retentionRate} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Engagement Rate</span>
                      <span className="text-sm text-muted-foreground">
                        {((stats.likes + stats.comments + stats.shares) / stats.views * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={(stats.likes + stats.comments + stats.shares) / stats.views * 100} 
                      className="h-2" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{formatNumber(stats.shares)}</div>
                    <div className="text-sm text-muted-foreground">Shares</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{formatNumber(stats.comments)}</div>
                    <div className="text-sm text-muted-foreground">Comments</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{formatDuration(stats.avgWatchTime)}</div>
                    <div className="text-sm text-muted-foreground">Avg Watch Time</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="engagement" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
                <CardDescription>
                  How viewers interact with your video
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    <div>
                      <div className="font-semibold">{formatNumber(stats.likes)}</div>
                      <div className="text-sm text-muted-foreground">Likes</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5 text-blue-500" />
                    <div>
                      <div className="font-semibold">{formatNumber(stats.comments)}</div>
                      <div className="text-sm text-muted-foreground">Comments</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Share2 className="h-5 w-5 text-green-500" />
                    <div>
                      <div className="font-semibold">{formatNumber(stats.shares)}</div>
                      <div className="text-sm text-muted-foreground">Shares</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-purple-500" />
                    <div>
                      <div className="font-semibold">{stats.retentionRate.toFixed(1)}%</div>
                      <div className="text-sm text-muted-foreground">Retention</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="demographics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Viewer Demographics</CardTitle>
                <CardDescription>
                  Understand your audience better
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <PieChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Demographics Data</h3>
                  <p className="text-muted-foreground">
                    Demographic information will be available once sufficient data is collected.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

export default VideoAnalyticsView
