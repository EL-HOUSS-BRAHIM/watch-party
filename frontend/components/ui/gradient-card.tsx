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
  gradient = "from-white to-brand-neutral-light",
  blur = true,
  border = true,
  hover = true
}: GradientCardProps) {
  return (
    <div 
      className={cn(
        "rounded-3xl p-6 transition-all duration-300 shadow-[0_18px_45px_rgba(28,28,46,0.08)]",
        `bg-gradient-to-br ${gradient}`,
        blur && "backdrop-blur-sm",
        border && "border border-brand-navy/10",
        hover && "hover:border-brand-navy/20 hover:shadow-[0_24px_60px_rgba(28,28,46,0.12)]",
        className
      )}
    >
      {children}
    </div>
  )
}