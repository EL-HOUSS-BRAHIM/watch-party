"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Play } from "lucide-react"

import { MobileNavigation } from "@/components/navigation/mobile-navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { isAuthRoute, isMarketingRoute } from "@/lib/navigation/visibility"

export function CinemaHeader() {
  const pathname = usePathname()
  const { user } = useAuth()

  if (isAuthRoute(pathname) || pathname?.startsWith("/admin")) {
    return null
  }

  if (!isMarketingRoute(pathname)) {
    return null
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Play className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-white">WatchParty</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/discover"
              className={`text-sm font-medium transition-colors ${pathname === "/discover" ? "text-white" : "text-white/80 hover:text-white"}`}
            >
              Discover
            </Link>
            <Link
              href="/about"
              className={`text-sm font-medium transition-colors ${pathname === "/about" ? "text-white" : "text-white/80 hover:text-white"}`}
            >
              About
            </Link>
            <Link
              href="/help"
              className="text-white/80 hover:text-white transition-colors text-sm font-medium"
            >
              Help
            </Link>
          </nav>

          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <Link href="/dashboard">
                  <Button variant="ghost" className="text-white hover:bg-white/10">
                    Dashboard
                  </Button>
                </Link>
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user.avatar || undefined} />
                  <AvatarFallback className="bg-white/10 text-white text-sm">
                    {user.first_name?.charAt(0)?.toUpperCase() || user.full_name?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost" className="text-white hover:bg-white/10">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-white text-black hover:bg-white/90">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}

            <div className="md:hidden">
              <MobileNavigation />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
