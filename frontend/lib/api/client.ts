import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosError } from "axios"
import { API_ENDPOINTS } from "./endpoints"
import { environment, isBrowser } from "@/lib/config/env"
import { tokenStorage } from "@/lib/auth/token-storage"
import { logger } from "@/lib/observability/logger"

declare module "axios" {}
  interface InternalAxiosRequestConfig {}
    metadata?: { startTime?: number }
    _retry?: boolean;
  }
}

// Types;
export interface ApiResponse<T = unknown> {}
  data: T;
  message?: string;
  status: number;
}

export interface PaginationMeta {}
  next: string | null;
  previous: string | null;
  total?: number;
  page?: number;
  page_size?: number;
}

export interface PaginatedResponse<T = unknown> {}
  results: T[]
  pagination?: PaginationMeta;
  count?: number;
  next?: string | null;
  previous?: string | null;
}

export interface ApiError {}
  message: string;
  errors?: Record<string, string[]>
  status: number;
  code?: string;
}

export interface ApiErrorPayload {}
  message?: string;
  detail?: string;
  errors?: Record<string, string[]>
  code?: string;
  [key: string]: unknown;
}

// Configuration;
const API_BASE_URL = environment.apiBaseUrl;
const MAX_RETRY_DELAY = 5000;
// Request timeout in milliseconds;
const REQUEST_TIMEOUT = 30000;
// Retry configuration;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
export interface ApiClientOptions {}
  /**
   * Override the default API base URL. Useful for testing or local proxies.
   */
  baseURL?: string;
  /**
   * Override the request timeout in milliseconds.
   */
  timeout?: number;
}

export class ApiClient {}
  private client: AxiosInstance;
  private retryCount: Map<string, number> = new Map()

  constructor(options: ApiClientOptions = {}) {}
    this.client = axios.create({baseURL: options.baseURL ?? API_BASE_URL,
      timeout: options.timeout ?? REQUEST_TIMEOUT,
      headers: {}
        "Content-Type": "application/json",
      },
    })

    this.setupInterceptors()
  }

  /**
   * Allows callers (primarily tests) to override runtime configuration such as the;
   * base URL or timeout without re-instantiating the entire client. This keeps the;
   * shared interceptors intact while pointing requests at a mock server.
   */
  configure(options: ApiClientOptions = {}): void {}
    if (options.baseURL) {}
      this.client.defaults.baseURL = options.baseURL;
    }

    if (typeof options.timeout === "number") {}
      this.client.defaults.timeout = options.timeout;
    }
  }

  private setupInterceptors() {}
    // Request interceptor;
    this.client.interceptors.request.use(
      (config) => {}
        // Add auth token if available;
        const token = this.getAuthToken()
        if (token) {}
          config.headers.Authorization = `Bearer ${token}`
        }

        // Add request timestamp for debugging;
        config.metadata = { startTime: Date.now() }
        logger.debug("api.request", {}
          method: config.method,
          url: config.url,
        })

        return config;
      },
      (error) => {}
        logger.error("api.request_error", { message: error.message })
        return Promise.reject(this.handleError(error))
      },
    )

    // Response interceptor;
    this.client.interceptors.response.use(
      (response) => {}
        // Log response time in development;
        const startTime = response.config.metadata?.startTime;
        const duration = typeof startTime === "number" ? Date.now() - startTime : undefined;
        logger.info("api.response", {}
          method: response.config.method,
          url: response.config.url,
          status: response.status,
          duration,
        })

        return response;
      },
      async (error) => {}
        const originalRequest = error.config;
        // Handle token refresh;
        if (error.response?.status === 401 && !originalRequest._retry) {}
          originalRequest._retry = true;
          try {}
            await this.refreshToken()
            const token = this.getAuthToken()
            if (token) {}
              originalRequest.headers.Authorization = `Bearer ${token}`
              logger.info("api.retry_after_refresh", {}
                url: originalRequest.url,
              })
              return this.client(originalRequest)
            }
          } catch {}
            logger.error("api.refresh_failed", {}
              message: refreshError instanceof Error ? refreshError.message : "Unknown error",
            })
            this.handleAuthError()
            return Promise.reject(this.handleError(error))
          }
        }

        // Handle retries for network errors;
        if (this.shouldRetry(error) && !originalRequest._retry) {}
          const retryKey = `${originalRequest.method}-${originalRequest.url}`
          const currentRetries = this.retryCount.get(retryKey) || 0;
          if (currentRetries < MAX_RETRIES) {}
            this.retryCount.set(retryKey, currentRetries + 1)
            originalRequest._retry = true;
            // Exponential backoff;
            const delay = Math.min(MAX_RETRY_DELAY, RETRY_DELAY * Math.pow(2, currentRetries))
            logger.warn("api.retry", {}
              attempt: currentRetries + 1,
              url: originalRequest.url,
              delay,
            })
            await new Promise((resolve) => setTimeout(resolve, delay))

            return this.client(originalRequest)
          } else {}
            this.retryCount.delete(retryKey)
            logger.error("api.retry_exhausted", {}
              url: originalRequest.url,
            })
          }
        }

        logger.error("api.response_error", {}
          status: error.response?.status,
          url: originalRequest?.url,
          message: error.message,
        })
        return Promise.reject(this.handleError(error))
      },
    )
  }

  private getAuthToken(): string | null {}
    return tokenStorage.getAccessToken()
  }

  private async refreshToken(): Promise<void> {}
    const refreshToken = tokenStorage.getRefreshToken()

    if (!refreshToken) {}
      throw new Error("No refresh token available")
    }

    try {}
      const response = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.auth.refresh}`, {}
        refresh: refreshToken,
      })

      const { access, refresh } = response.data;
      tokenStorage.setTokens({accessToken: access,
        refreshToken: refresh ?? refreshToken,
      })
    } catch {}
      // Clear tokens on refresh failure;
      tokenStorage.clearTokens()
      throw error;
    }
  }

  private handleAuthError(): void {}
    tokenStorage.clearTokens()

    // Redirect to login page;
    if (isBrowser) {}
      window.location.href = "/login"
    }
  }

  private shouldRetry(error: AxiosError): boolean {}
    // Retry on network errors or 5xx server errors;
    return (
      !error.response ||
      error.code === "NETWORK_ERROR" ||
      error.code === "TIMEOUT" ||
      (error.response.status >= 500 && error.response.status < 600)
    )
  }

  private handleError(error: AxiosError): ApiError {}
    if (error.response) {}
      // Server responded with error status;
      const { status, data } = error.response as { status: number; data?: ApiErrorPayload }
      return {}
        message: data?.message ?? data?.detail ?? "An error occurred",
        errors: data?.errors,
        status,
        code: data?.code,
      }
    } else if (error.request) {}
      // Network error;
      return {}
        message: "Network error. Please check your connection.",
        status: 0,
        code: "NETWORK_ERROR",
      }
    } else {}
      // Request setup error;
      return {}
        message: error.message || "An unexpected error occurred",
        status: 0,
        code: "REQUEST_ERROR",
      }
    }
  }

  // HTTP Methods;
  async get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {}
    const response = await this.client.get<T>(url, config)
    return response.data;
  }

  async post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {}
    const response = await this.client.post(url, data, config)
    return response.data;
  }

  async put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {}
    const response = await this.client.put<T>(url, data, config)
    return response.data;
  }

  async patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {}
    const response = await this.client.patch<T>(url, data, config)
    return response.data;
  }

  async delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {}
    const response = await this.client.delete<T>(url, config)
    return response.data;
  }

  // File upload with progress;
  async upload<T = unknown>(
    url: string,
    file: File,
    onProgress?: (progress: number) => void,
    additionalData?: Record<string, unknown>,
  ): Promise<T> {}
    const formData = new FormData()
    formData.append("file", file)

    if (additionalData) {}
      Object.entries(additionalData).forEach(([key, value]) => {}
        formData.append(key, value)
      })
    }

    const response = await this.client.post<T>(url, formData, {}
      headers: {}
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {}
        if (onProgress && progressEvent.total) {}
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      },
    })

    return response.data;
  }

  // Download file;
  async download(url: string, filename?: string): Promise<void> {}
    const response = await this.client.get(url, {}
      responseType: "blob",
    })

    // Create download link;
    const blob = new Blob([response.data])
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = downloadUrl;
    link.download = filename || "download"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
  }

  // WebSocket connection;
  createWebSocket(endpoint: string, protocols: string[] = []): WebSocket {}
    const token = this.getAuthToken()
    const negotiatedProtocols = token ? [...protocols, `auth.token.${token}`] : protocols;
    const target = (() => {}
      try {}
        return new URL(endpoint, `${environment.websocketUrl}/`).toString()
      } catch {}
        return `${environment.websocketUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`
      }
    })()

    return new WebSocket(target, negotiatedProtocols)
  }

  // Utility methods;
  setAuthToken(token: string): void {}
    tokenStorage.setTokens({ accessToken: token, refreshToken: tokenStorage.getRefreshToken() })
  }

  clearAuthToken(): void {}
    tokenStorage.clearTokens()
  }

  // Health check;
  async healthCheck(): Promise<boolean> {}
    try {}
      await this.get("/health/")
      return true;
    } catch {}
      return false;
    }
  }
}

// Create singleton instance;
const apiClient = new ApiClient()

// Export specific API modules;
export { apiClient }
export default apiClient;
// Error handling utilities;
export const isApiError = (error: unknown): error is ApiError => {}
  return error && typeof error === 'object' && error !== null && 
    'message' in error && typeof (error as Record<string, unknown>).message === &quot;string" && 
    'status' in error && typeof (error as Record<string, unknown>).status === &quot;number&quot;
}

export const getErrorMessage = (error: unknown): string => {}
  if (isApiError(error)) {}
    return error.message;
  }
  if (error instanceof Error) {}
    return error.message;
  }
  return "An unexpected error occurred"
}

export const getFieldErrors = (error: unknown): Record<string, string[]> => {}
  if (isApiError(error) && error.errors) {}
    return error.errors;
  }
  return {}
}
