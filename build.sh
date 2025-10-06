#!/bin/bash

# COMETA Frontend Build Script
# Builds Next.js application and cleans up macOS files

set -e

echo "🧹 Cleaning macOS hidden files..."
find . -name "._*" -type f -delete 2>/dev/null || true

echo "📦 Building Next.js application..."
npm run build

echo "🧹 Cleaning build output..."
find .next -name "._*" -type f -delete 2>/dev/null || true

echo "✅ Build complete!"
echo ""
echo "To start production server:"
echo "  npm start"
echo ""
echo "To build Docker image:"
echo "  docker build -t cometa-frontend ."
