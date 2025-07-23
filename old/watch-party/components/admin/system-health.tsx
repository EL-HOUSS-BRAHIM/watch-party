"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Server, Database, Wifi, HardDrive } from "lucide-react"

interface SystemHealthProps {
  health: any
  isLoading: boolean
}

export function SystemHealth({ health, isLoading }: SystemHealthProps) {
  const defaultHealth = {
    server: { status: "healthy", uptime: "99.9%", load: 45 },
    database: { status: "healthy", connections: 23, responseTime: "12ms" },
    network: { status: "healthy", bandwidth: 78, latency: "8ms" },
    storage: { status: "healthy", usage: 62, available: "2.4TB" },
  }

  const data = health || defaultHealth

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-success text-success-foreground"
      case "warning":
        return "bg-warning text-warning-foreground"
      case "critical":
        return "bg-destructive text-destructive-foreground"
      default:
        return "bg-secondary text-secondary-foreground"
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-secondary rounded w-20" />
                  <div className="h-5 bg-secondary rounded w-16" />
                </div>
                <div className="h-2 bg-secondary rounded w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Health</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Server</span>
            </div>
            <Badge className={getStatusColor(data.server.status)}>{data.server.status}</Badge>
          </div>
          <Progress value={data.server.load} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Load: {data.server.load}%</span>
            <span>Uptime: {data.server.uptime}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Database</span>
            </div>
            <Badge className={getStatusColor(data.database.status)}>{data.database.status}</Badge>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Connections: {data.database.connections}</span>
            <span>Response: {data.database.responseTime}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wifi className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Network</span>
            </div>
            <Badge className={getStatusColor(data.network.status)}>{data.network.status}</Badge>
          </div>
          <Progress value={data.network.bandwidth} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Bandwidth: {data.network.bandwidth}%</span>
            <span>Latency: {data.network.latency}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Storage</span>
            </div>
            <Badge className={getStatusColor(data.storage.status)}>{data.storage.status}</Badge>
          </div>
          <Progress value={data.storage.usage} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Usage: {data.storage.usage}%</span>
            <span>Available: {data.storage.available}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
