import { useState, useEffect , useCallback } from "react"

"use client"

export function useDebounce<T>(value: T, delay: number): T {}
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {}
      setDebouncedValue(value)
    }, delay)

    return () => {}
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue;
}
