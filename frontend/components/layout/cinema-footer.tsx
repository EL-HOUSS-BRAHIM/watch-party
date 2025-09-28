"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Link, Play } from "lucide-react"



export function CinemaFooter() {
  const pathname = usePathname()
  // Hide footer on auth pages and admin pages
  const isAuthPage = pathname?.startsWith('/(auth)') || 
                     pathname?.includes('/login') || 
                     pathname?.includes('/register') || 
                     pathname?.includes('/forgot-password') ||
                     pathname?.includes('/reset-password') ||
                     pathname?.includes('/verify-email') ||
                     pathname?.includes('/2fa') ||
                     pathname?.includes('/callback')
  const isAdminPage = pathname?.startsWith('/admin')
  if (isAuthPage || isAdminPage) return null
  return (
    <footer className="border-t border-white/10 py-12 bg-black/20 backdrop-blur-sm mt-auto">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
              <Play className="w-6 h-6 text-white fill-white" />
            </div>
            <div>
              <span className="text-2xl font-bold text-white">WatchParty</span>
              <div className="text-xs text-white/80 font-medium">CINEMA</div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap justify-center gap-8 text-white/60">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms
            </Link>
            <Link href="/help" className="hover:text-white transition-colors">
              Support
            </Link>
            <Link href="/about" className="hover:text-white transition-colors">
              About
            </Link>
            <Link href="/discover" className="hover:text-white transition-colors">
              Discover
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-white/10 text-center">
          <p className="text-white/40 text-sm">
            © 2025 WatchParty Cinema. All rights reserved. Built for the future of social entertainment.
          </p>
        </div>
      </div>
    </footer>
  )
}
