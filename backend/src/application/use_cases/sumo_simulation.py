from typing import Dict, List, Optional, Tuple
import asyncio
import logging
import os
import subprocess
import tempfile
import xml.etree.ElementTree as ET
from datetime import datetime

from src.domain.entities.road_network import RoadNetwork
from src.domain.entities.simulation_config import SimulationConfig, SignalControlStrategy
from src.core.config import settings

logger = logging.getLogger(__name__)

class SUMOSimulationUseCase:
    """Use case for running SUMO traffic simulations"""
    
    def __init__(self):
        self.sumo_binary = settings.sumo_binary
        self.config_dir = settings.sumo_config_dir
        self.simulation_step = settings.simulation_step
    
    async def run_simulation(self, road_network: RoadNetwork, config: SimulationConfig) -> str:
        """
        Run SUMO simulation with given road network and configuration
        
        Args:
            road_network: Extracted road network
            config: Simulation configuration
            
        Returns:
            str: Simulation ID for tracking
        """
        try:
            simulation_id = f"sim_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            
            # Create SUMO configuration files
            network_file = await self._create_network_file(road_network, simulation_id)
            route_file = await self._create_route_file(config, simulation_id)
            config_file = await self._create_sumo_config(network_file, route_file, simulation_id)
            
            # Run simulation
            await self._execute_simulation(config_file, simulation_id)
            
            logger.info(f"Successfully started simulation {simulation_id}")
            return simulation_id
            
        except Exception as e:
            logger.error(f"Error running simulation: {str(e)}")
            raise
    
    async def _create_network_file(self, road_network: RoadNetwork, simulation_id: str) -> str:
        """Create SUMO network file from road network"""
        network_file = os.path.join(self.config_dir, f"{simulation_id}.net.xml")
        
        # Create XML structure for SUMO network
        root = ET.Element("net")
        root.set("version", "1.16")
        root.set("junctionCornerDetail", "35")
        root.set("limitTurnSpeed", "5.50")
        
        # Add edges (road segments)
        edges = ET.SubElement(root, "edges")
        for segment in road_network.segments:
            edge = ET.SubElement(edges, "edge")
            edge.set("id", segment.id)
            edge.set("from", f"j_{segment.id}_start")
            edge.set("to", f"j_{segment.id}_end")
            edge.set("numLanes", str(segment.num_lanes))
            edge.set("speed", str(segment.speed_limit / 3.6))  # Convert km/h to m/s
            
            # Add lane information
            for i in range(segment.num_lanes):
                lane = ET.SubElement(edge, "lane")
                lane.set("id", f"{segment.id}_{i}")
                lane.set("index", str(i))
                lane.set("speed", str(segment.speed_limit / 3.6))
                lane.set("length", str(segment.length))
                lane.set("width", str(segment.width / segment.num_lanes))
        
        # Add junctions (intersections)
        junctions = ET.SubElement(root, "junctions")
        for intersection in road_network.intersections:
            junction = ET.SubElement(junctions, "junction")
            junction.set("id", intersection.id)
            junction.set("type", "priority")
            junction.set("x", str(intersection.center_point[0]))
            junction.set("y", str(intersection.center_point[1]))
            
            # Add incoming/outgoing connections
            for segment_id in intersection.connected_segments:
                incoming = ET.SubElement(junction, "incoming")
                incoming.set("edge", segment_id)
                incoming.set("lane", f"{segment_id}_0")
                
                outgoing = ET.SubElement(junction, "outgoing")
                outgoing.set("edge", segment_id)
                outgoing.set("lane", f"{segment_id}_0")
        
        # Add connections between edges
        connections = ET.SubElement(root, "connections")
        for intersection in road_network.intersections:
            for i, seg1_id in enumerate(intersection.connected_segments):
                for j, seg2_id in enumerate(intersection.connected_segments):
                    if i != j:
                        connection = ET.SubElement(connections, "connection")
                        connection.set("from", seg1_id)
                        connection.set("to", seg2_id)
                        connection.set("fromLane", "0")
                        connection.set("toLane", "0")
                        connection.set("via", intersection.id)
        
        # Write network file
        tree = ET.ElementTree(root)
        tree.write(network_file, encoding="utf-8", xml_declaration=True)
        
        return network_file
    
    async def _create_route_file(self, config: SimulationConfig, simulation_id: str) -> str:
        """Create SUMO route file with traffic demand"""
        route_file = os.path.join(self.config_dir, f"{simulation_id}.rou.xml")
        
        root = ET.Element("routes")
        root.set("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance")
        root.set("xsi:noNamespaceSchemaLocation", "http://sumo.dlr.de/xsd/routes_file.xsd")
        
        # Add vehicle types
        vtypes = ET.SubElement(root, "vTypes")
        
        car_type = ET.SubElement(vtypes, "vType")
        car_type.set("id", "car")
        car_type.set("accel", "2.6")
        car_type.set("decel", "4.5")
        car_type.set("sigma", "0.5")
        car_type.set("tau", "1.0")
        car_type.set("length", "5.0")
        car_type.set("minGap", "2.5")
        car_type.set("maxSpeed", "70.0")
        car_type.set("guiShape", "passenger")
        
        truck_type = ET.SubElement(vtypes, "vType")
        truck_type.set("id", "truck")
        truck_type.set("accel", "1.3")
        truck_type.set("decel", "2.5")
        truck_type.set("sigma", "0.5")
        truck_type.set("tau", "1.5")
        truck_type.set("length", "7.5")
        truck_type.set("minGap", "3.0")
        truck_type.set("maxSpeed", "50.0")
        truck_type.set("guiShape", "truck")
        
        # Add flows (traffic demand)
        flows = ET.SubElement(root, "flows")
        
        # Calculate vehicle generation rate
        vehicles_per_second = config.traffic_demand.vehicles_per_hour / 3600
        
        # Create flows for different vehicle types
        for vehicle_type, percentage in config.traffic_demand.vehicle_mix.items():
            if percentage > 0:
                flow = ET.SubElement(flows, "flow")
                flow.set("id", f"flow_{vehicle_type.value}")
                flow.set("type", vehicle_type.value)
                flow.set("begin", "0")
                flow.set("end", str(config.traffic_demand.simulation_duration))
                flow.set("vehsPerHour", str(vehicles_per_second * percentage * 3600))
                
                # Add route
                route = ET.SubElement(flow, "route")
                route.set("edges", "edge_0 edge_1")  # Simplified route
        
        # Write route file
        tree = ET.ElementTree(root)
        tree.write(route_file, encoding="utf-8", xml_declaration=True)
        
        return route_file
    
    async def _create_sumo_config(self, network_file: str, route_file: str, simulation_id: str) -> str:
        """Create SUMO configuration file"""
        config_file = os.path.join(self.config_dir, f"{simulation_id}.sumocfg")
        
        root = ET.Element("configuration")
        root.set("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance")
        root.set("xsi:noNamespaceSchemaLocation", "http://sumo.dlr.de/xsd/sumoConfiguration.xsd")
        
        # Input section
        input_section = ET.SubElement(root, "input")
        
        net_file = ET.SubElement(input_section, "net-file")
        net_file.set("value", os.path.basename(network_file))
        
        route_file_elem = ET.SubElement(input_section, "route-files")
        route_file_elem.set("value", os.path.basename(route_file))
        
        # Time section
        time_section = ET.SubElement(root, "time")
        
        begin = ET.SubElement(time_section, "begin")
        begin.set("value", "0")
        
        end = ET.SubElement(time_section, "end")
        end.set("value", "3600")
        
        step_length = ET.SubElement(time_section, "step-length")
        step_length.set("value", str(self.simulation_step))
        
        # Processing section
        processing_section = ET.SubElement(root, "processing")
        
        ignore_route_errors = ET.SubElement(processing_section, "ignore-route-errors")
        ignore_route_errors.set("value", "true")
        
        # Report section
        report_section = ET.SubElement(root, "report")
        
        verbose = ET.SubElement(report_section, "verbose")
        verbose.set("value", "true")
        
        no_step_log = ET.SubElement(report_section, "no-step-log")
        no_step_log.set("value", "true")
        
        # Write config file
        tree = ET.ElementTree(root)
        tree.write(config_file, encoding="utf-8", xml_declaration=True)
        
        return config_file
    
    async def _execute_simulation(self, config_file: str, simulation_id: str) -> None:
        """Execute SUMO simulation"""
        try:
            # Run SUMO simulation
            cmd = [
                self.sumo_binary,
                "-c", config_file,
                "--tripinfo-output", f"{simulation_id}_tripinfo.xml",
                "--summary-output", f"{simulation_id}_summary.xml",
                "--queue-output", f"{simulation_id}_queue.xml",
                "--vehroute-output", f"{simulation_id}_vehroute.xml"
            ]
            
            # Run in background
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                cwd=self.config_dir
            )
            
            # Store process for monitoring
            # In production, you'd want to store this in a database or cache
            logger.info(f"Started SUMO simulation {simulation_id} with PID {process.pid}")
            
        except Exception as e:
            logger.error(f"Error executing SUMO simulation: {str(e)}")
            raise
    
    async def get_simulation_metrics(self, simulation_id: str) -> Dict[str, float]:
        """Get real-time simulation metrics"""
        try:
            metrics = {}
            
            # Read summary file for overall metrics
            summary_file = os.path.join(self.config_dir, f"{simulation_id}_summary.xml")
            if os.path.exists(summary_file):
                tree = ET.parse(summary_file)
                root = tree.getroot()
                
                # Extract metrics from summary
                for step in root.findall(".//step"):
                    time = float(step.get("time", 0))
                    vehicles = int(step.get("vehicles", 0))
                    waiting = int(step.get("waiting", 0))
                    
                    metrics["time"] = time
                    metrics["total_vehicles"] = vehicles
                    metrics["waiting_vehicles"] = waiting
            
            # Read queue file for queue length
            queue_file = os.path.join(self.config_dir, f"{simulation_id}_queue.xml")
            if os.path.exists(queue_file):
                tree = ET.parse(queue_file)
                root = tree.getroot()
                
                total_queue_length = 0
                for queue in root.findall(".//queue"):
                    length = float(queue.get("length", 0))
                    total_queue_length += length
                
                metrics["total_queue_length"] = total_queue_length
            
            # Calculate derived metrics
            if "total_vehicles" in metrics and "time" in metrics and metrics["time"] > 0:
                metrics["throughput_vehicles_per_hour"] = (metrics["total_vehicles"] / metrics["time"]) * 3600
            
            # Default values if metrics not available
            metrics.setdefault("average_speed_kmh", 50.0)
            metrics.setdefault("total_queue_length", 0.0)
            metrics.setdefault("average_wait_time_seconds", 0.0)
            metrics.setdefault("throughput_vehicles_per_hour", 0.0)
            
            return metrics
            
        except Exception as e:
            logger.error(f"Error getting simulation metrics: {str(e)}")
            # Return default metrics
            return {
                "average_speed_kmh": 50.0,
                "total_queue_length": 0.0,
                "average_wait_time_seconds": 0.0,
                "throughput_vehicles_per_hour": 0.0
            }
    
    async def stop_simulation(self, simulation_id: str) -> bool:
        """Stop running simulation"""
        try:
            # In production, you'd look up the process ID from storage
            # For now, we'll just log the request
            logger.info(f"Requested to stop simulation {simulation_id}")
            return True
        except Exception as e:
            logger.error(f"Error stopping simulation: {str(e)}")
            return False 