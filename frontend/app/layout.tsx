import type { Metadata } from "next"
import type { ReactNode } from "react"
import "./globals.css"
import { Providers } from "@/components/providers"
import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"

export const metadata: Metadata = {
  title: {
    default: "WatchParty",
    template: "%s | WatchParty",
  },
  description:
    "Stage luminous watch parties from sunrise premieres to midnight marathons with WatchParty's day-and-night cinema toolkit.",
}

type RootLayoutProps = {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-[var(--color-midnight-950)] font-sans text-[color:var(--color-text-primary)]">
        <Providers>
          <div className="relative flex min-h-screen flex-col overflow-hidden">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-20 overflow-hidden"
            >
              <div className="absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.48),transparent_65%)] opacity-60 blur-[120px]" />
              <div className="absolute -left-56 top-16 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,214,170,0.55),transparent_60%)] blur-[120px]" />
              <div className="absolute -right-40 bottom-[-22%] h-[680px] w-[680px] rounded-full bg-[radial-gradient(circle_at_center,rgba(68,45,160,0.65),transparent_70%)] blur-[140px]" />
              <div className="absolute inset-0 bg-[conic-gradient(from_260deg_at_20%_10%,rgba(255,255,255,0.18),rgba(20,12,52,0.35),rgba(255,255,255,0.06))] opacity-50" />
              <div className="grid-overlay" />
              <div className="noise-overlay" />
            </div>
            <SiteHeader />
            <main className="flex-1">
              <div className="mx-auto w-full max-w-7xl px-5 pb-24 pt-24 sm:px-8 lg:px-12">
                {children}
              </div>
            </main>
            <SiteFooter />
          </div>
        </Providers>
      </body>
    </html>
  )
}
