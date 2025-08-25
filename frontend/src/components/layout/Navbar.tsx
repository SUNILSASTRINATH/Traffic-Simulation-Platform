import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Lightbulb, Upload, BarChart3, Home } from "lucide-react";

const Navbar: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Lightbulb className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">
                Traffic Simulation Platform
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-8">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === "/"
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
              }`}
            >
              <Home className="inline-block w-4 h-4 mr-2" />
              Dashboard
            </Link>

            <Link
              to="/upload"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === "/upload"
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
              }`}
            >
              <Upload className="inline-block w-4 h-4 mr-2" />
              Upload Image
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
