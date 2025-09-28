"use client"

import { useState, useEffect, useMemo } from 'react'
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { integrationsAPI } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { LoadingSpinner } from '@/components/ui/loading'

} from 'lucide-react'

  Play, 
  Search, 
  Clock, 
  FileVideo, 
  Folder, 
  Download,
  ExternalLink,
  CheckCircle,
  Filter
interface DriveFile {}
  id: string
  name: string
  mimeType: string
  size: number
  createdTime: string
  modifiedTime: string
  thumbnailLink?: string
  webViewLink: string
  parents: string[]
  owners: Array<{}
    displayName: string
    photoLink?: string
  }>
  duration?: number
  videoMediaMetadata?: {}
    width: number
    height: number
    durationMillis: number
  }
}

interface GoogleDriveVideoBrowserProps {}
  onVideoSelect: (file: DriveFile) => void
  onClose: () => void
  allowMultiple?: boolean
}

export function GoogleDriveVideoBrowser({onVideoSelect, 
  onClose,
  allowMultiple = false
}: GoogleDriveVideoBrowserProps) {}
  const [files, setFiles] = useState<DriveFile[]>([])
  const [selectedFiles, setSelectedFiles] = useState<DriveFile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentFolder, setCurrentFolder] = useState('root')
  const [folderPath, setFolderPath] = useState([{ id: 'root', name: 'My Drive' }])
  const [sortBy, setSortBy] = useState('modifiedTime')
  const { toast } = useToast()

  useEffect(() => {
    fetchFiles()
  }, [currentFolder, sortBy])

  const fetchFiles = async () => {
    try {
      setIsLoading(true)
      const response = await integrationsAPI.getGoogleDriveFiles({folder_id: currentFolder === 'root' ? undefined : currentFolder,
      })

      const mappedFiles = (response.files || []).map(file => ({}
        id: file.id,
        name: file.name,
        mimeType: file.mime_type,
        size: file.size,
        createdTime: file.metadata?.created_at ?? new Date().toISOString(),
        modifiedTime: file.metadata?.updated_at ?? new Date().toISOString(),
        thumbnailLink: file.thumbnail,
        webViewLink: file.url,
        parents: file.metadata?.parents ?? ['root'],
        owners: file.metadata?.owners ?? [],
        duration: file.metadata?.duration,
        videoMediaMetadata: file.metadata?.video,
      })) as DriveFile[]

      setFiles(mappedFiles)
    } catch (err) {
      toast({title: 'Error',
        description: 'Failed to load Google Drive files',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFolderClick = (folder: DriveFile) => {}
    setCurrentFolder(folder.id)
    setFolderPath(prev => [...prev, { id: folder.id, name: folder.name }])
    setSearchTerm('')
  }

  const handleBreadcrumbClick = (index: number) => {}
    const newPath = folderPath.slice(0, index + 1)
    setFolderPath(newPath)
    setCurrentFolder(newPath[newPath.length - 1].id)
    setSearchTerm('')
  }

  const handleFileSelect = (file: DriveFile) => {}
    if (file.mimeType === 'application/vnd.google-apps.folder') {
      handleFolderClick(file)
      return
    }

    if (allowMultiple) {
      setSelectedFiles(prev => {}
        const isSelected = prev.find(f => f.id === file.id)
        if (isSelected) {
          return prev.filter(f => f.id !== file.id)
        }
        return [...prev, file]
      })
    } else {}
      onVideoSelect(file)
    }
  }

  const handleConfirmSelection = () => {}
    if (selectedFiles.length > 0) {
      selectedFiles.forEach(file => onVideoSelect(file))
    }
  }

  const sortedFiles = useMemo(() => {}
    const next = [...files]

    switch (sortBy) {
      case 'name':
        next.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'createdTime':
        next.sort((a, b) => new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime())
        break
      case 'quotaBytesUsed':
        next.sort((a, b) => (b.size || 0) - (a.size || 0))
        break
      default:
        next.sort((a, b) => new Date(b.modifiedTime).getTime() - new Date(a.modifiedTime).getTime())
    }

    return next
  }, [files, sortBy])

  const filteredFiles = sortedFiles.filter(file =>
    searchTerm === '' ||
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const folders = filteredFiles.filter(file => 
    file.mimeType === 'application/vnd.google-apps.folder'
  )
  const videos = filteredFiles.filter(file => 
    file.mimeType.startsWith('video/')
  )

  const formatFileSize = (bytes: number) => {}
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDuration = (milliseconds: number) => {}
    const seconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    if (hours > 0) {
      return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`
    }
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`
  }

  return (
    <div className="max-w-4xl mx-auto h-[600px] flex flex-col">
      <Card className="flex-1 flex flex-col">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Image
              src="https://developers.google.com/drive/images/drive_icon.png"
              alt="Google Drive"
              fill
              className="w-6 h-6"
            />
              Select from Google Drive
            </CardTitle>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>

          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm">
            {folderPath.map((folder, index) => (
              <div key={folder.id} className="flex items-center gap-2">
                {index > 0 && <span className=&quot;text-gray-400&quot;>/</span>}
                <button
                  onClick={() => handleBreadcrumbClick(index)}
                  className="hover:text-blue-600 transition-colors"
                >
                  {folder.name}
                </button>
              </div>
            ))}
          </div>

          {/* Search and Controls */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="modifiedTime">Last Modified</option>
              <option value="name">Name</option>
              <option value="createdTime">Created</option>
              <option value="quotaBytesUsed">Size</option>
            </select>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <Tabs defaultValue="list" className="h-full flex flex-col">
              <TabsList className="mb-4">
                <TabsTrigger value="list">List View</TabsTrigger>
                <TabsTrigger value="grid">Grid View</TabsTrigger>
              </TabsList>

              <TabsContent value="list" className="flex-1 overflow-y-auto">
                <div className="space-y-2">
                  {/* Folders */}
                  {folders.map((folder) => (
                    <div
                      key={folder.id}
                      onClick={() => handleFileSelect(folder)}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                    >
                      <Folder className="w-8 h-8 text-blue-500" />
                      <div className="flex-1">
                        <h3 className="font-medium">{folder.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Modified {new Date(folder.modifiedTime).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Videos */}
                  {videos.map((video) => {}
                    const isSelected = selectedFiles.find(f => f.id === video.id)
                    return (
                      <div
                        key={video.id}
                        onClick={() => handleFileSelect(video)}
                        className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${}
                          isSelected
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        {isSelected && allowMultiple && (
                          <CheckCircle className="w-5 h-5 text-blue-500" />
                        )}
                        <div className="relative">
                          {video.thumbnailLink ? (
                            <img
                              src={video.thumbnailLink}
                              alt={video.name}
                              className="w-16 h-12 object-cover rounded border"
                            />
                          ) : (
                            <div className="w-16 h-12 bg-gray-200 dark:bg-gray-700 rounded border flex items-center justify-center">
                              <FileVideo className="w-6 h-6 text-gray-500" />
                            </div>
                          )}
                          {video.videoMediaMetadata?.durationMillis && (
                            <Badge variant="secondary" className="absolute bottom-1 right-1 text-xs">
                              {formatDuration(video.videoMediaMetadata.durationMillis)}
                            </Badge>
                          )}
                        </div>

                        <div className="flex-1">
                          <h3 className="font-medium truncate">{video.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <span>{formatFileSize(video.size)}</span>
                            {video.videoMediaMetadata && (
                              <span>
                                {video.videoMediaMetadata.width}×{video.videoMediaMetadata.height}
                              </span>
                            )}
                            <span>
                              {new Date(video.modifiedTime).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Avatar className="w-5 h-5">
                              <AvatarImage src={video.owners[0]?.photoLink} />
                              <AvatarFallback className="text-xs">
                                {video.owners[0]?.displayName?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-gray-500">
                              {video.owners[0]?.displayName}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </TabsContent>

              <TabsContent value="grid" className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {/* Folders in Grid */}
                  {folders.map((folder) => (
                    <Card
                      key={folder.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleFileSelect(folder)}
                    >
                      <CardContent className="p-4 text-center">
                        <Folder className="w-12 h-12 text-blue-500 mx-auto mb-2" />
                        <h3 className="font-medium truncate">{folder.name}</h3>
                      </CardContent>
                    </Card>
                  ))}

                  {/* Videos in Grid */}
                  {videos.map((video) => {}
                    const isSelected = selectedFiles.find(f => f.id === video.id)
                    return (
                      <Card
                        key={video.id}
                        className={`cursor-pointer hover:shadow-md transition-shadow ${}
                          isSelected ? 'ring-2 ring-blue-500' : ''
                        }`}
                        onClick={() => handleFileSelect(video)}
                      >
                        <CardContent className="p-4">
                          <div className="relative mb-2">
                            {video.thumbnailLink ? (
                              <img
                                src={video.thumbnailLink}
                                alt={video.name}
                                className="w-full h-24 object-cover rounded"
                              />
                            ) : (
                              <div className="w-full h-24 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                                <FileVideo className="w-8 h-8 text-gray-500" />
                              </div>
                            )}
                            {isSelected && allowMultiple && (
                              <CheckCircle className="absolute top-2 right-2 w-5 h-5 text-blue-500" />
                            )}
                            {video.videoMediaMetadata?.durationMillis && (
                              <Badge variant="secondary" className="absolute bottom-2 right-2 text-xs">
                                {formatDuration(video.videoMediaMetadata.durationMillis)}
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-medium truncate text-sm" title={video.name}>
                            {video.name}
                          </h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {formatFileSize(video.size)}
                          </p>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>

        {/* Footer */}
        {allowMultiple && (
          <div className="border-t p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
              </p>
              <Button
                onClick={handleConfirmSelection}
                disabled={selectedFiles.length === 0}
              >
                Add Selected Videos
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
