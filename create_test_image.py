#!/usr/bin/env python3
"""
Test Image Generator for Traffic Simulation Platform
Creates a simple test image with road infrastructure for testing
"""

import numpy as np
from PIL import Image, ImageDraw, ImageFont
import os

def create_test_image():
    """Create a simple test image with road infrastructure"""
    
    # Create a white canvas
    width, height = 800, 600
    image = Image.new('RGB', (width, height), 'white')
    draw = ImageDraw.Draw(image)
    
    # Draw road segments (thick lines)
    road_color = (64, 64, 64)  # Dark gray
    road_width = 40
    
    # Horizontal road (main street)
    draw.rectangle([(100, 280), (700, 320)], fill=road_color)
    
    # Vertical road (cross street)
    draw.rectangle([(380, 100), (420, 500)], fill=road_color)
    
    # Draw lane markings
    lane_color = (255, 255, 255)  # White
    lane_width = 2
    
    # Horizontal road lanes
    draw.line([(100, 300), (700, 300)], fill=lane_color, width=lane_width)
    
    # Vertical road lanes
    draw.line([(400, 100), (400, 500)], fill=lane_color, width=lane_width)
    
    # Draw intersection center
    center_x, center_y = 400, 300
    draw.ellipse([(center_x-20, center_y-20), (center_x+20, center_y+20)], 
                 fill=(255, 255, 0), outline=(0, 0, 0), width=2)
    
    # Draw traffic signals
    signal_color = (255, 0, 0)  # Red
    signal_size = 15
    
    # Top signal
    draw.ellipse([(center_x-30, center_y-80), (center_x-15, center_y-65)], 
                 fill=signal_color)
    
    # Right signal
    draw.ellipse([(center_x+65, center_y-15), (center_x+80, center_y)], 
                 fill=signal_color)
    
    # Bottom signal
    draw.ellipse([(center_x-15, center_y+65), (center_x, center_y+80)], 
                 fill=signal_color)
    
    # Left signal
    draw.ellipse([(center_x-80, center_y), (center_x-65, center_y+15)], 
                 fill=signal_color)
    
    # Add text labels
    try:
        # Try to use a default font
        font = ImageFont.load_default()
    except:
        font = None
    
    # Add labels
    draw.text((50, 50), "Traffic Simulation Test Image", fill=(0, 0, 0), font=font)
    draw.text((50, 80), "4-Way Intersection", fill=(0, 0, 0), font=font)
    draw.text((50, 110), "Upload this image to test the platform", fill=(0, 0, 0), font=font)
    
    # Add road labels
    draw.text((350, 200), "NORTH", fill=(0, 0, 0), font=font)
    draw.text((350, 520), "SOUTH", fill=(0, 0, 0), font=font)
    draw.text((50, 290), "WEST", fill=(0, 0, 0), font=font)
    draw.text((720, 290), "EAST", fill=(0, 0, 0), font=font)
    
    # Add intersection type
    draw.text((center_x-60, center_y-10), "4-WAY", fill=(0, 0, 0), font=font)
    draw.text((center_x-60, center_y+10), "INTERSECTION", fill=(0, 0, 0), font=font)
    
    return image

def create_t_junction_image():
    """Create a T-junction test image"""
    
    width, height = 800, 600
    image = Image.new('RGB', (width, height), 'white')
    draw = ImageDraw.Draw(image)
    
    road_color = (64, 64, 64)
    road_width = 40
    
    # Horizontal road (main street)
    draw.rectangle([(100, 280), (700, 320)], fill=road_color)
    
    # Vertical road (ending at main street)
    draw.rectangle([(380, 100), (420, 320)], fill=road_color)
    
    # Lane markings
    lane_color = (255, 255, 255)
    draw.line([(100, 300), (700, 300)], fill=lane_color, width=2)
    draw.line([(400, 100), (400, 320)], fill=lane_color, width=2)
    
    # T-junction center
    center_x, center_y = 400, 300
    draw.ellipse([(center_x-20, center_y-20), (center_x+20, center_y+20)], 
                 fill=(255, 255, 0), outline=(0, 0, 0), width=2)
    
    # Add labels
    try:
        font = ImageFont.load_default()
    except:
        font = None
    
    draw.text((50, 50), "T-Junction Test Image", fill=(0, 0, 0), font=font)
    draw.text((50, 80), "Three-way intersection", fill=(0, 0, 0), font=font)
    
    return image

def create_roundabout_image():
    """Create a roundabout test image"""
    
    width, height = 800, 600
    image = Image.new('RGB', (width, height), 'white')
    draw = ImageDraw.Draw(image)
    
    road_color = (64, 64, 64)
    
    # Center point
    center_x, center_y = 400, 300
    radius = 80
    
    # Draw roundabout circle
    draw.ellipse([(center_x-radius, center_y-radius), (center_x+radius, center_y+radius)], 
                 fill=(255, 255, 0), outline=(0, 0, 0), width=3)
    
    # Draw approach roads
    # North
    draw.rectangle([(center_x-30, 100), (center_x+30, center_y-radius)], fill=road_color)
    # South
    draw.rectangle([(center_x-30, center_y+radius), (center_x+30, 500)], fill=road_color)
    # East
    draw.rectangle([(center_x+radius, center_y-30), (700, center_y+30)], fill=road_color)
    # West
    draw.rectangle([(100, center_y-30), (center_x-radius, center_y+30)], fill=road_color)
    
    # Lane markings
    lane_color = (255, 255, 255)
    draw.line([(center_x, 100), (center_x, center_y-radius)], fill=lane_color, width=2)
    draw.line([(center_x, center_y+radius), (center_x, 500)], fill=lane_color, width=2)
    draw.line([(center_x+radius, center_y), (700, center_y)], fill=lane_color, width=2)
    draw.line([(100, center_y), (center_x-radius, center_y)], fill=lane_color, width=2)
    
    # Add labels
    try:
        font = ImageFont.load_default()
    except:
        font = None
    
    draw.text((50, 50), "Roundabout Test Image", fill=(0, 0, 0), font=font)
    draw.text((50, 80), "Circular intersection", fill=(0, 0, 0), font=font)
    
    return image

def main():
    """Main function to create test images"""
    
    # Create output directory
    output_dir = "test_images"
    os.makedirs(output_dir, exist_ok=True)
    
    print("🚗 Creating test images for Traffic Simulation Platform...")
    
    # Create 4-way intersection image
    print("📸 Creating 4-way intersection test image...")
    intersection_img = create_test_image()
    intersection_img.save(f"{output_dir}/4way_intersection.png")
    print("✅ Saved: 4way_intersection.png")
    
    # Create T-junction image
    print("📸 Creating T-junction test image...")
    t_junction_img = create_t_junction_image()
    t_junction_img.save(f"{output_dir}/t_junction.png")
    print("✅ Saved: t_junction.png")
    
    # Create roundabout image
    print("📸 Creating roundabout test image...")
    roundabout_img = create_roundabout_image()
    roundabout_img.save(f"{output_dir}/roundabout.png")
    print("✅ Saved: roundabout.png")
    
    print("\n🎉 Test images created successfully!")
    print(f"📁 Images saved in: {output_dir}/")
    print("\n📋 Usage Instructions:")
    print("1. Start the Traffic Simulation Platform")
    print("2. Go to the Upload page")
    print("3. Upload any of these test images")
    print("4. Watch the road network extraction process")
    print("5. Configure and run traffic simulations")
    
    print("\n🖼️ Available test images:")
    print("- 4way_intersection.png: Standard 4-way intersection")
    print("- t_junction.png: Three-way T-junction")
    print("- roundabout.png: Circular roundabout intersection")
    
    print("\n💡 Tip: These are simple test images. For more realistic testing,")
    print("   use actual photos of road infrastructure from your area.")

if __name__ == "__main__":
    main() 