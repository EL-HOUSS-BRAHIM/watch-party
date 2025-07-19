"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export function PartyNotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center max-w-md">
        <AlertCircle className="h-16 w-16 text-error mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-text-primary mb-2">Party Not Found</h1>
        <p className="text-text-secondary mb-6">
          This watch party doesn't exist or may have been deleted. Check the link and try again.
        </p>
        <div className="space-x-4">
          <Button asChild className="btn-primary">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/parties/create">Create New Party</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
