"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import {
  Server,
  Database,
  Wifi,
  HardDrive,
  RefreshCw,
  Power,
  Settings,
  AlertTriangle,
  CheckCircle,
  Activity,
} from "lucide-react"

export default function AdminSystemPage() {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const systemServices = [
    {
      name: "API Server",
      status: "healthy",
      uptime: "99.9%",
      lastRestart: "2 days ago",
      cpu: 45,
      memory: 62,
      icon: Server,
    },
    {
      name: "Database",
      status: "healthy",
      uptime: "99.8%",
      lastRestart: "5 days ago",
      cpu: 23,
      memory: 78,
      icon: Database,
    },
    {
      name: "WebSocket Server",
      status: "healthy",
      uptime: "99.9%",
      lastRestart: "1 day ago",
      cpu: 34,
      memory: 45,
      icon: Wifi,
    },
    {
      name: "File Storage",
      status: "warning",
      uptime: "99.5%",
      lastRestart: "3 hours ago",
      cpu: 12,
      memory: 89,
      icon: HardDrive,
    },
  ]

  const systemLogs = [
    {
      id: 1,
      timestamp: "2024-01-20T15:30:00Z",
      level: "info",
      service: "API Server",
      message: "Server started successfully",
    },
    {
      id: 2,
      timestamp: "2024-01-20T15:25:00Z",
      level: "warning",
      service: "File Storage",
      message: "High memory usage detected (89%)",
    },
    {
      id: 3,
      timestamp: "2024-01-20T15:20:00Z",
      level: "info",
      service: "Database",
      message: "Backup completed successfully",
    },
    {
      id: 4,
      timestamp: "2024-01-20T15:15:00Z",
      level: "error",
      service: "WebSocket Server",
      message: "Connection timeout for user session",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "healthy":
        return <Badge className="bg-success text-success-foreground">Healthy</Badge>
      case "warning":
        return <Badge className="bg-warning text-warning-foreground">Warning</Badge>
      case "critical":
        return <Badge variant="destructive">Critical</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getLogLevelBadge = (level: string) => {
    switch (level) {
      case "error":
        return <Badge variant="destructive">Error</Badge>
      case "warning":
        return <Badge className="bg-warning text-warning-foreground">Warning</Badge>
      case "info":
        return <Badge variant="secondary">Info</Badge>
      default:
        return <Badge variant="secondary">{level}</Badge>
    }
  }

  const handleServiceAction = async (action: string, serviceName: string) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))
      toast({
        title: "Action completed",
        description: `${action} ${serviceName} successfully.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} ${serviceName}.`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleMaintenanceMode = async (enabled: boolean) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setIsMaintenanceMode(enabled)
      toast({
        title: enabled ? "Maintenance mode enabled" : "Maintenance mode disabled",
        description: enabled ? "The platform is now in maintenance mode." : "The platform is now live.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to toggle maintenance mode.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">System Management</h1>
        <p className="text-muted-foreground">Monitor and manage system services, performance, and maintenance.</p>
      </div>

      {/* System Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-foreground">Maintenance Mode</h3>
              <p className="text-sm text-muted-foreground">Enable maintenance mode to perform system updates</p>
            </div>
            <Switch checked={isMaintenanceMode} onCheckedChange={handleMaintenanceMode} disabled={isLoading} />
          </div>

          <div className="flex space-x-4">
            <Button
              onClick={() => handleServiceAction("restart", "all services")}
              disabled={isLoading}
              variant="outline"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Restart All Services
            </Button>
            <Button onClick={() => handleServiceAction("backup", "database")} disabled={isLoading} variant="outline">
              <Database className="h-4 w-4 mr-2" />
              Backup Database
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Service Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Service Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {systemServices.map((service) => (
              <div key={service.name} className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <service.icon className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-medium text-foreground">{service.name}</h3>
                  </div>
                  {getStatusBadge(service.status)}
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Uptime</span>
                    <span className="font-medium text-foreground">{service.uptime}</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">CPU Usage</span>
                      <span className="font-medium text-foreground">{service.cpu}%</span>
                    </div>
                    <Progress value={service.cpu} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Memory Usage</span>
                      <span className="font-medium text-foreground">{service.memory}%</span>
                    </div>
                    <Progress value={service.memory} className="h-2" />
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Last Restart</span>
                    <span className="font-medium text-foreground">{service.lastRestart}</span>
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleServiceAction("restart", service.name)}
                      disabled={isLoading}
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Restart
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleServiceAction("stop", service.name)}
                      disabled={isLoading}
                    >
                      <Power className="h-3 w-3 mr-1" />
                      Stop
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent System Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {systemLogs.map((log) => (
              <div key={log.id} className="flex items-start space-x-3 p-3 border border-border rounded-lg">
                <div className="flex-shrink-0 mt-1">
                  {log.level === "error" ? (
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  ) : log.level === "warning" ? (
                    <AlertTriangle className="h-4 w-4 text-warning" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-success" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    {getLogLevelBadge(log.level)}
                    <span className="text-sm font-medium text-foreground">{log.service}</span>
                    <span className="text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{log.message}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
