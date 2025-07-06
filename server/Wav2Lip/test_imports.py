#!/usr/bin/env python3
"""
Test script to check core functionality and imports
"""

print("Testing core imports...")

try:
    import numpy as np
    print(f"✓ NumPy {np.__version__}")
except Exception as e:
    print(f"✗ NumPy: {e}")

try:
    import cv2
    print(f"✓ OpenCV {cv2.__version__}")
except Exception as e:
    print(f"✗ OpenCV: {e}")

try:
    import torch
    print(f"✓ PyTorch {torch.__version__}")
    print(f"  CUDA available: {torch.cuda.is_available()}")
except Exception as e:
    print(f"✗ PyTorch: {e}")

try:
    import librosa
    print(f"✓ Librosa {librosa.__version__}")
except Exception as e:
    print(f"✗ Librosa: {e}")

try:
    from flask import Flask
    print("✓ Flask")
except Exception as e:
    print(f"✗ Flask: {e}")

try:
    import soundfile
    print("✓ SoundFile")
except Exception as e:
    print(f"✗ SoundFile: {e}")

try:
    from gtts import gTTS
    print("✓ gTTS")
except Exception as e:
    print(f"✗ gTTS: {e}")

try:
    import subprocess
    result = subprocess.run(['ffmpeg', '-version'], capture_output=True, text=True, timeout=5)
    if result.returncode == 0:
        print("✓ FFmpeg available")
    else:
        print("✗ FFmpeg not working")
except Exception as e:
    print(f"✗ FFmpeg: {e}")

print("\nTest complete!")
