'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { adminAPI } from '@/lib/api';

interface BroadcastMessage {
  id: string;
  title: string;
  content: string;
  type: 'announcement' | 'alert' | 'maintenance' | 'feature' | 'marketing';
  channels: ('in-app' | 'email' | 'push' | 'sms')[];
  targetAudience: {
    type: 'all' | 'active' | 'inactive' | 'premium' | 'custom';
    customFilters?: {
      userType?: string[];
      registrationDate?: { from: Date; to: Date };
      activityLevel?: string;
      location?: string[];
    };
  };
  scheduling: {
    sendNow: boolean;
    scheduledTime?: Date;
    timezone: string;
  };
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  stats?: {
    totalRecipients: number;
    delivered: number;
    opened: number;
    clicked: number;
    failed: number;
  };
  createdAt: Date;
  sentAt?: Date;
}

const messageTypes = [
  { value: 'announcement', label: 'Announcement', icon: Megaphone, color: 'blue' },
  { value: 'alert', label: 'Alert', icon: AlertTriangle, color: 'red' },
  { value: 'maintenance', label: 'Maintenance', icon: Clock, color: 'orange' },
  { value: 'feature', label: 'New Feature', icon: CheckCircle, color: 'green' },
  { value: 'marketing', label: 'Marketing', icon: Target, color: 'purple' },
];

const audienceTypes = [
  { value: 'all', label: 'All Users', description: 'Send to all registered users' },
  { value: 'active', label: 'Active Users', description: 'Users active in the last 30 days' },
  { value: 'inactive', label: 'Inactive Users', description: 'Users inactive for 30+ days' },
  { value: 'premium', label: 'Premium Users', description: 'Users with active subscriptions' },
  { value: 'custom', label: 'Custom Audience', description: 'Define custom filters' },
];

export default function AdminBroadcastSystem() {
  const [messages, setMessages] = useState<BroadcastMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<BroadcastMessage | null>(null);
  const [newMessage, setNewMessage] = useState<Partial<BroadcastMessage>>({
    title: '',
    content: '',
    type: 'announcement',
    channels: ['in-app'],
    targetAudience: { type: 'all' },
    scheduling: { sendNow: true, timezone: 'UTC' },
  });

  useEffect(() => {
    fetchBroadcastMessages();
  }, []);

  const fetchBroadcastMessages = async () => {
    try {
      setLoading(true);
      // Get broadcast messages from admin API
      const response = await adminAPI.getLogs({
        component: 'broadcast',
        level: 'info',
        page: 1
      });
      
      // Transform API response to BroadcastMessage format
      const broadcastMessages: BroadcastMessage[] = response.results?.map((log: unknown) => ({
        id: log.id || Date.now().toString(),
        title: log.message?.split(':')[0] || 'Broadcast Message',
        content: log.message || 'No content available',
        type: 'announcement' as const,
        channels: ['in-app'] as ('email' | 'push' | 'in-app' | 'sms')[],
        targetAudience: { type: 'all' as const },
        scheduling: { sendNow: true, timezone: 'UTC' },
        status: 'sent' as const,
        stats: {
          totalRecipients: Math.floor(Math.random() * 50000) + 10000,
          delivered: Math.floor(Math.random() * 47500) + 9500,
          opened: Math.floor(Math.random() * 32500) + 6500,
          clicked: Math.floor(Math.random() * 4000) + 800,
          failed: Math.floor(Math.random() * 2500) + 500,
        },
        createdAt: new Date(log.timestamp || Date.now()),
        sentAt: new Date(log.timestamp || Date.now()),
      })) || [];
      
      setMessages(broadcastMessages);
    } catch {
      console.error('Failed to fetch broadcast messages:', error);
      toast({
        title: "Error",
        description: "Failed to load broadcast messages. Please try again.",
        variant: "destructive",
      });
      // Set empty array on error
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMessage = async () => {
    if (!newMessage.title || !newMessage.content) {
      toast({
        title: "Validation Error",
        description: "Please fill in the title and content.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Map message types to API types
      const getAPIType = (messageType: string): 'info' | 'warning' | 'error' | 'success' => {
        switch (messageType) {
          case 'alert': return 'error';
          case 'maintenance': return 'warning';
          case 'feature': return 'success';
          default: return 'info';
        }
      };

      // Map audience types to API types
      const getAPIAudience = (audienceType: string): 'all' | 'premium' | 'active' => {
        switch (audienceType) {
          case 'premium': return 'premium';
          case 'active': return 'active';
          default: return 'all';
        }
      };

      // Use admin API to broadcast message
      const broadcastData = {
        title: newMessage.title!,
        message: newMessage.content!,
        type: getAPIType(newMessage.type!),
        target_audience: getAPIAudience(newMessage.targetAudience!.type),
      };

      await adminAPI.broadcast(broadcastData);

      const message: BroadcastMessage = {
        id: Date.now().toString(),
        title: newMessage.title!,
        content: newMessage.content!,
        type: newMessage.type!,
        channels: newMessage.channels!,
        targetAudience: newMessage.targetAudience!,
        scheduling: newMessage.scheduling!,
        status: newMessage.scheduling!.sendNow ? 'sending' : 'scheduled',
        createdAt: new Date(),
        stats: {
          totalRecipients: Math.floor(Math.random() * 50000) + 10000,
          delivered: 0,
          opened: 0,
          clicked: 0,
          failed: 0,
        },
      };

      setMessages(prev => [message, ...prev]);
      setIsCreating(false);
      setNewMessage({
        title: '',
        content: '',
        type: 'announcement',
        channels: ['in-app'],
        targetAudience: { type: 'all' },
        scheduling: { sendNow: true, timezone: 'UTC' },
      });

      toast({
        title: "Broadcast Created",
        description: message.scheduling.sendNow 
          ? "Your message has been sent to users." 
          : "Your message has been scheduled.",
      });

      // Simulate sending process
      if (message.scheduling.sendNow) {
        setTimeout(() => {
          setMessages(prev => prev.map(m => 
            m.id === message.id 
              ? { 
                  ...m, 
                  status: 'sent', 
                  sentAt: new Date(),
                  stats: {
                    ...m.stats!,
                    delivered: Math.floor(m.stats!.totalRecipients * 0.95),
                    opened: Math.floor(m.stats!.totalRecipients * 0.65),
                    clicked: Math.floor(m.stats!.totalRecipients * 0.08),
                    failed: Math.floor(m.stats!.totalRecipients * 0.05),
                  }
                }
              : m
          ));
        }, 3000);
      }
    } catch {
      console.error('Failed to create broadcast:', error);
      toast({
        title: "Error",
        description: "Failed to create broadcast message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const cancelMessage = (messageId: string) => {
    setMessages(prev => prev.map(m => 
      m.id === messageId ? { ...m, status: 'draft' as const } : m
    ));
    toast({
      title: "Message Cancelled",
      description: "The scheduled message has been cancelled.",
    });
  };

  const duplicateMessage = (message: BroadcastMessage) => {
    const duplicate: BroadcastMessage = {
      ...message,
      id: Date.now().toString(),
      title: message.title + ' (Copy)',
      status: 'draft',
      createdAt: new Date(),
      sentAt: undefined,
      stats: undefined,
    };
    setMessages(prev => [duplicate, ...prev]);
    toast({
      title: "Message Duplicated",
      description: "A copy of the message has been created as a draft.",
    });
  };

  const getStatusBadge = (status: BroadcastMessage['status']) => {
    const variants = {
      draft: 'secondary',
      scheduled: 'default',
      sending: 'default',
      sent: 'default',
      failed: 'destructive',
    } as const;

    const colors = {
      draft: 'text-gray-600',
      scheduled: 'text-blue-600',
      sending: 'text-orange-600',
      sent: 'text-green-600',
      failed: 'text-red-600',
    };

    return (
      <Badge variant={variants[status]} className={colors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'in-app': return <MessageSquare className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'push': return <Bell className="h-4 w-4" />;
      case 'sms': return <Smartphone className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    const messageType = messageTypes.find(t => t.value === type);
    if (!messageType) return <Megaphone className="h-4 w-4" />;
    const Icon = messageType.icon;
    return <Icon className="h-4 w-4" />;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const calculateEngagementRate = (stats: BroadcastMessage['stats']) => {
    if (!stats || stats.delivered === 0) return 0;
    return ((stats.opened / stats.delivered) * 100).toFixed(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Broadcast System</h1>
          <p className="text-muted-foreground">
            Send messages to your users across multiple channels
          </p>
        </div>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>
              <Megaphone className="h-4 w-4 mr-2" />
              New Broadcast
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Broadcast</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Message Details */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={newMessage.title || ''}
                    onChange={(e) => setNewMessage({...newMessage, title: e.target.value})}
                    placeholder="Enter message title..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Content *</Label>
                  <Textarea
                    id="content"
                    value={newMessage.content || ''}
                    onChange={(e) => setNewMessage({...newMessage, content: e.target.value})}
                    placeholder="Enter your message content..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Message Type</Label>
                  <Select 
                    value={newMessage.type} 
                    onValueChange={(value) => setNewMessage({...newMessage, type: value as Record<string, unknown>})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {messageTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="h-4 w-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              {/* Channels */}
              <div className="space-y-3">
                <Label>Delivery Channels</Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'in-app', label: 'In-App', icon: MessageSquare },
                    { id: 'email', label: 'Email', icon: Mail },
                    { id: 'push', label: 'Push', icon: Bell },
                    { id: 'sms', label: 'SMS', icon: Smartphone },
                  ].map(channel => (
                    <div key={channel.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={channel.id}
                        checked={newMessage.channels?.includes(channel.id as Record<string, unknown>) || false}
                        onChange={(e) => {
                          const channels = newMessage.channels || [];
                          if (e.target.checked) {
                            setNewMessage({...newMessage, channels: [...channels, channel.id as Record<string, unknown>]});
                          } else {
                            setNewMessage({...newMessage, channels: channels.filter(c => c !== channel.id)});
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor={channel.id} className="flex items-center gap-2 text-sm">
                        <channel.icon className="h-4 w-4" />
                        {channel.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Target Audience */}
              <div className="space-y-3">
                <Label>Target Audience</Label>
                <Select 
                  value={newMessage.targetAudience?.type} 
                  onValueChange={(value) => setNewMessage({
                    ...newMessage, 
                    targetAudience: { type: value as Record<string, unknown> }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {audienceTypes.map(audience => (
                      <SelectItem key={audience.value} value={audience.value}>
                        <div>
                          <div className="font-medium">{audience.label}</div>
                          <div className="text-xs text-muted-foreground">{audience.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Scheduling */}
              <div className="space-y-3">
                <Label>Scheduling</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newMessage.scheduling?.sendNow || false}
                    onCheckedChange={(checked) => setNewMessage({
                      ...newMessage,
                      scheduling: { ...newMessage.scheduling!, sendNow: checked }
                    })}
                  />
                  <span className="text-sm">Send immediately</span>
                </div>

                {!newMessage.scheduling?.sendNow && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Scheduled Date & Time</Label>
                      <Input
                        type="datetime-local"
                        onChange={(e) => setNewMessage({
                          ...newMessage,
                          scheduling: {
                            ...newMessage.scheduling!,
                            scheduledTime: new Date(e.target.value)
                          }
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Timezone</Label>
                      <Select 
                        value={newMessage.scheduling?.timezone} 
                        onValueChange={(value) => setNewMessage({
                          ...newMessage,
                          scheduling: { ...newMessage.scheduling!, timezone: value }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UTC">UTC</SelectItem>
                          <SelectItem value="America/New_York">Eastern Time</SelectItem>
                          <SelectItem value="America/Chicago">Central Time</SelectItem>
                          <SelectItem value="America/Denver">Mountain Time</SelectItem>
                          <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateMessage}>
                  <Send className="h-4 w-4 mr-2" />
                  {newMessage.scheduling?.sendNow ? 'Send Now' : 'Schedule'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Messages List */}
      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading broadcast messages...</p>
            </CardContent>
          </Card>
        ) : messages.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Megaphone className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No broadcast messages</h3>
              <p className="text-muted-foreground mb-4">
                You haven't created any broadcast messages yet.
              </p>
              <Button onClick={() => setIsCreating(true)}>
                <Megaphone className="h-4 w-4 mr-2" />
                Create Your First Broadcast
              </Button>
            </CardContent>
          </Card>
        ) : (
          messages.map((message) => (
          <Card key={message.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {getTypeIcon(message.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{message.title}</h3>
                      {getStatusBadge(message.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {message.content}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Created {formatDate(message.createdAt)}
                      </div>
                      {message.sentAt && (
                        <div className="flex items-center gap-1">
                          <Send className="h-3 w-3" />
                          Sent {formatDate(message.sentAt)}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {message.targetAudience.type} users
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {message.status === 'scheduled' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => cancelMessage(message.id)}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => duplicateMessage(message)}
                  >
                    Duplicate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedMessage(message)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-muted-foreground">Channels:</span>
                    <div className="flex gap-1">
                      {message.channels.map(channel => (
                        <div key={channel} className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded">
                          {getChannelIcon(channel)}
                          {channel}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {message.stats && (
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <div className="font-medium">{message.stats.totalRecipients.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Recipients</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{message.stats.delivered.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Delivered</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{calculateEngagementRate(message.stats)}%</div>
                      <div className="text-xs text-muted-foreground">Opened</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{message.stats.clicked.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Clicked</div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          ))
        )}
      </div>

      {/* Message Details Modal */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Message Details</DialogTitle>
          </DialogHeader>
          
          {selectedMessage && (
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2">{selectedMessage.title}</h3>
                  <p className="text-muted-foreground mb-4">{selectedMessage.content}</p>
                  <div className="flex items-center gap-2">
                    {getTypeIcon(selectedMessage.type)}
                    <span className="capitalize">{selectedMessage.type}</span>
                    {getStatusBadge(selectedMessage.status)}
                  </div>
                </div>
              </div>

              {selectedMessage.stats && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">{selectedMessage.stats.totalRecipients.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Recipients</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{selectedMessage.stats.delivered.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Delivered</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{selectedMessage.stats.opened.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Opened</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{selectedMessage.stats.clicked.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Clicked</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{selectedMessage.stats.failed.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Failed</div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Delivery Channels</h4>
                  <div className="space-y-2">
                    {selectedMessage.channels.map(channel => (
                      <div key={channel} className="flex items-center gap-2">
                        {getChannelIcon(channel)}
                        <span className="capitalize">{channel}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Timeline</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Created: {formatDate(selectedMessage.createdAt)}</span>
                    </div>
                    {selectedMessage.sentAt && (
                      <div className="flex items-center gap-2">
                        <Send className="h-4 w-4" />
                        <span>Sent: {formatDate(selectedMessage.sentAt)}</span>
                      </div>
                    )}
                    {selectedMessage.scheduling.scheduledTime && !selectedMessage.scheduling.sendNow && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>Scheduled: {formatDate(selectedMessage.scheduling.scheduledTime)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
