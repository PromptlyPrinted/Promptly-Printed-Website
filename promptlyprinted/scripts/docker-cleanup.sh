#!/bin/bash

# Docker Cleanup Script
# Removes dangling images, stopped containers, and unused build cache

set -e

echo "🧹 Starting Docker cleanup..."
echo ""

# Remove stopped containers
echo "📦 Removing stopped containers..."
docker container prune -f

# Remove dangling images (untagged)
echo "🖼️  Removing dangling images..."
docker image prune -f

# Remove unused build cache
echo "🔨 Removing unused build cache..."
docker builder prune -f

# Show disk space saved
echo ""
echo "✅ Docker cleanup complete!"
echo ""
echo "Current Docker disk usage:"
docker system df
