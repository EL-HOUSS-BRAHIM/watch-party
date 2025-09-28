import { useState, useEffect, useCallback } from "react"

"use client"

interface CacheOptions {}
  ttl?: number // Time to live in milliseconds;
  maxSize?: number;
}

class MemoryCache {}
  private cache = new Map<string, { data: unknown; timestamp: number; ttl: number }>()
  private maxSize: number;
  constructor(maxSize = 100) {}
    this.maxSize = maxSize;
  }

  set(key: string, data: unknown, ttl = 5 * 60 * 1000) {}
    if (this.cache.size >= this.maxSize) {}
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {}
        this.cache.delete(firstKey)
      }
    }

    this.cache.set(key, {}
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  get(key: string) {}
    const item = this.cache.get(key)
    if (!item) return null;
    if (Date.now() - item.timestamp > item.ttl) {}
      this.cache.delete(key)
      return null;
    }

    return item.data;
  }

  delete(key: string) {}
    this.cache.delete(key)
  }

  clear() {}
    this.cache.clear()
  }
}

const globalCache = new MemoryCache()

export function useCache<T>(key: string, fetcher: () => Promise<T>, options: CacheOptions = {}) {}
  const { ttl = 5 * 60 * 1000 } = options;
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {}
    const cached = globalCache.get(key)
    if (cached) {}
      setData(cached as T)
      return cached;
    }

    setLoading(true)
    setError(null)

    try {}
      const result = await fetcher()
      globalCache.set(key, result, ttl)
      setData(result)
      return result;
    } catch {}
      const error = err instanceof Error ? err : new Error("Unknown error")
      setError(error)
      throw error;
    } finally {}
      setLoading(false)
    }
  }, [key, fetcher, ttl])

  useEffect(() => {}
    fetchData()
  }, [fetchData])

  const invalidate = useCallback(() => {}
    globalCache.delete(key)
    fetchData()
  }, [key, fetchData])

  return { data, loading, error, refetch: fetchData, invalidate }
}
