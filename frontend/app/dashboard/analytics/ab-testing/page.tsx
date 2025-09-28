import { BarChart, Eye, Play, Plus, Target, TrendingUp, User, Users, X } from "lucide-react"
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { analyticsAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

'use client';
interface ABTest {}
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'paused' | 'completed' | 'archived';
  startDate: string;
  endDate?: string;
  traffic: number; // percentage of users;
  variants: Array<{}
    id: string;
    name: string;
    traffic: number;
    description: string;
    config: Record<string, any>;
  }>;
  metrics: Array<{}
    name: string;
    type: 'conversion' | 'retention' | 'revenue' | 'engagement';
    primary: boolean;
  }>;
  results?: {}
    duration: number;
    participants: number;
    significance: number;
    confidence: number;
    winner?: string;
    variants: Array<{}
      id: string;
      conversions: number;
      participants: number;
      conversionRate: number;
      lift: number;
      significance: number;
    }>;
  };
  targeting?: {}
    userSegments: string[];
    geolocation: string[];
    deviceTypes: string[];
    newUsersOnly: boolean;
  };
}

export default function ABTestingDashboard() {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | ABTest['status']>(&apos;all&apos;);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchABTests();
  }, []);

  const fetchABTests = async () => {
    setLoading(true);
    try {
      // Fetch A/B testing data from API;
      const abTestData = await analyticsAPI.getABTestingAnalytics();
      // Transform API response to component format;
      const transformedTests: ABTest[] = abTestData.tests?.map((test: unknown) => ({}
        id: test.id,
        name: test.name,
        description: test.description,
        status: test.status,
        startDate: test.start_date,
        endDate: test.end_date,
        traffic: test.traffic_allocation,
        variants: test.variants?.map((variant: unknown) => ({}
          id: variant.id,
          name: variant.name,
          traffic: variant.traffic_allocation,
          description: variant.description,
          config: variant.config || {}
        })) || [],
        metrics: test.metrics?.map((metric: unknown) => ({}
          name: metric.name,
          type: metric.type,
          primary: metric.is_primary;
        })) || [],
        results: test.results ? {}
          duration: test.results.duration_days,
          participants: test.results.total_participants,
          significance: test.results.statistical_significance,
          confidence: test.results.confidence_level,
          winner: test.results.winning_variant,
          variants: test.results.variant_results?.map((result: unknown) => ({}
            id: result.variant_id,
            conversions: result.conversions,
            participants: result.participants,
            conversionRate: result.conversion_rate,
            lift: result.lift_percentage,
            significance: result.statistical_significance;
          })) || []
        } : undefined,
        targeting: test.targeting ? {}
          userSegments: test.targeting.user_segments || [],
          geolocation: test.targeting.geolocation || [],
          deviceTypes: test.targeting.device_types || [],
          newUsersOnly: test.targeting.new_users_only || false;
        } : undefined;
      })) || [];

      setTests(transformedTests);
    } } catch {
      console.error('Failed to fetch A/B tests:', error);
      toast({}
        title: "Error",
        description: "Failed to load A/B testing data. Please try again.",
        variant: "destructive",
      });
    } finally {}
      setLoading(false);
    }
  };

  const filteredTests = tests.filter(test => filter === &apos;all' || test.status === filter);

  const getStatusColor = (status: ABTest['status']) => {}
    switch (status) {
      case 'draft': return 'bg-gray-500';
      case 'running': return 'bg-green-500';
      case 'paused': return 'bg-yellow-500';
      case 'completed': return 'bg-blue-500';
      case 'archived': return 'bg-gray-400';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: ABTest['status']) => {}
    switch (status) {
      case 'running': return <Play className="h-4 w-4" />;
      case 'paused': return <Pause className="h-4 w-4" />;
      case 'completed': return <Square className="h-4 w-4" />;
      default: return <Beaker className="h-4 w-4" />;
    }
  };

  const startTest = (testId: string) => {}
    setTests(tests.map(test => 
      test.id === testId;
        ? { ...test, status: 'running' as const, startDate: new Date().toISOString() }
        : test;
    ));
  };

  const pauseTest = (testId: string) => {}
    setTests(tests.map(test => 
      test.id === testId;
        ? { ...test, status: 'paused' as const }
        : test;
    ));
  };

  const stopTest = (testId: string) => {}
    setTests(tests.map(test => 
      test.id === testId;
        ? {}
            ...test, 
            status: 'completed' as const, 
            endDate: new Date().toISOString() 
          }
        : test;
    ));
  };

  const generateResultsChart = (test: ABTest) => {}
    if (!test.results) return [];
    return test.results.variants.map(variant => ({}
      name: test.variants.find(v => v.id === variant.id)?.name || variant.id,
      conversionRate: variant.conversionRate,
      participants: variant.participants,
      lift: variant.lift,
    }));
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">A/B Testing Dashboard</h1>
          <p className="text-muted-foreground">Manage and analyze your experiments</p>
        </div>
        <div className="flex gap-4">
          <Select value={filter} onValueChange={(value) => setFilter(value as typeof filter)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tests</SelectItem>
              <SelectItem value="running">Running</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Test;
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New A/B Test</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="test-name">Test Name</Label>
                    <Input id="test-name" placeholder="Enter test name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="traffic">Traffic Allocation (%)</Label>
                    <Input id="traffic" type="number" placeholder="50" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Describe what you're testing..." />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancel;
                  </Button>
                  <Button onClick={() => setCreateDialogOpen(false)}>
                    Create Test;
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tests</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tests.filter(t => t.status === &apos;running&apos;).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {tests.filter(t => t.status === &apos;paused&apos;).length} paused;
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tests.reduce((sum, test) => sum + (test.results?.participants || 0), 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all tests;
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Significant Results</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tests.filter(t => t.results && t.results.significance > 95).length}
            </div>
            <p className="text-xs text-muted-foreground">
              95%+ confidence;
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Lift</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tests;
                .filter(t => t.results?.winner)
                .reduce((sum, test) => {}
                  const winner = test.results?.variants.find(v => v.id === test.results?.winner);
                  return sum + (winner?.lift || 0);
                }, 0)
                .toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              From winning variants;
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tests List */}
      <div className="space-y-4">
        {filteredTests.map((test) => (
          <Card key={test.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{test.name}</h3>
                    <Badge;
                      variant="secondary" 
                      className={`${getStatusColor(test.status)} text-white`}
                    >
                      {getStatusIcon(test.status)}
                      <span className="ml-1 capitalize">{test.status}</span>
                    </Badge>
                    {test.results?.winner && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Winner: {test.variants.find(v => v.id === test.results?.winner)?.name}
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground mb-4">{test.description}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Start Date:</span>
                      <div className="font-medium">
                        {new Date(test.startDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Traffic:</span>
                      <div className="font-medium">{test.traffic}%</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Variants:</span>
                      <div className="font-medium">{test.variants.length}</div>
                    </div>
                    {test.results && (
                      <div>
                        <span className="text-muted-foreground">Participants:</span>
                        <div className="font-medium">{test.results.participants.toLocaleString()}</div>
                      </div>
                    )}
                  </div>

                  {test.results && (
                    <div className="mt-4">
                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Confidence:</span>
                          <span className="font-medium ml-1">
                            {test.results.confidence}%
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Significance:</span>
                          <span className={`font-medium ml-1 ${}}
                            test.results.significance > 95 ? &apos;text-green-600&apos; : 
                            test.results.significance > 90 ? &apos;text-yellow-600' : 
                            'text-red-600'
                          }`}>
                            {test.results.significance.toFixed(1)}%
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Duration:</span>
                          <span className="font-medium ml-1">{test.results.duration} days</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button;
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedTest(test)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View;
                  </Button>
                  {test.status === 'draft' && (
                    <Button;
                      size="sm"
                      onClick={() => startTest(test.id)}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Start;
                    </Button>
                  )}
                  {test.status === 'running' && (
                    <>
                      <Button;
                        variant="outline"
                        size="sm"
                        onClick={() => pauseTest(test.id)}
                      >
                        <Pause className="h-4 w-4 mr-1" />
                        Pause;
                      </Button>
                      <Button;
                        variant="destructive"
                        size="sm"
                        onClick={() => stopTest(test.id)}
                      >
                        <Square className="h-4 w-4 mr-1" />
                        Stop;
                      </Button>
                    </>
                  )}
                  {test.status === 'paused' && (
                    <Button;
                      size="sm"
                      onClick={() => startTest(test.id)}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Resume;
                    </Button>
                  )}
                </div>
              </div>

              {test.results && (
                <div className="mt-6 pt-4 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Conversion Rates</h4>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={generateResultsChart(test)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar;
                            dataKey="conversionRate" 
                            fill="#2563eb"
                            name="Conversion Rate (%)"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Variant Performance</h4>
                      <div className="space-y-3">
                        {test.results.variants.map((variant) => {}
                          const variantInfo = test.variants.find(v => v.id === variant.id);
                          return (
                            <div key={variant.id} className="flex items-center justify-between p-3 border rounded">
                              <div>
                                <div className="font-medium">{variantInfo?.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {variant.conversions} / {variant.participants} 
                                  ({variant.conversionRate.toFixed(2)}%)
                                </div>
                              </div>
                              <div className="text-right">
                                {variant.lift !== 0 && (
                                  <div className={`font-medium ${}}
                                    variant.lift > 0 ? &apos;text-green-600&apos; : &apos;text-red-600'
                                  }`}>
                                    {variant.lift > 0 ? '+' : ''}{variant.lift.toFixed(1)}%
                                  </div>
                                )}
                                {variant.significance > 0 && (
                                  <div className="text-sm text-muted-foreground">
                                    {variant.significance.toFixed(1)}% confidence;
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTests.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Beaker className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No tests found</h3>
            <p className="text-muted-foreground mb-4">
              {filter === 'all' 
                ? "You haven't created any A/B tests yet." 
                : `No tests with status "${filter}".`
              }
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              Create Your First Test;
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
