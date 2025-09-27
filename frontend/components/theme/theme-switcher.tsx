"use client"

import { useTheme } from "next-themes"
import { Moon, Sun, Monitor } from "lucide-react"
import { WatchPartyButton } from "@/components/ui/watch-party-button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function ThemeSwitcher() {
  const { setTheme, theme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <WatchPartyButton
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-md border border-watch-party-border bg-watch-party-surface hover:bg-watch-party-elevation-1 hover:shadow-watch-party-glow transition-all duration-200"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-watch-party-primary" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-watch-party-primary" />
          <span className="sr-only">Toggle theme</span>
        </WatchPartyButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-watch-party-elevation-1 border-watch-party-border shadow-watch-party-deep"
      >
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="hover:bg-watch-party-surface focus:bg-watch-party-surface text-watch-party-text-primary"
        >
          <Sun className="mr-2 h-4 w-4 text-watch-party-primary" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="hover:bg-watch-party-surface focus:bg-watch-party-surface text-watch-party-text-primary"
        >
          <Moon className="mr-2 h-4 w-4 text-watch-party-primary" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className="hover:bg-watch-party-surface focus:bg-watch-party-surface text-watch-party-text-primary"
        >
          <Monitor className="mr-2 h-4 w-4 text-watch-party-primary" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
