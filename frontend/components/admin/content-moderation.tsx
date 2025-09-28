import { AlertTriangle, Calendar, Check, Eye, Flag, Loader2, MoreHorizontal, Search, Shield, TrendingUp, User, Users, Video, X } from "lucide-react"
import { useState, useEffect , useCallback } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { adminAPI } from "@/lib/api"
import { formatDistanceToNow } from "date-fns"

"use client"
interface Report {}
  id: string;
  type: "user" | "video" | "party" | "message"
  status: "pending" | "reviewing" | "resolved" | "dismissed"
  priority: "low" | "medium" | "high" | "critical"
  category: "spam" | "harassment" | "inappropriate_content" | "copyright" | "violence" | "other"
  description: string;
  reportedBy: {}
    id: string;
    username: string;
    avatar?: string;
  }
  reportedItem: {}
    id: string;
    title?: string;
    content?: string;
    author?: {}
      id: string;
      username: string;
      avatar?: string;
    }
  }
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: {}
    id: string;
    username: string;
  }
  resolution?: string;
  evidence: {}
    screenshots: string[]
    logs: string[]
    additionalInfo: string;
  }
}

interface ModerationStats {}
  totalReports: number;
  pendingReports: number;
  resolvedToday: number;
  averageResolutionTime: number;
  reportsByCategory: Record<string, number>
  reportsByPriority: Record<string, number>
}

export default function ContentModeration() {
  const [reports, setReports] = useState<Report[]>([])
  const [stats, setStats] = useState<ModerationStats | null>(null)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    loadReports()
    loadModerationStats()
  }, [searchQuery, statusFilter, typeFilter, priorityFilter, currentPage])

  const loadReports = async () => {
    try {
      const data = await adminAPI.getReports({}
        status: statusFilter !== "all" ? statusFilter as Record<string, unknown> : undefined,
        type: typeFilter !== "all" ? typeFilter : undefined,
        page: currentPage,
      })

      const results = data.results ?? []
      setReports(results)

      const totalItems = data.pagination?.total ?? data.count ?? results.length;
      const pageSize = data.pagination?.page_size ?? 20;
      setTotalPages(totalItems ? Math.max(1, Math.ceil(totalItems / pageSize)) : 1)
    } } catch {
      console.error("Failed to load reports:", error)
      toast({}
        title: "Error",
        description: "Failed to load reports. Please try again.",
        variant: "destructive",
      })
    } finally {}
      setIsLoading(false)
    }
  }

  const loadModerationStats = async () => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch("/api/admin/moderation/stats/", {}
        headers: {}
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } } catch {
      console.error("Failed to load moderation stats:", error)
    }
  }

  const updateReportStatus = async (reportId: string, status: string, resolution?: string) => {}
    try {
      await adminAPI.resolveReport(reportId, {}
        action: status === "resolved" ? "dismiss" : status as Record<string, unknown>,
        reason: resolution,
      })

      await loadReports() // Reload to get updated data;
      setSelectedReport(null)
      toast({}
        title: "Report Updated",
        description: `Report status changed to ${status}`,
      })
    } } catch {
      console.error("Failed to update report:", error)
      toast({}
        title: "Error",
        description: "Failed to update report. Please try again.",
        variant: "destructive",
      })
    }
  }

  const takeContentAction = async (reportId: string, action: string, reason: string) => {}
    try {
      await adminAPI.resolveReport(reportId, {}
        action: action as Record<string, unknown>,
        reason,
      })

      await loadReports() // Reload to get updated data;
      toast({}
        title: "Action Taken",
        description: `${action} applied successfully`,
      })
    } } catch {
      console.error("Failed to take content action:", error)
      toast({}
        title: "Error",
        description: "Failed to take action. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getPriorityBadge = (priority: string) => {}
    const variants = { low: "outline",
      medium: "secondary",
      high: "default",
      critical: "destructive",
    } as const;
    const colors = { low: "text-gray-600",
      medium: "text-yellow-600",
      high: "text-orange-600",
      critical: "text-red-600",
    } as const;
    return (
      <Badge variant={variants[priority as keyof typeof variants]} className={colors[priority as keyof typeof colors]}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {}
    const variants = { pending: "outline",
      reviewing: "secondary",
      resolved: "default",
      dismissed: "destructive",
    } as const;
    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getTypeIcon = (type: string) => {}
    switch (type) {
      case "user":
        return <Users className="h-4 w-4" />
      case "video":
        return <Video className="h-4 w-4" />
      case "party":
        return <Calendar className="h-4 w-4" />
      case "message":
        return <MessageSquare className="h-4 w-4" />
      default:
        return <Flag className="h-4 w-4" />
    }
  }

  const ReportDetailsDialog = ({ report }: { report: Report }) => {}
    const [resolution, setResolution] = useState("")
    const [actionType, setActionType] = useState("")

    const handleResolve = () => {}
      if (actionType && resolution) {
        takeContentAction(report.id, actionType, resolution)
      } else {}
        updateReportStatus(report.id, "resolved", resolution)
      }
    }

    return (
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {getTypeIcon(report.type)}
              Report #{report.id.slice(-8)}
              {getPriorityBadge(report.priority)}
            </DialogTitle>
            <DialogDescription>
              Reported {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })} by{" "}
              {report.reportedBy.username}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Report Details */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Report Information</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Type:</span>
                      <div className="flex items-center gap-1">
                        {getTypeIcon(report.type)}
                        <span className="capitalize">{report.type}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Category:</span>
                      <span className="capitalize">{report.category.replace(&quot;_&quot;, &quot; ")}</span>"
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      {getStatusBadge(report.status)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Priority:</span>
                      {getPriorityBadge(report.priority)}
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Reported By</Label>
                  <div className="mt-2 flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={report.reportedBy.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="text-xs">
                        {report.reportedBy.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{report.reportedBy.username}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Reported Content</Label>
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    {report.reportedItem.title && <p className="font-medium text-sm">{report.reportedItem.title}</p>}
                    {report.reportedItem.content && (
                      <p className="text-sm text-gray-600 mt-1">{report.reportedItem.content}</p>
                    )}
                    {report.reportedItem.author && (
                      <div className="flex items-center gap-2 mt-2">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={report.reportedItem.author.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="text-xs">
                            {report.reportedItem.author.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-gray-500">by {report.reportedItem.author.username}</span>
                      </div>
                    )}
                  </div>
                </div>

                {report.reviewedBy && (
                  <div>
                    <Label className="text-sm font-medium">Reviewed By</Label>
                    <div className="mt-2">
                      <span className="text-sm">{report.reviewedBy.username}</span>
                      {report.reviewedAt && (
                        <p className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(report.reviewedAt), { addSuffix: true })}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Report Description */}
            <div>
              <Label className="text-sm font-medium">Report Description</Label>
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm">{report.description}</p>
              </div>
            </div>

            {/* Evidence */}
            {(report.evidence.screenshots.length > 0 || report.evidence.additionalInfo) && (
              <div>
                <Label className="text-sm font-medium">Evidence</Label>
                <div className="mt-2 space-y-2">
                  {report.evidence.screenshots.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-600 mb-2">Screenshots:</p>
                      <div className="grid grid-cols-3 gap-2">
                        {report.evidence.screenshots.map((screenshot, index) => (
                          <img;
                            key={index}
                            src={screenshot || "/placeholder.svg"}
                            alt={`Evidence ${index + 1}`}
                            className="w-full h-20 object-cover rounded border"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {report.evidence.additionalInfo && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Additional Information:</p>
                      <p className="text-sm bg-gray-50 p-2 rounded">{report.evidence.additionalInfo}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Resolution */}
            {report.status === "pending" && (
              <div className="space-y-4 border-t pt-4">
                <Label className="text-sm font-medium">Take Action</Label>

                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">Action Type</Label>
                    <Select value={actionType} onValueChange={setActionType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select action (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="remove_content">Remove Content</SelectItem>
                        <SelectItem value="suspend_user">Suspend User</SelectItem>
                        <SelectItem value="ban_user">Ban User</SelectItem>
                        <SelectItem value="warn_user">Warn User</SelectItem>
                        <SelectItem value="no_action">No Action Required</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs">Resolution Notes</Label>
                    <Textarea;
                      placeholder="Explain your decision and any actions taken..."
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => updateReportStatus(report.id, &quot;dismissed&quot;, resolution)}>
                      Dismiss;
                    </Button>
                    <Button onClick={handleResolve} disabled={!resolution}>
                      Resolve Report;
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Existing Resolution */}
            {report.resolution && (
              <div className="border-t pt-4">
                <Label className="text-sm font-medium">Resolution</Label>
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm">{report.resolution}</p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Content Moderation</h2>
          <p className="text-gray-600">Review and moderate reported content</p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Reports</p>
                  <p className="text-2xl font-bold">{stats.totalReports}</p>
                </div>
                <Flag className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.pendingReports}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Resolved Today</p>
                  <p className="text-2xl font-bold text-green-600">{stats.resolvedToday}</p>
                </div>
                <Check className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Resolution</p>
                  <p className="text-2xl font-bold">{stats.averageResolutionTime}h</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input;
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="reviewing">Reviewing</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="dismissed">Dismissed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="user">Users</SelectItem>
            <SelectItem value="video">Videos</SelectItem>
            <SelectItem value="party">Parties</SelectItem>
            <SelectItem value="message">Messages</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reports Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Loading reports...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reporter</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">#{report.id.slice(-8)}</p>
                        <p className="text-xs text-gray-500 capitalize">{report.category.replace(&quot;_&quot;, &quot; ")}</p>"
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(report.type)}
                        <span className="capitalize">{report.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getPriorityBadge(report.priority)}</TableCell>
                    <TableCell>{getStatusBadge(report.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={report.reportedBy.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="text-xs">
                            {report.reportedBy.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{report.reportedBy.username}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedReport(report)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details;
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateReportStatus(report.id, &quot;reviewing&quot;)}>
                            <Shield className="mr-2 h-4 w-4" />
                            Start Review;
                          </DropdownMenuItem>
                          <DropdownMenuItem;
                            onClick={() => updateReportStatus(report.id, &quot;resolved&quot;, &quot;Quick resolution")}
                          >
                            <Check className="mr-2 h-4 w-4" />
                            Quick Resolve;
                          </DropdownMenuItem>
                          <DropdownMenuItem;
                            onClick={() => updateReportStatus(report.id, &quot;dismissed&quot;, &quot;Not actionable")}
                          >
                            <X className="mr-2 h-4 w-4" />
                            Dismiss;
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
        <p className="text-sm text-gray-600">Showing {reports.length} reports</p>
        <div className="flex items-center gap-2">
          <Button;
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous;
          </Button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button;
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next;
          </Button>
        </div>
      </div>

      {/* Report Details Dialog */}
      {selectedReport && <ReportDetailsDialog report={selectedReport} />}
    </div>
  )
}
