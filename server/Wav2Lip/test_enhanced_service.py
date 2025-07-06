#!/usr/bin/env python3
"""
Comprehensive test suite for Enhanced Wav2Lip service
"""

import requests
import json
import time

BASE_URL = "http://localhost:5002"  # Enhanced service will run on different port

def test_health():
    """Test enhanced health endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        print(f"Health Check Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print("✅ Health Check Response:")
            print(json.dumps(data, indent=2))
            return True
        return False
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

def test_stats():
    """Test stats endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/stats", timeout=5)
        print(f"Stats Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print("✅ Stats Response:")
            print(json.dumps(data, indent=2))
            return True
        return False
    except Exception as e:
        print(f"❌ Stats test failed: {e}")
        return False

def test_enhanced_video_generation():
    """Test enhanced video generation with multiple features"""
    test_cases = [
        {
            "name": "Basic English",
            "data": {
                "script": "Hello! This is a comprehensive test of our enhanced Wav2Lip service with better audio processing and video quality.",
                "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=512&h=512&fit=crop&crop=face",
                "voice_options": {
                    "language": "en-US",
                    "speed": 1.0
                },
                "lesson_id": "enhanced_test_basic"
            }
        },
        {
            "name": "Fast Speech",
            "data": {
                "script": "This test uses faster speech to demonstrate the speed adjustment feature.",
                "avatar_url": "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=512&h=512&fit=crop&crop=face",
                "voice_options": {
                    "language": "en-US",
                    "speed": 1.5
                },
                "lesson_id": "enhanced_test_fast"
            }
        },
        {
            "name": "Slow Speech",
            "data": {
                "script": "This test uses slower speech for better clarity and understanding.",
                "avatar_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=512&h=512&fit=crop&crop=face",
                "voice_options": {
                    "language": "en-US",
                    "speed": 0.7
                },
                "lesson_id": "enhanced_test_slow"
            }
        }
    ]
    
    results = []
    
    for test_case in test_cases:
        print(f"\n🧪 Testing: {test_case['name']}")
        print(f"Script: {test_case['data']['script'][:50]}...")
        print(f"Speed: {test_case['data']['voice_options']['speed']}")
        
        try:
            start_time = time.time()
            response = requests.post(
                f"{BASE_URL}/generate-video",
                json=test_case['data'],
                timeout=180
            )
            end_time = time.time()
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ SUCCESS in {end_time - start_time:.2f}s")
                print(f"   Session ID: {result.get('session_id')}")
                print(f"   Duration: {result.get('duration')}s")
                print(f"   Processing Time: {result.get('processing_time')}s")
                print(f"   Video URL: {result.get('video_url')}")
                results.append({"test": test_case['name'], "success": True, "data": result})
            else:
                print(f"❌ FAILED: {response.status_code}")
                print(f"   Error: {response.json()}")
                results.append({"test": test_case['name'], "success": False, "error": response.json()})
                
        except Exception as e:
            print(f"❌ ERROR: {e}")
            results.append({"test": test_case['name'], "success": False, "error": str(e)})
    
    return results

def test_validation():
    """Test input validation"""
    print("\n🧪 Testing Input Validation...")
    
    validation_tests = [
        {
            "name": "Missing script",
            "data": {
                "avatar_url": "https://example.com/avatar.jpg",
                "lesson_id": "test"
            },
            "expected_status": 400
        },
        {
            "name": "Invalid URL",
            "data": {
                "script": "Test script",
                "avatar_url": "not-a-url",
                "lesson_id": "test"
            },
            "expected_status": 400
        },
        {
            "name": "Unsupported language",
            "data": {
                "script": "Test script",
                "avatar_url": "https://example.com/avatar.jpg",
                "voice_options": {"language": "xyz"},
                "lesson_id": "test"
            },
            "expected_status": 400
        },
        {
            "name": "Invalid speed",
            "data": {
                "script": "Test script",
                "avatar_url": "https://example.com/avatar.jpg",
                "voice_options": {"speed": 5.0},
                "lesson_id": "test"
            },
            "expected_status": 400
        }
    ]
    
    for test in validation_tests:
        try:
            response = requests.post(
                f"{BASE_URL}/generate-video",
                json=test['data'],
                timeout=10
            )
            
            if response.status_code == test['expected_status']:
                print(f"✅ {test['name']}: Correctly rejected")
            else:
                print(f"❌ {test['name']}: Expected {test['expected_status']}, got {response.status_code}")
                
        except Exception as e:
            print(f"❌ {test['name']}: Error - {e}")

def test_jobs_endpoint():
    """Test active jobs monitoring"""
    try:
        response = requests.get(f"{BASE_URL}/jobs", timeout=5)
        print(f"Jobs Endpoint Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print("✅ Jobs Response:")
            print(json.dumps(data, indent=2))
            return True
        return False
    except Exception as e:
        print(f"❌ Jobs test failed: {e}")
        return False

def main():
    print("=" * 80)
    print("COMPREHENSIVE ENHANCED WAV2LIP SERVICE TEST")
    print("=" * 80)
    
    # Wait for service to be ready
    print("Waiting for enhanced service to be ready...")
    time.sleep(3)
    
    # Test health
    print("\n1. Testing Health Endpoint...")
    health_ok = test_health()
    
    if not health_ok:
        print("❌ Service not available. Make sure enhanced service is running on port 5002")
        return
    
    # Test stats
    print("\n2. Testing Stats Endpoint...")
    test_stats()
    
    # Test jobs endpoint
    print("\n3. Testing Jobs Endpoint...")
    test_jobs_endpoint()
    
    # Test validation
    print("\n4. Testing Input Validation...")
    test_validation()
    
    # Test video generation
    print("\n5. Testing Enhanced Video Generation...")
    results = test_enhanced_video_generation()
    
    # Summary
    print("\n" + "=" * 80)
    print("TEST SUMMARY")
    print("=" * 80)
    
    successful_tests = sum(1 for r in results if r['success'])
    total_tests = len(results)
    
    print(f"Video Generation Tests: {successful_tests}/{total_tests} passed")
    
    for result in results:
        status = "✅ PASS" if result['success'] else "❌ FAIL"
        print(f"  {result['test']}: {status}")
    
    if successful_tests == total_tests:
        print("\n🎉 ALL TESTS PASSED! Enhanced service is fully functional!")
    else:
        print(f"\n⚠️  {total_tests - successful_tests} tests failed. Check the logs above.")

if __name__ == "__main__":
    main()
