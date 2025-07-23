import { ProtectedRoute } from '@/components/auth/protected-route'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { SupportCenter } from '@/components/support/support-center'

export default function SupportPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-neo-background">
        <DashboardHeader />
        <div className="container mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neo-text-primary mb-2">
              Support Center
            </h1>
            <p className="text-neo-text-secondary">
              Get help and track your support tickets
            </p>
          </div>

          <SupportCenter />
        </div>
      </div>
    </ProtectedRoute>
  )
}
