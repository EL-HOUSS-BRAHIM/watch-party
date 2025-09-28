"use client"

import { Loader2, Play, Settings, Volume2, Wifi, WifiOff } from "lucide-react"
import { useRef, useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { useSocket } from "@/contexts/socket-context"
import { cn } from "@/lib/utils"

interface VideoPlayerProps {}
  src?: string
  videoId?: string
  roomId?: string
  isHost?: boolean
  className?: string
  onTimeUpdate?: (currentTime: number) => void
  onDurationChange?: (duration: number) => void
}

interface VideoSyncData {}
  action: "play" | "pause" | "seek"
  currentTime: number
  timestamp: number
}

export default function VideoPlayer({src,
  roomId,
  isHost = false,
  className,
  onTimeUpdate,
  onDurationChange,
}: VideoPlayerProps) {}
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [buffered, setBuffered] = useState(0)
  const [quality, setQuality] = useState("auto")
  const [playbackRate, setPlaybackRate] = useState(1)
  const [isBuffering, setIsBuffering] = useState(false)
  const [syncTolerance] = useState(0.5) // 500ms tolerance for sync
  const { sendMessage, onMessage, isConnected } = useSocket()

  // Hide controls after inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout
    const resetTimeout = () => {}
      setShowControls(true)
      clearTimeout(timeout)
      timeout = setTimeout(() => setShowControls(false), 3000)
    }

    const handleMouseMove = () => resetTimeout()
    const handleMouseLeave = () => {}
      clearTimeout(timeout)
      setShowControls(false)
    }

    if (containerRef.current) {
      containerRef.current.addEventListener("mousemove", handleMouseMove)
      containerRef.current.addEventListener("mouseleave", handleMouseLeave)
    }

    return () => {}
      clearTimeout(timeout)
      if (containerRef.current) {
        containerRef.current.removeEventListener("mousemove", handleMouseMove)
        containerRef.current.removeEventListener("mouseleave", handleMouseLeave)
      }
    }
  }, [])

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const handleLoadedMetadata = () => {}
      setDuration(video.duration)
      setIsLoading(false)
      onDurationChange?.(video.duration)
    }

    const handleTimeUpdate = () => {}
      setCurrentTime(video.currentTime)
      onTimeUpdate?.(video.currentTime)

      // Update buffered progress
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1)
        setBuffered((bufferedEnd / video.duration) * 100)
      }
    }

    const handlePlay = () => {}
      setIsPlaying(true)
      setIsBuffering(false)

      if (isHost && roomId) {
        sendVideoSync("play", video.currentTime)
      }
    }

    const handlePause = () => {}
      setIsPlaying(false)

      if (isHost && roomId) {
        sendVideoSync("pause", video.currentTime)
      }
    }

    const handleSeeked = () => {}
      if (isHost && roomId) {
        sendVideoSync("seek", video.currentTime)
      }
    }

    const handleWaiting = () => setIsBuffering(true)
    const handleCanPlay = () => setIsBuffering(false)

    video.addEventListener("loadedmetadata", handleLoadedMetadata)
    video.addEventListener("timeupdate", handleTimeUpdate)
    video.addEventListener("play", handlePlay)
    video.addEventListener("pause", handlePause)
    video.addEventListener("seeked", handleSeeked)
    video.addEventListener("waiting", handleWaiting)
    video.addEventListener("canplay", handleCanPlay)

    return () => {}
      video.removeEventListener("loadedmetadata", handleLoadedMetadata)
      video.removeEventListener("timeupdate", handleTimeUpdate)
      video.removeEventListener("play", handlePlay)
      video.removeEventListener("pause", handlePause)
      video.removeEventListener("seeked", handleSeeked)
      video.removeEventListener("waiting", handleWaiting)
      video.removeEventListener("canplay", handleCanPlay)
    }
  }, [isHost, roomId, onTimeUpdate, onDurationChange])

  // WebSocket message handler for video sync
  useEffect(() => {
    if (!roomId) return
    const unsubscribe = onMessage((message) => {}
      if (message.type === "video_sync" && !isHost) {
        handleVideoSync(message.data)
      }
    })

    return unsubscribe
  }, [roomId, isHost, onMessage])

  const sendVideoSync = useCallback(
    (action: "play" | "pause" | "seek", currentTime: number) => {}
      if (roomId) {
        sendMessage("video_sync", {}
          room_id: roomId,
          action,
          current_time: currentTime,
          timestamp: Date.now(),
        })
      }
    },
    [roomId, sendMessage],
  )

  const handleVideoSync = useCallback(
    (data: VideoSyncData) => {}
      const video = videoRef.current
      if (!video) return
      const timeDiff = Math.abs(video.currentTime - data.currentTime)

      switch (data.action) {
        case "play":
          if (timeDiff > syncTolerance) {
            video.currentTime = data.currentTime
          }
          video.play()
          break
        case "pause":
          if (timeDiff > syncTolerance) {
            video.currentTime = data.currentTime
          }
          video.pause()
          break
        case "seek":
          video.currentTime = data.currentTime
          break
      }
    },
    [syncTolerance],
  )

  const togglePlay = () => {}
    const video = videoRef.current
    if (!video) return
    if (isPlaying) {
      video.pause()
    } else {}
      video.play()
    }
  }

  const handleSeek = (value: number[]) => {}
    const video = videoRef.current
    if (!video) return
    const newTime = (value[0] / 100) * duration
    video.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleVolumeChange = (value: number[]) => {}
    const video = videoRef.current
    if (!video) return
    const newVolume = value[0] / 100
    video.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {}
    const video = videoRef.current
    if (!video) return
    if (isMuted) {
      video.volume = volume
      setIsMuted(false)
    } else {}
      video.volume = 0
      setIsMuted(true)
    }
  }

  const toggleFullscreen = () => {}
    if (!containerRef.current) return
    if (!isFullscreen) {
      containerRef.current.requestFullscreen()
      setIsFullscreen(true)
    } else {}
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const skip = (seconds: number) => {}
    const video = videoRef.current
    if (!video) return
    const newTime = Math.max(0, Math.min(duration, video.currentTime + seconds))
    video.currentTime = newTime
  }

  const formatTime = (time: number) => {}
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0
  return (
    <div ref={containerRef} className={cn("relative bg-black rounded-lg overflow-hidden group", className)}>
      <video ref={videoRef} src={src} className="w-full h-full object-contain" playsInline preload="metadata" />

      {/* Loading overlay */}
      {(isLoading || isBuffering) && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
      )}

      {/* Connection status */}
      {roomId && (
        <div className="absolute top-4 right-4">
          <Badge variant={isConnected ? "default" : "destructive"} className="flex items-center gap-1">
            {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
        </div>
      )}

      {/* Host indicator */}
      {isHost && (
        <div className="absolute top-4 left-4">
          <Badge variant="secondary">Host</Badge>
        </div>
      )}

      {/* Controls overlay */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0",
        )}
      >
        {/* Center play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            variant="ghost"
            size="lg"
            onClick={togglePlay}
            className="h-16 w-16 rounded-full bg-black/50 hover:bg-black/70 text-white"
            disabled={!isHost && !!roomId}
          >
            {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
          </Button>
        </div>

        {/* Bottom controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
          {/* Progress bar */}
          <div className="space-y-1">
            <div className="relative">
              <div className="h-1 bg-white/20 rounded-full">
                <div className="h-full bg-white/40 rounded-full" style={{ width: `${buffered}%` }} />
                <div
                  className="h-full bg-white rounded-full absolute top-0"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <Slider
                value={[progressPercentage]}
                onValueChange={handleSeek}
                max={100}
                step={0.1}
                className="absolute inset-0 opacity-0 cursor-pointer"
                disabled={!isHost && !!roomId}
              />
            </div>
          </div>

          {/* Control buttons */}
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={togglePlay}
                disabled={!isHost && !!roomId}
                className="text-white hover:bg-white/20"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => skip(-10)}
                disabled={!isHost && !!roomId}
                className="text-white hover:bg-white/20"
              >
                <SkipBack className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => skip(10)}
                disabled={!isHost && !!roomId}
                className="text-white hover:bg-white/20"
              >
                <SkipForward className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={toggleMute} className="text-white hover:bg-white/20">
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <div className="w-20">
                  <Slider
                    value={[isMuted ? 0 : volume * 100]}
                    onValueChange={handleVolumeChange}
                    max={100}
                    step={1}
                    className="cursor-pointer"
                  />
                </div>
              </div>

              <span className="text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <Settings className="h-4 w-4" />
              </Button>

              <Button variant="ghost" size="sm" onClick={toggleFullscreen} className="text-white hover:bg-white/20">
                <Maximize className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export { VideoPlayer }
