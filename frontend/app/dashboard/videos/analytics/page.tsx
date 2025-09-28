'use client'

import { useState } from 'react'
import Image from "next/image"
import { 
  EyeIcon, 
  HeartIcon, 
  ChatBubbleLeftIcon, 
  ArrowDownTrayIcon,
  ChartBarIcon,
  CalendarIcon,
  ClockIcon,
  UsersIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline'

interface VideoAnalytics {
  id: string
  title: string
  thumbnail: string
  views: number
  likes: number
  comments: number
  downloads: number
  uploadDate: string
  duration: string
  engagement: number
  revenue?: number
  watchTime: number
  viewsChange: number
  likesChange: number
  commentsChange: number
}

const videoAnalytics: VideoAnalytics[] = [
  {
    id: '1',
    title: 'Epic Movie Night Compilation',
    thumbnail: '/placeholder.jpg',
    views: 15420,
    likes: 1240,
    comments: 156,
    downloads: 89,
    uploadDate: '2024-02-15',
    duration: '2:34:12',
    engagement: 8.2,
    revenue: 24.50,
    watchTime: 12560,
    viewsChange: 12.5,
    likesChange: 8.3,
    commentsChange: -2.1
  },
  {
    id: '2',
    title: 'Horror Movies Marathon',
    thumbnail: '/placeholder.jpg',
    views: 8920,
    likes: 720,
    comments: 89,
    downloads: 45,
    uploadDate: '2024-01-28',
    duration: '1:45:30',
    engagement: 7.1,
    revenue: 18.30,
    watchTime: 8340,
    viewsChange: -5.2,
    likesChange: 3.7,
    commentsChange: 15.6
  },
  {
    id: '3',
    title: 'Sci-Fi Classics Collection',
    thumbnail: '/placeholder.jpg',
    views: 23100,
    likes: 1890,
    comments: 234,
    downloads: 156,
    uploadDate: '2024-01-10',
    duration: '3:12:45',
    engagement: 9.4,
    revenue: 42.80,
    watchTime: 18920,
    viewsChange: 25.8,
    likesChange: 18.2,
    commentsChange: 8.9
  }
]

const formatNumber = (num: number) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours}:${minutes.toString().padStart(2, '0')}h`
}

export default function VideoAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>(&apos;30d')
  const [sortBy, setSortBy] = useState<'views' | 'likes' | 'engagement' | 'revenue'>(&apos;views')

  const sortedVideos = [...videoAnalytics].sort((a, b) => {
    switch (sortBy) {
      case 'likes':
        return b.likes - a.likes
      case 'engagement':
        return b.engagement - a.engagement
      case 'revenue':
        return (b.revenue || 0) - (a.revenue || 0)
      default:
        return b.views - a.views
    }
  })

  const totalViews = videoAnalytics.reduce((sum, video) => sum + video.views, 0)
  const totalLikes = videoAnalytics.reduce((sum, video) => sum + video.likes, 0)
  const totalComments = videoAnalytics.reduce((sum, video) => sum + video.comments, 0)
  const totalRevenue = videoAnalytics.reduce((sum, video) => sum + (video.revenue || 0), 0)
  const avgEngagement = videoAnalytics.reduce((sum, video) => sum + video.engagement, 0) / videoAnalytics.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <ChartBarIcon className="w-8 h-8 text-blue-400" />
            <h1 className="text-4xl font-bold text-white">Video Analytics</h1>
          </div>
          <p className="text-white/70 text-lg">
            Track your video performance and audience engagement
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-8">
          {/* Time Range */}
          <div className="flex gap-2">
            {[
              { key: '7d', label: 'Last 7 days' },
              { key: '30d', label: 'Last 30 days' },
              { key: '90d', label: 'Last 90 days' },
              { key: '1y', label: 'Last year' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTimeRange(key as Record<string, unknown>)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  timeRange === key
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Sort Options */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as Record<string, unknown>)}
            className="px-4 py-2 bg-white/10 rounded-lg border border-white/20 text-white focus:outline-none focus:border-blue-400"
          >
            <option value="views">Sort by Views</option>
            <option value="likes">Sort by Likes</option>
            <option value="engagement">Sort by Engagement</option>
            <option value="revenue">Sort by Revenue</option>
          </select>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-2">
              <EyeIcon className="w-5 h-5 text-blue-400" />
              <span className="text-white/70 text-sm">Total Views</span>
            </div>
            <div className="text-2xl font-bold text-white">{formatNumber(totalViews)}</div>
            <div className="flex items-center gap-1 mt-1">
              <ArrowTrendingUpIcon className="w-4 h-4 text-green-400" />
              <span className="text-green-400 text-sm">+12.5%</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-2">
              <HeartIcon className="w-5 h-5 text-red-400" />
              <span className="text-white/70 text-sm">Total Likes</span>
            </div>
            <div className="text-2xl font-bold text-white">{formatNumber(totalLikes)}</div>
            <div className="flex items-center gap-1 mt-1">
              <ArrowTrendingUpIcon className="w-4 h-4 text-green-400" />
              <span className="text-green-400 text-sm">+8.3%</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-2">
              <ChatBubbleLeftIcon className="w-5 h-5 text-yellow-400" />
              <span className="text-white/70 text-sm">Total Comments</span>
            </div>
            <div className="text-2xl font-bold text-white">{formatNumber(totalComments)}</div>
            <div className="flex items-center gap-1 mt-1">
              <ArrowTrendingUpIcon className="w-4 h-4 text-green-400" />
              <span className="text-green-400 text-sm">+5.7%</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-2">
              <UsersIcon className="w-5 h-5 text-purple-400" />
              <span className="text-white/70 text-sm">Avg Engagement</span>
            </div>
            <div className="text-2xl font-bold text-white">{avgEngagement.toFixed(1)}%</div>
            <div className="flex items-center gap-1 mt-1">
              <ArrowTrendingUpIcon className="w-4 h-4 text-green-400" />
              <span className="text-green-400 text-sm">+2.1%</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-green-400 text-lg">💰</span>
              <span className="text-white/70 text-sm">Revenue</span>
            </div>
            <div className="text-2xl font-bold text-white">${totalRevenue.toFixed(2)}</div>
            <div className="flex items-center gap-1 mt-1">
              <ArrowTrendingUpIcon className="w-4 h-4 text-green-400" />
              <span className="text-green-400 text-sm">+15.2%</span>
            </div>
          </div>
        </div>

        {/* Video Performance Table */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-bold text-white">Video Performance</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-left p-4 text-white/70 font-medium">Video</th>
                  <th className="text-left p-4 text-white/70 font-medium">Views</th>
                  <th className="text-left p-4 text-white/70 font-medium">Likes</th>
                  <th className="text-left p-4 text-white/70 font-medium">Comments</th>
                  <th className="text-left p-4 text-white/70 font-medium">Downloads</th>
                  <th className="text-left p-4 text-white/70 font-medium">Engagement</th>
                  <th className="text-left p-4 text-white/70 font-medium">Revenue</th>
                  <th className="text-left p-4 text-white/70 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedVideos.map((video, index) => (
                  <tr key={video.id} className="border-t border-white/10 hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-16 h-12 object-cover rounded"
                        />
                        <div>
                          <h3 className="font-medium text-white line-clamp-1">{video.title}</h3>
                          <div className="flex items-center gap-2 text-sm text-white/60">
                            <CalendarIcon className="w-3 h-3" />
                            <span>{new Date(video.uploadDate).toLocaleDateString()}</span>
                            <span>•</span>
                            <ClockIcon className="w-3 h-3" />
                            <span>{video.duration}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-white font-medium">{formatNumber(video.views)}</div>
                      <div className={`flex items-center gap-1 text-sm ${
                        video.viewsChange >= 0 ? &apos;text-green-400' : 'text-red-400'
                      }`}>
                        {video.viewsChange >= 0 ? (
                          <ArrowTrendingUpIcon className="w-3 h-3" />
                        ) : (
                          <ArrowTrendingDownIcon className="w-3 h-3" />
                        )}
                        <span>{Math.abs(video.viewsChange)}%</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-white font-medium">{formatNumber(video.likes)}</div>
                      <div className={`flex items-center gap-1 text-sm ${
                        video.likesChange >= 0 ? &apos;text-green-400' : 'text-red-400'
                      }`}>
                        {video.likesChange >= 0 ? (
                          <ArrowTrendingUpIcon className="w-3 h-3" />
                        ) : (
                          <ArrowTrendingDownIcon className="w-3 h-3" />
                        )}
                        <span>{Math.abs(video.likesChange)}%</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-white font-medium">{video.comments}</div>
                      <div className={`flex items-center gap-1 text-sm ${
                        video.commentsChange >= 0 ? &apos;text-green-400' : 'text-red-400'
                      }`}>
                        {video.commentsChange >= 0 ? (
                          <ArrowTrendingUpIcon className="w-3 h-3" />
                        ) : (
                          <ArrowTrendingDownIcon className="w-3 h-3" />
                        )}
                        <span>{Math.abs(video.commentsChange)}%</span>
                      </div>
                    </td>
                    <td className="p-4 text-white">{video.downloads}</td>
                    <td className="p-4">
                      <div className="text-white font-medium">{video.engagement}%</div>
                      <div className="w-full bg-white/20 rounded-full h-1 mt-1">
                        <div
                          className="bg-blue-400 h-1 rounded-full"
                          style={{ width: `${video.engagement * 10}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="p-4 text-white font-medium">
                      {video.revenue ? `$${video.revenue.toFixed(2)}` : '-'}
                    </td>
                    <td className="p-4">
                      <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Charts Section */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <h3 className="text-lg font-bold text-white mb-4">Views Over Time</h3>
            <div className="h-64 flex items-center justify-center text-white/50">
              <div className="text-center">
                <ChartBarIcon className="w-12 h-12 mx-auto mb-2" />
                <p>Chart visualization would go here</p>
                <p className="text-sm">Integration with charting library needed</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <h3 className="text-lg font-bold text-white mb-4">Engagement Metrics</h3>
            <div className="h-64 flex items-center justify-center text-white/50">
              <div className="text-center">
                <UsersIcon className="w-12 h-12 mx-auto mb-2" />
                <p>Engagement chart would go here</p>
                <p className="text-sm">Shows likes, comments, shares over time</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
