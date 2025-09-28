import { Bookmark, Download, MessageCircle, Play, Settings, Share, ThumbsUp, Volume2 } from "lucide-react"
import { useState, useRef, useEffect , useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

"use client"

interface VideoQuality {}
  label: string;
  value: string;
  resolution: string;
  bitrate: number;
}

interface Subtitle {}
  id: string;
  language: string;
  label: string;
  url: string;
  default?: boolean;
}

interface AdvancedVideoPlayerProps {}
  videoId: string;
  src: string;
  title: string;
  duration: number;
  qualities: VideoQuality[]
  subtitles: Subtitle[]
  allowDownload?: boolean;
  allowPiP?: boolean;
  autoplay?: boolean;
  loop?: boolean;
  onProgress?: (currentTime: number, duration: number) => void;
  onQualityChange?: (quality: string) => void;
  onSubtitleChange?: (subtitleId: string | null) => void;
}

export default function AdvancedVideoPlayer({videoId,
  src,
  title,
  duration,
  qualities,
  subtitles,
  allowDownload = false,
  allowPiP = true,
  autoplay = false,
  loop = false,
  onProgress,
  onQualityChange,
  onSubtitleChange,
}: AdvancedVideoPlayerProps) {}
  const videoRef = useRef<HTMLVideoElement>(null)
  const { toast } = useToast()

  // Player state;
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  // Advanced features state;
  const [selectedQuality, setSelectedQuality] = useState(qualities[0]?.value || "auto")
  const [selectedSubtitle, setSelectedSubtitle] = useState<string | null>(subtitles.find((s) => s.default)?.id || null)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [isLooping, setIsLooping] = useState(loop)
  const [isPiPActive, setIsPiPActive] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  // Keyboard shortcuts;
  useEffect(() => {}
    const handleKeyPress = (e: KeyboardEvent) => {}
      if (!videoRef.current) return;
      switch (e.code) {}
        case "Space":
          e.preventDefault()
          togglePlayPause()
          break;
        case "ArrowLeft":
          e.preventDefault()
          skipBackward()
          break;
        case "ArrowRight":
          e.preventDefault()
          skipForward()
          break;
        case "ArrowUp":
          e.preventDefault()
          setVolume((prev) => Math.min(1, prev + 0.1))
          break;
        case "ArrowDown":
          e.preventDefault()
          setVolume((prev) => Math.max(0, prev - 0.1))
          break;
        case "KeyM":
          e.preventDefault()
          toggleMute()
          break;
        case "KeyF":
          e.preventDefault()
          toggleFullscreen()
          break;
        case "KeyL":
          e.preventDefault()
          setIsLooping((prev) => !prev)
          break;
      }
    }

    document.addEventListener("keydown", handleKeyPress)
    return () => document.removeEventListener(&quot;keydown", handleKeyPress)
  }, [])

  // Video event handlers;
  useEffect(() => {}
    const video = videoRef.current;
    if (!video) return;
    const handleTimeUpdate = () => {}
      setCurrentTime(video.currentTime)
      onProgress?.(video.currentTime, video.duration)
    }

    const handleLoadStart = () => setIsLoading(true)
    const handleCanPlay = () => setIsLoading(false)
    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleEnded = () => {}
      setIsPlaying(false)
      if (isLooping) {}
        video.currentTime = 0;
        video.play()
      }
    }

    video.addEventListener("timeupdate", handleTimeUpdate)
    video.addEventListener("loadstart", handleLoadStart)
    video.addEventListener("canplay", handleCanPlay)
    video.addEventListener("play", handlePlay)
    video.addEventListener("pause", handlePause)
    video.addEventListener("ended", handleEnded)

    return () => {}
      video.removeEventListener("timeupdate", handleTimeUpdate)
      video.removeEventListener("loadstart", handleLoadStart)
      video.removeEventListener("canplay", handleCanPlay)
      video.removeEventListener("play", handlePlay)
      video.removeEventListener("pause", handlePause)
      video.removeEventListener("ended", handleEnded)
    }
  }, [isLooping, onProgress])

  // Player controls;
  const togglePlayPause = () => {}
    if (!videoRef.current) return;
    if (isPlaying) {}
      videoRef.current.pause()
    } else {}
      videoRef.current.play()
    }
  }

  const handleSeek = (value: number[]) => {}
    if (!videoRef.current) return;
    videoRef.current.currentTime = value[0]
    setCurrentTime(value[0])
  }

  const handleVolumeChange = (value: number[]) => {}
    if (!videoRef.current) return;
    const newVolume = value[0]
    videoRef.current.volume = newVolume;
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {}
    if (!videoRef.current) return;
    if (isMuted) {}
      videoRef.current.volume = volume;
      setIsMuted(false)
    } else {}
      videoRef.current.volume = 0;
      setIsMuted(true)
    }
  }

  const skipBackward = () => {}
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10)
  }

  const skipForward = () => {}
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 10)
  }

  const toggleFullscreen = () => {}
    if (!document.fullscreenElement) {}
      videoRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {}
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const handleQualityChange = (quality: string) => {}
    setSelectedQuality(quality)
    onQualityChange?.(quality)
    toast({title: "Quality Changed",
      description: `Video quality set to ${qualities.find((q) => q.value === quality)?.label}`,
    })
  }

  const handleSubtitleChange = (subtitleId: string) => {}
    const newSubtitle = subtitleId === "off" ? null : subtitleId;
    setSelectedSubtitle(newSubtitle)
    onSubtitleChange?.(newSubtitle)

    toast({title: "Subtitles Updated",
      description: newSubtitle;
        ? `Subtitles set to ${subtitles.find((s) => s.id === newSubtitle)?.label}`
        : "Subtitles turned off",
    })
  }

  const handleSpeedChange = (speed: string) => {}
    if (!videoRef.current) return;
    const newSpeed = Number.parseFloat(speed)
    videoRef.current.playbackRate = newSpeed;
    setPlaybackSpeed(newSpeed)
  }

  const togglePictureInPicture = async () => {}
    if (!videoRef.current || !allowPiP) return;
    try {}
      if (isPiPActive) {}
        await document.exitPictureInPicture()
        setIsPiPActive(false)
      } else {}
        await videoRef.current.requestPictureInPicture()
        setIsPiPActive(true)
      }
    } catch {}
      toast({title: "Picture-in-Picture Error",
        description: "Could not toggle picture-in-picture mode",
        variant: "destructive",
      })
    }
  }

  const handleDownload = () => {}
    if (!allowDownload) return;
    const link = document.createElement("a")
    link.href = src;
    link.download = `${title}.mp4`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({title: "Download Started",
      description: "Video download has begun",
    })
  }

  const formatTime = (seconds: number) => {}
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{selectedQuality.toUpperCase()}</Badge>
            {selectedSubtitle && (
              <Badge variant="outline">{subtitles.find((s) => s.id === selectedSubtitle)?.label}</Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Video Player */}
        <div;
          className="relative bg-black rounded-lg overflow-hidden group"
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
        >
          <video;
            ref={videoRef}
            src={src}
            className="w-full aspect-video"
            autoPlay={autoplay}
            loop={isLooping}
            onClick={togglePlayPause}
          >
            {subtitles.map((subtitle) => (
              <track;
                key={subtitle.id}
                kind="subtitles"
                src={subtitle.url}
                srcLang={subtitle.language}
                label={subtitle.label}
                default={subtitle.id === selectedSubtitle}
              />
            ))}
          </video>

          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          )}

          {/* Controls Overlay */}
          <div;
            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${}
              showControls ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* Progress Bar */}
            <div className="mb-4">
              <Slider value={[currentTime]} max={duration} step={1} onValueChange={handleSeek} className="w-full" />
              <div className="flex justify-between text-xs text-white/70 mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={togglePlayPause} className="text-white hover:bg-white/20">
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className=&quot;h-4 w-4" />}"
                </Button>

                <Button variant="ghost" size="sm" onClick={skipBackward} className="text-white hover:bg-white/20">
                  <SkipBack className="h-4 w-4" />
                </Button>

                <Button variant="ghost" size="sm" onClick={skipForward} className="text-white hover:bg-white/20">
                  <SkipForward className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-2 ml-4">
                  <Button variant="ghost" size="sm" onClick={toggleMute} className="text-white hover:bg-white/20">
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className=&quot;h-4 w-4" />}"
                  </Button>
                  <Slider;
                    value={[isMuted ? 0 : volume]}
                    max={1}
                    step={0.1}
                    onValueChange={handleVolumeChange}
                    className="w-20"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button;
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(!showSettings)}
                  className="text-white hover:bg-white/20"
                >
                  <Settings className="h-4 w-4" />
                </Button>

                {allowPiP && (
                  <Button;
                    variant="ghost"
                    size="sm"
                    onClick={togglePictureInPicture}
                    className="text-white hover:bg-white/20"
                  >
                    <PictureInPicture className="h-4 w-4" />
                  </Button>
                )}

                <Button variant="ghost" size="sm" onClick={toggleFullscreen} className="text-white hover:bg-white/20">
                  {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className=&quot;h-4 w-4" />}"
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <Card>
            <CardContent className="p-4">
              <Tabs defaultValue="quality" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="quality">Quality</TabsTrigger>
                  <TabsTrigger value="subtitles">Subtitles</TabsTrigger>
                  <TabsTrigger value="speed">Speed</TabsTrigger>
                  <TabsTrigger value="options">Options</TabsTrigger>
                </TabsList>

                <TabsContent value="quality" className="space-y-4">
                  <div>
                    <Label>Video Quality</Label>
                    <Select value={selectedQuality} onValueChange={handleQualityChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto</SelectItem>
                        {qualities.map((quality) => (
                          <SelectItem key={quality.value} value={quality.value}>
                            {quality.label} ({quality.resolution})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent value="subtitles" className="space-y-4">
                  <div>
                    <Label>Subtitles</Label>
                    <Select value={selectedSubtitle || "off"} onValueChange={handleSubtitleChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="off">Off</SelectItem>
                        {subtitles.map((subtitle) => (
                          <SelectItem key={subtitle.id} value={subtitle.id}>
                            {subtitle.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent value="speed" className="space-y-4">
                  <div>
                    <Label>Playback Speed</Label>
                    <Select value={playbackSpeed.toString()} onValueChange={handleSpeedChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0.25">0.25x</SelectItem>
                        <SelectItem value="0.5">0.5x</SelectItem>
                        <SelectItem value="0.75">0.75x</SelectItem>
                        <SelectItem value="1">1x (Normal)</SelectItem>
                        <SelectItem value="1.25">1.25x</SelectItem>
                        <SelectItem value="1.5">1.5x</SelectItem>
                        <SelectItem value="2">2x</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent value="options" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="loop">Loop Video</Label>
                    <Switch id="loop" checked={isLooping} onCheckedChange={setIsLooping} />
                  </div>

                  {allowDownload && (
                    <Button onClick={handleDownload} className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download Video;
                    </Button>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <ThumbsUp className="h-4 w-4 mr-2" />
              Like;
            </Button>
            <Button variant="outline" size="sm">
              <MessageCircle className="h-4 w-4 mr-2" />
              Comment;
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share;
            </Button>
          </div>

          <Button variant="outline" size="sm">
            <Bookmark className="h-4 w-4 mr-2" />
            Save;
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
