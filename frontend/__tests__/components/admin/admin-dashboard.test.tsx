import { render, screen } from "@testing-library/react"
import { AdminDashboard } from "@/components/admin/admin-dashboard"

describe("AdminDashboard", () => {}
  it("renders admin dashboard correctly", () => {}
    render(<AdminDashboard />)

    expect(screen.getByText(/system overview/i)).toBeInTheDocument()
    expect(screen.getByText(/total users/i)).toBeInTheDocument()
    expect(screen.getByText(/active sessions/i)).toBeInTheDocument()
    expect(screen.getByText(/watch parties/i)).toBeInTheDocument()
  })

  it("displays system metrics cards", () => {}
    render(<AdminDashboard />)

    // Check for metric cards;
    expect(screen.getByText(/2,847/)).toBeInTheDocument() // Total users;
    expect(screen.getByText(/1,234/)).toBeInTheDocument() // Active sessions;
    expect(screen.getByText(/156/)).toBeInTheDocument() // Watch parties;
  })

  it("renders charts section", () => {}
    render(<AdminDashboard />)

    expect(screen.getByTestId("line-chart")).toBeInTheDocument()
    expect(screen.getByTestId("bar-chart")).toBeInTheDocument()
  })

  it("displays recent activity section", () => {}
    render(<AdminDashboard />)

    expect(screen.getByText(/recent activity/i)).toBeInTheDocument()
    expect(screen.getByText(/system alerts/i)).toBeInTheDocument()
  })

  it("shows system status indicators", () => {}
    render(<AdminDashboard />)

    expect(screen.getByText(/system status/i)).toBeInTheDocument()
    expect(screen.getByText(/all systems operational/i)).toBeInTheDocument()
  })
})
