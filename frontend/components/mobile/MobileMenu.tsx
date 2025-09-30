"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  currentUser?: any
}

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/dashboard/parties", label: "Parties", icon: "🎉" },
  { href: "/dashboard/videos", label: "Videos", icon: "🎬" },
  { href: "/dashboard/friends", label: "Friends", icon: "👥" },
  { href: "/dashboard/search", label: "Search", icon: "🔍" },
  { href: "/dashboard/notifications", label: "Notifications", icon: "🔔" },
  { href: "/dashboard/analytics", label: "Analytics", icon: "📊" },
  { href: "/dashboard/billing", label: "Billing", icon: "💳" },
  { href: "/dashboard/support", label: "Support", icon: "🎫" },
]

export default function MobileMenu({ isOpen, onClose, currentUser }: MobileMenuProps) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  const handleNavigation = (href: string) => {
    router.push(href)
    onClose()
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/auth/login")
    } catch (error) {
      console.error("Logout failed:", error)
    }
    onClose()
  }

  if (!mounted) return null

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Mobile Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-gray-900 border-l border-white/10 transform transition-transform duration-300 z-50 md:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h2 className="text-xl font-bold text-white">Watch Party</h2>
            <button
              onClick={onClose}
              className="p-2 text-white/60 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {/* User Profile */}
          {currentUser && (
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                {currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.username}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {currentUser.username?.[0]?.toUpperCase() || "U"}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-medium text-white">{currentUser.username}</p>
                  <p className="text-white/60 text-sm">{currentUser.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto">
            <nav className="p-4">
              <div className="space-y-2">
                {menuItems.map((item) => (
                  <button
                    key={item.href}
                    onClick={() => handleNavigation(item.href)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Additional Links */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="space-y-2">
                  <button
                    onClick={() => handleNavigation("/dashboard/profile")}
                    className="w-full flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                  >
                    <span className="text-xl">👤</span>
                    <span className="font-medium">Profile</span>
                  </button>
                  
                  <button
                    onClick={() => handleNavigation("/dashboard/settings")}
                    className="w-full flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                  >
                    <span className="text-xl">⚙️</span>
                    <span className="font-medium">Settings</span>
                  </button>

                  <button
                    onClick={() => handleNavigation("/help/faq")}
                    className="w-full flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                  >
                    <span className="text-xl">❓</span>
                    <span className="font-medium">Help</span>
                  </button>
                </div>
              </div>
            </nav>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              <span>🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}