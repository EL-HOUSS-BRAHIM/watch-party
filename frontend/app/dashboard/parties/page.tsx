"use client"

import { Calendar, Clock, Copy, Edit, Eye, Filter, Grid, Link, List, Loader2, Lock, MoreVertical, Play, Plus, Search, Share, Trash, TrendingUp, User, Users, Video } from "lucide-react"
import { useState, useEffect , useCallback } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { format, formatDistanceToNow, isToday, isTomorrow, isYesterday } from "date-fns"

interface Party {}
  id: string
  name: string
  description: string
  roomCode: string
  thumbnail?: string
  host: {}
    id: string
    username: string
    firstName: string
    lastName: string
    avatar?: string
    isVerified: boolean
  }
  participants: Array<{}
    id: string
    username: string
    firstName: string
    lastName: string
    avatar?: string
  }>
  maxParticipants: number
  isPrivate: boolean
  requiresApproval: boolean
  status: "scheduled" | "active" | "ended" | "cancelled"
  scheduledFor?: string
  startedAt?: string
  endedAt?: string
  createdAt: string
  updatedAt: string
  tags: string[]
  videoTitle?: string
  videoThumbnail?: string
  videoDuration?: number
  analytics?: {}
    totalViews: number
    peakViewers: number
    averageWatchTime: number
    chatMessages: number
  }
}

interface FilterOptions {}
  status: "all" | "scheduled" | "active" | "ended"
  privacy: "all" | "public" | "private"
  role: "all" | "hosted" | "joined"
  sortBy: "created" | "scheduled" | "participants" | "name"
  sortOrder: "asc" | "desc"
}

export default function PartiesPage() {
  const [parties, setParties] = useState<Party[]>([])
  const [filteredParties, setFilteredParties] = useState<Party[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [filters, setFilters] = useState<FilterOptions>({}
    status: "all",
    privacy: "all",
    role: "all",
    sortBy: "created",
    sortOrder: "desc",
  })
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    loadParties()
  }, [activeTab])

  useEffect(() => {
    filterAndSortParties()
  }, [parties, searchQuery, filters])

  const loadParties = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("accessToken")
      let endpoint = "/api/parties/"

      // Add query parameters based on active tab
      const params = new URLSearchParams()
      if (activeTab === "hosted") {
        params.append("hosted", "true")
      } else if (activeTab === "joined") {
        params.append("joined", "true")
      } else if (activeTab === "scheduled") {
        params.append("status", "scheduled")
      } else if (activeTab === "active") {
        params.append("status", "active")
      }

      if (params.toString()) {}
        endpoint += `?${params.toString()}`
      }

      const response = await fetch(endpoint, {}
        headers: {}
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setParties(data.results || data)
      } else {}
        throw new Error("Failed to load parties")
      }
    } catch (err) {
      console.error("Failed to load parties:", error)
      toast({title: "Error",
        description: "Failed to load parties. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterAndSortParties = () => {}
    let filtered = [...parties]

    // Search filter
    if (searchQuery.trim()) {}
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (party) =>
          party.name.toLowerCase().includes(query) ||
          party.description.toLowerCase().includes(query) ||
          party.host.username.toLowerCase().includes(query) ||
          party.tags.some((tag) => tag.toLowerCase().includes(query)),
      )
    }

    // Status filter
    if (filters.status !== "all") {
      filtered = filtered.filter((party) => party.status === filters.status)
    }

    // Privacy filter
    if (filters.privacy !== "all") {
      filtered = filtered.filter((party) => (filters.privacy === "private" ? party.isPrivate : !party.isPrivate))
    }

    // Role filter
    if (filters.role !== "all") {
      filtered = filtered.filter((party) => {}
        if (filters.role === "hosted") {
          return party.host.id === user?.id
        } else if (filters.role === "joined") {
          return party.participants.some((p) => p.id === user?.id) && party.host.id !== user?.id
        }
        return true
      })
    }

    // Sort
    filtered.sort((a, b) => {}
      let aValue: unknown, bValue: unknown
      switch (filters.sortBy) {
        case "name":
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case "scheduled":
          aValue = a.scheduledFor ? new Date(a.scheduledFor).getTime() : 0
          bValue = b.scheduledFor ? new Date(b.scheduledFor).getTime() : 0
          break
        case "participants":
          aValue = a.participants.length
          bValue = b.participants.length
          break
        case "created":
        default:
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
          break
      }

      if (filters.sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {}
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredParties(filtered)
  }

  const joinParty = async (roomCode: string) => {}
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch("/api/parties/join-by-code/", {}
        method: "POST",
        headers: {}
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ room_code: roomCode }),
      })

      if (response.ok) {
        router.push(`/watch/${roomCode}`)
      } else {}
        const errorData = await response.json()
        toast({title: "Failed to Join",
          description: errorData.message || "Unable to join the party.",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Failed to join party:", error)
      toast({title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    }
  }

  const deleteParty = async (partyId: string) => {}
    if (!confirm("Are you sure you want to delete this party? This action cannot be undone.")) {}
      return
    }

    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`/api/parties/${partyId}/`, {}
        method: "DELETE",
        headers: {}
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setParties((prev) => prev.filter((p) => p.id !== partyId))
        toast({title: "Party Deleted",
          description: "The party has been successfully deleted.",
        })
      } else {}
        throw new Error("Failed to delete party")
      }
    } catch (err) {
      console.error("Failed to delete party:", error)
      toast({title: "Error",
        description: "Failed to delete party. Please try again.",
        variant: "destructive",
      })
    }
  }

  const copyRoomCode = (roomCode: string) => {}
    navigator.clipboard.writeText(roomCode)
    toast({title: "Copied!",
      description: "Room code copied to clipboard.",
    })
  }

  const shareParty = async (party: Party) => {}
    const shareUrl = `${window.location.origin}/watch/${party.roomCode}`

    if (navigator.share) {
      try {
        await navigator.share({title: party.name,
          text: party.description,
          url: shareUrl,
        })
      } catch (err) {
        console.log("Share cancelled")
      }
    } else {}
      navigator.clipboard.writeText(shareUrl)
      toast({title: "Link Copied",
        description: "Party link copied to clipboard.",
      })
    }
  }

  const getStatusColor = (status: string) => {}
    switch (status) {
      case "active":
        return "bg-green-500 text-white"
      case "scheduled":
        return "bg-blue-500 text-white"
      case "ended":
        return "bg-gray-500 text-white"
      case "cancelled":
        return "bg-red-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const getStatusText = (status: string) => {}
    switch (status) {
      case "active":
        return "Live"
      case "scheduled":
        return "Scheduled"
      case "ended":
        return "Ended"
      case "cancelled":
        return "Cancelled"
      default:
        return status
    }
  }

  const formatScheduledTime = (scheduledFor: string) => {}
    const date = new Date(scheduledFor)

    if (isToday(date)) {}
      return `Today at ${format(date, "h:mm a")}`
    } else if (isTomorrow(date)) {}
      return `Tomorrow at ${format(date, "h:mm a")}`
    } else if (isYesterday(date)) {}
      return `Yesterday at ${format(date, "h:mm a")}`
    } else {}
      return format(date, "MMM d 'at' h:mm a")
    }
  }

  const isHost = (party: Party) => party.host.id === user?.id
  const isParticipant = (party: Party) => party.participants.some((p) => p.id === user?.id)

  const PartyCard = ({ party }: { party: Party }) => (
    <Card className="hover:shadow-lg transition-all duration-200 group">
      <CardContent className="p-0">
        {/* Thumbnail */}
        <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-t-lg overflow-hidden">
          {party.videoThumbnail ? (
            <img
              src={party.videoThumbnail || "/placeholder.svg"}
              alt={party.videoTitle || party.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Video className="h-12 w-12 text-muted-foreground" />
            </div>
          )}

          {/* Status Badge */}
          <div className="absolute top-2 left-2">
            <Badge className={cn("text-xs", getStatusColor(party.status))}>
              {party.status === "active" && <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse" />}
              {getStatusText(party.status)}
            </Badge>
          </div>

          {/* Privacy Badge */}
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="text-xs">
              {party.isPrivate ? (
                <>
                  <Lock className="w-3 h-3 mr-1" />
                  Private
                </>
              ) : (
                <>
                  <Globe className="w-3 h-3 mr-1" />
                  Public
                </>
              )}
            </Badge>
          </div>

          {/* Participants Count */}
          <div className="absolute bottom-2 right-2">
            <Badge variant="secondary" className="text-xs">
              <Users className="w-3 h-3 mr-1" />
              {party.participants.length}/{party.maxParticipants}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
              {party.name}
            </h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isHost(party) && (
                  <>
                    <DropdownMenuItem onClick={() => router.push(`/dashboard/parties/${party.id}/edit`)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Party
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push(`/dashboard/parties/${party.id}/analytics`)}>
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Analytics
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem onClick={() => copyRoomCode(party.roomCode)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Room Code
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => shareParty(party)}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Party
                </DropdownMenuItem>
                {isHost(party) && (
                  <DropdownMenuItem onClick={() => deleteParty(party.id)} className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Party
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {party.description && <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{party.description}</p>}

          {/* Host Info */}
          <div className="flex items-center gap-2 mb-3">
            <Avatar className="w-6 h-6">
              <AvatarImage src={party.host.avatar || "/placeholder.svg"} />
              <AvatarFallback className="text-xs">
                {party.host.firstName[0]}
                {party.host.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">
              by {party.host.firstName} {party.host.lastName}
            </span>
            {party.host.isVerified && (
              <Badge variant="secondary" className="text-xs">
                Verified
              </Badge>
            )}
          </div>

          {/* Timing Info */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
            {party.scheduledFor && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatScheduledTime(party.scheduledFor)}
              </div>
            )}
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {formatDistanceToNow(new Date(party.createdAt), { addSuffix: true })}
            </div>
          </div>

          {/* Tags */}
          {party.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {party.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
              {party.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{party.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Analytics (for host) */}
          {isHost(party) && party.analytics && (
            <div className="grid grid-cols-2 gap-2 mb-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {party.analytics.totalViews} views
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {party.analytics.peakViewers} peak
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            {party.status === "active" ? (
              <Button onClick={() => router.push(`/watch/${party.roomCode}`)} className="flex-1" size="sm">"
                <Play className="h-4 w-4 mr-2" />
                Join Live
              </Button>
            ) : party.status === "scheduled" ? (
              <Button variant="outline" className="flex-1 bg-transparent" size="sm" disabled>
                <Clock className="h-4 w-4 mr-2" />
                Scheduled
              </Button>
            ) : (
              <Button
                onClick={() => router.push(`/watch/${party.roomCode}`)}
                variant="outline"
                className="flex-1"
                size="sm"
              >
                <Eye className="h-4 w-4 mr-2" />
                View
              </Button>
            )}

            {!isParticipant(party) && !isHost(party) && party.status !== "ended" && (
              <Button onClick={() => joinParty(party.roomCode)} variant="outline" size="sm">
                <UserPlus className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const PartyListItem = ({ party }: { party: Party }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Thumbnail */}
          <div className="relative w-24 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded overflow-hidden flex-shrink-0">
            {party.videoThumbnail ? (
              <img
                src={party.videoThumbnail || "/placeholder.svg"}
                alt={party.videoTitle || party.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Video className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
            <Badge className={cn("absolute top-1 left-1 text-xs", getStatusColor(party.status))}>
              {getStatusText(party.status)}
            </Badge>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-1">
              <h3 className="font-semibold truncate pr-2">{party.name}</h3>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge variant="outline" className="text-xs">
                  {party.isPrivate ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Users className="w-3 h-3 mr-1" />
                  {party.participants.length}/{party.maxParticipants}
                </Badge>
              </div>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-1 mb-2">{party.description}</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Avatar className="w-4 h-4">
                    <AvatarImage src={party.host.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-xs">{party.host.firstName[0]}</AvatarFallback>
                  </Avatar>
                  {party.host.firstName} {party.host.lastName}
                </div>
                {party.scheduledFor && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatScheduledTime(party.scheduledFor)}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {party.status === "active" ? (
                  <Button onClick={() => router.push(`/watch/${party.roomCode}`)} size="sm">
                    <Play className="h-4 w-4 mr-1" />
                    Join
                  </Button>
                ) : (
                  <Button onClick={() => router.push(`/watch/${party.roomCode}`)} variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {isHost(party) && (
                      <DropdownMenuItem onClick={() => router.push(`/dashboard/parties/${party.id}/edit`)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => copyRoomCode(party.roomCode)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Code
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => shareParty(party)}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Users className="h-8 w-8" />
              Watch Parties
            </h1>
            <p className="text-muted-foreground mt-2">Manage and join watch parties with friends</p>
          </div>
          <Link href="/dashboard/parties/create">
            <Button size="lg" className="shadow-lg">
              <Plus className="h-5 w-5 mr-2" />
              Create Party
            </Button>
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search parties by name, description, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value as Record<string, unknown> }))}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="ended">Ended</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.privacy}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, privacy: value as Record<string, unknown> }))}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Privacy</SelectItem>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.sortBy}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, sortBy: value as Record<string, unknown> }))}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created">Created</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="participants">Participants</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center border rounded-md">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All Parties</TabsTrigger>
            <TabsTrigger value="hosted">Hosted by Me</TabsTrigger>
            <TabsTrigger value="joined">Joined</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            <TabsTrigger value="active">Live Now</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-6">
            {isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p>Loading parties...</p>
              </div>
            ) : filteredParties.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No parties found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery
                    ? "No parties match your search criteria."
                    : activeTab === "hosted"
                      ? "You haven't created any parties yet."
                      : activeTab === "joined"
                        ? "You haven't joined any parties yet."
                        : activeTab === "scheduled"
                          ? "No scheduled parties found."
                          : activeTab === "active"
                            ? "No live parties at the moment."
                            : "No parties available."}
                </p>
                {activeTab === "hosted" && (
                  <Link href="/dashboard/parties/create">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Party
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div
                className={cn(
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    : "space-y-4",
                )}
              >
                {filteredParties.map((party) =>
                  viewMode === "grid" ? (
                    <PartyCard key={party.id} party={party} />
                  ) : (
                    <PartyListItem key={party.id} party={party} />
                  ),
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Quick Stats */}
        {!isLoading && filteredParties.length > 0 && (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {filteredParties.filter((p) => p.status === "active").length}
                </div>
                <div className="text-sm text-muted-foreground">Live Now</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {filteredParties.filter((p) => p.status === "scheduled").length}
                </div>
                <div className="text-sm text-muted-foreground">Scheduled</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {filteredParties.filter((p) => p.host.id === user?.id).length}
                </div>
                <div className="text-sm text-muted-foreground">Hosted by You</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {}
                    filteredParties.filter((p) => p.participants.some((participant) => participant.id === user?.id))
                      .length
                  }
                </div>
                <div className="text-sm text-muted-foreground">Joined</div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
