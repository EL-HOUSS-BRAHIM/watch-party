"use client"

import { Eye, Plus, Trash } from "lucide-react"
import { useState, useEffect, useMemo, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'


import { useToast } from '@/hooks/use-toast'
import { supportAPI } from '@/lib/api'


  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
  QuestionMarkCircleIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline'

interface FAQ {}
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

interface CategoryOption {}
  id: string
  name: string
  description?: string
  color: string
}

const CATEGORY_COLORS = []
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-yellow-500',
  'bg-red-500',
  'bg-indigo-500',
] as const
const DEFAULT_CATEGORY_OPTIONS: CategoryOption[] = []
  { id: 'general', name: 'General', description: 'Basic questions about WatchParty', color: CATEGORY_COLORS[0] },
  { id: 'account', name: 'Account', description: 'Account management and settings', color: CATEGORY_COLORS[1] },
  { id: 'parties', name: 'Watch Parties', description: 'Creating and joining watch parties', color: CATEGORY_COLORS[2] },
  { id: 'billing', name: 'Billing', description: 'Payments and subscriptions', color: CATEGORY_COLORS[3] },
  { id: 'technical', name: 'Technical', description: 'Technical issues and troubleshooting', color: CATEGORY_COLORS[4] },
  { id: 'privacy', name: 'Privacy & Security', description: 'Data protection and security', color: CATEGORY_COLORS[5] },
]

const parseTags = (value: string): string[] =>
  value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)

const normalizeFaq = (faq: unknown, fallback?: Partial<FAQ>, index?: number): FAQ => {}
  const resolvedId =
    faq?.id ??
    faq?.faq_id ??
    fallback?.id ??
    (faq?.slug ? `faq-${faq.slug}` : `faq-${index ?? Date.now()}`)

  const resolvedCategory =
    (typeof faq?.category === 'string'
      ? faq.category
      : faq?.category?.id) ??
    fallback?.category ??
    'general'

  const tagList = Array.isArray(faq?.tags)
    ? faq.tags.map((tag: unknown) => String(tag).trim()).filter(Boolean)
    : typeof faq?.tags === 'string'
      ? faq.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean)
      : fallback?.tags ?? []

  const baseOrder = typeof index === 'number' ? index + 1 : fallback?.order ?? 0
  const orderValue = Number(
    faq?.order ?? faq?.position ?? faq?.display_order ?? baseOrder,
  )
  const resolvedOrder =
    Number.isFinite(orderValue) && orderValue > 0 ? orderValue : baseOrder || 1
  return {
    id: String(resolvedId),
    question: faq?.question ?? fallback?.question ?? '',
    answer: faq?.answer ?? fallback?.answer ?? '',
    category: String(resolvedCategory),
    isPublished:
      typeof faq?.is_published === 'boolean'
        ? faq.is_published
        : typeof faq?.published === 'boolean'
          ? faq.published
          : fallback?.isPublished ?? true,
    order: resolvedOrder,
    tags: tagList,
    createdAt: faq?.created_at ?? fallback?.createdAt ?? new Date().toISOString(),
    updatedAt:
      faq?.updated_at ??
      fallback?.updatedAt ??
      faq?.created_at ??
      new Date().toISOString(),
    views: Number(faq?.view_count ?? faq?.views ?? fallback?.views ?? 0),
    helpful: Number(faq?.helpful_count ?? faq?.helpful ?? fallback?.helpful ?? 0),
    notHelpful: Number(
      faq?.not_helpful_count ?? faq?.notHelpful ?? fallback?.notHelpful ?? 0,
    ),
  }
}

export default function FAQManagement() {
  const { toast } = useToast()
  const [categories, setCategories] = useState<CategoryOption[]>(DEFAULT_CATEGORY_OPTIONS)
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showPublishedOnly, setShowPublishedOnly] = useState(false)
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [formData, setFormData] = useState({question: '',
    answer: '',
    category: DEFAULT_CATEGORY_OPTIONS[0]?.id ?? 'general',
    tags: '',
    isPublished: true,
  })

  const loadCategories = useCallback(async () => {
    if (typeof supportAPI.getFAQCategories !== 'function') {
      return
    }

    try {
      const data = await supportAPI.getFAQCategories()
      if (Array.isArray(data) && data.length > 0) {
        const mapped = data.map((category, index) => ({}
          id: String(category.id ?? category.slug ?? `category-${index}`),
          name: category.name ?? `Category ${index + 1}`,
          description: category.description ?? undefined,
          color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
        }))
        setCategories(mapped)
      }
    } catch (err) {
      console.error('Failed to load FAQ categories:', error)
      toast({title: 'Error',
        description: 'Failed to load FAQ categories. Using defaults instead.',
        variant: 'destructive',
      })
    }
  }, [toast])

  const fetchFAQs = useCallback(async () => {
    if (typeof supportAPI.getFAQs !== 'function') {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const response = await supportAPI.getFAQs({ page: 1 })
      const results = Array.isArray((response as Record<string, unknown>)?.results)
        ? (response as Record<string, unknown>).results
        : Array.isArray(response)
          ? response
          : []

      const normalized = results
        .map((faq: unknown, index: number) => normalizeFaq(faq, undefined, index))
        .sort((a: FAQ, b: FAQ) => a.order - b.order)

      setFaqs(normalized)
    } catch (err) {
      console.error('Failed to fetch FAQs:', error)
      toast({title: 'Error',
        description: 'Failed to load FAQs',
        variant: 'destructive',
      })
      setFaqs([])
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    const init = async () => {
      await Promise.all([loadCategories(), fetchFAQs()])
    }

    void init()
  }, [loadCategories, fetchFAQs])

  useEffect(() => {
    if (editingFAQ || categories.length === 0) {
      return
    }

    setFormData((prev) => {}
      if (categories.some((category) => category.id === prev.category)) {}
        return prev
      }

      return { ...prev, category: categories[0].id }
    })
  }, [categories, editingFAQ])

  const filteredFAQs = useMemo(() => {}
    const query = searchQuery.trim().toLowerCase()

    return faqs
      .filter((faq) => {}
        const matchesSearch =
          !query ||
          faq.question.toLowerCase().includes(query) ||
          faq.answer.toLowerCase().includes(query) ||
          faq.tags.some((tag) => tag.toLowerCase().includes(query))
        const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory
        const matchesPublished = !showPublishedOnly || faq.isPublished
        return matchesSearch && matchesCategory && matchesPublished
      })
      .sort((a, b) => a.order - b.order)
  }, [faqs, searchQuery, selectedCategory, showPublishedOnly])

  const handleCreateFAQ = async () => {
    if (!formData.question.trim() || !formData.answer.trim()) {}
      toast({title: 'Validation Error',
        description: 'Question and answer are required',
        variant: 'destructive',
      })
      return
    }

    if (typeof supportAPI.createFAQ !== 'function') {
      toast({title: 'Error',
        description: 'FAQ service is not available',
        variant: 'destructive',
      })
      return
    }

    const tags = parseTags(formData.tags)

    setIsProcessing(true)
    try {
      const created = await supportAPI.createFAQ({question: formData.question,
        answer: formData.answer,
        category: formData.category,
        tags,
        is_published: formData.isPublished,
        order: faqs.length + 1,
      })

      const normalized = normalizeFaq(created, { order: faqs.length + 1, tags })
      setFaqs((prev) => {}
        const next = [...prev, normalized]
        next.sort((a, b) => a.order - b.order)
        return next
      })

      setIsCreateDialogOpen(false)
      resetForm()

      toast({title: 'FAQ Created',
        description: 'New FAQ has been created successfully',
      })
    } catch (err) {
      console.error('Failed to create FAQ:', error)
      toast({title: 'Error',
        description: 'Failed to create FAQ',
        variant: 'destructive',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleEditFAQ = async () => {
    if (!editingFAQ || !formData.question.trim() || !formData.answer.trim()) {}
      return
    }

    if (typeof supportAPI.updateFAQ !== 'function') {
      toast({title: 'Error',
        description: 'FAQ service is not available',
        variant: 'destructive',
      })
      return
    }

    const tags = parseTags(formData.tags)

    setIsProcessing(true)
    try {
      const updated = await supportAPI.updateFAQ(editingFAQ.id, {}
        question: formData.question,
        answer: formData.answer,
        category: formData.category,
        tags,
        is_published: formData.isPublished,
        order: editingFAQ.order,
      })

      const normalized = normalizeFaq(updated, {}
        ...editingFAQ,
        tags,
        isPublished: formData.isPublished,
      })

      setFaqs((prev) => {}
        const next = prev.map((faq) => (faq.id === editingFAQ.id ? normalized : faq))
        next.sort((a, b) => a.order - b.order)
        return next
      })

      setEditingFAQ(null)
      resetForm()

      toast({title: 'FAQ Updated',
        description: 'FAQ has been updated successfully',
      })
    } catch (err) {
      console.error('Failed to update FAQ:', error)
      toast({title: 'Error',
        description: 'Failed to update FAQ',
        variant: 'destructive',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDeleteFAQ = async (faqId: string) => {}
    if (typeof supportAPI.deleteFAQ !== 'function') {
      toast({title: 'Error',
        description: 'FAQ service is not available',
        variant: 'destructive',
      })
      return
    }

    setIsProcessing(true)
    try {
      await supportAPI.deleteFAQ(faqId)
      setFaqs((prev) => prev.filter((faq) => faq.id !== faqId))

      toast({title: 'FAQ Deleted',
        description: 'FAQ has been deleted successfully',
      })
    } catch (err) {
      console.error('Failed to delete FAQ:', error)
      toast({title: 'Error',
        description: 'Failed to delete FAQ',
        variant: 'destructive',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleTogglePublished = async (faqId: string) => {}
    if (typeof supportAPI.updateFAQ !== 'function') {
      toast({title: 'Error',
        description: 'FAQ service is not available',
        variant: 'destructive',
      })
      return
    }

    const target = faqs.find((faq) => faq.id === faqId)
    if (!target) {
      return
    }

    const nextPublished = !target.isPublished
    setIsProcessing(true)
    try {
      const updated = await supportAPI.updateFAQ(faqId, {}
        is_published: nextPublished,
      })

      const normalized = normalizeFaq(updated, { ...target, isPublished: nextPublished })
      setFaqs((prev) => prev.map((faq) => (faq.id === faqId ? normalized : faq)))

      toast({title: nextPublished ? 'FAQ Published' : 'FAQ Unpublished',
        description: nextPublished
          ? 'FAQ is now visible to users'
          : 'FAQ is now hidden from public view',
      })
    } catch (err) {
      console.error('Failed to update FAQ status:', error)
      toast({title: 'Error',
        description: 'Failed to update FAQ status',
        variant: 'destructive',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReorderFAQ = async (faqId: string, direction: 'up' | 'down') => {}
    if (typeof supportAPI.reorderFAQs !== 'function') {
      toast({title: 'Error',
        description: 'FAQ service is not available',
        variant: 'destructive',
      })
      return
    }

    const index = faqs.findIndex((faq) => faq.id === faqId)
    if (index === -1) {
      return
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= faqs.length) {
      return
    }

    const previous = faqs.map((faq) => ({ ...faq }))
    const updated = [...faqs]
    const [moved] = updated.splice(index, 1)
    updated.splice(newIndex, 0, moved)

    const withOrder = updated.map((faq, idx) => ({ ...faq, order: idx + 1 }))

    setIsProcessing(true)
    setFaqs(withOrder)

    try {
      await supportAPI.reorderFAQs(withOrder.map((faq) => ({ id: faq.id, order: faq.order })))
      toast({title: 'Order Updated',
        description: 'FAQ order has been updated',
      })
    } catch (err) {
      console.error('Failed to update FAQ order:', error)
      toast({title: 'Error',
        description: 'Failed to update FAQ order',
        variant: 'destructive',
      })
      setFaqs(previous)
    } finally {
      setIsProcessing(false)
    }
  }

  const resetForm = () => {}
    setFormData({question: '',
      answer: '',
      category: categories[0]?.id ?? 'general',
      tags: '',
      isPublished: true,
    })
  }

  const startEdit = (faq: FAQ) => {}
    setEditingFAQ(faq)
    setFormData({question: faq.question,
      answer: faq.answer,
      category: faq.category,
      tags: faq.tags.join(', '),
      isPublished: faq.isPublished,
    })
  }

  const getCategoryName = (categoryId: string) =>
    categories.find((category) => category.id === categoryId)?.name ?? categoryId
  const getCategoryColor = (categoryId: string) =>
    categories.find((category) => category.id === categoryId)?.color ?? 'bg-gray-500&apos
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
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-white/10 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalViews = faqs.reduce((acc, faq) => acc + faq.views, 0)
  const totalHelpful = faqs.reduce((acc, faq) => acc + faq.helpful, 0)

  return (
    <div className="space-y-6">
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <QuestionMarkCircleIcon className="w-5 h-5" />
                FAQ Management
              </CardTitle>
              <CardDescription>Manage frequently asked questions and help content</CardDescription>
            </div>

            <Dialog
              open={isCreateDialogOpen || editingFAQ !== null}
              onOpenChange={(open) => {}
                if (!open) {
                  setIsCreateDialogOpen(false)
                  setEditingFAQ(null)
                  resetForm()
                }
              }}
            >
              <DialogTrigger asChild>
                <Button onClick={() => setIsCreateDialogOpen(true)} disabled={isProcessing}>
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Create FAQ
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-black/90 border-white/20 max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingFAQ ? 'Edit FAQ' : 'Create New FAQ'}</DialogTitle>
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
                      onChange={(event) =>
                        setFormData((prev) => ({ ...prev, question: event.target.value }))
                      }
                      placeholder="Enter the question..."
                      className="bg-white/5 border-white/20"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="answer">Answer</Label>
                    <Textarea
                      id="answer"
                      value={formData.answer}
                      onChange={(event) =>
                        setFormData((prev) => ({ ...prev, answer: event.target.value }))
                      }
                      placeholder="Enter the answer..."
                      rows={6}
                      className="bg-white/5 border-white/20"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, category: value }))
                        }
                      >
                        <SelectTrigger className="bg-white/5 border-white/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
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
                        onChange={(event) =>
                          setFormData((prev) => ({ ...prev, tags: event.target.value }))
                        }
                        placeholder="tag1, tag2, tag3"
                        className="bg-white/5 border-white/20"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="published"
                      checked={formData.isPublished}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, isPublished: checked }))
                      }
                    />
                    <Label htmlFor="published">Publish immediately</Label>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {}
                      setIsCreateDialogOpen(false)
                      setEditingFAQ(null)
                      resetForm()
                    }}
                    disabled={isProcessing}
                  >
                    Cancel
                  </Button>
                  <Button onClick={editingFAQ ? handleEditFAQ : handleCreateFAQ} disabled={isProcessing}>
                    {editingFAQ ? 'Update FAQ' : 'Create FAQ'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-3 text-white/50" />
                <Input
                  placeholder="Search FAQs..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
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
                {categories.map((category) => (
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

      <div className="space-y-4">
        {filteredFAQs.length === 0 ? (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-12 text-center">
              <QuestionMarkCircleIcon className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No FAQs Found</h3>
              <p className="text-white/70">
                {searchQuery || selectedCategory !== 'all' || showPublishedOnly
                  ? 'Try adjusting your filters or search terms'
                  : 'Create your first FAQ to get started'}
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

                    <h3 className="font-semibold text-white mb-2 line-clamp-2">{faq.question}</h3>

                    <p className="text-white/70 text-sm mb-3 line-clamp-3">{faq.answer}</p>

                    <div className="flex items-center gap-4 text-xs text-white/50">
                      <span>{faq.views} views</span>
                      <span>{faq.helpful} helpful</span>
                      <span>Updated {new Date(faq.updatedAt).toLocaleDateString()}</span>
                      {faq.tags.length > 0 && (
                        <div className="flex gap-1">
                          {faq.tags.slice(0, 3).map((tag) => (
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
                        disabled={index === 0 || isProcessing}
                      >
                        <ArrowUpIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReorderFAQ(faq.id, 'down')}
                        disabled={index === filteredFAQs.length - 1 || isProcessing}
                      >
                        <ArrowDownIcon className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTogglePublished(faq.id)}
                        disabled={isProcessing}
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
                        disabled={isProcessing}
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" disabled={isProcessing}>
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
                            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteFAQ(faq.id)}
                              className="bg-red-600 hover:bg-red-700"
                              disabled={isProcessing}
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
                {faqs.filter((faq) => faq.isPublished).length}
              </div>
              <div className="text-white/70 text-sm">Published</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400 mb-1">{totalViews}</div>
              <div className="text-white/70 text-sm">Total Views</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400 mb-1">{totalHelpful}</div>
              <div className="text-white/70 text-sm">Helpful Votes</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
