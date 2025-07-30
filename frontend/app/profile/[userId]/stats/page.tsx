import { UserStats } from "@/components/profile/user-stats"

interface PageProps {
  params: {
    userId: string
  }
}

export default function UserStatsPage({ params }: PageProps) {
  return (
    <div className="container mx-auto py-8">
      <UserStats userId={params.userId} />
    </div>
  )
}
