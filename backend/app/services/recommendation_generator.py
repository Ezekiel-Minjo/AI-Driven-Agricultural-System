from datetime import datetime
from app.services.ai_service import AgriculturalAI
from app.models import recommendation as rec_model

class RecommendationGenerator:
    def __init__(self):
        self.ai = AgriculturalAI()
    
    def generate_recommendations(self, farmer_id, sensor_data, crop_type='maize'):
        """
        Generate recommendations based on sensor data
        
        Args:
            farmer_id: ID of the farmer
            sensor_data: Dictionary of sensor readings organized by sensor type
            crop_type: Type of crop (defaults to 'maize')
        
        Returns:
            List of generated recommendations
        """
        # Organize sensor readings by sensor type
        organized_readings = {}
        
        for sensor_id, readings in sensor_data.items():
            # Get sensor type from the first reading
            if readings and len(readings) > 0:
                # Extract the data type from the first reading
                for key in readings[0]['data'].keys():
                    if key not in ['unit']:  # Skip non-measurement fields
                        organized_readings[key] = readings
        
        # Generate AI recommendations
        ai_recommendations = self.ai.get_all_recommendations(organized_readings, crop_type)
        
        # Store recommendations in the database
        stored_recommendations = []
        for ai_rec in ai_recommendations:
            stored_rec = rec_model.create_recommendation(
                farmer_id=farmer_id,
                type=ai_rec['type'],
                details={
                    'message': ai_rec['message'],
                    'severity': ai_rec['severity'],
                    'data': ai_rec.get('data', {})
                }
            )
            stored_recommendations.append(stored_rec)
        
        return stored_recommendations