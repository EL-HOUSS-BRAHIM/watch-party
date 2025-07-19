"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Search, Upload, Play, MoreHorizontal, Edit, Trash2, Share } from "lucide-react"
import Link from "next/link"
import { api } from "@/lib/api"

export default function VideosPage() {
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState("created_at")

  const { data: videos, isLoading } = useQuery({
    queryKey: ["videos", { search, sortBy }],
    queryFn: () =>
      api.get("/videos", {
        params: { search, sort_by: sortBy },
      }),
  })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Video Library</h1>
          <p className="text-muted-foreground">Manage your uploaded videos and streaming sources.</p>
        </div>

        <Button asChild className="btn-primary">
          <Link href="/dashboard/videos/upload">
            <Upload className="mr-2 h-4 w-4" />
            Upload Video
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search videos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-base pl-10"
          />
        </div>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at">Date Added</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="duration">Duration</SelectItem>
            <SelectItem value="size">File Size</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-video bg-secondary rounded-t-lg" />
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="h-4 bg-secondary rounded w-3/4" />
                  <div className="h-3 bg-secondary rounded w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos?.data?.map((video: any) => (
            <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <img
                  src={video.thumbnail || "/placeholder.svg?height=200&width=300&text=Video"}
                  alt={video.title}
                  className="w-full aspect-video object-cover"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button size="lg" className="btn-primary">
                    <Play className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                </div>
                <Badge className="absolute top-2 right-2 bg-black/60 text-white">{video.duration || "0:00"}</Badge>
              </div>

              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-foreground truncate flex-1">{video.title}</h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
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

                <div className="text-xs text-muted-foreground space-y-1">
                  <div>Size: {video.size || "Unknown"}</div>
                  <div>Added: {new Date(video.created_at).toLocaleDateString()}</div>
                </div>

                <div className="mt-3 flex gap-2">
                  <Button size="sm" className="flex-1" asChild>
                    <Link href={`/dashboard/parties/create?video=${video.id}`}>
                      <Plus className="mr-2 h-3 w-3" />
                      Create Party
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {videos?.data?.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 rounded-full bg-card flex items-center justify-center mb-4">
            <Upload className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">No videos yet</h3>
          <p className="text-muted-foreground mb-4">Upload your first video to get started.</p>
          <Button asChild className="btn-primary">
            <Link href="/dashboard/videos/upload">Upload Video</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
