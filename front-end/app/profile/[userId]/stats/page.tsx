"use client"
import { UserStats } from "@/components/profile/user-stats"

interface PageProps {
  params: {
    userId: string
  }
}

const StatsPage = ({ params }: PageProps) => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">Statistics</h1>
      <p className="mb-4">Here are your statistics on our platform.</p>

      {/* Add stats components here */}
      <UserStats userId={params.userId} />
      <p>Statistics components will be added here in future updates.</p>
    </div>
  )
}

export default StatsPage
