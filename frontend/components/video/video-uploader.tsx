"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"

interface UploadFile {
  id: string
  file: File
  title: string
  description: string
  privacy: "private" | "friends" | "public"
  tags: string[]
  progress: number
  status: "pending" | "uploading" | "processing" | "completed" | "error"
  error?: string
}

interface VideoUploaderProps {
  onUploadComplete?: (videoId: string) => void
  maxFiles?: number
  maxFileSize?: number // in bytes
  className?: string
}

export function VideoUploader({
  onUploadComplete,
  maxFiles = 5,
  maxFileSize = 2 * 1024 * 1024 * 1024, // 2GB
  className,
}: VideoUploaderProps) {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadSource, setUploadSource] = useState<"local" | "cloud">(&quot;local&quot;)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()
  const { toast } = useToast()

  const supportedFormats = ["video/mp4", "video/avi", "video/mov", "video/wmv", "video/flv", "video/webm", "video/mkv"]

  const formatFileSize = (bytes: number) => {
    const sizes = ["Bytes", "KB", "MB", "GB"]
    if (bytes === 0) return "0 Bytes"
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
  }

  const validateFile = (file: File): string | null => {
    if (!supportedFormats.includes(file.type)) {
      return "Unsupported file format. Please use MP4, AVI, MOV, WMV, FLV, WebM, or MKV."
    }
    if (file.size > maxFileSize) {
      return `File size exceeds ${formatFileSize(maxFileSize)} limit.`
    }
    return null
  }

  const addFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files)

    if (uploadFiles.length + fileArray.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `You can only upload ${maxFiles} files at once.`,
        variant: "destructive",
      })
      return
    }

    const newFiles: UploadFile[] = []

    for (const file of fileArray) {
      const error = validateFile(file)
      if (error) {
        toast({
          title: "Invalid file",
          description: `${file.name}: ${error}`,
          variant: "destructive",
        })
        continue
      }

      const uploadFile: UploadFile = {
        id: `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        file,
        title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
        description: "",
        privacy: "private",
        tags: [],
        progress: 0,
        status: "pending",
      }

      newFiles.push(uploadFile)
    }

    setUploadFiles((prev) => [...prev, ...newFiles])
  }

  const removeFile = (fileId: string) => {
    setUploadFiles((prev) => prev.filter((f) => f.id !== fileId))
  }

  const updateFile = (fileId: string, updates: Partial<UploadFile>) => {
    setUploadFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, ...updates } : f)))
  }

  const uploadFile = async (uploadFile: UploadFile) => {
    try {
      updateFile(uploadFile.id, { status: "uploading", progress: 0 })

      const token = localStorage.getItem("accessToken")
      if (!token) {
        throw new Error("Authentication required")
      }

      const formData = new FormData()
      formData.append('file', uploadFile.file)
      formData.append('title', uploadFile.title)
      formData.append('description', uploadFile.description)
      formData.append('privacy', uploadFile.privacy)
      formData.append('tags', JSON.stringify(uploadFile.tags))

      const xhr = new XMLHttpRequest()

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100)
          updateFile(uploadFile.id, { progress })
        }
      })

      // Handle successful upload
      xhr.addEventListener('load', () => {
        if (xhr.status === 200 || xhr.status === 201) {
          try {
            const response = JSON.parse(xhr.responseText)
            updateFile(uploadFile.id, { status: 'processing', progress: 100 })
            
            // Poll for processing status
            pollProcessingStatus(uploadFile.id, response.id)
            
            toast({
              title: "Upload completed",
              description: `${uploadFile.title} is now being processed.`,
            })
          } catch {
            console.error("Failed to parse upload response:", parseError)
            updateFile(uploadFile.id, { status: 'error', error: 'Invalid response from server' })
          }
        } else {
          let errorMessage = 'Upload failed'
          try {
            const errorResponse = JSON.parse(xhr.responseText)
            errorMessage = errorResponse.error || errorResponse.message || errorMessage
          } catch {
            // Use default error message
          }
          updateFile(uploadFile.id, { status: 'error', error: errorMessage })
        }
      })

      // Handle upload errors
      xhr.addEventListener('error', () => {
        updateFile(uploadFile.id, { status: 'error', error: 'Network error during upload' })
      })

      // Handle upload timeout
      xhr.addEventListener('timeout', () => {
        updateFile(uploadFile.id, { status: 'error', error: 'Upload timed out' })
      })

      // Configure and send request
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      xhr.open('POST', `${apiUrl}/api/videos/upload/`)
      xhr.setRequestHeader('Authorization', `Bearer ${token}`)
      xhr.timeout = 30 * 60 * 1000 // 30 minutes timeout
      xhr.send(formData)

    } catch {
      console.error("Upload error:", error)
      updateFile(uploadFile.id, { status: "error", error: error instanceof Error ? error.message : "Upload failed" })
      toast({
        title: "Upload failed",
        description: `Failed to upload ${uploadFile.title}. Please try again.`,
        variant: "destructive",
      })
    }
  }

  const pollProcessingStatus = async (uploadFileId: string, videoId: string) => {
    const token = localStorage.getItem("accessToken")
    if (!token) return

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`${apiUrl}/api/videos/${videoId}/status/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          
          if (data.status === 'completed') {
            updateFile(uploadFileId, { status: 'completed' })
            onUploadComplete?.(videoId)
            clearInterval(pollInterval)
            
            toast({
              title: "Processing completed",
              description: "Your video is now ready to view!",
            })
          } else if (data.status === 'failed') {
            updateFile(uploadFileId, { status: 'error', error: 'Processing failed' })
            clearInterval(pollInterval)
            
            toast({
              title: "Processing failed",
              description: "Video processing failed. Please try uploading again.",
              variant: "destructive",
            })
          }
          // If status is still 'processing', continue polling
        }
      } catch {
        console.error("Failed to check processing status:", error)
        // Continue polling - don't clear interval on temporary errors
      }
    }, 5000) // Poll every 5 seconds

    // Stop polling after 30 minutes
    setTimeout(() => {
      clearInterval(pollInterval)
      updateFile(uploadFileId, { status: 'error', error: 'Processing timeout' })
    }, 30 * 60 * 1000)
  }

  const uploadAllFiles = async () => {
    const pendingFiles = uploadFiles.filter((f) => f.status === &quot;pending&quot;)

    for (const file of pendingFiles) {
      await uploadFile(file)
    }
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      addFiles(files)
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      addFiles(files)
    }
    // Reset input value to allow selecting the same file again
    e.target.value = ""
  }

  const getStatusIcon = (status: UploadFile["status"]) => {
    switch (status) {
      case "pending":
        return <FileVideo className="w-5 h-5 text-muted-foreground" />
      case "uploading":
      case "processing":
        return <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-600" />
      default:
        return <FileVideo className="w-5 h-5 text-muted-foreground" />
    }
  }

  const getStatusText = (file: UploadFile) => {
    switch (file.status) {
      case "pending":
        return "Ready to upload"
      case "uploading":
        return `Uploading... ${file.progress}%`
      case "processing":
        return "Processing video..."
      case "completed":
        return "Upload completed"
      case "error":
        return file.error || "Upload failed"
      default:
        return "Unknown status"
    }
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Upload Source Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Source</CardTitle>
          <CardDescription>Choose where to upload your videos from</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant={uploadSource === "local" ? "default" : "outline"}
              onClick={() => setUploadSource(&quot;local&quot;)}
              className="h-20 flex-col"
            >
              <HardDrive className="w-6 h-6 mb-2" />
              Local Files
            </Button>
            <Button
              variant={uploadSource === "cloud" ? "default" : "outline"}
              onClick={() => setUploadSource(&quot;cloud&quot;)}
              className="h-20 flex-col"
            >
              <Cloud className="w-6 h-6 mb-2" />
              Cloud Storage
            </Button>
          </div>
        </CardContent>
      </Card>

      {uploadSource === "local" ? (
        <>
          {/* File Drop Zone */}
          <Card>
            <CardContent className="p-0">
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                  isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25",
                  "hover:border-primary hover:bg-primary/5",
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Drop your videos here</h3>
                <p className="text-muted-foreground mb-4">or click to browse your files</p>
                <Button onClick={() => fileInputRef.current?.click()}>Select Files</Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="mt-4 text-sm text-muted-foreground">
                  <p>Supported formats: MP4, AVI, MOV, WMV, FLV, WebM, MKV</p>
                  <p>Maximum file size: {formatFileSize(maxFileSize)}</p>
                  <p>Maximum {maxFiles} files at once</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upload Queue */}
          {uploadFiles.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Upload Queue</CardTitle>
                    <CardDescription>{uploadFiles.length} file(s) selected</CardDescription>
                  </div>
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setUploadFiles([])}
                      disabled={uploadFiles.some((f) => f.status === &quot;uploading&quot; || f.status === &quot;processing")}
                    >
                      Clear All
                    </Button>
                    <Button
                      onClick={uploadAllFiles}
                      disabled={
                        uploadFiles.length === 0 ||
                        uploadFiles.every((f) => f.status !== &quot;pending&quot;) ||
                        uploadFiles.some((f) => f.status === &quot;uploading" || f.status === "processing")
                      }
                    >
                      Upload All
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {uploadFiles.map((file) => (
                  <div key={file.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        {getStatusIcon(file.status)}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{file.file.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {formatFileSize(file.file.size)} • {getStatusText(file)}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFile(file.id)}
                        disabled={file.status === "uploading" || file.status === "processing"}
                        className="h-8 w-8"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Progress Bar */}
                    {(file.status === "uploading" || file.status === "processing") && (
                      <Progress value={file.progress} className="w-full" />
                    )}

                    {/* File Details Form */}
                    {file.status === "pending" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                        <div className="space-y-2">
                          <Label htmlFor={`title-${file.id}`}>Title</Label>
                          <Input
                            id={`title-${file.id}`}
                            value={file.title}
                            onChange={(e) => updateFile(file.id, { title: e.target.value })}
                            placeholder="Enter video title"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`privacy-${file.id}`}>Privacy</Label>
                          <Select
                            value={file.privacy}
                            onValueChange={(value) => updateFile(file.id, { privacy: value as Record<string, unknown> })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="private">Private</SelectItem>
                              <SelectItem value="friends">Friends Only</SelectItem>
                              <SelectItem value="public">Public</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor={`description-${file.id}`}>Description</Label>
                          <Textarea
                            id={`description-${file.id}`}
                            value={file.description}
                            onChange={(e) => updateFile(file.id, { description: e.target.value })}
                            placeholder="Enter video description"
                            rows={2}
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor={`tags-${file.id}`}>Tags (comma separated)</Label>
                          <Input
                            id={`tags-${file.id}`}
                            value={file.tags.join(", ")}
                            onChange={(e) =>
                              updateFile(file.id, {
                                tags: e.target.value
                                  .split(",")
                                  .map((tag) => tag.trim())
                                  .filter(Boolean),
                              })
                            }
                            placeholder="Enter tags separated by commas"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        /* Cloud Storage Integration */
        <Card>
          <CardContent className="p-8 text-center">
            <Cloud className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Cloud Storage Integration</h3>
            <p className="text-muted-foreground mb-4">Connect your cloud storage accounts to upload videos directly</p>
            <div className="space-y-2">
              <Button variant="outline" className="w-full bg-transparent">
                Connect Google Drive
              </Button>
              <Button variant="outline" className="w-full bg-transparent">
                Connect Dropbox
              </Button>
              <Button variant="outline" className="w-full bg-transparent">
                Connect OneDrive
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">Cloud storage integration coming soon</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
