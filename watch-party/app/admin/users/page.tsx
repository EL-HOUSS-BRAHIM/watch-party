"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, MoreHorizontal, Shield, Ban, Mail, UserCheck } from "lucide-react"
import { api } from "@/lib/api"

export default function AdminUsersPage() {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users", { search, filter }],
    queryFn: () => api.get("/admin/users", { params: { search, filter } }),
  })

  const mockUsers = [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      avatar: "/placeholder.svg?height=40&width=40&text=JD",
      role: "user",
      status: "active",
      joinDate: "2024-01-15",
      lastActive: "2 hours ago",
      partiesCreated: 12,
      subscription: "premium",
    },
    {
      id: 2,
      name: "Sarah Chen",
      email: "sarah@example.com",
      avatar: "/placeholder.svg?height=40&width=40&text=SC",
      role: "moderator",
      status: "active",
      joinDate: "2023-11-20",
      lastActive: "1 day ago",
      partiesCreated: 28,
      subscription: "free",
    },
    {
      id: 3,
      name: "Mike Johnson",
      email: "mike@example.com",
      avatar: "/placeholder.svg?height=40&width=40&text=MJ",
      role: "user",
      status: "suspended",
      joinDate: "2024-02-10",
      lastActive: "1 week ago",
      partiesCreated: 5,
      subscription: "free",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-success text-success-foreground">Active</Badge>
      case "suspended":
        return <Badge variant="destructive">Suspended</Badge>
      case "banned":
        return <Badge variant="destructive">Banned</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-destructive text-destructive-foreground">Admin</Badge>
      case "moderator":
        return <Badge className="bg-warning text-warning-foreground">Moderator</Badge>
      case "user":
        return <Badge variant="secondary">User</Badge>
      default:
        return <Badge variant="secondary">{role}</Badge>
    }
  }

  const handleUserAction = (action: string, userId: number) => {
    console.log(`${action} user:`, userId)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">User Management</h1>
        <p className="text-muted-foreground">Manage user accounts, roles, and permissions.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-base pl-10"
          />
        </div>

        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter users" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
            <SelectItem value="moderators">Moderators</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users ({mockUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 animate-pulse">
                  <div className="h-12 w-12 bg-secondary rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-secondary rounded w-1/4" />
                    <div className="h-3 bg-secondary rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {mockUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-foreground">{user.name}</h3>
                        {getRoleBadge(user.role)}
                        {getStatusBadge(user.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                        <span>Joined: {user.joinDate}</span>
                        <span>Last active: {user.lastActive}</span>
                        <span>Parties: {user.partiesCreated}</span>
                        <Badge variant="outline" className="text-xs">
                          {user.subscription}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleUserAction("view", user.id)}>
                        <UserCheck className="mr-2 h-4 w-4" />
                        View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUserAction("message", user.id)}>
                        <Mail className="mr-2 h-4 w-4" />
                        Send Message
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUserAction("promote", user.id)}>
                        <Shield className="mr-2 h-4 w-4" />
                        Change Role
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleUserAction("suspend", user.id)}
                        className="text-destructive"
                      >
                        <Ban className="mr-2 h-4 w-4" />
                        {user.status === "active" ? "Suspend" : "Unsuspend"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
