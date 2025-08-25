import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Play, Square, RotateCcw } from "lucide-react";
import { useSimulation } from "../contexts/SimulationContext";
import { SimulationConfig, SimulationMetrics } from "../types";
import SimulationConfigComponent from "../components/simulation/SimulationConfig";
import MetricsDashboard from "../components/simulation/MetricsDashboard";

const Simulation: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, startSimulation, stopSimulation, updateMetrics } =
    useSimulation();

  const [isRunning, setIsRunning] = useState(false);
  const [currentMetrics, setCurrentMetrics] = useState<SimulationMetrics>({
    average_speed_kmh: 50.0,
    total_queue_length: 0.0,
    average_wait_time_seconds: 0.0,
    throughput_vehicles_per_hour: 0.0,
  });

  useEffect(() => {
    // Check if we have a road network
    if (!state.roadNetwork) {
      navigate("/upload");
      return;
    }
  }, [state.roadNetwork, navigate]);

  const handleStartSimulation = async (config: SimulationConfig) => {
    try {
      setIsRunning(true);
      await startSimulation(config);

      // Simulate real-time metrics updates
      const interval = setInterval(() => {
        const newMetrics: SimulationMetrics = {
          average_speed_kmh: 40 + Math.random() * 30, // 40-70 km/h
          total_queue_length: Math.random() * 20, // 0-20 vehicles
          average_wait_time_seconds: Math.random() * 60, // 0-60 seconds
          throughput_vehicles_per_hour: 800 + Math.random() * 1200, // 800-2000 veh/h
        };

        setCurrentMetrics(newMetrics);
        updateMetrics(newMetrics);
      }, 1000);

      // Store interval for cleanup
      (window as any).simulationInterval = interval;
    } catch (error) {
      console.error("Failed to start simulation:", error);
      setIsRunning(false);
    }
  };

  const handleStopSimulation = async () => {
    try {
      // Clear the metrics update interval
      if ((window as any).simulationInterval) {
        clearInterval((window as any).simulationInterval);
        (window as any).simulationInterval = null;
      }

      await stopSimulation();
      setIsRunning(false);

      // Reset metrics
      const resetMetrics: SimulationMetrics = {
        average_speed_kmh: 0.0,
        total_queue_length: 0.0,
        average_wait_time_seconds: 0.0,
        throughput_vehicles_per_hour: 0.0,
      };
      setCurrentMetrics(resetMetrics);
      updateMetrics(resetMetrics);
    } catch (error) {
      console.error("Failed to stop simulation:", error);
    }
  };

  const handleReset = () => {
    if ((window as any).simulationInterval) {
      clearInterval((window as any).simulationInterval);
      (window as any).simulationInterval = null;
    }

    setIsRunning(false);
    const resetMetrics: SimulationMetrics = {
      average_speed_kmh: 50.0,
      total_queue_length: 0.0,
      average_wait_time_seconds: 0.0,
      throughput_vehicles_per_hour: 0.0,
    };
    setCurrentMetrics(resetMetrics);
    updateMetrics(resetMetrics);
  };

  if (!state.roadNetwork) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">
          No road network available. Please upload an image first.
        </p>
        <button
          onClick={() => navigate("/upload")}
          className="mt-4 bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-colors"
        >
          Go to Upload
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </button>
          <div className="h-6 w-px bg-gray-300"></div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Traffic Simulation
            </h1>
            <p className="text-gray-600">
              Network: {state.roadNetwork.segments.length} segments,{" "}
              {state.roadNetwork.intersections.length} intersections
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {isRunning && (
            <div className="flex items-center space-x-2 text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Running</span>
            </div>
          )}

          <button
            onClick={handleReset}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Configuration Panel */}
        <div className="lg:col-span-1">
          <SimulationConfigComponent
            onStartSimulation={handleStartSimulation}
            onStopSimulation={handleStopSimulation}
            isRunning={isRunning}
          />
        </div>

        {/* Simulation View and Metrics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Simulation Canvas */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Simulation View
            </h3>

            {!isRunning ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-600 mb-4">Simulation not running</p>
                <p className="text-sm text-gray-500">
                  Configure parameters and click "Start Simulation" to begin
                </p>
              </div>
            ) : (
              <div className="simulation-canvas w-full h-64 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                  <p className="text-green-600 font-medium">
                    Simulation Active
                  </p>
                  <p className="text-sm text-gray-500">
                    Real-time traffic simulation running
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Metrics Dashboard */}
          <MetricsDashboard metrics={currentMetrics} isRealTime={isRunning} />
        </div>
      </div>

      {/* Network Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Road Network Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-600">
              Total Segments
            </h4>
            <p className="text-2xl font-bold text-gray-900">
              {state.roadNetwork.segments.length}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-600">Intersections</h4>
            <p className="text-2xl font-bold text-gray-900">
              {state.roadNetwork.intersections.length}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-600">Total Lanes</h4>
            <p className="text-2xl font-bold text-gray-900">
              {state.roadNetwork.metrics.total_lanes}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-600">
              Network Length
            </h4>
            <p className="text-2xl font-bold text-gray-900">
              {state.roadNetwork.metrics.total_length_km.toFixed(2)} km
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Simulation;
