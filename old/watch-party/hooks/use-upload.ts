'use client'

import { useState, useCallback } from 'react'

interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

interface UploadOptions {
  maxSize?: number // in bytes
  allowedTypes?: string[]
  onProgress?: (progress: UploadProgress) => void
  onSuccess?: (url: string) => void
  onError?: (error: string) => void
}

interface UseUploadReturn {
  upload: (file: File, options?: UploadOptions) => Promise<string>
  uploadMultiple: (files: File[], options?: UploadOptions) => Promise<string[]>
  isUploading: boolean
  progress: UploadProgress | null
  error: string | null
  abort: () => void
}

export function useUpload(): UseUploadReturn {
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState<UploadProgress | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [abortController, setAbortController] = useState<AbortController | null>(null)

  const validateFile = (file: File, options?: UploadOptions) => {
    // Check file size
    if (options?.maxSize && file.size > options.maxSize) {
      throw new Error(`File size exceeds ${Math.round(options.maxSize / (1024 * 1024))}MB limit`)
    }

    // Check file type
    if (options?.allowedTypes && !options.allowedTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} is not allowed`)
    }
  }

  const upload = useCallback(async (file: File, options?: UploadOptions): Promise<string> => {
    try {
      setIsUploading(true)
      setError(null)
      setProgress(null)

      // Validate file
      validateFile(file, options)

      // Create new abort controller
      const controller = new AbortController()
      setAbortController(controller)

      const formData = new FormData()
      formData.append('file', file)

      // Create XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest()
      
      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progressData = {
              loaded: e.loaded,
              total: e.total,
              percentage: Math.round((e.loaded / e.total) * 100)
            }
            setProgress(progressData)
            options?.onProgress?.(progressData)
          }
        })

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const response = JSON.parse(xhr.responseText)
            const url = response.url || response.fileUrl
            options?.onSuccess?.(url)
            resolve(url)
          } else {
            const errorMessage = `Upload failed with status ${xhr.status}`
            setError(errorMessage)
            options?.onError?.(errorMessage)
            reject(new Error(errorMessage))
          }
        })

        xhr.addEventListener('error', () => {
          const errorMessage = 'Upload failed due to network error'
          setError(errorMessage)
          options?.onError?.(errorMessage)
          reject(new Error(errorMessage))
        })

        xhr.addEventListener('abort', () => {
          const errorMessage = 'Upload was cancelled'
          setError(errorMessage)
          reject(new Error(errorMessage))
        })

        // Handle abort signal
        controller.signal.addEventListener('abort', () => {
          xhr.abort()
        })

        xhr.open('POST', '/api/upload')
        xhr.send(formData)
      })

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed'
      setError(errorMessage)
      options?.onError?.(errorMessage)
      throw err
    } finally {
      setIsUploading(false)
      setAbortController(null)
    }
  }, [])

  const uploadMultiple = useCallback(async (files: File[], options?: UploadOptions): Promise<string[]> => {
    const uploadPromises = files.map(file => upload(file, options))
    return Promise.all(uploadPromises)
  }, [upload])

  const abort = useCallback(() => {
    if (abortController) {
      abortController.abort()
      setAbortController(null)
    }
  }, [abortController])

  return {
    upload,
    uploadMultiple,
    isUploading,
    progress,
    error,
    abort,
  }
}

// Utility function for common file validations
export const uploadPresets = {
  image: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  },
  video: {
    maxSize: 500 * 1024 * 1024, // 500MB
    allowedTypes: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv']
  },
  document: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['application/pdf', 'text/plain', 'application/msword']
  }
}
