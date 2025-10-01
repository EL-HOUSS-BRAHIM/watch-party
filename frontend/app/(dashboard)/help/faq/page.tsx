"use client"

import { useState, useEffect } from "react"
import { supportApi } from "@/lib/api-client"

interface FAQItem {
  id: string
  question: string
  answer: string
  category_name?: string
  keywords?: string
  helpful_votes?: number
  unhelpful_votes?: number
  view_count?: number
  created_at: string
  updated_at: string
  user_vote?: "helpful" | "unhelpful" | null
}

interface FAQCategory {
  slug: string
  name: string
  description: string
  icon: string
  faq_count: number
}

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQItem[]>([])
  const [categories, setCategories] = useState<FAQCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterFAQs()
  }, [selectedCategory, searchQuery])

  const loadData = async () => {
    try {
      const [faqResponse, categoryResponse] = await Promise.all([
        supportApi.getFAQs(),
        supportApi.getFAQCategories(),
      ])

      setFaqs(faqResponse?.faqs || [])
      setCategories(categoryResponse?.categories || [])
    } catch (error) {
      console.error("Failed to load FAQ data:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterFAQs = async () => {
    try {
      const params: Record<string, string> = {}
      if (selectedCategory !== "all") {
        params.category = selectedCategory
      }
      if (searchQuery) {
        params.search = searchQuery
      }

      const response = await supportApi.getFAQs(params)
      setFaqs(response?.faqs || [])
    } catch (error) {
      console.error("Failed to filter FAQs:", error)
    }
  }

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
        supportApi.viewFAQ(id).catch(() => undefined)
      }
      return newSet
    })
  }

  const markAsHelpful = async (id: string, helpful: boolean) => {
    try {
      const response = await supportApi.voteFAQ(id, helpful ? "helpful" : "unhelpful")

      setFaqs(prev => prev.map(faq =>
        faq.id === id
          ? {
              ...faq,
              helpful_votes: response?.helpful_votes ?? faq.helpful_votes,
              unhelpful_votes: response?.unhelpful_votes ?? faq.unhelpful_votes,
              user_vote: helpful ? "helpful" : "unhelpful",
            }
          : faq
      ))
    } catch (error) {
      console.error("Failed to mark as helpful:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-white/10 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-white/10 rounded"></div>
              ))}
            </div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-20 bg-white/10 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Frequently Asked Questions</h1>
          <p className="text-white/60">Find quick answers to common questions</p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search FAQ..."
              className="w-full px-4 py-3 pl-12 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50">
              🔍
            </div>
          </div>
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Browse by Category</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`p-4 border rounded-lg text-left transition-all ${
                  selectedCategory === "all"
                    ? "bg-blue-600/20 border-blue-600/30 text-blue-400"
                    : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                }`}
              >
                <div className="text-2xl mb-2">📋</div>
                <h3 className="font-medium mb-1">All Categories</h3>
                <p className="text-sm opacity-80">
                  {faqs.length} questions
                </p>
              </button>

              {categories.map((category) => (
                <button
                  key={category.slug}
                  onClick={() => setSelectedCategory(category.slug)}
                  className={`p-4 border rounded-lg text-left transition-all ${
                    selectedCategory === category.slug
                      ? "bg-blue-600/20 border-blue-600/30 text-blue-400"
                      : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                  }`}
                >
                  <div className="text-2xl mb-2">{category.icon}</div>
                  <h3 className="font-medium mb-1">{category.name}</h3>
                  <p className="text-sm opacity-80">
                    {category.faq_count} question{category.faq_count !== 1 ? "s" : ""}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-lg p-12 text-center">
              <div className="text-6xl mb-4">❓</div>
              <h3 className="text-xl font-semibold text-white mb-2">No FAQs Found</h3>
              <p className="text-white/60 mb-6">
                {searchQuery || selectedCategory !== "all"
                  ? "No questions match your search criteria."
                  : "No frequently asked questions are available yet."
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
            <>
              <div className="text-white/60 text-sm mb-4">
                {faqs.length} question{faqs.length !== 1 ? "s" : ""} found
              </div>

              {faqs.map((faq) => {
                const isExpanded = expandedItems.has(faq.id)
                const normalizedKeywords = faq.keywords
                  ? Array.from(
                      new Set(
                        faq.keywords
                          .split(",")
                          .map(keyword => keyword.trim())
                          .filter(Boolean)
                      )
                    )
                  : []
                const isHelpfulSelected = faq.user_vote === "helpful"
                const isUnhelpfulSelected = faq.user_vote === "unhelpful"
                
                return (
                  <div
                    key={faq.id}
                    className="bg-white/5 border border-white/10 rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() => toggleExpanded(faq.id)}
                      className="w-full p-6 text-left hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-white pr-4">{faq.question}</h3>
                        <div className="flex items-center gap-3 flex-shrink-0 text-xs text-white/50">
                          {typeof faq.helpful_votes === 'number' && faq.helpful_votes > 0 && (
                            <span className="text-green-400">👍 {faq.helpful_votes}</span>
                          )}
                          {typeof faq.view_count === 'number' && (
                            <span>👁️ {faq.view_count}</span>
                          )}
                          <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                            ⌄
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-2 text-xs text-white/50">
                        {faq.category_name && (
                          <span className="px-2 py-1 bg-white/10 rounded-full">{faq.category_name}</span>
                        )}
                        {normalizedKeywords.slice(0, 3).map(keyword => (
                          <span
                            key={keyword}
                            className="px-2 py-1 bg-blue-600/20 text-blue-300 rounded-full"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-white/10 p-6">
                        <div
                          className="text-white/80 prose prose-invert max-w-none mb-6"
                          dangerouslySetInnerHTML={{ __html: faq.answer }}
                        />

                        {/* Helpful Rating */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-white/60 text-sm">Was this helpful?</span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => markAsHelpful(faq.id, true)}
                                disabled={isHelpfulSelected}
                                className={`px-3 py-1 rounded text-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed ${
                                  isHelpfulSelected
                                    ? "bg-green-600 text-white"
                                    : "bg-white/10 text-white/60 hover:bg-green-600/20 hover:text-green-400"
                                }`}
                              >
                                👍 Yes{typeof faq.helpful_votes === "number" ? ` (${faq.helpful_votes})` : ""}
                              </button>
                              <button
                                onClick={() => markAsHelpful(faq.id, false)}
                                disabled={isUnhelpfulSelected}
                                className={`px-3 py-1 rounded text-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed ${
                                  isUnhelpfulSelected
                                    ? "bg-red-600 text-white"
                                    : "bg-white/10 text-white/60 hover:bg-red-600/20 hover:text-red-400"
                                }`}
                              >
                                👎 No{typeof faq.unhelpful_votes === "number" ? ` (${faq.unhelpful_votes})` : ""}
                              </button>
                            </div>
                          </div>

                          <div className="text-white/40 text-xs">
                            Updated {new Date(faq.updated_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </>
          )}
        </div>

        {/* Contact Support */}
        <div className="mt-12 bg-blue-600/10 border border-blue-600/20 rounded-lg p-6 text-center">
          <h3 className="text-xl font-semibold text-white mb-2">Still Need Help?</h3>
          <p className="text-white/60 mb-4">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <a
            href="/dashboard/support"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  )
}