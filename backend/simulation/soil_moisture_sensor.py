import random
from datetime import datetime
from .base_sensor import BaseSensor

class SoilMoistureSensor(BaseSensor):
    def __init__(self, id, field_id, initial_value=None):
        super().__init__(
            id=id,
            type_name='soil_moisture',
            field_id=field_id,
            min_value=10,  # Very dry
            max_value=90,  # Very wet
            initial_value=initial_value
        )
    
    def read(self):
        # Simulate natural fluctuation (soil moisture changes slowly)
        change = random.uniform(-2, 2)
        self.value = max(self.min_value, min(self.max_value, self.value + change))
        
        reading = self._get_base_reading()
        reading['data'] = {
            'soil_moisture': round(self.value, 2),
            'unit': '%'
        }
        
        return reading