"use client"

import { render, screen, act } from "@testing-library/react"
import { AuthProvider, useAuth } from "@/contexts/auth-context"
import type { ReactNode } from "react"

// Test component to use the auth context
function TestComponent() {
  const { user, login, logout, loading } = useAuth()

  return (
    <div>
      <div data-testid="user">{user ? user.email : "No user"}</div>
      <div data-testid="loading">{loading ? "Loading" : "Not loading"}</div>
      <button onClick={() => login({ email: "test@example.com", password: "password" })}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  )
}

describe("AuthContext", () => {
  const renderWithProvider = (children: ReactNode) => {
    return render(<AuthProvider>{children}</AuthProvider>)
  }

  it("provides initial auth state", () => {
    renderWithProvider(<TestComponent />)

    expect(screen.getByTestId("user")).toHaveTextContent("No user")
    expect(screen.getByTestId("loading")).toHaveTextContent("Not loading")
  })

  it("handles login flow", async () => {
    renderWithProvider(<TestComponent />)

    const loginButton = screen.getByText("Login")

    await act(async () => {
      loginButton.click()
    })

    // Would test actual login logic here with mocked API
  })

  it("handles logout flow", async () => {
    renderWithProvider(<TestComponent />)

    const logoutButton = screen.getByText("Logout")

    await act(async () => {
      logoutButton.click()
    })

    expect(screen.getByTestId("user")).toHaveTextContent("No user")
  })
})
