"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Upload, LinkIcon, File, X } from "lucide-react"

export default function UploadVideoPage() {
  const [uploadMethod, setUploadMethod] = useState<"file" | "url">("file")
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    url: "",
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      if (!formData.title) {
        setFormData((prev) => ({ ...prev, title: file.name.replace(/\.[^/.]+$/, "") }))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUploading(true)

    try {
      if (uploadMethod === "file" && selectedFile) {
        // Simulate file upload with progress
        const formDataObj = new FormData()
        formDataObj.append("file", selectedFile)
        formDataObj.append("title", formData.title)
        formDataObj.append("description", formData.description)

        // Simulate upload progress
        for (let i = 0; i <= 100; i += 10) {
          setUploadProgress(i)
          await new Promise((resolve) => setTimeout(resolve, 200))
        }
      }

      toast({
        title: "Video uploaded!",
        description: "Your video has been uploaded successfully.",
      })
      router.push("/dashboard/videos")
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload video. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Upload Video</h1>
        <p className="text-muted-foreground">Add a new video to your library for watch parties.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Method</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant={uploadMethod === "file" ? "default" : "outline"}
              onClick={() => setUploadMethod("file")}
              className="h-20 flex-col"
            >
              <Upload className="h-6 w-6 mb-2" />
              Upload File
            </Button>
            <Button
              variant={uploadMethod === "url" ? "default" : "outline"}
              onClick={() => setUploadMethod("url")}
              className="h-20 flex-col"
            >
              <LinkIcon className="h-6 w-6 mb-2" />
              From URL
            </Button>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Video Source</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {uploadMethod === "file" ? (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  {selectedFile ? (
                    <div className="flex items-center justify-center space-x-4">
                      <File className="h-8 w-8 text-primary" />
                      <div className="text-left">
                        <p className="font-medium text-foreground">{selectedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedFile(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-foreground mb-2">Drop your video file here</p>
                      <p className="text-sm text-muted-foreground mb-4">Supports MP4, WebM, MOV up to 2GB</p>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="file-upload"
                      />
                      <Button type="button" asChild variant="outline">
                        <label htmlFor="file-upload" className="cursor-pointer">
                          Choose File
                        </label>
                      </Button>
                    </div>
                  )}
                </div>

                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="url">Video URL</Label>
                <Input
                  id="url"
                  value={formData.url}
                  onChange={(e) => setFormData((prev) => ({ ...prev, url: e.target.value }))}
                  placeholder="https://drive.google.com/file/d/... or S3 URL"
                  className="input-base"
                  required
                />
                <p className="text-xs text-muted-foreground">Supports Google Drive, S3, and direct video URLs</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Video Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Liverpool vs Arsenal - Champions League"
                className="input-base"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Epic Champions League match between two legendary teams..."
                className="input-base min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isUploading || (uploadMethod === "file" && !selectedFile)}
            className="flex-1 btn-primary"
          >
            {isUploading ? "Uploading..." : "Upload Video"}
          </Button>
        </div>
      </form>
    </div>
  )
}
