import requests
import json
import os
import random
from datetime import datetime, timedelta

class ExternalWeatherService:
    def __init__(self):
        # In a real app, you would use an actual API key
        self.api_key = os.environ.get('OPENWEATHER_API_KEY', 'demo_key')
        self.base_url = 'https://api.openweathermap.org/data/2.5/weather'
        
        # For simulation, we'll use local data
        self.simulated = True
        
        # Kenya's 47 counties with approximate coordinates
        self.kenya_counties = {
            (0.5167, 35.2833): "Baringo",
            (0.6667, 37.2500): "Embu",
            (1.6000, 40.3000): "Garissa",
            (-0.2333, 34.7500): "Homa Bay",
            (-0.2167, 37.7500): "Machakos",
            (-0.5383, 39.4521): "Kilifi",
            (-3.3623, 38.5623): "Kwale",
            (-0.4547, 39.6583): "Mombasa",
            (-1.2864, 36.8172): "Nairobi",
            (-1.5167, 37.2667): "Makueni",
            (-0.7500, 37.2833): "Kitui",
            (-0.3031, 34.7519): "Kisumu",
            (-0.3333, 34.9833): "Kericho",
            (0.3667, 34.7833): "Nandi",
            (0.5667, 35.3000): "Uasin Gishu",
            (0.0500, 37.6500): "Meru",
            (0.4167, 37.7000): "Tharaka-Nithi",
            (0.2833, 37.8333): "Isiolo",
            (1.1000, 40.0000): "Marsabit",
            (2.9833, 39.9833): "Mandera",
            (0.4500, 39.6500): "Wajir",
            (0.0333, 35.7167): "Nakuru",
            (-0.6667, 34.7667): "Kisii",
            (-3.2167, 40.1167): "Lamu",
            (-0.3833, 36.9500): "Nyeri",
            (-0.5333, 37.4500): "Kirinyaga",
            (0.4000, 35.7333): "Laikipia",
            (1.0167, 35.0000): "West Pokot",
            (0.8667, 34.7500): "Trans Nzoia",
            (1.7500, 37.5833): "Samburu",
            (0.0167, 34.5833): "Kakamega",
            (-0.2000, 37.3000): "Murang'a",
            (-0.8833, 35.1833): "Bomet",
            (-0.7833, 35.5833): "Narok",
            (-1.7667, 37.6833): "Kajiado",
            (-0.1333, 36.0000): "Nyandarua",
            (-0.3700, 34.5100): "Vihiga",
            (0.0167, 34.9000): "Bungoma",
            (-0.4717, 39.3553): "Taita-Taveta",
            (0.2833, 34.7500): "Busia",
            (0.1167, 35.2500): "Elgeyo-Marakwet",
            (1.5167, 35.6000): "Turkana",
            (-1.0333, 36.8667): "Kiambu",
            (-0.3833, 34.5000): "Siaya",
            (-0.8789, 36.5250): "Tana River",
            (-1.1667, 38.3333): "Nyamira",
            (-0.9667, 37.0833): "Migori"
        }
    
    def get_weather_by_coordinates(self, lat, lon):
        """Get current weather by coordinates"""
        if self.simulated:
            return self._get_simulated_weather(lat, lon)
        
        # In a real app, you would make an actual API call
        params = {
            'lat': lat,
            'lon': lon,
            'units': 'metric',
            'appid': self.api_key
        }
        
        response = requests.get(self.base_url, params=params)
        return response.json()
    
    def _get_location_name(self, lat, lon):
        """Get the name of the closest county based on coordinates"""
        closest_county = "Nairobi"  # Default to Nairobi
        closest_distance = float('inf')
        
        for coords, name in self.kenya_counties.items():
            # Simple distance calculation (not accounting for Earth's curvature)
            distance = ((lat - coords[0])**2 + (lon - coords[1])**2)**0.5
            if distance < closest_distance:
                closest_distance = distance
                closest_county = name
        
        return closest_county
    
    def _get_simulated_weather(self, lat, lon):
        """Generate simulated weather data"""
        # Current hour affects weather (simulate day/night cycle)
        current_hour = datetime.now().hour
        is_daytime = 6 <= current_hour <= 18
        
        # Random weather conditions weighted by likelihood
        conditions = [
            'Clear', 'Clouds', 'Rain', 'Thunderstorm', 'Drizzle', 
            'Snow', 'Mist', 'Fog'
        ]
        weights = [0.3, 0.3, 0.15, 0.05, 0.05, 0.05, 0.05, 0.05]
        
        # Adjust weights based on time of day
        if not is_daytime:
            # More likely to be clear/cloudy at night, less rain/storms
            weights = [0.4, 0.3, 0.1, 0.03, 0.03, 0.04, 0.05, 0.05]
        
        condition = random.choices(conditions, weights=weights)[0]
        
        # Base temperature by latitude (approximate)
        base_temp = 25 - abs(lat) / 2
        
        # Add time of day variation
        if is_daytime:
            hour_factor = (current_hour - 6) / 12  # 0 at 6AM, 1 at 6PM
            # Peak at noon
            time_variation = 5 * (1 - abs(hour_factor - 0.5) * 2)
        else:
            # Cooler at night
            time_variation = -3
        
        # Random variation
        random_variation = random.uniform(-2, 2)
        
        # Final temperature
        temperature = base_temp + time_variation + random_variation
        
        # Wind speed
        wind_speed = random.uniform(0, 15)
        
        # Humidity based on conditions
        if condition in ['Rain', 'Thunderstorm', 'Drizzle']:
            humidity = random.uniform(70, 95)
        elif condition in ['Mist', 'Fog', 'Snow']:
            humidity = random.uniform(60, 85)
        else:
            humidity = random.uniform(40, 70)
        
        # Cloudiness
        if condition == 'Clear':
            cloudiness = random.uniform(0, 10)
        elif condition == 'Clouds':
            cloudiness = random.uniform(40, 100)
        else:
            cloudiness = random.uniform(30, 100)
        
        # Get the county name based on coordinates
        location_name = self._get_location_name(lat, lon)
        
        # Simulate API response structure
        return {
            'coord': {'lat': lat, 'lon': lon},
            'weather': [
                {
                    'id': self._get_condition_id(condition),
                    'main': condition,
                    'description': self._get_condition_description(condition),
                    'icon': self._get_condition_icon(condition, is_daytime)
                }
            ],
            'base': 'stations',
            'main': {
                'temp': round(temperature, 1),
                'feels_like': round(temperature - random.uniform(-2, 2), 1),
                'temp_min': round(temperature - random.uniform(0, 5), 1),
                'temp_max': round(temperature + random.uniform(0, 5), 1),
                'pressure': round(1013 + random.uniform(-10, 10)),
                'humidity': round(humidity)
            },
            'visibility': 10000,
            'wind': {
                'speed': round(wind_speed, 1),
                'deg': random.randint(0, 359)
            },
            'clouds': {
                'all': round(cloudiness)
            },
            'dt': int(datetime.now().timestamp()),
            'sys': {
                'country': 'KE',
                'sunrise': int((datetime.now().replace(hour=6, minute=0, second=0)).timestamp()),
                'sunset': int((datetime.now().replace(hour=18, minute=0, second=0)).timestamp())
            },
            'timezone': 10800,  # UTC+3 for Kenya
            'name': location_name,
            'cod': 200
        }
    
    def _get_condition_id(self, condition):
        """Map condition to OpenWeatherMap condition ID"""
        condition_map = {
            'Clear': 800,
            'Clouds': 801,
            'Rain': 500,
            'Thunderstorm': 200,
            'Drizzle': 300,
            'Snow': 600,
            'Mist': 701,
            'Fog': 741
        }
        return condition_map.get(condition, 800)
    
    def _get_condition_description(self, condition):
        """Get a more detailed description for a condition"""
        description_map = {
            'Clear': 'clear sky',
            'Clouds': 'scattered clouds',
            'Rain': 'moderate rain',
            'Thunderstorm': 'thunderstorm',
            'Drizzle': 'light drizzle',
            'Snow': 'light snow',
            'Mist': 'mist',
            'Fog': 'fog'
        }
        return description_map.get(condition, 'unknown')
    
    def _get_condition_icon(self, condition, is_daytime):
        """Get the icon code for a condition"""
        # OpenWeatherMap icon codes
        if is_daytime:
            icon_map = {
                'Clear': '01d',
                'Clouds': '03d',
                'Rain': '10d',
                'Thunderstorm': '11d',
                'Drizzle': '09d',
                'Snow': '13d',
                'Mist': '50d',
                'Fog': '50d'
            }
        else:
            icon_map = {
                'Clear': '01n',
                'Clouds': '03n',
                'Rain': '10n',
                'Thunderstorm': '11n',
                'Drizzle': '09n',
                'Snow': '13n',
                'Mist': '50n',
                'Fog': '50n'
            }
        return icon_map.get(condition, '01d')