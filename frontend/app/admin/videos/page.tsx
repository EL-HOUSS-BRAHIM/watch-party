import { AlertTriangle, Check, CheckCircle, Clock, Eye, EyeOff, Flag, Search, Video } from "lucide-react"
import { useState, useEffect } from 'react';
import Image from "next/image"
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { adminAPI, videosAPI } from '@/lib/api';

'use client';
interface VideoContent {}
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: number;
  uploadDate: string;
  uploader: {}
    id: string;
    username: string;
    displayName: string;
    avatar: string;
  };
  status: 'pending' | 'approved' | 'rejected' | 'flagged' | 'removed';
  moderationFlags: Array<{}
    id: string;
    type: 'inappropriate' | 'copyright' | 'spam' | 'violence' | 'adult_content' | 'hate_speech';
    reporter: string;
    timestamp: string;
    reason: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  aiAnalysis?: {}
    contentScore: number;
    categories: string[];
    confidence: number;
    suggestedAction: 'approve' | 'review' | 'reject';
    detectedObjects: string[];
    audioAnalysis?: {}
      language: string;
      profanityScore: number;
      sentiment: number;
    };
  };
  views: number;
  likes: number;
  comments: number;
  reports: number;
  lastModerated?: string;
  moderatedBy?: string;
  moderationNotes?: string;
}

export default function VideoModerationPage() {}
  const [videos, setVideos] = useState<VideoContent[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoContent | null>(null);
  const [filter, setFilter] = useState<'all' | VideoContent['status']>(&apos;all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'reports' | 'views'>(&apos;date');
  const [showModerationDialog, setShowModerationDialog] = useState(false);
  const [moderationAction, setModerationAction] = useState<'approve' | 'reject' | 'flag'>(&apos;approve');
  const [moderationNotes, setModerationNotes] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {}
    fetchVideos();
  }, []);

  const fetchVideos = async () => {}
    setLoading(true);
    try {}
      // Fetch videos data from admin API;
      const videosData = await adminAPI.getVideos({search: searchTerm,
        status: filter === 'all' ? undefined : (filter as 'active' | 'processing' | 'failed'),
        page: 1;
      });

      // Transform API data to component format;
      const transformedVideos: VideoContent[] = (videosData.results || []).map((video: unknown) => ({}
        id: video.id,
        title: video.title,
        description: video.description,
        thumbnail: video.thumbnail_url || '/placeholder.jpg',
        duration: video.duration_seconds || 0,
        uploadDate: video.created_at,
        uploader: {}
          id: video.uploader?.id || '',
          username: video.uploader?.username || 'unknown',
          displayName: video.uploader?.display_name || 'Unknown User',
          avatar: video.uploader?.avatar_url || '/placeholder-user.jpg',
        },
        status: video.moderation_status === 'approved' ? 'approved' : 
                video.moderation_status === 'rejected' ? 'rejected' :
                video.moderation_status === 'flagged' ? 'flagged' :
                video.moderation_status === 'removed' ? 'removed' : 'pending',
        moderationFlags: video.moderation_flags?.map((flag: unknown) => ({}
          id: flag.id,
          type: flag.flag_type,
          reporter: flag.reporter?.username || 'system',
          timestamp: flag.created_at,
          reason: flag.reason,
          severity: flag.severity || 'medium',
        })) || [],
        aiAnalysis: video.ai_analysis ? {}
          contentScore: video.ai_analysis.content_score || 0,
          categories: video.ai_analysis.categories || [],
          confidence: video.ai_analysis.confidence || 0,
          suggestedAction: video.ai_analysis.suggested_action || 'review',
          detectedObjects: video.ai_analysis.detected_objects || [],
          audioAnalysis: video.ai_analysis.audio_analysis ? {}
            language: video.ai_analysis.audio_analysis.language,
            profanityScore: video.ai_analysis.audio_analysis.profanity_score,
            sentiment: video.ai_analysis.audio_analysis.sentiment,
          } : undefined,
        } : undefined,
        views: video.view_count || 0,
        likes: video.like_count || 0,
        comments: video.comment_count || 0,
        reports: video.report_count || 0,
        lastModerated: video.last_moderated_at,
        moderatedBy: video.moderated_by?.username,
        moderationNotes: video.moderation_notes,
      })) || [];

      setVideos(transformedVideos);
    } catch {}
      console.error('Failed to fetch videos:', error);
      toast({title: "Error",
        description: "Failed to load videos. Please try again.",
        variant: "destructive",
      });
    } finally {}
      setLoading(false);
    }
  };

  const filteredVideos = videos;
    .filter(video => {}
      if (filter !== 'all' && video.status !== filter) return false;
      if (searchTerm && !video.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !video.uploader.displayName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {}
      switch (sortBy) {}
        case 'reports':
          return b.reports - a.reports;
        case 'views':
          return b.views - a.views;
        default:
          return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
      }
    });

  const getStatusColor = (status: VideoContent['status']) => {}
    switch (status) {}
      case 'pending': return 'bg-yellow-500';
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      case 'flagged': return 'bg-orange-500';
      case 'removed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: VideoContent['status']) => {}
    switch (status) {}
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <Ban className="h-4 w-4" />;
      case 'flagged': return <Flag className="h-4 w-4" />;
      case 'removed': return <EyeOff className="h-4 w-4" />;
      default: return <Video className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: 'low' | 'medium' | 'high') => {}
    switch (severity) {}
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatDuration = (seconds: number) => {}
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const moderateVideo = async (videoId: string, action: 'approve' | 'reject' | 'flag', notes: string) => {}
    try {}
      // Call admin API to moderate video;
      if (action === 'reject') {}
        await adminAPI.deleteVideo(videoId);
      } else {}
        // For approve/flag, we'd need an appropriate API endpoint;
        // For now, we'll simulate the action;
        console.log(`Moderating video ${videoId} with action: ${action}`);
      }

      const newStatus: VideoContent['status'] = 
        action === 'approve' ? 'approved' :
        action === 'reject' ? 'rejected' : 'flagged';

      setVideos(videos.map(video => 
        video.id === videoId;
          ? {}
              ...video, 
              status: newStatus,
              lastModerated: new Date().toISOString(),
              moderatedBy: 'current_admin',
              moderationNotes: notes,
            }
          : video;
      ));

      toast({title: "Video moderated",
        description: `Video has been ${action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'flagged'}.`,
      });

      setShowModerationDialog(false);
      setSelectedVideo(null);
      setModerationNotes('');
    } catch {}
      console.error('Failed to moderate video:', error);
      toast({title: "Error",
        description: "Failed to moderate video. Please try again.",
        variant: "destructive",
      });
    }
  };

  const bulkModerate = async (action: 'approve' | 'reject', videoIds: string[]) => {}
    // Implement bulk moderation;
    console.log(`Bulk ${action}:`, videoIds);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Video Moderation</h1>
          <p className="text-muted-foreground">Review and moderate user-uploaded content</p>
        </div>
        <div className="flex gap-4">
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            {videos.filter(v => v.status === &apos;pending').length} Pending Review;
          </Badge>
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            {videos.filter(v => v.status === &apos;flagged').length} Flagged;
          </Badge>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input;
            placeholder="Search videos or uploaders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filter} onValueChange={(value) => setFilter(value as typeof filter)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Videos</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="flagged">Flagged</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="removed">Removed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Upload Date</SelectItem>
            <SelectItem value="reports">Report Count</SelectItem>
            <SelectItem value="views">View Count</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Video List */}
      <div className="space-y-4">
        {filteredVideos.map((video) => (
          <Card key={video.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex gap-4">
                {/* Thumbnail */}
                <div className="relative w-32 h-20 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                  <img;
                    src={video.thumbnail} 
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-1 right-1 bg-black bg-opacity-75 text-white text-xs px-1 rounded">
                    {formatDuration(video.duration)}
                  </div>
                  {video.status === 'flagged' && (
                    <div className="absolute top-1 left-1">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-lg mb-1 truncate">{video.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {video.description}
                      </p>
                    </div>
                    <Badge;
                      variant="secondary" 
                      className={`${getStatusColor(video.status)} text-white ml-4`}
                    >
                      {getStatusIcon(video.status)}
                      <span className="ml-1 capitalize">{video.status}</span>
                    </Badge>
                  </div>

                  {/* Uploader Info */}
                  <div className="flex items-center gap-2 mb-3">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={video.uploader.avatar} alt={video.uploader.displayName} />
                      <AvatarFallback>
                        {video.uploader.displayName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{video.uploader.displayName}</span>
                    <span className="text-sm text-muted-foreground">
                      @{video.uploader.username}
                    </span>
                    <span className="text-sm text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(video.uploadDate).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {video.views.toLocaleString()} views;
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      {video.comments} comments;
                    </div>
                    {video.reports > 0 && (
                      <div className="flex items-center gap-1 text-red-600">
                        <Flag className="h-4 w-4" />
                        {video.reports} reports;
                      </div>
                    )}
                  </div>

                  {/* AI Analysis */}
                  {video.aiAnalysis && (
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium">AI Analysis:</span>
                        <Badge variant="outline">
                          Score: {video.aiAnalysis.contentScore}/10;
                        </Badge>
                        <Badge variant="outline">
                          Confidence: {(video.aiAnalysis.confidence * 100).toFixed(0)}%
                        </Badge>
                        <Badge;
                          variant={}
                            video.aiAnalysis.suggestedAction === 'approve' ? 'default' :
                            video.aiAnalysis.suggestedAction === 'review' ? 'secondary' : 'destructive'
                          }
                        >
                          Suggested: {video.aiAnalysis.suggestedAction}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {video.aiAnalysis.categories.map((category, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Moderation Flags */}
                  {video.moderationFlags.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-sm font-medium mb-2">Moderation Flags:</h4>
                      <div className="space-y-2">
                        {video.moderationFlags.map((flag) => (
                          <div key={flag.id} className="flex items-start gap-2 text-sm">
                            <Badge;
                              variant="outline" 
                              className={getSeverityColor(flag.severity)}
                            >
                              {flag.type.replace('_', ' ')}
                            </Badge>
                            <div className="flex-1">
                              <div className="font-medium">{flag.reason}</div>
                              <div className="text-muted-foreground">
                                Reported by {flag.reporter} • {new Date(flag.timestamp).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Previous Moderation */}
                  {video.lastModerated && (
                    <div className="text-sm text-muted-foreground">
                      Last moderated by {video.moderatedBy} on {new Date(video.lastModerated).toLocaleDateString()}
                      {video.moderationNotes && (
                        <div className="mt-1 text-xs">Note: {video.moderationNotes}</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <Button;
                    variant="outline"
                    size="sm"
                    onClick={() => {}
                      setSelectedVideo(video);
                      setShowModerationDialog(true);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Review;
                  </Button>
                  {video.status === 'pending' && (
                    <>
                      <Button;
                        size="sm"
                        onClick={() => moderateVideo(video.id, &apos;approve', 'Auto-approved')}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve;
                      </Button>
                      <Button;
                        variant="destructive"
                        size="sm"
                        onClick={() => moderateVideo(video.id, &apos;reject', 'Content policy violation')}
                      >
                        <Ban className="h-4 w-4 mr-1" />
                        Reject;
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredVideos.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Video className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No videos found</h3>
            <p className="text-muted-foreground">
              {filter === 'all' 
                ? "No videos to moderate." 
                : `No videos with status "${filter}".`
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Moderation Dialog */}
      <Dialog open={showModerationDialog} onOpenChange={setShowModerationDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Video: {selectedVideo?.title}</DialogTitle>
          </DialogHeader>
          {selectedVideo && (
            <div className="space-y-6">
              {/* Video Preview */}
              <div className="aspect-video bg-gray-200 rounded overflow-hidden">
                <img;
                  src={selectedVideo.thumbnail} 
                  alt={selectedVideo.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Video Info */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Video Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Title:</strong> {selectedVideo.title}</div>
                    <div><strong>Duration:</strong> {formatDuration(selectedVideo.duration)}</div>
                    <div><strong>Upload Date:</strong> {new Date(selectedVideo.uploadDate).toLocaleString()}</div>
                    <div><strong>Views:</strong> {selectedVideo.views.toLocaleString()}</div>
                    <div><strong>Reports:</strong> {selectedVideo.reports}</div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Uploader</h3>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={selectedVideo.uploader.avatar} alt={selectedVideo.uploader.displayName} />
                      <AvatarFallback>
                        {selectedVideo.uploader.displayName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{selectedVideo.uploader.displayName}</div>
                      <div className="text-sm text-muted-foreground">@{selectedVideo.uploader.username}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-sm text-muted-foreground">{selectedVideo.description}</p>
              </div>

              {/* AI Analysis */}
              {selectedVideo.aiAnalysis && (
                <div>
                  <h3 className="font-semibold mb-2">AI Analysis</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div><strong>Content Score:</strong> {selectedVideo.aiAnalysis.contentScore}/10</div>
                      <div><strong>Confidence:</strong> {(selectedVideo.aiAnalysis.confidence * 100).toFixed(0)}%</div>
                      <div><strong>Suggested Action:</strong> {selectedVideo.aiAnalysis.suggestedAction}</div>
                    </div>
                    <div>
                      <div><strong>Categories:</strong></div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedVideo.aiAnalysis.categories.map((category, index) => (
                          <Badge key={index} variant="outline" className="text-xs">{category}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Moderation Action */}
              <div>
                <h3 className="font-semibold mb-4">Moderation Action</h3>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <Button;
                      variant={moderationAction === 'approve' ? 'default' : 'outline'}
                      onClick={() => setModerationAction(&apos;approve')}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve;
                    </Button>
                    <Button;
                      variant={moderationAction === 'reject' ? 'destructive' : 'outline'}
                      onClick={() => setModerationAction(&apos;reject')}
                    >
                      <Ban className="h-4 w-4 mr-2" />
                      Reject;
                    </Button>
                    <Button;
                      variant={moderationAction === 'flag' ? 'secondary' : 'outline'}
                      onClick={() => setModerationAction(&apos;flag')}
                    >
                      <Flag className="h-4 w-4 mr-2" />
                      Flag for Review;
                    </Button>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Moderation Notes</label>
                    <Textarea;
                      value={moderationNotes}
                      onChange={(e) => setModerationNotes(e.target.value)}
                      placeholder="Add notes about your moderation decision..."
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2">
                <Button;
                  variant="outline" 
                  onClick={() => setShowModerationDialog(false)}
                >
                  Cancel;
                </Button>
                <Button;
                  onClick={() => moderateVideo(selectedVideo.id, moderationAction, moderationNotes)}
                >
                  Apply {moderationAction === 'approve' ? 'Approval' : moderationAction === 'reject' ? 'Rejection' : 'Flag'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
