import Link from "next/link"

import { Button } from "@/components/ui/button"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-[rgba(5,4,18,0.9)] backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label="WatchParty home">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[var(--color-accent-500)] text-sm font-semibold text-[#1b0a09]">
            WP
          </span>
          <span className="hidden flex-col leading-tight sm:flex">
            <span className="text-xs font-medium uppercase tracking-[0.35em] text-white/60">WatchParty</span>
            <span className="text-base font-semibold text-white">Watch together easily</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/rooms">Join a party</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/dashboard">Log in</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
