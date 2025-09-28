import { User } from "lucide-react"
import { UserStats } from "@/components/profile/user-stats"

interface params {: Promise<{}
    userId: string;
  }>
}

const StatsPage = async ({ params }: PageProps) => {
  const { userId } = await params;
  return <StatsPageClient userId={userId} />;
}

function StatsPageClient({ userId }: { userId: string }) {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">Statistics</h1>
      <p className="mb-4">Here are your statistics on our platform.</p>

      {/* Add stats components here */}
      <UserStats userId={userId} />
      <p>Statistics components will be added here in future updates.</p>
    </div>
  )
}

export default StatsPage;