from dataclasses import dataclass
from typing import Dict, Any
from enum import Enum

class SignalControlStrategy(Enum):
    FIXED_TIME = "fixed_time"
    ACTUATED = "actuated"
    ADAPTIVE = "adaptive"

class VehicleType(Enum):
    CAR = "car"
    TRUCK = "truck"
    BUS = "bus"
    MOTORCYCLE = "motorcycle"

@dataclass
class TrafficDemand:
    """Traffic demand configuration"""
    vehicles_per_hour: int  # 100-5000
    vehicle_mix: Dict[VehicleType, float]  # Percentage distribution
    peak_hour_factor: float  # 1.0-2.0
    simulation_duration: int  # seconds
    
    def validate(self) -> bool:
        """Validate traffic demand parameters"""
        if not (100 <= self.vehicles_per_hour <= 5000):
            return False
        if not (1.0 <= self.peak_hour_factor <= 2.0):
            return False
        if sum(self.vehicle_mix.values()) != 100.0:
            return False
        return True

@dataclass
class SignalTiming:
    """Traffic signal timing configuration"""
    green_time: int  # seconds
    yellow_time: int  # seconds
    red_time: int  # seconds
    cycle_length: int  # seconds
    
    def calculate_cycle_length(self) -> int:
        """Calculate total cycle length"""
        return self.green_time + self.yellow_time + self.red_time

@dataclass
class SimulationConfig:
    """Complete simulation configuration"""
    id: str
    road_network_id: str
    traffic_demand: TrafficDemand
    signal_control: SignalControlStrategy
    signal_timing: SignalTiming
    simulation_step: float = 1.0  # seconds
    random_seed: int = 42
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for API responses"""
        return {
            "id": self.id,
            "road_network_id": self.road_network_id,
            "traffic_demand": {
                "vehicles_per_hour": self.traffic_demand.vehicles_per_hour,
                "vehicle_mix": {k.value: v for k, v in self.traffic_demand.vehicle_mix.items()},
                "peak_hour_factor": self.traffic_demand.peak_hour_factor,
                "simulation_duration": self.traffic_demand.simulation_duration
            },
            "signal_control": self.signal_control.value,
            "signal_timing": {
                "green_time": self.signal_timing.green_time,
                "yellow_time": self.signal_timing.yellow_time,
                "red_time": self.signal_timing.red_time,
                "cycle_length": self.signal_timing.cycle_length
            },
            "simulation_step": self.simulation_step,
            "random_seed": self.random_seed
        }
    
    def validate(self) -> bool:
        """Validate simulation configuration"""
        return self.traffic_demand.validate() 