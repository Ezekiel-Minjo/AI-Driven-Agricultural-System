from flask import Blueprint, request, jsonify
import random
from datetime import datetime, timedelta
import os
import json

bp = Blueprint('readings', __name__, url_prefix='/api/readings')

def generate_simulated_readings(sensor_id, hours=24):
    """Generate simulated sensor readings for development"""
    readings = []
    now = datetime.now()
    
    for i in range(hours):
        timestamp = now - timedelta(hours=i)
        
        # Generate different values based on sensor type
        if 'soil_moisture' in sensor_id or 'moisture' in sensor_id:
            value = random.uniform(30, 70)
            unit = '%'
            type_name = 'soil_moisture'
        elif 'temp' in sensor_id:
            # Daily temperature cycle
            hour_of_day = timestamp.hour
            base_temp = 22 + 5 * (1 - abs(hour_of_day - 14) / 14)  # Peak at 2 PM
            value = base_temp + random.uniform(-2, 2)
            unit = '°C'
            type_name = 'temperature'
        elif 'humid' in sensor_id:
            value = random.uniform(50, 80)
            unit = '%'
            type_name = 'humidity'
        else:
            value = random.uniform(0, 100)
            unit = 'units'
            type_name = 'unknown'
        
        readings.append({
            'sensor_id': sensor_id,
            'timestamp': timestamp.isoformat(),
            'data': {
                type_name: round(value, 1),
                'unit': unit
            }
        })
    
    return sorted(readings, key=lambda x: x['timestamp'])

# In app/routes/reading_routes.py - Add some debug logging
@bp.route('/', methods=['GET'])
def get_readings():
    sensor_id = request.args.get('sensor_id', 'sensor-001')
    hours = request.args.get('hours', default=24, type=int)
    
    print(f"Generating readings for sensor {sensor_id} for {hours} hours")
    # Generate simulated readings
    readings = generate_simulated_readings(sensor_id, hours)
    print(f"Generated {len(readings)} readings")
    
    return jsonify(readings)