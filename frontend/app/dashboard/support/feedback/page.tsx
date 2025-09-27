'use client'

import { useState } from 'react'
import { 
  ChatBubbleLeftEllipsisIcon,
  StarIcon,
  HeartIcon,
  LightBulbIcon,
  ExclamationTriangleIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'

interface FeedbackCategory {
  id: string
  name: string
  icon: React.ReactNode
  description: string
  color: string
}

const feedbackCategories: FeedbackCategory[] = [
  {
    id: 'feature',
    name: 'Feature Request',
    icon: <LightBulbIcon className="w-6 h-6" />,
    description: 'Suggest new features or improvements',
    color: 'bg-blue-500'
  },
  {
    id: 'bug',
    name: 'Bug Report',
    icon: <ExclamationTriangleIcon className="w-6 h-6" />,
    description: 'Report issues or problems',
    color: 'bg-red-500'
  },
  {
    id: 'improvement',
    name: 'General Feedback',
    icon: <ChatBubbleLeftEllipsisIcon className="w-6 h-6" />,
    description: 'Share your thoughts and suggestions',
    color: 'bg-green-500'
  },
  {
    id: 'compliment',
    name: 'Compliment',
    icon: <HeartIcon className="w-6 h-6" />,
    description: 'Tell us what you love about WatchParty',
    color: 'bg-pink-500'
  }
]

export default function FeedbackPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [rating, setRating] = useState<number>(0)
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCategory || !subject || !description) return

    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsSubmitting(false)
    setSubmitted(true)
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false)
      setSelectedCategory('')
      setRating(0)
      setSubject('')
      setDescription('')
      setEmail('')
    }, 3000)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Thank You!</h2>
            <p className="text-white/70">
              Your feedback has been submitted successfully. We appreciate you taking the time to help us improve WatchParty.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <ChatBubbleLeftEllipsisIcon className="w-8 h-8 text-green-400" />
            <h1 className="text-4xl font-bold text-white">Share Your Feedback</h1>
          </div>
          <p className="text-white/70 text-lg">
            Help us improve WatchParty by sharing your thoughts, ideas, and experiences
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Category Selection */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">What type of feedback do you have?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {feedbackCategories.map(category => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedCategory(category.id)}
                  className={`p-6 rounded-lg border-2 transition-all text-left ${
                    selectedCategory === category.id
                      ? 'border-white bg-white/10'
                      : 'border-white/20 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`${category.color} p-3 rounded-lg text-white`}>
                      {category.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-white mb-1">{category.name}</h3>
                      <p className="text-white/70 text-sm">{category.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Rating (for general feedback and compliments) */}
          {(selectedCategory === 'improvement' || selectedCategory === 'compliment') && (
            <div>
              <h2 className="text-xl font-bold text-white mb-4">How would you rate your overall experience?</h2>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="transition-colors"
                  >
                    {star <= rating ? (
                      <StarSolidIcon className="w-8 h-8 text-yellow-400" />
                    ) : (
                      <StarIcon className="w-8 h-8 text-white/30 hover:text-yellow-400" />
                    )}
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-white/70 mt-2">
                  {rating === 1 && "We're sorry to hear that. Please tell us how we can improve."}
                  {rating === 2 && "We appreciate your feedback. Help us understand what went wrong."}
                  {rating === 3 && "Thank you for your feedback. What can we do better?"}
                  {rating === 4 && "Great! We'd love to know what we can do to make it even better."}
                  {rating === 5 && "Awesome! We're thrilled you're enjoying WatchParty!"}
                </p>
              )}
            </div>
          )}

          {/* Subject */}
          {selectedCategory && (
            <div>
              <label className="block text-xl font-bold text-white mb-4">
                {selectedCategory === 'feature' && 'What feature would you like to see?'}
                {selectedCategory === 'bug' && 'What issue are you experiencing?'}
                {selectedCategory === 'improvement' && 'What\'s on your mind?'}
                {selectedCategory === 'compliment' && 'What do you love most?'}
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of your feedback..."
                className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-green-400"
                required
              />
            </div>
          )}

          {/* Description */}
          {selectedCategory && (
            <div>
              <label className="block text-xl font-bold text-white mb-4">
                Tell us more (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide more details about your feedback..."
                rows={6}
                className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-green-400 resize-vertical"
                required
              />
              <p className="text-white/50 text-sm mt-2">
                {description.length}/1000 characters
              </p>
            </div>
          )}

          {/* Email (optional) */}
          {selectedCategory && (
            <div>
              <label className="block text-xl font-bold text-white mb-4">
                Email (optional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-green-400"
              />
              <p className="text-white/50 text-sm mt-2">
                Leave your email if you'd like us to follow up with you
              </p>
            </div>
          )}

          {/* Submit Button */}
          {selectedCategory && subject && description && (
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <PaperAirplaneIcon className="w-5 h-5" />
                    Submit Feedback
                  </>
                )}
              </button>
            </div>
          )}
        </form>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <h3 className="text-lg font-bold text-white mb-2">Your feedback matters!</h3>
            <p className="text-white/70">
              We read every piece of feedback and use it to improve WatchParty. 
              Thank you for helping us create a better experience for everyone.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
