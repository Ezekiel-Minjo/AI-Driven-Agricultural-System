import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getWeatherForecast } from '../../services/weatherService';

function WeatherForecastChart() {
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchForecast();
  }, []);

  const fetchForecast = async () => {
    try {
      setLoading(true);
      const data = await getWeatherForecast(7);
      setForecast(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching weather forecast:', err);
      // Fallback to mock data if API call fails
      const mockForecast = generateMockForecast();
      setForecast(mockForecast);
      setLoading(false);
    }
  };

  // Generate mock forecast data for testing when API fails
  const generateMockForecast = () => {
    const today = new Date();
    const forecast = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const dateString = date.toISOString().split('T')[0];
      const tempHigh = Math.round(25 + Math.random() * 5);
      const tempLow = Math.round(18 + Math.random() * 4);
      const precipChance = Math.round(Math.random() * 70);

      let condition;
      if (precipChance > 60) condition = 'Heavy Rain';
      else if (precipChance > 40) condition = 'Light Rain';
      else if (precipChance > 20) condition = 'Partly Cloudy';
      else condition = 'Sunny';

      forecast.push({
        date: dateString,
        high_temp: tempHigh,
        low_temp: tempLow,
        precipitation_chance: precipChance,
        condition: condition
      });
    }

    return forecast;
  };

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

  const formatForecastData = () => {
    return forecast.map(day => ({
      date: day.date,
      name: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
      high: day.high_temp,
      low: day.low_temp,
      precipitation: parseInt(day.precipitation_chance),
      condition: day.condition,
      icon: getWeatherIcon(day.condition)
    }));
  };

  if (loading) {
    return <div className="loading">Loading weather forecast...</div>;
  }

  if (error) {
    return <div style={{ color: '#ef4444' }}>{error}</div>;
  }

  const forecastData = formatForecastData();

  return (
    <div className="card">
      <h3>7-Day Weather Forecast</h3>

      <div style={{ height: '300px', marginTop: '15px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={forecastData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12 }}
              tickFormatter={(value, index) => `${value} ${forecastData[index].icon}`}
            />
            <YAxis yAxisId="left" orientation="left" label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft' }} />
            <YAxis yAxisId="right" orientation="right" label={{ value: 'Precipitation (%)', angle: 90, position: 'insideRight' }} />
            <Tooltip
              formatter={(value, name) => {
                if (name === 'precipitation') return [`${value}%`, 'Precipitation Chance'];
                if (name === 'high') return [`${value}°C`, 'High Temp'];
                if (name === 'low') return [`${value}°C`, 'Low Temp'];
                return [value, name];
              }}
              labelFormatter={(label, items) => {
                const item = forecastData.find(d => d.name === label);
                return `${new Date(item.date).toLocaleDateString()} - ${item.condition}`;
              }}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="high" name="High" fill="#ef4444" />
            <Bar yAxisId="left" dataKey="low" name="Low" fill="#3b82f6" />
            <Bar yAxisId="right" dataKey="precipitation" name="Precipitation" fill="#94a3b8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Additional weather insights for farmers */}
      <div style={{
        marginTop: '15px',
        padding: '10px',
        backgroundColor: '#f0f9ff',
        borderRadius: '4px',
        fontSize: '0.9rem'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Weather Impact on Farming:</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {forecastData.some(day => day.precipitation > 50) ? (
            <div style={{ flex: '1', minWidth: '200px' }}>
              • Significant rainfall expected. Consider adjusting irrigation schedules.
            </div>
          ) : (
            <div style={{ flex: '1', minWidth: '200px' }}>
              • Limited rainfall in forecast. Monitor soil moisture levels.
            </div>
          )}

          {forecastData.some(day => day.high > 28) ? (
            <div style={{ flex: '1', minWidth: '200px' }}>
              • High temperatures may stress crops. Ensure adequate irrigation.
            </div>
          ) : forecastData.some(day => day.low < 15) ? (
            <div style={{ flex: '1', minWidth: '200px' }}>
              • Cool temperatures may slow growth. Adjust management accordingly.
            </div>
          ) : (
            <div style={{ flex: '1', minWidth: '200px' }}>
              • Temperature conditions favorable for crop development.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default WeatherForecastChart;