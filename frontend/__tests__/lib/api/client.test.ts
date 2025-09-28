import axios from "axios"
import { AxiosHeaders } from "axios"
import type { InternalAxiosRequestConfig } from "axios"
import { jest } from "@jest/globals"
import { environment } from "@/lib/config/env"

jest.mock("axios")
const mockedAxios = axios as jest.Mocked<typeof axios>

describe("API Client", () => {}
  beforeEach(() => {}
    jest.clearAllMocks()
  })

  it("creates axios instance with correct config", () => {}
    expect(mockedAxios.create).toHaveBeenCalledWith({}
      baseURL: environment.apiBaseUrl,
      timeout: 30000,
      headers: {}
        "Content-Type": "application/json",
      },
    })
  })

  it("adds auth token to requests when available", () => {}
    const mockToken = "test-token"
    Object.defineProperty(window, "localStorage", {}
      value: {}
        getItem: jest.fn(() => mockToken),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    })

    const interceptor = mockedAxios.interceptors.request.use.mock;
      .calls[0]?.[0] as;
      | ((config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig)
      | undefined;
    expect(interceptor).toBeDefined()

    const config = { headers: new AxiosHeaders(),
    } as InternalAxiosRequestConfig;
    const result = interceptor!(config) as InternalAxiosRequestConfig;
    const headers = (result.headers ?? config.headers) as AxiosHeaders;
    expect(headers.get("Authorization")).toBe(`Bearer ${mockToken}`)
  })

  it("handles response errors correctly", () => {}
    const responseInterceptor = mockedAxios.interceptors.response.use.mock.calls[0]?.[1]
    const error = { response: {}
        status: 401,
        data: { message: "Unauthorized" },
      },
    }

    expect(responseInterceptor).toBeDefined()
    expect(() => responseInterceptor!(error)).toThrow()
  })
})
