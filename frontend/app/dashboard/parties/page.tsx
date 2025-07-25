"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plus,
  Search,
  Calendar,
  Users,
  Play,
  Clock,
  Settings,
  Share2,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"

interface Party {
  id: string
  name: string
  description: string
  roomCode: string
  host: {
    id: string
    username: string
    avatar?: string
  }
  participants: Array<{
    id: string
    username: string
    avatar?: string
  }>
  maxParticipants: number
  isPrivate: boolean
  status: "scheduled" | "active" | "ended"
  scheduledFor?: string
  createdAt: string
  tags: string[]
  videoTitle?: string
  thumbnail?: string
}

export default function PartiesPage() {
  const [parties, setParties] = useState<Party[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("my-parties")
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    loadParties()
  }, [activeTab])

  const loadParties = async () => {
    try {
      const token = localStorage.getItem("accessToken")
      let endpoint = "/api/parties/"

      if (activeTab === "joined") {
        endpoint += "?joined=true"
      } else if (activeTab === "scheduled") {
        endpoint += "?status=scheduled"
      }

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setParties(data.results || data)
      }
    } catch (error) {
      console.error("Failed to load parties:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const joinParty = async (roomCode: string) => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch("/api/parties/join-by-code/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ room_code: roomCode }),
      })

      if (response.ok) {
        router.push(`/watch/${roomCode}`)
      }
    } catch (error) {
      console.error("Failed to join party:", error)
    }
  }

  const deleteParty = async (partyId: string) => {
    if (!confirm("Are you sure you want to delete this party?")) return

    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`/api/parties/${partyId}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setParties((prev) => prev.filter((p) => p.id !== partyId))
      }
    } catch (error) {
      console.error("Failed to delete party:", error)
    }
  }

  const copyRoomCode = (roomCode: string) => {
    navigator.clipboard.writeText(roomCode)
    // You could add a toast notification here
  }

  const filteredParties = parties.filter(
    (party) =>
      party.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      party.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      party.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "scheduled":
        return "bg-blue-500"
      case "ended":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Live"
      case "scheduled":
        return "Scheduled"
      case "ended":
        return "Ended"
      default:
        return status
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Watch Parties</h1>
          <p className="text-gray-600 mt-2">Manage and join watch parties</p>
        </div>
        <Link href="/dashboard/parties/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Party
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search parties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="my-parties">My Parties</TabsTrigger>
          <TabsTrigger value="joined">Joined</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="discover">Discover</TabsTrigger>
        </TabsList>

        <TabsContent value="my-parties" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">Loading your parties...</div>
          ) : filteredParties.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-4">You haven't created any parties yet</div>
              <Link href="/dashboard/parties/create">
                <Button>Create Your First Party</Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredParties.map((party) => (
                <Card key={party.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-1">{party.name}</CardTitle>
                        <CardDescription className="line-clamp-2 mt-1">{party.description}</CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/parties/${party.id}/edit`)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => copyRoomCode(party.roomCode)}>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy Room Code
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Share2 className="mr-2 h-4 w-4" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => deleteParty(party.id)} className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className={cn("text-white", getStatusColor(party.status))}>
                        {getStatusText(party.status)}
                      </Badge>
                      {party.isPrivate && <Badge variant="outline">Private</Badge>}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      {party.participants.length} / {party.maxParticipants} participants
                    </div>

                    {party.scheduledFor && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        {new Date(party.scheduledFor).toLocaleDateString()} at{" "}
                        {new Date(party.scheduledFor).toLocaleTimeString()}
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      Created {new Date(party.createdAt).toLocaleDateString()}
                    </div>

                    {party.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {party.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {party.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{party.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      {party.status === "active" ? (
                        <Button onClick={() => router.push(`/watch/${party.roomCode}`)} className="flex-1">
                          <Play className="mr-2 h-4 w-4" />
                          Join
                        </Button>
                      ) : party.status === "scheduled" ? (
                        <Button variant="outline" className="flex-1 bg-transparent" disabled>
                          <Clock className="mr-2 h-4 w-4" />
                          Scheduled
                        </Button>
                      ) : (
                        <Button
                          onClick={() => router.push(`/watch/${party.roomCode}`)}
                          variant="outline"
                          className="flex-1"
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          Manage
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="joined" className="space-y-4">
          {/* Similar structure for joined parties */}
          <div className="text-center py-8 text-gray-500">Parties you've joined will appear here</div>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          {/* Similar structure for scheduled parties */}
          <div className="text-center py-8 text-gray-500">Your scheduled parties will appear here</div>
        </TabsContent>

        <TabsContent value="discover" className="space-y-4">
          {/* Public parties discovery */}
          <div className="text-center py-8 text-gray-500">Discover public parties to join</div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
