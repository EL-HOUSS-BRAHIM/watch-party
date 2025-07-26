"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Crown,
  Shield,
  Settings,
  Lock,
  Globe,
  Eye,
  EyeOff,
  Calendar,
  Clock,
  MapPin,
  Hash,
  Tag,
  Star,
  Trophy,
  Play,
  MessageCircle,
  Heart,
  Share2,
  Plus,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  MoreHorizontal,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Sparkles,
  Target,
  Award,
  Gift,
  Zap
} from "lucide-react"
import { formatDistanceToNow, format, parseISO } from "date-fns"

interface GroupData {
  id: string
  name: string
  description: string
  avatar?: string
  banner?: string
  privacy: "public" | "private" | "invite_only"
  member_count: number
  party_count: number
  created_at: string
  owner: {
    id: string
    username: string
    display_name: string
    avatar?: string
  }
  moderators: Array<{
    id: string
    username: string
    display_name: string
    avatar?: string
  }>
  tags: string[]
  rules: string[]
  is_member: boolean
  is_moderator: boolean
  is_owner: boolean
  member_role?: "member" | "moderator" | "owner"
  join_request_pending?: boolean
  recent_activity: Array<{
    type: string
    user: string
    timestamp: string
    data: any
  }>
  upcoming_parties: Array<{
    id: string
    title: string
    host: string
    scheduled_for: string
    member_count: number
  }>
  stats: {
    total_watch_time: number
    active_members: number
    parties_this_week: number
    average_rating: number
  }
}

const createGroupSchema = z.object({
  name: z.string().min(3, "Group name must be at least 3 characters").max(50, "Group name too long"),
  description: z.string().min(10, "Description must be at least 10 characters").max(500, "Description too long"),
  privacy: z.enum(["public", "private", "invite_only"]),
  tags: z.string().optional(),
  rules: z.string().optional(),
})

interface FilterOptions {
  search: string
  privacy: string
  memberStatus: string
  sortBy: string
}

export default function GroupsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()

  const [groups, setGroups] = useState<GroupData[]>([])
  const [filteredGroups, setFilteredGroups] = useState<GroupData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [processingActions, setProcessingActions] = useState<Set<string>>(new Set())
  const [filters, setFilters] = useState<FilterOptions>({
    search: "",
    privacy: "all",
    memberStatus: "all",
    sortBy: "recent"
  })

  const form = useForm<z.infer<typeof createGroupSchema>>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      name: "",
      description: "",
      privacy: "public",
      tags: "",
      rules: "",
    },
  })

  useEffect(() => {
    loadGroups()
  }, [])

  useEffect(() => {
    filterGroups()
  }, [groups, filters])

  const loadGroups = async () => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch("/api/social/groups/", {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setGroups(data.results || data.groups || [])
      } else {
        throw new Error("Failed to load groups")
      }
    } catch (error) {
      console.error("Failed to load groups:", error)
      toast({
        title: "Error",
        description: "Failed to load groups.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterGroups = () => {
    let filtered = [...groups]

    // Search filter
    if (filters.search.trim()) {
      const query = filters.search.toLowerCase()
      filtered = filtered.filter(group =>
        group.name.toLowerCase().includes(query) ||
        group.description.toLowerCase().includes(query) ||
        group.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Privacy filter
    if (filters.privacy !== "all") {
      filtered = filtered.filter(group => group.privacy === filters.privacy)
    }

    // Member status filter
    if (filters.memberStatus !== "all") {
      switch (filters.memberStatus) {
        case "member":
          filtered = filtered.filter(group => group.is_member)
          break
        case "owner":
          filtered = filtered.filter(group => group.is_owner)
          break
        case "moderator":
          filtered = filtered.filter(group => group.is_moderator)
          break
        case "non_member":
          filtered = filtered.filter(group => !group.is_member)
          break
      }
    }

    // Sort
    switch (filters.sortBy) {
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "members":
        filtered.sort((a, b) => b.member_count - a.member_count)
        break
      case "activity":
        filtered.sort((a, b) => b.stats.parties_this_week - a.stats.parties_this_week)
        break
      case "recent":
      default:
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
    }

    setFilteredGroups(filtered)
  }

  const createGroup = async (data: z.infer<typeof createGroupSchema>) => {
    setIsCreating(true)

    try {
      const token = localStorage.getItem("accessToken")
      const formData = {
        ...data,
        tags: data.tags ? data.tags.split(",").map(tag => tag.trim()).filter(Boolean) : [],
        rules: data.rules ? data.rules.split("\n").filter(Boolean) : [],
      }

      const response = await fetch("/api/social/groups/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const newGroup = await response.json()
        setGroups(prev => [newGroup, ...prev])
        setShowCreateForm(false)
        form.reset()
        
        toast({
          title: "Group Created",
          description: `"${newGroup.name}" has been created successfully!`,
        })
      } else {
        throw new Error("Failed to create group")
      }
    } catch (error) {
      console.error("Create group error:", error)
      toast({
        title: "Error",
        description: "Failed to create group.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const joinGroup = async (groupId: string) => {
    setProcessingActions(prev => new Set(prev).add(groupId))

    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`/api/social/groups/${groupId}/join/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setGroups(prev => 
          prev.map(group => 
            group.id === groupId 
              ? { 
                  ...group, 
                  is_member: true, 
                  member_count: group.member_count + 1,
                  join_request_pending: data.pending
                }
              : group
          )
        )
        
        toast({
          title: data.pending ? "Join Request Sent" : "Joined Group",
          description: data.pending 
            ? "Your request to join this group has been sent to moderators."
            : "You've successfully joined the group!",
        })
      } else {
        throw new Error("Failed to join group")
      }
    } catch (error) {
      console.error("Join group error:", error)
      toast({
        title: "Error",
        description: "Failed to join group.",
        variant: "destructive",
      })
    } finally {
      setProcessingActions(prev => {
        const newSet = new Set(prev)
        newSet.delete(groupId)
        return newSet
      })
    }
  }

  const leaveGroup = async (groupId: string) => {
    setProcessingActions(prev => new Set(prev).add(groupId))

    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`/api/social/groups/${groupId}/leave/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setGroups(prev => 
          prev.map(group => 
            group.id === groupId 
              ? { 
                  ...group, 
                  is_member: false, 
                  is_moderator: false,
                  member_count: Math.max(0, group.member_count - 1)
                }
              : group
          )
        )
        
        toast({
          title: "Left Group",
          description: "You've left the group successfully.",
        })
      } else {
        throw new Error("Failed to leave group")
      }
    } catch (error) {
      console.error("Leave group error:", error)
      toast({
        title: "Error",
        description: "Failed to leave group.",
        variant: "destructive",
      })
    } finally {
      setProcessingActions(prev => {
        const newSet = new Set(prev)
        newSet.delete(groupId)
        return newSet
      })
    }
  }

  const getPrivacyIcon = (privacy: string) => {
    switch (privacy) {
      case "public":
        return <Globe className="h-4 w-4 text-green-600" />
      case "private":
        return <Lock className="h-4 w-4 text-red-600" />
      case "invite_only":
        return <Shield className="h-4 w-4 text-yellow-600" />
      default:
        return <Globe className="h-4 w-4 text-gray-600" />
    }
  }

  const getPrivacyColor = (privacy: string) => {
    switch (privacy) {
      case "public":
        return "bg-green-100 text-green-800"
      case "private":
        return "bg-red-100 text-red-800"
      case "invite_only":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRoleIcon = (group: GroupData) => {
    if (group.is_owner) return <Crown className="h-4 w-4 text-purple-600" />
    if (group.is_moderator) return <Shield className="h-4 w-4 text-blue-600" />
    if (group.is_member) return <CheckCircle className="h-4 w-4 text-green-600" />
    return null
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading groups...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Users className="h-8 w-8" />
              Groups & Communities
            </h1>
            <p className="text-gray-600 mt-2">Join communities and create group watch parties</p>
          </div>
          
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Group
          </Button>
        </div>

        {/* Create Group Form */}
        {showCreateForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Create New Group</CardTitle>
              <CardDescription>
                Create a community for organizing group watch parties
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(createGroup)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Group Name *</label>
                    <Input
                      {...form.register("name")}
                      placeholder="Enter group name..."
                    />
                    {form.formState.errors.name && (
                      <p className="text-red-600 text-xs mt-1">{form.formState.errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Privacy Setting *</label>
                    <Select
                      value={form.watch("privacy")}
                      onValueChange={(value: any) => form.setValue("privacy", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            Public - Anyone can join
                          </div>
                        </SelectItem>
                        <SelectItem value="invite_only">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Invite Only - Approval required
                          </div>
                        </SelectItem>
                        <SelectItem value="private">
                          <div className="flex items-center gap-2">
                            <Lock className="h-4 w-4" />
                            Private - Invite only
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Description *</label>
                  <Textarea
                    {...form.register("description")}
                    placeholder="Describe your group's purpose and what kind of content you'll watch..."
                    rows={3}
                  />
                  {form.formState.errors.description && (
                    <p className="text-red-600 text-xs mt-1">{form.formState.errors.description.message}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Tags (comma-separated)</label>
                  <Input
                    {...form.register("tags")}
                    placeholder="movies, tv-shows, comedy, drama..."
                  />
                  <p className="text-xs text-gray-600 mt-1">Help others discover your group with relevant tags</p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Group Rules (one per line)</label>
                  <Textarea
                    {...form.register("rules")}
                    placeholder="Be respectful to all members&#10;No spoilers without warnings&#10;Keep discussions on-topic..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Group
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search groups by name, description, or tags..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filter dropdowns */}
              <div className="flex gap-2">
                <Select
                  value={filters.privacy}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, privacy: value }))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Privacy</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="invite_only">Invite Only</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.memberStatus}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, memberStatus: value }))}
                >
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Groups</SelectItem>
                    <SelectItem value="member">My Groups</SelectItem>
                    <SelectItem value="owner">I Own</SelectItem>
                    <SelectItem value="moderator">I Moderate</SelectItem>
                    <SelectItem value="non_member">Available</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.sortBy}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="members">Most Members</SelectItem>
                    <SelectItem value="activity">Most Active</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Groups Grid */}
        {filteredGroups.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No groups found</h3>
              <p className="text-gray-600">
                {filters.search || Object.values(filters).some(f => f !== "all" && f !== "recent")
                  ? "Try adjusting your search or filters"
                  : "Be the first to create a group for your favorite content!"
                }
              </p>
              {!showCreateForm && (
                <Button className="mt-4" onClick={() => setShowCreateForm(true)}>
                  Create First Group
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((group) => (
              <Card key={group.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  {/* Group Header */}
                  <div className="p-6 pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={group.avatar} />
                          <AvatarFallback>
                            {group.name.split(" ").map(w => w[0]).join("").toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{group.name}</h3>
                            {getRoleIcon(group)}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getPrivacyColor(group.privacy)}>
                              {getPrivacyIcon(group.privacy)}
                              <span className="ml-1 capitalize">{group.privacy.replace("_", " ")}</span>
                            </Badge>
                            {group.join_request_pending && (
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-800">
                                <Clock className="h-3 w-3 mr-1" />
                                Pending
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/dashboard/groups/${group.id}`)}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {group.description}
                    </p>

                    {/* Tags */}
                    {group.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {group.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            <Hash className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                        {group.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{group.tags.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold">{group.member_count}</div>
                        <div className="text-xs text-gray-600">Members</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">{group.stats.parties_this_week}</div>
                        <div className="text-xs text-gray-600">Parties This Week</div>
                      </div>
                    </div>

                    {/* Recent Activity Preview */}
                    {group.recent_activity.length > 0 && (
                      <div className="border-t pt-3">
                        <div className="text-xs text-gray-600 mb-2">Recent Activity</div>
                        <div className="space-y-1">
                          {group.recent_activity.slice(0, 2).map((activity, index) => (
                            <div key={index} className="text-xs text-gray-500 flex items-center gap-1">
                              <Play className="h-3 w-3" />
                              <span>{activity.user} {activity.type === "party_created" ? "created a party" : "joined a party"}</span>
                              <span>•</span>
                              <span>{formatDistanceToNow(parseISO(activity.timestamp), { addSuffix: true })}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="border-t px-6 py-4">
                    {group.is_member ? (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/dashboard/groups/${group.id}`)}
                          className="flex-1"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        {!group.is_owner && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => leaveGroup(group.id)}
                            disabled={processingActions.has(group.id)}
                          >
                            {processingActions.has(group.id) ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Leave"
                            )}
                          </Button>
                        )}
                      </div>
                    ) : (
                      <Button
                        onClick={() => joinGroup(group.id)}
                        disabled={processingActions.has(group.id) || group.join_request_pending}
                        className="w-full"
                        size="sm"
                      >
                        {processingActions.has(group.id) ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : group.join_request_pending ? (
                          <>
                            <Clock className="h-4 w-4 mr-2" />
                            Request Pending
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4 mr-2" />
                            {group.privacy === "public" ? "Join Group" : "Request to Join"}
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
