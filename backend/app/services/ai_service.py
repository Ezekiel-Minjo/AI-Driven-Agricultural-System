import numpy as np
from datetime import datetime, timedelta
import pandas as pd
from sklearn.linear_model import LinearRegression

class AgriculturalAI:
    def __init__(self):
        # Optimal ranges for different measurements
        self.optimal_ranges = {
            'soil_moisture': (40, 75),  # %
            'temperature': (15, 30),    # °C
            'humidity': (50, 80)        # %
        }
        
        # Crop specific requirements
        self.crop_requirements = {
            'maize': {
                'soil_moisture': (50, 70),
                'temperature': (18, 32),
                'humidity': (45, 75),
                'growth_phases': ['germination', 'vegetative', 'flowering', 'grain_filling', 'maturity'],
                'days_to_maturity': 120
            },
            'beans': {
                'soil_moisture': (45, 65),
                'temperature': (18, 28),
                'humidity': (40, 70),
                'growth_phases': ['germination', 'vegetative', 'flowering', 'pod_formation', 'maturity'],
                'days_to_maturity': 90
            },
            'tomatoes': {
                'soil_moisture': (55, 75),
                'temperature': (20, 30),
                'humidity': (50, 80),
                'growth_phases': ['seedling', 'vegetative', 'flowering', 'fruit_development', 'ripening'],
                'days_to_maturity': 100
            }
        }
    
    def analyze_soil_moisture(self, readings, crop_type='maize'):
        """Analyze soil moisture readings and provide recommendations"""
        if not readings:
            return None
        
        # Extract values and timestamps
        values = [reading['data'].get('soil_moisture', 0) for reading in readings]
        timestamps = [datetime.fromisoformat(reading['timestamp']) for reading in readings]
        
        # Get recent values (last 24 hours)
        recent_values = values[-24:] if len(values) >= 24 else values
        
        # Calculate statistics
        current = values[-1] if values else 0
        avg = np.mean(recent_values)
        min_val = np.min(recent_values)
        max_val = np.max(recent_values)
        
        # Calculate trend over last 24 hours
        if len(values) >= 2:
            # Use linear regression to determine trend
            X = np.array(range(len(recent_values))).reshape(-1, 1)
            y = np.array(recent_values)
            model = LinearRegression()
            model.fit(X, y)
            trend = model.coef_[0]
        else:
            trend = 0
        
        # Get optimal range for the crop
        min_optimal, max_optimal = self.crop_requirements.get(
            crop_type.lower(), self.crop_requirements['maize']
        )['soil_moisture']
        
        # Generate recommendation
        if current < min_optimal:
            if trend < 0:
                return {
                    'type': 'irrigation',
                    'severity': 'high',
                    'message': f'Soil moisture is low ({current:.1f}%) and decreasing. Immediate irrigation recommended.',
                    'data': {
                        'current': current,
                        'optimal_range': (min_optimal, max_optimal),
                        'trend': trend
                    }
                }
            else:
                return {
                    'type': 'irrigation',
                    'severity': 'medium',
                    'message': f'Soil moisture is low ({current:.1f}%), but trend is stable or increasing. Consider irrigation in the next 24 hours.',
                    'data': {
                        'current': current,
                        'optimal_range': (min_optimal, max_optimal),
                        'trend': trend
                    }
                }
        elif current > max_optimal:
            return {
                'type': 'irrigation',
                'severity': 'low',
                'message': f'Soil moisture is high ({current:.1f}%). Delay irrigation until levels decrease.',
                'data': {
                    'current': current,
                    'optimal_range': (min_optimal, max_optimal),
                    'trend': trend
                }
            }
        elif trend < -0.5:  # Significant decreasing trend
            hours_until_critical = (min_optimal - current) / (-trend) if trend < 0 else 48
            if hours_until_critical < 24:
                return {
                    'type': 'irrigation',
                    'severity': 'medium',
                    'message': f'Soil moisture is decreasing. Irrigation will be needed within {int(hours_until_critical)} hours.',
                    'data': {
                        'current': current,
                        'optimal_range': (min_optimal, max_optimal),
                        'trend': trend,
                        'hours_until_critical': hours_until_critical
                    }
                }
        
        return {
            'type': 'irrigation',
            'severity': 'low',
            'message': f'Soil moisture is within optimal range ({current:.1f}%).',
            'data': {
                'current': current,
                'optimal_range': (min_optimal, max_optimal),
                'trend': trend
            }
        }
    
    def analyze_temperature(self, readings, crop_type='maize'):
        """Analyze temperature readings and provide recommendations"""
        if not readings:
            return None
        
        # Extract values and timestamps
        values = [reading['data'].get('temperature', 0) for reading in readings]
        timestamps = [datetime.fromisoformat(reading['timestamp']) for reading in readings]
        
        # Get recent values (last 24 hours)
        recent_values = values[-24:] if len(values) >= 24 else values
        
        # Calculate statistics
        current = values[-1] if values else 0
        avg = np.mean(recent_values)
        min_val = np.min(recent_values)
        max_val = np.max(recent_values)
        
        # Get optimal range for the crop
        min_optimal, max_optimal = self.crop_requirements.get(
            crop_type.lower(), self.crop_requirements['maize']
        )['temperature']
        
        # Generate recommendation
        if current > max_optimal:
            return {
                'type': 'temperature',
                'severity': 'high',
                'message': f'Temperature is high ({current:.1f}°C). Consider shade or irrigation to cool crops.',
                'data': {
                    'current': current,
                    'optimal_range': (min_optimal, max_optimal),
                    'daily_variation': max_val - min_val
                }
            }
        elif current < min_optimal:
            return {
                'type': 'temperature',
                'severity': 'medium',
                'message': f'Temperature is low ({current:.1f}°C). Monitor for frost risk.',
                'data': {
                    'current': current,
                    'optimal_range': (min_optimal, max_optimal),
                    'daily_variation': max_val - min_val
                }
            }
        
        # Check for large daily variations
        if max_val - min_val > 15:
            return {
                'type': 'temperature',
                'severity': 'low',
                'message': f'Large temperature variations detected (min: {min_val:.1f}°C, max: {max_val:.1f}°C). Consider protective measures for sensitive crops.',
                'data': {
                    'current': current,
                    'optimal_range': (min_optimal, max_optimal),
                    'daily_variation': max_val - min_val
                }
            }
        
        return {
            'type': 'temperature',
            'severity': 'low',
            'message': f'Temperature is within optimal range ({current:.1f}°C).',
            'data': {
                'current': current,
                'optimal_range': (min_optimal, max_optimal),
                'daily_variation': max_val - min_val
            }
        }
    
    def analyze_humidity(self, readings, crop_type='maize'):
        """Analyze humidity readings and provide recommendations"""
        if not readings:
            return None
        
        # Extract values
        values = [reading['data'].get('humidity', 0) for reading in readings]
        
        # Get recent values (last 24 hours)
        recent_values = values[-24:] if len(values) >= 24 else values
        
        # Calculate statistics
        current = values[-1] if values else 0
        avg = np.mean(recent_values)
        
        # Get optimal range for the crop
        min_optimal, max_optimal = self.crop_requirements.get(
            crop_type.lower(), self.crop_requirements['maize']
        )['humidity']
        
        # Generate recommendation
        if current > max_optimal:
            return {
                'type': 'humidity',
                'severity': 'medium',
                'message': f'Humidity is high ({current:.1f}%). Monitor for fungal diseases.',
                'data': {
                    'current': current,
                    'optimal_range': (min_optimal, max_optimal)
                }
            }
        elif current < min_optimal:
            return {
                'type': 'humidity',
                'severity': 'medium',
                'message': f'Humidity is low ({current:.1f}%). Consider irrigation to increase local humidity.',
                'data': {
                    'current': current,
                    'optimal_range': (min_optimal, max_optimal)
                }
            }
        
        return {
            'type': 'humidity',
            'severity': 'low',
            'message': f'Humidity is within optimal range ({current:.1f}%).',
            'data': {
                'current': current,
                'optimal_range': (min_optimal, max_optimal)
            }
        }
    
    def predict_pest_risk(self, temperature_readings, humidity_readings, crop_type='maize'):
        """Predict pest risk based on temperature and humidity patterns"""
        if not temperature_readings or not humidity_readings:
            return None
        
        # Extract recent values
        temp_values = [reading['data'].get('temperature', 0) for reading in temperature_readings[-24:]]
        humidity_values = [reading['data'].get('humidity', 0) for reading in humidity_readings[-24:]]
        
        # Calculate averages
        avg_temp = np.mean(temp_values)
        avg_humidity = np.mean(humidity_values)
        
        # Simple risk model: higher risk when warm and humid
        # This is a simplified example - a real model would be more sophisticated
        pest_risk = 0
        pest_types = []
        
        # Warm and humid conditions (favorable for many pests)
        if avg_temp > 25 and avg_humidity > 70:
            pest_risk = 0.8
            pest_types = ['aphids', 'whiteflies', 'spider mites']
        
        # Hot and dry conditions (favorable for certain pests)
        elif avg_temp > 30 and avg_humidity < 50:
            pest_risk = 0.7
            pest_types = ['thrips', 'mites']
        
        # Warm and moderate humidity
        elif avg_temp > 22 and 50 <= avg_humidity <= 70:
            pest_risk = 0.5
            pest_types = ['grasshoppers', 'beetles']
        
        # Cool and humid (favorable for fungal diseases)
        elif avg_temp < 20 and avg_humidity > 80:
            pest_risk = 0.6
            pest_types = ['slugs', 'fungal pathogens']
        
        # Low risk conditions
        else:
            pest_risk = 0.2
            pest_types = ['general pests']
        
        # Generate recommendation based on risk
        if pest_risk > 0.7:
            return {
                'type': 'pest_control',
                'severity': 'high',
                'message': f'High risk of pest infestation. Monitor for {", ".join(pest_types)}.',
                'data': {
                    'risk_score': pest_risk,
                    'potential_pests': pest_types
                }
            }
        elif pest_risk > 0.4:
            return {
                'type': 'pest_control',
                'severity': 'medium',
                'message': f'Moderate risk of pest infestation. Consider preventive measures for {", ".join(pest_types)}.',
                'data': {
                    'risk_score': pest_risk,
                    'potential_pests': pest_types
                }
            }
        else:
            return {
                'type': 'pest_control',
                'severity': 'low',
                'message': 'Low pest risk currently.',
                'data': {
                    'risk_score': pest_risk
                }
            }
    
    def generate_planting_recommendation(self, temperature_readings, soil_moisture_readings, crop_type='maize'):
        """Generate planting recommendations based on conditions"""
        if not temperature_readings or not soil_moisture_readings:
            return None
        
        # Extract recent values
        temp_values = [reading['data'].get('temperature', 0) for reading in temperature_readings[-24:]]
        moisture_values = [reading['data'].get('soil_moisture', 0) for reading in soil_moisture_readings[-24:]]
        
        # Calculate averages
        avg_temp = np.mean(temp_values)
        avg_moisture = np.mean(moisture_values)
        
        # Get optimal ranges for the crop
        temp_range = self.crop_requirements.get(
            crop_type.lower(), self.crop_requirements['maize']
        )['temperature']
        
        moisture_range = self.crop_requirements.get(
            crop_type.lower(), self.crop_requirements['maize']
        )['soil_moisture']
        
        # Check if conditions are suitable for planting
        temp_suitable = temp_range[0] <= avg_temp <= temp_range[1]
        moisture_suitable = moisture_range[0] <= avg_moisture <= moisture_range[1]
        
        if temp_suitable and moisture_suitable:
            return {
                'type': 'planting',
                'severity': 'high',
                'message': f'Conditions are optimal for planting {crop_type}. Consider planting within the next 3-5 days.',
                'data': {
                    'avg_temperature': avg_temp,
                    'avg_soil_moisture': avg_moisture,
                    'optimal_temp_range': temp_range,
                    'optimal_moisture_range': moisture_range
                }
            }
        elif not temp_suitable and moisture_suitable:
            action = "wait for warmer weather" if avg_temp < temp_range[0] else "wait for cooler weather"
            return {
                'type': 'planting',
                'severity': 'medium',
                'message': f'Soil moisture is suitable, but temperature is not optimal for planting {crop_type}. Recommend to {action}.',
                'data': {
                    'avg_temperature': avg_temp,
                    'avg_soil_moisture': avg_moisture,
                    'optimal_temp_range': temp_range,
                    'optimal_moisture_range': moisture_range
                }
            }
        elif temp_suitable and not moisture_suitable:
            action = "irrigate soil" if avg_moisture < moisture_range[0] else "allow soil to dry"
            return {
                'type': 'planting',
                'severity': 'medium',
                'message': f'Temperature is suitable, but soil moisture is not optimal for planting {crop_type}. Recommend to {action}.',
                'data': {
                    'avg_temperature': avg_temp,
                    'avg_soil_moisture': avg_moisture,
                    'optimal_temp_range': temp_range,
                    'optimal_moisture_range': moisture_range
                }
            }
        else:
            return {
                'type': 'planting',
                'severity': 'low',
                'message': f'Current conditions are not suitable for planting {crop_type}. Monitor and wait for improved conditions.',
                'data': {
                    'avg_temperature': avg_temp,
                    'avg_soil_moisture': avg_moisture,
                    'optimal_temp_range': temp_range,
                    'optimal_moisture_range': moisture_range
                }
            }
    
    def get_all_recommendations(self, sensor_readings, crop_type='maize'):
        """
        Generate all types of recommendations based on sensor readings
        
        Args:
            sensor_readings: Dictionary mapping sensor types to their readings
            crop_type: Type of crop being grown
        
        Returns:
            List of recommendation dictionaries
        """
        recommendations = []
        
        # Process soil moisture readings
        if 'soil_moisture' in sensor_readings and sensor_readings['soil_moisture']:
            soil_rec = self.analyze_soil_moisture(sensor_readings['soil_moisture'], crop_type)
            if soil_rec:
                recommendations.append(soil_rec)
        
        # Process temperature readings
        if 'temperature' in sensor_readings and sensor_readings['temperature']:
            temp_rec = self.analyze_temperature(sensor_readings['temperature'], crop_type)
            if temp_rec:
                recommendations.append(temp_rec)
        
        # Process humidity readings
        if 'humidity' in sensor_readings and sensor_readings['humidity']:
            humidity_rec = self.analyze_humidity(sensor_readings['humidity'], crop_type)
            if humidity_rec:
                recommendations.append(humidity_rec)
        
        # Process pest risk prediction
        if ('temperature' in sensor_readings and sensor_readings['temperature'] and
            'humidity' in sensor_readings and sensor_readings['humidity']):
            pest_rec = self.predict_pest_risk(
                sensor_readings['temperature'], 
                sensor_readings['humidity'],
                crop_type
            )
            if pest_rec:
                recommendations.append(pest_rec)
        
        # Process planting recommendations
        if ('temperature' in sensor_readings and sensor_readings['temperature'] and
            'soil_moisture' in sensor_readings and sensor_readings['soil_moisture']):
            planting_rec = self.generate_planting_recommendation(
                sensor_readings['temperature'],
                sensor_readings['soil_moisture'],
                crop_type
            )
            if planting_rec:
                recommendations.append(planting_rec)
        
        # Filter to include only medium and high severity recommendations
        important_recommendations = [rec for rec in recommendations if rec['severity'] != 'low']
        
        # If no important recommendations, include at least one low severity recommendation if available
        if not important_recommendations and recommendations:
            important_recommendations = [recommendations[0]]
        
        return important_recommendations