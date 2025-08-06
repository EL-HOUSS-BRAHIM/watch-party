"use client"
import { UserWatchHistory } from "@/components/profile/user-watch-history"

interface PageProps {
  params: {
    userId: string
  }
}

const WatchHistoryPage = ({ params }: PageProps) => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">Watch History</h1>
      <p className="mb-4">Here is a list of the videos you have watched.</p>

      {/* Add watch history components here */}
      <UserWatchHistory userId={params.userId} />
      <p>Watch history components will be added here in future updates.</p>
    </div>
  )
}

export default WatchHistoryPage
