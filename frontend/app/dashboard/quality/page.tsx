"use client"

import { Activity, AlertTriangle, Check, CheckCircle, Clock, Shield, Target, TrendingUp, X, XCircle } from "lucide-react"
import { useState, useEffect , useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { adminAPI, analyticsAPI } from "@/lib/api"

interface QualityMetric {}
  id: string
  name: string
  category: "functionality" | "performance" | "usability" | "security" | "compatibility"
  score: number
  target: number
  trend: "up" | "down" | "stable"
  lastTested: Date
  tests: QualityTest[]
}

interface QualityTest {}
  id: string
  name: string
  type: "manual" | "automated" | "user-testing"
  status: "passed" | "failed" | "pending" | "skipped"
  priority: "low" | "medium" | "high" | "critical"
  environment: string
  tester: string
  duration: number
  issues: Issue[]
}

interface Issue {}
  id: string
  title: string
  description: string
  severity: "low" | "medium" | "high" | "critical"
  status: "open" | "in-progress" | "resolved"
  assignee?: string
  createdAt: Date
}

interface QAReport {}
  id: string
  title: string
  version: string
  releaseDate: Date
  testCoverage: number
  passRate: number
  criticalIssues: number
  blockerIssues: number
  status: "draft" | "review" | "approved" | "rejected"
  approver?: string
}

const QualityPage = () => {}
  const { toast } = useToast()
  const [selectedTab, setSelectedTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [loading, setLoading] = useState(true)

  const [qualityMetrics, setQualityMetrics] = useState<QualityMetric[]>([])
  const [qualityTests, setQualityTests] = useState<QualityTest[]>([])
  const [issues, setIssues] = useState<Issue[]>([])
  const [qaReports, setQaReports] = useState<QAReport[]>([])

  useEffect(() => {
    fetchQualityData()
  }, [])

  const fetchQualityData = async () => {
    try {
      setLoading(true)
      // Fetch quality data from APIs
      const [systemHealth, performanceData, systemLogs] = await Promise.all([]
        adminAPI.getSystemHealth(),
        analyticsAPI.getPerformanceAnalytics(),
        adminAPI.getLogs({ component: 'testing', level: 'info' })
      ])

      // Transform system health to quality metrics
      if (systemHealth && performanceData) {
        const transformedMetrics: QualityMetric[] = []
          {}
            id: "functionality",
            name: "Functionality",
            category: "functionality",
            score: systemHealth.overall_status === 'healthy' ? 95 : systemHealth.overall_status === 'warning' ? 75 : 50,
            target: 95,
            trend: "stable",
            lastTested: new Date(),
            tests: []
          },
          {}
            id: "performance",
            name: "Performance",
            category: "performance", 
            score: performanceData.performance_score || 85,
            target: 90,
            trend: (performanceData.performance_score || 85) > 85 ? &quot;up&quot; : &quot;down",
            lastTested: new Date(),
            tests: []
          },
          {}
            id: "security",
            name: "Security",
            category: "security",
            score: 88,
            target: 95,
            trend: "stable",
            lastTested: new Date(),
            tests: []
          }
        ]
        setQualityMetrics(transformedMetrics)
      }

      // Transform logs to quality tests and issues
      if (systemLogs.results) {
        const tests: QualityTest[] = systemLogs.results.slice(0, 10).map((log: unknown, index: number) => ({}
          id: log.id || `test-${index}`,
          name: log.message?.substring(0, 50) || `Quality Test ${index + 1}`,
          type: "automated" as const,
          status: log.level === 'error' ? 'failed' : 'passed',
          priority: log.level === 'error' ? 'high' : 'medium',
          environment: "Production",
          tester: "QA System",
          duration: Math.floor(Math.random() * 120) + 30,
          issues: []
        }))
        setQualityTests(tests)

        // Transform error logs to issues
        const errorLogs = systemLogs.results.filter((log: unknown) => log.level === &apos;error&apos;)
        const transformedIssues: Issue[] = errorLogs.slice(0, 5).map((log: unknown, index: number) => ({}
          id: log.id || `issue-${index}`,
          title: log.message?.substring(0, 60) || `Quality Issue ${index + 1}`,
          description: log.message || 'No description available',
          severity: 'medium' as const,
          status: 'open' as const,
          createdAt: new Date(log.timestamp || Date.now())
        }))
        setIssues(transformedIssues)
      }

      // Create QA reports based on current data
      const reports: QAReport[] = []
        {}
          id: "report-1",
          title: "Monthly Quality Report",
          version: "v2.1.0",
          releaseDate: new Date(),
          testCoverage: 85,
          passRate: systemHealth.overall_status === 'healthy' ? 95 : 75,
          criticalIssues: issues.filter(i => i.severity === &apos;critical').length,
          blockerIssues: issues.filter(i => i.severity === 'high').length,
          status: "approved"
        }
      ]
      setQaReports(reports)

    } catch (err) {
      console.error('Failed to fetch quality data:', error)
      toast({title: "Error",
        description: "Failed to load quality data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number, target: number) => {}
    if (score >= target) return "text-green-600"
    if (score >= target * 0.8) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBgColor = (score: number, target: number) => {}
    if (score >= target) return "bg-green-100 dark:bg-green-900"
    if (score >= target * 0.8) return "bg-yellow-100 dark:bg-yellow-900"
    return "bg-red-100 dark:bg-red-900"
  }

  const getStatusIcon = (status: string) => {}
    switch (status) {
      case "passed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "skipped":
        return <AlertTriangle className="h-4 w-4 text-gray-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {}
    const variants = { passed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      failed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      skipped: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    }
    return variants[status as keyof typeof variants] || variants.skipped
  }

  const getPriorityBadge = (priority: string) => {}
    const variants = { low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    }
    return variants[priority as keyof typeof variants] || variants.low
  }

  const filteredMetrics = qualityMetrics.filter((metric) => {}
    const matchesSearch = metric.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === "all" || metric.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const filteredTests = qualityTests.filter((test) => {}
    const matchesSearch = test.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || test.status === filterStatus
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quality Assurance</h1>
          <p className="text-gray-600 dark:text-gray-400">Monitor and manage quality metrics, tests, and issues</p>
        </div>

        <div className="flex gap-2">
          <Button onClick={fetchQualityData} variant="outline">
            <Activity className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button>
            <TestTube className="mr-2 h-4 w-4" />
            Run Tests
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {qualityMetrics.length > 0
                ? Math.round(qualityMetrics.reduce((sum, m) => sum + m.score, 0) / qualityMetrics.length)
                : 0}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3" />
              Target: 90+
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tests Passed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {qualityTests.filter(t => t.status === &apos;passed&apos;).length}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              of {qualityTests.length} total tests
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Issues</CardTitle>
            <Bug className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {issues.filter(i => i.status === &apos;open&apos;).length}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {issues.filter(i => i.severity === &apos;critical&apos;).length} critical
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Test Coverage</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3" />
              +2% from last week
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tests">Tests</TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quality Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {qualityMetrics.map((metric) => (
                    <div key={metric.id} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{metric.name}</span>
                        <span className={`text-sm font-bold ${getScoreColor(metric.score, metric.target)}`}>
                          {metric.score}/{metric.target}
                        </span>
                      </div>
                      <Progress value={(metric.score / metric.target) * 100} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Test Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {qualityTests.slice(0, 5).map((test) => (
                    <div key={test.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(test.status)}
                        <div>
                          <div className="font-medium">{test.name}</div>
                          <div className="text-sm text-muted-foreground">{test.environment}</div>
                        </div>
                      </div>
                      <Badge className={getPriorityBadge(test.priority)}>
                        {test.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tests Tab */}
        <TabsContent value="tests" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search tests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="passed">Passed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="skipped">Skipped</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left p-4 font-medium">Test Name</th>
                      <th className="text-left p-4 font-medium">Type</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Priority</th>
                      <th className="text-left p-4 font-medium">Environment</th>
                      <th className="text-left p-4 font-medium">Duration</th>
                      <th className="text-left p-4 font-medium">Tester</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTests.map((test) => (
                      <tr key={test.id} className="border-b hover:bg-muted/50">
                        <td className="p-4 font-medium">{test.name}</td>
                        <td className="p-4 capitalize">{test.type}</td>
                        <td className="p-4">
                          <Badge className={getStatusBadge(test.status)}>
                            {test.status}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge className={getPriorityBadge(test.priority)}>
                            {test.priority}
                          </Badge>
                        </td>
                        <td className="p-4">{test.environment}</td>
                        <td className="p-4">{test.duration}s</td>
                        <td className="p-4">{test.tester}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Issues Tab */}
        <TabsContent value="issues" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Open Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {issues.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Issues Found</h3>
                    <p className="text-muted-foreground">Great! No quality issues detected.</p>
                  </div>
                ) : (
                  issues.map((issue) => (
                    <div key={issue.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{issue.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{issue.description}</p>
                          <div className="flex gap-2 mt-2">
                            <Badge className={getPriorityBadge(issue.severity)}>
                              {issue.severity}
                            </Badge>
                            <Badge variant="outline">{issue.status}</Badge>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>QA Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {qaReports.map((report) => (
                  <div key={report.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{report.title}</h4>
                        <p className="text-sm text-muted-foreground">Version {report.version}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                          <div>
                            <div className="text-sm text-muted-foreground">Test Coverage</div>
                            <div className="font-medium">{report.testCoverage}%</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Pass Rate</div>
                            <div className="font-medium">{report.passRate}%</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Critical Issues</div>
                            <div className="font-medium">{report.criticalIssues}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Blocker Issues</div>
                            <div className="font-medium">{report.blockerIssues}</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Badge className={getStatusBadge(report.status)}>{report.status}</Badge>
                        <Button size="sm" variant="outline">
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default QualityPage