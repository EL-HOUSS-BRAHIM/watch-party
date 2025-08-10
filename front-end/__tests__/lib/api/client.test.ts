import axios from "axios"
import { jest } from "@jest/globals" // Import jest globals
import type { AxiosInstance } from "axios"

jest.mock("axios")
const mockedAxios = axios as jest.MockedFunction<typeof axios> & {
  create: jest.MockedFunction<typeof axios.create>
  interceptors: {
    request: { use: jest.MockedFunction<any> }
    response: { use: jest.MockedFunction<any> }
  }
}

describe("API Client", () => {
  beforeEach(() => {
    jest.clearAllMocks() // Use the jest variable
  })

  it("creates axios instance with correct config", () => {
    expect(mockedAxios.create).toHaveBeenCalledWith({
      baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    })
  })

  it("adds auth token to requests when available", () => {
    // Mock localStorage
    const mockToken = "test-token"
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn(() => mockToken),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    })

    // Test request interceptor
    const config = { headers: {} }
    const interceptor = mockedAxios.interceptors.request.use.mock.calls[0][0]
    const result = interceptor(config)

    expect(result.headers.Authorization).toBe(`Bearer ${mockToken}`)
  })

  it("handles response errors correctly", () => {
    const responseInterceptor = mockedAxios.interceptors.response.use.mock.calls[0][1]
    const error = {
      response: {
        status: 401,
        data: { message: "Unauthorized" },
      },
    }

    expect(() => responseInterceptor(error)).toThrow()
  })
})
