"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Upload, Users, Settings } from "lucide-react"

export function QuickActions() {
  const actions = [
    {
      title: "Create Party",
      description: "Start a new watch party",
      icon: Plus,
      href: "/dashboard/parties/create",
      color: "bg-primary/10 text-primary",
    },
    {
      title: "Upload Video",
      description: "Add a new video to your library",
      icon: Upload,
      href: "/dashboard/videos/upload",
      color: "bg-success/10 text-success",
    },
    {
      title: "Invite Friends",
      description: "Add friends to your network",
      icon: Users,
      href: "/dashboard/friends",
      color: "bg-premium/10 text-premium",
    },
    {
      title: "Settings",
      description: "Manage your account",
      icon: Settings,
      href: "/dashboard/settings",
      color: "bg-muted-foreground/10 text-muted-foreground",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {actions.map((action) => (
            <Button key={action.title} variant="ghost" className="w-full justify-start h-auto p-4" asChild>
              <Link href={action.href}>
                <div className={`rounded-lg p-2 mr-3 ${action.color}`}>
                  <action.icon className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-foreground">{action.title}</div>
                  <div className="text-xs text-muted-foreground">{action.description}</div>
                </div>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
