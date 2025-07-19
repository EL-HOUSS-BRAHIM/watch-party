"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Search, Flag, Eye, Check, X, AlertTriangle } from "lucide-react"
import { api } from "@/lib/api"

export default function AdminReportsPage() {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("pending")
  const [selectedReport, setSelectedReport] = useState<any>(null)

  const { data: reports, isLoading } = useQuery({
    queryKey: ["admin-reports", { search, filter }],
    queryFn: () => api.get("/admin/reports", { params: { search, filter } }),
  })

  const mockReports = [
    {
      id: 1,
      type: "inappropriate_content",
      status: "pending",
      reporter: {
        name: "Sarah Chen",
        avatar: "/placeholder.svg?height=32&width=32&text=SC",
      },
      reported_user: {
        name: "John Doe",
        avatar: "/placeholder.svg?height=32&width=32&text=JD",
      },
      content: "This user was using inappropriate language in the chat during the Champions League final.",
      context: "Party: Champions League Final",
      created_at: "2024-01-20T14:30:00Z",
      severity: "medium",
    },
    {
      id: 2,
      type: "spam",
      status: "pending",
      reporter: {
        name: "Mike Johnson",
        avatar: "/placeholder.svg?height=32&width=32&text=MJ",
      },
      reported_user: {
        name: "Alex Smith",
        avatar: "/placeholder.svg?height=32&width=32&text=AS",
      },
      content: "User keeps posting promotional links and spam messages in multiple parties.",
      context: "Multiple parties",
      created_at: "2024-01-20T12:15:00Z",
      severity: "high",
    },
    {
      id: 3,
      type: "harassment",
      status: "resolved",
      reporter: {
        name: "Emma Wilson",
        avatar: "/placeholder.svg?height=32&width=32&text=EW",
      },
      reported_user: {
        name: "David Brown",
        avatar: "/placeholder.svg?height=32&width=32&text=DB",
      },
      content: "User was harassing other participants and making personal attacks.",
      context: "Party: El Clasico Watch",
      created_at: "2024-01-19T18:45:00Z",
      severity: "high",
      resolution: "User suspended for 7 days",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-warning text-warning-foreground">Pending</Badge>
      case "resolved":
        return <Badge className="bg-success text-success-foreground">Resolved</Badge>
      case "dismissed":
        return <Badge variant="secondary">Dismissed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "high":
        return <Badge variant="destructive">High</Badge>
      case "medium":
        return <Badge className="bg-warning text-warning-foreground">Medium</Badge>
      case "low":
        return <Badge variant="secondary">Low</Badge>
      default:
        return <Badge variant="secondary">{severity}</Badge>
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "inappropriate_content":
        return <Flag className="h-4 w-4 text-destructive" />
      case "spam":
        return <AlertTriangle className="h-4 w-4 text-warning" />
      case "harassment":
        return <Flag className="h-4 w-4 text-destructive" />
      default:
        return <Flag className="h-4 w-4 text-muted-foreground" />
    }
  }

  const handleReportAction = (action: string, reportId: number) => {
    console.log(`${action} report:`, reportId)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Content Reports</h1>
        <p className="text-muted-foreground">Review and moderate reported content and user behavior.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reports..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-base pl-10"
          />
        </div>

        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter reports" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reports</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="high">High Priority</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Pending Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {mockReports.filter((r) => r.status === "pending").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Resolved Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">12</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">High Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {mockReports.filter((r) => r.severity === "high").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reports ({mockReports.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 animate-pulse">
                  <div className="h-12 w-12 bg-secondary rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-secondary rounded w-3/4" />
                    <div className="h-3 bg-secondary rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {mockReports.map((report) => (
                <div key={report.id} className="border border-border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getTypeIcon(report.type)}
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-foreground capitalize">{report.type.replace("_", " ")}</h3>
                          {getStatusBadge(report.status)}
                          {getSeverityBadge(report.severity)}
                        </div>
                        <p className="text-sm text-muted-foreground">{report.context}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(report.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-foreground mb-2">Reporter</p>
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={report.reporter.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{report.reporter.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground">{report.reporter.name}</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-foreground mb-2">Reported User</p>
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={report.reported_user.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{report.reported_user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground">{report.reported_user.name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium text-foreground mb-2">Report Details</p>
                    <p className="text-sm text-muted-foreground bg-secondary p-3 rounded">{report.content}</p>
                  </div>

                  {report.resolution && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-foreground mb-2">Resolution</p>
                      <p className="text-sm text-success bg-success/10 p-3 rounded">{report.resolution}</p>
                    </div>
                  )}

                  {report.status === "pending" && (
                    <div className="flex space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-2" />
                            Review
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Review Report #{report.id}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium">Resolution Action</label>
                              <Select>
                                <SelectTrigger className="mt-1">
                                  <SelectValue placeholder="Select action" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="warning">Send Warning</SelectItem>
                                  <SelectItem value="suspend">Suspend User</SelectItem>
                                  <SelectItem value="ban">Ban User</SelectItem>
                                  <SelectItem value="dismiss">Dismiss Report</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Resolution Notes</label>
                              <Textarea placeholder="Add notes about your decision..." className="mt-1" />
                            </div>
                            <div className="flex justify-end space-x-2">
                              <Button variant="outline">Cancel</Button>
                              <Button>Apply Resolution</Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button
                        size="sm"
                        onClick={() => handleReportAction("resolve", report.id)}
                        className="bg-success hover:bg-success/90"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Resolve
                      </Button>

                      <Button size="sm" variant="outline" onClick={() => handleReportAction("dismiss", report.id)}>
                        <X className="h-4 w-4 mr-2" />
                        Dismiss
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
