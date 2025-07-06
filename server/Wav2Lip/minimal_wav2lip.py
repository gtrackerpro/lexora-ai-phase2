#!/usr/bin/env python3
"""
Minimal Wav2Lip Video Generation Service
Basic Flask service without problematic imports
"""

import os
import sys
import json
import time
import uuid
import logging
import subprocess
from pathlib import Path
from typing import Dict, Any, Optional

import requests
from flask import Flask, request, jsonify
from werkzeug.exceptions import BadRequest

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Configuration
CONFIG = {
    'TEMP_DIR': os.path.join(os.environ.get('TEMP', 'C:/temp'), 'wav2lip'),
    'MAX_FILE_SIZE': 100 * 1024 * 1024,  # 100MB
    'OUTPUT_FORMAT': 'mp4',
    'FPS': 25
}

class MinimalWav2LipService:
    def __init__(self):
        self.temp_dir = Path(CONFIG['TEMP_DIR'])
        self.temp_dir.mkdir(exist_ok=True)
        logger.info("Minimal Wav2Lip service initialized")
    
    def download_file(self, url: str, local_path: str) -> bool:
        """Download a file from URL to local path"""
        try:
            response = requests.get(url, stream=True, timeout=30)
            response.raise_for_status()
            
            with open(local_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            logger.info(f"Downloaded file: {url} -> {local_path}")
            return True
        except Exception as e:
            logger.error(f"Failed to download file {url}: {e}")
            return False
    
    def generate_tts_audio(self, text: str, output_path: str, voice_options: Dict[str, Any]) -> bool:
        """Generate TTS audio from text"""
        try:
            from gtts import gTTS
            
            language = voice_options.get('language', 'en')
            lang_code = language.split('-')[0]
            
            tts = gTTS(text=text, lang=lang_code, slow=False)
            tts.save(output_path)
            
            logger.info(f"Generated TTS audio: {output_path}")
            return True
        except Exception as e:
            logger.error(f"Failed to generate TTS audio: {e}")
            return False
    
    def generate_simple_video(self, image_path: str, audio_path: str, output_path: str) -> bool:
        """Generate a simple video with static image and audio using FFmpeg"""
        try:
            cmd = [
                'ffmpeg', '-y',
                '-loop', '1',
                '-i', image_path,
                '-i', audio_path,
                '-c:v', 'libx264',
                '-c:a', 'aac',
                '-b:a', '192k',
                '-pix_fmt', 'yuv420p',
                '-shortest',
                '-movflags', '+faststart',
                output_path
            ]
            
            logger.info("Generating video with FFmpeg...")
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
            
            if result.returncode == 0:
                logger.info(f"Generated video: {output_path}")
                return True
            else:
                logger.error(f"FFmpeg error: {result.stderr}")
                return False
                
        except subprocess.TimeoutExpired:
            logger.error("FFmpeg process timed out")
            return False
        except Exception as e:
            logger.error(f"Failed to generate video: {e}")
            return False
    
    def get_audio_duration(self, audio_path: str) -> float:
        """Get duration of audio file in seconds"""
        try:
            cmd = [
                'ffprobe', '-v', 'quiet',
                '-show_entries', 'format=duration',
                '-of', 'csv=p=0',
                audio_path
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
            
            if result.returncode == 0:
                return float(result.stdout.strip())
            else:
                return 5.0  # Default duration
                
        except Exception as e:
            logger.error(f"Failed to get audio duration: {e}")
            return 5.0
    
    def cleanup_temp_files(self, file_paths: list):
        """Clean up temporary files"""
        for file_path in file_paths:
            try:
                if os.path.exists(file_path):
                    os.remove(file_path)
                    logger.debug(f"Cleaned up: {file_path}")
            except Exception as e:
                logger.warning(f"Failed to cleanup {file_path}: {e}")

# Initialize service
wav2lip_service = MinimalWav2LipService()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'wav2lip-minimal',
        'ffmpeg_available': True,
        'temp_dir': str(wav2lip_service.temp_dir)
    })

@app.route('/test', methods=['GET'])  
def test_endpoint():
    """Test endpoint"""
    return jsonify({
        'message': 'Service is working',
        'python_version': sys.version,
        'temp_dir_exists': wav2lip_service.temp_dir.exists()
    })

@app.route('/generate-video', methods=['POST'])
def generate_video():
    """Generate basic video from script and avatar"""
    try:
        data = request.get_json()
        if not data:
            raise BadRequest("No JSON data provided")
        
        script = data.get('script', '').strip()
        avatar_url = data.get('avatar_url', '').strip()
        voice_options = data.get('voice_options', {})
        lesson_id = data.get('lesson_id', '')
        
        if not script:
            raise BadRequest("Script text is required")
        if not avatar_url:
            raise BadRequest("Avatar URL is required")
        
        logger.info(f"Starting video generation for lesson: {lesson_id}")
        
        session_id = str(uuid.uuid4())
        temp_files = []
        
        try:
            avatar_path = os.path.join(CONFIG['TEMP_DIR'], f"{session_id}_avatar.jpg")
            audio_path = os.path.join(CONFIG['TEMP_DIR'], f"{session_id}_audio.wav")
            video_path = os.path.join(CONFIG['TEMP_DIR'], f"{session_id}_output.mp4")
            
            temp_files.extend([avatar_path, audio_path, video_path])
            
            # Download avatar image
            if not wav2lip_service.download_file(avatar_url, avatar_path):
                raise Exception("Failed to download avatar image")
            
            # Generate TTS audio
            if not wav2lip_service.generate_tts_audio(script, audio_path, voice_options):
                raise Exception("Failed to generate TTS audio")
            
            # Generate video
            if not wav2lip_service.generate_simple_video(avatar_path, audio_path, video_path):
                raise Exception("Failed to generate video")
            
            duration = wav2lip_service.get_audio_duration(audio_path)
            
            # Mock S3 URLs
            video_url = f"https://lexora-assets.s3.amazonaws.com/generated/videos/{session_id}.mp4"
            audio_url = f"https://lexora-assets.s3.amazonaws.com/generated/audio/{session_id}.wav"
            
            # Clean up temporary files
            wav2lip_service.cleanup_temp_files(temp_files)
            
            logger.info(f"Video generation completed for lesson: {lesson_id}")
            
            return jsonify({
                'success': True,
                'video_url': video_url,
                'audio_url': audio_url,
                'duration': duration,
                'session_id': session_id
            })
            
        except Exception as e:
            wav2lip_service.cleanup_temp_files(temp_files)
            raise e
            
    except BadRequest as e:
        logger.warning(f"Bad request: {e}")
        return jsonify({'success': False, 'error': str(e)}), 400
    except Exception as e:
        logger.error(f"Video generation failed: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'success': False, 'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'success': False, 'error': 'Internal server error'}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    logger.info(f"Starting Minimal Wav2Lip service on port {port}")
    app.run(host='0.0.0.0', port=port, debug=False)
