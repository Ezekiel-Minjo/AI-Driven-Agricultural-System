import numpy as np
import pickle
import os
from datetime import datetime
import random
from sklearn.linear_model import LinearRegression

class MLService:
    def __init__(self):
        self.models_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'ml', 'models')
        os.makedirs(self.models_dir, exist_ok=True)
        
        # Initialize model paths
        self.yield_model_path = os.path.join(self.models_dir, 'yield_prediction_model.pkl')
        
        # Create models if they don't exist
        if not os.path.exists(self.yield_model_path):
            self._create_yield_prediction_model()
    
    def _create_yield_prediction_model(self):
        """Create and save a simple yield prediction model"""
        print("Creating yield prediction model...")
        
        # Generate synthetic training data
        np.random.seed(42)
        n_samples = 100
        
        # Features: [avg_temperature, total_rainfall, avg_soil_moisture, sunlight_hours, fertilizer]
        X = np.random.rand(n_samples, 5)
        
        # Scale features to realistic ranges
        X[:, 0] = X[:, 0] * 20 + 15  # Temperature: 15-35°C
        X[:, 1] = X[:, 1] * 500 + 300  # Rainfall: 300-800mm
        X[:, 2] = X[:, 2] * 40 + 40  # Soil moisture: 40-80%
        X[:, 3] = X[:, 3] * 4 + 5  # Sunlight: 5-9 hours/day
        X[:, 4] = X[:, 4] * 100  # Fertilizer: 0-100% of recommended
        
        # Target: yield in kg/hectare
        # Formula: Linear combination with some randomness
        # Base yield
        base_yield = 5000  # kg/hectare for maize
        
        # Coefficients represent importance of each factor
        coefficients = np.array([100, 5, 30, 200, 10])
        
        # Optimal values
        optimal_values = np.array([25, 650, 60, 8, 100])
        
        # Calculate yield as deviation from optimal conditions
        deviations = np.abs(X - optimal_values.reshape(1, -1))
        impact = deviations @ coefficients
        
        # Generate target with some noise
        y = base_yield - impact + np.random.normal(0, 200, n_samples)
        
        # Ensure yields are positive
        y = np.maximum(y, 1000)
        
        # Create and train the model
        model = LinearRegression()
        model.fit(X, y)
        
        # Save the model
        with open(self.yield_model_path, 'wb') as f:
            pickle.dump(model, f)
        
        print("Yield prediction model created and saved.")
    
    def predict_yield(self, features):
        """Predict yield using the trained model"""
        try:
            # Load the model
            if os.path.exists(self.yield_model_path):
                with open(self.yield_model_path, 'rb') as f:
                    model = pickle.load(f)
            else:
                # Fallback if model doesn't exist
                self._create_yield_prediction_model()
                with open(self.yield_model_path, 'rb') as f:
                    model = pickle.load(f)
            
            # Make prediction
            prediction = model.predict(np.array([features]))
            
            return float(prediction[0])
        except Exception as e:
            print(f"Error predicting yield: {e}")
            # Fallback to simple estimation if model fails
            return self._simple_yield_estimate(features)
    
    def _simple_yield_estimate(self, features):
        """Simple rule-based estimation as fallback"""
        # Extract features
        temperature, rainfall, soil_moisture, sunlight, fertilizer = features
        
        # Base yield for maize
        base_yield = 5000
        
        # Adjustments based on features
        temp_factor = 1.0 - 0.1 * abs(temperature - 25) / 10
        rainfall_factor = 1.0 - 0.1 * abs(rainfall - 650) / 200
        moisture_factor = 1.0 - 0.1 * abs(soil_moisture - 60) / 20
        sunlight_factor = 1.0 - 0.1 * abs(sunlight - 8) / 3
        fertilizer_factor = 0.7 + 0.3 * (fertilizer / 100)
        
        # Combine factors
        total_factor = (temp_factor + rainfall_factor + moisture_factor + sunlight_factor + fertilizer_factor) / 5
        
        # Add random variation
        random_factor = random.uniform(0.9, 1.1)
        
        # Calculate yield
        yield_estimate = base_yield * total_factor * random_factor
        
        return yield_estimate

    def predict_disease_probability(self, temperature, humidity, rainfall, crop_type='maize'):
        """Predict disease probability based on environmental conditions"""
        # Different crops have different disease risk profiles
        base_risk = {
            'maize': 0.2,
            'beans': 0.25,
            'tomatoes': 0.3,
            'rice': 0.35,
            'wheat': 0.15
        }.get(crop_type.lower(), 0.2)
        
        # Environmental risk factors
        # High temperature and humidity increase risk
        temp_factor = 0.0
        if temperature > 30:
            temp_factor = 0.3
        elif temperature > 25:
            temp_factor = 0.2
        elif temperature < 10:
            temp_factor = 0.1
        
        # Humidity risk (higher humidity = higher risk)
        humidity_factor = min(humidity / 100, 1.0) * 0.4
        
        # Rainfall risk (moderate rainfall increases risk)
        rainfall_factor = 0.0
        if 10 < rainfall < 30:  # moderate rain
            rainfall_factor = 0.3
        elif rainfall > 30:  # heavy rain
            rainfall_factor = 0.2
        elif 0 < rainfall < 10:  # light rain
            rainfall_factor = 0.1
        
        # Combine factors with weights
        total_risk = base_risk + (temp_factor * 0.3) + (humidity_factor * 0.5) + (rainfall_factor * 0.2)
        
        # Cap at 90% max risk
        return min(total_risk, 0.9)
    
    def predict_irrigation_need(self, soil_moisture, temperature, humidity, forecast_rainfall, crop_type='maize'):
        """Predict irrigation need based on conditions"""
        # Optimal soil moisture ranges for different crops
        optimal_moisture = {
            'maize': (50, 70),
            'beans': (45, 65),
            'tomatoes': (55, 75),
            'rice': (70, 90),
            'wheat': (40, 60)
        }.get(crop_type.lower(), (50, 70))
        
        min_optimal, max_optimal = optimal_moisture
        
        # If soil moisture is below minimum, calculate deficit
        if soil_moisture < min_optimal:
            deficit = min_optimal - soil_moisture
            
            # Adjust for upcoming rainfall
            effective_deficit = deficit - (forecast_rainfall * 0.5)  # Assume 50% of rainfall becomes soil moisture
            
            # Adjust for evaporation based on temperature and humidity
            evaporation_factor = (temperature / 30) * (1 - (humidity / 100))
            
            # Final need considers evaporation too
            irrigation_need = max(0, effective_deficit + (evaporation_factor * 5))
            
            return {
                'needs_irrigation': irrigation_need > 5,  # Only recommend if deficit is significant
                'amount_mm': round(irrigation_need, 1),
                'urgency': 'high' if irrigation_need > 15 else 'medium' if irrigation_need > 5 else 'low'
            }
        
        # If soil moisture is in optimal range
        elif soil_moisture <= max_optimal:
            # Check if we'll need irrigation soon due to evaporation
            evaporation_factor = (temperature / 30) * (1 - (humidity / 100))
            projected_loss = evaporation_factor * 10  # projected 24-hour loss
            
            projected_moisture = soil_moisture - projected_loss + (forecast_rainfall * 0.5)
            
            if projected_moisture < min_optimal:
                deficit = min_optimal - projected_moisture
                return {
                    'needs_irrigation': deficit > 5,
                    'amount_mm': round(deficit, 1),
                    'urgency': 'medium' if deficit > 10 else 'low'
                }
            
            return {
                'needs_irrigation': False,
                'amount_mm': 0,
                'urgency': 'none'
            }
        
        # If soil moisture is above optimal range
        else:
            return {
                'needs_irrigation': False,
                'amount_mm': 0,
                'urgency': 'none',
                'warning': 'Soil moisture is above optimal range. Ensure proper drainage.'
            }