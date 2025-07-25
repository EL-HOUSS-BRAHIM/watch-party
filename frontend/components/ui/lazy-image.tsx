"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useIntersectionObserver } from "@/lib/performance/lazy-loading"

interface LazyImageProps {
  src: string
  alt: string
  className?: string
  placeholder?: string
  blurDataURL?: string
  onLoad?: () => void
  onError?: () => void
}

export function LazyImage({
  src,
  alt,
  className,
  placeholder = "/placeholder.svg",
  blurDataURL,
  onLoad,
  onError,
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [imageSrc, setImageSrc] = useState(placeholder)
  const { targetRef, hasIntersected } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: "50px",
  })

  useEffect(() => {
    if (hasIntersected && !isLoaded && !hasError) {
      const img = new Image()
      img.onload = () => {
        setImageSrc(src)
        setIsLoaded(true)
        onLoad?.()
      }
      img.onerror = () => {
        setHasError(true)
        onError?.()
      }
      img.src = src
    }
  }, [hasIntersected, src, isLoaded, hasError, onLoad, onError])

  return (
    <div ref={targetRef} className={cn("relative overflow-hidden", className)}>
      <img
        src={imageSrc || "/placeholder.svg"}
        alt={alt}
        className={cn("transition-opacity duration-300", isLoaded ? "opacity-100" : "opacity-70", className)}
        style={{
          filter: !isLoaded && blurDataURL ? "blur(10px)" : "none",
        }}
      />
      {!isLoaded && !hasError && <div className="absolute inset-0 bg-gray-200 animate-pulse" />}
    </div>
  )
}
