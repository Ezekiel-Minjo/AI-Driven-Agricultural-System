import random
from datetime import datetime, timedelta

class WeatherService:
    def __init__(self):
        self.conditions = [
            'Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain', 
            'Heavy Rain', 'Thunderstorm', 'Foggy', 'Clear'
        ]
        # Base temperature for the current date
        self.base_temp = 25  # Can be adjusted based on season
        self.location = {
            'latitude': 0.0,
            'longitude': 0.0,
            'elevation': 100
        }
    
    def get_current_weather(self, location=None):
        """Get current weather for a location"""
        if location:
            self.location = location
        
        # Simulate current weather
        now = datetime.now()
        hour = now.hour
        
        # More likely to be sunny during day, clear at night
        if 6 <= hour <= 18:  # Daytime
            weights = [0.3, 0.3, 0.2, 0.1, 0.05, 0.02, 0.03, 0.0]
        else:  # Nighttime
            weights = [0.0, 0.1, 0.1, 0.05, 0.02, 0.01, 0.02, 0.7]
        
        condition = random.choices(self.conditions, weights=weights)[0]
        
        # Temperature varies by time of day
        temp_adjustment = self._get_diurnal_adjustment(hour)
        temperature = self.base_temp + temp_adjustment + random.uniform(-2, 2)
        
        # Wind and humidity
        wind_speed = random.uniform(0, 20)
        humidity = random.uniform(40, 90)
        
        # Adjust humidity based on condition
        if condition in ['Light Rain', 'Heavy Rain', 'Thunderstorm']:
            humidity += random.uniform(5, 15)
        elif condition in ['Sunny', 'Clear']:
            humidity -= random.uniform(5, 15)
        
        humidity = max(30, min(95, humidity))
        
        return {
            'condition': condition,
            'temperature': round(temperature, 1),
            'feels_like': round(self._calculate_feels_like(temperature, humidity, wind_speed), 1),
            'humidity': round(humidity, 1),
            'wind_speed': round(wind_speed, 1),
            'wind_direction': self._get_wind_direction(),
            'precipitation': self._get_precipitation_chance(condition),
            'timestamp': now.isoformat()
        }
    
    def get_forecast(self, days=5):
        """Get weather forecast for the next few days"""
        forecast = []
        now = datetime.now()
        
        for day in range(days):
            date = now + timedelta(days=day)
            daily_forecast = self._generate_daily_forecast(date)
            forecast.append(daily_forecast)
        
        return forecast
    
    def _generate_daily_forecast(self, date):
        """Generate forecast for a specific day"""
        # Slight random variation in base temperature for the day
        daily_base_temp = self.base_temp + random.uniform(-3, 3)
        
        # Generate high and low temperatures
        high_temp = daily_base_temp + random.uniform(3, 8)
        low_temp = daily_base_temp - random.uniform(5, 10)
        
        # Choose a primary weather condition for the day
        # Weights can be adjusted based on season, etc.
        condition = random.choices(self.conditions, weights=[0.3, 0.3, 0.2, 0.1, 0.05, 0.02, 0.03, 0.0])[0]
        
        return {
            'date': date.strftime('%Y-%m-%d'),
            'day_of_week': date.strftime('%A'),
            'condition': condition,
            'high_temp': round(high_temp, 1),
            'low_temp': round(low_temp, 1),
            'humidity': round(random.uniform(40, 90), 1),
            'wind_speed': round(random.uniform(0, 20), 1),
            'precipitation_chance': self._get_precipitation_chance(condition)
        }
    
    def _get_diurnal_adjustment(self, hour):
        """Calculate temperature adjustment based on time of day"""
        # Peak temperature around 2-3 PM, lowest around 5-6 AM
        if 0 <= hour < 6:
            return -5 + (hour / 6) * 2  # Gradually warming from midnight to 6 AM
        elif 6 <= hour < 14:
            return -3 + ((hour - 6) / 8) * 10  # Warming from 6 AM to 2 PM
        elif 14 <= hour < 20:
            return 7 - ((hour - 14) / 6) * 8  # Cooling from 2 PM to 8 PM
        else:
            return -1 - ((hour - 20) / 4) * 4  # Cooling from 8 PM to midnight
    
    def _calculate_feels_like(self, temp, humidity, wind_speed):
        """Calculate feels-like temperature based on heat index and wind chill"""
        if temp > 27 and humidity > 40:
            # Heat index calculation (simplified)
            feels_like = temp + (humidity - 40) / 4
        elif temp < 10 and wind_speed > 5:
            # Wind chill calculation (simplified)
            feels_like = temp - wind_speed / 2
        else:
            feels_like = temp
        
        return feels_like
    
    def _get_wind_direction(self):
        """Get a random wind direction"""
        directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
        return random.choice(directions)
    
    def _get_precipitation_chance(self, condition):
        """Get precipitation chance based on condition"""
        if condition == 'Sunny' or condition == 'Clear':
            return f"{random.randint(0, 10)}%"
        elif condition == 'Partly Cloudy':
            return f"{random.randint(10, 30)}%"
        elif condition == 'Cloudy':
            return f"{random.randint(20, 50)}%"
        elif condition == 'Foggy':
            return f"{random.randint(30, 50)}%"
        elif condition == 'Light Rain':
            return f"{random.randint(60, 80)}%"
        elif condition == 'Heavy Rain' or condition == 'Thunderstorm':
            return f"{random.randint(80, 100)}%"
        return "0%"