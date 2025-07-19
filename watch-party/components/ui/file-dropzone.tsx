"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, File, X, CheckCircle, AlertCircle } from "lucide-react"

interface FileDropzoneProps {
  onFileSelect: (files: File[]) => void
  onUploadProgress?: (progress: number) => void
  onUploadComplete?: (urls: string[]) => void
  accept?: Record<string, string[]>
  maxFiles?: number
  maxSize?: number
  className?: string
}

interface UploadedFile {
  file: File
  progress: number
  status: "uploading" | "completed" | "error"
  url?: string
  error?: string
}

export function FileDropzone({
  onFileSelect,
  onUploadProgress,
  onUploadComplete,
  accept = {
    "video/*": [".mp4", ".avi", ".mov", ".mkv"],
    "image/*": [".jpg", ".jpeg", ".png", ".gif"],
  },
  maxFiles = 5,
  maxSize = 100 * 1024 * 1024, // 100MB
  className,
}: FileDropzoneProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isDragActive, setIsDragActive] = useState(false)

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      if (rejectedFiles.length > 0) {
        // Handle rejected files
        console.warn("Some files were rejected:", rejectedFiles)
      }

      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles)

        // Add files to upload queue
        const newFiles: UploadedFile[] = acceptedFiles.map((file) => ({
          file,
          progress: 0,
          status: "uploading" as const,
        }))

        setUploadedFiles((prev) => [...prev, ...newFiles])

        // Simulate upload process
        acceptedFiles.forEach((file, index) => {
          simulateUpload(file, uploadedFiles.length + index)
        })
      }
    },
    [onFileSelect, uploadedFiles.length],
  )

  const {
    getRootProps,
    getInputProps,
    isDragActive: dropzoneActive,
  } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    maxSize,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
  })

  const simulateUpload = async (file: File, index: number) => {
    // Simulate upload progress
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise((resolve) => setTimeout(resolve, 200))

      setUploadedFiles((prev) => prev.map((f, i) => (i === index ? { ...f, progress } : f)))

      onUploadProgress?.(progress)
    }

    // Simulate completion
    const mockUrl = `https://example.com/uploads/${file.name}`
    setUploadedFiles((prev) => prev.map((f, i) => (i === index ? { ...f, status: "completed", url: mockUrl } : f)))

    // Check if all uploads are complete
    const allCompleted = uploadedFiles.every((f) => f.status === "completed")
    if (allCompleted) {
      const urls = uploadedFiles.map((f) => f.url!).filter(Boolean)
      onUploadComplete?.(urls)
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number) => {
    const sizes = ["Bytes", "KB", "MB", "GB"]
    if (bytes === 0) return "0 Bytes"
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
  }

  return (
    <div className={className}>
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive || dropzoneActive
            ? "border-primary bg-primary/5"
            : "border-neo-border hover:border-neo-border-strong bg-neo-surface/50"
        }`}
      >
        <input {...getInputProps()} />
        <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragActive ? "text-primary" : "text-neo-text-tertiary"}`} />

        {isDragActive ? (
          <p className="text-primary font-medium">Drop files here...</p>
        ) : (
          <div>
            <p className="text-neo-text-primary font-medium mb-2">Drag & drop files here, or click to select</p>
            <p className="text-sm text-neo-text-secondary">
              Supports video and image files up to {formatFileSize(maxSize)}
            </p>
          </div>
        )}
      </div>

      {/* File List */}
      {uploadedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          {uploadedFiles.map((uploadedFile, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-neo-surface rounded-lg">
              <File className="w-5 h-5 text-neo-text-secondary flex-shrink-0" />

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neo-text-primary truncate">{uploadedFile.file.name}</p>
                <p className="text-xs text-neo-text-secondary">{formatFileSize(uploadedFile.file.size)}</p>

                {uploadedFile.status === "uploading" && <Progress value={uploadedFile.progress} className="h-1 mt-1" />}
              </div>

              <div className="flex items-center gap-2">
                {uploadedFile.status === "completed" && <CheckCircle className="w-5 h-5 text-success" />}
                {uploadedFile.status === "error" && <AlertCircle className="w-5 h-5 text-error" />}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="text-neo-text-secondary hover:text-error"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error Messages */}
      {uploadedFiles.some((f) => f.status === "error") && (
        <Alert className="mt-4 border-error bg-error/10">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription className="text-error">Some files failed to upload. Please try again.</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
