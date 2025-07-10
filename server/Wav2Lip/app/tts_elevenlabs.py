import os
import requests

def generate_audio_elevenlabs(script, output_path, voice_id="21m00Tcm4TlvDq8ikWAM"):
    api_key = os.getenv("ELEVENLABS_API_KEY")
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
    headers = {
        "xi-api-key": api_key,
        "Content-Type": "application/json"
    }
    payload = {
        "text": script,
        "voice_settings": {"stability": 0.5, "similarity_boost": 0.7}
    }

    response = requests.post(url, headers=headers, json=payload)
    if response.status_code == 200:
        with open(output_path, 'wb') as f:
            f.write(response.content)
        return True
    else:
        raise Exception(f"ElevenLabs TTS failed: {response.text}")
