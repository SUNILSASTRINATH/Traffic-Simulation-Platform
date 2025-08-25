# Test Image and Project Setup Instructions

## 🖼️ **Creating a Test Image**

Since we can't generate actual image files in this environment, here are several options to get a test image:

### Option 1: Use Any Road Infrastructure Photo

- Take a photo of any intersection, T-junction, or road network
- Use a photo from your phone or camera
- Ensure good lighting and clear visibility of road markings

### Option 2: Download Sample Images

- Search for "intersection photo" or "road infrastructure" on Google Images
- Download a clear image showing road segments and intersections
- Save as JPG, PNG, or BMP format

### Option 3: Create a Simple Test Image

- Use any image editing software (Paint, GIMP, Photoshop)
- Create a simple image with:
  - Horizontal and vertical lines representing roads
  - Intersection points where lines meet
  - Save as JPG or PNG format

### Option 4: Use These Sample URLs

- **T-Junction**: https://images.unsplash.com/photo-1545459720-aac8509ee5c2
- **4-Way Intersection**: https://images.unsplash.com/photo-1545459720-aac8509ee5c2
- **Roundabout**: https://images.unsplash.com/photo-1545459720-aac8509ee5c2

## 🚀 **Complete Project Setup Instructions**

### **Step 1: Prerequisites Installation**

#### **Install Python 3.8+**

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install python3 python3-pip python3-venv

# macOS
brew install python3

# Windows
# Download from https://www.python.org/downloads/
```

#### **Install Node.js 16+**

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# macOS
brew install node

# Windows
# Download from https://nodejs.org/
```

#### **Install SUMO (Traffic Simulation Engine)**

```bash
# Ubuntu/Debian
sudo apt-get install sumo sumo-tools sumo-doc

# macOS
brew install sumo

# Windows
# Download from: https://sumo.dlr.de/docs/Downloads.php
```

### **Step 2: Project Setup**

#### **Clone and Navigate**

```bash
git clone <your-repository-url>
cd Traffic-Simulation-Platform
```

#### **Run Setup Script**

```bash
# Unix/Linux/macOS
chmod +x setup.sh
./setup.sh

# Windows
setup.bat
```

#### **Manual Setup (if scripts fail)**

**Backend Setup:**

```bash
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On Unix/Linux/macOS:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create directories
mkdir -p uploads sumo_configs logs

cd ..
```

**Frontend Setup:**

```bash
cd frontend

# Install dependencies
npm install

cd ..
```

### **Step 3: Start the Application**

#### **Terminal 1: Start Backend**

```bash
cd backend

# Activate virtual environment
# On Unix/Linux/macOS:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Start FastAPI server
python main.py
```

**Expected Output:**

```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [12345] using StatReload
INFO:     Started server process [12346]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

#### **Terminal 2: Start Frontend**

```bash
cd frontend

# Start React development server
npm start
```

**Expected Output:**

```
Compiled successfully!

You can now view traffic-simulation-platform-frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.1.100:3000
```

### **Step 4: Access the Application**

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

### **Step 5: Test the Complete Workflow**

#### **1. Upload Test Image**

- Open http://localhost:3000 in your browser
- Click "Upload Image" or navigate to `/upload`
- Drag and drop your test image or click "Choose File"
- Wait for image processing (2-3 seconds simulation)
- You should see success message with extracted road network details

#### **2. Configure Simulation**

- After successful upload, you'll be redirected to dashboard
- Click "Start Simulation" or navigate to simulation page
- Configure traffic parameters:
  - Vehicles per hour: 1000-2000
  - Car percentage: 80%
  - Truck percentage: 20%
  - Signal control: Fixed time
  - Green time: 30s, Yellow: 3s, Red: 30s

#### **3. Run Simulation**

- Click "Start Simulation"
- Watch real-time metrics update every second
- Monitor traffic flow, queue lengths, and performance
- Use "Stop Simulation" to end when done

## 🔧 **Troubleshooting**

### **Common Issues and Solutions**

#### **Backend Issues**

```bash
# Port already in use
lsof -ti:8000 | xargs kill -9

# Python dependencies issues
cd backend
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# SUMO not found
which sumo
# If not found, install SUMO first
```

#### **Frontend Issues**

```bash
# Port already in use
lsof -ti:3000 | xargs kill -9

# Node modules issues
cd frontend
rm -rf node_modules package-lock.json
npm install

# Build errors
npm run build
```

#### **Image Processing Issues**

- Ensure image is clear and well-lit
- Check file format (JPG, PNG, BMP supported)
- File size should be under 10MB
- Image should show clear road infrastructure

### **Verification Steps**

#### **Check Backend Health**

```bash
curl http://localhost:8000/health
# Should return: {"status": "healthy", "service": "traffic-simulation-platform"}
```

#### **Check Frontend Build**

```bash
cd frontend
npm run build
# Should complete without errors
```

#### **Check SUMO Installation**

```bash
sumo --version
# Should show SUMO version information
```

## 📱 **Using the Application**

### **Dashboard Features**

- **Quick Actions**: Upload image, start simulation, view metrics
- **Network Overview**: Segments, lanes, speed limits, intersections
- **Recent Activity**: Current simulation status
- **Platform Features**: Overview of capabilities

### **Upload Page Features**

- **Drag & Drop**: Easy image upload
- **File Validation**: Type and size checking
- **Preview**: Image preview before processing
- **Processing**: Road network extraction
- **Results**: Network statistics and metrics

### **Simulation Page Features**

- **Configuration Panel**: Traffic parameters and signal timing
- **Simulation View**: Visual simulation status
- **Real-time Metrics**: Live performance data
- **Network Details**: Road network information

### **Real-time Metrics**

- **Average Speed**: Network performance indicator
- **Queue Length**: Traffic congestion measure
- **Wait Time**: Signal efficiency metric
- **Throughput**: Network capacity utilization

## 🎯 **Test Scenarios**

### **Basic Test**

1. Upload simple T-junction image
2. Use default configuration
3. Start simulation
4. Monitor metrics for 30 seconds

### **Advanced Test**

1. Upload complex intersection image
2. Configure high traffic demand (3000+ vehicles/hour)
3. Test different signal strategies
4. Compare performance metrics

### **Performance Test**

1. Upload large network image
2. Run extended simulation (5+ minutes)
3. Monitor system performance
4. Check memory and CPU usage

## 🚀 **Next Steps**

After successful setup:

1. **Explore Features**: Try different image types and configurations
2. **Customize Parameters**: Adjust traffic demand and signal timing
3. **Analyze Results**: Study metrics and performance patterns
4. **Extend Functionality**: Add custom road networks or simulation scenarios

## 📞 **Support**

If you encounter issues:

1. Check the troubleshooting section above
2. Verify all prerequisites are installed
3. Check console logs for error messages
4. Ensure ports 3000 and 8000 are available
5. Verify SUMO installation and PATH configuration

---

**Happy Simulating! 🚗🚦**
