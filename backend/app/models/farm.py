from app.models import get_timestamp
from app import db

def create_farm(farmer_id, name, location, area_hectares, crops=None):
    """Create a new farm record"""
    farm = {
        'farmer_id': farmer_id,
        'name': name,
        'location': location,
        'area_hectares': area_hectares,
        'crops': crops or [],
        'created_at': get_timestamp(),
        'updated_at': get_timestamp()
    }
    
    # For simulation, just return without DB storage
    farm['_id'] = str(len(get_farms_by_farmer(farmer_id)) + 1)
    
    # In a real app, this would save to MongoDB
    # result = db['farms'].insert_one(farm)
    # farm['_id'] = str(result.inserted_id)
    
    return farm

def get_farm(farm_id):
    """Get a farm by ID"""
    # Simulated farm data
    farms = get_all_farms()
    for farm in farms:
        if str(farm.get('_id')) == str(farm_id):
            return farm
    return None

def get_all_farms():
    """Get all farms (simulated)"""
    return [
        {
            '_id': '1',
            'farmer_id': 'farmer-001',
            'name': 'Main Farm',
            'location': 'Nairobi East',
            'area_hectares': 5.2,
            'crops': [
                {
                    'name': 'Maize',
                    'area_hectares': 3.0,
                    'planting_date': '2023-03-15',
                    'expected_harvest_date': '2023-07-25'
                },
                {
                    'name': 'Beans',
                    'area_hectares': 2.2,
                    'planting_date': '2023-04-05',
                    'expected_harvest_date': '2023-06-30'
                }
            ],
            'created_at': '2023-01-10T08:30:00.000Z',
            'updated_at': '2023-05-20T14:15:00.000Z'
        },
        {
            '_id': '2',
            'farmer_id': 'farmer-001',
            'name': 'River Plot',
            'location': 'Nairobi West',
            'area_hectares': 1.8,
            'crops': [
                {
                    'name': 'Tomatoes',
                    'area_hectares': 1.0,
                    'planting_date': '2023-02-20',
                    'expected_harvest_date': '2023-05-15'
                },
                {
                    'name': 'Kale',
                    'area_hectares': 0.8,
                    'planting_date': '2023-03-10',
                    'expected_harvest_date': '2023-05-01'
                }
            ],
            'created_at': '2023-01-15T10:45:00.000Z',
            'updated_at': '2023-03-22T09:30:00.000Z'
        }
    ]

def get_farms_by_farmer(farmer_id):
   """Get all farms for a specific farmer"""
   # Simulated farm data
   farms = get_all_farms()
   return [farm for farm in farms if farm.get('farmer_id') == farmer_id]

def update_farm(farm_id, updates):
   """Update a farm record (simulated)"""
   farm = get_farm(farm_id)
   if not farm:
       return None
   
   # Update fields
   for key, value in updates.items():
       if key not in ['_id', 'farmer_id', 'created_at']:
           farm[key] = value
   
   farm['updated_at'] = get_timestamp()
   
   return farm

def delete_farm(farm_id):
   """Delete a farm (simulated)"""
   # In a real app, this would delete from MongoDB
   return True