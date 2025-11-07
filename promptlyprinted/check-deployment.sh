#!/bin/bash

# Diagnostic script to check deployment status
# Usage: ./check-deployment.sh

SERVER_USER="root"
SERVER_HOST="your-server-ip"  # Change to your server IP
REMOTE_DIR="/opt/promptlyprinted"

echo "🔍 Checking deployment on ${SERVER_HOST}..."

ssh ${SERVER_USER}@${SERVER_HOST} << 'ENDSSH'
echo "📁 Checking files in /opt/promptlyprinted..."
ls -la /opt/promptlyprinted/docker-compose*

echo ""
echo "📦 Checking Docker..."
docker --version
docker-compose --version

echo ""
echo "🐳 Checking running containers..."
docker ps

echo ""
echo "📋 Checking if docker-compose.prod.yml exists..."
if [ -f "/opt/promptlyprinted/docker-compose.prod.yml" ]; then
    echo "✅ docker-compose.prod.yml exists"
else
    echo "❌ docker-compose.prod.yml NOT FOUND"
fi

echo ""
echo "🔍 Looking for any docker-compose files..."
find /opt/promptlyprinted -name "docker-compose*" -type f

ENDSSH
