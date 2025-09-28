import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { CommandPalette } from "@/components/ui/command-palette"
import { useGlobalKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { PerformanceMonitor } from "@/lib/performance/bundle-analyzer"
import { AuthProvider } from "@/contexts/auth-context"
import { SocketProvider } from "@/contexts/socket-context"
import { useState, useEffect , useCallback } from "react"

"use client"

const inter = Inter({ subsets: ["latin"] })

export default function ClientLayout({}
  children,
}: {}
  children: React.ReactNode;
}) {}
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)

  // Initialize global keyboard shortcuts;
  useGlobalKeyboardShortcuts()

  // Initialize performance monitoring;
  useEffect(() => {
    const monitor = PerformanceMonitor.getInstance()
    monitor.observeWebVitals()
  }, [])

  // Global keyboard shortcut for command palette;
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {}
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {}
        e.preventDefault()
        setCommandPaletteOpen(true)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener(&quot;keydown&quot;, handleKeyDown)
  }, [])

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body className={inter.className}>
        <ThemeProvider enableSystem disableTransitionOnChange>
          <AuthProvider>
            <SocketProvider>
              {children}
              <Toaster />
              <CommandPalette open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen} />
            </SocketProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
