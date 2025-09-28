"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  Rocket,
  GitBranch,
  CheckCircle,
  XCircle,
  Clock,
  RotateCcw,
  Settings,
  Eye,
  Download,
  Server,
  Globe,
} from "lucide-react"
import { LineChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface Deployment {
  id: string
  version: string
  environment: "development" | "staging" | "production"
  status: "pending" | "running" | "success" | "failed" | "cancelled"
  branch: string
  commit: string
  author: string
  startedAt: string
  completedAt?: string
  duration?: number
  stages: DeploymentStage[]
}

interface DeploymentStage {
  id: string
  name: string
  status: "pending" | "running" | "success" | "failed" | "skipped"
  startedAt?: string
  completedAt?: string
  duration?: number
  logs?: string[]
}

interface Environment {
  id: string
  name: string
  type: "development" | "staging" | "production"
  url: string
  status: "healthy" | "degraded" | "down"
  lastDeployment: string
  version: string
  uptime: number
  responseTime: number
}

const mockDeployments: Deployment[] = [
  {
    id: "1",
    version: "v2.1.3",
    environment: "production",
    status: "success",
    branch: "main",
    commit: "a1b2c3d",
    author: "John Doe",
    startedAt: "2024-01-28T10:00:00Z",
    completedAt: "2024-01-28T10:15:00Z",
    duration: 900,
    stages: [
      {
        id: "1",
        name: "Build",
        status: "success",
        startedAt: "2024-01-28T10:00:00Z",
        completedAt: "2024-01-28T10:05:00Z",
        duration: 300,
      },
      {
        id: "2",
        name: "Test",
        status: "success",
        startedAt: "2024-01-28T10:05:00Z",
        completedAt: "2024-01-28T10:10:00Z",
        duration: 300,
      },
      {
        id: "3",
        name: "Deploy",
        status: "success",
        startedAt: "2024-01-28T10:10:00Z",
        completedAt: "2024-01-28T10:15:00Z",
        duration: 300,
      },
    ],
  },
  {
    id: "2",
    version: "v2.1.4",
    environment: "staging",
    status: "running",
    branch: "develop",
    commit: "d4e5f6g",
    author: "Jane Smith",
    startedAt: "2024-01-28T11:00:00Z",
    duration: 0,
    stages: [
      {
        id: "1",
        name: "Build",
        status: "success",
        startedAt: "2024-01-28T11:00:00Z",
        completedAt: "2024-01-28T11:03:00Z",
        duration: 180,
      },
      {
        id: "2",
        name: "Test",
        status: "running",
        startedAt: "2024-01-28T11:03:00Z",
      },
      {
        id: "3",
        name: "Deploy",
        status: "pending",
      },
    ],
  },
]

const mockEnvironments: Environment[] = [
  {
    id: "1",
    name: "Production",
    type: "production",
    url: "https://watchparty.com",
    status: "healthy",
    lastDeployment: "2024-01-28T10:15:00Z",
    version: "v2.1.3",
    uptime: 99.9,
    responseTime: 145,
  },
  {
    id: "2",
    name: "Staging",
    type: "staging",
    url: "https://staging.watchparty.com",
    status: "healthy",
    lastDeployment: "2024-01-28T09:30:00Z",
    version: "v2.1.4-rc.1",
    uptime: 98.5,
    responseTime: 180,
  },
  {
    id: "3",
    name: "Development",
    type: "development",
    url: "https://dev.watchparty.com",
    status: "degraded",
    lastDeployment: "2024-01-28T08:45:00Z",
    version: "v2.2.0-dev",
    uptime: 95.2,
    responseTime: 220,
  },
]

const deploymentTrends = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
  deployments: Math.floor(Math.random() * 5) + 1,
  success: Math.floor(Math.random() * 4) + 1,
  failed: Math.floor(Math.random() * 2),
}))

export function DeploymentPipeline() {
  const [deployments, setDeployments] = useState<Deployment[]>(mockDeployments)
  const [environments, setEnvironments] = useState<Environment[]>(mockEnvironments)
  const [selectedDeployment, setSelectedDeployment] = useState<Deployment | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false)
  const [filterEnvironment, setFilterEnvironment] = useState<string>(&quot;all")
  const [filterStatus, setFilterStatus] = useState<string>(&quot;all")

  const triggerDeployment = (environment: string, branch = "main") => {
    const newDeployment: Deployment = {
      id: Date.now().toString(),
      version: `v2.1.${deployments.length + 1}`,
      environment: environment as Record<string, unknown>,
      status: "running",
      branch,
      commit: Math.random().toString(36).substring(7),
      author: "Current User",
      startedAt: new Date().toISOString(),
      stages: [
        { id: "1", name: "Build", status: "running", startedAt: new Date().toISOString() },
        { id: "2", name: "Test", status: "pending" },
        { id: "3", name: "Deploy", status: "pending" },
      ],
    }

    setDeployments((prev) => [newDeployment, ...prev])

    // Simulate deployment progress
    setTimeout(() => {
      setDeployments((prev) =>
        prev.map((dep) =>
          dep.id === newDeployment.id
            ? {
                ...dep,
                status: Math.random() > 0.2 ? &quot;success" : "failed",
                completedAt: new Date().toISOString(),
                duration: Math.floor(Math.random() * 600) + 300,
                stages: dep.stages.map((stage) => ({
                  ...stage,
                  status: Math.random() > 0.1 ? "success" : "failed",
                  completedAt: new Date().toISOString(),
                  duration: Math.floor(Math.random() * 200) + 100,
                })),
              }
            : dep,
        ),
      )
    }, 5000)
  }

  const rollbackDeployment = (deploymentId: string) => {
    // Implement rollback logic
    console.log("Rolling back deployment:", deploymentId)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-600"
      case "failed":
        return "text-red-600"
      case "running":
        return "text-blue-600"
      case "pending":
        return "text-yellow-600"
      case "cancelled":
        return "text-gray-600"
      default:
        return "text-gray-600"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "running":
        return <Clock className="h-4 w-4 text-blue-600 animate-spin" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "cancelled":
        return <XCircle className="h-4 w-4 text-gray-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getEnvironmentStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "degraded":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "down":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const filteredDeployments = deployments.filter((deployment) => {
    const matchesEnvironment = filterEnvironment === "all" || deployment.environment === filterEnvironment
    const matchesStatus = filterStatus === "all" || deployment.status === filterStatus
    return matchesEnvironment && matchesStatus
  })

  const totalDeployments = deployments.length
  const successfulDeployments = deployments.filter((d) => d.status === &quot;success").length
  const failedDeployments = deployments.filter((d) => d.status === "failed").length
  const runningDeployments = deployments.filter((d) => d.status === "running").length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Deployment Pipeline</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage deployments and monitor environments</p>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => setSettingsDialogOpen(true)} variant=&quot;outline">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Button onClick={() => triggerDeployment(&quot;staging")}>
            <Rocket className="mr-2 h-4 w-4" />
            Deploy to Staging
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deployments</CardTitle>
            <Rocket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDeployments}</div>
            <div className="flex items-center text-xs text-muted-foreground">This month</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {Math.round((successfulDeployments / totalDeployments) * 100)}%
            </div>
            <div className="flex items-center text-xs text-muted-foreground">{successfulDeployments} successful</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Deployments</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{failedDeployments}</div>
            <div className="flex items-center text-xs text-muted-foreground">Require attention</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Deployments</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{runningDeployments}</div>
            <div className="flex items-center text-xs text-muted-foreground">Currently running</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="deployments" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="deployments">Deployments</TabsTrigger>
          <TabsTrigger value="environments">Environments</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Deployments */}
        <TabsContent value="deployments" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Recent Deployments</CardTitle>
                  <CardDescription>Track deployment history and status</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={filterEnvironment} onValueChange={setFilterEnvironment}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Environment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Environments</SelectItem>
                      <SelectItem value="production">Production</SelectItem>
                      <SelectItem value="staging">Staging</SelectItem>
                      <SelectItem value="development">Development</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="running">Running</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Version</TableHead>
                    <TableHead>Environment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Started</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDeployments.map((deployment) => (
                    <TableRow key={deployment.id}>
                      <TableCell className="font-medium">{deployment.version}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            deployment.environment === "production"
                              ? "border-red-200 text-red-700"
                              : deployment.environment === "staging"
                                ? "border-yellow-200 text-yellow-700"
                                : "border-blue-200 text-blue-700"
                          }
                        >
                          {deployment.environment}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(deployment.status)}
                          <span className={`capitalize ${getStatusColor(deployment.status)}`}>{deployment.status}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <GitBranch className="h-3 w-3" />
                          {deployment.branch}
                        </div>
                      </TableCell>
                      <TableCell>{deployment.author}</TableCell>
                      <TableCell>{deployment.duration ? `${Math.round(deployment.duration / 60)}m` : &quot;-"}</TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {new Date(deployment.startedAt).toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedDeployment(deployment)
                              setDetailsDialogOpen(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {deployment.status === "success" && deployment.environment === "production" && (
                            <Button size="sm" variant="outline" onClick={() => rollbackDeployment(deployment.id)}>
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Environments */}
        <TabsContent value="environments" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {environments.map((environment) => (
              <Card key={environment.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Server className="h-5 w-5" />
                      {environment.name}
                    </CardTitle>
                    <Badge className={getEnvironmentStatusColor(environment.status)}>{environment.status}</Badge>
                  </div>
                  <CardDescription>{environment.url}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Version</p>
                      <p className="font-medium">{environment.version}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Uptime</p>
                      <p className="font-medium">{environment.uptime}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Response Time</p>
                      <p className="font-medium">{environment.responseTime}ms</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last Deploy</p>
                      <p className="font-medium">{new Date(environment.lastDeployment).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => triggerDeployment(environment.type)}
                      disabled={environment.type === "production"}
                    >
                      <Rocket className="mr-2 h-4 w-4" />
                      Deploy
                    </Button>
                    <Button size="sm" variant="outline">
                      <Globe className="mr-2 h-4 w-4" />
                      Visit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Environment Health</CardTitle>
              <CardDescription>Monitor environment performance and status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {environments.map((env) => (
                  <div key={env.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Server className="h-4 w-4" />
                        <span className="font-medium">{env.name}</span>
                      </div>
                      <Badge className={getEnvironmentStatusColor(env.status)}>{env.status}</Badge>
                    </div>

                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="text-muted-foreground">Uptime</p>
                        <p className="font-medium">{env.uptime}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground">Response</p>
                        <p className="font-medium">{env.responseTime}ms</p>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground">Version</p>
                        <p className="font-medium">{env.version}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pipeline Configuration */}
        <TabsContent value="pipeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pipeline Configuration</CardTitle>
              <CardDescription>Configure deployment pipeline stages and settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Build Stage</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm">Install Dependencies</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm">Build Application</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm">Generate Assets</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Test Stage</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm">Unit Tests</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm">Integration Tests</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm">E2E Tests</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Deploy Stage</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm">Deploy to Server</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm">Health Check</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm">Notify Team</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Pipeline Settings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Auto-deploy on merge to main</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="space-y-2">
                      <Label>Require manual approval for production</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="space-y-2">
                      <Label>Run tests in parallel</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="space-y-2">
                      <Label>Send notifications on failure</Label>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Deployment Trends</CardTitle>
              <CardDescription>Deployment frequency and success rates over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={deploymentTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="deployments" fill="#6366f1" name="Total Deployments" />
                  <Line type="monotone" dataKey="success" stroke="#10b981" name="Successful" />
                  <Line type="monotone" dataKey="failed" stroke="#ef4444" name="Failed" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Avg Deploy Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8.5m</div>
                <p className="text-sm text-muted-foreground">Average deployment duration</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Deploy Frequency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-sm text-muted-foreground">Deployments this week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>MTTR</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2.3h</div>
                <p className="text-sm text-muted-foreground">Mean time to recovery</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Deployment Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Deployment Details</DialogTitle>
            <DialogDescription>Detailed information about the deployment</DialogDescription>
          </DialogHeader>

          {selectedDeployment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Version</Label>
                  <p className="font-medium">{selectedDeployment.version}</p>
                </div>
                <div>
                  <Label>Environment</Label>
                  <Badge variant="outline">{selectedDeployment.environment}</Badge>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedDeployment.status)}
                    <span className={`capitalize ${getStatusColor(selectedDeployment.status)}`}>
                      {selectedDeployment.status}
                    </span>
                  </div>
                </div>
                <div>
                  <Label>Duration</Label>
                  <p className="font-medium">
                    {selectedDeployment.duration ? `${Math.round(selectedDeployment.duration / 60)}m` : "-"}
                  </p>
                </div>
              </div>

              <div>
                <Label>Deployment Stages</Label>
                <div className="mt-2 space-y-2">
                  {selectedDeployment.stages.map((stage) => (
                    <div key={stage.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(stage.status)}
                        <span className="font-medium">{stage.name}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {stage.duration ? `${Math.round(stage.duration / 60)}m` : "-"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Commit Information</Label>
                <div className="mt-2 p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <GitBranch className="h-4 w-4" />
                    <span className="font-medium">{selectedDeployment.branch}</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="font-mono text-sm">{selectedDeployment.commit}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    By {selectedDeployment.author} on {new Date(selectedDeployment.startedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={() => setDetailsDialogOpen(false)}>
              <Download className="mr-2 h-4 w-4" />
              Download Logs
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Deployment Settings</DialogTitle>
            <DialogDescription>Configure deployment pipeline preferences</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium">Deployment Options</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Auto-deploy on push to main</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Require approval for production</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Enable rollback on failure</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Send deployment notifications</Label>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Environment Configuration</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Health check timeout</Label>
                  <span className="text-sm">30s</span>
                </div>
                <div className="flex items-center justify-between">
                  <Label>Deployment timeout</Label>
                  <span className="text-sm">10m</span>
                </div>
                <div className="flex items-center justify-between">
                  <Label>Retry attempts</Label>
                  <span className="text-sm">3</span>
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
