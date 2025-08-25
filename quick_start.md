# 🚀 Quick Start Guide - Traffic Simulation Platform

## ⚡ **5-Minute Setup & Test**

### **Step 1: Generate Test Images**

```bash
# Run the test image generator
python create_test_image.py
```

This creates 3 test images in the `test_images/` folder:

- `4way_intersection.png` - Standard intersection
- `t_junction.png` - Three-way junction
- `roundabout.png` - Circular intersection

### **Step 2: One-Command Setup**

```bash
# Unix/Linux/macOS
chmod +x setup.sh && ./setup.sh

# Windows
setup.bat
```

### **Step 3: Start Both Services**

```bash
# Terminal 1: Backend
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
python main.py

# Terminal 2: Frontend
cd frontend
npm start
```

### **Step 4: Test Immediately**

1. Open http://localhost:3000
2. Go to Upload page
3. Upload any test image from `test_images/` folder
4. Watch road network extraction
5. Start simulation with default settings
6. Monitor real-time metrics

## 🎯 **What You'll See**

### **Image Processing**

- ✅ File validation (type, size)
- ✅ Road network extraction
- ✅ Segment and intersection detection
- ✅ Network metrics calculation

### **Simulation Features**

- 🚗 Traffic demand configuration
- 🚦 Signal timing controls
- 📊 Real-time performance metrics
- 📈 Live charts and analytics

### **Real-time Updates**

- 1Hz metric updates
- Live traffic flow monitoring
- Performance indicators
- Network status tracking

## 🔧 **Troubleshooting Quick Fixes**

### **Backend Won't Start**

```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

### **Frontend Won't Start**

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

### **Port Already in Use**

```bash
# Kill processes on ports 3000 and 8000
lsof -ti:3000 | xargs kill -9
lsof -ti:8000 | xargs kill -9
```

## 📱 **Test Scenarios**

### **Basic Test (2 minutes)**

1. Upload `4way_intersection.png`
2. Use default configuration
3. Start simulation
4. Watch metrics for 30 seconds

### **Advanced Test (5 minutes)**

1. Upload `roundabout.png`
2. Set vehicles/hour to 2000
3. Change signal strategy to "adaptive"
4. Run simulation and compare performance

## 🎉 **Success Indicators**

✅ **Backend**: `INFO: Uvicorn running on http://0.0.0.0:8000`
✅ **Frontend**: `Compiled successfully! Local: http://localhost:3000`
✅ **Image Upload**: Success message with network details
✅ **Simulation**: Real-time metrics updating every second

## 🚀 **Next Steps After Testing**

1. **Try Real Photos**: Use actual intersection photos from your area
2. **Customize Parameters**: Experiment with different traffic configurations
3. **Compare Scenarios**: Test different signal strategies
4. **Analyze Performance**: Study metrics and optimization opportunities

---

**Ready to simulate traffic? Let's go! 🚗🚦**
