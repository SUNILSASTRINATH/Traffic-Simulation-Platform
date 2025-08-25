#!/bin/bash

echo "🚀 Setting up Traffic Simulation Platform..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Create necessary directories
echo "📁 Creating project directories..."
mkdir -p backend/uploads
mkdir -p backend/sumo_configs
mkdir -p backend/logs

# Backend setup
echo "🐍 Setting up Python backend..."
cd backend

# Create virtual environment
echo "Creating Python virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install Python dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "✅ Backend setup completed"
cd ..

# Frontend setup
echo "⚛️ Setting up React frontend..."
cd frontend

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
npm install

echo "✅ Frontend setup completed"
cd ..

# Create .env file for backend
echo "🔧 Creating environment configuration..."
cat > backend/.env << EOF
# Backend Configuration
DEBUG=true
HOST=0.0.0.0
PORT=8000

# File Upload Settings
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760

# SUMO Settings
SUMO_BINARY=sumo
SUMO_CONFIG_DIR=sumo_configs
SIMULATION_STEP=1.0

# WebSocket Settings
WEBSOCKET_PING_INTERVAL=20
WEBSOCKET_PING_TIMEOUT=20
EOF

echo "✅ Environment configuration created"

# Check if SUMO is installed
echo "🚦 Checking SUMO installation..."
if command -v sumo &> /dev/null; then
    echo "✅ SUMO is installed"
else
    echo "⚠️  SUMO is not installed. Please install SUMO for traffic simulation functionality."
    echo "   Ubuntu/Debian: sudo apt-get install sumo sumo-tools sumo-doc"
    echo "   macOS: brew install sumo"
    echo "   Windows: Download from https://sumo.dlr.de/docs/Downloads.php"
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "To start the application:"
echo "1. Start backend: cd backend && source venv/bin/activate && python main.py"
echo "2. Start frontend: cd frontend && npm start"
echo ""
echo "The application will be available at:"
echo "- Frontend: http://localhost:3000"
echo "- Backend API: http://localhost:8000"
echo "- API Documentation: http://localhost:8000/docs"
echo ""
echo "Happy simulating! 🚗🚦" 