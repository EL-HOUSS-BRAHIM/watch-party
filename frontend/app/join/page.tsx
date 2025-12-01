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
    <div className="relative min-h-screen flex items-center justify-center px-4 py-16 overflow-hidden">
      {/* Animated Background Gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-magenta/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-cyan/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-brand-purple/10 via-transparent to-transparent" />
      </div>

      {/* Main Content Card */}
      <div className="relative z-10 w-full max-w-2xl">
        <div className="glass-panel rounded-[2.5rem] p-8 sm:p-12 lg:p-16 shadow-2xl border-2 border-white/30">
          {/* Header Section */}
          <div className="text-center mb-10">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-brand-magenta via-brand-purple to-brand-cyan mb-6 shadow-xl shadow-brand-purple/30 animate-float">
              <span className="text-5xl">🎟️</span>
            </div>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-brand-magenta/10 to-brand-purple/10 border border-brand-magenta/30 mb-4">
              <span className="w-2 h-2 rounded-full bg-brand-magenta animate-pulse" />
              <span className="text-xs font-bold text-brand-magenta-dark uppercase tracking-wider">Quick Join</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-brand-navy mb-4 tracking-tight">
              Join the
              <span className="block mt-1 bg-gradient-to-r from-brand-magenta via-brand-purple to-brand-cyan bg-clip-text text-transparent">
                Watch Party
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg text-brand-navy/70 max-w-md mx-auto leading-relaxed">
              Enter your party code below and start watching together in seconds—no sign-up required! 🍿
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <label 
                htmlFor="partyCode" 
                className="block text-sm font-bold text-brand-navy/60 uppercase tracking-widest ml-1"
              >
                Party Code
              </label>
              <div className="relative group">
                <input
                  id="partyCode"
                  name="partyCode"
                  type="text"
                  required
                  value={partyCode}
                  onChange={(e) => setPartyCode(e.target.value.toUpperCase())}
                  className="w-full rounded-2xl border-2 border-brand-purple/20 bg-white/80 px-8 py-6 text-center text-3xl sm:text-4xl font-black tracking-[0.3em] text-brand-navy placeholder:text-brand-navy/20 focus:border-brand-magenta focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-magenta/20 transition-all shadow-lg shadow-brand-purple/10 group-hover:shadow-xl group-hover:shadow-brand-purple/20"
                  placeholder="ABC123"
                  maxLength={10}
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-brand-magenta/0 via-brand-purple/5 to-brand-cyan/0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-xs text-brand-navy/50 text-center">
                Got a code from your host? Enter it above
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !partyCode.trim()}
              className="w-full group relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-magenta via-brand-purple to-brand-cyan px-8 py-5 text-xl font-bold text-white shadow-2xl shadow-brand-purple/40 transition-all hover:scale-[1.02] hover:shadow-3xl hover:shadow-brand-magenta/50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Joining Party...
                  </>
                ) : (
                  <>
                    🎬 Join Now
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-brand-cyan via-brand-purple to-brand-magenta opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </button>
          </form>

          {/* Feature Pills */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {[
              { icon: "⚡", text: "Instant Access" },
              { icon: "🔒", text: "Private & Secure" },
              { icon: "💬", text: "Live Chat" },
              { icon: "🎭", text: "Reactions" }
            ].map((feature, index) => (
              <div 
                key={index}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-brand-navy/10 shadow-sm hover:shadow-md hover:bg-white/80 transition-all"
              >
                <span className="text-sm">{feature.icon}</span>
                <span className="text-xs font-semibold text-brand-navy/70">{feature.text}</span>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-brand-navy/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white/80 px-4 py-1 rounded-full text-brand-navy/50 font-medium">
                or
              </span>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center space-y-4">
            <p className="text-base text-brand-navy/70 font-medium">
              Want to host your own watch party?
            </p>
            <Link 
              href="/auth/register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/80 border-2 border-brand-cyan/30 text-brand-cyan-dark font-bold shadow-lg shadow-brand-cyan/10 hover:bg-brand-cyan/10 hover:border-brand-cyan hover:shadow-xl hover:shadow-brand-cyan/20 hover:-translate-y-0.5 transition-all"
            >
              <span>✨</span>
              Create Your Free Account
              <span>→</span>
            </Link>
            <p className="text-xs text-brand-navy/50">
              Already have an account?{" "}
              <Link 
                href="/auth/login" 
                className="text-brand-purple hover:text-brand-magenta font-semibold underline decoration-brand-purple/30 hover:decoration-brand-magenta/50 underline-offset-2 transition-all"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-brand-orange/30 to-brand-coral/30 rounded-full blur-2xl animate-pulse-slow" style={{ animationDelay: '0.5s' }} />
        <div className="absolute -bottom-6 -left-6 w-40 h-40 bg-gradient-to-br from-brand-blue/30 to-brand-cyan/30 rounded-full blur-2xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
      </div>
    </div>
  )
}
