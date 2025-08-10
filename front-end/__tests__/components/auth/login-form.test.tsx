import type React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { LoginForm } from "@/components/auth/login-form"
import { jest } from "@jest/globals" // Import jest globals

// Mock the auth context
const mockLogin = jest.fn()
jest.mock("@/contexts/auth-context", () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: () => ({
    login: mockLogin,
    loading: false,
    error: null,
  }),
}))

describe("LoginForm", () => {
  beforeEach(() => {
    mockLogin.mockClear()
  })

  it("renders login form correctly", () => {
    render(<LoginForm />)

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument()
  })

  it("validates required fields", async () => {
    render(<LoginForm />)

    const submitButton = screen.getByRole("button", { name: /sign in/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    })
  })

  it("validates email format", async () => {
    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/email/i)
    fireEvent.change(emailInput, { target: { value: "invalid-email" } })

    const submitButton = screen.getByRole("button", { name: /sign in/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument()
    })
  })

  it("submits form with valid data", async () => {
    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole("button", { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: "test@example.com" } })
    fireEvent.change(passwordInput, { target: { value: "password123" } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      })
    })
  })

  it("shows loading state during submission", async () => {
    // Mock loading state - create a new mock for this test
    const mockUseAuth = jest.fn().mockReturnValue({
      login: mockLogin,
      loading: true,
      error: null,
    })
    
    // Temporarily override the mock
    const originalMock = require("@/contexts/auth-context").useAuth
    require("@/contexts/auth-context").useAuth = mockUseAuth

    render(<LoginForm />)

    const submitButton = screen.getByRole("button", { name: /signing in/i })
    expect(submitButton).toBeDisabled()
    
    // Restore original mock
    require("@/contexts/auth-context").useAuth = originalMock
  })
})
