from typing import Optional, Tuple, List
import cv2
import numpy as np
from PIL import Image
import logging

from src.domain.entities.road_network import RoadNetwork, RoadSegment, Intersection, Lane, RoadType, IntersectionType
from src.core.config import settings

logger = logging.getLogger(__name__)

class ImageProcessingUseCase:
    """Use case for processing road infrastructure images and extracting road networks"""
    
    def __init__(self):
        self.min_road_width = settings.min_road_width
        self.max_road_width = settings.max_road_width
        self.intersection_threshold = settings.intersection_detection_threshold
    
    async def process_image(self, image_path: str) -> RoadNetwork:
        """
        Process uploaded image and extract road network
        
        Args:
            image_path: Path to the uploaded image
            
        Returns:
            RoadNetwork: Extracted road network representation
        """
        try:
            # Load and preprocess image
            image = cv2.imread(image_path)
            if image is None:
                raise ValueError("Could not load image")
            
            # Convert to grayscale
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Apply preprocessing
            processed = self._preprocess_image(gray)
            
            # Detect road segments
            road_segments = self._detect_road_segments(processed)
            
            # Detect intersections
            intersections = self._detect_intersections(processed, road_segments)
            
            # Generate lanes
            lanes = self._generate_lanes(road_segments)
            
            # Calculate network bounds
            bounds = self._calculate_network_bounds(road_segments)
            
            # Create road network
            network = RoadNetwork(
                id=f"network_{hash(image_path)}",
                segments=road_segments,
                intersections=intersections,
                lanes=lanes,
                bounds=bounds
            )
            
            logger.info(f"Successfully extracted road network with {len(road_segments)} segments and {len(intersections)} intersections")
            return network
            
        except Exception as e:
            logger.error(f"Error processing image: {str(e)}")
            raise
    
    def _preprocess_image(self, gray_image: np.ndarray) -> np.ndarray:
        """Preprocess grayscale image for road detection"""
        # Apply Gaussian blur to reduce noise
        blurred = cv2.GaussianBlur(gray_image, (5, 5), 0)
        
        # Apply adaptive thresholding
        thresh = cv2.adaptiveThreshold(
            blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
        )
        
        # Morphological operations to clean up the image
        kernel = np.ones((3, 3), np.uint8)
        processed = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
        processed = cv2.morphologyEx(processed, cv2.MORPH_OPEN, kernel)
        
        return processed
    
    def _detect_road_segments(self, processed_image: np.ndarray) -> List[RoadSegment]:
        """Detect road segments from processed image"""
        road_segments = []
        
        # Edge detection
        edges = cv2.Canny(processed_image, 50, 150)
        
        # Line detection using Hough Transform
        lines = cv2.HoughLinesP(edges, 1, np.pi/180, threshold=50, minLineLength=50, maxLineGap=10)
        
        if lines is not None:
            for i, line in enumerate(lines):
                x1, y1, x2, y2 = line[0]
                
                # Calculate road properties
                length = np.sqrt((x2-x1)**2 + (y2-y1)**2)
                width = self._estimate_road_width(processed_image, (x1, y1), (x2, y2))
                
                # Filter by road width
                if self.min_road_width <= width <= self.max_road_width:
                    road_type = self._classify_road_type(length, width)
                    
                    segment = RoadSegment(
                        id=f"segment_{i}",
                        start_point=(float(x1), float(y1)),
                        end_point=(float(x2), float(y2)),
                        road_type=road_type,
                        num_lanes=self._estimate_num_lanes(width),
                        speed_limit=self._estimate_speed_limit(road_type),
                        width=width,
                        length=length
                    )
                    road_segments.append(segment)
        
        return road_segments
    
    def _detect_intersections(self, processed_image: np.ndarray, road_segments: List[RoadSegment]) -> List[Intersection]:
        """Detect intersections from road segments"""
        intersections = []
        
        if len(road_segments) < 2:
            return intersections
        
        # Find intersection points
        intersection_points = self._find_intersection_points(road_segments)
        
        for i, point in enumerate(intersection_points):
            # Determine intersection type
            intersection_type = self._classify_intersection_type(point, road_segments)
            
            # Find connected segments
            connected_segments = self._find_connected_segments(point, road_segments)
            
            intersection = Intersection(
                id=f"intersection_{i}",
                center_point=point,
                intersection_type=intersection_type,
                connected_segments=connected_segments
            )
            intersections.append(intersection)
        
        return intersections
    
    def _generate_lanes(self, road_segments: List[RoadSegment]) -> List[Lane]:
        """Generate lanes for each road segment"""
        lanes = []
        
        for segment in road_segments:
            num_lanes = segment.num_lanes
            
            # Calculate lane positions
            for lane_num in range(num_lanes):
                # Calculate lane start and end points
                lane_start, lane_end = self._calculate_lane_position(
                    segment.start_point, segment.end_point, segment.width, lane_num, num_lanes
                )
                
                lane = Lane(
                    id=f"lane_{segment.id}_{lane_num}",
                    road_segment_id=segment.id,
                    lane_number=lane_num,
                    start_point=lane_start,
                    end_point=lane_end,
                    width=segment.width / num_lanes,
                    direction="forward" if lane_num < num_lanes // 2 else "backward"
                )
                lanes.append(lane)
        
        return lanes
    
    def _estimate_road_width(self, image: np.ndarray, start: Tuple[int, int], end: Tuple[int, int]) -> float:
        """Estimate road width based on image analysis"""
        # Simple estimation based on perpendicular line analysis
        # This is a simplified approach - in production, more sophisticated methods would be used
        dx = end[0] - start[0]
        dy = end[1] - start[1]
        
        # Calculate perpendicular vector
        perp_x, perp_y = -dy, dx
        length = np.sqrt(perp_x**2 + perp_y**2)
        if length > 0:
            perp_x, perp_y = perp_x/length, perp_y/length
        
        # Sample points along perpendicular line to estimate width
        width_samples = []
        for t in range(-20, 21, 2):
            x = int(start[0] + t * perp_x)
            y = int(start[1] + t * perp_y)
            
            if 0 <= x < image.shape[1] and 0 <= y < image.shape[0]:
                if image[y, x] < 128:  # Dark pixel indicates road
                    width_samples.append(t)
        
        if width_samples:
            return float(max(width_samples) - min(width_samples))
        return 30.0  # Default width
    
    def _classify_road_type(self, length: float, width: float) -> RoadType:
        """Classify road type based on dimensions"""
        if width > 80:
            return RoadType.HIGHWAY
        elif width > 60:
            return RoadType.ARTERIAL
        elif width > 40:
            return RoadType.COLLECTOR
        else:
            return RoadType.LOCAL
    
    def _estimate_num_lanes(self, width: float) -> int:
        """Estimate number of lanes based on road width"""
        if width > 80:
            return 6
        elif width > 60:
            return 4
        elif width > 40:
            return 2
        else:
            return 1
    
    def _estimate_speed_limit(self, road_type: RoadType) -> float:
        """Estimate speed limit based on road type"""
        speed_limits = {
            RoadType.HIGHWAY: 120.0,
            RoadType.ARTERIAL: 80.0,
            RoadType.COLLECTOR: 60.0,
            RoadType.LOCAL: 40.0
        }
        return speed_limits.get(road_type, 50.0)
    
    def _find_intersection_points(self, road_segments: List[RoadSegment]) -> List[Tuple[float, float]]:
        """Find intersection points between road segments"""
        intersection_points = []
        
        for i, seg1 in enumerate(road_segments):
            for j, seg2 in enumerate(road_segments[i+1:], i+1):
                intersection = self._line_intersection(
                    seg1.start_point, seg1.end_point,
                    seg2.start_point, seg2.end_point
                )
                if intersection:
                    intersection_points.append(intersection)
        
        return intersection_points
    
    def _line_intersection(self, p1: Tuple[float, float], p2: Tuple[float, float],
                          p3: Tuple[float, float], p4: Tuple[float, float]) -> Optional[Tuple[float, float]]:
        """Calculate intersection point of two line segments"""
        x1, y1 = p1
        x2, y2 = p2
        x3, y3 = p3
        x4, y4 = p4
        
        denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
        if abs(denom) < 1e-10:
            return None
        
        t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom
        u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom
        
        if 0 <= t <= 1 and 0 <= u <= 1:
            x = x1 + t * (x2 - x1)
            y = y1 + t * (y2 - y1)
            return (x, y)
        
        return None
    
    def _classify_intersection_type(self, point: Tuple[float, float], road_segments: List[RoadSegment]) -> IntersectionType:
        """Classify intersection type based on connected segments"""
        connected_segments = self._find_connected_segments(point, road_segments)
        
        if len(connected_segments) == 3:
            return IntersectionType.T_JUNCTION
        elif len(connected_segments) == 4:
            return IntersectionType.FOUR_WAY
        elif len(connected_segments) > 4:
            # Check if it's a roundabout
            if self._is_roundabout(point, connected_segments):
                return IntersectionType.ROUNDABOUT
            return IntersectionType.FOUR_WAY
        else:
            return IntersectionType.T_JUNCTION
    
    def _find_connected_segments(self, point: Tuple[float, float], road_segments: List[RoadSegment]) -> List[str]:
        """Find road segments connected to an intersection point"""
        connected = []
        tolerance = 10.0  # pixels
        
        for segment in road_segments:
            start_dist = np.sqrt((point[0] - segment.start_point[0])**2 + (point[1] - segment.start_point[1])**2)
            end_dist = np.sqrt((point[0] - segment.end_point[0])**2 + (point[1] - segment.end_point[1])**2)
            
            if start_dist <= tolerance or end_dist <= tolerance:
                connected.append(segment.id)
        
        return connected
    
    def _is_roundabout(self, point: Tuple[float, float], connected_segments: List[str]) -> bool:
        """Determine if intersection is a roundabout"""
        # Simplified roundabout detection
        # In production, more sophisticated geometric analysis would be used
        return len(connected_segments) >= 4
    
    def _calculate_lane_position(self, start: Tuple[float, float], end: Tuple[float, float],
                                road_width: float, lane_num: int, total_lanes: int) -> Tuple[Tuple[float, float], Tuple[float, float]]:
        """Calculate lane position within road segment"""
        # Calculate perpendicular vector
        dx = end[0] - start[0]
        dy = end[1] - start[1]
        length = np.sqrt(dx**2 + dy**2)
        
        if length == 0:
            return start, end
        
        # Normalize and rotate 90 degrees
        perp_x = -dy / length
        perp_y = dx / length
        
        # Calculate lane offset
        lane_width = road_width / total_lanes
        offset = (lane_num - total_lanes // 2 + 0.5) * lane_width
        
        # Calculate lane start and end points
        lane_start = (start[0] + offset * perp_x, start[1] + offset * perp_y)
        lane_end = (end[0] + offset * perp_x, end[1] + offset * perp_y)
        
        return lane_start, lane_end
    
    def _calculate_network_bounds(self, road_segments: List[RoadSegment]) -> Tuple[Tuple[float, float], Tuple[float, float]]:
        """Calculate network bounding box"""
        if not road_segments:
            return ((0, 0), (100, 100))
        
        all_points = []
        for segment in road_segments:
            all_points.extend([segment.start_point, segment.end_point])
        
        min_x = min(point[0] for point in all_points)
        min_y = min(point[1] for point in all_points)
        max_x = max(point[0] for point in all_points)
        max_y = max(point[1] for point in all_points)
        
        return ((min_x, min_y), (max_x, max_y)) 