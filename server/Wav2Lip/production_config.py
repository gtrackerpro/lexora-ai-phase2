#!/usr/bin/env python3
"""
Production Configuration for Wav2Lip Service
"""

import os
from typing import Dict, Any

class ProductionConfig:
    """Production configuration settings"""
    
    # Service Configuration
    SERVICE_NAME = "lexora-wav2lip"
    VERSION = "1.0.0"
    
    # Server Configuration
    HOST = "0.0.0.0"
    PORT = int(os.environ.get('PORT', 5001))
    DEBUG = False
    
    # AWS Configuration
    AWS_REGION = os.environ.get('AWS_REGION', 'us-east-1')
    S3_BUCKET = os.environ.get('S3_BUCKET', 'lexora-assets')
    AWS_ACCESS_KEY_ID = os.environ.get('AWS_ACCESS_KEY_ID')
    AWS_SECRET_ACCESS_KEY = os.environ.get('AWS_SECRET_ACCESS_KEY')
    
    # Performance Configuration
    MAX_CONCURRENT_JOBS = int(os.environ.get('MAX_CONCURRENT_JOBS', 5))
    MAX_FILE_SIZE = int(os.environ.get('MAX_FILE_SIZE', 100 * 1024 * 1024))  # 100MB
    MAX_SCRIPT_LENGTH = int(os.environ.get('MAX_SCRIPT_LENGTH', 10000))
    REQUEST_TIMEOUT = int(os.environ.get('REQUEST_TIMEOUT', 180))
    
    # Directories
    TEMP_DIR = os.environ.get('TEMP_DIR', '/tmp/wav2lip')
    LOG_DIR = os.environ.get('LOG_DIR', '/var/log/wav2lip')
    
    # Video/Audio Settings
    OUTPUT_FORMAT = 'mp4'
    AUDIO_FORMAT = 'wav'
    VIDEO_FPS = int(os.environ.get('VIDEO_FPS', 25))
    VIDEO_QUALITY = os.environ.get('VIDEO_QUALITY', 'medium')  # low, medium, high
    AUDIO_BITRATE = os.environ.get('AUDIO_BITRATE', '192k')
    
    # Supported Languages
    SUPPORTED_LANGUAGES = [
        'en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh'
    ]
    
    # Logging Configuration
    LOG_LEVEL = os.environ.get('LOG_LEVEL', 'INFO')
    LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    
    # Health Check Configuration
    HEALTH_CHECK_INTERVAL = int(os.environ.get('HEALTH_CHECK_INTERVAL', 30))
    
    # Rate Limiting
    RATE_LIMIT_REQUESTS = int(os.environ.get('RATE_LIMIT_REQUESTS', 100))
    RATE_LIMIT_WINDOW = int(os.environ.get('RATE_LIMIT_WINDOW', 3600))  # 1 hour
    
    @classmethod
    def get_ffmpeg_quality_settings(cls) -> Dict[str, Any]:
        """Get FFmpeg quality settings based on configuration"""
        quality_presets = {
            'low': {
                'preset': 'fast',
                'crf': '28',
                'scale': '256:256'
            },
            'medium': {
                'preset': 'medium',
                'crf': '23',
                'scale': '512:512'
            },
            'high': {
                'preset': 'slow',
                'crf': '18',
                'scale': '1024:1024'
            }
        }
        return quality_presets.get(cls.VIDEO_QUALITY, quality_presets['medium'])
    
    @classmethod
    def validate_config(cls) -> list:
        """Validate production configuration"""
        errors = []
        
        # Check required AWS credentials if S3 is enabled
        if not cls.AWS_ACCESS_KEY_ID or not cls.AWS_SECRET_ACCESS_KEY:
            errors.append("AWS credentials not configured (S3 uploads will be mocked)")
        
        # Check directories
        import pathlib
        try:
            pathlib.Path(cls.TEMP_DIR).mkdir(parents=True, exist_ok=True)
        except Exception as e:
            errors.append(f"Cannot create temp directory {cls.TEMP_DIR}: {e}")
        
        try:
            pathlib.Path(cls.LOG_DIR).mkdir(parents=True, exist_ok=True)
        except Exception as e:
            errors.append(f"Cannot create log directory {cls.LOG_DIR}: {e}")
        
        # Check FFmpeg
        import subprocess
        try:
            subprocess.run(['ffmpeg', '-version'], capture_output=True, timeout=5)
        except Exception:
            errors.append("FFmpeg not found or not working")
        
        try:
            subprocess.run(['ffprobe', '-version'], capture_output=True, timeout=5)
        except Exception:
            errors.append("FFprobe not found or not working")
        
        return errors

class DevelopmentConfig(ProductionConfig):
    """Development configuration settings"""
    DEBUG = True
    LOG_LEVEL = 'DEBUG'
    MAX_CONCURRENT_JOBS = 2
    TEMP_DIR = './temp'
    LOG_DIR = './logs'

class TestingConfig(ProductionConfig):
    """Testing configuration settings"""
    DEBUG = True
    LOG_LEVEL = 'DEBUG'
    MAX_CONCURRENT_JOBS = 1
    MAX_SCRIPT_LENGTH = 1000
    TEMP_DIR = './test_temp'
    LOG_DIR = './test_logs'

# Configuration selector
def get_config() -> ProductionConfig:
    """Get configuration based on environment"""
    env = os.environ.get('FLASK_ENV', 'production').lower()
    
    if env == 'development':
        return DevelopmentConfig()
    elif env == 'testing':
        return TestingConfig()
    else:
        return ProductionConfig()

if __name__ == '__main__':
    # Validate configuration
    config = get_config()
    errors = config.validate_config()
    
    print(f"Configuration: {config.__class__.__name__}")
    print(f"Service: {config.SERVICE_NAME} v{config.VERSION}")
    print(f"Port: {config.PORT}")
    print(f"Debug: {config.DEBUG}")
    print(f"S3 Bucket: {config.S3_BUCKET}")
    print(f"Max Concurrent Jobs: {config.MAX_CONCURRENT_JOBS}")
    
    if errors:
        print("\nConfiguration Issues:")
        for error in errors:
            print(f"  - {error}")
    else:
        print("\n✅ Configuration is valid!")
    
    print(f"\nFFmpeg Quality Settings ({config.VIDEO_QUALITY}):")
    for key, value in config.get_ffmpeg_quality_settings().items():
        print(f"  {key}: {value}")
