"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Play, Users, Settings, Bell } from "lucide-react"
import { cn } from "@/lib/utils"
import { WatchPartyButton } from "@/components/ui/watch-party-button"
import { ThemeSwitcher } from "@/components/theme/theme-switcher"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Play },
  { name: "Watch Parties", href: "/dashboard/parties", icon: Users },
  { name: "Discover", href: "/discover", icon: Play },
]

export function WatchPartyHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-watch-party-border bg-watch-party-surface/95 backdrop-blur supports-[backdrop-filter]:bg-watch-party-surface/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-watch-party-gradient">
            <Play className="h-4 w-4 text-white" />
          </div>
          <span className="text-xl font-bold text-watch-party-text-primary">WatchParty</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link key={item.name} href={item.href}>
                <WatchPartyButton
                  variant={isActive ? "gradient" : "ghost"}
                  size="sm"
                  className={cn("transition-all duration-200", isActive && "shadow-watch-party-glow")}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </WatchPartyButton>
              </Link>
            )
          })}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center space-x-2">
          {/* Notifications */}
          <WatchPartyButton variant="ghost" size="icon">
            <Bell className="h-4 w-4" />
            <span className="sr-only">Notifications</span>
          </WatchPartyButton>

          {/* Theme Switcher */}
          <ThemeSwitcher />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <WatchPartyButton variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder-user.jpg" alt="User" />
                  <AvatarFallback className="bg-watch-party-primary text-white">U</AvatarFallback>
                </Avatar>
              </WatchPartyButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56 bg-watch-party-elevation-1 border-watch-party-border shadow-watch-party-deep"
              align="end"
              forceMount
            >
              <DropdownMenuLabel className="font-normal text-watch-party-text-primary">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">John Doe</p>
                  <p className="text-xs leading-none text-watch-party-text-secondary">john@example.com</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-watch-party-border" />
              <DropdownMenuItem className="hover:bg-watch-party-surface focus:bg-watch-party-surface text-watch-party-text-primary">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-watch-party-surface focus:bg-watch-party-surface text-watch-party-text-primary">
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-watch-party-border" />
              <DropdownMenuItem className="hover:bg-watch-party-surface focus:bg-watch-party-surface text-watch-party-error">
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
