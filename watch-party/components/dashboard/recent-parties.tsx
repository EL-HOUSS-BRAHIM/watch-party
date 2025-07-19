"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, Play } from "lucide-react"

interface RecentPartiesProps {
  parties: any
  isLoading: boolean
}

export function RecentParties({ parties, isLoading }: RecentPartiesProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Parties</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4 animate-pulse">
                <div className="h-16 w-24 bg-secondary rounded" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-secondary rounded w-3/4" />
                  <div className="h-3 bg-secondary rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const recentParties = parties?.data?.slice(0, 5) || []

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Parties</CardTitle>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/parties">View all</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {recentParties.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No parties yet</h3>
            <p className="text-muted-foreground mb-4">Create your first watch party to get started.</p>
            <Button asChild className="btn-primary">
              <Link href="/dashboard/parties/create">Create Party</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {recentParties.map((party: any) => (
              <div
                key={party.id}
                className="flex items-center space-x-4 p-3 rounded-lg hover:bg-secondary transition-colors"
              >
                <div className="relative">
                  <img
                    src={party.thumbnail || "/placeholder.svg?height=64&width=96&text=Video"}
                    alt={party.title}
                    className="h-16 w-24 rounded object-cover"
                  />
                  {party.status === "live" && (
                    <Badge className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground">LIVE</Badge>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-foreground truncate">{party.title}</h4>
                  <div className="flex items-center space-x-4 mt-1">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Users className="h-3 w-3 mr-1" />
                      {party.participants?.length || 0}
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(party.start_time).toLocaleDateString()}
                    </div>
                  </div>
                  <Badge variant={party.status === "live" ? "destructive" : "secondary"} className="mt-2">
                    {party.status}
                  </Badge>
                </div>
                <Button size="sm" variant="ghost" asChild>
                  <Link href={`/watch/${party.id}`}>
                    <Play className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
