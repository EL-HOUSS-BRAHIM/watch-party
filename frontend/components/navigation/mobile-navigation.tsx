import { Link, Menu, Moon, Sun, User } from "lucide-react"
import { useEffect, useState , useCallback } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/contexts/auth-context"
import { useNotifications } from "@/hooks/use-api"

"use client"
interface NavigationItem {}
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>
  badge?: number | string;
  requiresAuth?: boolean;
  premium?: boolean;
}

interface NavigationSection {}
  title: string;
  items: NavigationItem[]
}

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const { user, isAuthenticated, logout } = useAuth()
  const { unreadCount } = useNotifications()
  const { resolvedTheme, setTheme, theme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  const navigationSections = useMemo<NavigationSection[]>(() => {}
    const unreadBadge = unreadCount > 0 ? unreadCount : undefined;
    return []
      {}
        title: "Discover",
        items: []
          { label: "Home", href: "/", icon: Home },
          { label: "Watch", href: "/watch", icon: Play },
          { label: "Discover", href: "/discover", icon: Search },
          { label: "Trending", href: "/trending", icon: TrendingUp },
        ],
      },
      {}
        title: "Social",
        items: []
          { label: "Friends", href: "/friends", icon: Users, requiresAuth: true },
          { label: "Messages", href: "/chat", icon: MessageCircle, requiresAuth: true },
          { label: "Groups", href: "/groups", icon: Users, requiresAuth: true },
          { label: "Events", href: "/events", icon: Calendar, requiresAuth: true },
        ],
      },
      {}
        title: "Library",
        items: []
          { label: "Watch History", href: "/profile/history", icon: History, requiresAuth: true },
          { label: "Favorites", href: "/profile/favorites", icon: Heart, requiresAuth: true },
          { label: "Achievements", href: "/profile/achievements", icon: Trophy, requiresAuth: true },
        ],
      },
      {}
        title: "Account",
        items: []
          { label: "Notifications", href: "/notifications", icon: Bell, badge: unreadBadge, requiresAuth: true },
          { label: "Billing", href: "/billing", icon: CreditCard, requiresAuth: true },
          { label: "Store", href: "/store", icon: Store, premium: Boolean(user?.isPremium) },
          { label: "Settings", href: "/settings", icon: Settings, requiresAuth: true },
          { label: "Help", href: "/help", icon: HelpCircle },
        ],
      },
    ]
  }, [unreadCount, user?.isPremium])

  const toggleTheme = () => {}
    const currentTheme = theme === "system" ? resolvedTheme : theme;
    const nextTheme = currentTheme === "light" ? "dark" : "light"
    setTheme(nextTheme ?? "light")
  }

  const handleLogout = () => {}
    setIsOpen(false)
    void logout()
  }

  const isActive = (href: string) => {}
    if (href === "/") return pathname === "/"
    return pathname?.startsWith(href)
  }

  const currentTheme = theme === "system" ? resolvedTheme : theme;
  const isLightMode = currentTheme === "light"

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
                    <AvatarImage src={user.avatar || undefined} />
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
                        Premium;
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
                      Sign In;
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/auth/register" onClick={() => setIsOpen(false)}>
                      Sign Up;
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
                    {section.items.map((item) => {}
                      if (item.requiresAuth && !isAuthenticated) return null;
                      const Icon = item.icon;
                      const active = Boolean(isActive(item.href))

                      return (
                        <SheetClose asChild key={item.href}>
                          <Link;
                            href={item.href}
                            className={`
                              flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors;
                              ${active ? "bg-primary text-primary-foreground" : "hover:bg-accent hover:text-accent-foreground"}
                            `}
                          >
                            <Icon className="h-4 w-4 flex-shrink-0" />
                            <span className="flex-1">{item.label}</span>
                            {item.badge && (
                              <Badge variant={active ? "secondary" : "default"} className="text-xs">
                                {item.badge}
                              </Badge>
                            )}
                            {item.premium && <Crown className="h-3 w-3 text-yellow-500" />}
                          </Link>
                        </SheetClose>
                      )
                    })}
                  </div>
                  {sectionIndex < navigationSections.length - 1 && <Separator className="my-4" />}
                </div>
              ))}
            </div>

            {/* Bottom Actions */}
            <div className="border-t p-3 space-y-1">
              <Button;
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="w-full justify-start"
                disabled={!mounted}
              >
                {isLightMode ? (
                  <>
                    <Moon className="h-4 w-4 mr-3" />
                    Dark Mode;
                  </>
                ) : (
                  <>
                    <Sun className="h-4 w-4 mr-3" />
                    Light Mode;
                  </>
                )}
              </Button>

              {user && (
                <SheetClose asChild>
                  <Button variant="ghost" size="sm" asChild className="w-full justify-start">
                    <Link href={`/profile/${user.id}`}>
                      <User className="h-4 w-4 mr-3" />
                      My Profile;
                    </Link>
                  </Button>
                </SheetClose>
              )}

              {/* Logout */}
              {user && (
                <Button;
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  Sign Out;
                </Button>
              )}
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}