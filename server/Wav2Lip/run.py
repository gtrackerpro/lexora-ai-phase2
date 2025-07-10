import os
from dotenv import load_dotenv
from app.main import app

if __name__ == '__main__':
    # Load environment variables from .env
    load_dotenv()

    # Get port from environment or default to 5001
    port = int(os.environ.get('PORT', 5001))

    # Start Flask app
    app.run(host='0.0.0.0', port=port, debug=False)
