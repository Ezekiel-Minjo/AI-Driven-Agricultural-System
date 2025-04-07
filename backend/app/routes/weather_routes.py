# app/routes/weather_routes.py
from flask import Blueprint, request, jsonify
from app.services.weather_service import WeatherService

bp = Blueprint('weather', __name__, url_prefix='/api/weather')

# Initialize the weather service
weather_service = WeatherService()

@bp.route('/current', methods=['GET'])
def get_current_weather():
    # Get location from query parameters (optional)
    lat = request.args.get('lat', type=float)
    lon = request.args.get('lon', type=float)
    
    location = None
    if lat is not None and lon is not None:
        location = {
            'latitude': lat,
            'longitude': lon,
            'elevation': request.args.get('elevation', 100, type=int)
        }
    
    # Get current weather
    weather = weather_service.get_current_weather(location)
    return jsonify(weather)

@bp.route('/forecast', methods=['GET'])
def get_forecast():
    # Get number of days from query parameters
    days = request.args.get('days', 5, type=int)
    
    # Get forecast
    forecast = weather_service.get_forecast(days)
    return jsonify(forecast)

@bp.route('/external', methods=['GET'])
def get_external_weather():
    from app.services.external_weather_service import ExternalWeatherService
    
    # Get coordinates from query params (with defaults for Kenya)
    lat = request.args.get('lat', 1.2921, type=float)
    lon = request.args.get('lon', 36.8219, type=float)
    
    # Create service and get weather data
    weather_service = ExternalWeatherService()
    weather_data = weather_service.get_weather_by_coordinates(lat, lon)
    
    return jsonify(weather_data)