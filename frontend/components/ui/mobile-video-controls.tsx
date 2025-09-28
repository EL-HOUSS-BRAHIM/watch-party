"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { TouchSlider } from "@/components/ui/touch-slider"
import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward, MoreVertical } from "lucide-react"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"

interface MobileVideoControlsProps {
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isMuted: boolean
  onPlayPause: () => void
  onSeek: (time: number) => void
  onVolumeChange: (volume: number) => void
  onMute: () => void
  onFullscreen: () => void
  onSkip: (seconds: number) => void
  className?: string
}

export function MobileVideoControls({
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  onPlayPause,
  onSeek,
  onVolumeChange,
  onMute,
  onFullscreen,
  onSkip,
  className,
}: MobileVideoControlsProps) {
  const [showControls, setShowControls] = useState(true)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)
  const isMobile = useIsMobile()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (showControls) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        setShowControls(false)
      }, 3000)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [showControls])

  const handleTouchStart = () => {
    setShowControls(true)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0

  if (!isMobile) return null

  return (
    <div
      className={cn(
        "absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300",
        showControls ? "opacity-100" : "opacity-0",
        className,
      )}
      onTouchStart={handleTouchStart}
    >
      {/* Top controls */}
      <div className="absolute top-4 right-4">
        <Button variant="ghost" size="sm" className="text-white">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>

      {/* Center play button */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Button
          variant="ghost"
          size="lg"
          onClick={onPlayPause}
          className="h-20 w-20 rounded-full bg-black/50 hover:bg-black/70 text-white"
        >
          {isPlaying ? <Pause className="h-10 w-10" /> : <Play className=&quot;h-10 w-10 ml-1&quot; />}
        </Button>
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 p-4 space-y-4">
        {/* Progress bar */}
        <div className="space-y-2">
          <TouchSlider
            value={progressPercentage}
            onChange={(value) => onSeek((value / 100) * duration)}
            className="h-8"
          />
          <div className="flex justify-between text-white text-sm">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Control buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => onSkip(-10)} className=&quot;text-white hover:bg-white/20&quot;>
              <SkipBack className="h-5 w-5" />
            </Button>

            <Button variant="ghost" size="sm" onClick={onPlayPause} className="text-white hover:bg-white/20">
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className=&quot;h-5 w-5&quot; />}
            </Button>

            <Button variant="ghost" size="sm" onClick={() => onSkip(10)} className=&quot;text-white hover:bg-white/20&quot;>
              <SkipForward className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowVolumeSlider(!showVolumeSlider)}
                className="text-white hover:bg-white/20"
              >
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className=&quot;h-5 w-5&quot; />}
              </Button>

              {showVolumeSlider && (
                <div className="absolute bottom-full right-0 mb-2 p-2 bg-black/80 rounded">
                  <div className="h-24 w-8 flex items-center justify-center">
                    <TouchSlider
                      value={isMuted ? 0 : volume * 100}
                      onChange={(value) => onVolumeChange(value / 100)}
                      className="h-20 w-8 rotate-[-90deg]"
                    />
                  </div>
                </div>
              )}
            </div>

            <Button variant="ghost" size="sm" onClick={onFullscreen} className="text-white hover:bg-white/20">
              <Maximize className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
