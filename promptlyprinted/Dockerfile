# syntax=docker/dockerfile:1.7-labs

# ================================================================
# Base stage - common dependencies
# ================================================================
FROM node:22-bookworm-slim AS base

# Set memory limits appropriate for 4GB server
ENV PNPM_HOME="/usr/local/share/pnpm" \
    PATH="/usr/local/share/pnpm:$PATH" \
    PNPM_STORE_DIR="/root/.pnpm-store" \
    NEXT_TELEMETRY_DISABLED=1 \
    # Conservative memory limit for 4GB server (leaves 1.5GB for system)
    NODE_OPTIONS="--max-old-space-size=2048 --gc-interval=100"

# Install build dependencies in one layer
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    corepack enable && \
    apt-get update && \
    apt-get install -y --no-install-recommends \
        python3 \
        make \
        g++ \
        libvips \
        ca-certificates \
        curl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /workspace

# ================================================================
# Dependencies stage - install all packages (Turborepo optimized)
# ================================================================
FROM base AS deps

# Copy workspace configuration files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json ./
COPY .npmrc* ./ 2>/dev/null || true

# Copy all source code for proper workspace resolution
# This is necessary for pnpm workspace detection
COPY turbo ./turbo
COPY packages ./packages
COPY apps ./apps

# Install ALL dependencies first (needed for turborepo to work correctly)
# pnpm will use the lockfile to ensure consistent installs
RUN --mount=type=cache,id=promptlyprinted-pnpm-store,target=/root/.pnpm-store \
    pnpm install --frozen-lockfile

# ================================================================
# Build stage - build the API
# ================================================================
FROM deps AS build

# Build arguments for environment variables
ARG BETTER_AUTH_SECRET
ARG BETTER_AUTH_URL
ARG GOOGLE_CLIENT_ID
ARG GOOGLE_CLIENT_SECRET
ARG APPLE_CLIENT_ID
ARG APPLE_CLIENT_SECRET
ARG GITHUB_CLIENT_ID
ARG GITHUB_CLIENT_SECRET
ARG CLERK_SECRET_KEY
ARG CLERK_WEBHOOK_SECRET
ARG RESEND_AUDIENCE_ID
ARG RESEND_FROM
ARG DATABASE_URL
ARG PULSE_API_KEY
ARG RESEND_TOKEN
ARG STRIPE_SECRET_KEY
ARG STRIPE_WEBHOOK_SECRET
ARG BETTERSTACK_API_KEY
ARG BETTERSTACK_URL
ARG FLAGS_SECRET
ARG ARCJET_KEY
ARG SVIX_TOKEN
ARG LIVEBLOCKS_SECRET
ARG BASEHUB_TOKEN
ARG BASEHUB_ADMIN_TOKEN
ARG NEXT_PUBLIC_BETTER_AUTH_URL
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_CLERK_SIGN_IN_URL
ARG NEXT_PUBLIC_CLERK_SIGN_UP_URL
ARG NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL
ARG NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL
ARG NEXT_PUBLIC_GA_MEASUREMENT_ID
ARG NEXT_PUBLIC_POSTHOG_KEY
ARG NEXT_PUBLIC_POSTHOG_HOST
ARG NEXT_PUBLIC_DOCS_URL
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_WEB_URL
ARG NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL
ARG NEXT_PUBLIC_API_URL
ARG NEXTAUTH_URL
ARG NEXTAUTH_SECRET
ARG PRODIGI_API_KEY
ARG PRODIGI_API
ARG SQUARE_ACCESS_TOKEN
ARG SQUARE_LOCATION_ID
ARG SQUARE_ENVIRONMENT
ARG SQUARE_WEBHOOK_SIGNATURE_KEY
ARG GOOGLE_GEMINI_API_KEY
ARG TOGETHER_API_KEY
ARG POSTHOG_API_KEY

# Set environment variables for build
ENV BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET} \
    BETTER_AUTH_URL=${BETTER_AUTH_URL} \
    GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID} \
    GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET} \
    APPLE_CLIENT_ID=${APPLE_CLIENT_ID} \
    APPLE_CLIENT_SECRET=${APPLE_CLIENT_SECRET} \
    GITHUB_CLIENT_ID=${GITHUB_CLIENT_ID} \
    GITHUB_CLIENT_SECRET=${GITHUB_CLIENT_SECRET} \
    CLERK_SECRET_KEY=${CLERK_SECRET_KEY} \
    CLERK_WEBHOOK_SECRET=${CLERK_WEBHOOK_SECRET} \
    RESEND_AUDIENCE_ID=${RESEND_AUDIENCE_ID} \
    RESEND_FROM=${RESEND_FROM} \
    DATABASE_URL=${DATABASE_URL} \
    PULSE_API_KEY=${PULSE_API_KEY} \
    RESEND_TOKEN=${RESEND_TOKEN} \
    STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY} \
    STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET} \
    BETTERSTACK_API_KEY=${BETTERSTACK_API_KEY} \
    BETTERSTACK_URL=${BETTERSTACK_URL} \
    FLAGS_SECRET=${FLAGS_SECRET} \
    ARCJET_KEY=${ARCJET_KEY} \
    SVIX_TOKEN=${SVIX_TOKEN} \
    LIVEBLOCKS_SECRET=${LIVEBLOCKS_SECRET} \
    BASEHUB_TOKEN=${BASEHUB_TOKEN} \
    BASEHUB_ADMIN_TOKEN=${BASEHUB_ADMIN_TOKEN} \
    NEXT_PUBLIC_BETTER_AUTH_URL=${NEXT_PUBLIC_BETTER_AUTH_URL} \
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY} \
    NEXT_PUBLIC_CLERK_SIGN_IN_URL=${NEXT_PUBLIC_CLERK_SIGN_IN_URL} \
    NEXT_PUBLIC_CLERK_SIGN_UP_URL=${NEXT_PUBLIC_CLERK_SIGN_UP_URL} \
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=${NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL} \
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=${NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL} \
    NEXT_PUBLIC_GA_MEASUREMENT_ID=${NEXT_PUBLIC_GA_MEASUREMENT_ID} \
    NEXT_PUBLIC_POSTHOG_KEY=${NEXT_PUBLIC_POSTHOG_KEY} \
    NEXT_PUBLIC_POSTHOG_HOST=${NEXT_PUBLIC_POSTHOG_HOST} \
    NEXT_PUBLIC_DOCS_URL=${NEXT_PUBLIC_DOCS_URL} \
    NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL} \
    NEXT_PUBLIC_WEB_URL=${NEXT_PUBLIC_WEB_URL} \
    NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL=${NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL} \
    NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL} \
    NEXTAUTH_URL=${NEXTAUTH_URL} \
    NEXTAUTH_SECRET=${NEXTAUTH_SECRET} \
    PRODIGI_API_KEY=${PRODIGI_API_KEY} \
    PRODIGI_API=${PRODIGI_API} \
    SQUARE_ACCESS_TOKEN=${SQUARE_ACCESS_TOKEN} \
    SQUARE_LOCATION_ID=${SQUARE_LOCATION_ID} \
    SQUARE_ENVIRONMENT=${SQUARE_ENVIRONMENT} \
    SQUARE_WEBHOOK_SIGNATURE_KEY=${SQUARE_WEBHOOK_SIGNATURE_KEY} \
    GOOGLE_GEMINI_API_KEY=${GOOGLE_GEMINI_API_KEY} \
    TOGETHER_API_KEY=${TOGETHER_API_KEY} \
    POSTHOG_API_KEY=${POSTHOG_API_KEY} \
    NODE_ENV=production

# Copy source and build
COPY . .

# Generate Prisma client and build API
# Best practices for 4GB server:
# - Sequential builds prevent memory spikes
# - Explicit GC to free memory between steps
# - Conservative heap limit with headroom
# - Turbo cache for incremental builds
RUN --mount=type=cache,id=promptlyprinted-pnpm-store,target=/root/.pnpm-store \
    --mount=type=cache,id=promptlyprinted-turbo,target=.turbo \
    set -e && \
    echo "Building database package..." && \
    pnpm --filter @repo/database run build && \
    echo "Building API..." && \
    pnpm --filter api build && \
    echo "Deploying production dependencies..." && \
    pnpm deploy --filter api --prod /app && \
    echo "Build complete!"

# ================================================================
# Runner stage - minimal production image
# ================================================================
FROM node:22-bookworm-slim AS runner

# Runtime environment variables
ARG BETTER_AUTH_SECRET
ARG BETTER_AUTH_URL
ARG DATABASE_URL
ARG PULSE_API_KEY
ARG RESEND_TOKEN
ARG RESEND_FROM
ARG RESEND_AUDIENCE_ID
ARG BETTERSTACK_API_KEY
ARG BETTERSTACK_URL
ARG FLAGS_SECRET
ARG ARCJET_KEY
ARG SVIX_TOKEN
ARG LIVEBLOCKS_SECRET
ARG BASEHUB_TOKEN
ARG BASEHUB_ADMIN_TOKEN
ARG PRODIGI_API_KEY
ARG PRODIGI_API
ARG SQUARE_ACCESS_TOKEN
ARG SQUARE_LOCATION_ID
ARG SQUARE_ENVIRONMENT
ARG SQUARE_WEBHOOK_SIGNATURE_KEY
ARG GOOGLE_GEMINI_API_KEY
ARG TOGETHER_API_KEY
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_WEB_URL
ARG NEXT_PUBLIC_BETTER_AUTH_URL
ARG NEXT_PUBLIC_DOCS_URL
ARG NEXT_PUBLIC_GA_MEASUREMENT_ID
ARG NEXT_PUBLIC_POSTHOG_KEY
ARG NEXT_PUBLIC_POSTHOG_HOST
ARG NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PNPM_HOME="/usr/local/share/pnpm" \
    PATH="/usr/local/share/pnpm:$PATH" \
    # Runtime optimization: 1.5GB heap for API workload on 4GB server
    NODE_OPTIONS="--max-old-space-size=1536 --gc-interval=100" \
    # Application environment variables
    BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET} \
    BETTER_AUTH_URL=${BETTER_AUTH_URL} \
    DATABASE_URL=${DATABASE_URL} \
    PULSE_API_KEY=${PULSE_API_KEY} \
    RESEND_TOKEN=${RESEND_TOKEN} \
    RESEND_FROM=${RESEND_FROM} \
    RESEND_AUDIENCE_ID=${RESEND_AUDIENCE_ID} \
    BETTERSTACK_API_KEY=${BETTERSTACK_API_KEY} \
    BETTERSTACK_URL=${BETTERSTACK_URL} \
    FLAGS_SECRET=${FLAGS_SECRET} \
    ARCJET_KEY=${ARCJET_KEY} \
    SVIX_TOKEN=${SVIX_TOKEN} \
    LIVEBLOCKS_SECRET=${LIVEBLOCKS_SECRET} \
    BASEHUB_TOKEN=${BASEHUB_TOKEN} \
    BASEHUB_ADMIN_TOKEN=${BASEHUB_ADMIN_TOKEN} \
    PRODIGI_API_KEY=${PRODIGI_API_KEY} \
    PRODIGI_API=${PRODIGI_API} \
    SQUARE_ACCESS_TOKEN=${SQUARE_ACCESS_TOKEN} \
    SQUARE_LOCATION_ID=${SQUARE_LOCATION_ID} \
    SQUARE_ENVIRONMENT=${SQUARE_ENVIRONMENT} \
    SQUARE_WEBHOOK_SIGNATURE_KEY=${SQUARE_WEBHOOK_SIGNATURE_KEY} \
    GOOGLE_GEMINI_API_KEY=${GOOGLE_GEMINI_API_KEY} \
    TOGETHER_API_KEY=${TOGETHER_API_KEY} \
    NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL} \
    NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL} \
    NEXT_PUBLIC_WEB_URL=${NEXT_PUBLIC_WEB_URL} \
    NEXT_PUBLIC_BETTER_AUTH_URL=${NEXT_PUBLIC_BETTER_AUTH_URL} \
    NEXT_PUBLIC_DOCS_URL=${NEXT_PUBLIC_DOCS_URL} \
    NEXT_PUBLIC_GA_MEASUREMENT_ID=${NEXT_PUBLIC_GA_MEASUREMENT_ID} \
    NEXT_PUBLIC_POSTHOG_KEY=${NEXT_PUBLIC_POSTHOG_KEY} \
    NEXT_PUBLIC_POSTHOG_HOST=${NEXT_PUBLIC_POSTHOG_HOST} \
    NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL=${NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL} \
    PORT=3000 \
    HOSTNAME="0.0.0.0"

# Install runtime dependencies only
RUN corepack enable && \
    apt-get update && \
    apt-get install -y --no-install-recommends \
        libvips \
        ca-certificates && \
    rm -rf /var/lib/apt/lists/* && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

WORKDIR /app

# Copy built application from build stage
COPY --from=build --chown=nextjs:nodejs /app ./

USER nextjs

EXPOSE 3000

CMD ["pnpm", "start"]
