"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface LiveBadgeProps {
  isLive: boolean
  viewerCount?: number
  className?: string
}

export function LiveBadge({ isLive, viewerCount, className }: LiveBadgeProps) {
  if (!isLive) return null

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Badge className="bg-gradient-live text-white animate-live-pulse border-0">
        <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
        LIVE
      </Badge>
      {viewerCount !== undefined && (
        <span className="text-sm text-neo-text-secondary">{viewerCount.toLocaleString()} watching</span>
      )}
    </div>
  )
}
