import type { Metadata, Viewport } from "next"
import type { ReactNode } from "react"
import "./globals.css"
import "../styles/mobile.css"
import { Providers } from "@/components/providers"
import { SiteFooter } from "@/components/layout/site-footer"
import { MarketingHeader } from "@/components/layout/marketing-header"
import { ConditionalLayout } from "@/components/layout/conditional-layout"

export const metadata: Metadata = {
  title: {
    default: "WatchParty",
    template: "%s | WatchParty",
  },
  description:
    "Stage luminous watch parties from sunrise premieres to midnight marathons with WatchParty's day-and-night cinema toolkit.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Watch Party"
  },
  formatDetection: {
    telephone: false,
    date: false,
    address: false,
    email: false,
    url: false
  }
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#F5F1EB"
}

type RootLayoutProps = {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#F5F1EB" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Watch Party" />
        <meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no" />
      </head>
      <body className="bg-brand-neutral font-sans text-brand-navy mobile-optimized">
        <Providers>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </Providers>
      </body>
    </html>
  )
}
