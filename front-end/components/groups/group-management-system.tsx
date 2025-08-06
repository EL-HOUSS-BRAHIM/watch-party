"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import {
  Users,
  Plus,
  Settings,
  Crown,
  Shield,
  UserPlus,
  UserMinus,
  MessageCircle,
  Calendar,
  Video,
  Search,
  Lock,
  Globe,
  Eye,
} from "lucide-react"

interface Group {
  id: string
  name: string
  description: string
  avatar: string
  privacy: "public" | "private" | "invite-only"
  memberCount: number
  maxMembers: number
  category: string
  tags: string[]
  createdAt: string
  owner: {
    id: string
    name: string
    avatar: string
  }
  isOwner: boolean
  isMember: boolean
  role?: "owner" | "admin" | "moderator" | "member"
}

interface GroupMember {
  id: string
  user: {
    id: string
    name: string
    avatar: string
    email: string
  }
  role: "owner" | "admin" | "moderator" | "member"
  joinedAt: string
  lastActive: string
  status: "active" | "inactive" | "banned"
}

export default function GroupManagementSystem() {
  const { toast } = useToast()
  const [groups, setGroups] = useState<Group[]>([])
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  // Mock data
  useEffect(() => {
    const mockGroups: Group[] = [
      {
        id: "1",
        name: "Movie Enthusiasts",
        description: "A community for movie lovers to discuss and watch films together",
        avatar: "/placeholder.svg?height=100&width=100&text=ME",
        privacy: "public",
        memberCount: 156,
        maxMembers: 500,
        category: "Entertainment",
        tags: ["movies", "cinema", "reviews"],
        createdAt: "2024-01-15",
        owner: { id: "user1", name: "John Doe", avatar: "/placeholder.svg?height=40&width=40" },
        isOwner: true,
        isMember: true,
        role: "owner",
      },
      {
        id: "2",
        name: "Anime Club",
        description: "Watch and discuss anime series with fellow otakus",
        avatar: "/placeholder.svg?height=100&width=100&text=AC",
        privacy: "invite-only",
        memberCount: 89,
        maxMembers: 200,
        category: "Entertainment",
        tags: ["anime", "manga", "japanese"],
        createdAt: "2024-02-01",
        owner: { id: "user2", name: "Jane Smith", avatar: "/placeholder.svg?height=40&width=40" },
        isOwner: false,
        isMember: true,
        role: "admin",
      },
      {
        id: "3",
        name: "Documentary Watchers",
        description: "Educational documentaries and discussions",
        avatar: "/placeholder.svg?height=100&width=100&text=DW",
        privacy: "public",
        memberCount: 234,
        maxMembers: 1000,
        category: "Education",
        tags: ["documentaries", "education", "learning"],
        createdAt: "2024-01-20",
        owner: { id: "user3", name: "Mike Johnson", avatar: "/placeholder.svg?height=40&width=40" },
        isOwner: false,
        isMember: false,
      },
    ]

    const mockMembers: GroupMember[] = [
      {
        id: "1",
        user: {
          id: "user1",
          name: "John Doe",
          avatar: "/placeholder.svg?height=40&width=40",
          email: "john@example.com",
        },
        role: "owner",
        joinedAt: "2024-01-15",
        lastActive: "2024-01-28",
        status: "active",
      },
      {
        id: "2",
        user: {
          id: "user2",
          name: "Jane Smith",
          avatar: "/placeholder.svg?height=40&width=40",
          email: "jane@example.com",
        },
        role: "admin",
        joinedAt: "2024-01-16",
        lastActive: "2024-01-27",
        status: "active",
      },
      {
        id: "3",
        user: {
          id: "user3",
          name: "Mike Johnson",
          avatar: "/placeholder.svg?height=40&width=40",
          email: "mike@example.com",
        },
        role: "moderator",
        joinedAt: "2024-01-18",
        lastActive: "2024-01-26",
        status: "active",
      },
    ]

    setGroups(mockGroups)
    setGroupMembers(mockMembers)
  }, [])

  const handleCreateGroup = async (formData: FormData) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const newGroup: Group = {
        id: Date.now().toString(),
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        avatar: "/placeholder.svg?height=100&width=100&text=" + (formData.get("name") as string).charAt(0),
        privacy: formData.get("privacy") as "public" | "private" | "invite-only",
        memberCount: 1,
        maxMembers: Number.parseInt(formData.get("maxMembers") as string) || 100,
        category: formData.get("category") as string,
        tags: (formData.get("tags") as string).split(",").map((tag) => tag.trim()),
        createdAt: new Date().toISOString().split("T")[0],
        owner: { id: "current-user", name: "Current User", avatar: "/placeholder.svg?height=40&width=40" },
        isOwner: true,
        isMember: true,
        role: "owner",
      }

      setGroups((prev) => [newGroup, ...prev])
      setShowCreateDialog(false)

      toast({
        title: "Group Created",
        description: "Your group has been created successfully!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create group. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleJoinGroup = async (groupId: string) => {
    try {
      setGroups((prev) =>
        prev.map((group) =>
          group.id === groupId
            ? { ...group, isMember: true, memberCount: group.memberCount + 1, role: "member" }
            : group,
        ),
      )

      toast({
        title: "Joined Group",
        description: "You have successfully joined the group!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join group. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleLeaveGroup = async (groupId: string) => {
    try {
      setGroups((prev) =>
        prev.map((group) =>
          group.id === groupId
            ? { ...group, isMember: false, memberCount: group.memberCount - 1, role: undefined }
            : group,
        ),
      )

      toast({
        title: "Left Group",
        description: "You have left the group.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to leave group. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleRoleChange = async (memberId: string, newRole: string) => {
    try {
      setGroupMembers((prev) =>
        prev.map((member) =>
          member.id === memberId ? { ...member, role: newRole as "owner" | "admin" | "moderator" | "member" } : member,
        ),
      )

      toast({
        title: "Role Updated",
        description: "Member role has been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update member role.",
        variant: "destructive",
      })
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    try {
      setGroupMembers((prev) => prev.filter((member) => member.id !== memberId))

      toast({
        title: "Member Removed",
        description: "Member has been removed from the group.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove member.",
        variant: "destructive",
      })
    }
  }

  const filteredGroups = groups.filter((group) => {
    const matchesSearch =
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "all" || group.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="h-4 w-4 text-yellow-500" />
      case "admin":
        return <Shield className="h-4 w-4 text-blue-500" />
      case "moderator":
        return <Shield className="h-4 w-4 text-green-500" />
      default:
        return <Users className="h-4 w-4 text-gray-500" />
    }
  }

  const getPrivacyIcon = (privacy: string) => {
    switch (privacy) {
      case "public":
        return <Globe className="h-4 w-4 text-green-500" />
      case "private":
        return <Lock className="h-4 w-4 text-red-500" />
      case "invite-only":
        return <Eye className="h-4 w-4 text-blue-500" />
      default:
        return <Globe className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Group Management</h1>
          <p className="text-muted-foreground">Create and manage watch party groups</p>
        </div>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Group
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Group</DialogTitle>
              <DialogDescription>Create a new group for watch parties and discussions</DialogDescription>
            </DialogHeader>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                handleCreateGroup(formData)
              }}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="name">Group Name</Label>
                <Input id="name" name="name" required />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" required />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select name="category" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Entertainment">Entertainment</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Sports">Sports</SelectItem>
                    <SelectItem value="Gaming">Gaming</SelectItem>
                    <SelectItem value="Music">Music</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="privacy">Privacy</Label>
                <Select name="privacy" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select privacy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="invite-only">Invite Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="maxMembers">Max Members</Label>
                <Input id="maxMembers" name="maxMembers" type="number" defaultValue="100" />
              </div>

              <div>
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input id="tags" name="tags" placeholder="movies, entertainment, fun" />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Group"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Entertainment">Entertainment</SelectItem>
            <SelectItem value="Education">Education</SelectItem>
            <SelectItem value="Sports">Sports</SelectItem>
            <SelectItem value="Gaming">Gaming</SelectItem>
            <SelectItem value="Music">Music</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGroups.map((group) => (
          <Card key={group.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={group.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{group.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{group.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      {getPrivacyIcon(group.privacy)}
                      <Badge variant="secondary" className="text-xs">
                        {group.category}
                      </Badge>
                    </div>
                  </div>
                </div>

                {group.isOwner && (
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <CardDescription className="line-clamp-2">{group.description}</CardDescription>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {group.memberCount}/{group.maxMembers} members
                </div>
                {group.role && (
                  <div className="flex items-center gap-1">
                    {getRoleIcon(group.role)}
                    <span className="capitalize">{group.role}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-1">
                {group.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {group.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{group.tags.length - 3}
                  </Badge>
                )}
              </div>

              <div className="flex gap-2">
                {group.isMember ? (
                  <>
                    <Button size="sm" className="flex-1">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Chat
                    </Button>
                    {!group.isOwner && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            Leave
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Leave Group</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to leave "{group.name}"? You'll need to request to join again.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleLeaveGroup(group.id)}>
                              Leave Group
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </>
                ) : (
                  <Button size="sm" className="flex-1" onClick={() => handleJoinGroup(group.id)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    {group.privacy === "invite-only" ? "Request to Join" : "Join Group"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Group Details Modal */}
      {selectedGroup && (
        <Dialog open={!!selectedGroup} onOpenChange={() => setSelectedGroup(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedGroup.name}</DialogTitle>
              <DialogDescription>{selectedGroup.description}</DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="members" className="w-full">
              <TabsList>
                <TabsTrigger value="members">Members</TabsTrigger>
                <TabsTrigger value="events">Events</TabsTrigger>
                <TabsTrigger value="videos">Videos</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="members" className="space-y-4">
                <div className="space-y-4">
                  {groupMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={member.user.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{member.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{member.user.name}</span>
                            {getRoleIcon(member.role)}
                            <Badge variant="outline" className="text-xs capitalize">
                              {member.role}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{member.user.email}</p>
                        </div>
                      </div>

                      {selectedGroup.isOwner && member.role !== "owner" && (
                        <div className="flex items-center gap-2">
                          <Select value={member.role} onValueChange={(value) => handleRoleChange(member.id, value)}>
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="member">Member</SelectItem>
                              <SelectItem value="moderator">Moderator</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <UserMinus className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove Member</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove {member.user.name} from the group?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleRemoveMember(member.id)}>
                                  Remove
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="events">
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No events scheduled yet</p>
                </div>
              </TabsContent>

              <TabsContent value="videos">
                <div className="text-center py-8">
                  <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No videos shared yet</p>
                </div>
              </TabsContent>

              <TabsContent value="settings">
                {selectedGroup.isOwner ? (
                  <div className="space-y-4">
                    <p>Group settings and configuration options would go here.</p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Only group owners can access settings</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
