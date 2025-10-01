"use client"

import { useState, useEffect } from 'react'

export interface User {
  id: string
  name: string
  username: string
  avatar?: string
  status: 'online' | 'away' | 'busy' | 'offline'
  plan: 'Free' | 'Pro' | 'Premium'
}

export interface LiveStats {
  onlineUsers: number
  activeParties: number
  totalWatchTime: number
  newUsers: number
}

export interface NotificationSettings {
  sound: boolean
  desktop: boolean
  email: boolean
  theme: 'auto' | 'dark' | 'light'
}

export function useDesignSystem() {
  const [user, setUser] = useState<User>({
    id: '1',
    name: 'Alex Johnson',
    username: '@alexj',
    avatar: undefined,
    status: 'online',
    plan: 'Pro'
  })
  
  const [liveStats, setLiveStats] = useState<LiveStats>({
    onlineUsers: 1247,
    activeParties: 89,
    totalWatchTime: 25620,
    newUsers: 156
  })
  
  const [notifications, setNotifications] = useState<NotificationSettings>({
    sound: true,
    desktop: true,
    email: false,
    theme: 'auto'
  })
  
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveStats(prev => ({
        ...prev,
        onlineUsers: Math.max(1000, prev.onlineUsers + Math.floor(Math.random() * 20) - 10),
        activeParties: Math.max(0, prev.activeParties + Math.floor(Math.random() * 6) - 3),
        totalWatchTime: prev.totalWatchTime + Math.floor(Math.random() * 100),
        newUsers: prev.newUsers + Math.floor(Math.random() * 5)
      }))
    }, 15000)
    
    return () => clearInterval(interval)
  }, [])
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500 shadow-green-500/50'
      case 'away': return 'bg-yellow-500 shadow-yellow-500/50'
      case 'busy': return 'bg-red-500 shadow-red-500/50'
      default: return 'bg-gray-500'
    }
  }
  
  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'Premium': return 'from-yellow-400 to-orange-500'
      case 'Pro': return 'from-purple-400 to-blue-500'
      default: return 'from-gray-400 to-gray-600'
    }
  }
  
  const getBadgeColor = (badge: string | null | undefined) => {
    if (!badge) return ''
    if (badge === 'live') return 'bg-red-500 text-white animate-pulse shadow-red-500/50'
    if (badge === 'new') return 'bg-green-500 text-white shadow-green-500/50'
    if (Number(badge)) return 'bg-blue-500 text-white shadow-blue-500/50'
    return 'bg-purple-500 text-white shadow-purple-500/50'
  }
  
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }
  
  const getTimeOfDayGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }
  
  const toggleSidebar = () => setIsCollapsed(!isCollapsed)
  
  const updateUserStatus = (status: User['status']) => {
    setUser(prev => ({ ...prev, status }))
  }
  
  const updateNotificationSettings = (settings: Partial<NotificationSettings>) => {
    setNotifications(prev => ({ ...prev, ...settings }))
  }
  
  return {
    // State
    user,
    liveStats,
    notifications,
    isCollapsed,
    
    // Actions
    toggleSidebar,
    updateUserStatus,
    updateNotificationSettings,
    
    // Utilities
    getStatusColor,
    getPlanColor,
    getBadgeColor,
    formatNumber,
    getTimeOfDayGreeting,
    
    // Theme helpers
    theme: {
      glass: {
        card: 'bg-white/5 backdrop-blur-sm border border-white/10',
        hover: 'hover:bg-white/10 hover:border-white/20',
        strong: 'bg-white/10 backdrop-blur-md border border-white/15'
      },
      gradient: {
        primary: 'bg-gradient-to-r from-purple-600 to-blue-600',
        secondary: 'bg-gradient-to-r from-pink-500 to-rose-500',
        success: 'bg-gradient-to-r from-green-500 to-emerald-500',
        warning: 'bg-gradient-to-r from-yellow-500 to-orange-500',
        danger: 'bg-gradient-to-r from-red-500 to-pink-500'
      },
      animation: {
        bounce: 'transition-transform duration-200 hover:scale-105',
        glow: 'transition-shadow duration-300 hover:shadow-lg',
        float: 'animate-float'
      }
    }
  }
}