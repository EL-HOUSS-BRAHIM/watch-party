/**
 * Synchronized video player component for watch parties
 */

'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { useWebSocket } from '@/hooks/use-websocket'
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Settings,
  Users,
  Clock,
  Wifi,
  WifiOff,
  SkipBack,
  SkipForward
} from 'lucide-react'

interface VideoPlayerProps {
  partyId: string
  streamingUrl?: string
  gdriveFileId?: string
  movieTitle?: string
  isHost?: boolean
  canControl?: boolean
}

interface PlaybackState {
  is_playing: boolean
  current_timestamp: number
  last_sync_at: string
  status: string
}

export const SynchronizedVideoPlayer: React.FC<VideoPlayerProps> = ({
  partyId,
  streamingUrl,
  gdriveFileId,
  movieTitle,
  isHost = false,
  canControl = false
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isBuffering, setIsBuffering] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting')
  const [participants, setParticipants] = useState(0)
  const [actualStreamingUrl, setActualStreamingUrl] = useState<string>('')
  const { toast } = useToast()

  // WebSocket connection for real-time synchronization
  const { socket, isConnected, connectionStatus, send } = useWebSocket(`/ws/party/${partyId}/`, {
    onMessage: handleSocketMessage,
    onOpen: () => {
      setConnectionStatus('connected')
      // Request current party state
      send({ type: 'sync_request' })
    },
    onClose: () => {
      setConnectionStatus('disconnected')
    },
    onError: () => {
      setConnectionStatus('disconnected')
      toast({
        title: 'Connection Error',
        description: 'Lost connection to the party. Trying to reconnect...',
        variant: 'destructive'
      })
    }
  })

  // Get streaming URL
  useEffect(() => {
    const getStreamingUrl = async () => {
      if (streamingUrl) {
        setActualStreamingUrl(streamingUrl)
        return
      }

      if (gdriveFileId) {
        try {
          const response = await fetch(`/api/videos/movies/${gdriveFileId}/stream/`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
          })

          if (response.ok) {
            const data = await response.json()
            setActualStreamingUrl(data.streaming_url)
          }
        } catch (err) {
          toast({
            title: 'Error',
            description: 'Failed to get video streaming URL',
            variant: 'destructive'
          })
        }
      }
    }

    getStreamingUrl()
  }, [streamingUrl, gdriveFileId])

  const handleSocketMessage = useCallback((data: any) => {
    switch (data.type) {
      case 'video_control':
        handleRemoteControl(data)
        break
      case 'party_state':
      case 'sync_response':
        handleSyncResponse(data.state)
        break
      case 'user_joined':
      case 'user_left':
        if (data.participant_count !== undefined) {
          setParticipants(data.participant_count)
        }
        break
      default:
        break
    }
  }, [])

  const handleRemoteControl = useCallback((data: any) => {
    if (!videoRef.current) return

    const video = videoRef.current
    const { action, video_time, user } = data

    // Don't sync our own actions
    if (user?.id === localStorage.getItem('user_id')) return

    setLastSyncTime(new Date())

    switch (action) {
      case 'play':
        video.currentTime = video_time
        setCurrentTime(video_time)
        setIsPlaying(true)
        video.play().catch(console.error)
        break
      case 'pause':
        video.currentTime = video_time
        setCurrentTime(video_time)
        setIsPlaying(false)
        video.pause()
        break
      case 'seek':
        video.currentTime = video_time
        setCurrentTime(video_time)
        break
    }
  }, [])

  const handleSyncResponse = useCallback((state: PlaybackState) => {
    if (!videoRef.current) return

    const video = videoRef.current
    const timeDiff = Math.abs(video.currentTime - state.current_timestamp)

    // Sync if difference is more than 2 seconds
    if (timeDiff > 2) {
      video.currentTime = state.current_timestamp
      setCurrentTime(state.current_timestamp)
    }

    if (state.is_playing !== isPlaying) {
      setIsPlaying(state.is_playing)
      if (state.is_playing) {
        video.play().catch(console.error)
      } else {
        video.pause()
      }
    }

    setLastSyncTime(new Date())
  }, [isPlaying])

  const sendControl = useCallback((action: string, videoTime?: number) => {
    if (!canControl) return

    send({
      type: 'video_control',
      action,
      video_time: videoTime ?? currentTime,
      timestamp: new Date().toISOString()
    })
  }, [canControl, currentTime, send])

  const handlePlayPause = useCallback(() => {
    if (!videoRef.current) return

    const video = videoRef.current
    
    if (isPlaying) {
      video.pause()
      setIsPlaying(false)
      sendControl('pause', video.currentTime)
    } else {
      video.play().catch(console.error)
      setIsPlaying(true)
      sendControl('play', video.currentTime)
    }
  }, [isPlaying, sendControl])

  const handleSeek = useCallback((time: number) => {
    if (!videoRef.current) return

    const video = videoRef.current
    video.currentTime = time
    setCurrentTime(time)
    
    if (canControl) {
      sendControl('seek', time)
    }
  }, [canControl, sendControl])

  const handleVolumeChange = useCallback((newVolume: number) => {
    if (!videoRef.current) return

    const video = videoRef.current
    video.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }, [])

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return

    const video = videoRef.current
    if (isMuted) {
      video.volume = volume || 0.5
      setIsMuted(false)
    } else {
      video.volume = 0
      setIsMuted(true)
    }
  }, [isMuted, volume])

  const toggleFullscreen = useCallback(() => {
    if (!videoRef.current) return

    const video = videoRef.current
    
    if (!isFullscreen) {
      if (video.requestFullscreen) {
        video.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }, [isFullscreen])

  const skipTime = useCallback((seconds: number) => {
    if (!videoRef.current || !canControl) return

    const video = videoRef.current
    const newTime = Math.max(0, Math.min(duration, video.currentTime + seconds))
    handleSeek(newTime)
  }, [duration, canControl, handleSeek])

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600)
    const minutes = Math.floor((time % 3600) / 60)
    const seconds = Math.floor(time % 60)
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // Video event handlers
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current && !isBuffering) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleWaiting = () => {
    setIsBuffering(true)
  }

  const handleCanPlay = () => {
    setIsBuffering(false)
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  if (!actualStreamingUrl) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading video...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="relative bg-black rounded-lg overflow-hidden">
      {/* Video Element */}
      <video
        ref={videoRef}
        src={actualStreamingUrl}
        className="w-full h-auto max-h-[70vh]"
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onWaiting={handleWaiting}
        onCanPlay={handleCanPlay}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        crossOrigin="anonymous"
        playsInline
      />

      {/* Loading/Buffering Overlay */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      )}

      {/* Controls Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4">
        {/* Progress Bar */}
        <div className="mb-4">
          <Slider
            value={[currentTime]}
            max={duration}
            step={1}
            onValueChange={([value]) => canControl && handleSeek(value)}
            className="w-full"
            disabled={!canControl}
          />
          <div className="flex justify-between text-xs text-white mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Skip Backward */}
            {canControl && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => skipTime(-10)}
                className="text-white hover:bg-white/20"
              >
                <SkipBack className="h-4 w-4" />
              </Button>
            )}

            {/* Play/Pause */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePlayPause}
              disabled={!canControl}
              className="text-white hover:bg-white/20"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>

            {/* Skip Forward */}
            {canControl && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => skipTime(10)}
                className="text-white hover:bg-white/20"
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            )}

            {/* Volume Control */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className="text-white hover:bg-white/20"
              >
                {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume]}
                max={1}
                step={0.1}
                onValueChange={([value]) => handleVolumeChange(value)}
                className="w-20"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Status Indicators */}
            <div className="flex items-center space-x-2 text-white text-sm">
              <div className="flex items-center space-x-1">
                <Users className="h-3 w-3" />
                <span>{participants}</span>
              </div>
              
              <div className="flex items-center space-x-1">
                {connectionStatus === 'connected' ? (
                  <Wifi className="h-3 w-3 text-green-400" />
                ) : (
                  <WifiOff className="h-3 w-3 text-red-400" />
                )}
              </div>

              {lastSyncTime && (
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span className="text-xs">
                    {Math.floor((Date.now() - lastSyncTime.getTime()) / 1000)}s
                  </span>
                </div>
              )}
            </div>

            {/* Fullscreen */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="text-white hover:bg-white/20"
            >
              <Maximize className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Movie Title Overlay */}
      {movieTitle && (
        <div className="absolute top-4 left-4">
          <Badge variant="secondary" className="bg-black/80 text-white">
            {movieTitle}
          </Badge>
        </div>
      )}

      {/* Control Permission Indicator */}
      {!canControl && (
        <div className="absolute top-4 right-4">
          <Badge variant="secondary" className="bg-black/80 text-white">
            {isHost ? 'Host' : 'Viewer'}
          </Badge>
        </div>
      )}

      {/* Connection Status Alert */}
      {connectionStatus === 'disconnected' && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Alert variant="destructive" className="bg-red-600/90 text-white border-red-500">
            <WifiOff className="h-4 w-4" />
            <AlertDescription>
              Connection lost. Video may be out of sync.
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  )
}

export default SynchronizedVideoPlayer
