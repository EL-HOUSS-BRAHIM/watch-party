import { ModerationReports } from "@/components/admin/moderation-reports"

export default function ModerationReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Moderation Reports</h1>
        <p className="text-muted-foreground mt-2">
          Review and manage reported content and user violations;
        </p>
      </div>
      <ModerationReports />
    </div>
  )
}
