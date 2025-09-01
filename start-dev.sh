#!/bin/bash

echo "🚀 Starting VR Portal Development Environment..."

# Function to cleanup background processes on exit
cleanup() {
    echo "🛑 Shutting down development servers..."
    kill $API_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Start API server in background
echo "📡 Starting API server on port 3001..."
cd api
npm run dev &
API_PID=$!
cd ..

# Wait a moment for API to start
sleep 3

# Start frontend in background
echo "🌐 Starting frontend on port 5173..."
npm run dev &
FRONTEND_PID=$!

echo "✅ Development environment started!"
echo "📡 API: http://localhost:3001"
echo "🌐 Frontend: http://localhost:5173"
echo "📊 API Health: http://localhost:3001/health"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for both processes
wait

