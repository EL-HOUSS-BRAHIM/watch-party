"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, Trash2, Play, Globe, Lock } from "lucide-react"
import Link from "next/link"
import { api } from "@/lib/api"

interface EditVideoPageProps {
  params: {
    id: string
  }
}

interface Video {
  id: string
  title: string
  description: string
  url: string
  thumbnailUrl?: string
  duration: number
  isPublic: boolean
  category: string
  tags: string[]
  uploadedAt: string
  status: "processing" | "ready" | "error"
  viewCount: number
  fileSize: number
}

export default function EditVideoPage({ params }: EditVideoPageProps) {
  const [video, setVideo] = useState<Video | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [tagInput, setTagInput] = useState("")
  const router = useRouter()

  useEffect(() => {
    fetchVideo()
  }, [params.id])

  const fetchVideo = async () => {
    try {
      const data = await api.get(`/videos/${params.id}`)
      setVideo(data)
    } catch (err: any) {
      setError("Failed to load video details")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!video) return

    setIsSaving(true)
    setError("")

    try {
      await api.put(`/videos/${params.id}`, video)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || "Failed to update video")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this video? This action cannot be undone.")) {
      return
    }

    try {
      await api.delete(`/videos/${params.id}`)
      router.push("/dashboard/videos")
    } catch (err: any) {
      setError(err.message || "Failed to delete video")
    }
  }

  const updateVideo = (field: keyof Video, value: any) => {
    if (!video) return
    setVideo({ ...video, [field]: value })
  }

  const addTag = () => {
    if (!video || !tagInput.trim()) return
    const newTag = tagInput.trim().toLowerCase()
    if (!video.tags.includes(newTag)) {
      updateVideo("tags", [...video.tags, newTag])
    }
    setTagInput("")
  }

  const removeTag = (tagToRemove: string) => {
    if (!video) return
    updateVideo(
      "tags",
      video.tags.filter((tag) => tag !== tagToRemove),
    )
  }

  const formatFileSize = (bytes: number) => {
    const sizes = ["Bytes", "KB", "MB", "GB"]
    if (bytes === 0) return "0 Bytes"
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neo-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neo-text-secondary">Loading video details...</p>
        </div>
      </div>
    )
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-neo-background flex items-center justify-center">
        <Card className="card max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold text-neo-text-primary mb-2">Video Not Found</h2>
            <p className="text-neo-text-secondary mb-4">
              The video you're looking for doesn't exist or you don't have permission to edit it.
            </p>
            <Button asChild>
              <Link href="/dashboard/videos">Back to Videos</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neo-background">
      {/* Header */}
      <div className="border-b border-neo-border bg-neo-surface/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/videos" className="text-neo-text-secondary hover:text-neo-text-primary">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Videos
                </Link>
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-neo-text-primary">Edit Video</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant={
                      video.status === "ready" ? "default" : video.status === "processing" ? "secondary" : "destructive"
                    }
                  >
                    {video.status}
                  </Badge>
                  <span className="text-sm text-neo-text-secondary">
                    {video.viewCount} views • {formatFileSize(video.fileSize)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/watch/video/${video.id}`}>
                  <Play className="w-4 h-4 mr-2" />
                  Preview
                </Link>
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Video Preview */}
          <div className="lg:col-span-1">
            <Card className="card">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-neo-text-primary">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-neo-surface rounded-lg overflow-hidden mb-4">
                  {video.thumbnailUrl ? (
                    <img
                      src={video.thumbnailUrl || "/placeholder.svg"}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Play className="w-12 h-12 text-neo-text-tertiary" />
                    </div>
                  )}
                </div>
                <div className="space-y-2 text-sm text-neo-text-secondary">
                  <p>Duration: {formatDuration(video.duration)}</p>
                  <p>Uploaded: {new Date(video.uploadedAt).toLocaleDateString()}</p>
                  <p>File Size: {formatFileSize(video.fileSize)}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Edit Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSave} className="space-y-6">
              {error && (
                <Alert className="border-error bg-error/10">
                  <AlertDescription className="text-error">{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-success bg-success/10">
                  <AlertDescription className="text-success">Video updated successfully!</AlertDescription>
                </Alert>
              )}

              {/* Basic Information */}
              <Card className="card">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-neo-text-primary">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-neo-text-primary">
                      Video Title *
                    </Label>
                    <Input
                      id="title"
                      value={video.title}
                      onChange={(e) => updateVideo("title", e.target.value)}
                      className="input-base"
                      placeholder="Enter video title"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-neo-text-primary">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={video.description}
                      onChange={(e) => updateVideo("description", e.target.value)}
                      className="input-base"
                      placeholder="Describe your video..."
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-neo-text-primary">
                      Category
                    </Label>
                    <Select value={video.category} onValueChange={(value) => updateVideo("category", value)}>
                      <SelectTrigger className="input-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="football">Football</SelectItem>
                        <SelectItem value="basketball">Basketball</SelectItem>
                        <SelectItem value="soccer">Soccer</SelectItem>
                        <SelectItem value="baseball">Baseball</SelectItem>
                        <SelectItem value="hockey">Hockey</SelectItem>
                        <SelectItem value="other">Other Sports</SelectItem>
                        <SelectItem value="entertainment">Entertainment</SelectItem>
                        <SelectItem value="documentary">Documentary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Media Settings */}
              <Card className="card">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-neo-text-primary">Media Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="url" className="text-neo-text-primary">
                      Video URL
                    </Label>
                    <Input
                      id="url"
                      value={video.url}
                      onChange={(e) => updateVideo("url", e.target.value)}
                      className="input-base"
                      placeholder="https://drive.google.com/... or S3 URL"
                      disabled={video.status === "processing"}
                    />
                    <p className="text-xs text-neo-text-tertiary">Video URL cannot be changed while processing</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="thumbnailUrl" className="text-neo-text-primary">
                      Thumbnail URL (Optional)
                    </Label>
                    <Input
                      id="thumbnailUrl"
                      value={video.thumbnailUrl || ""}
                      onChange={(e) => updateVideo("thumbnailUrl", e.target.value)}
                      className="input-base"
                      placeholder="https://example.com/thumbnail.jpg"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Tags & Privacy */}
              <Card className="card">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-neo-text-primary">Tags & Privacy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-neo-text-primary">Tags</Label>
                    <div className="flex gap-2">
                      <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        className="input-base flex-1"
                        placeholder="Add a tag..."
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                      />
                      <Button type="button" onClick={addTag} variant="outline">
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {video.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => removeTag(tag)}
                        >
                          {tag} ×
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {video.isPublic ? (
                        <Globe className="w-5 h-5 text-success" />
                      ) : (
                        <Lock className="w-5 h-5 text-warning" />
                      )}
                      <div>
                        <Label className="text-neo-text-primary">Public Video</Label>
                        <p className="text-sm text-neo-text-secondary">
                          {video.isPublic ? "Anyone can discover and watch" : "Only you can access this video"}
                        </p>
                      </div>
                    </div>
                    <Switch checked={video.isPublic} onCheckedChange={(checked) => updateVideo("isPublic", checked)} />
                  </div>
                </CardContent>
              </Card>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button type="submit" className="btn-primary" disabled={isSaving || video.status === "processing"}>
                  {isSaving ? (
                    "Saving..."
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
