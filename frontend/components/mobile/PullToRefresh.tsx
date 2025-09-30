"use client"

import { useState } from "react"

interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: React.ReactNode
  threshold?: number
  className?: string
}

export default function PullToRefresh({
  onRefresh,
  children,
  threshold = 80,
  className = ""
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [startY, setStartY] = useState(0)

  const handleTouchStart = (e: React.TouchEvent) => {
    // Only allow pull to refresh when at the top of the page
    if (window.scrollY === 0) {
      setStartY(e.touches[0].clientY)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY === 0 || window.scrollY > 0 || isRefreshing) return

    const currentY = e.touches[0].clientY
    const distance = currentY - startY

    if (distance > 0) {
      // Prevent default scrolling when pulling down
      e.preventDefault()
      
      // Apply resistance effect
      const resistance = distance > threshold ? 0.5 : 0.8
      setPullDistance(distance * resistance)
    }
  }

  const handleTouchEnd = async () => {
    if (pullDistance > threshold && !isRefreshing) {
      setIsRefreshing(true)
      try {
        await onRefresh()
      } catch (error) {
        console.error("Refresh failed:", error)
      } finally {
        setIsRefreshing(false)
      }
    }
    
    setPullDistance(0)
    setStartY(0)
  }

  const getRefreshIcon = () => {
    if (isRefreshing) {
      return "🔄"
    } else if (pullDistance > threshold) {
      return "⬆️"
    } else {
      return "⬇️"
    }
  }

  const getRefreshText = () => {
    if (isRefreshing) {
      return "Refreshing..."
    } else if (pullDistance > threshold) {
      return "Release to refresh"
    } else {
      return "Pull to refresh"
    }
  }

  return (
    <div
      className={className}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: `translateY(${pullDistance}px)`,
        transition: pullDistance === 0 ? "transform 0.3s ease-out" : "none"
      }}
    >
      {/* Pull to Refresh Indicator */}
      {(pullDistance > 0 || isRefreshing) && (
        <div
          className="flex items-center justify-center py-4 bg-white/5 border-b border-white/10"
          style={{
            opacity: Math.min(pullDistance / threshold, 1),
            transform: `translateY(-${Math.max(0, 60 - pullDistance)}px)`
          }}
        >
          <div className="flex items-center gap-2 text-white/80">
            <span
              className={`text-lg ${isRefreshing ? "animate-spin" : ""}`}
              style={{
                transform: pullDistance > 0 && !isRefreshing 
                  ? `rotate(${Math.min(pullDistance * 2, 180)}deg)` 
                  : undefined
              }}
            >
              {getRefreshIcon()}
            </span>
            <span className="text-sm font-medium">{getRefreshText()}</span>
          </div>
        </div>
      )}

      {children}
    </div>
  )
}