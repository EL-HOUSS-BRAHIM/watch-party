"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { useSocket } from "@/contexts/socket-context"
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, SkipBack, SkipForward } from "lucide-react"

interface VideoPlayerProps {
  src: string
  poster?: string
  roomId: string
  isHost: boolean
}

export function VideoPlayer({ src, poster, roomId, isHost }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isBuffering, setIsBuffering] = useState(false)

  const { socket } = useSocket()

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
    }

    const handlePlay = () => {
      setIsPlaying(true)
      if (isHost && socket) {
        socket.emit("video_play", { roomId, currentTime: video.currentTime })
      }
    }

    const handlePause = () => {
      setIsPlaying(false)
      if (isHost && socket) {
        socket.emit("video_pause", { roomId, currentTime: video.currentTime })
      }
    }

    const handleWaiting = () => setIsBuffering(true)
    const handleCanPlay = () => setIsBuffering(false)

    video.addEventListener("loadedmetadata", handleLoadedMetadata)
    video.addEventListener("timeupdate", handleTimeUpdate)
    video.addEventListener("play", handlePlay)
    video.addEventListener("pause", handlePause)
    video.addEventListener("waiting", handleWaiting)
    video.addEventListener("canplay", handleCanPlay)

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata)
      video.removeEventListener("timeupdate", handleTimeUpdate)
      video.removeEventListener("play", handlePlay)
      video.removeEventListener("pause", handlePause)
      video.removeEventListener("waiting", handleWaiting)
      video.removeEventListener("canplay", handleCanPlay)
    }
  }, [isHost, socket, roomId])

  // Socket event listeners for sync
  useEffect(() => {
    if (!socket) return

    const handleVideoPlay = (data: { currentTime: number }) => {
      const video = videoRef.current
      if (video && !isHost) {
        video.currentTime = data.currentTime
        video.play()
      }
    }

    const handleVideoPause = (data: { currentTime: number }) => {
      const video = videoRef.current
      if (video && !isHost) {
        video.currentTime = data.currentTime
        video.pause()
      }
    }

    const handleVideoSeek = (data: { currentTime: number }) => {
      const video = videoRef.current
      if (video && !isHost) {
        video.currentTime = data.currentTime
      }
    }

    socket.on("video_play", handleVideoPlay)
    socket.on("video_pause", handleVideoPause)
    socket.on("video_seek", handleVideoSeek)

    return () => {
      socket.off("video_play", handleVideoPlay)
      socket.off("video_pause", handleVideoPause)
      socket.off("video_seek", handleVideoSeek)
    }
  }, [socket, isHost])

  const togglePlayPause = () => {
    const video = videoRef.current
    if (!video || !isHost) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
  }

  const handleSeek = (value: number[]) => {
    const video = videoRef.current
    if (!video || !isHost) return

    const newTime = value[0]
    video.currentTime = newTime
    setCurrentTime(newTime)

    if (socket) {
      socket.emit("video_seek", { roomId, currentTime: newTime })
    }
  }

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current
    if (!video) return

    const newVolume = value[0]
    video.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    if (isMuted) {
      video.volume = volume
      setIsMuted(false)
    } else {
      video.volume = 0
      setIsMuted(true)
    }
  }

  const toggleFullscreen = () => {
    const container = containerRef.current
    if (!container) return

    if (!isFullscreen) {
      container.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const skip = (seconds: number) => {
    const video = videoRef.current
    if (!video || !isHost) return

    const newTime = Math.max(0, Math.min(duration, currentTime + seconds))
    video.currentTime = newTime

    if (socket) {
      socket.emit("video_seek", { roomId, currentTime: newTime })
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-black group"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-contain"
        onClick={togglePlayPause}
      />

      {/* Buffering Spinner */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      )}

      {/* Controls Overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Center Play Button */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              size="lg"
              onClick={togglePlayPause}
              disabled={!isHost}
              className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30"
            >
              <Play className="h-8 w-8 text-white ml-1" />
            </Button>
          </div>
        )}

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {/* Progress Bar */}
          <div className="mb-4">
            <Slider
              value={[currentTime]}
              max={duration}
              step={1}
              onValueChange={handleSeek}
              disabled={!isHost}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-white/80 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => skip(-10)}
                disabled={!isHost}
                className="text-white hover:bg-white/20"
              >
                <SkipBack className="h-4 w-4" />
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={togglePlayPause}
                disabled={!isHost}
                className="text-white hover:bg-white/20"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => skip(10)}
                disabled={!isHost}
                className="text-white hover:bg-white/20"
              >
                <SkipForward className="h-4 w-4" />
              </Button>

              <div className="flex items-center space-x-2 ml-4">
                <Button size="sm" variant="ghost" onClick={toggleMute} className="text-white hover:bg-white/20">
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={1}
                  step={0.1}
                  onValueChange={handleVolumeChange}
                  className="w-20"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                <Settings className="h-4 w-4" />
              </Button>

              <Button size="sm" variant="ghost" onClick={toggleFullscreen} className="text-white hover:bg-white/20">
                <Maximize className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Host Indicator */}
        {!isHost && (
          <div className="absolute top-4 left-4">
            <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1">
              <span className="text-white text-sm">👑 Host controls playback</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
