#!/bin/bash
# Push all Docker images to GitHub Container Registry
# Usage: ./push-all.sh [tag]
# Example: ./push-all.sh v1.0.0

set -e

# Configuration
REGISTRY="ghcr.io"
REPO_OWNER="promptlyprinted"  # Change to your GitHub username/org
IMAGE_PREFIX="$REGISTRY/$REPO_OWNER/promptly-printed-website"
TAG="${1:-latest}"

# Apps to push
APPS=("web" "app" "api")

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}Pushing Docker Images${NC}"
echo -e "${BLUE}================================${NC}"
echo ""
echo -e "Registry: ${YELLOW}$IMAGE_PREFIX${NC}"
echo -e "Tag: ${YELLOW}$TAG${NC}"
echo ""

# Check if logged in to registry
if ! docker info | grep -q "Username"; then
    echo -e "${YELLOW}⚠ Not logged in to Docker registry${NC}"
    echo ""
    echo "To login to GitHub Container Registry:"
    echo "  echo \$GITHUB_PAT | docker login ghcr.io -u YOUR_USERNAME --password-stdin"
    echo ""
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Push each app
for APP in "${APPS[@]}"; do
  echo -e "${BLUE}================================${NC}"
  echo -e "${BLUE}Pushing: $APP${NC}"
  echo -e "${BLUE}================================${NC}"

  IMAGE_NAME="$IMAGE_PREFIX/$APP:$TAG"

  # Check if image exists locally
  if ! docker image inspect "$IMAGE_NAME" >/dev/null 2>&1; then
    echo -e "${RED}✗ Image not found: $IMAGE_NAME${NC}"
    echo "  Run ./build-all.sh first to build the images"
    exit 1
  fi

  START_TIME=$(date +%s)

  docker push "$IMAGE_NAME" || {
    echo -e "${RED}✗ Failed to push $APP${NC}"
    exit 1
  }

  # Also push latest tag if pushing a different tag
  if [ "$TAG" != "latest" ]; then
    echo "Pushing latest tag..."
    docker push "$IMAGE_PREFIX/$APP:latest" || {
      echo -e "${YELLOW}⚠ Failed to push latest tag${NC}"
    }
  fi

  END_TIME=$(date +%s)
  DURATION=$((END_TIME - START_TIME))

  echo ""
  echo -e "${GREEN}✓ Pushed $IMAGE_NAME${NC}"
  echo -e "  Push time: ${DURATION}s"
  echo ""
done

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}All images pushed successfully!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "Pushed images:"
for APP in "${APPS[@]}"; do
  echo -e "  • ${YELLOW}$IMAGE_PREFIX/$APP:$TAG${NC}"
done
echo ""
echo "To deploy in Coolify:"
echo "  1. Create a new service (Docker Image type)"
echo "  2. Use image: $IMAGE_PREFIX/[APP]:$TAG"
echo "  3. Set environment variables"
echo "  4. Deploy!"
echo ""
