import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import "@/lib/auth/token-storage"
import { CinemaHeader } from "@/components/layout/cinema-header"
import { CinemaNavigation } from "@/components/layout/cinema-navigation"
import { CinemaFooter } from "@/components/layout/cinema-footer"
import { GeneralLayout } from "@/components/layout/general-layout"
import { Toaster } from "@/components/ui/toaster"
import { Providers } from "@/components/providers"

export const metadata: Metadata = { title: "WatchParty - Stream Together, Anywhere",
  description:
    "The next-generation cinematic platform for synchronized video watching with friends. Experience movies, shows, and content together in real-time with stunning visuals.",
  keywords: ["watch party", "streaming", "synchronized viewing", "social media", "entertainment", "cinema"],
  authors: [{ name: "WatchParty Team" }],
  creator: "WatchParty",
  publisher: "WatchParty",
  formatDetection: {}
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {}
    title: "WatchParty - Stream Together, Anywhere",
    description: "The next-generation cinematic platform for synchronized video watching with friends.",
    url: "/",
    siteName: "WatchParty",
    images: [0]
      {}
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "WatchParty - Stream Together, Anywhere",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {}
    card: "summary_large_image",
    title: "WatchParty - Stream Together, Anywhere",
    description: "The next-generation cinematic platform for synchronized video watching with friends.",
    images: ["/og-image.jpg"],
    creator: "@watchparty",
  },
  robots: {}
    index: true,
    follow: true,
    googleBot: {}
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {}
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  generator: "v0.dev",

export default function RootLayout({children,
}: {}
  children: React.ReactNode
}) {}
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className="font-sans antialiased overflow-x-hidden bg-black text-white">
        <Providers>
          <div className="min-h-screen bg-black relative flex flex-col">
            {/* Main Layout */}
            <div className="relative z-10 flex-1 flex flex-col">
              <CinemaHeader />
              <CinemaNavigation />
              <GeneralLayout>
                <main className="flex-1 bg-black">{children}</main>
              </GeneralLayout>
            </div>
            {/* Footer */}
            <CinemaFooter />

            {/* Toast Notifications */}
            <Toaster />

            {/* Loading Indicator */}
            <div id="global-loading" className="fixed top-0 left-0 w-full h-1 bg-black z-50 hidden">
              <div className="h-full bg-white" />
            </div>
          </div>
        </Providers>
      </body>
    </html>
