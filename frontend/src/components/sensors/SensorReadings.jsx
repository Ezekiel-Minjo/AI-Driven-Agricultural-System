// src/components/sensors/SensorReadings.jsx

import { useState, useEffect } from 'react';
import { getSensorData } from '../../services/sensorService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function SensorReadings({ sensor, timeframe = 24 }) {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (sensor) {
      fetchSensorData();
    }
  }, [sensor, timeframe]);

  const fetchSensorData = async () => {
    try {
      setLoading(true);
      const data = await getSensorData(sensor.id, timeframe);
      setReadings(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching sensor data:', err);
      setError('Failed to load sensor readings');
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const getSensorValueKey = () => {
    switch (sensor.type) {
      case 'soil_moisture':
        return 'soil_moisture';
      case 'temperature':
        return 'temperature';
      case 'humidity':
        return 'humidity';
      case 'rainfall':
        return 'rainfall';
      case 'light':
        return 'light';
      default:
        return 'value';
    }
  };

  const getUnit = () => {
    switch (sensor.type) {
      case 'soil_moisture':
        return '%';
      case 'temperature':
        return '°C';
      case 'humidity':
        return '%';
      case 'rainfall':
        return 'mm';
      case 'light':
        return 'lux';
      default:
        return '';
    }
  };

  const getChartColor = () => {
    switch (sensor.type) {
      case 'soil_moisture':
        return '#3b82f6'; // blue
      case 'temperature':
        return '#ef4444'; // red
      case 'humidity':
        return '#10b981'; // green
      case 'rainfall':
        return '#6366f1'; // indigo
      case 'light':
        return '#f59e0b'; // amber
      default:
        return '#6b7280'; // gray
    }
  };

  // Format data for chart
  const chartData = readings.map(reading => {
    const valueKey = getSensorValueKey();
    return {
      timestamp: reading.timestamp,
      [valueKey]: reading.data?.[valueKey] || 0
    };
  });

  if (loading) {
    return <div className="loading">Loading sensor data...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div>
      <h3>{sensor.name} - Last {timeframe} Hours</h3>

      <div style={{ height: '300px', marginTop: '15px' }}>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={formatTimestamp}
                minTickGap={50}
              />
              <YAxis
                label={{
                  value: `${sensor.type} (${getUnit()})`,
                  angle: -90,
                  position: 'insideLeft'
                }}
              />
              <Tooltip
                labelFormatter={(label) => new Date(label).toLocaleString()}
                formatter={(value) => [
                  `${value.toFixed(1)} ${getUnit()}`,
                  sensor.type
                ]}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey={getSensorValueKey()}
                stroke={getChartColor()}
                dot={{ r: 2 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <p>No data available for this sensor in the selected timeframe</p>
          </div>
        )}
      </div>

      <div style={{ marginTop: '15px' }}>
        <h4>Sensor Details</h4>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <tbody>
            <tr>
              <th style={{ textAlign: 'left', padding: '8px', backgroundColor: '#f8fafc', width: '30%' }}>Type:</th>
              <td style={{ padding: '8px' }}>{sensor.type}</td>
            </tr>
            <tr>
              <th style={{ textAlign: 'left', padding: '8px', backgroundColor: '#f8fafc' }}>Location:</th>
              <td style={{ padding: '8px' }}>{sensor.location}</td>
            </tr>
            <tr>
              <th style={{ textAlign: 'left', padding: '8px', backgroundColor: '#f8fafc' }}>Status:</th>
              <td style={{ padding: '8px' }}>{sensor.status}</td>
            </tr>
            <tr>
              <th style={{ textAlign: 'left', padding: '8px', backgroundColor: '#f8fafc' }}>Reading Interval:</th>
              <td style={{ padding: '8px' }}>{sensor.configuration?.reading_interval || 'N/A'} minutes</td>
            </tr>
            {sensor.configuration?.alert_threshold && (
              <tr>
                <th style={{ textAlign: 'left', padding: '8px', backgroundColor: '#f8fafc' }}>Alert Threshold:</th>
                <td style={{ padding: '8px' }}>{sensor.configuration.alert_threshold} {getUnit()}</td>
              </tr>
            )}
            {sensor.configuration?.alert_threshold_low && (
              <tr>
                <th style={{ textAlign: 'left', padding: '8px', backgroundColor: '#f8fafc' }}>Low Alert Threshold:</th>
                <td style={{ padding: '8px' }}>{sensor.configuration.alert_threshold_low} {getUnit()}</td>
              </tr>
            )}
            {sensor.configuration?.alert_threshold_high && (
              <tr>
                <th style={{ textAlign: 'left', padding: '8px', backgroundColor: '#f8fafc' }}>High Alert Threshold:</th>
                <td style={{ padding: '8px' }}>{sensor.configuration.alert_threshold_high} {getUnit()}</td>
              </tr>
            )}
            <tr>
              <th style={{ textAlign: 'left', padding: '8px', backgroundColor: '#f8fafc' }}>Calibration Factor:</th>
              <td style={{ padding: '8px' }}>{sensor.configuration?.calibration_factor || '1.0'}</td>
            </tr>
            <tr>
              <th style={{ textAlign: 'left', padding: '8px', backgroundColor: '#f8fafc' }}>Last Update:</th>
              <td style={{ padding: '8px' }}>{new Date(sensor.updated_at).toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SensorReadings;