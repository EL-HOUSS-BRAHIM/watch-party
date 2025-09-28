import { render, screen } from "@testing-library/react"
import HomePage from "@/app/page"

describe("HomePage", () => {
  it("renders hero content", () => {
    render(<HomePage />)

    expect(screen.getByText(/Design sunrise premieres/i)).toBeInTheDocument()
    expect(screen.getByText(/Plan your night/i)).toBeInTheDocument()
  })

  it("lists platform metrics", () => {
    render(<HomePage />)

    expect(screen.getByText("24k hosts")).toBeInTheDocument()
    expect(screen.getAllByText("±18 ms").length).toBeGreaterThan(0)
    expect(screen.getByText(/Setup time saved/i)).toBeInTheDocument()
  })
})
