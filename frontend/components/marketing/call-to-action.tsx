import Link from "next/link"
import { Button } from "@/components/ui/button"

export function CallToAction() {
  return (
    <section className="relative overflow-hidden rounded-[40px] border border-brand-purple/15 bg-gradient-to-br from-white via-white to-brand-purple/5 px-8 py-16 text-brand-navy shadow-[0_36px_100px_rgba(28,28,46,0.15)] backdrop-blur-sm sm:px-12 sm:py-20 lg:px-20 lg:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(233,64,138,0.16),transparent_60%),radial-gradient(circle_at_bottom_left,rgba(59,198,232,0.18),transparent_60%)] opacity-70"
      />
      <div className="relative flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
        <div className="max-w-2xl space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-magenta/25 bg-brand-magenta/8 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.5em] text-brand-magenta-dark shadow-sm">
            🚀 Ready to host
          </span>
          <h2 className="text-3xl font-bold tracking-tight leading-[1.2] sm:text-4xl lg:text-5xl">
            Create cinematic watch parties that bring people
            <span className="bg-gradient-to-r from-brand-magenta via-brand-orange to-brand-cyan bg-clip-text text-transparent"> together</span>
          </h2>
          <p className="text-base leading-relaxed text-brand-navy/65 sm:text-lg">
            Choose a template, invite your crew, and let WatchParty handle the rest. Perfect sync, immersive features, and unforgettable moments—all in one platform.
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-start gap-4 lg:items-center">
          <Button size="lg" asChild className="w-full min-w-[240px] lg:w-auto">
            <Link href="/dashboard">Launch Your Party 🎉</Link>
          </Button>
          <Button variant="secondary" size="lg" asChild className="w-full min-w-[240px] lg:w-auto">
            <Link href="/pricing">View Pricing</Link>
          </Button>
          <p className="mt-1 text-center text-xs text-brand-navy/55 lg:text-sm">
            ✨ Includes real-time sync, live reactions, and unlimited watch parties
          </p>
        </div>
      </div>
    </section>
  )
}
