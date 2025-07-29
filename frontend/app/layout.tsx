import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { WatchPartyThemeProvider } from "@/components/theme/theme-provider"
import { WatchPartyHeader } from "@/components/layout/watch-party-header"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "WatchParty - Stream Together, Anywhere",
  description:
    "The next-generation platform for synchronized video watching with friends. Experience movies, shows, and content together in real-time.",
  keywords: ["watch party", "streaming", "synchronized viewing", "social media", "entertainment"],
  authors: [{ name: "WatchParty Team" }],
  creator: "WatchParty",
  publisher: "WatchParty",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"),
  openGraph: {
    title: "WatchParty - Stream Together, Anywhere",
    description: "The next-generation platform for synchronized video watching with friends.",
    url: "/",
    siteName: "WatchParty",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "WatchParty - Stream Together, Anywhere",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WatchParty - Stream Together, Anywhere",
    description: "The next-generation platform for synchronized video watching with friends.",
    images: ["/og-image.jpg"],
    creator: "@watchparty",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <WatchPartyThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <div className="min-h-screen bg-watch-party-bg text-watch-party-text-primary">
            <WatchPartyHeader />
            <main className="flex-1">{children}</main>
            <Toaster />
          </div>
        </WatchPartyThemeProvider>
      </body>
    </html>
  )
}
