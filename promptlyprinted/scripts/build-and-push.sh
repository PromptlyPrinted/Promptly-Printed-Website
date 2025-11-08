#!/bin/bash

# Build and Push Docker Images to GitHub Container Registry
# This script builds all three apps locally and pushes them to ghcr.io
# Usage: ./scripts/build-and-push.sh [tag]
# Example: ./scripts/build-and-push.sh v1.0.0

set -e

# Configuration
REGISTRY="ghcr.io"
REPO="promptlyprinted/promptly-printed-website"
TAG="${1:-latest}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Building and Pushing Promptly Printed Images ===${NC}"
echo -e "Registry: ${REGISTRY}"
echo -e "Repository: ${REPO}"
echo -e "Tag: ${TAG}"
echo ""

# Check if logged in to GitHub Container Registry
echo -e "${YELLOW}Checking GitHub Container Registry authentication...${NC}"
if ! echo "$CR_PAT" | docker login ghcr.io -u USERNAME --password-stdin 2>/dev/null; then
    echo -e "${RED}Please set CR_PAT environment variable with your GitHub Personal Access Token${NC}"
    echo -e "${YELLOW}Create a token at: https://github.com/settings/tokens${NC}"
    echo -e "${YELLOW}Required scopes: write:packages, read:packages${NC}"
    echo -e "${YELLOW}Then run: export CR_PAT=your_token_here${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Authenticated with GitHub Container Registry${NC}"
echo ""

# Function to build and push an image
build_and_push() {
    local app_name=$1
    local image_name="${REGISTRY}/${REPO}/${app_name}:${TAG}"

    echo -e "${GREEN}=== Building ${app_name} ===${NC}"
    docker build \
        --build-arg APP_NAME=${app_name} \
        --build-arg BETTER_AUTH_SECRET="${BETTER_AUTH_SECRET}" \
        --build-arg BETTER_AUTH_URL="${BETTER_AUTH_URL}" \
        --build-arg DATABASE_URL="${DATABASE_URL}" \
        --build-arg PULSE_API_KEY="${PULSE_API_KEY}" \
        --build-arg ARCJET_KEY="${ARCJET_KEY}" \
        --build-arg BASEHUB_TOKEN="${BASEHUB_TOKEN}" \
        --build-arg BASEHUB_ADMIN_TOKEN="${BASEHUB_ADMIN_TOKEN}" \
        --build-arg PRODIGI_API_KEY="${PRODIGI_API_KEY}" \
        --build-arg PRODIGI_API="${PRODIGI_API}" \
        --build-arg SQUARE_ACCESS_TOKEN="${SQUARE_ACCESS_TOKEN}" \
        --build-arg SQUARE_LOCATION_ID="${SQUARE_LOCATION_ID}" \
        --build-arg SQUARE_ENVIRONMENT="${SQUARE_ENVIRONMENT}" \
        --build-arg SQUARE_WEBHOOK_SIGNATURE_KEY="${SQUARE_WEBHOOK_SIGNATURE_KEY}" \
        --build-arg GOOGLE_GEMINI_API_KEY="${GOOGLE_GEMINI_API_KEY}" \
        --build-arg TOGETHER_API_KEY="${TOGETHER_API_KEY}" \
        --build-arg RESEND_TOKEN="${RESEND_TOKEN}" \
        --build-arg RESEND_FROM="${RESEND_FROM}" \
        --build-arg RESEND_AUDIENCE_ID="${RESEND_AUDIENCE_ID}" \
        --build-arg BETTERSTACK_API_KEY="${BETTERSTACK_API_KEY}" \
        --build-arg BETTERSTACK_URL="${BETTERSTACK_URL}" \
        --build-arg FLAGS_SECRET="${FLAGS_SECRET}" \
        --build-arg SVIX_TOKEN="${SVIX_TOKEN}" \
        --build-arg LIVEBLOCKS_SECRET="${LIVEBLOCKS_SECRET}" \
        --build-arg NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL}" \
        --build-arg NEXT_PUBLIC_APP_URL="${NEXT_PUBLIC_APP_URL}" \
        --build-arg NEXT_PUBLIC_WEB_URL="${NEXT_PUBLIC_WEB_URL}" \
        --build-arg NEXT_PUBLIC_BETTER_AUTH_URL="${NEXT_PUBLIC_BETTER_AUTH_URL}" \
        --build-arg NEXT_PUBLIC_DOCS_URL="${NEXT_PUBLIC_DOCS_URL}" \
        --build-arg NEXT_PUBLIC_GA_MEASUREMENT_ID="${NEXT_PUBLIC_GA_MEASUREMENT_ID}" \
        --build-arg NEXT_PUBLIC_POSTHOG_KEY="${NEXT_PUBLIC_POSTHOG_KEY}" \
        --build-arg NEXT_PUBLIC_POSTHOG_HOST="${NEXT_PUBLIC_POSTHOG_HOST}" \
        --build-arg NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL="${NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}" \
        -t ${image_name} \
        -f Dockerfile \
        .

    echo -e "${GREEN}✓ Built ${image_name}${NC}"
    echo ""

    echo -e "${YELLOW}Pushing ${image_name}...${NC}"
    docker push ${image_name}
    echo -e "${GREEN}✓ Pushed ${image_name}${NC}"
    echo ""
}

# Build and push all apps
build_and_push "web"
build_and_push "app"
build_and_push "api"

# Also tag as latest if a specific version was provided
if [ "$TAG" != "latest" ]; then
    echo -e "${YELLOW}Tagging as latest...${NC}"
    docker tag ${REGISTRY}/${REPO}/web:${TAG} ${REGISTRY}/${REPO}/web:latest
    docker tag ${REGISTRY}/${REPO}/app:${TAG} ${REGISTRY}/${REPO}/app:latest
    docker tag ${REGISTRY}/${REPO}/api:${TAG} ${REGISTRY}/${REPO}/api:latest

    docker push ${REGISTRY}/${REPO}/web:latest
    docker push ${REGISTRY}/${REPO}/app:latest
    docker push ${REGISTRY}/${REPO}/api:latest
    echo -e "${GREEN}✓ Tagged and pushed as latest${NC}"
fi

echo ""
echo -e "${GREEN}=== All images built and pushed successfully! ===${NC}"
echo ""
echo -e "Images available at:"
echo -e "  - ${REGISTRY}/${REPO}/web:${TAG}"
echo -e "  - ${REGISTRY}/${REPO}/app:${TAG}"
echo -e "  - ${REGISTRY}/${REPO}/api:${TAG}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. Update Coolify to use docker-compose.prod.yaml"
echo -e "2. Set IMAGE_TAG=${TAG} in Coolify environment variables"
echo -e "3. Deploy!"
