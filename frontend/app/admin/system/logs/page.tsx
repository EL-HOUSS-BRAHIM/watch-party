'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  Monitor, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Database, 
  Server, 
  Cpu, 
  HardDrive,
  Network,
  Users,
  Download,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Bug,
  Info,
  AlertCircle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { toast } from '@/hooks/use-toast';

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'debug' | 'info' | 'warning' | 'error' | 'critical';
  service: string;
  message: string;
  details?: any;
  userId?: string;
  ip?: string;
  userAgent?: string;
  duration?: number;
  statusCode?: number;
}

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  threshold: { warning: number; critical: number };
}

interface ServiceStatus {
  name: string;
  status: 'online' | 'degraded' | 'offline';
  uptime: number;
  responseTime: number;
  lastCheck: Date;
  healthCheck: string;
}

const mockLogs: LogEntry[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 300000),
    level: 'error',
    service: 'authentication',
    message: 'Failed login attempt for user@example.com',
    details: { reason: 'invalid_password', attempts: 3 },
    userId: 'user123',
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0...',
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 600000),
    level: 'warning',
    service: 'video-processing',
    message: 'Video processing took longer than expected',
    details: { videoId: 'vid_789', duration: 45000 },
    duration: 45000,
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 900000),
    level: 'info',
    service: 'api',
    message: 'New user registration completed',
    details: { userId: 'user456' },
    statusCode: 201,
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 1200000),
    level: 'critical',
    service: 'database',
    message: 'Database connection pool exhausted',
    details: { activeConnections: 100, maxConnections: 100 },
  },
  {
    id: '5',
    timestamp: new Date(Date.now() - 1500000),
    level: 'debug',
    service: 'websocket',
    message: 'Client connected to room',
    details: { roomId: 'room123', clientId: 'client456' },
  },
];

const mockMetrics: SystemMetric[] = [
  {
    name: 'CPU Usage',
    value: 65,
    unit: '%',
    status: 'warning',
    trend: 'up',
    threshold: { warning: 70, critical: 90 },
  },
  {
    name: 'Memory Usage',
    value: 78,
    unit: '%',
    status: 'warning',
    trend: 'stable',
    threshold: { warning: 80, critical: 95 },
  },
  {
    name: 'Disk Usage',
    value: 45,
    unit: '%',
    status: 'healthy',
    trend: 'up',
    threshold: { warning: 80, critical: 95 },
  },
  {
    name: 'Network I/O',
    value: 234,
    unit: 'MB/s',
    status: 'healthy',
    trend: 'stable',
    threshold: { warning: 500, critical: 800 },
  },
  {
    name: 'Database Connections',
    value: 67,
    unit: 'active',
    status: 'healthy',
    trend: 'down',
    threshold: { warning: 80, critical: 95 },
  },
  {
    name: 'Response Time',
    value: 127,
    unit: 'ms',
    status: 'healthy',
    trend: 'stable',
    threshold: { warning: 200, critical: 500 },
  },
];

const mockServices: ServiceStatus[] = [
  {
    name: 'Web Server',
    status: 'online',
    uptime: 99.9,
    responseTime: 45,
    lastCheck: new Date(Date.now() - 30000),
    healthCheck: '/health',
  },
  {
    name: 'Database',
    status: 'online',
    uptime: 99.8,
    responseTime: 12,
    lastCheck: new Date(Date.now() - 30000),
    healthCheck: 'SELECT 1',
  },
  {
    name: 'Redis Cache',
    status: 'online',
    uptime: 100,
    responseTime: 3,
    lastCheck: new Date(Date.now() - 30000),
    healthCheck: 'PING',
  },
  {
    name: 'Video Processing',
    status: 'degraded',
    uptime: 97.5,
    responseTime: 234,
    lastCheck: new Date(Date.now() - 30000),
    healthCheck: '/process/health',
  },
  {
    name: 'Email Service',
    status: 'offline',
    uptime: 0,
    responseTime: 0,
    lastCheck: new Date(Date.now() - 30000),
    healthCheck: '/smtp/health',
  },
];

const performanceData = Array.from({ length: 24 }, (_, i) => ({
  time: `${23 - i}:00`,
  cpu: Math.floor(Math.random() * 40) + 40,
  memory: Math.floor(Math.random() * 30) + 50,
  network: Math.floor(Math.random() * 200) + 100,
  requests: Math.floor(Math.random() * 1000) + 500,
}));

export default function SystemLogsMonitoring() {
  const [logs, setLogs] = useState<LogEntry[]>(mockLogs);
  const [metrics, setMetrics] = useState<SystemMetric[]>(mockMetrics);
  const [services, setServices] = useState<ServiceStatus[]>(mockServices);
  const [selectedTab, setSelectedTab] = useState('logs');
  const [logFilter, setLogFilter] = useState({
    level: 'all',
    service: 'all',
    search: '',
    timeRange: '1h',
  });
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        // Simulate new log entries
        const newLog: LogEntry = {
          id: Date.now().toString(),
          timestamp: new Date(),
          level: ['info', 'warning', 'error'][Math.floor(Math.random() * 3)] as any,
          service: ['api', 'database', 'websocket', 'video-processing'][Math.floor(Math.random() * 4)],
          message: 'System activity detected',
          details: { automated: true },
        };
        
        setLogs(prev => [newLog, ...prev.slice(0, 99)]); // Keep last 100 logs
        
        // Update metrics
        setMetrics(prev => prev.map(metric => ({
          ...metric,
          value: Math.max(0, metric.value + (Math.random() - 0.5) * 5),
        })));
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const filteredLogs = logs.filter(log => {
    if (logFilter.level !== 'all' && log.level !== logFilter.level) return false;
    if (logFilter.service !== 'all' && log.service !== logFilter.service) return false;
    if (logFilter.search && !log.message.toLowerCase().includes(logFilter.search.toLowerCase())) return false;
    
    const timeThreshold = {
      '15m': 15 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '4h': 4 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
    }[logFilter.timeRange] || 60 * 60 * 1000;
    
    if (Date.now() - log.timestamp.getTime() > timeThreshold) return false;
    
    return true;
  });

  const getLevelBadge = (level: LogEntry['level']) => {
    const variants = {
      debug: 'secondary',
      info: 'default',
      warning: 'default',
      error: 'destructive',
      critical: 'destructive',
    } as const;

    const colors = {
      debug: 'text-gray-600',
      info: 'text-blue-600',
      warning: 'text-orange-600',
      error: 'text-red-600',
      critical: 'text-red-800',
    };

    return (
      <Badge variant={variants[level]} className={colors[level]}>
        {level.toUpperCase()}
      </Badge>
    );
  };

  const getLevelIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'debug': return <Bug className="h-4 w-4 text-gray-500" />;
      case 'info': return <Info className="h-4 w-4 text-blue-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'critical': return <AlertCircle className="h-4 w-4 text-red-700" />;
    }
  };

  const getStatusBadge = (status: ServiceStatus['status']) => {
    const variants = {
      online: 'default',
      degraded: 'default',
      offline: 'destructive',
    } as const;

    const colors = {
      online: 'text-green-600',
      degraded: 'text-orange-600',
      offline: 'text-red-600',
    };

    return (
      <Badge variant={variants[status]} className={colors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getMetricStatus = (metric: SystemMetric) => {
    if (metric.value >= metric.threshold.critical) return 'critical';
    if (metric.value >= metric.threshold.warning) return 'warning';
    return 'healthy';
  };

  const exportLogs = () => {
    const csvContent = [
      'Timestamp,Level,Service,Message,Details',
      ...filteredLogs.map(log => 
        `${log.timestamp.toISOString()},${log.level},${log.service},"${log.message}","${JSON.stringify(log.details || {})}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Logs Exported",
      description: "System logs have been exported to CSV file.",
    });
  };

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  const getTrendIcon = (trend: SystemMetric['trend']) => {
    switch (trend) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      case 'stable': return '→';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">System Monitoring</h1>
          <p className="text-muted-foreground">
            Monitor system performance, logs, and service health
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Switch
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
            />
            <span className="text-sm">Auto-refresh</span>
          </div>
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="logs">System Logs</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-4">
          {/* Log Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label>Level</Label>
                  <Select value={logFilter.level} onValueChange={(value) => setLogFilter({...logFilter, level: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="debug">Debug</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Service</Label>
                  <Select value={logFilter.service} onValueChange={(value) => setLogFilter({...logFilter, service: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Services</SelectItem>
                      <SelectItem value="api">API</SelectItem>
                      <SelectItem value="database">Database</SelectItem>
                      <SelectItem value="websocket">WebSocket</SelectItem>
                      <SelectItem value="authentication">Authentication</SelectItem>
                      <SelectItem value="video-processing">Video Processing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Time Range</Label>
                  <Select value={logFilter.timeRange} onValueChange={(value) => setLogFilter({...logFilter, timeRange: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15m">Last 15 minutes</SelectItem>
                      <SelectItem value="1h">Last hour</SelectItem>
                      <SelectItem value="4h">Last 4 hours</SelectItem>
                      <SelectItem value="24h">Last 24 hours</SelectItem>
                      <SelectItem value="7d">Last 7 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Search</Label>
                  <Input
                    placeholder="Search logs..."
                    value={logFilter.search}
                    onChange={(e) => setLogFilter({...logFilter, search: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>&nbsp;</Label>
                  <Button onClick={exportLogs} className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Logs List */}
          <Card>
            <CardHeader>
              <CardTitle>
                System Logs ({filteredLogs.length} entries)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => setSelectedLog(log)}
                  >
                    <div className="flex-shrink-0 mt-1">
                      {getLevelIcon(log.level)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-mono text-muted-foreground">
                          {formatTimestamp(log.timestamp)}
                        </span>
                        {getLevelBadge(log.level)}
                        <Badge variant="outline">{log.service}</Badge>
                      </div>
                      <p className="text-sm">{log.message}</p>
                      {log.details && (
                        <p className="text-xs text-muted-foreground mt-1 font-mono">
                          {JSON.stringify(log.details, null, 2).slice(0, 100)}
                          {JSON.stringify(log.details).length > 100 && '...'}
                        </p>
                      )}
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          {/* System Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.map((metric) => (
              <Card key={metric.name}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{metric.name}</span>
                    <span className="text-xs">{getTrendIcon(metric.trend)}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{metric.value.toFixed(1)}</span>
                    <span className="text-sm text-muted-foreground">{metric.unit}</span>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          getMetricStatus(metric) === 'critical'
                            ? 'bg-red-500'
                            : getMetricStatus(metric) === 'warning'
                            ? 'bg-orange-500'
                            : 'bg-green-500'
                        }`}
                        style={{
                          width: `${Math.min(100, (metric.value / metric.threshold.critical) * 100)}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>0</span>
                      <span>{metric.threshold.critical}{metric.unit}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          {/* Service Status */}
          <div className="grid gap-4">
            {services.map((service) => (
              <Card key={service.name}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {service.status === 'online' && <CheckCircle className="h-5 w-5 text-green-500" />}
                        {service.status === 'degraded' && <AlertTriangle className="h-5 w-5 text-orange-500" />}
                        {service.status === 'offline' && <XCircle className="h-5 w-5 text-red-500" />}
                        <h3 className="font-semibold">{service.name}</h3>
                      </div>
                      {getStatusBadge(service.status)}
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <div className="font-medium">{service.uptime}%</div>
                        <div className="text-xs text-muted-foreground">Uptime</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{service.responseTime}ms</div>
                        <div className="text-xs text-muted-foreground">Response</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{formatTimestamp(service.lastCheck)}</div>
                        <div className="text-xs text-muted-foreground">Last Check</div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Health Check: {service.healthCheck}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          {/* Performance Charts */}
          <Card>
            <CardHeader>
              <CardTitle>System Performance (Last 24 Hours)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium mb-3">CPU & Memory Usage</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="cpu" stroke="#8884d8" strokeWidth={2} />
                      <Line type="monotone" dataKey="memory" stroke="#82ca9d" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-3">Network & Requests</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="network" stackId="1" stroke="#ffc658" fill="#ffc658" />
                      <Area type="monotone" dataKey="requests" stackId="2" stroke="#ff7300" fill="#ff7300" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Log Details</CardTitle>
                <Button variant="ghost" onClick={() => setSelectedLog(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Timestamp</Label>
                  <p className="font-mono text-sm">{selectedLog.timestamp.toISOString()}</p>
                </div>
                <div>
                  <Label>Level</Label>
                  <div className="mt-1">{getLevelBadge(selectedLog.level)}</div>
                </div>
                <div>
                  <Label>Service</Label>
                  <Badge variant="outline" className="mt-1">{selectedLog.service}</Badge>
                </div>
                {selectedLog.userId && (
                  <div>
                    <Label>User ID</Label>
                    <p className="font-mono text-sm">{selectedLog.userId}</p>
                  </div>
                )}
              </div>

              <div>
                <Label>Message</Label>
                <p className="mt-1 p-3 bg-muted rounded-lg">{selectedLog.message}</p>
              </div>

              {selectedLog.details && (
                <div>
                  <Label>Details</Label>
                  <pre className="mt-1 p-3 bg-muted rounded-lg text-xs overflow-x-auto">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.ip && (
                <div>
                  <Label>IP Address</Label>
                  <p className="font-mono text-sm">{selectedLog.ip}</p>
                </div>
              )}

              {selectedLog.userAgent && (
                <div>
                  <Label>User Agent</Label>
                  <p className="text-xs text-muted-foreground">{selectedLog.userAgent}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
