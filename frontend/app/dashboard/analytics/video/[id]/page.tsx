import { Video } from "lucide-react"
import { Metadata } from 'next'
import VideoAnalyticsView from '@/components/analytics/video-analytics-view'

interface VideoAnalyticsPageProps {}
  params: Promise<{}
    id: string
  }>
}

export const metadata: Metadata = { title: 'Video Analytics - Watch Party',
  description: 'Detailed analytics for your video content'
}

export default async function VideoAnalyticsPage({ params }: VideoAnalyticsPageProps) {}
  const { id } = await params
  return <VideoAnalyticsView videoId={id} />
}
