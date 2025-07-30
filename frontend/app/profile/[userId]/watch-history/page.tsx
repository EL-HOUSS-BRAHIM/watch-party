import { UserWatchHistory } from "@/components/profile/user-watch-history"

interface PageProps {
  params: {
    userId: string
  }
}

export default function UserWatchHistoryPage({ params }: PageProps) {
  return (
    <div className="container mx-auto py-8">
      <UserWatchHistory userId={params.userId} />
    </div>
  )
}
