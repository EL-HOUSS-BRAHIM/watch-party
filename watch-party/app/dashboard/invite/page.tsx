import { ProtectedRoute } from '@/components/auth/protected-route'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { InviteFriends } from '@/components/social/invite-friends'

export default function InvitePage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-neo-background">
        <DashboardHeader />
        <div className="container mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neo-text-primary mb-2">
              Invite Friends
            </h1>
            <p className="text-neo-text-secondary">
              Share the watch party experience with your friends
            </p>
          </div>

          <InviteFriends />
        </div>
      </div>
    </ProtectedRoute>
  )
}
