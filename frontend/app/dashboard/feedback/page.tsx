"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  MessageCircle,
  Star,
  Send,
  FileText,
  Upload,
  Paperclip,
  Image,
  Search,
  Filter,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  X,
  Eye,
  Reply,
  ThumbsUp,
  ThumbsDown,
  Flag,
  MoreHorizontal,
  Loader2,
  Plus,
  Edit,
  Trash2,
  Archive,
  Tag,
  Calendar,
  User,
  Mail,
  Phone,
  Globe,
  Lock,
  Shield,
  Info,
  Bug,
  Lightbulb,
  Heart,
  Zap,
  Target,
  Award,
  Gift
} from "lucide-react"
import { formatDistanceToNow, format, parseISO } from "date-fns"

interface FeedbackItem {
  id: string
  title: string
  description: string
  category: "bug" | "feature" | "improvement" | "question" | "complaint" | "compliment" | "other"
  priority: "low" | "medium" | "high" | "urgent"
  status: "open" | "in_progress" | "resolved" | "closed" | "duplicate"
  user: {
    id: string
    username: string
    email: string
    display_name: string
    avatar?: string
  }
  created_at: string
  updated_at: string
  attachments: Array<{
    id: string
    filename: string
    url: string
    size: number
    type: string
  }>
  responses: Array<{
    id: string
    message: string
    author: {
      id: string
      username: string
      is_staff: boolean
    }
    created_at: string
    is_internal: boolean
  }>
  votes: {
    upvotes: number
    downvotes: number
    user_vote?: "up" | "down" | null
  }
  tags: string[]
  is_public: boolean
  admin_notes?: string
  resolution_notes?: string
}

const feedbackSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title too long"),
  description: z.string().min(20, "Description must be at least 20 characters").max(2000, "Description too long"),
  category: z.enum(["bug", "feature", "improvement", "question", "complaint", "compliment", "other"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  is_public: z.boolean().optional().default(true),
  tags: z.string().optional(),
})

const responseSchema = z.object({
  message: z.string().min(10, "Response must be at least 10 characters").max(1000, "Response too long"),
})

interface FilterOptions {
  search: string
  category: string
  status: string
  priority: string
  sortBy: string
  showMyFeedback: boolean
}

export default function FeedbackPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()

  const [feedback, setFeedback] = useState<FeedbackItem[]>([])
  const [filteredFeedback, setFilteredFeedback] = useState<FeedbackItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null)
  const [showSubmitForm, setShowSubmitForm] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [processingVotes, setProcessingVotes] = useState<Set<string>>(new Set())
  const [filters, setFilters] = useState<FilterOptions>({
    search: "",
    category: "all",
    status: "all",
    priority: "all",
    sortBy: "recent",
    showMyFeedback: false
  })

  const submitForm = useForm({
    resolver: zodResolver(feedbackSchema) as any,
    defaultValues: {
      title: "",
      description: "",
      category: "bug" as const,
      priority: "medium" as const,
      is_public: true,
      tags: "",
    },
  })

  const responseForm = useForm<z.infer<typeof responseSchema>>({
    resolver: zodResolver(responseSchema),
    defaultValues: {
      message: "",
    },
  })

  useEffect(() => {
    loadFeedback()
  }, [])

  useEffect(() => {
    filterFeedback()
  }, [feedback, filters])

  const loadFeedback = async () => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch("/api/feedback/", {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setFeedback(data.results || data.feedback || [])
      } else {
        throw new Error("Failed to load feedback")
      }
    } catch (error) {
      console.error("Failed to load feedback:", error)
      toast({
        title: "Error",
        description: "Failed to load feedback.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterFeedback = () => {
    let filtered = [...feedback]

    // Search filter
    if (filters.search.trim()) {
      const query = filters.search.toLowerCase()
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Category filter
    if (filters.category !== "all") {
      filtered = filtered.filter(item => item.category === filters.category)
    }

    // Status filter
    if (filters.status !== "all") {
      filtered = filtered.filter(item => item.status === filters.status)
    }

    // Priority filter
    if (filters.priority !== "all") {
      filtered = filtered.filter(item => item.priority === filters.priority)
    }

    // My feedback filter
    if (filters.showMyFeedback) {
      filtered = filtered.filter(item => item.user.id === user?.id)
    }

    // Sort
    switch (filters.sortBy) {
      case "votes":
        filtered.sort((a, b) => (b.votes.upvotes - b.votes.downvotes) - (a.votes.upvotes - a.votes.downvotes))
        break
      case "title":
        filtered.sort((a, b) => a.title.localeCompare(b.title))
        break
      case "priority":
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
        filtered.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])
        break
      case "recent":
      default:
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
    }

    setFilteredFeedback(filtered)
  }

  const submitFeedback = async (data: z.infer<typeof feedbackSchema>) => {
    setIsSubmitting(true)

    try {
      const token = localStorage.getItem("accessToken")
      const formData = new FormData()
      
      // Add form fields
      Object.entries(data).forEach(([key, value]) => {
        if (key === "tags") {
          const tags = typeof value === "string" ? value.split(",").map((tag: string) => tag.trim()).filter(Boolean) : []
          formData.append(key, JSON.stringify(tags))
        } else {
          formData.append(key, String(value))
        }
      })

      // Add files
      uploadedFiles.forEach((file, index) => {
        formData.append(`attachment_${index}`, file)
      })

      const response = await fetch("/api/feedback/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (response.ok) {
        const newFeedback = await response.json()
        setFeedback(prev => [newFeedback, ...prev])
        setShowSubmitForm(false)
        setUploadedFiles([])
        submitForm.reset()
        
        toast({
          title: "Feedback Submitted",
          description: "Thank you for your feedback! We'll review it soon.",
        })
      } else {
        throw new Error("Failed to submit feedback")
      }
    } catch (error) {
      console.error("Submit feedback error:", error)
      toast({
        title: "Error",
        description: "Failed to submit feedback.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const submitResponse = async (feedbackId: string, data: z.infer<typeof responseSchema>) => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`/api/feedback/${feedbackId}/responses/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const newResponse = await response.json()
        setFeedback(prev => 
          prev.map(item => 
            item.id === feedbackId 
              ? { ...item, responses: [...item.responses, newResponse] }
              : item
          )
        )
        
        if (selectedFeedback?.id === feedbackId) {
          setSelectedFeedback(prev => 
            prev ? { ...prev, responses: [...prev.responses, newResponse] } : null
          )
        }
        
        responseForm.reset()
        toast({
          title: "Response Added",
          description: "Your response has been posted.",
        })
      } else {
        throw new Error("Failed to submit response")
      }
    } catch (error) {
      console.error("Submit response error:", error)
      toast({
        title: "Error",
        description: "Failed to submit response.",
        variant: "destructive",
      })
    }
  }

  const voteFeedback = async (feedbackId: string, voteType: "up" | "down") => {
    setProcessingVotes(prev => new Set(prev).add(feedbackId))

    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`/api/feedback/${feedbackId}/vote/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ vote: voteType }),
      })

      if (response.ok) {
        const data = await response.json()
        setFeedback(prev => 
          prev.map(item => 
            item.id === feedbackId 
              ? { ...item, votes: data.votes }
              : item
          )
        )
        
        if (selectedFeedback?.id === feedbackId) {
          setSelectedFeedback(prev => 
            prev ? { ...prev, votes: data.votes } : null
          )
        }
      } else {
        throw new Error("Failed to vote")
      }
    } catch (error) {
      console.error("Vote error:", error)
      toast({
        title: "Error",
        description: "Failed to submit vote.",
        variant: "destructive",
      })
    } finally {
      setProcessingVotes(prev => {
        const newSet = new Set(prev)
        newSet.delete(feedbackId)
        return newSet
      })
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const validFiles = files.filter(file => file.size <= 10 * 1024 * 1024) // 10MB limit
    
    if (validFiles.length !== files.length) {
      toast({
        title: "File Size Limit",
        description: "Some files were skipped. Maximum file size is 10MB.",
        variant: "destructive",
      })
    }
    
    setUploadedFiles(prev => [...prev, ...validFiles].slice(0, 5)) // Max 5 files
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "bug":
        return <Bug className="h-4 w-4 text-red-600" />
      case "feature":
        return <Lightbulb className="h-4 w-4 text-blue-600" />
      case "improvement":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "question":
        return <MessageCircle className="h-4 w-4 text-purple-600" />
      case "complaint":
        return <AlertTriangle className="h-4 w-4 text-orange-600" />
      case "compliment":
        return <Heart className="h-4 w-4 text-pink-600" />
      default:
        return <FileText className="h-4 w-4 text-gray-600" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "bug":
        return "bg-red-100 text-red-800"
      case "feature":
        return "bg-blue-100 text-blue-800"
      case "improvement":
        return "bg-green-100 text-green-800"
      case "question":
        return "bg-purple-100 text-purple-800"
      case "complaint":
        return "bg-orange-100 text-orange-800"
      case "compliment":
        return "bg-pink-100 text-pink-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800"
      case "in_progress":
        return "bg-yellow-100 text-yellow-800"
      case "resolved":
        return "bg-green-100 text-green-800"
      case "closed":
        return "bg-gray-100 text-gray-800"
      case "duplicate":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading feedback...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <MessageCircle className="h-8 w-8" />
              Feedback & Support
            </h1>
            <p className="text-gray-600 mt-2">Share your ideas, report issues, and help us improve</p>
          </div>
          
          <Button onClick={() => setShowSubmitForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Submit Feedback
          </Button>
        </div>

        <Tabs defaultValue="browse" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="browse">Browse Feedback</TabsTrigger>
            <TabsTrigger value="submit">Submit New</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Search */}
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search feedback..."
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Filter controls */}
                  <div className="flex gap-2">
                    <Select
                      value={filters.category}
                      onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="bug">Bug Reports</SelectItem>
                        <SelectItem value="feature">Feature Requests</SelectItem>
                        <SelectItem value="improvement">Improvements</SelectItem>
                        <SelectItem value="question">Questions</SelectItem>
                        <SelectItem value="complaint">Complaints</SelectItem>
                        <SelectItem value="compliment">Compliments</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={filters.status}
                      onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={filters.sortBy}
                      onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recent">Most Recent</SelectItem>
                        <SelectItem value="votes">Most Voted</SelectItem>
                        <SelectItem value="priority">By Priority</SelectItem>
                        <SelectItem value="title">Alphabetical</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      variant={filters.showMyFeedback ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilters(prev => ({ ...prev, showMyFeedback: !prev.showMyFeedback }))}
                    >
                      <User className="h-4 w-4 mr-2" />
                      My Feedback
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feedback List */}
            <div className="space-y-4">
              {filteredFeedback.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback found</h3>
                    <p className="text-gray-600">
                      {filters.search || Object.values(filters).some(f => f !== "all" && f !== "recent" && f !== false)
                        ? "Try adjusting your search or filters"
                        : "Be the first to share your feedback!"
                      }
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredFeedback.map((item) => (
                  <Card key={item.id} className="hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => setSelectedFeedback(item)}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="mt-1">
                            {getCategoryIcon(item.category)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                              {item.description}
                            </p>
                            
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                              <Badge className={getCategoryColor(item.category)}>
                                {getCategoryIcon(item.category)}
                                <span className="ml-1 capitalize">{item.category}</span>
                              </Badge>
                              <Badge className={getStatusColor(item.status)}>
                                {item.status.replace("_", " ")}
                              </Badge>
                              <Badge className={getPriorityColor(item.priority)}>
                                {item.priority} priority
                              </Badge>
                              {item.tags.map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  <Tag className="h-3 w-3 mr-1" />
                                  {tag}
                                </Badge>
                              ))}
                            </div>

                            <div className="flex items-center justify-between text-sm text-gray-600">
                              <div className="flex items-center gap-4">
                                <span>By {item.user.display_name || item.user.username}</span>
                                <span>{formatDistanceToNow(parseISO(item.created_at), { addSuffix: true })}</span>
                                {item.responses.length > 0 && (
                                  <span className="flex items-center gap-1">
                                    <Reply className="h-3 w-3" />
                                    {item.responses.length} responses
                                  </span>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    voteFeedback(item.id, "up")
                                  }}
                                  disabled={processingVotes.has(item.id)}
                                  className="text-gray-600 hover:text-green-600"
                                >
                                  <ThumbsUp className="h-4 w-4 mr-1" />
                                  {item.votes.upvotes}
                                </Button>
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    voteFeedback(item.id, "down")
                                  }}
                                  disabled={processingVotes.has(item.id)}
                                  className="text-gray-600 hover:text-red-600"
                                >
                                  <ThumbsDown className="h-4 w-4 mr-1" />
                                  {item.votes.downvotes}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="submit" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Submit New Feedback</CardTitle>
                <CardDescription>
                  Help us improve by sharing your thoughts, reporting bugs, or requesting features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={submitForm.handleSubmit(submitFeedback as any)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Category *</label>
                      <Select
                        value={submitForm.watch("category")}
                        onValueChange={(value: any) => submitForm.setValue("category", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bug">
                            <div className="flex items-center gap-2">
                              <Bug className="h-4 w-4" />
                              Bug Report
                            </div>
                          </SelectItem>
                          <SelectItem value="feature">
                            <div className="flex items-center gap-2">
                              <Lightbulb className="h-4 w-4" />
                              Feature Request
                            </div>
                          </SelectItem>
                          <SelectItem value="improvement">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="h-4 w-4" />
                              Improvement
                            </div>
                          </SelectItem>
                          <SelectItem value="question">
                            <div className="flex items-center gap-2">
                              <MessageCircle className="h-4 w-4" />
                              Question
                            </div>
                          </SelectItem>
                          <SelectItem value="complaint">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4" />
                              Complaint
                            </div>
                          </SelectItem>
                          <SelectItem value="compliment">
                            <div className="flex items-center gap-2">
                              <Heart className="h-4 w-4" />
                              Compliment
                            </div>
                          </SelectItem>
                          <SelectItem value="other">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              Other
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Priority *</label>
                      <Select
                        value={submitForm.watch("priority")}
                        onValueChange={(value: any) => submitForm.setValue("priority", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low Priority</SelectItem>
                          <SelectItem value="medium">Medium Priority</SelectItem>
                          <SelectItem value="high">High Priority</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Title *</label>
                    <Input
                      {...submitForm.register("title")}
                      placeholder="Brief summary of your feedback..."
                    />
                    {submitForm.formState.errors.title && (
                      <p className="text-red-600 text-xs mt-1">{submitForm.formState.errors.title.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Description *</label>
                    <Textarea
                      {...submitForm.register("description")}
                      placeholder="Provide detailed information about your feedback. For bugs, include steps to reproduce the issue..."
                      rows={6}
                    />
                    {submitForm.formState.errors.description && (
                      <p className="text-red-600 text-xs mt-1">{submitForm.formState.errors.description.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Tags (comma-separated)</label>
                    <Input
                      {...submitForm.register("tags")}
                      placeholder="ui, mobile, performance, accessibility..."
                    />
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Attachments (optional)</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                      <div className="text-center">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-2">
                          Upload screenshots, videos, or other files (max 10MB each, 5 files total)
                        </p>
                        <input
                          type="file"
                          multiple
                          accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="file-upload"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById("file-upload")?.click()}
                        >
                          <Paperclip className="h-4 w-4 mr-2" />
                          Choose Files
                        </Button>
                      </div>
                    </div>

                    {uploadedFiles.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {uploadedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 rounded p-2">
                            <div className="flex items-center gap-2">
                              <Paperclip className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">{file.name}</span>
                              <span className="text-xs text-gray-500">
                                ({(file.size / 1024 / 1024).toFixed(1)} MB)
                              </span>
                            </div>
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

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_public"
                      {...submitForm.register("is_public")}
                      className="rounded"
                    />
                    <label htmlFor="is_public" className="text-sm">
                      Make this feedback public (others can see and vote on it)
                    </label>
                  </div>

                  <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Feedback
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Feedback Detail Modal */}
        {selectedFeedback && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{selectedFeedback.title}</h2>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={getCategoryColor(selectedFeedback.category)}>
                        {getCategoryIcon(selectedFeedback.category)}
                        <span className="ml-1 capitalize">{selectedFeedback.category}</span>
                      </Badge>
                      <Badge className={getStatusColor(selectedFeedback.status)}>
                        {selectedFeedback.status.replace("_", " ")}
                      </Badge>
                      <Badge className={getPriorityColor(selectedFeedback.priority)}>
                        {selectedFeedback.priority} priority
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFeedback(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-6">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedFeedback.description}</p>
                  {selectedFeedback.attachments.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Attachments:</h4>
                      <div className="space-y-2">
                        {selectedFeedback.attachments.map((attachment) => (
                          <a
                            key={attachment.id}
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-blue-600 hover:underline"
                          >
                            <Paperclip className="h-4 w-4" />
                            {attachment.filename}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Responses */}
                <div className="space-y-4">
                  <h4 className="font-medium">Responses ({selectedFeedback.responses.length})</h4>
                  {selectedFeedback.responses.map((response) => (
                    <div key={response.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{response.author.username}</span>
                          {response.author.is_staff && (
                            <Badge variant="outline" className="text-xs">
                              <Shield className="h-3 w-3 mr-1" />
                              Staff
                            </Badge>
                          )}
                        </div>
                        <span className="text-sm text-gray-600">
                          {formatDistanceToNow(parseISO(response.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">{response.message}</p>
                    </div>
                  ))}

                  {/* Add Response Form */}
                  <form onSubmit={responseForm.handleSubmit((data) => submitResponse(selectedFeedback.id, data))}>
                    <Textarea
                      {...responseForm.register("message")}
                      placeholder="Add your response..."
                      rows={3}
                      className="mb-2"
                    />
                    <Button type="submit" size="sm">
                      <Reply className="h-4 w-4 mr-2" />
                      Add Response
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
