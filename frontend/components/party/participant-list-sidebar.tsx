'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Users, 
  Clock, 
  Eye, 
  Wifi, 
  WifiOff, 
  Crown, 
  Shield,
  Activity,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface ParticipantStatus {
  id: string
  username: string
  display_name: string
  avatar_url: string | null
  role: 'host' | 'co-host' | 'member'
  connection_status: 'connected' | 'reconnecting' | 'disconnected'
  sync_status: 'synced' | 'buffering' | 'out_of_sync'
  video_position: number
  last_heartbeat: string
  joined_at: string
  ping: number
}

interface ParticipantListSidebarProps {
  participants: ParticipantStatus[]
  currentVideoPosition: number
  isHost?: boolean
  onParticipantClick?: (participantId: string) => void
}

export function ParticipantListSidebar({
  participants,
  currentVideoPosition,
  isHost = false,
  onParticipantClick
}: ParticipantListSidebarProps) {
  const [syncTolerance] = useState(2) // seconds

  const getConnectionIcon = (status: string, ping: number) => {
    if (status === 'disconnected') {
      return <WifiOff className="w-4 h-4 text-red-500" />
    }
    if (status === 'reconnecting') {
      return <AlertCircle className="w-4 h-4 text-yellow-500 animate-pulse" />
    }
    if (ping > 500) {
      return <Wifi className="w-4 h-4 text-yellow-500" />
    }
    return <Wifi className="w-4 h-4 text-green-500" />
  }

  const getSyncIcon = (syncStatus: string, timeDiff: number) => {
    if (syncStatus === 'buffering') {
      return <Activity className="w-4 h-4 text-blue-500 animate-pulse" />
    }
    if (Math.abs(timeDiff) > syncTolerance) {
      return <AlertCircle className="w-4 h-4 text-red-500" />
    }
    return <CheckCircle className="w-4 h-4 text-green-500" />
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'host':
        return <Crown className="w-4 h-4 text-yellow-500" />
      case 'co-host':
        return <Shield className="w-4 h-4 text-blue-500" />
      default:
        return null
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const formatPing = (ping: number) => {
    if (ping > 1000) return &apos;1000+ ms'
    return `${ping} ms`
  }

  const connectedCount = participants.filter(p => p.connection_status === 'connected').length
  const syncedCount = participants.filter(p => 
    p.connection_status === 'connected' && 
    Math.abs(p.video_position - currentVideoPosition) <= syncTolerance
  ).length

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="w-5 h-5" />
          Participants ({participants.length})
        </CardTitle>
        <CardDescription>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              {connectedCount} online
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              {syncedCount} synced
            </div>
          </div>
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-1 p-4">
            {participants.map((participant) => {
              const timeDiff = participant.video_position - currentVideoPosition
              const isOutOfSync = Math.abs(timeDiff) > syncTolerance

              return (
                <div
                  key={participant.id}
                  className={`p-3 rounded-lg border transition-colors cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                    onParticipantClick ? 'hover:border-purple-300' : ''
                  }`}
                  onClick={() => onParticipantClick?.(participant.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={participant.avatar_url || ''} />
                        <AvatarFallback className="text-xs">
                          {participant.display_name?.charAt(0) || participant.username.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      
                      {/* Connection status indicator */}
                      <div className="absolute -bottom-1 -right-1">
                        {getConnectionIcon(participant.connection_status, participant.ping)}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">
                          {participant.display_name || participant.username}
                        </span>
                        {getRoleIcon(participant.role)}
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs px-1 py-0">
                          {participant.role}
                        </Badge>
                        {participant.connection_status === 'connected' && (
                          <Badge 
                            variant={isOutOfSync ? "destructive" : "secondary"} 
                            className="text-xs px-1 py-0"
                          >
                            {formatTime(participant.video_position)}
                          </Badge>
                        )}
                      </div>

                      {/* Sync status */}
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-600 dark:text-gray-400">
                        {getSyncIcon(participant.sync_status, timeDiff)}
                        <span>
                          {participant.connection_status === 'connected' 
                            ? (isOutOfSync 
                                ? `${timeDiff > 0 ? &apos;+' : ''}${timeDiff.toFixed(1)}s` 
                                : 'Synced'
                              )
                            : participant.connection_status
                          }
                        </span>
                        
                        {participant.connection_status === 'connected' && (
                          <>
                            <span>•</span>
                            <span>{formatPing(participant.ping)}</span>
                          </>
                        )}
                      </div>

                      {/* Sync progress bar for out-of-sync users */}
                      {participant.connection_status === 'connected' && isOutOfSync && (
                        <div className="mt-2">
                          <Progress 
                            value={Math.max(0, 100 - Math.abs(timeDiff) * 10)} 
                            className="h-1"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Additional info for host */}
                  {isHost && (
                    <div className="mt-2 pt-2 border-t text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex justify-between">
                        <span>Joined: {new Date(participant.joined_at).toLocaleTimeString()}</span>
                        <span>
                          Last seen: {new Date(participant.last_heartbeat).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </ScrollArea>

        {/* Summary stats */}
        <div className="p-4 border-t bg-gray-50 dark:bg-gray-800">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-green-600">
                {Math.round((syncedCount / participants.length) * 100)}%
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                In Sync
              </div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600">
                {participants.filter(p => p.ping < 100).length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Low Latency
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
