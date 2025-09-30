"use client"

import { useState, useEffect } from "react"
import api from "@/lib/api-client"

interface Documentation {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  author: {
    id: string
    username: string
    avatar?: string
  }
  created_at: string
  updated_at: string
  views: number
  helpful_count: number
  user_found_helpful?: boolean
}

interface DocCategory {
  id: string
  name: string
  description: string
  icon: string
  doc_count: number
  subcategories?: DocCategory[]
}

export default function DocumentationPage() {
  const [docs, setDocs] = useState<Documentation[]>([])
  const [categories, setCategories] = useState<DocCategory[]>([])
  const [selectedDoc, setSelectedDoc] = useState<Documentation | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterDocs()
  }, [selectedCategory, searchQuery])

  const loadData = async () => {
    try {
      const [docsResponse, categoriesResponse] = await Promise.all([
        api.get("/support/docs/"),
        api.get("/support/docs/categories/")
      ])
      
      setDocs(docsResponse.results || [])
      setCategories(categoriesResponse.results || [])
    } catch (error) {
      console.error("Failed to load documentation:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterDocs = async () => {
    try {
      const params = new URLSearchParams()
      if (selectedCategory !== "all") {
        params.append("category", selectedCategory)
      }
      if (searchQuery) {
        params.append("search", searchQuery)
      }

      const response = await api.get(`/support/docs/?${params.toString()}`)
      setDocs(response.results || [])
    } catch (error) {
      console.error("Failed to filter docs:", error)
    }
  }

  const viewDocument = async (doc: Documentation) => {
    setSelectedDoc(doc)
    
    // Track view
    try {
      await api.post(`/support/docs/${doc.id}/view/`)
      
      // Update view count locally
      setDocs(prev => prev.map(d => 
        d.id === doc.id ? { ...d, views: d.views + 1 } : d
      ))
    } catch (error) {
      console.error("Failed to track view:", error)
    }
  }

  const markAsHelpful = async (id: string, helpful: boolean) => {
    try {
      await api.post(`/support/docs/${id}/helpful/`, { helpful })
      
      // Update local state
      setDocs(prev => prev.map(doc => 
        doc.id === id 
          ? { 
              ...doc, 
              helpful_count: helpful 
                ? doc.helpful_count + (doc.user_found_helpful ? 0 : 1)
                : doc.helpful_count - (doc.user_found_helpful ? 1 : 0),
              user_found_helpful: helpful
            }
          : doc
      ))

      if (selectedDoc && selectedDoc.id === id) {
        setSelectedDoc(prev => prev ? {
          ...prev,
          helpful_count: helpful 
            ? prev.helpful_count + (prev.user_found_helpful ? 0 : 1)
            : prev.helpful_count - (prev.user_found_helpful ? 1 : 0),
          user_found_helpful: helpful
        } : null)
      }
    } catch (error) {
      console.error("Failed to mark as helpful:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-white/10 rounded w-1/3"></div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="h-96 bg-white/10 rounded"></div>
              <div className="lg:col-span-3 h-96 bg-white/10 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (selectedDoc) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => setSelectedDoc(null)}
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              ← Back to Documentation
            </button>
          </div>

          {/* Document */}
          <article className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
            {/* Document Header */}
            <div className="p-6 border-b border-white/10">
              <h1 className="text-3xl font-bold text-white mb-4">{selectedDoc.title}</h1>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-white/60">
                  <div className="flex items-center gap-2">
                    {selectedDoc.author.avatar && (
                      <img
                        src={selectedDoc.author.avatar}
                        alt={selectedDoc.author.username}
                        className="w-6 h-6 rounded-full"
                      />
                    )}
                    <span>By {selectedDoc.author.username}</span>
                  </div>
                  <span>•</span>
                  <span>{new Date(selectedDoc.updated_at).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{selectedDoc.views} views</span>
                </div>

                {selectedDoc.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {selectedDoc.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Document Content */}
            <div className="p-6">
              <div
                className="prose prose-invert max-w-none text-white/90"
                dangerouslySetInnerHTML={{ __html: selectedDoc.content }}
              />
            </div>

            {/* Document Footer */}
            <div className="p-6 border-t border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-white/60 text-sm">Was this helpful?</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => markAsHelpful(selectedDoc.id, true)}
                      className={`px-4 py-2 rounded text-sm transition-colors ${
                        selectedDoc.user_found_helpful === true
                          ? "bg-green-600 text-white"
                          : "bg-white/10 text-white/60 hover:bg-green-600/20 hover:text-green-400"
                      }`}
                    >
                      👍 Yes ({selectedDoc.helpful_count})
                    </button>
                    <button
                      onClick={() => markAsHelpful(selectedDoc.id, false)}
                      className={`px-4 py-2 rounded text-sm transition-colors ${
                        selectedDoc.user_found_helpful === false
                          ? "bg-red-600 text-white"
                          : "bg-white/10 text-white/60 hover:bg-red-600/20 hover:text-red-400"
                      }`}
                    >
                      👎 No
                    </button>
                  </div>
                </div>

                <a
                  href="/dashboard/support"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                >
                  Need More Help?
                </a>
              </div>
            </div>
          </article>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Documentation</h1>
          <p className="text-white/60">Comprehensive guides and tutorials</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search docs..."
                  className="w-full px-4 py-3 pl-10 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50">
                  🔍
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <h3 className="font-semibold text-white mb-4">Categories</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`w-full text-left px-3 py-2 rounded transition-colors ${
                    selectedCategory === "all"
                      ? "bg-blue-600/20 text-blue-400"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  All Documentation
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-3 py-2 rounded transition-colors ${
                      selectedCategory === category.id
                        ? "bg-blue-600/20 text-blue-400"
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{category.icon}</span>
                      <span>{category.name}</span>
                      <span className="text-xs opacity-60">({category.doc_count})</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {docs.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-lg p-12 text-center">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-xl font-semibold text-white mb-2">No Documentation Found</h3>
                <p className="text-white/60 mb-6">
                  {searchQuery || selectedCategory !== "all"
                    ? "No documentation matches your search criteria."
                    : "No documentation is available yet."
                  }
                </p>
                {(searchQuery || selectedCategory !== "all") && (
                  <div className="space-x-4">
                    <button
                      onClick={() => setSearchQuery("")}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Clear Search
                    </button>
                    <button
                      onClick={() => setSelectedCategory("all")}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                    >
                      View All
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-white/60 text-sm mb-4">
                  {docs.length} document{docs.length !== 1 ? "s" : ""} found
                </div>

                {docs.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => viewDocument(doc)}
                    className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-6 text-left transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-white mb-2 pr-4">{doc.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-white/60 flex-shrink-0">
                        {doc.helpful_count > 0 && (
                          <span className="text-green-400">
                            👍 {doc.helpful_count}
                          </span>
                        )}
                        <span>{doc.views} views</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-sm text-white/60">
                        <div className="flex items-center gap-1">
                          {doc.author.avatar && (
                            <img
                              src={doc.author.avatar}
                              alt={doc.author.username}
                              className="w-4 h-4 rounded-full"
                            />
                          )}
                          <span>{doc.author.username}</span>
                        </div>
                        <span>•</span>
                        <span>{new Date(doc.updated_at).toLocaleDateString()}</span>
                      </div>

                      {doc.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {doc.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded"
                            >
                              {tag}
                            </span>
                          ))}
                          {doc.tags.length > 3 && (
                            <span className="text-white/40 text-xs">
                              +{doc.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}