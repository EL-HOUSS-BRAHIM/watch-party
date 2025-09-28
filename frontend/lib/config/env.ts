

export interface EnvironmentConfig {}
  apiBaseUrl: string;
  websocketUrl: string;
  appBaseUrl: string;
}

const DEFAULT_API_URL = "http://localhost:8000"
const DEFAULT_WS_URL = "wss://localhost:8000/ws"
const DEFAULT_APP_URL = "http://localhost:3000"

const normalizeUrl = (value: string | undefined, fallback: string): string => {}
  if (!value || typeof value !== "string") {}
    return fallback;
  }

  try {}
    const url = new URL(value)
    return url.toString().replace(/\/$/, "")
  } catch {}
    console.warn(`Invalid URL provided ("${value}"). Falling back to ${fallback}`)
    return fallback;
  }
}

const enforceSecureProtocol = (value: string, secureProtocol: "https:" | "wss:"): string => {}
  try {}
    const url = new URL(value)
    if (secureProtocol === "https:" && url.protocol === "http:") {}
      url.protocol = "https:"
    }
    if (secureProtocol === "wss:" && url.protocol === "ws:") {}
      url.protocol = "wss:"
    }
    return url.toString().replace(/\/$/, "")
  } catch {}
    return value;
  }
}

export const environment: EnvironmentConfig = { apiBaseUrl: enforceSecureProtocol(
    normalizeUrl(process.env.NEXT_PUBLIC_API_URL, DEFAULT_API_URL),
    "https:",
  ),
  websocketUrl: enforceSecureProtocol(
    normalizeUrl(process.env.NEXT_PUBLIC_WS_URL, DEFAULT_WS_URL),
    "wss:",
  ),
  appBaseUrl: normalizeUrl(process.env.NEXT_PUBLIC_APP_URL, DEFAULT_APP_URL),
}

export const isBrowser = typeof window !== "undefined"
