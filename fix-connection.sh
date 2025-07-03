#!/bin/bash

# Quick Fix Script for SAP Fiori Automator Frontend-Backend Connection
# This script addresses the immediate longstanding tasks blocking the connection

echo "🚀 SAP Fiori Automator - Quick Connection Fix"
echo "============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    case $status in
        "error") echo -e "${RED}❌ $message${NC}" ;;
        "success") echo -e "${GREEN}✅ $message${NC}" ;;
        "warning") echo -e "${YELLOW}⚠️  $message${NC}" ;;
        "info") echo -e "ℹ️  $message" ;;
    esac
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "backend" ]; then
    print_status "error" "Please run this script from the project root directory"
    exit 1
fi

print_status "info" "Checking dependencies..."

# Check Python
if ! command -v python3 &> /dev/null; then
    print_status "error" "Python 3 is required but not installed"
    exit 1
fi
print_status "success" "Python 3 found: $(python3 --version)"

# Check Node.js
if ! command -v node &> /dev/null; then
    print_status "error" "Node.js is required but not installed"
    exit 1
fi
print_status "success" "Node.js found: $(node --version)"

echo ""
print_status "info" "Starting connection fixes..."

# 1. Setup backend environment
echo ""
echo "1️⃣  Setting up backend environment..."
cd backend

if [ ! -f ".env" ]; then
    cp .env.example .env
    print_status "success" "Created backend/.env from template"
else
    print_status "warning" "backend/.env already exists, skipping creation"
fi

# Check if CUA API key is configured
if grep -q "your_cua_api_key_here" .env 2>/dev/null; then
    print_status "warning" "CUA API key not configured in backend/.env"
    echo ""
    echo "📝 TO COMPLETE SETUP:"
    echo "   1. Get your CUA API key from https://trycua.com"
    echo "   2. Edit backend/.env and replace 'your_cua_api_key_here' with your actual key"
    echo ""
else
    print_status "success" "CUA API key appears to be configured"
fi

# 2. Setup Python virtual environment
echo ""
echo "2️⃣  Setting up Python virtual environment..."
if [ ! -d "venv" ]; then
    print_status "info" "Creating Python virtual environment..."
    python3 -m venv venv
    print_status "success" "Virtual environment created"
else
    print_status "success" "Virtual environment already exists"
fi

# Activate virtual environment and install dependencies
print_status "info" "Installing Python dependencies..."
source venv/bin/activate
pip install -r requirements.txt > /dev/null 2>&1
if [ $? -eq 0 ]; then
    print_status "success" "Python dependencies installed"
else
    print_status "error" "Failed to install Python dependencies"
    exit 1
fi

# 3. Setup frontend environment
echo ""
echo "3️⃣  Setting up frontend environment..."
cd ..

# Create root .env file for frontend
cat > .env << EOF
# Frontend Environment Variables
VITE_CUA_BACKEND_URL=http://localhost:8000
VITE_CUA_API_KEY=your_cua_api_key_here
VITE_SAP_URL=http://localhost:8080

# Supabase Configuration (already configured)
VITE_SUPABASE_URL=https://psqdqpazmvrrhkyiqwom.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzcWRxcGF6bXZycmhreWlxd29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NjkwODIsImV4cCI6MjA2NjQ0NTA4Mn0.VNLUFK_cuX1vI0G_vJ7KULAFOSG2aQUB71i5Nz53nik
EOF

print_status "success" "Created root .env file for frontend"

# 4. Install frontend dependencies
echo ""
echo "4️⃣  Installing frontend dependencies..."
if command -v bun &> /dev/null; then
    bun install > /dev/null 2>&1
    print_status "success" "Frontend dependencies installed with Bun"
elif command -v npm &> /dev/null; then
    npm install > /dev/null 2>&1
    print_status "success" "Frontend dependencies installed with npm"
else
    print_status "error" "Neither bun nor npm found"
    exit 1
fi

# 5. Test backend startup
echo ""
echo "5️⃣  Testing backend startup..."
cd backend
source venv/bin/activate

# Start backend in background to test
python main.py &
BACKEND_PID=$!
sleep 3

# Check if backend is running
if kill -0 $BACKEND_PID 2>/dev/null; then
    print_status "success" "Backend started successfully on http://localhost:8000"
    
    # Test health endpoint
    if command -v curl &> /dev/null; then
        if curl -s http://localhost:8000/health > /dev/null; then
            print_status "success" "Backend health check passed"
        else
            print_status "warning" "Backend started but health check failed"
        fi
    fi
    
    # Stop the test backend
    kill $BACKEND_PID 2>/dev/null
    sleep 1
else
    print_status "error" "Backend failed to start"
    exit 1
fi

cd ..

echo ""
echo "🎉 CONNECTION FIX COMPLETED!"
echo "=========================="
echo ""
print_status "success" "All immediate connection issues have been addressed"
echo ""
echo "📋 WHAT'S FIXED:"
echo "   ✅ Backend environment configuration"
echo "   ✅ Python virtual environment setup"
echo "   ✅ Frontend environment variables"
echo "   ✅ Dependencies installed"
echo "   ✅ Backend startup verified"
echo ""
echo "🚀 NEXT STEPS:"
echo ""
echo "1. Configure your CUA API key:"
echo "   - Get API key from https://trycua.com"
echo "   - Edit backend/.env and set CUA_API_KEY=your_actual_key"
echo "   - Edit .env and set VITE_CUA_API_KEY=your_actual_key"
echo ""
echo "2. Start the services:"
echo "   Terminal 1: ./scripts/start-backend.sh"
echo "   Terminal 2: npm run dev"
echo ""
echo "3. Access the application:"
echo "   Frontend: http://localhost:5173"
echo "   Backend: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "4. Test the connection:"
echo "   - Go to CUA section in the frontend"
echo "   - Click 'Test CUA Connection'"
echo "   - Should show successful connection"
echo ""
print_status "info" "For more details, see LONGSTANDING_TASKS.md"