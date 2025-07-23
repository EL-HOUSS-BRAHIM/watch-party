"use client"

import { CreatePartyForm } from "@/components/parties/create-party-form"

export default function CreatePartyPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Create Watch Party</h1>
        <p className="text-text-secondary">Set up a new watch party for you and your friends.</p>
      </div>

      <CreatePartyForm />
    </div>
  )
}
