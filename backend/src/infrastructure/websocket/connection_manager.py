from typing import Dict, List
import json
import logging
from fastapi import WebSocket, WebSocketDisconnect

logger = logging.getLogger(__name__)

class ConnectionManager:
    """Manages WebSocket connections for real-time communication"""
    
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.simulation_connections: Dict[str, List[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, client_id: str):
        """Connect a new WebSocket client"""
        await websocket.accept()
        self.active_connections[client_id] = websocket
        logger.info(f"Client {client_id} connected. Total connections: {len(self.active_connections)}")
    
    def disconnect(self, client_id: str):
        """Disconnect a WebSocket client"""
        if client_id in self.active_connections:
            del self.active_connections[client_id]
            logger.info(f"Client {client_id} disconnected. Total connections: {len(self.active_connections)}")
    
    async def send_personal_message(self, message: dict, client_id: str):
        """Send a message to a specific client"""
        if client_id in self.active_connections:
            try:
                await self.active_connections[client_id].send_text(json.dumps(message))
            except Exception as e:
                logger.error(f"Error sending message to client {client_id}: {str(e)}")
                self.disconnect(client_id)
    
    async def broadcast(self, message: dict):
        """Broadcast a message to all connected clients"""
        disconnected_clients = []
        
        for client_id, connection in self.active_connections.items():
            try:
                await connection.send_text(json.dumps(message))
            except Exception as e:
                logger.error(f"Error broadcasting to client {client_id}: {str(e)}")
                disconnected_clients.append(client_id)
        
        # Remove disconnected clients
        for client_id in disconnected_clients:
            self.disconnect(client_id)
    
    async def subscribe_to_simulation(self, websocket: WebSocket, simulation_id: str):
        """Subscribe a client to simulation updates"""
        if simulation_id not in self.simulation_connections:
            self.simulation_connections[simulation_id] = []
        
        self.simulation_connections[simulation_id].append(websocket)
        logger.info(f"Client subscribed to simulation {simulation_id}. Total subscribers: {len(self.simulation_connections[simulation_id])}")
    
    async def unsubscribe_from_simulation(self, websocket: WebSocket, simulation_id: str):
        """Unsubscribe a client from simulation updates"""
        if simulation_id in self.simulation_connections:
            if websocket in self.simulation_connections[simulation_id]:
                self.simulation_connections[simulation_id].remove(websocket)
                logger.info(f"Client unsubscribed from simulation {simulation_id}. Remaining subscribers: {len(self.simulation_connections[simulation_id])}")
    
    async def broadcast_simulation_update(self, simulation_id: str, message: dict):
        """Broadcast simulation update to subscribed clients"""
        if simulation_id in self.simulation_connections:
            disconnected_clients = []
            
            for connection in self.simulation_connections[simulation_id]:
                try:
                    await connection.send_text(json.dumps(message))
                except Exception as e:
                    logger.error(f"Error sending simulation update: {str(e)}")
                    disconnected_clients.append(connection)
            
            # Remove disconnected clients
            for connection in disconnected_clients:
                if connection in self.simulation_connections[simulation_id]:
                    self.simulation_connections[simulation_id].remove(connection)
    
    def get_connection_count(self) -> int:
        """Get total number of active connections"""
        return len(self.active_connections)
    
    def get_simulation_subscriber_count(self, simulation_id: str) -> int:
        """Get number of subscribers for a specific simulation"""
        return len(self.simulation_connections.get(simulation_id, [])) 