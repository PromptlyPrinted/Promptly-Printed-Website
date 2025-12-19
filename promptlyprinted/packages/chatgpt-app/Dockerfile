# PromptlyPrinted ChatGPT App - Production Dockerfile
FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm

# Build stage
FROM base AS builder
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./
COPY packages/chatgpt-app/package.json ./packages/chatgpt-app/

# Install dependencies
RUN pnpm install --frozen-lockfile --filter @repo/chatgpt-app

# Copy source code
COPY packages/chatgpt-app ./packages/chatgpt-app

# Build the app
WORKDIR /app/packages/chatgpt-app
RUN pnpm build

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 chatgpt-app

# Copy built files
COPY --from=builder /app/packages/chatgpt-app/dist ./dist
COPY --from=builder /app/packages/chatgpt-app/package.json ./

# Install production dependencies only
RUN npm install --omit=dev

# Switch to non-root user
USER chatgpt-app

# Expose port
EXPOSE 3100

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3100

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3100/health || exit 1

# Start the server
CMD ["node", "dist/server.js"]
