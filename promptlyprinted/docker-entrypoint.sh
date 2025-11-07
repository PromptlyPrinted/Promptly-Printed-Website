#!/bin/sh
set -e

echo "🚀 Starting API container..."

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
until pg_isready -h postgres -U promptly; do
  echo "Database is unavailable - sleeping"
  sleep 2
done

echo "✅ Database is ready!"

# Run Prisma migrations
echo "🔄 Running Prisma migrations..."
cd /app
pnpm --filter @repo/database exec prisma migrate deploy

echo "✅ Migrations complete!"

# Generate Prisma Client (in case it's not in the built image)
echo "🔨 Generating Prisma Client..."
pnpm --filter @repo/database exec prisma generate

echo "✅ Prisma Client generated!"

# Start the application
echo "🎉 Starting API server..."
exec pnpm start
