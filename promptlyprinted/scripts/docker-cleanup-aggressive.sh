#!/bin/bash

# Aggressive Docker Cleanup Script
# Removes ALL unused Docker resources including volumes
# ⚠️ WARNING: This will remove all stopped containers, unused images, and volumes!

set -e

echo "⚠️  AGGRESSIVE Docker cleanup - this will remove ALL unused resources!"
echo ""
read -p "Are you sure you want to continue? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "Cleanup cancelled."
    exit 1
fi

echo ""
echo "🧹 Starting aggressive cleanup..."
echo ""

# Remove all stopped containers
echo "📦 Removing all stopped containers..."
docker container prune -f

# Remove all unused images (not just dangling)
echo "🖼️  Removing all unused images..."
docker image prune -a -f

# Remove all unused volumes
echo "💾 Removing all unused volumes..."
docker volume prune -f

# Remove all unused networks
echo "🌐 Removing all unused networks..."
docker network prune -f

# Remove all build cache
echo "🔨 Removing all build cache..."
docker builder prune -a -f

# Show disk space saved
echo ""
echo "✅ Aggressive cleanup complete!"
echo ""
echo "Current Docker disk usage:"
docker system df
