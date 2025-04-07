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
            'name': 'Simulated Location',
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