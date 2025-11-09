#!/bin/bash
# Build all Docker images for Promptly Printed Website
# Usage: ./build-all.sh [tag]
# Example: ./build-all.sh v1.0.0

set -e

# Configuration
REGISTRY="ghcr.io"
REPO_OWNER="promptlyprinted"  # Change to your GitHub username/org
IMAGE_PREFIX="$REGISTRY/$REPO_OWNER/promptly-printed-website"
TAG="${1:-latest}"

# Apps to build
APPS=("web" "app" "api")

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}Building Docker Images${NC}"
echo -e "${BLUE}================================${NC}"
echo ""
echo -e "Registry: ${YELLOW}$IMAGE_PREFIX${NC}"
echo -e "Tag: ${YELLOW}$TAG${NC}"
echo ""

# Check if .env file exists
if [ -f .env ]; then
    echo -e "${GREEN}✓${NC} Found .env file"
else
    echo -e "${YELLOW}⚠${NC} No .env file found - builds may fail if environment variables are required"
fi

echo ""

# Build each app
for APP in "${APPS[@]}"; do
  echo -e "${BLUE}================================${NC}"
  echo -e "${BLUE}Building: $APP${NC}"
  echo -e "${BLUE}================================${NC}"

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
done

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}All images built successfully!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "Built images:"
for APP in "${APPS[@]}"; do
  echo -e "  • ${YELLOW}$IMAGE_PREFIX/$APP:$TAG${NC}"
done
echo ""
echo "To push to registry, run:"
echo -e "  ${BLUE}./push-all.sh $TAG${NC}"
echo ""
echo "Or push individually:"
for APP in "${APPS[@]}"; do
  echo "  docker push $IMAGE_PREFIX/$APP:$TAG"
done
echo ""
