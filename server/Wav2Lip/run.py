#!/usr/bin/env python3
"""
Wav2Lip Service Runner
Activates virtual environment and runs the Flask application
"""

import os
import sys
import subprocess
import platform
from pathlib import Path

def find_venv_path():
    """
    Find the virtual environment path by checking common locations
    """
    # Get the project root (3 levels up from this file)
    project_root = Path(__file__).parent.parent.parent
    
    # Common venv locations to check
    venv_names = ['venv', '.venv', 'env', '.env']
    
    for venv_name in venv_names:
        venv_path = project_root / venv_name
        if venv_path.exists():
            return venv_path
    
    # If not found in project root, check current directory
    current_dir = Path.cwd()
    for venv_name in venv_names:
        venv_path = current_dir / venv_name
        if venv_path.exists():
            return venv_path
    
    return None

def get_python_executable(venv_path):
    """
    Get the Python executable path from the virtual environment
    """
    if platform.system() == 'Windows':
        return venv_path / 'Scripts' / 'python.exe'
    else:
        return venv_path / 'bin' / 'python'

def run_flask_app():
    """
    Run the Flask application with virtual environment activated
    """
    try:
        # Find virtual environment
        venv_path = find_venv_path()
        
        if venv_path:
            python_exe = get_python_executable(venv_path)
            
            if python_exe.exists():
                print(f"Found virtual environment at: {venv_path}")
                print(f"Using Python executable: {python_exe}")
                
                # Change to the directory containing this script
                script_dir = Path(__file__).parent
                os.chdir(script_dir)
                
                # Run the Flask app using the virtual environment's Python
                cmd = [str(python_exe), 'app/main.py']
                print(f"Running command: {' '.join(cmd)}")
                print("Starting Wav2Lip Flask service...")
                print("Press Ctrl+C to stop the service")
                print("-" * 50)
                
                # Run the command
                subprocess.run(cmd, check=True)
                
            else:
                print(f"Python executable not found at: {python_exe}")
                print("Virtual environment may not be properly set up.")
                sys.exit(1)
        else:
            print("Virtual environment not found!")
            print("Please ensure you have a virtual environment set up.")
            print("Common locations checked:")
            print("  - venv/, .venv/, env/, .env/")
            print("\nTo create a virtual environment:")
            print("  python -m venv venv")
            print("  # Then activate it and install dependencies")
            sys.exit(1)
            
    except KeyboardInterrupt:
        print("\nService stopped by user.")
    except subprocess.CalledProcessError as e:
        print(f"Error running Flask app: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Unexpected error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    run_flask_app()
