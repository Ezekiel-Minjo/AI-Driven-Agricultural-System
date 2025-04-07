import { useState, useEffect } from 'react';
import {
  LineChart, Line,
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
  ComposedChart, Scatter
} from 'recharts';
import { getSensorData } from '../../services/sensorService';

function AdvancedAnalytics({ sensors }) {
  const [timeframe, setTimeframe] = useState(48);
  const [sensorData, setSensorData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeChart, setActiveChart] = useState('multiline');

  const COLORS = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#6366f1'];

  useEffect(() => {
    if (sensors.length > 0) {
      fetchAllSensorData();
    }
  }, [sensors, timeframe]);

  const fetchAllSensorData = async () => {
    try {
      setLoading(true);
      const promises = sensors.map(sensor =>
        getSensorData(sensor.id, timeframe)
          .then(data => ({ [sensor.id]: data }))
      );

      const results = await Promise.all(promises);
      const combinedData = Object.assign({}, ...results);
      setSensorData(combinedData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching sensor data:', err);
      setError('Failed to load sensor data');
      setLoading(false);
    }
  };

  const formatSensorData = () => {
    if (Object.keys(sensorData).length === 0) return [];

    // Create a unified timeline of all readings
    const timelineMap = new Map();

    // Go through each sensor's readings and organize by timestamp
    Object.entries(sensorData).forEach(([sensorId, readings]) => {
      const sensor = sensors.find(s => s.id === sensorId);
      if (!sensor) return;

      readings.forEach(reading => {
        const timestamp = reading.timestamp;
        if (!timelineMap.has(timestamp)) {
          timelineMap.set(timestamp, { timestamp });
        }

        const entry = timelineMap.get(timestamp);

        // Add sensor reading to the entry
        if (sensor.type === 'soil_moisture' && reading.data?.soil_moisture) {
          entry.soil_moisture = reading.data.soil_moisture;
        } else if (sensor.type === 'temperature' && reading.data?.temperature) {
          entry.temperature = reading.data.temperature;
        } else if (sensor.type === 'humidity' && reading.data?.humidity) {
          entry.humidity = reading.data.humidity;
        }
      });
    });

    // Convert map to array and sort by timestamp
    return Array.from(timelineMap.values())
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  };

  const formatComparisonData = () => {
    const formattedData = formatSensorData();

    // Calculate daily averages
    const dailyMap = new Map();

    formattedData.forEach(reading => {
      const date = new Date(reading.timestamp).toISOString().split('T')[0];

      if (!dailyMap.has(date)) {
        dailyMap.set(date, {
          date,
          soil_moisture_sum: 0,
          soil_moisture_count: 0,
          temperature_sum: 0,
          temperature_count: 0,
          humidity_sum: 0,
          humidity_count: 0
        });
      }

      const entry = dailyMap.get(date);

      if (reading.soil_moisture !== undefined) {
        entry.soil_moisture_sum += reading.soil_moisture;
        entry.soil_moisture_count += 1;
      }

      if (reading.temperature !== undefined) {
        entry.temperature_sum += reading.temperature;
        entry.temperature_count += 1;
      }

      if (reading.humidity !== undefined) {
        entry.humidity_sum += reading.humidity;
        entry.humidity_count += 1;
      }
    });

    // Calculate averages
    return Array.from(dailyMap.values()).map(day => ({
      date: day.date,
      soil_moisture: day.soil_moisture_count ?
        day.soil_moisture_sum / day.soil_moisture_count : undefined,
      temperature: day.temperature_count ?
        day.temperature_sum / day.temperature_count : undefined,
      humidity: day.humidity_count ?
        day.humidity_sum / day.humidity_count : undefined
    })).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const createCorrelationData = () => {
    const data = formatSensorData();
    return data.filter(d => d.soil_moisture && d.temperature)
      .map(d => ({
        soil_moisture: d.soil_moisture,
        temperature: d.temperature,
        timestamp: d.timestamp
      }));
  };

  const createDistributionData = () => {
    const data = formatSensorData();

    // For soil moisture
    const moistureBins = [0, 20, 40, 60, 80, 100];
    const moistureCounts = Array(moistureBins.length - 1).fill(0);

    data.forEach(d => {
      if (d.soil_moisture !== undefined) {
        for (let i = 0; i < moistureBins.length - 1; i++) {
          if (d.soil_moisture >= moistureBins[i] && d.soil_moisture < moistureBins[i + 1]) {
            moistureCounts[i]++;
            break;
          }
        }
      }
    });

    return moistureBins.slice(0, -1).map((bin, i) => ({
      name: `${bin}-${moistureBins[i + 1]}%`,
      value: moistureCounts[i]
    }));
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <div className="loading">Loading advanced analytics...</div>;
  }

  if (error) {
    return <div style={{ color: '#ef4444' }}>{error}</div>;
  }

  const unifiedData = formatSensorData();
  const comparisonData = formatComparisonData();
  const correlationData = createCorrelationData();
  const distributionData = createDistributionData();

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3>Advanced Analytics</h3>

        <div style={{ display: 'flex', gap: '10px' }}>
          <select
            value={activeChart}
            onChange={(e) => setActiveChart(e.target.value)}
            style={{ padding: '5px' }}
          >
            <option value="multiline">Multi-Line Chart</option>
            <option value="area">Area Chart</option>
            <option value="bar">Bar Comparison</option>
            <option value="scatter">Correlation</option>
            <option value="pie">Distribution</option>
          </select>

          <select
            value={timeframe}
            onChange={(e) => setTimeframe(parseInt(e.target.value))}
            style={{ padding: '5px' }}
          >
            <option value={24}>Last 24 hours</option>
            <option value={48}>Last 48 hours</option>
            <option value={72}>Last 72 hours</option>
            <option value={168}>Last week</option>
          </select>
        </div>
      </div>

      <div style={{ height: '400px' }}>
        {activeChart === 'multiline' && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={unifiedData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={formatTimestamp}
                minTickGap={50}
              />
              <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" domain={[0, 100]} />
              <YAxis yAxisId="right" orientation="right" stroke="#ef4444" domain={[0, 40]} />
              <Tooltip
                labelFormatter={(label) => new Date(label).toLocaleString()}
                formatter={(value, name) => {
                  if (name === 'soil_moisture' || name === 'humidity') {
                    return [`${value.toFixed(1)}%`, name === 'soil_moisture' ? 'Soil Moisture' : 'Humidity'];
                  }
                  return [`${value.toFixed(1)}°C`, 'Temperature'];
                }}
              />
              <Legend />
              {unifiedData.some(d => d.soil_moisture !== undefined) && (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="soil_moisture"
                  name="Soil Moisture"
                  stroke="#3b82f6"
                  activeDot={{ r: 8 }}
                />
              )}
              {unifiedData.some(d => d.temperature !== undefined) && (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="temperature"
                  name="Temperature"
                  stroke="#ef4444"
                  activeDot={{ r: 8 }}
                />
              )}
              {unifiedData.some(d => d.humidity !== undefined) && (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="humidity"
                  name="Humidity"
                  stroke="#10b981"
                  activeDot={{ r: 8 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        )}

        {activeChart === 'area' && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={unifiedData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={formatTimestamp}
                minTickGap={50}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(label) => new Date(label).toLocaleString()}
                formatter={(value, name) => {
                  if (name === 'soil_moisture' || name === 'humidity') {
                    return [`${value.toFixed(1)}%`, name === 'soil_moisture' ? 'Soil Moisture' : 'Humidity'];
                  }
                  return [`${value.toFixed(1)}°C`, 'Temperature'];
                }}
              />
              <Legend />
              {unifiedData.some(d => d.soil_moisture !== undefined) && (
                <Area
                  type="monotone"
                  dataKey="soil_moisture"
                  name="Soil Moisture"
                  fill="#3b82f6"
                  stroke="#3b82f6"
                  fillOpacity={0.3}
                />
              )}
              {unifiedData.some(d => d.temperature !== undefined) && (
                <Area
                  type="monotone"
                  dataKey="temperature"
                  name="Temperature"
                  fill="#ef4444"
                  stroke="#ef4444"
                  fillOpacity={0.3}
                />
              )}
              {unifiedData.some(d => d.humidity !== undefined) && (
                <Area
                  type="monotone"
                  dataKey="humidity"
                  name="Humidity"
                  fill="#10b981"
                  stroke="#10b981"
                  fillOpacity={0.3}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        )}

        {activeChart === 'bar' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={comparisonData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" domain={[0, 100]} />
              <YAxis yAxisId="right" orientation="right" stroke="#ef4444" domain={[0, 40]} />
              <Tooltip />
              <Legend />
              {comparisonData.some(d => d.soil_moisture !== undefined) && (
                <Bar
                  yAxisId="left"
                  dataKey="soil_moisture"
                  name="Soil Moisture (%)"
                  fill="#3b82f6"
                />
              )}
              {comparisonData.some(d => d.temperature !== undefined) && (
                <Bar
                  yAxisId="right"
                  dataKey="temperature"
                  name="Temperature (°C)"
                  fill="#ef4444"
                />
              )}
              {comparisonData.some(d => d.humidity !== undefined) && (
                <Bar
                  yAxisId="left"
                  dataKey="humidity"
                  name="Humidity (%)"
                  fill="#10b981"
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        )}

        {activeChart === 'scatter' && (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={correlationData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="soil_moisture"
                type="number"
                name="Soil Moisture"
                unit="%"
                domain={[0, 100]}
              />
              <YAxis
                dataKey="temperature"
                type="number"
                name="Temperature"
                unit="°C"
                domain={[0, 40]}
              />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                formatter={(value, name) => [`${value.toFixed(1)}${name === 'soil_moisture' ? '%' : '°C'}`, name === 'soil_moisture' ? 'Soil Moisture' : 'Temperature']}
                labelFormatter={() => 'Correlation'}
              />
              <Scatter
                name="Soil Moisture vs Temperature"
                data={correlationData}
                fill="#6366f1"
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}

        {activeChart === 'pie' && (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={distributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
              >
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} readings`, 'Count']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      <div style={{ marginTop: '15px' }}>
        <h4>Analytics Insights</h4>
        <div style={{ marginTop: '10px' }}>
          {activeChart === 'multiline' && (
            <p>
              The multi-line chart shows the trends of soil moisture, temperature, and humidity over time.
              Look for patterns and relationships between these parameters.
            </p>
          )}
          {activeChart === 'area' && (
            <p>
              The area chart highlights the overall volume and trends of each parameter over time,
              making it easier to see the dominant factors in your field conditions.
            </p>
          )}
          {activeChart === 'bar' && (
            <p>
              This bar chart shows daily averages, allowing you to compare conditions across different days
              and identify day-to-day changes in your farm environment.
            </p>
          )}
          {activeChart === 'scatter' && (
            <p>
              The scatter plot reveals the correlation between soil moisture and temperature.
              Clustered points indicate common conditions on your farm.
            </p>
          )}
          {activeChart === 'pie' && (
            <p>
              This distribution chart shows how often your soil moisture falls within different ranges,
              helping you understand the typical conditions in your field.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdvancedAnalytics;