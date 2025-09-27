"use client"

import * as React from "react"
import { useState, useCallback } from "react"
import { Upload, X, Globe, Lock, Users, AlertCircle, CheckCircle, FileVideo, ImageIcon } from "lucide-react"
import { WatchPartyButton } from "@/components/ui/watch-party-button"
import { WatchPartyInput } from "@/components/ui/watch-party-input"
import { WatchPartyTextarea } from "@/components/ui/watch-party-textarea"
import { WatchPartySelect } from "@/components/ui/watch-party-select"
import { WatchPartyForm, FormField, FormActions } from "@/components/ui/watch-party-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"

interface UploadFile {
  id: string
  file: File
  progress: number
  status: "pending" | "uploading" | "processing" | "completed" | "error"
  error?: string
  preview?: string
  duration?: number
  size: number
}

interface VideoMetadata {
  title: string
  description: string
  visibility: "public" | "private" | "unlisted"
  thumbnail?: File
  tags: string[]
  category: string
  allowComments: boolean
  allowDownload: boolean
  scheduledPublish?: Date
}

const visibilityOptions = [
  {
    value: "public",
    label: "Public",
    description: "Anyone can search for and view",
    icon: <Globe className="h-4 w-4" />,
  },
  {
    value: "unlisted",
    label: "Unlisted",
    description: "Anyone with the link can view",
    icon: <Users className="h-4 w-4" />,
  },
  {
    value: "private",
    label: "Private",
    description: "Only you can view",
    icon: <Lock className="h-4 w-4" />,
  },
]

const categoryOptions = [
  { value: "movies", label: "Movies" },
  { value: "tv-shows", label: "TV Shows" },
  { value: "anime", label: "Anime" },
  { value: "documentaries", label: "Documentaries" },
  { value: "music", label: "Music Videos" },
  { value: "gaming", label: "Gaming" },
  { value: "education", label: "Educational" },
  { value: "other", label: "Other" },
]

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`
}

function FileUploadZone({
  onFilesSelected,
  uploading,
}: {
  onFilesSelected: (files: FileList) => void
  uploading: boolean
}) {
  const [dragActive, setDragActive] = useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        onFilesSelected(e.dataTransfer.files)
      }
    },
    [onFilesSelected],
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        onFilesSelected(e.target.files)
      }
    },
    [onFilesSelected],
  )

  return (
    <div
      className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
      } ${uploading ? "opacity-50 pointer-events-none" : ""}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="video/*"
        onChange={handleChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={uploading}
      />

      <div className="space-y-4">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <Upload className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Drop your videos here</h3>
          <p className="text-muted-foreground">
            or{" "}
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-primary hover:underline"
              disabled={uploading}
            >
              browse files
            </button>
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          <p>Supported formats: MP4, AVI, MOV, WMV</p>
          <p>Maximum file size: 5GB per file</p>
        </div>
      </div>
    </div>
  )
}

function UploadProgress({
  files,
  onRemoveFile,
}: {
  files: UploadFile[]
  onRemoveFile: (id: string) => void
}) {
  if (files.length === 0) return null

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Upload Progress</h3>
      {files.map((file) => (
        <Card key={file.id}>
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                {file.preview ? (
                  <img
                    src={file.preview || "/placeholder.svg"}
                    alt="Video thumbnail"
                    className="w-16 h-12 object-cover rounded"
                  />
                ) : (
                  <div className="w-16 h-12 bg-muted rounded flex items-center justify-center">
                    <FileVideo className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium truncate">{file.file.name}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{formatFileSize(file.size)}</span>
                      {file.duration && (
                        <>
                          <span>•</span>
                          <span>{formatDuration(file.duration)}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        file.status === "completed" ? "default" : file.status === "error" ? "destructive" : "secondary"
                      }
                    >
                      {file.status}
                    </Badge>
                    <WatchPartyButton
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveFile(file.id)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </WatchPartyButton>
                  </div>
                </div>

                {file.status === "uploading" || file.status === "processing" ? (
                  <div className="space-y-1">
                    <Progress value={file.progress} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {file.status === "uploading" ? "Uploading..." : "Processing..."} {file.progress}%
                    </p>
                  </div>
                ) : file.status === "error" ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{file.error}</AlertDescription>
                  </Alert>
                ) : file.status === "completed" ? (
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    Upload completed successfully
                  </div>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function VideoUploadPage() {
  const router = useRouter()
  const [files, setFiles] = useState<UploadFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [currentStep, setCurrentStep] = useState<"upload" | "details">("upload")
  const [metadata, setMetadata] = useState<VideoMetadata>({
    title: "",
    description: "",
    visibility: "public",
    tags: [],
    category: "",
    allowComments: true,
    allowDownload: false,
  })

  const handleFilesSelected = useCallback((fileList: FileList) => {
    const newFiles: UploadFile[] = Array.from(fileList).map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      status: "pending",
      size: file.size,
    }))

    setFiles((prev) => [...prev, ...newFiles])

    // Start upload simulation
    newFiles.forEach((uploadFile) => {
      simulateUpload(uploadFile.id)
    })
  }, [])

  const simulateUpload = async (fileId: string) => {
    setUploading(true)

    // Update status to uploading
    setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, status: "uploading" as const } : f)))

    // Simulate upload progress
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise((resolve) => setTimeout(resolve, 200))
      setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, progress } : f)))
    }

    // Switch to processing
    setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, status: "processing" as const, progress: 0 } : f)))

    // Simulate processing
    for (let progress = 0; progress <= 100; progress += 20) {
      await new Promise((resolve) => setTimeout(resolve, 300))
      setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, progress } : f)))
    }

    // Complete
    setFiles((prev) =>
      prev.map((f) =>
        f.id === fileId
          ? {
              ...f,
              status: "completed" as const,
              progress: 100,
              duration: Math.floor(Math.random() * 7200) + 300, // Random duration 5min-2h
              preview: `/placeholder.svg?height=120&width=160&text=${f.file.name.split(".")[0]}`,
            }
          : f,
      ),
    )

    setUploading(false)
  }

  const handleRemoveFile = useCallback((fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId))
  }, [])

  const handleSubmit = async () => {
    // Simulate API call to save video metadata
    console.log("Submitting video metadata:", metadata)
    console.log("Files:", files)

    // Redirect to videos page
    router.push("/dashboard/videos")
  }

  const completedFiles = files.filter((f) => f.status === "completed")
  const canProceed = completedFiles.length > 0

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Upload Videos</h1>
        <p className="text-muted-foreground">Share your content with the WatchParty community</p>
      </div>

      <Tabs value={currentStep} onValueChange={(value) => setCurrentStep(value as any)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Upload Files</TabsTrigger>
          <TabsTrigger value="details" disabled={!canProceed}>
            Video Details
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Videos</CardTitle>
            </CardHeader>
            <CardContent>
              <FileUploadZone onFilesSelected={handleFilesSelected} uploading={uploading} />
            </CardContent>
          </Card>

          <UploadProgress files={files} onRemoveFile={handleRemoveFile} />

          {canProceed && (
            <div className="flex justify-end">
              <WatchPartyButton onClick={() => setCurrentStep("details")}>Continue to Details</WatchPartyButton>
            </div>
          )}
        </TabsContent>

        <TabsContent value="details" className="space-y-6">
          <WatchPartyForm title="Video Details" description="Add information about your videos" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <FormField label="Title" required>
                  <WatchPartyInput
                    placeholder="Enter video title..."
                    value={metadata.title}
                    onChange={(e) => setMetadata((prev) => ({ ...prev, title: e.target.value }))}
                  />
                </FormField>

                <FormField label="Description">
                  <WatchPartyTextarea
                    placeholder="Describe your video..."
                    value={metadata.description}
                    onChange={(value) => setMetadata((prev) => ({ ...prev, description: value }))}
                    maxLength={5000}
                    showCharCount
                    autoResize
                  />
                </FormField>

                <FormField label="Category" required>
                  <WatchPartySelect
                    options={categoryOptions}
                    value={metadata.category}
                    onValueChange={(value) => setMetadata((prev) => ({ ...prev, category: value as string }))}
                    placeholder="Select category..."
                  />
                </FormField>

                <FormField label="Tags" description="Add tags to help people discover your video">
                  <WatchPartyInput
                    placeholder="Enter tags separated by commas..."
                    value={metadata.tags.join(", ")}
                    onChange={(e) =>
                      setMetadata((prev) => ({
                        ...prev,
                        tags: e.target.value
                          .split(",")
                          .map((tag: string) => tag.trim())
                          .filter(Boolean),
                      }))
                    }
                  />
                </FormField>
              </div>

              <div className="space-y-4">
                <FormField label="Visibility">
                  <WatchPartySelect
                    options={visibilityOptions}
                    value={metadata.visibility}
                    onValueChange={(value) => setMetadata((prev) => ({ ...prev, visibility: value as any }))}
                  />
                </FormField>

                <FormField label="Thumbnail" description="Upload a custom thumbnail (optional)">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                    <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Click to upload thumbnail</p>
                  </div>
                </FormField>

                <div className="space-y-4">
                  <h3 className="font-semibold">Settings</h3>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="allow-comments">Allow Comments</Label>
                      <p className="text-xs text-muted-foreground">Let viewers comment on your video</p>
                    </div>
                    <Switch
                      id="allow-comments"
                      checked={metadata.allowComments}
                      onCheckedChange={(checked) => setMetadata((prev) => ({ ...prev, allowComments: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="allow-download">Allow Download</Label>
                      <p className="text-xs text-muted-foreground">Let viewers download your video</p>
                    </div>
                    <Switch
                      id="allow-download"
                      checked={metadata.allowDownload}
                      onCheckedChange={(checked) => setMetadata((prev) => ({ ...prev, allowDownload: checked }))}
                    />
                  </div>
                </div>
              </div>
            </div>

            <FormActions>
              <WatchPartyButton variant="outline" onClick={() => setCurrentStep("upload")}>
                Back
              </WatchPartyButton>
              <WatchPartyButton type="submit">Publish Videos</WatchPartyButton>
            </FormActions>
          </WatchPartyForm>
        </TabsContent>
      </Tabs>
    </div>
  )
}
