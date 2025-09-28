import { AlertTriangle, BarChart, Check, CheckCircle, Clock, Database, Image, Refresh, Settings, TrendingUp, Wifi, X, XCircle, Zap } from "lucide-react"
import { useState, useCallback, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {}
import {}
import { analyticsAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

"use client"
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
interface PerformanceMetric {}
  name: string;
  value: number;
  target: number;
  unit: string;
  status: "good" | "needs-improvement" | "poor"
  trend: "up" | "down" | "stable"
  description: string;
}

interface OptimizationSuggestion {}
  id: string;
  category: "images" | "code" | "caching" | "network" | "database"
  title: string;
  description: string;
  impact: "high" | "medium" | "low"
  effort: "low" | "medium" | "high"
  implemented: boolean;
  estimatedImprovement: string;
}

interface BundleAnalysis {}
  totalSize: number;
  gzippedSize: number;
  chunks: Array<{}
    name: string;
    size: number;
    modules: number;
  }>
  duplicates: Array<{}
    module: string;
    instances: number;
    totalSize: number;
  }>
}

const mockSuggestions: OptimizationSuggestion[] = []
  {}
    id: "1",
    category: "images",
    title: "Implement Next.js Image Optimization",
    description: "Use Next.js Image component for automatic optimization and lazy loading",
    impact: "high",
    effort: "low",
    implemented: false,
    estimatedImprovement: "30% faster image loading",
  },
  {}
    id: "2",
    category: "code",
    title: "Enable Code Splitting",
    description: "Split large bundles into smaller chunks for better loading performance",
    impact: "high",
    effort: "medium",
    implemented: true,
    estimatedImprovement: "25% smaller initial bundle",
  },
  {}
    id: "3",
    category: "caching",
    title: "Implement Service Worker Caching",
    description: "Cache static assets and API responses for offline functionality",
    impact: "medium",
    effort: "high",
    implemented: false,
    estimatedImprovement: "50% faster repeat visits",
  },
  {}
    id: "4",
    category: "network",
    title: "Enable HTTP/2 Server Push",
    description: "Push critical resources to reduce round trips",
    impact: "medium",
    effort: "medium",
    implemented: false,
    estimatedImprovement: "15% faster initial load",
  },
]

const mockBundleAnalysis: BundleAnalysis = { totalSize: 2.4 * 1024 * 1024, // 2.4MB;
  gzippedSize: 0.8 * 1024 * 1024, // 0.8MB;
  chunks: []
    { name: "main", size: 1.2 * 1024 * 1024, modules: 245 },
    { name: "vendor", size: 0.8 * 1024 * 1024, modules: 156 },
    { name: "runtime", size: 0.4 * 1024 * 1024, modules: 89 },
  ],
  duplicates: []
    { module: "lodash", instances: 3, totalSize: 245 * 1024 },
    { module: "moment", instances: 2, totalSize: 180 * 1024 },
    { module: "react-dom", instances: 2, totalSize: 120 * 1024 },
  ],
}

const performanceData = Array.from({ length: 30 }, (_, i) => ({}
  date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
  fcp: Math.random() * 0.5 + 1.0,
  lcp: Math.random() * 0.8 + 2.2,
  cls: Math.random() * 0.1 + 0.05,
  tti: Math.random() * 1.0 + 2.5,
}))

export function PerformanceOptimizer() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([])
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([])
  const [bundleAnalysis, setBundleAnalysis] = useState<BundleAnalysis | null>(null)
  const [historicalData, setHistoricalData] = useState<unknown[]>([])
  const [loading, setLoading] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedMetric, setSelectedMetric] = useState("performance")
  const [optimizationDialogOpen, setOptimizationDialogOpen] = useState(false)
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false)
  const [selectedSuggestion, setSelectedSuggestion] = useState<OptimizationSuggestion | null>(null)
  const [optimizationSettings, setOptimizationSettings] = useState({}
    imageOptimization: false,
    codeSplitting: false,
    caching: false,
    compression: false;
  })
  const { toast } = useToast()

  const normalizeMetric = (metric: unknown): PerformanceMetric => {}
    const status = getMetricStatus(metric.value, metric.target || metric.threshold)
    return {
      name: metric.name ?? metric.label ?? metric.key ?? 'Performance Metric',
      value: Number(metric.value ?? metric.current ?? 0),
      target: Number(metric.target ?? metric.threshold ?? metric.goal ?? 0),
      unit: metric.unit ?? metric.suffix ?? '',
      status,
      trend: normalizeTrend(metric.trend ?? metric.direction ?? metric.change),
      description: metric.description ?? metric.help ?? `Performance metric: ${metric.name}`
    }
  }

  const getMetricStatus = (value: number, target: number): PerformanceMetric['status'] => {}
    if (!target) return 'good'
    const ratio = value / target;
    if (ratio <= 0.8) return 'good'
    if (ratio <= 1.2) return 'needs-improvement'
    return 'poor'
  }

  const normalizeTrend = (trend: unknown): PerformanceMetric['trend'] => {}
    if (typeof trend === 'string') {
      const trendLower = trend.toLowerCase()
      if (trendLower.includes('up') || trendLower.includes('increase')) return 'up'
      if (trendLower.includes('down') || trendLower.includes('decrease')) return 'down'
    }
    if (typeof trend === 'number') {
      if (trend > 0.05) return &apos;up&apos;
      if (trend < -0.05) return 'down'
    }
    return 'stable'
  }

  const normalizeSuggestion = (suggestion: unknown): OptimizationSuggestion => {}
    return {
      id: String(suggestion.id ?? suggestion.suggestion_id ?? Math.random().toString(36).substr(2, 9)),
      category: normalizeCategory(suggestion.category ?? suggestion.type),
      title: suggestion.title ?? suggestion.name ?? suggestion.summary ?? 'Optimization Suggestion',
      description: suggestion.description ?? suggestion.details ?? '',
      impact: normalizeImpact(suggestion.impact ?? suggestion.priority),
      effort: normalizeEffort(suggestion.effort ?? suggestion.difficulty),
      implemented: Boolean(suggestion.implemented ?? suggestion.applied ?? false),
      estimatedImprovement: suggestion.estimated_improvement ?? suggestion.benefit ?? 'Performance improvement expected'
    }
  }

  const normalizeCategory = (category: unknown): OptimizationSuggestion['category'] => {}
    const categoryStr = String(category).toLowerCase()
    if (categoryStr.includes('image') || categoryStr.includes('media')) return 'images'
    if (categoryStr.includes('code') || categoryStr.includes('bundle') || categoryStr.includes('js')) return 'code'
    if (categoryStr.includes('cache') || categoryStr.includes('storage')) return 'caching'
    if (categoryStr.includes('network') || categoryStr.includes('request')) return 'network'
    if (categoryStr.includes('database') || categoryStr.includes('query')) return 'database'
    return 'code'
  }

  const normalizeImpact = (impact: unknown): OptimizationSuggestion['impact'] => {}
    const impactStr = String(impact).toLowerCase()
    if (impactStr.includes('high') || impactStr.includes('critical')) return 'high'
    if (impactStr.includes('low') || impactStr.includes('minor')) return 'low'
    return 'medium'
  }

  const normalizeEffort = (effort: unknown): OptimizationSuggestion['effort'] => {}
    const effortStr = String(effort).toLowerCase()
    if (effortStr.includes('high') || effortStr.includes('difficult') || effortStr.includes('hard')) return 'high'
    if (effortStr.includes('low') || effortStr.includes('easy') || effortStr.includes('simple')) return 'low'
    return 'medium'
  }

  const normalizeBundleAnalysis = (analysis: unknown): BundleAnalysis => {}
    return {
      totalSize: Number(analysis.total_size ?? analysis.bundle_size ?? 0),
      gzippedSize: Number(analysis.gzipped_size ?? analysis.compressed_size ?? 0),
      chunks: Array.isArray(analysis.chunks) ? analysis.chunks.map((chunk: unknown) => ({
        name: chunk.name ?? chunk.filename ?? 'Unknown Chunk',
        size: Number(chunk.size ?? chunk.file_size ?? 0),
        modules: Number(chunk.modules ?? chunk.module_count ?? 0)
      })) : [],
      duplicates: Array.isArray(analysis.duplicates) ? analysis.duplicates.map((dup: unknown) => ({
        module: dup.module ?? dup.name ?? 'Unknown Module',
        instances: Number(dup.instances ?? dup.count ?? 0),
        totalSize: Number(dup.total_size ?? dup.size ?? 0)
      })) : []
    }
  }

    const fetchPerformanceData = useCallback(async () => {
    try {
      setLoading(true)
      const [systemPerformance, dashboardData] = await Promise.allSettled([]
        analyticsAPI.getSystemAnalytics(),
        analyticsAPI.getDashboard('performance')
      ])

      // Handle system performance metrics;
      if (systemPerformance.status === 'fulfilled' && systemPerformance.value) {
        const perfData = systemPerformance.value;
        if (Array.isArray(perfData.metrics)) {
          setMetrics(perfData.metrics.map(normalizeMetric))
        } else if (perfData.performance_metrics) {
          // Handle alternative response format;
          const fallbackMetrics: PerformanceMetric[] = []
            {}
              name: 'Response Time',
              value: Number(perfData.avg_response_time ?? 0),
              target: 200,
              unit: 'ms',
              status: getMetricStatus(perfData.avg_response_time, 200),
              trend: normalizeTrend(perfData.response_time_trend),
              description: 'Average server response time'
            },
            {}
              name: 'CPU Usage',
              value: Number(perfData.cpu_usage ?? 0),
              target: 70,
              unit: '%',
              status: getMetricStatus(perfData.cpu_usage, 70),
              trend: normalizeTrend(perfData.cpu_trend),
              description: 'Server CPU utilization'
            },
            {}
              name: 'Memory Usage',
              value: Number(perfData.memory_usage ?? 0),
              target: 80,
              unit: '%',
              status: getMetricStatus(perfData.memory_usage, 80),
              trend: normalizeTrend(perfData.memory_trend),
              description: 'Server memory utilization'
            }
          ]
          setMetrics(fallbackMetrics)
        }

        // Handle optimization suggestions;
        if (Array.isArray(perfData.suggestions)) {
          setSuggestions(perfData.suggestions.map(normalizeSuggestion))
        }

        // Handle bundle analysis;
        if (perfData.bundle_analysis) {
          setBundleAnalysis(normalizeBundleAnalysis(perfData.bundle_analysis))
        }

        // Handle historical data;
        if (Array.isArray(perfData.historical_data)) {
          setHistoricalData(perfData.historical_data.map((point: unknown) => ({}
            time: point.time ?? point.timestamp ?? new Date().toLocaleTimeString(),
            performance: Number(point.performance_score ?? point.score ?? 0),
            responseTime: Number(point.response_time ?? 0),
            errors: Number(point.error_rate ?? point.errors ?? 0),
            throughput: Number(point.throughput ?? point.requests ?? 0)
          })))
        }
      }

    } } catch {
      console.error('Failed to fetch performance data:', error)
      toast({}
        title: 'Performance Data Unavailable',
        description: 'Unable to load performance metrics. Please try again later.',
        variant: 'destructive'
      })
      // Set empty state on error;
      setMetrics([])
      setSuggestions([])
      setBundleAnalysis(null)
      setHistoricalData([])
    } finally {}
      setLoading(false)
    }
  }, [toast])

  const runPerformanceAnalysis = useCallback(async () => {
    setIsAnalyzing(true)
    // Simulate analysis;
    await new Promise((resolve) => setTimeout(resolve, 3000))
    setIsAnalyzing(false)
  }, [])

  const implementSuggestion = (suggestionId: string) => {}
    setSuggestions((prev) =>
      prev.map((suggestion) => (suggestion.id === suggestionId ? { ...suggestion, implemented: true } : suggestion)),
    )
  }

  const getStatusColor = (status: string) => {}
    switch (status) {
      case "good":
        return "text-green-600"
      case "needs-improvement":
        return "text-yellow-600"
      case "poor":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const getStatusIcon = (status: string) => {}
    switch (status) {
      case "good":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "needs-improvement":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "poor":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getTrendIcon = (trend: string) => {}
    switch (trend) {
      case "up":
        return <TrendingUp className="h-3 w-3 text-red-500" />
      case "down":
        return <TrendingUp className="h-3 w-3 text-green-500 rotate-180" />
      case "stable":
        return <div className="h-3 w-3 bg-gray-400 rounded-full" />
      default:
        return null;
    }
  }

  const getImpactColor = (impact: string) => {}
    switch (impact) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getCategoryIcon = (category: string) => {}
    switch (category) {
      case "images":
        return <ImageIcon className="h-4 w-4" />
      case "code":
        return <Code className="h-4 w-4" />
      case "caching":
        return <HardDrive className="h-4 w-4" />
      case "network":
        return <Wifi className="h-4 w-4" />
      case "database":
        return <Database className="h-4 w-4" />
      default:
        return <Zap className="h-4 w-4" />
    }
  }

  const formatBytes = (bytes: number) => {}
    if (bytes === 0) return "0 Bytes"
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-muted-foreground">Loading performance data...</p>
          </div>
        </div>
      ) : (
        <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Performance Optimizer</h1>
          <p className="text-gray-600 dark:text-gray-400">Monitor and optimize application performance</p>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => setSettingsDialogOpen(true)} variant=&quot;outline&quot;>
            <Settings className="mr-2 h-4 w-4" />
            Settings;
          </Button>
          <Button onClick={runPerformanceAnalysis} disabled={isAnalyzing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isAnalyzing ? "animate-spin" : ""}`} />
            {isAnalyzing ? "Analyzing..." : "Run Analysis"}
          </Button>
        </div>
      </div>

      {/* Core Web Vitals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <Card key={metric.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
              {getStatusIcon(metric.status)}
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-2xl font-bold ${getStatusColor(metric.status)}`}>
                    {metric.value}
                    {metric.unit}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Target: {metric.target}
                    {metric.unit}
                  </p>
                </div>
                <div className="flex items-center gap-1">{getTrendIcon(metric.trend)}</div>
              </div>
              <div className="mt-2">
                <Progress value={Math.min((metric.target / metric.value) * 100, 100)} className="h-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Tabs */}
      <Tabs defaultValue="metrics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
          <TabsTrigger value="bundle">Bundle Analysis</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        {/* Performance Metrics */}
        <TabsContent value="metrics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>Core Web Vitals over the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="fcp" stroke="#6366f1" name="FCP (s)" />
                  <Line type="monotone" dataKey="lcp" stroke="#8b5cf6" name="LCP (s)" />
                  <Line type="monotone" dataKey="tti" stroke="#06b6d4" name="TTI (s)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Score</CardTitle>
                <CardDescription>Overall performance rating</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center">
                  <div className="relative w-32 h-32">
                    <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                      <path;
                        className="text-gray-300"
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path;
                        className="text-green-500"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeDasharray="85, 100"
                        strokeLinecap="round"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold">85</span>
                    </div>
                  </div>
                </div>
                <div className="text-center mt-4">
                  <Badge className="bg-green-100 text-green-800">Good</Badge>
                  <p className="text-sm text-muted-foreground mt-2">Your site performs well on most metrics</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resource Usage</CardTitle>
                <CardDescription>Current resource consumption</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Cpu className="h-4 w-4" />
                      <span className="text-sm">CPU Usage</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={45} className="w-20" />
                      <span className="text-sm">45%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <HardDrive className="h-4 w-4" />
                      <span className="text-sm">Memory Usage</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={62} className="w-20" />
                      <span className="text-sm">62%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wifi className="h-4 w-4" />
                      <span className="text-sm">Network Usage</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={28} className="w-20" />
                      <span className="text-sm">28%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Optimization Suggestions */}
        <TabsContent value="suggestions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Optimization Suggestions</CardTitle>
              <CardDescription>Recommended improvements to boost performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {suggestions.map((suggestion) => (
                  <div key={suggestion.id} className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800">
                      {getCategoryIcon(suggestion.category)}
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{suggestion.title}</h4>
                        <Badge className={getImpactColor(suggestion.impact)}>{suggestion.impact} impact</Badge>
                        <Badge variant="outline">{suggestion.effort} effort</Badge>
                        {suggestion.implemented && <Badge className="bg-green-100 text-green-800">Implemented</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                      <p className="text-sm font-medium text-green-600">{suggestion.estimatedImprovement}</p>
                    </div>

                    <div className="flex gap-2">
                      {!suggestion.implemented && (
                        <Button size="sm" onClick={() => implementSuggestion(suggestion.id)}>
                          Implement;
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        Learn More;
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bundle Analysis */}
        <TabsContent value="bundle" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Bundle Size</CardTitle>
                <CardDescription>JavaScript bundle analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Size</span>
                    <span className="font-medium">{formatBytes(bundleAnalysis?.totalSize || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Gzipped Size</span>
                    <span className="font-medium text-green-600">{formatBytes(bundleAnalysis?.gzippedSize || 0)}</span>
                  </div>
                  <div className="pt-4">
                    <h4 className="font-medium mb-2">Chunks</h4>
                    <div className="space-y-2">
                      {bundleAnalysis?.chunks?.map((chunk) => (
                        <div key={chunk.name} className="flex justify-between items-center text-sm">
                          <span>{chunk.name}</span>
                          <div className="flex items-center gap-2">
                            <span>{formatBytes(chunk.size)}</span>
                            <span className="text-muted-foreground">({chunk.modules} modules)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Duplicate Dependencies</CardTitle>
                <CardDescription>Modules included multiple times</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {bundleAnalysis?.duplicates?.map((duplicate) => (
                    <div key={duplicate.module} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{duplicate.module}</h4>
                        <p className="text-sm text-muted-foreground">{duplicate.instances} instances</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatBytes(duplicate.totalSize)}</p>
                        <p className="text-sm text-red-600">Wasted</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Bundle Composition</CardTitle>
              <CardDescription>Breakdown of bundle contents</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={bundleAnalysis?.chunks || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => formatBytes(value)} />
                  <Tooltip formatter={(value) => formatBytes(value as number)} />
                  <Bar dataKey="size" fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Real-time Monitoring */}
        <TabsContent value="monitoring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Performance</CardTitle>
              <CardDescription>Live performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={performanceData.slice(-10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="fcp" stackId="1" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="lcp" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,247</div>
                <p className="text-sm text-muted-foreground">Currently online</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Error Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">0.02%</div>
                <p className="text-sm text-muted-foreground">Last 24 hours</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Avg Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">145ms</div>
                <p className="text-sm text-muted-foreground">API responses</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Settings Dialog */}
      <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Performance Settings</DialogTitle>
            <DialogDescription>Configure optimization features</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium">Optimization Features</h4>
              <div className="space-y-3">
                {Object.entries(optimizationSettings).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label htmlFor={key} className="capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </Label>
                    <Switch;
                      id={key}
                      checked={value}
                      onCheckedChange={(checked) => setOptimizationSettings((prev) => ({ ...prev, [key]: checked }))}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Monitoring Settings</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Performance Alerts</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Real-time Monitoring</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Error Tracking</Label>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsDialogOpen(false)}>
              Cancel;
            </Button>
            <Button onClick={() => setSettingsDialogOpen(false)}>Save Settings</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        </>
      )}
    </div>
  )
}
