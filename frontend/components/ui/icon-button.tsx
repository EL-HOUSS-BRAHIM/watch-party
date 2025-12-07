"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface IconButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: "primary" | "secondary" | "ghost" | "danger"
  size?: "sm" | "md" | "lg"
  className?: string
  disabled?: boolean
  loading?: boolean
  gradient?: string
  type?: "button" | "submit" | "reset"
  title?: string
}

export function IconButton({ 
  children, 
  onClick, 
  variant = "primary",
  size = "md",
  className,
  disabled = false,
  loading = false,
  gradient,
  type = "button",
  title
}: IconButtonProps) {
  const baseClasses = "rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
  
  const variants = {
    primary: gradient 
      ? `bg-gradient-to-r ${gradient} hover:shadow-lg text-white`
      : "bg-gradient-to-r from-brand-purple to-brand-blue hover:from-brand-purple-dark hover:to-brand-blue-dark text-white shadow-lg hover:shadow-brand-purple/25",
    secondary: "bg-white border border-brand-navy/20 hover:bg-brand-neutral text-brand-navy",
    ghost: "text-brand-navy/70 hover:text-brand-navy hover:bg-brand-neutral/50",
    danger: "bg-gradient-to-r from-brand-coral to-brand-coral-dark hover:from-brand-coral-dark hover:to-brand-coral-dark text-white shadow-lg"
  }
  
  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-3",
    lg: "px-6 py-4 text-lg"
  }
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      title={title}
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        disabled && "opacity-50",
        className
      )}
    >
      {loading ? (
        <>
          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  )
}