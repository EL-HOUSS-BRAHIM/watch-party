import { Video } from "lucide-react"
import { VideoManagement } from "@/components/videos/video-management"

export default function VideoManagePage() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Manage Videos</h1>
          <p className="text-muted-foreground mt-2">
            Edit, organize, and manage your uploaded videos
          </p>
        </div>
        <VideoManagement />
      </div>
    </div>
  )
}
