#!/bin/bash

# Bundle Size Checker Script
# Run this after build to monitor bundle sizes

echo "🔍 Checking Next.js Bundle Sizes..."
echo ""

# Check if build exists
if [ ! -d "apps/web/.next" ]; then
    echo "❌ No build found. Run 'pnpm build' first."
    exit 1
fi

echo "📦 JavaScript Bundle Sizes:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Find all .js files in the build and sort by size
find apps/web/.next/static/chunks -name "*.js" -type f -exec du -h {} \; | sort -rh | head -20

echo ""
echo "📊 Total Bundle Size:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Calculate total size
total_size=$(du -sh apps/web/.next/static/chunks | awk '{print $1}')
echo "Total: $total_size"

echo ""
echo "🖼️  Image Cache Size:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check image cache
if [ -d "apps/web/.next/cache/images" ]; then
    image_size=$(du -sh apps/web/.next/cache/images 2>/dev/null | awk '{print $1}')
    echo "Cache: ${image_size:-0B}"
else
    echo "Cache: No images cached yet"
fi

echo ""
echo "💡 Tips:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "• Bundle should be < 500KB for good performance"
echo "• Run 'ANALYZE=true pnpm build' for detailed analysis"
echo "• Check PERFORMANCE_OPTIMIZATIONS.md for optimization tips"
echo ""
