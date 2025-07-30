'use client'

import { useState, useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'

interface VideoThumbnailPreviewProps {
  videoUrl: string
  thumbnailUrl: string
  duration: number
  onTimeUpdate?: (time: number) => void
  className?: string
}

export function VideoThumbnailPreview({
  videoUrl,
  thumbnailUrl,
  duration,
  onTimeUpdate,
  className = ''
}: VideoThumbnailPreviewProps) {
  const [isHovering, setIsHovering] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [previewPosition, setPreviewPosition] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (isHovering && videoRef.current) {
      videoRef.current.currentTime = currentTime
    }
  }, [currentTime, isHovering])

  const handleMouseEnter = () => {
    setIsHovering(true)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsHovering(false)
      setCurrentTime(0)
    }, 300)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = Math.max(0, Math.min(1, x / rect.width))
    const time = percentage * duration

    setCurrentTime(time)
    setPreviewPosition(percentage)
    onTimeUpdate?.(time)
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <div
      ref={containerRef}
      className={`relative group cursor-pointer ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      {/* Main thumbnail */}
      <div className="relative overflow-hidden rounded-lg">
        <img
          src={thumbnailUrl}
          alt="Video thumbnail"
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />
        
        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
          {formatTime(duration)}
        </div>

        {/* Hover overlay */}
        {isHovering && (
          <div className="absolute inset-0 bg-black bg-opacity-20" />
        )}
      </div>

      {/* Preview popup */}
      {isHovering && (
        <Card className="absolute z-50 p-2 shadow-lg border bg-background -top-20 transform -translate-x-1/2"
              style={{ left: `${previewPosition * 100}%` }}>
          <div className="w-40 h-24 relative overflow-hidden rounded">
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-full object-cover"
              muted
              preload="metadata"
            />
            
            {/* Time indicator */}
            <div className="absolute bottom-1 left-1 bg-black bg-opacity-75 text-white text-xs px-1 rounded">
              {formatTime(currentTime)}
            </div>
          </div>
          
          {/* Arrow pointing down */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-border" />
        </Card>
      )}

      {/* Progress bar on hover */}
      {isHovering && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white bg-opacity-30">
          <div 
            className="h-full bg-red-500 transition-all duration-100"
            style={{ width: `${previewPosition * 100}%` }}
          />
        </div>
      )}
    </div>
  )
}
