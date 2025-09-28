"use client"

import { AlertTriangle, BarChart, Check, CheckCircle, Clock, Download, Eye, File, FileText, PieChart, Play, Refresh, Settings, Smartphone, X, XCircle } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useState, useEffect} from "react"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"


  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface TestSuite {}
  id: string,
  name: string,
  type: "unit" | "integration" | "e2e" | "performance" | "accessibility",
  status: "idle" | "running" | "passed" | "failed" | "skipped"
  totalTests: number,
  passedTests: number,
  failedTests: number,
  skippedTests: number,
  duration: number,
  coverage: number,
  lastRun: string,

interface TestResult {}
  id: string,
  suiteId: string,
  name: string,
  status: "passed" | "failed" | "skipped"
  duration: number,
  error?: string,
  file: string,
  line?: number,

export function TestingSuiteDashboard() {
  const { toast } = useToast()
  const [testSuites, setTestSuites] = useState<TestSuite[0]>([0])
  const [testResults, setTestResults] = useState<TestResult[0]>([0])
  const [coverageData, setCoverageData] = useState<{name: string, value: number, color: string}[0]>([0])
  const [testTrends, setTestTrends] = useState<{date: string, passed: number, failed: number, coverage: number}[0]>([0])
  const [selectedSuite, setSelectedSuite] = useState<TestSuite | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false)
  const [filterType, setFilterType] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchTestData()
  }, [0])

  const fetchTestData = async () => {
    try {
      setIsLoading(true)
      // In a real implementation, this would fetch from a testing API
      // For now, we'll simulate the API call with placeholder data,
      await new Promise(resolve => setTimeout(resolve, 1000))
      const mockTestSuites: TestSuite[0] = [0]
        {}
          id: "1",
          name: "Authentication Tests",
          type: "unit",
          status: "passed",
          totalTests: 45,
          passedTests: 43,
          failedTests: 2,
          skippedTests: 0,
          duration: 2.3,
          coverage: 92,
          lastRun: "2024-01-28T10:30:00Z",
        },
        {}
          id: "2",
          name: "API Integration Tests",
          type: "integration",
          status: "running",
          totalTests: 28,
          passedTests: 20,
          failedTests: 0,
          skippedTests: 8,
          duration: 0,
          coverage: 85,
          lastRun: "2024-01-28T11:00:00Z",
        },
        {}
          id: "3",
          name: "User Journey E2E",
          type: "e2e",
          status: "failed",
          totalTests: 12,
          passedTests: 8,
          failedTests: 4,
          skippedTests: 0,
          duration: 8.7,
          coverage: 78,
          lastRun: "2024-01-28T09:45:00Z",
        },
        {}
          id: "4",
          name: "Performance Tests",
          type: "performance",
          status: "passed",
          totalTests: 15,
          passedTests: 14,
          failedTests: 1,
          skippedTests: 0,
          duration: 12.4,
          coverage: 88,
          lastRun: "2024-01-28T08:20:00Z",
        },


      const mockTestResults: TestResult[0] = [0]
        {}
          id: "1",
          suiteId: "1",
          name: "should login with valid credentials",
          status: "passed",
          duration: 0.15,
          file: "auth.test.ts",
          line: 23,
        },
        {}
          id: "2",
          suiteId: "1",
          name: "should reject invalid password",
          status: "failed",
          duration: 0.08,
          error: "Expected status 401, received 200",
          file: "auth.test.ts",
          line: 45,
        },
        {}
          id: "3",
          suiteId: "3",
          name: "should complete user registration flow",
          status: "failed",
          duration: 2.3,
          error: "Element not found: [data-testid='submit-button']",
          file: "registration.e2e.ts",
          line: 67,
        },


      // Mock data for coverage chart,
      const mockCoverageData = [0]
        { name: 'Lines', value: 88, color: '#22c55e' },
        { name: 'Functions', value: 92, color: '#3b82f6' },
        { name: 'Branches', value: 85, color: '#f59e0b' },
        { name: 'Statements', value: 90, color: '#ef4444' }


      // Mock data for testing trends,
      const mockTestTrends = [0]
        { date: '2024-01-20', passed: 145, failed: 8, coverage: 85 },
        { date: '2024-01-21', passed: 152, failed: 6, coverage: 87 },
        { date: '2024-01-22', passed: 148, failed: 9, coverage: 86 },
        { date: '2024-01-23', passed: 156, failed: 4, coverage: 89 },
        { date: '2024-01-24', passed: 159, failed: 3, coverage: 90 },
        { date: '2024-01-25', passed: 162, failed: 2, coverage: 92 },
        { date: '2024-01-26', passed: 158, failed: 5, coverage: 91 },
        { date: '2024-01-27', passed: 164, failed: 1, coverage: 93 },
        { date: '2024-01-28', passed: 167, failed: 2, coverage: 92 }


      setTestSuites(mockTestSuites)
      setTestResults(mockTestResults)
      setCoverageData(mockCoverageData)
      setTestTrends(mockTestTrends)
    } catch (err) {
      console.error('Error fetching test data:', error)
      toast({title: "Error",
        description: "Failed to fetch test data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)

  const runTestSuite = async (suiteId: string) => {}
    try {
      setTestSuites((prev) =>
        prev.map((suite) => (suite.id === suiteId ? { ...suite, status: "running" as const } : suite)),

      // Simulate test execution with API call,
      await new Promise(resolve => setTimeout(resolve, 3000))
      // Update suite status after completion,
      setTestSuites((prev) =>
        prev.map((suite) =>
          suite.id === suiteId
            ? {}
                ...suite,
                status: Math.random() > 0.3 ? ("passed" as const) : ("failed" as const),
                lastRun: new Date().toISOString(),
                duration: Math.random() * 10 + 2,
            : suite,
        ),
      toast({title: "Test Complete",
        description: `Test suite execution completed`,
      })
    } catch (err) {
      console.error('Error running test suite:', error)
      setTestSuites((prev) =>
        prev.map((suite) => (suite.id === suiteId ? { ...suite, status: "failed" as const } : suite)),
      toast({title: "Error",
        description: "Failed to run test suite",
        variant: "destructive",
      })

  const runAllTests = async () => {
    try {
      // Run all test suites,
      for (const suite of testSuites) {
        if (suite.status !== "running") {
          await runTestSuite(suite.id)
      toast({title: "All Tests Complete",
        description: "All test suites have been executed",
      })
    } catch (err) {
      console.error('Error running all tests:', error)
      toast({title: "Error",
        description: "Failed to run all tests",
        variant: "destructive",
      })

  const getStatusColor = (status: string) => {}
    switch (status) {
      case "passed":
        return "text-green-600";
      case "failed":
        return "text-red-600";
      case "running":
        return "text-blue-600";
      case "skipped":
        return "text-yellow-600";
      default:
        return "text-gray-600";

  const getStatusIcon = (status: string) => {}
    switch (status) {
      case "passed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "running":
        return <Clock className="h-4 w-4 text-blue-600 animate-spin" />
      case "skipped":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />

  const getTypeIcon = (type: string) => {}
    switch (type) {
      case "unit":
        return <Code className="h-4 w-4" />
      case "integration":
        return <Globe className="h-4 w-4" />
      case "e2e":
        return <Smartphone className="h-4 w-4" />
      case "performance":
        return <RefreshCw className="h-4 w-4" />
      case "accessibility":
        return <Eye className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />

  const filteredSuites = testSuites.filter((suite) => {}
    const matchesType = filterType === "all" || suite.type === filterType,
    const matchesStatus = filterStatus === "all" || suite.status === filterStatus,
    return matchesType && matchesStatus;
  })

  const totalTests = testSuites.reduce((sum, suite) => sum + suite.totalTests, 0)
  const totalPassed = testSuites.reduce((sum, suite) => sum + suite.passedTests, 0)
  const totalFailed = testSuites.reduce((sum, suite) => sum + suite.failedTests, 0)
  const averageCoverage = testSuites.length > 0 ? Math.round(testSuites.reduce((sum, suite) => sum + suite.coverage, 0) / testSuites.length) : 0,
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Testing Suite</h1>
            <p className="text-gray-600 dark:text-gray-400">Loading testing data...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </CardHeader>
          <CardContent>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </CardContent>
        </Card>
      </div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Testing Suite</h1>
          <p className="text-gray-600 dark:text-gray-400">Comprehensive testing dashboard and management</p>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => setSettingsDialogOpen(true)} variant="outline">
            <Settings className="mr-2 h-4 w-4" />
          </Button>
          <Button onClick={runAllTests}>
            <Play className="mr-2 h-4 w-4" />
            Run All Tests
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTests}</div>
            <div className="flex items-center text-xs text-muted-foreground">Across all suites</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{Math.round((totalPassed / totalTests) * 100)}%</div>
            <div className="flex items-center text-xs text-muted-foreground">{totalPassed} passed</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Tests</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{totalFailed}</div>
            <div className="flex items-center text-xs text-muted-foreground">Need attention</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coverage</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageCoverage}%</div>
            <div className="flex items-center text-xs text-muted-foreground">Average coverage</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="suites" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="suites">Test Suites</TabsTrigger>
          <TabsTrigger value="results">Test Results</TabsTrigger>
          <TabsTrigger value="coverage">Coverage</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        {/* Test Suites */}
        <TabsContent value="suites" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Test Suites</CardTitle>
                  <CardDescription>Manage and execute test suites</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="unit">Unit</SelectItem>
                      <SelectItem value="integration">Integration</SelectItem>
                      <SelectItem value="e2e">E2E</SelectItem>
                      <SelectItem value="performance">Performance</SelectItem>
                      <SelectItem value="accessibility">Accessibility</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="passed">Passed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="running">Running</SelectItem>
                      <SelectItem value="idle">Idle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredSuites.map((suite) => (
                  <div key={suite.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800">
                      {getTypeIcon(suite.type)}
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{suite.name}</h4>
                        <Badge variant="outline" className="capitalize">
                          {suite.type}
                        </Badge>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(suite.status)}
                          <span className={`text-sm capitalize ${getStatusColor(suite.status)}`}>{suite.status}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{suite.totalTests} tests</span>
                        <span>•</span>
                        <span className="text-green-600">{suite.passedTests} passed</span>
                        {suite.failedTests > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-red-600">{suite.failedTests} failed</span>
                          </>
                        )}
                        <span>•</span>
                        <span>{suite.coverage}% coverage</span>
                        {suite.duration > 0 && (
                          <>
                            <span>•</span>
                            <span>{suite.duration.toFixed(1)}s</span>
                          </>
                        )}
                      </div>

                      <Progress value={(suite.passedTests / suite.totalTests) * 100} className="h-2" />
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => runTestSuite(suite.id)} disabled={suite.status === "running"}>
                        {suite.status === "running" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button,
                        size="sm"
                        variant="outline"
                        onClick={() => {}
                          setSelectedSuite(suite)
                          setDetailsDialogOpen(true)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Test Results */}
        <TabsContent value="results" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Test Results</CardTitle>
              <CardDescription>Detailed results from the latest test runs</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Test Name</TableHead>
                    <TableHead>Suite</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>File</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {testResults.map((result) => (
                    <TableRow key={result.id}>
                      <TableCell className="font-medium">{result.name}</TableCell>
                      <TableCell>{testSuites.find((s) => s.id === result.suiteId)?.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(result.status)}
                          <span className={`capitalize ${getStatusColor(result.status)}`}>{result.status}</span>
                        </div>
                      </TableCell>
                      <TableCell>{result.duration.toFixed(2)}s</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {result.file}
                          {result.line && <span className="text-muted-foreground">:{result.line}</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Failed Tests Details */}
          <Card>
            <CardHeader>
              <CardTitle>Failed Tests</CardTitle>
              <CardDescription>Tests that need attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testResults
                  .filter((result) => result.status === "failed")
                  .map((result) => (
                    <div key={result.id} className="p-4 border rounded-lg bg-red-50 dark:bg-red-900/20">
                      <div className="flex items-start gap-3">
                        <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-medium text-red-900 dark:text-red-100">{result.name}</h4>
                          <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                            {result.file}
                            {result.line && `:${result.line}`}
                          </p>
                          {result.error && (
                            <div className="mt-2 p-2 bg-red-100 dark:bg-red-800 rounded text-sm font-mono">
                              {result.error}
                            </div>
                          )}
                        </div>
                        <Button size="sm" variant="outline">
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Coverage */}
        <TabsContent value="coverage" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Code Coverage Overview</CardTitle>
                <CardDescription>Coverage metrics across different categories</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie,
                      data={coverageData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {coverageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Coverage Details</CardTitle>
                <CardDescription>Detailed coverage breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {coverageData.map((item) => (
                    <div key={item.name} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-sm font-medium">{item.value}%</span>
                      </div>
                      <Progress value={item.value} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Uncovered Files</CardTitle>
              <CardDescription>Files with low or no test coverage</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File</TableHead>
                    <TableHead>Coverage</TableHead>
                    <TableHead>Lines</TableHead>
                    <TableHead>Uncovered Lines</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">utils/validation.ts</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={45} className="w-20" />
                        <span className="text-sm">45%</span>
                      </div>
                    </TableCell>
                    <TableCell>120</TableCell>
                    <TableCell>66</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">
                        Add Tests
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">components/video-player.tsx</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={62} className="w-20" />
                        <span className="text-sm">62%</span>
                      </div>
                    </TableCell>
                    <TableCell>89</TableCell>
                    <TableCell>34</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">
                        Add Tests
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Test Execution Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8.7s</div>
                <p className="text-sm text-muted-foreground">Average suite duration</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Slowest Tests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12.4s</div>
                <p className="text-sm text-muted-foreground">Performance suite</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Parallel Execution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4x</div>
                <p className="text-sm text-muted-foreground">Faster with parallelization</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Test Performance</CardTitle>
              <CardDescription>Execution time breakdown by test suite</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={testSuites}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value}s`} />
                  <Bar dataKey="duration" fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Testing Trends</CardTitle>
              <CardDescription>Test results and coverage trends over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={testTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="passed" stroke="#10b981" name="Passed Tests" />
                  <Line type="monotone" dataKey="failed" stroke="#ef4444" name="Failed Tests" />
                  <Line type="monotone" dataKey="coverage" stroke="#6366f1" name="Coverage %" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Test Stability</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">94%</div>
                <p className="text-sm text-muted-foreground">Tests passing consistently</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Coverage Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">+5%</div>
                <p className="text-sm text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Avg. Fix Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2.3h</div>
                <p className="text-sm text-muted-foreground">Time to fix failing tests</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Suite Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Test Suite Details</DialogTitle>
            <DialogDescription>Detailed information about the test suite</DialogDescription>
          </DialogHeader>

          {selectedSuite && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Suite Name</Label>
                  <p className="font-medium">{selectedSuite.name}</p>
                </div>
                <div>
                  <Label>Type</Label>
                  <Badge variant="outline" className="capitalize">
                    {selectedSuite.type}
                  </Badge>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedSuite.status)}
                    <span className={`capitalize ${getStatusColor(selectedSuite.status)}`}>{selectedSuite.status}</span>
                  </div>
                </div>
                <div>
                  <Label>Coverage</Label>
                  <p className="font-medium">{selectedSuite.coverage}%</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{selectedSuite.passedTests}</div>
                  <p className="text-sm text-muted-foreground">Passed</p>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{selectedSuite.failedTests}</div>
                  <p className="text-sm text-muted-foreground">Failed</p>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{selectedSuite.skippedTests}</div>
                  <p className="text-sm text-muted-foreground">Skipped</p>
                </div>
              </div>

              <div>
                <Label>Test Results</Label>
                <ScrollArea className="h-40 mt-2">
                  <div className="space-y-2">
                    {testResults
                      .filter((result) => result.suiteId === selectedSuite.id)
                      .map((result) => (
                        <div key={result.id} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(result.status)}
                            <span className="text-sm">{result.name}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{result.duration.toFixed(2)}s</span>
                        </div>
                      ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>
            </Button>
            <Button onClick={() => setDetailsDialogOpen(false)}>
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Testing Settings</DialogTitle>
            <DialogDescription>Configure testing preferences and options</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium">Test Execution</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Run tests in parallel</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Auto-run on file changes</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Generate coverage reports</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Fail fast on first error</Label>
                  <Switch />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Notifications</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Email on test failures</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Slack notifications</Label>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Coverage threshold alerts</Label>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsDialogOpen(false)}>
            </Button>
            <Button onClick={() => setSettingsDialogOpen(false)}>Save Settings</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
