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
      
      // Create the party - format data properly
      // Only include fields that have values to avoid validation errors
      const partyPayload: {
        title: string;
        description?: string;
        visibility?: string;
        max_participants?: number;
        video_id?: string;
        scheduled_start?: string;
      } = {
        title: partyData.title.trim(),
      }
      
      // Only include optional fields if they have values
      if (partyData.description && partyData.description.trim()) {
        partyPayload.description = partyData.description.trim()
      }
      
      if (partyData.visibility) {
        partyPayload.visibility = partyData.visibility
      }
      
      if (partyData.max_participants) {
        partyPayload.max_participants = partyData.max_participants
      }
      
      // Only include video_id if we have one (from upload/url)
      if (videoId) {
        partyPayload.video_id = videoId
      }
      
      // Convert datetime-local to ISO format if provided
      // datetime-local gives us "YYYY-MM-DDTHH:mm" format
      if (partyData.scheduled_start && partyData.scheduled_start.trim()) {
        // Append seconds and timezone to make it ISO 8601 compliant
        const dateValue = new Date(partyData.scheduled_start)
        if (!isNaN(dateValue.getTime())) {
          partyPayload.scheduled_start = dateValue.toISOString()
        }
      }
      
      const party = await partiesApi.create(partyPayload)
      
      // Redirect to the party page using room_code for the public URL
      // The party API returns room_code which is used for public access
      const roomCode = (party as any).room_code || (party as any).id
      
      // Validate room code before redirect
      if (!roomCode || roomCode === 'undefined' || roomCode === 'null') {
        console.error('Party created but no valid room_code received:', party)
        throw new Error('Failed to get party room code. Party may have been created - check your parties list.')
      }
      
      console.log('Party created successfully, redirecting to:', roomCode)
      router.push(`/party/${roomCode}`)
      
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-brand-purple/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-tl from-brand-blue/20 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-r from-brand-cyan/10 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Enhanced Header with Better Visual Hierarchy */}
        <div className="mb-6 sm:mb-10">
          <div className="flex items-start gap-4 mb-4">
            <button
              onClick={() => router.back()}
              className="mt-1 p-2 sm:p-3 rounded-xl bg-white/80 backdrop-blur-sm hover:bg-white shadow-lg hover:shadow-xl transition-all duration-200 text-brand-navy hover:scale-105"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-purple/20 to-brand-blue/20 rounded-full mb-3 backdrop-blur-sm border border-white/50">
                <span className="text-2xl">🎉</span>
                <span className="text-sm font-semibold text-brand-navy">Step {step} of 3</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-navy mb-2 bg-gradient-to-r from-brand-purple to-brand-blue bg-clip-text text-transparent">
                Create Epic Watch Party
              </h1>
              <p className="text-brand-navy/70 text-base sm:text-lg max-w-2xl">Build an unforgettable movie night experience for your community</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="relative h-2 bg-white/50 rounded-full overflow-hidden backdrop-blur-sm shadow-inner">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-brand-purple via-brand-blue to-brand-cyan transition-all duration-500 ease-out rounded-full shadow-lg"
              style={{ width: `${(step / 3) * 100}%` }}
            >
              <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Enhanced Step Cards */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8 sm:mb-12 max-w-4xl mx-auto">
          {[
            { step: 1, label: "Party Details", icon: "🎬", shortLabel: "Details", description: "Name & settings" },
            { step: 2, label: "Content Setup", icon: "📱", shortLabel: "Content", description: "Add videos" },
            { step: 3, label: "Review & Launch", icon: "🚀", shortLabel: "Launch", description: "Final check" }
          ].map((item) => (
            <div
              key={item.step}
              className={`relative p-4 sm:p-6 rounded-2xl transition-all duration-300 cursor-pointer ${
                step === item.step
                  ? "bg-white shadow-2xl ring-2 ring-brand-purple scale-105"
                  : step > item.step
                  ? "bg-white/90 shadow-lg"
                  : "bg-white/60 shadow"
              }`}
            >
              {step > item.step && (
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              <div className="text-center">
                <div className={`text-3xl sm:text-4xl mb-2 transition-transform duration-300 ${
                  step === item.step ? "scale-110 animate-bounce" : ""
                }`}>
                  {item.icon}
                </div>
                <div className={`font-bold text-xs sm:text-sm mb-1 ${
                  step >= item.step ? "text-brand-navy" : "text-brand-navy/50"
                }`}>
                  <span className="hidden sm:inline">{item.label}</span>
                  <span className="sm:hidden">{item.shortLabel}</span>
                </div>
                <div className="text-[10px] sm:text-xs text-brand-navy/60">
                  {item.description}
                </div>
              </div>
              {step === item.step && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-purple/10 to-brand-blue/10 animate-pulse pointer-events-none"></div>
              )}
            </div>
          ))}
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-6 sm:p-8 lg:p-10">
          {/* Step 1: Party Details */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8 sm:mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-brand-purple to-brand-blue rounded-2xl shadow-xl mb-4 animate-bounce">
                  <span className="text-3xl sm:text-4xl">🎬</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-brand-navy mb-3 bg-gradient-to-r from-brand-purple to-brand-blue bg-clip-text text-transparent">Party Details</h2>
                <p className="text-brand-navy/70 text-sm sm:text-base max-w-lg mx-auto">Give your watch party a memorable name and configure the perfect settings</p>
              </div>

              <div className="space-y-6 max-w-2xl mx-auto">
                {/* Party Name */}
                <div className="group">
                  <label className="block text-brand-navy font-semibold mb-3 text-sm sm:text-base flex items-center gap-2">
                    <span className="text-xl">🎭</span>
                    Party Name *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={partyData.title}
                      onChange={(e) => setPartyData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Friday Night Movies, Horror Marathon, etc."
                      className="w-full px-5 py-4 text-base bg-white/90 border-2 border-brand-navy/20 rounded-2xl text-brand-navy placeholder:text-brand-navy/40 focus:outline-none focus:ring-4 focus:ring-brand-purple/20 focus:border-brand-purple transition-all duration-200 shadow-sm hover:shadow-md"
                    />
                    {partyData.title && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="group">
                  <label className="block text-brand-navy font-semibold mb-3 text-sm sm:text-base flex items-center gap-2">
                    <span className="text-xl">📝</span>
                    Description
                    <span className="text-xs text-brand-navy/50 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    value={partyData.description}
                    onChange={(e) => setPartyData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Tell your friends what to expect... What movies? What vibe? Snacks required?"
                    rows={4}
                    className="w-full px-5 py-4 text-base bg-white/90 border-2 border-brand-navy/20 rounded-2xl text-brand-navy placeholder:text-brand-navy/40 focus:outline-none focus:ring-4 focus:ring-brand-purple/20 focus:border-brand-purple transition-all duration-200 shadow-sm hover:shadow-md resize-none"
                  />
                  <div className="flex justify-between mt-2 px-1">
                    <span className="text-xs text-brand-navy/50">💡 Tip: Add emojis to make it fun!</span>
                    <span className="text-xs text-brand-navy/50">{partyData.description.length} chars</span>
                  </div>
                </div>

                {/* Visibility */}
                <div>
                  <label className="block text-brand-navy font-semibold mb-4 text-sm sm:text-base flex items-center gap-2">
                    <span className="text-xl">👀</span>
                    Who can join?
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    {[
                      { value: "public", label: "Public", icon: "🌍", description: "Anyone can find and join", color: "from-blue-500 to-cyan-500" },
                      { value: "friends", label: "Friends", icon: "👥", description: "Only your friends", color: "from-purple-500 to-pink-500" },
                      { value: "private", label: "Private", icon: "🔒", description: "Invite only", color: "from-gray-600 to-gray-800" }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setPartyData(prev => ({ ...prev, visibility: option.value as any }))}
                        className={`group relative p-5 rounded-2xl border-2 transition-all duration-300 text-center overflow-hidden ${
                          partyData.visibility === option.value
                            ? "border-transparent shadow-xl scale-105"
                            : "border-brand-navy/20 bg-white hover:border-brand-navy/40 hover:shadow-lg"
                        }`}
                      >
                        {partyData.visibility === option.value && (
                          <div className={`absolute inset-0 bg-gradient-to-br ${option.color} opacity-10`}></div>
                        )}
                        <div className={`relative text-3xl mb-3 transition-transform duration-300 ${
                          partyData.visibility === option.value ? "scale-125" : "group-hover:scale-110"
                        }`}>{option.icon}</div>
                        <div className="relative text-brand-navy font-bold mb-2 text-sm sm:text-base">{option.label}</div>
                        <div className="relative text-xs text-brand-navy/70">{option.description}</div>
                        {partyData.visibility === option.value && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Max Participants */}
                <div>
                  <label className="block text-brand-navy font-medium mb-2 text-sm sm:text-base">Max Participants</label>
                  <select
                    value={partyData.max_participants}
                    onChange={(e) => setPartyData(prev => ({ ...prev, max_participants: parseInt(e.target.value) }))}
                    className="w-full px-4 py-3 text-base bg-white border border-brand-navy/20 rounded-xl text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-brand-purple/50"
                  >
                    {[5, 10, 20, 50, 100].map(num => (
                      <option key={num} value={num} className="bg-white">{num} people</option>
                    ))}
                  </select>
                </div>

                {/* Scheduled Start (Optional) */}
                <div>
                  <label className="block text-brand-navy font-medium mb-2 text-sm sm:text-base">Schedule for later (optional)</label>
                  <input
                    type="datetime-local"
                    value={partyData.scheduled_start}
                    onChange={(e) => setPartyData(prev => ({ ...prev, scheduled_start: e.target.value }))}
                    className="w-full px-4 py-3 text-base bg-white border border-brand-navy/20 rounded-xl text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-brand-purple/50"
                  />
                  <p className="text-sm text-brand-navy/60 mt-1">Leave empty to start immediately</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Content Selection */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8 sm:mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-brand-blue to-brand-cyan rounded-2xl shadow-xl mb-4 animate-bounce">
                  <span className="text-3xl sm:text-4xl">📱</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-brand-navy mb-3 bg-gradient-to-r from-brand-blue to-brand-cyan bg-clip-text text-transparent">Add Content</h2>
                <p className="text-brand-navy/70 text-sm sm:text-base max-w-lg mx-auto">Choose what to watch — don't worry, you can always add more later!</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
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
                        ? `border-brand-purple bg-brand-purple/10`
                        : "border-brand-navy/20 bg-white hover:border-brand-navy/30 hover:bg-brand-navy/5"
                    }`}
                  >
                    <div className="text-3xl mb-3">{option.icon}</div>
                    <h3 className="text-lg font-semibold text-brand-navy mb-2">{option.title}</h3>
                    <p className="text-brand-navy/70 text-sm">{option.description}</p>
                  </button>
                ))}
              </div>

              {/* Content Input Forms */}
              {contentType === "upload" && (
                <div className="max-w-2xl mx-auto mt-8 p-6 bg-brand-navy/5 rounded-xl border border-brand-navy/10">
                  <h3 className="text-brand-navy font-medium mb-4">Upload Video File</h3>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                    className="w-full px-4 py-3 bg-white border border-brand-navy/20 rounded-xl text-brand-navy file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-brand-purple file:text-white"
                  />
                  {videoFile && (
                    <p className="text-brand-cyan text-sm mt-2">✓ {videoFile.name} selected</p>
                  )}
                </div>
              )}

              {contentType === "url" && (
                <div className="max-w-2xl mx-auto mt-8 p-6 bg-brand-navy/5 rounded-xl border border-brand-navy/10">
                  <h3 className="text-brand-navy font-medium mb-4">Video URL</h3>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://example.com/video.mp4"
                    className="w-full px-4 py-3 bg-white border border-brand-navy/20 rounded-xl text-brand-navy placeholder:text-brand-navy/50 focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                  />
                  <p className="text-sm text-brand-navy/60 mt-2">Supports most video streaming URLs</p>
                </div>
              )}

              {contentType === "library" && (
                <div className="max-w-2xl mx-auto mt-8 p-6 bg-brand-navy/5 rounded-xl border border-brand-navy/10 text-center">
                  <h3 className="text-brand-navy font-medium mb-4">Choose from Library</h3>
                  <p className="text-brand-navy/60 mb-4">Browse your existing videos in the next step</p>
                  <button className="px-6 py-3 bg-brand-cyan hover:bg-green-700 text-white rounded-lg font-medium transition-colors">
                    Browse Library
                  </button>
                </div>
              )}

              {contentType === "later" && (
                <div className="max-w-2xl mx-auto mt-8 p-6 bg-brand-navy/5 rounded-xl border border-brand-navy/10 text-center">
                  <h3 className="text-brand-navy font-medium mb-2">Perfect!</h3>
                  <p className="text-brand-navy/60">You can add videos after creating the party</p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Review & Create */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-8 sm:mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-xl mb-4 animate-bounce">
                  <span className="text-3xl sm:text-4xl">✨</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-brand-navy mb-3 bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">Review & Create</h2>
                <p className="text-brand-navy/70 text-sm sm:text-base max-w-lg mx-auto">Everything looks good? Let's start the party! 🎉</p>
              </div>

              <div className="max-w-2xl mx-auto space-y-6">
                {/* Party Summary */}
                <div className="bg-gradient-to-br from-brand-purple/10 to-brand-blue/10 rounded-2xl p-6 border-2 border-white/50 shadow-xl backdrop-blur-sm">
                  <h3 className="text-lg font-bold text-brand-navy mb-5 flex items-center gap-2">
                    <span className="text-2xl">🎬</span>
                    Party Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-brand-navy/70">Name:</span>
                      <span className="text-brand-navy">{partyData.title}</span>
                    </div>
                    {partyData.description && (
                      <div className="flex justify-between">
                        <span className="text-brand-navy/70">Description:</span>
                        <span className="text-brand-navy text-right max-w-xs">{partyData.description}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-brand-navy/70">Visibility:</span>
                      <span className="text-brand-navy capitalize">{partyData.visibility}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-navy/70">Max Participants:</span>
                      <span className="text-brand-navy">{partyData.max_participants}</span>
                    </div>
                    {partyData.scheduled_start && (
                      <div className="flex justify-between">
                        <span className="text-brand-navy/70">Scheduled:</span>
                        <span className="text-brand-navy">{new Date(partyData.scheduled_start).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Content Summary */}
                <div className="bg-gradient-to-br from-brand-blue/10 to-brand-cyan/10 rounded-2xl p-6 border-2 border-white/50 shadow-xl backdrop-blur-sm">
                  <h3 className="text-lg font-bold text-brand-navy mb-5 flex items-center gap-2">
                    <span className="text-2xl">📺</span>
                    Content
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {contentType === "upload" ? "📤" : 
                       contentType === "url" ? "🔗" : 
                       contentType === "library" ? "📚" : "⏰"}
                    </span>
                    <div>
                      <p className="text-brand-navy">
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
                  className="group relative w-full py-5 min-h-[56px] bg-gradient-to-r from-brand-purple via-brand-blue to-brand-cyan hover:from-brand-purple-dark hover:via-brand-blue-dark hover:to-brand-cyan-dark disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-brand-purple/50 disabled:cursor-not-allowed text-base sm:text-lg overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  {loading ? (
                    <span className="relative flex items-center justify-center gap-3">
                      <div className="animate-spin w-6 h-6 border-3 border-white border-t-transparent rounded-full"></div>
                      <span className="animate-pulse">Creating Your Epic Party...</span>
                    </span>
                  ) : (
                    <span className="relative flex items-center justify-center gap-3">
                      <span className="text-2xl animate-bounce">🎉</span>
                      <span>Create Watch Party</span>
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 mt-8 sm:mt-10">
            <button
              onClick={prevStep}
              disabled={step === 1}
              className="group w-full sm:w-auto px-8 py-4 min-h-[52px] bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 text-brand-navy rounded-xl font-semibold transition-all duration-200 disabled:cursor-not-allowed text-sm sm:text-base shadow-lg hover:shadow-xl disabled:shadow-none flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Previous
            </button>
            
            {step < 3 && (
              <button
                onClick={nextStep}
                disabled={!isStepValid()}
                className="group w-full sm:w-auto px-8 py-4 min-h-[52px] bg-gradient-to-r from-brand-purple to-brand-blue hover:from-brand-purple-dark hover:to-brand-blue-dark disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all duration-200 text-sm sm:text-base shadow-lg hover:shadow-xl disabled:shadow-none flex items-center justify-center gap-2"
              >
                Next Step
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}