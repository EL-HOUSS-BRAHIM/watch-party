"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import {
  Shield,
  AlertTriangle,
  Eye,
  Key,
  Globe,
  Activity,
  Ban,
  CheckCircle,
  MapPin,
  FileText,
  Download,
  RefreshCw,
  Settings,
} from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"

interface SecurityThreat {
  id: string
  type: "brute_force" | "suspicious_login" | "data_breach" | "malware" | "phishing"
  severity: "low" | "medium" | "high" | "critical"
  description: string
  source: string
  timestamp: string
  status: "active" | "resolved" | "investigating"
  affectedUsers: number
  location: string
  ipAddress: string
}

interface SecurityRule {
  id: string
  name: string
  description: string
  type: "firewall" | "rate_limit" | "geo_block" | "device_trust" | "behavior"
  isEnabled: boolean
  config: Record<string, any>
  triggeredCount: number
  lastTriggered: string
}

interface SecurityAudit {
  id: string
  action: string
  user: string
  resource: string
  timestamp: string
  ipAddress: string
  userAgent: string
  location: string
  result: "success" | "failure" | "blocked"
  riskScore: number
}

interface ComplianceReport {
  id: string
  standard: "SOC2" | "GDPR" | "HIPAA" | "PCI_DSS"
  status: "compliant" | "non_compliant" | "pending"
  lastAudit: string
  nextAudit: string
  score: number
  issues: number
}

export default function AdvancedSecuritySystem() {
  const { toast } = useToast()
  const [threats, setThreats] = useState<SecurityThreat[]>([])
  const [securityRules, setSecurityRules] = useState<SecurityRule[]>([])
  const [auditLogs, setAuditLogs] = useState<SecurityAudit[]>([])
  const [complianceReports, setComplianceReports] = useState<ComplianceReport[]>([])
  const [securityScore, setSecurityScore] = useState(85)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTab, setSelectedTab] = useState("dashboard")

  // Mock data initialization
  useEffect(() => {
    const mockThreats: SecurityThreat[] = [
      {
        id: "1",
        type: "brute_force",
        severity: "high",
        description: "Multiple failed login attempts detected from IP 192.168.1.100",
        source: "Login System",
        timestamp: "2024-01-28T14:30:00Z",
        status: "active",
        affectedUsers: 1,
        location: "New York, US",
        ipAddress: "192.168.1.100",
      },
      {
        id: "2",
        type: "suspicious_login",
        severity: "medium",
        description: "Login from unusual location detected",
        source: "Authentication Service",
        timestamp: "2024-01-28T12:15:00Z",
        status: "investigating",
        affectedUsers: 1,
        location: "Moscow, RU",
        ipAddress: "203.0.113.45",
      },
      {
        id: "3",
        type: "data_breach",
        severity: "critical",
        description: "Potential data exfiltration attempt detected",
        source: "Data Loss Prevention",
        timestamp: "2024-01-28T10:45:00Z",
        status: "resolved",
        affectedUsers: 0,
        location: "Unknown",
        ipAddress: "198.51.100.23",
      },
    ]

    const mockSecurityRules: SecurityRule[] = [
      {
        id: "1",
        name: "Rate Limiting",
        description: "Limit API requests to prevent abuse",
        type: "rate_limit",
        isEnabled: true,
        config: { maxRequests: 1000, windowMinutes: 60 },
        triggeredCount: 45,
        lastTriggered: "2024-01-28T13:20:00Z",
      },
      {
        id: "2",
        name: "Geo-blocking",
        description: "Block access from high-risk countries",
        type: "geo_block",
        isEnabled: true,
        config: { blockedCountries: ["CN", "RU", "KP"] },
        triggeredCount: 12,
        lastTriggered: "2024-01-28T11:30:00Z",
      },
      {
        id: "3",
        name: "Device Trust",
        description: "Require device verification for new devices",
        type: "device_trust",
        isEnabled: false,
        config: { trustDuration: 30 },
        triggeredCount: 8,
        lastTriggered: "2024-01-27T16:45:00Z",
      },
    ]

    const mockAuditLogs: SecurityAudit[] = [
      {
        id: "1",
        action: "user.login",
        user: "john.doe@example.com",
        resource: "/api/auth/login",
        timestamp: "2024-01-28T14:35:00Z",
        ipAddress: "192.168.1.50",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        location: "San Francisco, US",
        result: "success",
        riskScore: 2,
      },
      {
        id: "2",
        action: "api.key.create",
        user: "admin@watchparty.com",
        resource: "/api/keys",
        timestamp: "2024-01-28T14:20:00Z",
        ipAddress: "10.0.0.1",
        userAgent: "WatchParty Admin Dashboard",
        location: "Internal",
        result: "success",
        riskScore: 1,
      },
      {
        id: "3",
        action: "user.password.change",
        user: "jane.smith@example.com",
        resource: "/api/auth/change-password",
        timestamp: "2024-01-28T13:45:00Z",
        ipAddress: "203.0.113.10",
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
        location: "London, UK",
        result: "success",
        riskScore: 3,
      },
    ]

    const mockComplianceReports: ComplianceReport[] = [
      {
        id: "1",
        standard: "SOC2",
        status: "compliant",
        lastAudit: "2024-01-15T00:00:00Z",
        nextAudit: "2024-07-15T00:00:00Z",
        score: 95,
        issues: 0,
      },
      {
        id: "2",
        standard: "GDPR",
        status: "compliant",
        lastAudit: "2024-01-10T00:00:00Z",
        nextAudit: "2024-04-10T00:00:00Z",
        score: 88,
        issues: 2,
      },
      {
        id: "3",
        standard: "PCI_DSS",
        status: "pending",
        lastAudit: "2023-12-01T00:00:00Z",
        nextAudit: "2024-02-01T00:00:00Z",
        score: 78,
        issues: 5,
      },
    ]

    setThreats(mockThreats)
    setSecurityRules(mockSecurityRules)
    setAuditLogs(mockAuditLogs)
    setComplianceReports(mockComplianceReports)
  }, [])

  const handleResolveThreat = async (threatId: string) => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setThreats((prev) => prev.map((threat) => (threat.id === threatId ? { ...threat, status: "resolved" } : threat)))

      toast({
        title: "Threat Resolved",
        description: "The security threat has been marked as resolved.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resolve threat.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleRule = async (ruleId: string) => {
    try {
      setSecurityRules((prev) =>
        prev.map((rule) => (rule.id === ruleId ? { ...rule, isEnabled: !rule.isEnabled } : rule)),
      )

      toast({
        title: "Security Rule Updated",
        description: "The security rule has been updated.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update security rule.",
        variant: "destructive",
      })
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-600 bg-red-50 border-red-200"
      case "high":
        return "text-orange-600 bg-orange-50 border-orange-200"
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "low":
        return "text-blue-600 bg-blue-50 border-blue-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const getThreatIcon = (type: string) => {
    switch (type) {
      case "brute_force":
        return <Key className="h-4 w-4" />
      case "suspicious_login":
        return <Eye className="h-4 w-4" />
      case "data_breach":
        return <AlertTriangle className="h-4 w-4" />
      case "malware":
        return <Ban className="h-4 w-4" />
      case "phishing":
        return <Globe className="h-4 w-4" />
      default:
        return <Shield className="h-4 w-4" />
    }
  }

  const getComplianceStatusColor = (status: string) => {
    switch (status) {
      case "compliant":
        return "text-green-600"
      case "non_compliant":
        return "text-red-600"
      case "pending":
        return "text-yellow-600"
      default:
        return "text-gray-600"
    }
  }

  const exportAuditLogs = () => {
    const csvContent = [
      "Timestamp,Action,User,Resource,IP Address,Location,Result,Risk Score",
      ...auditLogs.map((log) =>
        [
          log.timestamp,
          log.action,
          log.user,
          log.resource,
          log.ipAddress,
          log.location,
          log.result,
          log.riskScore,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `security-audit-${format(new Date(), "yyyy-MM-dd")}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    toast({
      title: "Export Complete",
      description: "Audit logs have been exported successfully.",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Advanced Security
          </h1>
          <p className="text-muted-foreground">Monitor and manage your security posture</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-green-100 text-green-800">Security Score: {securityScore}%</Badge>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="threats">Threats</TabsTrigger>
          <TabsTrigger value="rules">Security Rules</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Threats</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {threats.filter((t) => t.status === "active").length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {threats.filter((t) => t.severity === "critical").length} critical
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Security Rules</CardTitle>
                <Shield className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {securityRules.filter((r) => r.isEnabled).length}/{securityRules.length}
                </div>
                <p className="text-xs text-muted-foreground">rules active</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Audit Events</CardTitle>
                <Activity className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{auditLogs.length}</div>
                <p className="text-xs text-muted-foreground">last 24 hours</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Compliance</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {complianceReports.filter((r) => r.status === "compliant").length}/{complianceReports.length}
                </div>
                <p className="text-xs text-muted-foreground">standards met</p>
              </CardContent>
            </Card>
          </div>

          {/* Security Score */}
          <Card>
            <CardHeader>
              <CardTitle>Security Score</CardTitle>
              <CardDescription>Overall security posture assessment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Current Score</span>
                <span className="text-2xl font-bold text-green-600">{securityScore}%</span>
              </div>
              <Progress value={securityScore} className="w-full" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Authentication</p>
                  <p className="font-medium text-green-600">95%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Access Control</p>
                  <p className="font-medium text-green-600">90%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Data Protection</p>
                  <p className="font-medium text-yellow-600">75%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Monitoring</p>
                  <p className="font-medium text-green-600">88%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Security Activity</CardTitle>
              <CardDescription>Latest security events and actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          log.result === "success"
                            ? "bg-green-500"
                            : log.result === "failure"
                              ? "bg-red-500"
                              : "bg-yellow-500"
                        }`}
                      />
                      <div>
                        <p className="font-medium">{log.action}</p>
                        <p className="text-sm text-muted-foreground">
                          {log.user} • {log.location}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">Risk: {log.riskScore}/10</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Threats Tab */}
        <TabsContent value="threats" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Security Threats</h2>
              <p className="text-muted-foreground">Monitor and respond to security threats</p>
            </div>
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          <div className="space-y-4">
            {threats.map((threat) => (
              <Card key={threat.id} className={`border-l-4 ${getSeverityColor(threat.severity)}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getThreatIcon(threat.type)}
                      <div>
                        <CardTitle className="text-lg">{threat.description}</CardTitle>
                        <CardDescription>
                          {threat.source} • {formatDistanceToNow(new Date(threat.timestamp), { addSuffix: true })}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getSeverityColor(threat.severity)}>{threat.severity.toUpperCase()}</Badge>
                      <Badge variant={threat.status === "resolved" ? "default" : "destructive"}>
                        {threat.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-muted-foreground">IP Address</p>
                      <p className="font-medium">{threat.ipAddress}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Location</p>
                      <p className="font-medium">{threat.location}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Affected Users</p>
                      <p className="font-medium">{threat.affectedUsers}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Type</p>
                      <p className="font-medium">{threat.type.replace("_", " ").toUpperCase()}</p>
                    </div>
                  </div>

                  {threat.status === "active" && (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleResolveThreat(threat.id)} disabled={isLoading}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Resolve
                      </Button>
                      <Button variant="outline" size="sm">
                        <Ban className="h-4 w-4 mr-2" />
                        Block IP
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Investigate
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Security Rules Tab */}
        <TabsContent value="rules" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Security Rules</h2>
              <p className="text-muted-foreground">Configure automated security policies</p>
            </div>
            <Button>
              <Settings className="h-4 w-4 mr-2" />
              Add Rule
            </Button>
          </div>

          <div className="grid gap-4">
            {securityRules.map((rule) => (
              <Card key={rule.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        {rule.name}
                      </CardTitle>
                      <CardDescription>{rule.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{rule.type.replace("_", " ").toUpperCase()}</Badge>
                      <Switch checked={rule.isEnabled} onCheckedChange={() => handleToggleRule(rule.id)} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Triggered</p>
                      <p className="font-medium">{rule.triggeredCount} times</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last Triggered</p>
                      <p className="font-medium">
                        {rule.lastTriggered
                          ? formatDistanceToNow(new Date(rule.lastTriggered), { addSuffix: true })
                          : "Never"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <Badge variant={rule.isEnabled ? "default" : "secondary"}>
                        {rule.isEnabled ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                    <Button variant="outline" size="sm">
                      <Activity className="h-4 w-4 mr-2" />
                      View Logs
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Audit Logs Tab */}
        <TabsContent value="audit" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Audit Logs</h2>
              <p className="text-muted-foreground">Track all security-related activities</p>
            </div>
            <Button onClick={exportAuditLogs}>
              <Download className="h-4 w-4 mr-2" />
              Export Logs
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr className="text-left">
                      <th className="p-4 font-medium">Timestamp</th>
                      <th className="p-4 font-medium">Action</th>
                      <th className="p-4 font-medium">User</th>
                      <th className="p-4 font-medium">Location</th>
                      <th className="p-4 font-medium">Result</th>
                      <th className="p-4 font-medium">Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="border-b hover:bg-muted/50">
                        <td className="p-4 text-sm">{format(new Date(log.timestamp), "MMM dd, HH:mm")}</td>
                        <td className="p-4">
                          <code className="text-sm bg-muted px-2 py-1 rounded">{log.action}</code>
                        </td>
                        <td className="p-4 text-sm">{log.user}</td>
                        <td className="p-4 text-sm">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {log.location}
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge
                            variant={
                              log.result === "success"
                                ? "default"
                                : log.result === "failure"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {log.result}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                log.riskScore <= 3
                                  ? "bg-green-500"
                                  : log.riskScore <= 6
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                              }`}
                            />
                            <span className="text-sm">{log.riskScore}/10</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Compliance Reports</h2>
            <p className="text-muted-foreground">Monitor compliance with security standards</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {complianceReports.map((report) => (
              <Card key={report.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {report.standard}
                    </CardTitle>
                    <Badge className={getComplianceStatusColor(report.status)}>
                      {report.status.replace("_", " ").toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Compliance Score</span>
                      <span className="text-lg font-bold">{report.score}%</span>
                    </div>
                    <Progress value={report.score} className="w-full" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Last Audit</p>
                      <p className="font-medium">{format(new Date(report.lastAudit), "MMM dd, yyyy")}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Next Audit</p>
                      <p className="font-medium">{format(new Date(report.nextAudit), "MMM dd, yyyy")}</p>
                    </div>
                  </div>

                  {report.issues > 0 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{report.issues} compliance issues need attention</AlertDescription>
                    </Alert>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                      <FileText className="h-4 w-4 mr-2" />
                      View Report
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
