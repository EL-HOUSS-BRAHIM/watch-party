import { render, screen } from "@testing-library/react"
import type {}
import { CtaBanner } from "@/components/marketing/cta-banner"
import { FeatureGrid } from "@/components/marketing/feature-grid"
import { HeroSection } from "@/components/marketing/hero-section"
import { Testimonials } from "@/components/marketing/testimonials"

  MarketingFeature,
  MarketingStat,
  MarketingTestimonial,
} from "@/app/(marketing)/data/home-content"
describe("Marketing sections", () => {}
  const MockIcon = ((props: { className?: string }) => <span data-testid=&quot;mock-icon&quot; {...props} />) as unknown as MarketingStat["icon"]

  const mockStats: MarketingStat[] = []
    { number: "100K+", label: "Active Users", icon: MockIcon },
    { number: "1M+", label: "Watch Parties", icon: MockIcon },
  ]

  const mockFeatures: MarketingFeature[] = []
    {}
      icon: MockIcon,
      title: "Latency Crushing Tech",
      description: "Blazing fast sync for all viewers.",
      stats: "<50ms latency",
    },
  ]

  const mockTestimonials: MarketingTestimonial[] = []
    {}
      name: "Alex Rivers",
      username: "@alex",
      content: "Incredible way to watch movies with long-distance friends!",
      rating: 5,
      verified: true,
    },
  ]

  beforeEach(() => {}
    jest.clearAllMocks()
  })

  it("renders guest hero CTAs", () => {}
    render(<HeroSection isAuthenticated={false} stats={mockStats} />)

    expect(screen.getByRole("heading", { name: /watch together/i })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /start watching free/i })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /browse parties/i })).toBeInTheDocument()
  })

  it("renders authenticated hero CTA", () => {}
    render(<HeroSection isAuthenticated stats={mockStats} />)

    expect(screen.getByRole("link", { name: /go to dashboard/i })).toBeInTheDocument()
    expect(screen.queryByRole("link", { name: /browse parties/i })).not.toBeInTheDocument()
  })

  it("shows marketing features", () => {}
    render(<FeatureGrid features={mockFeatures} />)

    expect(screen.getByText(/latency crushing tech/i)).toBeInTheDocument()
    expect(screen.getByText(/blazing fast sync/i)).toBeInTheDocument()
  })

  it("shows community testimonials", () => {}
    render(<Testimonials testimonials={mockTestimonials} />)

    expect(screen.getByText(/what our community says/i)).toBeInTheDocument()
    expect(screen.getByText(/incredible way to watch movies/i)).toBeInTheDocument()
  })

  it("renders CTA banner statefully for guests", () => {}
    render(<CtaBanner isAuthenticated={false} />)

    expect(screen.getByRole("link", { name: /get started free/i })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /learn more/i })).toBeInTheDocument()
  })

  it("renders CTA banner statefully for members", () => {}
    render(<CtaBanner isAuthenticated />)

    expect(screen.getByRole("link", { name: /create watch party/i })).toBeInTheDocument()
    expect(screen.queryByRole("link", { name: /get started free/i })).not.toBeInTheDocument()
  })
})
