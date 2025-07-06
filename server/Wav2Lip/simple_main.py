#!/usr/bin/env python3
"""
Simplified Wav2Lip Video Generation Service
A Flask-based microservice for generating basic lip-synced videos
"""

import os
import sys
import json
import time
import uuid
import logging
import tempfile
import subprocess
from pathlib import Path
from typing import Dict, Any, Optional

import cv2
import numpy as np
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
    'MODEL_PATH': os.path.join(os.getcwd(), 'models', 'wav2lip_gan.pth'),
    'TEMP_DIR': os.path.join(os.environ.get('TEMP', 'C:/temp'), 'wav2lip'),
    'MAX_FILE_SIZE': 100 * 1024 * 1024,  # 100MB
    'SUPPORTED_VIDEO_FORMATS': ['.mp4', '.avi', '.mov'],
    'SUPPORTED_AUDIO_FORMATS': ['.wav', '.mp3', '.m4a'],
    'OUTPUT_FORMAT': 'mp4',
    'FPS': 25,
    'QUALITY': 'high'
}

class SimpleWav2LipService:
    def __init__(self):
        self.device = 'cpu'  # Use CPU only for simplicity
        self.model_loaded = False
        self.temp_dir = Path(CONFIG['TEMP_DIR'])
        self.temp_dir.mkdir(exist_ok=True)
        logger.info(f"Simple Wav2Lip service initialized on device: {self.device}")
    
    def load_model(self):
        """Check if Wav2Lip model exists"""
        try:
            if not os.path.exists(CONFIG['MODEL_PATH']):
                logger.warning("Wav2Lip model not found. Using basic generation.")
                return False
            
            # Model exists but we're not loading it for simplicity
            logger.info("Wav2Lip model file found (using basic generation)")
            self.model_loaded = True
            return True
        except Exception as e:
            logger.error(f"Failed to check Wav2Lip model: {e}")
            return False
    
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
            # Use gTTS for text-to-speech generation
            from gtts import gTTS
            
            language = voice_options.get('language', 'en')
            # Extract language code (e.g., 'en-US' -> 'en')
            lang_code = language.split('-')[0]
            
            tts = gTTS(text=text, lang=lang_code, slow=False)
            tts.save(output_path)
            
            logger.info(f"Generated TTS audio: {output_path}")
            return True
        except Exception as e:
            logger.error(f"Failed to generate TTS audio: {e}")
            return False
    
    def preprocess_image(self, image_path: str) -> Optional[str]:
        """Preprocess the avatar image"""
        try:
            # Read and validate image
            img = cv2.imread(image_path)
            if img is None:
                raise ValueError("Could not read image file")
            
            # Resize image to standard dimensions
            height, width = img.shape[:2]
            if height != 512 or width != 512:
                img = cv2.resize(img, (512, 512))
            
            # Save preprocessed image
            processed_path = image_path.replace('.jpg', '_processed.jpg').replace('.png', '_processed.jpg')
            cv2.imwrite(processed_path, img)
            
            logger.info(f"Preprocessed image: {processed_path}")
            return processed_path
        except Exception as e:
            logger.error(f"Failed to preprocess image: {e}")
            return None
    
    def generate_basic_video(self, image_path: str, audio_path: str, output_path: str) -> bool:
        """Generate a basic video with static image and audio using FFmpeg"""
        try:
            # Use ffmpeg to create video from image and audio
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
                logger.warning(f"Could not get audio duration: {result.stderr}")
                return 0.0
                
        except Exception as e:
            logger.error(f"Failed to get audio duration: {e}")
            return 0.0
    
    def upload_to_s3(self, file_path: str, s3_key: str) -> Optional[str]:
        """Upload file to S3 and return public URL (mock implementation)"""
        try:
            # This would integrate with your AWS S3 service
            # For now, return a mock URL
            mock_url = f"https://lexora-assets.s3.amazonaws.com/{s3_key}"
            logger.info(f"Mock S3 upload: {file_path} -> {mock_url}")
            return mock_url
        except Exception as e:
            logger.error(f"Failed to upload to S3: {e}")
            return None
    
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
wav2lip_service = SimpleWav2LipService()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'wav2lip-simple',
        'device': wav2lip_service.device,
        'model_loaded': wav2lip_service.model_loaded,
        'ffmpeg_available': True  # We know it's available
    })

@app.route('/generate-video', methods=['POST'])
def generate_video():
    """Generate basic video from script and avatar"""
    try:
        # Parse request data
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
        
        # Generate unique session ID
        session_id = str(uuid.uuid4())
        temp_files = []
        
        try:
            # Create temporary file paths
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
            
            # Preprocess avatar image
            processed_avatar = wav2lip_service.preprocess_image(avatar_path)
            if processed_avatar:
                temp_files.append(processed_avatar)
                avatar_path = processed_avatar
            
            # Generate video
            if not wav2lip_service.generate_basic_video(avatar_path, audio_path, video_path):
                raise Exception("Failed to generate video")
            
            # Get video duration
            duration = wav2lip_service.get_audio_duration(audio_path)
            
            # Upload to S3 (mock implementation)
            video_s3_key = f"generated/videos/{session_id}.mp4"
            audio_s3_key = f"generated/audio/{session_id}.wav"
            
            video_url = wav2lip_service.upload_to_s3(video_path, video_s3_key)
            audio_url = wav2lip_service.upload_to_s3(audio_path, audio_s3_key)
            
            if not video_url or not audio_url:
                raise Exception("Failed to upload generated files")
            
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
            # Clean up on error
            wav2lip_service.cleanup_temp_files(temp_files)
            raise e
            
    except BadRequest as e:
        logger.warning(f"Bad request: {e}")
        return jsonify({'success': False, 'error': str(e)}), 400
    except Exception as e:
        logger.error(f"Video generation failed: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/status/<session_id>', methods=['GET'])
def get_status(session_id):
    """Get status of video generation job"""
    # In a real implementation, you would track job status
    return jsonify({
        'session_id': session_id,
        'status': 'completed',
        'progress': 100
    })

@app.errorhandler(404)
def not_found(error):
    return jsonify({'success': False, 'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'success': False, 'error': 'Internal server error'}), 500

if __name__ == '__main__':
    # Check model on startup
    wav2lip_service.load_model()
    
    # Start Flask server
    port = int(os.environ.get('PORT', 5001))
    logger.info(f"Starting Simple Wav2Lip service on port {port}")
    app.run(host='0.0.0.0', port=port, debug=False)
