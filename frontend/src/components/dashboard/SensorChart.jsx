import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';

function SensorChart({ sensorData, sensorType, color = '#3b82f6' }) {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (sensorData && sensorData.length > 0) {
      // Process data for the chart
      const formattedData = sensorData.map(reading => {
        // Get the value based on sensor type
        let value = 0;
        if (reading.data) {
          if (sensorType === 'soil_moisture') {
            value = reading.data.soil_moisture;
          } else if (sensorType === 'temperature') {
            value = reading.data.temperature;
          } else if (sensorType === 'humidity') {
            value = reading.data.humidity;
          }
        }

        return {
          timestamp: reading.timestamp,
          value: value || 0
        };
      });

      setChartData(formattedData);
    }
  }, [sensorData, sensorType]);

  const formatXAxis = (tickItem) => {
    if (!tickItem) return '';

    try {
      const date = parseISO(tickItem);
      return format(date, 'HH:mm');
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  const tooltipFormatter = (value, name, props) => {
    return [`${value.toFixed(1)}${getSensorUnit()}`, getSensorName()];
  };

  const tooltipLabelFormatter = (label) => {
    if (!label) return '';

    try {
      const date = parseISO(label);
      return format(date, 'MMM dd, yyyy HH:mm');
    } catch (error) {
      console.error('Error formatting tooltip label:', error);
      return '';
    }
  };

  const getSensorName = () => {
    switch (sensorType) {
      case 'soil_moisture':
        return 'Soil Moisture';
      case 'temperature':
        return 'Temperature';
      case 'humidity':
        return 'Humidity';
      default:
        return 'Value';
    }
  };

  const getSensorUnit = () => {
    switch (sensorType) {
      case 'soil_moisture':
        return '%';
      case 'temperature':
        return '°C';
      case 'humidity':
        return '%';
      default:
        return '';
    }
  };

  if (chartData.length === 0) {
    return <div>No data available for chart</div>;
  }

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={formatXAxis}
            interval="preserveStartEnd"
            minTickGap={50}
          />
          <YAxis />
          <Tooltip
            formatter={tooltipFormatter}
            labelFormatter={tooltipLabelFormatter}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="value"
            name={getSensorName()}
            stroke={color}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default SensorChart;