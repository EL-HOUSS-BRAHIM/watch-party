import { Suspense } from "react"
import { JoinParty } from "@/components/party/join-party"

function JoinPartyWrapper() {
  return <JoinParty />;
}

export default function JoinPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-md mx-auto">
        <Suspense fallback={<div>Loading...</div>}>
          <JoinPartyWrapper />
        </Suspense>
      </div>
    </div>
  )
}
