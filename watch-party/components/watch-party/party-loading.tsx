"use client"

export function PartyLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-text-primary mb-2">Loading Watch Party...</h2>
        <p className="text-text-secondary">Please wait while we prepare your room</p>
      </div>
    </div>
  )
}
