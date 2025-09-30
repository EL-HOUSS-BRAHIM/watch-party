"use client"

import { useState, useEffect } from "react"

interface VirtualKeyboardProps {
  isVisible: boolean
  onHeightChange?: (height: number) => void
}

export default function VirtualKeyboard({ isVisible, onHeightChange }: VirtualKeyboardProps) {
  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const [initialViewportHeight, setInitialViewportHeight] = useState(0)

  useEffect(() => {
    if (typeof window !== "undefined") {
      setInitialViewportHeight(window.visualViewport?.height || window.innerHeight)
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return

    const handleResize = () => {
      const currentHeight = window.visualViewport?.height || window.innerHeight
      const heightDifference = initialViewportHeight - currentHeight
      
      // Only consider it a keyboard if the height difference is significant
      if (heightDifference > 150) {
        setKeyboardHeight(heightDifference)
        onHeightChange?.(heightDifference)
      } else {
        setKeyboardHeight(0)
        onHeightChange?.(0)
      }
    }

    const visualViewport = window.visualViewport
    
    if (visualViewport) {
      visualViewport.addEventListener("resize", handleResize)
      return () => visualViewport.removeEventListener("resize", handleResize)
    } else {
      window.addEventListener("resize", handleResize)
      return () => window.removeEventListener("resize", handleResize)
    }
  }, [initialViewportHeight, onHeightChange])

  if (!isVisible || keyboardHeight === 0) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-transparent pointer-events-none z-40"
      style={{ height: keyboardHeight }}
    />
  )
}

// Hook for managing virtual keyboard
export function useVirtualKeyboard() {
  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    const initialHeight = window.visualViewport?.height || window.innerHeight

    const handleResize = () => {
      const currentHeight = window.visualViewport?.height || window.innerHeight
      const heightDifference = initialHeight - currentHeight
      
      if (heightDifference > 150) {
        setKeyboardHeight(heightDifference)
        setIsKeyboardVisible(true)
      } else {
        setKeyboardHeight(0)
        setIsKeyboardVisible(false)
      }
    }

    const handleFocus = () => {
      // Slight delay to allow for keyboard animation
      setTimeout(handleResize, 300)
    }

    const handleBlur = () => {
      setTimeout(() => {
        if (!document.activeElement || 
            !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
          setKeyboardHeight(0)
          setIsKeyboardVisible(false)
        }
      }, 300)
    }

    const visualViewport = window.visualViewport

    if (visualViewport) {
      visualViewport.addEventListener("resize", handleResize)
    } else {
      window.addEventListener("resize", handleResize)
    }

    document.addEventListener("focusin", handleFocus)
    document.addEventListener("focusout", handleBlur)

    return () => {
      if (visualViewport) {
        visualViewport.removeEventListener("resize", handleResize)
      } else {
        window.removeEventListener("resize", handleResize)
      }
      document.removeEventListener("focusin", handleFocus)
      document.removeEventListener("focusout", handleBlur)
    }
  }, [])

  return {
    keyboardHeight,
    isKeyboardVisible,
    // Helper function to adjust container padding
    getContainerStyle: () => ({
      paddingBottom: isKeyboardVisible ? `${keyboardHeight}px` : "0px",
      transition: "padding-bottom 0.3s ease-out"
    })
  }
}