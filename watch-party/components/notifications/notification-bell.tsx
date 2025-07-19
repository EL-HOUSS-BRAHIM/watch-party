"use client"

import { useState } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function NotificationBell() {
  const [notifications] = useState([
    {
      id: 1,
      title: "New party invitation",
      message: "Sarah invited you to watch Liverpool vs Arsenal",
      time: "2 min ago",
      unread: true,
    },
    {
      id: 2,
      title: "Party starting soon",
      message: "Champions League Final starts in 15 minutes",
      time: "15 min ago",
      unread: true,
    },
  ])

  const unreadCount = notifications.filter((n) => n.unread).length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-error text-xs text-white flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <div className="p-2">
          <h3 className="font-semibold text-text-primary mb-2">Notifications</h3>
          {notifications.length === 0 ? (
            <p className="text-text-secondary text-sm">No new notifications</p>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem key={notification.id} className="flex flex-col items-start p-3">
                <div className="font-medium text-text-primary">{notification.title}</div>
                <div className="text-sm text-text-secondary">{notification.message}</div>
                <div className="text-xs text-text-tertiary mt-1">{notification.time}</div>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
