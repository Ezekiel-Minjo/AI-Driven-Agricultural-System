from flask import Blueprint, request, jsonify
from app.services.disease_detection_service import DiseaseDetectionService
import os

bp = Blueprint('diseases', __name__, url_prefix='/api/diseases')

# Initialize disease detection service
disease_service = DiseaseDetectionService()

@bp.route('/analyze', methods=['POST'])
def analyze_image():
    data = request.json
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    image_data = data.get('image_data')
    crop_type = data.get('crop_type', 'maize')
    
    # Analyze image
    result = disease_service.analyze_image(image_data, crop_type)
    
    return jsonify(result)

@bp.route('/history', methods=['GET'])
def get_detection_history():
    # In a real app, this would query a database
    # For now, we'll return simulated data
    
    farmer_id = request.args.get('farmer_id', 'farmer-001')
    
    history = [
        {
            'id': '1',
            'detection_type': 'disease',
            'name': 'Northern Corn Leaf Blight',
            'crop_type': 'maize',
            'field_location': 'Field 1',
            'confidence': 0.88,
            'image_path': None,
            'timestamp': '2023-07-15T10:30:00',
            'status': 'Treated'
        },
        {
            'id': '2',
            'detection_type': 'pest',
            'name': 'Fall Armyworm',
            'crop_type': 'maize',
            'field_location': 'Field 2',
            'confidence': 0.91,
            'image_path': None,
            'timestamp': '2023-07-10T14:45:00',
            'status': 'Monitoring'
        }
    ]
    
    return jsonify(history)