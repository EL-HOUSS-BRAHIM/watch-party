'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { DashboardHeader } from "@/components/layout/dashboard-header"
import MobileNavigation from "@/components/mobile/MobileNavigation"
import { userApi, analyticsApi, User, NormalizedRealTimeAnalytics } from "@/lib/api-client"

// Enhanced navigation with categories, icons, and metadata
const navigationSections = [
  {
    title: "Core",
    items: [
      { href: "/dashboard", label: "Overview", icon: "🏠", description: "Dashboard home", badge: null },
      { href: "/dashboard/parties", label: "Watch Parties", icon: "🎬", description: "Host & join parties", badge: "live" },
      { href: "/dashboard/videos", label: "Media Library", icon: "📱", description: "Your video collection", badge: null },
      { href: "/dashboard/chat", label: "Messages", icon: "💬", description: "Chat & communications", badge: "3" },
    ]
  },
  {
    title: "Social",
    items: [
      { href: "/dashboard/friends", label: "Friends", icon: "👥", description: "Manage connections", badge: "12" },
      { href: "/dashboard/social", label: "Communities", icon: "🌟", description: "Groups & discussions", badge: null },
      { href: "/dashboard/events", label: "Events", icon: "📅", description: "Upcoming events", badge: "2" },
      { href: "/dashboard/notifications", label: "Notifications", icon: "🔔", description: "Your updates", badge: "5" },
    ]
  },
  {
    title: "Discover",
    items: [
      { href: "/dashboard/search", label: "Explore", icon: "🔍", description: "Find content & users", badge: null },
      { href: "/dashboard/analytics", label: "Insights", icon: "📊", description: "Your activity stats", badge: null },
      { href: "/dashboard/store", label: "Store", icon: "🛒", description: "Premium features", badge: "new" },
    ]
  },
  {
    title: "Tools",
    items: [
      { href: "/dashboard/integrations", label: "Connections", icon: "🔗", description: "Third-party services", badge: null },
      { href: "/dashboard/support", label: "Help Center", icon: "🎫", description: "Support & guides", badge: null },
      { href: "/dashboard/admin", label: "Admin Panel", icon: "⚙️", description: "System management", badge: null },
      { href: "/settings", label: "Settings", icon: "🔧", description: "Preferences", badge: null },
    ]
  }
]

type DashboardLayoutProps = {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [liveStats, setLiveStats] = useState<NormalizedRealTimeAnalytics>({
    timestamp: "",
    onlineUsers: 0,
    activeParties: 0,
    recentActivity: [],
    engagement: {
      concurrentViewers: 0,
      messagesPerMinute: 0,
      reactionsPerMinute: 0
    },
    systemHealth: {
      systemLoad: 0,
      cpuUsage: 0,
      memoryUsage: 0,
      diskUsage: 0,
      networkTraffic: 0
    }
  })
  const [loading, setLoading] = useState(true)

  // Load user data and real-time stats
  useEffect(() => {
    loadUserData()
    loadRealTimeStats()
    
    // Fetch real-time stats every 30 seconds
    const interval = setInterval(() => {
      loadRealTimeStats()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const loadUserData = async () => {
    try {
      const userData = await userApi.getProfile()
      setUser(userData)
    } catch (error) {
      console.error("Failed to load user data:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadRealTimeStats = async () => {
    try {
      const realTimeData = await analyticsApi.getRealTime()
      setLiveStats(realTimeData)
    } catch (error) {
      console.error("Failed to load real-time stats:", error)
    }
  }

  const getBadgeColor = (badge: string | null) => {
    if (!badge) return ""
    if (badge === "live") return "bg-brand-coral text-white animate-pulse"
    if (badge === "new") return "bg-brand-cyan text-white"
    if (Number(badge)) return "bg-brand-blue text-white"
    return "bg-brand-purple text-white"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "bg-brand-cyan"
      case "away": return "bg-brand-orange"
      case "busy": return "bg-brand-coral"
      default: return "bg-gray-500"
    }
  }

  const getPlanColor = () => {
    if (user?.is_premium) return "from-brand-orange to-brand-coral"
    if (user?.is_staff) return "from-brand-purple to-brand-blue"
    return "from-gray-400 to-gray-600"
  }

  const getPlanLabel = () => {
    if (user?.is_premium) return "Premium"
    if (user?.is_staff) return "Pro"
    return "Free"
  }

  const getUserStatus = (): "online" | "away" | "busy" | "offline" => {
    if (user?.is_active) return "online"
    return "offline"
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-900 via-brand-purple/20 to-slate-900">
      {/* Dashboard Header - hide duplicate header on mobile */}
      <div className="hidden md:block">
        <DashboardHeader />
      </div>

      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-purple/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-brand-blue/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-brand-purple/5 to-transparent rounded-full"></div>
      </div>

      {/* Mobile Navigation - Shown only on mobile */}
      <MobileNavigation currentUser={user} />

      <div className="relative z-10 flex min-h-screen w-full flex-col pt-14 md:flex-row md:pt-16">
        {/* Enhanced Sidebar - Hidden on mobile, shown on desktop */}
        <aside className={cn(
          "hidden md:fixed left-0 top-0 h-full bg-black/20 backdrop-blur-xl border-r border-white/10 transition-all duration-300 z-50 md:block",
          isCollapsed ? "w-20" : "w-80"
        )}>
          {/* Sidebar Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
                <div className="w-10 h-10 bg-gradient-to-br from-brand-purple to-brand-blue rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  W
                </div>
                {!isCollapsed && (
                  <div>
                    <h1 className="text-xl font-bold text-white">WatchParty</h1>
                    <p className="text-xs text-white/60 uppercase tracking-wider">Cinema Hub</p>
                  </div>
                )}
              </div>
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white/70 hover:text-white"
              >
                {isCollapsed ? "→" : "←"}
              </button>
            </div>
          </div>

          {/* User Profile Section */}
          {!isCollapsed && user && (
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-brand-purple to-brand-magenta rounded-full flex items-center justify-center text-white font-semibold">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.username} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      user.username?.[0]?.toUpperCase() || "U"
                    )}
                  </div>
                  <div className={cn(
                    "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-black",
                    getStatusColor(getUserStatus())
                  )}></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{user.first_name || user.username}</p>
                  <p className="text-white/60 text-sm truncate">@{user.username}</p>
                  <div className={cn(
                    "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r",
                    getPlanColor()
                  )}>
                    ✨ {getPlanLabel()}
                  </div>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-white">{liveStats.onlineUsers.toLocaleString()}</div>
                  <div className="text-xs text-white/60">Online Users</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-white">{liveStats.activeParties}</div>
                  <div className="text-xs text-white/60">Live Parties</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-white">{liveStats.systemHealth.systemLoad.toFixed(1)}%</div>
                  <div className="text-xs text-white/60">System Load</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-white">{liveStats.engagement.messagesPerMinute.toLocaleString()}</div>
                  <div className="text-xs text-white/60">Messages / min</div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {navigationSections.map((section) => (
              <div key={section.title}>
                {!isCollapsed && (
                  <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3 px-3">
                    {section.title}
                  </h3>
                )}
                <nav className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 relative overflow-hidden",
                          isActive
                            ? "bg-gradient-to-r from-brand-purple/20 to-brand-blue/20 text-white border border-brand-purple/30 shadow-lg"
                            : "text-white/70 hover:text-white hover:bg-white/10"
                        )}
                        title={isCollapsed ? item.label : ""}
                      >
                        {/* Active indicator */}
                        {isActive && (
                          <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-brand-purple to-brand-blue rounded-r"></div>
                        )}
                        
                        <span className="text-lg flex-shrink-0">{item.icon}</span>
                        
                        {!isCollapsed && (
                          <>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{item.label}</div>
                              <div className="text-xs text-white/50 truncate">{item.description}</div>
                            </div>
                            
                            {item.badge && (
                              <span className={cn(
                                "px-2 py-1 text-xs font-bold rounded-full",
                                getBadgeColor(item.badge)
                              )}>
                                {item.badge}
                              </span>
                            )}
                          </>
                        )}
                        
                        {isCollapsed && item.badge && (
                          <div className={cn(
                            "absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold",
                            getBadgeColor(item.badge)
                          )}>
                            {Number(item.badge) ? item.badge : "!"}
                          </div>
                        )}
                      </Link>
                    )
                  })}
                </nav>
              </div>
            ))}
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-white/10">
            {!isCollapsed ? (
              <div className="space-y-3">
                <button className="w-full px-4 py-3 bg-gradient-to-r from-brand-purple to-brand-blue hover:from-brand-purple-dark hover:to-brand-blue-dark text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-brand-purple/25">
                  <span className="flex items-center justify-center gap-2">
                    <span>✨</span>
                    Create Party
                  </span>
                </button>
                <div className="flex gap-2">
                  <button className="flex-1 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm">
                    🎧 Audio
                  </button>
                  <button className="flex-1 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm">
                    🌙 Theme
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <button className="w-full p-3 bg-gradient-to-r from-brand-purple to-brand-blue hover:from-brand-purple-dark hover:to-brand-blue-dark text-white rounded-xl transition-all duration-200 shadow-lg">
                  ✨
                </button>
                <div className="grid grid-cols-2 gap-1">
                  <button className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm">
                    🎧
                  </button>
                  <button className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm">
                    🌙
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main
          className={cn(
            "flex-1 w-full overflow-x-hidden transition-all duration-300 pb-24 md:pb-0",
            isCollapsed ? "md:ml-20" : "md:ml-80"
          )}
        >
          {/* Page Content */}
          <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-7xl">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Floating Action Button */}
      <button className="hidden md:flex fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-brand-purple to-brand-blue hover:from-brand-purple-dark hover:to-brand-blue-dark text-white rounded-full shadow-2xl hover:shadow-brand-purple/50 transition-all duration-300 z-50 items-center justify-center text-xl">
        ⚡
      </button>

      {/* Live Status Indicator */}
      <div className="hidden md:flex fixed bottom-6 left-6 bg-black/40 backdrop-blur-lg rounded-full px-4 py-2 border border-white/20 z-40">
        <div className="flex items-center gap-2 text-white text-sm">
          <div className="w-2 h-2 bg-brand-cyan rounded-full animate-pulse"></div>
          <span>System Online</span>
        </div>
      </div>
    </div>
  )
}
