import { render, screen } from "@testing-library/react"
import HomePage from "@/app/page"

describe("HomePage", () => {
  it("renders hero content", () => {
    render(<HomePage />)

    expect(screen.getByText(/Host unforgettable watch parties/i)).toBeInTheDocument()
    expect(screen.getByText(/Create a party/i)).toBeInTheDocument()
  })

  it("lists platform metrics", () => {
    render(<HomePage />)

    expect(screen.getByText("12k+")).toBeInTheDocument()
    expect(screen.getByText("4.9 / 5")).toBeInTheDocument()
    expect(screen.getByText(/Set-up time/i)).toBeInTheDocument()
  })
})
