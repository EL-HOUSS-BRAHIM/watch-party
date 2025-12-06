"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth"
import { userApi, notificationsApi, User } from "@/lib/api-client"

/**
 * DashboardHeader - Header for authenticated dashboard pages
 * Features search, notifications, user menu, and quick actions
 */
export function DashboardHeader() {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [notificationCount, setNotificationCount] = useState(0)
  const [user, setUser] = useState<User | null>(null)
  const [_loading, setLoading] = useState(true)
  const { logout } = useAuth()

  useEffect(() => {
    loadUserData()
    loadNotificationCount()
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

  const loadNotificationCount = async () => {
    try {
      const data = await notificationsApi.getUnreadCount()
      setNotificationCount(data.count || 0)
    } catch (error) {
      console.error("Failed to load notification count:", error)
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-brand-navy/10 bg-white/95 backdrop-blur-xl shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Logo & Brand */}
        <Link href="/dashboard" className="flex items-center gap-3 transition-opacity hover:opacity-80">
          <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden">
            <Image src="/watchparty-logo.webp" alt="WatchParty logo" width={40} height={40} className="h-full w-full object-contain" priority />
          </span>
          <div className="flex flex-col">
            <span className="text-sm font-semibold uppercase tracking-[0.35em] text-brand-purple">WatchParty</span>
            <span className="text-base font-semibold text-brand-navy">Control room</span>
          </div>
        </Link>

        {/* Search Bar - Hidden on mobile */}
        <div className="mx-6 hidden w-full max-w-xl flex-1 md:flex">
          <div className="relative w-full">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-navy/40">🔍</span>
            <input
              type="text"
              placeholder="Search parties, videos, friends..."
              className="h-11 w-full rounded-xl border border-brand-navy/10 bg-white/80 pl-12 pr-4 text-sm font-medium text-brand-navy placeholder:text-brand-navy/40 transition-all focus:border-brand-blue/40 focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-brand-navy/10 bg-white/80 text-brand-navy transition-all hover:border-brand-navy/30 hover:text-brand-navy"
            >
              <span className="text-xl">🔔</span>
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-coral text-[10px] font-bold text-white shadow-lg">
                  {notificationCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-2xl border border-brand-navy/10 bg-white/95 shadow-[0_24px_60px_rgba(28,28,46,0.15)]">
                <div className="border-b border-brand-navy/10 p-4">
                  <h3 className="text-sm font-semibold text-brand-navy">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notificationCount === 0 ? (
                    <div className="p-8 text-center text-sm text-brand-navy/60">
                      No new notifications
                    </div>
                  ) : (
                    <div className="p-4 text-center text-sm text-brand-navy/70">
                      You have {notificationCount} unread notifications
                    </div>
                  )}
                </div>
                <div className="border-t border-brand-navy/10 p-3 text-right">
                  <Link href="/dashboard/notifications" className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-purple transition-colors hover:text-brand-purple-dark">
                    View all notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Settings */}
          <Link
            href="/dashboard/settings"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-brand-navy/10 bg-white/80 text-brand-navy transition-all hover:border-brand-navy/30 hover:text-brand-navy"
          >
            <span className="text-xl">⚙️</span>
          </Link>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex h-10 items-center gap-3 rounded-xl border border-brand-navy/10 bg-white/80 px-3 text-sm font-semibold text-brand-navy transition-all hover:border-brand-navy/30"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-purple to-brand-blue text-white">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.username} className="h-full w-full rounded-lg object-cover" />
                ) : (
                  <span className="text-base">👤</span>
                )}
              </div>
              <span className="hidden sm:inline text-sm font-semibold text-brand-navy">
                {user?.first_name || user?.username || "User"}
              </span>
              <span className="text-xs text-brand-navy/50">▼</span>
            </button>

            {/* User Dropdown */}
            {showUserMenu && user && (
              <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-brand-navy/10 bg-white/95 shadow-[0_24px_60px_rgba(28,28,46,0.16)]">
                <div className="border-b border-brand-navy/10 p-4">
                  <p className="text-sm font-semibold text-brand-navy">{user.first_name || user.username}</p>
                  <p className="text-xs text-brand-navy/50">@{user.username}</p>
                  {(user.is_premium || user.is_staff) && (
                    <div className="mt-2 inline-flex items-center gap-1 rounded-full border border-brand-purple/20 bg-brand-purple/5 px-2 py-1">
                      <span className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-purple">
                        {user.is_premium ? "Premium" : "Pro"}
                      </span>
                    </div>
                  )}
                </div>
                <div className="py-2">
                  <Link href="/dashboard/profile" className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-brand-navy transition-colors hover:bg-brand-neutral/60">
                    <span>👤</span>
                    <span>Profile</span>
                  </Link>
                  <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-brand-navy transition-colors hover:bg-brand-neutral/60">
                    <span>⚙️</span>
                    <span>Settings</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="flex w-full items-center gap-3 px-4 py-2 text-sm font-semibold text-brand-coral transition-colors hover:bg-brand-neutral/60"
                  >
                    <span>🚪</span>
                    <span>Sign out</span>
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
