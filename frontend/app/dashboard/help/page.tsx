"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
  const { formatNumber: _formatNumber } = useDesignSystem()
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
      color: "from-brand-orange to-brand-coral"
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
      <div className="glass-panel rounded-3xl p-8 border-brand-navy/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-brand-purple/10 to-brand-blue/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="relative z-10 text-center space-y-4">
          <div className="text-6xl mb-4 opacity-80 animate-float">🆘</div>
          <h1 className="text-4xl font-bold text-brand-navy">
            Help & Support
          </h1>
          <p className="text-brand-navy/70 text-lg max-w-2xl mx-auto font-medium">
            Find answers to common questions, browse our knowledge base, or get in touch with our support team
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-brand-navy/60 font-bold uppercase tracking-wide">
            <span>📚 Knowledge Base</span>
            <span>•</span>
            <span>💬 24/7 Support</span>
            <span>•</span>
            <span>🎥 Video Guides</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-2xl mx-auto group">
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
          <span className="text-brand-navy/40 text-xl">🔍</span>
        </div>
        <input
          type="text"
          placeholder="Search for help articles, guides, or FAQs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-14 pr-6 py-4 bg-white/50 border border-brand-navy/10 rounded-2xl text-brand-navy placeholder:text-brand-navy/40 focus:outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue/30 backdrop-blur-sm transition-all shadow-sm"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {contactMethods.map((method, index) => (
          <div key={index} className="glass-card rounded-3xl p-6 text-center hover:border-brand-purple/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-navy/5 group">
            <div className="space-y-4">
              <div className="text-4xl group-hover:scale-110 transition-transform duration-300">{method.icon}</div>
              <div>
                <h3 className="text-brand-navy font-bold mb-2 text-lg">{method.title}</h3>
                <p className="text-brand-navy/60 text-sm mb-4 font-medium">{method.description}</p>
              </div>
              <IconButton
                className={`w-full bg-gradient-to-r ${method.gradient} text-white shadow-md hover:shadow-lg border-none`}
                disabled={!method.available}
              >
                {method.action}
              </IconButton>
            </div>
          </div>
        ))}
      </div>

      {/* Help Categories */}
      <div>
        <h2 className="text-2xl font-bold text-brand-navy mb-6 flex items-center gap-2">
          <span>📚</span>
          Browse by Category
        </h2>
        
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${
              selectedCategory === "all"
                ? "bg-brand-navy text-white shadow-md"
                : "bg-white/40 text-brand-navy/60 hover:text-brand-navy hover:bg-white/60 border border-brand-navy/5"
            }`}
          >
            <span>🔍</span>
            All Categories
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                selectedCategory === category.id
                  ? "bg-brand-navy text-white shadow-md"
                  : "bg-white/40 text-brand-navy/60 hover:text-brand-navy hover:bg-white/60 border border-brand-navy/5"
              }`}
            >
              <span>{category.icon}</span>
              {category.title}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div key={category.id} className="glass-card rounded-3xl p-6 hover:border-brand-purple/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-navy/5 group">
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {category.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-brand-navy font-bold mb-1 text-lg">{category.title}</h3>
                  <p className="text-brand-navy/60 text-sm mb-3 font-medium">{category.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-brand-navy/40 text-xs font-bold uppercase tracking-wider">{category.articles} articles</span>
                    <button
                      onClick={() => setSelectedCategory(category.id)}
                      className="text-brand-blue hover:text-brand-blue-dark text-sm font-bold transition-colors"
                    >
                      Browse →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div>
        <h2 className="text-2xl font-bold text-brand-navy mb-6 flex items-center gap-2">
          <span>❓</span>
          Frequently Asked Questions
        </h2>
        
        <div className="space-y-4">
          {filteredFAQs.map((faq) => (
            <div key={faq.id} className="glass-card rounded-2xl p-6 hover:border-brand-purple/30 transition-all duration-300 hover:shadow-md">
              <div
                className="cursor-pointer group"
                onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-brand-navy font-bold text-lg pr-4 group-hover:text-brand-purple transition-colors">{faq.question}</h3>
                  <div className={`text-brand-navy/40 transition-transform duration-300 bg-brand-navy/5 rounded-full p-1 ${
                    expandedFAQ === faq.id ? 'rotate-180 bg-brand-purple/10 text-brand-purple' : ''
                  }`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </div>
                
                {expandedFAQ === faq.id && (
                  <div className="mt-4 pt-4 border-t border-brand-navy/5 animate-in fade-in slide-in-from-top-2 duration-200">
                    <p className="text-brand-navy/70 font-medium leading-relaxed">{faq.answer}</p>
                    <div className="mt-4 flex items-center gap-4">
                      <span className="text-brand-navy/40 text-xs font-bold uppercase tracking-wider">Was this helpful?</span>
                      <div className="flex gap-2">
                        <button className="p-1.5 rounded-lg hover:bg-green-50 text-brand-navy/40 hover:text-green-600 transition-colors">👍</button>
                        <button className="p-1.5 rounded-lg hover:bg-red-50 text-brand-navy/40 hover:text-red-600 transition-colors">👎</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredFAQs.length === 0 && (
          <div className="glass-card rounded-3xl p-12 text-center border-dashed border-2 border-brand-navy/10">
            <div className="text-5xl mb-4 opacity-50">🔍</div>
            <h3 className="text-xl font-bold text-brand-navy mb-2">No results found</h3>
            <p className="text-brand-navy/60 font-medium">
              Try adjusting your search terms or browse by category above.
            </p>
          </div>
        )}
      </div>

      {/* Still Need Help */}
      <div className="glass-panel rounded-3xl p-10 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-blue via-brand-purple to-brand-magenta opacity-50"></div>
        <div className="relative z-10 space-y-6">
          <div className="text-5xl animate-bounce-slow">🤝</div>
          <h2 className="text-3xl font-bold text-brand-navy">Still need help?</h2>
          <p className="text-brand-navy/70 max-w-lg mx-auto text-lg font-medium">
            Can't find what you're looking for? Our support team is here to help you get the most out of Watch Party.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <IconButton
              className="btn-gradient shadow-lg hover:shadow-brand-blue/25 px-8 py-4 text-lg"
            >
              <span>💬</span>
              Start Live Chat
            </IconButton>
            <IconButton
              variant="secondary"
              onClick={() => router.push("/dashboard/support")}
              className="bg-white hover:bg-brand-neutral px-8 py-4 text-lg"
            >
              <span>📧</span>
              Contact Support
            </IconButton>
          </div>
        </div>
      </div>
    </div>
  )
}