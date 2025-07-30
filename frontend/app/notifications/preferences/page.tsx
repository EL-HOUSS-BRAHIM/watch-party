import { NotificationPreferences } from "@/components/notifications/notification-preferences"

export default function NotificationPreferencesPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Notification Preferences</h1>
          <p className="text-muted-foreground mt-2">
            Customize how and when you receive notifications
          </p>
        </div>
        <NotificationPreferences />
      </div>
    </div>
  )
}
