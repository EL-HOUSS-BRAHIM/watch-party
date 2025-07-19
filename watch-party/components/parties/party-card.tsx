"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Calendar, Users, Play, MoreHorizontal, Edit, Trash2, Share } from "lucide-react"

interface PartyCardProps {
  party: any
}

export function PartyCard({ party }: PartyCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "live":
        return "bg-destructive text-destructive-foreground"
      case "upcoming":
        return "bg-warning text-warning-foreground"
      case "ended":
        return "bg-muted text-muted-foreground"
      default:
        return "bg-card text-card-foreground"
    }
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <img
          src={party.thumbnail || "/placeholder.svg?height=200&width=400&text=Video"}
          alt={party.title}
          className="w-full h-48 object-cover"
        />
        <Badge className={`absolute top-2 right-2 ${getStatusColor(party.status)}`}>
          {party.status?.toUpperCase()}
        </Badge>
        {party.status === "live" && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <Button size="lg" className="btn-primary glow-primary" asChild>
              <Link href={`/watch/${party.id}`}>
                <Play className="mr-2 h-5 w-5" />
                Join Live
              </Link>
            </Button>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-foreground truncate flex-1">{party.title}</h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/parties/${party.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Share className="mr-2 h-4 w-4" />
                Share
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{party.description}</p>

        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          <div className="flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            {new Date(party.start_time).toLocaleDateString()}
          </div>
          <div className="flex items-center">
            <Users className="h-3 w-3 mr-1" />
            {party.participants?.length || 0} participants
          </div>
        </div>

        <div className="flex gap-2">
          <Button size="sm" className="flex-1" asChild>
            <Link href={`/watch/${party.id}`}>
              <Play className="mr-2 h-3 w-3" />
              {party.status === "live" ? "Join" : "Enter Room"}
            </Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={`/dashboard/parties/${party.id}`}>Details</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
