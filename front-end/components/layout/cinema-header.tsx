'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { MobileNavigation } from '@/components/navigation/mobile-navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useIsMobile } from '@/hooks/use-mobile'
import { 
  Play, 
  Search, 
  Bell, 
  User, 
  Settings, 
  LogOut,
  Menu,
  X,
  Zap,
  Users,
  Video,
  Crown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'

export function CinemaHeader() {
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const { user } = useAuth()
  const [isScrolled, setIsScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState(3)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isAuthPage = pathname?.startsWith('/(auth)') || 
                     pathname?.includes('/login') || 
                     pathname?.includes('/register') || 
                     pathname?.includes('/forgot-password') ||
                     pathname?.includes('/reset-password') ||
                     pathname?.includes('/verify-email') ||
                     pathname?.includes('/2fa') ||
                     pathname?.includes('/callback')
  const isLandingPage = pathname === '/'
  const isPublicPage = ['/about', '/privacy', '/terms', '/help', '/discover'].includes(pathname)
  const isAdminPage = pathname.startsWith('/admin')

  // Show public header on landing and public pages
  if (isLandingPage || isPublicPage) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Play className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-white">WatchParty</span>
            </Link>

            {/* Simple Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link 
                href="/discover" 
                className={`text-sm font-medium transition-colors ${pathname === '/discover' ? 'text-white' : 'text-white/80 hover:text-white'}`}
              >
                Discover
              </Link>
              <Link 
                href="/about" 
                className={`text-sm font-medium transition-colors ${pathname === '/about' ? 'text-white' : 'text-white/80 hover:text-white'}`}
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

            {/* Auth Actions */}
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
                      {user.first_name?.charAt(0)?.toUpperCase() || user.full_name?.charAt(0)?.toUpperCase() || 'U'}
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
              
              {/* Mobile Menu */}
              <div className="md:hidden">
                <MobileNavigation />
              </div>
            </div>
          </div>
        </div>
      </header>
    )
  }

  // Hide header on auth pages and admin pages
  if (isAuthPage || isAdminPage) return null

  // Return null for dashboard and other pages as they handle their own navigation
  return null
}

interface NavLinkProps {
  href: string
  icon: React.ElementType
  children: React.ReactNode
  active?: boolean
}

function NavLink({ href, icon: Icon, children, active }: NavLinkProps) {
  return (
    <Link 
      href={href}
      className={`
        flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all duration-300
        ${active 
          ? 'text-red-500 bg-red-500/10' 
          : 'text-gray-300 hover:text-white hover:bg-white/10'
        }
      `}
    >
      <Icon className="w-4 h-4" />
      <span>{children}</span>
    </Link>
  )
}

interface MobileNavLinkProps {
  href: string
  icon: React.ElementType
  children: React.ReactNode
  onClick: () => void
}

function MobileNavLink({ href, icon: Icon, children, onClick }: MobileNavLinkProps) {
  return (
    <Link 
      href={href}
      onClick={onClick}
      className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{children}</span>
    </Link>
  )
}
