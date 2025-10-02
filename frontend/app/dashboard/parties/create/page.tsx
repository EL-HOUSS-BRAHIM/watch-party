"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { partiesApi, videosApi } from "@/lib/api-client"
import { GradientCard } from "@/components/ui/gradient-card"
import { IconButton } from "@/components/ui/icon-button"

export default function CreatePartyPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [showPreview, setShowPreview] = useState(false)
  
  // Party details
  const [partyData, setPartyData] = useState({
    title: "",
    description: "",
    visibility: "public" as "public" | "friends" | "private",
    max_participants: 10,
    scheduled_start: "",
    video_id: ""
  })
  
  // Content selection
  const [contentType, setContentType] = useState<"upload" | "url" | "library" | "later">("later")
  const [videoUrl, setVideoUrl] = useState("")
  const [videoFile, setVideoFile] = useState<File | null>(null)

  const handleCreateParty = async () => {
    try {
      setLoading(true)
      
      // First, handle video content if provided
      let videoId = ""
      
      if (contentType === "upload" && videoFile) {
        const formData = new FormData()
        formData.append("video_file", videoFile)
        formData.append("title", `${partyData.title} Video`)
        formData.append("visibility", partyData.visibility)
        
        const video = await videosApi.create(formData)
        videoId = video.id
      } else if (contentType === "url" && videoUrl) {
        const video = await videosApi.create({
          title: `${partyData.title} Video`,
          source_url: videoUrl,
          source_type: "url",
          visibility: partyData.visibility
        })
        videoId = video.id
      }
      
      // Create the party
      const party = await partiesApi.create({
        ...partyData,
        video_id: videoId || undefined
      })
      
      // Redirect to the party page
      router.push(`/party/${party.id}`)
      
    } catch (error) {
      console.error("Failed to create party:", error)
      alert("Failed to create party. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => {
    if (step < 3) setStep(step + 1)
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  const isStepValid = () => {
    switch (step) {
      case 1:
        return partyData.title.trim().length > 0
      case 2:
        return true // Content is optional
      case 3:
        return true // Review step
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        {/* Enhanced Header */}
        <div className="flex items-center gap-6 mb-8">
          <IconButton
            onClick={() => router.back()}
            variant="ghost"
            size="lg"
          >
            ←
          </IconButton>
          <div className="flex-1">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
              ✨ Create Epic Watch Party
            </h1>
            <p className="text-white/70 text-lg mt-2">Build the perfect movie night experience for your community</p>
          </div>
          {showPreview && (
            <IconButton
              onClick={() => setShowPreview(!showPreview)}
              variant="secondary"
            >
              👁️ Preview
            </IconButton>
          )}
        </div>

        {/* Enhanced Progress Indicator */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center gap-6">
            {[
              { step: 1, label: "Party Details", icon: "🎬" },
              { step: 2, label: "Content Setup", icon: "📱" },
              { step: 3, label: "Review & Launch", icon: "🚀" }
            ].map((item, index) => (
              <div key={item.step} className="flex items-center gap-6">
                <div className="flex flex-col items-center gap-3">
                  <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                    step >= item.step 
                      ? "bg-gradient-to-br from-purple-500 to-blue-600 text-white shadow-lg scale-110" 
                      : "bg-white/10 text-white/50 border-2 border-white/20"
                  }`}>
                    {step > item.step ? "✓" : item.icon}
                    {step === item.step && (
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 animate-pulse opacity-50"></div>
                    )}
                  </div>
                  <div className="text-center">
                    <div className={`font-medium transition-colors ${
                      step >= item.step ? "text-white" : "text-white/50"
                    }`}>
                      {item.label}
                    </div>
                    <div className="text-xs text-white/40">Step {item.step}</div>
                  </div>
                </div>
                {index < 2 && (
                  <div className={`w-16 h-1 rounded-full transition-all duration-300 ${
                    step > item.step ? "bg-gradient-to-r from-purple-500 to-blue-600" : "bg-white/20"
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <GradientCard 
          className="border-purple-500/30 backdrop-blur-xl" 
          gradient="from-purple-900/40 via-blue-900/30 to-purple-900/40"
        >
          {/* Step 1: Party Details */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="text-4xl mb-4">🎬</div>
                <h2 className="text-2xl font-bold text-white mb-2">Party Details</h2>
                <p className="text-white/70">Give your watch party a name and set the basics</p>
              </div>

              <div className="space-y-6 max-w-2xl mx-auto">
                {/* Party Name */}
                <div>
                  <label className="block text-white font-medium mb-2">Party Name *</label>
                  <input
                    type="text"
                    value={partyData.title}
                    onChange={(e) => setPartyData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Friday Night Movies, Horror Marathon, etc."
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-white font-medium mb-2">Description</label>
                  <textarea
                    value={partyData.description}
                    onChange={(e) => setPartyData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Tell your friends what to expect..."
                    rows={3}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 resize-none"
                  />
                </div>

                {/* Visibility */}
                <div>
                  <label className="block text-white font-medium mb-3">Who can join?</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: "public", label: "Public", icon: "🌍", description: "Anyone can find and join" },
                      { value: "friends", label: "Friends", icon: "👥", description: "Only your friends" },
                      { value: "private", label: "Private", icon: "🔒", description: "Invite only" }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setPartyData(prev => ({ ...prev, visibility: option.value as any }))}
                        className={`p-4 rounded-xl border transition-all duration-200 text-center ${
                          partyData.visibility === option.value
                            ? "border-purple-500 bg-purple-500/20"
                            : "border-white/20 bg-white/5 hover:border-white/30"
                        }`}
                      >
                        <div className="text-2xl mb-2">{option.icon}</div>
                        <div className="text-white font-medium mb-1">{option.label}</div>
                        <div className="text-xs text-white/60">{option.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Max Participants */}
                <div>
                  <label className="block text-white font-medium mb-2">Max Participants</label>
                  <select
                    value={partyData.max_participants}
                    onChange={(e) => setPartyData(prev => ({ ...prev, max_participants: parseInt(e.target.value) }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                  >
                    {[5, 10, 20, 50, 100].map(num => (
                      <option key={num} value={num} className="bg-gray-800">{num} people</option>
                    ))}
                  </select>
                </div>

                {/* Scheduled Start (Optional) */}
                <div>
                  <label className="block text-white font-medium mb-2">Schedule for later (optional)</label>
                  <input
                    type="datetime-local"
                    value={partyData.scheduled_start}
                    onChange={(e) => setPartyData(prev => ({ ...prev, scheduled_start: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                  />
                  <p className="text-sm text-white/60 mt-1">Leave empty to start immediately</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Content Selection */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="text-4xl mb-4">📱</div>
                <h2 className="text-2xl font-bold text-white mb-2">Add Content</h2>
                <p className="text-white/70">Choose what to watch (you can always add more later)</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {[
                  { 
                    type: "upload", 
                    title: "Upload Video", 
                    icon: "📤", 
                    description: "Upload a video file from your device",
                    color: "purple"
                  },
                  { 
                    type: "url", 
                    title: "Video URL", 
                    icon: "🔗", 
                    description: "Add a video from a streaming URL",
                    color: "blue"
                  },
                  { 
                    type: "library", 
                    title: "From Library", 
                    icon: "📚", 
                    description: "Choose from your existing videos",
                    color: "green"
                  },
                  { 
                    type: "later", 
                    title: "Add Later", 
                    icon: "⏰", 
                    description: "Create the party and add content afterwards",
                    color: "orange"
                  }
                ].map((option) => (
                  <button
                    key={option.type}
                    onClick={() => setContentType(option.type as any)}
                    className={`p-6 rounded-xl border transition-all duration-200 text-left ${
                      contentType === option.type
                        ? `border-${option.color}-500 bg-${option.color}-500/20`
                        : "border-white/20 bg-white/5 hover:border-white/30"
                    }`}
                  >
                    <div className="text-3xl mb-3">{option.icon}</div>
                    <h3 className="text-lg font-semibold text-white mb-2">{option.title}</h3>
                    <p className="text-white/70 text-sm">{option.description}</p>
                  </button>
                ))}
              </div>

              {/* Content Input Forms */}
              {contentType === "upload" && (
                <div className="max-w-2xl mx-auto mt-8 p-6 bg-white/5 rounded-xl border border-white/10">
                  <h3 className="text-white font-medium mb-4">Upload Video File</h3>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white"
                  />
                  {videoFile && (
                    <p className="text-green-400 text-sm mt-2">✓ {videoFile.name} selected</p>
                  )}
                </div>
              )}

              {contentType === "url" && (
                <div className="max-w-2xl mx-auto mt-8 p-6 bg-white/5 rounded-xl border border-white/10">
                  <h3 className="text-white font-medium mb-4">Video URL</h3>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://example.com/video.mp4"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                  <p className="text-sm text-white/60 mt-2">Supports most video streaming URLs</p>
                </div>
              )}

              {contentType === "library" && (
                <div className="max-w-2xl mx-auto mt-8 p-6 bg-white/5 rounded-xl border border-white/10 text-center">
                  <h3 className="text-white font-medium mb-4">Choose from Library</h3>
                  <p className="text-white/60 mb-4">Browse your existing videos in the next step</p>
                  <button className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors">
                    Browse Library
                  </button>
                </div>
              )}

              {contentType === "later" && (
                <div className="max-w-2xl mx-auto mt-8 p-6 bg-white/5 rounded-xl border border-white/10 text-center">
                  <h3 className="text-white font-medium mb-2">Perfect!</h3>
                  <p className="text-white/60">You can add videos after creating the party</p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Review & Create */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="text-4xl mb-4">✨</div>
                <h2 className="text-2xl font-bold text-white mb-2">Review & Create</h2>
                <p className="text-white/70">Everything looks good? Let's start the party!</p>
              </div>

              <div className="max-w-2xl mx-auto space-y-6">
                {/* Party Summary */}
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4">Party Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-white/70">Name:</span>
                      <span className="text-white">{partyData.title}</span>
                    </div>
                    {partyData.description && (
                      <div className="flex justify-between">
                        <span className="text-white/70">Description:</span>
                        <span className="text-white text-right max-w-xs">{partyData.description}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-white/70">Visibility:</span>
                      <span className="text-white capitalize">{partyData.visibility}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Max Participants:</span>
                      <span className="text-white">{partyData.max_participants}</span>
                    </div>
                    {partyData.scheduled_start && (
                      <div className="flex justify-between">
                        <span className="text-white/70">Scheduled:</span>
                        <span className="text-white">{new Date(partyData.scheduled_start).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Content Summary */}
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4">Content</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {contentType === "upload" ? "📤" : 
                       contentType === "url" ? "🔗" : 
                       contentType === "library" ? "📚" : "⏰"}
                    </span>
                    <div>
                      <p className="text-white">
                        {contentType === "upload" && videoFile ? `File: ${videoFile.name}` :
                         contentType === "url" && videoUrl ? `URL: ${videoUrl}` :
                         contentType === "library" ? "From your library" :
                         "Will be added later"}
                      </p>
                      <p className="text-white/60 text-sm">
                        {contentType === "later" ? "You can add content after creating the party" : "Ready to watch"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Create Button */}
                <button
                  onClick={handleCreateParty}
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-purple-500/25 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                      Creating Party...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <span>🎉</span>
                      Create Watch Party
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={prevStep}
              disabled={step === 1}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:text-white/30 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {step < 3 && (
              <button
                onClick={nextStep}
                disabled={!isStepValid()}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                Next
              </button>
            )}
          </div>
        </GradientCard>
      </div>
    </div>
  )
}