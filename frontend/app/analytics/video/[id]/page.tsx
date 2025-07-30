import { Metadata } from 'next'
import { VideoAnalyticsView } from '@/components/analytics/video-analytics-view'

interface VideoAnalyticsPageProps {
  params: {
    id: string
  }
}

export const metadata: Metadata = {
  title: 'Video Analytics - Watch Party',
  description: 'Detailed analytics for your video content'
}

export default function VideoAnalyticsPage({ params }: VideoAnalyticsPageProps) {
  return <VideoAnalyticsView videoId={params.id} />
}
