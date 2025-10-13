FROM node:18-alpine AS base

# Install pnpm globally (cached layer)
RUN npm install -g pnpm@8

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Accept build args for optimization
ARG NODE_OPTIONS="--max-old-space-size=2048"
ENV NODE_OPTIONS=$NODE_OPTIONS

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Configure pnpm for faster installs and install dependencies
# This layer is cached unless package.json or pnpm-lock.yaml changes
RUN pnpm config set network-timeout 300000 && \
    pnpm config set fetch-retries 5 && \
    pnpm install --frozen-lockfile --prefer-offline --ignore-scripts

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Accept build args for optimization
ARG NODE_OPTIONS="--max-old-space-size=2048"
ENV NODE_OPTIONS=$NODE_OPTIONS

# Accept NEXT_PUBLIC_* environment variables as build args
# These are embedded into the JavaScript bundle at build time
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_WS_URL=wss://be-watch-party.brahim-elhouss.me/ws
ARG NEXT_PUBLIC_ENABLE_GOOGLE_DRIVE=true
ARG NEXT_PUBLIC_ENABLE_DISCORD=true
ARG NEXT_PUBLIC_ENABLE_ANALYTICS=true

# Convert build args to environment variables for Next.js build
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL
ENV NEXT_PUBLIC_ENABLE_GOOGLE_DRIVE=$NEXT_PUBLIC_ENABLE_GOOGLE_DRIVE
ENV NEXT_PUBLIC_ENABLE_DISCORD=$NEXT_PUBLIC_ENABLE_DISCORD
ENV NEXT_PUBLIC_ENABLE_ANALYTICS=$NEXT_PUBLIC_ENABLE_ANALYTICS

# Git commit hash for tracking (doesn't break cache)
ARG GIT_COMMIT_HASH=unknown
ENV GIT_COMMIT_HASH=$GIT_COMMIT_HASH

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy only necessary files for build
COPY package.json pnpm-lock.yaml* next.config.mjs tsconfig.json tailwind.config.ts postcss.config.mjs ./
COPY public ./public
COPY app ./app
COPY components ./components
COPY lib ./lib
COPY hooks ./hooks
COPY styles ./styles

# Build with Next.js cache optimization
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Install curl for container health checks
RUN apk add --no-cache curl

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the public folder
COPY --from=builder /app/public ./public

# Copy the built application
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000 || exit 1

CMD ["node", "server.js"]