# Traffic Simulation Platform

A comprehensive web application that converts road infrastructure photos into interactive traffic simulations using computer vision and SUMO (Simulation of Urban Mobility).

## 🚀 Features

### Core Functionality

- **Image Processing Pipeline**: Extract road geometry from uploaded photos
- **Road Network Detection**: Identify intersections, road segments, and lanes
- **SUMO Integration**: Professional-grade traffic simulation engine
- **Real-time Metrics**: Live monitoring of traffic flow and performance
- **Multiple Road Types**: Support for T-junctions, 4-way intersections, roundabouts, and highway merges

### User Interface

- **Configuration Panel**: Traffic parameter controls with sliders and templates
- **Real-time Dashboard**: Live metrics with 1Hz update frequency
- **Interactive Simulation**: Start, stop, and monitor simulations
- **Responsive Design**: Modern UI that works on all devices

## 🏗️ Architecture

### Backend (Python)

- **Presentation Layer**: FastAPI with WebSocket support
- **Application Layer**: Use cases and business logic
- **Domain Layer**: Core entities and business rules
- **Infrastructure Layer**: External integrations (SUMO, file handling)

### Frontend (React + TypeScript)

- **Component-based Architecture**: Modular and reusable components
- **State Management**: React Context with useReducer
- **Real-time Updates**: WebSocket integration for live metrics
- **Responsive UI**: Tailwind CSS for modern styling

## 🛠️ Technology Stack

### Backend

- **Framework**: FastAPI
- **Traffic Simulation**: SUMO (Simulation of Urban Mobility)
- **Image Processing**: OpenCV, scikit-image
- **Real-time Communication**: WebSocket
- **Data Processing**: NumPy, scikit-learn

### Frontend

- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **Routing**: React Router DOM

## 📋 Prerequisites

- Python 3.8+
- Node.js 16+
- SUMO (Simulation of Urban Mobility)
- Git

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Traffic-Simulation-Platform
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Install SUMO (Ubuntu/Debian)
sudo apt-get install sumo sumo-tools sumo-doc

# Install SUMO (macOS)
brew install sumo

# Install SUMO (Windows)
# Download from: https://sumo.dlr.de/docs/Downloads.php
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

### 4. Start Backend Server

```bash
cd backend
python main.py
```

The application will be available at:

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## 📁 Project Structure

```
Traffic-Simulation-Platform/
├── backend/
│   ├── src/
│   │   ├── application/          # Use cases and business logic
│   │   ├── domain/               # Core entities and business rules
│   │   ├── infrastructure/       # External integrations
│   │   └── presentation/         # API endpoints and WebSocket
│   ├── main.py                   # FastAPI application entry point
│   └── requirements.txt          # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   ├── contexts/             # React context providers
│   │   ├── pages/                # Application pages
│   │   └── types/                # TypeScript type definitions
│   ├── package.json              # Node.js dependencies
│   └── tailwind.config.js        # Tailwind CSS configuration
└── README.md
```

## 🔧 Configuration

### Backend Configuration

The backend configuration is managed through environment variables and the `src/core/config.py` file:

- **File Upload**: Maximum 10MB, supports JPEG, PNG, BMP
- **SUMO Settings**: Configurable simulation step and binary path
- **WebSocket**: Configurable ping intervals and timeouts

### Frontend Configuration

Frontend configuration is handled through React context and component props:

- **Traffic Parameters**: Vehicles per hour (100-5000), vehicle mix, peak hour factor
- **Signal Control**: Fixed-time, actuated, and adaptive strategies
- **Real-time Updates**: Configurable update frequency (default: 1Hz)

## 🎯 Usage

### 1. Upload Road Infrastructure Image

- Navigate to the Upload page
- Drag and drop or select an image file
- Wait for image processing and road network extraction

### 2. Configure Simulation Parameters

- Set traffic demand (vehicles per hour, vehicle mix)
- Choose signal control strategy
- Adjust timing parameters (green, yellow, red times)

### 3. Start Simulation

- Click "Start Simulation" to begin
- Monitor real-time metrics and performance
- Use the dashboard to analyze traffic flow patterns

### 4. Analyze Results

- View live charts and metrics
- Compare different configurations
- Export simulation data for further analysis

## 📊 Supported Road Types

- **T-junctions**: Three-way intersections
- **4-way Intersections**: Standard cross intersections
- **Roundabouts**: Circular intersections
- **Highway Merges**: On-ramp and off-ramp scenarios
- **Complex Urban Networks**: Multiple connected intersections

## 🔍 Image Processing Capabilities

- **Computer Vision**: Advanced algorithms for road detection
- **Noise Handling**: Works with imperfect photos and various lighting
- **Geometric Analysis**: Extracts road segments, lanes, and intersections
- **Validation**: Ensures extracted network quality and completeness

## 🚦 Traffic Signal Strategies

- **Fixed-time**: Pre-programmed signal timing
- **Actuated**: Vehicle presence detection
- **Adaptive**: Real-time optimization based on traffic conditions

## 📈 Metrics and Analytics

### Real-time Metrics

- Average network speed (km/h)
- Total queue length (vehicles)
- Average wait time (seconds)
- Network throughput (vehicles/hour)

### Performance Indicators

- Speed performance (Good/Needs Attention)
- Traffic flow status (Good/Congested)
- Network capacity (Efficient/Low Capacity)

## 🧪 Testing

### Backend Testing

```bash
cd backend
python -m pytest tests/
```

### Frontend Testing

```bash
cd frontend
npm test
```

## 🚀 Deployment

### Backend Deployment

```bash
cd backend
pip install -r requirements.txt
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### Frontend Deployment

```bash
cd frontend
npm run build
# Serve the build folder with your preferred web server
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **SUMO Team**: For the excellent traffic simulation engine
- **OpenCV Community**: For computer vision capabilities
- **FastAPI**: For the modern Python web framework
- **React Team**: For the powerful frontend framework

## 📞 Support

For questions and support:

- Create an issue in the GitHub repository
- Check the documentation at `/docs`
- Review the API documentation at `/docs`

## 🔮 Future Enhancements

- **3D Visualization**: Enhanced 3D road network rendering
- **Machine Learning**: Improved road detection accuracy
- **Cloud Deployment**: Scalable cloud-based simulation
- **Mobile App**: Native mobile application
- **API Integration**: Third-party traffic data sources
- **Advanced Analytics**: Predictive traffic modeling

---

**Built with ❤️ for better urban mobility and traffic management**
