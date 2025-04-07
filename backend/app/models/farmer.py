from app.models import FARMERS_COLLECTION, get_timestamp
from app import db

def create_farmer(name, phone, location):
    """Create a new farmer record"""
    farmer = {
        'name': name,
        'phone': phone,
        'farmLocation': {
            'latitude': location.get('latitude', 0),
            'longitude': location.get('longitude', 0)
        },
        'created_at': get_timestamp(),
        'updated_at': get_timestamp()
    }
    
    # Handle case when MongoDB isn't connected
    if db is None:
        import uuid
        farmer['_id'] = str(uuid.uuid4())
        return farmer
    
    result = db[FARMERS_COLLECTION].insert_one(farmer)
    farmer['_id'] = str(result.inserted_id)
    return farmer

def get_farmer(farmer_id):
    """Get a farmer by ID"""
    # Handle case when MongoDB isn't connected
    if db is None:
        return {
            '_id': farmer_id,
            'name': 'Simulated Farmer',
            'phone': '123-456-7890',
            'farmLocation': {'latitude': 0, 'longitude': 0}
        }
    
    from bson.objectid import ObjectId
    farmer = db[FARMERS_COLLECTION].find_one({'_id': ObjectId(farmer_id)})
    if farmer:
        farmer['_id'] = str(farmer['_id'])
    return farmer

def get_all_farmers():
    """Get all farmers"""
    # Handle case when MongoDB isn't connected
    if db is None:
        return [{
            '_id': 'farmer-001',
            'name': 'Simulated Farmer',
            'phone': '123-456-7890',
            'farmLocation': {'latitude': 0, 'longitude': 0}
        }]
    
    farmers = list(db[FARMERS_COLLECTION].find())
    for farmer in farmers:
        farmer['_id'] = str(farmer['_id'])
    return farmers