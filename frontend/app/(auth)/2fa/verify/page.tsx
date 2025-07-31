import { Suspense } from "react"
import { TwoFactorVerify } from "@/components/auth/two-factor-verify"

function TwoFactorVerifyWrapper() {
  return <TwoFactorVerify />
}

export default function TwoFactorVerifyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TwoFactorVerifyWrapper />
    </Suspense>
  )
}
