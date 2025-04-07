import { useState, useEffect } from 'react';
import { getCurrentWeather, getWeatherForecast } from '../../services/weatherService';
import { format, parseISO } from 'date-fns';

function WeatherWidget() {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setLoading(true);

        // Fetch current weather
        const weather = await getCurrentWeather();
        setCurrentWeather(weather);

        // Fetch forecast
        const forecastData = await getWeatherForecast(5);
        setForecast(forecastData);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching weather data:', err);
        setError('Failed to load weather data');
        setLoading(false);
      }
    };

    fetchWeatherData();

    // Refresh weather data every 30 minutes
    const intervalId = setInterval(fetchWeatherData, 30 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  const getWeatherIcon = (condition) => {
    const conditionLower = condition ? condition.toLowerCase() : '';

    if (conditionLower.includes('sunny')) return '☀️';
    if (conditionLower.includes('partly cloudy')) return '⛅';
    if (conditionLower.includes('cloudy')) return '☁️';
    if (conditionLower.includes('light rain')) return '🌦️';
    if (conditionLower.includes('heavy rain')) return '🌧️';
    if (conditionLower.includes('thunderstorm')) return '⛈️';
    if (conditionLower.includes('foggy')) return '🌫️';
    if (conditionLower.includes('clear')) return '🌙';

    return '🌤️';
  };

  if (loading) {
    return (
      <div className="card">
        <h3>Weather</h3>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '150px' }}>
          <p>Loading weather data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <h3>Weather</h3>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '150px' }}>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3>Weather</h3>

      {currentWeather && (
        <div className="weather-display" style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '15px' }}>
          <div className="weather-icon" style={{ fontSize: '48px' }}>
            {getWeatherIcon(currentWeather.condition)}
          </div>
          <div className="weather-details">
            <div style={{ fontSize: '18px', marginBottom: '5px' }}>{currentWeather.condition}</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>
              {currentWeather.temperature}°C
              <span style={{ fontSize: '16px', fontWeight: 'normal', marginLeft: '10px' }}>
                Feels like: {currentWeather.feels_like}°C
              </span>
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              <div>Wind: {currentWeather.wind_speed} km/h {currentWeather.wind_direction}</div>
              <div>Humidity: {currentWeather.humidity}%</div>
              <div>Precipitation: {currentWeather.precipitation}</div>
            </div>
          </div>
        </div>
      )}

      {forecast.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h4 style={{ marginBottom: '10px' }}>5-Day Forecast</h4>
          <div style={{ display: 'flex', overflow: 'auto', gap: '10px' }}>
            {forecast.map((day, index) => (
              <div
                key={index}
                style={{
                  flex: '0 0 auto',
                  width: '100px',
                  textAlign: 'center',
                  padding: '10px',
                  border: '1px solid #eee',
                  borderRadius: '8px'
                }}
              >
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                  {format(parseISO(day.date), 'EEE')}
                </div>
                <div style={{ fontSize: '24px', marginBottom: '5px' }}>
                  {getWeatherIcon(day.condition)}
                </div>
                <div>
                  <span style={{ fontWeight: 'bold' }}>{day.high_temp}°</span>
                  <span style={{ color: '#666', marginLeft: '5px' }}>{day.low_temp}°</span>
                </div>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                  {day.precipitation_chance}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ fontSize: '12px', color: '#666', marginTop: '15px', textAlign: 'right' }}>
        Last updated: {currentWeather && format(parseISO(currentWeather.timestamp), 'h:mm a')}
      </div>
    </div>
  );
}

export default WeatherWidget;