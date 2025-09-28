"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { analyticsAPI } from "@/lib/api"
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Users, 
  Video, 
  MessageSquare, 
  Eye,
  Clock,
  Globe,
  Smartphone,
  Monitor,
  RefreshCw
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, AreaChart, Area } from 'recharts';
import type { AnalyticsRealtimeSnapshot } from "@/lib/api/types"

export default function RealtimeAnalytics() {
  const [snapshot, setSnapshot] = useState<AnalyticsRealtimeSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    const fetchRealtimeStats = async () => {
      try {
        // Real API call for realtime analytics
  const realtimeData = await analyticsAPI.getRealtimeAnalytics();
  setSnapshot(realtimeData);
        setLoading(false);
      } catch {
        console.error('Failed to fetch realtime stats:', error);
        setLoading(false);
      }
    };

    fetchRealtimeStats();

    if (autoRefresh) {
      const interval = setInterval(fetchRealtimeStats, 5000); // Update every 5 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!snapshot) return null;

  const activeUsers = snapshot.active_users;
  const concurrentStreams = snapshot.concurrent_streams;
  const activeParties = snapshot.active_parties ?? concurrentStreams;
  const watchingNow = concurrentStreams;
  const messagesPerMinute = snapshot.messages_per_minute;
  const bandwidthUsage = snapshot.bandwidth_usage;
  const deviceBreakdown = snapshot.device_breakdown ?? [];
  const geoDistribution = snapshot.geo_distribution ?? [];
  const timeSeries = snapshot.time_series ?? [];

  const estimatedServerLoad = Math.min(100, Math.round((concurrentStreams / Math.max(activeUsers, 1)) * 100));
  const bandwidthPercent = Math.min(100, Math.round((bandwidthUsage ?? 0) * 10));
  const lastUpdate = timeSeries.at(-1)?.timestamp ?? null;
  const uptimeDisplay = lastUpdate ? new Date(lastUpdate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A";

  const deviceStats = deviceBreakdown.map((entry) => ({
    device: entry.device,
    percentage: entry.percentage,
    count: Math.round(((entry.percentage ?? 0) / 100) * activeUsers),
  }));

  const totalRegionUsers = geoDistribution.reduce((sum, entry) => sum + entry.users, 0) || 1;
  const regionStats = geoDistribution.map((entry) => ({
    country: entry.country,
    users: entry.users,
    percentage: Math.round((entry.users / totalRegionUsers) * 100),
  }));

  const activityData = timeSeries.map((point) => ({
    time: new Date(point.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    users: point.active_users,
    streams: point.concurrent_streams,
    messages: point.messages_per_minute,
  }));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Real-time Analytics</h1>
          <p className="text-muted-foreground">Live system metrics and user activity</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto Refresh
          </Button>
          <Badge variant="outline" className="text-green-600 border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            Live
          </Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                <p className="text-3xl font-bold text-blue-600">{activeUsers.toLocaleString()}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <div className="mt-2 flex items-center text-sm text-green-600">
              <Activity className="w-4 h-4 mr-1" />
              +12% from last hour
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Parties</p>
                <p className="text-3xl font-bold text-purple-600">{activeParties}</p>
              </div>
              <Video className="w-8 h-8 text-purple-600" />
            </div>
            <div className="mt-2 flex items-center text-sm text-green-600">
              <Activity className="w-4 h-4 mr-1" />
              +5% from last hour
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Watching Now</p>
                <p className="text-3xl font-bold text-green-600">{watchingNow.toLocaleString()}</p>
              </div>
              <Eye className="w-8 h-8 text-green-600" />
            </div>
            <div className="mt-2 flex items-center text-sm text-green-600">
              <Activity className="w-4 h-4 mr-1" />
              +8% from last hour
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Messages/Min</p>
                <p className="text-3xl font-bold text-orange-600">{messagesPerMinute}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-orange-600" />
            </div>
            <div className="mt-2 flex items-center text-sm text-green-600">
              <Activity className="w-4 h-4 mr-1" />
              +15% from last hour
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">System Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Server Load</span>
                <span>{estimatedServerLoad}%</span>
              </div>
              <Progress value={estimatedServerLoad} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Bandwidth Usage</span>
                <span>{bandwidthUsage.toFixed(2)} Gb/s</span>
              </div>
              <Progress value={bandwidthPercent} className="h-2" />
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-sm text-muted-foreground">Uptime</span>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2 text-green-500" />
                <span className="font-medium">Updated {uptimeDisplay}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Regional Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {regionStats.map((region) => (
                <div key={region.country} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{region.country}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{region.users.toLocaleString()} users</div>
                    <div className="text-xs text-muted-foreground">{region.percentage}% of active users</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Device Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {deviceStats.map((device) => (
                <div key={device.device} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {device.device === "mobile" ? (
                      <Smartphone className="w-4 h-4 text-green-500" />
                    ) : (
                      <Monitor className="w-4 h-4 text-blue-500" />
                    )}
                    <span className="text-sm capitalize">{device.device}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{device.count.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">{Math.round(device.percentage)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">24-Hour Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Area 
                  type="monotone" 
                  dataKey="users" 
                  stackId="1"
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="parties" 
                  stackId="2"
                  stroke="#8b5cf6" 
                  fill="#8b5cf6" 
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
