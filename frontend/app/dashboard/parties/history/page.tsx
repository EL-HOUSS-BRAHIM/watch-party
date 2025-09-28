"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import WatchPartyTable from "@/components/ui/watch-party-table"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import {
  History,
  Users,
  Clock,
  Play,
  Star,
  Download,
  Eye,
  Search,
  Share2,
  Loader2,
  ArrowLeft,
  RefreshCw,
} from "lucide-react"
import { format, parseISO } from "date-fns"

interface PartyHistoryItem {
  id: string
  title: string
  description?: string
  video: {
    id: string
    title: string
    thumbnail?: string
    duration: number
  }
  host: {
    id: string
    username: string
    firstName: string
    lastName: string
    avatar?: string
  }
  scheduledFor: string
  startedAt?: string
  endedAt?: string
  status: "completed" | "cancelled" | "abandoned"
  participants: Array<{
    id: string
    user: {
      id: string
      username: string
      firstName: string
      lastName: string
      avatar?: string
    }
    joinedAt: string
    leftAt?: string
    watchTime: number
  }>
  stats: {
    totalParticipants: number
    averageWatchTime: number
    completionRate: number
    peakViewers: number
    totalMessages: number
    totalReactions: number
  }
  rating?: number
  tags: string[]
  isPrivate: boolean
  createdAt: string
}

interface FilterOptions {
  status: string
  dateRange: string
  minParticipants: string
  rating: string
  search: string
}

export default function PartyHistoryPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const [parties, setParties] = useState<PartyHistoryItem[]>([])
  const [filteredParties, setFilteredParties] = useState<PartyHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [filters, setFilters] = useState<FilterOptions>({
    status: "all",
    dateRange: "all",
    minParticipants: "all",
    rating: "all",
    search: "",
  })

  const [stats, setStats] = useState({
    totalParties: 0,
    totalWatchTime: 0,
    averageParticipants: 0,
    averageRating: 0,
    completionRate: 0,
    mostWatchedGenre: "",
  })

  useEffect(() => {
    loadPartyHistory()
  }, [])

  useEffect(() => {
    filterParties()
  }, [parties, filters, activeTab])

  const loadPartyHistory = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch("/api/parties/history/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setParties(data.results || data.parties || [])
        setStats(data.stats || stats)
      } else {
        throw new Error("Failed to load party history")
      }
    } catch {
      console.error("Failed to load party history:", error)
      toast({
        title: "Error",
        description: "Failed to load party history. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterParties = () => {
    let filtered = [...parties]

    // Tab filter
    if (activeTab === "hosted") {
      filtered = filtered.filter((party) => party.host.id === user?.id)
    } else if (activeTab === "joined") {
      filtered = filtered.filter(
        (party) => party.participants.some((p) => p.user.id === user?.id) && party.host.id !== user?.id,
      )
    }

    // Status filter
    if (filters.status !== "all") {
      filtered = filtered.filter((party) => party.status === filters.status)
    }

    // Date range filter
    if (filters.dateRange !== "all") {
      const now = new Date()
      const filterDate = new Date()

      switch (filters.dateRange) {
        case "week":
          filterDate.setDate(now.getDate() - 7)
          break
        case "month":
          filterDate.setMonth(now.getMonth() - 1)
          break
        case "quarter":
          filterDate.setMonth(now.getMonth() - 3)
          break
        case "year":
          filterDate.setFullYear(now.getFullYear() - 1)
          break
      }

      filtered = filtered.filter((party) => new Date(party.createdAt) >= filterDate)
    }

    // Minimum participants filter
    if (filters.minParticipants !== "all") {
      const minCount = Number.parseInt(filters.minParticipants)
      filtered = filtered.filter((party) => party.stats.totalParticipants >= minCount)
    }

    // Rating filter
    if (filters.rating !== "all") {
      const minRating = Number.parseInt(filters.rating)
      filtered = filtered.filter((party) => party.rating && party.rating >= minRating)
    }

    // Search filter
    if (filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(
        (party) =>
          party.title.toLowerCase().includes(searchTerm) ||
          party.video.title.toLowerCase().includes(searchTerm) ||
          party.host.username.toLowerCase().includes(searchTerm) ||
          party.tags.some((tag) => tag.toLowerCase().includes(searchTerm)),
      )
    }

    setFilteredParties(filtered)
  }

  const exportHistory = async () => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch("/api/parties/history/export/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `party-history-${new Date().toISOString().split("T")[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)

        toast({
          title: "Export Complete",
          description: "Your party history has been exported successfully.",
        })
      }
    } catch {
      console.error("Failed to export history:", error)
      toast({
        title: "Export Failed",
        description: "Failed to export party history.",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>
      case "abandoned":
        return <Badge className="bg-yellow-100 text-yellow-800">Abandoned</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const tableColumns = [
    {
      id: "title",
      header: "Party",
      accessorKey: "title" as keyof PartyHistoryItem,
      cell: ({ row }: { row: PartyHistoryItem }) => (
        <div className="flex items-center gap-3">
          <img
            src={row.video.thumbnail || "/placeholder.svg"}
            alt={row.video.title}
            className="w-12 h-8 object-cover rounded"
          />
          <div>
            <div className="font-medium">{row.title}</div>
            <div className="text-sm text-muted-foreground">{row.video.title}</div>
          </div>
        </div>
      ),
    },
    {
      id: "host",
      header: "Host",
      cell: ({ row }: { row: PartyHistoryItem }) => (
        <div className="flex items-center gap-2">
          <Avatar className="w-6 h-6">
            <AvatarImage src={row.host.avatar || "/placeholder.svg"} />
            <AvatarFallback className="text-xs">
              {row.host.firstName[0]}
              {row.host.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm">
            {row.host.firstName} {row.host.lastName}
          </span>
        </div>
      ),
    },
    {
      id: "date",
      header: "Date",
      accessorKey: "scheduledFor" as keyof PartyHistoryItem,
      cell: ({ row }: { row: PartyHistoryItem }) => (
        <div className="text-sm">
          <div>{format(parseISO(row.scheduledFor), &quot;MMM dd, yyyy&quot;)}</div>
          <div className="text-muted-foreground">{format(parseISO(row.scheduledFor), &quot;h:mm a&quot;)}</div>
        </div>
      ),
    },
    {
      id: "participants",
      header: "Participants",
      cell: ({ row }: { row: PartyHistoryItem }) => (
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span>{row.stats.totalParticipants}</span>
        </div>
      ),
    },
    {
      id: "duration",
      header: "Duration",
      cell: ({ row }: { row: PartyHistoryItem }) => (
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span>{formatDuration(row.stats.averageWatchTime)}</span>
        </div>
      ),
    },
    {
      id: "rating",
      header: "Rating",
      cell: ({ row }: { row: PartyHistoryItem }) =>
        row.rating ? (
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span>{row.rating.toFixed(1)}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }: { row: PartyHistoryItem }) => getStatusBadge(row.status),
    },
  ]

  const tableActions = [
    {
      id: "view",
      label: "View Details",
      icon: <Eye className="w-4 h-4" />,
      onClick: (party: PartyHistoryItem) => router.push(`/dashboard/parties/${party.id}/analytics`),
    },
    {
      id: "share",
      label: "Share",
      icon: <Share2 className="w-4 h-4" />,
      onClick: (party: PartyHistoryItem) => {
        navigator.clipboard.writeText(`${window.location.origin}/parties/${party.id}`)
        toast({
          title: "Link Copied",
          description: "Party link copied to clipboard.",
        })
      },
    },
  ]

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading party history...</p>
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
          <Button variant="ghost" onClick={() => router.back()} className=&quot;p-2&quot;>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <History className="h-8 w-8" />
              Party History
            </h1>
            <p className="text-muted-foreground mt-2">View and analyze your past watch parties</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={loadPartyHistory}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" onClick={exportHistory}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalParties}</div>
              <div className="text-sm text-muted-foreground">Total Parties</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{formatDuration(stats.totalWatchTime)}</div>
              <div className="text-sm text-muted-foreground">Watch Time</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.averageParticipants.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground">Avg Participants</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.averageRating.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground">Avg Rating</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{(stats.completionRate * 100).toFixed(0)}%</div>
              <div className="text-sm text-muted-foreground">Completion Rate</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.mostWatchedGenre || &quot;N/A&quot;}</div>
              <div className="text-sm text-muted-foreground">Top Genre</div>
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
                    placeholder="Search parties..."
                    value={filters.search}
                    onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filter dropdowns */}
              <div className="flex gap-2">
                <Select
                  value={filters.status}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="abandoned">Abandoned</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.dateRange}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, dateRange: value }))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="quarter">Last 3 Months</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.minParticipants}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, minParticipants: value }))}
                >
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Size</SelectItem>
                    <SelectItem value="2">2+ Participants</SelectItem>
                    <SelectItem value="5">5+ Participants</SelectItem>
                    <SelectItem value="10">10+ Participants</SelectItem>
                    <SelectItem value="20">20+ Participants</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.rating}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, rating: value }))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Rating</SelectItem>
                    <SelectItem value="4">4+ Stars</SelectItem>
                    <SelectItem value="3">3+ Stars</SelectItem>
                    <SelectItem value="2">2+ Stars</SelectItem>
                    <SelectItem value="1">1+ Stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Parties ({parties.length})</TabsTrigger>
            <TabsTrigger value="hosted">Hosted ({parties.filter((p) => p.host.id === user?.id).length})</TabsTrigger>
            <TabsTrigger value="joined">
              Joined (
              {
                parties.filter(
                  (p) => p.participants.some((part) => part.user.id === user?.id) && p.host.id !== user?.id,
                ).length
              }
              )
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {filteredParties.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No parties found</h3>
                  <p className="text-muted-foreground">
                    {filters.search || Object.values(filters).some((f) => f !== &quot;all&quot;)
                      ? "Try adjusting your search or filters"
                      : activeTab === "hosted"
                        ? "You haven't hosted any parties yet"
                        : activeTab === "joined"
                          ? "You haven't joined any parties yet"
                          : "No party history available"}
                  </p>
                  <Button className="mt-4" onClick={() => router.push(&quot;/dashboard/parties/create&quot;)}>
                    <Play className="h-4 w-4 mr-2" />
                    Create Your First Party
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <WatchPartyTable
                data={filteredParties}
                columns={tableColumns}
                actions={tableActions}
                pagination={{
                  page: 1,
                  pageSize: 10,
                  total: filteredParties.length,
                  showSizeSelector: true,
                  pageSizeOptions: [10, 25, 50],
                }}
                exportable
                onExport={exportHistory}
                refreshable
                onRefresh={loadPartyHistory}
                className="bg-background"
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
