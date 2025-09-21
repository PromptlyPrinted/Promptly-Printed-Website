#!/bin/bash

echo "🚀 Starting Promptly Printed with Caddy Proxy"
echo "=============================================="

# Check if Caddy is installed
if ! command -v caddy &> /dev/null; then
    echo "❌ Caddy is not installed. Please install it first:"
    echo "   brew install caddy"
    exit 1
fi

echo "✅ Caddy is installed"

# Start Caddy in the background
echo "🔄 Starting Caddy proxy..."
caddy run --config ./Caddyfile &
CADDY_PID=$!

# Wait a moment for Caddy to start
sleep 3

echo "✅ Caddy started on localhost:8080"
echo ""
echo "🌐 Access your apps:"
echo "   • Customer Web:    http://localhost:8080"
echo "   • Admin Panel:     http://localhost:8080/admin"
echo "   • Sign In:         http://localhost:8080/sign-in"
echo "   • Auth API:        http://localhost:8080/api/auth"
echo ""
echo "🔐 Session sharing is now enabled!"
echo ""
echo "Press Ctrl+C to stop Caddy"

# Wait for interrupt signal
trap "echo ''; echo '🛑 Stopping Caddy...'; kill $CADDY_PID; exit 0" INT

# Keep script running
wait