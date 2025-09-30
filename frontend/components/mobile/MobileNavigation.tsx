"use client"

import { useState, useEffect } from "react"
import { MobileMenu } from "@/components/mobile"

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
      const response = await fetch("/api/notifications/unread-count", {
        credentials: "include"
      })
      if (response.ok) {
        const data = await response.json()
        setNotificationCount(data.count || 0)
      }
    } catch (error) {
      console.error("Failed to load notification count:", error)
    }
  }

  return (
    <>
      {/* Mobile Header */}
      <header className="sticky top-0 z-30 bg-gray-900/95 backdrop-blur-sm border-b border-white/10 md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">WP</span>
            </div>
            <span className="font-bold text-white">Watch Party</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button
              onClick={() => window.location.href = "/dashboard/notifications"}
              className="relative p-2 text-white/70 hover:text-white transition-colors"
            >
              <span className="text-xl">🔔</span>
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notificationCount > 9 ? "9+" : notificationCount}
                </span>
              )}
            </button>

            {/* Search */}
            <button
              onClick={() => window.location.href = "/dashboard/search"}
              className="p-2 text-white/70 hover:text-white transition-colors"
            >
              <span className="text-xl">🔍</span>
            </button>

            {/* Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="p-2 text-white/70 hover:text-white transition-colors"
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
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-gray-900/95 backdrop-blur-sm border-t border-white/10 md:hidden">
        <div className="grid grid-cols-5 py-2">
          <a
            href="/dashboard"
            className="flex flex-col items-center py-2 px-1 text-white/70 hover:text-white transition-colors"
          >
            <span className="text-xl mb-1">🏠</span>
            <span className="text-xs font-medium">Home</span>
          </a>

          <a
            href="/dashboard/parties"
            className="flex flex-col items-center py-2 px-1 text-white/70 hover:text-white transition-colors"
          >
            <span className="text-xl mb-1">🎉</span>
            <span className="text-xs font-medium">Parties</span>
          </a>

          <button
            onClick={() => window.location.href = "/dashboard/parties/create"}
            className="flex flex-col items-center py-2 px-1 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mb-1">
              <span className="text-white text-lg">+</span>
            </div>
            <span className="text-xs font-medium">Create</span>
          </button>

          <a
            href="/dashboard/videos"
            className="flex flex-col items-center py-2 px-1 text-white/70 hover:text-white transition-colors"
          >
            <span className="text-xl mb-1">🎬</span>
            <span className="text-xs font-medium">Videos</span>
          </a>

          <a
            href="/dashboard/friends"
            className="flex flex-col items-center py-2 px-1 text-white/70 hover:text-white transition-colors"
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