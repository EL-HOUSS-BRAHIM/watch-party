import { GroupsManager } from "@/components/social/groups-manager"

export default function GroupsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Groups</h1>
          <p className="text-muted-foreground mt-2">
            Join groups and create communities around shared interests
          </p>
        </div>
        <GroupsManager />
      </div>
    </div>
  )
}
