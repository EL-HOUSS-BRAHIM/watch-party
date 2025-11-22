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
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-16 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-brand-purple/10 via-transparent to-transparent blur-3xl" />
      </div>
      <div className="glass-panel w-full max-w-xl rounded-[40px] p-8 text-brand-navy sm:p-12 relative z-10">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-magenta/20 bg-brand-magenta/5 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.4em] text-brand-magenta-dark shadow-sm">
            Join a party
          </span>
          <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl bg-gradient-to-br from-brand-navy to-brand-purple bg-clip-text text-transparent">Enter your party code</h1>
          <p className="mt-4 text-base text-brand-navy/70 leading-relaxed">
            Watch together in seconds—no downloads or setup required.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-10 space-y-8">
          <div className="space-y-2">
            <label htmlFor="partyCode" className="block text-xs font-bold uppercase tracking-[0.25em] text-brand-navy/50 ml-1">
              Party Code
            </label>
            <input
              id="partyCode"
              name="partyCode"
              type="text"
              required
              value={partyCode}
              onChange={(e) => setPartyCode(e.target.value.toUpperCase())}
              className="w-full rounded-2xl border border-brand-navy/10 bg-white/50 px-5 py-5 text-center text-3xl font-bold tracking-[0.3em] text-brand-blue-dark placeholder:text-brand-navy/10 focus:border-brand-blue/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-blue/10 transition-all"
              placeholder="ABC123"
              maxLength={10}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !partyCode.trim()}
            className="w-full rounded-2xl bg-gradient-to-r from-brand-magenta to-brand-orange px-6 py-4 text-lg font-bold text-white shadow-lg shadow-brand-magenta/25 transition-all hover:-translate-y-0.5 hover:shadow-brand-magenta/40 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Joining..." : "Join WatchParty"}
          </button>
        </form>

        <div className="mt-12 space-y-3 text-center text-sm text-brand-navy/60">
          <p>Need to host your own movie night?</p>
          <Link href="/auth/login" className="font-bold text-brand-blue hover:text-brand-blue-dark hover:underline decoration-brand-blue/30 underline-offset-4 transition-all">
            Sign in to create a party
          </Link>
        </div>
      </div>
    </div>
  )
}
