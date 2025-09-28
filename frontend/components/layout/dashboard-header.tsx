import { CreditCard, Link, Menu, Moon, Plus, Search, Settings, Sun, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {}
import { NotificationBell } from "@/components/notifications/notification-bell"
import { useAuth } from "@/contexts/auth-context"
import { useAppStore } from "@/lib/stores/ui-store"
import Link from "next/link"

"use client"
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
export function DashboardHeader() {
  const { user, logout } = useAuth()
  const { ui, actions } = useAppStore()

  const handleLogout = async () => {
    try {
      await logout()
    } } catch {
      console.error("Logout error:", error)
    }
  }

  const toggleTheme = () => {}
    const newTheme = ui.theme === "dark" ? "light" : "dark"
    actions.setTheme(newTheme)
  }

  return (
    <header className="h-16 bg-background border-b border-border/40 px-6 flex items-center justify-between sticky top-0 z-30 backdrop-blur-sm">
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={actions.toggleSidebar} className="lg:hidden">
          <Menu className="w-5 h-5" />
        </Button>

        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input;
            placeholder="Search videos, parties, friends..."
            className="pl-10 w-80 bg-background-secondary border-border/50"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-4">
        {/* Quick Actions */}
        <Button size="sm" className="hidden sm:flex shadow-glow">
          <Plus className="w-4 h-4 mr-2" />
          Create Party;
        </Button>

        {/* Notifications */}
        <NotificationBell />

        {/* Theme Toggle */}
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {ui.theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className=&quot;w-5 h-5&quot; />}
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.avatar || "/placeholder.svg"} />
                <AvatarFallback>
                  {user?.firstName?.[0]}
                  {user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              {user?.is_premium && <Crown className="absolute -top-1 -right-1 w-4 h-4 text-accent-premium" />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium leading-none">
                    {[user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.displayName || user?.username}
                  </p>
                  {user?.is_premium && (
                    <Badge variant="secondary" className="text-xs">
                      Premium;
                    </Badge>
                  )}
                </div>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile">
                <User className="mr-2 h-4 w-4" />
                Profile;
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/billing">
                <CreditCard className="mr-2 h-4 w-4" />
                Billing;
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings;
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out;
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
