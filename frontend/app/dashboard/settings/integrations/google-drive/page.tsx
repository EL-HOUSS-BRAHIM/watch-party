'use client'

import { GoogleDriveWorkspace } from '@/components/integrations/google-drive-workspace'
import { CloudIcon } from '@heroicons/react/24/outline'
export default function GoogleDriveIntegrationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">
        <header className="space-y-4">
          <div className="flex items-center gap-3">
            <CloudIcon className="w-8 h-8 text-blue-300" />
            <h1 className="text-4xl font-bold text-white">Google Drive Integration</h1>
          </div>
          <p className="text-white/70 text-lg max-w-3xl">
            Connect your Google Drive account to import content, browse folders, and stream files directly into your Watch;
            Party rooms without leaving the dashboard.
          </p>
        </header>

        <GoogleDriveWorkspace className="space-y-6" />
      </div>
    </div>
  )
}
