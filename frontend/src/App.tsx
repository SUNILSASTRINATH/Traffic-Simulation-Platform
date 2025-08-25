import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SimulationProvider } from "./contexts/SimulationContext";
import Navbar from "./components/layout/Navbar";
import Dashboard from "./pages/Dashboard";
import UploadPage from "./pages/Upload";
import Simulation from "./pages/Simulation";
import "./App.css";

const App: React.FC = () => {
  return (
    <SimulationProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/simulation" element={<Simulation />} />
            </Routes>
          </main>
        </div>
      </Router>
    </SimulationProvider>
  );
};

export default App;
