#!/usr/bin/env python3
"""
Test script for the Wav2Lip service
"""

import requests
import json
import time

def test_health():
    """Test the health endpoint"""
    try:
        response = requests.get("http://localhost:5001/health", timeout=5)
        print(f"Health Check Status: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Health check failed: {e}")
        return False

def test_generate_video():
    """Test the video generation endpoint"""
    try:
        # Test data
        test_data = {
            "script": "Hello, this is a test message for the Wav2Lip service.",
            "avatar_url": "https://via.placeholder.com/512x512.jpg",
            "voice_options": {
                "language": "en-US",
                "speed": 1.0
            },
            "lesson_id": "test_lesson_001"
        }
        
        print("Testing video generation...")
        response = requests.post(
            "http://localhost:5001/generate-video",
            json=test_data,
            timeout=60
        )
        
        print(f"Video Generation Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
        
    except Exception as e:
        print(f"Video generation test failed: {e}")
        return False

def test_status():
    """Test the status endpoint"""
    try:
        test_session_id = "test-session-123"
        response = requests.get(f"http://localhost:5001/status/{test_session_id}", timeout=5)
        print(f"Status Check: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Status check failed: {e}")
        return False

if __name__ == "__main__":
    print("=" * 50)
    print("TESTING WAV2LIP SERVICE")
    print("=" * 50)
    
    # Wait a moment for service to be ready
    print("Waiting for service to be ready...")
    time.sleep(2)
    
    # Test health endpoint
    print("\n1. Testing Health Endpoint...")
    health_ok = test_health()
    
    if health_ok:
        print("\n2. Testing Status Endpoint...")
        test_status()
        
        print("\n3. Testing Video Generation...")
        test_generate_video()
    else:
        print("Service not available - skipping other tests")
    
    print("\nTest completed!")
