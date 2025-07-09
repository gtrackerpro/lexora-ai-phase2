# main.py
# Flask-based video generation server with optional Tavus API integration

import os
import uuid
import time
import logging
from datetime import datetime
from flask import Flask, request, jsonify
from werkzeug.exceptions import BadRequest
import requests

# Load environment variables from .env
from dotenv import load_dotenv
load_dotenv()

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("video-service")

app = Flask(__name__)

# Config
CONFIG = {
    'MAX_CONCURRENT_JOBS': 5,
    'SUPPORTED_LANGUAGES': ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh'],
    'MAX_SCRIPT_LENGTH': 10000
}

# Globals
active_jobs = {}

# Tavus Config
TAVUS_API_KEY = os.getenv("TAVUS_API_KEY")
TAVUS_API_URL = os.getenv("TAVUS_API_URL", "https://tavusapi.com/v2/videos")
TAVUS_REPLICA_ID = os.getenv("TAVUS_REPLICA_ID", "r7e8f9a0b-c1d2-3e4f-5g6h-7i8j9k0l1m2n")

# Helpers
def validate_request(data):
    script = data.get("script", "").strip()
    avatar_url = data.get("avatar_url", "").strip()
    voice_options = data.get("voice_options", {})

    if not script:
        return False, "Script text is required"
    if len(script) > CONFIG['MAX_SCRIPT_LENGTH']:
        return False, f"Script too long (max {CONFIG['MAX_SCRIPT_LENGTH']} characters)"
    if not avatar_url.startswith("http"):
        return False, "Avatar URL must be valid"

    language = voice_options.get("language", "en").split("-")[0].lower()
    if language not in CONFIG['SUPPORTED_LANGUAGES']:
        return False, f"Language '{language}' not supported"

    return True, ""

def get_available_replicas():
    """Get available replicas from Tavus API"""
    try:
        headers = {
            'x-api-key': TAVUS_API_KEY,
            'Content-Type': 'application/json'
        }
        replicas_url = "https://tavusapi.com/v2/replicas"
        res = requests.get(replicas_url, headers=headers, timeout=30)
        res.raise_for_status()
        data = res.json()
        logger.info(f"Available replicas: {data}")
        return data
    except Exception as e:
        logger.error(f"Failed to get replicas: {e}")
        return None

def generate_tavus_video(script, avatar_url, voice_options):
    try:
        headers = {
            'x-api-key': TAVUS_API_KEY,
            'Content-Type': 'application/json'
        }
        # Tavus API expects these fields
        payload = {
            "script": script,
            "replica_id": TAVUS_REPLICA_ID,  # Use configurable replica ID
            "video_name": f"lesson_video_{int(time.time())}"
        }
        logger.info("Calling Tavus API...")
        logger.info(f"Payload: {payload}")
        logger.info(f"Using replica_id: {payload['replica_id']}")
        res = requests.post(TAVUS_API_URL, headers=headers, json=payload, timeout=90)
        logger.info(f"Tavus API Response Status: {res.status_code}")
        logger.info(f"Tavus API Response Headers: {res.headers}")
        logger.info(f"Tavus API Response Body: {res.text}")
        res.raise_for_status()
        data = res.json()
        logger.info(f"Tavus API Response: {data}")
        
        # Tavus API returns video_id initially, then video_url when ready
        video_id = data.get("video_id")
        if video_id:
            # Poll for video completion
            return poll_tavus_video(video_id)
        else:
            # Check if video_url is directly available
            video_url = data.get("video_url") or data.get("download_url")
            if video_url:
                return video_url
            else:
                logger.error(f"No video_url found in response: {data}")
                return None
    except Exception as e:
        logger.error(f"Tavus API failed: {e}")
        return None

def poll_tavus_video(video_id, max_wait_time=300):
    """Poll Tavus API for video completion"""
    try:
        headers = {
            'x-api-key': TAVUS_API_KEY,
            'Content-Type': 'application/json'
        }
        
        start_time = time.time()
        while time.time() - start_time < max_wait_time:
            # Check video status using the same base URL
            status_url = f"{TAVUS_API_URL}/{video_id}"
            res = requests.get(status_url, headers=headers, timeout=30)
            res.raise_for_status()
            data = res.json()
            
            status = data.get("status")
            logger.info(f"Video {video_id} status: {status}")
            
            if status == "ready" or status == "completed":
                # Try different possible fields for video URL
                video_url = (data.get("video_url") or 
                           data.get("download_url") or 
                           data.get("hosted_url") or 
                           data.get("video_download_url"))
                
                if video_url:
                    logger.info(f"Video {video_id} ready! URL: {video_url}")
                    return video_url
                else:
                    logger.error(f"Video {video_id} is ready but no URL found in response: {data}")
                    return None
            elif status == "failed":
                logger.error(f"Video generation failed for {video_id}")
                return None
            
            # Wait before next poll
            time.sleep(10)
        
        logger.error(f"Video {video_id} timed out after {max_wait_time} seconds")
        return None
    except Exception as e:
        logger.error(f"Error polling video {video_id}: {e}")
        return None

# Routes
@app.route("/generate-video", methods=["POST"])
def generate_video():
    try:
        if len(active_jobs) >= CONFIG['MAX_CONCURRENT_JOBS']:
            return jsonify({"success": False, "error": "Too many active jobs"}), 429

        data = request.get_json()
        if not data:
            raise BadRequest("Missing JSON data")

        valid, msg = validate_request(data)
        if not valid:
            raise BadRequest(msg)

        script = data['script'].strip()
        avatar_url = data['avatar_url'].strip()
        voice_options = data.get('voice_options', {})
        use_tavus = data.get("use_tavus", False)
        session_id = str(uuid.uuid4())
        active_jobs[session_id] = {"start": time.time()}

        if use_tavus:
            video_url = generate_tavus_video(script, avatar_url, voice_options)
            if not video_url:
                raise Exception("Tavus API did not return video_url")
            duration = time.time() - active_jobs[session_id]["start"]
            del active_jobs[session_id]
            return jsonify({
                "success": True,
                "video_url": video_url,
                "source": "tavus",
                "session_id": session_id,
                "processing_time": round(duration, 2)
            })

        # Fallback logic can go here if you have local generation
        raise NotImplementedError("Local Wav2Lip pipeline not implemented in this file")

    except BadRequest as e:
        return jsonify({"success": False, "error": str(e)}), 400
    except Exception as e:
        logger.error(f"Video generation failed: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/health")
def health():
    return jsonify({"status": "ok", "timestamp": datetime.now().isoformat()})

@app.route("/replicas")
def get_replicas():
    """Get available replicas from Tavus API"""
    replicas = get_available_replicas()
    if replicas:
        return jsonify({"success": True, "replicas": replicas})
    else:
        return jsonify({"success": False, "error": "Failed to get replicas"})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=port)