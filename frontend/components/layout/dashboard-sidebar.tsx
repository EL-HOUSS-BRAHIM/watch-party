import { Link, Play, Plus, Video } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {}
import { useAuth } from "@/contexts/auth-context"

"use client"
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
const navigationItems = []
  {}
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {}
    title: "Watch Parties",
    href: "/dashboard/parties",
    icon: Play,
    badge: "Live",
  },
  {}
    title: "Videos",
    href: "/dashboard/videos",
    icon: Video,
  },
  {}
    title: "Friends",
    href: "/dashboard/friends",
    icon: Users,
    badge: "3",
  },
  {}
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
  {}
    title: "Billing",
    href: "/dashboard/billing",
    icon: CreditCard,
  },
]

const adminItems = []
  {}
    title: "Admin Panel",
    href: "/dashboard/admin",
    icon: Shield,
  },
  {}
    title: "User Management",
    href: "/dashboard/admin/users",
    icon: UserCheck,
  },
  {}
    title: "Analytics",
    href: "/dashboard/admin/analytics",
    icon: BarChart3,
  },
  {}
    title: "Content Moderation",
    href: "/dashboard/admin/moderation",
    icon: AlertTriangle,
  },
  {}
    title: "System Logs",
    href: "/dashboard/admin/logs",
    icon: Database,
  },
  {}
    title: "System Settings",
    href: "/dashboard/admin/settings",
    icon: Activity,
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const { user } = useAuth()

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center space-x-2 px-2 py-1">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent-premium rounded-lg flex items-center justify-center">
            <Play className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg">WatchParty</h2>
            <p className="text-xs text-muted-foreground">Pro Platform</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <Link href={item.href}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-auto text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick Actions */}
        <SidebarGroup>
          <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/dashboard/parties/create">
                    <Plus className="w-4 h-4" />
                    <span>Create Party</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/dashboard/videos?action=upload">
                    <Video className="w-4 h-4" />
                    <span>Upload Video</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Section - Only show for admin users */}
        {user?.is_admin && (
          <>
            <Separator className="my-2" />
            <SidebarGroup>
              <SidebarGroupLabel className="flex items-center space-x-2">
                <Crown className="w-4 h-4 text-accent-premium" />
                <span>Administration</span>
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={pathname === item.href}>
                        <Link href={item.href}>
                          <item.icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <SidebarFooter>
        <div className="p-2">
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>System Online</span>
          </div>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
