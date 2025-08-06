'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { toast } from '@/hooks/use-toast'
import { 
  QuestionMarkCircleIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline'

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  isPublished: boolean
  order: number
  tags: string[]
  createdAt: string
  updatedAt: string
  views: number
  helpful: number
  notHelpful: number
}

interface FAQCategory {
  id: string
  name: string
  description: string
  color: string
  order: number
}

const categories: FAQCategory[] = [
  { id: 'general', name: 'General', description: 'Basic questions about WatchParty', color: 'bg-blue-500', order: 1 },
  { id: 'account', name: 'Account', description: 'Account management and settings', color: 'bg-green-500', order: 2 },
  { id: 'parties', name: 'Watch Parties', description: 'Creating and joining watch parties', color: 'bg-purple-500', order: 3 },
  { id: 'billing', name: 'Billing', description: 'Payments and subscriptions', color: 'bg-yellow-500', order: 4 },
  { id: 'technical', name: 'Technical', description: 'Technical issues and troubleshooting', color: 'bg-red-500', order: 5 },
  { id: 'privacy', name: 'Privacy & Security', description: 'Data protection and security', color: 'bg-indigo-500', order: 6 }
]

export default function FAQManagement() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showPublishedOnly, setShowPublishedOnly] = useState(false)
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'general',
    tags: '',
    isPublished: true
  })

  useEffect(() => {
    fetchFAQs()
  }, [])

  const fetchFAQs = async () => {
    try {
      // Mock data - replace with actual API call
      const mockFAQs: FAQ[] = [
        {
          id: '1',
          question: 'How do I create a watch party?',
          answer: 'To create a watch party, go to your dashboard and click on "Create Party". Choose your video, set your preferences, and invite friends by sharing the party link.',
          category: 'parties',
          isPublished: true,
          order: 1,
          tags: ['create', 'party', 'invite'],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-10T00:00:00Z',
          views: 1248,
          helpful: 89,
          notHelpful: 12
        },
        {
          id: '2',
          question: 'Can I watch parties on mobile devices?',
          answer: 'Yes! WatchParty is fully compatible with mobile devices. You can join parties, chat with friends, and enjoy synchronized viewing on your phone or tablet.',
          category: 'technical',
          isPublished: true,
          order: 2,
          tags: ['mobile', 'compatibility', 'devices'],
          createdAt: '2024-01-02T00:00:00Z',
          updatedAt: '2024-01-08T00:00:00Z',
          views: 892,
          helpful: 67,
          notHelpful: 8
        },
        {
          id: '3',
          question: 'How do I cancel my subscription?',
          answer: 'You can cancel your subscription at any time by going to Settings > Billing > Cancel Subscription. Your premium features will remain active until the end of your billing period.',
          category: 'billing',
          isPublished: true,
          order: 3,
          tags: ['subscription', 'cancel', 'billing'],
          createdAt: '2024-01-03T00:00:00Z',
          updatedAt: '2024-01-05T00:00:00Z',
          views: 534,
          helpful: 45,
          notHelpful: 3
        },
        {
          id: '4',
          question: 'What file formats are supported for video uploads?',
          answer: 'WatchParty supports MP4, WebM, and AVI formats. For best compatibility, we recommend MP4 files with H.264 encoding. Maximum file size is 2GB for free users and 10GB for premium users.',
          category: 'technical',
          isPublished: false,
          order: 4,
          tags: ['upload', 'formats', 'video', 'limits'],
          createdAt: '2024-01-04T00:00:00Z',
          updatedAt: '2024-01-04T00:00:00Z',
          views: 0,
          helpful: 0,
          notHelpful: 0
        },
        {
          id: '5',
          question: 'How do I reset my password?',
          answer: 'Click on "Forgot Password" on the login page, enter your email address, and we\'ll send you a reset link. Follow the instructions in the email to create a new password.',
          category: 'account',
          isPublished: true,
          order: 5,
          tags: ['password', 'reset', 'login', 'security'],
          createdAt: '2024-01-05T00:00:00Z',
          updatedAt: '2024-01-06T00:00:00Z',
          views: 723,
          helpful: 58,
          notHelpful: 5
        }
      ]
      
      setFaqs(mockFAQs.sort((a, b) => a.order - b.order))
    } catch (error) {
      console.error('Failed to fetch FAQs:', error)
      toast({
        title: 'Error',
        description: 'Failed to load FAQs',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory
    const matchesPublished = !showPublishedOnly || faq.isPublished
    
    return matchesSearch && matchesCategory && matchesPublished
  })

  const handleCreateFAQ = async () => {
    if (!formData.question.trim() || !formData.answer.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Question and answer are required',
        variant: 'destructive'
      })
      return
    }

    try {
      const newFAQ: FAQ = {
        id: Date.now().toString(),
        question: formData.question,
        answer: formData.answer,
        category: formData.category,
        isPublished: formData.isPublished,
        order: faqs.length + 1,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        views: 0,
        helpful: 0,
        notHelpful: 0
      }

      setFaqs(prev => [...prev, newFAQ])
      setIsCreateDialogOpen(false)
      resetForm()
      
      toast({
        title: 'FAQ Created',
        description: 'New FAQ has been created successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create FAQ',
        variant: 'destructive'
      })
    }
  }

  const handleEditFAQ = async () => {
    if (!editingFAQ || !formData.question.trim() || !formData.answer.trim()) return

    try {
      const updatedFAQ: FAQ = {
        ...editingFAQ,
        question: formData.question,
        answer: formData.answer,
        category: formData.category,
        isPublished: formData.isPublished,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        updatedAt: new Date().toISOString()
      }

      setFaqs(prev => prev.map(faq => faq.id === editingFAQ.id ? updatedFAQ : faq))
      setEditingFAQ(null)
      resetForm()
      
      toast({
        title: 'FAQ Updated',
        description: 'FAQ has been updated successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update FAQ',
        variant: 'destructive'
      })
    }
  }

  const handleDeleteFAQ = async (faqId: string) => {
    try {
      setFaqs(prev => prev.filter(faq => faq.id !== faqId))
      
      toast({
        title: 'FAQ Deleted',
        description: 'FAQ has been deleted successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete FAQ',
        variant: 'destructive'
      })
    }
  }

  const handleTogglePublished = async (faqId: string) => {
    try {
      setFaqs(prev => prev.map(faq => 
        faq.id === faqId 
          ? { ...faq, isPublished: !faq.isPublished, updatedAt: new Date().toISOString() }
          : faq
      ))
      
      const faq = faqs.find(f => f.id === faqId)
      toast({
        title: faq?.isPublished ? 'FAQ Unpublished' : 'FAQ Published',
        description: faq?.isPublished 
          ? 'FAQ is now hidden from public view'
          : 'FAQ is now visible to users',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update FAQ status',
        variant: 'destructive'
      })
    }
  }

  const handleReorderFAQ = async (faqId: string, direction: 'up' | 'down') => {
    const faqIndex = faqs.findIndex(f => f.id === faqId)
    if (faqIndex === -1) return
    
    const newIndex = direction === 'up' ? faqIndex - 1 : faqIndex + 1
    if (newIndex < 0 || newIndex >= faqs.length) return

    const reorderedFAQs = [...faqs]
    const [movedFAQ] = reorderedFAQs.splice(faqIndex, 1)
    reorderedFAQs.splice(newIndex, 0, movedFAQ)
    
    // Update order numbers
    const updatedFAQs = reorderedFAQs.map((faq, index) => ({
      ...faq,
      order: index + 1,
      updatedAt: new Date().toISOString()
    }))
    
    setFaqs(updatedFAQs)
    
    toast({
      title: 'Order Updated',
      description: 'FAQ order has been updated',
    })
  }

  const resetForm = () => {
    setFormData({
      question: '',
      answer: '',
      category: 'general',
      tags: '',
      isPublished: true
    })
  }

  const startEdit = (faq: FAQ) => {
    setEditingFAQ(faq)
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      tags: faq.tags.join(', '),
      isPublished: faq.isPublished
    })
  }

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || categoryId
  }

  const getCategoryColor = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.color || 'bg-gray-500'
  }

  if (loading) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QuestionMarkCircleIcon className="w-5 h-5" />
            FAQ Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-white/10 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <QuestionMarkCircleIcon className="w-5 h-5" />
                FAQ Management
              </CardTitle>
              <CardDescription>
                Manage frequently asked questions and help content
              </CardDescription>
            </div>
            
            <Dialog open={isCreateDialogOpen || editingFAQ !== null} onOpenChange={(open) => {
              if (!open) {
                setIsCreateDialogOpen(false)
                setEditingFAQ(null)
                resetForm()
              }
            }}>
              <DialogTrigger asChild>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Create FAQ
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-black/90 border-white/20 max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingFAQ ? 'Edit FAQ' : 'Create New FAQ'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingFAQ ? 'Update the FAQ details below' : 'Add a new frequently asked question'}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="question">Question</Label>
                    <Input
                      id="question"
                      value={formData.question}
                      onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                      placeholder="Enter the question..."
                      className="bg-white/5 border-white/20"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="answer">Answer</Label>
                    <Textarea
                      id="answer"
                      value={formData.answer}
                      onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))}
                      placeholder="Enter the answer..."
                      rows={6}
                      className="bg-white/5 border-white/20"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="category">Category</Label>
                      <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                        <SelectTrigger className="bg-white/5 border-white/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="tags">Tags (comma-separated)</Label>
                      <Input
                        id="tags"
                        value={formData.tags}
                        onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                        placeholder="tag1, tag2, tag3"
                        className="bg-white/5 border-white/20"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="published"
                      checked={formData.isPublished}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublished: checked }))}
                    />
                    <Label htmlFor="published">Publish immediately</Label>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => {
                    setIsCreateDialogOpen(false)
                    setEditingFAQ(null)
                    resetForm()
                  }}>
                    Cancel
                  </Button>
                  <Button onClick={editingFAQ ? handleEditFAQ : handleCreateFAQ}>
                    {editingFAQ ? 'Update FAQ' : 'Create FAQ'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-3 text-white/50" />
                <Input
                  placeholder="Search FAQs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/5 border-white/20"
                />
              </div>
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48 bg-white/5 border-white/20">
                <FunnelIcon className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="published-only"
                checked={showPublishedOnly}
                onCheckedChange={setShowPublishedOnly}
              />
              <Label htmlFor="published-only" className="whitespace-nowrap">
                Published only
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQ List */}
      <div className="space-y-4">
        {filteredFAQs.length === 0 ? (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-12 text-center">
              <QuestionMarkCircleIcon className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No FAQs Found</h3>
              <p className="text-white/70">
                {searchQuery || selectedCategory !== 'all' || showPublishedOnly
                  ? 'Try adjusting your filters or search terms'
                  : 'Create your first FAQ to get started'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredFAQs.map((faq, index) => (
            <Card key={faq.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className={`${getCategoryColor(faq.category)} text-white text-xs`}>
                        {getCategoryName(faq.category)}
                      </Badge>
                      {faq.isPublished ? (
                        <Badge className="bg-green-500/20 text-green-400 text-xs">
                          <EyeIcon className="w-3 h-3 mr-1" />
                          Published
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-500/20 text-gray-400 text-xs">
                          <EyeSlashIcon className="w-3 h-3 mr-1" />
                          Draft
                        </Badge>
                      )}
                      <span className="text-white/50 text-xs">#{faq.order}</span>
                    </div>
                    
                    <h3 className="font-semibold text-white mb-2 line-clamp-2">
                      {faq.question}
                    </h3>
                    
                    <p className="text-white/70 text-sm mb-3 line-clamp-3">
                      {faq.answer}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-white/50">
                      <span>{faq.views} views</span>
                      <span>{faq.helpful} helpful</span>
                      <span>Updated {new Date(faq.updatedAt).toLocaleDateString()}</span>
                      {faq.tags.length > 0 && (
                        <div className="flex gap-1">
                          {faq.tags.slice(0, 3).map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                          {faq.tags.length > 3 && (
                            <span className="text-white/40">+{faq.tags.length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReorderFAQ(faq.id, 'up')}
                        disabled={index === 0}
                      >
                        <ArrowUpIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReorderFAQ(faq.id, 'down')}
                        disabled={index === filteredFAQs.length - 1}
                      >
                        <ArrowDownIcon className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTogglePublished(faq.id)}
                      >
                        {faq.isPublished ? (
                          <EyeSlashIcon className="w-4 h-4" />
                        ) : (
                          <EyeIcon className="w-4 h-4" />
                        )}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEdit(faq)}
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <TrashIcon className="w-4 h-4 text-red-400" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-black/90 border-white/20">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete FAQ?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete this FAQ. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteFAQ(faq.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Statistics */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-lg">FAQ Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400 mb-1">{faqs.length}</div>
              <div className="text-white/70 text-sm">Total FAQs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400 mb-1">
                {faqs.filter(f => f.isPublished).length}
              </div>
              <div className="text-white/70 text-sm">Published</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400 mb-1">
                {faqs.reduce((acc, f) => acc + f.views, 0)}
              </div>
              <div className="text-white/70 text-sm">Total Views</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400 mb-1">
                {faqs.reduce((acc, f) => acc + f.helpful, 0)}
              </div>
              <div className="text-white/70 text-sm">Helpful Votes</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
