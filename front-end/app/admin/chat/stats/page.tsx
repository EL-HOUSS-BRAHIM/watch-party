'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { MessageSquare, Users, AlertCircle, TrendingUp, Calendar } from 'lucide-react';

interface ChatStats {
  totalMessages: number;
  totalUsers: number;
  activeUsers: number;
  averageMessagesPerUser: number;
  topChannels: Array<{
    id: string;
    name: string;
    messageCount: number;
    userCount: number;
  }>;
  messagesByHour: Array<{
    hour: number;
    count: number;
  }>;
  moderationActions: Array<{
    type: string;
    count: number;
    color: string;
  }>;
  recentActivity: Array<{
    id: string;
    type: 'message' | 'join' | 'leave' | 'moderation';
    user: string;
    channel: string;
    timestamp: string;
    details?: string;
  }>;
}

export default function ChatStatsPage() {
  const [stats, setStats] = useState<ChatStats | null>(null);
  const [timeframe, setTimeframe] = useState('24h');
  const [selectedChannel, setSelectedChannel] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChatStats();
  }, [timeframe, selectedChannel]);

  const fetchChatStats = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockStats: ChatStats = {
        totalMessages: 15420,
        totalUsers: 1250,
        activeUsers: 340,
        averageMessagesPerUser: 12.3,
        topChannels: [
          { id: '1', name: 'General Chat', messageCount: 8520, userCount: 890 },
          { id: '2', name: 'Movie Discussion', messageCount: 4200, userCount: 560 },
          { id: '3', name: 'Party Room #1', messageCount: 2100, userCount: 340 },
          { id: '4', name: 'Help & Support', messageCount: 600, userCount: 180 },
        ],
        messagesByHour: Array.from({ length: 24 }, (_, i) => ({
          hour: i,
          count: Math.floor(Math.random() * 1000) + 200
        })),
        moderationActions: [
          { type: 'Messages Deleted', count: 45, color: '#ef4444' },
          { type: 'Users Warned', count: 23, color: '#f59e0b' },
          { type: 'Users Muted', count: 12, color: '#8b5cf6' },
          { type: 'Users Banned', count: 3, color: '#dc2626' },
        ],
        recentActivity: [
          { id: '1', type: 'moderation', user: 'admin', channel: 'General Chat', timestamp: '2 minutes ago', details: 'Deleted spam message' },
          { id: '2', type: 'message', user: 'user123', channel: 'Movie Discussion', timestamp: '5 minutes ago' },
          { id: '3', type: 'join', user: 'newuser', channel: 'Party Room #1', timestamp: '8 minutes ago' },
          { id: '4', type: 'moderation', user: 'moderator2', channel: 'General Chat', timestamp: '12 minutes ago', details: 'Warning issued for inappropriate content' },
        ]
      };

      await new Promise(resolve => setTimeout(resolve, 1000));
      setStats(mockStats);
    } catch (error) {
      console.error('Failed to fetch chat stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Failed to load chat statistics</h2>
          <Button onClick={fetchChatStats}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Chat Statistics</h1>
          <p className="text-muted-foreground">Monitor chat activity and moderation metrics</p>
        </div>
        <div className="flex gap-4">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedChannel} onValueChange={setSelectedChannel}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Channels</SelectItem>
              {stats.topChannels.map(channel => (
                <SelectItem key={channel.id} value={channel.id}>
                  {channel.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMessages.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> from last period
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+5%</span> from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Messages/User</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageMessagesPerUser}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-blue-600">+2.1</span> from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Moderation Actions</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.moderationActions.reduce((sum, action) => sum + action.count, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600">+8</span> from last period
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="activity" className="space-y-6">
        <TabsList>
          <TabsTrigger value="activity">Activity Patterns</TabsTrigger>
          <TabsTrigger value="channels">Channel Stats</TabsTrigger>
          <TabsTrigger value="moderation">Moderation</TabsTrigger>
          <TabsTrigger value="recent">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Messages by Hour</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.messagesByHour}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="channels" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Channels by Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.topChannels.map((channel, index) => (
                  <div key={channel.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <div>
                        <h3 className="font-medium">{channel.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {channel.userCount} users active
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{channel.messageCount.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">messages</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="moderation" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Moderation Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.moderationActions}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      label={({ name, count }) => `${name}: ${count}`}
                    >
                      {stats.moderationActions.map((entry, index) => (
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
                <CardTitle>Moderation Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.moderationActions.map((action, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: action.color }}
                        />
                        <span>{action.type}</span>
                      </div>
                      <Badge variant="secondary">{action.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recent" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Activity</CardTitle>
                <Input
                  placeholder="Search activity..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.recentActivity
                  .filter(activity => 
                    activity.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    activity.channel.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant={
                            activity.type === 'moderation' ? 'destructive' :
                            activity.type === 'join' ? 'secondary' :
                            activity.type === 'leave' ? 'outline' : 'default'
                          }
                        >
                          {activity.type}
                        </Badge>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{activity.user}</span>
                            <span className="text-muted-foreground">in</span>
                            <span className="font-medium">{activity.channel}</span>
                          </div>
                          {activity.details && (
                            <p className="text-sm text-muted-foreground mt-1">{activity.details}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">{activity.timestamp}</div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
