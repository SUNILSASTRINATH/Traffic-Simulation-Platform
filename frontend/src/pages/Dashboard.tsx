import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useSimulation } from "../contexts/SimulationContext";
import {
  Play,
  BarChart3,
  Lightbulb,
  Car,
  Clock,
  TrendingUp,
  Upload,
  Activity,
  CheckCircle,
} from "lucide-react";

const Dashboard: React.FC = () => {
  const { state, loadTemplates } = useSimulation();
  const { roadNetwork, templates } = state;

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const getNetworkStats = () => {
    if (!roadNetwork) return null;

    return {
      segments: roadNetwork.segments.length,
      intersections: roadNetwork.intersections.length,
      totalLanes: roadNetwork.metrics.total_lanes,
      estimatedLength: (roadNetwork.metrics.total_length_km * 1000).toFixed(1),
    };
  };

  const networkStats = getNetworkStats();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Traffic Simulation Platform
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Convert road infrastructure photos into interactive traffic
            simulations. Upload images, extract road networks, and run realistic
            simulations with real-time metrics.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Link
            to="/upload"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 hover:border-blue-300"
          >
            <div className="text-center">
              <Upload className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Upload Image
              </h3>
              <p className="text-gray-600">
                Upload a photo of road infrastructure to extract the network
              </p>
            </div>
          </Link>

          <Link
            to="/simulation"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 hover:border-blue-300"
          >
            <div className="text-center">
              <Play className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Start Simulation
              </h3>
              <p className="text-gray-600">
                Configure and run traffic simulations with real-time metrics
              </p>
            </div>
          </Link>

          <Link
            to="/simulation"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 hover:border-blue-300"
          >
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                View Metrics
              </h3>
              <p className="text-gray-600">
                Monitor performance and analyze traffic patterns
              </p>
            </div>
          </Link>
        </div>

        {/* Road Network Overview */}
        {roadNetwork && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Lightbulb className="h-6 w-6 text-blue-600 mr-3" />
              Road Network Overview
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="bg-blue-100 p-4 rounded-lg">
                  <Car className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">
                    {networkStats?.segments}
                  </div>
                  <div className="text-sm text-gray-600">Road Segments</div>
                </div>
              </div>

              <div className="text-center">
                <div className="bg-green-100 p-4 rounded-lg">
                  <Lightbulb className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">
                    {networkStats?.intersections}
                  </div>
                  <div className="text-sm text-gray-600">Intersections</div>
                </div>
              </div>

              <div className="text-center">
                <div className="bg-purple-100 p-4 rounded-lg">
                  <Activity className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-600">
                    {networkStats?.totalLanes}
                  </div>
                  <div className="text-sm text-gray-600">Total Lanes</div>
                </div>
              </div>

              <div className="text-center">
                <div className="bg-orange-100 p-4 rounded-lg">
                  <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-orange-600">
                    {networkStats?.estimatedLength}m
                  </div>
                  <div className="text-sm text-gray-600">Estimated Length</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Clock className="h-6 w-6 text-gray-600 mr-3" />
            Recent Activity
          </h2>

          <div className="space-y-4">
            {roadNetwork ? (
              <div className="flex items-center p-4 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <div>
                  <div className="font-medium text-green-900">
                    Road network loaded successfully
                  </div>
                  <div className="text-sm text-green-700">
                    {networkStats?.segments} segments,{" "}
                    {networkStats?.intersections} intersections detected
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Upload className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <div className="font-medium text-blue-900">
                    Ready to upload
                  </div>
                  <div className="text-sm text-blue-700">
                    Upload an image to start analyzing road infrastructure
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Platform Features */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Platform Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <Upload className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Image Processing
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Advanced computer vision to extract road networks from
                    photos
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-green-100 p-2 rounded-lg mr-3">
                  <Play className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Traffic Simulation
                  </h3>
                  <p className="text-gray-600 text-sm">
                    SUMO-powered simulations with realistic vehicle behavior
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-purple-100 p-2 rounded-lg mr-3">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Real-time Metrics
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Live performance indicators and traffic flow analysis
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-orange-100 p-2 rounded-lg mr-3">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Performance Analysis
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Comprehensive traffic pattern analysis and optimization
                    insights
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
