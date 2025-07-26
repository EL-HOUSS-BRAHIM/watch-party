"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import {
  Users,
  Search,
  Filter,
  Ban,
  UserCheck,
  UserX,
  Mail,
  Calendar,
  Shield,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Activity,
  Crown,
  Star,
  Flag,
  Loader2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  FileText,
  MessageCircle,
  Heart,
  Play
} from "lucide-react"
import { formatDistanceToNow, format, parseISO } from "date-fns"

interface UserData {
  id: string
  username: string
  email: string
  first_name: string
  last_name: string
  avatar?: string
  is_active: boolean
  is_verified: boolean
  is_staff: boolean
  is_superuser: boolean
  is_banned: boolean
  ban_reason?: string
  banned_at?: string
  banned_by?: string
  date_joined: string
  last_login?: string
  last_active?: string
  location?: string
  bio?: string
  total_parties_hosted: number
  total_parties_joined: number
  total_watch_time_hours: number
  total_friends: number
  total_reports_received: number
  total_reports_made: number
  account_status: "active" | "suspended" | "banned" | "pending_verification"
  subscription_type?: "free" | "premium" | "enterprise"
  registration_ip?: string
  email_verified: boolean
  phone_verified: boolean
  two_factor_enabled: boolean
}

interface FilterOptions {
  status: string
  role: string
  subscription: string
  verification: string
  registrationDate: string
  lastActive: string
}

export default function UserManagementPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()

  const [users, setUsers] = useState<UserData[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [processingActions, setProcessingActions] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const [filters, setFilters] = useState<FilterOptions>({
    status: "all",
    role: "all",
    subscription: "all",
    verification: "all",
    registrationDate: "all",
    lastActive: "all"
  })

  const usersPerPage = 20

  useEffect(() => {
    // Check if user has admin permissions
    if (!user?.is_staff && !user?.is_superuser) {
      router.push("/dashboard")
      return
    }
    loadUsers()
  }, [user, router, currentPage])

  useEffect(() => {
    filterUsers()
  }, [users, searchQuery, filters])

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem("accessToken")
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: usersPerPage.toString(),
      })

      const response = await fetch(`/api/admin/users/?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(data.results || data.users || [])
        setTotalPages(Math.ceil((data.total || data.count || 0) / usersPerPage))
        setTotalUsers(data.total || data.count || 0)
      } else if (response.status === 403) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access this page.",
          variant: "destructive",
        })
        router.push("/dashboard")
      } else {
        throw new Error("Failed to load users")
      }
    } catch (error) {
      console.error("Failed to load users:", error)
      toast({
        title: "Error",
        description: "Failed to load users.",
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
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.first_name.toLowerCase().includes(query) ||
        user.last_name.toLowerCase().includes(query) ||
        user.bio?.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (filters.status !== "all") {
      filtered = filtered.filter(user => {
        switch (filters.status) {
          case "active":
            return user.is_active && !user.is_banned
          case "banned":
            return user.is_banned
          case "suspended":
            return !user.is_active && !user.is_banned
          case "pending":
            return !user.email_verified
          default:
            return true
        }
      })
    }

    // Role filter
    if (filters.role !== "all") {
      filtered = filtered.filter(user => {
        switch (filters.role) {
          case "admin":
            return user.is_staff || user.is_superuser
          case "verified":
            return user.is_verified
          case "regular":
            return !user.is_staff && !user.is_superuser && !user.is_verified
          default:
            return true
        }
      })
    }

    // Subscription filter
    if (filters.subscription !== "all") {
      filtered = filtered.filter(user => user.subscription_type === filters.subscription)
    }

    // Verification filter
    if (filters.verification !== "all") {
      filtered = filtered.filter(user => {
        switch (filters.verification) {
          case "email_verified":
            return user.email_verified
          case "phone_verified":
            return user.phone_verified
          case "2fa_enabled":
            return user.two_factor_enabled
          case "unverified":
            return !user.email_verified
          default:
            return true
        }
      })
    }

    setFilteredUsers(filtered)
  }

  const updateUserStatus = async (userId: string, action: string, reason?: string) => {
    setProcessingActions(prev => new Set(prev).add(userId))

    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`/api/admin/users/${userId}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action,
          reason,
          admin_id: user?.id
        }),
      })

      if (response.ok) {
        await loadUsers() // Reload to get updated data
        
        const actionMessages = {
          ban: "User has been banned",
          unban: "User has been unbanned",
          suspend: "User has been suspended",
          activate: "User has been activated",
          verify: "User has been verified",
          make_staff: "User promoted to staff",
          remove_staff: "Staff privileges removed"
        }

        toast({
          title: "User Updated",
          description: actionMessages[action as keyof typeof actionMessages] || "User status updated successfully.",
        })
      } else {
        throw new Error("Failed to update user")
      }
    } catch (error) {
      console.error("Update user error:", error)
      toast({
        title: "Error",
        description: "Failed to update user status.",
        variant: "destructive",
      })
    } finally {
      setProcessingActions(prev => {
        const newSet = new Set(prev)
        newSet.delete(userId)
        return newSet
      })
    }
  }

  const bulkAction = async (action: string, reason?: string) => {
    if (selectedUsers.size === 0) {
      toast({
        title: "No Users Selected",
        description: "Please select users to perform bulk action.",
        variant: "destructive",
      })
      return
    }

    const userIds = Array.from(selectedUsers)
    
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`/api/admin/users/bulk/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_ids: userIds,
          action,
          reason,
          admin_id: user?.id
        }),
      })

      if (response.ok) {
        await loadUsers()
        setSelectedUsers(new Set())
        
        toast({
          title: "Bulk Action Complete",
          description: `Action applied to ${userIds.length} users successfully.`,
        })
      } else {
        throw new Error("Failed to perform bulk action")
      }
    } catch (error) {
      console.error("Bulk action error:", error)
      toast({
        title: "Error",
        description: "Failed to perform bulk action.",
        variant: "destructive",
      })
    }
  }

  const exportUsers = async () => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch("/api/admin/users/export/", {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `users-export-${format(new Date(), "yyyy-MM-dd")}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        toast({
          title: "Export Complete",
          description: "User data has been exported successfully.",
        })
      }
    } catch (error) {
      console.error("Export error:", error)
      toast({
        title: "Error",
        description: "Failed to export user data.",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (user: UserData) => {
    if (user.is_banned) return "bg-red-100 text-red-800"
    if (!user.is_active) return "bg-yellow-100 text-yellow-800"
    if (!user.email_verified) return "bg-orange-100 text-orange-800"
    return "bg-green-100 text-green-800"
  }

  const getStatusText = (user: UserData) => {
    if (user.is_banned) return "Banned"
    if (!user.is_active) return "Suspended"
    if (!user.email_verified) return "Pending"
    return "Active"
  }

  const getRoleIcon = (user: UserData) => {
    if (user.is_superuser) return <Crown className="h-4 w-4 text-purple-600" />
    if (user.is_staff) return <Shield className="h-4 w-4 text-blue-600" />
    if (user.is_verified) return <CheckCircle className="h-4 w-4 text-green-600" />
    return <Users className="h-4 w-4 text-gray-600" />
  }

  const toggleUserSelection = (userId: string) => {
    const newSelected = new Set(selectedUsers)
    if (newSelected.has(userId)) {
      newSelected.delete(userId)
    } else {
      newSelected.add(userId)
    }
    setSelectedUsers(newSelected)
  }

  const selectAllUsers = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set())
    } else {
      setSelectedUsers(new Set(filteredUsers.map(u => u.id)))
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
          <p>Loading users...</p>
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
              <Users className="h-8 w-8" />
              User Management
            </h1>
            <p className="text-gray-600 mt-2">Manage platform users and permissions</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {totalUsers} Total Users
            </Badge>
            <Badge variant="outline">
              {filteredUsers.filter(u => u.is_banned).length} Banned
            </Badge>
            <Button variant="outline" onClick={exportUsers}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" onClick={loadUsers}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
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
                    placeholder="Search by username, email, or name..."
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
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="banned">Banned</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.role}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, role: value }))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="regular">Regular</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.subscription}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, subscription: value }))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Plans</SelectItem>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedUsers.size > 0 && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {selectedUsers.size} user{selectedUsers.size !== 1 ? 's' : ''} selected
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => bulkAction("suspend", "Bulk suspension by admin")}
                  >
                    <UserX className="h-4 w-4 mr-2" />
                    Suspend
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => bulkAction("activate")}
                  >
                    <UserCheck className="h-4 w-4 mr-2" />
                    Activate
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => bulkAction("ban", "Bulk ban by admin")}
                  >
                    <Ban className="h-4 w-4 mr-2" />
                    Ban
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Users Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4">
                      <Checkbox
                        checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                        onCheckedChange={selectAllUsers}
                      />
                    </th>
                    <th className="text-left p-4 font-medium">User</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-left p-4 font-medium">Role</th>
                    <th className="text-left p-4 font-medium">Activity</th>
                    <th className="text-left p-4 font-medium">Joined</th>
                    <th className="text-left p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12">
                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                        <p className="text-gray-600">
                          {searchQuery || Object.values(filters).some(f => f !== "all")
                            ? "Try adjusting your search or filters"
                            : "No users match the current criteria"
                          }
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((userData) => (
                      <tr key={userData.id} className="border-b hover:bg-gray-50">
                        <td className="p-4">
                          <Checkbox
                            checked={selectedUsers.has(userData.id)}
                            onCheckedChange={() => toggleUserSelection(userData.id)}
                          />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={userData.avatar} />
                              <AvatarFallback>
                                {userData.first_name?.[0] || userData.username?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">
                                  {userData.first_name} {userData.last_name}
                                </p>
                                {getRoleIcon(userData)}
                              </div>
                              <p className="text-sm text-gray-600">@{userData.username}</p>
                              <p className="text-xs text-gray-500">{userData.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge className={getStatusColor(userData)}>
                            {getStatusText(userData)}
                          </Badge>
                          {userData.is_banned && userData.ban_reason && (
                            <p className="text-xs text-red-600 mt-1">{userData.ban_reason}</p>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            {userData.is_superuser && (
                              <Badge variant="outline" className="text-xs bg-purple-50">
                                <Crown className="h-3 w-3 mr-1" />
                                Super Admin
                              </Badge>
                            )}
                            {userData.is_staff && !userData.is_superuser && (
                              <Badge variant="outline" className="text-xs bg-blue-50">
                                <Shield className="h-3 w-3 mr-1" />
                                Staff
                              </Badge>
                            )}
                            {userData.is_verified && (
                              <Badge variant="outline" className="text-xs bg-green-50">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                            {userData.subscription_type && userData.subscription_type !== "free" && (
                              <Badge variant="outline" className="text-xs bg-yellow-50">
                                <Star className="h-3 w-3 mr-1" />
                                {userData.subscription_type}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm space-y-1">
                            <div className="flex items-center gap-1 text-gray-600">
                              <Play className="h-3 w-3" />
                              <span>{userData.total_parties_hosted} hosted</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-600">
                              <Users className="h-3 w-3" />
                              <span>{userData.total_friends} friends</span>
                            </div>
                            {userData.total_reports_received > 0 && (
                              <div className="flex items-center gap-1 text-red-600">
                                <Flag className="h-3 w-3" />
                                <span>{userData.total_reports_received} reports</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm">
                            <div>{format(parseISO(userData.date_joined), "MMM d, yyyy")}</div>
                            {userData.last_active && (
                              <div className="text-gray-500 text-xs">
                                Active {formatDistanceToNow(parseISO(userData.last_active), { addSuffix: true })}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {userData.is_banned ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateUserStatus(userData.id, "unban")}
                                disabled={processingActions.has(userData.id)}
                              >
                                {processingActions.has(userData.id) ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <UserCheck className="h-4 w-4" />
                                )}
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateUserStatus(userData.id, "ban", "Banned by admin")}
                                disabled={processingActions.has(userData.id)}
                              >
                                {processingActions.has(userData.id) ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Ban className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/dashboard/admin/users/${userData.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-600">
              Showing {((currentPage - 1) * usersPerPage) + 1} to {Math.min(currentPage * usersPerPage, totalUsers)} of {totalUsers} users
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  )
                })}
                {totalPages > 5 && (
                  <>
                    <span className="text-gray-500">...</span>
                    <Button
                      variant={currentPage === totalPages ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
