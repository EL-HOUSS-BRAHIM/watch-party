import Link from "next/link"
import { Button } from "@/components/ui/button"

export function CallToAction() {
  return (
    <section className="relative overflow-hidden rounded-[44px] border border-white/12 bg-[rgba(10,6,30,0.82)] px-7 py-16 shadow-[0_60px_150px_rgba(4,2,22,0.6)] sm:px-12 lg:px-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_70%)] opacity-70"
      />
      <div className="relative flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1 text-[11px] uppercase tracking-[0.45em] text-white/65">
            Ready to host
          </span>
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Spin up a cinematic watch lounge that transitions from white morning light to twilight glow
          </h2>
          <p className="text-base text-white/75">
            Choose a template, invite your crew, and let WatchParty automate the ambience. Your audience experiences the story in sync whether they join at brunch or stay for the midnight encore.
          </p>
        </div>
        <div className="flex flex-col items-start gap-4 text-sm text-white/75">
          <Button size="lg" asChild>
            <Link href="/dashboard">Launch the studio</Link>
          </Button>
          <Button variant="secondary" size="lg" asChild>
            <Link href="/pricing">Compare plans</Link>
          </Button>
          <p className="max-w-xs text-xs uppercase tracking-[0.42em] text-white/55">
            Includes dual ambience presets, spoiler-safe chat, and instant sync invites.
          </p>
        </div>
      </div>
    </section>
  )
}
