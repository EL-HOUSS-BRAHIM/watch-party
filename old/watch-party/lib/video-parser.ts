/**
 * Video source parsing utilities for Google Drive and S3
 */

interface ParsedVideoSource {
  type: 'gdrive' | 's3' | 'direct' | 'youtube' | 'vimeo' | 'unknown'
  id?: string
  url: string
  streamUrl?: string
  thumbnailUrl?: string
  title?: string
  isValid: boolean
  error?: string
}

export const videoParser = {
  /**
   * Parse any video URL and determine its type and streaming capabilities
   */
  parse: (url: string): ParsedVideoSource => {
    if (!url || typeof url !== 'string') {
      return {
        type: 'unknown',
        url: '',
        isValid: false,
        error: 'Invalid URL provided'
      }
    }

    const cleanUrl = url.trim()

    // Google Drive URLs
    if (videoParser.isGoogleDrive(cleanUrl)) {
      return videoParser.parseGoogleDrive(cleanUrl)
    }

    // Amazon S3 URLs
    if (videoParser.isS3(cleanUrl)) {
      return videoParser.parseS3(cleanUrl)
    }

    // YouTube URLs
    if (videoParser.isYouTube(cleanUrl)) {
      return videoParser.parseYouTube(cleanUrl)
    }

    // Vimeo URLs
    if (videoParser.isVimeo(cleanUrl)) {
      return videoParser.parseVimeo(cleanUrl)
    }

    // Direct video URLs
    if (videoParser.isDirectVideo(cleanUrl)) {
      return videoParser.parseDirect(cleanUrl)
    }

    return {
      type: 'unknown',
      url: cleanUrl,
      isValid: false,
      error: 'Unsupported video source'
    }
  },

  /**
   * Check if URL is from Google Drive
   */
  isGoogleDrive: (url: string): boolean => {
    return /drive\.google\.com|docs\.google\.com/.test(url)
  },

  /**
   * Parse Google Drive URLs
   */
  parseGoogleDrive: (url: string): ParsedVideoSource => {
    const fileIdMatch = url.match(/(?:file\/d\/|id=)([a-zA-Z0-9_-]+)/)
    
    if (!fileIdMatch) {
      return {
        type: 'gdrive',
        url,
        isValid: false,
        error: 'Could not extract Google Drive file ID'
      }
    }

    const fileId = fileIdMatch[1]
    const streamUrl = `https://drive.google.com/file/d/${fileId}/preview`
    const thumbnailUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w720-h405`

    return {
      type: 'gdrive',
      id: fileId,
      url,
      streamUrl,
      thumbnailUrl,
      isValid: true
    }
  },

  /**
   * Check if URL is from Amazon S3
   */
  isS3: (url: string): boolean => {
    return /\.s3\.amazonaws\.com|s3\.amazonaws\.com|\.s3-/.test(url) || 
           /\.amazonaws\.com/.test(url)
  },

  /**
   * Parse Amazon S3 URLs
   */
  parseS3: (url: string): ParsedVideoSource => {
    try {
      const urlObj = new URL(url)
      const pathParts = urlObj.pathname.split('/')
      const fileName = pathParts[pathParts.length - 1]
      
      if (!fileName || !videoParser.isVideoFile(fileName)) {
        return {
          type: 's3',
          url,
          isValid: false,
          error: 'Not a valid video file'
        }
      }

      return {
        type: 's3',
        url,
        streamUrl: url,
        title: fileName.replace(/\.[^/.]+$/, ''), // Remove extension
        isValid: true
      }
    } catch (error) {
      return {
        type: 's3',
        url,
        isValid: false,
        error: 'Invalid S3 URL format'
      }
    }
  },

  /**
   * Check if URL is from YouTube
   */
  isYouTube: (url: string): boolean => {
    return /youtube\.com|youtu\.be/.test(url)
  },

  /**
   * Parse YouTube URLs
   */
  parseYouTube: (url: string): ParsedVideoSource => {
    const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)
    
    if (!videoIdMatch) {
      return {
        type: 'youtube',
        url,
        isValid: false,
        error: 'Could not extract YouTube video ID'
      }
    }

    const videoId = videoIdMatch[1]
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`

    return {
      type: 'youtube',
      id: videoId,
      url,
      streamUrl: `https://www.youtube.com/embed/${videoId}`,
      thumbnailUrl,
      isValid: true
    }
  },

  /**
   * Check if URL is from Vimeo
   */
  isVimeo: (url: string): boolean => {
    return /vimeo\.com/.test(url)
  },

  /**
   * Parse Vimeo URLs
   */
  parseVimeo: (url: string): ParsedVideoSource => {
    const videoIdMatch = url.match(/vimeo\.com\/([0-9]+)/)
    
    if (!videoIdMatch) {
      return {
        type: 'vimeo',
        url,
        isValid: false,
        error: 'Could not extract Vimeo video ID'
      }
    }

    const videoId = videoIdMatch[1]

    return {
      type: 'vimeo',
      id: videoId,
      url,
      streamUrl: `https://player.vimeo.com/video/${videoId}`,
      isValid: true
    }
  },

  /**
   * Check if URL is a direct video file
   */
  isDirectVideo: (url: string): boolean => {
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.wmv', '.flv', '.m4v']
    return videoExtensions.some(ext => url.toLowerCase().includes(ext))
  },

  /**
   * Parse direct video URLs
   */
  parseDirect: (url: string): ParsedVideoSource => {
    try {
      const urlObj = new URL(url)
      const fileName = urlObj.pathname.split('/').pop() || ''
      
      return {
        type: 'direct',
        url,
        streamUrl: url,
        title: fileName.replace(/\.[^/.]+$/, ''),
        isValid: true
      }
    } catch (error) {
      return {
        type: 'direct',
        url,
        isValid: false,
        error: 'Invalid direct video URL'
      }
    }
  },

  /**
   * Check if filename has video extension
   */
  isVideoFile: (filename: string): boolean => {
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.wmv', '.flv', '.m4v', '.mkv']
    const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'))
    return videoExtensions.includes(ext)
  },

  /**
   * Get optimized streaming URL based on video source
   */
  getStreamingUrl: (source: ParsedVideoSource): string | null => {
    if (!source.isValid) return null

    switch (source.type) {
      case 'gdrive':
        return `https://drive.google.com/file/d/${source.id}/preview?autoplay=1`
      case 's3':
      case 'direct':
        return source.url
      case 'youtube':
        return `https://www.youtube.com/embed/${source.id}?autoplay=1&controls=1`
      case 'vimeo':
        return `https://player.vimeo.com/video/${source.id}?autoplay=1`
      default:
        return null
    }
  },

  /**
   * Validate video URL accessibility
   */
  validateAccess: async (url: string): Promise<{ isAccessible: boolean; error?: string }> => {
    try {
      const response = await fetch(url, { 
        method: 'HEAD',
        mode: 'no-cors' // Avoid CORS issues for validation
      })
      
      return { isAccessible: true }
    } catch (error) {
      return { 
        isAccessible: false, 
        error: 'Video URL is not accessible or requires authentication'
      }
    }
  }
}
