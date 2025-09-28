import { User } from "lucide-react"
import { UserWatchHistory } from "@/components/profile/user-watch-history"

interface PageProps {}
  params: Promise<{}
    userId: string;
  }>
}

const WatchHistoryPage = async ({ params }: PageProps) => {}
  const { userId } = await params;
  return <WatchHistoryPageClient userId={userId} />
}

function WatchHistoryPageClient({ userId }: { userId: string }) {}
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">Watch History</h1>
      <p className="mb-4">Here is a list of the videos you have watched.</p>

      {/* Add watch history components here */}
      <UserWatchHistory userId={userId} />
      <p>Watch history components will be added here in future updates.</p>
    </div>
  )
}

export default WatchHistoryPage;