'use client'

import { useState } from 'react'
import { 
  ChartBarIcon,
  UsersIcon,
  PlayIcon,
  EyeIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  GlobeAltIcon,
  CalendarIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'

interface AnalyticsMetric {
  id: string
  name: string
  value: number
  change: number
  period: 'day' | 'week' | 'month'
  trend: 'up' | 'down' | 'stable'
}

interface UserSegment {
  id: string
  name: string
  count: number
  percentage: number
  growth: number
}

interface RegionData {
  id: string
  country: string
  users: number
  sessions: number
  avgDuration: number
}

interface DeviceData {
  id: string
  type: 'desktop' | 'mobile' | 'tablet'
  name: string
  users: number
  percentage: number
}

const mockMetrics: AnalyticsMetric[] = [
  {
    id: '1',
    name: 'Total Users',
    value: 124850,
    change: 12.5,
    period: 'month',
    trend: 'up'
  },
  {
    id: '2',
    name: 'Active Sessions',
    value: 8942,
    change: -3.2,
    period: 'day',
    trend: 'down'
  },
  {
    id: '3',
    name: 'Watch Parties',
    value: 2847,
    change: 18.7,
    period: 'week',
    trend: 'up'
  },
  {
    id: '4',
    name: 'Video Views',
    value: 45623,
    change: 8.9,
    period: 'day',
    trend: 'up'
  },
  {
    id: '5',
    name: 'Avg Session Duration',
    value: 42,
    change: 5.3,
    period: 'week',
    trend: 'up'
  },
  {
    id: '6',
    name: 'Revenue',
    value: 28590,
    change: 15.2,
    period: 'month',
    trend: 'up'
  }
]

const mockUserSegments: UserSegment[] = [
  {
    id: '1',
    name: 'New Users',
    count: 15420,
    percentage: 12.4,
    growth: 25.8
  },
  {
    id: '2',
    name: 'Active Users',
    count: 89650,
    percentage: 71.8,
    growth: 8.3
  },
  {
    id: '3',
    name: 'Premium Users',
    count: 19780,
    percentage: 15.8,
    growth: 22.1
  }
]

const mockRegions: RegionData[] = [
  {
    id: '1',
    country: 'United States',
    users: 45230,
    sessions: 128450,
    avgDuration: 48
  },
  {
    id: '2',
    country: 'United Kingdom',
    users: 18920,
    sessions: 52340,
    avgDuration: 42
  },
  {
    id: '3',
    country: 'Canada',
    users: 12450,
    sessions: 34120,
    avgDuration: 38
  },
  {
    id: '4',
    country: 'Germany',
    users: 15680,
    sessions: 41230,
    avgDuration: 45
  },
  {
    id: '5',
    country: 'Australia',
    users: 8930,
    sessions: 23450,
    avgDuration: 41
  }
]

const mockDevices: DeviceData[] = [
  {
    id: '1',
    type: 'desktop',
    name: 'Desktop',
    users: 67420,
    percentage: 54.0
  },
  {
    id: '2',
    type: 'mobile',
    name: 'Mobile',
    users: 45230,
    percentage: 36.2
  },
  {
    id: '3',
    type: 'tablet',
    name: 'Tablet',
    users: 12200,
    percentage: 9.8
  }
]

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
  const [dateRange, setDateRange] = useState('30d')
  const [selectedMetric, setSelectedMetric] = useState('users')
  const [viewType, setViewType] = useState<'overview' | 'users' | 'content' | 'revenue'>('overview')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
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
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 bg-white/10 rounded-lg border border-white/20 text-white focus:outline-none focus:border-blue-400"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              Export Report
            </button>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex gap-2 mb-8">
          {[
            { id: 'overview', name: 'Overview', icon: ChartBarIcon },
            { id: 'users', name: 'Users', icon: UsersIcon },
            { id: 'content', name: 'Content', icon: PlayIcon },
            { id: 'revenue', name: 'Revenue', icon: ArrowTrendingUpIcon }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setViewType(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                viewType === tab.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.name}
            </button>
          ))}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {mockMetrics.map(metric => (
            <div key={metric.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">{metric.name}</h3>
                <div className={`flex items-center gap-1 text-sm ${
                  metric.trend === 'up' ? 'text-green-400' :
                  metric.trend === 'down' ? 'text-red-400' : 'text-white/60'
                }`}>
                  {metric.trend === 'up' ? (
                    <ArrowTrendingUpIcon className="w-4 h-4" />
                  ) : metric.trend === 'down' ? (
                    <ArrowTrendingDownIcon className="w-4 h-4" />
                  ) : (
                    <div className="w-4 h-4 bg-current rounded-full" />
                  )}
                  {Math.abs(metric.change)}%
                </div>
              </div>
              
              <div className="mb-2">
                <div className="text-2xl font-bold text-white mb-1">
                  {metric.name === 'Revenue' ? `$${metric.value.toLocaleString()}` :
                   metric.name === 'Avg Session Duration' ? `${metric.value}min` :
                   metric.value.toLocaleString()}
                </div>
                <div className="text-sm text-white/60">
                  vs last {metric.period}
                </div>
              </div>

              {/* Mini trend chart placeholder */}
              <div className="h-8 bg-white/5 rounded flex items-end gap-1 p-1">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-sm ${
                      metric.trend === 'up' ? 'bg-green-400' :
                      metric.trend === 'down' ? 'bg-red-400' : 'bg-blue-400'
                    }`}
                    style={{ 
                      height: `${Math.random() * 100}%`,
                      opacity: 0.3 + (i / 12) * 0.7 
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Content based on selected view */}
        {viewType === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* User Segments */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
              <div className="p-6 border-b border-white/10">
                <h3 className="text-lg font-bold text-white">User Segments</h3>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {mockUserSegments.map(segment => (
                    <div key={segment.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-white">{segment.name}</span>
                          <span className="text-white/60">{segment.count.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-2">
                          <div
                            className="bg-blue-400 h-2 rounded-full"
                            style={{ width: `${segment.percentage}%` }}
                          ></div>
                        </div>
                        <div className="flex items-center justify-between mt-1 text-sm">
                          <span className="text-white/60">{segment.percentage}%</span>
                          <span className="text-green-400">+{segment.growth}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Device Breakdown */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
              <div className="p-6 border-b border-white/10">
                <h3 className="text-lg font-bold text-white">Device Usage</h3>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {mockDevices.map(device => (
                    <div key={device.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                      <div className="text-white/70">
                        {getDeviceIcon(device.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-white">{device.name}</span>
                          <span className="text-white/60">{device.users.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-2">
                          <div
                            className="bg-purple-400 h-2 rounded-full"
                            style={{ width: `${device.percentage}%` }}
                          ></div>
                        </div>
                        <div className="text-sm text-white/60 mt-1">{device.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {viewType === 'users' && (
          <div className="space-y-8">
            {/* Regional Distribution */}
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
                    {mockRegions.map(region => (
                      <tr key={region.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <GlobeAltIcon className="w-4 h-4 text-white/60" />
                            <span className="font-medium text-white">{region.country}</span>
                          </div>
                        </td>
                        <td className="p-4 text-right text-white">{region.users.toLocaleString()}</td>
                        <td className="p-4 text-right text-white">{region.sessions.toLocaleString()}</td>
                        <td className="p-4 text-right text-white">{region.avgDuration}min</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* User Activity Heatmap */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
              <div className="p-6 border-b border-white/10">
                <h3 className="text-lg font-bold text-white">Activity Heatmap</h3>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-24 gap-1">
                  {Array.from({ length: 168 }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-sm"
                      style={{
                        backgroundColor: `rgba(59, 130, 246, ${Math.random() * 0.8 + 0.1})`
                      }}
                      title={`Hour ${i % 24}, Day ${Math.floor(i / 24)}`}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between mt-4 text-sm text-white/60">
                  <span>Less activity</span>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-3 h-3 rounded-sm"
                        style={{ backgroundColor: `rgba(59, 130, 246, ${(i + 1) * 0.2})` }}
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
                <p>Content analytics coming soon...</p>
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
                <p>Revenue analytics coming soon...</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
