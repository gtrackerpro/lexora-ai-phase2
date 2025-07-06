#!/usr/bin/env python3
"""
Test video generation with a working image URL
"""

import requests
import json

def test_video_generation():
    """Test video generation with a real image"""
    
    # Use a real publicly available image
    test_data = {
        "script": "Hello! Welcome to Lexora, your AI-powered educational platform. This is a test of our video generation service.",
        "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=512&h=512&fit=crop&crop=face",
        "voice_options": {
            "language": "en-US",
            "speed": 1.0
        },
        "lesson_id": "test_lesson_real_image"
    }
    
    print("Testing video generation with real image...")
    print(f"Script: {test_data['script']}")
    print(f"Avatar URL: {test_data['avatar_url']}")
    
    try:
        response = requests.post(
            "http://localhost:5001/generate-video",
            json=test_data,
            timeout=120  # Longer timeout for video generation
        )
        
        print(f"\nVideo Generation Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ SUCCESS!")
            print(f"Session ID: {result.get('session_id')}")
            print(f"Video URL: {result.get('video_url')}")
            print(f"Audio URL: {result.get('audio_url')}")
            print(f"Duration: {result.get('duration')} seconds")
        else:
            print("❌ FAILED!")
            print(f"Error: {response.json()}")
            
    except requests.exceptions.Timeout:
        print("❌ TIMEOUT - Video generation took too long")
    except Exception as e:
        print(f"❌ ERROR: {e}")

if __name__ == "__main__":
    print("=" * 60)
    print("TESTING WAV2LIP VIDEO GENERATION")
    print("=" * 60)
    test_video_generation()
    print("=" * 60)
