"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Users, Search, MoreHorizontal, Ban, Shield, Crown, Download, Trash2, Eye, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { adminAPI } from "@/lib/api"
import { formatDistanceToNow } from "date-fns"

interface User {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  avatar?: string
  role: "user" | "admin" | "moderator"
  status: "active" | "suspended" | "banned" | "pending"
  isEmailVerified: boolean
  createdAt: string
  lastLoginAt?: string
  subscription?: {
    plan: string
    status: string
    expiresAt: string
  }
  stats: {
    partiesCreated: number
    partiesJoined: number
    videosUploaded: number
    friends: number
  }
  flags: {
    isReported: boolean
    reportCount: number
    isTrusted: boolean
  }
}

interface UserAction {
  id: string
  type: "ban" | "suspend" | "warn" | "promote" | "demote" | "verify"
  reason: string
  duration?: number
  adminId: string
  adminName: string
  timestamp: string
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [roleFilter, setRoleFilter] = useState("all")
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [userActions, setUserActions] = useState<UserAction[]>([])
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const { user: currentUser } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    loadUsers()
  }, [searchQuery, statusFilter, roleFilter, sortBy, sortOrder, currentPage])

  const loadUsers = async () => {
    try {
      const data = await adminAPI.getUsers({
        search: searchQuery || undefined,
        status: statusFilter !== "all" ? statusFilter as any : undefined,
        page: currentPage,
      })
      
      setUsers((data.results || []) as unknown as User[])
      setTotalPages(Math.ceil((data.count || 0) / 20))
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

  const loadUserActions = async (userId: string) => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`/api/admin/users/${userId}/actions/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUserActions(data.results || data)
      }
    } catch (error) {
      console.error("Failed to load user actions:", error)
    }
  }

  const updateUserStatus = async (userId: string, status: string, reason?: string, duration?: number) => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`/api/admin/users/${userId}/status/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status,
          reason,
          duration,
        }),
      })

      if (response.ok) {
        const updatedUser = await response.json()
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: updatedUser.status } : u)))
        toast({
          title: "User Updated",
          description: `User status changed to ${status}`,
        })
      }
    } catch (error) {
      console.error("Failed to update user status:", error)
      toast({
        title: "Error",
        description: "Failed to update user status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const updateUserRole = async (userId: string, role: string) => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`/api/admin/users/${userId}/role/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role }),
      })

      if (response.ok) {
        const updatedUser = await response.json()
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: updatedUser.role } : u)))
        toast({
          title: "Role Updated",
          description: `User role changed to ${role}`,
        })
      }
    } catch (error) {
      console.error("Failed to update user role:", error)
      toast({
        title: "Error",
        description: "Failed to update user role. Please try again.",
        variant: "destructive",
      })
    }
  }

  const bulkUpdateUsers = async (action: string, userIds: string[], reason?: string) => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch("/api/admin/users/bulk-action/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action,
          user_ids: userIds,
          reason,
        }),
      })

      if (response.ok) {
        await loadUsers()
        setSelectedUsers([])
        toast({
          title: "Bulk Action Completed",
          description: `${action} applied to ${userIds.length} users`,
        })
      }
    } catch (error) {
      console.error("Failed to perform bulk action:", error)
      toast({
        title: "Error",
        description: "Failed to perform bulk action. Please try again.",
        variant: "destructive",
      })
    }
  }

  const exportUsers = async () => {
    try {
      const downloadData = await adminAPI.exportUsers({ format: 'csv' })
      
      if (downloadData?.download_url) {
        const a = document.createElement("a")
        a.href = downloadData.download_url
        a.download = `users-export-${new Date().toISOString().split("T")[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error("Failed to export users:", error)
      toast({
        title: "Error",
        description: "Failed to export users. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "default",
      suspended: "secondary",
      banned: "destructive",
      pending: "outline",
    } as const

    const colors = {
      active: "text-green-600",
      suspended: "text-yellow-600",
      banned: "text-red-600",
      pending: "text-gray-600",
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants]} className={colors[status as keyof typeof colors]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Crown className="h-4 w-4 text-yellow-500" />
      case "moderator":
        return <Shield className="h-4 w-4 text-blue-500" />
      default:
        return <Users className="h-4 w-4 text-gray-500" />
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || user.status === statusFilter
    const matchesRole = roleFilter === "all" || user.role === roleFilter

    return matchesSearch && matchesStatus && matchesRole
  })

  const UserActionDialog = ({ user }: { user: User }) => {
    const [actionType, setActionType] = useState("")
    const [reason, setReason] = useState("")
    const [duration, setDuration] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async () => {
      if (!actionType || !reason) return

      setIsSubmitting(true)
      try {
        if (actionType === "ban" || actionType === "suspend") {
          await updateUserStatus(user.id, actionType, reason, duration ? Number.parseInt(duration) : undefined)
        } else if (actionType === "promote" || actionType === "demote") {
          const newRole = actionType === "promote" ? "moderator" : "user"
          await updateUserRole(user.id, newRole)
        }
        setSelectedUser(null)
      } finally {
        setIsSubmitting(false)
      }
    }

    return (
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage User: {user.username}</DialogTitle>
            <DialogDescription>Take administrative actions on this user account</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="actions" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="actions">Actions</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="actions" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Action Type</Label>
                  <Select value={actionType} onValueChange={setActionType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="warn">Warn User</SelectItem>
                      <SelectItem value="suspend">Suspend Account</SelectItem>
                      <SelectItem value="ban">Ban Account</SelectItem>
                      <SelectItem value="promote">Promote to Moderator</SelectItem>
                      <SelectItem value="demote">Demote to User</SelectItem>
                      <SelectItem value="verify">Verify Account</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(actionType === "suspend" || actionType === "ban") && (
                  <div className="space-y-2">
                    <Label>Duration (days)</Label>
                    <Input
                      type="number"
                      placeholder="Leave empty for permanent"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Reason</Label>
                  <Textarea
                    placeholder="Provide a reason for this action..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setSelectedUser(null)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} disabled={!actionType || !reason || isSubmitting}>
                    {isSubmitting ? "Processing..." : "Apply Action"}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>User Information</Label>
                  <div className="space-y-1 text-sm">
                    <p>
                      <strong>ID:</strong> {user.id}
                    </p>
                    <p>
                      <strong>Username:</strong> {user.username}
                    </p>
                    <p>
                      <strong>Email:</strong> {user.email}
                    </p>
                    <p>
                      <strong>Name:</strong> {user.firstName} {user.lastName}
                    </p>
                    <p>
                      <strong>Role:</strong> {user.role}
                    </p>
                    <p>
                      <strong>Status:</strong> {user.status}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Account Stats</Label>
                  <div className="space-y-1 text-sm">
                    <p>
                      <strong>Parties Created:</strong> {user.stats.partiesCreated}
                    </p>
                    <p>
                      <strong>Parties Joined:</strong> {user.stats.partiesJoined}
                    </p>
                    <p>
                      <strong>Videos Uploaded:</strong> {user.stats.videosUploaded}
                    </p>
                    <p>
                      <strong>Friends:</strong> {user.stats.friends}
                    </p>
                    <p>
                      <strong>Reports:</strong> {user.flags.reportCount}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Account Dates</Label>
                  <div className="space-y-1 text-sm">
                    <p>
                      <strong>Created:</strong> {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                    </p>
                    {user.lastLoginAt && (
                      <p>
                        <strong>Last Login:</strong>{" "}
                        {formatDistanceToNow(new Date(user.lastLoginAt), { addSuffix: true })}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Subscription</Label>
                  <div className="space-y-1 text-sm">
                    {user.subscription ? (
                      <>
                        <p>
                          <strong>Plan:</strong> {user.subscription.plan}
                        </p>
                        <p>
                          <strong>Status:</strong> {user.subscription.status}
                        </p>
                        <p>
                          <strong>Expires:</strong> {new Date(user.subscription.expiresAt).toLocaleDateString()}
                        </p>
                      </>
                    ) : (
                      <p>No active subscription</p>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <div className="space-y-2">
                {userActions.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">No administrative actions recorded</p>
                ) : (
                  userActions.map((action) => (
                    <Card key={action.id}>
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{action.type.toUpperCase()}</p>
                            <p className="text-sm text-gray-600">{action.reason}</p>
                            <p className="text-xs text-gray-500">
                              by {action.adminName} •{" "}
                              {formatDistanceToNow(new Date(action.timestamp), { addSuffix: true })}
                            </p>
                          </div>
                          {action.duration && <Badge variant="outline">{action.duration} days</Badge>}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-gray-600">Manage user accounts and permissions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportUsers}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          {selectedUsers.length > 0 && (
            <Button variant="outline" onClick={() => setShowBulkActions(true)}>
              Bulk Actions ({selectedUsers.length})
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search users..."
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
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="banned">Banned</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>

        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="user">Users</SelectItem>
            <SelectItem value="moderator">Moderators</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Created Date</SelectItem>
            <SelectItem value="lastLoginAt">Last Login</SelectItem>
            <SelectItem value="username">Username</SelectItem>
            <SelectItem value="email">Email</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Loading users...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === filteredUsers.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers(filteredUsers.map((u) => u.id))
                        } else {
                          setSelectedUsers([])
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Stats</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers((prev) => [...prev, user.id])
                          } else {
                            setSelectedUsers((prev) => prev.filter((id) => id !== user.id))
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            {user.firstName.charAt(0)}
                            {user.lastName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.username}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getRoleIcon(user.role)}
                        <span className="capitalize">{user.role}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(user.status)}
                        {!user.isEmailVerified && (
                          <Badge variant="outline" className="text-xs">
                            Unverified
                          </Badge>
                        )}
                        {user.flags.isReported && (
                          <Badge variant="destructive" className="text-xs">
                            Reported
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{user.stats.partiesCreated} parties</p>
                        <p>{user.stats.videosUploaded} videos</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.lastLoginAt ? (
                        <span className="text-sm">
                          {formatDistanceToNow(new Date(user.lastLoginAt), { addSuffix: true })}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">Never</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user)
                              loadUserActions(user.id)
                            }}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => updateUserStatus(user.id, "suspended", "Administrative action")}
                          >
                            <Ban className="mr-2 h-4 w-4" />
                            Suspend
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => updateUserRole(user.id, user.role === "moderator" ? "user" : "moderator")}
                          >
                            <Shield className="mr-2 h-4 w-4" />
                            {user.role === "moderator" ? "Remove Moderator" : "Make Moderator"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Account
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
        <p className="text-sm text-gray-600">
          Showing {filteredUsers.length} of {users.length} users
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>

      {/* User Details Dialog */}
      {selectedUser && <UserActionDialog user={selectedUser} />}

      {/* Bulk Actions Dialog */}
      <Dialog open={showBulkActions} onOpenChange={setShowBulkActions}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Actions</DialogTitle>
            <DialogDescription>Apply actions to {selectedUsers.length} selected users</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={() => bulkUpdateUsers("suspend", selectedUsers, "Bulk suspension")}>Suspend All</Button>
              <Button onClick={() => bulkUpdateUsers("activate", selectedUsers, "Bulk activation")}>
                Activate All
              </Button>
              <Button onClick={() => bulkUpdateUsers("verify", selectedUsers, "Bulk verification")}>Verify All</Button>
              <Button variant="destructive" onClick={() => bulkUpdateUsers("delete", selectedUsers, "Bulk deletion")}>
                Delete All
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Default export
export default UserManagement
