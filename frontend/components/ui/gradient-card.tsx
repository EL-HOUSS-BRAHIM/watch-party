"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface GradientCardProps {
  children: ReactNode
  className?: string
  gradient?: string
  blur?: boolean
  border?: boolean
  hover?: boolean
}

export function GradientCard({ 
  children, 
  className, 
  gradient = "from-purple-900/30 via-blue-900/20 to-purple-900/30",
  blur = true,
  border = true,
  hover = true
}: GradientCardProps) {
  return (
    <div 
      className={cn(
        "rounded-2xl p-6 transition-all duration-300",
        `bg-gradient-to-br ${gradient}`,
        blur && "backdrop-blur-sm",
        border && "border border-white/10",
        hover && "hover:border-white/20 hover:shadow-lg",
        className
      )}
    >
      {children}
    </div>
  )
}