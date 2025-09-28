import { Check, CheckCircle, Clock, Download, Eye, Flag, Search, Settings, Shield, User, Video, X, XCircle } from "lucide-react"
import { useState, useEffect , useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {}
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { moderationAPI, adminAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

"use client"
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
interface ModerationItem {}
  id: string;
  type: "video" | "comment" | "user" | "party"
  title: string;
  content: string;
  author: string;
  reportedBy: string[]
  reportReason: string[]
  status: "pending" | "approved" | "rejected" | "flagged"
  priority: "low" | "medium" | "high" | "critical"
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  aiScore: number;
  aiFlags: string[]
}

interface ModerationStats {}
  totalReports: number;
  pendingReviews: number;
  autoApproved: number;
  autoRejected: number;
  manualReviews: number;
  averageReviewTime: number;
  accuracyRate: number;
}

export function ContentModerationSystem() {
  const [items, setItems] = useState<ModerationItem[]>([])
  const [stats, setStats] = useState<ModerationStats | null>(null)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [filterStatus, setFilterStatus] = useState<string>(&quot;all&quot;)
  const [filterType, setFilterType] = useState<string>(&quot;all&quot;)
  const [filterPriority, setFilterPriority] = useState<string>(&quot;all&quot;)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedItem, setSelectedItem] = useState<ModerationItem | null>(null)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchModerationData()
  }, [])

  const fetchModerationData = async () => {
    setLoading(true)
    try {
      // Fetch moderation reports and statistics from API;
      const [reportsData, moderationStats] = await Promise.all([]
        moderationAPI.getReports({ status: 'pending' }),
        adminAPI.getModerationStats()
      ])

      // Transform reports data;
      const transformedReports = (reportsData.results || []).map((report: unknown) => ({}
        id: report.id,
        type: report.content_type,
        title: report.title || `${report.content_type} Report`,
        content: report.description || report.content_preview,
        author: report.reported_content?.author || report.reported_user?.username || 'Unknown',
        reportedBy: report.reporters?.map((r: unknown) => r.username) || [],
        reportReason: [report.report_type],
        status: report.status,
        priority: report.priority || 'medium',
        createdAt: report.created_at,
        reviewedAt: report.reviewed_at,
        reviewedBy: report.reviewed_by?.username,
        aiScore: report.ai_score || 0,
        aiFlags: report.ai_flags || []
      })) || []

      const transformedStats: ModerationStats = { totalReports: moderationStats.total_reports || 0,
        pendingReviews: moderationStats.pending_reviews || 0,
        autoApproved: moderationStats.auto_approved || 0,
        autoRejected: moderationStats.auto_rejected || 0,
        manualReviews: moderationStats.manual_reviews || 0,
        averageReviewTime: moderationStats.average_review_time || 0,
        accuracyRate: moderationStats.accuracy_rate || 0;
      }

      setItems(transformedReports)
      setStats(transformedStats)
    } } catch {
      console.error('Failed to fetch moderation data:', error)
      toast({}
        title: "Error",
        description: "Failed to load moderation data. Please try again.",
        variant: "destructive",
      })
    } finally {}
      setLoading(false)
    }
  }

  const filteredItems = items.filter((item) => {}
    const matchesStatus = filterStatus === "all" || item.status === filterStatus;
    const matchesType = filterType === "all" || item.type === filterType;
    const matchesPriority = filterPriority === "all" || item.priority === filterPriority;
    const matchesSearch =
      searchQuery === "" ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.author.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesStatus && matchesType && matchesPriority && matchesSearch;
  })

  const handleItemAction = async (itemId: string, action: "approve" | "reject" | "flag", reason?: string) => {}
    try {
      // Call API to resolve the report;
      await adminAPI.resolveReport(itemId, {}
        action: action === "approve" ? "dismiss" : action === "reject" ? "ban" : "warning",
        reason: reason;
      })

      // Update local state;
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId;
            ? {}
                ...item,
                status: action === "approve" ? "approved" : action === "reject" ? "rejected" : "flagged",
                reviewedAt: new Date().toISOString(),
                reviewedBy: "current_moderator",
              }
            : item,
        ),
      )

      toast({}
        title: "Success",
        description: `Report ${action}d successfully.`,
      })
    } } catch {
      console.error(`Failed to ${action} report:`, error)
      toast({}
        title: "Error",
        description: `Failed to ${action} report. Please try again.`,
        variant: "destructive",
      })
    }
  }

  const handleBulkAction = async (action: "approve" | "reject" | "flag") => {}
    try {
      // Process all selected items;
      await Promise.all(
        selectedItems.map(itemId => handleItemAction(itemId, action))
      )
      setSelectedItems([])
    } } catch {
      console.error('Failed to perform bulk action:', error)
      toast({}
        title: "Error",
        description: "Failed to perform bulk action. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getPriorityColor = (priority: string) => {}
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getStatusColor = (status: string) => {}
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "flagged":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case "pending":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getTypeIcon = (type: string) => {}
    switch (type) {
      case "video":
        return <Video className="h-4 w-4" />
      case "comment":
        return <MessageSquare className="h-4 w-4" />
      case "user":
        return <User className="h-4 w-4" />
      case "party":
        return <Eye className="h-4 w-4" />
      default:
        return <Flag className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Content Moderation</h1>
          <p className="text-gray-600 dark:text-gray-400">Review and moderate platform content</p>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => setSettingsDialogOpen(true)} variant=&quot;outline&quot;>
            <Settings className="mr-2 h-4 w-4" />
            Settings;
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export;
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalReports || 0}</div>
            <p className="text-xs text-muted-foreground">All time reports</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats?.pendingReviews || 0}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auto Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.autoApproved || 0}</div>
            <p className="text-xs text-muted-foreground">AI approved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accuracy Rate</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.accuracyRate || 0}%</div>
            <p className="text-xs text-muted-foreground">AI accuracy</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input;
                  id="search"
                  placeholder="Search content, users, or reports..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="flagged">Flagged</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="video">Videos</SelectItem>
                  <SelectItem value="comment">Comments</SelectItem>
                  <SelectItem value="user">Users</SelectItem>
                  <SelectItem value="party">Parties</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Priority" />
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
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{selectedItems.length} item(s) selected</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleBulkAction(&quot;approve&quot;)}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve;
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction(&quot;reject&quot;)}>
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject;
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction(&quot;flag&quot;)}>
                  <Flag className="mr-2 h-4 w-4" />
                  Flag;
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Moderation Queue */}
      <Card>
        <CardHeader>
          <CardTitle>Moderation Queue</CardTitle>
          <CardDescription>Review reported content and user activities</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox;
                    checked={selectedItems.length === filteredItems.length}
                    onCheckedChange={(checked) => {}
                      if (checked) {
                        setSelectedItems(filteredItems.map((item) => item.id))
                      } else {}
                        setSelectedItems([])
                      }
                    }}
                  />
                </TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Content</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>AI Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Checkbox;
                      checked={selectedItems.includes(item.id)}
                      onCheckedChange={(checked) => {}
                        if (checked) {
                          setSelectedItems((prev) => [...prev, item.id])
                        } else {}
                          setSelectedItems((prev) => prev.filter((id) => id !== item.id))
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(item.type)}
                      <span className="capitalize">{item.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <p className="font-medium truncate">{item.title}</p>
                      <p className="text-sm text-muted-foreground truncate">{item.content}</p>
                      {item.aiFlags.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {item.aiFlags.slice(0, 2).map((flag) => (
                            <Badge key={flag} variant="outline" className="text-xs">
                              {flag.replace("_", " ")}
                            </Badge>
                          ))}
                          {item.aiFlags.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{item.aiFlags.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{item.author}</span>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(item.priority)}>{item.priority}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={item.aiScore * 100} className="w-16 h-2" />
                      <span className="text-sm">{Math.round(item.aiScore * 100)}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button;
                        size="sm"
                        variant="outline"
                        onClick={() => {}
                          setSelectedItem(item)
                          setReviewDialogOpen(true)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {item.status === "pending" && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleItemAction(item.id, &quot;approve&quot;)}>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleItemAction(item.id, &quot;reject&quot;)}>
                            <XCircle className="h-4 w-4 text-red-600" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Content</DialogTitle>
            <DialogDescription>Review the reported content and take appropriate action</DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <p className="capitalize">{selectedItem.type}</p>
                </div>
                <div>
                  <Label>Author</Label>
                  <p>{selectedItem.author}</p>
                </div>
                <div>
                  <Label>Priority</Label>
                  <Badge className={getPriorityColor(selectedItem.priority)}>{selectedItem.priority}</Badge>
                </div>
                <div>
                  <Label>AI Score</Label>
                  <p>{Math.round(selectedItem.aiScore * 100)}%</p>
                </div>
              </div>

              <div>
                <Label>Content</Label>
                <p className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">{selectedItem.content}</p>
              </div>

              <div>
                <Label>Report Reasons</Label>
                <div className="flex gap-2 mt-1">
                  {selectedItem.reportReason.map((reason) => (
                    <Badge key={reason} variant="outline">
                      {reason.replace("_", " ")}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>AI Flags</Label>
                <div className="flex gap-2 mt-1">
                  {selectedItem.aiFlags.map((flag) => (
                    <Badge key={flag} variant="secondary">
                      {flag.replace("_", " ")}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>Reported By</Label>
                <p>{selectedItem.reportedBy.join(&quot;, &quot;)}</p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
              Close;
            </Button>
            {selectedItem?.status === "pending" && (
              <>
                <Button;
                  variant="outline"
                  onClick={() => {}
                    handleItemAction(selectedItem.id, "approve")
                    setReviewDialogOpen(false)
                  }}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve;
                </Button>
                <Button;
                  variant="outline"
                  onClick={() => {}
                    handleItemAction(selectedItem.id, "reject")
                    setReviewDialogOpen(false)
                  }}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject;
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Moderation Settings</DialogTitle>
            <DialogDescription>Configure automated moderation rules and thresholds</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>AI Confidence Threshold</Label>
              <div className="mt-2">
                <Progress value={85} className="w-full" />
                <p className="text-sm text-muted-foreground mt-1">85% - Auto-approve below this threshold</p>
              </div>
            </div>

            <div>
              <Label>Auto-reject Threshold</Label>
              <div className="mt-2">
                <Progress value={95} className="w-full" />
                <p className="text-sm text-muted-foreground mt-1">95% - Auto-reject above this threshold</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Enabled Filters</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="spam" defaultChecked />
                  <Label htmlFor="spam">Spam Detection</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="hate" defaultChecked />
                  <Label htmlFor="hate">Hate Speech</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="adult" defaultChecked />
                  <Label htmlFor="adult">Adult Content</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="violence" defaultChecked />
                  <Label htmlFor="violence">Violence</Label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsDialogOpen(false)}>
              Cancel;
            </Button>
            <Button onClick={() => setSettingsDialogOpen(false)}>Save Settings</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
