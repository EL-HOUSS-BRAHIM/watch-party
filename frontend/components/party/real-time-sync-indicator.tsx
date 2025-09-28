'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

interface SyncStatus {
  is_synced: boolean
  time_difference: number
  buffer_health: number
  connection_quality: 'excellent' | 'good' | 'poor' | 'offline'
  sync_participants: number
  total_participants: number
  last_sync: string
  is_buffering: boolean
}

interface RealTimeSyncIndicatorProps {
  syncStatus: SyncStatus
  onForceSync: () => void
  onReconnect: () => void
  className?: string
}

export function RealTimeSyncIndicator({
  syncStatus,
  onForceSync,
  onReconnect,
  className = ''
}: RealTimeSyncIndicatorProps) {
  const [isReconnecting, setIsReconnecting] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(Date.now())

  useEffect(() => {
    setLastUpdate(Date.now())
  }, [syncStatus])

  const getConnectionIcon = () => {
    switch (syncStatus.connection_quality) {
      case 'excellent':
        return <Wifi className="w-4 h-4 text-green-500" />
      case 'good':
        return <Signal className="w-4 h-4 text-blue-500" />
      case 'poor':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      case 'offline':
        return <WifiOff className="w-4 h-4 text-red-500" />
      default:
        return <Wifi className="w-4 h-4 text-gray-500" />
    }
  }

  const getSyncIcon = () => {
    if (syncStatus.is_buffering) {
      return <Activity className="w-4 h-4 text-blue-500 animate-pulse" />
    }
    if (syncStatus.is_synced) {
      return <CheckCircle className="w-4 h-4 text-green-500" />
    }
    return <AlertCircle className="w-4 h-4 text-red-500" />
  }

  const getConnectionColor = () => {
    switch (syncStatus.connection_quality) {
      case 'excellent':
        return 'border-green-500 bg-green-50 dark:bg-green-900/20'
      case 'good':
        return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
      case 'poor':
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
      case 'offline':
        return 'border-red-500 bg-red-50 dark:bg-red-900/20'
      default:
        return 'border-gray-300 bg-gray-50 dark:bg-gray-800'
    }
  }

  const formatTimeDifference = (diff: number) => {
    if (Math.abs(diff) < 0.5) return 'Perfect sync'
    const sign = diff > 0 ? &apos;+&apos; : &apos;'
    return `${sign}${diff.toFixed(1)}s`
  }

  const handleReconnect = async () => {
    setIsReconnecting(true)
    try {
      await onReconnect()
    } finally {
      setTimeout(() => setIsReconnecting(false), 2000)
    }
  }

  const syncPercentage = (syncStatus.sync_participants / syncStatus.total_participants) * 100

  return (
    <div className={`${className}`}>
      {/* Compact Status Bar */}
      <div className={`flex items-center gap-3 px-3 py-2 rounded-lg border-2 transition-colors ${getConnectionColor()}`}>
        {/* Connection Status */}
        <div className="flex items-center gap-2">
          {getConnectionIcon()}
          <span className="text-sm font-medium capitalize">
            {syncStatus.connection_quality}
          </span>
        </div>

        {/* Sync Status */}
        <div className="flex items-center gap-2">
          {getSyncIcon()}
          <span className="text-sm">
            {syncStatus.is_buffering 
              ? 'Buffering...' 
              : formatTimeDifference(syncStatus.time_difference)
            }
          </span>
        </div>

        {/* Participant Sync */}
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-600" />
          <span className="text-sm">
            {syncStatus.sync_participants}/{syncStatus.total_participants}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 ml-auto">
          {syncStatus.connection_quality === 'offline' ? (
            <Button
              size="sm"
              variant="outline"
              onClick={handleReconnect}
              disabled={isReconnecting}
              className="h-7 px-2"
            >
              {isReconnecting ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : (
                'Reconnect'
              )}
            </Button>
          ) : !syncStatus.is_synced && (
            <Button
              size="sm"
              variant="outline"
              onClick={onForceSync}
              className="h-7 px-2"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Sync
            </Button>
          )}
        </div>
      </div>

      {/* Detailed Status (when issues detected) */}
      {(!syncStatus.is_synced || syncStatus.connection_quality === 'poor' || syncStatus.buffer_health < 50) && (
        <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2">
          {/* Buffer Health */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Buffer Health</span>
              <span>{syncStatus.buffer_health}%</span>
            </div>
            <Progress value={syncStatus.buffer_health} className="h-1" />
          </div>

          {/* Sync Progress */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Participants Synced</span>
              <span>{Math.round(syncPercentage)}%</span>
            </div>
            <Progress value={syncPercentage} className="h-1" />
          </div>

          {/* Recommendations */}
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {syncStatus.connection_quality === 'poor' && (
              <p>• Poor connection detected. Consider lowering video quality.</p>
            )}
            {syncStatus.buffer_health < 30 && (
              <p>• Low buffer health. Video may pause frequently.</p>
            )}
            {!syncStatus.is_synced && Math.abs(syncStatus.time_difference) > 5 && (
              <p>• Significant sync drift detected. Force sync recommended.</p>
            )}
          </div>
        </div>
      )}

      {/* Status Badges */}
      <div className="flex flex-wrap gap-1 mt-2">
        <Badge 
          variant={syncStatus.is_synced ? "default" : "destructive"}
          className="text-xs"
        >
          {syncStatus.is_synced ? 'Synced' : 'Out of Sync'}
        </Badge>
        
        <Badge 
          variant={syncStatus.buffer_health > 50 ? &quot;secondary&quot; : &quot;destructive"}
          className="text-xs"
        >
          Buffer: {syncStatus.buffer_health}%
        </Badge>

        {syncStatus.connection_quality === 'excellent' && (
          <Badge variant="secondary" className="text-xs">
            HD Quality
          </Badge>
        )}

        {Date.now() - new Date(syncStatus.last_sync).getTime() < 5000 && (
          <Badge variant="secondary" className="text-xs">
            Recently Synced
          </Badge>
        )}
      </div>
    </div>
  )
}
