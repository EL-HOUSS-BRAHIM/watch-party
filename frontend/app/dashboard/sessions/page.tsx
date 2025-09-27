import { SessionsManager } from "@/components/security/sessions-manager"

export default function SessionsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Active Sessions</h1>
          <p className="text-muted-foreground mt-2">
            Manage your active sessions and sign out from devices you don't recognize
          </p>
        </div>
        <SessionsManager />
      </div>
    </div>
  )
}
