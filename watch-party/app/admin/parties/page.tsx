"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, MoreHorizontal, Eye, Ban, Trash2, Users, Calendar } from "lucide-react"
import { api } from "@/lib/api"

export default function AdminPartiesPage() {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")

  const { data: parties, isLoading } = useQuery({
    queryKey: ["admin-parties", { search, filter }],
    queryFn: () => api.get("/admin/parties", { params: { search, filter } }),
  })

  const mockParties = [
    {
      id: 1,
      title: "Champions League Final",
      host: "John Doe",
      participants: 45,
      status: "live",
      createdAt: "2024-01-20",
      startTime: "2024-01-20T20:00:00Z",
      reports: 0,
      isPrivate: false,
    },
    {
      id: 2,
      title: "El Clasico Watch Party",
      host: "Sarah Chen",
      participants: 32,
      status: "upcoming",
      createdAt: "2024-01-19",
      startTime: "2024-01-21T18:00:00Z",
      reports: 2,
      isPrivate: true,
    },
    {
      id: 3,
      title: "World Cup Highlights",
      host: "Mike Johnson",
      participants: 18,
      status: "ended",
      createdAt: "2024-01-18",
      startTime: "2024-01-18T15:00:00Z",
      reports: 1,
      isPrivate: false,
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "live":
        return <Badge className="bg-destructive text-destructive-foreground">Live</Badge>
      case "upcoming":
        return <Badge className="bg-warning text-warning-foreground">Upcoming</Badge>
      case "ended":
        return <Badge variant="secondary">Ended</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const handlePartyAction = (action: string, partyId: number) => {
    console.log(`${action} party:`, partyId)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Party Management</h1>
        <p className="text-muted-foreground">Monitor and manage watch parties across the platform.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search parties..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-base pl-10"
          />
        </div>

        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter parties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Parties</SelectItem>
            <SelectItem value="live">Live Now</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="reported">Reported</SelectItem>
            <SelectItem value="private">Private</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Parties ({mockParties.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 animate-pulse">
                  <div className="h-16 w-24 bg-secondary rounded" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-secondary rounded w-1/3" />
                    <div className="h-3 bg-secondary rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {mockParties.map((party) => (
                <div key={party.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <img
                      src="/placeholder.svg?height=64&width=96&text=Video"
                      alt={party.title}
                      className="h-16 w-24 rounded object-cover"
                    />
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium text-foreground">{party.title}</h3>
                        {getStatusBadge(party.status)}
                        {party.isPrivate && <Badge variant="outline">Private</Badge>}
                        {party.reports > 0 && <Badge variant="destructive">{party.reports} reports</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">Hosted by {party.host}</p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                        <div className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {party.participants} participants
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(party.startTime).toLocaleDateString()}
                        </div>
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
                      <DropdownMenuItem onClick={() => handlePartyAction("view", party.id)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handlePartyAction("suspend", party.id)}>
                        <Ban className="mr-2 h-4 w-4" />
                        Suspend Party
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handlePartyAction("delete", party.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Party
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
