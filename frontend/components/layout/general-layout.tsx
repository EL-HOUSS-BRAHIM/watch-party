import React from 'react'
import { usePathname } from 'next/navigation'

'use client'

interface GeneralLayoutProps {}
  children: React.ReactNode;
}

export function GeneralLayout({ children }: GeneralLayoutProps) {}
  const pathname = usePathname()
  // Pages that should have header but no sidebar;
  const isGeneralPage = pathname?.startsWith('/discover') || 
                        pathname?.startsWith('/search') || 
                        pathname?.startsWith('/videos') ||
                        pathname?.startsWith('/profile') ||
                        pathname?.startsWith('/help') ||
                        pathname?.startsWith('/about') ||
                        pathname?.startsWith('/terms') ||
                        pathname?.startsWith('/privacy') ||
                        pathname?.startsWith('/bugs') ||
                        pathname?.startsWith('/join') ||
                        pathname?.startsWith('/invite')

  if (!isGeneralPage) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Main Content Area - No sidebar, but account for header */}
      <div className="pt-16">
        <main>
          {children}
        </main>
      </div>
    </div>
  )
}
