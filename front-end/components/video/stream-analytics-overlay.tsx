'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { Eye, Clock, TrendingUp, Users } from 'lucide-react'

interface StreamAnalyticsData {
  current_viewers: number
  peak_viewers: number
  total_views: number
  average_watch_time: number
  watch_time_data: Array<{
    time: string
    viewers: number
    retention: number
  }>
  retention_curve: Array<{
    timestamp: number
    percentage: number
  }>
  viewer_locations: Array<{
    country: string
    viewers: number
  }>
}

interface StreamAnalyticsOverlayProps {
  videoId: string
  isLive?: boolean
  onClose: () => void
}

export function StreamAnalyticsOverlay({ videoId, isLive = false, onClose }: StreamAnalyticsOverlayProps) {
  const [analytics, setAnalytics] = useState<StreamAnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
    
    if (isLive) {
      const interval = setInterval(fetchAnalytics, 30000) // Update every 30 seconds for live
      return () => clearInterval(interval)
    }
  }, [videoId, isLive])

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockData: StreamAnalyticsData = {
        current_viewers: isLive ? Math.floor(Math.random() * 100) + 20 : 0,
        peak_viewers: Math.floor(Math.random() * 500) + 100,
        total_views: Math.floor(Math.random() * 10000) + 1000,
        average_watch_time: Math.floor(Math.random() * 300) + 120,
        watch_time_data: Array.from({ length: 24 }, (_, i) => ({
          time: `${i}:00`,
          viewers: Math.floor(Math.random() * 100) + 10,
          retention: Math.floor(Math.random() * 40) + 60
        })),
        retention_curve: Array.from({ length: 100 }, (_, i) => ({
          timestamp: i,
          percentage: Math.max(10, 100 - (i * 0.8) - Math.random() * 20)
        })),
        viewer_locations: [
          { country: 'United States', viewers: 45 },
          { country: 'United Kingdom', viewers: 23 },
          { country: 'Canada', viewers: 18 },
          { country: 'Australia', viewers: 14 }
        ]
      }
      
      setAnalytics(mockData)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  if (isLoading || !analytics) {
    return (
      <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="text-center">Loading analytics...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            {isLive ? 'Live Stream Analytics' : 'Video Analytics'}
          </CardTitle>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Eye className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold text-blue-600">
                {isLive ? analytics.current_viewers : analytics.total_views.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {isLive ? 'Current Viewers' : 'Total Views'}
              </div>
            </div>

            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Users className="w-6 h-6 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold text-green-600">
                {analytics.peak_viewers.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Peak Viewers
              </div>
            </div>

            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Clock className="w-6 h-6 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold text-purple-600">
                {formatDuration(analytics.average_watch_time)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Avg Watch Time
              </div>
            </div>

            <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <TrendingUp className="w-6 h-6 mx-auto mb-2 text-orange-600" />
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(analytics.retention_curve[analytics.retention_curve.length - 1]?.percentage || 0)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Retention Rate
              </div>
            </div>
          </div>

          {/* Viewer Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Viewer Timeline (Last 24h)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={analytics.watch_time_data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="viewers" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Retention Curve */}
          <Card>
            <CardHeader>
              <CardTitle>Audience Retention</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={analytics.retention_curve}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'Retention']}
                    labelFormatter={(label) => `Time: ${label}%`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="percentage" 
                    stroke="#82ca9d" 
                    fill="#82ca9d" 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Locations */}
          <Card>
            <CardHeader>
              <CardTitle>Top Viewer Locations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.viewer_locations.map((location, index) => (
                  <div key={location.country} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-6 text-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <span>{location.country}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress 
                        value={(location.viewers / analytics.viewer_locations[0].viewers) * 100} 
                        className="w-24 h-2"
                      />
                      <span className="text-sm font-medium w-8 text-right">
                        {location.viewers}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {isLive && (
            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              Analytics update every 30 seconds for live streams
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
