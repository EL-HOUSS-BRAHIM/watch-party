"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface FeatureCardProps {
  title: string
  description: string
  icon: ReactNode
  onClick?: () => void
  gradient?: string
  className?: string
  disabled?: boolean
  badge?: string
}

export function FeatureCard({ 
  title, 
  description, 
  icon, 
  onClick, 
  gradient = "from-brand-purple to-brand-magenta",
  className,
  disabled = false,
  badge
}: FeatureCardProps) {
  const Component = onClick ? "button" : "div"
  
  return (
    <Component
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={cn(
        "bg-white/5 border border-white/10 rounded-2xl p-6 transition-all duration-300 text-left group",
        onClick && !disabled && "cursor-pointer hover:bg-white/10 hover:border-white/20 hover:shadow-lg",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <div className="relative">
        <div className={`w-16 h-16 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-lg transition-transform duration-200 ${onClick && !disabled ? 'group-hover:scale-110' : ''}`}>
          {icon}
        </div>
        {badge && (
          <div className="absolute -top-2 -right-2 px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold rounded-full">
            {badge}
          </div>
        )}
      </div>
      
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-white/60 mb-4 leading-relaxed">{description}</p>
      
      {onClick && !disabled && (
        <div className="text-brand-blue-light font-medium group-hover:text-brand-blue-light transition-colors flex items-center gap-2">
          Get Started
          <span className="transform group-hover:translate-x-1 transition-transform">→</span>
        </div>
      )}
    </Component>
  )
}