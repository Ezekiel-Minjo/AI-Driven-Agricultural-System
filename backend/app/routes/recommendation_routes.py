from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
import random
from app.models import recommendation as rec_model
from app.services.recommendation_generator import RecommendationGenerator
from app.routes import reading_routes  # Import to get simulated readings

bp = Blueprint('recommendations', __name__, url_prefix='/api/recommendations')

# Initialize the recommendation generator
recommendation_generator = RecommendationGenerator()

@bp.route('/', methods=['GET'])
def get_recommendations():
    farmer_id = request.args.get('farmer_id', 'farmer-001')
    
    # Check if we should generate new AI recommendations
    generate_new = request.args.get('generate', 'false').lower() == 'true'
    
    if generate_new:
        # Get sensor readings
        soil_moisture_readings = reading_routes.generate_simulated_readings('sensor-001', 48)
        temperature_readings = reading_routes.generate_simulated_readings('sensor-002', 48)
        humidity_readings = reading_routes.generate_simulated_readings('sensor-003', 48)
        
        # Organize readings by sensor ID
        sensor_data = {
            'sensor-001': soil_moisture_readings,
            'sensor-002': temperature_readings,
            'sensor-003': humidity_readings
        }
        
        # Generate new recommendations
        new_recommendations = recommendation_generator.generate_recommendations(
            farmer_id, 
            sensor_data,
            'maize'  # Default crop type
        )
        
        return jsonify(new_recommendations)
    
    # Use simulated data for development
    simulated_recommendations = generate_simulated_recommendations(farmer_id)
    return jsonify(simulated_recommendations)

def generate_simulated_recommendations(farmer_id):
    """Generate simulated recommendations for development"""
    recommendation_types = ['irrigation', 'planting', 'fertilization', 'pest_control', 'harvesting']
    priorities = ['high', 'medium', 'low']
    
    recommendations = []
    now = datetime.now()
    
    for i in range(5):  # Generate 5 recommendations
        rec_type = recommendation_types[i % len(recommendation_types)]
        
        if rec_type == 'irrigation':
            message = "Schedule irrigation for tomorrow morning due to decreasing soil moisture levels."
        elif rec_type == 'planting':
            message = "Optimal planting window for maize will be in 3 days based on soil temperature and weather forecast."
        elif rec_type == 'fertilization':
            message = "Apply nitrogen fertilizer within next 5 days for optimal crop development."
        elif rec_type == 'pest_control':
            message = "Watch for signs of aphids in the coming week. Apply organic pesticide if detected."
        elif rec_type == 'harvesting':
            message = "Optimal harvesting window for your crop will be in approximately 12 days."
        
        created_at = now - timedelta(days=i)
        
        recommendations.append({
            'id': f'rec-{i+1}',
            'farmer_id': farmer_id,
            'type': rec_type,
            'details': {
                'message': message,
                'severity': random.choice(priorities),
                'data': {}
            },
            'created_at': created_at.isoformat(),
            'is_read': random.choice([True, False]),
        })
    
    return sorted(recommendations, key=lambda x: x['created_at'], reverse=True)

@bp.route('/<rec_id>/read', methods=['PUT'])
def mark_as_read(rec_id):
    # In a real application, this would update MongoDB
    return jsonify({'success': True, 'message': f'Recommendation {rec_id} marked as read'})