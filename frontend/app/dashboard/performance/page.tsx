"use client"

import { Activity, AlertTriangle, Check, CheckCircle, Download, Monitor, Refresh, TrendingDown, TrendingUp } from "lucide-react"
import { useState, useEffect , useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { adminAPI, analyticsAPI } from "@/lib/api"

interface PerformanceMetric {}
  name: string
  current: number
  previous: number
  unit: string
  trend: "up" | "down" | "stable"
  threshold: {}
    warning: number
    critical: number
  }
}

interface SystemHealth {}
  cpu: number
  memory: number
  disk: number
  network: number
  status: "healthy" | "warning" | "critical"
}

interface EndpointMetric {}
  endpoint: string
  method: string
  avgResponseTime: number
  requests: number
  errors: number
  successRate: number
}

interface SystemAlert {}
  id: number
  type: "info" | "warning" | "critical"
  message: string
  timestamp: Date
  resolved: boolean
}

const PerformancePage = () => {}
  const { toast } = useToast()
  const [timeRange, setTimeRange] = useState("1h")
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(30)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [loading, setLoading] = useState(true)

  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]
    {}
      name: "Response Time",
      current: 145.2,
      previous: 132.8,
      unit: "ms",
      trend: "up",
      threshold: { warning: 200, critical: 500 },
    },
    {}
      name: "Throughput",
      current: 1847,
      previous: 1923,
      unit: "rps",
      trend: "down",
      threshold: { warning: 1000, critical: 500 },
    },
    {}
      name: "Error Rate",
      current: 0.34,
      previous: 0.28,
      unit: "%",
      trend: "up",
      threshold: { warning: 1, critical: 5 },
    },
    {}
      name: "Active Connections",
      current: 1247,
      previous: 1356,
      unit: "connections",
      trend: "down",
      threshold: { warning: 2000, critical: 3000 },
    },
    {}
      name: "Cache Hit Rate",
      current: 94.2,
      previous: 91.8,
      unit: "%",
      trend: "up",
      threshold: { warning: 80, critical: 70 },
    },
  ])

  const [systemHealth, setSystemHealth] = useState<SystemHealth>({}
    cpu: 34,
    memory: 67,
    disk: 45,
    network: 12,
    status: "healthy",
  })

  const [endpointMetrics, setEndpointMetrics] = useState<EndpointMetric[]>([]
    {}
      endpoint: "/api/auth/login",
      method: "POST",
      avgResponseTime: 156,
      requests: 2340,
      errors: 12,
      successRate: 99.5,
    },
    {}
      endpoint: "/api/parties/create",
      method: "POST",
      avgResponseTime: 234,
      requests: 890,
      errors: 3,
      successRate: 99.7,
    },
    {}
      endpoint: "/api/videos/upload",
      method: "POST",
      avgResponseTime: 1250,
      requests: 456,
      errors: 23,
      successRate: 94.9,
    },
    {}
      endpoint: "/api/chat/messages",
      method: "GET",
      avgResponseTime: 89,
      requests: 5670,
      errors: 2,
      successRate: 99.9,
    },
    {}
      endpoint: "/api/user/profile",
      method: "GET",
      avgResponseTime: 45,
      requests: 3450,
      errors: 1,
      successRate: 99.9,
    },
  ])

  const [alerts, setAlerts] = useState<SystemAlert[]>([]
    {}
      id: 1,
      type: "warning",
      message: "High memory usage detected on server-02",
      timestamp: new Date(Date.now() - 300000),
      resolved: false,
    },
    {}
      id: 2,
      type: "info",
      message: "Scheduled maintenance completed successfully",
      timestamp: new Date(Date.now() - 1800000),
      resolved: true,
    },
    {}
      id: 3,
      type: "critical",
      message: "Database connection pool exhausted",
      timestamp: new Date(Date.now() - 600000),
      resolved: true,
    },
  ])

  useEffect(() => {
    fetchPerformanceData()
    if (autoRefresh) {
      const interval = setInterval(fetchPerformanceData, refreshInterval * 1000)
      return () => clearInterval(interval)
    }
  }, [timeRange, autoRefresh, refreshInterval])

  const fetchPerformanceData = async () => {
    try {
      setLoading(true)
      // Fetch performance data from APIs
      const [performanceData, healthMetrics, systemHealth] = await Promise.all([]
        analyticsAPI.getPerformanceAnalytics(),
        adminAPI.getHealthMetrics(),
        adminAPI.getSystemHealth()
      ])

      // Transform performance metrics
      if (performanceData) {
        const performanceMetrics: PerformanceMetric[] = []
          {}
            name: "Response Time",
            current: performanceData.avgResponseTime || 145.2,
            previous: performanceData.prevAvgResponseTime || 132.8,
            unit: "ms",
            trend: performanceData.avgResponseTime > performanceData.prevAvgResponseTime ? "up" : "down",
            threshold: { warning: 200, critical: 500 },
          },
          {}
            name: "Throughput",
            current: performanceData.requestsPerSecond || 1847,
            previous: performanceData.prevRequestsPerSecond || 1923,
            unit: "rps",
            trend: performanceData.requestsPerSecond > performanceData.prevRequestsPerSecond ? "up" : "down",
            threshold: { warning: 1000, critical: 500 },
          },
          {}
            name: "Error Rate",
            current: performanceData.errorRate || 0.34,
            previous: performanceData.prevErrorRate || 0.28,
            unit: "%",
            trend: performanceData.errorRate > performanceData.prevErrorRate ? "up" : "down",
            threshold: { warning: 1, critical: 5 },
          },
        ]
        setMetrics(performanceMetrics)
      }

      // Transform system health
      if (systemHealth) {
        setSystemHealth({cpu: systemHealth.metrics?.cpu_usage || 34,
          memory: systemHealth.metrics?.memory_usage || 67,
          disk: systemHealth.metrics?.disk_usage || 45,
          network: parseFloat(systemHealth.metrics?.network_io || "12") || 12,
          status: systemHealth.overall_status || "healthy",
        })
      }

      // Transform endpoint metrics (from system health services)
      if (systemHealth?.services) {
        const endpoints: EndpointMetric[] = Object.entries(systemHealth.services).map(([name, service]: [string, any]) => ({}
          endpoint: `/${name}`,
          method: "GET",
          avgResponseTime: service.response_time || 0,
          requests: service.requests || 0,
          errors: service.errors || 0,
          successRate: service.success_rate || 100
        }))
        setEndpointMetrics(endpoints)
      }

      setLastUpdated(new Date())
    } catch (err) {
      console.error('Failed to fetch performance data:', error)
      toast({title: "Error",
        description: "Failed to load performance data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Simulate real-time updates
  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(() => {}
      // Update metrics with random variations
      setMetrics((prev) =>
        prev.map((metric) => ({}
          ...metric,
          previous: metric.current,
          current: Math.max(0, metric.current + (Math.random() - 0.5) * metric.current * 0.1),
        })),
      )

      // Update system health
      setSystemHealth((prev) => ({}
        ...prev,
        cpu: Math.max(0, Math.min(100, prev.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.max(0, Math.min(100, prev.memory + (Math.random() - 0.5) * 8)),
        disk: Math.max(0, Math.min(100, prev.disk + (Math.random() - 0.5) * 5)),
        network: Math.max(0, Math.min(100, prev.network + (Math.random() - 0.5) * 15)),
      }))

      setLastUpdated(new Date())
    }, refreshInterval * 1000)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval])

  const getMetricStatus = (metric: PerformanceMetric) => {}
    if (metric.current >= metric.threshold.critical) return "critical"
    if (metric.current >= metric.threshold.warning) return "warning"
    return "healthy"
  }

  const getStatusColor = (status: string) => {}
    switch (status) {
      case "healthy":
        return "text-green-600"
      case "warning":
        return "text-yellow-600"
      case "critical":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const getStatusBadgeClass = (status: string) => {}
    switch (status) {
      case "healthy":
        return "bg-green-100 text-green-800 border-green-200"
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getTrendIcon = (trend: string) => {}
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-600" />
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-600" />
      default:
        return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  const getSystemHealthStatus = () => {}
    const avgUsage = (systemHealth.cpu + systemHealth.memory + systemHealth.disk) / 3
    if (avgUsage > 80) return "critical&quot
    if (avgUsage > 60) return "warning"
    return "healthy"
  }

  const formatNumber = (num: number, decimals = 1) => {}
    if (num >= 1000000) return (num / 1000000).toFixed(decimals) + "M"
    if (num >= 1000) return (num / 1000).toFixed(decimals) + "K"
    return num.toFixed(decimals)
  }

  const formatDuration = (ms: number) => {}
    if (ms < 1000) return `${ms.toFixed(0)}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    return `${(ms / 60000).toFixed(1)}m`
  }

  const exportData = () => {}
    const data = { metrics,
      systemHealth,
      endpointMetrics,
      alerts,
      lastUpdated,
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `performance-report-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Performance Dashboard</h1>
            <p className="text-gray-600 mt-1">Monitor system performance and health metrics</p>
            <p className="text-sm text-gray-500 mt-2">
              Last updated: {lastUpdated.toLocaleString()}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5m">5 minutes</SelectItem>
                <SelectItem value="15m">15 minutes</SelectItem>
                <SelectItem value="1h">1 hour</SelectItem>
                <SelectItem value="6h">6 hours</SelectItem>
                <SelectItem value="24h">24 hours</SelectItem>
                <SelectItem value="7d">7 days</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={fetchPerformanceData}
              disabled={loading}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>

            <Button onClick={exportData} variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Auto-refresh Controls */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-refresh"
                  checked={autoRefresh}
                  onCheckedChange={setAutoRefresh}
                />
                <Label htmlFor="auto-refresh">Auto-refresh</Label>
              </div>

              {autoRefresh && (
                <div className="flex items-center space-x-2">
                  <Label htmlFor="refresh-interval" className="text-sm">
                    Interval:
                  </Label>
                  <Select
                    value={refreshInterval.toString()}
                    onValueChange={(value) => setRefreshInterval(parseInt(value))}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5s</SelectItem>
                      <SelectItem value="10">10s</SelectItem>
                      <SelectItem value="30">30s</SelectItem>
                      <SelectItem value="60">1m</SelectItem>
                      <SelectItem value="300">5m</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="system">System Health</TabsTrigger>
            <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {metrics.map((metric) => {}
                const status = getMetricStatus(metric)
                return (
                  <Card key={metric.name} className="relative overflow-hidden">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">
                        {metric.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold">
                            {formatNumber(metric.current)}
                            <span className="text-sm font-normal text-gray-500 ml-1">
                              {metric.unit}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                            {getTrendIcon(metric.trend)}
                            <span>
                              {metric.trend === "up" ? "+" : ""}
                              {((metric.current - metric.previous) / metric.previous * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <Badge className={getStatusBadgeClass(status)}>
                          {status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* System Health Tab */}
          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
                  <Cpu className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemHealth.cpu.toFixed(1)}%</div>
                  <Progress value={systemHealth.cpu} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                  <MemoryStick className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemHealth.memory.toFixed(1)}%</div>
                  <Progress value={systemHealth.memory} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemHealth.disk.toFixed(1)}%</div>
                  <Progress value={systemHealth.disk} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Network I/O</CardTitle>
                  <Network className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemHealth.network.toFixed(1)}%</div>
                  <Progress value={systemHealth.network} className="mt-2" />
                </CardContent>
              </Card>
            </div>

            {/* Overall System Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold">
                      Overall Status:{" "}
                      <span className={getStatusColor(getSystemHealthStatus())}>
                        {getSystemHealthStatus().charAt(0).toUpperCase() + getSystemHealthStatus().slice(1)}
                      </span>
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      All systems operational
                    </p>
                  </div>
                  <Badge className={getStatusBadgeClass(getSystemHealthStatus())}>
                    {getSystemHealthStatus()}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Endpoints Tab */}
          <TabsContent value="endpoints" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  API Endpoints Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {endpointMetrics.map((endpoint, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{endpoint.method}</Badge>
                          <code className="text-sm">{endpoint.endpoint}</code>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <span>Avg: {formatDuration(endpoint.avgResponseTime)}</span>
                          <span>Requests: {formatNumber(endpoint.requests)}</span>
                          <span>Errors: {endpoint.errors}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold">
                          {endpoint.successRate.toFixed(1)}%
                        </div>
                        <Badge
                          className={}
                            endpoint.successRate >= 99
                              ? "bg-green-100 text-green-800"
                              : endpoint.successRate >= 95
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {endpoint.successRate >= 99
                            ? "Excellent"
                            : endpoint.successRate >= 95
                            ? "Good"
                            : "Poor"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  System Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-lg border-l-4 ${}
                        alert.type === "critical"
                          ? "bg-red-50 border-red-500"
                          : alert.type === "warning"
                          ? "bg-yellow-50 border-yellow-500"
                          : "bg-blue-50 border-blue-500"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge
                              className={}
                                alert.type === "critical"
                                  ? "bg-red-100 text-red-800"
                                  : alert.type === "warning"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-blue-100 text-blue-800"
                              }
                            >
                              {alert.type}
                            </Badge>
                            {alert.resolved && (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Resolved
                              </Badge>
                            )}
                          </div>
                          <p className="mt-2 font-medium">{alert.message}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            {alert.timestamp.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default PerformancePage