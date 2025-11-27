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
    if (badge === "live") return "bg-red-500 text-white animate-pulse"
    if (badge === "new") return "bg-brand-cyan text-white"
    if (Number(badge)) return "bg-brand-purple text-white"
    return "bg-brand-purple text-white"
  }

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
            "hidden border-r border-brand-navy/5 bg-white/80 backdrop-blur-xl transition-all duration-300 md:fixed md:left-0 md:top-16 md:flex md:flex-col md:h-[calc(100vh-4rem)] shadow-[2px_0_20px_rgba(0,0,0,0.03)] z-20",
            hasPageSidebar ? "hidden md:hidden" : (isCollapsed ? "w-20" : "w-64")
          )}
          aria-hidden={hasPageSidebar}
        >
          {/* Collapse Toggle */}
          <div className="flex-shrink-0 flex items-center justify-end p-3 border-b border-brand-navy/5">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-navy/40 transition-all hover:bg-brand-navy/5 hover:text-brand-navy"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? "→" : "←"}
            </button>
          </div>

          {/* Navigation - Scrollable */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 scrollbar-thin scrollbar-thumb-brand-navy/10 scrollbar-track-transparent hover:scrollbar-thumb-brand-navy/20">
            <nav className="space-y-6">
              {navigationSections.map((section) => (
                <div key={section.title}>
                  {!isCollapsed && (
                    <div className="flex items-center gap-2 mb-3 px-3">
                      <span className="text-xs">{section.icon}</span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-navy/40">
                        {section.title}
                      </span>
                    </div>
                  )}
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const isActive = pathname === item.href
                      const badge = getBadgeValue(item, dynamicBadges)
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                            isCollapsed ? "justify-center" : "",
                            isActive
                              ? "bg-gradient-to-r from-brand-purple/10 to-brand-blue/10 text-brand-navy"
                              : "text-brand-navy/60 hover:bg-brand-navy/5 hover:text-brand-navy"
                          )}
                          title={isCollapsed ? item.label : ""}
                        >
                          {isActive && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-gradient-to-b from-brand-purple to-brand-blue rounded-r-full" />
                          )}

                          <span className={cn(
                            "flex-shrink-0 text-lg transition-transform duration-200", 
                            isActive ? "scale-110" : "group-hover:scale-105"
                          )}>
                            {item.icon}
                          </span>

                          {!isCollapsed && (
                            <>
                              <span className={cn(
                                "flex-1 truncate",
                                isActive ? "font-semibold" : ""
                              )}>
                                {item.label}
                              </span>

                              {badge && (
                                <span className={cn(
                                  "min-w-[20px] h-5 flex items-center justify-center rounded-full px-1.5 text-[10px] font-bold",
                                  getBadgeColor(badge)
                                )}>
                                  {badge}
                                </span>
                              )}
                            </>
                          )}

                          {isCollapsed && badge && (
                            <div className={cn(
                              "absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-white",
                              getBadgeColor(badge).split(' ')[0]
                            )} />
                          )}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </div>

          {/* Footer - Fixed at bottom */}
          <div className="flex-shrink-0 border-t border-brand-navy/5 p-3 bg-gradient-to-t from-brand-navy/[0.02] to-transparent">
            {!isCollapsed ? (
              <div className="space-y-3">
                {/* Live Stats - Compact */}
                <div className="flex items-center justify-between rounded-lg bg-brand-navy/5 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </div>
                    <span className="text-xs text-brand-navy/60">Live</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-brand-navy/70">
                    <span>👥 {liveStats.onlineUsers}</span>
                    <span>🎬 {liveStats.activeParties}</span>
                  </div>
                </div>

                {/* Create Party Button */}
                <Link
                  href="/dashboard/parties/create"
                  className="flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-brand-purple to-brand-blue px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:shadow-brand-purple/25 hover:-translate-y-0.5"
                >
                  <span>✨</span>
                  <span>New Party</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Compact Stats */}
                <div className="flex flex-col items-center rounded-lg bg-brand-navy/5 py-2">
                  <div className="relative flex h-2 w-2 mb-1">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </div>
                  <span className="text-[10px] font-bold text-brand-navy">{liveStats.onlineUsers}</span>
                </div>

                {/* Create Button - Icon only */}
                <Link
                  href="/dashboard/parties/create"
                  className="flex items-center justify-center w-full rounded-xl bg-gradient-to-r from-brand-purple to-brand-blue p-2.5 text-white shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5"
                  title="Create Party"
                >
                  <span>✨</span>
                </Link>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main
          className={cn(
            "flex-1 w-full overflow-x-hidden transition-all duration-300 pb-24 md:pb-0",
            // If a page provides its own left sidebar, don't add the default left margin
            hasPageSidebar ? "md:ml-0" : (isCollapsed ? "md:ml-20" : "md:ml-64")
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

      {/* Floating Action Button - Only show when sidebar is collapsed */}
      {isCollapsed && (
        <Link
          href="/dashboard/parties/create"
          className="fixed bottom-6 right-6 hidden h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-purple to-brand-blue text-xl text-white shadow-xl shadow-brand-purple/30 transition-all hover:-translate-y-1 hover:scale-105 hover:shadow-brand-purple/40 md:flex z-50"
        >
          ✨
        </Link>
      )}
    </div>
  )
}
