# Wav2Lip Video Generation Service

This service provides AI-powered lip-sync video generation using the Wav2Lip model. It's designed as a microservice that can be called from the main Lexora backend to generate personalized avatar videos.

## Features

- **Lip-sync Video Generation**: Generate videos where avatars speak provided text with realistic lip movements
- **Text-to-Speech Integration**: Convert text scripts to natural-sounding speech
- **Multiple Voice Options**: Support for different languages and voice characteristics
- **Docker Containerized**: Easy deployment and scaling
- **RESTful API**: Simple HTTP endpoints for integration
- **Health Monitoring**: Built-in health checks and status monitoring

## Prerequisites

- Docker and Docker Compose
- At least 4GB RAM (8GB recommended for GPU acceleration)
- NVIDIA GPU (optional, for faster processing)

## Quick Start

1. **Navigate to the Wav2Lip directory**:
   ```bash
   cd server/Wav2Lip
   ```

2. **Make the run script executable**:
   ```bash
   chmod +x run.sh
   ```

3. **Download Wav2Lip models** (required for full functionality):
   ```bash
   ./run.sh models
   ```
   
   Follow the instructions to download the official Wav2Lip model files.

4. **Build and run the service**:
   ```bash
   ./run.sh run
   ```

5. **Check service health**:
   ```bash
   ./run.sh health
   ```

The service will be available at `http://localhost:5001`

## API Endpoints

### Health Check
```http
GET /health
```

Returns service status and configuration.

**Response**:
```json
{
  "status": "healthy",
  "service": "wav2lip",
  "device": "cuda",
  "model_loaded": true
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
    "language": "en-US",
    "speed": 1.0,
    "pitch": 0
  },
  "lesson_id": "lesson_123"
}
```

**Response**:
```json
{
  "success": true,
  "video_url": "https://s3.amazonaws.com/generated/videos/session_id.mp4",
  "audio_url": "https://s3.amazonaws.com/generated/audio/session_id.wav",
  "duration": 45.2,
  "session_id": "uuid-session-id"
}
```

### Get Status
```http
GET /status/{session_id}
```

Check the status of a video generation job.

**Response**:
```json
{
  "session_id": "uuid-session-id",
  "status": "completed",
  "progress": 100
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