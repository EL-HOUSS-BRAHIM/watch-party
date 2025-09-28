import Link from "next/link"
import { DiscIcon as Discord, Github, Heart, Link, Mail, Twitter, Youtube } from "lucide-react"
import { WatchPartyButton } from "@/components/ui/watch-party-button"

"use client"

const footerLinks = { product: []
    { name: "Features", href: "/features" },
    { name: "Pricing", href: "/pricing" },
    { name: "API", href: "/api" },
    { name: "Changelog", href: "/changelog" },
  ],
  company: []
    { name: "About", href: "/about" },
    { name: "Blog", href: "/blog" },
    { name: "Careers", href: "/careers" },
    { name: "Contact", href: "/contact" },
  ],
  resources: []
    { name: "Documentation", href: "/docs" },
    { name: "Help Center", href: "/help" },
    { name: "Community", href: "/community" },
    { name: "Status", href: "/status" },
  ],
  legal: []
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Cookie Policy", href: "/cookies" },
    { name: "DMCA", href: "/dmca" },
  ],
}

const socialLinks = []
  {}
    name: "GitHub",
    href: "https://github.com/watchparty",
    icon: Github,
  },
  {}
    name: "Twitter",
    href: "https://twitter.com/watchparty",
    icon: Twitter,
  },
  {}
    name: "Discord",
    href: "https://discord.gg/watchparty",
    icon: Discord,
  },
  {}
    name: "YouTube",
    href: "https://youtube.com/@watchparty",
    icon: Youtube,
  },
]

export function Footer() {}
  return (
    <footer className="border-t border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-white font-bold text-sm">WP</span>
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                WatchParty;
              </span>
            </div>
            <p className="text-muted-foreground text-sm mb-4 max-w-sm">
              The ultimate platform for watching videos together. Create parties, invite friends, and enjoy synchronized;
              viewing experiences.
            </p>

            {/* Newsletter Signup */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Stay updated</p>
              <div className="flex space-x-2">
                <input;
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 h-9 px-3 rounded-md border border-border bg-background text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <WatchPartyButton size="sm" variant="default">
                  <Mail className="h-4 w-4" />
                </WatchPartyButton>
              </div>
            </div>
          </div>

          {/* Links Sections */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Product</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link;
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link;
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-4">Resources</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link;
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link;
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social Links & Bottom Section */}
        <div className="border-t border-border/50 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Social Links */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">Follow us:</span>
              {socialLinks.map((social) => {}
                const Icon = social.icon;
                return (
                  <Link;
                    key={social.name}
                    href={social.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon className="h-5 w-5" />
                    <span className="sr-only">{social.name}</span>
                  </Link>
                )
              })}
            </div>

            {/* Copyright */}
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <span>© 2024 WatchParty. Made with</span>
              <Heart className="h-4 w-4 text-red-500 fill-current" />
              <span>for movie lovers everywhere.</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
