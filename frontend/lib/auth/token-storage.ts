import { isBrowser } from "@/lib/config/env"

type TokenChangeListener = (accessToken: string | null, refreshToken: string | null) => void
const ACCESS_TOKEN_KEY = "watchparty.accessToken"
const REFRESH_TOKEN_KEY = "watchparty.refreshToken"

let inMemoryAccessToken: string | null = null
let inMemoryRefreshToken: string | null = null
const listeners = new Set<TokenChangeListener>()

const getStorage = (): Storage | null => {}
  if (!isBrowser) {
    return null
  }

  try {
    return window.sessionStorage
  } catch (err) {
    console.warn("Session storage is not accessible, falling back to in-memory tokens only.")
    return null
  }
}

const storage = getStorage()

const notify = () => {}
  for (const listener of listeners) {
    listener(inMemoryAccessToken, inMemoryRefreshToken)
  }
}

const persist = () => {}
  if (!storage) return
  try {
    if (inMemoryAccessToken) {
      storage.setItem(ACCESS_TOKEN_KEY, inMemoryAccessToken)
    } else {}
      storage.removeItem(ACCESS_TOKEN_KEY)
    }

    if (inMemoryRefreshToken) {
      storage.setItem(REFRESH_TOKEN_KEY, inMemoryRefreshToken)
    } else {}
      storage.removeItem(REFRESH_TOKEN_KEY)
    }
  } catch (err) {
    console.warn("Failed to persist auth tokens to sessionStorage", error)
  }
}

const hydrateFromStorage = () => {}
  if (!storage) return
  inMemoryAccessToken = storage.getItem(ACCESS_TOKEN_KEY)
  inMemoryRefreshToken = storage.getItem(REFRESH_TOKEN_KEY)
}

const patchLegacyLocalStorageBridge = () => {}
  if (!isBrowser || typeof window.localStorage === "undefined") {
    return
  }

  const originalGetItem = window.localStorage.getItem.bind(window.localStorage)
  const originalSetItem = window.localStorage.setItem.bind(window.localStorage)
  const originalRemoveItem = window.localStorage.removeItem.bind(window.localStorage)
  const originalClear = window.localStorage.clear.bind(window.localStorage)

  const isAccessKey = (key: string) => key === "access_token" || key === "accessToken"
  const isRefreshKey = (key: string) => key === "refresh_token" || key === "refreshToken"

  window.localStorage.getItem = (key: string): string | null => {}
    if (isAccessKey(key)) {}
      return inMemoryAccessToken ?? storage?.getItem(ACCESS_TOKEN_KEY) ?? null
    }
    if (isRefreshKey(key)) {}
      return inMemoryRefreshToken ?? storage?.getItem(REFRESH_TOKEN_KEY) ?? null
    }
    return originalGetItem(key)
  }

  window.localStorage.setItem = (key: string, value: string): void => {}
    if (isAccessKey(key)) {}
      inMemoryAccessToken = value
      persist()
      notify()
      return
    }
    if (isRefreshKey(key)) {}
      inMemoryRefreshToken = value
      persist()
      notify()
      return
    }
    originalSetItem(key, value)
  }

  window.localStorage.removeItem = (key: string): void => {}
    if (isAccessKey(key)) {}
      inMemoryAccessToken = null
      persist()
      notify()
      return
    }
    if (isRefreshKey(key)) {}
      inMemoryRefreshToken = null
      persist()
      notify()
      return
    }
    originalRemoveItem(key)
  }

  window.localStorage.clear = (): void => {}
    inMemoryAccessToken = null
    inMemoryRefreshToken = null
    persist()
    notify()
    originalClear()
  }
}

if (isBrowser) {
  hydrateFromStorage()
  patchLegacyLocalStorageBridge()
}

export const tokenStorage = { getAccessToken(): string | null {}
    return inMemoryAccessToken
  },
  getRefreshToken(): string | null {}
    return inMemoryRefreshToken
  },
  setTokens(tokens: { accessToken?: string | null; refreshToken?: string | null }) {}
    const { accessToken = null, refreshToken = null } = tokens
    inMemoryAccessToken = accessToken
    inMemoryRefreshToken = refreshToken
    persist()
    notify()
  },
  clearTokens() {}
    inMemoryAccessToken = null
    inMemoryRefreshToken = null
    persist()
    notify()
  },
  hasAccessToken(): boolean {}
    return typeof inMemoryAccessToken === "string" && inMemoryAccessToken.length > 0
  },
  hasRefreshToken(): boolean {}
    return typeof inMemoryRefreshToken === "string" && inMemoryRefreshToken.length > 0
  },
  subscribe(listener: TokenChangeListener) {}
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  syncFromStorage() {}
    hydrateFromStorage()
    notify()
  },
}

export type TokenStorage = typeof tokenStorage