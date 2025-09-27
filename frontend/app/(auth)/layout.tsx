"use client"

import React from "react"
import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import { Play } from "lucide-react"

interface AuthLayoutProps {
  children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Redirect authenticated users away from auth pages
    if (!isLoading && user && pathname !== "/callback") {
      router.push("/dashboard")
    }
  }, [user, isLoading, router, pathname])

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-2 border-white/20 rounded-lg flex items-center justify-center animate-pulse">
              <Play className="w-8 h-8 text-white" />
            </div>
          </div>
          <div className="text-center">
            <div className="text-white font-medium">Loading WatchParty...</div>
            <div className="text-white/60 text-sm">Preparing your cinema experience</div>
          </div>
        </div>
      </div>
    )
  }

  // Don't render auth layout for authenticated users (except callback)
  if (user && pathname !== "/callback") {
    return null
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <Link href="/" className="flex items-center justify-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
            <Play className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <span className="text-xl font-bold text-white">WatchParty</span>
            <div className="text-xs text-white/80 font-medium">CINEMA</div>
          </div>
        </Link>
      </div>

      {/* Auth Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">{children}</div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-4 text-sm text-white/60">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms
            </Link>
            <Link href="/help" className="hover:text-white transition-colors">
              Help
            </Link>
          </div>
          <div className="text-sm text-white/40">© 2025 WatchParty Cinema</div>
        </div>
      </div>
    </div>
  )
}
