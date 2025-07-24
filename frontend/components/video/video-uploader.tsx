"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Upload, File, X, CheckCircle, AlertCircle, Cloud, HardDrive, LinkIcon, Play } from "lucide-react"

interface UploadFile {
  file: File
  id: string
  progress: number
  status: "pending" | "uploading" | "processing" | "completed" | "error"
  error?: string
}

interface VideoMetadata {
  title: string
  description: string
  tags: string[]
  is_public: boolean
  allow_comments: boolean
  allow_downloads: boolean
}

export function VideoUploader() {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([])
  const [uploadMethod, setUploadMethod] = useState<"file" | "url" | "cloud">("file")
  const [videoUrl, setVideoUrl] = useState("")
  const [metadata, setMetadata] = useState<VideoMetadata>({
    title: "",
    description: "",
    tags: [],
    is_public: false,
    allow_comments: true,
    allow_downloads: false,
  })
  const [tagInput, setTagInput] = useState("")
  const { toast } = useToast()

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles: UploadFile[] = acceptedFiles.map((file) => ({
        file,
        id: Math.random().toString(36).substr(2, 9),
        progress: 0,
        status: "pending",
      }))

      setUploadFiles((prev) => [...prev, ...newFiles])

      // Auto-fill title from first file if empty
      if (!metadata.title && newFiles.length > 0) {
        const fileName = newFiles[0].file.name.replace(/\.[^/.]+$/, "")
        setMetadata((prev) => ({ ...prev, title: fileName }))
      }
    },
    [metadata.title],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/*": [".mp4", ".avi", ".mov", ".wmv", ".flv", ".webm", ".mkv"],
    },
    maxSize: 2 * 1024 * 1024 * 1024, // 2GB
  })

  const removeFile = (fileId: string) => {
    setUploadFiles((prev) => prev.filter((f) => f.id !== fileId))
  }

  const startUpload = async () => {
    if (uploadFiles.length === 0 && !videoUrl) {
      toast({
        title: "No files selected",
        description: "Please select files to upload or provide a video URL",
        variant: "destructive",
      })
      return
    }

    // Simulate upload process
    for (const file of uploadFiles) {
      setUploadFiles((prev) => prev.map((f) => (f.id === file.id ? { ...f, status: "uploading" } : f)))

      // Simulate progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise((resolve) => setTimeout(resolve, 200))
        setUploadFiles((prev) => prev.map((f) => (f.id === file.id ? { ...f, progress } : f)))
      }

      // Processing phase
      setUploadFiles((prev) => prev.map((f) => (f.id === file.id ? { ...f, status: "processing", progress: 100 } : f)))

      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Complete
      setUploadFiles((prev) => prev.map((f) => (f.id === file.id ? { ...f, status: "completed" } : f)))
    }

    toast({
      title: "Upload completed!",
      description: "Your videos have been uploaded successfully.",
    })
  }

  const addTag = () => {
    if (tagInput.trim() && !metadata.tags.includes(tagInput.trim())) {
      setMetadata((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }))
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setMetadata((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-accent-success" />
      case "error":
        return <AlertCircle className="w-4 h-4 text-accent-error" />
      case "uploading":
      case "processing":
        return <div className="w-4 h-4 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
      default:
        return <File className="w-4 h-4 text-muted-foreground" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Ready to upload"
      case "uploading":
        return "Uploading..."
      case "processing":
        return "Processing..."
      case "completed":
        return "Upload complete"
      case "error":
        return "Upload failed"
      default:
        return "Unknown"
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Method Selection */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Upload Method</CardTitle>
          <CardDescription>Choose how you want to add your video content</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                uploadMethod === "file" ? "border-primary bg-primary/5" : "border-border hover:border-border/80"
              }`}
              onClick={() => setUploadMethod("file")}
            >
              <div className="flex flex-col items-center text-center space-y-2">
                <HardDrive className="w-8 h-8 text-muted-foreground" />
                <h3 className="font-medium">Upload Files</h3>
                <p className="text-sm text-muted-foreground">Upload video files from your device</p>
              </div>
            </div>

            <div
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                uploadMethod === "url" ? "border-primary bg-primary/5" : "border-border hover:border-border/80"
              }`}
              onClick={() => setUploadMethod("url")}
            >
              <div className="flex flex-col items-center text-center space-y-2">
                <LinkIcon className="w-8 h-8 text-muted-foreground" />
                <h3 className="font-medium">Video URL</h3>
                <p className="text-sm text-muted-foreground">Import from YouTube, Vimeo, or direct URL</p>
              </div>
            </div>

            <div
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                uploadMethod === "cloud" ? "border-primary bg-primary/5" : "border-border hover:border-border/80"
              }`}
              onClick={() => setUploadMethod("cloud")}
            >
              <div className="flex flex-col items-center text-center space-y-2">
                <Cloud className="w-8 h-8 text-muted-foreground" />
                <h3 className="font-medium">Cloud Storage</h3>
                <p className="text-sm text-muted-foreground">Import from Google Drive, Dropbox, etc.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Upload */}
      {uploadMethod === "file" && (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Upload Files</CardTitle>
            <CardDescription>Drag and drop your video files or click to browse</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Drop Zone */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-border/80"
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              {isDragActive ? (
                <p className="text-lg font-medium">Drop the files here...</p>
              ) : (
                <>
                  <p className="text-lg font-medium mb-2">Drag & drop video files here</p>
                  <p className="text-muted-foreground mb-4">or click to browse your computer</p>
                  <Button variant="outline">Choose Files</Button>
                </>
              )}
              <p className="text-xs text-muted-foreground mt-4">
                Supported formats: MP4, AVI, MOV, WMV, FLV, WebM, MKV (Max 2GB per file)
              </p>
            </div>

            {/* File List */}
            {uploadFiles.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">Selected Files</h4>
                {uploadFiles.map((uploadFile) => (
                  <div
                    key={uploadFile.id}
                    className="flex items-center space-x-3 p-3 bg-background-secondary rounded-lg"
                  >
                    {getStatusIcon(uploadFile.status)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{uploadFile.file.name}</p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{formatFileSize(uploadFile.file.size)}</span>
                        <span>{getStatusText(uploadFile.status)}</span>
                      </div>
                      {(uploadFile.status === "uploading" || uploadFile.status === "processing") && (
                        <Progress value={uploadFile.progress} className="mt-2" />
                      )}
                    </div>
                    {uploadFile.status === "pending" && (
                      <Button variant="ghost" size="icon" onClick={() => removeFile(uploadFile.id)} className="h-8 w-8">
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* URL Upload */}
      {uploadMethod === "url" && (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Import from URL</CardTitle>
            <CardDescription>Enter a video URL to import content</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="video-url">Video URL</Label>
              <Input
                id="video-url"
                placeholder="https://youtube.com/watch?v=... or direct video URL"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Supported: YouTube, Vimeo, direct video links (.mp4, .webm, etc.)
              </p>
            </div>
            {videoUrl && (
              <div className="p-4 bg-background-secondary rounded-lg">
                <div className="flex items-center space-x-3">
                  <Play className="w-8 h-8 text-accent-primary" />
                  <div>
                    <p className="font-medium">Video URL detected</p>
                    <p className="text-sm text-muted-foreground truncate">{videoUrl}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Cloud Storage */}
      {uploadMethod === "cloud" && (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Cloud Storage</CardTitle>
            <CardDescription>Connect your cloud storage to import videos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-20 flex-col bg-transparent">
                <div className="w-8 h-8 bg-blue-500 rounded mb-2"></div>
                Google Drive
              </Button>
              <Button variant="outline" className="h-20 flex-col bg-transparent">
                <div className="w-8 h-8 bg-blue-600 rounded mb-2"></div>
                OneDrive
              </Button>
              <Button variant="outline" className="h-20 flex-col bg-transparent">
                <div className="w-8 h-8 bg-blue-400 rounded mb-2"></div>
                Dropbox
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Video Metadata */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Video Details</CardTitle>
          <CardDescription>Add information about your video</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Enter video title"
              value={metadata.title}
              onChange={(e) => setMetadata((prev) => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your video..."
              rows={4}
              value={metadata.description}
              onChange={(e) => setMetadata((prev) => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex space-x-2">
              <Input
                id="tags"
                placeholder="Add a tag"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              />
              <Button onClick={addTag} disabled={!tagInput.trim()}>
                Add
              </Button>
            </div>
            {metadata.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {metadata.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                    {tag}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium">Privacy & Permissions</h4>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="is_public">Make Public</Label>
                <p className="text-sm text-muted-foreground">Allow others to discover and watch this video</p>
              </div>
              <Switch
                id="is_public"
                checked={metadata.is_public}
                onCheckedChange={(checked) => setMetadata((prev) => ({ ...prev, is_public: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="allow_comments">Allow Comments</Label>
                <p className="text-sm text-muted-foreground">Let viewers leave comments on your video</p>
              </div>
              <Switch
                id="allow_comments"
                checked={metadata.allow_comments}
                onCheckedChange={(checked) => setMetadata((prev) => ({ ...prev, allow_comments: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="allow_downloads">Allow Downloads</Label>
                <p className="text-sm text-muted-foreground">Allow viewers to download this video</p>
              </div>
              <Switch
                id="allow_downloads"
                checked={metadata.allow_downloads}
                onCheckedChange={(checked) => setMetadata((prev) => ({ ...prev, allow_downloads: checked }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Actions */}
      <div className="flex items-center justify-between">
        <Button variant="outline">Save as Draft</Button>
        <Button onClick={startUpload} className="shadow-glow" disabled={!metadata.title.trim()}>
          <Upload className="w-4 h-4 mr-2" />
          Start Upload
        </Button>
      </div>
    </div>
  )
}
