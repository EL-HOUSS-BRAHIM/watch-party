"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { GradientCard } from "@/components/ui/gradient-card"
import { IconButton } from "@/components/ui/icon-button"
import { useDesignSystem } from "@/hooks/use-design-system"

interface FAQItem {
  id: string
  question: string
  answer: string
  category: "getting-started" | "hosting" | "technical" | "billing" | "account"
}

interface HelpCategory {
  id: string
  title: string
  description: string
  icon: string
  articles: number
  color: string
}

export default function HelpPage() {
  const router = useRouter()
  const { formatNumber } = useDesignSystem()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)

  const categories: HelpCategory[] = [
    {
      id: "getting-started",
      title: "Getting Started",
      description: "Learn the basics of Watch Party",
      icon: "🚀",
      articles: 12,
      color: "from-brand-blue to-brand-cyan"
    },
    {
      id: "hosting",
      title: "Hosting Parties",
      description: "Host amazing watch parties",
      icon: "🎬",
      articles: 8,
      color: "from-brand-purple to-brand-magenta"
    },
    {
      id: "technical",
      title: "Technical Support",
      description: "Troubleshoot technical issues",
      icon: "⚙️",
      articles: 15,
      color: "from-brand-cyan to-brand-blue"
    },
    {
      id: "billing",
      title: "Billing & Plans",
      description: "Manage your subscription",
      icon: "💳",
      articles: 6,
      color: "from-yellow-500 to-orange-500"
    },
    {
      id: "account",
      title: "Account Settings",
      description: "Manage your profile",
      icon: "👤",
      articles: 10,
      color: "from-red-500 to-brand-magenta"
    }
  ]

  const faqs: FAQItem[] = [
    {
      id: "1",
      question: "How do I create my first watch party?",
      answer: "To create a watch party, click the 'Host Party' button on your dashboard. Choose a video, set your preferences, and invite friends!",
      category: "getting-started"
    },
    {
      id: "2",
      question: "How many people can join a watch party?",
      answer: "Free accounts can host parties with up to 5 people. Premium accounts can host parties with up to 50 people.",
      category: "hosting"
    },
    {
      id: "3",
      question: "What video formats are supported?",
      answer: "We support MP4, WebM, and MOV files up to 2GB for free accounts and 10GB for premium accounts.",
      category: "technical"
    },
    {
      id: "4",
      question: "How do I upgrade to premium?",
      answer: "Go to the Store page in your dashboard and select a premium plan that works for you.",
      category: "billing"
    },
    {
      id: "5",
      question: "Can I change my username?",
      answer: "Yes! Go to your Profile settings and click 'Edit Profile' to change your username and other details.",
      category: "account"
    },
    {
      id: "6",
      question: "How do I invite friends to a party?",
      answer: "When creating a party, you can invite friends by username, email, or by sharing the party link.",
      category: "hosting"
    }
  ]

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const contactMethods = [
    {
      title: "Live Chat",
      description: "Get instant help from our support team",
      icon: "💬",
      action: "Start Chat",
      available: true,
      gradient: "from-brand-blue to-brand-purple"
    },
    {
      title: "Email Support",
      description: "Send us detailed questions via email",
      icon: "📧",
      action: "Send Email",
      available: true,
      gradient: "from-green-600 to-brand-blue"
    },
    {
      title: "Community Forum",
      description: "Connect with other users and get tips",
      icon: "👥",
      action: "Visit Forum",
      available: true,
      gradient: "from-brand-purple to-brand-magenta"
    },
    {
      title: "Video Tutorials",
      description: "Watch step-by-step guides",
      icon: "📹",
      action: "Watch Now",
      available: true,
      gradient: "from-brand-orange to-brand-coral"
    }
  ]

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/20 via-purple-600/20 to-green-600/20 rounded-3xl blur-xl"></div>
        <GradientCard className="relative border-brand-blue/30">
          <div className="text-center space-y-4">
            <div className="text-6xl mb-4">🆘</div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
              Help & Support
            </h1>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">
              Find answers to common questions, browse our knowledge base, or get in touch with our support team
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-white/60">
              <span>📚 Knowledge Base</span>
              <span>•</span>
              <span>💬 24/7 Support</span>
              <span>•</span>
              <span>🎥 Video Guides</span>
            </div>
          </div>
        </GradientCard>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-2xl mx-auto">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <span className="text-white/50 text-xl">🔍</span>
        </div>
        <input
          type="text"
          placeholder="Search for help articles, guides, or FAQs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-14 pr-6 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-brand-blue/50 backdrop-blur-sm transition-all"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {contactMethods.map((method, index) => (
          <GradientCard key={index} gradient={`${method.gradient}/20`} className="text-center hover:border-blue-400/40 transition-all duration-300">
            <div className="space-y-4">
              <div className="text-4xl">{method.icon}</div>
              <div>
                <h3 className="text-white font-bold mb-2">{method.title}</h3>
                <p className="text-white/60 text-sm mb-4">{method.description}</p>
              </div>
              <IconButton
                gradient={method.gradient}
                className="w-full"
                disabled={!method.available}
              >
                {method.action}
              </IconButton>
            </div>
          </GradientCard>
        ))}
      </div>

      {/* Help Categories */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <span>📚</span>
          Browse by Category
        </h2>
        
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
              selectedCategory === "all"
                ? "bg-gradient-to-r from-brand-blue to-brand-purple text-white"
                : "bg-white/10 text-white/60 hover:text-white hover:bg-white/20"
            }`}
          >
            <span>🔍</span>
            All Categories
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
                selectedCategory === category.id
                  ? "bg-gradient-to-r from-brand-blue to-brand-purple text-white"
                  : "bg-white/10 text-white/60 hover:text-white hover:bg-white/20"
              }`}
            >
              <span>{category.icon}</span>
              {category.title}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <GradientCard key={category.id} gradient={`${category.color}/10`} className="hover:border-blue-400/40 transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center text-white text-xl`}>
                  {category.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold mb-1">{category.title}</h3>
                  <p className="text-white/60 text-sm mb-3">{category.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-white/50 text-xs">{category.articles} articles</span>
                    <IconButton
                      size="sm"
                      variant="secondary"
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      Browse →
                    </IconButton>
                  </div>
                </div>
              </div>
            </GradientCard>
          ))}
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <span>❓</span>
          Frequently Asked Questions
        </h2>
        
        <div className="space-y-4">
          {filteredFAQs.map((faq) => (
            <GradientCard key={faq.id} className="transition-all duration-300">
              <div
                className="cursor-pointer"
                onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-medium pr-4">{faq.question}</h3>
                  <div className={`text-white/60 transition-transform duration-200 ${
                    expandedFAQ === faq.id ? 'rotate-180' : ''
                  }`}>
                    ⌄
                  </div>
                </div>
                
                {expandedFAQ === faq.id && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-white/80">{faq.answer}</p>
                    <div className="mt-3 flex items-center gap-4">
                      <span className="text-white/50 text-sm">Was this helpful?</span>
                      <div className="flex gap-2">
                        <button className="text-brand-cyan-light hover:text-green-300 transition-colors">👍</button>
                        <button className="text-brand-coral-light hover:text-red-300 transition-colors">👎</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </GradientCard>
          ))}
        </div>

        {filteredFAQs.length === 0 && (
          <GradientCard className="text-center py-12">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-white mb-2">No results found</h3>
            <p className="text-white/60">
              Try adjusting your search terms or browse by category above.
            </p>
          </GradientCard>
        )}
      </div>

      {/* Still Need Help */}
      <GradientCard gradient="from-purple-900/30 via-blue-900/20 to-purple-900/30" className="text-center">
        <div className="space-y-4">
          <div className="text-4xl">🤝</div>
          <h2 className="text-2xl font-bold text-white">Still need help?</h2>
          <p className="text-white/80 max-w-md mx-auto">
            Can't find what you're looking for? Our support team is here to help you get the most out of Watch Party.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <IconButton
              gradient="from-brand-blue to-brand-purple"
              className="shadow-lg hover:shadow-blue-500/25"
            >
              <span>💬</span>
              Start Live Chat
            </IconButton>
            <IconButton
              variant="secondary"
              onClick={() => router.push("/dashboard/support")}
            >
              <span>📧</span>
              Contact Support
            </IconButton>
          </div>
        </div>
      </GradientCard>
    </div>
  )
}