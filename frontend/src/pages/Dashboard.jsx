import { useState, useEffect } from 'react';
import SensorCard from '../components/dashboard/SensorCard';
import SensorChart from '../components/dashboard/SensorChart';
import WeatherWidget from '../components/dashboard/WeatherWidget';
import WeatherForecastChart from '../components/dashboard/WeatherForecastChart';
import AdvancedAnalytics from '../components/dashboard/AdvancedAnalytics';
import CropStatusCard from '../components/dashboard/CropStatusCard';
import RecentAlertsWidget from '../components/dashboard/RecentAlertsWidget';
import ExternalWeatherWidget from '../components/dashboard/ExternalWeatherWidget';
import { getSensors, getSensorData } from '../services/sensorService';
import { getAlerts } from '../services/alertService';
import { getRecommendations } from '../services/recommendationService';
import { getFarms } from '../services/farmService';

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [sensors, setSensors] = useState([]);
  const [sensorData, setSensorData] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [farms, setFarms] = useState([]);
  const [error, setError] = useState(null);
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState(24);
  const [showAdvancedAnalytics, setShowAdvancedAnalytics] = useState(false);

  // Simulated crop data
  const cropData = {
    type: 'Maize',
    stage: 'Vegetative',
    health: 'Good',
    daysToHarvest: 45
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null); // Reset error state when fetching

        // Fetch sensors and sensor data
        let sensorsData = [];
        try {
          sensorsData = await getSensors();

          // Check if we got empty data back and use fallback if needed
          if (!sensorsData || sensorsData.length === 0) {
            throw new Error("No sensors data received");
          }

          setSensors(sensorsData);

          if (sensorsData.length > 0) {
            if (!selectedSensor) {
              setSelectedSensor(sensorsData[0].id);
            }

            // Fetch sensor data for each sensor
            const sensorDataPromises = sensorsData.map(sensor =>
              getSensorData(sensor.id, selectedTimeframe)
                .then(data => ({ [sensor.id]: data }))
                .catch(() => ({ [sensor.id]: [] })) // Handle individual sensor data fetch failures
            );

            const sensorDataResults = await Promise.all(sensorDataPromises);
            const combinedSensorData = Object.assign({}, ...sensorDataResults);
            setSensorData(combinedSensorData);
          }
        } catch (sensorErr) {
          console.error("Error fetching sensor data:", sensorErr);
          // Fall back to hardcoded data
          const hardcodedSensors = [
            { id: 'sensor-001', type: 'soil_moisture', location: 'Field 1', status: 'active' },
            { id: 'sensor-002', type: 'temperature', location: 'Field 1', status: 'active' },
            { id: 'sensor-003', type: 'humidity', location: 'Field 1', status: 'active' }
          ];

          setSensors(hardcodedSensors);
          if (!selectedSensor) {
            setSelectedSensor('sensor-001');
          }

          // Generate fake readings for each sensor
          const now = new Date();
          const fakeReadings = {};

          hardcodedSensors.forEach(sensor => {
            const readings = [];
            for (let i = 0; i < 24; i++) {
              const timestamp = new Date(now - i * 60 * 60 * 1000).toISOString();
              let value;

              if (sensor.type === 'soil_moisture') {
                value = 60 + Math.random() * 10 - 5;
              } else if (sensor.type === 'temperature') {
                value = 25 + Math.random() * 6 - 3;
              } else if (sensor.type === 'humidity') {
                value = 70 + Math.random() * 10 - 5;
              }

              readings.push({
                timestamp,
                sensor_id: sensor.id,
                data: {
                  [sensor.type]: value,
                  unit: sensor.type === 'temperature' ? '°C' : '%'
                }
              });
            }
            fakeReadings[sensor.id] = readings;
          });

          setSensorData(fakeReadings);
          sensorsData = hardcodedSensors; // Use hardcoded sensors for the rest of the function
        }

        // Fetch alerts
        try {
          const alertsData = await getAlerts();
          setAlerts(alertsData);
        } catch (alertsErr) {
          console.error("Error fetching alerts:", alertsErr);
          // Fallback alerts
          setAlerts([
            { id: 1, type: 'warning', message: 'Soil moisture dropping below optimal levels', time: '2 hours ago' },
            { id: 2, type: 'info', message: 'Light rain expected tomorrow', time: '4 hours ago' },
            { id: 3, type: 'danger', message: 'Temperature exceeding optimal range', time: '1 hour ago' }
          ]);
        }

        // Fetch recommendations
        try {
          const recommendationsData = await getRecommendations();
          setRecommendations(recommendationsData);
        } catch (recErr) {
          console.error("Error fetching recommendations:", recErr);
          // Fallback recommendations
          setRecommendations([
            {
              id: 'rec-1',
              type: 'irrigation',
              details: {
                message: 'Schedule irrigation for tomorrow morning due to decreasing soil moisture levels.',
                severity: 'high'
              },
              created_at: new Date().toISOString()
            },
            {
              id: 'rec-2',
              type: 'fertilization',
              details: {
                message: 'Apply nitrogen fertilizer within the next 5 days for optimal crop development.',
                severity: 'medium'
              },
              created_at: new Date(Date.now() - 86400000).toISOString()
            },
            {
              id: 'rec-3',
              type: 'pest_control',
              details: {
                message: 'Monitor for aphids in the coming week as conditions are favorable for infestation.',
                severity: 'medium'
              },
              created_at: new Date(Date.now() - 172800000).toISOString()
            }
          ]);
        }

        // Fetch farms
        try {
          const farmsData = await getFarms();
          setFarms(farmsData);
        } catch (farmsErr) {
          console.error("Error fetching farms:", farmsErr);
          // Fallback farms data
          setFarms([
            {
              _id: '1',
              name: 'Main Farm',
              location: 'Nairobi East',
              area_hectares: 5.2,
              crops: [
                {
                  name: 'Maize',
                  area_hectares: 3.0,
                  planting_date: '2023-03-15',
                  expected_harvest_date: '2023-07-25'
                },
                {
                  name: 'Beans',
                  area_hectares: 2.2,
                  planting_date: '2023-04-05',
                  expected_harvest_date: '2023-06-30'
                }
              ],
              created_at: '2023-01-10T08:30:00.000Z',
              updated_at: '2023-05-20T14:15:00.000Z'
            },
            {
              _id: '2',
              name: 'River Plot',
              location: 'Nairobi West',
              area_hectares: 1.8,
              crops: [
                {
                  name: 'Tomatoes',
                  area_hectares: 1.0,
                  planting_date: '2023-02-20',
                  expected_harvest_date: '2023-05-15'
                },
                {
                  name: 'Kale',
                  area_hectares: 0.8,
                  planting_date: '2023-03-10',
                  expected_harvest_date: '2023-05-01'
                }
              ],
              created_at: '2023-01-15T10:45:00.000Z',
              updated_at: '2023-03-22T09:30:00.000Z'
            }
          ]);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error in dashboard data loading:', err);
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedTimeframe, selectedSensor]);

  // Extract latest readings for each sensor
  const getLatestReading = (sensorId, dataType) => {
    // Check if we have any data for this sensor
    if (!sensorId || !sensorData[sensorId] || !sensorData[sensorId].length) {
      console.log(`No data available for sensor: ${sensorId}, dataType: ${dataType}`);
      return { value: 0, unit: dataType === 'temperature' ? '°C' : '%' };
    }

    // Log the data we're working with for debugging
    console.log(`Data for sensor ${sensorId}:`, sensorData[sensorId][0]);

    // Get the latest reading (assuming first in array is latest)
    const latestReading = sensorData[sensorId][0];

    // Safety check for data structure
    if (!latestReading || !latestReading.data) {
      console.log(`Missing data structure for sensor: ${sensorId}`);
      return { value: 0, unit: dataType === 'temperature' ? '°C' : '%' };
    }

    // Check if the data has the specific type we're looking for
    if (latestReading.data[dataType] === undefined) {
      console.log(`Data type ${dataType} not found in sensor data:`, latestReading.data);

      // Try to find any value in the data object that might be the reading
      const possibleValues = Object.values(latestReading.data).filter(v =>
        typeof v === 'number' || (typeof v === 'string' && !isNaN(parseFloat(v)))
      );

      if (possibleValues.length > 0) {
        return {
          value: Number(possibleValues[0]).toFixed(2),
          unit: latestReading.data.unit || (dataType === 'temperature' ? '°C' : '%')
        };
      }

      return { value: 0, unit: dataType === 'temperature' ? '°C' : '%' };
    }

    // Return the correctly formatted reading
    return {
      value: Number(latestReading.data[dataType]).toFixed(2),
      unit: latestReading.data.unit || (dataType === 'temperature' ? '°C' : '%')
    };
  };

  // Get sensor type
  const getSensorType = (sensorId) => {
    if (!sensorId) return '';
    const sensor = sensors.find(s => s.id === sensorId);
    return sensor ? sensor.type : '';
  };

  // Get actionable recommendations
  const getActionableRecommendations = () => {
    if (!recommendations || recommendations.length === 0) return [];

    // Get recommendations with high or medium severity
    const actionable = recommendations.filter(rec => {
      const severity = rec.details?.severity || rec.priority;
      return severity === 'high' || severity === 'medium';
    });

    // Return at most 3 recommendations
    return actionable.slice(0, 3);
  };

  if (loading) {
    return <div className="loading">Loading dashboard data...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  // Find sensors by type
  const soilMoistureSensor = sensors.find(s => s.type === 'soil_moisture');
  const temperatureSensor = sensors.find(s => s.type === 'temperature');
  const humiditySensor = sensors.find(s => s.type === 'humidity');

  // Get latest readings
  const soilMoisture = soilMoistureSensor
    ? getLatestReading(soilMoistureSensor.id, 'soil_moisture')
    : { value: 0, unit: '%' };

  const temperature = temperatureSensor
    ? getLatestReading(temperatureSensor.id, 'temperature')
    : { value: 0, unit: '°C' };

  const humidity = humiditySensor
    ? getLatestReading(humiditySensor.id, 'humidity')
    : { value: 0, unit: '%' };

  // Debug logs to help identify issues
  console.log("Debug - Sensors:", sensors);
  console.log("Debug - Sensor types:", sensors.map(s => s.type));
  console.log("Debug - SoilMoistureSensor:", soilMoistureSensor);
  console.log("Debug - TemperatureSensor:", temperatureSensor);
  console.log("Debug - HumiditySensor:", humiditySensor);
  console.log("Debug - Soil moisture value:", soilMoisture);
  console.log("Debug - Temperature value:", temperature);
  console.log("Debug - Humidity value:", humidity);

  const actionableRecommendations = getActionableRecommendations();

  return (
    <div className="dashboard">
      <h1>Farm Dashboard</h1>

      {/* Farm summary section */}
      {farms.length > 0 && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3>Farm Overview</h3>
          <div style={{ display: 'flex', gap: '20px', marginTop: '15px' }}>
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Total Farms:</div>
              <div>{farms.length}</div>
            </div>
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Total Area:</div>
              <div>{farms.reduce((sum, farm) => sum + farm.area_hectares, 0).toFixed(1)} hectares</div>
            </div>
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Primary Crops:</div>
              <div>
                {Array.from(new Set(farms.flatMap(farm => farm.crops.map(crop => crop.name)))).slice(0, 3).join(', ')}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-grid">
        <SensorCard
          title="Soil Moisture"
          value={soilMoisture.value}
          unit={soilMoisture.unit}
          icon="💧"
        />
        <SensorCard
          title="Temperature"
          value={temperature.value}
          unit={temperature.unit}
          icon="🌡️"
        />
        <SensorCard
          title="Humidity"
          value={humidity.value}
          unit={humidity.unit}
          icon="💦"
        />
      </div>

      {/* Recommendations section */}
      {actionableRecommendations.length > 0 && (
        <div className="card" style={{ marginTop: '20px' }}>
          <h3>Key Recommendations</h3>
          <div style={{ marginTop: '15px' }}>
            {actionableRecommendations.map((rec, index) => (
              <div
                key={rec.id}
                style={{
                  padding: '10px',
                  marginBottom: index < actionableRecommendations.length - 1 ? '10px' : 0,
                  borderLeft: `4px solid ${rec.details?.severity === 'high' ? '#ef4444' : '#f59e0b'}`,
                  backgroundColor: '#f8fafc'
                }}
              >
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                  {rec.type.charAt(0).toUpperCase() + rec.type.slice(1).replace('_', ' ')}
                </div>
                <div>{rec.details?.message || rec.message}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', marginBottom: '10px' }}>
        <h2>Analytics</h2>
        <button
          className="btn"
          onClick={() => setShowAdvancedAnalytics(!showAdvancedAnalytics)}
        >
          {showAdvancedAnalytics ? 'Show Simple View' : 'Show Advanced Analytics'}
        </button>
      </div>

      {showAdvancedAnalytics ? (
        <AdvancedAnalytics sensors={sensors} />
      ) : (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
            <h3>Sensor Data Trend</h3>
            <div>
              <select
                value={selectedSensor || ''}
                onChange={(e) => setSelectedSensor(e.target.value)}
                style={{ marginRight: '10px', padding: '5px' }}
              >
                <option value="">Select Sensor</option>
                {sensors.map(sensor => (
                  <option key={sensor.id} value={sensor.id}>
                    {sensor.type === 'soil_moisture' ? 'Soil Moisture' :
                      sensor.type === 'temperature' ? 'Temperature' :
                        sensor.type === 'humidity' ? 'Humidity' : sensor.type}
                  </option>
                ))}
              </select>

              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(parseInt(e.target.value))}
                style={{ padding: '5px' }}
              >
                <option value={6}>Last 6 hours</option>
                <option value={12}>Last 12 hours</option>
                <option value={24}>Last 24 hours</option>
                <option value={48}>Last 48 hours</option>
              </select>
            </div>
          </div>

          {selectedSensor ? (
            <SensorChart
              sensorData={sensorData[selectedSensor] || []}
              sensorType={getSensorType(selectedSensor)}
              color={
                getSensorType(selectedSensor) === 'soil_moisture' ? '#3b82f6' :
                  getSensorType(selectedSensor) === 'temperature' ? '#ef4444' :
                    '#10b981'
              }
            />
          ) : (
            <p>Select a sensor to view data trend</p>
          )}
        </div>
      )}

      <div className="card" style={{ marginTop: '20px' }}>
        <WeatherForecastChart />
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginTop: '20px', gap: '20px' }}>
        <WeatherWidget />
        <CropStatusCard crop={cropData} />
        <ExternalWeatherWidget />
      </div>


      <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(1, 1fr)', marginTop: '20px' }}>
        <RecentAlertsWidget alerts={alerts} />
      </div>
    </div>
  );
}

export default Dashboard;