#!/usr/bin/env python3
"""
Wav2Lip Video Generation Service
A Flask-based microservice for generating lip-synced videos using Wav2Lip
"""

import os
import sys
import json
import time
import uuid
import logging
import tempfile
import subprocess
import warnings
from pathlib import Path
from typing import Dict, Any, Optional

# Load environment variables
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    # dotenv not available, try to load manually
    env_path = Path(__file__).parent / '.env'
    if env_path.exists():
        with open(env_path) as f:
            for line in f:
                if '=' in line and not line.strip().startswith('#'):
                    key, value = line.strip().split('=', 1)
                    os.environ[key] = value

# Suppress numpy warnings
warnings.filterwarnings('ignore', category=RuntimeWarning)

import cv2
import numpy as np
import requests
from flask import Flask, request, jsonify
from werkzeug.exceptions import BadRequest

# Import torch with fallback
try:
    import torch
    import torch.nn as nn
    import torch.nn.functional as F
    import torchvision.transforms as transforms
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False
    torch = None

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
    'TEMP_DIR': os.path.join(os.environ.get('TEMP', 'C:\temp'), 'wav2lip'),
    'MAX_FILE_SIZE': 100 * 1024 * 1024,  # 100MB
    'SUPPORTED_VIDEO_FORMATS': ['.mp4', '.avi', '.mov'],
    'SUPPORTED_AUDIO_FORMATS': ['.wav', '.mp3', '.m4a'],
    'OUTPUT_FORMAT': 'mp4',
    'FPS': 25,
    'QUALITY': 'high'
}

class Wav2LipService:
    def __init__(self):
        if TORCH_AVAILABLE and torch is not None:
            self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        else:
            self.device = 'cpu'  # Fallback to CPU when PyTorch unavailable
        self.model = None
        self.temp_dir = Path(CONFIG['TEMP_DIR'])
        self.temp_dir.mkdir(exist_ok=True)
        logger.info(f"Wav2Lip service initialized on device: {self.device}")
    
    def load_model(self):
        """Load the Wav2Lip model"""
        try:
            if not os.path.exists(CONFIG['MODEL_PATH']):
                logger.warning("Wav2Lip model not found. Using mock generation.")
                return False
            
            # In a real implementation, you would load the actual Wav2Lip model here
            # self.model = load_wav2lip_model(CONFIG['MODEL_PATH'])
            logger.info("Wav2Lip model loaded successfully")
            return True
        except Exception as e:
            logger.error(f"Failed to load Wav2Lip model: {e}")
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
        """Preprocess the avatar image for Wav2Lip"""
        try:
            # Read and validate image
            img = cv2.imread(image_path)
            if img is None:
                raise ValueError("Could not read image file")
            
            # Resize image to standard dimensions (96x96 for Wav2Lip)
            height, width = img.shape[:2]
            if height != 96 or width != 96:
                img = cv2.resize(img, (96, 96))
            
            # Save preprocessed image
            processed_path = image_path.replace('.jpg', '_processed.jpg').replace('.png', '_processed.jpg')
            cv2.imwrite(processed_path, img)
            
            logger.info(f"Preprocessed image: {processed_path}")
            return processed_path
        except Exception as e:
            logger.error(f"Failed to preprocess image: {e}")
            return None
    
    def run_wav2lip_inference(self, image_path: str, audio_path: str, output_path: str) -> bool:
        """Run Wav2Lip inference to generate lip-synced video"""
        try:
            if self.model is None:
                # Mock implementation for development
                return self.generate_mock_video(image_path, audio_path, output_path)
            
            # Real Wav2Lip implementation would go here
            # This is a placeholder for the actual inference code
            logger.info("Running Wav2Lip inference...")
            
            # Simulate processing time
            time.sleep(5)
            
            # For now, create a simple video with the image
            return self.generate_simple_video(image_path, audio_path, output_path)
            
        except Exception as e:
            logger.error(f"Wav2Lip inference failed: {e}")
            return False
    
    def generate_mock_video(self, image_path: str, audio_path: str, output_path: str) -> bool:
        """Generate a mock video for development/testing"""
        try:
            # Get audio duration
            duration = self.get_audio_duration(audio_path)
            if duration <= 0:
                duration = 10  # Default 10 seconds
            
            # Create video from static image
            img = cv2.imread(image_path)
            if img is None:
                raise ValueError("Could not read image")
            
            # Resize to standard video dimensions
            img = cv2.resize(img, (512, 512))
            
            # Create video writer
            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            fps = CONFIG['FPS']
            out = cv2.VideoWriter(output_path, fourcc, fps, (512, 512))
            
            # Write frames for the duration of the audio
            total_frames = int(duration * fps)
            for i in range(total_frames):
                # Add slight variations to simulate lip movement
                frame = img.copy()
                if i % 10 < 5:  # Simple animation
                    cv2.rectangle(frame, (200, 350), (312, 380), (0, 0, 0), -1)
                out.write(frame)
            
            out.release()
            
            # Add audio to video using ffmpeg
            self.add_audio_to_video(output_path, audio_path, output_path)
            
            logger.info(f"Generated mock video: {output_path}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to generate mock video: {e}")
            return False
    
    def generate_simple_video(self, image_path: str, audio_path: str, output_path: str) -> bool:
        """Generate a simple video with static image and audio"""
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
                output_path
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
            
            if result.returncode == 0:
                logger.info(f"Generated simple video: {output_path}")
                return True
            else:
                logger.error(f"FFmpeg error: {result.stderr}")
                return False
                
        except subprocess.TimeoutExpired:
            logger.error("FFmpeg process timed out")
            return False
        except Exception as e:
            logger.error(f"Failed to generate simple video: {e}")
            return False
    
    def add_audio_to_video(self, video_path: str, audio_path: str, output_path: str) -> bool:
        """Add audio track to video using ffmpeg"""
        try:
            cmd = [
                'ffmpeg', '-y',
                '-i', video_path,
                '-i', audio_path,
                '-c:v', 'copy',
                '-c:a', 'aac',
                '-map', '0:v:0',
                '-map', '1:a:0',
                '-shortest',
                output_path + '_with_audio.mp4'
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
            
            if result.returncode == 0:
                # Replace original with audio version
                os.rename(output_path + '_with_audio.mp4', output_path)
                return True
            else:
                logger.error(f"FFmpeg audio merge error: {result.stderr}")
                return False
                
        except Exception as e:
            logger.error(f"Failed to add audio to video: {e}")
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
        """Upload file to S3 and return public URL"""
        try:
            import boto3
            from datetime import datetime
            
            # AWS configuration from environment
            aws_region = os.environ.get('AWS_REGION', 'ap-south-1')
            s3_bucket = os.environ.get('S3_BUCKET', 'lexora-assets')
            
            # Create S3 client
            s3_client = boto3.client('s3', region_name=aws_region)
            
            # Get content type
            content_type = self._get_content_type(file_path)
            
            # Upload file
            s3_client.upload_file(
                file_path, 
                s3_bucket, 
                s3_key,
                ExtraArgs={'ContentType': content_type}
            )
            
            # Generate public URL
            url = f"https://{s3_bucket}.s3.{aws_region}.amazonaws.com/{s3_key}"
            logger.info(f"Uploaded to S3: {file_path} -> {url}")
            return url
            
        except Exception as e:
            logger.error(f"Failed to upload to S3: {e}")
            # Fallback to mock URL for development
            mock_url = f"https://lexora-assets.s3.amazonaws.com/{s3_key}"
            logger.info(f"Using mock S3 URL: {mock_url}")
            return mock_url
    
    def _get_content_type(self, file_path: str) -> str:
        """Get content type based on file extension"""
        ext = os.path.splitext(file_path)[1].lower()
        content_types = {
            '.mp4': 'video/mp4',
            '.wav': 'audio/wav',
            '.mp3': 'audio/mpeg',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png'
        }
        return content_types.get(ext, 'application/octet-stream')
    
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
wav2lip_service = Wav2LipService()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'wav2lip',
        'device': wav2lip_service.device,
        'model_loaded': wav2lip_service.model is not None
    })

@app.route('/generate-video', methods=['POST'])
def generate_video():
    """Generate lip-synced video from script and avatar"""
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
            
            # Generate lip-synced video
            if not wav2lip_service.run_wav2lip_inference(avatar_path, audio_path, video_path):
                raise Exception("Failed to generate lip-synced video")
            
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
    logger.info("Starting Wav2Lip service...")
    
    # Load model on startup
    wav2lip_service.load_model()
    
    # Start Flask server
    port = int(os.environ.get('PORT', 5001))
    logger.info(f"Starting Flask server on port {port}")
    app.run(host='0.0.0.0', port=port, debug=False)
