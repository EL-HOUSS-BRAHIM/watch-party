"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { authApi } from "@/lib/api-client"

interface UserInfo {
  id: string
  username: string
  full_name?: string
  email?: string
  avatar?: string
}

const _navigation = [
  { href: "/#features", label: "Features" },
  { href: "/#experience", label: "Experience" },
  { href: "/join", label: "Join" }
]

export function MarketingHeader() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<UserInfo | null>(null)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const profile = await authApi.getProfile()
        if (profile && profile.id) {
          setUser(profile as UserInfo)
        }
      } catch {
        // User is not authenticated
      } finally {
        setAuthChecked(true)
      }
    }
    void checkAuth()
  }, [])
  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/20 bg-white/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 shadow-sm">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 text-brand-navy sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 group sm:gap-3" aria-label="WatchParty home">
            <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-lg group-hover:shadow-brand-purple/20 rounded-xl sm:h-12 sm:w-12">
              <Image 
                src="/watchparty-logo.webp" 
                alt="WatchParty logo" 
                width={48} 
                height={48} 
                className="h-full w-full object-contain" 
                priority 
              />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-purple sm:text-xs">WatchParty</span>
              <span className="text-sm font-bold bg-gradient-to-r from-brand-navy to-brand-purple bg-clip-text text-transparent sm:text-base lg:text-lg">Watch Together</span>
            </span>
          </Link>
          
          {/* Desktop navigation (hidden on small screens) */}
          <nav className="hidden md:flex items-center gap-8">
            {_navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-brand-navy/70 hover:text-brand-navy transition-colors relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-purple transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Mobile: hamburger only */}
            <div className="md:hidden">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsOpen(true)} 
                aria-label="Open menu" 
                className="p-2.5 rounded-xl bg-brand-navy/5 hover:bg-brand-navy/10 border border-brand-navy/5 shadow-sm transition-all active:scale-95"
              >
                <svg 
                  className="h-6 w-6 text-brand-navy" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth={2.5} 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  aria-hidden
                >
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </Button>
            </div>

            {/* Desktop actions */}
            <div className="hidden md:flex items-center gap-3">
              {authChecked && user ? (
                <>
                  <Button asChild size="default" className="shadow-lg shadow-brand-purple/20 bg-gradient-to-r from-brand-purple to-brand-blue hover:shadow-brand-purple/40 border-0 transition-all hover:-translate-y-0.5">
                    <Link href="/dashboard" aria-label="Go to Dashboard">
                      Dashboard
                    </Link>
                  </Button>
                  <Link 
                    href="/dashboard/profile" 
                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-brand-navy/5 transition-all group"
                    aria-label="View profile"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-purple to-brand-magenta flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:scale-105 transition-transform">
                      {user.full_name?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <span className="text-sm font-medium text-brand-navy/80 group-hover:text-brand-navy max-w-[100px] truncate">
                      {user.full_name || user.username}
                    </span>
                  </Link>
                </>
              ) : authChecked ? (
                <>
                  <Button asChild variant="ghost" size="sm" className="hover:bg-brand-navy/5 text-brand-navy/80 hover:text-brand-navy">
                    <Link href="/auth/login" aria-label="Sign in to WatchParty" className="px-4 py-2">
                      Sign in
                    </Link>
                  </Button>

                  <Button asChild size="default" className="shadow-lg shadow-brand-magenta/20 bg-gradient-to-r from-brand-magenta to-brand-orange hover:shadow-brand-magenta/40 border-0 transition-all hover:-translate-y-0.5">
                    <Link href="/auth/register" aria-label="Start hosting on WatchParty">
                      Start hosting
                    </Link>
                  </Button>
                </>
              ) : (
                // Loading state - show placeholder
                <div className="flex items-center gap-3">
                  <div className="w-20 h-9 bg-brand-navy/5 rounded-lg animate-pulse" />
                  <div className="w-28 h-10 bg-brand-navy/10 rounded-lg animate-pulse" />
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* Mobile menu overlay - Outside header for proper positioning */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-2xl overflow-y-auto z-10">
            <div className="flex items-center justify-between border-b border-brand-navy/10 bg-brand-neutral/30 p-4">
              <Link href="/" className="flex items-center gap-2" aria-label="WatchParty home" onClick={() => setIsOpen(false)}>
                <span className="relative flex h-8 w-8 items-center justify-center overflow-hidden">
                  <Image src="/watchparty-logo.webp" alt="WatchParty logo" width={32} height={32} className="object-contain" />
                </span>
                <span className="font-bold text-brand-navy">WatchParty</span>
              </Link>
              <button 
                type="button"
                onClick={() => setIsOpen(false)} 
                aria-label="Close menu" 
                className="relative z-20 flex items-center justify-center p-2 min-h-[44px] min-w-[44px] rounded-lg bg-brand-navy/5 hover:bg-brand-navy/10 border border-brand-navy/10 transition-all active:scale-95 cursor-pointer"
              >
                <svg className="h-5 w-5 text-brand-navy" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M6 6l12 12M6 18L18 6" />
                </svg>
              </button>
            </div>

            <nav className="flex flex-col gap-2 p-4">
              {_navigation.map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href} 
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg px-4 py-3 text-base font-medium text-brand-navy/80 hover:bg-brand-neutral/30 hover:text-brand-navy transition-all active:scale-98"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex flex-col gap-3 border-t border-brand-navy/10 p-4 mt-auto">
              {user ? (
                <>
                  <Link 
                    href="/dashboard" 
                    onClick={() => setIsOpen(false)}
                    className="rounded-lg bg-gradient-to-r from-brand-purple to-brand-blue px-4 py-3 text-center text-base font-semibold text-white shadow-lg hover:shadow-xl transition-all active:scale-98"
                  >
                    Go to Dashboard
                  </Link>
                  <Link 
                    href="/dashboard/profile" 
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium text-brand-navy/80 hover:bg-brand-neutral/30 border border-brand-navy/20 transition-all active:scale-98"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-purple to-brand-magenta flex items-center justify-center text-white font-bold text-sm">
                      {user.full_name?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <span className="truncate">{user.full_name || user.username}</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    href="/auth/login" 
                    onClick={() => setIsOpen(false)}
                    className="rounded-lg px-4 py-3 text-center text-base font-medium text-brand-navy/80 hover:bg-brand-neutral/30 border border-brand-navy/20 transition-all active:scale-98"
                  >
                    Sign in
                  </Link>
                  <Link 
                    href="/auth/register" 
                    onClick={() => setIsOpen(false)}
                    className="rounded-lg bg-gradient-to-r from-brand-magenta to-brand-orange px-4 py-3 text-center text-base font-semibold text-white shadow-lg hover:shadow-xl transition-all active:scale-98"
                  >
                    Start hosting
                  </Link>
                </>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  )
}
