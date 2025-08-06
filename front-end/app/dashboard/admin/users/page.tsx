"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import WatchPartyTable from "@/components/ui/watch-party-table"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { adminAPI } from "@/lib/api"
import {
  Users,
  Search,
  UserCheck,
  Shield,
  Crown,
  Star,
  Ban,
  Unlock,
  Eye,
  Edit,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Video,
  ArrowLeft,
  Loader2,
} from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"

interface AdminUser {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  avatar?: string
  isVerified: boolean
  isPremium: boolean
  isActive: boolean
  isBanned: boolean
  role: "user" | "moderator" | "admin"
  joinedAt: string
  lastActive?: string
  stats: {
    partiesHosted: number
    partiesJoined: number
    videosUploaded: number
    friendsCount: number
    totalWatchTime: number
  }
  subscription?: {
    plan: string
    status: string
    expiresAt: string
  }
}

interface UserAction {
  id: string
  type: "ban" | "unban" | "suspend" | "unsuspend" | "delete"
  reason?: string
  duration?: number // in days
  notifyUser?: boolean
}

export default function UserManagementPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const [users, setUsers] = useState<AdminUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [roleFilter, setRoleFilter] = useState("all")
  const [subscriptionFilter, setSubscriptionFilter] = useState("all")
  const [showActionDialog, setShowActionDialog] = useState(false)
  const [currentAction, setCurrentAction] = useState<UserAction | null>(null)
  const [actionReason, setActionReason] = useState("")
  const [actionDuration, setActionDuration] = useState(7)
  const [notifyUser, setNotifyUser] = useState(true)

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    banned: 0,
    verified: 0,
    premium: 0,
    newToday: 0,
  })

  // Check if user is admin
  useEffect(() => {
    if (user && !user.is_staff && !user.is_superuser) {
      router.push("/dashboard")
      return
    }
  }, [user, router])

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchQuery, statusFilter, roleFilter, subscriptionFilter])

  const loadUsers = async () => {
    if (!user?.is_staff && !user?.is_superuser) return

    setIsLoading(true)
    try {
      const data = await adminAPI.getUsers({
        search: searchQuery || undefined,
        status: statusFilter !== "all" ? statusFilter as any : undefined,
        page: 1, // You can add pagination later
      })
      
      setUsers(data.results || [])
      // setStats would need to be extracted from the response or fetched separately
    } catch (error) {
      console.error("Failed to load users:", error)
      toast({
        title: "Error",
        description: "Failed to load users. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = [...users]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (user) =>
          user.username.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.firstName.toLowerCase().includes(query) ||
          user.lastName.toLowerCase().includes(query),
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      switch (statusFilter) {
        case "active":
          filtered = filtered.filter((user) => user.isActive && !user.isBanned)
          break
        case "inactive":
          filtered = filtered.filter((user) => !user.isActive)
          break
        case "banned":
          filtered = filtered.filter((user) => user.isBanned)
          break
        case "verified":
          filtered = filtered.filter((user) => user.isVerified)
          break
      }
    }

    // Role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter)
    }

    // Subscription filter
    if (subscriptionFilter !== "all") {
      switch (subscriptionFilter) {
        case "premium":
          filtered = filtered.filter((user) => user.isPremium)
          break
        case "free":
          filtered = filtered.filter((user) => !user.isPremium)
          break
        case "expired":
          filtered = filtered.filter((user) => user.subscription && user.subscription.status === "expired")
          break
      }
    }

    setFilteredUsers(filtered)
  }

  const executeUserAction = async (action: UserAction, userIds: string[]) => {
    try {
      await adminAPI.bulkUserAction({
        user_ids: userIds,
        action: action.type,
        reason: action.reason,
      })

      await loadUsers()
      setSelectedUsers([])
      setShowActionDialog(false)
      setCurrentAction(null)
      setActionReason("")

      toast({
        title: "Action Completed",
        description: `Successfully ${action.type}ed ${userIds.length} user(s).`,
      })
    } catch (error) {
      console.error("Failed to execute user action:", error)
      toast({
        title: "Action Failed",
        description: error instanceof Error ? error.message : "Failed to execute action.",
        variant: "destructive",
      })
    }
  }

  const handleBulkAction = (actionType: UserAction["type"]) => {
    if (selectedUsers.length === 0) {
      toast({
        title: "No Users Selected",
        description: "Please select users to perform this action.",
        variant: "destructive",
      })
      return
    }

    setCurrentAction({
      id: Date.now().toString(),
      type: actionType,
      reason: "",
      duration: 7,
      notifyUser: true,
    })
    setShowActionDialog(true)
  }

  const exportUsers = async () => {
    try {
      const downloadData = await adminAPI.exportUsers({ format: 'csv' })
      
      if (downloadData?.download_url) {
        const a = document.createElement("a")
        a.href = downloadData.download_url
        a.download = `users-export-${format(new Date(), "yyyy-MM-dd")}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)

        toast({
          title: "Export Complete",
          description: "User data has been exported successfully.",
        })
      }
    } catch (error) {
      console.error("Failed to export users:", error)
      toast({
        title: "Export Failed",
        description: "Failed to export user data.",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (user: User) => {
    if (user.isBanned) {
      return <Badge variant="destructive">Banned</Badge>
    }
    if (!user.isActive) {
      return <Badge variant="outline">Inactive</Badge>
    }
    return <Badge className="bg-green-100 text-green-800">Active</Badge>
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <Badge className="bg-red-100 text-red-800">
            <Shield className="w-3 h-3 mr-1" />
            Admin
          </Badge>
        )
      case "moderator":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <Star className="w-3 h-3 mr-1" />
            Moderator
          </Badge>
        )
      default:
        return (
          <Badge variant="outline">
            <Users className="w-3 h-3 mr-1" />
            User
          </Badge>
        )
    }
  }

  const tableColumns = [
    {
      id: "user",
      header: "User",
      cell: ({ row }: { row: AdminUser }) => (
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={row.avatar || "/placeholder.svg"} />
            <AvatarFallback className="text-xs">
              {row.firstName[0]}
              {row.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {row.firstName} {row.lastName}
              </span>
              {row.isVerified && <CheckCircle className="w-4 h-4 text-blue-500" />}
              {row.isPremium && <Crown className="w-4 h-4 text-yellow-500" />}
            </div>
            <div className="text-sm text-muted-foreground">@{row.username}</div>
            <div className="text-xs text-muted-foreground">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }: { row: AdminUser }) => (
        <div className="space-y-1">
          {getStatusBadge(row)}
          {getRoleBadge(row.role)}
        </div>
      ),
    },
    {
      id: "stats",
      header: "Activity",
      cell: ({ row }: { row: AdminUser }) => (
        <div className="text-sm space-y-1">
          <div className="flex items-center gap-1">
            <Video className="w-3 h-3 text-muted-foreground" />
            <span>{row.stats.partiesHosted} hosted</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3 text-muted-foreground" />
            <span>{row.stats.partiesJoined} joined</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-muted-foreground" />
            <span>{Math.round(row.stats.totalWatchTime / 60)}h watched</span>
          </div>
        </div>
      ),
    },
    {
      id: "joined",
      header: "Joined",
      cell: ({ row }: { row: AdminUser }) => (
        <div className="text-sm">
          <div>{format(new Date(row.joinedAt), "MMM dd, yyyy")}</div>
          <div className="text-muted-foreground">
            {formatDistanceToNow(new Date(row.joinedAt), { addSuffix: true })}
          </div>
        </div>
      ),
    },
    {
      id: "lastActive",
      header: "Last Active",
      cell: ({ row }: { row: AdminUser }) => (
        <div className="text-sm">
          {row.lastActive ? (
            <>
              <div>{format(new Date(row.lastActive), "MMM dd, yyyy")}</div>
              <div className="text-muted-foreground">
                {formatDistanceToNow(new Date(row.lastActive), { addSuffix: true })}
              </div>
            </>
          ) : (
            <span className="text-muted-foreground">Never</span>
          )}
        </div>
      ),
    },
  ]

  const tableActions = [
    {
      id: "view",
      label: "View Profile",
      icon: <Eye className="w-4 h-4" />,
      onClick: (user: AdminUser) => router.push(`/profile/${user.id}`),
    },
    {
      id: "edit",
      label: "Edit User",
      icon: <Edit className="w-4 h-4" />,
      onClick: (user: AdminUser) => {
        // Open edit dialog or navigate to edit page
        console.log("Edit user:", user.id)
      },
    },
    {
      id: "ban",
      label: "Ban User",
      icon: <Ban className="w-4 h-4" />,
      onClick: (user: AdminUser) => {
        setSelectedUsers([user.id])
        handleBulkAction("ban")
      },
      condition: (user: AdminUser) => !user.isBanned,
    },
    {
      id: "unban",
      label: "Unban User",
      icon: <Unlock className="w-4 h-4" />,
      onClick: (user: AdminUser) => {
        setSelectedUsers([user.id])
        handleBulkAction("unban")
      },
      condition: (user: AdminUser) => user.isBanned,
    },
  ]

  if (!user?.is_staff && !user?.is_superuser) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-4">You don't have permission to access user management.</p>
          <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading users...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => router.back()} className="p-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Users className="h-8 w-8" />
              User Management
            </h1>
            <p className="text-muted-foreground mt-2">Manage users, roles, and permissions</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={loadUsers}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" onClick={exportUsers}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Users</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <div className="text-sm text-muted-foreground">Active</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.banned}</div>
              <div className="text-sm text-muted-foreground">Banned</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.verified}</div>
              <div className="text-sm text-muted-foreground">Verified</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.premium}</div>
              <div className="text-sm text-muted-foreground">Premium</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.newToday}</div>
              <div className="text-sm text-muted-foreground">New Today</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filter dropdowns */}
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="banned">Banned</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={subscriptionFilter} onValueChange={setSubscriptionFilter}>
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subscriptions</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{selectedUsers.length} user(s) selected</span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleBulkAction("suspend")}>
                    <UserCheck className="h-4 w-4 mr-2" />
                    Suspend
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleBulkAction("ban")}>
                    <Ban className="h-4 w-4 mr-2" />
                    Ban
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleBulkAction("unban")}>
                    <Unlock className="h-4 w-4 mr-2" />
                    Unban
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setSelectedUsers([])}>
                    Clear Selection
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Users Table */}
        <WatchPartyTable
          data={filteredUsers}
          columns={tableColumns}
          actions={tableActions}
          selectable
          selectedRows={selectedUsers}
          onSelectionChange={(selection: string[]) => setSelectedUsers(selection)}
          pagination={{
            page: 1,
            pageSize: 25,
            total: filteredUsers.length,
            showSizeSelector: true,
            pageSizeOptions: [10, 25, 50, 100],
          }}
          exportable
          onExport={exportUsers}
          refreshable
          onRefresh={loadUsers}
          className="bg-background"
        />

        {/* Action Dialog */}
        <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {currentAction?.type === "ban"
                  ? "Ban Users"
                  : currentAction?.type === "unban"
                    ? "Unban Users"
                    : currentAction?.type === "verify"
                      ? "Verify Users"
                      : currentAction?.type === "delete"
                        ? "Delete Users"
                        : "User Action"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  This action will affect {selectedUsers.length} user(s).
                  {currentAction?.type === "delete" && " This action cannot be undone."}
                </AlertDescription>
              </Alert>

              <div>
                <Label htmlFor="reason">Reason</Label>
                <Textarea
                  id="reason"
                  placeholder="Enter reason for this action..."
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  rows={3}
                />
              </div>

              {currentAction?.type === "ban" && (
                <div>
                  <Label htmlFor="duration">Duration (days)</Label>
                  <Select
                    value={actionDuration.toString()}
                    onValueChange={(value) => setActionDuration(Number.parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 day</SelectItem>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                      <SelectItem value="0">Permanent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="notify" 
                  checked={notifyUser} 
                  onCheckedChange={(checked) => setNotifyUser(checked === true)} 
                />
                <Label htmlFor="notify">Notify affected users</Label>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    if (currentAction) {
                      executeUserAction(
                        {
                          ...currentAction,
                          reason: actionReason,
                          duration: actionDuration,
                          notifyUser,
                        },
                        selectedUsers,
                      )
                    }
                  }}
                  className="flex-1"
                  variant={currentAction?.type === "delete" ? "destructive" : "default"}
                >
                  Confirm {currentAction?.type}
                </Button>
                <Button variant="outline" onClick={() => setShowActionDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
