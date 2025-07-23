"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, Users, Flag, Settings, Database, Activity } from "lucide-react"

export function QuickActions() {
  const actions = [
    {
      title: "User Management",
      description: "Manage user accounts and permissions",
      icon: Users,
      action: () => console.log("Navigate to users"),
      color: "bg-primary/10 text-primary",
    },
    {
      title: "Content Moderation",
      description: "Review reported content",
      icon: Flag,
      action: () => console.log("Navigate to reports"),
      color: "bg-warning/10 text-warning",
    },
    {
      title: "System Maintenance",
      description: "Perform system maintenance tasks",
      icon: Database,
      action: () => console.log("Navigate to system"),
      color: "bg-destructive/10 text-destructive",
    },
    {
      title: "Security Settings",
      description: "Configure security policies",
      icon: Shield,
      action: () => console.log("Navigate to security"),
      color: "bg-success/10 text-success",
    },
    {
      title: "System Settings",
      description: "Configure application settings",
      icon: Settings,
      action: () => console.log("Navigate to settings"),
      color: "bg-muted-foreground/10 text-muted-foreground",
    },
    {
      title: "Activity Monitor",
      description: "Monitor real-time activity",
      icon: Activity,
      action: () => console.log("Navigate to activity"),
      color: "bg-premium/10 text-premium",
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
            <Button
              key={action.title}
              variant="ghost"
              className="w-full justify-start h-auto p-4"
              onClick={action.action}
            >
              <div className={`rounded-lg p-2 mr-3 ${action.color}`}>
                <action.icon className="h-4 w-4" />
              </div>
              <div className="text-left">
                <div className="font-medium text-foreground">{action.title}</div>
                <div className="text-xs text-muted-foreground">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
