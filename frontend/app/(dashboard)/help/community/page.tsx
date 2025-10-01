"use client"

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react"
import { supportApi } from "@/lib/api-client"

interface FeedbackItem {
  id: string
  title: string
  description: string
  feedback_type: string
  status: string
  upvotes: number
  downvotes: number
  vote_score?: number
  user_vote?: "up" | "down" | null
  admin_response?: string
  user_name?: string
  created_at: string
  updated_at: string
}

interface FeedbackResponse {
  feedback?: FeedbackItem[]
  total_count?: number
}

const FEEDBACK_TYPES = [
  { label: "All feedback", value: "all" },
  { label: "Feature requests", value: "feature" },
  { label: "Bug reports", value: "bug" },
  { label: "Support topics", value: "support" },
]

const STATUS_FILTERS = [
  { label: "Any status", value: "all" },
  { label: "Planned", value: "planned" },
  { label: "In progress", value: "in_progress" },
  { label: "Completed", value: "completed" },
  { label: "Declined", value: "declined" },
]

const DEFAULT_FORM = {
  title: "",
  description: "",
  feedback_type: "feature" as FeedbackItem["feedback_type"],
}

export default function CommunityPage() {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [showMine, setShowMine] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formState, setFormState] = useState(DEFAULT_FORM)
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const loadFeedback = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params: Record<string, string> = {}
      if (filterType !== "all") {
        params.type = filterType
      }
      if (statusFilter !== "all") {
        params.status = statusFilter
      }
      if (showMine) {
        params.my_feedback = "true"
      }

      const response = await supportApi.getFeedback(params)

      if (response && typeof response === "object" && "success" in response && (response as any).success === false) {
        setError((response as any).message || "Unable to load feedback right now.")
        setFeedback([])
        setTotalCount(0)
      } else {
        const data = response as FeedbackResponse
        setFeedback(data?.feedback ?? [])
        setTotalCount(data?.total_count ?? (data?.feedback?.length ?? 0))
      }
    } catch (err) {
      console.error("Failed to load community feedback:", err)
      setError("We couldn't load community feedback. Please try again later.")
      setFeedback([])
      setTotalCount(0)
    } finally {
      setLoading(false)
    }
  }, [filterType, showMine, statusFilter])

  useEffect(() => {
    loadFeedback()
  }, [loadFeedback])

  const handleVote = async (item: FeedbackItem, vote: "up" | "down") => {
    if (item.user_vote === vote) {
      return
    }

    try {
      const response = await supportApi.voteFeedback(item.id, vote)
      setFeedback(prev =>
        prev.map(feedbackItem =>
          feedbackItem.id === item.id
            ? {
                ...feedbackItem,
                upvotes: response?.upvotes ?? feedbackItem.upvotes,
                downvotes: response?.downvotes ?? feedbackItem.downvotes,
                vote_score: response?.vote_score ?? feedbackItem.vote_score,
                user_vote: vote,
              }
            : feedbackItem
        )
      )
    } catch (err) {
      console.error("Failed to vote on feedback:", err)
      setError("We couldn't record your vote. Please try again.")
    }
  }

  const handleSubmitFeedback = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!formState.title.trim() || !formState.description.trim()) {
      setFormError("Please provide both a title and description for your feedback.")
      return
    }

    setSubmitting(true)
    setFormError(null)

    try {
      const payload = {
        title: formState.title.trim(),
        description: formState.description.trim(),
        feedback_type: formState.feedback_type,
      }

      const response = await supportApi.submitFeedback(payload)

      if (response && typeof response === "object" && "success" in response && (response as any).success === false) {
        const message = (response as any).message || "We couldn't submit your feedback."
        setFormError(message)
      } else {
        const created = (response as { feedback?: FeedbackItem })?.feedback
        if (created) {
          setFeedback(prev => [created, ...prev])
          setTotalCount(prev => prev + 1)
        } else {
          await loadFeedback()
        }
        setFormState(DEFAULT_FORM)
        setShowForm(false)
      }
    } catch (err) {
      console.error("Failed to submit feedback:", err)
      setFormError("We couldn't submit your feedback. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const activeFilters = useMemo(() => {
    const filters: string[] = []
    if (filterType !== "all") {
      filters.push(FEEDBACK_TYPES.find(option => option.value === filterType)?.label ?? filterType)
    }
    if (statusFilter !== "all") {
      filters.push(STATUS_FILTERS.find(option => option.value === statusFilter)?.label ?? statusFilter)
    }
    if (showMine) {
      filters.push("My submissions")
    }
    return filters
  }, [filterType, showMine, statusFilter])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="text-center space-y-3">
          <h1 className="text-3xl font-bold text-white">Community Feedback</h1>
          <p className="text-white/60 max-w-3xl mx-auto">
            Share product ideas, report issues, and track what the Watch Party team is working on. Vote on
            feedback to help us prioritise the roadmap.
          </p>
        </header>

        <section className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <label className="text-sm text-white/60">
              Type
              <select
                value={filterType}
                onChange={(event) => setFilterType(event.target.value)}
                className="block mt-1 w-44 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {FEEDBACK_TYPES.map(option => (
                  <option key={option.value} value={option.value} className="bg-gray-900 text-white">
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm text-white/60">
              Status
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="block mt-1 w-44 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {STATUS_FILTERS.map(option => (
                  <option key={option.value} value={option.value} className="bg-gray-900 text-white">
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              onClick={() => setShowMine(prev => !prev)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                showMine
                  ? "bg-blue-600/20 border-blue-500/50 text-blue-200"
                  : "bg-white/5 border-white/10 text-white hover:bg-white/10"
              }`}
            >
              {showMine ? "Showing my feedback" : "Show my feedback"}
            </button>
          </div>

          <div className="flex items-center gap-3">
            {activeFilters.length > 0 && (
              <div className="hidden md:flex flex-wrap items-center gap-2 text-xs text-white/50">
                {activeFilters.map(filter => (
                  <span key={filter} className="px-2 py-1 bg-white/10 rounded-full">{filter}</span>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Share feedback
            </button>
          </div>
        </section>

        {error && (
          <div className="border border-red-500/40 bg-red-500/10 text-red-200 rounded-lg p-4 text-sm">
            {error}
          </div>
        )}

        <section className="space-y-4">
          <div className="flex items-center justify-between text-white/60 text-sm">
            <span>{totalCount} item{totalCount === 1 ? "" : "s"} found</span>
            {activeFilters.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setFilterType("all")
                  setStatusFilter("all")
                  setShowMine(false)
                }}
                className="text-blue-300 hover:text-blue-200"
              >
                Clear filters
              </button>
            )}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-32 bg-white/5 border border-white/10 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : feedback.length === 0 ? (
            <div className="text-center bg-white/5 border border-white/10 rounded-xl p-12 text-white/60">
              <p className="text-lg font-medium text-white mb-2">No feedback found</p>
              <p className="mb-6">Try adjusting the filters or submit a new idea to get the conversation started.</p>
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Submit feedback
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {feedback.map(item => (
                <article key={item.id} className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-white/50">
                        <span className="px-2 py-1 rounded-full bg-blue-600/20 text-blue-300">
                          {item.feedback_type.replace(/_/g, " ")}
                        </span>
                        <span className="px-2 py-1 rounded-full bg-white/10">Status: {item.status.replace(/_/g, " ")}</span>
                        {item.user_name && <span>By {item.user_name}</span>}
                      </div>
                      <h2 className="text-xl font-semibold text-white">{item.title}</h2>
                      <p className="text-white/70 whitespace-pre-line text-sm">{item.description}</p>
                      {item.admin_response && (
                        <div className="border border-blue-500/30 bg-blue-600/10 rounded-lg p-4 text-sm text-blue-100">
                          <p className="font-medium text-blue-200 mb-1">Team update</p>
                          <p>{item.admin_response}</p>
                        </div>
                      )}
                      <div className="text-xs text-white/40">
                        Updated {new Date(item.updated_at).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex flex-col items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleVote(item, "up")}
                        disabled={item.user_vote === "up"}
                        className={`px-4 py-2 rounded-lg border text-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed ${
                          item.user_vote === "up"
                            ? "bg-green-600 text-white border-green-500"
                            : "bg-white/5 border-white/10 text-white hover:bg-green-600/20 hover:text-green-300"
                        }`}
                      >
                        👍 Helpful ({item.upvotes})
                      </button>
                      <button
                        type="button"
                        onClick={() => handleVote(item, "down")}
                        disabled={item.user_vote === "down"}
                        className={`px-4 py-2 rounded-lg border text-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed ${
                          item.user_vote === "down"
                            ? "bg-red-600 text-white border-red-500"
                            : "bg-white/5 border-white/10 text-white hover:bg-red-600/20 hover:text-red-300"
                        }`}
                      >
                        👎 Not helpful ({item.downvotes})
                      </button>
                      {typeof item.vote_score === "number" && (
                        <span className="text-xs text-white/50">Score: {item.vote_score}</span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {showForm && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-2xl p-6 relative">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setFormError(null)
                }}
                className="absolute top-4 right-4 text-white/60 hover:text-white"
                aria-label="Close feedback form"
              >
                ✕
              </button>

              <h2 className="text-2xl font-semibold text-white mb-4">Share your feedback</h2>
              <p className="text-white/60 text-sm mb-6">
                Tell us what's on your mind. Your feedback helps shape the future of Watch Party.
              </p>

              {formError && (
                <div className="mb-4 p-3 border border-red-500/40 bg-red-500/10 text-red-200 rounded-lg text-sm">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmitFeedback} className="space-y-4">
                <div>
                  <label className="block text-sm text-white/70 mb-2" htmlFor="feedback-title">
                    Title
                  </label>
                  <input
                    id="feedback-title"
                    type="text"
                    value={formState.title}
                    onChange={(event) => setFormState(prev => ({ ...prev, title: event.target.value }))}
                    className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Summarise your idea or issue"
                  />
                </div>

                <div>
                  <label className="block text-sm text-white/70 mb-2" htmlFor="feedback-type">
                    Category
                  </label>
                  <select
                    id="feedback-type"
                    value={formState.feedback_type}
                    onChange={(event) => setFormState(prev => ({ ...prev, feedback_type: event.target.value as FeedbackItem["feedback_type"] }))}
                    className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {FEEDBACK_TYPES.filter(option => option.value !== "all").map(option => (
                      <option key={option.value} value={option.value} className="bg-gray-900 text-white">
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-white/70 mb-2" htmlFor="feedback-description">
                    Details
                  </label>
                  <textarea
                    id="feedback-description"
                    value={formState.description}
                    onChange={(event) => setFormState(prev => ({ ...prev, description: event.target.value }))}
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
                    placeholder="How would this help? Include as much context as you can."
                  />
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setFormError(null)
                    }}
                    className="px-4 py-2 rounded-lg border border-white/10 text-white hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/60 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                  >
                    {submitting ? "Submitting..." : "Submit feedback"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
