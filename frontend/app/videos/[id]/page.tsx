import { Video } from "lucide-react"
import { VideoPlayer } from "@/components/video/video-player"
import { VideoDetails } from "@/components/videos/video-details"
import { VideoComments } from "@/components/videos/video-comments"

interface PageProps {}
  params: Promise<{}
    id: string;
  }>
}

export default async function VideoPage({ params }: PageProps) {}
  const { id } = await params;
  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <VideoPlayer videoId={id} />
          <VideoDetails videoId={id} />
          <VideoComments videoId={id} />
        </div>
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Related videos, playlists, etc. will go here */}
        </div>
      </div>
    </div>
  )
}
