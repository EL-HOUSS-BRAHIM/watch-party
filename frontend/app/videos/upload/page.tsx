import { VideoUpload } from "@/components/video/video-upload"

export default function VideoUploadPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Upload Video</h1>
          <p className="text-muted-foreground mt-2">
            Share your videos with the Watch Party community
          </p>
        </div>
        <VideoUpload />
      </div>
    </div>
  )
}
