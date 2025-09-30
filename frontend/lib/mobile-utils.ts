/**
 * Mobile optimization utilities and responsive design system
 */

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

// Device detection utilities
export const isMobile = () => {
  if (typeof window === "undefined") return false
  return window.innerWidth < 768
}

export const isTablet = () => {
  if (typeof window === "undefined") return false
  return window.innerWidth >= 768 && window.innerWidth < 1024
}

export const isDesktop = () => {
  if (typeof window === "undefined") return false
  return window.innerWidth >= 1024
}

export const isTouchDevice = () => {
  if (typeof window === "undefined") return false
  return "ontouchstart" in window || navigator.maxTouchPoints > 0
}

// Responsive breakpoints (matching Tailwind defaults)
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536
} as const

// Mobile-first responsive classes
export const responsiveClasses = {
  // Grid layouts
  mobileGrid: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  tabletGrid: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  
  // Spacing
  mobilePadding: "p-4 md:p-6 lg:p-8",
  mobileMargin: "m-4 md:m-6 lg:m-8",
  
  // Typography
  mobileHeading: "text-2xl md:text-3xl lg:text-4xl",
  mobileText: "text-sm md:text-base lg:text-lg",
  
  // Layout
  mobileContainer: "px-4 md:px-6 lg:px-8 max-w-7xl mx-auto",
  mobileSection: "py-8 md:py-12 lg:py-16",
  
  // Navigation
  mobileNav: "block md:hidden",
  desktopNav: "hidden md:block",
  
  // Buttons
  mobileButton: "w-full md:w-auto px-6 py-3 md:px-4 md:py-2",
  touchButton: "min-h-[44px] min-w-[44px]", // Apple's recommended touch target size
}

// Touch-friendly input styles
export const touchInputStyles = {
  input: "min-h-[44px] px-4 py-3 text-base", // Prevents zoom on iOS
  button: "min-h-[44px] px-6 py-3 text-base font-medium",
  select: "min-h-[44px] px-4 py-3 text-base",
  textarea: "min-h-[88px] px-4 py-3 text-base resize-none"
}

// Safe area utilities for devices with notches
export const safeAreaStyles = {
  top: "pt-safe-top",
  bottom: "pb-safe-bottom",
  left: "pl-safe-left", 
  right: "pr-safe-right",
  full: "pt-safe-top pb-safe-bottom pl-safe-left pr-safe-right"
}

// Animation utilities optimized for mobile
export const mobileAnimations = {
  // Reduced motion for better battery life
  fadeIn: "animate-in fade-in duration-300",
  slideUp: "animate-in slide-in-from-bottom-4 duration-300",
  slideDown: "animate-in slide-in-from-top-4 duration-300",
  slideLeft: "animate-in slide-in-from-right-4 duration-300",
  slideRight: "animate-in slide-in-from-left-4 duration-300",
  
  // Touch feedback
  touchScale: "active:scale-95 transition-transform duration-100",
  touchOpacity: "active:opacity-70 transition-opacity duration-100"
}

// Viewport utilities
export const getViewportHeight = () => {
  if (typeof window === "undefined") return 0
  // Use visualViewport for better mobile support
  return window.visualViewport?.height || window.innerHeight
}

export const getViewportWidth = () => {
  if (typeof window === "undefined") return 0
  return window.visualViewport?.width || window.innerWidth
}

// Performance optimizations for mobile
export const mobileOptimizations = {
  // Lazy loading classes
  lazyImage: "loading-lazy transition-opacity duration-300",
  
  // Reduce reflows/repaints
  willChange: "will-change-transform",
  transform3d: "transform-gpu",
  
  // Touch scroll optimization
  touchScroll: "overflow-auto -webkit-overflow-scrolling-touch",
  
  // Prevent text selection on interactive elements
  noSelect: "select-none",
  
  // Disable tap highlighting
  noTapHighlight: "tap-highlight-transparent"
}

// Media query hooks
export const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false)
  
  useEffect(() => {
    if (typeof window === "undefined") return
    
    const media = window.matchMedia(query)
    setMatches(media.matches)
    
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches)
    media.addEventListener("change", listener)
    
    return () => media.removeEventListener("change", listener)
  }, [query])
  
  return matches
}

// Responsive value hook
export const useResponsiveValue = <T>(values: {
  mobile: T
  tablet?: T
  desktop?: T
}) => {
  const isMobileScreen = useMediaQuery(`(max-width: ${breakpoints.md - 1}px)`)
  const isTabletScreen = useMediaQuery(`(min-width: ${breakpoints.md}px) and (max-width: ${breakpoints.lg - 1}px)`)
  
  if (isMobileScreen) return values.mobile
  if (isTabletScreen && values.tablet) return values.tablet
  if (values.desktop) return values.desktop
  
  return values.mobile
}

// Haptic feedback (iOS only)
export const hapticFeedback = {
  light: () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(10)
    }
  },
  medium: () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(20)
    }
  },
  heavy: () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(30)
    }
  },
  selection: () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(5)
    }
  }
}

// PWA utilities
export const pwaHelpers = {
  // Check if app is installed
  isInstalled: () => {
    if (typeof window === "undefined") return false
    return window.matchMedia("(display-mode: standalone)").matches ||
           (window.navigator as any).standalone === true
  },
  
  // Check if install prompt is available
  canInstall: () => {
    if (typeof window === "undefined") return false
    return "beforeinstallprompt" in window
  },
  
  // Add to home screen prompt
  promptInstall: (deferredPrompt: any) => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      return deferredPrompt.userChoice
    }
    return Promise.resolve({ outcome: "dismissed" })
  }
}

export default {
  isMobile,
  isTablet,
  isDesktop,
  isTouchDevice,
  breakpoints,
  responsiveClasses,
  touchInputStyles,
  safeAreaStyles,
  mobileAnimations,
  getViewportHeight,
  getViewportWidth,
  mobileOptimizations,
  useMediaQuery,
  useResponsiveValue,
  hapticFeedback,
  pwaHelpers
}