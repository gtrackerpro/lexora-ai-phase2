# API Configuration Guide

This guide explains how to configure the required API keys for the Lexora AI Tutor application.

## Required API Keys

### 1. ElevenLabs API Key
- **Purpose**: Text-to-speech (TTS) functionality
- **How to get**: Sign up at [ElevenLabs.io](https://elevenlabs.io)
- **Configuration**: Set `ELEVENLABS_API_KEY` in your `.env` file

### 2. D-ID API Key
- **Purpose**: Avatar video generation
- **How to get**: Sign up at [D-ID.com](https://www.d-id.com)
- **Configuration**: Set `D_ID_API_KEY` in your `.env` file
- **Note**: Requires credits to generate videos

### 3. AWS Credentials
- **Purpose**: File storage (S3)
- **How to get**: Create an AWS account and set up S3
- **Configuration**: Set `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`

### 4. MongoDB URI
- **Purpose**: Database connection
- **How to get**: Use MongoDB Atlas or local MongoDB
- **Configuration**: Set `MONGODB_URI`

## Environment Variables Setup

1. Copy the `.env` file template in the root directory
2. Replace placeholder values with your actual API keys:

```env
# ElevenLabs Configuration
ELEVENLABS_API_KEY=your_actual_elevenlabs_api_key_here

# D-ID Configuration
D_ID_API_KEY=your_actual_d_id_api_key_here

# AWS Configuration
AWS_ACCESS_KEY_ID=your_actual_aws_access_key_here
AWS_SECRET_ACCESS_KEY=your_actual_aws_secret_key_here

# MongoDB
MONGODB_URI=your_actual_mongodb_connection_string_here
```

## Development Mode

The application includes a development mode that handles missing API keys gracefully:

- **Mock Responses**: When API keys are missing, the system returns mock responses
- **No Failures**: Video generation and TTS will not fail completely in dev mode
- **Configuration Check**: Visit `/api/config/status` to see which services are configured

## Troubleshooting

### Common Issues:

1. **ElevenLabs Voice ID Error**:
   - Ensure your ElevenLabs API key is valid
   - Check that voice IDs are properly mapped in the database

2. **D-ID Insufficient Credits**:
   - Check your D-ID account balance
   - Purchase additional credits if needed

3. **AWS S3 Upload Errors**:
   - Verify AWS credentials are correct
   - Ensure S3 bucket exists and is accessible

### Health Check Endpoints:

- `/api/health` - General API health
- `/api/config/status` - Configuration status
- `/api/videos/did/health` - D-ID service health

## Voice ID Mapping

The system automatically handles voice ID mapping:
- MongoDB ObjectIDs are resolved to actual ElevenLabs voice IDs
- Default voice is used if resolution fails
- Voice cloning creates new ElevenLabs voices with stored IDs

## Production Deployment

For production deployment:
1. Set `NODE_ENV=production`
2. All API keys must be properly configured
3. The system will fail if required keys are missing

## Support

If you encounter issues:
1. Check the configuration status endpoint
2. Verify API key validity
3. Check service-specific health endpoints
4. Review server logs for detailed error messages
