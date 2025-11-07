#!/bin/bash

# Deployment script for Promptly Printed API to Hetzner server
# Usage: ./deploy.sh

set -e  # Exit on error

echo "🚀 Starting deployment to production server..."

# Configuration
SERVER_USER="root"  # Change to your server username
SERVER_HOST="your-server-ip"  # Change to your server IP or hostname
REMOTE_DIR="/opt/promptlyprinted"
LOCAL_DIR="."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored messages
print_info() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    print_error ".env.production file not found!"
    print_info "Please copy .env.production.example to .env.production and configure it"
    exit 1
fi

# Ask for confirmation
print_warning "This will deploy to: ${SERVER_USER}@${SERVER_HOST}"
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_info "Deployment cancelled"
    exit 0
fi

# Step 1: Create remote directory if it doesn't exist
print_info "Creating remote directory..."
ssh ${SERVER_USER}@${SERVER_HOST} "mkdir -p ${REMOTE_DIR}"

# Step 2: Copy files to server
print_info "Copying files to server..."
rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude '.next' \
    --exclude 'dist' \
    --exclude '.turbo' \
    --exclude 'coverage' \
    --exclude '.env.local' \
    --exclude '.env.development' \
    ${LOCAL_DIR}/ ${SERVER_USER}@${SERVER_HOST}:${REMOTE_DIR}/

# Step 3: Copy production environment file
print_info "Copying .env.production file..."
scp .env.production ${SERVER_USER}@${SERVER_HOST}:${REMOTE_DIR}/.env.production

# Step 4: Deploy on server
print_info "Building and starting services on server..."
ssh ${SERVER_USER}@${SERVER_HOST} << 'ENDSSH'
cd /opt/promptlyprinted

# Load environment variables
export $(cat .env.production | grep -v '^#' | xargs)

# Stop existing containers
echo "Stopping existing containers..."
docker-compose down

# Remove old images to save space (optional)
echo "Cleaning up old images..."
docker image prune -af --filter "until=72h"

# Build and start services
echo "Building new images..."
docker-compose build --no-cache

echo "Starting services..."
docker-compose up -d

# Wait for services to be healthy
echo "Waiting for services to be healthy..."
sleep 10

# Show status
echo "Service status:"
docker-compose ps

# Show logs
echo "Recent logs:"
docker-compose logs --tail=50

ENDSSH

print_info "✅ Deployment complete!"
print_info "Check status: ssh ${SERVER_USER}@${SERVER_HOST} 'cd ${REMOTE_DIR} && docker-compose ps'"
print_info "View logs: ssh ${SERVER_USER}@${SERVER_HOST} 'cd ${REMOTE_DIR} && docker-compose logs -f api'"
