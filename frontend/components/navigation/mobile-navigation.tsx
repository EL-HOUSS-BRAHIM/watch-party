'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Menu, 
  Home, 
  Play,
  Users, 
  MessageCircle, 
  Search,
  Bell,
  Settings,
  User,
  LogOut,
  Crown,
  Store,
  TrendingUp,
  Calendar,
  Heart,
  History,
  Trophy,
  CreditCard,
  HelpCircle,
  Moon,
  Sun
} from 'lucide-react'

interface NavigationItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number | string
  requiresAuth?: boolean
  premium?: boolean
}

interface NavigationSection {
  title: string
  items: NavigationItem[]
}

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [notifications, setNotifications] = useState(0)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const pathname = usePathname()

  const navigationSections: NavigationSection[] = [
    {
      title: 'Discover',
      items: [
        { label: 'Home', href: '/', icon: Home },
        { label: 'Watch', href: '/watch', icon: Play },
        { label: 'Discover', href: '/discover', icon: Search },
        { label: 'Trending', href: '/trending', icon: TrendingUp },
      ]
    },
    {
      title: 'Social',
      items: [
        { label: 'Friends', href: '/friends', icon: Users, requiresAuth: true },
        { label: 'Messages', href: '/chat', icon: MessageCircle, badge: 3, requiresAuth: true },
        { label: 'Groups', href: '/groups', icon: Users, requiresAuth: true },
        { label: 'Events', href: '/events', icon: Calendar, requiresAuth: true },
      ]
    },
    {
      title: 'Library',
      items: [
        { label: 'Watch History', href: '/profile/history', icon: History, requiresAuth: true },
        { label: 'Favorites', href: '/profile/favorites', icon: Heart, requiresAuth: true },
        { label: 'Achievements', href: '/profile/achievements', icon: Trophy, requiresAuth: true },
      ]
    },
    {
      title: 'Account',
      items: [
        { label: 'Notifications', href: '/notifications', icon: Bell, badge: notifications, requiresAuth: true },
        { label: 'Billing', href: '/billing', icon: CreditCard, requiresAuth: true },
        { label: 'Store', href: '/store', icon: Store, premium: true },
        { label: 'Settings', href: '/settings', icon: Settings, requiresAuth: true },
        { label: 'Help', href: '/help', icon: HelpCircle },
      ]
    }
  ]

  useEffect(() => {
    // Load user data and notifications
    const loadUserData = async () => {
      try {
        const response = await fetch('/api/auth/user')
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
        }
      } catch (error) {
        console.error('Failed to load user data:', error)
      }
    }

    const loadNotifications = async () => {
      try {
        const response = await fetch('/api/notifications/unread-count')
        if (response.ok) {
          const data = await response.json()
          setNotifications(data.count)
        }
      } catch (error) {
        console.error('Failed to load notifications:', error)
      }
    }

    loadUserData()
    if (user) loadNotifications()
  }, [user])

  useEffect(() => {
    // Load theme preference
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'light'
    setTheme(savedTheme)
    document.documentElement.classList.toggle('dark', savedTheme === 'dark')
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      window.location.href = '/auth/login'
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <ScrollArea className="h-full">
          <div className="flex flex-col h-full">
            {/* User Profile Section */}
            {user ? (
              <div className="p-6 border-b">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.avatar || ''} />
                    <AvatarFallback>
                      {user.displayName?.charAt(0)?.toUpperCase() || <User className="h-6 w-6" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{user.displayName}</h3>
                    <p className="text-sm text-muted-foreground truncate">@{user.username}</p>
                    {user.isPremium && (
                      <Badge variant="secondary" className="mt-1">
                        <Crown className="h-3 w-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 border-b">
                <div className="space-y-2">
                  <Button asChild className="w-full">
                    <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                      Sign In
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/auth/register" onClick={() => setIsOpen(false)}>
                      Sign Up
                    </Link>
                  </Button>
                </div>
              </div>
            )}

            {/* Navigation Sections */}
            <div className="flex-1 py-2">
              {navigationSections.map((section, sectionIndex) => (
                <div key={section.title}>
                  <div className="px-6 py-2">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {section.title}
                    </h4>
                  </div>
                  <div className="space-y-1 px-3">
                    {section.items.map((item) => {
                      // Skip auth-required items if not logged in
                      if (item.requiresAuth && !user) return null
                      
                      const Icon = item.icon
                      const active = isActive(item.href)
                      
                      return (
                        <SheetClose asChild key={item.href}>
                          <Link
                            href={item.href}
                            className={`
                              flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors
                              ${active 
                                ? 'bg-primary text-primary-foreground' 
                                : 'hover:bg-accent hover:text-accent-foreground'
                              }
                            `}
                          >
                            <Icon className="h-4 w-4 flex-shrink-0" />
                            <span className="flex-1">{item.label}</span>
                            {item.badge && (
                              <Badge variant={active ? 'secondary' : 'default'} className="text-xs">
                                {item.badge}
                              </Badge>
                            )}
                            {item.premium && (
                              <Crown className="h-3 w-3 text-yellow-500" />
                            )}
                          </Link>
                        </SheetClose>
                      )
                    })}
                  </div>
                  {sectionIndex < navigationSections.length - 1 && (
                    <Separator className="my-4" />
                  )}
                </div>
              ))}
            </div>

            {/* Bottom Actions */}
            <div className="border-t p-3 space-y-1">
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="w-full justify-start"
              >
                {theme === 'light' ? (
                  <>
                    <Moon className="h-4 w-4 mr-3" />
                    Dark Mode
                  </>
                ) : (
                  <>
                    <Sun className="h-4 w-4 mr-3" />
                    Light Mode
                  </>
                )}
              </Button>

              {/* Profile Link */}
              {user && (
                <SheetClose asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="w-full justify-start"
                  >
                    <Link href={`/profile/${user.id}`}>
                      <User className="h-4 w-4 mr-3" />
                      My Profile
                    </Link>
                  </Button>
                </SheetClose>
              )}

              {/* Logout */}
              {user && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  Sign Out
                </Button>
              )}
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
