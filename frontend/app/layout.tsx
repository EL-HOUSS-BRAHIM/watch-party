import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { CinemaHeader } from "@/components/layout/cinema-header"
import { CinemaNavigation } from "@/components/layout/cinema-navigation"
import { Toaster } from "@/components/ui/toaster"
import { Providers } from "@/components/providers"

export const metadata: Metadata = {
  title: "WatchParty - Stream Together, Anywhere",
  description:
    "The next-generation cinematic platform for synchronized video watching with friends. Experience movies, shows, and content together in real-time with stunning visuals.",
  keywords: ["watch party", "streaming", "synchronized viewing", "social media", "entertainment", "cinema"],
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
    description: "The next-generation cinematic platform for synchronized video watching with friends.",
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
    description: "The next-generation cinematic platform for synchronized video watching with friends.",
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
    <html lang="en" suppressHydrationWarning className="dark">
      <body className="font-sans antialiased overflow-x-hidden">
        <Providers>
          <div className="min-h-screen bg-cinema-deep relative">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-br from-neon-red/5 via-transparent to-neon-blue/5" />
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-red/10 rounded-full blur-3xl opacity-30 animate-float" />
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-neon-blue/10 rounded-full blur-3xl opacity-30 animate-float" style={{ animationDelay: "1s" }} />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-neon-purple/5 rounded-full blur-3xl opacity-20 animate-float" style={{ animationDelay: "2s" }} />
            </div>
            
            {/* Main Layout */}
            <div className="relative z-10">
              <CinemaHeader />
              <CinemaNavigation />
              <main className="min-h-[calc(100vh-5rem)]">
                {children}
              </main>
            </div>
            
            {/* Toast Notifications */}
            <Toaster />
            
            {/* Loading Indicator */}
            <div id="global-loading" className="fixed top-0 left-0 w-full h-1 bg-cinema-dark z-50 hidden">
              <div className="h-full bg-gradient-to-r from-neon-red via-neon-purple to-neon-blue animate-gradient-shift bg-[length:200%_100%]" />
            </div>
          </div>
        </Providers>
      </body>
    </html>
  )
}
