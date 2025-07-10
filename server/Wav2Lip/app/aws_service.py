import boto3
import os
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))

class AWSService:
    def __init__(self):
        self.s3_client = boto3.client(
            's3',
            region_name=os.getenv('AWS_REGION', 'ap-south-1'),
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
        )
        self.bucket_name = os.getenv('AWS_BUCKET_NAME', 'lexora-assets')
    
    def upload_video(self, video_path, session_id):
        """
        Upload generated video to S3 and return the public URL
        """
        try:
            # Generate a unique filename
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            s3_key = f"generated-videos/video_{session_id}_{timestamp}.mp4"
            
            # Upload to S3
            with open(video_path, 'rb') as video_file:
                self.s3_client.upload_fileobj(
                    video_file,
                    self.bucket_name,
                    s3_key,
                    ExtraArgs={
                        'ContentType': 'video/mp4',
                        'ACL': 'public-read'
                    }
                )
            
            # Return the public URL
            s3_url = f"https://{self.bucket_name}.s3.{os.getenv('AWS_REGION', 'ap-south-1')}.amazonaws.com/{s3_key}"
            print(f"Video uploaded successfully to S3: {s3_url}")
            return s3_url
            
        except Exception as e:
            print(f"Error uploading video to S3: {e}")
            return None
    
    def upload_audio(self, audio_path, session_id):
        """
        Upload generated audio to S3 and return the public URL
        """
        try:
            # Generate a unique filename
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            s3_key = f"generated-audios/audio_{session_id}_{timestamp}.mp3"
            
            # Upload to S3
            with open(audio_path, 'rb') as audio_file:
                self.s3_client.upload_fileobj(
                    audio_file,
                    self.bucket_name,
                    s3_key,
                    ExtraArgs={
                        'ContentType': 'audio/mpeg',
                        'ACL': 'public-read'
                    }
                )
            
            # Return the public URL
            s3_url = f"https://{self.bucket_name}.s3.{os.getenv('AWS_REGION', 'ap-south-1')}.amazonaws.com/{s3_key}"
            print(f"Audio uploaded successfully to S3: {s3_url}")
            return s3_url
            
        except Exception as e:
            print(f"Error uploading audio to S3: {e}")
            return None

# Create a singleton instance
aws_service = AWSService()
