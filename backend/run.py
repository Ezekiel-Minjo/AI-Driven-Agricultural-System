from app import create_app
import os

app = create_app()

if __name__ == '__main__':
    # Get port from environment or use default
    port = int(os.environ.get('PORT', 5000))
    
    print(f"Starting server on port {port}...")
    print("Try accessing http://localhost:{port}/health in your browser")
    
    # Start Flask app
    app.run(debug=True, host='0.0.0.0', port=port)