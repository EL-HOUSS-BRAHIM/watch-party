"use client"

import { AlertTriangle, Eye, Filter, Flag, Search, User, X, XCircle } from "lucide-react"
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"

interface Report {}
  id: string
  type: 'user' | 'content' | 'party' | 'message'
  category: 'harassment' | 'spam' | 'inappropriate' | 'copyright' | 'violence' | 'other'
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed'
  priority: 'low' | 'medium' | 'high' | 'critical'
  reporter: {}
    id: string
    username: string
    displayName: string
    avatar: string | null
  }
  reported: {}
    id: string
    username?: string
    displayName?: string
    avatar?: string | null
    content?: string
    title?: string
  }
  reason: string
  description: string
  evidence?: string[]
  createdAt: string
  updatedAt: string
  assignedTo?: {}
    id: string
    name: string
  }
  resolution?: {}
    action: string
    reason: string
    actionDate: string
    moderator: string
  }
}

// Helper functions
const getCategoryIcon = (category: string) => {}
  switch (category) {
    case 'harassment': return <User className="h-4 w-4 text-red-500" />
    case 'spam': return <Flag className="h-4 w-4 text-orange-500" />
    case 'inappropriate': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    case 'copyright': return <MessageSquare className="h-4 w-4 text-blue-500" />
    case 'violence': return <XCircle className="h-4 w-4 text-red-600" />
    default: return <Flag className="h-4 w-4 text-gray-500" />
  }
}

const getStatusColor = (status: string) => {}
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800'
    case 'investigating': return 'bg-blue-100 text-blue-800'
    case 'resolved': return 'bg-green-100 text-green-800'
    case 'dismissed': return 'bg-gray-100 text-gray-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getPriorityColor = (priority: string) => {}
  switch (priority) {
    case 'low': return 'bg-green-100 text-green-800'
    case 'medium': return 'bg-yellow-100 text-yellow-800'
    case 'high': return 'bg-orange-100 text-orange-800'
    case 'critical': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export function ModerationReports() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>(&apos;all&apos;)
  const [priorityFilter, setPriorityFilter] = useState<string>(&apos;all&apos;)
  const [typeFilter, setTypeFilter] = useState<string>(&apos;all&apos;)

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    try {
      const response = await fetch('/api/admin/moderation/reports')
      if (response.ok) {
        const data = await response.json()
        setReports(data)
      }
    } catch (err) {
      console.error('Failed to load reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTakeAction = async (reportId: string, action: string, reason: string) => {}
    try {
      const response = await fetch(`/api/admin/moderation/reports/${reportId}/action`, {}
        method: 'POST',
        headers: {}
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, reason }),
      })

      if (response.ok) {
        loadReports()
        setSelectedReport(null)
      }
    } catch (err) {
      console.error('Failed to take action:', error)
    }
  }

  const handleAssignReport = async (reportId: string, moderatorId: string) => {}
    try {
      const response = await fetch(`/api/admin/moderation/reports/${reportId}/assign`, {}
        method: 'POST',
        headers: {}
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ moderatorId }),
      })

      if (response.ok) {
        loadReports()
      }
    } catch (err) {
      console.error('Failed to assign report:', error)
    }
  }

  const filteredReports = reports.filter(report => {}
    const matchesSearch = report.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.reporter.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.reported.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || report.priority === priorityFilter
    const matchesType = typeFilter === 'all' || report.type === typeFilter
    return matchesSearch && matchesStatus && matchesPriority && matchesType
  })

  const getStatusColor = (status: Report['status']) => {}
    switch (status) {
      case 'pending': return 'bg-yellow-500'
      case 'investigating': return 'bg-blue-500'
      case 'resolved': return 'bg-green-500'
      case 'dismissed': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getPriorityColor = (priority: Report['priority']) => {}
    switch (priority) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getCategoryIcon = (category: Report['category']) => {}
    switch (category) {
      case 'harassment': return <Flag className="h-4 w-4" />
      case 'spam': return <AlertTriangle className="h-4 w-4" />
      case 'inappropriate': return <Eye className="h-4 w-4" />
      default: return <Flag className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="content">Content</SelectItem>
                <SelectItem value="party">Party</SelectItem>
                <SelectItem value="message">Message</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({reports.filter(r => r.status === &apos;pending&apos;).length})
          </TabsTrigger>
          <TabsTrigger value="investigating">
            Investigating ({reports.filter(r => r.status === &apos;investigating&apos;).length})
          </TabsTrigger>
          <TabsTrigger value="resolved">
            Resolved ({reports.filter(r => r.status === &apos;resolved&apos;).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {filteredReports.filter(r => r.status === &apos;pending&apos;).map((report) => (
            <ReportCard key={report.id} report={report} onViewDetails={setSelectedReport} />
          ))}
        </TabsContent>

        <TabsContent value="investigating" className="space-y-4">
          {filteredReports.filter(r => r.status === &apos;investigating&apos;).map((report) => (
            <ReportCard key={report.id} report={report} onViewDetails={setSelectedReport} />
          ))}
        </TabsContent>

        <TabsContent value="resolved" className="space-y-4">
          {filteredReports.filter(r => r.status === &apos;resolved&apos;).map((report) => (
            <ReportCard key={report.id} report={report} onViewDetails={setSelectedReport} />
          ))}
        </TabsContent>
      </Tabs>

      {/* Report Details Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedReport && (
            <ReportDetails
              report={selectedReport} 
              onTakeAction={handleTakeAction}
              onAssign={handleAssignReport}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ReportCard({ report, onViewDetails }: { report: Report; onViewDetails: (report: Report) => void }) {}
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 flex-1">
            <div className="flex items-center space-x-2">
              {getCategoryIcon(report.category)}
              <Badge variant="outline" className="text-xs">
                {report.type}
              </Badge>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{report.reason}</h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {report.description}
              </p>
              <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                <span>Reported by @{report.reporter.username}</span>
                <span>•</span>
                <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                {report.assignedTo && (
                  <>
                    <span>•</span>
                    <span>Assigned to {report.assignedTo.name}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <Badge className={`text-white ${getPriorityColor(report.priority)}`}>
              {report.priority}
            </Badge>
            <Badge className={`text-white ${getStatusColor(report.status)}`}>
              {report.status}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(report)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ReportDetails({report, 
  onTakeAction, 
  onAssign
}: {}
  report: Report
  onTakeAction: (reportId: string, action: string, reason: string) => void
  onAssign: (reportId: string, moderatorId: string) => void
}) {}
  const [actionReason, setActionReason] = useState('')
  const [selectedAction, setSelectedAction] = useState('')

  const handleSubmitAction = () => {}
    if (selectedAction && actionReason.trim()) {}
      onTakeAction(report.id, selectedAction, actionReason)
    }
  }

  return (
    <div className="space-y-6">
      <DialogHeader>
        <DialogTitle className="flex items-center space-x-2">
          {getCategoryIcon(report.category)}
          <span>Report Details - {report.reason}</span>
        </DialogTitle>
      </DialogHeader>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Report Information */}
        <Card>
          <CardHeader>
            <CardTitle>Report Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Badge className={`text-white ${getStatusColor(report.status)}`}>
                {report.status}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Priority:</span>
              <Badge className={`text-white ${getPriorityColor(report.priority)}`}>
                {report.priority}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Type:</span>
              <Badge variant="outline">{report.type}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Category:</span>
              <Badge variant="outline">{report.category}</Badge>
            </div>
            <Separator />
            <div>
              <span className="text-sm text-muted-foreground">Description:</span>
              <p className="mt-1 text-sm">{report.description}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Created:</span>
              <p className="mt-1 text-sm">{new Date(report.createdAt).toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        {/* Reported Content/User */}
        <Card>
          <CardHeader>
            <CardTitle>Reported {report.type}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {report.type === 'user' && (
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={report.reported.avatar || ''} />
                  <AvatarFallback>
                    {report.reported.displayName?.charAt(0) || <User className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{report.reported.displayName}</p>
                  <p className="text-sm text-muted-foreground">@{report.reported.username}</p>
                </div>
              </div>
            )}
            {report.reported.content && (
              <div>
                <span className="text-sm text-muted-foreground">Content:</span>
                <div className="mt-1 p-3 bg-muted rounded-lg">
                  <p className="text-sm">{report.reported.content}</p>
                </div>
              </div>
            )}
            {report.reported.title && (
              <div>
                <span className="text-sm text-muted-foreground">Title:</span>
                <p className="mt-1 text-sm font-medium">{report.reported.title}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action Panel */}
      {report.status !== 'resolved' && report.status !== 'dismissed' && (
        <Card>
          <CardHeader>
            <CardTitle>Take Action</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select value={selectedAction} onValueChange={setSelectedAction}>
                <SelectTrigger>
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="warn">Warn User</SelectItem>
                  <SelectItem value="suspend">Suspend Account</SelectItem>
                  <SelectItem value="ban">Ban Account</SelectItem>
                  <SelectItem value="remove_content">Remove Content</SelectItem>
                  <SelectItem value="dismiss">Dismiss Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Textarea
              placeholder="Reason for action..."
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              rows={3}
            />
            <div className="flex space-x-2">
              <Button
                onClick={handleSubmitAction}
                disabled={!selectedAction || !actionReason.trim()}
              >
                Take Action
              </Button>
              <Button variant="outline">
                Assign to Me
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resolution History */}
      {report.resolution && (
        <Card>
          <CardHeader>
            <CardTitle>Resolution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Action:</span>
                <Badge>{report.resolution.action}</Badge>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Reason:</span>
                <p className="mt-1 text-sm">{report.resolution.reason}</p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Resolved by:</span>
                <span className="text-sm">{report.resolution.moderator}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
