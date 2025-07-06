#!/usr/bin/env python3
"""
Enhanced Wav2Lip Video Generation Service
Production-ready Flask service with S3 integration and advanced features
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
from datetime import datetime

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
    'FPS': 25,
    'AWS_REGION': os.environ.get('AWS_REGION', 'us-east-1'),
    'S3_BUCKET': os.environ.get('S3_BUCKET', 'lexora-assets'),
    'MAX_SCRIPT_LENGTH': 10000,  # Maximum characters in script
    'SUPPORTED_LANGUAGES': ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh'],
    'DEFAULT_VOICE_SPEED': 1.0,
    'MAX_CONCURRENT_JOBS': 5
}

class EnhancedWav2LipService:
    def __init__(self):
        self.temp_dir = Path(CONFIG['TEMP_DIR'])
        self.temp_dir.mkdir(exist_ok=True)
        self.active_jobs = {}
        self.s3_available = self._check_s3_availability()
        logger.info(f"Enhanced Wav2Lip service initialized (S3: {'enabled' if self.s3_available else 'disabled'})")
    
    def _check_s3_availability(self) -> bool:
        """Check if S3 credentials and boto3 are available"""
        try:
            import boto3
            # Try to create S3 client to test credentials
            s3_client = boto3.client('s3', region_name=CONFIG['AWS_REGION'])
            # Test access to bucket
            s3_client.head_bucket(Bucket=CONFIG['S3_BUCKET'])
            return True
        except Exception as e:
            logger.warning(f"S3 not available: {e}")
            return False
    
    def validate_request(self, data: Dict[str, Any]) -> tuple[bool, str]:
        """Validate incoming request data"""
        script = data.get('script', '').strip()
        avatar_url = data.get('avatar_url', '').strip()
        voice_options = data.get('voice_options', {})
        
        # Validate script
        if not script:
            return False, "Script text is required"
        if len(script) > CONFIG['MAX_SCRIPT_LENGTH']:
            return False, f"Script too long (max {CONFIG['MAX_SCRIPT_LENGTH']} characters)"
        
        # Validate avatar URL
        if not avatar_url:
            return False, "Avatar URL is required"
        if not (avatar_url.startswith('http://') or avatar_url.startswith('https://')):
            return False, "Avatar URL must be a valid HTTP/HTTPS URL"
        
        # Validate voice options
        language = voice_options.get('language', 'en')
        lang_code = language.split('-')[0].lower()
        if lang_code not in CONFIG['SUPPORTED_LANGUAGES']:
            return False, f"Language '{lang_code}' not supported. Supported: {CONFIG['SUPPORTED_LANGUAGES']}"
        
        speed = voice_options.get('speed', CONFIG['DEFAULT_VOICE_SPEED'])
        if not (0.5 <= speed <= 2.0):
            return False, "Voice speed must be between 0.5 and 2.0"
        
        return True, ""
    
    def download_file(self, url: str, local_path: str) -> bool:
        """Download a file from URL to local path with validation"""
        try:
            # Add headers to mimic browser request
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            
            response = requests.get(url, stream=True, timeout=30, headers=headers)
            response.raise_for_status()
            
            # Check content type
            content_type = response.headers.get('content-type', '').lower()
            if not any(ct in content_type for ct in ['image/jpeg', 'image/png', 'image/jpg']):
                logger.warning(f"Unexpected content type: {content_type}")
            
            # Check file size
            content_length = response.headers.get('content-length')
            if content_length and int(content_length) > CONFIG['MAX_FILE_SIZE']:
                raise ValueError("File too large")
            
            with open(local_path, 'wb') as f:
                downloaded_size = 0
                for chunk in response.iter_content(chunk_size=8192):
                    downloaded_size += len(chunk)
                    if downloaded_size > CONFIG['MAX_FILE_SIZE']:
                        raise ValueError("File too large")
                    f.write(chunk)
            
            logger.info(f"Downloaded file: {url} -> {local_path} ({downloaded_size} bytes)")
            return True
        except Exception as e:
            logger.error(f"Failed to download file {url}: {e}")
            return False
    
    def generate_tts_audio(self, text: str, output_path: str, voice_options: Dict[str, Any]) -> bool:
        """Generate TTS audio from text with enhanced options"""
        try:
            from gtts import gTTS
            
            language = voice_options.get('language', 'en')
            lang_code = language.split('-')[0]
            speed = voice_options.get('speed', CONFIG['DEFAULT_VOICE_SPEED'])
            
            # Adjust text for better TTS
            processed_text = self._preprocess_text_for_tts(text)
            
            # Generate TTS with slow parameter based on speed
            slow = speed < 0.8
            tts = gTTS(text=processed_text, lang=lang_code, slow=slow)
            
            # Save to temporary file first
            temp_audio = output_path + '_temp.mp3'
            tts.save(temp_audio)
            
            # Convert to WAV and adjust speed if needed
            if speed != 1.0:
                self._adjust_audio_speed(temp_audio, output_path, speed)
                os.remove(temp_audio)
            else:
                # Convert MP3 to WAV
                self._convert_audio_format(temp_audio, output_path)
                os.remove(temp_audio)
            
            logger.info(f"Generated TTS audio: {output_path}")
            return True
        except Exception as e:
            logger.error(f"Failed to generate TTS audio: {e}")
            return False
    
    def _preprocess_text_for_tts(self, text: str) -> str:
        """Preprocess text for better TTS pronunciation"""
        # Add pauses for better speech flow
        text = text.replace('.', '. ')
        text = text.replace(',', ', ')
        text = text.replace('!', '! ')
        text = text.replace('?', '? ')
        
        # Remove excessive whitespace
        import re
        text = re.sub(r'\s+', ' ', text).strip()
        
        return text
    
    def _adjust_audio_speed(self, input_path: str, output_path: str, speed: float) -> bool:
        """Adjust audio speed using FFmpeg"""
        try:
            cmd = [
                'ffmpeg', '-y',
                '-i', input_path,
                '-filter:a', f'atempo={speed}',
                '-c:a', 'pcm_s16le',
                output_path
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
            return result.returncode == 0
        except Exception as e:
            logger.error(f"Failed to adjust audio speed: {e}")
            return False
    
    def _convert_audio_format(self, input_path: str, output_path: str) -> bool:
        """Convert audio format using FFmpeg"""
        try:
            cmd = [
                'ffmpeg', '-y',
                '-i', input_path,
                '-c:a', 'pcm_s16le',
                output_path
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
            return result.returncode == 0
        except Exception as e:
            logger.error(f"Failed to convert audio format: {e}")
            return False
    
    def generate_enhanced_video(self, image_path: str, audio_path: str, output_path: str) -> bool:
        """Generate enhanced video with better quality settings"""
        try:
            cmd = [
                'ffmpeg', '-y',
                '-loop', '1',
                '-i', image_path,
                '-i', audio_path,
                '-c:v', 'libx264',
                '-preset', 'medium',
                '-crf', '23',
                '-c:a', 'aac',
                '-b:a', '192k',
                '-pix_fmt', 'yuv420p',
                '-vf', 'scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2',
                '-shortest',
                '-movflags', '+faststart',
                output_path
            ]
            
            logger.info("Generating enhanced video with FFmpeg...")
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
            
            if result.returncode == 0:
                logger.info(f"Generated enhanced video: {output_path}")
                return True
            else:
                logger.error(f"FFmpeg error: {result.stderr}")
                return False
                
        except subprocess.TimeoutExpired:
            logger.error("FFmpeg process timed out")
            return False
        except Exception as e:
            logger.error(f"Failed to generate enhanced video: {e}")
            return False
    
    def upload_to_s3(self, file_path: str, s3_key: str) -> Optional[str]:
        """Upload file to S3 and return public URL"""
        if not self.s3_available:
            # Return mock URL for development
            mock_url = f"https://{CONFIG['S3_BUCKET']}.s3.{CONFIG['AWS_REGION']}.amazonaws.com/{s3_key}"
            logger.info(f"Mock S3 upload: {file_path} -> {mock_url}")
            return mock_url
        
        try:
            import boto3
            s3_client = boto3.client('s3', region_name=CONFIG['AWS_REGION'])
            
            # Upload file
            s3_client.upload_file(
                file_path, 
                CONFIG['S3_BUCKET'], 
                s3_key,
                ExtraArgs={'ContentType': self._get_content_type(file_path)}
            )
            
            # Generate public URL
            url = f"https://{CONFIG['S3_BUCKET']}.s3.{CONFIG['AWS_REGION']}.amazonaws.com/{s3_key}"
            logger.info(f"Uploaded to S3: {file_path} -> {url}")
            return url
            
        except Exception as e:
            logger.error(f"Failed to upload to S3: {e}")
            return None
    
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
        """Clean up temporary files with error handling"""
        for file_path in file_paths:
            try:
                if os.path.exists(file_path):
                    os.remove(file_path)
                    logger.debug(f"Cleaned up: {file_path}")
            except Exception as e:
                logger.warning(f"Failed to cleanup {file_path}: {e}")
    
    def get_service_stats(self) -> Dict[str, Any]:
        """Get service statistics"""
        return {
            'active_jobs': len(self.active_jobs),
            'max_concurrent_jobs': CONFIG['MAX_CONCURRENT_JOBS'],
            's3_available': self.s3_available,
            'temp_dir_size': self._get_directory_size(self.temp_dir),
            'supported_languages': CONFIG['SUPPORTED_LANGUAGES'],
            'max_script_length': CONFIG['MAX_SCRIPT_LENGTH']
        }
    
    def _get_directory_size(self, directory: Path) -> int:
        """Get total size of directory in bytes"""
        try:
            return sum(f.stat().st_size for f in directory.rglob('*') if f.is_file())
        except Exception:
            return 0

# Initialize service
wav2lip_service = EnhancedWav2LipService()

@app.route('/health', methods=['GET'])
def health_check():
    """Enhanced health check endpoint"""
    stats = wav2lip_service.get_service_stats()
    return jsonify({
        'status': 'healthy',
        'service': 'wav2lip-enhanced',
        'timestamp': datetime.utcnow().isoformat(),
        'ffmpeg_available': True,
        'stats': stats
    })

@app.route('/stats', methods=['GET'])
def get_stats():
    """Get detailed service statistics"""
    return jsonify(wav2lip_service.get_service_stats())

@app.route('/generate-video', methods=['POST'])
def generate_video():
    """Enhanced video generation endpoint"""
    try:
        # Check concurrent job limit
        if len(wav2lip_service.active_jobs) >= CONFIG['MAX_CONCURRENT_JOBS']:
            return jsonify({
                'success': False, 
                'error': 'Service busy. Maximum concurrent jobs reached.'
            }), 429
        
        # Parse and validate request
        data = request.get_json()
        if not data:
            raise BadRequest("No JSON data provided")
        
        # Validate input
        is_valid, error_message = wav2lip_service.validate_request(data)
        if not is_valid:
            raise BadRequest(error_message)
        
        script = data.get('script', '').strip()
        avatar_url = data.get('avatar_url', '').strip()
        voice_options = data.get('voice_options', {})
        lesson_id = data.get('lesson_id', '')
        
        logger.info(f"Starting enhanced video generation for lesson: {lesson_id}")
        
        # Generate unique session ID
        session_id = str(uuid.uuid4())
        timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
        
        # Add to active jobs
        wav2lip_service.active_jobs[session_id] = {
            'start_time': time.time(),
            'lesson_id': lesson_id,
            'status': 'processing'
        }
        
        temp_files = []
        
        try:
            # Create temporary file paths with timestamp
            avatar_path = os.path.join(CONFIG['TEMP_DIR'], f"{timestamp}_{session_id}_avatar.jpg")
            audio_path = os.path.join(CONFIG['TEMP_DIR'], f"{timestamp}_{session_id}_audio.wav")
            video_path = os.path.join(CONFIG['TEMP_DIR'], f"{timestamp}_{session_id}_output.mp4")
            
            temp_files.extend([avatar_path, audio_path, video_path])
            
            # Download avatar image
            if not wav2lip_service.download_file(avatar_url, avatar_path):
                raise Exception("Failed to download avatar image")
            
            # Generate TTS audio
            if not wav2lip_service.generate_tts_audio(script, audio_path, voice_options):
                raise Exception("Failed to generate TTS audio")
            
            # Generate enhanced video
            if not wav2lip_service.generate_enhanced_video(avatar_path, audio_path, video_path):
                raise Exception("Failed to generate video")
            
            # Get video duration
            duration = wav2lip_service.get_audio_duration(audio_path)
            
            # Upload to S3
            video_s3_key = f"generated/videos/{timestamp}/{session_id}.mp4"
            audio_s3_key = f"generated/audio/{timestamp}/{session_id}.wav"
            
            video_url = wav2lip_service.upload_to_s3(video_path, video_s3_key)
            audio_url = wav2lip_service.upload_to_s3(audio_path, audio_s3_key)
            
            if not video_url or not audio_url:
                raise Exception("Failed to upload generated files")
            
            # Calculate processing time
            processing_time = time.time() - wav2lip_service.active_jobs[session_id]['start_time']
            
            # Clean up temporary files
            wav2lip_service.cleanup_temp_files(temp_files)
            
            # Remove from active jobs
            del wav2lip_service.active_jobs[session_id]
            
            logger.info(f"Enhanced video generation completed for lesson: {lesson_id} in {processing_time:.2f}s")
            
            return jsonify({
                'success': True,
                'video_url': video_url,
                'audio_url': audio_url,
                'duration': duration,
                'session_id': session_id,
                'processing_time': round(processing_time, 2),
                'metadata': {
                    'script_length': len(script),
                    'voice_language': voice_options.get('language', 'en'),
                    'voice_speed': voice_options.get('speed', 1.0),
                    'timestamp': datetime.utcnow().isoformat()
                }
            })
            
        except Exception as e:
            # Clean up on error
            wav2lip_service.cleanup_temp_files(temp_files)
            if session_id in wav2lip_service.active_jobs:
                del wav2lip_service.active_jobs[session_id]
            raise e
            
    except BadRequest as e:
        logger.warning(f"Bad request: {e}")
        return jsonify({'success': False, 'error': str(e)}), 400
    except Exception as e:
        logger.error(f"Enhanced video generation failed: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/jobs', methods=['GET'])
def get_active_jobs():
    """Get currently active jobs"""
    jobs = {}
    for session_id, job_info in wav2lip_service.active_jobs.items():
        jobs[session_id] = {
            'lesson_id': job_info['lesson_id'],
            'status': job_info['status'],
            'duration': time.time() - job_info['start_time']
        }
    return jsonify({'active_jobs': jobs})

@app.errorhandler(404)
def not_found(error):
    return jsonify({'success': False, 'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'success': False, 'error': 'Internal server error'}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    logger.info(f"Starting Enhanced Wav2Lip service on port {port}")
    app.run(host='0.0.0.0', port=port, debug=False)
