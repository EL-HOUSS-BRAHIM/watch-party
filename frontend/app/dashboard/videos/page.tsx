"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VideoUploader } from "@/components/video/video-uploader"
import { VideoLibrary } from "@/components/video/video-library"
import { useToast } from "@/hooks/use-toast"
import { Upload, Search, Filter, Grid3X3, List, Play, Clock, Eye, Share, Loader2 } from "lucide-react"

interface VideoStats {
  total: number
  totalViews: number
  totalDuration: string
  storageUsed: string
  storageLimit: string
}

export default function VideosPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [activeTab, setActiveTab] = useState("library")
  const [videoStats, setVideoStats] = useState<VideoStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchVideoStats = async () => {
      try {
        setIsLoading(true)
        const token = localStorage.getItem("accessToken")
        
        // Fetch user analytics for video stats
        const response = await fetch("/api/analytics/user/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          
          // Also fetch videos to get total count
          const videosResponse = await fetch("/api/videos/?limit=1", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          let totalVideos = 0
          if (videosResponse.ok) {
            const videosData = await videosResponse.json()
            totalVideos = videosData.count || 0
          }

          setVideoStats({
            total: totalVideos,
            totalViews: data.watch_time?.total_hours * 60 || 0, // rough approximation
            totalDuration: `${data.watch_time?.total_hours || 0}h`,
            storageUsed: "2.4 GB", // This would come from backend
            storageLimit: "10 GB", // This would come from user subscription
          })
        }
      } catch (error) {
        console.error("Failed to fetch video stats:", error)
        toast({
          title: "Error",
          description: "Failed to load video statistics.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchVideoStats()
  }, [toast])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display">Video Library</h1>
          <p className="text-muted-foreground mt-2">Manage your video collection and upload new content</p>
        </div>
        <Button className="shadow-glow">
          <Upload className="w-4 h-4 mr-2" />
          Upload Video
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Videos</CardTitle>
                <Play className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{videoStats?.total || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Your video collection
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{videoStats?.totalViews?.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Estimated total views
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Watch Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{videoStats?.totalDuration || "0h"}</div>
                <p className="text-xs text-muted-foreground">Total content duration</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Storage</CardTitle>
                <Upload className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{videoStats?.storageUsed || "0 GB"}</div>
                <div className="w-full bg-background-secondary rounded-full h-2 mt-2">
                  <div 
                    className="bg-accent-primary h-2 rounded-full" 
                    style={{ 
                      width: `${videoStats ? (parseFloat(videoStats.storageUsed) / parseFloat(videoStats.storageLimit)) * 100 : 0}%` 
                    }} 
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {videoStats?.storageUsed || "0 GB"} of {videoStats?.storageLimit || "10 GB"} used
                </p>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Search and Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant={viewMode === "grid" ? "secondary" : "ghost"} size="icon" onClick={() => setViewMode("grid")}>
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button variant={viewMode === "list" ? "secondary" : "ghost"} size="icon" onClick={() => setViewMode("list")}>
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="library">My Videos</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="shared">Shared with Me</TabsTrigger>
        </TabsList>

        <TabsContent value="library" className="space-y-6">
          <VideoLibrary searchQuery={searchQuery} viewMode={viewMode} />
        </TabsContent>

        <TabsContent value="upload" className="space-y-6">
          <VideoUploader />
        </TabsContent>

        <TabsContent value="shared" className="space-y-6">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <Share className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No shared videos</h3>
              <p className="text-muted-foreground">Videos shared with you by friends will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
