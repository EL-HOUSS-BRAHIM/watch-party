import { UserAchievements } from "@/components/profile/user-achievements"

interface PageProps {
  params: {
    userId: string
  }
}

export default function UserAchievementsPage({ params }: PageProps) {
  return (
    <div className="container mx-auto py-8">
      <UserAchievements userId={params.userId} />
    </div>
  )
}
