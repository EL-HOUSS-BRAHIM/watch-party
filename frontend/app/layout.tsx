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
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1">
              <div className="mx-auto w-full max-w-6xl px-5 pb-16 pt-16 sm:px-8">
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
