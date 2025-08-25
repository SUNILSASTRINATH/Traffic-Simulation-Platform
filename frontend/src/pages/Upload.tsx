import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload as UploadIcon,
  Image as ImageIcon,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useSimulation } from "../contexts/SimulationContext";
import { RoadNetwork } from "../types";

const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const { setRoadNetwork } = useSimulation();

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileSelect = (file: File) => {
    setError(null);

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (JPG, PNG, BMP)");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate road network extraction
      const mockRoadNetwork: RoadNetwork = {
        id: "network_001",
        segments: [
          {
            id: "seg_001",
            start_point: [0, 0],
            end_point: [100, 0],
            length: 100,
            width: 12,
            road_type: "urban",
            speed_limit: 50,
            num_lanes: 2,
          },
          {
            id: "seg_002",
            start_point: [50, -50],
            end_point: [50, 50],
            length: 100,
            width: 10,
            road_type: "urban",
            speed_limit: 40,
            num_lanes: 2,
          },
        ],
        intersections: [
          {
            id: "int_001",
            center_point: [50, 0],
            intersection_type: "four_way",
            connected_segments: ["seg_001", "seg_002"],
          },
        ],
        lanes: [
          {
            id: "lane_001",
            road_segment_id: "seg_001",
            lane_number: 1,
            start_point: [0, 0],
            end_point: [100, 0],
            width: 6,
            direction: "forward",
          },
          {
            id: "lane_002",
            road_segment_id: "seg_001",
            lane_number: 2,
            start_point: [0, 0],
            end_point: [100, 0],
            width: 6,
            direction: "forward",
          },
          {
            id: "lane_003",
            road_segment_id: "seg_002",
            lane_number: 1,
            start_point: [50, -50],
            end_point: [50, 50],
            width: 5,
            direction: "forward",
          },
          {
            id: "lane_004",
            road_segment_id: "seg_002",
            lane_number: 2,
            start_point: [50, -50],
            end_point: [50, 50],
            width: 5,
            direction: "forward",
          },
        ],
        bounds: [
          [0, -50],
          [100, 50],
        ],
        metrics: {
          total_length_km: 0.2,
          total_lanes: 4,
          avg_speed_limit_kmh: 45,
          num_segments: 2,
          num_intersections: 1,
        },
      };

      // Set the road network in context
      setRoadNetwork(mockRoadNetwork);

      setUploadSuccess(true);

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      setError("Failed to process image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Upload Road Infrastructure Image
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload a photo of road infrastructure (intersection, highway,
            roundabout) and our AI will extract the road network for traffic
            simulation.
          </p>
        </div>

        {/* Upload Area */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              dragActive
                ? "border-blue-400 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {!selectedFile ? (
              <>
                <UploadIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Drop your image here, or click to browse
                </h3>
                <p className="text-gray-600 mb-6">
                  Supports JPG, PNG, and BMP files up to 10MB
                </p>
                <label className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors cursor-pointer">
                  Choose File
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileInput}
                  />
                </label>
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-green-600 mr-3" />
                  <div className="text-left">
                    <h3 className="text-lg font-medium text-gray-900">
                      {selectedFile.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>

                {preview && (
                  <div className="max-w-md mx-auto">
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-auto rounded-lg border border-gray-200"
                    />
                  </div>
                )}

                <div className="flex items-center justify-center space-x-4">
                  <button
                    onClick={removeFile}
                    className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remove
                  </button>

                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <UploadIcon className="h-4 w-4 mr-2" />
                        Upload & Process
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-red-800">
                  Upload Error
                </h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {uploadSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-green-800">
                  Upload Successful!
                </h3>
                <p className="text-sm text-green-700 mt-1">
                  Road network extracted successfully. Redirecting to
                  dashboard...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            📋 Upload Instructions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">✅ What to Upload:</h4>
              <ul className="space-y-1">
                <li>• Clear photos of intersections</li>
                <li>• Highway on/off ramps</li>
                <li>• Roundabouts and junctions</li>
                <li>• Urban road networks</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">💡 Tips for Best Results:</h4>
              <ul className="space-y-1">
                <li>• Good lighting conditions</li>
                <li>• Clear view of road markings</li>
                <li>• Avoid heavy traffic in photos</li>
                <li>• Capture the entire intersection</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
