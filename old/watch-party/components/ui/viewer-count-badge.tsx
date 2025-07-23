"use client"

import { Badge } from "@/components/ui/badge"
import { Eye } from "lucide-react"
import { cn } from "@/lib/utils"

interface ViewerCountBadgeProps {
  count: number
  isLive?: boolean
  className?: string
}

export function ViewerCountBadge({ count, isLive = false, className }: ViewerCountBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn("flex items-center gap-1 bg-neo-surface/80 backdrop-blur-sm", isLive && "animate-pulse", className)}
    >
      <Eye className="w-3 h-3" />
      {count.toLocaleString()}
      {isLive && " watching"}
    </Badge>
  )
}
