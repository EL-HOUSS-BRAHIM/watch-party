import { Metadata } from 'next'
import { AdminPartiesView } from '@/components/admin/admin-parties-view'

export const metadata: Metadata = {
  title: 'Manage Parties - Admin',
  description: 'Manage and moderate watch parties'
}

export default function AdminPartiesPage() {
  return <AdminPartiesView />
}
