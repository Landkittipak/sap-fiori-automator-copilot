#!/bin/bash

# Script to set up ngrok for exposing local SAP Fiori to CUA cloud agents

echo "🌐 Setting up ngrok for SAP Fiori exposure..."

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok is not installed."
    echo ""
    echo "To install ngrok:"
    echo "1. Go to https://ngrok.com/"
    echo "2. Sign up for a free account"
    echo "3. Download and install ngrok"
    echo "4. Run: ngrok authtoken YOUR_TOKEN"
    echo ""
    echo "On macOS: brew install ngrok"
    echo "On Ubuntu: snap install ngrok"
    echo ""
    exit 1
fi

# Get SAP Fiori port
SAP_PORT=${1:-8080}
echo "📡 Exposing localhost:$SAP_PORT to the internet..."

# Start ngrok
echo "🚀 Starting ngrok tunnel..."
echo "This will create a public URL that CUA agents can access"
echo ""
echo "⚠️  SECURITY WARNING:"
echo "   This exposes your local SAP Fiori to the internet"
echo "   Only use for testing and development"
echo "   Stop ngrok when not needed"
echo ""
echo "Press Ctrl+C to stop ngrok"
echo ""

# Run ngrok
ngrok http $SAP_PORT