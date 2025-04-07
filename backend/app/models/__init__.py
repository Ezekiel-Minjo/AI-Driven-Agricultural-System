from datetime import datetime

# MongoDB collection names
FARMERS_COLLECTION = 'farmers'
SENSORS_COLLECTION = 'sensors'
DATA_READINGS_COLLECTION = 'data_readings'
RECOMMENDATIONS_COLLECTION = 'recommendations'
ALERTS_COLLECTION = 'alerts'

# Helper functions
def get_timestamp():
    return datetime.utcnow().isoformat()