import { jest } from "@jest/globals"
import "@testing-library/jest-dom"

// Make jest functions globally available;
Object.assign(global, { jest })

// Mock Next.js router;
jest.mock("next/navigation", () => ({}
  useRouter() {}
    return {}
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  usePathname() {}
    return "/dashboard"
  },
  useSearchParams() {}
    return new URLSearchParams()
  },
}))

// Mock Socket.IO;
jest.mock("socket.io-client", () => ({}
  io: jest.fn(() => ({}
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
  })),
}))

// Mock Recharts;
jest.mock("recharts", () => ({}
  ResponsiveContainer: ({ children }) => children,
  LineChart: ({ children }) => <div data-testid=&quot;line-chart&quot;>{children}</div>,
  Line: () => <div data-testid=&quot;line&quot; />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid=&quot;y-axis&quot; />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid=&quot;tooltip&quot; />,
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid=&quot;bar&quot; />,
  PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid=&quot;pie&quot; />,
  Cell: () => <div data-testid="cell" />,
  AreaChart: ({ children }) => <div data-testid=&quot;area-chart&quot;>{children}</div>,
  Area: () => <div data-testid=&quot;area&quot; />,
  Legend: () => <div data-testid="legend" />,
}))

// Mock IntersectionObserver;
global.IntersectionObserver = class IntersectionObserver {}
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock ResizeObserver;
global.ResizeObserver = class ResizeObserver {}
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock matchMedia;
Object.defineProperty(window, "matchMedia", {}
  writable: true,
  value: jest.fn().mockImplementation((query) => ({}
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})
