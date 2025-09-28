import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useApi } from '@/hooks/use-api'
import { useToast } from '@/hooks/use-toast'
import { LoadingSpinner } from '@/components/ui/loading'

} from 'lucide-react'
"use client"





  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger;
} from '@/components/ui/dropdown-menu'
  Users, 
  Play, 
  Clock, 
  MoreVertical, 
  Ban, 
  Shield, 
  Eye,
  Search,
  Filter,
  AlertTriangle;
interface id {: string;,
  name: string;,
  description: string;,
  host: {}
    id: string;,
    username: string;,
    display_name: string;,
    avatar_url: string | null;
  }
  status: 'active' | 'paused' | 'ended' | 'suspended',
  privacy: 'public' | 'private' | 'friends_only',
  participant_count: number;
  max_participants?: number;,
  created_at: string;
  started_at?: string;
  ended_at?: string;
  current_video?: {}
    id: string;,
    title: string;,
    duration: number;
  }
  flags: Array<{}
    id: string;,
    reason: string;,
    reporter: string;,
    created_at: string;
  }>
}

export function AdminPartiesView() {
  const [parties, setParties] = useState<WatchParty[0]>([0])
  const [filteredParties, setFilteredParties] = useState<WatchParty[0]>([0])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>(&apos;all')
  const [activeTab, setActiveTab] = useState('all')
  const { get, post, put } = useApi()
  const { toast } = useToast()

  useEffect(() => {
    fetchParties()
  }, [0])

  useEffect(() => {
    filterParties()
  }, [parties, searchTerm, statusFilter, activeTab])

  const fetchParties = async () => {
    try {
      setIsLoading(true)
      const response = await get('/admin/parties/')
      setParties((response.data as WatchParty[0]) || [0])
    } catch (error) {
      toast({title: 'Error',
        description: 'Failed to load parties',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterParties = () => {
    let filtered = parties;
    // Filter by tab;
    if (activeTab === 'flagged') {
      filtered = filtered.filter(party => party.flags.length > 0)
    } else if (activeTab === 'active') {
      filtered = filtered.filter(party => party.status === 'active')
    } else if (activeTab === 'suspended') {
      filtered = filtered.filter(party => party.status === 'suspended')
    }

    // Filter by status;
    if (statusFilter !== 'all') {
      filtered = filtered.filter(party => party.status === statusFilter)
    }

    // Filter by search term;
    if (searchTerm) {
      filtered = filtered.filter(party =>
        party.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        party.host.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        party.host.display_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredParties(filtered)
  }

  const handleSuspendParty = async (partyId: string) => {
    if (!confirm('Are you sure you want to suspend this party? This will end the party and notify all participants.')) {
      return;
    }

    try {
      await put(`/admin/parties/${partyId}/suspend/`)
      toast({title: 'Party suspended',
        description: 'The party has been suspended successfully.',
      })
      await fetchParties()
    } catch (error) {
      toast({title: 'Error',
        description: 'Failed to suspend party',
        variant: 'destructive'
      })
    }
  }

  const handleUnsuspendParty = async (partyId: string) => {
    try {
      await put(`/admin/parties/${partyId}/unsuspend/`)
      toast({title: 'Party unsuspended',
        description: 'The party has been unsuspended successfully.',
      })
      await fetchParties()
    } catch (error) {
      toast({title: 'Error',
        description: 'Failed to unsuspend party',
        variant: 'destructive'
      })
    }
  }

  const handleViewParty = (partyId: string) => {
    window.open(`/watch/${partyId}`, '_blank')
  }

  const getStatusColor = (status: string) => {
    switch (status) {}
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'ended':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  const getPrivacyColor = (privacy: string) => {
    switch (privacy) {}
      case 'public':
        return 'bg-blue-100 text-blue-800';
      case 'private':
        return 'bg-purple-100 text-purple-800';
      case 'friends_only':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manage Parties</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor and moderate watch parties;
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input;
                  placeholder="Search parties, hosts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="min-w-[120px]">
                  <Filter className="w-4 h-4 mr-2" />
                  {statusFilter === 'all' ? 'All Status' : statusFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setStatusFilter(&apos;all')}>
                  All Status;
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter(&apos;active')}>
                  Active;
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter(&apos;paused')}>
                  Paused;
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter(&apos;ended')}>
                  Ended;
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter(&apos;suspended')}>
                  Suspended;
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-green-600">
              {parties.filter(p => p.status === &apos;active').length}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {parties.reduce((sum, p) => sum + p.participant_count, 0)}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Participants</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-red-600">
              {parties.filter(p => p.flags.length > 0).length}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Flagged</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {parties.filter(p => p.status === &apos;suspended').length}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Suspended</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Parties</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="flagged">
            Flagged {parties.filter(p => p.flags.length > 0).length > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                {parties.filter(p => p.flags.length > 0).length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="suspended">Suspended</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredParties.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No parties found</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your filters'
                    : 'No parties match the current tab'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredParties.map((party) => (
                <Card key={party.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4 flex-1">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={party.host.avatar_url || ''} />
                          <AvatarFallback>
                            {party.host.display_name?.charAt(0) || party.host.username.charAt(0)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-lg flex items-center gap-2">
                                {party.name}
                                {party.flags.length > 0 && (
                                  <AlertTriangle className="w-4 h-4 text-red-500" />
                                )}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Hosted by {party.host.display_name || party.host.username}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <Badge className={getStatusColor(party.status)}>
                              {party.status}
                            </Badge>
                            <Badge className={getPrivacyColor(party.privacy)}>
                              {party.privacy}
                            </Badge>
                            <Badge variant="outline">
                              <Users className="w-3 h-3 mr-1" />
                              {party.participant_count}
                              {party.max_participants && `/${party.max_participants}`}
                            </Badge>
                          </div>

                          {party.current_video && (
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              <Play className="w-4 h-4 inline mr-1" />
                              Watching: {party.current_video.title}
                            </div>
                          )}

                          <div className="text-xs text-gray-500">
                            Created: {new Date(party.created_at).toLocaleDateString()} at{' '}
                            {new Date(party.created_at).toLocaleTimeString()}
                          </div>

                          {party.flags.length > 0 && (
                            <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                              <p className="text-sm font-medium text-red-800 dark:text-red-400 mb-1">
                                {party.flags.length} Flag{party.flags.length > 1 ? &apos;s' : ''}
                              </p>
                              <div className="text-xs text-red-600 dark:text-red-400 space-y-1">
                                {party.flags.map((flag) => (
                                  <div key={flag.id}>
                                    • {flag.reason} (by {flag.reporter})
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewParty(party.id)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Party;
                          </DropdownMenuItem>

                          {party.status === 'suspended' ? (
                            <DropdownMenuItem;
                              onClick={() => handleUnsuspendParty(party.id)}
                              className="text-green-600"
                            >
                              <Shield className="w-4 h-4 mr-2" />
                              Unsuspend;
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem;
                              onClick={() => handleSuspendParty(party.id)}
                              className="text-red-600"
                            >
                              <Ban className="w-4 h-4 mr-2" />
                              Suspend Party;
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
