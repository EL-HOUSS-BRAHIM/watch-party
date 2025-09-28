import { Calendar, Eye, Loader2, Lock, MessageCircle, Plus, Search, Settings, Shield, User, Users, Video } from "lucide-react"
import { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {}
import {}
import { useToast } from "@/hooks/use-toast"
import { socialAPI } from "@/lib/api"

"use client"
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
interface Group {}
  id: string;
  backendId?: number;
  name: string;
  description: string;
  avatar?: string;
  privacy: "public" | "private" | "invite-only"
  memberCount: number;
  maxMembers?: number;
  category: string;
  tags: string[]
  createdAt?: string;
  owner: {}
    id: string;
    name: string;
    avatar?: string;
  }
  isOwner: boolean;
  isMember: boolean;
  role?: "owner" | "admin" | "moderator" | "member"
}

interface GroupMember {}
  id: string;
  user: {}
    id: string;
    name: string;
    avatar?: string;
    email?: string;
  }
  role: "owner" | "admin" | "moderator" | "member"
  joinedAt?: string;
  lastActive?: string;
  status: "active" | "inactive" | "banned"
}

const DEFAULT_CATEGORIES = ["Entertainment", "Education", "Sports", "Gaming", "Music", "Other"]

const fallbackId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 10)}`

const extractCollection = (value: unknown): unknown[] => {}
  if (!value) return []
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.results)) return value.results;
  if (Array.isArray(value?.data)) return value.data;
  return []
}

const mapMemberStatus = (member: unknown): GroupMember["status"] => {}
  const rawStatus = member?.status ?? (member?.is_banned ? "banned" : member?.is_active === false ? "inactive" : undefined)

  switch (rawStatus) {
    case "inactive":
      return "inactive"
    case "banned":
      return "banned"
    default:
      return "active"
  }
}

const normalizeGroupMember = (member: unknown): GroupMember => {}
  const memberUser = member?.user ?? member;
  const firstName = memberUser?.first_name ?? memberUser?.firstName;
  const lastName = memberUser?.last_name ?? memberUser?.lastName;
  const composedName = [firstName, lastName].filter(Boolean).join(" ")
  const name = (memberUser?.name ?? memberUser?.full_name ?? memberUser?.username ?? composedName) || "Member"

  return {
    id: String(member?.id ?? memberUser?.id ?? fallbackId("member")),
    user: {}
      id: String(memberUser?.id ?? fallbackId("user")),
      name,
      avatar: memberUser?.avatar ?? memberUser?.image ?? undefined,
      email: memberUser?.email ?? undefined,
    },
    role: (member?.role ?? member?.membership?.role ?? member?.group_role ?? "member") as GroupMember["role"],
    joinedAt: member?.joined_at ?? member?.created_at ?? undefined,
    lastActive: member?.last_active ?? member?.last_seen ?? member?.last_seen_at ?? undefined,
    status: mapMemberStatus(member),
  }
}

const derivePrivacy = (group: unknown): Group["privacy"] => {}
  if (group?.privacy === "invite-only" || group?.privacy === "private" || group?.privacy === "public") {
    return group.privacy;
  }

  if (group?.is_public === false) {
    return group?.requires_invite ? "invite-only" : "private"
  }

  return "public"
}

const normalizeGroup = (group: unknown): Group => {}
  const backendId = typeof group?.id === "number" ? group.id : Number.parseInt(String(group?.id ?? ""), 10)
  const owner = group?.owner ?? group?.created_by ?? {}
  const firstName = owner?.first_name ?? owner?.firstName;
  const lastName = owner?.last_name ?? owner?.lastName;
  const ownerName = (owner?.name ?? owner?.full_name ?? owner?.username ?? [firstName, lastName].filter(Boolean).join(" ")) || "Group Owner"
  const membership = group?.membership ?? {}
  const tags = Array.isArray(group?.tags)
    ? group.tags.map((tag: unknown) => String(tag))
    : Array.isArray(group?.topics)
    ? group.topics.map((topic: unknown) => String(topic))
    : []
  const memberCount =
    group?.member_count ??
    group?.members_count ??
    (Array.isArray(group?.members) ? group.members.length : undefined) ??
    0;
  const maxMembers = group?.max_members ?? group?.member_limit ?? group?.capacity;
  return {
    id: backendId && Number.isFinite(backendId) ? String(backendId) : String(group?.slug ?? fallbackId("group")),
    backendId: Number.isFinite(backendId) ? backendId : undefined,
    name: group?.name ?? group?.title ?? "Untitled Group",
    description: group?.description ?? group?.summary ?? "No description provided yet.",
    avatar: group?.avatar ?? group?.image ?? group?.icon ?? undefined,
    privacy: derivePrivacy(group),
    memberCount,
    maxMembers: typeof maxMembers === "number" && Number.isFinite(maxMembers) ? maxMembers : undefined,
    category: group?.category ?? group?.topic ?? "General",
    tags,
    createdAt: group?.created_at ?? group?.createdAt ?? undefined,
    owner: {}
      id: owner?.id ? String(owner.id) : fallbackId("user"),
      name: ownerName,
      avatar: owner?.avatar ?? owner?.image ?? undefined,
    },
    isOwner: Boolean(group?.is_owner ?? membership?.role === "owner"),
    isMember: Boolean(group?.is_member ?? membership?.role),
    role: membership?.role as Group["role"],
  }
}

const parseGroupId = (groupId: string): number | null => {}
  const numeric = Number.parseInt(groupId, 10)
  return Number.isNaN(numeric) ? null : numeric;
}

export default function GroupManagementSystem() {
  const { toast } = useToast()
  const [groups, setGroups] = useState<Group[]>([])
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [isCreatingGroup, setIsCreatingGroup] = useState(false)
  const [isFetchingGroups, setIsFetchingGroups] = useState(true)
  const [isFetchingMembers, setIsFetchingMembers] = useState(false)
  const [groupsError, setGroupsError] = useState<string | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const loadGroups = useCallback(async () => {
    if (typeof socialAPI.getGroups !== "function") {
      setGroups([])
      setGroupsError("Social API is not available in this environment.")
      setIsFetchingGroups(false)
      return;
    }

    setIsFetchingGroups(true)
    setGroupsError(null)

    try {
      const response = await socialAPI.getGroups({ page: 1 })
      const results = extractCollection(response)
      setGroups(results.map((group) => normalizeGroup(group)))
    } } catch {
      console.error("Failed to load groups", error)
      setGroups([])
      setGroupsError("Failed to load groups. Please try again.")
      toast({}
        title: "Error",
        description: "Unable to load groups from the server. Please try again.",
        variant: "destructive",
      })
    } finally {}
      setIsFetchingGroups(false)
    }
  }, [toast])

  useEffect(() => {
    loadGroups()
  }, [loadGroups])

  const categories = useMemo(() => {}
    const categorySet = new Set(DEFAULT_CATEGORIES)
    groups.forEach((group) => {}
      if (group.category) {
        categorySet.add(group.category)
      }
    })
    return Array.from(categorySet)
  }, [groups])

  const upsertGroup = useCallback((group: Group) => {}
    setGroups((prev) => {}
      const exists = prev.some((existing) => existing.id === group.id)
      if (exists) {
        return prev.map((existing) => (existing.id === group.id ? group : existing))
      }
      return [group, ...prev]
    })
  }, [])

  const refreshGroup = useCallback(
    async (groupId: string, fallbackId?: number) => {}
      if (typeof socialAPI.getGroup !== "function") {
        return null;
      }

      const numericId =
        parseGroupId(groupId) ?? (typeof fallbackId === "number" && Number.isFinite(fallbackId) ? fallbackId : null)
      if (numericId === null) {
        return null;
      }

      try {
        const detail = await socialAPI.getGroup(numericId)
        const normalized = normalizeGroup(detail)
        upsertGroup(normalized)
        return { normalized, detail }
      } } catch {
        console.error(`Failed to refresh group ${groupId}`, error)
        return null;
      }
    },
    [upsertGroup],
  )

  const handleCreateGroup = async (formData: FormData) => {}
    if (typeof socialAPI.createGroup !== "function") {
      toast({}
        title: "Unavailable",
        description: "Creating groups is not available in this environment.",
        variant: "destructive",
      })
      return;
    }

    const name = (formData.get("name") as string) ?? ""
    const description = (formData.get("description") as string) ?? ""
    const privacy = (formData.get("privacy") as Group["privacy"]) ?? "public"
    const category = (formData.get("category") as string) ?? ""
    const rawTags = (formData.get("tags") as string) ?? ""
    const maxMembersRaw = formData.get("maxMembers")

    const tags = rawTags;
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
    const maxMembersValue =
      typeof maxMembersRaw === "string" && maxMembersRaw.length > 0;
        ? Number.parseInt(maxMembersRaw, 10)
        : undefined;
    setIsCreatingGroup(true)
    try {
      const isPublic = privacy === "public"
      const payload = { name,
        description,
        is_public: isPublic,
        category: category || undefined,
        tags: tags.length ? tags : undefined,
        max_members:
          typeof maxMembersValue === "number" && !Number.isNaN(maxMembersValue) ? maxMembersValue : undefined,
        requires_invite: privacy === "invite-only" ? true : undefined,
        privacy: !isPublic ? privacy : undefined,
      }

      const created = await socialAPI.createGroup(payload)
      let normalized = normalizeGroup(created)

      if (tags.length && normalized.tags.length === 0) {
        normalized = { ...normalized, tags }
      }

      if (
        typeof maxMembersValue === "number" &&
        !Number.isNaN(maxMembersValue) &&
        typeof normalized.maxMembers !== "number"
      ) {}
        normalized = { ...normalized, maxMembers: maxMembersValue }
      }

      if (!normalized.privacy && !isPublic) {
        normalized = { ...normalized, privacy }
      }

      upsertGroup(normalized)
      setShowCreateDialog(false)

      if (normalized.id) {
        await refreshGroup(normalized.id, normalized.backendId)
      }

      toast({}
        title: "Group Created",
        description: "Your group has been created successfully!",
      })
    } } catch {
      console.error("Failed to create group", error)
      toast({}
        title: "Error",
        description: "Failed to create group. Please try again.",
        variant: "destructive",
      })
    } finally {}
      setIsCreatingGroup(false)
    }
  }

  const handleJoinGroup = async (group: Group) => {}
    const numericId =
      typeof group.backendId === "number" && Number.isFinite(group.backendId)
        ? group.backendId;
        : parseGroupId(group.id)
    if (numericId === null || typeof socialAPI.joinGroup !== "function") {
      toast({}
        title: "Error",
        description: "Joining this group is not available right now.",
        variant: "destructive",
      })
      return;
    }

    try {
      await socialAPI.joinGroup(numericId)
      const result = await refreshGroup(group.id, group.backendId)

      if (result && selectedGroup?.id === result.normalized.id) {
        setSelectedGroup(result.normalized)
        const members = extractCollection((result.detail as Record<string, unknown>)?.members).map((member) => normalizeGroupMember(member))
        setGroupMembers(members)
      }

      toast({}
        title: "Joined Group",
        description: "You have successfully joined the group!",
      })
    } } catch {
      console.error(`Failed to join group ${group.id}`, error)
      toast({}
        title: "Error",
        description: "Failed to join group. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleLeaveGroup = async (group: Group) => {}
    const numericId =
      typeof group.backendId === "number" && Number.isFinite(group.backendId)
        ? group.backendId;
        : parseGroupId(group.id)
    if (numericId === null || typeof socialAPI.leaveGroup !== "function") {
      toast({}
        title: "Error",
        description: "Leaving this group is not available right now.",
        variant: "destructive",
      })
      return;
    }

    try {
      await socialAPI.leaveGroup(numericId)
      const result = await refreshGroup(group.id, group.backendId)

      if (result && selectedGroup?.id === result.normalized.id) {
        setSelectedGroup(result.normalized)
        const members = extractCollection((result.detail as Record<string, unknown>)?.members).map((member) => normalizeGroupMember(member))
        setGroupMembers(members)
      }

      toast({}
        title: "Left Group",
        description: "You have left the group.",
      })
    } } catch {
      console.error(`Failed to leave group ${group.id}`, error)
      toast({}
        title: "Error",
        description: "Failed to leave group. Please try again.",
        variant: "destructive",
      })
    }
  }

  // TODO: Add socialAPI member management once `/api/social/groups/<group_id>/members/<member_id>/` is exposed.
  const handleRoleChange = async (_memberId: string, _newRole: string) => {}
    toast({}
      title: "Action unavailable",
      description: "Updating member roles requires a backend endpoint (\"/api/social/groups/<group_id>/members/<member_id>/\&quot;).&quot;,
    })
  }

  const handleRemoveMember = async (_memberId: string) => {}
    toast({}
      title: "Action unavailable",
      description: "Removing members requires backend support for member management.",
    })
  }

  const handleOpenGroup = async (group: Group) => {}
    setSelectedGroup(group)
    setGroupMembers([])

    if (typeof socialAPI.getGroup !== "function") {
      toast({}
        title: "Unavailable",
        description: "Group details are not available in this environment.",
        variant: "destructive",
      })
      return;
    }

    setIsFetchingMembers(true)
    try {
      const result = await refreshGroup(group.id, group.backendId)
      if (result) {
        setSelectedGroup(result.normalized)
        const members = extractCollection((result.detail as Record<string, unknown>)?.members).map((member) => normalizeGroupMember(member))
        setGroupMembers(members)
      }
    } } catch {
      console.error(`Failed to load group ${group.id}`, error)
      toast({}
        title: "Error",
        description: "Failed to load group details. Please try again.",
        variant: "destructive",
      })
    } finally {}
      setIsFetchingMembers(false)
    }
  }

  const normalizedQuery = searchQuery.trim().toLowerCase()

  const filteredGroups = groups.filter((group) => {}
    const matchesSearch =
      group.name.toLowerCase().includes(normalizedQuery) ||
      (group.description ?? "").toLowerCase().includes(normalizedQuery)
    const matchesCategory = categoryFilter === "all" || group.category === categoryFilter;
    return matchesSearch && matchesCategory;
  })

  const getRoleIcon = (role: string) => {}
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

  const getPrivacyIcon = (privacy: string) => {}
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
              Create Group;
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Group</DialogTitle>
              <DialogDescription>Create a new group for watch parties and discussions</DialogDescription>
            </DialogHeader>

            <form;
              onSubmit={(e) => {}
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
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
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
                  Cancel;
                </Button>
                <Button type="submit" disabled={isCreatingGroup}>
                  {isCreatingGroup ? "Creating..." : "Create Group"}
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
            <Input;
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
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Groups Grid */}
      {groupsError && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {groupsError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isFetchingGroups ? (
          <div className="col-span-full flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="col-span-full rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            No groups found. Try adjusting your filters or create a new group.
          </div>
        ) : (
          filteredGroups.map((group) => (
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
              <CardDescription className="line-clamp-2">
                {group.description || "No description provided."}
              </CardDescription>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>
                    {group.memberCount}
                    {typeof group.maxMembers === "number" ? `/${group.maxMembers}` : ""} members;
                  </span>
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

              <div className="flex flex-col gap-2">
                <Button variant="outline" size="sm" onClick={() => handleOpenGroup(group)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details;
                </Button>

                <div className="flex gap-2">
                  {group.isMember ? (
                    <>
                      <Button size="sm" className="flex-1">
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Chat;
                      </Button>
                      {!group.isOwner && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              Leave;
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
                              <AlertDialogAction onClick={() => handleLeaveGroup(group)}>
                                Leave Group;
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </>
                  ) : (
                    <Button size="sm" className="flex-1" onClick={() => handleJoinGroup(group)}>
                      <UserPlus className="mr-2 h-4 w-4" />
                      {group.privacy === "invite-only" ? "Request to Join" : "Join Group"}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
        )}
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
                {isFetchingMembers ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : groupMembers.length > 0 ? (
                  <div className="space-y-4">
                    {groupMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between rounded-lg border p-4">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={member.user.avatar || "/placeholder.svg"} />
                            <AvatarFallback>{member.user.name?.charAt(0) ?? &quot;?&quot;}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{member.user.name}</span>
                              {getRoleIcon(member.role)}
                              <Badge variant="outline" className="text-xs capitalize">
                                {member.role}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {member.user.email ?? "No email provided"}
                            </p>
                          </div>
                        </div>

                        {selectedGroup.isOwner && member.role !== "owner" && (
                          <div className="flex items-center gap-2">
                            <Select;
                              value={member.role}
                              disabled;
                              onValueChange={(value) => handleRoleChange(member.id, value)}
                            >
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
                                    Removing members requires backend support. This action is currently unavailable.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Close</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleRemoveMember(member.id)}>
                                    Acknowledge;
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                    No members found for this group yet.
                  </div>
                )}
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
