'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Zap, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Server,
  Database,
  Users,
  MessageSquare,
  Video,
  AlertTriangle,
  CheckCircle,
  Settings,
  Monitor,
  BarChart3,
  RefreshCw,
  Download,
  Upload,
  HardDrive,
  Cpu,
  MemoryStick,
  Network,
  Globe
} from 'lucide-react';

interface PerformanceMetric {
  name: string;
  current: number;
  previous: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  threshold: {
    warning: number;
    critical: number;
  };
}

interface SystemHealth {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  status: 'healthy' | 'warning' | 'critical';
}

interface EndpointMetric {
  endpoint: string;
  method: string;
  avgResponseTime: number;
  requests: number;
  errors: number;
  successRate: number;
}

export default function PerformanceMonitoring() {
  const [timeRange, setTimeRange] = useState('1h');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const [metrics, setMetrics] = useState<PerformanceMetric[]>([
    {
      name: 'Response Time',
      current: 245,
      previous: 278,
      unit: 'ms',
      trend: 'down',
      threshold: { warning: 500, critical: 1000 }
    },
    {
      name: 'Throughput',
      current: 1247,
      previous: 1156,
      unit: 'req/min',
      trend: 'up',
      threshold: { warning: 2000, critical: 3000 }
    },
    {
      name: 'Error Rate',
      current: 0.8,
      previous: 1.2,
      unit: '%',
      trend: 'down',
      threshold: { warning: 5, critical: 10 }
    },
    {
      name: 'Active Users',
      current: 1842,
      previous: 1698,
      unit: 'users',
      trend: 'up',
      threshold: { warning: 5000, critical: 8000 }
    },
    {
      name: 'Database Connections',
      current: 23,
      previous: 28,
      unit: 'connections',
      trend: 'down',
      threshold: { warning: 80, critical: 95 }
    },
    {
      name: 'Cache Hit Rate',
      current: 94.2,
      previous: 91.8,
      unit: '%',
      trend: 'up',
      threshold: { warning: 80, critical: 70 }
    }
  ]);

  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    cpu: 34,
    memory: 67,
    disk: 45,
    network: 12,
    status: 'healthy'
  });

  const [endpointMetrics, setEndpointMetrics] = useState<EndpointMetric[]>([
    {
      endpoint: '/api/auth/login',
      method: 'POST',
      avgResponseTime: 156,
      requests: 2340,
      errors: 12,
      successRate: 99.5
    },
    {
      endpoint: '/api/parties/create',
      method: 'POST',
      avgResponseTime: 234,
      requests: 890,
      errors: 3,
      successRate: 99.7
    },
    {
      endpoint: '/api/videos/upload',
      method: 'POST',
      avgResponseTime: 1250,
      requests: 456,
      errors: 8,
      successRate: 98.2
    },
    {
      endpoint: '/api/chat/messages',
      method: 'GET',
      avgResponseTime: 89,
      requests: 5670,
      errors: 15,
      successRate: 99.7
    },
    {
      endpoint: '/api/users/profile',
      method: 'GET',
      avgResponseTime: 123,
      requests: 3240,
      errors: 5,
      successRate: 99.8
    }
  ]);

  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: 'warning',
      message: 'High memory usage detected on server-2',
      timestamp: new Date(Date.now() - 300000),
      resolved: false
    },
    {
      id: 2,
      type: 'info',
      message: 'Scheduled maintenance completed successfully',
      timestamp: new Date(Date.now() - 1800000),
      resolved: true
    },
    {
      id: 3,
      type: 'critical',
      message: 'Database connection pool exhausted',
      timestamp: new Date(Date.now() - 600000),
      resolved: true
    }
  ]);

  // Simulate real-time updates
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Update metrics with random variations
      setMetrics(prev => prev.map(metric => ({
        ...metric,
        previous: metric.current,
        current: Math.max(0, metric.current + (Math.random() - 0.5) * metric.current * 0.1)
      })));

      // Update system health
      setSystemHealth(prev => ({
        ...prev,
        cpu: Math.max(0, Math.min(100, prev.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.max(0, Math.min(100, prev.memory + (Math.random() - 0.5) * 8)),
        disk: Math.max(0, Math.min(100, prev.disk + (Math.random() - 0.5) * 5)),
        network: Math.max(0, Math.min(100, prev.network + (Math.random() - 0.5) * 15))
      }));

      setLastUpdated(new Date());
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const getMetricStatus = (metric: PerformanceMetric) => {
    if (metric.current >= metric.threshold.critical) return 'critical';
    if (metric.current >= metric.threshold.warning) return 'warning';
    return 'healthy';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800 border-green-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getSystemHealthStatus = () => {
    const avgUsage = (systemHealth.cpu + systemHealth.memory + systemHealth.disk) / 3;
    if (avgUsage > 80) return 'critical';
    if (avgUsage > 60) return 'warning';
    return 'healthy';
  };

  const exportMetrics = () => {
    const data = {
      timestamp: new Date().toISOString(),
      timeRange,
      metrics,
      systemHealth,
      endpointMetrics,
      alerts: alerts.filter(a => !a.resolved)
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-metrics-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance Monitoring</h1>
          <p className="text-muted-foreground">
            Real-time system performance and health metrics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={exportMetrics}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={() => setLastUpdated(new Date())}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Label htmlFor="auto-refresh">Auto Refresh</Label>
                <Switch
                  id="auto-refresh"
                  checked={autoRefresh}
                  onCheckedChange={setAutoRefresh}
                />
              </div>
              {autoRefresh && (
                <Select value={refreshInterval.toString()} onValueChange={(v) => setRefreshInterval(parseInt(v))}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 seconds</SelectItem>
                    <SelectItem value="15">15 seconds</SelectItem>
                    <SelectItem value="30">30 seconds</SelectItem>
                    <SelectItem value="60">1 minute</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5m">Last 5 min</SelectItem>
                  <SelectItem value="15m">Last 15 min</SelectItem>
                  <SelectItem value="1h">Last 1 hour</SelectItem>
                  <SelectItem value="6h">Last 6 hours</SelectItem>
                  <SelectItem value="24h">Last 24 hours</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric) => {
          const status = getMetricStatus(metric);
          const change = metric.current - metric.previous;
          const changePercent = metric.previous === 0 ? 0 : (change / metric.previous) * 100;
          
          return (
            <Card key={metric.name}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">{metric.name}</h3>
                  <Badge variant="outline" className={getStatusBadge(status)}>
                    {status}
                  </Badge>
                </div>
                
                <div className="flex items-end justify-between mb-2">
                  <div>
                    <p className={`text-3xl font-bold ${getStatusColor(status)}`}>
                      {metric.current.toFixed(metric.unit === '%' ? 1 : 0)}
                    </p>
                    <p className="text-sm text-muted-foreground">{metric.unit}</p>
                  </div>
                  <div className="flex items-center space-x-1 text-sm">
                    {getTrendIcon(metric.trend)}
                    <span className={changePercent >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {Math.abs(changePercent).toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Warning: {metric.threshold.warning}{metric.unit}</span>
                    <span>Critical: {metric.threshold.critical}{metric.unit}</span>
                  </div>
                  <Progress 
                    value={(metric.current / metric.threshold.critical) * 100} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="system" className="space-y-6">
        <TabsList>
          <TabsTrigger value="system">System Health</TabsTrigger>
          <TabsTrigger value="endpoints">API Endpoints</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="logs">Performance Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Monitor className="w-5 h-5" />
                <span>System Health Overview</span>
                <Badge variant="outline" className={getStatusBadge(getSystemHealthStatus())}>
                  {getSystemHealthStatus()}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Cpu className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">CPU Usage</span>
                    </div>
                    <span className="text-sm font-semibold">{systemHealth.cpu.toFixed(1)}%</span>
                  </div>
                  <Progress value={systemHealth.cpu} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MemoryStick className="w-4 h-4 text-green-600" />
                      <span className="font-medium">Memory</span>
                    </div>
                    <span className="text-sm font-semibold">{systemHealth.memory.toFixed(1)}%</span>
                  </div>
                  <Progress value={systemHealth.memory} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <HardDrive className="w-4 h-4 text-purple-600" />
                      <span className="font-medium">Disk Usage</span>
                    </div>
                    <span className="text-sm font-semibold">{systemHealth.disk.toFixed(1)}%</span>
                  </div>
                  <Progress value={systemHealth.disk} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Network className="w-4 h-4 text-orange-600" />
                      <span className="font-medium">Network I/O</span>
                    </div>
                    <span className="text-sm font-semibold">{systemHealth.network.toFixed(1)}%</span>
                  </div>
                  <Progress value={systemHealth.network} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endpoints">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="w-5 h-5" />
                <span>API Endpoint Performance</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {endpointMetrics.map((endpoint, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          {endpoint.method}
                        </Badge>
                        <code className="text-sm font-mono">{endpoint.endpoint}</code>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={endpoint.successRate >= 99 ? 'text-green-600' : 
                                   endpoint.successRate >= 95 ? 'text-yellow-600' : 'text-red-600'}
                      >
                        {endpoint.successRate.toFixed(1)}% success
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Avg Response</p>
                        <p className="font-semibold">{endpoint.avgResponseTime}ms</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Requests</p>
                        <p className="font-semibold">{endpoint.requests.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Errors</p>
                        <p className="font-semibold text-red-600">{endpoint.errors}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Error Rate</p>
                        <p className="font-semibold">
                          {((endpoint.errors / endpoint.requests) * 100).toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5" />
                <span>System Alerts</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div 
                    key={alert.id} 
                    className={`border rounded-lg p-4 ${
                      alert.resolved ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {alert.type === 'critical' && (
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                        )}
                        {alert.type === 'warning' && (
                          <AlertTriangle className="w-5 h-5 text-yellow-600" />
                        )}
                        {alert.type === 'info' && (
                          <CheckCircle className="w-5 h-5 text-blue-600" />
                        )}
                        <div>
                          <p className="font-medium">{alert.message}</p>
                          <p className="text-sm text-muted-foreground">
                            {alert.timestamp.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={alert.resolved ? 'text-green-600' : 'text-red-600'}
                      >
                        {alert.resolved ? 'Resolved' : 'Active'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Performance Logs</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Input placeholder="Filter logs..." className="flex-1" />
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export Logs
                  </Button>
                </div>
                
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 font-mono text-sm space-y-1 max-h-64 overflow-y-auto">
                  <div className="text-green-600">[INFO] 2024-01-15 10:30:45 - System health check completed successfully</div>
                  <div className="text-yellow-600">[WARN] 2024-01-15 10:29:12 - High memory usage detected on server-2 (67%)</div>
                  <div className="text-blue-600">[INFO] 2024-01-15 10:28:33 - Database connection pool optimized</div>
                  <div className="text-red-600">[ERROR] 2024-01-15 10:27:55 - API endpoint /api/videos/upload exceeded response time threshold</div>
                  <div className="text-green-600">[INFO] 2024-01-15 10:27:12 - Cache hit rate improved to 94.2%</div>
                  <div className="text-blue-600">[INFO] 2024-01-15 10:26:45 - Auto-scaling triggered: Added 2 new instances</div>
                  <div className="text-yellow-600">[WARN] 2024-01-15 10:25:33 - Disk usage on primary server reaching 80%</div>
                  <div className="text-green-600">[INFO] 2024-01-15 10:24:12 - Performance optimization completed</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
