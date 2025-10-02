"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface StatsCardProps {
  title: string
  value: string | number
  change?: string
  icon: ReactNode
  trend?: "up" | "down" | "neutral"
  gradient?: string
  className?: string
}

export function StatsCard({ 
  title, 
  value, 
  change, 
  icon, 
  trend = "neutral",
  gradient = "from-brand-blue to-brand-cyan",
  className 
}: StatsCardProps) {
  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up": return "text-brand-cyan-light"
      case "down": return "text-brand-coral-light"
      default: return "text-white/60"
    }
  }
  
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return "📈"
      case "down": return "📉"
      default: return "➡️"
    }
  }
  
  return (
    <div className={cn("bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-200", className)}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-2xl shadow-lg`}>
          {icon}
        </div>
        {trend !== "neutral" && (
          <span className="text-lg">{getTrendIcon(trend)}</span>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="text-3xl font-bold text-white">{value}</div>
        <div className="text-sm text-white/60">{title}</div>
        {change && (
          <div className={cn("text-xs font-medium", getTrendColor(trend))}>
            {change}
          </div>
        )}
      </div>
    </div>
  )
}