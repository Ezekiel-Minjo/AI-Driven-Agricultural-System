# app/routes/irrigation_routes.py
from flask import Blueprint, request, jsonify
from app.services.irrigation_service import IrrigationService
from app.routes import reading_routes
from app.routes.weather_routes import weather_service

bp = Blueprint('irrigation', __name__, url_prefix='/api/irrigation')

# Initialize irrigation service
irrigation_service = IrrigationService()

@bp.route('/schedule', methods=['GET'])
def get_irrigation_schedule():
    # Get parameters
    crop_type = request.args.get('crop_type', 'maize')
    farmer_id = request.args.get('farmer_id', 'farmer-001')
    area = request.args.get('area', 10000, type=int)  # Area in square meters
    
    # Get soil moisture readings
    soil_moisture_sensor_id = 'sensor-001'  # Default sensor ID for soil moisture
    soil_moisture_readings = reading_routes.generate_simulated_readings(soil_moisture_sensor_id, 48)
    
    # Get weather forecast
    weather_forecast = weather_service.get_forecast(7)
    
    # Generate irrigation schedule
    schedule = irrigation_service.generate_irrigation_schedule(
        soil_moisture_readings,
        weather_forecast,
        crop_type,
        area
    )
    
    return jsonify(schedule)