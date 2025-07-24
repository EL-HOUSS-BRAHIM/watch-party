"use client"

import { createContext, useContext, type ReactNode } from "react"

interface FeatureFlags {
  enableVoiceChat: boolean
  enableScreenSharing: boolean
  enableAdvancedAnalytics: boolean
  enableBetaFeatures: boolean
  enableMobileApp: boolean
}

interface FeatureFlagContextType {
  flags: FeatureFlags
  isEnabled: (flag: keyof FeatureFlags) => boolean
}

const defaultFlags: FeatureFlags = {
  enableVoiceChat: true,
  enableScreenSharing: false,
  enableAdvancedAnalytics: true,
  enableBetaFeatures: false,
  enableMobileApp: true,
}

const FeatureFlagContext = createContext<FeatureFlagContextType | undefined>(undefined)

export function FeatureFlagProvider({ children }: { children: ReactNode }) {
  // In a real app, these would come from a feature flag service
  const flags = defaultFlags

  const isEnabled = (flag: keyof FeatureFlags) => {
    return flags[flag] ?? false
  }

  const value: FeatureFlagContextType = {
    flags,
    isEnabled,
  }

  return <FeatureFlagContext.Provider value={value}>{children}</FeatureFlagContext.Provider>
}

export function useFeatureFlags() {
  const context = useContext(FeatureFlagContext)
  if (context === undefined) {
    throw new Error("useFeatureFlags must be used within a FeatureFlagProvider")
  }
  return context
}
