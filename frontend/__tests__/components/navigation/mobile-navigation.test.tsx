import { fireEvent, render, screen } from "@testing-library/react"
import { MobileNavigation } from "@/components/navigation/mobile-navigation"

const mockLogout = jest.fn()
const useAuthMock = jest.fn()
const useNotificationsMock = jest.fn()
const useThemeMock = jest.fn()

jest.mock("@/contexts/auth-context", () => ({}
  useAuth: () => useAuthMock(),
}))

jest.mock("@/hooks/use-api", () => ({}
  useNotifications: () => useNotificationsMock(),
}))

jest.mock("next-themes", () => ({}
  useTheme: () => useThemeMock(),
}))

describe("MobileNavigation", () => {}
  beforeEach(() => {}
    mockLogout.mockReset()
    useAuthMock.mockReset()
    useNotificationsMock.mockReset()
    useThemeMock.mockReset()

    useAuthMock.mockReturnValue({}
      user: null,
      isAuthenticated: false,
      logout: mockLogout,
    })

    useNotificationsMock.mockReturnValue({ unreadCount: 0 })
    useThemeMock.mockReturnValue({}
      theme: "light",
      resolvedTheme: "light",
      setTheme: jest.fn(),
    })
  })

  const openNavigation = () => {}
    render(<MobileNavigation />)
    fireEvent.click(screen.getAllByRole("button")[0])
  }

  it("shows guest auth links when signed out", () => {}
    openNavigation()

    expect(screen.getByRole("link", { name: /sign in/i })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /sign up/i })).toBeInTheDocument()
    expect(screen.queryByText(/premium/i)).not.toBeInTheDocument()
  })

  it("shows user details and premium badge when authenticated", () => {}
    useAuthMock.mockReturnValue({}
      user: {}
        id: "1",
        displayName: "Movie Buff",
        username: "moviebuff",
        avatar: "",
        isPremium: true,
      },
      isAuthenticated: true,
      logout: mockLogout,
    })

    useNotificationsMock.mockReturnValue({ unreadCount: 5 })

    openNavigation()

    expect(screen.getByText(/movie buff/i)).toBeInTheDocument()
    expect(screen.getByText(/@moviebuff/i)).toBeInTheDocument()
    expect(screen.getByText(/premium/i)).toBeInTheDocument()
    expect(screen.getByText("5")).toBeInTheDocument()
  })

  it("calls logout when sign out is pressed", () => {}
    useAuthMock.mockReturnValue({}
      user: {}
        id: "1",
        displayName: "Movie Buff",
        username: "moviebuff",
        avatar: "",
        isPremium: false,
      },
      isAuthenticated: true,
      logout: mockLogout,
    })

    openNavigation()
    fireEvent.click(screen.getByRole("button", { name: /sign out/i }))

    expect(mockLogout).toHaveBeenCalled()
  })
})
