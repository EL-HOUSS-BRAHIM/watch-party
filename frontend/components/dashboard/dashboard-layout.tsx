'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { DashboardHeader } from "@/components/layout/dashboard-header"
import MobileNavigation from "@/components/mobile/MobileNavigation"
import { NAVIGATION_SECTIONS } from "@/components/dashboard/navigation"
import { userApi, analyticsApi, User, NormalizedRealTimeAnalytics } from "@/lib/api-client"

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
  const [_loading, setLoading] = useState(true)

  // Load user data and real-time stats
  useEffect(() => {
    loadUserData()
    loadRealTimeStats()

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
    const interval = setInterval(() => {
      loadRealTimeStats()
    }, 30000)

    return () => {
      clearInterval(interval)
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
    <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-br from-brand-neutral via-white to-brand-neutral-light text-brand-navy">
      {/* Dashboard Header - hide duplicate header on mobile */}
      <div className="hidden md:block">
        <DashboardHeader />
      </div>

      {/* Background Effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-20 top-20 h-80 w-80 rounded-full bg-brand-magenta/10 blur-3xl" />
        <div className="absolute -right-16 bottom-32 h-96 w-96 rounded-full bg-brand-blue/10 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-radial from-brand-purple/8 via-transparent to-transparent" />
      </div>

      {/* Mobile Navigation - Shown only on mobile */}
      <MobileNavigation currentUser={user} />

      <div className="relative z-10 flex min-h-screen w-full flex-col pt-16 md:flex-row">
        {/* Enhanced Sidebar - Hidden on mobile, shown on desktop.
            If a page provides its own sidebar (marked with .page-sidebar) hide the global sidebar
            to avoid duplicated navigation UI. */}
        <aside
          className={cn(
            "hidden border-r border-brand-navy/10 bg-white/80 backdrop-blur-xl transition-all duration-300 md:fixed md:left-0 md:top-0 md:block md:h-full",
            // If the page has its own sidebar hide the global one on md+ breakpoints
            hasPageSidebar ? "hidden md:hidden" : (isCollapsed ? "w-20" : "w-80")
          )}
          aria-hidden={hasPageSidebar}
        >
          {/* Sidebar Header */}
          <div className="border-b border-brand-navy/10 p-6">
            <div className="flex items-center justify-between">
              <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}> 
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-magenta to-brand-purple text-lg font-bold text-white shadow-lg">
                  W
                </div>
                {!isCollapsed && (
                  <div>
                    <h1 className="text-lg font-semibold text-brand-navy">WatchParty</h1>
                    <p className="text-xs uppercase tracking-[0.3em] text-brand-navy/50">Cinema hub</p>
                  </div>
                )}
              </div>
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="rounded-lg border border-brand-navy/10 bg-white/70 p-2 text-brand-navy/60 transition-colors hover:border-brand-navy/30 hover:text-brand-navy"
                aria-label={isCollapsed ? "Expand navigation" : "Collapse navigation"}
              >
                {isCollapsed ? "→" : "←"}
              </button>
            </div>
          </div>

          {/* User Profile Section */}
          {!isCollapsed && user && (
            <div className="border-b border-brand-navy/10 p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand-purple to-brand-magenta text-base font-semibold text-white">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.username} className="h-full w-full rounded-full object-cover" />
                    ) : (
                      user.username?.[0]?.toUpperCase() || "U"
                    )}
                  </div>
                  <div
                    className={cn(
                      "absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white",
                      getStatusColor(getUserStatus())
                    )}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-brand-navy">{user.first_name || user.username}</p>
                  <p className="truncate text-xs text-brand-navy/60">@{user.username}</p>
                  <div
                    className={cn(
                      "mt-2 inline-flex items-center gap-1 rounded-full border border-brand-navy/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-brand-navy",
                      `bg-gradient-to-r ${getPlanColor()}`
                    )}
                  >
                    ✨ {getPlanLabel()}
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="rounded-2xl border border-brand-blue/20 bg-brand-blue/5 p-3">
                  <div className="text-lg font-semibold text-brand-blue-dark">{liveStats.onlineUsers.toLocaleString()}</div>
                  <div className="text-xs uppercase tracking-[0.3em] text-brand-navy/50">Online</div>
                </div>
                <div className="rounded-2xl border border-brand-magenta/20 bg-brand-magenta/5 p-3">
                  <div className="text-lg font-semibold text-brand-magenta-dark">{liveStats.activeParties}</div>
                  <div className="text-xs uppercase tracking-[0.3em] text-brand-navy/50">Parties</div>
                </div>
                <div className="rounded-2xl border border-brand-cyan/25 bg-brand-cyan/5 p-3">
                  <div className="text-lg font-semibold text-brand-cyan-dark">{liveStats.systemHealth.systemLoad.toFixed(1)}%</div>
                  <div className="text-xs uppercase tracking-[0.3em] text-brand-navy/50">Load</div>
                </div>
                <div className="rounded-2xl border border-brand-orange/25 bg-brand-orange/5 p-3">
                  <div className="text-lg font-semibold text-brand-orange-dark">{liveStats.engagement.messagesPerMinute.toLocaleString()}</div>
                  <div className="text-xs uppercase tracking-[0.3em] text-brand-navy/50">Msgs/min</div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex-1 space-y-6 overflow-y-auto p-4">
            {navigationSections.map((section) => (
              <div key={section.title}>
                {!isCollapsed && (
                  <h3 className="mb-3 px-3 text-xs font-semibold uppercase tracking-[0.4em] text-brand-navy/50">
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
                          "group relative flex items-center gap-3 overflow-hidden rounded-2xl px-3 py-3 text-sm font-medium transition-all",
                          isActive
                            ? "border border-brand-purple/25 bg-white text-brand-navy shadow-[0_14px_40px_rgba(74,46,160,0.12)]"
                            : "text-brand-navy/70 hover:border hover:border-brand-navy/10 hover:bg-white/70 hover:text-brand-navy"
                        )}
                        title={isCollapsed ? item.label : ""}
                      >
                        {isActive && (
                          <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-brand-magenta to-brand-blue" />
                        )}

                        <span className="flex-shrink-0 text-lg">{item.icon}</span>

                        {!isCollapsed && (
                          <>
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm font-semibold">{item.label}</div>
                              <div className="truncate text-xs text-brand-navy/50">{item.description}</div>
                            </div>

                            {item.badge && (
                              <span className={cn("rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.3em]", getBadgeColor(item.badge))}>
                                {item.badge}
                              </span>
                            )}
                          </>
                        )}

                        {isCollapsed && item.badge && (
                          <div className={cn(
                            "absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold uppercase tracking-[0.2em]",
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
          <div className="border-t border-brand-navy/10 p-4">
            {!isCollapsed ? (
              <div className="space-y-3">
                <button className="w-full rounded-full bg-gradient-to-r from-brand-magenta to-brand-orange px-4 py-3 font-semibold text-white shadow-lg shadow-brand-magenta/25 transition-all hover:-translate-y-0.5">
                  <span className="flex items-center justify-center gap-2">
                    <span>✨</span>
                    Create party
                  </span>
                </button>
                <div className="flex gap-2">
                  <button className="flex-1 rounded-xl border border-brand-navy/10 bg-white/70 px-3 py-2 text-sm font-semibold text-brand-navy transition-colors hover:border-brand-navy/30">🎧 Audio</button>
                  <button className="flex-1 rounded-xl border border-brand-navy/10 bg-white/70 px-3 py-2 text-sm font-semibold text-brand-navy transition-colors hover:border-brand-navy/30">🌙 Theme</button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <button className="w-full rounded-full bg-gradient-to-r from-brand-magenta to-brand-orange p-3 text-white shadow-lg shadow-brand-magenta/25 transition-all hover:-translate-y-0.5">
                  ✨
                </button>
                <div className="grid grid-cols-2 gap-1">
                  <button className="rounded-xl border border-brand-navy/10 bg-white/70 p-2 text-sm text-brand-navy transition-colors hover:border-brand-navy/30">🎧</button>
                  <button className="rounded-xl border border-brand-navy/10 bg-white/70 p-2 text-sm text-brand-navy transition-colors hover:border-brand-navy/30">🌙</button>
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
            hasPageSidebar ? "md:ml-0" : (isCollapsed ? "md:ml-20" : "md:ml-80")
          )}
        >
          {/* Page Content */}
          <div className="flex-1 px-4 py-6 sm:px-8 lg:px-12 xl:px-16">
            <div className="mx-auto w-full max-w-[min(100%,1440px)] space-y-8">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Floating Action Button */}
      <button className="fixed bottom-6 right-6 hidden h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-purple to-brand-blue text-xl text-white shadow-2xl shadow-brand-purple/30 transition-all hover:-translate-y-1 hover:shadow-brand-purple/45 md:flex">
        ⚡
      </button>

      {/* Live Status Indicator */}
      <div className="fixed bottom-6 left-6 hidden items-center gap-2 rounded-full border border-brand-navy/10 bg-white/70 px-4 py-2 text-sm font-semibold text-brand-navy shadow-md shadow-brand-navy/5 md:flex">
        <div className="h-2 w-2 animate-pulse rounded-full bg-brand-cyan" />
        <span>System online</span>
      </div>
    </div>
  )
}
