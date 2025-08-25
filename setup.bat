@echo off
echo 🚀 Setting up Traffic Simulation Platform...

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed. Please install Python 3.8+ first.
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 16+ first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed

REM Create necessary directories
echo 📁 Creating project directories...
if not exist "backend\uploads" mkdir backend\uploads
if not exist "backend\sumo_configs" mkdir backend\sumo_configs
if not exist "backend\logs" mkdir backend\logs

REM Backend setup
echo 🐍 Setting up Python backend...
cd backend

REM Create virtual environment
echo Creating Python virtual environment...
python -m venv venv

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install Python dependencies
echo Installing Python dependencies...
python -m pip install --upgrade pip
pip install -r requirements.txt

echo ✅ Backend setup completed
cd ..

REM Frontend setup
echo ⚛️ Setting up React frontend...
cd frontend

REM Install Node.js dependencies
echo Installing Node.js dependencies...
npm install

echo ✅ Frontend setup completed
cd ..

REM Create .env file for backend
echo 🔧 Creating environment configuration...
(
echo # Backend Configuration
echo DEBUG=true
echo HOST=0.0.0.0
echo PORT=8000
echo.
echo # File Upload Settings
echo UPLOAD_DIR=uploads
echo MAX_FILE_SIZE=10485760
echo.
echo # SUMO Settings
echo SUMO_BINARY=sumo
echo SUMO_CONFIG_DIR=sumo_configs
echo SIMULATION_STEP=1.0
echo.
echo # WebSocket Settings
echo WEBSOCKET_PING_INTERVAL=20
echo WEBSOCKET_PING_TIMEOUT=20
) > backend\.env

echo ✅ Environment configuration created

echo.
echo 🎉 Setup completed successfully!
echo.
echo To start the application:
echo 1. Start backend: cd backend ^&^& venv\Scripts\activate ^&^& python main.py
echo 2. Start frontend: cd frontend ^&^& npm start
echo.
echo The application will be available at:
echo - Frontend: http://localhost:3000
echo - Backend API: http://localhost:8000
echo - API Documentation: http://localhost:8000/docs
echo.
echo Happy simulating! 🚗🚦
pause 