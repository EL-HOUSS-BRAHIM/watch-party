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
        return "text-brand-cyan-light bg-green-500/20"
      case "purple":
        return "text-brand-purple-light bg-purple-500/20"
      case "yellow":
        return "text-brand-orange-light bg-yellow-500/20"
      case "red":
        return "text-brand-coral-light bg-red-500/20"
      default:
        return "text-brand-blue-light bg-blue-500/20"
    }
  }

  const formatChange = (change: number) => {
    const isPositive = change >= 0
    return (
      <span className={`text-sm flex items-center gap-1 ${
        isPositive ? "text-brand-cyan-light" : "text-brand-coral-light"
      }`}>
        <span>{isPositive ? "↗" : "↘"}</span>
        {Math.abs(change).toFixed(1)}%
      </span>
    )
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <p className="text-white/60 text-sm mb-1">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getColorClasses(color)}`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
      
      {change !== undefined && (
        <div className="flex items-center justify-between">
          {formatChange(change)}
          <span className="text-white/40 text-xs">vs last period</span>
        </div>
      )}
    </div>
  )
}