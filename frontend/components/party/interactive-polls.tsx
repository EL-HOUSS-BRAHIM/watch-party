'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Plus, 
  Vote, 
  Clock, 
  Users, 
  BarChart3, 
  X, 
  Check} from 'lucide-react'
import { useSocket } from '@/contexts/socket-context'

interface Poll {
  id: string
  question: string
  options: Array<{
    id: string
    text: string
    votes: number
    voters: string[]
  }>
  type: 'single' | 'multiple'
  createdBy: string
  createdAt: string
  expiresAt: string | null
  isActive: boolean
  totalVotes: number
  hasVoted: boolean
  userVotes: string[]
}

interface InteractivePollsProps {
  partyId: string
  isHost: boolean
  currentUserId: string
}

export function InteractivePolls({ partyId, isHost, currentUserId }: InteractivePollsProps) {
  const [polls, setPolls] = useState<Poll[]>([])
  const [showCreatePoll, setShowCreatePoll] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Create poll form state
  const [newPoll, setNewPoll] = useState({
    question: '',
    options: ['', ''],
    type: 'single' as 'single' | 'multiple',
    duration: '5' // minutes
  })

  const { socket } = useSocket()

  useEffect(() => {
    fetchPolls()
  }, [partyId])

  useEffect(() => {
    if (socket) {
      socket.on('poll-created', handlePollCreated)
      socket.on('poll-updated', handlePollUpdated)
      socket.on('poll-ended', handlePollEnded)
      
      return () => {
        socket.off('poll-created')
        socket.off('poll-updated')
        socket.off('poll-ended')
      }
    }
  }, [socket])

  const fetchPolls = useCallback(async () => {
    try {
      const response = await fetch(`/api/parties/${partyId}/polls`)
      if (response.ok) {
        const data = await response.json()
        setPolls(data.polls)
      }
    } catch {
      console.error('Failed to fetch polls:', error)
    }
  }, [])

  const handlePollCreated = (poll: Poll) => {
    setPolls(prev => [poll, ...prev])
  }

  const handlePollUpdated = (updatedPoll: Poll) => {
    setPolls(prev => prev.map(poll => 
      poll.id === updatedPoll.id ? updatedPoll : poll
    ))
  }

  const handlePollEnded = (pollId: string) => {
    setPolls(prev => prev.map(poll => 
      poll.id === pollId ? { ...poll, isActive: false } : poll
    ))
  }

  const createPoll = useCallback(async () => {
    if (!newPoll.question.trim() || newPoll.options.some(opt => !opt.trim())) {
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/parties/${partyId}/polls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: newPoll.question,
          options: newPoll.options.filter(opt => opt.trim()),
          type: newPoll.type,
          duration: parseInt(newPoll.duration)
        })
      })

      if (response.ok) {
        setShowCreatePoll(false)
        setNewPoll({
          question: '',
          options: ['', ''],
          type: 'single',
          duration: '5'
        })
      }
    } catch {
      console.error('Failed to create poll:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const votePoll = async (pollId: string, optionIds: string[]) => {
    try {
      const response = await fetch(`/api/parties/${partyId}/polls/${pollId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionIds })
      })

      if (response.ok) {
        const updatedPoll = await response.json()
        socket?.emit('poll-vote', { partyId, poll: updatedPoll })
      }
    } catch {
      console.error('Failed to vote on poll:', error)
    }
  }

  const endPoll = async (pollId: string) => {
    try {
      const response = await fetch(`/api/parties/${partyId}/polls/${pollId}/end`, {
        method: 'POST'
      })

      if (response.ok) {
        socket?.emit('poll-ended', { partyId, pollId })
      }
    } catch {
      console.error('Failed to end poll:', error)
    }
  }

  const addOption = () => {
    if (newPoll.options.length < 6) {
      setNewPoll(prev => ({
        ...prev,
        options: [...prev.options, '']
      }))
    }
  }

  const removeOption = (index: number) => {
    if (newPoll.options.length > 2) {
      setNewPoll(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index)
      }))
    }
  }

  const updateOption = (index: number, value: string) => {
    setNewPoll(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }))
  }

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date().getTime()
    const expiry = new Date(expiresAt).getTime()
    const diff = expiry - now
    
    if (diff <= 0) return 'Expired'
    
    const minutes = Math.floor(diff / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const PollCard = ({ poll }: { poll: Poll }) => {
    const [selectedOptions, setSelectedOptions] = useState<string[]>([])
    const [showResults, setShowResults] = useState(!poll.isActive || poll.hasVoted)

    const handleVote = () => {
      if (selectedOptions.length > 0) {
        votePoll(poll.id, selectedOptions)
        setShowResults(true)
      }
    }


      if (poll.type === 'single') {
        setSelectedOptions([optionId])
      } else {
        setSelectedOptions(prev => 
          prev.includes(optionId)
            ? prev.filter(id => id !== optionId)
            : [...prev, optionId]
        )
      }
    }

    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-base">{poll.question}</CardTitle>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Users className="h-3 w-3" />
                <span>{poll.totalVotes} votes</span>
                {poll.isActive && poll.expiresAt && (
                  <>
                    <Clock className="h-3 w-3" />
                    <span>{getTimeRemaining(poll.expiresAt)}</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={poll.isActive ? "default" : "secondary"}>
                {poll.isActive ? "Active" : "Ended"}
              </Badge>
              <Badge variant="outline">
                {poll.type === 'single' ? 'Single Choice' : 'Multiple Choice'}
              </Badge>
              {isHost && poll.isActive && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => endPoll(poll.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {showResults ? (
            <div className="space-y-2">
              {poll.options.map((option) => {
                const percentage = poll.totalVotes > 0 
                  ? (option.votes / poll.totalVotes) * 100 
                  : 0
                const isUserVote = poll.userVotes.includes(option.id)
                
                return (
                  <div key={option.id} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className={isUserVote ? "font-medium" : ""}>
                        {option.text}
                        {isUserVote && <Check className="inline h-3 w-3 ml-1 text-green-500" />}
                      </span>
                      <span className="text-muted-foreground">
                        {option.votes} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="space-y-3">
              {poll.type === 'single' ? (
                <RadioGroup
                  value={selectedOptions[0] || ''}
                  onValueChange={(value) => setSelectedOptions([value])}
                >
                  {poll.options.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.id} id={option.id} />
                      <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                        {option.text}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <div className="space-y-2">
                  {poll.options.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={option.id}
                        checked={selectedOptions.includes(option.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedOptions(prev => [...prev, option.id])
                          } else {
                            setSelectedOptions(prev => prev.filter(id => id !== option.id))
                          }
                        }}
                      />
                      <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                        {option.text}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowResults(true)}
                >
                  <BarChart3 className="h-3 w-3 mr-1" />
                  View Results
                </Button>
                <Button
                  onClick={handleVote}
                  disabled={selectedOptions.length === 0}
                  size="sm"
                >
                  <Vote className="h-3 w-3 mr-1" />
                  Vote
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center space-x-2">
          <Vote className="h-5 w-5" />
          <span>Polls</span>
        </h3>
        {isHost && (
          <Dialog open={showCreatePoll} onOpenChange={setShowCreatePoll}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Create Poll
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Poll</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="question">Question</Label>
                  <Textarea
                    id="question"
                    placeholder="What would you like to ask?"
                    value={newPoll.question}
                    onChange={(e) => setNewPoll(prev => ({ ...prev, question: e.target.value }))}
                    rows={2}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Poll Type</Label>
                  <Select
                    value={newPoll.type}
                    onValueChange={(value: 'single' | 'multiple') => 
                      setNewPoll(prev => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single Choice</SelectItem>
                      <SelectItem value="multiple">Multiple Choice</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Duration (minutes)</Label>
                  <Select
                    value={newPoll.duration}
                    onValueChange={(value) => setNewPoll(prev => ({ ...prev, duration: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 minute</SelectItem>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="10">10 minutes</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Options</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={addOption}
                      disabled={newPoll.options.length >= 6}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  {newPoll.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                      />
                      {newPoll.options.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeOption(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowCreatePoll(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={createPoll}
                    disabled={loading || !newPoll.question.trim() || newPoll.options.some(opt => !opt.trim())}
                  >
                    {loading ? 'Creating...' : 'Create Poll'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
      
      <div className="space-y-3">
        {polls.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <Vote className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No polls yet</p>
              {isHost && (
                <p className="text-sm text-muted-foreground mt-1">
                  Create a poll to engage with your audience
                </p>
              )}
            </CardContent>
          </Card>
        ) : (
          polls.map((poll) => <PollCard key={poll.id} poll={poll} />)
        )}
      </div>
    </div>
  )
}
