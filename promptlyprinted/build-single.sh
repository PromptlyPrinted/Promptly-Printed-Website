#!/bin/bash
# Build a single Docker image
# Usage: ./build-single.sh [app] [tag]
# Example: ./build-single.sh web v1.0.0

set -e

# Configuration
REGISTRY="ghcr.io"
REPO_OWNER="promptlyprinted"  # Change to your GitHub username/org
IMAGE_PREFIX="$REGISTRY/$REPO_OWNER/promptly-printed-website"

APP="${1:-web}"
TAG="${2:-latest}"

# Validate app name
if [[ ! "$APP" =~ ^(web|app|api)$ ]]; then
    echo "Error: Invalid app name '$APP'"
    echo "Usage: ./build-single.sh [web|app|api] [tag]"
    exit 1
fi

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}Building: $APP${NC}"
echo -e "${BLUE}================================${NC}"
echo ""
echo -e "Image: ${YELLOW}$IMAGE_PREFIX/$APP:$TAG${NC}"
echo ""

START_TIME=$(date +%s)

docker build \
  --build-arg APP_NAME=$APP \
  --tag "$IMAGE_PREFIX/$APP:$TAG" \
  --tag "$IMAGE_PREFIX/$APP:latest" \
  --file ./Dockerfile \
  . || {
    echo -e "${RED}✗ Failed to build $APP${NC}"
    exit 1
  }

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo ""
echo -e "${GREEN}✓ Built $IMAGE_PREFIX/$APP:$TAG${NC}"
echo -e "  Build time: ${DURATION}s"
echo ""
echo "To push to registry, run:"
echo -e "  ${BLUE}docker push $IMAGE_PREFIX/$APP:$TAG${NC}"
echo ""
echo "To run locally:"
echo -e "  ${BLUE}docker run -p 3000:3000 $IMAGE_PREFIX/$APP:$TAG${NC}"
echo ""
