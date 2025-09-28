"use client"

import { Play, User } from "lucide-react"
import { useState, useEffect, useCallback } from 'react'
import { analyticsAPI } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'

interface AnalyticsMetric {}
  id: string
  name: string
  value: number
  change: number
  period: 'day' | 'week' | 'month'
  trend: 'up' | 'down' | 'stable'
  format?: 'currency' | 'minutes'
}

interface UserSegment {}
  id: string
  name: string
  count: number
  percentage: number
  growth: number
}

interface RegionData {}
  id: string
  country: string
  users: number
  sessions: number
  avgDuration: number
}

interface DeviceData {}
  id: string
  type: 'desktop' | 'mobile' | 'tablet'
  name: string
  users: number
  percentage: number
}

interface HeatmapCell {}
  id: string
  value: number
  intensity: number
  label: string
}

const extractNumber = (...values: unknown[]): number | undefined => {
  for (const value of values) {
    if (value === undefined || value === null) continue
    const numberValue = Number(value)
    if (!Number.isNaN(numberValue)) {}
      return numberValue
    }
  }
  return undefined
}

const determineTrend = (change: number): 'up' | 'down' | 'stable' => {
  if (change > 0) return 'up&apos
  if (change < 0) return 'down'
  return 'stable'
}

const buildMetrics = (
  dashboard: unknown,
  realtime: unknown,
  adminAnalytics: unknown,
): AnalyticsMetric[] => {
  const metrics: AnalyticsMetric[] = []
  const overview = dashboard?.overview ?? {}
  const growth = adminAnalytics?.growth ?? adminAnalytics?.deltas ?? {}

  const addMetric = (
    id: string,
    name: string,
    valueCandidates: unknown[],
    changeCandidates: unknown[],
    period: 'day' | 'week' | 'month',
    format?: 'currency' | 'minutes',
  ) => {
  const value = extractNumber(...valueCandidates)
    if (value === undefined) {
      return
    }

    const change = extractNumber(...changeCandidates) ?? 0
    metrics.push({ id, name, value, change, period, trend: determineTrend(change), format })
  }

  addMetric(
    'total-users',
    'Total Users',
    []
      overview.total_users,
      overview.totalUsers,
      overview.users?.total,
      adminAnalytics?.totals?.users,
    ],
    [growth.total_users, realtime?.user_growth_rate],
    'month',
  )

  addMetric(
    'active-users',
    'Active Sessions',
    []
      overview.active_users_today,
      overview.active_users,
      realtime?.active_users,
      adminAnalytics?.totals?.active_sessions,
    ],
    [growth.active_users, realtime?.stream_growth_rate],
    'day',
  )

  addMetric(
    'watch-parties',
    'Watch Parties',
    [overview.total_parties, adminAnalytics?.totals?.parties],
    [growth.total_parties],
    'week',
  )

  addMetric(
    'video-views',
    'Video Views',
    []
      overview.videos_watched,
      overview.video_views,
      adminAnalytics?.totals?.video_views,
    ],
    [growth.video_views],
    'day',
  )

  addMetric(
    'avg-session-duration',
    'Avg Session Duration',
    []
      overview.average_session_duration,
      adminAnalytics?.averages?.session_duration,
      realtime?.average_session_duration,
    ],
    [growth.average_session_duration],
    'week',
    'minutes',
  )

  addMetric(
    'revenue',
    'Revenue',
    [overview.revenue, adminAnalytics?.revenue?.total, adminAnalytics?.totals?.revenue],
    [growth.revenue],
    'month',
    'currency',
  )

  return metrics
}

const buildSegments = (adminAnalytics: unknown, dashboard: unknown): UserSegment[] => {
  const source =
    (Array.isArray(adminAnalytics?.segments) && adminAnalytics.segments) ||
    (Array.isArray(adminAnalytics?.user_segments) && adminAnalytics.user_segments) ||
    (Array.isArray(dashboard?.segments) && dashboard.segments) ||
    (Array.isArray(dashboard?.overview?.segments) && dashboard.overview.segments) ||
    []

  return source
    .map((segment: unknown, index: number) => ({}
      id: String(segment.id ?? segment.key ?? segment.segment ?? index),
      name: segment.name ?? segment.label ?? segment.segment ?? `Segment ${index + 1}`,
      count: extractNumber(segment.count, segment.users, segment.total) ?? 0,
      percentage: extractNumber(segment.percentage, segment.percent, segment.share) ?? 0,
      growth: extractNumber(segment.growth, segment.change, segment.delta) ?? 0,
    }))
    .filter((segment: UserSegment) => segment.count > 0 || segment.percentage > 0)
}

const buildRegions = (systemAnalytics: unknown, realtime: unknown): RegionData[] => {
  const source =
    (Array.isArray(systemAnalytics?.regions) && systemAnalytics.regions) ||
    (Array.isArray(systemAnalytics?.geo_distribution) && systemAnalytics.geo_distribution) ||
    (Array.isArray(realtime?.geo_distribution) && realtime.geo_distribution) ||
    []

  return source.map((region: unknown, index: number) => ({}
    id: String(region.id ?? region.country ?? region.name ?? index),
    country: region.country ?? region.name ?? region.region ?? `Region ${index + 1}`,
    users: extractNumber(region.users, region.count, region.total_users) ?? 0,
    sessions: extractNumber(region.sessions, region.total_sessions, region.activity) ?? 0,
    avgDuration: extractNumber(region.avg_duration, region.average_duration, region.duration) ?? 0,
  }))
}

const buildDevices = (systemAnalytics: unknown, realtime: unknown): DeviceData[] => {
  const source =
    (Array.isArray(realtime?.device_breakdown) && realtime.device_breakdown) ||
    (Array.isArray(systemAnalytics?.device_breakdown) && systemAnalytics.device_breakdown) ||
    (Array.isArray(systemAnalytics?.devices) && systemAnalytics.devices) ||
    []

  return source.map((device: unknown, index: number) => {
  const typeValue = String(device.device ?? device.type ?? 'desktop').toLowerCase()
    const type: DeviceData['type'] = typeValue.includes('mobile')
      ? 'mobile'
      : typeValue.includes('tablet')
        ? 'tablet'
        : 'desktop'

    return {
      id: String(device.id ?? device.device ?? device.type ?? index),
      type,
      name:
        device.name ??
        device.label ??
        device.device ??
        device.type ??
        `Device ${index + 1}`,
      users: extractNumber(device.users, device.count, device.total_users) ?? 0,
      percentage: extractNumber(device.percentage, device.share, device.portion) ?? 0,
    }
  })
}

const buildActivitySeries = (
  realtime: unknown,
  adminAnalytics: unknown,
  dashboard: unknown,
): Array<{ timestamp: string; value: number }> => {
  const source =
    (Array.isArray(realtime?.time_series) && realtime.time_series) ||
    (Array.isArray(adminAnalytics?.activity?.timeline) && adminAnalytics.activity.timeline) ||
    (Array.isArray(dashboard?.trends?.usage) && dashboard.trends.usage) ||
    []

  const series = source.map((point: unknown, index: number) => ({}
    timestamp: point.timestamp ?? point.time ?? point.date ?? `point-${index}`,
    value:
      extractNumber(
        point.active_users,
        point.value,
        point.count,
        point.sessions,
      ) ?? 0,
  }))

  if (series.length > 0) {
    return series
  }

  const fallbackValue = extractNumber(realtime?.active_users)
  return fallbackValue !== undefined
    ? [{ timestamp: new Date().toISOString(), value: fallbackValue }]
    : []
}

const getDeviceIcon = (type: string) => {
  switch (type) {
    case 'desktop':
      return <ComputerDesktopIcon className="w-5 h-5" />
    case 'mobile':
      return <DevicePhoneMobileIcon className="w-5 h-5" />
    case 'tablet':
      return <DevicePhoneMobileIcon className="w-5 h-5" />
    default:
      return <ComputerDesktopIcon className="w-5 h-5" />
  }
}

export default function AdvancedAnalyticsPage() {
  const { toast } = useToast()
  const [dateRange, setDateRange] = useState('30d')
  const [viewType, setViewType] = useState<'overview' | 'users' | 'content' | 'revenue'>('overview')
  const [metrics, setMetrics] = useState<AnalyticsMetric[]>([])
  const [userSegments, setUserSegments] = useState<UserSegment[]>([])
  const [regions, setRegions] = useState<RegionData[]>([])
  const [devices, setDevices] = useState<DeviceData[]>([])
  const [activitySeries, setActivitySeries] = useState<Array<{ timestamp: string; value: number }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAnalytics = useCallback(async () => {
    if (typeof analyticsAPI.getDashboard !== 'function') {
      setMetrics([])
      setUserSegments([])
      setRegions([])
      setDevices([])
      setActivitySeries([])
      setLoading(false)
      setError('Analytics dashboard endpoint is unavailable.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const [dashboard, realtime, adminAnalytics, systemAnalytics] = await Promise.all([]
        analyticsAPI.getDashboard(dateRange),
        typeof analyticsAPI.getRealtimeAnalytics === 'function'
          ? analyticsAPI.getRealtimeAnalytics()
          : Promise.resolve(null),
        typeof analyticsAPI.getAdminAnalytics === 'function'
          ? analyticsAPI.getAdminAnalytics()
          : Promise.resolve(null),
        typeof analyticsAPI.getSystemAnalytics === 'function'
          ? analyticsAPI.getSystemAnalytics()
          : Promise.resolve(null),
      ])

      setMetrics(buildMetrics(dashboard, realtime, adminAnalytics))
      setUserSegments(buildSegments(adminAnalytics, dashboard))
      setRegions(buildRegions(systemAnalytics, realtime))
      setDevices(buildDevices(systemAnalytics, realtime))
      setActivitySeries(buildActivitySeries(realtime, adminAnalytics, dashboard))
    } catch (err) {
      console.error('Failed to load analytics data:', err)
      setError('Failed to load analytics data. Please try again.')
      toast({title: 'Analytics unavailable',
        description: 'Failed to load analytics data. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [dateRange, toast])

  useEffect(() => {
    void loadAnalytics()
  }, [loadAnalytics])

  const heatmapCells = useMemo<HeatmapCell[]>(() => {
  if (activitySeries.length === 0) {
      return Array.from({ length: 168 }, (_, index) => ({}
        id: `cell-${index}`,
        value: 0,
        intensity: 0,
        label: `Hour ${index % 24}, Day ${Math.floor(index / 24)}`,
      }))
    }

    const maxValue = Math.max(...activitySeries.map((point) => point.value), 1)
    return Array.from({ length: 168 }, (_, index) => {
  const point = activitySeries[Math.min(index, activitySeries.length - 1)]
      const intensity = point ? Math.min(point.value / maxValue, 1) : 0
      return {
        id: `cell-${index}`,
        value: point?.value ?? 0,
        intensity,
        label: point?.timestamp
          ? new Date(point.timestamp).toLocaleString()
          : `Hour ${index % 24}, Day ${Math.floor(index / 24)}`,
      }
    })
  }, [activitySeries])

  const handleExport = useCallback(async () => {
    if (typeof analyticsAPI.exportAnalytics !== 'function') {
      toast({title: 'Export unavailable',
        description: 'Analytics export endpoint is not available.',
        variant: 'destructive',
      })
      return
    }

    try {
      const response = await analyticsAPI.exportAnalytics({format: 'csv',
        date_range: dateRange,
      })

      if (response?.download_url) {
        const anchor = document.createElement('a')
        anchor.href = response.download_url
        anchor.download = `analytics-${dateRange}.csv`
        anchor.rel = 'noopener noreferrer'
        document.body.appendChild(anchor)
        anchor.click()
        document.body.removeChild(anchor)
        toast({ title: 'Export started', description: 'Your analytics export is downloading.' })
      } else {}
        toast({ title: 'Export started', description: 'Analytics export has been scheduled.' })
      }
    } catch (err) {
      console.error('Failed to export analytics:', err)
      toast({title: 'Export failed',
        description: 'Unable to export analytics right now. Please try again later.',
        variant: 'destructive',
      })
    }
  }, [dateRange, toast])

  const isOverviewEmpty = metrics.length === 0 && userSegments.length === 0 && devices.length === 0
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <ChartBarIcon className="w-8 h-8 text-blue-400" />
              <h1 className="text-4xl font-bold text-white">Advanced Analytics</h1>
            </div>
            <p className="text-white/70 text-lg">
              Deep insights into platform performance and user behavior
            </p>
          </div>

          <div className="flex items-center gap-4">
            <select
              value={dateRange}
              onChange={(event) => setDateRange(event.target.value)}
              className="px-4 py-2 bg-white/10 rounded-lg border border-white/20 text-white focus:outline-none focus:border-blue-400"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>

            <Button onClick={handleExport} variant="secondary">
              Export Report
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-8 bg-red-500/10 border border-red-500/30 text-red-100 px-4 py-3 rounded-lg flex items-center justify-between">
            <span>{error}</span>
            <Button variant="ghost" size="sm" className="text-red-100 hover:text-white" onClick={() => void loadAnalytics()}>
              Retry
            </Button>
          </div>
        )}

        <div className="flex gap-2 mb-8">
          {[]
            { id: 'overview', name: 'Overview', icon: ChartBarIcon },
            { id: 'users', name: 'Users', icon: UsersIcon },
            { id: 'content', name: 'Content', icon: PlayIcon },
            { id: 'revenue', name: 'Revenue', icon: ArrowTrendingUpIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setViewType(tab.id as typeof viewType)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${}
                viewType === tab.id ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.name}
            </button>
          ))}
        </div>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 animate-pulse">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-white/10 rounded-lg h-40 border border-white/20" />
            ))}
          </div>
        )}

        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {metrics.length === 0 && (
              <div className="col-span-full bg-white/5 backdrop-blur-sm rounded-lg border border-white/20 p-6 text-white/60">
                No metric summaries are available for the selected range yet.
              </div>
            )}

            {metrics.map((metric) => {
  const formattedValue = metric.format === 'currency'
                ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(metric.value)
                : metric.format === 'minutes'
                  ? `${metric.value.toFixed(1)} min`
                  : metric.value.toLocaleString()

              return (
                <div key={metric.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-white">{metric.name}</h3>
                    <div
                      className={`flex items-center gap-1 text-sm ${}
                        metric.trend === 'up'
                          ? 'text-green-400'
                          : metric.trend === 'down'
                            ? 'text-red-400'
                            : 'text-white/60'
                      }`}
                    >
                      {metric.trend === 'up' ? (
                        <ArrowTrendingUpIcon className="w-4 h-4" />
                      ) : metric.trend === 'down' ? (
                        <ArrowTrendingDownIcon className="w-4 h-4" />
                      ) : (
                        <div className="w-4 h-4 bg-current rounded-full" />
                      )}
                      {Math.abs(metric.change).toLocaleString(undefined, { maximumFractionDigits: 2 })}%
                    </div>
                  </div>

                  <div className="mb-2">
                    <div className="text-2xl font-bold text-white mb-1">{formattedValue}</div>
                    <div className="text-sm text-white/60">vs last {metric.period}</div>
                  </div>

                  <div className="h-8 bg-white/5 rounded flex items-end gap-1 p-1">
                    {Array.from({ length: 12 }).map((_, index) => (
                      <div
                        key={index}
                        className={`flex-1 rounded-sm ${}
                          metric.trend === 'up'
                            ? 'bg-green-400'
                            : metric.trend === 'down'
                              ? 'bg-red-400'
                              : 'bg-blue-400'
                        }`}
                        style={{ opacity: 0.3 + (index / 12) * 0.7 }}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {viewType === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
              <div className="p-6 border-b border-white/10">
                <h3 className="text-lg font-bold text-white">User Segments</h3>
              </div>

              <div className="p-6">
                {userSegments.length === 0 ? (
                  <p className="text-white/60 text-sm">
                    Segment analytics are not available for this range.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {userSegments.map((segment) => (
                      <div key={segment.id} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-white">{segment.name}</span>
                            <span className="text-white/60">{segment.count.toLocaleString()}</span>
                          </div>
                          <div className="w-full bg-white/20 rounded-full h-2">
                            <div
                              className="bg-blue-400 h-2 rounded-full"
                              style={{ width: `${Math.min(segment.percentage, 100)}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between mt-1 text-sm">
                            <span className="text-white/60">{segment.percentage.toFixed(1)}%</span>
                            <span className={segment.growth >= 0 ? 'text-green-400' : 'text-red-400'}>
                              {segment.growth >= 0 ? '+' : ''}{segment.growth.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
              <div className="p-6 border-b border-white/10">
                <h3 className="text-lg font-bold text-white">Device Usage</h3>
              </div>

              <div className="p-6">
                {devices.length === 0 ? (
                  <p className="text-white/60 text-sm">Device analytics are not available for this range.</p>
                ) : (
                  <div className="space-y-4">
                    {devices.map((device) => (
                      <div key={device.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                        <div className="text-white/70">{getDeviceIcon(device.type)}</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-white">{device.name}</span>
                            <span className="text-white/60">{device.users.toLocaleString()}</span>
                          </div>
                          <div className="w-full bg-white/20 rounded-full h-2">
                            <div
                              className="bg-purple-400 h-2 rounded-full"
                              style={{ width: `${Math.min(device.percentage, 100)}%` }}
                            />
                          </div>
                          <div className="text-sm text-white/60 mt-1">{device.percentage.toFixed(1)}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {viewType === 'users' && (
          <div className="space-y-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
              <div className="p-6 border-b border-white/10">
                <h3 className="text-lg font-bold text-white">Regional Distribution</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left p-4 font-medium text-white/70">Country</th>
                      <th className="text-right p-4 font-medium text-white/70">Users</th>
                      <th className="text-right p-4 font-medium text-white/70">Sessions</th>
                      <th className="text-right p-4 font-medium text-white/70">Avg Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {regions.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-white/60">
                          Regional analytics are not available for this range.
                        </td>
                      </tr>
                    ) : (
                      regions.map((region) => (
                        <tr key={region.id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <GlobeAltIcon className="w-4 h-4 text-white/60" />
                              <span className="font-medium text-white">{region.country}</span>
                            </div>
                          </td>
                          <td className="p-4 text-right text-white">{region.users.toLocaleString()}</td>
                          <td className="p-4 text-right text-white">{region.sessions.toLocaleString()}</td>
                          <td className="p-4 text-right text-white">{region.avgDuration.toFixed(1)} min</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
              <div className="p-6 border-b border-white/10">
                <h3 className="text-lg font-bold text-white">Activity Heatmap</h3>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-24 gap-1">
                  {heatmapCells.map((cell) => (
                    <div
                      key={cell.id}
                      className="aspect-square rounded-sm"
                      style={{}
                        backgroundColor: `rgba(59, 130, 246, ${0.1 + cell.intensity * 0.9})`,
                      }}
                      title={`${cell.label} — ${cell.value.toLocaleString()} active users`}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between mt-4 text-sm text-white/60">
                  <span>Less activity</span>
                  <div className="flex items-center gap-1">
                    {[0.1, 0.3, 0.5, 0.7, 0.9].map((value, index) => (
                      <div
                        key={index}
                        className="w-3 h-3 rounded-sm"
                        style={{ backgroundColor: `rgba(59, 130, 246, ${value})` }}
                      />
                    ))}
                  </div>
                  <span>More activity</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {viewType === 'content' && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
            <div className="p-6 border-b border-white/10">
              <h3 className="text-lg font-bold text-white">Content Performance</h3>
            </div>

            <div className="p-6">
              <div className="text-center text-white/60 py-12">
                <PlayIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Content analytics will surface here once metrics are available for this range.</p>
              </div>
            </div>
          </div>
        )}

        {viewType === 'revenue' && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
            <div className="p-6 border-b border-white/10">
              <h3 className="text-lg font-bold text-white">Revenue Analytics</h3>
            </div>

            <div className="p-6">
              <div className="text-center text-white/60 py-12">
                <ArrowTrendingUpIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Revenue analytics are coming soon once billing metrics are exposed.</p>
              </div>
            </div>
          </div>
        )}

        {viewType === 'overview' && !loading && isOverviewEmpty && (
          <div className="mt-8 bg-white/5 border border-white/20 rounded-lg p-6 text-white/70">
            We did not receive any analytics for the selected period. Try a wider range or check backend telemetry.
          </div>
        )}
      </div>
    </div>
  )
}
))))))))))))))))))))))))))))))))))))))))))))))))))