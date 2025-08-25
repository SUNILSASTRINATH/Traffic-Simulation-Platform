export interface RoadSegment {
  id: string;
  start_point: [number, number];
  end_point: [number, number];
  road_type: string;
  num_lanes: number;
  speed_limit: number;
  width: number;
  length: number;
}

export interface Intersection {
  id: string;
  center_point: [number, number];
  intersection_type: string;
  connected_segments: string[];
}

export interface Lane {
  id: string;
  road_segment_id: string;
  lane_number: number;
  start_point: [number, number];
  end_point: [number, number];
  width: number;
  direction: string;
}

export interface RoadNetwork {
  id: string;
  segments: RoadSegment[];
  intersections: Intersection[];
  lanes: Lane[];
  bounds: [[number, number], [number, number]];
  metrics: NetworkMetrics;
}

export interface NetworkMetrics {
  total_length_km: number;
  total_lanes: number;
  avg_speed_limit_kmh: number;
  num_segments: number;
  num_intersections: number;
}

export interface SimulationConfig {
  vehicles_per_hour: number;
  car_percentage: number;
  truck_percentage: number;
  peak_hour_factor: number;
  signal_control: string;
  green_time: number;
  yellow_time: number;
  red_time: number;
  simulation_duration: number;
}

export interface SimulationMetrics {
  average_speed_kmh: number;
  total_queue_length: number;
  average_wait_time_seconds: number;
  throughput_vehicles_per_hour: number;
  time?: number;
  total_vehicles?: number;
  waiting_vehicles?: number;
}

export interface SimulationTemplate {
  name: string;
  description: string;
  vehicles_per_hour: number;
  car_percentage: number;
  truck_percentage: number;
  peak_hour_factor: number;
  signal_control: string;
  green_time: number;
  yellow_time: number;
  red_time: number;
}

export interface SimulationStatus {
  simulation_id: string;
  status: "idle" | "running" | "paused" | "completed" | "error";
  message: string;
  metrics?: SimulationMetrics;
}

export interface UploadedImage {
  file_id: string;
  filename: string;
  road_network: RoadNetwork;
  message: string;
}

export interface WebSocketMessage {
  type: string;
  [key: string]: any;
}
