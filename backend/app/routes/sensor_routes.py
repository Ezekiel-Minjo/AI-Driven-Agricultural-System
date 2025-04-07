from flask import Blueprint, request, jsonify
from app.models import sensor as sensor_model

bp = Blueprint('sensors', __name__, url_prefix='/api/sensors')

@bp.route('/', methods=['POST'])
def create_sensor():
    data = request.json
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    required_fields = ['type', 'location', 'farmer_id']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    # Create a new simulated sensor
    sensor_id = f"sensor-{len(SIMULATED_SENSORS) + 1:03d}"
    new_sensor = {
        'id': sensor_id,
        'type': data['type'],
        'location': data['location'],
        'farmer_id': data['farmer_id'],
        'status': 'active'
    }
    
    SIMULATED_SENSORS.append(new_sensor)
    return jsonify(new_sensor), 201

@bp.route('/<sensor_id>', methods=['PUT'])
def update_sensor(sensor_id):
    data = request.json
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    # Find the sensor
    for sensor in SIMULATED_SENSORS:
        if sensor['id'] == sensor_id:
            # Update fields
            for key in ['type', 'location', 'status']:
                if key in data:
                    sensor[key] = data[key]
            return jsonify(sensor)
    
    return jsonify({'error': 'Sensor not found'}), 404

@bp.route('/<sensor_id>', methods=['DELETE'])
def delete_sensor(sensor_id):
    global SIMULATED_SENSORS
    original_count = len(SIMULATED_SENSORS)
    SIMULATED_SENSORS = [s for s in SIMULATED_SENSORS if s['id'] != sensor_id]
    
    if len(SIMULATED_SENSORS) < original_count:
        return jsonify({'success': True, 'message': 'Sensor deleted'})
    
    return jsonify({'error': 'Sensor not found'}), 404