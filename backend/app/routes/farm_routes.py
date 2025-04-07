# app/routes/farm_routes.py
from flask import Blueprint, request, jsonify
from app.models import farm as farm_model

bp = Blueprint('farms', __name__, url_prefix='/api/farms')

@bp.route('/', methods=['GET'])
def get_farms():
    farmer_id = request.args.get('farmer_id', 'farmer-001')
    
    farms = farm_model.get_farms_by_farmer(farmer_id)
    
    return jsonify(farms)

@bp.route('/<farm_id>', methods=['GET'])
def get_farm(farm_id):
    farm = farm_model.get_farm(farm_id)
    
    if not farm:
        return jsonify({'error': 'Farm not found'}), 404
    
    return jsonify(farm)

@bp.route('/', methods=['POST'])
def create_farm():
    data = request.json
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    required_fields = ['farmer_id', 'name', 'location', 'area_hectares']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    farm = farm_model.create_farm(
        data['farmer_id'],
        data['name'],
        data['location'],
        data['area_hectares'],
        data.get('crops', [])
    )
    
    return jsonify(farm), 201

@bp.route('/<farm_id>', methods=['PUT'])
def update_farm(farm_id):
    data = request.json
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    farm = farm_model.update_farm(farm_id, data)
    
    if not farm:
        return jsonify({'error': 'Farm not found'}), 404
    
    return jsonify(farm)

@bp.route('/<farm_id>', methods=['DELETE'])
def delete_farm(farm_id):
    success = farm_model.delete_farm(farm_id)
    
    if not success:
        return jsonify({'error': 'Failed to delete farm'}), 500
    
    return jsonify({'success': True, 'message': 'Farm deleted successfully'})