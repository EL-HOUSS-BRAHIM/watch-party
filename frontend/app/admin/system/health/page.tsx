"use client"

import { Check, CheckCircle, Clock, Cloud, Server, Shield, X, XCircle } from "lucide-react"
import { useState, useEffect, useCallback } from 'react'
import {CpuChipIcon,ServerIcon,ClockIcon,ExclamationTriangleIcon,CheckCircleIcon,XCircleIcon,ChartBarIcon,BoltIcon,CloudIcon,ShieldCheckIcon
} from '@heroicons/react/24/outline'
import { adminAPI } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
interface ServerMetric {}
  id: string
  name: string
  value: string | number
  status: 'healthy' | 'warning' | 'critical'
  unit?: string
  description: string
}

interface SystemComponent {}
  id: string
  name: string
  type: 'service' | 'database' | 'cache' | 'cdn'
  status: 'online' | 'degraded' | 'offline'
  uptime: string
  responseTime: number
  lastCheck: Date
  version?: string
}

export default function SystemHealthPage() {
  const { toast } = useToast()
  const [metrics, setMetrics] = useState<ServerMetric[]>([])
  const [components, setComponents] = useState<SystemComponent[]>([])
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(30)
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null)

  useEffect(() => {
    fetchSystemHealth()
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchSystemHealth, 30000)
    return () => clearInterval(interval)
  }, [fetchSystemHealth])

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchSystemHealth, refreshInterval * 1000)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval, fetchSystemHealth])

  const fetchSystemHealth = useCallback(async () => {
    try {
      setLoading(true)
      // Fetch system health data from admin API
      const [healthData, healthMetrics] = await Promise.all([]
        adminAPI.getSystemHealth(),
        adminAPI.getHealthMetrics()
      ])

      // Transform health data to metrics
      if (healthMetrics) {
        const transformedMetrics: ServerMetric[] = []
          {}
            id: 'cpu',
            name: 'CPU Usage',
            value: healthMetrics.cpu_usage || 0,
            status: (healthMetrics.cpu_usage || 0) > 80 ? 'critical' : 
                   (healthMetrics.cpu_usage || 0) > 60 ? 'warning' : 'healthy',
            unit: '%',
            description: 'Current CPU utilization across all cores'
          },
          {}
            id: 'memory',
            name: 'Memory Usage',
            value: healthMetrics.memory_usage || 0,
            status: (healthMetrics.memory_usage || 0) > 85 ? 'critical' : 
                   (healthMetrics.memory_usage || 0) > 70 ? 'warning' : 'healthy',
            unit: '%',
            description: 'RAM usage including buffers and cache'
          },
          {}
            id: 'disk',
            name: 'Disk Usage',
            value: healthMetrics.disk_usage || 0,
            status: (healthMetrics.disk_usage || 0) > 90 ? 'critical' : 
                   (healthMetrics.disk_usage || 0) > 75 ? 'warning' : 'healthy',
            unit: '%',
            description: 'Primary disk partition usage'
          },
          {}
            id: 'connections',
            name: 'Active Connections',
            value: healthMetrics.active_connections || 0,
            status: (healthMetrics.active_connections || 0) > 1000 ? 'warning' : 'healthy',
            description: 'Current active database and network connections'
          }
        ]
        setMetrics(transformedMetrics)
      }

      // Transform system components
      if (healthData.services) {
        const transformedComponents: SystemComponent[] = Object.entries(healthData.services).map(([name, service]) => ({}
          id: name,
          name: name.charAt(0).toUpperCase() + name.slice(1),
          type: name.includes('db') ? 'database' : 
                name.includes('cache') ? 'cache' :
                name.includes('cdn') ? 'cdn' : 'service',
          status: service.status === 'up' ? 'online' : 
                 service.status === 'degraded' ? 'degraded' : 'offline',
          uptime: '99.9%', // Would come from service data
          responseTime: service.response_time || 0,
          lastCheck: new Date(service.last_check || Date.now()),
          version: service.version
        }))
        setComponents(transformedComponents)
      }

      setLastUpdated(new Date())
    } catch (err) {
      console.error('Failed to fetch system health:', error)
      toast({title: "Error",
        description: "Failed to load system health data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return 'text-green-400'
      case 'warning':
      case 'degraded':
        return 'text-yellow-400'
      case 'critical':
      case 'offline':
        return 'text-red-400'
      default:
        return 'text-white/60'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return <CheckCircleIcon className="w-5 h-5" />
      case 'warning':
      case 'degraded':
        return <ExclamationTriangleIcon className="w-5 h-5" />
      case 'critical':
      case 'offline':
        return <XCircleIcon className="w-5 h-5" />
      default:
        return <ClockIcon className="w-5 h-5" />
    }
  }

  const getComponentIcon = (type: string) => {
    switch (type) {
      case 'service':
        return <ServerIcon className="w-6 h-6" />
      case 'database':
        return <CpuChipIcon className="w-6 h-6" />
      case 'cache':
        return <BoltIcon className="w-6 h-6" />
      case 'cdn':
        return <CloudIcon className="w-6 h-6" />
      default:
        return <ServerIcon className="w-6 h-6" />
    }
  }

  const healthyCount = components.filter(c => c.status === 'online').length
  const degradedCount = components.filter(c => c.status === 'degraded').length
  const offlineCount = components.filter(c => c.status === 'offline').length
  const criticalMetrics = metrics.filter(m => m.status === 'critical').length
  const warningMetrics = metrics.filter(m => m.status === 'warning').length
  const overallStatus = offlineCount > 0 ? 'critical' : 
                       (degradedCount > 0 || criticalMetrics > 0 || warningMetrics > 0) ? 'warning' : 'healthy'

  const refreshSystemHealth = async () => {
    setLoading(true)
    await fetchSystemHealth()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheckIcon className="w-8 h-8 text-green-400" />
              <h1 className="text-4xl font-bold text-white">System Health</h1>
            </div>
            <p className="text-white/70 text-lg">
              Real-time monitoring of system components and performance metrics
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${}}
              overallStatus === 'healthy' ? 'bg-green-500/20 border border-green-500/50' :
              overallStatus === 'warning' ? 'bg-yellow-500/20 border border-yellow-500/50' :
              'bg-red-500/20 border border-red-500/50'
            }`}>
              <div className={getStatusColor(overallStatus)}>
                {getStatusIcon(overallStatus)}
              </div>
              <span className={`font-medium ${getStatusColor(overallStatus)}`}>
                {overallStatus === 'healthy' ? 'All Systems Operational' :
                 overallStatus === 'warning' ? 'Some Issues Detected' :
                 'Critical Issues'}
              </span>
            </div>
          </div>
        </div>

        {/* System Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircleIcon className="w-6 h-6 text-green-400" />
              <h3 className="font-semibold text-white">Online</h3>
            </div>
            <div className="text-2xl font-bold text-green-400">{healthyCount}</div>
            <div className="text-sm text-white/60">components</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-2">
              <ExclamationTriangleIcon className="w-6 h-6 text-yellow-400" />
              <h3 className="font-semibold text-white">Degraded</h3>
            </div>
            <div className="text-2xl font-bold text-yellow-400">{degradedCount}</div>
            <div className="text-sm text-white/60">components</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-2">
              <XCircleIcon className="w-6 h-6 text-red-400" />
              <h3 className="font-semibold text-white">Offline</h3>
            </div>
            <div className="text-2xl font-bold text-red-400">{offlineCount}</div>
            <div className="text-sm text-white/60">components</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-2">
              <ChartBarIcon className="w-6 h-6 text-blue-400" />
              <h3 className="font-semibold text-white">Uptime</h3>
            </div>
            <div className="text-2xl font-bold text-blue-400">99.8%</div>
            <div className="text-sm text-white/60">last 30 days</div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 mb-8">
          <div className="p-6 border-b border-white/10">
            <h3 className="text-lg font-bold text-white">Key Metrics</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {metrics.map(metric => (
              <div key={metric.id} className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-white">{metric.name}</h4>
                  <div className={getStatusColor(metric.status)}>
                    {getStatusIcon(metric.status)}
                  </div>
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-2xl font-bold text-white">{metric.value}</span>
                  {metric.unit && (
                    <span className="text-white/60">{metric.unit}</span>
                  )}
                </div>
                {typeof metric.value === 'number' && metric.unit === '%' && (
                  <div className="w-full bg-white/20 rounded-full h-2 mb-2">
                    <div
                      className={`h-2 rounded-full ${}
                        metric.status === 'healthy' ? 'bg-green-400' :
                        metric.status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
                      }`}
                      style={{ width: `${metric.value}%` }}
                    ></div>
                  </div>
                )}
                <p className="text-sm text-white/60">{metric.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* System Components */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 mb-8">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">System Components</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="autoRefresh"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="autoRefresh" className="text-sm text-white/70">
                    Auto-refresh
                  </label>
                </div>
                <select
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(Number(e.target.value))}
                  className="px-3 py-1 bg-white/10 rounded border border-white/20 text-white text-sm focus:outline-none focus:border-blue-400"
                >
                  <option value={15}>15s</option>
                  <option value={30}>30s</option>
                  <option value={60}>1m</option>
                  <option value={300}>5m</option>
                </select>
              </div>
            </div>
          </div>
          <div className="divide-y divide-white/10">
            {components.map(component => (
              <div
                key={component.id}
                className="p-4 hover:bg-white/5 transition-colors cursor-pointer"
                onClick={() => setSelectedComponent(selectedComponent === component.id ? null : component.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white/10 rounded">
                      {getComponentIcon(component.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-white">{component.name}</h4>
                        <span className="text-xs px-2 py-1 bg-white/20 rounded text-white/70 capitalize">
                          {component.type}
                        </span>
                        {component.version && (
                          <span className="text-xs text-white/60">{component.version}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-white/60">
                        <span>Uptime: {component.uptime}</span>
                        <span>Response: {component.responseTime}ms</span>
                        <span>
                          Last check: {new Date(component.lastCheck).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={`flex items-center gap-2 ${getStatusColor(component.status)}`}>
                    {getStatusIcon(component.status)}
                    <span className="font-medium capitalize">{component.status}</span>
                  </div>
                </div>

                {selectedComponent === component.id && (
                  <div className="mt-4 p-4 bg-white/5 rounded-lg">
                    <h5 className="font-medium text-white mb-2">Component Details</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-white/60">Status:</span>
                        <span className={`ml-2 ${getStatusColor(component.status)}`}>
                          {component.status}
                        </span>
                      </div>
                      <div>
                        <span className="text-white/60">Type:</span>
                        <span className="ml-2 text-white">{component.type}</span>
                      </div>
                      <div>
                        <span className="text-white/60">Uptime:</span>
                        <span className="ml-2 text-white">{component.uptime}</span>
                      </div>
                      <div>
                        <span className="text-white/60">Avg Response:</span>
                        <span className="ml-2 text-white">{component.responseTime}ms</span>
                      </div>
                      {component.version && (
                        <div>
                          <span className="text-white/60">Version:</span>
                          <span className="ml-2 text-white">{component.version}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-white/60">Last Check:</span>
                        <span className="ml-2 text-white">
                          {component.lastCheck.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={refreshSystemHealth}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            {loading ? 'Refreshing...' : 'Refresh All'}
          </button>
          <button className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            View Logs
          </button>
          <button className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            Export Report
          </button>
        </div>
      </div>
    </div>
  )
}
