from flask import Blueprint, request, jsonify
from app.services.yield_prediction_service import YieldPredictionService
from app.routes import reading_routes

bp = Blueprint('yields', __name__, url_prefix='/api/yields')

# Initialize yield prediction service
yield_service = YieldPredictionService()

@bp.route('/predict', methods=['POST'])
def predict_yield():
    data = request.json
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    crop_type = data.get('crop_type', 'maize')
    area_hectares = data.get('area_hectares', 1.0)
    
    # Get current conditions from simulated sensor data
    soil_moisture_readings = reading_routes.generate_simulated_readings('sensor-001', 48)
    temperature_readings = reading_routes.generate_simulated_readings('sensor-002', 48)
    
    # Extract latest values
    latest_soil_moisture = soil_moisture_readings[-1]['data'].get('soil_moisture', 60) if soil_moisture_readings else 60
    latest_temperature = temperature_readings[-1]['data'].get('temperature', 25) if temperature_readings else 25
    
    # Combine with provided conditions or use defaults
    current_conditions = {
        'temperature': latest_temperature,
        'soil_moisture': latest_soil_moisture,
        'rainfall': data.get('rainfall', 500),
        'sunlight': data.get('sunlight', 7),
        'pest_disease_level': data.get('pest_disease_level', 0.1),
        'fertilizer_adequacy': data.get('fertilizer_adequacy', 0.8)
    }
    
    # Predict yield
    prediction = yield_service.predict_yield(crop_type, area_hectares, current_conditions)
    
    return jsonify(prediction)

@bp.route('/history', methods=['GET'])
def get_yield_history():
    crop_type = request.args.get('crop_type', 'maize')
    num_years = request.args.get('years', 5, type=int)
    
    # Get historical yields
    history = yield_service.get_historical_yields(crop_type, num_years)
    
    return jsonify(history)