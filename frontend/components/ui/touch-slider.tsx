"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { cn } from "@/lib/utils"

interface TouchSliderProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  className?: string
  disabled?: boolean
}

export function TouchSlider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  className,
  disabled = false,
}: TouchSliderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const sliderRef = useRef<HTMLDivElement>(null)

  const calculateValue = useCallback(
    (clientX: number) => {
      if (!sliderRef.current) return value

      const rect = sliderRef.current.getBoundingClientRect()
      const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
      const rawValue = min + percentage * (max - min)
      const steppedValue = Math.round(rawValue / step) * step
      return Math.max(min, Math.min(max, steppedValue))
    },
    [min, max, step, value],
  )

  const handleStart = useCallback(
    (clientX: number) => {
      if (disabled) return
      setIsDragging(true)
      const newValue = calculateValue(clientX)
      onChange(newValue)
    },
    [disabled, calculateValue, onChange],
  )

  const handleMove = useCallback(
    (clientX: number) => {
      if (!isDragging || disabled) return
      const newValue = calculateValue(clientX)
      onChange(newValue)
    },
    [isDragging, disabled, calculateValue, onChange],
  )

  const handleEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    handleStart(e.clientX)
  }

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      handleMove(e.clientX)
    },
    [handleMove],
  )

  const handleMouseUp = useCallback(() => {
    handleEnd()
  }, [handleEnd])

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
    const touch = e.touches[0]
    handleStart(touch.clientX)
  }

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      e.preventDefault()
      const touch = e.touches[0]
      handleMove(touch.clientX)
    },
    [handleMove],
  )

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      e.preventDefault()
      handleEnd()
    },
    [handleEnd],
  )

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      document.addEventListener("touchmove", handleTouchMove, { passive: false })
      document.addEventListener("touchend", handleTouchEnd, { passive: false })

      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
        document.removeEventListener("touchmove", handleTouchMove)
        document.removeEventListener("touchend", handleTouchEnd)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd])

  const percentage = ((value - min) / (max - min)) * 100

  return (
    <div
      ref={sliderRef}
      className={cn(
        "relative h-6 w-full cursor-pointer touch-none select-none",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <div className="absolute top-1/2 h-2 w-full -translate-y-1/2 rounded-full bg-gray-200">
        <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${percentage}%` }} />
      </div>
      <div
        className={cn(
          "absolute top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white border-2 border-blue-500 shadow-md transition-all",
          isDragging && "scale-110",
        )}
        style={{ left: `${percentage}%` }}
      />
    </div>
  )
}
