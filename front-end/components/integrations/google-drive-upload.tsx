'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  Cloud, 
  File, 
  FolderOpen, 
  CheckCircle, 
  AlertCircle,
  X,
  Settings,
  Info
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface UploadFile {
  id: string;
  file: File;
  name: string;
  size: number;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  driveFileId?: string;
  driveUrl?: string;
  error?: string;
}

interface DriveFolder {
  id: string;
  name: string;
  path: string;
  parentId?: string;
}

interface UploadSettings {
  folder: string;
  privacy: 'private' | 'unlisted' | 'public';
  autoConvert: boolean;
  generateThumbnails: boolean;
  notifyOnComplete: boolean;
  maxFileSize: number; // MB
  allowedFormats: string[];
}

const defaultSettings: UploadSettings = {
  folder: 'root',
  privacy: 'private',
  autoConvert: true,
  generateThumbnails: true,
  notifyOnComplete: true,
  maxFileSize: 500,
  allowedFormats: ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v'],
};

const mockFolders: DriveFolder[] = [
  { id: 'root', name: 'My Drive', path: '/' },
  { id: 'videos', name: 'Videos', path: '/Videos', parentId: 'root' },
  { id: 'movies', name: 'Movies', path: '/Videos/Movies', parentId: 'videos' },
  { id: 'reviews', name: 'Movie Reviews', path: '/Videos/Reviews', parentId: 'videos' },
  { id: 'personal', name: 'Personal', path: '/Personal', parentId: 'root' },
];

export default function GoogleDriveUpload() {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [settings, setSettings] = useState<UploadSettings>(defaultSettings);
  const [folders, setFolders] = useState<DriveFolder[]>(mockFolders);
  const [isUploading, setIsUploading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isConnected, setIsConnected] = useState(true); // Assume connected for demo

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadFile[] = acceptedFiles.map(file => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      size: file.size,
      progress: 0,
      status: 'pending',
    }));

    // Validate files
    const validFiles = newFiles.filter(file => {
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      const isValidFormat = settings.allowedFormats.includes(extension);
      const isValidSize = file.size <= settings.maxFileSize * 1024 * 1024;

      if (!isValidFormat) {
        toast({
          title: "Invalid file format",
          description: `${file.name} is not a supported video format.`,
          variant: "destructive",
        });
        return false;
      }

      if (!isValidSize) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds the ${settings.maxFileSize}MB limit.`,
          variant: "destructive",
        });
        return false;
      }

      return true;
    });

    setUploadFiles(prev => [...prev, ...validFiles]);
  }, [settings.allowedFormats, settings.maxFileSize]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': settings.allowedFormats,
    },
    multiple: true,
  });

  const removeFile = (fileId: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const uploadToGoogleDrive = async (file: UploadFile) => {
    try {
      // Simulate upload progress
      const simulateProgress = () => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 15;
          if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            
            setUploadFiles(prev => prev.map(f => 
              f.id === file.id 
                ? { 
                    ...f, 
                    progress: 100, 
                    status: 'completed',
                    driveFileId: 'mock-drive-id-' + Date.now(),
                    driveUrl: `https://drive.google.com/file/d/mock-drive-id-${Date.now()}/view`,
                  }
                : f
            ));

            if (settings.notifyOnComplete) {
              toast({
                title: "Upload completed",
                description: `${file.name} has been uploaded to Google Drive.`,
              });
            }
          } else {
            setUploadFiles(prev => prev.map(f => 
              f.id === file.id ? { ...f, progress, status: 'uploading' as const } : f
            ));
          }
        }, 200);
      };

      // Start upload simulation
      setUploadFiles(prev => prev.map(f => 
        f.id === file.id ? { ...f, status: 'uploading' } : f
      ));
      
      simulateProgress();

      // In a real implementation, you would:
      // 1. Get Google Drive API access token
      // 2. Create resumable upload session
      // 3. Upload file chunks with progress tracking
      // 4. Handle errors and retries
      
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadFiles(prev => prev.map(f => 
        f.id === file.id 
          ? { ...f, status: 'error', error: 'Upload failed. Please try again.' }
          : f
      ));
    }
  };

  const startUploads = async () => {
    if (!isConnected) {
      toast({
        title: "Not connected",
        description: "Please connect to Google Drive first.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    const pendingFiles = uploadFiles.filter(f => f.status === 'pending');
    
    for (const file of pendingFiles) {
      await uploadToGoogleDrive(file);
    }
    
    setIsUploading(false);
  };

  const connectToGoogleDrive = () => {
    // In a real implementation, this would initiate OAuth flow
    toast({
      title: "Connected to Google Drive",
      description: "You can now upload videos to your Google Drive.",
    });
    setIsConnected(true);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <File className="h-4 w-4 text-gray-500" />;
    }
  };

  const totalFiles = uploadFiles.length;
  const completedFiles = uploadFiles.filter(f => f.status === 'completed').length;
  const errorFiles = uploadFiles.filter(f => f.status === 'error').length;
  const overallProgress = totalFiles > 0 ? (completedFiles / totalFiles) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Upload to Google Drive</h1>
          <p className="text-muted-foreground">
            Upload your videos directly to Google Drive for easy sharing
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showSettings} onOpenChange={setShowSettings}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Destination Folder</Label>
                  <Select 
                    value={settings.folder} 
                    onValueChange={(value) => setSettings({...settings, folder: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {folders.map(folder => (
                        <SelectItem key={folder.id} value={folder.id}>
                          {folder.path}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Privacy Setting</Label>
                  <Select 
                    value={settings.privacy} 
                    onValueChange={(value) => setSettings({...settings, privacy: value as UploadSettings['privacy']})}
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

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Auto-convert to web-friendly format</Label>
                    <Switch 
                      checked={settings.autoConvert}
                      onCheckedChange={(checked) => setSettings({...settings, autoConvert: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Generate thumbnails</Label>
                    <Switch 
                      checked={settings.generateThumbnails}
                      onCheckedChange={(checked) => setSettings({...settings, generateThumbnails: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Notify when complete</Label>
                    <Switch 
                      checked={settings.notifyOnComplete}
                      onCheckedChange={(checked) => setSettings({...settings, notifyOnComplete: checked})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Max file size (MB)</Label>
                  <Input 
                    type="number"
                    value={settings.maxFileSize}
                    onChange={(e) => setSettings({...settings, maxFileSize: parseInt(e.target.value) || 500})}
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          {!isConnected && (
            <Button onClick={connectToGoogleDrive}>
              <Cloud className="h-4 w-4 mr-2" />
              Connect to Drive
            </Button>
          )}
        </div>
      </div>

      {/* Connection Status */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Cloud className={`h-5 w-5 ${isConnected ? 'text-green-500' : 'text-gray-400'}`} />
              <div>
                <div className="font-medium">
                  Google Drive {isConnected ? 'Connected' : 'Not Connected'}
                </div>
                <div className="text-sm text-muted-foreground">
                  {isConnected 
                    ? `Uploading to: ${folders.find(f => f.id === settings.folder)?.path || 'My Drive'}`
                    : 'Connect your Google Drive account to upload videos'
                  }
                </div>
              </div>
            </div>
            <Badge variant={isConnected ? 'default' : 'secondary'}>
              {isConnected ? 'Ready' : 'Disconnected'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Videos</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            {isDragActive ? (
              <p className="text-lg font-medium">Drop files here...</p>
            ) : (
              <div>
                <p className="text-lg font-medium mb-2">
                  Drag & drop videos here, or click to select
                </p>
                <p className="text-sm text-muted-foreground">
                  Supports: {settings.allowedFormats.join(', ')} 
                  • Max size: {settings.maxFileSize}MB per file
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upload Queue */}
      {uploadFiles.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Upload Queue ({uploadFiles.length} files)</CardTitle>
              <div className="flex gap-2">
                <Button
                  onClick={startUploads}
                  disabled={isUploading || !isConnected}
                >
                  {isUploading ? 'Uploading...' : 'Start Upload'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setUploadFiles([])}
                  disabled={isUploading}
                >
                  Clear All
                </Button>
              </div>
            </div>
            
            {totalFiles > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall Progress</span>
                  <span>{completedFiles}/{totalFiles} completed</span>
                </div>
                <Progress value={overallProgress} className="h-2" />
                {errorFiles > 0 && (
                  <div className="text-sm text-red-600">
                    {errorFiles} file(s) failed to upload
                  </div>
                )}
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {uploadFiles.map((file) => (
                <div key={file.id} className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="flex-shrink-0">
                    {getStatusIcon(file.status)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium truncate">{file.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {formatFileSize(file.size)}
                      </span>
                    </div>
                    
                    {file.status === 'uploading' && (
                      <div className="space-y-1">
                        <Progress value={file.progress} className="h-1" />
                        <div className="text-xs text-muted-foreground">
                          {file.progress.toFixed(0)}% uploaded
                        </div>
                      </div>
                    )}
                    
                    {file.status === 'completed' && file.driveUrl && (
                      <div className="text-xs text-green-600">
                        ✓ Uploaded to Google Drive
                      </div>
                    )}
                    
                    {file.status === 'error' && (
                      <div className="text-xs text-red-600">
                        ✗ {file.error || 'Upload failed'}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    {file.status === 'completed' && file.driveUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(file.driveUrl, '_blank')}
                      >
                        <FolderOpen className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    )}
                    
                    {file.status === 'error' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => uploadToGoogleDrive(file)}
                      >
                        Retry
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.id)}
                      disabled={file.status === 'uploading'}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Upload Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Videos are uploaded directly to your Google Drive account</li>
            <li>• Use the settings to organize uploads into specific folders</li>
            <li>• Enable auto-conversion for better web compatibility</li>
            <li>• Large files may take several minutes to upload depending on your connection</li>
            <li>• You can share uploaded videos directly from Google Drive</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
