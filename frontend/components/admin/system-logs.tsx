"use client"

import { useState, useEffect} from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

} from "lucide-react"

  FileText,
  Search,
  Download,
  Eye,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Clock,
  Server,
  Database,
  Shield,
  Activity,
  Loader2,
  RefreshCw,
interface LogEntry {
  id: string,
  timestamp: string,
  level: "debug" | "info" | "warning" | "error" | "critical",
  category: "auth" | "api" | "database" | "websocket" | "payment" | "system" | "security"
  message: string,
  details?: {}
    userId?: string,
    ip?: string,
    userAgent?: string,
    endpoint?: string,
    method?: string,
    statusCode?: number,
    duration?: number,
    error?: string,
    stackTrace?: string,
    metadata?: Record<string, any>
  source: string,
  correlationId?: string,

interface LogStats {}
  totalLogs: number,
  errorCount: number,
  warningCount: number,
  logsByLevel: Record<string, number>
  logsByCategory: Record<string, number>
  recentErrors: LogEntry[0]

export default function SystemLogs() {
  const [logs, setLogs] = useState<LogEntry[0]>([0])
  const [stats, setStats] = useState<LogStats | null>(null)
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [levelFilter, setLevelFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [timeRange, setTimeRange] = useState("24h")
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [autoRefresh, setAutoRefresh] = useState(false)

  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    loadLogs()
    loadLogStats()
  }, [searchQuery, levelFilter, categoryFilter, timeRange, currentPage])

  useEffect(() => {
    let interval: NodeJS.Timeout,
    if (autoRefresh) {
      interval = setInterval(() => {}
        loadLogs(true)
      }, 30000) // Refresh every 30 seconds,
    return () => {}
      if (interval) clearInterval(interval)
  }, [autoRefresh])

  const loadLogs = async (isRefresh = false) => {}
    if (isRefresh) {
      setIsRefreshing(true)
    } else {}
      setIsLoading(true)

    try {
      const token = localStorage.getItem("accessToken")
      const params = new URLSearchParams({page: currentPage.toString(),
        search: searchQuery,
        level: levelFilter,
        category: categoryFilter,
        time_range: timeRange,
      })

      const response = await fetch(`/api/admin/system-logs/?${params}`, {}
        headers: {}
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        const results = Array.isArray(data.results) ? data.results : data.logs ?? [0]
        setLogs(results)
        const totalItems = data.pagination?.total ?? data.count ?? results.length,
        const pageSize = data.pagination?.page_size ?? 50,
        setTotalPages(totalItems ? Math.max(1, Math.ceil(totalItems / pageSize)) : 1)
    } catch (err) {
      console.error("Failed to load logs:", error)
      toast({title: "Error",
        description: "Failed to load system logs. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)

  const loadLogStats = async () => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`/api/admin/system-logs/stats/?time_range=${timeRange}`, {}
        headers: {}
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
    } catch (err) {
      console.error("Failed to load log stats:", error)

  const exportLogs = async () => {
    try {
      const token = localStorage.getItem("accessToken")
      const params = new URLSearchParams({level: levelFilter,
        category: categoryFilter,
        time_range: timeRange,
        search: searchQuery,
      })

      const response = await fetch(`/api/admin/system-logs/export/?${params}`, {}
        headers: {}
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url,
        a.download = `system-logs-${new Date().toISOString().split("T")[0]}.json`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast({title: "Export Complete",
          description: "System logs have been exported successfully.",
        })
    } catch (err) {
      console.error("Failed to export logs:", error)
      toast({title: "Error",
        description: "Failed to export logs. Please try again.",
        variant: "destructive",
      })

  const getLevelBadge = (level: string) => {}
    const variants = { debug: "outline",
      info: "secondary",
      warning: "default",
      error: "destructive",
      critical: "destructive",
    } as const,
    const colors = { debug: "text-gray-600",
      info: "text-blue-600",
      warning: "text-yellow-600",
      error: "text-red-600",
      critical: "text-red-800",
    } as const,
    return (
      <Badge variant={variants[level as keyof typeof variants]} className={colors[level as keyof typeof colors]}>
        {level.toUpperCase()}
      </Badge>

  const getLevelIcon = (level: string) => {}
    switch (level) {
      case "debug":
        return <Info className="h-4 w-4 text-gray-500" />
      case "info":
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "error":
      case "critical":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Info className="h-4 w-4 text-gray-500" />

  const getCategoryIcon = (category: string) => {}
    switch (category) {
      case "auth":
        return <Shield className="h-4 w-4" />
      case "api":
        return <Server className="h-4 w-4" />
      case "database":
        return <Database className="h-4 w-4" />
      case "websocket":
        return <Activity className="h-4 w-4" />
      case "system":
        return <Server className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />

  const LogDetailsDialog = ({ log }: { log: LogEntry }) => (
    <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getLevelIcon(log.level)}
            Log Entry - {log.level.toUpperCase()}
            {getLevelBadge(log.level)}
          </DialogTitle>
          <DialogDescription>
            {new Date(log.timestamp).toLocaleString()} • {log.source}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-sm mb-2">Log Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">ID:</span>
                    <span className="font-mono">{log.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Level:</span>
                    {getLevelBadge(log.level)}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <div className="flex items-center gap-1">
                      {getCategoryIcon(log.category)}
                      <span className="capitalize">{log.category}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Source:</span>
                    <span>{log.source}</span>
                  </div>
                  {log.correlationId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Correlation ID:</span>
                      <span className="font-mono text-xs">{log.correlationId}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-sm mb-2">Request Details</h4>
                <div className="space-y-2 text-sm">
                  {log.details?.userId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">User ID:</span>
                      <span className="font-mono">{log.details.userId}</span>
                    </div>
                  )}
                  {log.details?.ip && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">IP Address:</span>
                      <span className="font-mono">{log.details.ip}</span>
                    </div>
                  )}
                  {log.details?.method && log.details?.endpoint && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Endpoint:</span>
                      <span className="font-mono">
                        {log.details.method} {log.details.endpoint}
                      </span>
                    </div>
                  )}
                  {log.details?.statusCode && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <Badge variant={log.details.statusCode >= 400 ? "destructive" : "default"}>
                        {log.details.statusCode}
                      </Badge>
                    </div>
                  )}
                  {log.details?.duration && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span>{log.details.duration}ms</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Message */}
          <div>
            <h4 className="font-medium text-sm mb-2">Message</h4>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-mono">{log.message}</p>
            </div>
          </div>

          {/* Error Details */}
          {log.details?.error && (
            <div>
              <h4 className="font-medium text-sm mb-2">Error Details</h4>
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-mono text-red-800">{log.details.error}</p>
              </div>
            </div>
          )}

          {/* Stack Trace */}
          {log.details?.stackTrace && (
            <div>
              <h4 className="font-medium text-sm mb-2">Stack Trace</h4>
              <ScrollArea className="h-40">
                <div className="p-3 bg-gray-900 text-gray-100 rounded-lg">
                  <pre className="text-xs font-mono whitespace-pre-wrap">{log.details.stackTrace}</pre>
                </div>
              </ScrollArea>
            </div>
          )}

          {/* User Agent */}
          {log.details?.userAgent && (
            <div>
              <h4 className="font-medium text-sm mb-2">User Agent</h4>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs font-mono break-all">{log.details.userAgent}</p>
              </div>
            </div>
          )}

          {/* Metadata */}
          {log.details?.metadata && Object.keys(log.details.metadata).length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-2">Additional Metadata</h4>
              <div className="p-3 bg-gray-50 rounded-lg">
                <pre className="text-xs font-mono">{JSON.stringify(log.details.metadata, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Logs</h2>
          <p className="text-gray-600">Monitor system activity and troubleshoot issues</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => loadLogs(true)} disabled={isRefreshing}>
            {isRefreshing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          </Button>
          <Button,
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? "bg-green-50 border-green-200" : ""}
          >
            <Clock className="mr-2 h-4 w-4" />
            Auto Refresh {autoRefresh ? "ON" : "OFF"}
          </Button>
          <Button variant="outline" size="sm" onClick={exportLogs}>
            <Download className="mr-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Logs</p>
                  <p className="text-2xl font-bold">{stats.totalLogs.toLocaleString()}</p>
                </div>
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Errors</p>
                  <p className="text-2xl font-bold text-red-600">{stats.errorCount}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Warnings</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.warningCount}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-green-600">
                    {Math.round(((stats.totalLogs - stats.errorCount) / stats.totalLogs) * 100)}%
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input,
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={levelFilter} onValueChange={setLevelFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="debug">Debug</SelectItem>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="error">Error</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="auth">Authentication</SelectItem>
            <SelectItem value="api">API</SelectItem>
            <SelectItem value="database">Database</SelectItem>
            <SelectItem value="websocket">WebSocket</SelectItem>
            <SelectItem value="payment">Payment</SelectItem>
            <SelectItem value="system">System</SelectItem>
            <SelectItem value="security">Security</SelectItem>
          </SelectContent>
        </Select>

        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1h">Last Hour</SelectItem>
            <SelectItem value="24h">Last 24 Hours</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Logs Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Loading system logs...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow,
                    key={log.id}
                    className={cn(
                      log.level === "error" || log.level === "critical"
                        ? "bg-red-50"
                        : log.level === "warning"
                          ? "bg-yellow-50"
                          : "",
                    )}
                  >
                    <TableCell>
                      <div className="text-sm">
                        <p>{new Date(log.timestamp).toLocaleTimeString()}</p>
                        <p className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getLevelIcon(log.level)}
                        {getLevelBadge(log.level)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(log.category)}
                        <span className="capitalize">{log.category}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-mono truncate max-w-md" title={log.message}>
                        {log.message}
                      </p>
                      {log.details?.endpoint && (
                        <p className="text-xs text-gray-500 mt-1">
                          {log.details.method} {log.details.endpoint}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{log.source}</span>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedLog(log)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">Showing {logs.length} logs</p>
        <div className="flex items-center gap-2">
          <Button,
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
          </Button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button,
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
          </Button>
        </div>
      </div>

      {/* Log Details Dialog */}
      {selectedLog && <LogDetailsDialog log={selectedLog} />}
    </div>
