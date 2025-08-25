"""
Image processing API routes for the Traffic Simulation Platform.
Handles image upload, processing, and road network extraction.
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import JSONResponse
import os
import uuid
from typing import List
import logging

from src.application.use_cases.image_processing import ImageProcessingUseCase
from src.core.config import settings
from src.domain.entities.road_network import RoadNetwork

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/images", tags=["images"])

# Initialize use case
image_processing_uc = ImageProcessingUseCase()

@router.post("/upload")
async def upload_image(file: UploadFile = File(...)) -> JSONResponse:
    """
    Upload and process an image to extract road network.
    
    Args:
        file: Image file (JPG, PNG, BMP supported)
        
    Returns:
        JSON response with extracted road network data
    """
    try:
        # Validate file type
        allowed_types = ["image/jpeg", "image/png", "image/bmp"]
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type. Allowed: {', '.join(allowed_types)}"
            )
        
        # Validate file size (max 10MB)
        if file.size > settings.file_upload.max_size:
            raise HTTPException(
                status_code=400,
                detail=f"File too large. Maximum size: {settings.file_upload.max_size} bytes"
            )
        
        # Generate unique filename
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(settings.file_upload.directory, unique_filename)
        
        # Ensure upload directory exists
        os.makedirs(settings.file_upload.directory, exist_ok=True)
        
        # Save uploaded file
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        logger.info(f"Image uploaded successfully: {unique_filename}")
        
        # Process image to extract road network
        road_network = await image_processing_uc.process_image(file_path)
        
        # Return extracted road network data
        return JSONResponse(
            status_code=200,
            content={
                "message": "Image processed successfully",
                "filename": unique_filename,
                "road_network": road_network.to_dict(),
                "network_stats": {
                    "segments": len(road_network.segments),
                    "intersections": len(road_network.intersections),
                    "total_lanes": sum(len(segment.lanes) for segment in road_network.segments),
                    "estimated_length": sum(segment.length for segment in road_network.segments)
                }
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing image: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/preview/{filename}")
async def get_image_preview(filename: str) -> JSONResponse:
    """
    Get image preview information.
    
    Args:
        filename: Name of the uploaded image
        
    Returns:
        JSON response with image preview data
    """
    try:
        file_path = os.path.join(settings.file_upload.directory, filename)
        
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="Image not found")
        
        # Get file info
        file_stats = os.stat(file_path)
        
        return JSONResponse(
            status_code=200,
            content={
                "filename": filename,
                "size": file_stats.st_size,
                "uploaded_at": file_stats.st_mtime,
                "path": file_path
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting image preview: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.delete("/{filename}")
async def delete_image(filename: str) -> JSONResponse:
    """
    Delete an uploaded image.
    
    Args:
        filename: Name of the image to delete
        
    Returns:
        JSON response confirming deletion
    """
    try:
        file_path = os.path.join(settings.file_upload.directory, filename)
        
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="Image not found")
        
        # Delete file
        os.remove(file_path)
        
        logger.info(f"Image deleted successfully: {filename}")
        
        return JSONResponse(
            status_code=200,
            content={"message": f"Image {filename} deleted successfully"}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting image: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/types")
async def get_supported_types() -> JSONResponse:
    """
    Get list of supported image types.
    
    Returns:
        JSON response with supported file types
    """
    return JSONResponse(
        status_code=200,
        content={
            "supported_types": [
                {"mime_type": "image/jpeg", "extension": ".jpg", "description": "JPEG image"},
                {"mime_type": "image/png", "extension": ".png", "description": "PNG image"},
                {"mime_type": "image/bmp", "extension": ".bmp", "description": "BMP image"}
            ],
            "max_file_size": settings.file_upload.max_size,
            "max_file_size_mb": settings.file_upload.max_size / (1024 * 1024)
        }
    )

@router.get("/list")
async def list_uploaded_images() -> JSONResponse:
    """
    List all uploaded images.
    
    Returns:
        JSON response with list of uploaded images
    """
    try:
        if not os.path.exists(settings.file_upload.directory):
            return JSONResponse(
                status_code=200,
                content={"images": [], "total": 0}
            )
        
        images = []
        for filename in os.listdir(settings.file_upload.directory):
            if filename.lower().endswith(('.jpg', '.jpeg', '.png', '.bmp')):
                file_path = os.path.join(settings.file_upload.directory, filename)
                file_stats = os.stat(file_path)
                
                images.append({
                    "filename": filename,
                    "size": file_stats.st_size,
                    "uploaded_at": file_stats.st_mtime,
                    "path": file_path
                })
        
        return JSONResponse(
            status_code=200,
            content={
                "images": images,
                "total": len(images)
            }
        )
        
    except Exception as e:
        logger.error(f"Error listing images: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        ) 