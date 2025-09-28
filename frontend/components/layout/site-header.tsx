import Link from "next/link"
import { Button } from "@/components/ui/button"

const navigation = [
  { href: "/about", label: "Story" },
  { href: "/pricing", label: "Plans" },
  { href: "/guides/watch-night", label: "Guide" },
  { href: "#features", label: "Toolkit" },
  { href: "#metrics", label: "Impact" },
  { href: "#testimonials", label: "Community" },
]

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 flex flex-col gap-3 bg-gradient-to-b from-[rgba(6,3,24,0.85)] via-[rgba(6,3,24,0.55)] to-transparent pb-2 pt-6">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="relative flex items-center justify-between gap-3 rounded-full border border-white/15 bg-[rgba(14,9,36,0.72)] px-4 py-3 shadow-[0_20px_60px_rgba(6,3,24,0.45)] backdrop-blur-2xl sm:px-5">
          <Link
            href="/"
            className="group flex items-center gap-3 rounded-full bg-white/5 px-3 py-1.5 text-sm font-semibold tracking-tight text-white transition-all duration-300 hover:bg-white/10"
            aria-label="WatchParty home"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[var(--color-accent-500)] text-xs font-bold uppercase text-[#1b0a09] shadow-[0_16px_40px_rgba(255,196,150,0.45)] transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-105">
              WP
            </span>
            <span className="hidden flex-col leading-none sm:flex">
              <span className="text-[10px] font-semibold uppercase tracking-[0.45em] text-white/60">
                Day &amp; night
              </span>
              <span className="text-base text-white">WatchParty</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-6 text-[12px] font-medium uppercase tracking-[0.34em] text-white/60 md:flex">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-2 py-1 transition-all duration-200 hover:bg-white/10 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.45em] text-white/60 sm:flex">
              <span className="h-2 w-2 rounded-full bg-white/80 shadow-[0_0_12px_rgba(255,255,255,0.7)]" aria-hidden />
              Live
            </div>
            <Button variant="ghost" size="sm" className="hidden md:inline-flex" asChild>
              <Link href="/about">Inside WatchParty</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/dashboard">Launch studio</Link>
            </Button>
          </div>
        </div>
        <nav className="mt-3 flex gap-3 overflow-x-auto text-[11px] uppercase tracking-[0.45em] text-white/55 md:hidden">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex-shrink-0 rounded-full border border-white/10 px-3 py-1.5 transition-colors duration-200 hover:border-white/40 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
