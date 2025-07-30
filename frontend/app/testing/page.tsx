'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  Bug,
  TestTube,
  FileText,
  Activity
} from 'lucide-react';

interface TestSuite {
  id: string;
  name: string;
  description: string;
  tests: Test[];
  status: 'idle' | 'running' | 'completed' | 'failed';
  duration?: number;
}

interface Test {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
  duration?: number;
  error?: string;
  logs?: string[];
}

export default function TestingDashboard() {
  const [testSuites, setTestSuites] = useState<TestSuite[]>([
    {
      id: 'unit',
      name: 'Unit Tests',
      description: 'Component and function unit tests',
      status: 'idle',
      tests: [
        {
          id: 'auth-component',
          name: 'Authentication Component',
          description: 'Tests login, logout, and session management',
          status: 'pending'
        },
        {
          id: 'video-player',
          name: 'Video Player Component',
          description: 'Tests video playback, controls, and events',
          status: 'pending'
        },
        {
          id: 'chat-system',
          name: 'Chat System',
          description: 'Tests message sending, receiving, and moderation',
          status: 'pending'
        },
        {
          id: 'party-management',
          name: 'Party Management',
          description: 'Tests party creation, joining, and management',
          status: 'pending'
        }
      ]
    },
    {
      id: 'integration',
      name: 'Integration Tests',
      description: 'API and service integration tests',
      status: 'idle',
      tests: [
        {
          id: 'auth-api',
          name: 'Authentication API',
          description: 'Tests authentication endpoints and flow',
          status: 'pending'
        },
        {
          id: 'video-api',
          name: 'Video Management API',
          description: 'Tests video upload, processing, and retrieval',
          status: 'pending'
        },
        {
          id: 'party-api',
          name: 'Party Management API',
          description: 'Tests party CRUD operations and real-time updates',
          status: 'pending'
        },
        {
          id: 'websocket-connection',
          name: 'WebSocket Connection',
          description: 'Tests real-time communication features',
          status: 'pending'
        }
      ]
    },
    {
      id: 'e2e',
      name: 'End-to-End Tests',
      description: 'Full user journey tests',
      status: 'idle',
      tests: [
        {
          id: 'user-registration',
          name: 'User Registration Flow',
          description: 'Complete user registration and verification process',
          status: 'pending'
        },
        {
          id: 'create-watch-party',
          name: 'Create Watch Party',
          description: 'Create party, invite users, and start watching',
          status: 'pending'
        },
        {
          id: 'video-streaming',
          name: 'Video Streaming Experience',
          description: 'Upload video, create party, and stream content',
          status: 'pending'
        },
        {
          id: 'chat-interaction',
          name: 'Chat Interaction',
          description: 'Send messages, reactions, and moderation actions',
          status: 'pending'
        }
      ]
    }
  ]);
  
  const [runningTests, setRunningTests] = useState<Set<string>>(new Set());
  const [testResults, setTestResults] = useState<Record<string, { passed: number; failed: number; total: number }>>({});

  const runTestSuite = async (suiteId: string) => {
    const suite = testSuites.find(s => s.id === suiteId);
    if (!suite) return;

    setTestSuites(prev => prev.map(s => 
      s.id === suiteId ? { ...s, status: 'running' } : s
    ));

    setRunningTests(prev => new Set([...prev, suiteId]));

    const startTime = Date.now();

    // Reset all tests to pending
    setTestSuites(prev => prev.map(s => 
      s.id === suiteId ? {
        ...s,
        tests: s.tests.map(t => ({ ...t, status: 'pending' as const }))
      } : s
    ));

    // Run tests sequentially
    for (let i = 0; i < suite.tests.length; i++) {
      const test = suite.tests[i];
      
      // Mark test as running
      setTestSuites(prev => prev.map(s => 
        s.id === suiteId ? {
          ...s,
          tests: s.tests.map(t => 
            t.id === test.id ? { ...t, status: 'running' } : t
          )
        } : s
      ));

      // Simulate test execution
      await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));

      // Random test result (90% pass rate)
      const passed = Math.random() > 0.1;
      const testDuration = Math.floor(Math.random() * 1000 + 500);

      setTestSuites(prev => prev.map(s => 
        s.id === suiteId ? {
          ...s,
          tests: s.tests.map(t => 
            t.id === test.id ? {
              ...t,
              status: passed ? 'passed' : 'failed',
              duration: testDuration,
              error: passed ? undefined : 'Test assertion failed: Expected value to be truthy',
              logs: [
                `Starting test: ${test.name}`,
                `Running test cases...`,
                passed ? 'All assertions passed' : 'Assertion failed at line 42',
                `Test completed in ${testDuration}ms`
              ]
            } : t
          )
        } : s
      ));
    }

    const endTime = Date.now();
    const duration = endTime - startTime;
    
    const updatedSuite = testSuites.find(s => s.id === suiteId);
    if (updatedSuite) {
      const passed = updatedSuite.tests.filter(t => t.status === 'passed').length;
      const failed = updatedSuite.tests.filter(t => t.status === 'failed').length;
      const total = updatedSuite.tests.length;
      
      setTestResults(prev => ({ ...prev, [suiteId]: { passed, failed, total } }));
      
      setTestSuites(prev => prev.map(s => 
        s.id === suiteId ? {
          ...s,
          status: failed > 0 ? 'failed' : 'completed',
          duration
        } : s
      ));
    }

    setRunningTests(prev => {
      const newSet = new Set(prev);
      newSet.delete(suiteId);
      return newSet;
    });
  };

  const runAllTests = async () => {
    for (const suite of testSuites) {
      await runTestSuite(suite.id);
    }
  };

  const resetTests = () => {
    setTestSuites(prev => prev.map(suite => ({
      ...suite,
      status: 'idle' as const,
      duration: undefined,
      tests: suite.tests.map(test => ({
        ...test,
        status: 'pending' as const,
        duration: undefined,
        error: undefined,
        logs: undefined
      }))
    })));
    setTestResults({});
    setRunningTests(new Set());
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'running': return <Activity className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'skipped': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getSuiteStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'running': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const totalTests = testSuites.reduce((acc, suite) => acc + suite.tests.length, 0);
  const passedTests = Object.values(testResults).reduce((acc, result) => acc + result.passed, 0);
  const failedTests = Object.values(testResults).reduce((acc, result) => acc + result.failed, 0);
  const completedTests = passedTests + failedTests;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Testing Dashboard</h1>
          <p className="text-muted-foreground">Run and monitor automated tests</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={resetTests}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button onClick={runAllTests} disabled={runningTests.size > 0}>
            <Play className="w-4 h-4 mr-2" />
            Run All Tests
          </Button>
        </div>
      </div>

      {/* Test Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tests</p>
                <p className="text-3xl font-bold">{totalTests}</p>
              </div>
              <TestTube className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Passed</p>
                <p className="text-3xl font-bold text-green-600">{passedTests}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Failed</p>
                <p className="text-3xl font-bold text-red-600">{failedTests}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Coverage</p>
                <p className="text-3xl font-bold">
                  {totalTests > 0 ? Math.round((completedTests / totalTests) * 100) : 0}%
                </p>
              </div>
              <Activity className="w-8 h-8 text-purple-600" />
            </div>
            {totalTests > 0 && (
              <Progress value={(completedTests / totalTests) * 100} className="mt-2 h-2" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Test Suites */}
      <Tabs defaultValue="suites" className="space-y-6">
        <TabsList>
          <TabsTrigger value="suites">Test Suites</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="suites" className="space-y-4">
          {testSuites.map((suite) => (
            <Card key={suite.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <TestTube className="w-5 h-5 text-blue-600" />
                    <div>
                      <CardTitle className="text-lg">{suite.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{suite.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className={getSuiteStatusColor(suite.status)}>
                      {suite.status}
                    </Badge>
                    {suite.duration && (
                      <Badge variant="outline">
                        {Math.round(suite.duration / 1000)}s
                      </Badge>
                    )}
                    <Button
                      size="sm"
                      onClick={() => runTestSuite(suite.id)}
                      disabled={runningTests.has(suite.id)}
                    >
                      {runningTests.has(suite.id) ? (
                        <Pause className="w-4 h-4 mr-2" />
                      ) : (
                        <Play className="w-4 h-4 mr-2" />
                      )}
                      {runningTests.has(suite.id) ? 'Running' : 'Run'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {suite.tests.map((test) => (
                    <div key={test.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(test.status)}
                        <div>
                          <p className="font-medium">{test.name}</p>
                          <p className="text-sm text-muted-foreground">{test.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {test.duration && (
                          <Badge variant="outline">{test.duration}ms</Badge>
                        )}
                        {test.error && (
                          <Badge variant="outline" className="text-red-600 border-red-200">
                            <Bug className="w-3 h-3 mr-1" />
                            Error
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Results Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(testResults).map(([suiteId, result]) => {
                  const suite = testSuites.find(s => s.id === suiteId);
                  if (!suite) return null;
                  
                  return (
                    <div key={suiteId} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium">{suite.name}</h3>
                        <Badge variant="outline" className={getSuiteStatusColor(suite.status)}>
                          {result.passed}/{result.total} passed
                        </Badge>
                      </div>
                      <Progress 
                        value={(result.passed / result.total) * 100} 
                        className="h-2"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground mt-2">
                        <span>{result.passed} passed</span>
                        <span>{result.failed} failed</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Test Logs</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {testSuites.flatMap(suite => 
                  suite.tests.filter(test => test.logs).map(test => (
                    <div key={test.id} className="border rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        {getStatusIcon(test.status)}
                        <h4 className="font-medium">{test.name}</h4>
                        {test.duration && (
                          <Badge variant="outline">{test.duration}ms</Badge>
                        )}
                      </div>
                      <div className="bg-gray-100 dark:bg-gray-800 rounded p-3 text-sm font-mono">
                        {test.logs?.map((log, index) => (
                          <div key={index} className="text-xs">
                            <span className="text-muted-foreground mr-2">
                              [{new Date().toLocaleTimeString()}]
                            </span>
                            {log}
                          </div>
                        ))}
                        {test.error && (
                          <div className="text-red-600 text-xs mt-2">
                            ERROR: {test.error}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
