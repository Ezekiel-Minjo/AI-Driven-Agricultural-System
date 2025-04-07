from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
import random

bp = Blueprint('alerts', __name__, url_prefix='/api/alerts')

def generate_simulated_alerts(farmer_id):
    """Generate simulated alerts for development"""
    alert_types = ['info', 'warning', 'danger']
    
    alerts = []
    now = datetime.now()
    
    for i in range(7):  # Generate 7 alerts
        alert_type = random.choice(alert_types)
        
        if alert_type == 'info':
            message = random.choice([
                "Light rain expected tomorrow morning.",
                "Optimal planting conditions will occur in 3 days.",
                "Weather forecast updated: clear skies for the next 5 days."
            ])
        elif alert_type == 'warning':
            message = random.choice([
                "Soil moisture dropping below optimal levels in Field 1.",
                "Temperature forecast to reach 35°C tomorrow.",
                "Humidity levels rising rapidly, monitor for disease risk."
            ])
        elif alert_type == 'danger':
            message = random.choice([
                "Critical: Soil moisture critically low, immediate irrigation required.",
                "Pest detection: Signs of aphid infestation detected in Field 2.",
                "Frost warning: Temperature expected to drop below 0°C tonight."
            ])
        
        created_at = now - timedelta(hours=i*5)
        
        alerts.append({
            'id': f'alert-{i+1}',
            'farmer_id': farmer_id,
            'type': alert_type,
            'message': message,
            'created_at': created_at.isoformat(),
            'is_read': random.choice([True, False]),
        })
    
    return sorted(alerts, key=lambda x: x['created_at'], reverse=True)

@bp.route('/', methods=['GET'])
def get_alerts():
    farmer_id = request.args.get('farmer_id', 'farmer-001')
    
    # Generate simulated alerts
    alerts = generate_simulated_alerts(farmer_id)
    return jsonify(alerts)

@bp.route('/<alert_id>/read', methods=['PUT'])
def mark_as_read(alert_id):
    # In a real application, this would update MongoDB
    return jsonify({'success': True, 'message': f'Alert {alert_id} marked as read'})