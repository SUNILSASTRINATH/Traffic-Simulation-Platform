import React, { useState, useEffect } from "react";
import { Play, Square, Settings, Save } from "lucide-react";
import { useSimulation } from "../../contexts/SimulationContext";
import { SimulationConfig, SimulationTemplate } from "../../types";

interface SimulationConfigProps {
  onStartSimulation: (config: SimulationConfig) => void;
  onStopSimulation: () => void;
  isRunning: boolean;
}

const SimulationConfigComponent: React.FC<SimulationConfigProps> = ({
  onStartSimulation,
  onStopSimulation,
  isRunning,
}) => {
  const { state, setSimulationConfig, loadTemplates } = useSimulation();

  const [config, setConfig] = useState<SimulationConfig>({
    vehicles_per_hour: 1000,
    car_percentage: 80.0,
    truck_percentage: 20.0,
    peak_hour_factor: 1.0,
    signal_control: "fixed_time",
    green_time: 30,
    yellow_time: 3,
    red_time: 30,
    simulation_duration: 3600,
  });

  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  useEffect(() => {
    if (state.simulationConfig) {
      setConfig(state.simulationConfig);
    }
  }, [state.simulationConfig]);

  const handleTemplateChange = (templateKey: string) => {
    const template = state.templates.find((t) => t.name === templateKey);
    if (template) {
      const newConfig: SimulationConfig = {
        vehicles_per_hour: template.vehicles_per_hour,
        car_percentage: template.car_percentage,
        truck_percentage: template.truck_percentage,
        peak_hour_factor: template.peak_hour_factor,
        signal_control: template.signal_control,
        green_time: template.green_time,
        yellow_time: template.yellow_time,
        red_time: template.red_time,
        simulation_duration: 3600,
      };
      setConfig(newConfig);
      setSelectedTemplate(templateKey);
    }
  };

  const handleInputChange = (
    field: keyof SimulationConfig,
    value: number | string
  ) => {
    setConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleStartSimulation = () => {
    setSimulationConfig(config);
    onStartSimulation(config);
  };

  const calculateCycleLength = () => {
    return config.green_time + config.yellow_time + config.red_time;
  };

  const validateConfig = (): boolean => {
    return (
      config.vehicles_per_hour >= 100 &&
      config.vehicles_per_hour <= 5000 &&
      config.car_percentage + config.truck_percentage === 100 &&
      config.peak_hour_factor >= 1.0 &&
      config.peak_hour_factor <= 2.0 &&
      config.green_time > 0 &&
      config.yellow_time > 0 &&
      config.red_time >= 0
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Simulation Configuration
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Settings className="h-4 w-4" />
            <span>{showAdvanced ? "Hide" : "Advanced"}</span>
          </button>
        </div>
      </div>

      {/* Template Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quick Templates
        </label>
        <select
          value={selectedTemplate}
          onChange={(e) => handleTemplateChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">Select a template...</option>
          {state.templates.map((template) => (
            <option key={template.name} value={template.name}>
              {template.name} - {template.description}
            </option>
          ))}
        </select>
      </div>

      {/* Basic Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Traffic Demand */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Traffic Demand</h4>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vehicles per Hour: {config.vehicles_per_hour}
            </label>
            <input
              type="range"
              min="100"
              max="5000"
              step="100"
              value={config.vehicles_per_hour}
              onChange={(e) =>
                handleInputChange("vehicles_per_hour", parseInt(e.target.value))
              }
              className="w-full slider-track"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>100</span>
              <span>5000</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Car Percentage: {config.car_percentage}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={config.car_percentage}
              onChange={(e) => {
                const carPct = parseInt(e.target.value);
                handleInputChange("car_percentage", carPct);
                handleInputChange("truck_percentage", 100 - carPct);
              }}
              className="w-full slider-track"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Truck Percentage: {config.truck_percentage}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={config.truck_percentage}
              onChange={(e) => {
                const truckPct = parseInt(e.target.value);
                handleInputChange("truck_percentage", truckPct);
                handleInputChange("car_percentage", 100 - truckPct);
              }}
              className="w-full slider-track"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Peak Hour Factor: {config.peak_hour_factor}
            </label>
            <input
              type="range"
              min="1.0"
              max="2.0"
              step="0.1"
              value={config.peak_hour_factor}
              onChange={(e) =>
                handleInputChange(
                  "peak_hour_factor",
                  parseFloat(e.target.value)
                )
              }
              className="w-full slider-track"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1.0</span>
              <span>2.0</span>
            </div>
          </div>
        </div>

        {/* Signal Control */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Signal Control</h4>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Control Strategy
            </label>
            <select
              value={config.signal_control}
              onChange={(e) =>
                handleInputChange("signal_control", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="fixed_time">Fixed Time</option>
              <option value="actuated">Actuated</option>
              <option value="adaptive">Adaptive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Green Time: {config.green_time}s
            </label>
            <input
              type="range"
              min="10"
              max="120"
              step="5"
              value={config.green_time}
              onChange={(e) =>
                handleInputChange("green_time", parseInt(e.target.value))
              }
              className="w-full slider-track"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Yellow Time: {config.yellow_time}s
            </label>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={config.yellow_time}
              onChange={(e) =>
                handleInputChange("yellow_time", parseInt(e.target.value))
              }
              className="w-full slider-track"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Red Time: {config.red_time}s
            </label>
            <input
              type="range"
              min="0"
              max="120"
              step="5"
              value={config.red_time}
              onChange={(e) =>
                handleInputChange("red_time", parseInt(e.target.value))
              }
              className="w-full slider-track"
            />
          </div>

          <div className="bg-gray-50 p-3 rounded">
            <p className="text-sm text-gray-600">
              Cycle Length:{" "}
              <span className="font-medium">{calculateCycleLength()}s</span>
            </p>
          </div>
        </div>
      </div>

      {/* Advanced Configuration */}
      {showAdvanced && (
        <div className="border-t border-gray-200 pt-6 mb-6">
          <h4 className="font-medium text-gray-900 mb-4">Advanced Settings</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Simulation Duration (seconds)
              </label>
              <input
                type="number"
                min="300"
                max="7200"
                step="300"
                value={config.simulation_duration}
                onChange={(e) =>
                  handleInputChange(
                    "simulation_duration",
                    parseInt(e.target.value)
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}

      {/* Validation and Actions */}
      <div className="border-t border-gray-200 pt-6">
        {!validateConfig() && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-yellow-800 text-sm">
              Please fix configuration errors before starting simulation
            </p>
          </div>
        )}

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {state.roadNetwork ? (
              <span className="text-green-600">
                ✓ Road network loaded ({state.roadNetwork.segments.length}{" "}
                segments)
              </span>
            ) : (
              <span className="text-red-600">✗ No road network available</span>
            )}
          </div>

          <div className="flex space-x-3">
            {isRunning ? (
              <button
                onClick={onStopSimulation}
                className="flex items-center space-x-2 bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                <Square className="h-4 w-4" />
                <span>Stop Simulation</span>
              </button>
            ) : (
              <button
                onClick={handleStartSimulation}
                disabled={!validateConfig() || !state.roadNetwork}
                className={`flex items-center space-x-2 px-6 py-2 rounded-md transition-colors ${
                  !validateConfig() || !state.roadNetwork
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-primary-600 hover:bg-primary-700 text-white"
                }`}
              >
                <Play className="h-4 w-4" />
                <span>Start Simulation</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulationConfigComponent;
