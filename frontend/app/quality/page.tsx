'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock,
  Target,
  FileCheck,
  Bug,
  TestTube,
  Users,
  Zap,
  TrendingUp,
  TrendingDown,
  Activity,
  Download,
  Upload,
  Eye,
  Shield,
  Smartphone,
  Monitor,
  Globe,
  Accessibility,
  Performance,
  Search,
  Filter,
  Calendar,
  User,
  GitBranch,
  Code
} from 'lucide-react';

interface QualityMetric {
  id: string;
  name: string;
  category: 'functionality' | 'performance' | 'usability' | 'security' | 'compatibility';
  score: number;
  target: number;
  trend: 'up' | 'down' | 'stable';
  lastTested: Date;
  tests: QualityTest[];
}

interface QualityTest {
  id: string;
  name: string;
  type: 'manual' | 'automated' | 'user-testing';
  status: 'passed' | 'failed' | 'pending' | 'skipped';
  priority: 'low' | 'medium' | 'high' | 'critical';
  environment: string;
  tester: string;
  duration: number;
  issues: Issue[];
}

interface Issue {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-progress' | 'resolved';
  assignee?: string;
  createdAt: Date;
}

interface QAReport {
  id: string;
  title: string;
  version: string;
  releaseDate: Date;
  testCoverage: number;
  passRate: number;
  criticalIssues: number;
  blockerIssues: number;
  status: 'draft' | 'review' | 'approved' | 'rejected';
  approver?: string;
}

export default function QualityAssurance() {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const [qualityMetrics, setQualityMetrics] = useState<QualityMetric[]>([
    {
      id: 'functionality',
      name: 'Functionality',
      category: 'functionality',
      score: 92,
      target: 95,
      trend: 'up',
      lastTested: new Date(Date.now() - 86400000),
      tests: [
        {
          id: 'auth-flow',
          name: 'Authentication Flow',
          type: 'automated',
          status: 'passed',
          priority: 'high',
          environment: 'Production',
          tester: 'QA Bot',
          duration: 45,
          issues: []
        },
        {
          id: 'video-playback',
          name: 'Video Playback',
          type: 'manual',
          status: 'failed',
          priority: 'critical',
          environment: 'Staging',
          tester: 'Alice Johnson',
          duration: 120,
          issues: [
            {
              id: 'VID-001',
              title: 'Audio sync issues on mobile',
              description: 'Audio is out of sync with video on mobile devices',
              severity: 'high',
              status: 'open',
              assignee: 'dev@example.com',
              createdAt: new Date(Date.now() - 3600000)
            }
          ]
        }
      ]
    },
    {
      id: 'performance',
      name: 'Performance',
      category: 'performance',
      score: 88,
      target: 90,
      trend: 'stable',
      lastTested: new Date(Date.now() - 3600000),
      tests: [
        {
          id: 'load-time',
          name: 'Page Load Time',
          type: 'automated',
          status: 'passed',
          priority: 'high',
          environment: 'Production',
          tester: 'Performance Bot',
          duration: 30,
          issues: []
        },
        {
          id: 'stress-test',
          name: 'Stress Testing',
          type: 'automated',
          status: 'pending',
          priority: 'medium',
          environment: 'Load Test',
          tester: 'Load Bot',
          duration: 0,
          issues: []
        }
      ]
    },
    {
      id: 'usability',
      name: 'Usability',
      category: 'usability',
      score: 85,
      target: 85,
      trend: 'up',
      lastTested: new Date(Date.now() - 7200000),
      tests: [
        {
          id: 'user-journey',
          name: 'User Journey Testing',
          type: 'user-testing',
          status: 'passed',
          priority: 'medium',
          environment: 'Beta',
          tester: 'UX Team',
          duration: 180,
          issues: []
        }
      ]
    },
    {
      id: 'security',
      name: 'Security',
      category: 'security',
      score: 96,
      target: 98,
      trend: 'stable',
      lastTested: new Date(Date.now() - 86400000 * 2),
      tests: [
        {
          id: 'security-scan',
          name: 'Security Vulnerability Scan',
          type: 'automated',
          status: 'passed',
          priority: 'critical',
          environment: 'Production',
          tester: 'Security Bot',
          duration: 60,
          issues: []
        }
      ]
    },
    {
      id: 'compatibility',
      name: 'Compatibility',
      category: 'compatibility',
      score: 78,
      target: 85,
      trend: 'down',
      lastTested: new Date(Date.now() - 86400000 * 3),
      tests: [
        {
          id: 'browser-compat',
          name: 'Browser Compatibility',
          type: 'manual',
          status: 'failed',
          priority: 'high',
          environment: 'Cross-browser',
          tester: 'Bob Smith',
          duration: 240,
          issues: [
            {
              id: 'COMPAT-001',
              title: 'Layout issues in Safari',
              description: 'Video player controls are misaligned in Safari',
              severity: 'medium',
              status: 'in-progress',
              assignee: 'frontend@example.com',
              createdAt: new Date(Date.now() - 86400000)
            }
          ]
        }
      ]
    }
  ]);

  const [qaReports, setQaReports] = useState<QAReport[]>([
    {
      id: 'REP-001',
      title: 'Release 2.1.0 QA Report',
      version: '2.1.0',
      releaseDate: new Date(Date.now() + 86400000 * 7),
      testCoverage: 89,
      passRate: 92,
      criticalIssues: 1,
      blockerIssues: 0,
      status: 'review',
      approver: 'qa-lead@example.com'
    },
    {
      id: 'REP-002',
      title: 'Release 2.0.5 QA Report',
      version: '2.0.5',
      releaseDate: new Date(Date.now() - 86400000 * 14),
      testCoverage: 95,
      passRate: 96,
      criticalIssues: 0,
      blockerIssues: 0,
      status: 'approved',
      approver: 'qa-lead@example.com'
    }
  ]);

  const getScoreColor = (score: number, target: number) => {
    const percentage = (score / target) * 100;
    if (percentage >= 95) return 'text-green-600';
    if (percentage >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'bg-green-100 text-green-800 border-green-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'skipped': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-4 h-4" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'skipped': return <AlertTriangle className="w-4 h-4" />;
      default: return <TestTube className="w-4 h-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'functionality': return <Zap className="w-5 h-5" />;
      case 'performance': return <Activity className="w-5 h-5" />;
      case 'usability': return <Users className="w-5 h-5" />;
      case 'security': return <Shield className="w-5 h-5" />;
      case 'compatibility': return <Globe className="w-5 h-5" />;
      default: return <TestTube className="w-5 h-5" />;
    }
  };

  const overallScore = qualityMetrics.reduce((acc, metric) => acc + metric.score, 0) / qualityMetrics.length;
  const totalTests = qualityMetrics.reduce((acc, metric) => acc + metric.tests.length, 0);
  const passedTests = qualityMetrics.reduce((acc, metric) => 
    acc + metric.tests.filter(test => test.status === 'passed').length, 0
  );
  const failedTests = qualityMetrics.reduce((acc, metric) => 
    acc + metric.tests.filter(test => test.status === 'failed').length, 0
  );
  const pendingTests = qualityMetrics.reduce((acc, metric) => 
    acc + metric.tests.filter(test => test.status === 'pending').length, 0
  );

  const allIssues = qualityMetrics.flatMap(metric => 
    metric.tests.flatMap(test => test.issues)
  );

  const criticalIssues = allIssues.filter(issue => issue.severity === 'critical').length;
  const openIssues = allIssues.filter(issue => issue.status === 'open').length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quality Assurance</h1>
          <p className="text-muted-foreground">Monitor and manage software quality metrics</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <FileCheck className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overall Score</p>
                <p className={`text-3xl font-bold ${getScoreColor(overallScore, 90)}`}>
                  {overallScore.toFixed(1)}%
                </p>
              </div>
              <Target className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tests Passed</p>
                <p className="text-3xl font-bold text-green-600">{passedTests}</p>
                <p className="text-xs text-muted-foreground">of {totalTests} total</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tests Failed</p>
                <p className="text-3xl font-bold text-red-600">{failedTests}</p>
                <p className="text-xs text-muted-foreground">
                  {totalTests > 0 ? ((failedTests / totalTests) * 100).toFixed(1) : 0}% failure rate
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Critical Issues</p>
                <p className="text-3xl font-bold text-red-600">{criticalIssues}</p>
                <p className="text-xs text-muted-foreground">{openIssues} open total</p>
              </div>
              <Bug className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Tests</p>
                <p className="text-3xl font-bold text-yellow-600">{pendingTests}</p>
                <p className="text-xs text-muted-foreground">awaiting execution</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Quality Overview</TabsTrigger>
          <TabsTrigger value="tests">Test Results</TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
          <TabsTrigger value="reports">QA Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {/* Quality Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {qualityMetrics.map((metric) => (
              <Card key={metric.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(metric.category)}
                      <CardTitle>{metric.name}</CardTitle>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getTrendIcon(metric.trend)}
                      <Badge variant="outline" className={getScoreColor(metric.score, metric.target)}>
                        {metric.score}%
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>Target: {metric.target}%</span>
                    <span>Last tested: {metric.lastTested.toLocaleDateString()}</span>
                  </div>
                  
                  <Progress value={metric.score} className="h-2" />
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Recent Tests</h4>
                    {metric.tests.slice(0, 3).map((test) => (
                      <div key={test.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(test.status)}
                          <span>{test.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className={getStatusColor(test.status)}>
                            {test.status}
                          </Badge>
                          <Badge variant="outline" className={getPriorityColor(test.priority)}>
                            {test.priority}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tests">
          <div className="space-y-4">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                      <Input
                        placeholder="Search tests..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="functionality">Functionality</SelectItem>
                      <SelectItem value="performance">Performance</SelectItem>
                      <SelectItem value="usability">Usability</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="compatibility">Compatibility</SelectItem>
                    </SelectContent>
                  </Select>
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
              </CardContent>
            </Card>

            {/* Test Results */}
            <Card>
              <CardHeader>
                <CardTitle>Test Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {qualityMetrics.flatMap(metric => 
                    metric.tests.map(test => (
                      <div key={test.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(test.status)}
                            <div>
                              <h4 className="font-medium">{test.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {metric.name} • {test.environment} • {test.tester}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className={getStatusColor(test.status)}>
                              {test.status}
                            </Badge>
                            <Badge variant="outline" className={getPriorityColor(test.priority)}>
                              {test.priority}
                            </Badge>
                            <Badge variant="outline">
                              {test.type}
                            </Badge>
                          </div>
                        </div>
                        
                        {test.issues.length > 0 && (
                          <div className="mt-3 space-y-2">
                            <h5 className="font-medium text-sm">Issues Found:</h5>
                            {test.issues.map((issue) => (
                              <div key={issue.id} className="bg-red-50 dark:bg-red-900/20 border border-red-200 rounded p-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-sm">{issue.title}</span>
                                  <Badge variant="outline" className={getPriorityColor(issue.severity)}>
                                    {issue.severity}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">{issue.description}</p>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground mt-3">
                          <span>Duration: {test.duration}s</span>
                          <span>Issues: {test.issues.length}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="issues">
          <Card>
            <CardHeader>
              <CardTitle>Quality Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allIssues.map((issue) => (
                  <div key={issue.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Bug className="w-4 h-4 text-red-600" />
                        <h4 className="font-medium">{issue.title}</h4>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={getPriorityColor(issue.severity)}>
                          {issue.severity}
                        </Badge>
                        <Badge variant="outline">
                          {issue.status}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{issue.description}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Created: {issue.createdAt.toLocaleDateString()}</span>
                      <span>Assignee: {issue.assignee || 'Unassigned'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>QA Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {qaReports.map((report) => (
                  <div key={report.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{report.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          Version {report.version} • Release: {report.releaseDate.toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline" className={
                        report.status === 'approved' ? 'text-green-600' :
                        report.status === 'rejected' ? 'text-red-600' :
                        'text-yellow-600'
                      }>
                        {report.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Test Coverage</p>
                        <p className="font-semibold">{report.testCoverage}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Pass Rate</p>
                        <p className="font-semibold text-green-600">{report.passRate}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Critical Issues</p>
                        <p className="font-semibold text-red-600">{report.criticalIssues}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Blocker Issues</p>
                        <p className="font-semibold text-red-600">{report.blockerIssues}</p>
                      </div>
                    </div>
                    
                    {report.approver && (
                      <div className="flex items-center justify-between text-xs text-muted-foreground mt-3">
                        <span>Approver: {report.approver}</span>
                        <Button variant="outline" size="sm">
                          <Eye className="w-3 h-3 mr-1" />
                          View Details
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
