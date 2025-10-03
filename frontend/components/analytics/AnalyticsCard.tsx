"use client"

// React hooks available for future interactive features
// import { useState, useEffect } from "react"
// import { analyticsApi } from "@/lib/api-client"

interface AnalyticsCardProps {
  title: string
  value: string | number
  change?: number
  icon: string
  color?: "blue" | "green" | "purple" | "yellow" | "red"
}

export default function AnalyticsCard({ 
  title, 
  value, 
  change, 
  icon, 
  color = "blue" 
}: AnalyticsCardProps) {
  const getColorClasses = (color: string) => {
    switch (color) {
      case "green":
        return "text-brand-cyan-dark bg-brand-cyan/10"
      case "purple":
        return "text-brand-purple-dark bg-brand-purple/10"
      case "yellow":
        return "text-brand-orange-dark bg-brand-orange/10"
      case "red":
        return "text-brand-coral-dark bg-brand-coral/10"
      default:
        return "text-brand-blue-dark bg-brand-blue/10"
    }
  }

  const formatChange = (change: number) => {
    const isPositive = change >= 0
    return (
      <span
        className={`flex items-center gap-2 rounded-full px-2 py-1 text-xs font-semibold uppercase tracking-[0.3em] ${
          isPositive ? "bg-brand-cyan/10 text-brand-cyan-dark" : "bg-brand-coral/10 text-brand-coral-dark"
        }`}
      >
        <span>{isPositive ? "↗" : "↘"}</span>
        {Math.abs(change).toFixed(1)}%
      </span>
    )
  }

  return (
    <div className="rounded-3xl border border-brand-navy/10 bg-white/90 p-6 shadow-[0_18px_45px_rgba(28,28,46,0.08)] transition-all hover:-translate-y-0.5 hover:shadow-[0_28px_60px_rgba(28,28,46,0.12)]">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-navy/50">{title}</p>
          <p className="mt-2 text-3xl font-bold text-brand-navy">{value}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-[0_12px_30px_rgba(74,46,160,0.12)] ${getColorClasses(color)}`}>
          <span className="text-xl">{icon}</span>
        </div>
      </div>

      {change !== undefined && (
        <div className="flex items-center justify-between text-xs text-brand-navy/50">
          {formatChange(change)}
          <span className="font-medium">vs last period</span>
        </div>
      )}
    </div>
  )
}