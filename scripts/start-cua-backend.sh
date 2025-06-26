#!/bin/bash

# Start CUA Backend Service
echo "🚀 Starting CUA Backend Service..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.12+ first."
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "backend/main.py" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Navigate to backend directory
cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt

# Start the backend service
echo "🚀 Starting CUA Backend on http://localhost:8000"
echo "📚 API Documentation: http://localhost:8000/docs"
echo "🔌 WebSocket: ws://localhost:8000/ws"
echo ""
echo "Press Ctrl+C to stop the service"
echo ""

python start.py 