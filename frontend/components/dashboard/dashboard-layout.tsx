'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { DashboardHeader } from "@/components/layout/dashboard-header"

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
  const [user, setUser] = useState({
    name: "Alex Johnson",
    username: "@alexj",
    avatar: null,
    status: "online" as "online" | "away" | "busy" | "offline",
    plan: "Pro" as "Free" | "Pro" | "Premium"
  })
  const [onlineUsers, setOnlineUsers] = useState(1247)
  const [activeParties, setActiveParties] = useState(89)

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineUsers(prev => prev + Math.floor(Math.random() * 10) - 5)
      setActiveParties(prev => Math.max(0, prev + Math.floor(Math.random() * 6) - 3))
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const getBadgeColor = (badge: string | null) => {
    if (!badge) return ""
    if (badge === "live") return "bg-red-500 text-white animate-pulse"
    if (badge === "new") return "bg-green-500 text-white"
    if (Number(badge)) return "bg-blue-500 text-white"
    return "bg-purple-500 text-white"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "bg-green-500"
      case "away": return "bg-yellow-500"
      case "busy": return "bg-red-500"
      default: return "bg-gray-500"
    }
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "Premium": return "from-yellow-400 to-orange-500"
      case "Pro": return "from-purple-400 to-blue-500"
      default: return "from-gray-400 to-gray-600"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Dashboard Header */}
      <DashboardHeader />
      
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-purple-500/5 to-transparent rounded-full"></div>
      </div>

      <div className="relative z-10 flex min-h-screen pt-16">
        {/* Enhanced Sidebar */}
        <aside className={cn(
          "fixed left-0 top-0 h-full bg-black/20 backdrop-blur-xl border-r border-white/10 transition-all duration-300 z-50",
          isCollapsed ? "w-20" : "w-80"
        )}>
          {/* Sidebar Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
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
          {!isCollapsed && (
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      user.name.split(' ').map(n => n[0]).join('')
                    )}
                  </div>
                  <div className={cn(
                    "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-black",
                    getStatusColor(user.status)
                  )}></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{user.name}</p>
                  <p className="text-white/60 text-sm truncate">{user.username}</p>
                  <div className={cn(
                    "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r",
                    getPlanColor(user.plan)
                  )}>
                    ✨ {user.plan}
                  </div>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-white">{onlineUsers.toLocaleString()}</div>
                  <div className="text-xs text-white/60">Online Users</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-white">{activeParties}</div>
                  <div className="text-xs text-white/60">Live Parties</div>
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
                            ? "bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white border border-purple-500/30 shadow-lg"
                            : "text-white/70 hover:text-white hover:bg-white/10"
                        )}
                        title={isCollapsed ? item.label : ""}
                      >
                        {/* Active indicator */}
                        {isActive && (
                          <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-purple-500 to-blue-500 rounded-r"></div>
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
                <button className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-purple-500/25">
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
                <button className="w-full p-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl transition-all duration-200 shadow-lg">
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
        <main className={cn(
          "flex-1 transition-all duration-300",
          isCollapsed ? "ml-20" : "ml-80"
        )}>
          {/* Top Navigation Bar */}
          <header className="sticky top-0 z-40 bg-black/20 backdrop-blur-xl border-b border-white/10">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-white/60">
                    <span>🌍</span>
                    <span className="text-sm">Global Community</span>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  {/* Quick Search */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Quick search..."
                      className="w-64 px-4 py-2 pl-10 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">🔍</span>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white/70 hover:text-white relative">
                      <span>💬</span>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"></div>
                    </button>
                    <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white/70 hover:text-white relative">
                      <span>🔔</span>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                    </button>
                    <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white/70 hover:text-white">
                      <span>⚙️</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Floating Action Button */}
      <button className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 z-50 flex items-center justify-center text-xl">
        ⚡
      </button>

      {/* Live Status Indicator */}
      <div className="fixed bottom-6 left-6 bg-black/40 backdrop-blur-lg rounded-full px-4 py-2 border border-white/20 z-40">
        <div className="flex items-center gap-2 text-white text-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>System Online</span>
        </div>
      </div>
    </div>
  )
}
