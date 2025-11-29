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
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-10 sm:py-16">
      <div className="w-full max-w-md rounded-xl sm:rounded-2xl border border-brand-purple/10 bg-white/80 p-6 sm:p-8 md:p-10 backdrop-blur-sm">
        <div className="text-center">
          <span className="inline-flex items-center rounded-full border border-brand-magenta/20 bg-brand-magenta/5 px-2.5 py-1 text-[11px] sm:text-xs font-medium text-brand-magenta-dark">
            Join a party
          </span>
          <h1 className="mt-3 sm:mt-4 text-xl font-bold tracking-tight text-brand-navy sm:text-2xl md:text-3xl">Enter your party code</h1>
          <p className="mt-2 sm:mt-3 text-[13px] sm:text-sm text-brand-navy/60">
            Watch together in seconds—no downloads required.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 sm:mt-8 space-y-5 sm:space-y-6">
          <div className="space-y-1.5 sm:space-y-2">
            <label htmlFor="partyCode" className="block text-[11px] sm:text-xs font-medium text-brand-navy/50 uppercase tracking-wider">
              Party Code
            </label>
            <input
              id="partyCode"
              name="partyCode"
              type="text"
              required
              value={partyCode}
              onChange={(e) => setPartyCode(e.target.value.toUpperCase())}
              className="w-full rounded-lg sm:rounded-xl border border-brand-navy/10 bg-white/60 px-4 py-3.5 sm:py-4 text-center text-xl sm:text-2xl font-bold tracking-widest text-brand-blue-dark placeholder:text-brand-navy/20 focus:border-brand-blue/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/10 transition-all"
              placeholder="ABC123"
              maxLength={10}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !partyCode.trim()}
            className="w-full rounded-lg sm:rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple px-5 py-3 sm:py-3.5 text-sm sm:text-base font-semibold text-white shadow-sm transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 min-h-[48px]"
          >
            {loading ? "Joining..." : "Join WatchParty"}
          </button>
        </form>

        <div className="mt-6 sm:mt-8 text-center text-[13px] sm:text-sm text-brand-navy/55">
          <p>Need to host your own movie night?</p>
          <Link href="/auth/login" className="mt-1 inline-block font-medium text-brand-blue hover:text-brand-blue-dark transition-colors min-h-[44px] py-2">
            Sign in to create a party
          </Link>
        </div>
      </div>
    </div>
  )
}
