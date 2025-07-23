import { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Users, Trophy, Zap } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Blog | Watch Party - News & Updates',
  description: 'Stay updated with the latest Watch Party news, features, and football streaming tips.',
}

export default function BlogPage() {
  const blogPosts = [
    {
      id: '1',
      title: 'Introducing Premium Watch Parties: Enhanced Experience for Die-Hard Fans',
      excerpt: 'Discover the new premium features that take your football streaming to the next level...',
      author: 'Watch Party Team',
      date: '2024-01-15',
      category: 'Product Update',
      readTime: '5 min read',
      featured: true
    },
    {
      id: '2',
      title: 'How to Host the Perfect Champions League Watch Party',
      excerpt: 'Tips and tricks for creating an unforgettable viewing experience with your friends...',
      author: 'Sarah Johnson',
      date: '2024-01-12',
      category: 'Tips & Guides',
      readTime: '8 min read',
      featured: false
    },
    {
      id: '3',
      title: 'Multi-Platform Streaming: Now Support Google Drive and S3',
      excerpt: 'Stream from anywhere with our expanded source support. Learn how to set it up...',
      author: 'Tech Team',
      date: '2024-01-10',
      category: 'Feature Release',
      readTime: '4 min read',
      featured: false
    }
  ]

  return (
    <div className="min-h-screen bg-neo-background">
      <div className="container mx-auto px-6 py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-neo-text-primary mb-4">
            Watch Party Blog
          </h1>
          <p className="text-xl text-neo-text-secondary max-w-2xl mx-auto">
            Stay updated with the latest news, features, and tips for the ultimate 
            football streaming experience.
          </p>
        </div>

        {/* Featured Post */}
        {blogPosts.filter(post => post.featured).map(post => (
          <Card key={post.id} className="card-elevated mb-12">
            <CardContent className="p-8">
              <div className="flex items-center gap-2 mb-4">
                <Badge className="bg-premium text-premium-foreground">
                  Featured
                </Badge>
                <Badge variant="outline">
                  {post.category}
                </Badge>
              </div>
              <h2 className="text-2xl font-bold text-neo-text-primary mb-4">
                {post.title}
              </h2>
              <p className="text-neo-text-secondary mb-6 text-lg">
                {post.excerpt}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-neo-text-secondary">
                  <span>{post.author}</span>
                  <span>•</span>
                  <span>{new Date(post.date).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{post.readTime}</span>
                </div>
                <Button className="btn-primary">
                  Read Article
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Categories */}
        <div className="flex flex-wrap gap-3 mb-8">
          {['All', 'Product Updates', 'Feature Releases', 'Tips & Guides', 'Community'].map(category => (
            <Button
              key={category}
              variant={category === 'All' ? 'default' : 'outline'}
              size="sm"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {blogPosts.filter(post => !post.featured).map(post => (
            <Card key={post.id} className="card hover:card-elevated transition-all duration-200 cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="text-xs">
                    {post.category}
                  </Badge>
                  <span className="text-xs text-neo-text-secondary">
                    {post.readTime}
                  </span>
                </div>
                <CardTitle className="text-neo-text-primary line-clamp-2">
                  {post.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neo-text-secondary mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between text-sm text-neo-text-secondary">
                  <span>{post.author}</span>
                  <span>{new Date(post.date).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Newsletter Signup */}
        <Card className="card mt-16 bg-gradient-to-r from-primary/5 to-violet/5 border-primary/20">
          <CardContent className="p-8 text-center">
            <Zap className="h-8 w-8 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-neo-text-primary mb-4">
              Stay in the Loop
            </h3>
            <p className="text-neo-text-secondary mb-6 max-w-md mx-auto">
              Get the latest updates, feature announcements, and exclusive tips 
              delivered to your inbox.
            </p>
            <div className="flex gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="input-base flex-1"
              />
              <Button className="btn-primary">
                Subscribe
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
