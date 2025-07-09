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
TAVUS_API_URL = os.getenv("TAVUS_API_URL", "https://tavusapi.com/v2/replicas")

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

def generate_tavus_video(script, avatar_url, voice_options):
    try:
        headers = {
            'Authorization': f'Bearer {TAVUS_API_KEY}',
            'Content-Type': 'application/json'
        }
        payload = {
            "script": script,
            "avatar_url": avatar_url,
            "voice": voice_options.get("voice_id", "en-US-Wavenet-D")
        }
        logger.info("Calling Tavus API...")
        res = requests.post(TAVUS_API_URL, headers=headers, json=payload, timeout=90)
        res.raise_for_status()
        data = res.json()
        return data.get("video_url")
    except Exception as e:
        logger.error(f"Tavus API failed: {e}")
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

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=port)