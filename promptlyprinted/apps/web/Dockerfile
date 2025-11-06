# syntax=docker/dockerfile:1.7-labs

FROM node:22-bookworm-slim AS base

ENV PNPM_HOME="/usr/local/share/pnpm" \
    PATH="/usr/local/share/pnpm:$PATH" \
    NEXT_TELEMETRY_DISABLED=1

RUN corepack enable && \
    apt-get update && \
    apt-get install -y --no-install-recommends python3 make g++ libvips && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /workspace

FROM base AS deps

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json ./
COPY turbo ./turbo
COPY packages ./packages
COPY apps ./apps

RUN pnpm install --frozen-lockfile

FROM deps AS build

ENV NODE_ENV=production

COPY . .
RUN pnpm --filter web build && \
    pnpm deploy --filter web --prod /app

FROM node:22-bookworm-slim AS runner

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PNPM_HOME="/usr/local/share/pnpm" \
    PATH="/usr/local/share/pnpm:$PATH"

RUN corepack enable && \
    apt-get update && \
    apt-get install -y --no-install-recommends libvips && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=build /app ./

EXPOSE 3000

CMD ["pnpm", "start"]
