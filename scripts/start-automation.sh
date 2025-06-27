#!/bin/bash

# Master script to start the complete SAP Fiori Automation system

echo "🤖 SAP Fiori Automator - Complete Setup"
echo "======================================="

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to start a process in background
start_background() {
    local name=$1
    local command=$2
    echo "🚀 Starting $name..."
    $command &
    local pid=$!
    echo "   PID: $pid"
    return $pid
}

echo ""
echo "📋 Pre-flight checks..."

# Check Node.js/npm
if ! command -v npm &> /dev/null; then
    echo "❌ Node.js/npm is required but not installed."
    exit 1
fi

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    exit 1
fi

echo "✅ Dependencies check passed"
echo ""

# Ask about SAP Fiori setup
echo "🏢 SAP Fiori Configuration:"
echo "1. Do you have SAP Fiori running locally? (y/n)"
read -r has_sap

if [[ $has_sap == "y" || $has_sap == "Y" ]]; then
    echo "2. What port is SAP Fiori running on? (default: 8080)"
    read -r sap_port
    sap_port=${sap_port:-8080}
    
    if check_port $sap_port; then
        echo "✅ SAP Fiori detected on port $sap_port"
    else
        echo "⚠️  No service detected on port $sap_port"
        echo "   Make sure SAP Fiori is running before starting automation"
    fi
    
    echo "3. Do you want to expose SAP Fiori to the internet for CUA agents? (y/n)"
    read -r expose_sap
else
    echo "⚠️  You'll need SAP Fiori running for the automation to work"
    echo "   You can start it later and update the configuration"
    sap_port=8080
    expose_sap="n"
fi

echo ""
echo "🎯 Starting services..."

# Store PIDs to kill them later
PIDS=()

# Start backend
echo "1. Starting Python backend..."
cd "$(dirname "$0")" || exit 1
./start-backend.sh &
BACKEND_PID=$!
PIDS+=($BACKEND_PID)
echo "   Backend PID: $BACKEND_PID"

# Wait a moment for backend to start
sleep 3

# Check if backend is running
if check_port 8000; then
    echo "✅ Backend is running on http://localhost:8000"
else
    echo "❌ Backend failed to start"
    exit 1
fi

# Start frontend
echo "2. Starting React frontend..."
cd .. || exit 1
npm run dev &
FRONTEND_PID=$!
PIDS+=($FRONTEND_PID)
echo "   Frontend PID: $FRONTEND_PID"

# Wait for frontend
sleep 5

if check_port 5173; then
    echo "✅ Frontend is running on http://localhost:5173"
else
    echo "❌ Frontend failed to start"
    exit 1
fi

# Start ngrok if requested
if [[ $expose_sap == "y" || $expose_sap == "Y" ]]; then
    echo "3. Starting ngrok for SAP Fiori exposure..."
    ./scripts/setup-ngrok.sh $sap_port &
    NGROK_PID=$!
    PIDS+=($NGROK_PID)
    echo "   Ngrok PID: $NGROK_PID"
    echo "⚠️  Check ngrok output for the public URL"
    echo "   Update your automation workflows with this public URL"
fi

echo ""
echo "🎉 All services started successfully!"
echo ""
echo "📱 Access your automation platform:"
echo "   Frontend: http://localhost:5173"
echo "   Backend API: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"

if [[ $has_sap == "y" || $has_sap == "Y" ]]; then
    echo "   SAP Fiori: http://localhost:$sap_port"
fi

echo ""
echo "🔧 Next steps:"
echo "1. Configure your CUA API key in backend/.env"
echo "2. Test the connection in the frontend"
echo "3. Create your first automation workflow"
echo "4. Use the public SAP Fiori URL (if using ngrok) in your workflows"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping all services..."
    for pid in "${PIDS[@]}"; do
        if kill -0 $pid 2>/dev/null; then
            echo "   Stopping PID: $pid"
            kill $pid
        fi
    done
    echo "✅ All services stopped"
    exit 0
}

# Trap Ctrl+C
trap cleanup SIGINT

# Wait for all background processes
wait