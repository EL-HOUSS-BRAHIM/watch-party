"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { adminAPI, analyticsAPI } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Search,
  Eye,
  Accessibility,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  RefreshCw,
  ExternalLink,
  FileText,
  ImageIcon,
  Link,
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface SEOMetric {
  name: string
  score: number
  status: "good" | "needs-improvement" | "poor"
  description: string
  recommendations: string[]
}

interface AccessibilityIssue {
  id: string
  type: "error" | "warning" | "notice"
  rule: string
  description: string
  element: string
  impact: "critical" | "serious" | "moderate" | "minor"
  page: string
  fixed: boolean
}

interface SEOPage {
  url: string
  title: string
  metaDescription: string
  h1Count: number
  imagesMissingAlt: number
  internalLinks: number
  externalLinks: number
  wordCount: number
  loadTime: number
  mobileScore: number
  desktopScore: number
}

const mockSEOMetrics: SEOMetric[] = []

interface SEOTrend {
  date: string;
  seoScore: number;
  accessibilityScore: number;
  performanceScore: number;
}

const mockAccessibilityIssues: AccessibilityIssue[] = []

const mockSEOPages: SEOPage[] = []

const seoTrends: SEOTrend[] = []

export function SEOAccessibilityOptimizer() {
  const { toast } = useToast()
  const [seoMetrics, setSEOMetrics] = useState<SEOMetric[]>([])
  const [accessibilityIssues, setAccessibilityIssues] = useState<AccessibilityIssue[]>([])
  const [seoPages, setSEOPages] = useState<SEOPage[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [loading, setLoading] = useState(true)
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false)
  const [selectedPage, setSelectedPage] = useState<SEOPage | null>(null)
  const [pageDetailsOpen, setPageDetailsOpen] = useState(false)

  useEffect(() => {
    fetchSEOData()
  }, [])

  const fetchSEOData = async () => {
    try {
      setLoading(true)
      
      // Fetch SEO analytics from analytics API
      const [analyticsData, systemHealth] = await Promise.all([
        analyticsAPI.getSystemAnalytics(),
        adminAPI.getSystemHealth()
      ])

      // Transform analytics data to SEO metrics
      if (analyticsData) {
        const metrics: SEOMetric[] = [
          {
            name: "Page Speed",
            score: analyticsData.performance?.page_speed || 85,
            status: (analyticsData.performance?.page_speed || 85) >= 90 ? &quot;good" : 
                   (analyticsData.performance?.page_speed || 85) >= 70 ? "needs-improvement" : "poor",
            description: "How fast your pages load",
            recommendations: ["Optimize images for web", "Enable compression", "Minimize JavaScript"],
          },
          {
            name: "Mobile Usability",
            score: analyticsData.mobile_score || 72,
            status: (analyticsData.mobile_score || 72) >= 90 ? "good" : 
                   (analyticsData.mobile_score || 72) >= 70 ? "needs-improvement" : "poor",
            description: "How well your site works on mobile devices",
            recommendations: [
              "Fix clickable elements too close together",
              "Use legible font sizes",
              "Size content to viewport",
            ],
          },
          {
            name: "SEO Score",
            score: analyticsData.seo_score || 78,
            status: (analyticsData.seo_score || 78) >= 90 ? "good" : 
                   (analyticsData.seo_score || 78) >= 70 ? "needs-improvement" : "poor",
            description: "Overall SEO health",
            recommendations: ["Add missing meta descriptions", "Improve internal linking", "Optimize title tags"],
          },
        ]
        setSEOMetrics(metrics)
      }

      // Fetch system logs for accessibility issues
      const logsData = await adminAPI.getLogs({
        component: 'accessibility',
        level: 'warning',
        page: 1
      })

      if (logsData.results) {
        const issues: AccessibilityIssue[] = logsData.results.map((log: unknown, index: number) => ({
          id: log.id || index.toString(),
          type: log.level === 'error' ? 'error' : 'warning',
          rule: log.component || 'accessibility-rule',
          description: log.message || 'Accessibility issue detected',
          element: 'element',
          impact: log.level === 'error' ? 'critical' : 'moderate',
          page: log.metadata?.page || '/dashboard',
          fixed: false,
        }))
        setAccessibilityIssues(issues)
      }

    } catch (error) {
      console.error('Failed to fetch SEO data:', error)
      toast({
        title: "Error",
        description: "Failed to load SEO data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const runSEOScan = async () => {
    setIsScanning(true)
    try {
      // Refresh SEO data from API
      await fetchSEOData()
      toast({
        title: "SEO Scan Complete",
        description: "Your SEO and accessibility data has been updated.",
      })
    } catch (error) {
      console.error('SEO scan failed:', error)
      toast({
        title: "Scan Failed",
        description: "Failed to complete SEO scan. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsScanning(false)
    }
  }

  const fixAccessibilityIssue = (issueId: string) => {
    setAccessibilityIssues((prev) => prev.map((issue) => (issue.id === issueId ? { ...issue, fixed: true } : issue)))
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBackground = (score: number) => {
    if (score >= 90) return "bg-green-100 dark:bg-green-900"
    if (score >= 70) return "bg-yellow-100 dark:bg-yellow-900"
    return "bg-red-100 dark:bg-red-900"
  }

  const getIssueTypeColor = (type: string) => {
    switch (type) {
      case "error":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "warning":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "notice":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "critical":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "serious":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case "moderate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "minor":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const totalIssues = accessibilityIssues.length
  const fixedIssues = accessibilityIssues.filter((issue) => issue.fixed).length
  const criticalIssues = accessibilityIssues.filter((issue) => issue.impact === "critical" && !issue.fixed).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">SEO & Accessibility</h1>
          <p className="text-gray-600 dark:text-gray-400">Optimize your site for search engines and accessibility</p>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => setSettingsDialogOpen(true)} variant=&quot;outline">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Button onClick={runSEOScan} disabled={isScanning}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isScanning ? "animate-spin" : ""}`} />
            {isScanning ? "Scanning..." : "Run Scan"}
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SEO Score</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(78)}`}>78</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3" />
              +5 from last week
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accessibility</CardTitle>
            <Accessibility className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(85)}`}>85</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {fixedIssues}/{totalIssues} issues fixed
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Page Speed</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(85)}`}>85</div>
            <div className="flex items-center text-xs text-muted-foreground">Average load time: 1.2s</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${criticalIssues > 0 ? &quot;text-red-600" : "text-green-600"}`}>
              {criticalIssues}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">Require immediate attention</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="seo">SEO Analysis</TabsTrigger>
          <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
          <TabsTrigger value="pages">Page Analysis</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>SEO Health Score</CardTitle>
                <CardDescription>Overall SEO performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center">
                  <div className="relative w-32 h-32">
                    <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-gray-300"
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-yellow-500"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeDasharray="78, 100"
                        strokeLinecap="round"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold">78</span>
                    </div>
                  </div>
                </div>
                <div className="text-center mt-4">
                  <Badge className="bg-yellow-100 text-yellow-800">Needs Improvement</Badge>
                  <p className="text-sm text-muted-foreground mt-2">Focus on meta descriptions and page speed</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Accessibility Score</CardTitle>
                <CardDescription>WCAG 2.1 compliance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center">
                  <div className="relative w-32 h-32">
                    <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-gray-300"
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
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
                  <p className="text-sm text-muted-foreground mt-2">Most accessibility standards met</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quick Wins</CardTitle>
              <CardDescription>Easy improvements with high impact</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900">
                    <FileText className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">Add Missing Meta Descriptions</h4>
                    <p className="text-sm text-muted-foreground">2 pages missing meta descriptions</p>
                    <Badge className="mt-2 bg-yellow-100 text-yellow-800">High Impact</Badge>
                  </div>
                  <Button size="sm">Fix Now</Button>
                </div>

                <div className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 dark:bg-red-900">
                    <ImageIcon className="h-4 w-4 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">Add Alt Text to Images</h4>
                    <p className="text-sm text-muted-foreground">5 images missing alt text</p>
                    <Badge className="mt-2 bg-red-100 text-red-800">Critical</Badge>
                  </div>
                  <Button size="sm">Fix Now</Button>
                </div>

                <div className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900">
                    <Link className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">Improve Internal Linking</h4>
                    <p className="text-sm text-muted-foreground">Add more contextual internal links</p>
                    <Badge className="mt-2 bg-blue-100 text-blue-800">Medium Impact</Badge>
                  </div>
                  <Button size="sm">Review</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Analysis */}
        <TabsContent value="seo" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {seoMetrics.map((metric) => (
              <Card key={metric.name}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{metric.name}</CardTitle>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBackground(metric.score)}`}>
                      {metric.score}
                    </div>
                  </div>
                  <CardDescription>{metric.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress value={metric.score} className="mb-4" />
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Recommendations:</h4>
                    <ul className="space-y-1">
                      {metric.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                          <div className="w-1 h-1 bg-current rounded-full" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Technical SEO Checklist</CardTitle>
              <CardDescription>Essential technical SEO elements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>XML Sitemap</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Configured</Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Robots.txt</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Configured</Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <span>Schema Markup</span>
                  </div>
                  <Badge className="bg-red-100 text-red-800">Missing</Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <span>HTTPS Certificate</span>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">Expires Soon</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Accessibility */}
        <TabsContent value="accessibility" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Accessibility Issues</CardTitle>
              <CardDescription>WCAG 2.1 compliance issues that need attention</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Rule</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Impact</TableHead>
                    <TableHead>Page</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accessibilityIssues.map((issue) => (
                    <TableRow key={issue.id}>
                      <TableCell>
                        <Badge className={getIssueTypeColor(issue.type)}>{issue.type}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{issue.rule}</TableCell>
                      <TableCell className="max-w-xs truncate">{issue.description}</TableCell>
                      <TableCell>
                        <Badge className={getImpactColor(issue.impact)}>{issue.impact}</Badge>
                      </TableCell>
                      <TableCell>{issue.page}</TableCell>
                      <TableCell>
                        {issue.fixed ? (
                          <Badge className="bg-green-100 text-green-800">Fixed</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800">Open</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {!issue.fixed && (
                            <Button size="sm" onClick={() => fixAccessibilityIssue(issue.id)}>
                              Fix
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Keyboard Navigation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">95%</div>
                <p className="text-sm text-muted-foreground">Elements are keyboard accessible</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Color Contrast</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">78%</div>
                <p className="text-sm text-muted-foreground">Meet WCAG AA standards</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Screen Reader</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">88%</div>
                <p className="text-sm text-muted-foreground">Compatible with screen readers</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Page Analysis */}
        <TabsContent value="pages" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Page-by-Page Analysis</CardTitle>
              <CardDescription>Detailed SEO analysis for each page</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>URL</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Meta Description</TableHead>
                    <TableHead>Mobile Score</TableHead>
                    <TableHead>Desktop Score</TableHead>
                    <TableHead>Issues</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {seoPages.map((page, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{page.url}</TableCell>
                      <TableCell className="max-w-xs truncate">{page.title}</TableCell>
                      <TableCell>
                        {page.metaDescription ? (
                          <span className="text-green-600">✓</span>
                        ) : (
                          <span className="text-red-600">Missing</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className={getScoreColor(page.mobileScore)}>{page.mobileScore}</span>
                      </TableCell>
                      <TableCell>
                        <span className={getScoreColor(page.desktopScore)}>{page.desktopScore}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {page.imagesMissingAlt > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {page.imagesMissingAlt} alt
                            </Badge>
                          )}
                          {!page.metaDescription && (
                            <Badge variant="destructive" className="text-xs">
                              meta
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedPage(page)
                            setPageDetailsOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SEO & Accessibility Trends</CardTitle>
              <CardDescription>Performance trends over the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={seoTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="seoScore" stroke="#6366f1" name="SEO Score" />
                  <Line type="monotone" dataKey="accessibilityScore" stroke="#10b981" name="Accessibility" />
                  <Line type="monotone" dataKey="pageSpeed" stroke="#f59e0b" name="Page Speed" />
                  <Line type="monotone" dataKey="mobileUsability" stroke="#8b5cf6" name="Mobile Usability" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Avg. Improvement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">+12%</div>
                <p className="text-sm text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Issues Resolved</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-sm text-muted-foreground">Last 30 days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pages Optimized</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-sm text-muted-foreground">This week</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Page Details Dialog */}
      <Dialog open={pageDetailsOpen} onOpenChange={setPageDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Page Analysis Details</DialogTitle>
            <DialogDescription>Detailed SEO analysis for the selected page</DialogDescription>
          </DialogHeader>

          {selectedPage && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>URL</Label>
                  <p className="font-medium">{selectedPage.url}</p>
                </div>
                <div>
                  <Label>Load Time</Label>
                  <p className="font-medium">{selectedPage.loadTime}s</p>
                </div>
                <div>
                  <Label>Word Count</Label>
                  <p className="font-medium">{selectedPage.wordCount}</p>
                </div>
                <div>
                  <Label>H1 Tags</Label>
                  <p className="font-medium">{selectedPage.h1Count}</p>
                </div>
              </div>

              <div>
                <Label>Title Tag</Label>
                <Input value={selectedPage.title} className="mt-1" />
              </div>

              <div>
                <Label>Meta Description</Label>
                <Textarea
                  value={selectedPage.metaDescription}
                  placeholder="Add a meta description..."
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Internal Links</Label>
                  <p className="font-medium">{selectedPage.internalLinks}</p>
                </div>
                <div>
                  <Label>External Links</Label>
                  <p className="font-medium">{selectedPage.externalLinks}</p>
                </div>
              </div>

              {selectedPage.imagesMissingAlt > 0 && (
                <div className="p-3 border rounded-lg bg-red-50 dark:bg-red-900/20">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-700 dark:text-red-400">
                      {selectedPage.imagesMissingAlt} images missing alt text
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setPageDetailsOpen(false)}>
              Close
            </Button>
            <Button onClick={() => setPageDetailsOpen(false)}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>SEO & Accessibility Settings</DialogTitle>
            <DialogDescription>Configure optimization preferences</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium">SEO Settings</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Auto-generate meta descriptions</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Monitor page speed</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Track keyword rankings</Label>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Generate XML sitemap</Label>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Accessibility Settings</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Auto-scan for issues</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Check color contrast</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Validate keyboard navigation</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Screen reader testing</Label>
                  <Switch />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setSettingsDialogOpen(false)}>Save Settings</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
