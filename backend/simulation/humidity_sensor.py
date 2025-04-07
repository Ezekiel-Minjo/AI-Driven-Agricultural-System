import random
from datetime import datetime
from .base_sensor import BaseSensor

class HumiditySensor(BaseSensor):
    def __init__(self, id, field_id, initial_value=None):
        super().__init__(
            id=id,
            type_name='humidity',
            field_id=field_id,
            min_value=30,  # Very dry air
            max_value=95,  # Very humid air
            initial_value=initial_value
        )
        
        # Track relationship with temperature
        self.temp_sensor = None
    
    def set_temperature_sensor(self, temp_sensor):
        """Set related temperature sensor for realistic simulations"""
        self.temp_sensor = temp_sensor
    
    def read(self):
        # Humidity is inversely related to temperature in many cases
        if self.temp_sensor:
            # Use inverse relationship with temperature
            # Higher temp generally means lower humidity
            temp = self.temp_sensor.value
            temp_factor = max(0, (40 - temp) / 30)  # 0 at 40°C, 1 at 10°C
            base_humidity = 40 + (temp_factor * 40)  # 40-80% range based on temp
        else:
            base_humidity = 60  # Default middle value
        
        # Add random fluctuation
        change = random.uniform(-5, 5)
        self.value = base_humidity + change
        self.value = max(self.min_value, min(self.max_value, self.value))
        
        reading = self._get_base_reading()
        reading['data'] = {
            'humidity': round(self.value, 2),
            'unit': '%'
        }
        
        return reading