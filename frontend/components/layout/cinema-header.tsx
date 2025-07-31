'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
import { useIsMobile } from '@/hooks/use-mobile'

export function CinemaHeader() {
  const pathname = usePathname()
  const isMobile = useIsMobile()
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

  const isAuthPage = pathname?.startsWith('/(auth)') || pathname?.includes('/login') || pathname?.includes('/register')
  
  if (isAuthPage) return null

  return (
    <header className={`
      fixed top-0 left-0 right-0 z-50 transition-all duration-300
      ${isScrolled 
        ? 'glass-nav shadow-cinema-lg border-b border-white/10' 
        : 'bg-transparent'
      }
    `}>
      <div className="container-cinema">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-red to-neon-purple flex items-center justify-center glow-red transition-all duration-300 group-hover:scale-110">
                  <Play className="w-5 h-5 text-white fill-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-neon-green rounded-full animate-pulse" />
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-bold heading-md bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  WatchParty
                </span>
                <div className="text-xs text-neon-gold font-medium">CINEMA</div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            {!isMobile && (
              <nav className="hidden lg:flex items-center space-x-6">
                <NavLink href="/discover" icon={Zap} active={pathname === '/discover'}>
                  Discover
                </NavLink>
                <NavLink href="/dashboard/parties" icon={Users} active={pathname?.includes('/parties')}>
                  Parties
                </NavLink>
                <NavLink href="/videos" icon={Video} active={pathname?.includes('/videos')}>
                  Library
                </NavLink>
                <NavLink href="/dashboard" icon={Crown} active={pathname === '/dashboard'}>
                  Dashboard
                </NavLink>
              </nav>
            )}
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search movies, shows, parties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 glass-card border-white/20 focus:border-neon-red/50 focus:glow-red text-white placeholder-gray-400"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-white/10"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Mobile Search */}
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                className="p-2 hover:bg-white/10"
              >
                <Search className="w-5 h-5 text-gray-300" />
              </Button>
            )}

            {/* Notifications */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="p-2 hover:bg-white/10 relative"
              >
                <Bell className="w-5 h-5 text-gray-300" />
                {notifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-neon-red text-xs p-0 flex items-center justify-center glow-red animate-pulse">
                    {notifications}
                  </Badge>
                )}
              </Button>
            </div>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-1 hover:bg-white/10 rounded-full">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-56 glass-card border-white/20 text-white"
              >
                <DropdownMenuLabel className="text-gray-300">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem className="hover:bg-white/10 cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-white/10 cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem className="hover:bg-white/10 cursor-pointer text-neon-red">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Toggle */}
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                className="p-2 hover:bg-white/10 lg:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 text-gray-300" />
                ) : (
                  <Menu className="w-5 h-5 text-gray-300" />
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobile && mobileMenuOpen && (
          <div className="lg:hidden border-t border-white/10 bg-cinema-dark/95 backdrop-blur-xl">
            <div className="py-4 space-y-2">
              <MobileNavLink href="/discover" icon={Zap} onClick={() => setMobileMenuOpen(false)}>
                Discover
              </MobileNavLink>
              <MobileNavLink href="/dashboard/parties" icon={Users} onClick={() => setMobileMenuOpen(false)}>
                Parties
              </MobileNavLink>
              <MobileNavLink href="/videos" icon={Video} onClick={() => setMobileMenuOpen(false)}>
                Library
              </MobileNavLink>
              <MobileNavLink href="/dashboard" icon={Crown} onClick={() => setMobileMenuOpen(false)}>
                Dashboard
              </MobileNavLink>
              
              {/* Mobile Search */}
              <div className="px-4 pt-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search..."
                    className="pl-10 glass-card border-white/20 text-white placeholder-gray-400"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
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
          ? 'text-neon-red glow-red bg-neon-red/10' 
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
