"use client"

import { AlertTriangle, Calendar, Check, CheckCircle, ChevronRight, External, Eye, File, FileText, Filter, Flag, Loader2, Search, Shield, User, Video, X, XCircle } from "lucide-react"
import { useState, useEffect , useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { adminAPI } from "@/lib/api"
import { formatDistanceToNow, format, parseISO } from "date-fns"

interface ReportedUser {}
  id: string
  username: string
  first_name: string
  last_name: string
  email: string
  avatar?: string
  is_verified: boolean
  account_created: string
  last_active: string
  total_reports: number
  is_banned: boolean
  ban_reason?: string
}

interface Reporter {}
  id: string
  username: string
  first_name: string
  last_name: string
  avatar?: string
  is_verified: boolean
}

interface ReportContent {}
  id: string
  type: "message" | "party" | "profile" | "video" | "comment"
  content?: string
  url?: string
  thumbnail?: string
  title?: string
  created_at: string
}

interface Report {}
  id: string
  type: "user" | "content" | "party" | "harassment" | "spam" | "inappropriate_content" | "copyright" | "other"
  category: string
  reason: string
  description?: string
  severity: "low" | "medium" | "high" | "critical"
  status: "pending" | "under_review" | "resolved" | "dismissed" | "escalated"
  created_at: string
  updated_at: string
  reporter: Reporter
  reported_user?: ReportedUser
  reported_content?: ReportContent
  admin_notes?: string
  resolution?: string
  resolved_by?: {}
    id: string
    username: string
    first_name: string
    last_name: string
  }
  resolved_at?: string
  evidence_urls: string[]
  priority_score: number
  is_automated: boolean
  related_reports_count: number
}

interface FilterOptions {}
  status: string
  type: string
  severity: string
  timeRange: string
  assignedToMe: boolean
}

export default function ReportsManagementPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()

  const [reports, setReports] = useState<Report[]>([])
  const [filteredReports, setFilteredReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [processingActions, setProcessingActions] = useState<Set<string>>(new Set())
  const [filters, setFilters] = useState<FilterOptions>({}
    status: "all",
    type: "all", 
    severity: "all",
    timeRange: "all",
    assignedToMe: false
  })

  useEffect(() => {
    // Check if user has admin permissions
    if (!user?.is_staff && !user?.is_superuser) {
      router.push("/dashboard")
      return
    }
    loadReports()
  }, [user, router])

  useEffect(() => {
    filterReports()
  }, [reports, searchQuery, filters])

  const loadReports = async () => {
    try {
      const data = await adminAPI.getReports({status: filters.status !== "all" ? filters.status as Record<string, unknown> : undefined,
        page: 1, // You can add pagination later
      })
      setReports(data.results || [])
    } catch (err) {
      console.error("Failed to load reports:", error)
      if ((error as Record<string, unknown>)?.response?.status === 403) {}
        toast({title: "Access Denied",
          description: "You don't have permission to access this page.",
          variant: "destructive",
        })
        router.push("/dashboard")
      } else {}
        toast({title: "Error",
          description: "Failed to load reports.",
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const filterReports = () => {}
    let filtered = [...reports]

    // Search filter
    if (searchQuery.trim()) {}
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(report =>
        report.reason.toLowerCase().includes(query) ||
        report.description?.toLowerCase().includes(query) ||
        report.reporter.username.toLowerCase().includes(query) ||
        report.reported_user?.username.toLowerCase().includes(query) ||
        report.category.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (filters.status !== "all") {
      filtered = filtered.filter(report => report.status === filters.status)
    }

    // Type filter
    if (filters.type !== "all") {
      filtered = filtered.filter(report => report.type === filters.type)
    }

    // Severity filter
    if (filters.severity !== "all") {
      filtered = filtered.filter(report => report.severity === filters.severity)
    }

    // Time range filter
    if (filters.timeRange !== "all") {
      const now = new Date()
      filtered = filtered.filter(report => {}
        const reportDate = parseISO(report.created_at)
        const daysDiff = (now.getTime() - reportDate.getTime()) / (1000 * 60 * 60 * 24)
        switch (filters.timeRange) {
          case "today":
            return daysDiff <= 1
          case "week":
            return daysDiff <= 7
          case "month":
            return daysDiff <= 30
          default:
            return true
        }
      })
    }

    // Sort by priority and date
    filtered.sort((a, b) => {}
      // First by priority score (high to low)
      if (a.priority_score !== b.priority_score) {
        return b.priority_score - a.priority_score
      }
      // Then by creation date (newest first)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    setFilteredReports(filtered)
  }

  const updateReportStatus = async (reportId: string, status: string, resolution?: string, adminNotes?: string) => {}
    setProcessingActions(prev => new Set(prev).add(reportId))

    try {
      await adminAPI.resolveReport(reportId, {}
        action: status === "resolved" ? "dismiss" : status as Record<string, unknown>,
        reason: resolution || adminNotes,
      })

      await loadReports() // Reload reports to get updated data
      toast({title: "Report Updated",
        description: `Report has been ${status === "resolved" ? "resolved" : status}.`,
      })

      if (selectedReport?.id === reportId) {
        // Update the selected report from the refreshed data
        const updatedReport = reports.find(r => r.id === reportId)
        if (updatedReport) {
          setSelectedReport(updatedReport)
        }
      }
    } catch (err) {
      console.error("Update report error:", error)
      toast({title: "Error",
        description: "Failed to update report status.",
        variant: "destructive",
      })
    } finally {
      setProcessingActions(prev => {}
        const newSet = new Set(prev)
        newSet.delete(reportId)
        return newSet
      })
    }
  }

  const takeAction = async (reportId: string, action: string, reason?: string) => {}
    setProcessingActions(prev => new Set(prev).add(reportId))

    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`/api/admin/actions/`, {}
        method: "POST",
        headers: {}
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({report_id: reportId,
          action,
          reason,
          admin_id: user?.id
        }),
      })

      if (response.ok) {
        await loadReports() // Reload to get updated data
        const actionMessages = { ban_user: "User has been banned",
          suspend_user: "User has been suspended", 
          remove_content: "Content has been removed",
          warn_user: "Warning sent to user",
          dismiss: "Report has been dismissed"
        }

        toast({title: "Action Taken",
          description: actionMessages[action as keyof typeof actionMessages] || "Action completed successfully.",
        })
      } else {}
        throw new Error("Failed to take action")
      }
    } catch (err) {
      console.error("Take action error:", error)
      toast({title: "Error",
        description: "Failed to take action on report.",
        variant: "destructive",
      })
    } finally {
      setProcessingActions(prev => {}
        const newSet = new Set(prev)
        newSet.delete(reportId)
        return newSet
      })
    }
  }

  const getStatusColor = (status: string) => {}
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "under_review":
        return "bg-blue-100 text-blue-800"
      case "resolved":
        return "bg-green-100 text-green-800"
      case "dismissed":
        return "bg-gray-100 text-gray-800"
      case "escalated":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getSeverityColor = (severity: string) => {}
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getTypeIcon = (type: string) => {}
    switch (type) {
      case "user":
        return <User className="h-4 w-4" />
      case "content":
        return <FileText className="h-4 w-4" />
      case "party":
        return <Video className="h-4 w-4" />
      case "harassment":
        return <AlertTriangle className="h-4 w-4" />
      case "spam":
        return <Flag className="h-4 w-4" />
      case "inappropriate_content":
        return <Eye className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  if (!user?.is_staff && !user?.is_superuser) {
    return null // Will redirect in useEffect
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading reports...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="h-8 w-8" />
              Reports Management
            </h1>
            <p className="text-gray-600 mt-2">Review and moderate user reports</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {filteredReports.filter(r => r.status === "pending").length} Pending
            </Badge>
            <Badge variant="outline">
              {filteredReports.filter(r => r.severity === "critical" || r.severity === "high").length} High Priority
            </Badge>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search reports, users, or reasons..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filter dropdowns */}
              <div className="flex gap-2">
                <Select
                  value={filters.status}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="dismissed">Dismissed</SelectItem>
                    <SelectItem value="escalated">Escalated</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.severity}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, severity: value }))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severity</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.type}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="user">User Report</SelectItem>
                    <SelectItem value="content">Content</SelectItem>
                    <SelectItem value="harassment">Harassment</SelectItem>
                    <SelectItem value="spam">Spam</SelectItem>
                    <SelectItem value="inappropriate_content">Inappropriate</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.timeRange}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, timeRange: value }))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Reports List */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {filteredReports.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
                    <p className="text-gray-600">
                      {searchQuery || Object.values(filters).some(f => f !== "all" && f !== false)
                        ? "Try adjusting your search or filters"
                        : "All caught up! No pending reports to review"
                      }
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredReports.map((report) => (
                  <Card
                    key={report.id} 
                    className={`cursor-pointer transition-all hover:shadow-md ${}
                      selectedReport?.id === report.id ? "ring-2 ring-blue-500" : ""
                    } ${report.severity === "critical" ? "border-red-200" : ""}`}
                    onClick={() => setSelectedReport(report)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(report.type)}
                            <Badge className={getSeverityColor(report.severity)}>
                              {report.severity}
                            </Badge>
                          </div>
                          {report.is_automated && (
                            <Badge variant="outline" className="text-xs">Auto-flagged</Badge>
                          )}
                          {report.related_reports_count > 0 && (
                            <Badge variant="outline" className="text-xs">
                              +{report.related_reports_count} similar
                            </Badge>
                          )}
                        </div>
                        <Badge className={getStatusColor(report.status)}>
                          {report.status.replace("_", " ")}
                        </Badge>
                      </div>

                      <h3 className="font-semibold mb-2">{report.reason}</h3>
                      {report.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{report.description}</p>
                      )}

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={report.reporter.avatar} />
                              <AvatarFallback className="text-xs">
                                {report.reporter.first_name?.[0] || report.reporter.username?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-gray-600">
                              Reported by {report.reporter.first_name || report.reporter.username}
                            </span>
                          </div>
                          {report.reported_user && (
                            <div className="flex items-center gap-2">
                              <Avatar className="w-6 h-6">
                                <AvatarImage src={report.reported_user.avatar} />
                                <AvatarFallback className="text-xs">
                                  {report.reported_user.first_name?.[0] || report.reported_user.username?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-gray-600">
                                About {report.reported_user.first_name || report.reported_user.username}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-gray-500">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDistanceToNow(parseISO(report.created_at), { addSuffix: true })}</span>
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Report Details Panel */}
          <div className="lg:col-span-1">
            {selectedReport ? (
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getTypeIcon(selectedReport.type)}
                    Report Details
                  </CardTitle>
                  <CardDescription>
                    ID: {selectedReport.id.slice(0, 8)}...
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Report Info */}
                  <div>
                    <h4 className="font-medium mb-2">Report Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Type:</span>
                        <span className="capitalize">{selectedReport.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Category:</span>
                        <span>{selectedReport.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Priority Score:</span>
                        <span>{selectedReport.priority_score}/100</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Created:</span>
                        <span>{format(parseISO(selectedReport.created_at), "MMM d, yyyy")}</span>
                      </div>
                    </div>
                  </div>

                  {/* Reporter */}
                  <div>
                    <h4 className="font-medium mb-2">Reporter</h4>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={selectedReport.reporter.avatar} />
                        <AvatarFallback>
                          {selectedReport.reporter.first_name?.[0] || selectedReport.reporter.username?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">
                          {selectedReport.reporter.first_name} {selectedReport.reporter.last_name}
                        </p>
                        <p className="text-xs text-gray-600">@{selectedReport.reporter.username}</p>
                      </div>
                    </div>
                  </div>

                  {/* Reported User */}
                  {selectedReport.reported_user && (
                    <div>
                      <h4 className="font-medium mb-2">Reported User</h4>
                      <div className="flex items-center gap-3 mb-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={selectedReport.reported_user.avatar} />
                          <AvatarFallback>
                            {selectedReport.reported_user.first_name?.[0] || selectedReport.reported_user.username?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">
                            {selectedReport.reported_user.first_name} {selectedReport.reported_user.last_name}
                          </p>
                          <p className="text-xs text-gray-600">@{selectedReport.reported_user.username}</p>
                        </div>
                      </div>
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between">
                          <span>Total Reports:</span>
                          <span>{selectedReport.reported_user.total_reports}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Account Created:</span>
                          <span>{formatDistanceToNow(parseISO(selectedReport.reported_user.account_created), { addSuffix: true })}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <span>{selectedReport.reported_user.is_banned ? "Banned" : "Active"}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Evidence */}
                  {selectedReport.evidence_urls.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Evidence</h4>
                      <div className="space-y-2">
                        {selectedReport.evidence_urls.map((url, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="w-full justify-start"
                            onClick={() => window.open(url, "_blank")}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Evidence {index + 1}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Admin Notes */}
                  {selectedReport.admin_notes && (
                    <div>
                      <h4 className="font-medium mb-2">Admin Notes</h4>
                      <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        {selectedReport.admin_notes}
                      </p>
                    </div>
                  )}

                  {/* Resolution */}
                  {selectedReport.resolution && (
                    <div>
                      <h4 className="font-medium mb-2">Resolution</h4>
                      <p className="text-sm text-gray-600 bg-green-50 p-2 rounded">
                        {selectedReport.resolution}
                      </p>
                      {selectedReport.resolved_by && selectedReport.resolved_at && (
                        <p className="text-xs text-gray-500 mt-1">
                          Resolved by {selectedReport.resolved_by.first_name || selectedReport.resolved_by.username} on{" "}
                          {format(parseISO(selectedReport.resolved_at), "MMM d, yyyy")}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Quick Actions */}
                  {selectedReport.status === "pending" || selectedReport.status === "under_review" ? (
                    <div className="space-y-2">
                      <h4 className="font-medium">Quick Actions</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateReportStatus(selectedReport.id, "under_review")}
                          disabled={processingActions.has(selectedReport.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateReportStatus(selectedReport.id, "dismissed", "No violation found")}
                          disabled={processingActions.has(selectedReport.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Dismiss
                        </Button>
                      </div>

                      {selectedReport.reported_user && (
                        <div className="space-y-2">
                          <Button
                            variant="destructive"
                            size="sm"
                            className="w-full"
                            onClick={() => takeAction(selectedReport.id, "ban_user", "Violation of community guidelines")}
                            disabled={processingActions.has(selectedReport.id)}
                          >
                            <Ban className="h-4 w-4 mr-1" />
                            Ban User
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => takeAction(selectedReport.id, "warn_user", "Warning for reported behavior")}
                            disabled={processingActions.has(selectedReport.id)}
                          >
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            Warn User
                          </Button>
                        </div>
                      )}

                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => updateReportStatus(selectedReport.id, "resolved", "Issue has been addressed")}
                        disabled={processingActions.has(selectedReport.id)}
                      >
                        {processingActions.has(selectedReport.id) ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-1" />
                        )}
                        Mark Resolved
                      </Button>
                    </div>
                  ) : (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        This report has been {selectedReport.status.replace("_", " ")}.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Report</h3>
                  <p className="text-gray-600">Choose a report from the list to view details and take action</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
