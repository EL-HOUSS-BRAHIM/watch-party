"use client"

import { AlertTriangle, Check, CheckCircle, Clock, Download, Edit, Eye, File, FileText, Plus, Search, Settings, Trash } from "lucide-react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"

  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
interface DocumentationItem {}
  id: string
  title: string
  type: "guide" | "api" | "tutorial" | "reference" | "changelog"
  category: string
  status: "draft" | "review" | "published" | "archived"
  author: string
  lastModified: string
  version: string
  views: number
  content: string
  tags: string[]
}

interface DocumentationCategory {}
  id: string
  name: string
  description: string
  itemCount: number
  color: string
}

const mockDocuments: DocumentationItem[] = []
  {}
    id: "1",
    title: "Getting Started with WatchParty",
    type: "guide",
    category: "User Guide",
    status: "published",
    author: "John Doe",
    lastModified: "2024-01-28T10:30:00Z",
    version: "2.1.0",
    views: 1247,
    content: "# Getting Started\n\nWelcome to WatchParty...",
    tags: ["beginner", "setup", "introduction"],
  },
  {}
    id: "2",
    title: "Authentication API",
    type: "api",
    category: "API Reference",
    status: "published",
    author: "Jane Smith",
    lastModified: "2024-01-27T15:45:00Z",
    version: "2.1.0",
    views: 892,
    content: "# Authentication API\n\n## Overview\n\nThe authentication API...",
    tags: ["api", "authentication", "security"],
  },
  {}
    id: "3",
    title: "Creating Your First Watch Party",
    type: "tutorial",
    category: "Tutorials",
    status: "review",
    author: "Mike Johnson",
    lastModified: "2024-01-26T09:20:00Z",
    version: "2.0.5",
    views: 634,
    content: "# Creating Your First Watch Party\n\nIn this tutorial...",
    tags: ["tutorial", "watch-party", "beginner"],
  },
]

const mockCategories: DocumentationCategory[] = []
  {}
    id: "1",
    name: "User Guide",
    description: "End-user documentation and guides",
    itemCount: 12,
    color: "bg-blue-100 text-blue-800",
  },
  {}
    id: "2",
    name: "API Reference",
    description: "Technical API documentation",
    itemCount: 8,
    color: "bg-green-100 text-green-800",
  },
  {}
    id: "3",
    name: "Tutorials",
    description: "Step-by-step tutorials and examples",
    itemCount: 15,
    color: "bg-purple-100 text-purple-800",
  },
  {}
    id: "4",
    name: "Developer Guide",
    description: "Documentation for developers",
    itemCount: 6,
    color: "bg-orange-100 text-orange-800",
  },
]

export function DocumentationManager() {
  const [documents, setDocuments] = useState<DocumentationItem[]>(mockDocuments)
  const [categories, setCategories] = useState<DocumentationCategory[]>(mockCategories)
  const [selectedDocument, setSelectedDocument] = useState<DocumentationItem | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterCategory, setFilterCategory] = useState<string>("all")

  const createDocument = () => {}
    const newDocument: DocumentationItem = { id: Date.now().toString(),
      title: "New Document",
      type: "guide",
      category: "User Guide",
      status: "draft",
      author: "Current User",
      lastModified: new Date().toISOString(),
      version: "1.0.0",
      views: 0,
      content: "# New Document\n\nStart writing your documentation here...",
      tags: [],
    }
    setDocuments((prev) => [newDocument, ...prev])
    setSelectedDocument(newDocument)
    setEditDialogOpen(true)
  }

  const deleteDocument = (documentId: string) => {}
    setDocuments((prev) => prev.filter((doc) => doc.id !== documentId))
  }

  const getStatusColor = (status: string) => {}
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "review":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "draft":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
      case "archived":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getTypeIcon = (type: string) => {}
    switch (type) {
      case "guide":
        return <Book className="h-4 w-4" />
      case "api":
        return <Code className="h-4 w-4" />
      case "tutorial":
        return <FileText className="h-4 w-4" />
      case "reference":
        return <Search className="h-4 w-4" />
      case "changelog":
        return <Clock className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const filteredDocuments = documents.filter((doc) => {}
    const matchesSearch =
      searchQuery === "" ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesType = filterType === "all" || doc.type === filterType
    const matchesStatus = filterStatus === "all" || doc.status === filterStatus
    const matchesCategory = filterCategory === "all" || doc.category === filterCategory
    return matchesSearch && matchesType && matchesStatus && matchesCategory
  })

  const totalDocuments = documents.length
  const publishedDocuments = documents.filter((doc) => doc.status === "published").length
  const draftDocuments = documents.filter((doc) => doc.status === "draft").length
  const totalViews = documents.reduce((sum, doc) => sum + doc.views, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Documentation Manager</h1>
          <p className="text-gray-600 dark:text-gray-400">Create, manage, and organize your documentation</p>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => setSettingsDialogOpen(true)} variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Button onClick={createDocument}>
            <Plus className="mr-2 h-4 w-4" />
            New Document
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDocuments}</div>
            <div className="flex items-center text-xs text-muted-foreground">Across all categories</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{publishedDocuments}</div>
            <div className="flex items-center text-xs text-muted-foreground">Live documentation</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{draftDocuments}</div>
            <div className="flex items-center text-xs text-muted-foreground">In progress</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">All time</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="documents" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Documents */}
        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Documentation Library</CardTitle>
                  <CardDescription>Manage your documentation content</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search documents..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 w-64"
                    />
                  </div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="guide">Guide</SelectItem>
                      <SelectItem value="api">API</SelectItem>
                      <SelectItem value="tutorial">Tutorial</SelectItem>
                      <SelectItem value="reference">Reference</SelectItem>
                      <SelectItem value="changelog">Changelog</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Modified</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">{doc.title}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(doc.type)}
                          <span className="capitalize">{doc.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>{doc.category}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(doc.status)}>{doc.status}</Badge>
                      </TableCell>
                      <TableCell>{doc.author}</TableCell>
                      <TableCell>{doc.views.toLocaleString()}</TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {new Date(doc.lastModified).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {}
                              setSelectedDocument(doc)
                              setPreviewDialogOpen(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {}
                              setSelectedDocument(doc)
                              setEditDialogOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => deleteDocument(doc.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories */}
        <TabsContent value="categories" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Card key={category.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <Badge className={category.color}>{category.itemCount}</Badge>
                  </div>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="mr-2 h-4 w-4" />
                      View Docs
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Create New Category</CardTitle>
              <CardDescription>Add a new documentation category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category-name">Category Name</Label>
                  <Input id="category-name" placeholder="Enter category name" />
                </div>
                <div>
                  <Label htmlFor="category-color">Color</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select color" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blue">Blue</SelectItem>
                      <SelectItem value="green">Green</SelectItem>
                      <SelectItem value="purple">Purple</SelectItem>
                      <SelectItem value="orange">Orange</SelectItem>
                      <SelectItem value="red">Red</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="category-description">Description</Label>
                  <Textarea id="category-description" placeholder="Describe this category" />
                </div>
                <div className="md:col-span-2">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Category
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Most Viewed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {documents
                    .sort((a, b) => b.views - a.views)
                    .slice(0, 5)
                    .map((doc) => (
                      <div key={doc.id} className="flex justify-between items-center">
                        <span className="text-sm truncate">{doc.title}</span>
                        <span className="text-sm font-medium">{doc.views}</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {documents
                    .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
                    .slice(0, 5)
                    .map((doc) => (
                      <div key={doc.id} className="flex justify-between items-center">
                        <span className="text-sm truncate">{doc.title}</span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(doc.lastModified).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Published</span>
                    <span className="text-sm font-medium text-green-600">{publishedDocuments}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Draft</span>
                    <span className="text-sm font-medium text-yellow-600">{draftDocuments}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Review</span>
                    <span className="text-sm font-medium text-blue-600">
                      {documents.filter((doc) => doc.status === "review").length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Documentation Health</CardTitle>
              <CardDescription>Overview of documentation quality and completeness</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Coverage</span>
                      <span className="text-sm">85%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: "85%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Up-to-date</span>
                      <span className="text-sm">92%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: "92%" }}></div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">All API endpoints documented</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">User guides complete</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm">3 tutorials need updates</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Documentation Settings</CardTitle>
              <CardDescription>Configure documentation preferences and options</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Publishing</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Auto-publish on approval</Label>
                      <input type="checkbox" className="rounded" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Require review before publishing</Label>
                      <input type="checkbox" className="rounded" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Version control integration</Label>
                      <input type="checkbox" className="rounded" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Notifications</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Email on document updates</Label>
                      <input type="checkbox" className="rounded" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Slack notifications</Label>
                      <input type="checkbox" className="rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Review reminders</Label>
                      <input type="checkbox" className="rounded" defaultChecked />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Access Control</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Public documentation</Label>
                      <input type="checkbox" className="rounded" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Require authentication</Label>
                      <input type="checkbox" className="rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Role-based access</Label>
                      <input type="checkbox" className="rounded" defaultChecked />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Document Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Edit Document</DialogTitle>
            <DialogDescription>Edit document content and metadata</DialogDescription>
          </DialogHeader>

          {selectedDocument && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="doc-title">Title</Label>
                  <Input id="doc-title" value={selectedDocument.title} />
                </div>
                <div>
                  <Label htmlFor="doc-type">Type</Label>
                  <Select value={selectedDocument.type}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="guide">Guide</SelectItem>
                      <SelectItem value="api">API</SelectItem>
                      <SelectItem value="tutorial">Tutorial</SelectItem>
                      <SelectItem value="reference">Reference</SelectItem>
                      <SelectItem value="changelog">Changelog</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="doc-category">Category</Label>
                  <Select value={selectedDocument.category}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="doc-status">Status</Label>
                  <Select value={selectedDocument.status}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="doc-tags">Tags (comma-separated)</Label>
                <Input id="doc-tags" value={selectedDocument.tags.join(", ")} />
              </div>

              <div>
                <Label htmlFor="doc-content">Content</Label>
                <ScrollArea className="h-60">
                  <Textarea
                    id="doc-content"
                    value={selectedDocument.content}
                    className="min-h-[240px] font-mono text-sm"
                    placeholder="Write your documentation in Markdown..."
                  />
                </ScrollArea>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setEditDialogOpen(false)}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Document Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Document Preview</DialogTitle>
            <DialogDescription>Preview how the document will appear to users</DialogDescription>
          </DialogHeader>

          {selectedDocument && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center gap-2">
                  {getTypeIcon(selectedDocument.type)}
                  <span className="font-medium">{selectedDocument.title}</span>
                </div>
                <Badge className={getStatusColor(selectedDocument.status)}>{selectedDocument.status}</Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Eye className="h-3 w-3" />
                  {selectedDocument.views} views
                </div>
              </div>

              <ScrollArea className="h-96">
                <div className="prose prose-sm max-w-none p-4">
                  <pre className="whitespace-pre-wrap">{selectedDocument.content}</pre>
                </div>
              </ScrollArea>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={() => setPreviewDialogOpen(false)}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
