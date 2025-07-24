"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Search, Filter, MoreHorizontal, UserCheck, UserX, Crown, Shield, Mail, Activity } from "lucide-react"

export function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [planFilter, setPlanFilter] = useState("all")
  const [selectedUser, setSelectedUser] = useState<any>(null)

  // Mock user data
  const users = [
    {
      id: "user_001",
      name: "John Doe",
      email: "john@example.com",
      avatar: "/placeholder.svg",
      status: "active",
      plan: "Premium",
      joined: "2023-10-15",
      last_active: "2024-01-20",
      parties_hosted: 12,
      total_participants: 156,
      is_admin: false,
      is_premium: true,
    },
    {
      id: "user_002",
      name: "Sarah Wilson",
      email: "sarah@example.com",
      avatar: "/placeholder.svg",
      status: "active",
      plan: "Pro",
      joined: "2023-09-22",
      last_active: "2024-01-19",
      parties_hosted: 28,
      total_participants: 342,
      is_admin: false,
      is_premium: true,
    },
    {
      id: "user_003",
      name: "Mike Johnson",
      email: "mike@example.com",
      avatar: "/placeholder.svg",
      status: "suspended",
      plan: "Free",
      joined: "2023-11-08",
      last_active: "2024-01-10",
      parties_hosted: 3,
      total_participants: 15,
      is_admin: false,
      is_premium: false,
    },
    {
      id: "user_004",
      name: "Lisa Chen",
      email: "lisa@example.com",
      avatar: "/placeholder.svg",
      status: "active",
      plan: "Enterprise",
      joined: "2023-08-12",
      last_active: "2024-01-20",
      parties_hosted: 45,
      total_participants: 892,
      is_admin: false,
      is_premium: true,
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "suspended":
        return <Badge variant="destructive">Suspended</Badge>
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case "Free":
        return <Badge variant="outline">Free</Badge>
      case "Premium":
        return <Badge className="bg-blue-100 text-blue-800">Premium</Badge>
      case "Pro":
        return <Badge className="bg-purple-100 text-purple-800">Pro</Badge>
      case "Enterprise":
        return <Badge className="bg-orange-100 text-orange-800">Enterprise</Badge>
      default:
        return <Badge variant="outline">{plan}</Badge>
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || user.status === statusFilter
    const matchesPlan = planFilter === "all" || user.plan === planFilter

    return matchesSearch && matchesStatus && matchesPlan
  })

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <UserCheck className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,847</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,280</div>
            <p className="text-xs text-muted-foreground">80% of total users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Premium Users</CardTitle>
            <Crown className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">996</div>
            <p className="text-xs text-muted-foreground">35% conversion rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspended</CardTitle>
            <UserX className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">Requires review</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Manage user accounts, permissions, and subscriptions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
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
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="Free">Free</SelectItem>
                <SelectItem value="Premium">Premium</SelectItem>
                <SelectItem value="Pro">Pro</SelectItem>
                <SelectItem value="Enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Parties</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={user.avatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{user.name}</span>
                            {user.is_admin && <Shield className="w-3 h-3 text-blue-600" />}
                            {user.is_premium && <Crown className="w-3 h-3 text-accent-premium" />}
                          </div>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell>{getPlanBadge(user.plan)}</TableCell>
                    <TableCell>{new Date(user.joined).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(user.last_active).toLocaleDateString()}</TableCell>
                    <TableCell>{user.parties_hosted}</TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" onClick={() => setSelectedUser(user)}>
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>User Actions</DialogTitle>
                            <DialogDescription>Manage {user.name}'s account</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-2">
                            <Button variant="outline" className="w-full justify-start bg-transparent">
                              <Mail className="w-4 h-4 mr-2" />
                              Send Message
                            </Button>
                            <Button variant="outline" className="w-full justify-start bg-transparent">
                              <UserCheck className="w-4 h-4 mr-2" />
                              View Profile
                            </Button>
                            <Button variant="outline" className="w-full justify-start bg-transparent">
                              <Crown className="w-4 h-4 mr-2" />
                              Change Plan
                            </Button>
                            {user.status === "active" ? (
                              <Button variant="destructive" className="w-full justify-start">
                                <UserX className="w-4 h-4 mr-2" />
                                Suspend User
                              </Button>
                            ) : (
                              <Button variant="default" className="w-full justify-start">
                                <UserCheck className="w-4 h-4 mr-2" />
                                Activate User
                              </Button>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No users found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
