from app.models import SENSORS_COLLECTION, get_timestamp
from app import db

def create_sensor(farmer_id, name, type, location, field_id, configuration=None):
    """Create a new sensor record"""
    sensor = {
        'farmer_id': farmer_id,
        'name': name,
        'type': type,
        'location': location,
        'field_id': field_id,
        'status': 'active',
        'configuration': configuration or {},
        'created_at': get_timestamp(),
        'updated_at': get_timestamp()
    }

    # For simulation, generate a unique ID
    import uuid
    sensor['id'] = str(uuid.uuid4())
    
    # Store in simulated database
    get_all_sensors().append(sensor)
    
    return sensor

def get_sensor(sensor_id):
    """Get a sensor by ID"""
    sensors = get_all_sensors()
    for sensor in sensors:
        if sensor.get('id') == sensor_id:
            return sensor
    return None

def get_sensors_by_farmer(farmer_id):
    """Get all sensors for a specific farmer"""
    sensors = get_all_sensors()
    return [sensor for sensor in sensors if sensor.get('farmer_id') == farmer_id]

def get_sensors_by_field(field_id):
    """Get all sensors for a specific field"""
    sensors = get_all_sensors()
    return [sensor for sensor in sensors if sensor.get('field_id') == field_id]

def update_sensor(sensor_id, updates):
    """Update a sensor's information"""
    sensor = get_sensor(sensor_id)
    if not sensor:
        return None
    
    # Update fields
    for key, value in updates.items():
        if key not in ['id', 'farmer_id', 'created_at']:
            sensor[key] = value
    
    sensor['updated_at'] = get_timestamp()
    return sensor

def delete_sensor(sensor_id):
    """Delete a sensor"""
    sensors = get_all_sensors()
    for i, sensor in enumerate(sensors):
        if sensor.get('id') == sensor_id:
            sensors.pop(i)
            return True
    return False

def update_sensor_status(sensor_id, status):
    """Update a sensor's status"""
    sensor = get_sensor(sensor_id)
    if not sensor:
        return None
    
    sensor['status'] = status
    sensor['updated_at'] = get_timestamp()
    return sensor

def get_all_sensors():
    """Get all sensors (simulated)"""
    # This would typically be stored in a database
    # We'll use a global variable to simulate persistence
    global ALL_SENSORS
    if not hasattr(get_all_sensors, 'ALL_SENSORS'):
        get_all_sensors.ALL_SENSORS = [
            {
                'id': 'sensor-001',
                'farmer_id': 'farmer-001',
                'name': 'Main Field Soil Sensor',
                'type': 'soil_moisture',
                'location': 'Field 1 - North Corner',
                'field_id': '1',
                'status': 'active',
                'configuration': {
                    'reading_interval': 30,  # minutes
                    'alert_threshold': 25,   # minimum moisture percentage
                    'calibration_factor': 1.0
                },
                'created_at': '2023-01-15T08:30:00.000Z',
                'updated_at': '2023-06-20T14:15:00.000Z'
            },
            {
                'id': 'sensor-002',
                'farmer_id': 'farmer-001',
                'name': 'Weather Station',
                'type': 'temperature',
                'location': 'Field 1 - Center',
                'field_id': '1',
                'status': 'active',
                'configuration': {
                    'reading_interval': 15,  # minutes
                    'alert_threshold_high': 35,  # maximum temperature (°C)
                    'alert_threshold_low': 5,    # minimum temperature (°C)
                    'calibration_factor': 1.0
                },
                'created_at': '2023-01-15T09:45:00.000Z',
                'updated_at': '2023-06-20T14:15:00.000Z'
            },
            {
                'id': 'sensor-003',
                'farmer_id': 'farmer-001',
                'name': 'Humidity Monitor',
                'type': 'humidity',
                'location': 'Field 1 - East Side',
                'field_id': '1',
                'status': 'active',
                'configuration': {
                    'reading_interval': 30,  # minutes
                    'alert_threshold_high': 90,  # maximum humidity (%)
                    'alert_threshold_low': 30,   # minimum humidity (%)
                    'calibration_factor': 1.0
                },
                'created_at': '2023-01-15T10:15:00.000Z',
                'updated_at': '2023-06-20T14:15:00.000Z'
            }
        ]
    return get_all_sensors.ALL_SENSORS

def get_sensor_types():
    """Get available sensor types and their configuration options"""
    return {
        'soil_moisture': {
            'name': 'Soil Moisture Sensor',
            'unit': '%',
            'configuration_options': {
                'reading_interval': {
                    'type': 'number',
                    'label': 'Reading Interval (minutes)',
                    'min': 5,
                    'max': 120,
                    'default': 30
                },
                'alert_threshold': {
                    'type': 'number',
                    'label': 'Low Moisture Alert (%)',
                    'min': 0,
                    'max': 100,
                    'default': 30
                },
                'calibration_factor': {
                    'type': 'number',
                    'label': 'Calibration Factor',
                    'min': 0.5,
                    'max': 1.5,
                    'default': 1.0
                }
            }
        },
        'temperature': {
            'name': 'Temperature Sensor',
            'unit': '°C',
            'configuration_options': {
                'reading_interval': {
                    'type': 'number',
                    'label': 'Reading Interval (minutes)',
                    'min': 5,
                    'max': 120,
                    'default': 15
                },
                'alert_threshold_high': {
                    'type': 'number',
                    'label': 'High Temperature Alert (°C)',
                    'min': 0,
                    'max': 60,
                    'default': 35
                },
                'alert_threshold_low': {
                    'type': 'number',
                    'label': 'Low Temperature Alert (°C)',
                    'min': -10,
                    'max': 40,
                    'default': 5
                },
                'calibration_factor': {
                    'type': 'number',
                    'label': 'Calibration Factor',
                    'min': 0.8,
                    'max': 1.2,
                    'default': 1.0
                }
            }
        },
        'humidity': {
            'name': 'Humidity Sensor',
            'unit': '%',
            'configuration_options': {
                'reading_interval': {
                    'type': 'number',
                    'label': 'Reading Interval (minutes)',
                    'min': 5,
                    'max': 120,
                    'default': 30
                },
                'alert_threshold_high': {
                    'type': 'number',
                    'label': 'High Humidity Alert (%)',
                    'min': 0,
                    'max': 100,
                    'default': 90
                },
                'alert_threshold_low': {
                    'type': 'number',
                    'label': 'Low Humidity Alert (%)',
                    'min': 0,
                    'max': 100,
                    'default': 30
                },
                'calibration_factor': {
                    'type': 'number',
                    'label': 'Calibration Factor',
                    'min': 0.8,
                    'max': 1.2,
                    'default': 1.0
                }
            }
        },
        'rainfall': {
            'name': 'Rainfall Sensor',
            'unit': 'mm',
            'configuration_options': {
                'reading_interval': {
                    'type': 'number',
                    'label': 'Reading Interval (minutes)',
                    'min': 5,
                    'max': 120,
                    'default': 60
                },
                'alert_threshold': {
                    'type': 'number',
                    'label': 'High Rainfall Alert (mm/hour)',
                    'min': 0,
                    'max': 100,
                    'default': 10
                },
                'calibration_factor': {
                    'type': 'number',
                    'label': 'Calibration Factor',
                    'min': 0.8,
                    'max': 1.2,
                    'default': 1.0
                }
            }
        },
        'light': {
            'name': 'Light Sensor',
            'unit': 'lux',
            'configuration_options': {
                'reading_interval': {
                    'type': 'number',
                    'label': 'Reading Interval (minutes)',
                    'min': 5,
                    'max': 120,
                    'default': 30
                },
                'alert_threshold_low': {
                    'type': 'number',
                    'label': 'Low Light Alert (lux)',
                    'min': 0,
                    'max': 10000,
                    'default': 1000
                },
                'calibration_factor': {
                    'type': 'number',
                    'label': 'Calibration Factor',
                    'min': 0.8,
                    'max': 1.2,
                    'default': 1.0
                }
            }
        }
    }