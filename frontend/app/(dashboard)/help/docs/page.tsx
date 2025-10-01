"use client"

import { FormEvent, useState } from "react"
import { supportApi } from "@/lib/api-client"

interface FAQResult {
  id: string
  question: string
  answer: string
  category_name?: string
  helpful_votes?: number
  updated_at: string
}

interface FeatureRequestResult {
  id: string
  title: string
  description: string
  status: string
  feedback_type: string
  upvotes: number
  downvotes: number
  user_vote?: "up" | "down" | null
  created_at: string
}

interface HelpSearchResults {
  query: string
  results?: {
    faqs?: FAQResult[]
    feature_requests?: FeatureRequestResult[]
  }
  total_results?: number
}

export default function DocumentationPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState<HelpSearchResults | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const query = searchQuery.trim()
    if (!query) {
      setError("Enter a keyword to search the help center.")
      setResults(null)
      return
    }

    setSearching(true)
    setError(null)

    try {
      const response = await supportApi.search(query)
      if (response && typeof response === "object") {
        if ("success" in response && (response as any).success === false) {
          setError((response as any).message || "We couldn't search the help center. Please try again.")
          setResults(null)
        } else {
          setResults(response as HelpSearchResults)
        }
      } else {
        setResults(null)
      }
    } catch (err) {
      console.error("Failed to search help content:", err)
      setError("We couldn't search the help center. Please try again.")
      setResults(null)
    } finally {
      setSearching(false)
    }
  }

  const faqResults = results?.results?.faqs ?? []
  const featureResults = results?.results?.feature_requests ?? []

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-white mb-3">Documentation &amp; Guides</h1>
          <p className="text-white/60">
            Search across FAQs and feature updates to find the answers you need. If you can't
            find something, reach out to our support team.
          </p>
        </header>

        <form onSubmit={handleSearch} className="max-w-3xl mx-auto mb-10">
          <div className="relative">
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search the help center..."
              className="w-full px-4 py-3 pl-12 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Search documentation"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">🔍</div>
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-4 justify-center">
            <button
              type="submit"
              disabled={searching}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/60 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              {searching ? "Searching..." : "Search"}
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("")
                setResults(null)
                setError(null)
              }}
              className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              Clear
            </button>
          </div>
        </form>

        {error && (
          <div className="max-w-3xl mx-auto mb-8 p-4 border border-red-500/40 bg-red-500/10 text-red-200 rounded-lg">
            {error}
          </div>
        )}

        {!results && !error && (
          <section className="max-w-4xl mx-auto text-center bg-white/5 border border-white/10 rounded-xl p-10">
            <h2 className="text-2xl font-semibold text-white mb-3">Looking for documentation?</h2>
            <p className="text-white/60 mb-6">
              The Watch Party documentation is evolving. Use the search above to explore active FAQs
              and community feature requests, or browse the FAQ section for curated answers.
            </p>
            <a
              href="/dashboard/help/faq"
              className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Visit FAQs
            </a>
          </section>
        )}

        {results && (
          <section className="space-y-10">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-6">
                <h2 className="text-xl font-semibold text-white">FAQ Articles</h2>
                <span className="text-white/50 text-sm">
                  {faqResults.length} result{faqResults.length === 1 ? "" : "s"}
                </span>
              </div>

              {faqResults.length === 0 ? (
                <p className="text-white/50 text-sm">No FAQ articles matched "{results.query}".</p>
              ) : (
                <div className="space-y-4">
                  {faqResults.map((faq) => (
                    <article key={faq.id} className="bg-black/40 border border-white/10 rounded-lg p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-medium text-white mb-2">{faq.question}</h3>
                          <div
                            className="text-white/70 prose prose-invert max-w-none text-sm"
                            dangerouslySetInnerHTML={{ __html: faq.answer }}
                          />
                        </div>
                        {typeof faq.helpful_votes === "number" && faq.helpful_votes > 0 && (
                          <span className="flex-shrink-0 text-xs text-green-400 bg-green-500/10 border border-green-500/30 rounded-full px-3 py-1">
                            👍 {faq.helpful_votes}
                          </span>
                        )}
                      </div>
                      <div className="mt-4 flex items-center justify-between text-xs text-white/40">
                        <span>{faq.category_name || "General"}</span>
                        <span>Updated {new Date(faq.updated_at).toLocaleDateString()}</span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-6">
                <h2 className="text-xl font-semibold text-white">Feature Updates &amp; Requests</h2>
                <span className="text-white/50 text-sm">
                  {featureResults.length} result{featureResults.length === 1 ? "" : "s"}
                </span>
              </div>

              {featureResults.length === 0 ? (
                <p className="text-white/50 text-sm">No feature updates matched "{results.query}".</p>
              ) : (
                <div className="space-y-4">
                  {featureResults.map((feature) => (
                    <article key={feature.id} className="bg-black/40 border border-white/10 rounded-lg p-5">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-white mb-1">{feature.title}</h3>
                          <p className="text-white/60 text-sm mb-3 whitespace-pre-line">{feature.description}</p>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-white/50">
                            <span className="px-2 py-1 rounded-full bg-blue-600/20 text-blue-300">
                              {feature.feedback_type.replace(/_/g, " ")}
                            </span>
                            <span className="px-2 py-1 rounded-full bg-white/10 text-white/60">Status: {feature.status}</span>
                          </div>
                        </div>
                        <div className="flex-shrink-0 flex items-center gap-2 text-xs text-white/60">
                          <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-300 border border-green-500/30">
                            👍 {feature.upvotes}
                          </span>
                          <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-300 border border-red-500/30">
                            👎 {feature.downvotes}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 text-xs text-white/40">
                        Submitted {new Date(feature.created_at).toLocaleDateString()}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>

            <footer className="text-center text-white/50 text-sm pb-4">
              {typeof results.total_results === "number" && (
                <p className="mb-2">{results.total_results} total matches for "{results.query}".</p>
              )}
              <p>
                Need more details? Contact our support team and we'll point you to the right resource.
              </p>
              <a
                href="/dashboard/support"
                className="inline-flex items-center gap-2 px-4 py-2 mt-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Contact Support
              </a>
            </footer>
          </section>
        )}
      </div>
    </div>
  )
}
