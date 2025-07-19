import { ProtectedRoute } from '@/components/auth/protected-route'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { NotificationList } from '@/components/notifications/notification-list'

export default function NotificationsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-neo-background">
        <DashboardHeader />
        <div className="container mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neo-text-primary mb-2">
              Notifications
            </h1>
            <p className="text-neo-text-secondary">
              Stay updated with your watch party activities
            </p>
          </div>

          <NotificationList />
        </div>
      </div>
    </ProtectedRoute>
  )
}
