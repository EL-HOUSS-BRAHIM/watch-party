"use client"

import { useState, useEffect, useCallback } from 'react'
import { analyticsApi, userApi } from '@/lib/api-client'

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
    id: '',
    name: '',
    username: '',
    avatar: undefined,
    status: 'offline',
    plan: 'Free'
  })
  
  const [liveStats, setLiveStats] = useState<LiveStats>({
    onlineUsers: 0,
    activeParties: 0,
    totalWatchTime: 0,
    newUsers: 0
  })
  
  const [notifications, setNotifications] = useState<NotificationSettings>({
    sound: true,
    desktop: true,
    email: false,
    theme: 'auto'
  })
  
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Load real user data
  const loadUserData = useCallback(async () => {
    try {
      const userData = await userApi.getProfile()
      setUser({
        id: userData.id,
        name: userData.full_name || userData.first_name || userData.username || '',
        username: userData.username ? `@${userData.username}` : '',
        avatar: userData.avatar,
        status: userData.is_online ? 'online' : 'offline',
        plan: userData.is_premium ? 'Premium' : userData.is_staff ? 'Pro' : 'Free'
      })
    } catch (error) {
      console.error('Failed to load user data:', error)
    }
  }, [])

  // Load real-time stats from API
  const loadLiveStats = useCallback(async () => {
    try {
      const realTimeData = await analyticsApi.getRealTime()
      setLiveStats({
        onlineUsers: realTimeData.onlineUsers || 0,
        activeParties: realTimeData.activeParties || 0,
        totalWatchTime: realTimeData.engagement?.concurrentViewers || 0,
        newUsers: 0 // This could be fetched from a separate endpoint if available
      })
    } catch (error) {
      console.error('Failed to load real-time stats:', error)
    }
  }, [])
  
  // Load data on mount and set up polling
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true)
      await Promise.all([loadUserData(), loadLiveStats()])
      setIsLoading(false)
    }

    initializeData()

    // Poll for live stats every 30 seconds
    const interval = setInterval(() => {
      loadLiveStats()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [loadUserData, loadLiveStats])
  
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
    isLoading,
    
    // Actions
    toggleSidebar,
    updateUserStatus,
    updateNotificationSettings,
    refreshStats: loadLiveStats,
    refreshUser: loadUserData,
    
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