"use client"

import { useState, useEffect } from "react"

interface TouchGesture {
  startX: number
  startY: number
  endX: number
  endY: number
  startTime: number
  endTime: number
}

interface SwipeGestureProps {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  onTap?: () => void
  onDoubleTap?: () => void
  onLongPress?: () => void
  children: React.ReactNode
  className?: string
  threshold?: number
  timeThreshold?: number
  longPressTime?: number
}

export default function SwipeGesture({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onTap,
  onDoubleTap,
  onLongPress,
  children,
  className = "",
  threshold = 50,
  timeThreshold = 300,
  longPressTime = 500
}: SwipeGestureProps) {
  const [gesture, setGesture] = useState<TouchGesture | null>(null)
  const [lastTap, setLastTap] = useState<number>(0)
  const [longPressTimeout, setLongPressTimeout] = useState<NodeJS.Timeout | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    const now = Date.now()
    
    setGesture({
      startX: touch.clientX,
      startY: touch.clientY,
      endX: touch.clientX,
      endY: touch.clientY,
      startTime: now,
      endTime: now
    })

    // Start long press timer
    if (onLongPress) {
      const timeout = setTimeout(() => {
        onLongPress()
      }, longPressTime)
      setLongPressTimeout(timeout)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!gesture) return
    
    const touch = e.touches[0]
    setGesture(prev => prev ? {
      ...prev,
      endX: touch.clientX,
      endY: touch.clientY,
      endTime: Date.now()
    } : null)

    // Cancel long press if moved too much
    if (longPressTimeout) {
      const deltaX = Math.abs(touch.clientX - gesture.startX)
      const deltaY = Math.abs(touch.clientY - gesture.startY)
      if (deltaX > 10 || deltaY > 10) {
        clearTimeout(longPressTimeout)
        setLongPressTimeout(null)
      }
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!gesture) return

    // Clear long press timeout
    if (longPressTimeout) {
      clearTimeout(longPressTimeout)
      setLongPressTimeout(null)
    }

    const deltaX = gesture.endX - gesture.startX
    const deltaY = gesture.endY - gesture.startY
    const deltaTime = gesture.endTime - gesture.startTime
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

    // Check for tap
    if (distance < 10 && deltaTime < timeThreshold) {
      const now = Date.now()
      const timeSinceLastTap = now - lastTap

      if (timeSinceLastTap < 300 && onDoubleTap) {
        // Double tap
        onDoubleTap()
        setLastTap(0)
      } else {
        // Single tap
        if (onTap) {
          setTimeout(() => {
            if (Date.now() - now >= 250) {
              onTap()
            }
          }, 250)
        }
        setLastTap(now)
      }
    }
    // Check for swipe
    else if (distance > threshold && deltaTime < timeThreshold) {
      const absX = Math.abs(deltaX)
      const absY = Math.abs(deltaY)

      if (absX > absY) {
        // Horizontal swipe
        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight()
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft()
        }
      } else {
        // Vertical swipe
        if (deltaY > 0 && onSwipeDown) {
          onSwipeDown()
        } else if (deltaY < 0 && onSwipeUp) {
          onSwipeUp()
        }
      }
    }

    setGesture(null)
  }

  useEffect(() => {
    return () => {
      if (longPressTimeout) {
        clearTimeout(longPressTimeout)
      }
    }
  }, [longPressTimeout])

  return (
    <div
      className={className}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: "manipulation" }}
    >
      {children}
    </div>
  )
}