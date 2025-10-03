import Link from "next/link"
import { Button } from "@/components/ui/button"

export function CallToAction() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-brand-purple/20 bg-white/90 px-10 py-20 text-brand-navy shadow-[0_40px_120px_rgba(28,28,46,0.18)] backdrop-blur-sm sm:px-16 lg:px-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(233,64,138,0.22),transparent_55%),radial-gradient(circle_at_bottom_left,rgba(59,198,232,0.22),transparent_55%)] opacity-80"
      />
      <div className="relative flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl space-y-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-magenta/30 bg-brand-magenta/10 px-5 py-2 text-sm font-bold uppercase tracking-wider text-brand-magenta-dark">
            🚀 Ready to host
          </span>
          <h2 className="text-4xl font-black tracking-tight sm:text-5xl leading-tight">
            Create cinematic watch parties that bring people
            <span className="bg-gradient-to-r from-brand-magenta via-brand-orange to-brand-cyan bg-clip-text text-transparent"> together</span>
          </h2>
          <p className="text-xl font-medium leading-relaxed text-brand-navy/75">
            Choose a template, invite your crew, and let WatchParty handle the rest. Perfect sync, immersive features, and unforgettable moments—all in one platform.
          </p>
        </div>
        <div className="flex flex-col items-start gap-5">
          <Button size="lg" asChild className="w-full px-8 py-6 text-lg font-bold lg:w-auto">
            <Link href="/dashboard">Launch Your Party 🎉</Link>
          </Button>
          <Button variant="secondary" size="lg" asChild className="w-full px-8 py-6 text-lg font-bold lg:w-auto">
            <Link href="/pricing">View Pricing</Link>
          </Button>
          <p className="mt-2 max-w-xs text-sm font-semibold text-brand-navy/60">
            ✨ Includes real-time sync, live reactions, and unlimited watch parties
          </p>
        </div>
      </div>
    </section>
  )
}
