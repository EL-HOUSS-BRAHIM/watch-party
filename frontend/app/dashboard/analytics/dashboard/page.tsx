'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Activity,
  Download,
  RefreshCw
} from 'lucide-react';
import { analyticsAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface AdminMetrics {
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalRevenue: number;
    totalVideos: number;
    totalParties: number;
    conversionRate: number;
    churnRate: number;
    avgSessionDuration: number;
  };
  trends: {
    userGrowth: Array<{ date: string; users: number; active: number }>;
    revenueGrowth: Array<{ date: string; revenue: number; subscriptions: number }>;
    contentMetrics: Array<{ date: string; videos: number; watchTime: number }>;
    partyMetrics: Array<{ date: string; parties: number; participants: number }>;
  };
  demographics: {
    ageGroups: Array<{ range: string; count: number; percentage: number }>;
    locations: Array<{ country: string; count: number; percentage: number }>;
    devices: Array<{ type: string; count: number; percentage: number }>;
    subscriptionTiers: Array<{ tier: string; count: number; revenue: number; color: string }>;
  };
  performance: {
    serverMetrics: Array<{ time: string; cpu: number; memory: number; requests: number }>;
    errorRates: Array<{ date: string; errors: number; total: number }>;
    loadTimes: Array<{ page: string; averageTime: number; p95Time: number }>;
  };
  retention: {
    cohorts: Array<{ cohort: string; week0: number; week1: number; week2: number; week4: number; week8: number }>;
    engagement: Array<{ date: string; dau: number; wau: number; mau: number }>;
  };
}

const COLORS = ['#2563eb', '#dc2626', '#16a34a', '#ca8a04', '#9333ea', '#c2410c', '#0891b2'];

export default function AdminAnalyticsDashboard() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30d');
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch real data from analytics API
      const [dashboardData, advancedData] = await Promise.all([
        analyticsAPI.getDashboard(timeframe),
        analyticsAPI.executeAdvancedQuery({
          metrics: ['users', 'revenue', 'videos', 'parties'],
          date_range: {
            start: new Date(Date.now() - (timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : timeframe === '90d' ? 90 : 365) * 24 * 60 * 60 * 1000).toISOString(),
            end: new Date().toISOString()
          },
          granularity: timeframe === '7d' ? 'day' : timeframe === '30d' ? 'day' : timeframe === '90d' ? 'week' : 'month'
        }),
        analyticsAPI.getRealtimeAnalytics()
      ]);

      // Transform API data to component format
  const performanceSource = (advancedData as Record<string, unknown>).performance || (dashboardData as Record<string, unknown>).performance || {}

  const transformedMetrics: AdminMetrics = {
        overview: {
          totalUsers: dashboardData.overview?.total_users || 0,
          activeUsers: dashboardData.overview?.active_users_today || 0,
          totalRevenue: (dashboardData.overview as Record<string, unknown>)?.total_revenue as number || 0,
          totalVideos: (dashboardData.overview as Record<string, unknown>)?.total_videos as number || 0,
          totalParties: dashboardData.overview?.total_parties || 0,
          conversionRate: (dashboardData.overview as Record<string, unknown>)?.conversion_rate as number || 0,
          churnRate: (dashboardData.overview as Record<string, unknown>)?.churn_rate as number || 0,
          avgSessionDuration: (dashboardData.overview as Record<string, unknown>)?.avg_session_duration as number || dashboardData.overview?.total_watch_time_hours || 0,
        },
        trends: {
          userGrowth: (advancedData as Record<string, unknown>).trends?.user_growth as Array<{ date: string; users: number; active: number }> || [],
          revenueGrowth: (advancedData as Record<string, unknown>).trends?.revenue_growth as Array<{ date: string; revenue: number; subscriptions: number }> || [],
          contentMetrics: (advancedData as Record<string, unknown>).trends?.content_metrics as Array<{ date: string; videos: number; watchTime: number }> || [],
          partyMetrics: (advancedData as Record<string, unknown>).trends?.party_metrics as Array<{ date: string; parties: number; participants: number }> || [],
        },
        demographics: {
          ageGroups: (dashboardData as Record<string, unknown>).demographics?.age_groups as Array<{ range: string; count: number; percentage: number }> || (advancedData as Record<string, unknown>).demographics?.age_groups as Array<{ range: string; count: number; percentage: number }> || [],
          locations: (dashboardData as Record<string, unknown>).demographics?.locations as Array<{ country: string; count: number; percentage: number }> || (advancedData as Record<string, unknown>).demographics?.locations as Array<{ country: string; count: number; percentage: number }> || [],
          devices: (dashboardData as Record<string, unknown>).demographics?.devices as Array<{ type: string; count: number; percentage: number }> || (advancedData as Record<string, unknown>).demographics?.devices as Array<{ type: string; count: number; percentage: number }> || [],
          subscriptionTiers: (dashboardData as Record<string, unknown>).demographics?.subscription_tiers as Array<{ tier: string; count: number; revenue: number; color: string }> || (advancedData as Record<string, unknown>).demographics?.subscription_tiers as Array<{ tier: string; count: number; revenue: number; color: string }> || [],
        },
        performance: {
          serverMetrics: (performanceSource as Record<string, unknown>).server_metrics as Array<{ time: string; cpu: number; memory: number; requests: number }> || [],
          errorRates: (performanceSource as Record<string, unknown>).error_rates as Array<{ date: string; errors: number; total: number }> || [],
          loadTimes: (performanceSource as Record<string, unknown>).load_times as Array<{ page: string; averageTime: number; p95Time: number }> || [],
        },
        retention: {
          cohorts: (dashboardData as Record<string, unknown>).retention?.cohorts as Array<{ cohort: string; week0: number; week1: number; week2: number; week4: number; week8: number }> || (advancedData as Record<string, unknown>).retention?.cohorts as Array<{ cohort: string; week0: number; week1: number; week2: number; week4: number; week8: number }> || [],
          engagement: (advancedData as Record<string, unknown>).retention?.engagement as Array<{ date: string; dau: number; wau: number; mau: number }> || (dashboardData as Record<string, unknown>).retention?.engagement as Array<{ date: string; dau: number; wau: number; mau: number }> || [],
        },
      };

      setMetrics(transformedMetrics);
    } catch (error) {
      console.error('Failed to fetch admin metrics:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [timeframe, toast]);

  const refreshData = async () => {
    setRefreshing(true);
    await fetchMetrics();
    setRefreshing(false);
  };

  const exportData = async () => {
    try {
      const exportResult = await analyticsAPI.exportAnalytics({
        format: 'json',
        date_range: timeframe,
        metrics: ['users', 'revenue', 'videos', 'parties', 'demographics', 'performance']
      });
      
      // Create download link from API response
      const link = document.createElement('a');
      link.href = exportResult.download_url;
      link.download = `admin-analytics-${timeframe}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Success",
        description: "Analytics data exported successfully.",
      });
    } catch (error) {
      console.error('Failed to export analytics:', error);
      toast({
        title: "Error",
        description: "Failed to export analytics data. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Failed to load analytics</h2>
          <Button onClick={fetchMetrics}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Analytics Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive platform insights and metrics</p>
        </div>
        <div className="flex gap-4">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={refreshData} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
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
            <div className="text-2xl font-bold">{metrics.overview.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{((metrics.overview.activeUsers / metrics.overview.totalUsers) * 100).toFixed(1)}%</span> active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.overview.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12.5%</span> from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.overview.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+0.8%</span> from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Session</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.overview.avgSessionDuration}m</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600">-2.1%</span> from last period
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="growth" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="growth">Growth</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="retention">Retention</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
        </TabsList>

        <TabsContent value="growth" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={metrics.trends.userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="users" stackId="1" stroke="#2563eb" fill="#2563eb" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="active" stackId="2" stroke="#16a34a" fill="#16a34a" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={metrics.retention.engagement}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="dau" stroke="#2563eb" name="Daily Active Users" />
                    <Line type="monotone" dataKey="wau" stroke="#16a34a" name="Weekly Active Users" />
                    <Line type="monotone" dataKey="mau" stroke="#ca8a04" name="Monthly Active Users" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={metrics.trends.revenueGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="revenue" stroke="#2563eb" fill="#2563eb" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subscription Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={metrics.demographics.subscriptionTiers}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="count"
                    >
                      {metrics.demographics.subscriptionTiers.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
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
              <CardTitle>Revenue by Subscription Tier</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.demographics.subscriptionTiers.map((tier) => (
                  <div key={tier.tier} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: tier.color }}
                      />
                      <div>
                        <div className="font-medium">{tier.tier}</div>
                        <div className="text-sm text-muted-foreground">
                          {tier.count.toLocaleString()} users
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${tier.revenue.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">
                        ${(tier.revenue / tier.count || 0).toFixed(2)} per user
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demographics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Age Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={metrics.demographics.ageGroups}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#2563eb" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Device Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={metrics.demographics.devices}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#2563eb"
                      dataKey="count"
                      label={({ type, percentage }) => `${type}: ${percentage}%`}
                    >
                      {metrics.demographics.devices.map((entry, index) => (
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
              <CardTitle>Geographic Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics.demographics.locations.map((location, index) => (
                  <div key={location.country} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{index + 1}</Badge>
                      <div>
                        <div className="font-medium">{location.country}</div>
                        <div className="text-sm text-muted-foreground">
                          {location.percentage}% of total users
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{location.count.toLocaleString()}</div>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${location.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Server Performance (24h)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={metrics.performance.serverMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="cpu" stroke="#dc2626" name="CPU %" />
                    <Line type="monotone" dataKey="memory" stroke="#2563eb" name="Memory %" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Error Rates</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={metrics.performance.errorRates}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="errors" stroke="#dc2626" fill="#dc2626" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Page Load Times</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.performance.loadTimes.map((page) => (
                  <div key={page.page} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">{page.page}</span>
                      <div className="text-sm text-muted-foreground">
                        Avg: {page.averageTime}s | P95: {page.p95Time}s
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(page.averageTime / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="retention" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cohort Retention Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Cohort</th>
                      <th className="text-center p-2">Week 0</th>
                      <th className="text-center p-2">Week 1</th>
                      <th className="text-center p-2">Week 2</th>
                      <th className="text-center p-2">Week 4</th>
                      <th className="text-center p-2">Week 8</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.retention.cohorts.map((cohort) => (
                      <tr key={cohort.cohort} className="border-b">
                        <td className="p-2 font-medium">{cohort.cohort}</td>
                        <td className="text-center p-2">
                          <div
                            className="inline-block px-2 py-1 rounded text-white text-sm"
                            style={{ backgroundColor: `hsl(${cohort.week0 * 1.2}, 70%, 50%)` }}
                          >
                            {cohort.week0}%
                          </div>
                        </td>
                        <td className="text-center p-2">
                          <div
                            className="inline-block px-2 py-1 rounded text-white text-sm"
                            style={{ backgroundColor: `hsl(${cohort.week1 * 1.2}, 70%, 50%)` }}
                          >
                            {cohort.week1}%
                          </div>
                        </td>
                        <td className="text-center p-2">
                          <div
                            className="inline-block px-2 py-1 rounded text-white text-sm"
                            style={{ backgroundColor: `hsl(${cohort.week2 * 1.2}, 70%, 50%)` }}
                          >
                            {cohort.week2}%
                          </div>
                        </td>
                        <td className="text-center p-2">
                          <div
                            className="inline-block px-2 py-1 rounded text-white text-sm"
                            style={{ backgroundColor: `hsl(${cohort.week4 * 1.2}, 70%, 50%)` }}
                          >
                            {cohort.week4}%
                          </div>
                        </td>
                        <td className="text-center p-2">
                          <div
                            className="inline-block px-2 py-1 rounded text-white text-sm"
                            style={{ backgroundColor: `hsl(${cohort.week8 * 1.2}, 70%, 50%)` }}
                          >
                            {cohort.week8}%
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={metrics.trends.contentMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="videos" stroke="#2563eb" fill="#2563eb" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Watch Time Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={metrics.trends.contentMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="watchTime" stroke="#16a34a" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Party Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={metrics.trends.partyMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="parties" fill="#9333ea" />
                  <Bar dataKey="participants" fill="#ca8a04" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
