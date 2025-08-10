import "@testing-library/jest-dom"
import { jest } from '@jest/globals'

// Type declarations for global test utilities
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R
      toHaveTextContent(text: string | RegExp): R
      toBeDisabled(): R
    }
  }
}

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  usePathname() {
    return "/dashboard"
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock Socket.IO
jest.mock("socket.io-client", () => ({
  io: jest.fn(() => ({
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
  })),
}))

// Mock Recharts - avoiding JSX in test setup
jest.mock("recharts", () => {
  const mockComponent = (testId: string) => () => ({
    type: 'div',
    props: { 'data-testid': testId },
    children: null
  })
  
  const mockContainerComponent = (testId: string) => ({ children }: { children: React.ReactNode }) => ({
    type: 'div',
    props: { 'data-testid': testId },
    children
  })

  return {
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => children,
    LineChart: mockContainerComponent('line-chart'),
    Line: mockComponent('line'),
    XAxis: mockComponent('x-axis'),
    YAxis: mockComponent('y-axis'),
    CartesianGrid: mockComponent('cartesian-grid'),
    Tooltip: mockComponent('tooltip'),
    BarChart: mockContainerComponent('bar-chart'),
    Bar: mockComponent('bar'),
    PieChart: mockContainerComponent('pie-chart'),
    Pie: mockComponent('pie'),
    Cell: mockComponent('cell'),
    AreaChart: mockContainerComponent('area-chart'),
    Area: mockComponent('area'),
  }
})

// Mock React Query
jest.mock("@tanstack/react-query", () => ({
  useQuery: () => ({
    data: undefined,
    error: null,
    isLoading: false,
    refetch: jest.fn(),
  }),
  useMutation: () => ({
    mutate: jest.fn(),
    isLoading: false,
    error: null,
  }),
  QueryClient: jest.fn(),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => children,
}))

// Mock auth context
jest.mock("@/contexts/auth-context", () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    login: jest.fn(),
    logout: jest.fn(),
    loading: false,
    isAdmin: false,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}))

// Mock toast hook
jest.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}))

// Mock APIs
jest.mock("@/lib/api", () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}))
