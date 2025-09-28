'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

const navigation = [
  { href: "/dashboard", label: "Overview" },
  { href: "/rooms", label: "Rooms" },
  { href: "/library", label: "Library" },
  { href: "/settings", label: "Settings" },
]

type DashboardLayoutProps = {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()

  return (
    <div className="relative flex flex-col gap-10 lg:flex-row">
      <aside className="w-full rounded-[32px] border border-white/12 bg-[rgba(15,9,46,0.75)] p-6 text-white shadow-[0_35px_120px_rgba(5,3,28,0.55)] lg:sticky lg:top-32 lg:h-fit lg:max-w-[280px]">
        <div className="space-y-6">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">WatchParty</p>
            <p className="mt-2 text-2xl font-semibold text-white">Host lounge</p>
            <p className="mt-3 text-sm text-white/70">
              Manage ambience, schedules, and community cues for every watch night.
            </p>
          </div>
          <nav className="space-y-2 text-sm">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between rounded-2xl border border-transparent px-4 py-3 text-white/70 transition-all duration-200",
                    isActive
                      ? "border-white/25 bg-white/10 text-white"
                      : "hover:border-white/15 hover:bg-white/5 hover:text-white",
                  )}
                >
                  <span className="text-sm font-medium uppercase tracking-[0.35em]">{item.label}</span>
                  <span aria-hidden className="text-xs text-white/40">→</span>
                </Link>
              )
            })}
          </nav>
          <div className="rounded-3xl border border-white/12 bg-white/5 p-4 text-xs uppercase tracking-[0.35em] text-white/60">
            Dual ambience: <span className="ml-2 rounded-full bg-[var(--color-accent-500)] px-3 py-1 text-[#1c0c06]">Auto</span>
          </div>
        </div>
      </aside>
      <div className="flex-1 space-y-10">
        {children}
      </div>
    </div>
  )
}
