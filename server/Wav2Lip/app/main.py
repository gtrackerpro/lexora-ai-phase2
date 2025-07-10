from flask import Flask, request, jsonify
from tts_elevenlabs import generate_audio_elevenlabs
from video_sadtalker import generate_video_with_sadtalker
from aws_service import aws_service
import os
import uuid
import requests
import tempfile
from urllib.parse import urlparse

app = Flask(__name__)
OUTPUT_DIR = "static/generated"
os.makedirs(OUTPUT_DIR, exist_ok=True)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "message": "Wav2Lip service is running"})

@app.route('/generate-video', methods=['POST'])
def generate_video():
    try:
        data = request.get_json()
        script = data.get("script", "")
        avatar_url = data.get("avatar_url", "")
        voice_options = data.get("voice_options", {})
        lesson_id = data.get("lesson_id", "")
        lesson_title = data.get("lesson_title", "")

        if not script or not avatar_url:
            return jsonify({"error": "Script and avatar_url are required"}), 400

        session_id = str(uuid.uuid4())
        audio_path = f"{OUTPUT_DIR}/{session_id}.mp3"
        image_path = f"{OUTPUT_DIR}/{session_id}.jpg"
        video_output_path = f"{OUTPUT_DIR}/{session_id}.mp4"

        # Step 1: Download avatar
        print(f"Downloading avatar from: {avatar_url}")
        img_data = requests.get(avatar_url).content
        with open(image_path, 'wb') as f:
            f.write(img_data)

        # Step 2: Handle voice cloning and TTS
        voice_sample_url = voice_options.get('voice_sample_url')
        if voice_sample_url:
            # Clone voice from uploaded sample
            print(f"Cloning voice from sample: {voice_sample_url}")
            voice_id = clone_voice_from_sample(voice_sample_url, f"user_voice_{session_id}")
            if voice_id:
                print(f"Voice cloned successfully: {voice_id}")
                generate_audio_elevenlabs(script, audio_path, voice_id)
            else:
                print("Voice cloning failed, using default voice")
                generate_audio_elevenlabs(script, audio_path)
        else:
            # Use default voice
            print("Using default voice for TTS")
            generate_audio_elevenlabs(script, audio_path)

        # Step 3: SadTalker video generation
        print(f"Generating video with audio: {audio_path} and image: {image_path}")
        video_generated = generate_video_with_sadtalker(audio_path, image_path, video_output_path)
        
        if not video_generated:
            return jsonify({"error": "Video generation failed"}), 500

        # Step 4: Upload to S3
        print(f"Uploading files to S3...")
        s3_video_url = aws_service.upload_video(video_output_path, session_id)
        s3_audio_url = aws_service.upload_audio(audio_path, session_id)
        
        # Use S3 URLs if upload was successful, otherwise fall back to local URLs
        final_video_url = s3_video_url if s3_video_url else f"/{video_output_path}"
        final_audio_url = s3_audio_url if s3_audio_url else f"/{audio_path}"
        
        # Clean up local files after S3 upload (optional)
        try:
            if s3_video_url and os.path.exists(video_output_path):
                os.remove(video_output_path)
            if s3_audio_url and os.path.exists(audio_path):
                os.remove(audio_path)
            if os.path.exists(image_path):
                os.remove(image_path)
        except Exception as e:
            print(f"Warning: Failed to clean up local files: {e}")

        # Calculate approximate duration (rough estimate)
        duration = len(script) / 150  # ~150 characters per minute of speech

        return jsonify({
            "success": True,
            "video_url": final_video_url,
            "audio_url": final_audio_url,
            "session_id": session_id,
            "duration": duration,
            "s3_upload": {
                "video": s3_video_url is not None,
                "audio": s3_audio_url is not None
            }
        })
    except Exception as e:
        print(f"Video generation error: {e}")
        return jsonify({"error": str(e)}), 500

def clone_voice_from_sample(voice_sample_url, voice_name):
    """
    Clone a voice from an uploaded audio sample using ElevenLabs API
    """
    try:
        api_key = os.getenv("ELEVENLABS_API_KEY")
        if not api_key:
            print("ElevenLabs API key not found")
            return None

        # Download the voice sample
        print(f"Downloading voice sample from: {voice_sample_url}")
        response = requests.get(voice_sample_url)
        if response.status_code != 200:
            print(f"Failed to download voice sample: {response.status_code}")
            return None

        # Save to temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as temp_file:
            temp_file.write(response.content)
            temp_voice_path = temp_file.name

        # Upload to ElevenLabs for voice cloning
        url = "https://api.elevenlabs.io/v1/voices/add"
        headers = {
            "xi-api-key": api_key
        }
        
        with open(temp_voice_path, 'rb') as audio_file:
            files = {
                "files": audio_file
            }
            data = {
                "name": voice_name,
                "description": f"Voice cloned for lesson generation - {voice_name}"
            }

            print(f"Uploading voice to ElevenLabs with name: {voice_name}")
            response = requests.post(url, headers=headers, files=files, data=data)
            
        # Clean up temp file
        os.unlink(temp_voice_path)
        
        if response.status_code == 200:
            voice_data = response.json()
            voice_id = voice_data.get("voice_id")
            print(f"Voice successfully cloned with ID: {voice_id}")
            return voice_id
        else:
            print(f"Voice cloning failed: {response.status_code} - {response.text}")
            return None
            
    except Exception as e:
        print(f"Error in voice cloning: {e}")
        return None

@app.route('/cleanup-voice/<voice_id>', methods=['DELETE'])
def cleanup_voice(voice_id):
    """
    Delete a cloned voice from ElevenLabs to clean up resources
    """
    try:
        api_key = os.getenv("ELEVENLABS_API_KEY")
        if not api_key:
            return jsonify({"error": "API key not found"}), 500

        url = f"https://api.elevenlabs.io/v1/voices/{voice_id}"
        headers = {
            "xi-api-key": api_key
        }
        
        response = requests.delete(url, headers=headers)
        
        if response.status_code == 200:
            return jsonify({"success": True, "message": "Voice deleted successfully"})
        else:
            return jsonify({"error": f"Failed to delete voice: {response.text}"}), response.status_code
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
