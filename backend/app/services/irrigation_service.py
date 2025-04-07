from datetime import datetime, timedelta
import random
import numpy as np

class IrrigationService:
    def __init__(self):
        self.irrigation_methods = [
            'Drip irrigation',
            'Sprinkler irrigation',
            'Furrow irrigation',
            'Surface irrigation'
        ]
        
        # Optimal soil moisture ranges by crop type
        self.optimal_ranges = {
            'maize': (50, 70),
            'beans': (45, 65),
            'tomatoes': (55, 75),
            'default': (45, 70)
        }
    
    def get_optimal_range(self, crop_type):
        """Get optimal soil moisture range for the crop type"""
        return self.optimal_ranges.get(crop_type.lower(), self.optimal_ranges['default'])
    
    def calculate_irrigation_need(self, soil_moisture, crop_type='maize'):
        """Calculate irrigation need based on soil moisture and crop type"""
        min_optimal, max_optimal = self.get_optimal_range(crop_type)
        
        if soil_moisture < min_optimal:
            # Below optimal range - needs irrigation
            deficit = min_optimal - soil_moisture
            urgency = 'high' if deficit > 15 else 'medium' if deficit > 5 else 'low'
            
            return {
                'needs_irrigation': True,
                'deficit_percentage': deficit,
                'urgency': urgency,
                'recommendation': f"Irrigate to increase soil moisture by approximately {deficit:.1f}%"
            }
        elif soil_moisture <= max_optimal:
            # Within optimal range - no irrigation needed
            return {
                'needs_irrigation': False,
                'deficit_percentage': 0,
                'urgency': 'none',
                'recommendation': "Soil moisture is within optimal range. No irrigation needed at this time."
            }
        else:
            # Above optimal range - no irrigation needed, potential for excess water
            excess = soil_moisture - max_optimal
            
            return {
                'needs_irrigation': False,
                'deficit_percentage': 0,
                'urgency': 'none',
                'recommendation': f"Soil moisture is {excess:.1f}% above optimal range. Delay irrigation until levels decrease."
            }
    
    def calculate_water_volume(self, area_square_meters, soil_moisture, crop_type='maize'):
        """Calculate recommended water volume for irrigation in liters"""
        irrigation_need = self.calculate_irrigation_need(soil_moisture, crop_type)
        
        if not irrigation_need['needs_irrigation']:
            return 0
        
        # Simple calculation based on deficit
        # Assume 1% increase in soil moisture requires about 1 liter per square meter
        deficit = irrigation_need['deficit_percentage']
        return area_square_meters * deficit
    
    def generate_irrigation_schedule(self, soil_moisture_readings, weather_forecast, crop_type='maize', area_square_meters=10000):
        """
        Generate an irrigation schedule based on soil moisture readings and weather forecast
        
        Args:
            soil_moisture_readings: List of soil moisture readings
            weather_forecast: List of weather forecast data
            crop_type: Type of crop
            area_square_meters: Area of the field in square meters
        
        Returns:
            Dictionary with irrigation schedule information
        """
        # Get current soil moisture (from most recent reading)
        current_moisture = soil_moisture_readings[-1]['data'].get('soil_moisture', 50) if soil_moisture_readings else 50
        
        # Calculate base irrigation need
        irrigation_need = self.calculate_irrigation_need(current_moisture, crop_type)
        
        # If no irrigation needed, return early
        if not irrigation_need['needs_irrigation']:
            return {
                'needs_irrigation': False,
                'next_irrigation': None,
                'water_volume_liters': 0,
                'recommendation': irrigation_need['recommendation'],
                'schedule': []
            }
        
        # Calculate water volume
        water_volume = self.calculate_water_volume(area_square_meters, current_moisture, crop_type)
        
        # Check weather forecast for rain
        rain_expected = False
        rain_day = None
        
        for i, day in enumerate(weather_forecast):
            condition = day['condition'].lower()
            if 'rain' in condition or 'thunderstorm' in condition:
                rain_expected = True
                rain_day = i
                break
        
        # Determine next irrigation date
        now = datetime.now()
        
        if rain_expected and rain_day is not None and rain_day <= 2:
            # Rain expected soon - delay irrigation
            next_irrigation = now + timedelta(days=rain_day + 1)
            recommendation = f"Rain expected in {rain_day + 1} day(s). Consider delaying irrigation until after rainfall to conserve water."
        else:
            # No rain expected soon - irrigate based on urgency
            if irrigation_need['urgency'] == 'high':
                next_irrigation = now  # Today
            elif irrigation_need['urgency'] == 'medium':
                next_irrigation = now + timedelta(days=1)  # Tomorrow
            else:
                next_irrigation = now + timedelta(days=2)  # Day after tomorrow
            
            recommendation = f"Irrigate with approximately {int(water_volume):,} liters of water ({water_volume / area_square_meters:.1f} L/m²)."
        
        # Generate a simple 7-day schedule
        schedule = []
        for i in range(7):
            day = now + timedelta(days=i)
            
            # Check for rainfall on this day
            is_rain_day = rain_expected and rain_day is not None and i == rain_day
            
            # Check if this is the recommended irrigation day
            is_irrigation_day = day.date() == next_irrigation.date()
            
            daily_recommendation = ""
            if is_rain_day:
                daily_recommendation = "Rainfall expected. No irrigation needed."
            elif is_irrigation_day:
                daily_recommendation = f"Irrigate with {int(water_volume):,} liters of water."
            
            schedule.append({
                'date': day.strftime('%Y-%m-%d'),
                'day_of_week': day.strftime('%A'),
                'is_irrigation_day': is_irrigation_day,
                'is_rain_day': is_rain_day,
                'recommendation': daily_recommendation
            })
        
        return {
            'needs_irrigation': True,
            'next_irrigation': next_irrigation.isoformat(),
            'water_volume_liters': int(water_volume),
            'recommendation': recommendation,
            'schedule': schedule
        }