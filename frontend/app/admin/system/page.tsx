'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { adminAPI, analyticsAPI } from '@/lib/api'
import type { SystemHealth } from '@/lib/api/types'
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
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Area,
  AreaChart,
  Tooltip,
} from 'recharts'

interface LogEntry {
  id: string
  timestamp: Date
  level: string
  service: string
  message: string
  metadata?: Record<string, any>
  userId?: string
  requestId?: string
}

interface HealthMetricsSnapshot {
  cpuUsage: number
  memoryUsage: number
  diskUsage: number
  networkIn?: number
  networkOut?: number
  activeConnections?: number
  responseTimes: Record<string, number>
  errorRates: Record<string, number>
}

interface HistoricalPoint {
  time: string
  cpu: number
  memory: number
  disk: number
}

const extractNumber = (...values: any[]): number | undefined => {
  for (const value of values) {
    if (value === undefined || value === null) continue
    const numberValue = Number(value)
    if (!Number.isNaN(numberValue)) {
      return numberValue
    }
  }
  return undefined
}

const normalizeMetrics = (
  health: SystemHealth | null,
  metrics: any,
): HealthMetricsSnapshot => ({
  cpuUsage: extractNumber(metrics?.cpu_usage, health?.metrics?.cpu_usage) ?? 0,
  memoryUsage: extractNumber(metrics?.memory_usage, health?.metrics?.memory_usage) ?? 0,
  diskUsage: extractNumber(metrics?.disk_usage, health?.metrics?.disk_usage) ?? 0,
  networkIn: extractNumber(metrics?.network_in, metrics?.network?.inbound, metrics?.network_io?.inbound),
  networkOut: extractNumber(metrics?.network_out, metrics?.network?.outbound, metrics?.network_io?.outbound),
  activeConnections: extractNumber(metrics?.active_connections),
  responseTimes: metrics?.response_times ?? {},
  errorRates: metrics?.error_rates ?? {},
})

const buildHistoricalData = (
  systemAnalytics: any,
  logStats: any,
  metrics: HealthMetricsSnapshot | null,
): HistoricalPoint[] => {
  const source =
    (Array.isArray(systemAnalytics?.timeline) && systemAnalytics.timeline) ||
    (Array.isArray(systemAnalytics?.performance) && systemAnalytics.performance) ||
    (Array.isArray(logStats?.timeline) && logStats.timeline) ||
    []

  if (source.length > 0) {
    return source.map((point: any, index: number) => ({
      time: point.timestamp
        ? new Date(point.timestamp).toLocaleTimeString()
        : point.time ?? point.label ?? `T+${index}`,
      cpu: extractNumber(point.cpu_usage, point.cpu) ?? metrics?.cpuUsage ?? 0,
      memory: extractNumber(point.memory_usage, point.memory) ?? metrics?.memoryUsage ?? 0,
      disk: extractNumber(point.disk_usage, point.disk) ?? metrics?.diskUsage ?? 0,
    }))
  }

  if (metrics) {
    return Array.from({ length: 12 }, (_, index) => ({
      time: `${index * 2}:00`,
      cpu: metrics.cpuUsage,
      memory: metrics.memoryUsage,
      disk: metrics.diskUsage,
    }))
  }

  return []
}

const randomId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).slice(2)
}

const normalizeLogs = (logsResponse: any): LogEntry[] => {
  const results = Array.isArray(logsResponse?.results)
    ? logsResponse.results
    : Array.isArray(logsResponse)
      ? logsResponse
      : []

  return results.map((log: any) => ({
    id: String(log.id ?? log.log_id ?? randomId()),
    timestamp: new Date(log.timestamp ?? log.created_at ?? Date.now()),
    level: (log.level ?? 'info').toLowerCase(),
    service: log.component ?? log.service ?? 'system',
    message: log.message ?? 'System log entry',
    metadata: log.metadata ?? undefined,
    userId: log.user_id ?? log.actor ?? undefined,
    requestId: log.request_id ?? undefined,
  }))
}

export default function SystemMonitoring() {
  const { toast } = useToast()
  const [healthStatus, setHealthStatus] = useState<SystemHealth | null>(null)
  const [metrics, setMetrics] = useState<HealthMetricsSnapshot | null>(null)
  const [historicalData, setHistoricalData] = useState<HistoricalPoint[]>([])
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [levelFilter, setLevelFilter] = useState('all')
  const [serviceFilter, setServiceFilter] = useState('all')
  const [autoRefresh, setAutoRefresh] = useState(false)

  const serviceOptions = useMemo(() => {
    const unique = new Set<string>()
    logs.forEach((log) => unique.add(log.service))
    return Array.from(unique.values()).sort()
  }, [logs])

  const fetchSystemData = useCallback(async () => {
    setLoading(true)
    try {
      const [health, metricsResponse, logResponse, systemAnalytics, logStats] = await Promise.all([
        typeof adminAPI.getSystemHealth === 'function' ? adminAPI.getSystemHealth() : Promise.resolve(null),
        typeof adminAPI.getHealthMetrics === 'function' ? adminAPI.getHealthMetrics() : Promise.resolve(null),
        typeof adminAPI.getLogs === 'function' ? adminAPI.getLogs({ page: 1 }) : Promise.resolve(null),
        typeof analyticsAPI.getSystemAnalytics === 'function' ? analyticsAPI.getSystemAnalytics() : Promise.resolve(null),
        typeof adminAPI.getSystemLogsStats === 'function' ? adminAPI.getSystemLogsStats('24h') : Promise.resolve(null),
      ])

      if (health) {
        setHealthStatus(health)
      }

      if (metricsResponse || health) {
        setMetrics(normalizeMetrics(health, metricsResponse ?? {}))
      }

      if (logResponse) {
        const normalizedLogs = normalizeLogs(logResponse)
        setLogs(normalizedLogs)
        setFilteredLogs(normalizedLogs)
      }

      const mergedMetrics = normalizeMetrics(health, metricsResponse ?? {})
      setHistoricalData(buildHistoricalData(systemAnalytics, logStats, mergedMetrics))
    } catch (error) {
      console.error('Failed to fetch system data:', error)
      toast({
        title: 'System data unavailable',
        description: 'Failed to load system telemetry. Please try again later.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    void fetchSystemData()
  }, [fetchSystemData])

  useEffect(() => {
    if (!autoRefresh) {
      return
    }

    const interval = setInterval(() => {
      void fetchSystemData()
    }, 30_000)

    return () => clearInterval(interval)
  }, [autoRefresh, fetchSystemData])

  useEffect(() => {
    const filtered = logs.filter((log) => {
      const matchesLevel = levelFilter === 'all' || log.level === levelFilter
      const matchesService = serviceFilter === 'all' || log.service === serviceFilter
      const query = searchTerm.trim().toLowerCase()
      const matchesSearch =
        query === '' ||
        log.message.toLowerCase().includes(query) ||
        log.service.toLowerCase().includes(query)

      return matchesLevel && matchesService && matchesSearch
    })

    setFilteredLogs(filtered)
  }, [logs, levelFilter, serviceFilter, searchTerm])

  const getHealthStatus = (percentage: number) => {
    if (percentage < 50) return { status: 'healthy', color: 'text-green-600', bg: 'bg-green-100' }
    if (percentage < 80) return { status: 'warning', color: 'text-yellow-600', bg: 'bg-yellow-100' }
    return { status: 'critical', color: 'text-red-600', bg: 'bg-red-100' }
  }

  const downloadLogs = () => {
    const csv = [
      'Timestamp,Level,Service,Message,Metadata,User ID,Request ID',
      ...filteredLogs.map((log) =>
        `"${log.timestamp.toISOString()}","${log.level}","${log.service}","${log.message.replace(/"/g, '""')}","${
          log.metadata ? JSON.stringify(log.metadata).replace(/"/g, '""') : ''
        }","${log.userId ?? ''}","${log.requestId ?? ''}"`,
      ),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `system-logs-${new Date().toISOString().split('T')[0]}.csv`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  if (loading && !healthStatus) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 w-64 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const cpuHealth = getHealthStatus(metrics?.cpuUsage ?? 0)
  const memoryHealth = getHealthStatus(metrics?.memoryUsage ?? 0)
  const diskHealth = getHealthStatus(metrics?.diskUsage ?? 0)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Monitoring</h1>
          <p className="text-muted-foreground">Real-time system health and application logs</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant={autoRefresh ? 'default' : 'outline'} onClick={() => setAutoRefresh((prev) => !prev)}>
            <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? 'Auto-refreshing' : 'Enable auto-refresh'}
          </Button>
          <Button variant="outline" onClick={() => void fetchSystemData()}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <Cpu className="w-5 h-5" />
              <span>CPU Usage</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Utilization</span>
              <span className="font-semibold">{metrics?.cpuUsage.toFixed(1)}%</span>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${cpuHealth.bg} ${cpuHealth.color}`}>
              {cpuHealth.status.toUpperCase()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>Memory Usage</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Utilization</span>
              <span className="font-semibold">{metrics?.memoryUsage.toFixed(1)}%</span>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${memoryHealth.bg} ${memoryHealth.color}`}>
              {memoryHealth.status.toUpperCase()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <HardDrive className="w-5 h-5" />
              <span>Disk Usage</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Utilization</span>
              <span className="font-semibold">{metrics?.diskUsage.toFixed(1)}%</span>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${diskHealth.bg} ${diskHealth.color}`}>
              {diskHealth.status.toUpperCase()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <Network className="w-5 h-5" />
              <span>Network</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Inbound</span>
              <span className="font-semibold text-foreground">{metrics?.networkIn?.toFixed(2) ?? '—'} Mbps</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Outbound</span>
              <span className="font-semibold text-foreground">{metrics?.networkOut?.toFixed(2) ?? '—'} Mbps</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Active connections</span>
              <span className="font-semibold text-foreground">{metrics?.activeConnections ?? '—'}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <Server className="w-5 h-5" />
              <span>Service Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {healthStatus?.services
              ? Object.entries(healthStatus.services).map(([service, status]) => (
                  <div key={service} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{service}</div>
                      <div className="text-xs text-muted-foreground">
                        Last check: {status.last_check ? new Date(status.last_check).toLocaleTimeString() : '—'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {status.status === 'up' ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : status.status === 'degraded' ? (
                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      )}
                      <span className="text-sm capitalize">{status.status}</span>
                    </div>
                  </div>
                ))
              : (
                <p className="text-sm text-muted-foreground">Service telemetry is unavailable.</p>
              )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <Database className="w-5 h-5" />
              <span>Performance Metrics</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {metrics?.responseTimes && Object.keys(metrics.responseTimes).length > 0 ? (
              Object.entries(metrics.responseTimes).map(([service, time]) => (
                <div key={service} className="flex justify-between text-sm text-muted-foreground">
                  <span>{service}</span>
                  <span className="font-semibold text-foreground">{Number(time).toFixed(1)} ms</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No response time telemetry available.</p>
            )}
            {metrics?.errorRates && Object.keys(metrics.errorRates).length > 0 && (
              <div className="pt-2 border-t text-sm text-muted-foreground">
                <div className="font-medium mb-1">Error Rates</div>
                {Object.entries(metrics.errorRates).map(([service, rate]) => (
                  <div key={service} className="flex justify-between">
                    <span>{service}</span>
                    <span className="font-semibold text-foreground">{Number(rate).toFixed(2)}%</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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
                <Tooltip />
                <Area type="monotone" dataKey="cpu" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                <Area type="monotone" dataKey="memory" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                <Area type="monotone" dataKey="disk" stackId="3" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

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

          <div className="flex flex-wrap gap-4 mt-4">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-64"
              />
            </div>

            <Select value={levelFilter} onValueChange={setLevelFilter}>
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

            <Select value={serviceFilter} onValueChange={setServiceFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Services</SelectItem>
                {serviceOptions.map((service) => (
                  <SelectItem key={service} value={service}>
                    {service}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredLogs.map((log) => (
              <div key={log.id} className="border rounded-lg p-3 text-sm">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className={
                      log.level === 'error'
                        ? 'bg-red-100 text-red-800 border-red-200'
                        : log.level === 'warning'
                          ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                          : log.level === 'debug'
                            ? 'bg-gray-100 text-gray-800 border-gray-200'
                            : 'bg-blue-100 text-blue-800 border-blue-200'
                    }>
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

                <p className="text-foreground mb-2">{log.message}</p>

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
  )
}
