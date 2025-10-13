import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MarketingHeader } from "@/components/layout/marketing-header"

describe("MarketingHeader mobile menu", () => {
  it("opens mobile menu and renders auth links", async () => {
    const user = userEvent.setup()
    render(<MarketingHeader />)

    const openButton = screen.getByRole("button", { name: /open menu/i })
    await user.click(openButton)

    expect(screen.getByText(/Sign in/i)).toBeInTheDocument()
    expect(screen.getByText(/Start hosting/i)).toBeInTheDocument()
  })
})
