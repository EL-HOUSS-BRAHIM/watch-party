"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Server,
  Database,
  Shield,
  Activity,
  Clock,
} from "lucide-react"

export function SystemLogs() {
  const [searchTerm, setSearchTerm] = useState("")
  const [levelFilter, setLevelFilter] = useState("all")
  const [serviceFilter, setServiceFilter] = useState("all")
  const [selectedLog, setSelectedLog] = useState<any>(null)

  // Mock log data
  const systemLogs = [
    {
      id: "log_001",
      timestamp: "2024-01-20T10:30:15.123Z",
      level: "error",
      service: "video-service",
      message: "Failed to process video upload",
      details: "Error processing video file: invalid format detected",
      user_id: "user_123",
      ip_address: "192.168.1.100",
      request_id: "req_abc123",
      stack_trace:
        "VideoProcessingError: Invalid format\n  at processVideo (video.js:45)\n  at uploadHandler (upload.js:23)",
    },
    {
      id: "log_002",
      timestamp: "2024-01-20T10:29:45.456Z",
      level: "warning",
      service: "auth-service",
      message: "Multiple failed login attempts detected",
      details: "User attempted login 5 times with incorrect password",
      user_id: "user_456",
      ip_address: "192.168.1.101",
      request_id: "req_def456",
      stack_trace: null,
    },
    {
      id: "log_003",
      timestamp: "2024-01-20T10:29:30.789Z",
      level: "info",
      service: "party-service",
      message: "Watch party created successfully",
      details: "New watch party created with 5 participants",
      user_id: "user_789",
      ip_address: "192.168.1.102",
      request_id: "req_ghi789",
      stack_trace: null,
    },
    {
      id: "log_004",
      timestamp: "2024-01-20T10:28:20.012Z",
      level: "error",
      service: "database",
      message: "Database connection timeout",
      details: "Connection to primary database timed out after 30 seconds",
      user_id: null,
      ip_address: "internal",
      request_id: "req_jkl012",
      stack_trace: "ConnectionTimeoutError: Database timeout\n  at connect (db.js:12)\n  at query (query.js:8)",
    },
    {
      id: "log_005",
      timestamp: "2024-01-20T10:27:55.345Z",
      level: "success",
      service: "payment-service",
      message: "Payment processed successfully",
      details: "Subscription payment of $9.99 processed for premium plan",
      user_id: "user_101",
      ip_address: "192.168.1.103",
      request_id: "req_mno345",
      stack_trace: null,
    },
  ]

  const getLevelBadge = (level: string) => {
    switch (level) {
      case "error":
        return <Badge variant="destructive">Error</Badge>
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
      case "info":
        return <Badge variant="outline">Info</Badge>
      case "success":
        return <Badge className="bg-green-100 text-green-800">Success</Badge>
      case "debug":
        return <Badge variant="secondary">Debug</Badge>
      default:
        return <Badge variant="outline">{level}</Badge>
    }
  }

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case "info":
        return <Info className="w-4 h-4 text-blue-500" />
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      default:
        return <Activity className="w-4 h-4 text-gray-500" />
    }
  }

  const getServiceIcon = (service: string) => {
    switch (service) {
      case "video-service":
        return <Activity className="w-4 h-4" />
      case "auth-service":
        return <Shield className="w-4 h-4" />
      case "database":
        return <Database className="w-4 h-4" />
      case "payment-service":
        return <Server className="w-4 h-4" />
      default:
        return <Server className="w-4 h-4" />
    }
  }

  const filteredLogs = systemLogs.filter((log) => {
    const matchesSearch =
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLevel = levelFilter === "all" || log.level === levelFilter
    const matchesService = serviceFilter === "all" || log.service === serviceFilter

    return matchesSearch && matchesLevel && matchesService
  })

  const logStats = {
    total: systemLogs.length,
    errors: systemLogs.filter((log) => log.level === "error").length,
    warnings: systemLogs.filter((log) => log.level === "warning").length,
    info: systemLogs.filter((log) => log.level === "info").length,
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logStats.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Errors</CardTitle>
            <XCircle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{logStats.errors}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warnings</CardTitle>
            <AlertTriangle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{logStats.warnings}</div>
            <p className="text-xs text-muted-foreground">Monitor closely</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Info Logs</CardTitle>
            <Info className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logStats.info}</div>
            <p className="text-xs text-muted-foreground">Normal operations</p>
          </CardContent>
        </Card>
      </div>

      {/* Logs Interface */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>System Logs</CardTitle>
              <CardDescription>Monitor system events, errors, and application logs</CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="live" className="space-y-4">
            <TabsList>
              <TabsTrigger value="live">Live Logs</TabsTrigger>
              <TabsTrigger value="search">Search & Filter</TabsTrigger>
              <TabsTrigger value="analytics">Log Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="live" className="space-y-4">
              {/* Quick Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search logs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={levelFilter} onValueChange={setLevelFilter}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="error">Errors</SelectItem>
                    <SelectItem value="warning">Warnings</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="debug">Debug</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={serviceFilter} onValueChange={setServiceFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Services</SelectItem>
                    <SelectItem value="video-service">Video Service</SelectItem>
                    <SelectItem value="auth-service">Auth Service</SelectItem>
                    <SelectItem value="database">Database</SelectItem>
                    <SelectItem value="payment-service">Payment Service</SelectItem>
                    <SelectItem value="party-service">Party Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Logs Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2 text-xs">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(log.timestamp).toLocaleString()}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getLevelIcon(log.level)}
                            {getLevelBadge(log.level)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getServiceIcon(log.service)}
                            <span className="text-sm">{log.service}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-md">
                            <p className="text-sm font-medium truncate">{log.message}</p>
                            <p className="text-xs text-muted-foreground truncate">{log.details}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs">
                            {log.user_id ? (
                              <div>
                                <div>{log.user_id}</div>
                                <div className="text-muted-foreground">{log.ip_address}</div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">System</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline" onClick={() => setSelectedLog(log)}>
                                View Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-3xl">
                              <DialogHeader>
                                <DialogTitle>Log Details</DialogTitle>
                                <DialogDescription>Detailed information about this log entry</DialogDescription>
                              </DialogHeader>
                              {selectedLog && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium">Timestamp</label>
                                      <p className="text-sm text-muted-foreground">
                                        {new Date(selectedLog.timestamp).toLocaleString()}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Level</label>
                                      <div className="mt-1">{getLevelBadge(selectedLog.level)}</div>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Service</label>
                                      <p className="text-sm text-muted-foreground">{selectedLog.service}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Request ID</label>
                                      <p className="text-sm text-muted-foreground font-mono">
                                        {selectedLog.request_id}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">User ID</label>
                                      <p className="text-sm text-muted-foreground">{selectedLog.user_id || "N/A"}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">IP Address</label>
                                      <p className="text-sm text-muted-foreground">{selectedLog.ip_address}</p>
                                    </div>
                                  </div>

                                  <div>
                                    <label className="text-sm font-medium">Message</label>
                                    <p className="text-sm text-muted-foreground">{selectedLog.message}</p>
                                  </div>

                                  <div>
                                    <label className="text-sm font-medium">Details</label>
                                    <p className="text-sm text-muted-foreground">{selectedLog.details}</p>
                                  </div>

                                  {selectedLog.stack_trace && (
                                    <div>
                                      <label className="text-sm font-medium">Stack Trace</label>
                                      <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-40">
                                        {selectedLog.stack_trace}
                                      </pre>
                                    </div>
                                  )}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="search">
              <Card>
                <CardHeader>
                  <CardTitle>Advanced Search</CardTitle>
                  <CardDescription>Search logs with advanced filters and date ranges</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Advanced search functionality will be implemented here...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <Card>
                <CardHeader>
                  <CardTitle>Log Analytics</CardTitle>
                  <CardDescription>Analyze log patterns and trends over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Log analytics and visualization will be displayed here...</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
