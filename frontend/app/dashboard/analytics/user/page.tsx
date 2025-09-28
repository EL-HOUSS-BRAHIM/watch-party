import { User } from "lucide-react"
import { UserAnalytics } from "@/components/analytics/user-analytics"

export default function UserAnalyticsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Your Analytics</h1>
          <p className="text-muted-foreground mt-2">
            Track your watch party activity and engagement;
          </p>
        </div>
        <UserAnalytics />
      </div>
    </div>
  )
}
