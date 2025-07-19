'use client'

import { useState, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { 
  MessageSquare, 
  Phone, 
  Mail, 
  FileText, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Upload,
  X
} from 'lucide-react'

interface SupportTicket {
  id: string
  subject: string
  status: 'open' | 'in-progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  createdAt: string
  lastUpdate: string
  category: string
}

const mockTickets: SupportTicket[] = [
  {
    id: 'T-001',
    subject: 'Video sync issues during watch party',
    status: 'in-progress',
    priority: 'high',
    createdAt: '2024-01-20T10:30:00Z',
    lastUpdate: '2024-01-20T14:45:00Z',
    category: 'Technical Issue'
  },
  {
    id: 'T-002', 
    subject: 'Billing question about premium upgrade',
    status: 'resolved',
    priority: 'medium',
    createdAt: '2024-01-19T09:15:00Z',
    lastUpdate: '2024-01-19T16:20:00Z',
    category: 'Billing'
  }
]

const contactOptions = [
  {
    icon: MessageSquare,
    title: 'Live Chat',
    description: 'Chat with our support team',
    action: 'Start Chat',
    available: true
  },
  {
    icon: Mail,
    title: 'Email Support',
    description: 'Send us an email',
    action: 'Send Email',
    available: true
  },
  {
    icon: Phone,
    title: 'Phone Support',
    description: 'Call our support line',
    action: 'Call Now',
    available: false
  }
]

export function SupportCenter() {
  const [activeTab, setActiveTab] = useState<'tickets' | 'new' | 'contact'>('tickets')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const [newTicket, setNewTicket] = useState({
    subject: '',
    category: 'general',
    priority: 'medium',
    description: ''
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800'
      case 'in-progress': return 'bg-yellow-100 text-yellow-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800'
      case 'medium': return 'bg-blue-100 text-blue-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'urgent': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setAttachedFiles(prev => [...prev, ...files])
  }

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast({
        title: 'Support ticket created',
        description: 'We\'ve received your request and will respond within 24 hours.'
      })

      // Reset form
      setNewTicket({ subject: '', category: 'general', priority: 'medium', description: '' })
      setAttachedFiles([])
      setActiveTab('tickets')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create support ticket. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex space-x-1 bg-secondary p-1 rounded-lg">
        <Button
          variant={activeTab === 'tickets' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('tickets')}
          className="flex-1"
        >
          <FileText className="h-4 w-4 mr-2" />
          My Tickets
        </Button>
        <Button
          variant={activeTab === 'new' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('new')}
          className="flex-1"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          New Ticket
        </Button>
        <Button
          variant={activeTab === 'contact' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('contact')}
          className="flex-1"
        >
          <Phone className="h-4 w-4 mr-2" />
          Contact Options
        </Button>
      </div>

      {/* Tickets Tab */}
      {activeTab === 'tickets' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">My Support Tickets</h2>
          </div>

          {mockTickets.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No Support Tickets</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't created any support tickets yet.
                </p>
                <Button onClick={() => setActiveTab('new')}>
                  Create Your First Ticket
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {mockTickets.map((ticket) => (
                <Card key={ticket.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-foreground">#{ticket.id}</span>
                        <Badge className={getStatusColor(ticket.status)}>
                          {ticket.status.replace('-', ' ')}
                        </Badge>
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <h3 className="font-medium text-foreground mb-2">{ticket.subject}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{ticket.category}</p>
                    
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      Last updated: {new Date(ticket.lastUpdate).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* New Ticket Tab */}
      {activeTab === 'new' && (
        <Card>
          <CardContent className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-foreground mb-2">Create Support Ticket</h2>
              <p className="text-muted-foreground">
                Describe your issue and we'll get back to you as soon as possible.
              </p>
            </div>

            <form onSubmit={handleSubmitTicket} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Category</label>
                  <select 
                    className="w-full p-2 border border-border rounded-md bg-background"
                    value={newTicket.category}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, category: e.target.value }))}
                  >
                    <option value="general">General Question</option>
                    <option value="technical">Technical Issue</option>
                    <option value="billing">Billing & Payments</option>
                    <option value="account">Account Management</option>
                    <option value="feature">Feature Request</option>
                    <option value="bug">Bug Report</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Priority</label>
                  <select 
                    className="w-full p-2 border border-border rounded-md bg-background"
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, priority: e.target.value }))}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Subject</label>
                <Input
                  placeholder="Brief description of your issue"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, subject: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Description</label>
                <Textarea
                  placeholder="Please provide detailed information about your issue..."
                  value={newTicket.description}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                  className="min-h-[120px]"
                  required
                />
              </div>

              {/* File Attachments */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Attachments</label>
                <div className="border-2 border-dashed border-border rounded-lg p-4">
                  <div className="text-center">
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Choose Files
                    </Button>
                    <p className="text-sm text-muted-foreground mt-2">
                      Upload screenshots or relevant files (Max 10MB each)
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                    onChange={handleFileUpload}
                  />
                </div>
                
                {attachedFiles.length > 0 && (
                  <div className="space-y-2 mt-3">
                    {attachedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-secondary p-2 rounded">
                        <span className="text-sm text-foreground">{file.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? 'Creating Ticket...' : 'Create Support Ticket'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Contact Options Tab */}
      {activeTab === 'contact' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {contactOptions.map((option, index) => (
            <Card key={index}>
              <CardContent className="p-6 text-center">
                <div className={`w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4 ${
                  option.available ? 'bg-primary/10' : 'bg-gray-100'
                }`}>
                  <option.icon className={`h-8 w-8 ${
                    option.available ? 'text-primary' : 'text-gray-400'
                  }`} />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{option.title}</h3>
                <p className="text-muted-foreground mb-4">{option.description}</p>
                <Button 
                  disabled={!option.available}
                  variant={option.available ? 'default' : 'outline'}
                  className="w-full"
                >
                  {option.available ? option.action : 'Coming Soon'}
                </Button>
                {!option.available && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Available for Premium subscribers
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
