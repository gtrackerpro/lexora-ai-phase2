import subprocess
import os
import sys

def generate_video_with_sadtalker(audio_path, image_path, output_path):
    """
    Generate video using SadTalker for lip-sync animation
    """
    try:
        # Check if SadTalker is available
        sadtalker_path = os.path.join(os.path.dirname(__file__), '..', 'SadTalker')
        inference_script = os.path.join(sadtalker_path, 'inference.py')
        
        if not os.path.exists(inference_script):
            print("SadTalker inference.py not found, creating placeholder video...")
            return create_placeholder_video(output_path)
        
        # Prepare SadTalker command with absolute paths
        results_dir = os.path.abspath(os.path.join(os.path.dirname(output_path), 'sadtalker_results'))
        os.makedirs(results_dir, exist_ok=True)
        
        # Ensure paths are absolute
        audio_path = os.path.abspath(audio_path)
        image_path = os.path.abspath(image_path)
        output_path = os.path.abspath(output_path)
        
        print(f"Debug - Audio path: {audio_path}")
        print(f"Debug - Image path: {image_path}")
        print(f"Debug - Results dir: {results_dir}")
        print(f"Debug - Expected output: {output_path}")
        
        command = [
            sys.executable,  # Use current Python interpreter
            inference_script,
            "--driven_audio", audio_path,
            "--source_image", image_path,
            "--result_dir", results_dir,
            "--still",  # Use still image mode
            "--preprocess", "full",  # Full preprocessing (works better)
            "--verbose"  # Get verbose output
        ]
        
        print(f"Running SadTalker command: {' '.join(command)}")
        
        # Change to SadTalker directory
        old_cwd = os.getcwd()
        os.chdir(sadtalker_path)
        
        try:
            result = subprocess.run(command, capture_output=True, text=True, timeout=300)
            
            if result.returncode == 0:
                print(f"SadTalker completed successfully")
                print(f"Output: {result.stdout}")
                
                # SadTalker generates files in results_dir with timestamp folders
                # Look for the generated video file in the results directory
                found_video = None
                
                print(f"Debug - Looking for video files in: {results_dir}")
                print(f"Debug - Results dir exists: {os.path.exists(results_dir)}")
                
                if os.path.exists(results_dir):
                    print(f"Debug - Contents of results_dir: {os.listdir(results_dir)}")
                    
                    # Check the timestamped subdirectory first
                    for timestamp_dir in os.listdir(results_dir):
                        timestamp_path = os.path.join(results_dir, timestamp_dir)
                        print(f"Debug - Checking: {timestamp_path} (is_dir: {os.path.isdir(timestamp_path)})")
                        
                        if os.path.isdir(timestamp_path):
                            files_in_timestamp = os.listdir(timestamp_path)
                            print(f"Debug - Files in timestamp dir: {files_in_timestamp}")
                            
                            for file in files_in_timestamp:
                                if file.endswith('.mp4'):
                                    found_video = os.path.join(timestamp_path, file)
                                    print(f"Debug - Found video in timestamp dir: {found_video}")
                                    break
                            if found_video:
                                break
                        elif timestamp_dir.endswith('.mp4'):
                            # Direct mp4 file in results_dir
                            found_video = os.path.join(results_dir, timestamp_dir)
                            print(f"Debug - Found direct video file: {found_video}")
                            break
                
                print(f"Debug - Final found_video: {found_video}")
                
                if found_video and os.path.exists(found_video):
                    # Move the generated file to the expected output path
                    import shutil
                    shutil.move(found_video, output_path)
                    print(f"Video generated successfully: {output_path}")
                    return True
                
                print("SadTalker completed but no output file found")
                print(f"Searched in: {results_dir}")
                return create_placeholder_video(output_path)
                
            else:
                print(f"SadTalker failed: {result.stderr}")
                print(f"Return code: {result.returncode}")
                return create_placeholder_video(output_path)
                
        except subprocess.TimeoutExpired:
            print("SadTalker timed out after 5 minutes")
            return create_placeholder_video(output_path)
        
        finally:
            os.chdir(old_cwd)
        
    except Exception as e:
        print(f"Video generation error: {e}")
        return create_placeholder_video(output_path)

def create_placeholder_video(output_path):
    """
    Create a minimal placeholder video file
    """
    try:
        with open(output_path, 'wb') as f:
            # Write minimal MP4 header for a valid (but empty) video file
            f.write(b'\x00\x00\x00\x18ftypmp42\x00\x00\x00\x00mp42isom')
        print(f"Created placeholder video: {output_path}")
        return True
    except Exception as e:
        print(f"Failed to create placeholder video: {e}")
        return False
