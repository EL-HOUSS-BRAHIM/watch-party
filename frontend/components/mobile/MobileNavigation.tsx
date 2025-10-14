"use client"

import { useState, useEffect } from "react"
import { MobileMenu } from "@/components/mobile"
import { notificationsApi } from "@/lib/api-client"

interface MobileNavigationProps {
  currentUser?: any
}

export default function MobileNavigation({ currentUser }: MobileNavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [notificationCount, setNotificationCount] = useState(0)

  useEffect(() => {
    // Load notification count
    loadNotificationCount()
  }, [])

  const loadNotificationCount = async () => {
    try {
      const data = await notificationsApi.getUnreadCount()
      setNotificationCount(data.count || 0)
    } catch (error) {
      console.error("Failed to load notification count:", error)
    }
  }

  return (
    <>
      {/* Mobile Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-brand-navy/10 md:hidden">
        <div className="flex items-center justify-between px-4 py-3 min-h-[56px]">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-purple to-brand-blue rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">WP</span>
            </div>
            <span className="font-bold text-brand-navy">Watch Party</span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-center gap-2">
            {/* Notifications */}
            <button
              onClick={() => window.location.href = "/dashboard/notifications"}
              className="relative p-2 text-brand-navy/70 hover:text-brand-navy transition-colors flex items-center justify-center"
            >
              <span className="text-xl leading-none">🔔</span>
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-coral text-white text-xs rounded-full flex items-center justify-center font-bold shadow-sm">
                  {notificationCount > 9 ? "9+" : notificationCount}
                </span>
              )}
            </button>

            {/* Search */}
            <button
              onClick={() => window.location.href = "/dashboard/search"}
              className="p-2 text-brand-navy/70 hover:text-brand-navy transition-colors flex items-center justify-center"
            >
              <span className="text-xl leading-none">🔍</span>
            </button>

            {/* Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="p-2 text-brand-navy/70 hover:text-brand-navy transition-colors flex items-center justify-center"
            >
              <div className="w-6 h-6 flex flex-col justify-center gap-1">
                <span className="w-full h-0.5 bg-current"></span>
                <span className="w-full h-0.5 bg-current"></span>
                <span className="w-full h-0.5 bg-current"></span>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-xl border-t border-brand-navy/10 md:hidden shadow-[0_-8px_24px_rgba(28,28,46,0.08)]">
        <div className="grid grid-cols-5 py-2">
          <a
            href="/dashboard"
            className="flex flex-col items-center py-2 px-1 text-brand-navy/70 hover:text-brand-navy transition-colors"
          >
            <span className="text-xl mb-1">🏠</span>
            <span className="text-xs font-medium">Home</span>
          </a>

          <a
            href="/dashboard/parties"
            className="flex flex-col items-center py-2 px-1 text-brand-navy/70 hover:text-brand-navy transition-colors"
          >
            <span className="text-xl mb-1">🎉</span>
            <span className="text-xs font-medium">Parties</span>
          </a>

          <button
            onClick={() => window.location.href = "/dashboard/parties/create"}
            className="flex flex-col items-center py-2 px-1 text-brand-purple hover:text-brand-purple-dark transition-colors"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-brand-magenta to-brand-orange rounded-full flex items-center justify-center mb-1 shadow-lg shadow-brand-magenta/25">
              <span className="text-white text-lg font-bold">+</span>
            </div>
            <span className="text-xs font-semibold">Create</span>
          </button>

          <a
            href="/dashboard/videos"
            className="flex flex-col items-center py-2 px-1 text-brand-navy/70 hover:text-brand-navy transition-colors"
          >
            <span className="text-xl mb-1">🎬</span>
            <span className="text-xs font-medium">Videos</span>
          </a>

          <a
            href="/dashboard/friends"
            className="flex flex-col items-center py-2 px-1 text-brand-navy/70 hover:text-brand-navy transition-colors"
          >
            <span className="text-xl mb-1">👥</span>
            <span className="text-xs font-medium">Friends</span>
          </a>
        </div>
      </nav>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        currentUser={currentUser}
      />
    </>
  )
}