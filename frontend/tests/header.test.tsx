import { render, screen } from "@testing-library/react"
import { MarketingHeader } from "@/components/layout/marketing-header"

describe("MarketingHeader", () => {
  it("renders Sign in and Start hosting links with correct destinations", () => {
    render(<MarketingHeader />)

    const signIn = screen.getByRole("link", { name: /sign in to watchparty/i })
    const startHosting = screen.getByRole("link", { name: /start hosting on watchparty|start hosting/i })

    expect(signIn).toBeInTheDocument()
    expect(signIn).toHaveAttribute("href", "/auth/login")

    expect(startHosting).toBeInTheDocument()
    expect(startHosting).toHaveAttribute("href", "/auth/register")
  })
})
