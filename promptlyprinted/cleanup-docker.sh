#!/bin/bash
# Script to clean up Docker and free memory on the server

echo "======================================"
echo "Docker Cleanup Script"
echo "======================================"
echo ""

echo "Current Docker disk usage:"
docker system df
echo ""

echo "Current memory usage:"
free -h
echo ""

read -p "This will remove all stopped containers, unused images, and build cache. Continue? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
fi

echo ""
echo "Stopping all running containers..."
docker stop $(docker ps -aq) 2>/dev/null || echo "No containers to stop"

echo ""
echo "Removing stopped containers..."
docker container prune -f

echo ""
echo "Removing unused images..."
docker image prune -a -f

echo ""
echo "Removing build cache..."
docker builder prune -a -f

echo ""
echo "Removing unused volumes..."
docker volume prune -f

echo ""
echo "Removing unused networks..."
docker network prune -f

echo ""
echo "======================================"
echo "Cleanup complete!"
echo "======================================"
echo ""

echo "New Docker disk usage:"
docker system df
echo ""

echo "New memory usage:"
free -h
echo ""

echo "Disk space freed up!"
df -h /
