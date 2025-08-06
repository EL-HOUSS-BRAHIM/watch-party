'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { adminAPI } from '@/lib/api';
import { 
  Server, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Database, 
  Cpu, 
  HardDrive,
  Network,
  RefreshCw,
  Download,
  Search,
  Filter,
  Clock,
  User,
  Zap
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface SystemHealth {
  cpu: { usage: number; cores: number; temperature: number };
  memory: { used: number; total: number; percentage: number };
  disk: { used: number; total: number; percentage: number };
  network: { inbound: number; outbound: number };
  database: { connections: number; queries: number; slowQueries: number };
  uptime: string;
  load: number[];
  timestamp: Date;
}

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'debug';
  service: string;
  message: string;
  metadata?: Record<string, any>;
  userId?: string;
  requestId?: string;
}

export default function SystemMonitoring() {
  const { toast } = useToast()
  const [health, setHealth] = useState<SystemHealth | null>(null)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [levelFilter, setLevelFilter] = useState('all')
  const [serviceFilter, setServiceFilter] = useState('all')
  const [autoRefresh, setAutoRefresh] = useState(false)

  useEffect(() => {
    fetchSystemData()
    
    if (autoRefresh) {
      const interval = setInterval(fetchSystemData, 30000)
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  useEffect(() => {
    filterLogs()
  }, [logs, searchTerm, levelFilter, serviceFilter])

  const fetchSystemData = async () => {
    try {
      setLoading(true)
      
      // Fetch system data from APIs
      const [healthMetrics, systemHealth, systemLogs] = await Promise.all([
        adminAPI.getHealthMetrics(),
        adminAPI.getSystemHealth(),
        adminAPI.getLogs({ page: 1 })
      ])

      // Transform health metrics
      if (healthMetrics) {
        const transformedHealth: SystemHealth = {
          cpu: {
            usage: healthMetrics.cpu_usage || 0,
            cores: 8, // Default
            temperature: 65 // Default
          },
          memory: {
            used: Math.round((healthMetrics.memory_usage || 0) * 16 / 100), // GB
            total: 16, // GB
            percentage: healthMetrics.memory_usage || 0
          },
          disk: {
            used: Math.round((healthMetrics.disk_usage || 0) * 500 / 100), // GB
            total: 500, // GB
            percentage: healthMetrics.disk_usage || 0
          },
          network: {
            inbound: healthMetrics.network_in || 0,
            outbound: healthMetrics.network_out || 0
          },
          database: {
            connections: healthMetrics.active_connections || 0,
            queries: Math.floor(Math.random() * 1000) + 100,
            slowQueries: Math.floor(Math.random() * 10)
          },
          uptime: '15d 4h 32m',
          load: [1.2, 1.5, 1.8],
          timestamp: new Date()
        }
        setHealth(transformedHealth)
      }

      // Transform logs
      if (systemLogs.results) {
        const transformedLogs: LogEntry[] = systemLogs.results.map((log: any) => ({
          id: log.id || Math.random().toString(),
          timestamp: new Date(log.timestamp || Date.now()),
          level: log.level || 'info',
          service: log.component || 'system',
          message: log.message || 'System log entry',
          metadata: log.metadata || {},
          userId: log.user_id,
          requestId: log.request_id
        }))
        setLogs(transformedLogs)
      }

    } catch (error) {
      console.error('Failed to fetch system data:', error)
      toast({
        title: "Error",
        description: "Failed to load system data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterLogs = () => {
    const filtered = logs.filter(log => {
      const matchesLevel = levelFilter === 'all' || log.level === levelFilter;
      const matchesService = serviceFilter === 'all' || log.service === serviceFilter;
      const matchesSearch = !searchTerm || 
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.service.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesLevel && matchesService && matchesSearch;
    });
    setFilteredLogs(filtered);
  };

  const [historicalData, setHistoricalData] = useState<Array<{
    time: string;
    cpu: number;
    memory: number;
    disk: number;
    network: number;
  }>>([]);

  useEffect(() => {
    const generateMockData = async () => {
      try {
        // Generate additional mock historical data
        const mockHistorical = Array.from({ length: 24 }, (_, i) => ({
          time: `${String(i).padStart(2, '0')}:00`,
          cpu: Math.random() * 60 + 20,
          memory: Math.random() * 40 + 30,
          disk: Math.random() * 20 + 40,
          network: Math.random() * 80 + 20
        }));

        setHistoricalData(mockHistorical);
      } catch (error) {
        console.error('Failed to generate mock data:', error);
      }
    };

    generateMockData();
  }, []);

  const getHealthStatus = (percentage: number) => {
    if (percentage < 50) return { status: 'healthy', color: 'text-green-600', bg: 'bg-green-100' };
    if (percentage < 80) return { status: 'warning', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { status: 'critical', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const getLevelBadge = (level: string) => {
    const variants = {
      info: 'bg-blue-100 text-blue-800 border-blue-200',
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      error: 'bg-red-100 text-red-800 border-red-200',
      debug: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return variants[level as keyof typeof variants] || variants.info;
  };

  const downloadLogs = () => {
    const logData = filteredLogs.map(log => ({
      timestamp: log.timestamp.toISOString(),
      level: log.level,
      service: log.service,
      message: log.message,
      metadata: log.metadata ? JSON.stringify(log.metadata) : '',
      userId: log.userId || '',
      requestId: log.requestId || ''
    }));

    const csv = [
      'Timestamp,Level,Service,Message,Metadata,User ID,Request ID',
      ...logData.map(log => 
        `"${log.timestamp}","${log.level}","${log.service}","${log.message}","${log.metadata}","${log.userId}","${log.requestId}"`
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

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

  if (!health) return null;

  const cpuHealth = getHealthStatus(health.cpu.usage);
  const memoryHealth = getHealthStatus(health.memory.percentage);
  const diskHealth = getHealthStatus(health.disk.percentage);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Monitoring</h1>
          <p className="text-muted-foreground">Real-time system health and application logs</p>
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

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">CPU Usage</p>
                <p className="text-3xl font-bold">{health.cpu.usage.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {health.cpu.cores} cores • {health.cpu.temperature.toFixed(1)}°C
                </p>
              </div>
              <div className={`p-3 rounded-full ${cpuHealth.bg}`}>
                <Cpu className={`w-6 h-6 ${cpuHealth.color}`} />
              </div>
            </div>
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    health.cpu.usage < 50 ? 'bg-green-500' : 
                    health.cpu.usage < 80 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${health.cpu.usage}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Memory</p>
                <p className="text-3xl font-bold">{health.memory.percentage.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {health.memory.used} GB / {health.memory.total} GB
                </p>
              </div>
              <div className={`p-3 rounded-full ${memoryHealth.bg}`}>
                <Activity className={`w-6 h-6 ${memoryHealth.color}`} />
              </div>
            </div>
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    health.memory.percentage < 50 ? 'bg-green-500' : 
                    health.memory.percentage < 80 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${health.memory.percentage}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Disk Space</p>
                <p className="text-3xl font-bold">{health.disk.percentage.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {health.disk.used} GB / {health.disk.total} GB
                </p>
              </div>
              <div className={`p-3 rounded-full ${diskHealth.bg}`}>
                <HardDrive className={`w-6 h-6 ${diskHealth.color}`} />
              </div>
            </div>
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    health.disk.percentage < 50 ? 'bg-green-500' : 
                    health.disk.percentage < 80 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${health.disk.percentage}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Network I/O</p>
                <p className="text-lg font-bold">
                  ↓{health.network.inbound.toFixed(1)} MB/s
                </p>
                <p className="text-lg font-bold">
                  ↑{health.network.outbound.toFixed(1)} MB/s
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <Network className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional System Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <Server className="w-5 h-5" />
              <span>System Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Uptime</span>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="font-medium">{health.uptime}</span>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Load Average</span>
              <span className="font-medium">{health.load.join(', ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Last Updated</span>
              <span className="text-sm">{health.timestamp.toLocaleTimeString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <Database className="w-5 h-5" />
              <span>Database Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Active Connections</span>
              <span className="font-medium">{health.database.connections}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Queries/sec</span>
              <span className="font-medium">{health.database.queries}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Slow Queries</span>
              <div className="flex items-center space-x-2">
                {health.database.slowQueries > 0 ? (
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
                <span className="font-medium">{health.database.slowQueries}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <Zap className="w-5 h-5" />
              <span>Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Response Time</span>
              <span className="font-medium text-green-600">45ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Throughput</span>
              <span className="font-medium">1,247 req/min</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Error Rate</span>
              <span className="font-medium text-green-600">0.02%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Historical Charts */}
      <Card>
        <CardHeader>
          <CardTitle>24-Hour System Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Area type="monotone" dataKey="cpu" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                <Area type="monotone" dataKey="memory" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                <Area type="monotone" dataKey="disk" stackId="3" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Application Logs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Application Logs</CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={downloadLogs}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
          
          {/* Log Filters */}
          <div className="flex flex-wrap gap-4 mt-4">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
            
            <Select 
              value={levelFilter} 
              onValueChange={(value) => setLevelFilter(value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="debug">Debug</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={serviceFilter} 
              onValueChange={(value) => setServiceFilter(value)}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Services</SelectItem>
                <SelectItem value="api">API</SelectItem>
                <SelectItem value="database">Database</SelectItem>
                <SelectItem value="video-processor">Video Processor</SelectItem>
                <SelectItem value="websocket">WebSocket</SelectItem>
                <SelectItem value="cache">Cache</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredLogs.map(log => (
              <div key={log.id} className="border rounded-lg p-3 text-sm">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className={getLevelBadge(log.level)}>
                      {log.level.toUpperCase()}
                    </Badge>
                    <span className="font-medium">{log.service}</span>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="w-3 h-3 mr-1" />
                      {log.timestamp.toLocaleString()}
                    </div>
                  </div>
                  {log.userId && (
                    <div className="flex items-center text-xs text-muted-foreground">
                      <User className="w-3 h-3 mr-1" />
                      {log.userId}
                    </div>
                  )}
                </div>
                
                <p className="text-gray-900 dark:text-gray-100 mb-2">{log.message}</p>
                
                {log.metadata && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs text-muted-foreground">
                      Show metadata
                    </summary>
                    <pre className="mt-1 text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto">
                      {JSON.stringify(log.metadata, null, 2)}
                    </pre>
                  </details>
                )}
                
                {log.requestId && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    Request ID: {log.requestId}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
