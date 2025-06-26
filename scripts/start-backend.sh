#!/bin/bash

# SAP Fiori Automator Backend Startup Script

echo "🚀 Starting SAP Fiori Automator Backend..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    echo "Please install Python 3.8+ and try again."
    exit 1
fi

# Navigate to backend directory
cd "$(dirname "$0")/../backend" || exit 1

# Check if virtual environment exists, create if not
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install/upgrade dependencies
echo "📚 Installing dependencies..."
pip install -r requirements.txt

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. Creating from template..."
    cp .env.example .env
    echo "📝 Please edit backend/.env file with your CUA API key and SAP Fiori URL"
    echo "   CUA_API_KEY=your_cua_api_key_here"
    echo "   SAP_FIORI_URL=http://localhost:8080  # or your SAP Fiori URL"
    echo ""
    echo "Press Enter to continue (backend will start with default config)..."
    read -r
fi

# Start the backend server
echo "🎯 Starting FastAPI backend on http://localhost:8000..."
echo "📊 API documentation available at http://localhost:8000/docs"
echo "❤️  Health check at http://localhost:8000/health"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

python main.py