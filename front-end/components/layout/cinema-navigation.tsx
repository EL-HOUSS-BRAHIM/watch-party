'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home,
  Users,
  Video,
  TrendingUp,
  Settings,
  ChevronRight,
  User,
  Bell,
  MessageCircle,
  BarChart3
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const navigationItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    description: 'Your personal dashboard'
  },
  {
    label: 'Watch Parties',
    href: '/dashboard/parties',
    icon: Users,
    description: 'Join or create parties',
    count: 3
  },
  {
    label: 'My Profile',
    href: '/dashboard/profile',
    icon: User,
    description: 'Your profile settings'
  },
  {
    label: 'My Videos',
    href: '/dashboard/videos',
    icon: Video,
    description: 'Your video library'
  },
  {
    label: 'Friends',
    href: '/dashboard/friends',
    icon: Users,
    description: 'Manage your friends'
  },
  {
    label: 'Activity',
    href: '/dashboard/activity',
    icon: TrendingUp,
    description: 'Your recent activity'
  },
  {
    label: 'Notifications',
    href: '/dashboard/notifications',
    icon: Bell,
    description: 'Your notifications',
    count: 2
  },
  {
    label: 'Messages',
    href: '/dashboard/messages',
    icon: MessageCircle,
    description: 'Chat with friends',
    count: 2
  },
  {
    label: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
    description: 'Your viewing stats'
  },
  {
    label: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    description: 'Account preferences'
  }
]

export function CinemaNavigation() {
  const pathname = usePathname()
  
  // Only show navigation on dashboard pages
  const isDashboardPage = pathname?.startsWith('/dashboard')
  const isAuthPage = pathname?.startsWith('/(auth)') || 
                     pathname?.includes('/login') || 
                     pathname?.includes('/register') || 
                     pathname?.includes('/forgot-password') ||
                     pathname?.includes('/reset-password') ||
                     pathname?.includes('/verify-email') ||
                     pathname?.includes('/2fa') ||
                     pathname?.includes('/callback')
  const isWatchPage = pathname?.startsWith('/watch/')
  const isAdminPage = pathname?.startsWith('/admin')
  const isLandingPage = pathname === '/' || 
                        pathname?.startsWith('/about') || 
                        pathname?.startsWith('/help') || 
                        pathname?.startsWith('/privacy') || 
                        pathname?.startsWith('/terms')
  
  // Hide navigation on auth pages, watch pages, admin pages, and landing pages
  if (isAuthPage || isWatchPage || isAdminPage || isLandingPage || !isDashboardPage) return null

  return (
    <nav className="fixed left-0 top-16 bottom-0 w-64 glass-sidebar border-r border-white/10 z-40 hidden lg:block">
      <div className="flex flex-col h-full">
        {/* Quick Actions */}
        <div className="p-4 border-b border-white/10">
          <Button className="w-full btn-primary justify-start">
            <Users className="w-4 h-4 mr-2" />
            Create Party
          </Button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4">
          <div className="space-y-1 px-2">
            {navigationItems.map((item) => (
              <NavigationItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                description={item.description}
                badge={item.badge}
                count={item.count}
                active={pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href))}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <div className="text-xs text-gray-500 space-y-1">
            <div>WatchParty Cinema v2.0</div>
            <div>© 2025 All rights reserved</div>
          </div>
        </div>
      </div>
    </nav>
  )
}

interface NavigationItemProps {
  href: string
  icon: React.ElementType
  label: string
  description: string
  badge?: string
  count?: number
  active?: boolean
}

function NavigationItem({ 
  href, 
  icon: Icon, 
  label, 
  description, 
  badge, 
  count, 
  active 
}: NavigationItemProps) {
  return (
    <Link
      href={href}
      className={`
        group flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-300
        ${active 
          ? 'bg-neon-red/20 text-neon-red border border-neon-red/30 glow-red' 
          : 'text-gray-400 hover:text-white hover:bg-white/5'
        }
      `}
    >
      <div className={`
        p-1.5 rounded-md transition-colors
        ${active 
          ? 'bg-neon-red/20' 
          : 'group-hover:bg-white/10'
        }
      `}>
        <Icon className="w-4 h-4" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="font-medium truncate">{label}</span>
          <div className="flex items-center space-x-1">
            {badge && (
              <Badge 
                variant="secondary" 
                className={`
                  text-xs px-1.5 py-0.5 rounded-full
                  ${badge === 'Hot' 
                    ? 'bg-neon-gold/20 text-neon-gold border-neon-gold/30' 
                    : 'bg-neon-blue/20 text-neon-blue border-neon-blue/30'
                  }
                `}
              >
                {badge}
              </Badge>
            )}
            {count && (
              <Badge 
                variant="secondary" 
                className="bg-neon-red/20 text-neon-red border-neon-red/30 text-xs px-1.5 py-0.5 rounded-full"
              >
                {count}
              </Badge>
            )}
            <ChevronRight className={`
              w-3 h-3 transition-transform
              ${active ? 'rotate-90 text-neon-red' : 'text-gray-600 group-hover:text-gray-400'}
            `} />
          </div>
        </div>
        <div className="text-xs text-gray-500 truncate mt-0.5">{description}</div>
      </div>
    </Link>
  )
}
