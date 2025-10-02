"use client"

import { useState, useEffect } from "react"
import api from "@/lib/api-client"

interface CommunityPost {
  id: string
  title: string
  content: string
  author: {
    id: string
    username: string
    avatar?: string
    reputation: number
  }
  category: string
  tags: string[]
  votes: number
  user_vote?: "up" | "down"
  replies_count: number
  views: number
  is_solved: boolean
  created_at: string
  updated_at: string
}

interface CommunityReply {
  id: string
  content: string
  author: {
    id: string
    username: string
    avatar?: string
    reputation: number
  }
  votes: number
  user_vote?: "up" | "down"
  is_solution: boolean
  created_at: string
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null)
  const [replies, setReplies] = useState<CommunityReply[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [filter, setFilter] = useState<"all" | "unsolved" | "popular">("all")
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    category: "",
    tags: [] as string[]
  })
  const [newReply, setNewReply] = useState("")
  const [creating, setCreating] = useState(false)
  const [replying, setReplying] = useState(false)

  const categories = [
    { value: "general", label: "General Discussion" },
    { value: "technical", label: "Technical Help" },
    { value: "features", label: "Feature Requests" },
    { value: "tips", label: "Tips & Tricks" },
    { value: "showcase", label: "Showcase" }
  ]

  useEffect(() => {
    loadPosts()
  }, [filter])

  useEffect(() => {
    if (selectedPost) {
      loadReplies(selectedPost.id)
    }
  }, [selectedPost])

  const loadPosts = async () => {
    try {
      const params = new URLSearchParams()
      if (filter !== "all") {
        params.append("filter", filter)
      }

      const response = await api.get(`/support/community/?${params.toString()}`)
      setPosts(response.results || [])
    } catch (error) {
      console.error("Failed to load posts:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadReplies = async (postId: string) => {
    try {
      const response = await api.get(`/support/community/${postId}/replies/`)
      setReplies(response.results || [])
    } catch (error) {
      console.error("Failed to load replies:", error)
    }
  }

  const createPost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim() || !newPost.category) {
      alert("Please fill in all required fields")
      return
    }

    setCreating(true)
    try {
      await api.post("/support/community/", newPost)
      setNewPost({
        title: "",
        content: "",
        category: "",
        tags: []
      })
      setShowCreatePost(false)
      await loadPosts()
    } catch (error) {
      alert("Failed to create post: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      setCreating(false)
    }
  }

  const createReply = async () => {
    if (!newReply.trim() || !selectedPost) return

    setReplying(true)
    try {
      await api.post(`/support/community/${selectedPost.id}/replies/`, {
        content: newReply.trim()
      })
      setNewReply("")
      await loadReplies(selectedPost.id)
    } catch (error) {
      alert("Failed to create reply: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      setReplying(false)
    }
  }

  const votePost = async (postId: string, voteType: "up" | "down") => {
    try {
      await api.post(`/support/community/${postId}/vote/`, { vote: voteType })
      await loadPosts()
      
      if (selectedPost && selectedPost.id === postId) {
        const updatedPost = posts.find(p => p.id === postId)
        if (updatedPost) {
          setSelectedPost(updatedPost)
        }
      }
    } catch (error) {
      console.error("Failed to vote:", error)
    }
  }

  const voteReply = async (replyId: string, voteType: "up" | "down") => {
    try {
      await api.post(`/support/community/replies/${replyId}/vote/`, { vote: voteType })
      if (selectedPost) {
        await loadReplies(selectedPost.id)
      }
    } catch (error) {
      console.error("Failed to vote:", error)
    }
  }

  const markAsSolution = async (replyId: string) => {
    try {
      await api.post(`/support/community/replies/${replyId}/solution/`)
      if (selectedPost) {
        await loadReplies(selectedPost.id)
        await loadPosts()
      }
    } catch (error) {
      console.error("Failed to mark as solution:", error)
    }
  }

  const viewPost = async (post: CommunityPost) => {
    setSelectedPost(post)
    
    // Track view
    try {
      await api.post(`/support/community/${post.id}/view/`)
    } catch (error) {
      console.error("Failed to track view:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-white/10 rounded w-1/3"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-white/10 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (selectedPost) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => setSelectedPost(null)}
              className="text-brand-blue-light hover:text-brand-blue-light transition-colors"
            >
              ← Back to Community
            </button>
          </div>

          {/* Post */}
          <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden mb-6">
            {/* Post Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center gap-2">
                  <button
                    onClick={() => votePost(selectedPost.id, "up")}
                    className={`p-2 rounded transition-colors ${
                      selectedPost.user_vote === "up"
                        ? "bg-brand-cyan text-white"
                        : "bg-white/10 text-white/60 hover:bg-brand-cyan/20"
                    }`}
                  >
                    ↑
                  </button>
                  <span className="text-white font-medium">{selectedPost.votes}</span>
                  <button
                    onClick={() => votePost(selectedPost.id, "down")}
                    className={`p-2 rounded transition-colors ${
                      selectedPost.user_vote === "down"
                        ? "bg-brand-coral text-white"
                        : "bg-white/10 text-white/60 hover:bg-brand-coral/20"
                    }`}
                  >
                    ↓
                  </button>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    {selectedPost.is_solved && (
                      <span className="px-2 py-1 bg-green-600/20 text-brand-cyan-light text-xs rounded">
                        ✓ SOLVED
                      </span>
                    )}
                    <span className="px-2 py-1 bg-purple-600/20 text-brand-purple-light text-xs rounded">
                      {categories.find(c => c.value === selectedPost.category)?.label}
                    </span>
                  </div>

                  <h1 className="text-2xl font-bold text-white mb-4">{selectedPost.title}</h1>

                  <div className="flex items-center gap-4 text-sm text-white/60 mb-4">
                    <div className="flex items-center gap-2">
                      {selectedPost.author.avatar && (
                        <img
                          src={selectedPost.author.avatar}
                          alt={selectedPost.author.username}
                          className="w-6 h-6 rounded-full"
                        />
                      )}
                      <span>{selectedPost.author.username}</span>
                      <span className="text-brand-orange-light">★ {selectedPost.author.reputation}</span>
                    </div>
                    <span>•</span>
                    <span>{new Date(selectedPost.created_at).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{selectedPost.views} views</span>
                  </div>

                  {selectedPost.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {selectedPost.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-blue-600/20 text-brand-blue-light text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div
                    className="prose prose-invert max-w-none text-white/90"
                    dangerouslySetInnerHTML={{ __html: selectedPost.content }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Replies */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">
              {replies.length} Repl{replies.length !== 1 ? "ies" : "y"}
            </h3>

            {replies.map((reply) => (
              <div
                key={reply.id}
                className={`bg-white/5 border rounded-lg p-6 ${
                  reply.is_solution ? "border-brand-cyan/30 bg-brand-cyan/5" : "border-white/10"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center gap-2">
                    <button
                      onClick={() => voteReply(reply.id, "up")}
                      className={`p-1 rounded transition-colors ${
                        reply.user_vote === "up"
                          ? "bg-brand-cyan text-white"
                          : "bg-white/10 text-white/60 hover:bg-brand-cyan/20"
                      }`}
                    >
                      ↑
                    </button>
                    <span className="text-white font-medium text-sm">{reply.votes}</span>
                    <button
                      onClick={() => voteReply(reply.id, "down")}
                      className={`p-1 rounded transition-colors ${
                        reply.user_vote === "down"
                          ? "bg-brand-coral text-white"
                          : "bg-white/10 text-white/60 hover:bg-brand-coral/20"
                      }`}
                    >
                      ↓
                    </button>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3 text-sm text-white/60">
                        <div className="flex items-center gap-2">
                          {reply.author.avatar && (
                            <img
                              src={reply.author.avatar}
                              alt={reply.author.username}
                              className="w-5 h-5 rounded-full"
                            />
                          )}
                          <span>{reply.author.username}</span>
                          <span className="text-brand-orange-light">★ {reply.author.reputation}</span>
                        </div>
                        <span>•</span>
                        <span>{new Date(reply.created_at).toLocaleDateString()}</span>
                        {reply.is_solution && (
                          <>
                            <span>•</span>
                            <span className="text-brand-cyan-light font-medium">✓ Solution</span>
                          </>
                        )}
                      </div>

                      {!reply.is_solution && !selectedPost.is_solved && (
                        <button
                          onClick={() => markAsSolution(reply.id)}
                          className="px-3 py-1 bg-green-600/20 hover:bg-brand-cyan/30 text-brand-cyan-light text-xs rounded transition-colors"
                        >
                          Mark as Solution
                        </button>
                      )}
                    </div>

                    <div
                      className="prose prose-invert max-w-none text-white/90"
                      dangerouslySetInnerHTML={{ __html: reply.content }}
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Reply Form */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h4 className="font-medium text-white mb-4">Add a Reply</h4>
              <div className="space-y-4">
                <textarea
                  value={newReply}
                  onChange={(e) => setNewReply(e.target.value)}
                  placeholder="Share your thoughts or provide help..."
                  rows={5}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-brand-blue resize-none"
                />
                <button
                  onClick={createReply}
                  disabled={replying || !newReply.trim()}
                  className="px-6 py-3 bg-brand-blue hover:bg-brand-blue-dark disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                >
                  {replying ? "Posting..." : "Post Reply"}
                </button>
              </div>
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Community</h1>
            <p className="text-white/60">Connect with other users and get help</p>
          </div>
          <button
            onClick={() => setShowCreatePost(!showCreatePost)}
            className="px-6 py-3 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-lg font-medium transition-colors"
          >
            {showCreatePost ? "Cancel" : "New Post"}
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {[
            { value: "all", label: "All Posts" },
            { value: "unsolved", label: "Unsolved" },
            { value: "popular", label: "Popular" }
          ].map((filterOption) => (
            <button
              key={filterOption.value}
              onClick={() => setFilter(filterOption.value as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === filterOption.value
                  ? "bg-brand-blue text-white"
                  : "bg-white/10 text-white/70 hover:text-white hover:bg-white/20"
              }`}
            >
              {filterOption.label}
            </button>
          ))}
        </div>

        {/* Create Post Form */}
        {showCreatePost && (
          <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-white mb-6">Create New Post</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm mb-2">Title *</label>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="What's your question or topic?"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm mb-2">Category *</label>
                <select
                  value={newPost.category}
                  onChange={(e) => setNewPost(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white/80 text-sm mb-2">Content *</label>
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Describe your question or share your thoughts in detail..."
                  rows={6}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-brand-blue resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={createPost}
                  disabled={creating}
                  className="px-6 py-3 bg-brand-cyan hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                >
                  {creating ? "Creating..." : "Create Post"}
                </button>
                <button
                  onClick={() => setShowCreatePost(false)}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Posts List */}
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-lg p-12 text-center">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-xl font-semibold text-white mb-2">No Posts Yet</h3>
              <p className="text-white/60 mb-6">
                Be the first to start a conversation in the community!
              </p>
              <button
                onClick={() => setShowCreatePost(true)}
                className="px-6 py-3 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-lg font-medium transition-colors"
              >
                Create First Post
              </button>
            </div>
          ) : (
            posts.map((post) => (
              <button
                key={post.id}
                onClick={() => viewPost(post)}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-6 text-left transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center gap-1 text-sm">
                    <span className="text-white font-medium">{post.votes}</span>
                    <span className="text-white/60">votes</span>
                  </div>

                  <div className="flex flex-col items-center gap-1 text-sm">
                    <span className="text-white font-medium">{post.replies_count}</span>
                    <span className="text-white/60">replies</span>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {post.is_solved && (
                        <span className="px-2 py-1 bg-green-600/20 text-brand-cyan-light text-xs rounded">
                          ✓ SOLVED
                        </span>
                      )}
                      <span className="px-2 py-1 bg-purple-600/20 text-brand-purple-light text-xs rounded">
                        {categories.find(c => c.value === post.category)?.label}
                      </span>
                    </div>

                    <h3 className="font-semibold text-white mb-2">{post.title}</h3>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-sm text-white/60">
                        <div className="flex items-center gap-1">
                          {post.author.avatar && (
                            <img
                              src={post.author.avatar}
                              alt={post.author.username}
                              className="w-4 h-4 rounded-full"
                            />
                          )}
                          <span>{post.author.username}</span>
                        </div>
                        <span>•</span>
                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{post.views} views</span>
                      </div>

                      {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {post.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-blue-600/20 text-brand-blue-light text-xs rounded"
                            >
                              {tag}
                            </span>
                          ))}
                          {post.tags.length > 2 && (
                            <span className="text-white/40 text-xs">
                              +{post.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}