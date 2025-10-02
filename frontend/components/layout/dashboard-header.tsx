'use client'

import Link from "next/link"
import { useState } from "react"
import { useAuth } from "@/lib/auth"

/**
 * DashboardHeader - Header for authenticated dashboard pages
 * Features search, notifications, user menu, and quick actions
 */
export function DashboardHeader() {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [notificationCount, setNotificationCount] = useState(5)
  const { logout } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-gray-950/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Logo & Brand */}
        <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 shadow-lg">
            <span className="text-xl">🎬</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-purple-400">WatchParty</span>
          </div>
        </Link>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl mx-8">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">🔍</span>
            <input
              type="text"
              placeholder="Search parties, videos, friends..."
              className="w-full h-11 pl-12 pr-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all"
            >
              <span className="text-xl">🔔</span>
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {notificationCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl bg-gray-900/95 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden">
                <div className="p-4 border-b border-white/10">
                  <h3 className="text-sm font-bold text-white">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer">
                      <p className="text-sm text-white/90">New party invite from Sarah</p>
                      <p className="text-xs text-white/50 mt-1">2 minutes ago</p>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-white/10">
                  <button className="text-xs text-purple-400 hover:text-purple-300 font-medium">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Settings */}
          <Link
            href="/settings"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all"
          >
            <span className="text-xl">⚙️</span>
          </Link>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 px-3 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-blue-500">
                <span className="text-sm">👤</span>
              </div>
              <span className="text-sm font-medium text-white/90">Alex</span>
              <span className="text-xs text-white/50">▼</span>
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-gray-900/95 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden">
                <div className="p-4 border-b border-white/10">
                  <p className="text-sm font-bold text-white">Alex Johnson</p>
                  <p className="text-xs text-white/50">@alexj</p>
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30">
                    <span className="text-xs font-bold text-purple-400">Pro</span>
                  </div>
                </div>
                <div className="py-2">
                  <Link href="/profile" className="flex items-center gap-3 px-4 py-2 hover:bg-white/5 transition-colors">
                    <span className="text-sm">👤</span>
                    <span className="text-sm text-white/90">Profile</span>
                  </Link>
                  <Link href="/settings" className="flex items-center gap-3 px-4 py-2 hover:bg-white/5 transition-colors">
                    <span className="text-sm">⚙️</span>
                    <span className="text-sm text-white/90">Settings</span>
                  </Link>
                  <button 
                    onClick={logout}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-white/5 transition-colors w-full text-left"
                  >
                    <span className="text-sm">🚪</span>
                    <span className="text-sm text-red-400">Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
