import { NotificationsCenter } from "@/components/notifications/notifications-center"

export default function NotificationsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground mt-2">
            Stay updated with your watch party activities
          </p>
        </div>
        <NotificationsCenter />
      </div>
    </div>
  )
}
