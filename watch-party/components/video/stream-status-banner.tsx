'use client'

import { Badge } from '@/components/ui/badge'
import { Dot, Users } from 'lucide-react'

interface StreamStatusBannerProps {
  status: 'live' | 'scheduled' | 'ended' | 'loading'
  viewerCount?: number
  startTime?: Date
  className?: string
}

export function StreamStatusBanner({ 
  status, 
  viewerCount = 0, 
  startTime, 
  className 
}: StreamStatusBannerProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'live':
        return 'bg-error text-white animate-pulse'
      case 'scheduled':
        return 'bg-warning text-neo-text-inverse'
      case 'ended':
        return 'bg-neo-border text-neo-text-secondary'
      case 'loading':
        return 'bg-neo-surface text-neo-text-secondary animate-pulse'
      default:
        return 'bg-neo-border text-neo-text-secondary'
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'live':
        return 'LIVE'
      case 'scheduled':
        return `Starts ${startTime ? new Date(startTime).toLocaleTimeString() : 'Soon'}`
      case 'ended':
        return 'ENDED'
      case 'loading':
        return 'LOADING...'
      default:
        return 'OFFLINE'
    }
  }

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg bg-neo-surface border border-neo-border ${className}`}>
      {/* Status Badge */}
      <Badge className={`${getStatusColor()} font-semibold tracking-wide`}>
        {status === 'live' && <Dot className="h-4 w-4 -ml-1 animate-ping" />}
        {getStatusText()}
      </Badge>

      {/* Viewer Count */}
      {status === 'live' && (
        <div className="flex items-center gap-1 text-neo-text-secondary">
          <Users className="h-4 w-4" />
          <span className="text-sm font-medium">
            {viewerCount.toLocaleString()} watching
          </span>
        </div>
      )}

      {/* Scheduled Time */}
      {status === 'scheduled' && startTime && (
        <div className="text-sm text-neo-text-secondary">
          {new Date(startTime).toLocaleDateString()} at {new Date(startTime).toLocaleTimeString()}
        </div>
      )}
    </div>
  )
}
