import React, { useEffect, useState } from "react";
import {
  TrendingUp,
  Clock,
  Car,
  Lightbulb,
  Activity,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { SimulationMetrics } from "../../types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

interface MetricsDashboardProps {
  metrics: SimulationMetrics;
  isRealTime?: boolean;
}

const MetricsDashboard: React.FC<MetricsDashboardProps> = ({
  metrics,
  isRealTime = true,
}) => {
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [updateCount, setUpdateCount] = useState(0);

  useEffect(() => {
    // Simulate real-time updates every second
    if (isRealTime) {
      const interval = setInterval(() => {
        setUpdateCount((prev) => prev + 1);

        // Add current metrics to historical data
        const timestamp = new Date().toLocaleTimeString();
        const newDataPoint = {
          time: timestamp,
          average_speed: metrics.average_speed_kmh,
          queue_length: metrics.total_queue_length,
          throughput: metrics.throughput_vehicles_per_hour,
          wait_time: metrics.average_wait_time_seconds,
        };

        setHistoricalData((prev) => {
          const newData = [...prev, newDataPoint];
          // Keep only last 20 data points
          return newData.slice(-20);
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [metrics, isRealTime]);

  const getStatusColor = (
    value: number,
    threshold: number,
    type: "good" | "warning" | "critical"
  ) => {
    if (type === "good") {
      return value >= threshold ? "text-green-600" : "text-yellow-600";
    } else if (type === "warning") {
      return value <= threshold ? "text-green-600" : "text-yellow-600";
    } else {
      return value <= threshold ? "text-green-600" : "text-red-600";
    }
  };

  const getStatusIcon = (
    value: number,
    threshold: number,
    type: "good" | "warning" | "critical"
  ) => {
    if (type === "good") {
      return value >= threshold ? CheckCircle : AlertCircle;
    } else if (type === "warning") {
      return value <= threshold ? CheckCircle : AlertCircle;
    } else {
      return value <= threshold ? CheckCircle : AlertCircle;
    }
  };

  const metricCards = [
    {
      title: "Average Network Speed",
      value: `${metrics.average_speed_kmh.toFixed(1)} km/h`,
      icon: TrendingUp,
      color: getStatusColor(metrics.average_speed_kmh, 40, "good"),
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      status: getStatusIcon(metrics.average_speed_kmh, 40, "good"),
      threshold: "40 km/h",
      description: "Current average speed across all network segments",
    },
    {
      title: "Total Queue Length",
      value: `${metrics.total_queue_length.toFixed(0)} vehicles`,
      icon: Car,
      color: getStatusColor(metrics.total_queue_length, 10, "critical"),
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      status: getStatusIcon(metrics.total_queue_length, 10, "critical"),
      threshold: "10 vehicles",
      description: "Total number of vehicles waiting at intersections",
    },
    {
      title: "Average Wait Time",
      value: `${metrics.average_wait_time_seconds.toFixed(1)} seconds`,
      icon: Clock,
      color: getStatusColor(metrics.average_wait_time_seconds, 30, "critical"),
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      status: getStatusIcon(metrics.average_wait_time_seconds, 30, "critical"),
      threshold: "30 seconds",
      description: "Average time vehicles wait at traffic signals",
    },
    {
      title: "Network Throughput",
      value: `${metrics.throughput_vehicles_per_hour.toFixed(0)} veh/h`,
      icon: Lightbulb,
      color: getStatusColor(metrics.throughput_vehicles_per_hour, 1000, "good"),
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      status: getStatusIcon(metrics.throughput_vehicles_per_hour, 1000, "good"),
      threshold: "1000 veh/h",
      description: "Total vehicles passing through network per hour",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Real-time Metrics Dashboard
        </h3>
        <div className="flex items-center space-x-2">
          {isRealTime && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-600 font-medium">Live</span>
            </div>
          )}
          <span className="text-sm text-gray-500">Updates: {updateCount}</span>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((metric) => {
          const Icon = metric.icon;
          const StatusIcon = metric.status;
          return (
            <div
              key={metric.title}
              className={`metrics-card ${metric.bgColor} border ${metric.borderColor} rounded-lg p-6`}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`p-2 rounded-lg ${metric.bgColor.replace(
                    "50",
                    "100"
                  )}`}
                >
                  <Icon className={`h-6 w-6 ${metric.color}`} />
                </div>
                <StatusIcon className={`h-5 w-5 ${metric.color}`} />
              </div>

              <h4 className="text-sm font-medium text-gray-600 mb-1">
                {metric.title}
              </h4>
              <p className="text-2xl font-bold text-gray-900 mb-2">
                {metric.value}
              </p>
              <p className="text-xs text-gray-500 mb-2">
                Threshold: {metric.threshold}
              </p>
              <p className="text-xs text-gray-600">{metric.description}</p>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Speed Trend Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            Speed Trend
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="average_speed"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Queue Length Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            Queue Length Trend
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="queue_length"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h4 className="text-lg font-medium text-gray-900 mb-4">
          Performance Summary
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {metrics.average_speed_kmh >= 40 ? "Good" : "Needs Attention"}
            </div>
            <p className="text-sm text-gray-600">Speed Performance</p>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 mb-2">
              {metrics.total_queue_length <= 10 ? "Good" : "Congested"}
            </div>
            <p className="text-sm text-gray-600">Traffic Flow</p>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {metrics.throughput_vehicles_per_hour >= 1000
                ? "Efficient"
                : "Low Capacity"}
            </div>
            <p className="text-sm text-gray-600">Network Capacity</p>
          </div>
        </div>
      </div>

      {/* Real-time Status */}
      {isRealTime && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Activity className="h-5 w-5 text-blue-600 animate-pulse" />
            <div>
              <p className="text-blue-900 font-medium">
                Real-time Monitoring Active
              </p>
              <p className="text-blue-700 text-sm">
                Metrics update every second. Last update:{" "}
                {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MetricsDashboard;
