import numpy as np
import random
from datetime import datetime, timedelta

class YieldPredictionService:
    def __init__(self):
        # Baseline yields for different crops in kg/hectare
        self.baseline_yields = {
            'maize': 5000,
            'beans': 2000,
            'tomatoes': 35000,
            'wheat': 3500,
            'rice': 4000,
            'potatoes': 25000
        }
        
        # Factors that affect yield
        self.factor_impacts = {
            'temperature': {
                'optimal_range': {
                    'maize': (20, 30),
                    'beans': (18, 28),
                    'tomatoes': (20, 30),
                    'wheat': (15, 25),
                    'rice': (22, 32),
                    'potatoes': (15, 25)
                },
                'weight': 0.2  # Impact weight
            },
            'soil_moisture': {
                'optimal_range': {
                    'maize': (50, 70),
                    'beans': (45, 65),
                    'tomatoes': (55, 75),
                    'wheat': (40, 60),
                    'rice': (70, 90),
                    'potatoes': (60, 80)
                },
                'weight': 0.25  # Impact weight
            },
            'rainfall': {
                'optimal_range': {
                    'maize': (500, 800),
                    'beans': (300, 500),
                    'tomatoes': (400, 600),
                    'wheat': (450, 650),
                    'rice': (1000, 1500),
                    'potatoes': (500, 700)
                },
                'weight': 0.15  # Impact weight
            },
            'sunlight': {
                'optimal_range': {
                    'maize': (7, 9),
                    'beans': (6, 8),
                    'tomatoes': (8, 10),
                    'wheat': (7, 9),
                    'rice': (6, 8),
                    'potatoes': (6, 8)
                },
                'weight': 0.1  # Impact weight
            },
            'pests_diseases': {
                'weight': 0.2  # Impact weight
            },
            'fertilizer': {
                'weight': 0.1  # Impact weight
            }
        }
    
    def get_baseline_yield(self, crop_type):
        """Get baseline yield for the crop type"""
        return self.baseline_yields.get(crop_type.lower(), 4000)  # Default to 4000 kg/ha
    
    def calculate_temperature_factor(self, avg_temperature, crop_type):
        """Calculate impact of temperature on yield"""
        optimal_range = self.factor_impacts['temperature']['optimal_range'].get(
            crop_type.lower(), (18, 28)  # Default optimal range
        )
        
        min_optimal, max_optimal = optimal_range
        
        if min_optimal <= avg_temperature <= max_optimal:
            return 1.0  # Optimal temperature
        
        # Calculate penalty for suboptimal temperature
        if avg_temperature < min_optimal:
            deviation = (min_optimal - avg_temperature) / min_optimal
        else:  # avg_temperature > max_optimal
            deviation = (avg_temperature - max_optimal) / max_optimal
        
        # Cap the penalty at 50%
        penalty = min(0.5, deviation)
        return 1.0 - penalty
    
    def calculate_soil_moisture_factor(self, avg_moisture, crop_type):
        """Calculate impact of soil moisture on yield"""
        optimal_range = self.factor_impacts['soil_moisture']['optimal_range'].get(
            crop_type.lower(), (45, 65)  # Default optimal range
        )
        
        min_optimal, max_optimal = optimal_range
        
        if min_optimal <= avg_moisture <= max_optimal:
            return 1.0  # Optimal moisture
        
        # Calculate penalty for suboptimal moisture
        if avg_moisture < min_optimal:
            deviation = (min_optimal - avg_moisture) / min_optimal
        else:  # avg_moisture > max_optimal
            deviation = (avg_moisture - max_optimal) / max_optimal
        
        # Cap the penalty at 50%
        penalty = min(0.5, deviation)
        return 1.0 - penalty
    
    def calculate_rainfall_factor(self, total_rainfall, crop_type):
        """Calculate impact of rainfall on yield"""
        optimal_range = self.factor_impacts['rainfall']['optimal_range'].get(
            crop_type.lower(), (400, 600)  # Default optimal range
        )
        
        min_optimal, max_optimal = optimal_range
        
        if min_optimal <= total_rainfall <= max_optimal:
            return 1.0  # Optimal rainfall
        
        # Calculate penalty for suboptimal rainfall
        if total_rainfall < min_optimal:
            deviation = (min_optimal - total_rainfall) / min_optimal
        else:  # total_rainfall > max_optimal
            deviation = (total_rainfall - max_optimal) / max_optimal
        
        # Cap the penalty at 50%
        penalty = min(0.5, deviation)
        return 1.0 - penalty
    
    def calculate_sunlight_factor(self, avg_sunlight, crop_type):
        """Calculate impact of sunlight on yield"""
        optimal_range = self.factor_impacts['sunlight']['optimal_range'].get(
            crop_type.lower(), (6, 8)  # Default optimal range
        )
        
        min_optimal, max_optimal = optimal_range
        
        if min_optimal <= avg_sunlight <= max_optimal:
            return 1.0  # Optimal sunlight
        
        # Calculate penalty for suboptimal sunlight
        if avg_sunlight < min_optimal:
            deviation = (min_optimal - avg_sunlight) / min_optimal
        else:  # avg_sunlight > max_optimal
            deviation = (avg_sunlight - max_optimal) / max_optimal
        
        # Cap the penalty at 30% (sunlight has less impact)
        penalty = min(0.3, deviation)
        return 1.0 - penalty
    
    def calculate_pests_diseases_factor(self, pest_disease_level):
        """Calculate impact of pests and diseases on yield"""
        # pest_disease_level is a value between 0 (none) and 1 (severe)
        return 1.0 - (pest_disease_level * 0.5)  # Max penalty of 50%
    
    def calculate_fertilizer_factor(self, fertilizer_adequacy):
        """Calculate impact of fertilizer on yield"""
        # fertilizer_adequacy is a value between 0 (none) and 1 (optimal)
        return 0.7 + (fertilizer_adequacy * 0.3)  # Base of 70% + up to 30% boost
    
    def predict_yield(self, crop_type, area_hectares, current_conditions, historical_data=None):
        """
        Predict crop yield based on current conditions and historical data
        
        Args:
            crop_type: Type of crop
            area_hectares: Area in hectares
            current_conditions: Dictionary with current environmental conditions
            historical_data: Optional historical data for trend analysis
        
        Returns:
            Dictionary with yield prediction information
        """
        # Get baseline yield for the crop type
        baseline_yield = self.get_baseline_yield(crop_type)
        
        # Extract current conditions (with defaults if not provided)
        avg_temperature = current_conditions.get('temperature', 25)
        avg_soil_moisture = current_conditions.get('soil_moisture', 60)
        total_rainfall = current_conditions.get('rainfall', 500)
        avg_sunlight = current_conditions.get('sunlight', 7)
        pest_disease_level = current_conditions.get('pest_disease_level', 0.1)
        fertilizer_adequacy = current_conditions.get('fertilizer_adequacy', 0.8)
        
        # Calculate impact factors
        temperature_factor = self.calculate_temperature_factor(avg_temperature, crop_type)
        moisture_factor = self.calculate_soil_moisture_factor(avg_soil_moisture, crop_type)
        rainfall_factor = self.calculate_rainfall_factor(total_rainfall, crop_type)
        sunlight_factor = self.calculate_sunlight_factor(avg_sunlight, crop_type)
        pests_diseases_factor = self.calculate_pests_diseases_factor(pest_disease_level)
        fertilizer_factor = self.calculate_fertilizer_factor(fertilizer_adequacy)
        
        # Calculate weighted impact
        weighted_impact = (
            temperature_factor * self.factor_impacts['temperature']['weight'] +
            moisture_factor * self.factor_impacts['soil_moisture']['weight'] +
            rainfall_factor * self.factor_impacts['rainfall']['weight'] +
            sunlight_factor * self.factor_impacts['sunlight']['weight'] +
            pests_diseases_factor * self.factor_impacts['pests_diseases']['weight'] +
            fertilizer_factor * self.factor_impacts['fertilizer']['weight']
        )
        
        # Add a small random variation to simulate model uncertainty
        variation = random.uniform(0.95, 1.05)
        
        # Calculate predicted yield per hectare
        predicted_yield_per_hectare = baseline_yield * weighted_impact * variation
        
        # Calculate total yield
        total_yield = predicted_yield_per_hectare * area_hectares
        
        # Determine yield category
        if weighted_impact >= 0.9:
            yield_category = "Excellent"
        elif weighted_impact >= 0.8:
            yield_category = "Good"
        elif weighted_impact >= 0.7:
            yield_category = "Average"
        elif weighted_impact >= 0.6:
            yield_category = "Below Average"
        else:
            yield_category = "Poor"
        
        # Generate limiting factors
        limiting_factors = []
        factor_thresholds = {
            'temperature': 0.9,
            'soil_moisture': 0.9,
            'rainfall': 0.9,
            'sunlight': 0.9,
            'pests_diseases': 0.9,
            'fertilizer': 0.9
        }
        
        if temperature_factor < factor_thresholds['temperature']:
            if avg_temperature < self.factor_impacts['temperature']['optimal_range'].get(crop_type.lower(), (18, 28))[0]:
                limiting_factors.append("Temperature too low")
            else:
                limiting_factors.append("Temperature too high")
        
        if moisture_factor < factor_thresholds['soil_moisture']:
            if avg_soil_moisture < self.factor_impacts['soil_moisture']['optimal_range'].get(crop_type.lower(), (45, 65))[0]:
                limiting_factors.append("Soil moisture too low")
            else:
                limiting_factors.append("Soil moisture too high")
        
        if rainfall_factor < factor_thresholds['rainfall']:
            if total_rainfall < self.factor_impacts['rainfall']['optimal_range'].get(crop_type.lower(), (400, 600))[0]:
                limiting_factors.append("Insufficient rainfall")
            else:
                limiting_factors.append("Excessive rainfall")
        
        if sunlight_factor < factor_thresholds['sunlight']:
            limiting_factors.append("Suboptimal sunlight hours")
        
        if pests_diseases_factor < factor_thresholds['pests_diseases']:
            limiting_factors.append("Pest or disease pressure")
        
        if fertilizer_factor < factor_thresholds['fertilizer']:
            limiting_factors.append("Inadequate fertilization")
        
        # Generate improvement recommendations
        recommendations = []
        if "Soil moisture too low" in limiting_factors:
            recommendations.append("Increase irrigation frequency or volume")
        elif "Soil moisture too high" in limiting_factors:
            recommendations.append("Improve drainage and reduce irrigation")
        
        if "Insufficient rainfall" in limiting_factors:
            recommendations.append("Implement irrigation to supplement rainfall")
        elif "Excessive rainfall" in limiting_factors:
            recommendations.append("Improve drainage systems and consider raised beds")
        
        if "Temperature too low" in limiting_factors:
            recommendations.append("Consider using greenhouse or row covers for temperature management")
        elif "Temperature too high" in limiting_factors:
            recommendations.append("Implement shade structures or change planting time")
        
        if "Suboptimal sunlight hours" in limiting_factors:
            recommendations.append("Ensure plants are not shaded and consider adjusting planting density")
        
        if "Pest or disease pressure" in limiting_factors:
            recommendations.append("Implement integrated pest management strategies")
        
        if "Inadequate fertilization" in limiting_factors:
            recommendations.append("Adjust fertilizer application based on soil tests")
        
        # Generate harvest window
        # For simulation, assume harvest is 3-4 months from now
        harvest_start = datetime.now() + timedelta(days=90 + random.randint(0, 15))
        harvest_end = harvest_start + timedelta(days=15 + random.randint(0, 10))
        
        return {
            'crop_type': crop_type,
            'area_hectares': area_hectares,
            'predicted_yield_per_hectare': round(predicted_yield_per_hectare, 2),
            'total_predicted_yield': round(total_yield, 2),
            'yield_category': yield_category,
            'confidence_level': random.uniform(0.7, 0.95),
            'limiting_factors': limiting_factors,
            'improvement_recommendations': recommendations,
            'harvest_window': {
                'start_date': harvest_start.strftime('%Y-%m-%d'),
                'end_date': harvest_end.strftime('%Y-%m-%d')
            },
            'impact_factors': {
                'temperature': {
                    'value': avg_temperature,
                    'impact': round(temperature_factor, 2)
                },
                'soil_moisture': {
                    'value': avg_soil_moisture,
                    'impact': round(moisture_factor, 2)
                },
                'rainfall': {
                    'value': total_rainfall,
                    'impact': round(rainfall_factor, 2)
                },
                'sunlight': {
                    'value': avg_sunlight,
                    'impact': round(sunlight_factor, 2)
                },
                'pests_diseases': {
                    'value': pest_disease_level,
                    'impact': round(pests_diseases_factor, 2)
                },
                'fertilizer': {
                    'value': fertilizer_adequacy,
                    'impact': round(fertilizer_factor, 2)
                }
            },
            'timestamp': datetime.now().isoformat()
        }
    
    def get_historical_yields(self, crop_type, num_years=5):
        """
        Get simulated historical yield data for the crop type
        
        Args:
            crop_type: Type of crop
            num_years: Number of years of historical data to generate
        
        Returns:
            List of historical yield data
        """
        baseline_yield = self.get_baseline_yield(crop_type)
        current_year = datetime.now().year
        
        historical_yields = []
        for i in range(num_years, 0, -1):
            year = current_year - i
            
            # Add some yearly variation
            variation = random.uniform(0.8, 1.2)
            yield_value = baseline_yield * variation
            
            # Add some trend - slight increase over time
            trend_factor = 1.0 + (i / 100)
            yield_value = yield_value / trend_factor
            
            historical_yields.append({
                'year': year,
                'yield_per_hectare': round(yield_value, 2),
                'notes': self._generate_random_notes(variation)
            })
        
        return historical_yields
    
    def _generate_random_notes(self, variation):
        """Generate random notes based on the yield variation"""
        if variation < 0.9:
            return random.choice([
                "Drought conditions affected yields",
                "Pest outbreak impacted production",
                "Late frost damaged crops",
                "Heavy rain during harvest reduced yield",
                "Disease pressure was high this season"
            ])
        elif variation > 1.1:
            return random.choice([
                "Optimal weather conditions throughout season",
                "New fertilizer approach improved yields",
                "Pest management was highly effective",
                "Ideal rainfall distribution",
                "New seed variety performed exceptionally well"
            ])
        else:
            return random.choice([
                "Normal growing conditions",
                "Average rainfall and temperature",
                "Typical pest pressure",
                "Standard agricultural practices employed",
                "No significant weather events"
            ])