import Link from "next/link"
import { Button } from "@/components/ui/button"

export function CallToAction() {
  return (
    <section className="relative overflow-hidden rounded-3xl border-2 border-white/20 bg-gradient-to-br from-purple-900/40 to-blue-900/40 px-10 py-20 shadow-2xl backdrop-blur-sm sm:px-16 lg:px-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.3),transparent_50%)] opacity-70"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.3),transparent_50%)] opacity-70"
      />
      <div className="relative flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl space-y-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/20 px-5 py-2 text-sm font-bold uppercase tracking-wider text-purple-300">
            🚀 Ready to host
          </span>
          <h2 className="text-4xl font-black tracking-tight text-white sm:text-5xl leading-tight">
            Create cinematic watch parties that bring people{" "}
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">together</span>
          </h2>
          <p className="text-xl text-white/90 leading-relaxed font-medium">
            Choose a template, invite your crew, and let WatchParty handle the rest. Perfect sync, immersive features, 
            and unforgettable moments—all in one platform.
          </p>
        </div>
        <div className="flex flex-col items-start gap-5">
          <Button size="lg" asChild className="w-full lg:w-auto text-lg px-8 py-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 font-bold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
            <Link href="/dashboard">Launch Your Party 🎉</Link>
          </Button>
          <Button variant="secondary" size="lg" asChild className="w-full lg:w-auto text-lg px-8 py-6 font-bold border-2 border-white/30 hover:bg-white/10">
            <Link href="/pricing">View Pricing</Link>
          </Button>
          <p className="max-w-xs text-sm text-white/70 font-semibold mt-2">
            ✨ Includes real-time sync, live reactions, and unlimited watch parties
          </p>
        </div>
      </div>
    </section>
  )
}
