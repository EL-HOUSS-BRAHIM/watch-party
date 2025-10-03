"use client"

import { useState } from "react"
import Link from "next/link"

export default function JoinPartyPage() {
  const [partyCode, setPartyCode] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!partyCode.trim()) {
      alert("Please enter a party code")
      return
    }

    setLoading(true)

    try {
      window.location.href = `/party/${partyCode}`
    } catch (error) {
      console.error("Join party error:", error)
      alert("Could not join party. Please check the code and try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-xl rounded-3xl border border-brand-purple/20 bg-white/95 p-8 text-brand-navy shadow-[0_32px_90px_rgba(28,28,46,0.14)] sm:p-10">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-magenta/30 bg-brand-magenta/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-brand-magenta-dark">
            Join a party
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Enter your party code</h1>
          <p className="mt-3 text-base text-brand-navy/70">
            Watch together in seconds—no downloads or setup required.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-10 space-y-6">
          <div className="space-y-2">
            <label htmlFor="partyCode" className="block text-sm font-semibold uppercase tracking-[0.3em] text-brand-navy/60">
              Party Code
            </label>
            <input
              id="partyCode"
              name="partyCode"
              type="text"
              required
              value={partyCode}
              onChange={(e) => setPartyCode(e.target.value.toUpperCase())}
              className="w-full rounded-2xl border border-brand-blue/25 bg-brand-blue/5 px-5 py-4 text-center text-2xl font-semibold tracking-[0.3em] text-brand-blue-dark focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
              placeholder="ABC123"
              maxLength={10}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !partyCode.trim()}
            className="w-full rounded-full bg-gradient-to-r from-brand-magenta to-brand-orange px-6 py-4 text-lg font-semibold text-white shadow-lg shadow-brand-magenta/25 transition-all hover:-translate-y-0.5 hover:from-brand-magenta-dark hover:to-brand-orange-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Joining..." : "Join WatchParty"}
          </button>
        </form>

        <div className="mt-10 space-y-3 text-center text-sm text-brand-navy/70">
          <p>Need to host your own movie night?</p>
          <Link href="/auth/login" className="font-semibold text-brand-blue hover:text-brand-blue-dark">
            Sign in to create a party
          </Link>
        </div>
      </div>
    </div>
  )
}
