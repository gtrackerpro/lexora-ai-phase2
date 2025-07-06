#!/usr/bin/env python3
"""
Minimal Flask server to test basic functionality
"""

from flask import Flask, jsonify, request
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'wav2lip-minimal',
        'message': 'Service is running'
    })

@app.route('/test', methods=['GET'])
def test_endpoint():
    """Test endpoint"""
    return jsonify({
        'message': 'Test endpoint working',
        'dependencies': {
            'python_version': os.sys.version,
            'flask_available': True
        }
    })

@app.route('/generate-video', methods=['POST'])
def generate_video():
    """Mock video generation endpoint"""
    try:
        data = request.get_json()
        script = data.get('script', '') if data else ''
        
        return jsonify({
            'success': True,
            'message': 'Mock response - service is running',
            'script_length': len(script),
            'status': 'would_process_in_full_version'
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    logger.info(f"Starting minimal Wav2Lip service on port {port}")
    app.run(host='0.0.0.0', port=port, debug=True)
