import { Calendar, Clock, User } from "lucide-react"
import { useState } from 'react'

"use client"

interface SupportTicket {}
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in-progress' | 'waiting' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  responses: number;
}

const supportTickets: SupportTicket[] = []
  {}
    id: 'TK-001',
    title: 'Unable to upload large video files',
    description: 'When trying to upload video files larger than 2GB, the upload fails at around 50% progress.',
    status: 'in-progress',
    priority: 'high',
    category: 'Video Upload',
    createdAt: '2024-03-20',
    updatedAt: '2024-03-21',
    assignedTo: 'Support Team',
    responses: 3;
  },
  {}
    id: 'TK-002',
    title: 'Watch party audio sync issues',
    description: 'Audio appears to be out of sync with video during watch parties. This happens consistently across different browsers.',
    status: 'open',
    priority: 'medium',
    category: 'Watch Parties',
    createdAt: '2024-03-19',
    updatedAt: '2024-03-19',
    responses: 0;
  },
  {}
    id: 'TK-003',
    title: 'Payment not processed correctly',
    description: 'I upgraded to premium but my account still shows as free tier. Payment was successfully charged to my card.',
    status: 'resolved',
    priority: 'urgent',
    category: 'Billing',
    createdAt: '2024-03-15',
    updatedAt: '2024-03-16',
    assignedTo: 'Billing Team',
    responses: 5;
  },
  {}
    id: 'TK-004',
    title: 'Feature request: Dark mode for mobile',
    description: 'Would love to have a dark mode option in the mobile app. Current bright theme is hard on the eyes during night viewing.',
    status: 'waiting',
    priority: 'low',
    category: 'Feature Request',
    createdAt: '2024-03-10',
    updatedAt: '2024-03-12',
    assignedTo: 'Product Team',
    responses: 2;
  }
]

const statusColors = { open: 'bg-blue-500',
  'in-progress': 'bg-yellow-500',
  waiting: 'bg-orange-500',
  resolved: 'bg-green-500',
  closed: 'bg-gray-500'
}

const statusLabels = { open: 'Open',
  'in-progress': 'In Progress',
  waiting: 'Waiting',
  resolved: 'Resolved',
  closed: 'Closed'
}

const priorityColors = { low: 'text-green-400',
  medium: 'text-yellow-400',
  high: 'text-orange-400',
  urgent: 'text-red-400'
}

const priorityIcons = { low: '●',
  medium: '●●',
  high: '●●●',
  urgent: '🔥'
}

export default function SupportTicketsPage() {}
  const [filter, setFilter] = useState<'all' | 'open' | 'in-progress' | 'resolved'>(&apos;all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewTicketForm, setShowNewTicketForm] = useState(false)

  const filteredTickets = supportTickets.filter(ticket => {}
    const matchesFilter = filter === 'all' || ticket.status === filter;
    const matchesSearch = ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.category.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch;
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <TicketIcon className="w-8 h-8 text-blue-400" />
              <h1 className="text-4xl font-bold text-white">Support Tickets</h1>
            </div>
            <p className="text-white/70 text-lg">
              Track and manage your support requests;
            </p>
          </div>
          <button;
            onClick={() => setShowNewTicketForm(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            New Ticket;
          </button>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-8">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
            <input;
              type="text"
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 rounded-lg border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-blue-400"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            {[]
              { key: 'all', label: 'All' },
              { key: 'open', label: 'Open' },
              { key: 'in-progress', label: 'In Progress' },
              { key: 'resolved', label: 'Resolved' }
            ].map(({ key, label }) => (
              <button;
                key={key}
                onClick={() => setFilter(key as Record<string, unknown>)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${}
                  filter === key;
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Tickets List */}
        <div className="space-y-4">
          {filteredTickets.map(ticket => (
            <div;
              key={ticket.id}
              className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6 hover:border-blue-400/50 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-lg text-white">{ticket.title}</h3>
                    <span className="text-white/60 text-sm">#{ticket.id}</span>
                  </div>
                  <p className="text-white/70 mb-3 line-clamp-2">{ticket.description}</p>
                  <div className="flex items-center gap-4 text-sm text-white/60">
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="w-4 h-4" />
                      <span>Created {new Date(ticket.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ClockIcon className="w-4 h-4" />
                      <span>Updated {new Date(ticket.updatedAt).toLocaleDateString()}</span>
                    </div>
                    {ticket.assignedTo && (
                      <div className="flex items-center gap-1">
                        <UserIcon className="w-4 h-4" />
                        <span>{ticket.assignedTo}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <ChatBubbleLeftRightIcon className="w-4 h-4" />
                      <span>{ticket.responses} responses</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  {/* Status Badge */}
                  <div className={`${statusColors[ticket.status]} text-white px-3 py-1 rounded-full text-sm font-medium`}>
                    {statusLabels[ticket.status]}
                  </div>
                  {/* Priority */}
                  <div className={`flex items-center gap-1 ${priorityColors[ticket.priority]}`}>
                    <span className="text-xs">{priorityIcons[ticket.priority]}</span>
                    <span className="text-xs font-medium capitalize">{ticket.priority}</span>
                  </div>
                  {/* Category */}
                  <span className="bg-white/10 text-white/70 px-2 py-1 rounded text-xs">
                    {ticket.category}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredTickets.length === 0 && (
          <div className="text-center py-12">
            <TicketIcon className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <p className="text-white/50 text-lg mb-4">
              {searchQuery ? 'No tickets found matching your search.' : 'No support tickets found.'}
            </p>
            <p className="text-white/40">
              {searchQuery ? 'Try adjusting your search terms.' : 'Need help? Create a new support ticket!'}
            </p>
          </div>
        )}

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {supportTickets.filter(t => t.status === &apos;open').length}
            </div>
            <div className="text-white/70">Open Tickets</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-2">
              {supportTickets.filter(t => t.status === &apos;in-progress').length}
            </div>
            <div className="text-white/70">In Progress</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {supportTickets.filter(t => t.status === &apos;resolved').length}
            </div>
            <div className="text-white/70">Resolved</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">
              {Math.round(supportTickets.reduce((sum, t) => sum + t.responses, 0) / supportTickets.length)}
            </div>
            <div className="text-white/70">Avg Responses</div>
          </div>
        </div>

        {/* New Ticket Modal (simplified) */}
        {showNewTicketForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 rounded-lg p-6 w-full max-w-lg">
              <h2 className="text-xl font-bold text-white mb-4">Create New Ticket</h2>
              <p className="text-white/70 mb-4">
                Describe your issue and we'll get back to you as soon as possible.
              </p>
              <div className="flex gap-4">
                <button;
                  onClick={() => setShowNewTicketForm(false)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel;
                </button>
                <button;
                  onClick={() => setShowNewTicketForm(false)}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Create Ticket;
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
