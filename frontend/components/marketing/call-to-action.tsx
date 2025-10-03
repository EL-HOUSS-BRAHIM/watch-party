import Link from "next/link"
import { Button } from "@/components/ui/button"

export function CallToAction() {
  return (
    <section className="relative overflow-hidden rounded-[40px] border border-brand-purple/20 bg-white/90 px-10 py-20 text-brand-navy shadow-[0_48px_150px_rgba(28,28,46,0.18)] backdrop-blur-sm sm:px-16 lg:px-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(233,64,138,0.24),transparent_55%),radial-gradient(circle_at_bottom_left,rgba(59,198,232,0.22),transparent_55%),radial-gradient(circle_at_center,rgba(243,156,18,0.2),transparent_60%)] opacity-90"
      />
      <div className="relative flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl space-y-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-magenta/30 bg-brand-magenta/10 px-5 py-2 text-sm font-bold uppercase tracking-[0.45em] text-brand-magenta-dark">
            Ready to cue the night
          </span>
          <h2 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl">
            Launch a WatchParty that feels like sharing the same couch
          </h2>
          <p className="text-lg leading-relaxed text-brand-navy/75">
            Choose a scene template, invite your crew, and press play. WatchParty handles sync, ambience, and highlights so you can focus on reactions and memories.
          </p>
        </div>
        <div className="flex flex-col items-start gap-5">
          <Button size="lg" asChild className="w-full px-8 py-6 text-lg font-bold lg:w-auto">
            <Link href="/auth/register">Launch your first party 🎉</Link>
          </Button>
          <Button variant="secondary" size="lg" asChild className="w-full px-8 py-6 text-lg font-bold lg:w-auto">
            <Link href="/join">Join with a code</Link>
          </Button>
          <p className="mt-2 max-w-xs text-sm font-semibold text-brand-navy/60">
            ✨ Includes day-to-night ambience presets, synced chat, and unlimited guest invites.
          </p>
        </div>
      </div>
    </section>
  )
}
