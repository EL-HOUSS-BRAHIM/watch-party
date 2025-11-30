/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  outputFileTracingRoot: process.cwd(),
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    // Optimize trace collection for faster builds
    outputFileTracingIncludes: {
      '/': ['./public/**/*'],
    },
    // Reduce trace depth for faster builds
    outputFileTracingIgnores: [
      'node_modules/@swc/**',
      'node_modules/webpack/**',
    ],
  },
  // Security headers including CSP
  async headers() {
    const isDev = process.env.NODE_ENV === 'development';
    const isVSCode = process.env.VSCODE_SIMPLE_BROWSER === 'true';

    // In development OR VS Code Simple Browser, allow all framing and disable restrictive headers
    // to support VS Code Simple Browser and other development tools
    if (isDev || isVSCode) {
      return [
        {
          source: '/(.*)',
          headers: [
            {
              key: 'X-Content-Type-Options',
              value: 'nosniff'
            },
            // No X-Frame-Options in dev to allow all framing
            // No CSP in dev to avoid conflicts
          ],
        },
      ];
    }

    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data:",
              "connect-src 'self' ws: wss: https:",
              "media-src 'self' blob: https:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'self' https://*.vscode-cdn.net vscode-webview://*",
              "upgrade-insecure-requests"
            ].join('; ')
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          // Remove X-Frame-Options to allow VS Code Simple Browser and other legitimate framing
          // CSP frame-ancestors provides the same protection in a more flexible way
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ],
      },
    ]
  },
  // Performance optimizations
  experimental: {
    optimizePackageImports: ['@radix-ui/react-select', '@radix-ui/react-slot', '@radix-ui/react-switch'],
  },
  // Reduce bundle size
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      }
    }
    return config
  },
}

export default nextConfig
