'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect, useCallback } from "react"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { DashboardHeader } from "@/components/layout/dashboard-header"
import MobileNavigation from "@/components/mobile/MobileNavigation"
import { NAVIGATION_SECTIONS, getBadgeValue, DynamicBadges } from "@/components/dashboard/navigation"
import { userApi, analyticsApi, notificationsApi, User, NormalizedRealTimeAnalytics } from "@/lib/api-client"

// Use centralized navigation list (keeps mobile, sidebar and other menus in sync)
const navigationSections = NAVIGATION_SECTIONS

type DashboardLayoutProps = {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [hasPageSidebar, setHasPageSidebar] = useState(false)
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
  const [dynamicBadges, setDynamicBadges] = useState<DynamicBadges>({})
  const [_loading, setLoading] = useState(true)

  // Load user data and real-time stats
  useEffect(() => {
    loadUserData()
    loadRealTimeStats()
    loadDynamicBadges()

    // Detect client-side page-provided sidebars (pages can mark their sidebar with .page-sidebar)
    const detectPageSidebar = () => {
      if (typeof document === 'undefined') return false
      return Boolean(document.querySelector('.page-sidebar'))
    }

    setHasPageSidebar(detectPageSidebar())

    // Observe DOM mutations to catch dynamically mounted page sidebars
    let observer: MutationObserver | null = null
    if (typeof MutationObserver !== 'undefined') {
      observer = new MutationObserver(() => {
        setHasPageSidebar(detectPageSidebar())
      })
      observer.observe(document.body, { childList: true, subtree: true })
    }

    // Fetch real-time stats every 30 seconds
    const statsInterval = setInterval(() => {
      loadRealTimeStats()
    }, 30000)

    // Fetch dynamic badges every 60 seconds
    const badgesInterval = setInterval(() => {
      loadDynamicBadges()
    }, 60000)

    return () => {
      clearInterval(statsInterval)
      clearInterval(badgesInterval)
      if (observer) observer.disconnect()
    }
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
      // Update active parties badge from real-time data
      setDynamicBadges(prev => ({
        ...prev,
        activeParties: realTimeData.activeParties
      }))
    } catch (error) {
      console.error("Failed to load real-time stats:", error)
    }
  }

  const loadDynamicBadges = useCallback(async () => {
    try {
      // Fetch all badge counts in parallel
      const [notificationCount, friendRequests] = await Promise.allSettled([
        notificationsApi.getUnreadCount(),
        userApi.getFriendRequests()
      ])

      setDynamicBadges(prev => ({
        ...prev,
        unreadNotifications: notificationCount.status === 'fulfilled' 
          ? notificationCount.value?.count ?? 0 
          : prev.unreadNotifications,
        friendRequests: friendRequests.status === 'fulfilled' 
          ? friendRequests.value?.count ?? friendRequests.value?.results?.length ?? 0 
          : prev.friendRequests,
        // TODO: Add these when APIs are available
        // unreadMessages: messagesCount.status === 'fulfilled' ? messagesCount.value?.count ?? 0 : prev.unreadMessages,
        // upcomingEvents: eventsCount.status === 'fulfilled' ? eventsCount.value?.count ?? 0 : prev.upcomingEvents,
        hasNewStoreItems: true, // Can be fetched from store API if available
      }))
    } catch (error) {
      console.error("Failed to load dynamic badges:", error)
    }
  }, [])

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

  // Get system health status based on metrics
  const getSystemStatus = (): { status: "healthy" | "warning" | "critical"; label: string; color: string } => {
    const { cpuUsage, memoryUsage } = liveStats.systemHealth
    const avgLoad = (cpuUsage + memoryUsage) / 2

    if (avgLoad >= 90) {
      return { status: "critical", label: "System under heavy load", color: "bg-red-500" }
    }
    if (avgLoad >= 70) {
      return { status: "warning", label: "System busy", color: "bg-yellow-500" }
    }
    return { status: "healthy", label: "System online", color: "bg-brand-cyan" }
  }

  const systemStatus = getSystemStatus()

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-brand-neutral-bg text-brand-navy">
      {/* Dashboard Header - hide duplicate header on mobile */}
      <div className="hidden md:block">
        <DashboardHeader />
      </div>

      {/* Background Effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03]" />
        <div className="absolute -left-20 top-20 h-96 w-96 rounded-full bg-brand-magenta/5 blur-3xl" />
        <div className="absolute -right-16 bottom-32 h-[500px] w-[500px] rounded-full bg-brand-blue/5 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-radial from-brand-purple/5 via-transparent to-transparent opacity-50" />
      </div>

      {/* Mobile Navigation - Shown only on mobile */}
      <MobileNavigation currentUser={user} />

      <div className="relative z-10 flex min-h-screen w-full flex-col pt-16 md:flex-row">
        {/* Enhanced Sidebar */}
        <aside
          className={cn(
            "hidden border-r border-white/50 bg-white/60 backdrop-blur-xl transition-all duration-300 md:fixed md:left-0 md:top-16 md:block md:h-[calc(100vh-4rem)] overflow-y-auto shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20",
            hasPageSidebar ? "hidden md:hidden" : (isCollapsed ? "w-24" : "w-80")
          )}
          aria-hidden={hasPageSidebar}
        >
          {/* Sidebar Header */}
          <div className="hidden border-b border-brand-navy/5 p-6">
            <div className="flex items-center justify-between">
              <div className={cn("flex items-center gap-3", isCollapsed && "justify-center w-full")}> 
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-magenta to-brand-purple text-xl font-bold text-white shadow-lg shadow-brand-purple/20">
                  W
                </div>
                {!isCollapsed && (
                  <div>
                    <h1 className="text-lg font-bold text-brand-navy tracking-tight">WatchParty</h1>
                    <p className="text-[10px] uppercase tracking-[0.25em] text-brand-navy/50 font-bold">Cinema hub</p>
                  </div>
                )}
              </div>
              {!isCollapsed && (
                <button
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="rounded-lg border border-brand-navy/10 bg-white/50 p-2 text-brand-navy/60 transition-colors hover:bg-white hover:text-brand-navy hover:shadow-sm"
                  aria-label="Collapse navigation"
                >
                  ←
                </button>
              )}
            </div>
            {isCollapsed && (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="mt-4 w-full rounded-lg border border-brand-navy/10 bg-white/50 p-2 text-brand-navy/60 transition-colors hover:bg-white hover:text-brand-navy hover:shadow-sm"
                aria-label="Expand navigation"
              >
                →
              </button>
            )}
          </div>

          {/* Navigation */}
          <div className="flex-1 space-y-8 overflow-y-auto p-5">
            {navigationSections.map((section) => (
              <div key={section.title}>
                {!isCollapsed && (
                  <h3 className="mb-4 px-3 text-[11px] font-bold uppercase tracking-[0.2em] text-brand-navy/40">
                    {section.title}
                  </h3>
                )}
                <nav className="space-y-1.5">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href
                    const badge = getBadgeValue(item, dynamicBadges)
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "group relative flex items-center gap-3 overflow-hidden rounded-2xl px-4 py-3.5 text-sm font-medium transition-all duration-300",
                          isActive
                            ? "bg-white text-brand-navy shadow-[0_8px_20px_rgba(0,0,0,0.04)] ring-1 ring-black/5"
                            : "text-brand-navy/60 hover:bg-white/60 hover:text-brand-navy hover:shadow-sm"
                        )}
                        title={isCollapsed ? item.label : ""}
                      >
                        {isActive && (
                          <div className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-brand-magenta to-brand-blue rounded-r-full" />
                        )}

                        <span className={cn(
                          "flex-shrink-0 text-xl transition-transform duration-300 group-hover:scale-110", 
                          isActive ? "text-brand-purple scale-110" : "text-brand-navy/50 group-hover:text-brand-purple"
                        )}>
                          {item.icon}
                        </span>

                        {!isCollapsed && (
                          <>
                            <div className="min-w-0 flex-1">
                              <div className={cn("truncate font-semibold", isActive ? "text-brand-navy" : "text-brand-navy/80")}>{item.label}</div>
                              {item.description && <div className="truncate text-xs text-brand-navy/40 mt-0.5">{item.description}</div>}
                            </div>

                            {badge && (
                              <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-sm", getBadgeColor(badge))}>
                                {badge}
                              </span>
                            )}
                          </>
                        )}

                        {isCollapsed && badge && (
                          <div className={cn(
                            "absolute top-2 right-2 h-2.5 w-2.5 rounded-full ring-2 ring-white",
                            getBadgeColor(badge).split(' ')[0] // Extract bg color only
                          )} />
                        )}
                      </Link>
                    )
                  })}
                </nav>
              </div>
            ))}
          </div>

          {/* Footer Actions */}
          <div className="border-t border-brand-navy/5 p-5 bg-white/30 backdrop-blur-md">
            {!isCollapsed ? (
              <div className="space-y-3">
                {/* Live Stats Display */}
                <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-brand-purple/10 to-brand-blue/10 px-4 py-3 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-cyan opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-cyan"></span>
                    </div>
                    <span className="text-xs font-medium text-brand-navy/70">Live</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <span className="text-brand-navy/50">👥</span>
                      <span className="font-bold text-brand-navy">{liveStats.onlineUsers}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-brand-navy/50">🎬</span>
                      <span className="font-bold text-brand-navy">{liveStats.activeParties}</span>
                    </div>
                  </div>
                </div>

                <button className="btn-gradient w-full rounded-xl px-4 py-3.5 font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-brand-magenta/30">
                  <span className="flex items-center justify-center gap-2">
                    <span>✨</span>
                    Create party
                  </span>
                </button>
                <div className="flex gap-2">
                  <button className="flex-1 rounded-xl border border-brand-navy/10 bg-white/60 px-3 py-2.5 text-xs font-bold text-brand-navy transition-colors hover:bg-white hover:shadow-sm">
                    🎧 Audio
                  </button>
                  <button className="flex-1 rounded-xl border border-brand-navy/10 bg-white/60 px-3 py-2.5 text-xs font-bold text-brand-navy transition-colors hover:bg-white hover:shadow-sm">
                    🌙 Theme
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Compact Live Stats */}
                <div className="rounded-xl bg-gradient-to-r from-brand-purple/10 to-brand-blue/10 p-2 text-center">
                  <div className="text-xs font-bold text-brand-navy">{liveStats.onlineUsers}</div>
                  <div className="text-[10px] text-brand-navy/50">online</div>
                </div>

                <button className="btn-gradient w-full rounded-xl p-3 text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-brand-magenta/30 flex justify-center">
                  ✨
                </button>
                <div className="flex flex-col gap-2">
                  <button className="rounded-xl border border-brand-navy/10 bg-white/60 p-2.5 text-xs text-brand-navy transition-colors hover:bg-white hover:shadow-sm flex justify-center">
                    🎧
                  </button>
                  <button className="rounded-xl border border-brand-navy/10 bg-white/60 p-2.5 text-xs text-brand-navy transition-colors hover:bg-white hover:shadow-sm flex justify-center">
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
            // If a page provides its own left sidebar, don't add the default left margin
            hasPageSidebar ? "md:ml-0" : (isCollapsed ? "md:ml-24" : "md:ml-80")
          )}
        >
          {/* Page Content */}
          <div className="flex-1 px-4 py-8 sm:px-8 lg:px-10 xl:px-12">
            <div className="mx-auto w-full max-w-[1600px] space-y-8 animate-fade-in">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Floating Action Button */}
      <button className="fixed bottom-8 right-8 hidden h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-purple to-brand-blue text-2xl text-white shadow-2xl shadow-brand-purple/30 transition-all hover:-translate-y-1 hover:scale-105 hover:shadow-brand-purple/50 md:flex z-50">
        ⚡
      </button>

      {/* Live Status Indicator */}
      <div className="fixed bottom-8 left-8 hidden items-center gap-3 rounded-full border border-white/50 bg-white/80 backdrop-blur-md px-5 py-2.5 text-sm font-bold text-brand-navy shadow-lg shadow-brand-navy/5 md:flex z-50">
        <div className="relative flex h-3 w-3">
          <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", systemStatus.color)}></span>
          <span className={cn("relative inline-flex rounded-full h-3 w-3", systemStatus.color)}></span>
        </div>
        <span>{systemStatus.label}</span>
        {liveStats.onlineUsers > 0 && (
          <span className="text-brand-navy/50 text-xs ml-1">
            • {liveStats.onlineUsers} online
          </span>
        )}
      </div>
    </div>
  )
}
