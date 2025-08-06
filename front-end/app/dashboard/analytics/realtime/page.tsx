'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

interface RealtimeStats {
  currentUsers: number;
  activeParties: number;
  watchingNow: number;
  messagesPerMinute: number;
  serverLoad: number;
  bandwidth: number;
  uptime: string;
  regions: Array<{
    name: string;
    users: number;
    latency: number;
  }>;
  devices: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  activityData: Array<{
    time: string;
    users: number;
    parties: number;
    messages: number;
  }>;
}

export default function RealtimeAnalytics() {
  const [stats, setStats] = useState<RealtimeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    const fetchRealtimeStats = async () => {
      try {
        // Mock data - replace with actual API call
        const mockStats: RealtimeStats = {
          currentUsers: 1247,
          activeParties: 43,
          watchingNow: 892,
          messagesPerMinute: 156,
          serverLoad: 34,
          bandwidth: 2.4,
          uptime: '15d 8h 23m',
          regions: [
            { name: 'US West', users: 456, latency: 23 },
            { name: 'US East', users: 398, latency: 18 },
            { name: 'Europe', users: 267, latency: 45 },
            { name: 'Asia', users: 126, latency: 67 }
          ],
          devices: {
            desktop: 678,
            mobile: 423,
            tablet: 146
          },
          activityData: Array.from({ length: 24 }, (_, i) => ({
            time: `${String(i).padStart(2, '0')}:00`,
            users: Math.floor(Math.random() * 500) + 800,
            parties: Math.floor(Math.random() * 30) + 20,
            messages: Math.floor(Math.random() * 100) + 50
          }))
        };
        
        setStats(mockStats);
        setLoading(false);
      } catch (error) {
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

  if (!stats) return null;

  const totalDevices = stats.devices.desktop + stats.devices.mobile + stats.devices.tablet;

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
                <p className="text-3xl font-bold text-blue-600">{stats.currentUsers.toLocaleString()}</p>
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
                <p className="text-3xl font-bold text-purple-600">{stats.activeParties}</p>
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
                <p className="text-3xl font-bold text-green-600">{stats.watchingNow.toLocaleString()}</p>
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
                <p className="text-3xl font-bold text-orange-600">{stats.messagesPerMinute}</p>
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
                <span>{stats.serverLoad}%</span>
              </div>
              <Progress value={stats.serverLoad} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Bandwidth Usage</span>
                <span>{stats.bandwidth} GB/s</span>
              </div>
              <Progress value={(stats.bandwidth / 10) * 100} className="h-2" />
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-sm text-muted-foreground">Uptime</span>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2 text-green-500" />
                <span className="font-medium">{stats.uptime}</span>
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
              {stats.regions.map((region) => (
                <div key={region.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{region.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{region.users} users</div>
                    <div className="text-xs text-muted-foreground">{region.latency}ms</div>
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
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Monitor className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">Desktop</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{stats.devices.desktop}</div>
                  <div className="text-xs text-muted-foreground">
                    {Math.round((stats.devices.desktop / totalDevices) * 100)}%
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Smartphone className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Mobile</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{stats.devices.mobile}</div>
                  <div className="text-xs text-muted-foreground">
                    {Math.round((stats.devices.mobile / totalDevices) * 100)}%
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Monitor className="w-4 h-4 text-purple-500" />
                  <span className="text-sm">Tablet</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{stats.devices.tablet}</div>
                  <div className="text-xs text-muted-foreground">
                    {Math.round((stats.devices.tablet / totalDevices) * 100)}%
                  </div>
                </div>
              </div>
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
              <AreaChart data={stats.activityData}>
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
