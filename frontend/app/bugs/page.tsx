import { Calendar, Check, CheckCircle, Clock, Plus, Search, User } from "lucide-react"
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

'use client';
interface BugReport {}
  id: string
  title: string
  description: string
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  category: 'ui' | 'functionality' | 'performance' | 'security' | 'compatibility';
  reporter: string
  assignee?: string
  createdAt: Date
  updatedAt: Date
  tags: string[];
  comments: Comment[];
  stepsToReproduce: string[];
  expectedBehavior: string
  actualBehavior: string
  environment: {}
    browser: string
    os: string
    version: string
  };
  attachments?: string[];
}

interface Comment {}
  id: string
  author: string
  content: string
  createdAt: Date
}

export default function BugReports() {
  const [bugs, setBugs] = useState<BugReport[]>([]
    {}
      id: 'BUG-001',
      title: 'Video player controls not responding',
      description: 'The video player controls (play, pause, volume) become unresponsive after 5-10 minutes of playback.',
      status: 'open',
      priority: 'high',
      severity: 'major',
      category: 'functionality',
      reporter: 'user@example.com',
      assignee: 'dev@example.com',
      createdAt: new Date(Date.now() - 86400000 * 2),
      updatedAt: new Date(Date.now() - 86400000),
      tags: ['video-player', 'controls', 'ui'],
      comments: []
        {}
          id: '1',
          author: 'dev@example.com',
          content: 'I can reproduce this issue. Investigating the event listeners.',
          createdAt: new Date(Date.now() - 86400000)
        }
      ],
      stepsToReproduce: []
        'Start watching a video in a party',
        'Let it play for 5-10 minutes',
        'Try to pause or adjust volume',
        'Controls become unresponsive'
      ],
      expectedBehavior: 'Video controls should remain responsive throughout playback',
      actualBehavior: 'Controls become unresponsive after extended playback',
      environment: {}
        browser: 'Chrome 119',
        os: 'Windows 11',
        version: '1.0.0'
      }
    },
    {}
      id: 'BUG-002',
      title: 'Chat messages duplicating',
      description: 'Sometimes chat messages appear twice in the chat window.',
      status: 'in-progress',
      priority: 'medium',
      severity: 'moderate',
      category: 'functionality',
      reporter: 'test@example.com',
      assignee: 'dev2@example.com',
      createdAt: new Date(Date.now() - 86400000 * 3),
      updatedAt: new Date(Date.now() - 3600000),
      tags: ['chat', 'websocket', 'duplication'],
      comments: []
        {}
          id: '2',
          author: 'dev2@example.com',
          content: 'This seems to be related to WebSocket reconnection logic.',
          createdAt: new Date(Date.now() - 3600000)
        }
      ],
      stepsToReproduce: []
        'Join a watch party',
        'Send several messages quickly',
        'Observe chat window'
      ],
      expectedBehavior: 'Each message should appear only once',
      actualBehavior: 'Messages sometimes appear duplicated',
      environment: {}
        browser: 'Firefox 120',
        os: 'macOS 14',
        version: '1.0.0'
      }
    },
    {}
      id: 'BUG-003',
      title: 'Login page styling broken on mobile',
      description: 'Login form elements are misaligned on mobile devices.',
      status: 'resolved',
      priority: 'low',
      severity: 'minor',
      category: 'ui',
      reporter: 'mobile@example.com',
      assignee: 'designer@example.com',
      createdAt: new Date(Date.now() - 86400000 * 5),
      updatedAt: new Date(Date.now() - 86400000 * 2),
      tags: ['mobile', 'responsive', 'css'],
      comments: []
        {}
          id: '3',
          author: 'designer@example.com',
          content: 'Fixed the responsive CSS. Ready for testing.',
          createdAt: new Date(Date.now() - 86400000 * 2)
        }
      ],
      stepsToReproduce: []
        'Open login page on mobile device',
        'Observe form layout'
      ],
      expectedBehavior: 'Form should be properly aligned on mobile',
      actualBehavior: 'Form elements are misaligned',
      environment: {}
        browser: 'Safari Mobile',
        os: 'iOS 17',
        version: '1.0.0'
      }
    }
  ]);

  const [filteredBugs, setFilteredBugs] = useState(bugs);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedBug, setSelectedBug] = useState<BugReport | null>(null);
  const [showNewBugForm, setShowNewBugForm] = useState(false);

  // Filter bugs based on search and filters
  useEffect(() => {
    let filtered = bugs
    if (searchTerm) {
      filtered = filtered.filter(bug => 
        bug.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bug.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bug.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(bug => bug.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(bug => bug.priority === priorityFilter);
    }

    setFilteredBugs(filtered);
  }, [bugs, searchTerm, statusFilter, priorityFilter]);

  const getStatusColor = (status: string) => {}
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800 border-red-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {}
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {}
    switch (status) {
      case 'open': return <AlertCircle className="w-4 h-4" />;
      case 'in-progress': return <Clock className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'closed': return <CheckCircle className="w-4 h-4" />;
      default: return <Bug className="w-4 h-4" />;
    }
  };

  const getBugStats = () => {}
    const stats = { total: bugs.length,
      open: bugs.filter(b => b.status === 'open').length,
      inProgress: bugs.filter(b => b.status === 'in-progress').length,
      resolved: bugs.filter(b => b.status === 'resolved').length,
      closed: bugs.filter(b => b.status === 'closed').length,
      critical: bugs.filter(b => b.priority === 'critical').length,
      high: bugs.filter(b => b.priority === 'high').length
    };
    return stats
  };

  const stats = getBugStats();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bug Reports</h1>
          <p className="text-muted-foreground">Track and manage application issues</p>
        </div>
        <Button onClick={() => setShowNewBugForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Report Bug
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{stats.open}</p>
              <p className="text-sm text-muted-foreground">Open</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
              <p className="text-sm text-muted-foreground">Resolved</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-600">{stats.closed}</p>
              <p className="text-sm text-muted-foreground">Closed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
              <p className="text-sm text-muted-foreground">Critical</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{stats.high}</p>
              <p className="text-sm text-muted-foreground">High Priority</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="Search bugs..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bug List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Bug Reports ({filteredBugs.length})</h2>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {filteredBugs.map((bug) => (
              <Card
                key={bug.id} 
                className={`cursor-pointer transition-colors hover:bg-muted/50 ${}
                  selectedBug?.id === bug.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedBug(bug)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(bug.status)}
                      <Badge variant="outline" className={getStatusColor(bug.status)}>
                        {bug.status}
                      </Badge>
                      <Badge variant="outline" className={getPriorityColor(bug.priority)}>
                        {bug.priority}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">{bug.id}</span>
                  </div>
                  <h3 className="font-semibold mb-1">{bug.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {bug.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center space-x-1">
                        <User className="w-3 h-3" />
                        <span>{bug.reporter}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{bug.createdAt.toLocaleDateString()}</span>
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageSquare className="w-3 h-3" />
                      <span>{bug.comments.length}</span>
                    </div>
                  </div>
                  {bug.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {bug.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {bug.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{bug.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Bug Details */}
        <div>
          {selectedBug ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{selectedBug.title}</CardTitle>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="outline" className={getStatusColor(selectedBug.status)}>
                        {selectedBug.status}
                      </Badge>
                      <Badge variant="outline" className={getPriorityColor(selectedBug.priority)}>
                        {selectedBug.priority}
                      </Badge>
                      <Badge variant="outline">
                        {selectedBug.severity}
                      </Badge>
                      <Badge variant="outline">
                        {selectedBug.category}
                      </Badge>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">{selectedBug.id}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs defaultValue="details" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="reproduction">Reproduction</TabsTrigger>
                    <TabsTrigger value="comments">Comments</TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Description</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedBug.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">Reporter</h4>
                        <p className="text-sm text-muted-foreground">
                          {selectedBug.reporter}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Assignee</h4>
                        <p className="text-sm text-muted-foreground">
                          {selectedBug.assignee || 'Unassigned'}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Environment</h4>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Browser: {selectedBug.environment.browser}</p>
                        <p>OS: {selectedBug.environment.os}</p>
                        <p>Version: {selectedBug.environment.version}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedBug.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="reproduction" className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Steps to Reproduce</h4>
                      <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                        {selectedBug.stepsToReproduce.map((step, index) => (
                          <li key={index}>{step}</li>
                        ))}
                      </ol>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Expected Behavior</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedBug.expectedBehavior}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Actual Behavior</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedBug.actualBehavior}
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="comments" className="space-y-4">
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {selectedBug.comments.map((comment) => (
                        <div key={comment.id} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">{comment.author}</span>
                            <span className="text-xs text-muted-foreground">
                              {comment.createdAt.toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {comment.content}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <Textarea placeholder="Add a comment..." />
                      <Button size="sm">Add Comment</Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Bug className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select a Bug Report</h3>
                <p className="text-muted-foreground">
                  Choose a bug from the list to view details
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
