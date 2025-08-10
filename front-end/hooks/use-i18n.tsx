"use client"

import type React from "react"

import { useState, useEffect, createContext, useContext } from "react"
import { translations, type AllTranslationKeys } from "@/lib/i18n/translations"

interface I18nContextType {
  language: string
  currentLanguage: string  // Add alias for compatibility
  setLanguage: (lang: string) => void
  t: (key: AllTranslationKeys, fallback?: string) => string
  availableLanguages: Array<{
    code: string
    name: string
    nativeName: string
    flag: string
  }>
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export const useI18n = () => {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider")
  }
  return context
}

export const I18nProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState("en")

  const availableLanguages = [
    { code: "en", name: "English", nativeName: "English", flag: "🇺🇸" },
    { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
    { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
  ]

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem("watchparty-language")
    if (savedLanguage && translations[savedLanguage as keyof typeof translations]) {
      setLanguage(savedLanguage)
    }
  }, [])

  // Save language to localStorage when changed
  useEffect(() => {
    localStorage.setItem("watchparty-language", language)
  }, [language])

  const t = (key: AllTranslationKeys, fallback?: string): string => {
    const keys = key.split(".")
    let value: any = translations[language as keyof typeof translations] || translations.en

    for (const k of keys) {
      value = value?.[k]
    }

    if (typeof value !== "string") {
      // Fallback to English if translation not found
      value = translations.en
      for (const k of keys) {
        value = value?.[k]
      }
    }

    if (typeof value !== "string") {
      return fallback || key // Return fallback or key if no translation found
    }

    return value
  }

  return (
    <I18nContext.Provider value={{ 
      language, 
      currentLanguage: language,  // Add alias
      setLanguage, 
      t, 
      availableLanguages 
    }}>
      {children}
    </I18nContext.Provider>
  )
}
