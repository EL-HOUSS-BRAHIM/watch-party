'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Activity, 
  Users, 
  Play, 
  MessageSquare, 
  TrendingUp, 
  TrendingDown, 
  Eye,
  Clock,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Signal,
  Wifi,
  Zap
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { analyticsAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface RealTimeMetric {
  id: string;
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  unit: string;
  color: string;
}

interface LiveUser {
  id: string;
  username: string;
  location: string;
  device: 'desktop' | 'mobile' | 'tablet';
  activity: 'watching' | 'chatting' | 'browsing' | 'idle';
  roomId?: string;
  joinedAt: Date;
}

interface ActiveRoom {
  id: string;
  name: string;
  viewers: number;
  maxViewers: number;
  duration: number;
  video: {
    title: string;
    duration: number;
    currentTime: number;
  };
  createdAt: Date;
}

// Generate time series data for charts
const generateTimeSeriesData = (hours: number = 24) => {
  return Array.from({ length: hours }, (_, i) => {
    const time = new Date(Date.now() - (hours - i - 1) * 60 * 60 * 1000);
    return {
      time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      users: Math.floor(Math.random() * 500) + 800,
      streams: Math.floor(Math.random() * 100) + 200,
      messages: Math.floor(Math.random() * 200) + 400,
      bandwidth: parseFloat((Math.random() * 2 + 1).toFixed(1)),
    };
  });
};

const mockLiveUsers: LiveUser[] = Array.from({ length: 25 }, (_, i) => ({
  id: `user-${i}`,
  username: `User${i + 1}`,
  location: ['US', 'UK', 'DE', 'FR', 'JP', 'CA', 'AU'][Math.floor(Math.random() * 7)],
  device: ['desktop', 'mobile', 'tablet'][Math.floor(Math.random() * 3)] as any,
  activity: ['watching', 'chatting', 'browsing', 'idle'][Math.floor(Math.random() * 4)] as any,
  roomId: Math.random() > 0.3 ? `room-${Math.floor(Math.random() * 10)}` : undefined,
  joinedAt: new Date(Date.now() - Math.random() * 3600000),
}));

const mockActiveRooms: ActiveRoom[] = Array.from({ length: 8 }, (_, i) => ({
  id: `room-${i}`,
  name: `Room ${i + 1}`,
  viewers: Math.floor(Math.random() * 50) + 10,
  maxViewers: Math.floor(Math.random() * 100) + 50,
  duration: Math.floor(Math.random() * 7200) + 600,
  video: {
    title: `Movie ${i + 1}`,
    duration: Math.floor(Math.random() * 7200) + 3600,
    currentTime: Math.floor(Math.random() * 3600) + 600,
  },
  createdAt: new Date(Date.now() - Math.random() * 86400000),
}));



const deviceData = [
  { name: 'Desktop', value: 45, fill: '#3b82f6' },
  { name: 'Mobile', value: 35, fill: '#10b981' },
  { name: 'Tablet', value: 20, fill: '#f59e0b' },
];

const locationData = [
  { name: 'US', users: 450 },
  { name: 'UK', users: 320 },
  { name: 'DE', users: 280 },
  { name: 'FR', users: 210 },
  { name: 'JP', users: 190 },
  { name: 'CA', users: 160 },
  { name: 'AU', users: 140 },
];

export default function RealTimeAnalytics() {
  const [metrics, setMetrics] = useState<RealTimeMetric[]>([]);
  const [liveUsers, setLiveUsers] = useState<LiveUser[]>([]);
  const [activeRooms, setActiveRooms] = useState<ActiveRoom[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState(generateTimeSeriesData());
  const [isLive, setIsLive] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h');
  const [selectedMetric, setSelectedMetric] = useState('users');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchRealTimeData();
  }, []);

  useEffect(() => {
    if (isLive) {
      const interval = setInterval(fetchRealTimeData, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isLive]);

  const fetchRealTimeData = async () => {
    try {
      // Fetch real-time analytics data from API
      const [realtimeData, dashboardData] = await Promise.all([
        analyticsAPI.getRealtimeAnalytics(),
        analyticsAPI.getRealTimeData()
      ]);

      // Transform metrics data
      const transformedMetrics: RealTimeMetric[] = [
        {
          id: 'active-users',
          name: 'Active Users',
          value: realtimeData.active_users || dashboardData.active_users || 0,
          change: realtimeData.user_growth_rate || 0,
          trend: (realtimeData.user_growth_rate || 0) > 0 ? 'up' : (realtimeData.user_growth_rate || 0) < 0 ? 'down' : 'stable',
          unit: '',
          color: '#3b82f6',
        },
        {
          id: 'concurrent-streams',
          name: 'Concurrent Streams',
          value: realtimeData.concurrent_streams || dashboardData.active_parties || 0,
          change: realtimeData.stream_growth_rate || 0,
          trend: (realtimeData.stream_growth_rate || 0) > 0 ? 'up' : (realtimeData.stream_growth_rate || 0) < 0 ? 'down' : 'stable',
          unit: '',
          color: '#10b981',
        },
        {
          id: 'messages-per-min',
          name: 'Messages/Min',
          value: realtimeData.messages_per_minute || 0,
          change: realtimeData.chat_activity_rate || 0,
          trend: (realtimeData.chat_activity_rate || 0) > 0 ? 'up' : (realtimeData.chat_activity_rate || 0) < 0 ? 'down' : 'stable',
          unit: '/min',
          color: '#f59e0b',
        },
        {
          id: 'bandwidth',
          name: 'Bandwidth Usage',
          value: realtimeData.bandwidth_usage || 0,
          change: realtimeData.bandwidth_growth_rate || 0,
          trend: (realtimeData.bandwidth_growth_rate || 0) > 0 ? 'up' : (realtimeData.bandwidth_growth_rate || 0) < 0 ? 'down' : 'stable',
          unit: 'TB/h',
          color: '#ef4444',
        },
      ];

      // Transform live users data
      const transformedLiveUsers: LiveUser[] = (realtimeData.live_users || []).map((user: any) => ({
        id: user.id,
        username: user.username,
        location: user.location || 'Unknown',
        device: user.device_type || 'desktop',
        activity: user.current_activity || 'browsing',
        roomId: user.current_room_id,
        joinedAt: new Date(user.session_start || new Date())
      })).slice(0, 25);

      // Transform active rooms data
      const transformedActiveRooms: ActiveRoom[] = (realtimeData.active_rooms || []).map((room: any) => ({
        id: room.id,
        name: room.name,
        viewers: room.viewer_count,
        maxViewers: room.max_viewers,
        duration: room.duration_minutes,
        video: {
          title: room.video?.title || 'Unknown Video',
          duration: room.video?.duration || 0,
          currentTime: room.video?.current_time || 0
        },
        createdAt: new Date(room.created_at || new Date())
      })).slice(0, 10);

      setMetrics(transformedMetrics);
      setLiveUsers(transformedLiveUsers);
      setActiveRooms(transformedActiveRooms);
      
      // Update time series data
      const newDataPoint = {
        time: new Date().toLocaleTimeString('en-US', { hour12: false }),
        users: realtimeData.active_users || 0,
        streams: realtimeData.concurrent_streams || 0,
        messages: realtimeData.messages_per_minute || 0,
        bandwidth: realtimeData.bandwidth_usage || 0,
      };
      
      setTimeSeriesData(prev => [...prev.slice(-29), newDataPoint]);
      
    } catch (error) {
      console.error('Failed to fetch real-time data:', error);
      toast({
        title: "Error",
        description: "Failed to load real-time analytics data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLive) {
      const interval = setInterval(() => {
        // Update metrics with realistic fluctuations
        setMetrics(prev => prev.map(metric => ({
          ...metric,
          value: Math.max(0, metric.value + (Math.random() - 0.5) * metric.value * 0.02),
          change: (Math.random() - 0.5) * 20,
          trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.25 ? 'down' : 'stable',
        })));

        // Add new data point to time series
        setTimeSeriesData(prev => {
          const newData = [...prev.slice(1)];
          const now = new Date();
          newData.push({
            time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            users: Math.floor(Math.random() * 500) + 800,
            streams: Math.floor(Math.random() * 200) + 200,
            messages: Math.floor(Math.random() * 1000) + 500,
            bandwidth: parseFloat((Math.random() * 2 + 1).toFixed(1)),
          });
          return newData;
        });

        // Update active rooms
        setActiveRooms(prev => prev.map(room => ({
          ...room,
          viewers: Math.max(1, room.viewers + Math.floor((Math.random() - 0.5) * 5)),
          video: {
            ...room.video,
            currentTime: Math.min(room.video.duration, room.video.currentTime + 10),
          },
        })));

        // Simulate users joining/leaving
        if (Math.random() > 0.8) {
          setLiveUsers(prev => {
            const action = Math.random() > 0.6 ? 'add' : 'remove';
            if (action === 'add' && prev.length < 50) {
              const newUser: LiveUser = {
                id: `user-${Date.now()}`,
                username: `User${prev.length + 1}`,
                location: ['US', 'UK', 'DE', 'FR', 'JP', 'CA', 'AU'][Math.floor(Math.random() * 7)],
                device: ['desktop', 'mobile', 'tablet'][Math.floor(Math.random() * 3)] as any,
                activity: ['watching', 'chatting', 'browsing'][Math.floor(Math.random() * 3)] as any,
                roomId: Math.random() > 0.3 ? `room-${Math.floor(Math.random() * 10)}` : undefined,
                joinedAt: new Date(),
              };
              return [newUser, ...prev];
            } else if (action === 'remove' && prev.length > 10) {
              return prev.slice(1);
            }
            return prev;
          });
        }
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isLive]);

  const getActivityIcon = (activity: LiveUser['activity']) => {
    switch (activity) {
      case 'watching': return <Eye className="h-4 w-4 text-green-500" />;
      case 'chatting': return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'browsing': return <Globe className="h-4 w-4 text-orange-500" />;
      case 'idle': return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getDeviceIcon = (device: LiveUser['device']) => {
    switch (device) {
      case 'desktop': return <Monitor className="h-4 w-4" />;
      case 'mobile': return <Smartphone className="h-4 w-4" />;
      case 'tablet': return <Tablet className="h-4 w-4" />;
    }
  };

  const getTrendIcon = (trend: RealTimeMetric['trend']) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'stable': return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const calculateProgress = (current: number, total: number) => {
    return Math.min(100, (current / total) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="h-6 w-6" />
            Real-time Analytics
            {isLive && <Badge className="animate-pulse bg-red-500">LIVE</Badge>}
          </h1>
          <p className="text-muted-foreground">
            Monitor your platform activity in real-time
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={isLive}
              onCheckedChange={setIsLive}
            />
            <span className="text-sm">Live Updates</span>
          </div>
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15m">15 minutes</SelectItem>
              <SelectItem value="1h">1 hour</SelectItem>
              <SelectItem value="6h">6 hours</SelectItem>
              <SelectItem value="24h">24 hours</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">{metric.name}</span>
                {getTrendIcon(metric.trend)}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{formatNumber(metric.value)}</span>
                <span className="text-sm text-muted-foreground">{metric.unit}</span>
              </div>
              <div className={`text-xs mt-1 ${metric.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {metric.change >= 0 ? '+' : ''}{metric.change.toFixed(1)}% from last hour
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Time Series Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Activity Trends</CardTitle>
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="users">Users</SelectItem>
                  <SelectItem value="streams">Streams</SelectItem>
                  <SelectItem value="messages">Messages</SelectItem>
                  <SelectItem value="bandwidth">Bandwidth</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey={selectedMetric}
                  stroke={metrics.find(m => m.id.includes(selectedMetric))?.color || '#3b82f6'}
                  fill={metrics.find(m => m.id.includes(selectedMetric))?.color || '#3b82f6'}
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Device Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Device Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-4">
              {deviceData.map((device) => (
                <div key={device.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: device.fill }}
                    />
                    <span>{device.name}</span>
                  </div>
                  <span className="font-medium">{device.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Rooms */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Active Watch Parties ({activeRooms.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {activeRooms.map((room) => (
                <div key={room.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{room.name}</div>
                    <div className="text-sm text-muted-foreground">{room.video.title}</div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {room.viewers}/{room.maxViewers}
                      </span>
                      <span>{formatDuration(room.duration)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{room.viewers} viewers</div>
                    <div className="w-16 bg-muted rounded-full h-1 mt-1">
                      <div
                        className="bg-blue-500 h-1 rounded-full transition-all"
                        style={{
                          width: `${calculateProgress(room.video.currentTime, room.video.duration)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Geographic Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Users by Location</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={locationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="users" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Live Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Signal className="h-5 w-5" />
            Live Users ({liveUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-64 overflow-y-auto">
            {liveUsers.map((user) => (
              <div key={user.id} className="flex items-center gap-3 p-2 border rounded-lg">
                <div className="flex items-center gap-2">
                  {getDeviceIcon(user.device)}
                  {getActivityIcon(user.activity)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{user.username}</div>
                  <div className="text-xs text-muted-foreground">
                    {user.location} • {user.activity}
                  </div>
                  {user.roomId && (
                    <div className="text-xs text-blue-600">{user.roomId}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


