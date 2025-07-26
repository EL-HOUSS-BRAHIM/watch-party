"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import {
  Clock,
  Users,
  Calendar,
  Star,
  Download,
  Filter,
  Search,
  Eye,
  MessageCircle,
  Heart,
  Share2,
  MoreHorizontal,
  TrendingUp,
  Award,
  Timer,
  Play,
  Pause,
  Film,
  Tv,
  Globe,
  Lock,
  Loader2,
  CalendarDays,
  BarChart3,
  FileText,
  ExternalLink
} from "lucide-react"
import { formatDistanceToNow, format, parseISO, isThisMonth, isThisYear } from "date-fns"

interface PartyParticipant {
  id: string
  user: {
    id: string
    username: string
    first_name: string
    last_name: string
    avatar?: string
  }
  joined_at: string
  left_at?: string
  was_host: boolean
  watch_time_minutes: number
  messages_sent: number
  reactions_sent: number
}

interface PartyStats {
  total_watch_time: number
  peak_concurrent_users: number
  total_messages: number
  total_reactions: number
  completion_rate: number
  average_rating?: number
}

interface PartyHistory {
  id: string
  title: string
  description?: string
  video: {
    id: string
    title: string
    thumbnail?: string
    duration_minutes: number
    type: "movie" | "series" | "youtube"
  }
  created_at: string
  started_at?: string
  ended_at?: string
  status: "scheduled" | "active" | "completed" | "cancelled"
  is_public: boolean
  participants: PartyParticipant[]
  stats: PartyStats
  host: {
    id: string
    username: string
    first_name: string
    last_name: string
    avatar?: string
  }
  created_by_user: boolean
  participant_count: number
  rating?: number
}

interface FilterOptions {
  timeRange: "all" | "week" | "month" | "year"
  status: "all" | "completed" | "cancelled"
  role: "all" | "host" | "participant"
  videoType: "all" | "movie" | "series" | "youtube"
}

export default function PartyHistoryPage() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [parties, setParties] = useState<PartyHistory[]>([])
  const [filteredParties, setFilteredParties] = useState<PartyHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<FilterOptions>({
    timeRange: "all",
    status: "all",
    role: "all",
    videoType: "all"
  })
  const [selectedParty, setSelectedParty] = useState<PartyHistory | null>(null)
  const [showStats, setShowStats] = useState(false)

  const { register, watch } = useForm({
    defaultValues: { search: "" }
  })

  const searchValue = watch("search")

  useEffect(() => {
    loadPartyHistory()
  }, [])

  useEffect(() => {
    filterParties()
  }, [parties, searchQuery, filters])

  const loadPartyHistory = async () => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch("/api/parties/history/", {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setParties(data.results || data.parties || [])
      } else {
        toast({
          title: "Error",
          description: "Failed to load party history.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to load party history:", error)
      toast({
        title: "Error",
        description: "Something went wrong while loading your history.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterParties = () => {
    let filtered = [...parties]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(party =>
        party.title.toLowerCase().includes(query) ||
        party.video.title.toLowerCase().includes(query) ||
        party.description?.toLowerCase().includes(query)
      )
    }

    // Time range filter
    if (filters.timeRange !== "all") {
      const now = new Date()
      filtered = filtered.filter(party => {
        const partyDate = parseISO(party.created_at)
        switch (filters.timeRange) {
          case "week":
            return now.getTime() - partyDate.getTime() <= 7 * 24 * 60 * 60 * 1000
          case "month":
            return isThisMonth(partyDate)
          case "year":
            return isThisYear(partyDate)
          default:
            return true
        }
      })
    }

    // Status filter
    if (filters.status !== "all") {
      filtered = filtered.filter(party => party.status === filters.status)
    }

    // Role filter
    if (filters.role !== "all") {
      filtered = filtered.filter(party => {
        if (filters.role === "host") {
          return party.created_by_user
        } else {
          return !party.created_by_user
        }
      })
    }

    // Video type filter
    if (filters.videoType !== "all") {
      filtered = filtered.filter(party => party.video.type === filters.videoType)
    }

    setFilteredParties(filtered)
  }

  const calculateTotalStats = () => {
    const completedParties = parties.filter(p => p.status === "completed")
    
    return {
      totalParties: parties.length,
      completedParties: completedParties.length,
      totalWatchTime: completedParties.reduce((sum, p) => sum + p.stats.total_watch_time, 0),
      averageRating: completedParties.reduce((sum, p) => sum + (p.rating || 0), 0) / completedParties.length || 0,
      hostedParties: parties.filter(p => p.created_by_user).length,
      joinedParties: parties.filter(p => !p.created_by_user).length,
    }
  }

  const exportHistory = () => {
    const csvContent = [
      ["Date", "Title", "Video", "Status", "Role", "Duration (min)", "Participants", "Rating"].join(","),
      ...filteredParties.map(party => [
        format(parseISO(party.created_at), "yyyy-MM-dd"),
        `"${party.title}"`,
        `"${party.video.title}"`,
        party.status,
        party.created_by_user ? "Host" : "Participant",
        party.stats.total_watch_time,
        party.participant_count,
        party.rating || ""
      ].join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `watch-party-history-${format(new Date(), "yyyy-MM-dd")}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Export Complete",
      description: "Your party history has been exported successfully.",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "active":
        return "bg-blue-100 text-blue-800"
      case "scheduled":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getVideoTypeIcon = (type: string) => {
    switch (type) {
      case "movie":
        return <Film className="h-4 w-4" />
      case "series":
        return <Tv className="h-4 w-4" />
      case "youtube":
        return <Play className="h-4 w-4" />
      default:
        return <Film className="h-4 w-4" />
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const stats = calculateTotalStats()

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading your party history...</p>
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
              <Clock className="h-8 w-8" />
              Party History
            </h1>
            <p className="text-gray-600 mt-2">Your watch party timeline and statistics</p>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowStats(!showStats)}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Stats
            </Button>
            <Button variant="outline" onClick={exportHistory}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        {showStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalParties}</div>
                <div className="text-sm text-gray-600">Total Parties</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{formatDuration(stats.totalWatchTime)}</div>
                <div className="text-sm text-gray-600">Watch Time</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.hostedParties}</div>
                <div className="text-sm text-gray-600">Hosted</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "N/A"}
                </div>
                <div className="text-sm text-gray-600">Avg Rating</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search parties, videos, or descriptions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filter dropdowns */}
              <div className="flex gap-2">
                <Select
                  value={filters.timeRange}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, timeRange: value as any }))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.status}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, status: value as any }))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.role}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, role: value as any }))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="host">Hosted</SelectItem>
                    <SelectItem value="participant">Joined</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Party List */}
        <div className="space-y-4">
          {filteredParties.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No parties found</h3>
                <p className="text-gray-600">
                  {searchQuery || Object.values(filters).some(f => f !== "all")
                    ? "Try adjusting your search or filters"
                    : "You haven't joined any watch parties yet"
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredParties.map((party) => (
              <Card key={party.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        {/* Video thumbnail */}
                        <div className="w-16 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                          {party.video.thumbnail ? (
                            <img
                              src={party.video.thumbnail}
                              alt={party.video.title}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            getVideoTypeIcon(party.video.type)
                          )}
                        </div>

                        {/* Party details */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-lg">{party.title}</h3>
                              <p className="text-gray-600">{party.video.title}</p>
                            </div>
                            <Badge className={getStatusColor(party.status)}>
                              {party.status}
                            </Badge>
                          </div>

                          {party.description && (
                            <p className="text-gray-600 text-sm mb-3">{party.description}</p>
                          )}

                          {/* Metadata */}
                          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {format(parseISO(party.created_at), "MMM d, yyyy")}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {party.participant_count} participants
                            </span>
                            <span className="flex items-center gap-1">
                              <Timer className="h-4 w-4" />
                              {formatDuration(party.stats.total_watch_time)}
                            </span>
                            {party.rating && (
                              <span className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                {party.rating.toFixed(1)}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              {party.is_public ? (
                                <Globe className="h-4 w-4" />
                              ) : (
                                <Lock className="h-4 w-4" />
                              )}
                              {party.is_public ? "Public" : "Private"}
                            </span>
                          </div>

                          {/* Host info */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Avatar className="w-6 h-6">
                                <AvatarImage src={party.host.avatar} />
                                <AvatarFallback className="text-xs">
                                  {party.host.first_name?.[0] || party.host.username?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">
                                {party.created_by_user ? "You hosted" : `Hosted by ${party.host.first_name || party.host.username}`}
                              </span>
                            </div>

                            {/* Quick stats */}
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <MessageCircle className="h-4 w-4" />
                                {party.stats.total_messages}
                              </span>
                              <span className="flex items-center gap-1">
                                <Heart className="h-4 w-4" />
                                {party.stats.total_reactions}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedParty(selectedParty?.id === party.id ? null : party)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Expanded details */}
                      {selectedParty?.id === party.id && (
                        <div className="mt-4 pt-4 border-t">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Statistics */}
                            <div>
                              <h4 className="font-medium mb-2">Statistics</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span>Peak concurrent viewers:</span>
                                  <span>{party.stats.peak_concurrent_users}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Completion rate:</span>
                                  <span>{party.stats.completion_rate}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Total messages:</span>
                                  <span>{party.stats.total_messages}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Total reactions:</span>
                                  <span>{party.stats.total_reactions}</span>
                                </div>
                              </div>
                            </div>

                            {/* Participants */}
                            <div>
                              <h4 className="font-medium mb-2">Participants ({party.participants.length})</h4>
                              <div className="space-y-2 max-h-32 overflow-y-auto">
                                {party.participants.slice(0, 5).map((participant) => (
                                  <div key={participant.id} className="flex items-center gap-2 text-sm">
                                    <Avatar className="w-5 h-5">
                                      <AvatarImage src={participant.user.avatar} />
                                      <AvatarFallback className="text-xs">
                                        {participant.user.first_name?.[0] || participant.user.username?.[0]}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="flex-1">
                                      {participant.user.first_name || participant.user.username}
                                      {participant.was_host && (
                                        <Badge variant="outline" className="ml-2 text-xs">Host</Badge>
                                      )}
                                    </span>
                                    <span className="text-gray-500">
                                      {formatDuration(participant.watch_time_minutes)}
                                    </span>
                                  </div>
                                ))}
                                {party.participants.length > 5 && (
                                  <div className="text-xs text-gray-500 text-center">
                                    +{party.participants.length - 5} more participants
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Timeline */}
                          {party.started_at && (
                            <div className="mt-4">
                              <h4 className="font-medium mb-2">Timeline</h4>
                              <div className="text-sm text-gray-600 space-y-1">
                                <div>Created: {format(parseISO(party.created_at), "MMM d, yyyy 'at' h:mm a")}</div>
                                <div>Started: {format(parseISO(party.started_at), "MMM d, yyyy 'at' h:mm a")}</div>
                                {party.ended_at && (
                                  <div>Ended: {format(parseISO(party.ended_at), "MMM d, yyyy 'at' h:mm a")}</div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Pagination placeholder */}
        {filteredParties.length > 20 && (
          <div className="text-center mt-8">
            <Button variant="outline">Load More Parties</Button>
          </div>
        )}
      </div>
    </div>
  )
}
