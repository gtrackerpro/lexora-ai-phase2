# Wav2Lip AI Video Generation Service

A Python-based microservice that generates AI-powered lip-sync videos using SadTalker technology integrated with ElevenLabs TTS for the Lexora AI tutoring platform. This service converts text scripts into realistic talking avatar videos with synchronized lip movements.

## 🚀 Features

- **AI-Powered Lip Sync**: Generate realistic talking videos using SadTalker technology
- **Advanced Text-to-Speech**: High-quality voice synthesis with ElevenLabs API
- **Voice Cloning**: Custom voice generation from uploaded audio samples
- **Cloud Integration**: AWS S3 storage for generated content
- **RESTful API**: Flask-based HTTP endpoints for easy integration
- **Cross-Platform**: Works on Windows, macOS, and Linux
- **Python Environment Management**: Automatic virtual environment detection
- **Health Monitoring**: Built-in health checks and status monitoring

## 📋 Prerequisites

- **Python 3.8+**: Latest Python version recommended
- **Virtual Environment**: venv, .venv, env, or .env in project root
- **API Keys**: ElevenLabs API key for TTS functionality
- **AWS Credentials**: For S3 upload functionality (optional)
- **System Memory**: At least 4GB RAM (8GB+ recommended)
- **GPU Support**: NVIDIA GPU recommended for faster processing

## 🛠️ Installation & Setup

### 1. Environment Setup

```bash
# Navigate to the Wav2Lip directory
cd server/Wav2Lip

# Create virtual environment (if not exists)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. SadTalker Setup

```bash
# Clone SadTalker repository
git clone https://github.com/OpenTalker/SadTalker.git

# Follow SadTalker installation instructions
# Install PyTorch, torchvision, and required dependencies
# Download pre-trained models as specified in SadTalker documentation
```

### 3. Environment Variables

Create a `.env` file in the project root:

```env
# ElevenLabs API Configuration
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# AWS S3 Configuration (optional)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=ap-south-1
AWS_BUCKET_NAME=lexora-assets

# Service Configuration
FLASK_ENV=production
FLASK_DEBUG=false
```

### 4. Quick Start

```bash
# Start the service using the Python runner
python run.py

# Or run directly
python app/main.py
```

The service will be available at `http://localhost:5001`

## 🔌 API Endpoints

### Health Check
```http
GET /health
```

Returns service status and health information.

**Response**:
```json
{
  "status": "healthy",
  "message": "Wav2Lip service is running"
}
```

### Generate Video
```http
POST /generate-video
```

Generate a lip-synced video from text script and avatar image.

**Request Body**:
```json
{
  "script": "Hello! Welcome to this lesson on Python programming...",
  "avatar_url": "https://example.com/avatar.jpg",
  "voice_options": {
    "voice_sample_url": "https://example.com/voice-sample.mp3"
  },
  "lesson_id": "lesson_123",
  "lesson_title": "Introduction to Python"
}
```

**Response**:
```json
{
  "success": true,
  "video_url": "https://s3.amazonaws.com/generated-videos/video_session_id.mp4",
  "audio_url": "https://s3.amazonaws.com/generated-audios/audio_session_id.mp3",
  "session_id": "uuid-session-id",
  "duration": 45.2,
  "s3_upload": {
    "video": true,
    "audio": true
  }
}
```

### Voice Cleanup
```http
DELETE /cleanup-voice/{voice_id}
```

Delete a cloned voice from ElevenLabs to free up resources.

**Response**:
```json
{
  "success": true,
  "message": "Voice deleted successfully"
}
```

## Configuration

The service can be configured through environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5001` | Service port |
| `MODEL_PATH` | `/app/models/wav2lip_gan.pth` | Path to Wav2Lip model |
| `TEMP_DIR` | `/tmp/wav2lip` | Temporary files directory |
| `MAX_FILE_SIZE` | `100MB` | Maximum upload file size |
| `FPS` | `25` | Output video frame rate |
| `QUALITY` | `high` | Video quality setting |

## Development

### Local Development Setup

1. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Install system dependencies** (Ubuntu/Debian):
   ```bash
   sudo apt-get update
   sudo apt-get install ffmpeg libsm6 libxext6 libxrender-dev libglib2.0-0
   ```

3. **Run the service locally**:
   ```bash
   python main.py
   ```

### Testing the Service

1. **Test health endpoint**:
   ```bash
   curl http://localhost:5001/health
   ```

2. **Test video generation**:
   ```bash
   curl -X POST http://localhost:5001/generate-video \
     -H "Content-Type: application/json" \
     -d '{
       "script": "Hello, this is a test message.",
       "avatar_url": "https://example.com/avatar.jpg",
       "lesson_id": "test_lesson"
     }'
   ```

## Docker Commands

### Using the run script (recommended):
```bash
# Build and run
./run.sh run

# View logs
./run.sh logs

# Stop service
./run.sh stop

# Restart service
./run.sh restart

# Clean up
./run.sh clean
```

### Manual Docker commands:
```bash
# Build image
docker build -t lexora-wav2lip .

# Run container
docker run -d --name lexora-wav2lip-service -p 5001:5001 lexora-wav2lip

# View logs
docker logs -f lexora-wav2lip-service

# Stop container
docker stop lexora-wav2lip-service
```

## Model Setup

### Downloading Wav2Lip Models

1. **Download the pre-trained model**:
   ```bash
   mkdir -p models
   cd models
   
   # Download from official repository
   wget https://github.com/Rudrabha/Wav2Lip/releases/download/v1.0.0/wav2lip_gan.pth
   ```

2. **Verify model file**:
   ```bash
   ls -la models/
   # Should show wav2lip_gan.pth
   ```

### Model Requirements

- **wav2lip_gan.pth**: Main Wav2Lip model (~338MB)
- **face_detection model**: Automatically downloaded by face_recognition library
- **GPU Memory**: 2GB+ VRAM recommended for real-time processing

## Performance Optimization

### GPU Acceleration

To enable GPU acceleration:

1. **Install NVIDIA Docker runtime**:
   ```bash
   # Install nvidia-docker2
   sudo apt-get install nvidia-docker2
   sudo systemctl restart docker
   ```

2. **Run with GPU support**:
   ```bash
   docker run --gpus all -d --name lexora-wav2lip-service -p 5001:5001 lexora-wav2lip
   ```

### Memory Optimization

- **Batch Processing**: Process multiple requests in batches
- **Model Caching**: Keep model loaded in memory
- **Temporary File Cleanup**: Automatic cleanup of processed files

## Troubleshooting

### Common Issues

1. **Service won't start**:
   ```bash
   # Check Docker logs
   docker logs lexora-wav2lip-service
   
   # Check port availability
   netstat -tulpn | grep 5001
   ```

2. **Model loading errors**:
   ```bash
   # Verify model file exists
   ls -la models/wav2lip_gan.pth
   
   # Check file permissions
   chmod 644 models/wav2lip_gan.pth
   ```

3. **Out of memory errors**:
   - Reduce batch size
   - Use CPU instead of GPU
   - Increase Docker memory limits

4. **FFmpeg errors**:
   ```bash
   # Test FFmpeg installation
   docker exec lexora-wav2lip-service ffmpeg -version
   ```

### Debug Mode

Enable debug logging:
```bash
docker run -e FLASK_DEBUG=1 -e LOG_LEVEL=DEBUG lexora-wav2lip
```

## Integration with Lexora Backend

The service is designed to be called from the main Lexora Node.js backend:

```typescript
// In videoService.ts
const response = await axios.post('http://localhost:5001/generate-video', {
  script: lesson.script,
  avatar_url: avatarUrl,
  voice_options: voiceOptions,
  lesson_id: lesson._id
});
```

## Security Considerations

- **Input Validation**: All inputs are validated and sanitized
- **File Size Limits**: Maximum file size restrictions
- **Temporary File Cleanup**: Automatic cleanup prevents disk space issues
- **Network Isolation**: Run in isolated Docker network
- **Non-root User**: Container runs as non-privileged user

## Monitoring and Logging

- **Health Checks**: Built-in health monitoring
- **Structured Logging**: JSON-formatted logs for easy parsing
- **Performance Metrics**: Processing time and resource usage tracking
- **Error Tracking**: Comprehensive error logging and reporting

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This service is part of the Lexora platform and follows the same licensing terms.