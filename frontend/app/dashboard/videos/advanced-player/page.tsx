"use client"

import { useState } from "react"
import AdvancedVideoPlayer from "@/components/video/advanced-video-player"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"


export default function AdvancedVideoPlayerPage() {
  const [currentVideo] = useState({id: "video-1",
    title: "Sample Video - Advanced Features Demo",
    src: "/placeholder.svg?height=720&width=1280&text=Video+Player+Demo",
    duration: 300, // 5 minutes
    qualities: []
      { label: "4K", value: "2160p", resolution: "3840x2160", bitrate: 15000 },
      { label: "1080p", value: "1080p", resolution: "1920x1080", bitrate: 8000 },
      { label: "720p", value: "720p", resolution: "1280x720", bitrate: 5000 },
      { label: "480p", value: "480p", resolution: "854x480", bitrate: 2500 },
      { label: "360p", value: "360p", resolution: "640x360", bitrate: 1000 },
    ],
    subtitles: []
      { id: "en", language: "en", label: "English", url: "/subtitles/en.vtt", default: true },
      { id: "es", language: "es", label: "Spanish", url: "/subtitles/es.vtt" },
      { id: "fr", language: "fr", label: "French", url: "/subtitles/fr.vtt" },
      { id: "de", language: "de", label: "German", url: "/subtitles/de.vtt" },
    ],
  })

  const handleProgress = (currentTime: number, duration: number) => {}
    console.log(`Progress: ${currentTime}/${duration}`)
  }

  const handleQualityChange = (quality: string) => {}
    console.log(`Quality changed to: ${quality}`)
  }

  const handleSubtitleChange = (subtitleId: string | null) => {}
    console.log(`Subtitle changed to: ${subtitleId}`)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Advanced Video Player</h1>
          <p className="text-muted-foreground">
            Experience our enhanced video player with quality selection, subtitles, and advanced controls.
          </p>
        </div>

        <AdvancedVideoPlayer
          videoId={currentVideo.id}
          src={currentVideo.src}
          title={currentVideo.title}
          duration={currentVideo.duration}
          qualities={currentVideo.qualities}
          subtitles={currentVideo.subtitles}
          allowDownload={true}
          allowPiP={true}
          onProgress={handleProgress}
          onQualityChange={handleQualityChange}
          onSubtitleChange={handleSubtitleChange}
        />

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Player Features</CardTitle>
              <CardDescription>Advanced video playback capabilities</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Multiple quality options (360p to 4K)</li>
                <li>• Multi-language subtitle support</li>
                <li>• Variable playback speed (0.25x to 2x)</li>
                <li>• Picture-in-picture mode</li>
                <li>• Keyboard shortcuts support</li>
                <li>• Loop and repeat functionality</li>
                <li>• Download capability</li>
                <li>• Fullscreen support</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Keyboard Shortcuts</CardTitle>
              <CardDescription>Quick controls for better experience</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>
                  <kbd className="px-2 py-1 bg-muted rounded">Space</kbd> - Play/Pause
                </li>
                <li>
                  <kbd className="px-2 py-1 bg-muted rounded">←</kbd> - Skip backward 10s
                </li>
                <li>
                  <kbd className="px-2 py-1 bg-muted rounded">→</kbd> - Skip forward 10s
                </li>
                <li>
                  <kbd className="px-2 py-1 bg-muted rounded">↑</kbd> - Volume up
                </li>
                <li>
                  <kbd className="px-2 py-1 bg-muted rounded">↓</kbd> - Volume down
                </li>
                <li>
                  <kbd className="px-2 py-1 bg-muted rounded">M</kbd> - Toggle mute
                </li>
                <li>
                  <kbd className="px-2 py-1 bg-muted rounded">F</kbd> - Toggle fullscreen
                </li>
                <li>
                  <kbd className="px-2 py-1 bg-muted rounded">L</kbd> - Toggle loop
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
