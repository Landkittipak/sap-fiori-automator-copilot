#!/bin/bash

# Setup script to ensure Bun is the default package manager

echo "🚀 Setting up Bun as the default package manager..."

# Check if Bun is installed
if ! command -v bun &> /dev/null; then
    echo "❌ Bun is not installed. Please install Bun first:"
    echo "   curl -fsSL https://bun.sh/install | bash"
    exit 1
fi

echo "✅ Bun is installed: $(bun --version)"

# Install dependencies with Bun
echo "📦 Installing dependencies with Bun..."
bun install

# Verify the setup
echo "🔍 Verifying setup..."
echo "Package manager: $(bun pm ls)"
echo "Node version: $(bun --version)"

echo "✅ Setup complete! You can now use:"
echo "   bun run dev     # Start development server"
echo "   bun run build   # Build for production"
echo "   bun run lint    # Run linter"
echo "   bun add <pkg>   # Add new packages" 