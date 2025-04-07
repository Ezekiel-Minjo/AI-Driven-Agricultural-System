import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    # Flask configurations
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-key-please-change-in-production')
    DEBUG = os.environ.get('FLASK_DEBUG', 'True') == 'True'
    
    # MongoDB configurations
    MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/agri_system')
    
    # AI model paths
    MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'ml', 'models')
    
    # Simulation settings
    SIMULATION_INTERVAL = int(os.environ.get('SIMULATION_INTERVAL', '5'))  # seconds