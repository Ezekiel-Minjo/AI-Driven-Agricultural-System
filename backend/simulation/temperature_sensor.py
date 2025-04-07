import random
import math
from datetime import datetime
from .base_sensor import BaseSensor

class TemperatureSensor(BaseSensor):
    def __init__(self, id, field_id, initial_value=None):
        super().__init__(
            id=id,
            type_name='temperature',
            field_id=field_id,
            min_value=5,   # Cold
            max_value=40,  # Hot
            initial_value=initial_value
        )
        
        # For simulating daily temperature cycle
        self.cycle_amplitude = 5  # Daily temperature variation of ±5°C
    
    def read(self):
        # Current time for daily cycle simulation
        now = datetime.utcnow()
        hour = now.hour + now.minute / 60.0
        
        # Daily cycle: coolest at 4 AM, warmest at 2 PM
        daily_cycle = self.cycle_amplitude * math.sin(math.pi * (hour - 4) / 12)
        
        # Random fluctuation
        noise = random.uniform(-0.5, 0.5)
        
        # Apply changes
        base_temp = (self.min_value + self.max_value) / 2
        self.value = base_temp + daily_cycle + noise
        self.value = max(self.min_value, min(self.max_value, self.value))
        
        reading = self._get_base_reading()
        reading['data'] = {
            'temperature': round(self.value, 2),
            'unit': '°C'
        }
        
        return reading