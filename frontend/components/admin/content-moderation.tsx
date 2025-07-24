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
import { Textarea } from "@/components/ui/textarea"
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Flag,
  Video,
  MessageSquare,
  Clock,
  User,
  Calendar,
} from "lucide-react"

export function ContentModeration() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedItem, setSelectedItem] = useState<any>(null)

  // Mock moderation queue data
  const moderationQueue = [
    {
      id: "mod_001",
      type: "video",
      title: "Suspicious Video Content",
      description: "User uploaded video with potentially inappropriate content",
      reporter: "john@example.com",
      reported_user: "suspicious@example.com",
      reported_at: "2024-01-20T10:30:00Z",
      status: "pending",
      priority: "high",
      content_url: "/placeholder.svg",
      reason: "Inappropriate content",
      auto_flagged: true,
    },
    {
      id: "mod_002",
      type: "chat",
      title: "Harassment in Chat",
      description: "User reported harassment during watch party",
      reporter: "sarah@example.com",
      reported_user: "toxic@example.com",
      reported_at: "2024-01-20T09:15:00Z",
      status: "pending",
      priority: "medium",
      content_url: null,
      reason: "Harassment",
      auto_flagged: false,
    },
    {
      id: "mod_003",
      type: "profile",
      title: "Inappropriate Profile Content",
      description: "Profile contains offensive imagery",
      reporter: "mike@example.com",
      reported_user: "baduser@example.com",
      reported_at: "2024-01-20T08:45:00Z",
      status: "resolved",
      priority: "low",
      content_url: "/placeholder.svg",
      reason: "Offensive content",
      auto_flagged: true,
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
            Pending
          </Badge>
        )
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      case "resolved":
        return <Badge className="bg-blue-100 text-blue-800">Resolved</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">High</Badge>
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
      case "low":
        return <Badge variant="outline">Low</Badge>
      default:
        return <Badge variant="outline">Normal</Badge>
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="w-4 h-4" />
      case "chat":
        return <MessageSquare className="w-4 h-4" />
      case "profile":
        return <User className="w-4 h-4" />
      default:
        return <Flag className="w-4 h-4" />
    }
  }

  const filteredQueue = moderationQueue.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.reported_user.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || item.status === statusFilter
    const matchesType = typeFilter === "all" || item.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">Awaiting moderation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auto-Flagged</CardTitle>
            <AlertTriangle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">AI detected issues</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
            <CheckCircle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-muted-foreground">Cases closed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <Flag className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Urgent attention needed</p>
          </CardContent>
        </Card>
      </div>

      {/* Moderation Interface */}
      <Card>
        <CardHeader>
          <CardTitle>Content Moderation Queue</CardTitle>
          <CardDescription>Review and moderate reported content and user behavior</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="queue" className="space-y-4">
            <TabsList>
              <TabsTrigger value="queue">Moderation Queue</TabsTrigger>
              <TabsTrigger value="history">Moderation History</TabsTrigger>
              <TabsTrigger value="settings">Auto-Moderation Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="queue" className="space-y-4">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search reports..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="video">Videos</SelectItem>
                    <SelectItem value="chat">Chat Messages</SelectItem>
                    <SelectItem value="profile">Profiles</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Moderation Queue Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Report</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reported</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQueue.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{item.title}</span>
                              {item.auto_flagged && (
                                <Badge variant="outline" className="text-xs">
                                  Auto-flagged
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{item.description}</p>
                            <p className="text-xs text-muted-foreground">Reported user: {item.reported_user}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getTypeIcon(item.type)}
                            <span className="capitalize">{item.type}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getPriorityBadge(item.priority)}</TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell>
                          <div className="text-xs">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>{new Date(item.reported_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-1 mt-1">
                              <User className="w-3 h-3" />
                              <span>{item.reporter}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline" onClick={() => setSelectedItem(item)}>
                                <Eye className="w-4 h-4 mr-2" />
                                Review
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Content Review</DialogTitle>
                                <DialogDescription>Review and moderate reported content</DialogDescription>
                              </DialogHeader>
                              {selectedItem && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium">Report Type</label>
                                      <p className="text-sm text-muted-foreground capitalize">{selectedItem.type}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Priority</label>
                                      <div className="mt-1">{getPriorityBadge(selectedItem.priority)}</div>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Reported User</label>
                                      <p className="text-sm text-muted-foreground">{selectedItem.reported_user}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Reporter</label>
                                      <p className="text-sm text-muted-foreground">{selectedItem.reporter}</p>
                                    </div>
                                  </div>

                                  <div>
                                    <label className="text-sm font-medium">Reason</label>
                                    <p className="text-sm text-muted-foreground">{selectedItem.reason}</p>
                                  </div>

                                  <div>
                                    <label className="text-sm font-medium">Description</label>
                                    <p className="text-sm text-muted-foreground">{selectedItem.description}</p>
                                  </div>

                                  {selectedItem.content_url && (
                                    <div>
                                      <label className="text-sm font-medium">Content Preview</label>
                                      <div className="mt-2 p-4 border rounded-lg bg-muted/50">
                                        <img
                                          src={selectedItem.content_url || "/placeholder.svg"}
                                          alt="Content preview"
                                          className="max-w-full h-32 object-cover rounded"
                                        />
                                      </div>
                                    </div>
                                  )}

                                  <div>
                                    <label className="text-sm font-medium">Moderation Notes</label>
                                    <Textarea placeholder="Add notes about your decision..." className="mt-1" />
                                  </div>

                                  <div className="flex space-x-2">
                                    <Button className="flex-1">
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                      Approve
                                    </Button>
                                    <Button variant="destructive" className="flex-1">
                                      <XCircle className="w-4 h-4 mr-2" />
                                      Reject
                                    </Button>
                                    <Button variant="outline" className="flex-1 bg-transparent">
                                      <Flag className="w-4 h-4 mr-2" />
                                      Escalate
                                    </Button>
                                  </div>
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

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Moderation History</CardTitle>
                  <CardDescription>View past moderation decisions and actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Moderation history will be displayed here...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Auto-Moderation Settings</CardTitle>
                  <CardDescription>Configure automatic content filtering and flagging</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Auto-moderation settings will be configured here...</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
