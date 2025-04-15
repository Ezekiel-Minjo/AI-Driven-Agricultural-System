from flask import Flask
from flask_cors import CORS
from pymongo import MongoClient
from app.config import Config

# MongoDB client - will be initialized when app is created
mongo_client = None
db = None

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Enable CORS
    CORS(app, origins=["http://localhost:5173"], supports_credentials=True)
    
    # Initialize MongoDB
    global mongo_client, db
    try:
        mongo_client = MongoClient(app.config['MONGO_URI'])
        # Explicitly specify database name instead of using get_default_database()
        db_name = app.config['MONGO_URI'].split('/')[-1]
        db = mongo_client[db_name]
        
        # Simple test to verify connection
        mongo_client.admin.command('ping')
        print(f"MongoDB connected successfully to database: {db_name}")
    except Exception as e:
        print(f"MongoDB connection error: {e}")
        # Allow app to run without MongoDB for development
        db = None
    
    # Register blueprints
    from app.routes import sensor_routes, reading_routes, recommendation_routes, alert_routes, weather_routes, irrigation_routes, disease_routes, yield_routes, notification_routes, farm_routes, auth_routes
    
    app.register_blueprint(sensor_routes.bp)
    app.register_blueprint(reading_routes.bp)
    app.register_blueprint(recommendation_routes.bp)
    app.register_blueprint(alert_routes.bp)
    app.register_blueprint(weather_routes.bp)
    app.register_blueprint(irrigation_routes.bp)
    app.register_blueprint(disease_routes.bp)
    app.register_blueprint(yield_routes.bp)
    app.register_blueprint(notification_routes.bp)  
    app.register_blueprint(farm_routes.bp)
    app.register_blueprint(auth_routes.bp)

    @app.route('/health')
    def health_check():
        return {'status': 'healthy'}
    
    return app