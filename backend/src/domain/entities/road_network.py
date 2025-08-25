from dataclasses import dataclass
from typing import List, Tuple, Optional
from enum import Enum
import numpy as np

class RoadType(Enum):
    HIGHWAY = "highway"
    ARTERIAL = "arterial"
    COLLECTOR = "collector"
    LOCAL = "local"

class IntersectionType(Enum):
    T_JUNCTION = "t_junction"
    FOUR_WAY = "four_way"
    ROUNDABOUT = "roundabout"
    ON_RAMP = "on_ramp"
    OFF_RAMP = "off_ramp"

@dataclass
class RoadSegment:
    """Represents a road segment between two points"""
    id: str
    start_point: Tuple[float, float]
    end_point: Tuple[float, float]
    road_type: RoadType
    num_lanes: int
    speed_limit: float  # km/h
    width: float  # meters
    length: float  # meters
    
    def get_center_line(self) -> List[Tuple[float, float]]:
        """Get center line points of the road segment"""
        return [self.start_point, self.end_point]

@dataclass
class Intersection:
    """Represents a road intersection"""
    id: str
    center_point: Tuple[float, float]
    intersection_type: IntersectionType
    connected_segments: List[str]  # List of road segment IDs
    traffic_signals: Optional[List[str]] = None
    radius: float = 0.0  # For roundabouts

@dataclass
class Lane:
    """Represents a single lane within a road segment"""
    id: str
    road_segment_id: str
    lane_number: int
    start_point: Tuple[float, float]
    end_point: Tuple[float, float]
    width: float
    direction: str  # "forward", "backward", "bidirectional"

@dataclass
class RoadNetwork:
    """Complete road network representation"""
    id: str
    segments: List[RoadSegment]
    intersections: List[Intersection]
    lanes: List[Lane]
    bounds: Tuple[Tuple[float, float], Tuple[float, float]]  # (min_x, min_y), (max_x, max_y)
    
    def get_segment_by_id(self, segment_id: str) -> Optional[RoadSegment]:
        """Get road segment by ID"""
        for segment in self.segments:
            if segment.id == segment_id:
                return segment
        return None
    
    def get_intersection_by_id(self, intersection_id: str) -> Optional[Intersection]:
        """Get intersection by ID"""
        for intersection in self.intersections:
            if intersection.id == intersection_id:
                return intersection
        return None
    
    def get_lanes_for_segment(self, segment_id: str) -> List[Lane]:
        """Get all lanes for a specific road segment"""
        return [lane for lane in self.lanes if lane.road_segment_id == segment_id]
    
    def calculate_network_metrics(self) -> dict:
        """Calculate basic network metrics"""
        total_length = sum(segment.length for segment in self.segments)
        total_lanes = sum(segment.num_lanes for segment in self.segments)
        avg_speed = np.mean([segment.speed_limit for segment in self.segments])
        
        return {
            "total_length_km": total_length / 1000,
            "total_lanes": total_lanes,
            "avg_speed_limit_kmh": avg_speed,
            "num_segments": len(self.segments),
            "num_intersections": len(self.intersections)
        } 