import { useEffect, useState } from 'react';
import { getExternalWeather } from '../../services/weatherService';

function ExternalWeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    try {
      setLoading(true);
      // Using default coordinates (can be replaced with farm's actual coordinates)
      const data = await getExternalWeather(1.2921, 36.8219);
      setWeather(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching weather:', err);
      setError('Failed to load weather data');
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading weather data...</div>;
  }

  if (error) {
    return <div style={{ color: '#ef4444' }}>{error}</div>;
  }

  if (!weather) {
    return <div>No weather data available</div>;
  }

  return (
    <div className="card">
      <h3>Weather Forecast</h3>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        marginTop: '15px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <img
            src={`http://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
            alt={weather.weather[0].description}
            style={{ width: '80px', height: '80px' }}
          />
          <div>{weather.weather[0].main}</div>
        </div>
        <div>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>
            {Math.round(weather.main.temp)}°C
          </div>
          <div>
            Feels like: {Math.round(weather.main.feels_like)}°C
          </div>
        </div>
        <div>
          <div><strong>Humidity:</strong> {weather.main.humidity}%</div>
          <div><strong>Wind:</strong> {weather.wind.speed} m/s</div>
          <div><strong>Pressure:</strong> {weather.main.pressure} hPa</div>
        </div>
      </div>
      <div style={{
        marginTop: '15px',
        padding: '10px',
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        fontSize: '14px'
      }}>
        <div>
          <strong>Location:</strong>{weather.name}, {weather.sys.country}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
          <div>
            <strong>Sunrise:</strong> {new Date(weather.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div>
            <strong>Sunset:</strong> {new Date(weather.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExternalWeatherWidget;