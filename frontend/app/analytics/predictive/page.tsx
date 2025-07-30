'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Activity,
  Brain,
  Calendar,
  Target
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';

interface PredictiveData {
  userGrowth: {
    current: number;
    predicted: number;
    confidence: number;
    trend: 'up' | 'down' | 'stable';
  };
  revenue: {
    current: number;
    predicted: number;
    confidence: number;
    trend: 'up' | 'down' | 'stable';
  };
  churn: {
    current: number;
    predicted: number;
    riskFactors: string[];
  };
  seasonality: Array<{
    month: string;
    predictedUsers: number;
    predictedRevenue: number;
    confidence: number;
  }>;
  recommendations: Array<{
    id: string;
    title: string;
    impact: 'high' | 'medium' | 'low';
    effort: 'high' | 'medium' | 'low';
    description: string;
    expectedOutcome: string;
  }>;
}

export default function PredictiveAnalytics() {
  const [data, setData] = useState<PredictiveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('3months');

  useEffect(() => {
    const fetchPredictiveData = async () => {
      try {
        // Mock data - replace with actual ML model predictions
        const mockData: PredictiveData = {
          userGrowth: {
            current: 12450,
            predicted: 18750,
            confidence: 78,
            trend: 'up'
          },
          revenue: {
            current: 45600,
            predicted: 72400,
            confidence: 82,
            trend: 'up'
          },
          churn: {
            current: 8.2,
            predicted: 6.8,
            riskFactors: [
              'Users inactive for 7+ days',
              'Low engagement in first week',
              'No social connections made',
              'Technical issues during onboarding'
            ]
          },
          seasonality: [
            { month: 'Feb', predictedUsers: 13200, predictedRevenue: 48000, confidence: 85 },
            { month: 'Mar', predictedUsers: 14100, predictedRevenue: 52000, confidence: 82 },
            { month: 'Apr', predictedUsers: 15200, predictedRevenue: 58000, confidence: 78 },
            { month: 'May', predictedUsers: 16800, predictedRevenue: 64000, confidence: 75 },
            { month: 'Jun', predictedUsers: 17900, predictedRevenue: 68000, confidence: 72 },
            { month: 'Jul', predictedUsers: 18750, predictedRevenue: 72400, confidence: 70 }
          ],
          recommendations: [
            {
              id: '1',
              title: 'Implement AI-Powered Content Recommendations',
              impact: 'high',
              effort: 'medium',
              description: 'Deploy machine learning algorithms to personalize video suggestions',
              expectedOutcome: '+23% user engagement, +15% watch time'
            },
            {
              id: '2',
              title: 'Enhanced Onboarding Flow',
              impact: 'high',
              effort: 'low',
              description: 'Streamline first-time user experience with guided tutorials',
              expectedOutcome: '-35% churn rate in first week'
            },
            {
              id: '3',
              title: 'Social Features Expansion',
              impact: 'medium',
              effort: 'high',
              description: 'Add friend discovery, activity feeds, and social challenges',
              expectedOutcome: '+28% user retention, +40% social connections'
            },
            {
              id: '4',
              title: 'Premium Features A/B Test',
              impact: 'medium',
              effort: 'low',
              description: 'Test premium feature visibility and pricing strategies',
              expectedOutcome: '+12% conversion rate to premium'
            }
          ]
        };
        
        setData(mockData);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch predictive data:', error);
        setLoading(false);
      }
    };

    fetchPredictiveData();
  }, [timeframe]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Predictive Analytics</h1>
          <p className="text-muted-foreground">AI-powered forecasts and strategic recommendations</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">1 Month</SelectItem>
              <SelectItem value="3months">3 Months</SelectItem>
              <SelectItem value="6months">6 Months</SelectItem>
              <SelectItem value="1year">1 Year</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant="outline" className="text-purple-600 border-purple-200">
            <Brain className="w-3 h-3 mr-1" />
            ML Powered
          </Badge>
        </div>
      </div>

      {/* Key Predictions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="font-medium">User Growth</span>
              </div>
              {data.userGrowth.trend === 'up' ? (
                <TrendingUp className="w-5 h-5 text-green-500" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-500" />
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Current</span>
                <span className="font-medium">{data.userGrowth.current.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Predicted</span>
                <span className="font-bold text-blue-600">{data.userGrowth.predicted.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Confidence</span>
                <Badge variant="outline">{data.userGrowth.confidence}%</Badge>
              </div>
            </div>

            <div className="mt-4 text-sm text-green-600">
              +{Math.round(((data.userGrowth.predicted - data.userGrowth.current) / data.userGrowth.current) * 100)}% growth expected
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span className="font-medium">Revenue</span>
              </div>
              {data.revenue.trend === 'up' ? (
                <TrendingUp className="w-5 h-5 text-green-500" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-500" />
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Current</span>
                <span className="font-medium">${data.revenue.current.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Predicted</span>
                <span className="font-bold text-green-600">${data.revenue.predicted.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Confidence</span>
                <Badge variant="outline">{data.revenue.confidence}%</Badge>
              </div>
            </div>

            <div className="mt-4 text-sm text-green-600">
              +{Math.round(((data.revenue.predicted - data.revenue.current) / data.revenue.current) * 100)}% revenue growth
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-orange-600" />
                <span className="font-medium">Churn Risk</span>
              </div>
              <TrendingDown className="w-5 h-5 text-green-500" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Current Rate</span>
                <span className="font-medium">{data.churn.current}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Predicted Rate</span>
                <span className="font-bold text-green-600">{data.churn.predicted}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Risk Factors</span>
                <Badge variant="outline">{data.churn.riskFactors.length}</Badge>
              </div>
            </div>

            <div className="mt-4 text-sm text-green-600">
              -{(data.churn.current - data.churn.predicted).toFixed(1)}% improvement expected
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Forecast Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>6-Month Forecast</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.seasonality}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="users" orientation="left" />
                <YAxis yAxisId="revenue" orientation="right" />
                <Area 
                  yAxisId="users"
                  type="monotone" 
                  dataKey="predictedUsers" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.3}
                />
                <Line 
                  yAxisId="revenue"
                  type="monotone" 
                  dataKey="predictedRevenue" 
                  stroke="#10b981" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Risk Factors & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Churn Risk Factors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.churn.riskFactors.map((factor, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm">{factor}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Strategic Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recommendations.slice(0, 2).map((rec) => (
                <div key={rec.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm">{rec.title}</h4>
                    <div className="flex space-x-1">
                      <Badge variant="outline" className={getImpactColor(rec.impact)}>
                        {rec.impact} impact
                      </Badge>
                      <Badge variant="outline" className={getEffortColor(rec.effort)}>
                        {rec.effort} effort
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{rec.description}</p>
                  <div className="flex items-center text-xs text-green-600">
                    <Target className="w-3 h-3 mr-1" />
                    {rec.expectedOutcome}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* All Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Strategic Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.recommendations.map((rec) => (
              <div key={rec.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-medium">{rec.title}</h4>
                  <div className="flex space-x-1">
                    <Badge variant="outline" className={getImpactColor(rec.impact)}>
                      {rec.impact}
                    </Badge>
                    <Badge variant="outline" className={getEffortColor(rec.effort)}>
                      {rec.effort}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>
                <div className="flex items-center text-sm text-green-600">
                  <Target className="w-4 h-4 mr-2" />
                  {rec.expectedOutcome}
                </div>
                <Button size="sm" className="mt-3 w-full">
                  View Implementation Plan
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
