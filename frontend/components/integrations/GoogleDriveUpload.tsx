'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Upload, 
  File, 
  Video, 
  Image, 
  X, 
  Check, 
  AlertCircle,
  Cloud,
  HardDrive,
  Eye,
  FolderOpen
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { toast } from '@/hooks/use-toast';

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  uploadMethod: 's3' | 'gdrive';
  thumbnail?: string;
  metadata?: {
    title: string;
    description: string;
    tags: string[];
    visibility: 'public' | 'private' | 'unlisted';
  };
}

interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  thumbnailLink?: string;
  webViewLink: string;
  parents: string[];
}

export default function GoogleDriveUpload() {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [driveFiles, setDriveFiles] = useState<GoogleDriveFile[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>('root');
  const [uploadMethod, setUploadMethod] = useState<'s3' | 'gdrive'>('s3');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadFile[] = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      status: 'pending',
      uploadMethod,
      metadata: {
        title: file.name.replace(/\.[^/.]+$/, ''),
        description: '',
        tags: [],
        visibility: 'private'
      }
    }));
    
    setUploadFiles(prev => [...prev, ...newFiles]);
  }, [uploadMethod]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm'],
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    },
    maxSize: 500 * 1024 * 1024 // 500MB
  });

  const connectToGoogleDrive = async () => {
    try {
      // Mock Google Drive OAuth flow
      // In real implementation, this would use Google's OAuth2 flow
      setTimeout(() => {
        setIsConnected(true);
        loadDriveFiles();
        toast({
          title: "Connected to Google Drive",
          description: "Successfully connected to your Google Drive account.",
        });
      }, 1000);
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Google Drive. Please try again.",
        variant: "destructive",
      });
    }
  };

  const loadDriveFiles = async () => {
    // Mock Google Drive API call
    const mockFiles: GoogleDriveFile[] = [
      {
        id: '1',
        name: 'Movie Night.mp4',
        mimeType: 'video/mp4',
        size: 1024 * 1024 * 150,
        thumbnailLink: '/placeholder.jpg',
        webViewLink: 'https://drive.google.com/file/d/1',
        parents: ['root']
      },
      {
        id: '2',
        name: 'Comedy Show.avi',
        mimeType: 'video/avi',
        size: 1024 * 1024 * 200,
        webViewLink: 'https://drive.google.com/file/d/2',
        parents: ['root']
      },
      {
        id: '3',
        name: 'Documentary.mkv',
        mimeType: 'video/x-matroska',
        size: 1024 * 1024 * 300,
        webViewLink: 'https://drive.google.com/file/d/3',
        parents: ['root']
      }
    ];
    
    setDriveFiles(mockFiles);
  };

  const uploadFile = async (fileData: UploadFile) => {
    setUploadFiles(prev => prev.map(f => 
      f.id === fileData.id ? { ...f, status: 'uploading' } : f
    ));

    // Mock upload progress
    const progressInterval = setInterval(() => {
      setUploadFiles(prev => prev.map(f => {
        if (f.id === fileData.id && f.progress < 100) {
          const newProgress = Math.min(f.progress + Math.random() * 15, 100);
          
          if (newProgress >= 100) {
            clearInterval(progressInterval);
            return { ...f, progress: 100, status: 'processing' };
          }
          
          return { ...f, progress: newProgress };
        }
        return f;
      }));
    }, 200);

    // Mock processing completion
    setTimeout(() => {
      setUploadFiles(prev => prev.map(f => 
        f.id === fileData.id ? { ...f, status: 'completed' } : f
      ));
      
      toast({
        title: "Upload Complete",
        description: `${fileData.file.name} has been uploaded successfully.`,
      });
    }, 5000);
  };

  const uploadToGoogleDrive = async (fileData: UploadFile) => {
    try {
      setUploadFiles(prev => prev.map(f => 
        f.id === fileData.id ? { ...f, status: 'uploading' } : f
      ));

      // Mock Google Drive upload
      const progressInterval = setInterval(() => {
        setUploadFiles(prev => prev.map(f => {
          if (f.id === fileData.id && f.progress < 100) {
            const newProgress = Math.min(f.progress + Math.random() * 10, 100);
            
            if (newProgress >= 100) {
              clearInterval(progressInterval);
              return { ...f, progress: 100, status: 'completed' };
            }
            
            return { ...f, progress: newProgress };
          }
          return f;
        }));
      }, 300);

      setTimeout(() => {
        // Add to drive files list
        const newDriveFile: GoogleDriveFile = {
          id: Date.now().toString(),
          name: fileData.file.name,
          mimeType: fileData.file.type,
          size: fileData.file.size,
          webViewLink: `https://drive.google.com/file/d/${Date.now()}`,
          parents: [selectedFolder]
        };
        
        setDriveFiles(prev => [newDriveFile, ...prev]);
        
        toast({
          title: "Uploaded to Google Drive",
          description: `${fileData.file.name} has been uploaded to Google Drive.`,
        });
      }, 3000);
    } catch (error) {
      setUploadFiles(prev => prev.map(f => 
        f.id === fileData.id ? { ...f, status: 'error' } : f
      ));
      
      toast({
        title: "Upload Failed",
        description: "Failed to upload to Google Drive. Please try again.",
        variant: "destructive",
      });
    }
  };

  const removeFile = (id: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== id));
  };

  const updateFileMetadata = (id: string, metadata: Partial<UploadFile['metadata']>) => {
    setUploadFiles(prev => prev.map(f => 
      f.id === id ? { ...f, metadata: { ...f.metadata, ...metadata } } : f
    ));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('video/')) return <Video className="w-5 h-5 text-blue-500" />;
    if (mimeType.startsWith('image/')) return <Image className="w-5 h-5 text-green-500" />;
    return <File className="w-5 h-5 text-gray-500" />;
  };

  const getStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case 'completed': return <Check className="w-4 h-4 text-green-500" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Method Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Destination</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div 
              className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                uploadMethod === 's3' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200'
              }`}
              onClick={() => setUploadMethod('s3')}
            >
              <div className="flex items-center space-x-3">
                <HardDrive className="w-6 h-6 text-blue-500" />
                <div>
                  <h3 className="font-medium">Watch Party Storage</h3>
                  <p className="text-sm text-muted-foreground">Fast, reliable hosting</p>
                </div>
              </div>
            </div>
            
            <div 
              className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                uploadMethod === 'gdrive' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-200'
              }`}
              onClick={() => setUploadMethod('gdrive')}
            >
              <div className="flex items-center space-x-3">
                <Cloud className="w-6 h-6 text-green-500" />
                <div>
                  <h3 className="font-medium">Google Drive</h3>
                  <p className="text-sm text-muted-foreground">Stream from your drive</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Google Drive Integration */}
      {uploadMethod === 'gdrive' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Cloud className="w-5 h-5" />
              <span>Google Drive Integration</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!isConnected ? (
              <div className="text-center py-8">
                <Cloud className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Connect to Google Drive</h3>
                <p className="text-muted-foreground mb-4">
                  Connect your Google Drive account to upload and stream videos directly
                </p>
                <Button onClick={connectToGoogleDrive}>
                  <Cloud className="w-4 h-4 mr-2" />
                  Connect Google Drive
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="font-medium">Connected to Google Drive</span>
                  </div>
                  <Button variant="outline" size="sm">
                    <FolderOpen className="w-4 h-4 mr-2" />
                    Browse Files
                  </Button>
                </div>

                {/* Drive Files */}
                {driveFiles.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Your Drive Videos</h4>
                    <div className="space-y-2">
                      {driveFiles.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            {getFileIcon(file.mimeType)}
                            <div>
                              <p className="font-medium">{file.name}</p>
                              <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              Preview
                            </Button>
                            <Button size="sm">
                              Use in Party
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* File Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Files</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            {isDragActive ? (
              <p className="text-blue-600">Drop the files here...</p>
            ) : (
              <div>
                <p className="text-lg font-medium mb-2">
                  Drag & drop files here, or click to select
                </p>
                <p className="text-muted-foreground">
                  Supports MP4, AVI, MOV, WMV, FLV, WebM up to 500MB
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {uploadFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {uploadFiles.map((fileData) => (
                <div key={fileData.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3 flex-1">
                      {getFileIcon(fileData.file.type)}
                      <div className="flex-1">
                        <p className="font-medium">{fileData.file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(fileData.file.size)} • 
                          {fileData.uploadMethod === 'gdrive' ? ' Google Drive' : ' Watch Party Storage'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(fileData.status)}
                      <Badge variant={
                        fileData.status === 'completed' ? 'default' :
                        fileData.status === 'error' ? 'destructive' :
                        'secondary'
                      }>
                        {fileData.status}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(fileData.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {fileData.status === 'uploading' && (
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Uploading...</span>
                        <span>{Math.round(fileData.progress)}%</span>
                      </div>
                      <Progress value={fileData.progress} className="h-2" />
                    </div>
                  )}

                  {fileData.status === 'pending' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`title-${fileData.id}`}>Title</Label>
                          <Input
                            id={`title-${fileData.id}`}
                            value={fileData.metadata?.title || ''}
                            onChange={(e) => updateFileMetadata(fileData.id, { title: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`visibility-${fileData.id}`}>Visibility</Label>
                          <Select 
                            value={fileData.metadata?.visibility} 
                            onValueChange={(value: any) => updateFileMetadata(fileData.id, { visibility: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="private">Private</SelectItem>
                              <SelectItem value="unlisted">Unlisted</SelectItem>
                              <SelectItem value="public">Public</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor={`description-${fileData.id}`}>Description</Label>
                        <Textarea
                          id={`description-${fileData.id}`}
                          value={fileData.metadata?.description || ''}
                          onChange={(e) => updateFileMetadata(fileData.id, { description: e.target.value })}
                          rows={2}
                        />
                      </div>

                      <div className="flex space-x-2">
                        <Button 
                          onClick={() => 
                            fileData.uploadMethod === 'gdrive' 
                              ? uploadToGoogleDrive(fileData)
                              : uploadFile(fileData)
                          }
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Start Upload
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
