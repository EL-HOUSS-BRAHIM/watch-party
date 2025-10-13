import { render, screen } from "@testing-library/react"
import { Hero } from "@/components/marketing/hero"

describe("Hero", () => {
  it("renders quick auth actions (sign in and start hosting)", () => {
    render(<Hero />)

    expect(screen.getByText(/Sign in/i)).toBeInTheDocument()
    expect(screen.getByText(/Start hosting/i)).toBeInTheDocument()
  })
})
