import { VideoPlayer } from "@/components/video/video-player"
import { VideoDetails } from "@/components/videos/video-details"
import { VideoComments } from "@/components/videos/video-comments"

interface PageProps {
  params: {
    id: string
  }
}

export default function VideoPage({ params }: PageProps) {
  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <VideoPlayer videoId={params.id} />
          <VideoDetails videoId={params.id} />
          <VideoComments videoId={params.id} />
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Related videos, playlists, etc. will go here */}
        </div>
      </div>
    </div>
  )
}
