import  from "lucide-react"
import { UserManagement } from "@/components/admin/user-management"

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage user accounts, permissions, and account status
        </p>
      </div>
      <UserManagement />
    </div>
  )
}
