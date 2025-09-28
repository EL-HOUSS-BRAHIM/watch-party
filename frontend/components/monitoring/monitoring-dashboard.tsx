"use client"

import { Activity, AlertTriangle, Bell, Check, CheckCircle, Clock, Download, Eye, Refresh, Server, Settings, Wifi, X, XCircle } from "lucide-react"
import { Label } from "@/components/ui/label"
import { useState, useEffect , useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"


  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface SystemMetric {}
  name: string
  value: number
  unit: string
  status: "healthy" | "warning" | "critical"
  threshold: number
  trend: "up" | "down" | "stable"
}

interface LogEntry {
  id: string
  timestamp: string
  level: "info" | "warn" | "error" | "debug"
  service: string
  message: string
  metadata?: Record<string, any>
}

interface Alert {}
  id: string
  title: string
  description: string
  severity: "low" | "medium" | "high" | "critical"
  status: "active" | "acknowledged" | "resolved"
  timestamp: string
  service: string
  metric?: string
}

interface Service {}
  id: string
  name: string
  status: "healthy" | "degraded" | "down"
  uptime: number
  responseTime: number
  errorRate: number
  lastCheck: string
  version: string
}

const mockMetrics: SystemMetric[] = []
  {}
    name: "CPU Usage",
    value: 45,
    unit: "%",
    status: "healthy",
    threshold: 80,
    trend: "stable",
  },
  {}
    name: "Memory Usage",
    value: 72,
    unit: "%",
    status: "warning",
    threshold: 85,
    trend: "up",
  },
  {}
    name: "Disk Usage",
    value: 34,
    unit: "%",
    status: "healthy",
    threshold: 90,
    trend: "down",
  },
  {}
    name: "Network I/O",
    value: 28,
    unit: "MB/s",
    status: "healthy",
    threshold: 100,
    trend: "stable",
  },
]

const mockLogs: LogEntry[] = []
  {}
    id: "1",
    timestamp: "2024-01-28T11:30:00Z",
    level: "error",
    service: "api-server",
    message: "Database connection timeout",
    metadata: { query: "SELECT * FROM users", duration: "5000ms" },
  },
  {}
    id: "2",
    timestamp: "2024-01-28T11:29:45Z",
    level: "warn",
    service: "auth-service",
    message: "High number of failed login attempts",
    metadata: { attempts: 15, ip: "192.168.1.100" },
  },
  {}
    id: "3",
    timestamp: "2024-01-28T11:29:30Z",
    level: "info",
    service: "video-processor",
    message: "Video processing completed successfully",
    metadata: { videoId: "abc123", duration: "2.5s" },
  },
]

const mockAlerts: Alert[] = []
  {}
    id: "1",
    title: "High Memory Usage",
    description: "Memory usage has exceeded 70% for the last 10 minutes",
    severity: "medium",
    status: "active",
    timestamp: "2024-01-28T11:25:00Z",
    service: "api-server",
    metric: "memory",
  },
  {}
    id: "2",
    title: "Database Connection Issues",
    description: "Multiple database connection timeouts detected",
    severity: "high",
    status: "acknowledged",
    timestamp: "2024-01-28T11:20:00Z",
    service: "database",
    metric: "connections",
  },
]

const mockServices: Service[] = []
  {}
    id: "1",
    name: "API Server",
    status: "healthy",
    uptime: 99.9,
    responseTime: 145,
    errorRate: 0.02,
    lastCheck: "2024-01-28T11:30:00Z",
    version: "2.1.3",
  },
  {}
    id: "2",
    name: "Auth Service",
    status: "degraded",
    uptime: 98.5,
    responseTime: 280,
    errorRate: 0.15,
    lastCheck: "2024-01-28T11:30:00Z",
    version: "1.8.2",
  },
  {}
    id: "3",
    name: "Video Processor",
    status: "healthy",
    uptime: 99.7,
    responseTime: 95,
    errorRate: 0.01,
    lastCheck: "2024-01-28T11:30:00Z",
    version: "3.2.1",
  },
]

const performanceData = Array.from({ length: 24 }, (_, i) => ({}
  time: `${String(i).padStart(2, "0")}:00`,
  cpu: Math.random() * 30 + 30,
  memory: Math.random() * 20 + 60,
  network: Math.random() * 50 + 20,
  requests: Math.floor(Math.random() * 1000) + 500,
}))

export function MonitoringDashboard() {
  const [metrics, setMetrics] = useState<SystemMetric[]>(mockMetrics)
  const [logs, setLogs] = useState<LogEntry[]>(mockLogs)
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts)
  const [services, setServices] = useState<Service[]>(mockServices)
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
  const [alertDialogOpen, setAlertDialogOpen] = useState(false)
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false)
  const [logFilter, setLogFilter] = useState<string>("all")
  const [alertFilter, setAlertFilter] = useState<string>("all")
  const [isRealTime, setIsRealTime] = useState(true)

  // Simulate real-time updates
  useEffect(() => {
    if (!isRealTime) return
    const interval = setInterval(() => {}
      setMetrics((prev) =>
        prev.map((metric) => ({}
          ...metric,
          value: Math.max(0, Math.min(100, metric.value + (Math.random() - 0.5) * 10)),
        })),
      )
    }, 5000)

    return () => clearInterval(interval)
  }, [isRealTime])

  const acknowledgeAlert = (alertId: string) => {}
    setAlerts((prev) => prev.map((alert) => (alert.id === alertId ? { ...alert, status: "acknowledged" } : alert)))
  }

  const resolveAlert = (alertId: string) => {}
    setAlerts((prev) => prev.map((alert) => (alert.id === alertId ? { ...alert, status: "resolved" } : alert)))
  }

  const getStatusColor = (status: string) => {}
    switch (status) {
      case "healthy":
        return "text-green-600"
      case "warning":
      case "degraded":
        return "text-yellow-600"
      case "critical":
      case "down":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const getStatusIcon = (status: string) => {}
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "warning":
      case "degraded":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "critical":
      case "down":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getLogLevelColor = (level: string) => {}
    switch (level) {
      case "error":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "warn":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "info":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "debug":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getSeverityColor = (severity: string) => {}
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const filteredLogs = logs.filter((log) => logFilter === "all" || log.level === logFilter)
  const filteredAlerts = alerts.filter((alert) => alertFilter === "all" || alert.severity === alertFilter)

  const activeAlerts = alerts.filter((alert) => alert.status === "active").length
  const criticalAlerts = alerts.filter((alert) => alert.severity === "critical" && alert.status === "active").length
  const healthyServices = services.filter((service) => service.status === "healthy").length
  const avgResponseTime = Math.round(services.reduce((sum, service) => sum + service.responseTime, 0) / services.length)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">System Monitoring</h1>
          <p className="text-gray-600 dark:text-gray-400">Real-time monitoring, logging, and alerting</p>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => setSettingsDialogOpen(true)} variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Button onClick={() => setIsRealTime(!isRealTime)} variant={isRealTime ? "default" : "outline"}>
            <Activity className="mr-2 h-4 w-4" />
            {isRealTime ? "Live" : "Paused"}
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {Math.round((healthyServices / services.length) * 100)}%
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {healthyServices}/{services.length} services healthy
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${activeAlerts > 0 ? "text-red-600" : "text-green-600"}`}>"
              {activeAlerts}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">{criticalAlerts} critical</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgResponseTime}ms</div>
            <div className="flex items-center text-xs text-muted-foreground">Across all services</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">0.05%</div>
            <div className="flex items-center text-xs text-muted-foreground">Last 24 hours</div>
          </CardContent>
        </Card>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <Card key={metric.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
              {metric.name.includes("CPU") && <Cpu className="h-4 w-4 text-muted-foreground" />}
              {metric.name.includes("Memory") && <MemoryStick className="h-4 w-4 text-muted-foreground" />}
              {metric.name.includes("Disk") && <HardDrive className="h-4 w-4 text-muted-foreground" />}
              {metric.name.includes("Network") && <Wifi className="h-4 w-4 text-muted-foreground" />}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getStatusColor(metric.status)}`}>
                {metric.value.toFixed(1)}
                {metric.unit}
              </div>
              <div className="mt-2">
                <Progress value={metric.value} className="h-2" />
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                <span>
                  Threshold: {metric.threshold}
                  {metric.unit}
                </span>
                <span className="capitalize">{metric.trend}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Performance</CardTitle>
              <CardDescription>Real-time system metrics over the last 24 hours</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="cpu" stroke="#6366f1" name="CPU %" />
                  <Line type="monotone" dataKey="memory" stroke="#8b5cf6" name="Memory %" />
                  <Line type="monotone" dataKey="network" stroke="#06b6d4" name="Network MB/s" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Alerts</CardTitle>
                <CardDescription>Latest system alerts and notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alerts.slice(0, 5).map((alert) => (
                    <div key={alert.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 dark:bg-red-900">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{alert.title}</h4>
                        <p className="text-sm text-muted-foreground">{alert.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(alert.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Service Status</CardTitle>
                <CardDescription>Current status of all services</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {services.map((service) => (
                    <div key={service.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(service.status)}
                        <div>
                          <h4 className="font-medium">{service.name}</h4>
                          <p className="text-sm text-muted-foreground">v{service.version}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{service.uptime}% uptime</p>
                        <p className="text-sm text-muted-foreground">{service.responseTime}ms</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Services */}
        <TabsContent value="services" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Service Health</CardTitle>
              <CardDescription>Monitor the health and performance of all services</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Uptime</TableHead>
                    <TableHead>Response Time</TableHead>
                    <TableHead>Error Rate</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Last Check</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell className="font-medium">{service.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(service.status)}
                          <span className={`capitalize ${getStatusColor(service.status)}`}>{service.status}</span>
                        </div>
                      </TableCell>
                      <TableCell>{service.uptime}%</TableCell>
                      <TableCell>{service.responseTime}ms</TableCell>
                      <TableCell>{service.errorRate}%</TableCell>
                      <TableCell>v{service.version}</TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {new Date(service.lastCheck).toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts */}
        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>System Alerts</CardTitle>
                  <CardDescription>Manage and respond to system alerts</CardDescription>
                </div>
                <Select value={alertFilter} onValueChange={setAlertFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{alert.title}</h4>
                        <Badge className={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
                        <Badge variant="outline" className="capitalize">
                          {alert.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{alert.description}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{alert.service}</span>
                        <span>•</span>
                        <span>{new Date(alert.timestamp).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {alert.status === "active" && (
                        <Button size="sm" onClick={() => acknowledgeAlert(alert.id)}>
                          Acknowledge
                        </Button>
                      )}
                      {alert.status !== "resolved" && (
                        <Button size="sm" variant="outline" onClick={() => resolveAlert(alert.id)}>
                          Resolve
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {}
                          setSelectedAlert(alert)
                          setAlertDialogOpen(true)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logs */}
        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>System Logs</CardTitle>
                  <CardDescription>Real-time application logs and events</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={logFilter} onValueChange={setLogFilter}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="warn">Warning</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="debug">Debug</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm" variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {filteredLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-3 p-3 border rounded-lg font-mono text-sm">
                      <Badge className={getLogLevelColor(log.level)}>{log.level.toUpperCase()}</Badge>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</span>
                          <span className="font-medium">[{log.service}]</span>
                        </div>
                        <p>{log.message}</p>
                        {log.metadata && (
                          <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                            {JSON.stringify(log.metadata, null, 2)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance */}
        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Request Volume</CardTitle>
              <CardDescription>API requests over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="requests" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Peak Load</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,247</div>
                <p className="text-sm text-muted-foreground">Requests per minute</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Database Queries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8,934</div>
                <p className="text-sm text-muted-foreground">Last hour</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cache Hit Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">94.2%</div>
                <p className="text-sm text-muted-foreground">Redis cache</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Alert Details Dialog */}
      <Dialog open={alertDialogOpen} onOpenChange={setAlertDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Alert Details</DialogTitle>
            <DialogDescription>Detailed information about the alert</DialogDescription>
          </DialogHeader>

          {selectedAlert && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Title</Label>
                  <p className="font-medium">{selectedAlert.title}</p>
                </div>
                <div>
                  <Label>Severity</Label>
                  <Badge className={getSeverityColor(selectedAlert.severity)}>{selectedAlert.severity}</Badge>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge variant="outline" className="capitalize">
                    {selectedAlert.status}
                  </Badge>
                </div>
                <div>
                  <Label>Service</Label>
                  <p className="font-medium">{selectedAlert.service}</p>
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <p className="mt-1 p-3 border rounded-lg bg-gray-50 dark:bg-gray-800">{selectedAlert.description}</p>
              </div>

              <div>
                <Label>Timestamp</Label>
                <p className="font-medium">{new Date(selectedAlert.timestamp).toLocaleString()}</p>
              </div>

              {selectedAlert.metric && (
                <div>
                  <Label>Related Metric</Label>
                  <p className="font-medium capitalize">{selectedAlert.metric}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setAlertDialogOpen(false)}>
              Close
            </Button>
            {selectedAlert?.status === "active" && (
              <Button
                onClick={() => {}
                  acknowledgeAlert(selectedAlert.id)
                  setAlertDialogOpen(false)
                }}
              >
                Acknowledge
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Monitoring Settings</DialogTitle>
            <DialogDescription>Configure monitoring and alerting preferences</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium">Alert Thresholds</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>CPU Usage Warning (%)</Label>
                  <span className="text-sm">70</span>
                </div>
                <div className="flex items-center justify-between">
                  <Label>Memory Usage Warning (%)</Label>
                  <span className="text-sm">80</span>
                </div>
                <div className="flex items-center justify-between">
                  <Label>Disk Usage Warning (%)</Label>
                  <span className="text-sm">85</span>
                </div>
                <div className="flex items-center justify-between">
                  <Label>Response Time Warning (ms)</Label>
                  <span className="text-sm">500</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Notifications</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Email alerts</Label>
                  <input type="checkbox" className="rounded" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Slack notifications</Label>
                  <input type="checkbox" className="rounded" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label>SMS for critical alerts</Label>
                  <input type="checkbox" className="rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Real-time dashboard updates</Label>
                  <input type="checkbox" className="rounded" defaultChecked />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setSettingsDialogOpen(false)}>Save Settings</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
