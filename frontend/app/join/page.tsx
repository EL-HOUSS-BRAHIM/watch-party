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
    <div className="relative min-h-[85vh] flex items-center justify-center px-4 py-12 sm:py-16">
      {/* Simplified Background */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-0 left-0 w-96 h-96 bg-brand-magenta/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-cyan/20 rounded-full blur-3xl" />
      </div>

      {/* Main Content Card */}
      <div className="relative z-10 w-full max-w-2xl">
        <div className="glass-panel rounded-3xl p-6 sm:p-10 lg:p-12 shadow-xl">
          {/* Header Section */}
          <div className="text-center mb-8">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-magenta via-brand-purple to-brand-cyan mb-5 shadow-lg">
              <span className="text-4xl">🎟️</span>
            </div>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-magenta/10 border border-brand-magenta/30 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-magenta" />
              <span className="text-xs font-bold text-brand-magenta-dark uppercase tracking-wide">Quick Join</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-navy mb-3 tracking-tight">
              Join the
              <span className="block mt-1 bg-gradient-to-r from-brand-magenta via-brand-purple to-brand-cyan bg-clip-text text-transparent">
                Watch Party
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-brand-navy/70 max-w-lg mx-auto leading-relaxed">
              Enter your party code below and start watching together in seconds—no sign-up required! 🍿
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 mb-8">
            <div className="space-y-2.5">
              <label 
                htmlFor="partyCode" 
                className="block text-sm font-bold text-brand-navy/60 uppercase tracking-wide ml-1"
              >
                Party Code
              </label>
              <input
                id="partyCode"
                name="partyCode"
                type="text"
                required
                value={partyCode}
                onChange={(e) => setPartyCode(e.target.value.toUpperCase())}
                className="w-full rounded-xl border-2 border-brand-purple/20 bg-white/90 px-6 py-5 text-center text-2xl sm:text-3xl font-black tracking-[0.25em] text-brand-navy placeholder:text-brand-navy/20 focus:border-brand-magenta focus:bg-white focus:outline-none focus:ring-3 focus:ring-brand-magenta/20 transition-all shadow-sm hover:shadow-md"
                placeholder="ABC123"
                maxLength={10}
              />
              <p className="text-xs text-brand-navy/50 text-center mt-2">
                Got a code from your host? Enter it above
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !partyCode.trim()}
              className="w-full rounded-xl bg-gradient-to-r from-brand-magenta via-brand-purple to-brand-cyan px-6 py-4 text-lg font-bold text-white shadow-lg hover:shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Joining Party...
                </span>
              ) : (
                <span>🎬 Join Now</span>
              )}
            </button>
          </form>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-2.5 mb-8">
            {[
              { icon: "⚡", text: "Instant Access" },
              { icon: "🔒", text: "Private & Secure" },
              { icon: "💬", text: "Live Chat" },
              { icon: "🎭", text: "Reactions" }
            ].map((feature, index) => (
              <div 
                key={index}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 border border-brand-navy/10 text-sm"
              >
                <span>{feature.icon}</span>
                <span className="text-xs font-semibold text-brand-navy/70">{feature.text}</span>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-brand-navy/10" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs text-brand-navy/50 font-medium">or</span>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center space-y-3">
            <p className="text-sm text-brand-navy/70 font-medium">
              Want to host your own watch party?
            </p>
            <Link 
              href="/auth/register"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white border-2 border-brand-cyan/30 text-brand-cyan-dark font-bold text-sm shadow-sm hover:bg-brand-cyan/10 hover:border-brand-cyan hover:shadow-md transition-all"
            >
              <span>✨</span>
              Create Your Free Account
              <span>→</span>
            </Link>
            <p className="text-xs text-brand-navy/50">
              Already have an account?{" "}
              <Link 
                href="/auth/login" 
                className="text-brand-purple hover:text-brand-magenta font-semibold underline underline-offset-2 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
