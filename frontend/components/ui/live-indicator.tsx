"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface LiveIndicatorProps {
  isLive?: boolean
  count?: number
  label?: string
  className?: string
}

export function LiveIndicator({ 
  isLive = true, 
  count, 
  label = "Live", 
  className 
}: LiveIndicatorProps) {
  const [pulse, setPulse] = useState(true)
  
  useEffect(() => {
    if (isLive) {
      const interval = setInterval(() => {
        setPulse(prev => !prev)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [isLive])
  
  return (
    <div className={cn(
      "inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium",
      isLive 
        ? "bg-red-500/20 text-brand-coral-light border border-red-500/30" 
        : "bg-gray-500/20 text-gray-400 border border-gray-500/30",
      className
    )}>
      <div className={cn(
        "w-2 h-2 rounded-full",
        isLive ? "bg-brand-coral" : "bg-gray-500",
        isLive && pulse && "animate-pulse"
      )}></div>
      <span>{label}</span>
      {count !== undefined && (
        <span className="text-xs opacity-75">({count})</span>
      )}
    </div>
  )
}