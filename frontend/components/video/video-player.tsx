"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { useSocket } from "@/contexts/socket-context"
import { cn } from "@/lib/utils"
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Settings, SkipBack, SkipForward } from "lucide-react"

interface VideoPlayerProps {
  src: string
  partyId?: string
  isHost?: boolean
  className?: string
  onTimeUpdate?: (time: number) => void
  onPlay?: () => void
  onPause?: () => void
}

interface VideoState {
  playing: boolean
  currentTime: number
  duration: number
  volume: number
  muted: boolean
  fullscreen: boolean
  buffered: number
}

export function VideoPlayer({
  src,
  partyId,
  isHost = false,
  className,
  onTimeUpdate,
  onPlay,
  onPause,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { socket } = useSocket(partyId ? `/party/${partyId}` : undefined)

  const [videoState, setVideoState] = useState<VideoState>({
    playing: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    muted: false,
    fullscreen: false,
    buffered: 0,
  })

  const [showControls, setShowControls] = useState(true)
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null)

  // Sync with party if connected
  useEffect(() => {
    if (!socket || !partyId) return

    const handleVideoControl = (data: any) => {
      if (!videoRef.current) return

      const video = videoRef.current
      const timeDiff = Math.abs(video.currentTime - data.currentTime)

      // Sync if difference is more than 1 second
      if (timeDiff > 1) {
        video.currentTime = data.currentTime
      }

      if (data.action === "play" && video.paused) {
        video.play()
      } else if (data.action === "pause" && !video.paused) {
        video.pause()
      }
    }

    socket.on("video:control", handleVideoControl)
    return () => socket.off("video:control")
  }, [socket, partyId])

  // Emit control events if host
  const emitControl = useCallback(
    (action: string, currentTime?: number) => {
      if (isHost && socket && partyId) {
        socket.emit("video:control", {
          action,
          currentTime: currentTime ?? videoRef.current?.currentTime ?? 0,
          timestamp: Date.now(),
        })
      }
    },
    [isHost, socket, partyId],
  )

  // Video event handlers
  const handlePlay = () => {
    setVideoState((prev) => ({ ...prev, playing: true }))
    emitControl("play")
    onPlay?.()
  }

  const handlePause = () => {
    setVideoState((prev) => ({ ...prev, playing: false }))
    emitControl("pause")
    onPause?.()
  }

  const handleTimeUpdate = () => {
    if (!videoRef.current) return

    const currentTime = videoRef.current.currentTime
    setVideoState((prev) => ({ ...prev, currentTime }))
    onTimeUpdate?.(currentTime)
  }

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return

    setVideoState((prev) => ({
      ...prev,
      duration: videoRef.current!.duration,
    }))
  }

  const handleVolumeChange = () => {
    if (!videoRef.current) return

    setVideoState((prev) => ({
      ...prev,
      volume: videoRef.current!.volume,
      muted: videoRef.current!.muted,
    }))
  }

  const handleProgress = () => {
    if (!videoRef.current) return

    const buffered = videoRef.current.buffered
    if (buffered.length > 0) {
      const bufferedEnd = buffered.end(buffered.length - 1)
      const duration = videoRef.current.duration
      setVideoState((prev) => ({
        ...prev,
        buffered: (bufferedEnd / duration) * 100,
      }))
    }
  }

  // Control functions
  const togglePlay = () => {
    if (!videoRef.current) return

    if (videoRef.current.paused) {
      videoRef.current.play()
    } else {
      videoRef.current.pause()
    }
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    videoRef.current.muted = !videoRef.current.muted
  }

  const handleSeek = (value: number[]) => {
    if (!videoRef.current) return

    const newTime = (value[0] / 100) * videoState.duration
    videoRef.current.currentTime = newTime
    emitControl("seek", newTime)
  }

  const handleVolumeSlider = (value: number[]) => {
    if (!videoRef.current) return
    videoRef.current.volume = value[0] / 100
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen()
      setVideoState((prev) => ({ ...prev, fullscreen: true }))
    } else {
      document.exitFullscreen()
      setVideoState((prev) => ({ ...prev, fullscreen: false }))
    }
  }

  const skipTime = (seconds: number) => {
    if (!videoRef.current) return

    const newTime = Math.max(0, Math.min(videoState.duration, videoRef.current.currentTime + seconds))
    videoRef.current.currentTime = newTime
    emitControl("seek", newTime)
  }

  // Controls visibility
  const showControlsTemporarily = () => {
    setShowControls(true)

    if (controlsTimeout) {
      clearTimeout(controlsTimeout)
    }

    const timeout = setTimeout(() => {
      setShowControls(false)
    }, 3000)

    setControlsTimeout(timeout)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <div
      ref={containerRef}
      className={cn("relative bg-black rounded-lg overflow-hidden group", className)}
      onMouseMove={showControlsTemporarily}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-contain"
        onPlay={handlePlay}
        onPause={handlePause}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onVolumeChange={handleVolumeChange}
        onProgress={handleProgress}
        onClick={togglePlay}
      />

      {/* Loading Overlay */}
      {!videoState.duration && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      )}

      {/* Controls Overlay */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0",
        )}
      >
        {/* Center Play Button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            variant="ghost"
            size="icon"
            className="w-16 h-16 rounded-full bg-black/50 hover:bg-black/70 text-white"
            onClick={togglePlay}
          >
            {videoState.playing ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
          </Button>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
          {/* Progress Bar */}
          <div className="space-y-1">
            <Slider
              value={[videoState.duration ? (videoState.currentTime / videoState.duration) * 100 : 0]}
              onValueChange={handleSeek}
              className="w-full"
              step={0.1}
            />
            <div className="flex justify-between text-xs text-white/80">
              <span>{formatTime(videoState.currentTime)}</span>
              <span>{formatTime(videoState.duration)}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={togglePlay}>
                {videoState.playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={() => skipTime(-10)}
              >
                <SkipBack className="w-5 h-5" />
              </Button>

              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => skipTime(10)}>
                <SkipForward className="w-5 h-5" />
              </Button>

              {/* Volume Control */}
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={toggleMute}>
                  {videoState.muted || videoState.volume === 0 ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </Button>
                <Slider
                  value={[videoState.muted ? 0 : videoState.volume * 100]}
                  onValueChange={handleVolumeSlider}
                  className="w-20"
                  step={1}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <Settings className="w-5 h-5" />
              </Button>

              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={toggleFullscreen}>
                {videoState.fullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Party Sync Indicator */}
      {partyId && (
        <div className="absolute top-4 right-4">
          <div className="bg-black/50 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-2">
            <div className="w-2 h-2 bg-accent-success rounded-full animate-pulse"></div>
            <span>Synced</span>
          </div>
        </div>
      )}
    </div>
  )
}
