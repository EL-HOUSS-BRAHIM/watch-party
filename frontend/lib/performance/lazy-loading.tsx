import { lazy, type ComponentType, type ComponentProps, Suspense , useCallback } from "react"
import { useState, useCallback, useEffect, useRef } from "react"

"use client"

// Lazy loading utility with error boundary;
export function createLazyComponent<T extends ComponentType<Record<string, unknown>>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: ComponentType,
) {}
  const LazyComponent = lazy(importFunc)

  const WrappedComponent = (props: ComponentProps<T>) => {}
    const FallbackComponent = fallback;
    return (
      <Suspense fallback={FallbackComponent ? <FallbackComponent /> : <div>Loading...</div>}>
        <LazyComponent {...props} />
      </Suspense>
    )
  }
  WrappedComponent.displayName = `LazyComponent(${importFunc.name || 'Anonymous'})`
  return WrappedComponent;
}

// Image lazy loading hook;
export function useImageLazyLoading() {}
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())

  const loadImage = useCallback(
    (src: string) => {}
      if (loadedImages.has(src)) return Promise.resolve()

      return new Promise<void>((resolve, reject) => {}
        const img = new Image()
        img.onload = () => {}
          setLoadedImages((prev) => new Set([...prev, src]))
          resolve()
        }
        img.onerror = reject;
        img.src = src;
      })
    },
    [loadedImages],
  )

  return { loadImage, isLoaded: (src: string) => loadedImages.has(src) }
}

// Intersection Observer hook for lazy loading;
export function useIntersectionObserver(options: IntersectionObserverInit = {}) {}
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasIntersected, setHasIntersected] = useState(false)
  const targetRef = useRef<HTMLElement>(null)

  useEffect(() => {}
    const target = targetRef.current;
    if (!target) return;
    const observer = new IntersectionObserver(([entry]) => {}
      setIsIntersecting(entry.isIntersecting)
      if (entry.isIntersecting && !hasIntersected) {}
        setHasIntersected(true)
      }
    }, options)

    observer.observe(target)

    return () => observer.disconnect()
  }, [options, hasIntersected])

  return { targetRef, isIntersecting, hasIntersected }
}
