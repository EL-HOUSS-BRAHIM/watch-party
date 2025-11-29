import Link from "next/link"
import { Button } from "@/components/ui/button"

export function CallToAction() {
  return (
    <section className="relative rounded-xl sm:rounded-2xl border border-brand-purple/10 bg-gradient-to-br from-white via-white to-brand-purple/5 px-4 py-10 text-brand-navy backdrop-blur-sm sm:px-8 sm:py-14 md:px-10 md:py-16 lg:px-14 lg:py-20">
      {/* Subtle background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-xl sm:rounded-2xl bg-[radial-gradient(ellipse_at_top_right,rgba(233,64,138,0.06),transparent_55%),radial-gradient(ellipse_at_bottom_left,rgba(59,198,232,0.06),transparent_55%)]"
      />

      <div className="relative flex flex-col gap-6 sm:gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
        {/* Content */}
        <div className="max-w-lg space-y-3 sm:space-y-4 text-center lg:text-left">
          <span className="inline-flex items-center rounded-full border border-brand-magenta/20 bg-brand-magenta/5 px-2.5 py-1 text-[11px] sm:text-xs font-medium text-brand-magenta-dark">
            🚀 Ready to host
          </span>
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl lg:text-4xl">
            Create cinematic watch parties that bring people
            <span className="bg-gradient-to-r from-brand-magenta to-brand-cyan bg-clip-text text-transparent"> together</span>
          </h2>
          <p className="text-sm text-brand-navy/60 sm:text-base">
            Choose a template, invite your crew, and let WatchParty handle the rest. Perfect sync and unforgettable moments.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:flex-col lg:items-start">
          <Button size="lg" asChild className="w-full sm:w-auto min-h-[48px]">
            <Link href="/dashboard">Launch Your Party 🎉</Link>
          </Button>
          <Button variant="secondary" size="lg" asChild className="w-full sm:w-auto min-h-[48px]">
            <Link href="/pricing">View Pricing</Link>
          </Button>
          <p className="text-[11px] sm:text-xs text-brand-navy/50 text-center lg:text-left mt-1">
            ✨ Real-time sync, live reactions, unlimited parties
          </p>
        </div>
      </div>
    </section>
  )
}
