"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Users,
  Clock,
  Play,
  Calendar,
  Settings,
  Share,
  Trash2,
  Edit,
} from "lucide-react"
import Link from "next/link"

// Mock data
const activeParties = [
  {
    id: "1",
    title: "Friday Movie Night",
    description: "Watching the latest Marvel movie together",
    participants: 8,
    maxParticipants: 15,
    status: "live",
    thumbnail: "/placeholder.svg?height=200&width=300",
    host: { name: "Sarah Johnson", avatar: "/placeholder.svg?height=32&width=32" },
    created_at: "2 hours ago",
    room_code: "MARVEL123",
    video: { title: "Spider-Man: No Way Home", duration: "2h 28m" },
  },
  {
    id: "2",
    title: "Documentary Series",
    description: "Educational content about space exploration",
    participants: 5,
    maxParticipants: 10,
    status: "scheduled",
    thumbnail: "/placeholder.svg?height=200&width=300",
    host: { name: "Mike Chen", avatar: "/placeholder.svg?height=32&width=32" },
    created_at: "Tomorrow 8:00 PM",
    room_code: "SPACE456",
    video: { title: "Cosmos: A Space-Time Odyssey", duration: "45m" },
  },
]

const pastParties = [
  {
    id: "3",
    title: "Comedy Night",
    description: "Stand-up comedy specials marathon",
    participants: 12,
    maxParticipants: 20,
    status: "ended",
    thumbnail: "/placeholder.svg?height=200&width=300",
    host: { name: "Alex Rivera", avatar: "/placeholder.svg?height=32&width=32" },
    created_at: "3 days ago",
    room_code: "COMEDY789",
    video: { title: "Dave Chappelle: The Closer", duration: "1h 12m" },
    duration: "2h 15m",
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "live":
      return "bg-accent-error text-white"
    case "scheduled":
      return "bg-accent-warning text-black"
    case "ended":
      return "bg-muted text-muted-foreground"
    default:
      return "bg-muted text-muted-foreground"
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case "live":
      return "LIVE"
    case "scheduled":
      return "SCHEDULED"
    case "ended":
      return "ENDED"
    default:
      return status.toUpperCase()
  }
}

export default function PartiesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("active")

  const filteredActiveParties = activeParties.filter(
    (party) =>
      party.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      party.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredPastParties = pastParties.filter(
    (party) =>
      party.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      party.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display">Watch Parties</h1>
          <p className="text-muted-foreground mt-2">Create and manage your synchronized viewing sessions</p>
        </div>
        <Button className="shadow-glow" asChild>
          <Link href="/dashboard/parties/create">
            <Plus className="w-4 h-4 mr-2" />
            Create Party
          </Link>
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search parties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="active">Active & Scheduled</TabsTrigger>
          <TabsTrigger value="past">Past Parties</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6">
          {filteredActiveParties.length === 0 ? (
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No active parties</h3>
                <p className="text-muted-foreground mb-6">
                  Create your first watch party to start streaming with friends
                </p>
                <Button asChild>
                  <Link href="/dashboard/parties/create">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Party
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredActiveParties.map((party) => (
                <Card
                  key={party.id}
                  className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-glow transition-all duration-300"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <CardTitle className="text-lg">{party.title}</CardTitle>
                          <Badge className={getStatusColor(party.status)}>{getStatusText(party.status)}</Badge>
                        </div>
                        <CardDescription className="line-clamp-2">{party.description}</CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Party
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Share className="w-4 h-4 mr-2" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Settings className="w-4 h-4 mr-2" />
                            Settings
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Thumbnail */}
                    <div className="relative">
                      <img
                        src={party.thumbnail || "/placeholder.svg"}
                        alt={party.title}
                        className="w-full h-40 rounded-lg object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <Play className="w-8 h-8 text-white" />
                      </div>
                    </div>

                    {/* Video Info */}
                    <div className="space-y-2">
                      <p className="font-medium text-sm">{party.video.title}</p>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{party.video.duration}</span>
                        <span>Code: {party.room_code}</span>
                      </div>
                    </div>

                    {/* Host and Participants */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={party.host.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{party.host.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground">{party.host.name}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>
                          {party.participants}/{party.maxParticipants}
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button className="w-full" variant={party.status === "live" ? "default" : "secondary"} asChild>
                      <Link href={`/watch/${party.id}`}>
                        {party.status === "live" ? (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Join Party
                          </>
                        ) : (
                          <>
                            <Calendar className="w-4 h-4 mr-2" />
                            View Details
                          </>
                        )}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-6">
          {filteredPastParties.length === 0 ? (
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No past parties</h3>
                <p className="text-muted-foreground">Your completed watch parties will appear here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPastParties.map((party) => (
                <Card key={party.id} className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <CardTitle className="text-lg">{party.title}</CardTitle>
                          <Badge className={getStatusColor(party.status)}>{getStatusText(party.status)}</Badge>
                        </div>
                        <CardDescription className="line-clamp-2">{party.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Thumbnail */}
                    <div className="relative opacity-75">
                      <img
                        src={party.thumbnail || "/placeholder.svg"}
                        alt={party.title}
                        className="w-full h-40 rounded-lg object-cover"
                      />
                    </div>

                    {/* Video Info */}
                    <div className="space-y-2">
                      <p className="font-medium text-sm">{party.video.title}</p>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Duration: {party.duration}</span>
                        <span>{party.participants} participants</span>
                      </div>
                    </div>

                    {/* Host and Date */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={party.host.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{party.host.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground">{party.host.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{party.created_at}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
