from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect, Depends
from fastapi.responses import JSONResponse
import json
import logging
from typing import Dict, Any
import uuid

from src.application.use_cases.sumo_simulation import SUMOSimulationUseCase
from src.domain.entities.simulation_config import SimulationConfig, TrafficDemand, SignalTiming, SignalControlStrategy, VehicleType
from src.infrastructure.websocket.connection_manager import ConnectionManager

logger = logging.getLogger(__name__)

router = APIRouter()
connection_manager = ConnectionManager()

# Dependency injection
def get_simulation_use_case() -> SUMOSimulationUseCase:
    return SUMOSimulationUseCase()

@router.post("/start")
async def start_simulation(
    config: Dict[str, Any],
    use_case: SUMOSimulationUseCase = Depends(get_simulation_use_case)
):
    """Start a new traffic simulation"""
    try:
        # Validate and create simulation configuration
        traffic_demand = TrafficDemand(
            vehicles_per_hour=config.get("vehicles_per_hour", 1000),
            vehicle_mix={
                VehicleType.CAR: config.get("car_percentage", 80.0),
                VehicleType.TRUCK: config.get("truck_percentage", 20.0)
            },
            peak_hour_factor=config.get("peak_hour_factor", 1.0),
            simulation_duration=config.get("simulation_duration", 3600)
        )
        
        signal_timing = SignalTiming(
            green_time=config.get("green_time", 30),
            yellow_time=config.get("yellow_time", 3),
            red_time=config.get("red_time", 30),
            cycle_length=config.get("cycle_length", 63)
        )
        
        simulation_config = SimulationConfig(
            id=str(uuid.uuid4()),
            road_network_id=config.get("road_network_id"),
            traffic_demand=traffic_demand,
            signal_control=SignalControlStrategy(config.get("signal_control", "fixed_time")),
            signal_timing=signal_timing
        )
        
        # Validate configuration
        if not simulation_config.validate():
            raise HTTPException(status_code=400, detail="Invalid simulation configuration")
        
        # For now, we'll use a mock road network
        # In production, you'd retrieve this from storage
        from src.domain.entities.road_network import RoadNetwork, RoadSegment, Intersection, Lane, RoadType, IntersectionType
        
        # Create a simple mock network for testing
        mock_network = RoadNetwork(
            id="mock_network",
            segments=[
                RoadSegment(
                    id="segment_0",
                    start_point=(0, 0),
                    end_point=(100, 0),
                    road_type=RoadType.ARTERIAL,
                    num_lanes=2,
                    speed_limit=60.0,
                    width=40.0,
                    length=100.0
                ),
                RoadSegment(
                    id="segment_1",
                    start_point=(50, -50),
                    end_point=(50, 50),
                    road_type=RoadType.ARTERIAL,
                    num_lanes=2,
                    speed_limit=60.0,
                    width=40.0,
                    length=100.0
                )
            ],
            intersections=[
                Intersection(
                    id="intersection_0",
                    center_point=(50, 0),
                    intersection_type=IntersectionType.FOUR_WAY,
                    connected_segments=["segment_0", "segment_1"]
                )
            ],
            lanes=[],
            bounds=((0, -50), (100, 50))
        )
        
        # Start simulation
        simulation_id = await use_case.run_simulation(mock_network, simulation_config)
        
        return {
            "simulation_id": simulation_id,
            "status": "started",
            "message": "Simulation started successfully"
        }
        
    except Exception as e:
        logger.error(f"Error starting simulation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to start simulation: {str(e)}")

@router.get("/{simulation_id}/status")
async def get_simulation_status(
    simulation_id: str,
    use_case: SUMOSimulationUseCase = Depends(get_simulation_use_case)
):
    """Get simulation status and metrics"""
    try:
        metrics = await use_case.get_simulation_metrics(simulation_id)
        
        return {
            "simulation_id": simulation_id,
            "status": "running",  # In production, you'd check actual status
            "metrics": metrics
        }
        
    except Exception as e:
        logger.error(f"Error getting simulation status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get simulation status: {str(e)}")

@router.post("/{simulation_id}/stop")
async def stop_simulation(
    simulation_id: str,
    use_case: SUMOSimulationUseCase = Depends(get_simulation_use_case)
):
    """Stop a running simulation"""
    try:
        success = await use_case.stop_simulation(simulation_id)
        
        if success:
            return {
                "simulation_id": simulation_id,
                "status": "stopped",
                "message": "Simulation stopped successfully"
            }
        else:
            raise HTTPException(status_code=400, detail="Failed to stop simulation")
            
    except Exception as e:
        logger.error(f"Error stopping simulation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to stop simulation: {str(e)}")

@router.websocket("/{simulation_id}/ws")
async def simulation_websocket(
    websocket: WebSocket,
    simulation_id: str
):
    """WebSocket endpoint for real-time simulation updates"""
    client_id = str(uuid.uuid4())
    
    try:
        # Connect client
        await connection_manager.connect(websocket, client_id)
        await connection_manager.subscribe_to_simulation(websocket, simulation_id)
        
        # Send initial connection confirmation
        await connection_manager.send_personal_message({
            "type": "connection_established",
            "simulation_id": simulation_id,
            "client_id": client_id
        }, client_id)
        
        # Keep connection alive and handle messages
        while True:
            try:
                # Wait for messages from client
                data = await websocket.receive_text()
                message = json.loads(data)
                
                # Handle different message types
                if message.get("type") == "ping":
                    await connection_manager.send_personal_message({
                        "type": "pong",
                        "timestamp": message.get("timestamp")
                    }, client_id)
                
                elif message.get("type") == "get_metrics":
                    # Get current metrics and send back
                    use_case = get_simulation_use_case()
                    metrics = await use_case.get_simulation_metrics(simulation_id)
                    
                    await connection_manager.send_personal_message({
                        "type": "metrics_update",
                        "simulation_id": simulation_id,
                        "metrics": metrics
                    }, client_id)
                
            except WebSocketDisconnect:
                break
            except Exception as e:
                logger.error(f"Error handling WebSocket message: {str(e)}")
                await connection_manager.send_personal_message({
                    "type": "error",
                    "message": "Internal server error"
                }, client_id)
                
    except WebSocketDisconnect:
        logger.info(f"Client {client_id} disconnected from simulation {simulation_id}")
    except Exception as e:
        logger.error(f"Error in simulation WebSocket: {str(e)}")
    finally:
        # Clean up
        connection_manager.unsubscribe_from_simulation(websocket, simulation_id)
        connection_manager.disconnect(client_id)

@router.get("/config/templates")
async def get_simulation_templates():
    """Get predefined simulation configuration templates"""
    templates = {
        "urban_intersection": {
            "name": "Urban Intersection",
            "description": "Standard 4-way intersection with traffic lights",
            "vehicles_per_hour": 1500,
            "car_percentage": 85.0,
            "truck_percentage": 15.0,
            "peak_hour_factor": 1.2,
            "signal_control": "fixed_time",
            "green_time": 30,
            "yellow_time": 3,
            "red_time": 30
        },
        "highway_merge": {
            "name": "Highway Merge",
            "description": "Highway on-ramp merge scenario",
            "vehicles_per_hour": 3000,
            "car_percentage": 90.0,
            "truck_percentage": 10.0,
            "peak_hour_factor": 1.5,
            "signal_control": "actuated",
            "green_time": 45,
            "yellow_time": 3,
            "red_time": 20
        },
        "roundabout": {
            "name": "Roundabout",
            "description": "Multi-lane roundabout intersection",
            "vehicles_per_hour": 800,
            "car_percentage": 80.0,
            "truck_percentage": 20.0,
            "peak_hour_factor": 1.0,
            "signal_control": "adaptive",
            "green_time": 60,
            "yellow_time": 3,
            "red_time": 0
        }
    }
    
    return templates 