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
        ? "bg-brand-coral/10 text-brand-coral border border-brand-coral/30" 
        : "bg-brand-navy/5 text-brand-navy/60 border border-brand-navy/20",
      className
    )}>
      <div className={cn(
        "w-2 h-2 rounded-full",
        isLive ? "bg-brand-coral" : "bg-brand-navy/40",
        isLive && pulse && "animate-pulse"
      )}></div>
      <span>{label}</span>
      {count !== undefined && (
        <span className="text-xs opacity-75">({count})</span>
      )}
    </div>
  )
}