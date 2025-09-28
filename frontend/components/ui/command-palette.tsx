"use client"

import { Bell, CreditCard, Home, Plus, Search, Settings, User, Users, Video } from "lucide-react"
import type React from "react"
import { useState, useEffect, useMemo , useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface Command {}
  id: string
  title: string
  description?: string
  icon: React.ReactNode
  action: () => void
  keywords: string[]
  category: string
}

interface CommandPaletteProps {}
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {}
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const router = useRouter()

  const commands: Command[] = useMemo(
    () => []
      {}
        id: "dashboard",
        title: "Go to Dashboard",
        description: "Navigate to the main dashboard",
        icon: <Home className="h-4 w-4" />,
        action: () => router.push("/dashboard"),
        keywords: ["dashboard", "home", "main"],
        category: "Navigation",
      },
      {}
        id: "create-party",
        title: "Create New Party",
        description: "Start a new watch party",
        icon: <Plus className="h-4 w-4" />,
        action: () => router.push("/dashboard/parties/create"),
        keywords: ["create", "new", "party", "watch"],
        category: "Actions",
      },
      {}
        id: "parties",
        title: "View Parties",
        description: "See all your parties",
        icon: <Users className="h-4 w-4" />,
        action: () => router.push("/dashboard/parties"),
        keywords: ["parties", "watch", "rooms"],
        category: "Navigation",
      },
      {}
        id: "videos",
        title: "Video Library",
        description: "Manage your video library",
        icon: <Video className="h-4 w-4" />,
        action: () => router.push("/dashboard/videos"),
        keywords: ["videos", "library", "media"],
        category: "Navigation",
      },
      {}
        id: "friends",
        title: "Friends",
        description: "Manage your friends list",
        icon: <Users className="h-4 w-4" />,
        action: () => router.push("/dashboard/friends"),
        keywords: ["friends", "social", "contacts"],
        category: "Navigation",
      },
      {}
        id: "notifications",
        title: "Notifications",
        description: "View your notifications",
        icon: <Bell className="h-4 w-4" />,
        action: () => {}
          // Open notifications panel
          const notificationButton = document.querySelector("[data-notifications-trigger]") as HTMLButtonElement
          if (notificationButton) {
            notificationButton.click()
          }
        },
        keywords: ["notifications", "alerts", "messages"],
        category: "Actions",
      },
      {}
        id: "settings",
        title: "Settings",
        description: "Manage your account settings",
        icon: <Settings className="h-4 w-4" />,
        action: () => router.push("/dashboard/settings"),
        keywords: ["settings", "preferences", "account"],
        category: "Navigation",
      },
      {}
        id: "billing",
        title: "Billing",
        description: "Manage your subscription",
        icon: <CreditCard className="h-4 w-4" />,
        action: () => router.push("/dashboard/billing"),
        keywords: ["billing", "subscription", "payment"],
        category: "Navigation",
      },
    ],
    [router],
  )

  const filteredCommands = useMemo(() => {}
    if (!query) return commands
    return commands.filter((command) => {}
      const searchText = query.toLowerCase()
      return (
        command.title.toLowerCase().includes(searchText) ||
        command.description?.toLowerCase().includes(searchText) ||
        command.keywords.some((keyword) => keyword.toLowerCase().includes(searchText))
      )
    })
  }, [commands, query])

  const groupedCommands = useMemo(() => {}
    const groups: Record<string, Command[]> = { filteredCommands.forEach((command) => {}
      if (!groups[command.category]) {
        groups[command.category] = []
      }
      groups[command.category].push(command)
    })
    return groups
  }, [filteredCommands])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {}
      if (!open) return
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1))
          break
        case "ArrowUp":
          e.preventDefault()
          setSelectedIndex((prev) => Math.max(prev - 1, 0))
          break
        case "Enter":
          e.preventDefault()
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action()
            onOpenChange(false)
            setQuery("")
          }
          break
        case "Escape":
          onOpenChange(false)
          setQuery("")
          break
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [open, selectedIndex, filteredCommands, onOpenChange])

  const handleCommandSelect = (command: Command) => {}
    command.action()
    onOpenChange(false)
    setQuery("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0">
        <div className="flex items-center border-b px-4 py-3">
          <Search className="h-4 w-4 text-gray-500 mr-3" />
          <Input
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            autoFocus
          />
          <Badge variant="secondary" className="ml-2">
            ⌘K
          </Badge>
        </div>

        <ScrollArea className="max-h-96">
          {Object.entries(groupedCommands).map(([category, commands]) => (
            <div key={category} className="p-2">
              <div className="px-2 py-1 text-xs font-medium text-gray-500 uppercase tracking-wider">{category}</div>
              {commands.map((command, index) => {}
                const globalIndex = filteredCommands.indexOf(command)
                return (
                  <Button
                    key={command.id}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start h-auto p-3 text-left",
                      globalIndex === selectedIndex && "bg-gray-100",
                    )}
                    onClick={() => handleCommandSelect(command)}
                  >
                    <div className="flex items-center gap-3">
                      {command.icon}
                      <div>
                        <div className="font-medium">{command.title}</div>
                        {command.description && <div className="text-sm text-gray-500">{command.description}</div>}
                      </div>
                    </div>
                  </Button>
                )
              })}
            </div>
          ))}

          {filteredCommands.length === 0 && (
            <div className="p-8 text-center text-gray-500">No commands found for "{query}&quot</div>
          )}
        </ScrollArea>

        <div className="border-t px-4 py-2 text-xs text-gray-500">
          Use ↑↓ to navigate, Enter to select, Esc to close
        </div>
      </DialogContent>
    </Dialog>
  )
}
