"use client"

import { cn } from "@/lib/utils"

interface SkeletonLoaderProps {
  className?: string
  lines?: number
  avatar?: boolean
}

export function SkeletonLoader({ className, lines = 3, avatar = false }: SkeletonLoaderProps) {
  return (
    <div className={cn("animate-pulse", className)}>
      {avatar && (
        <div className="flex items-center space-x-4 mb-4">
          <div className="rounded-full bg-gray-300 h-10 w-10"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      )}
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className={cn("h-4 bg-gray-300 rounded", i === lines - 1 ? "w-2/3" : "w-full")} />
        ))}
      </div>
    </div>
  )
}
