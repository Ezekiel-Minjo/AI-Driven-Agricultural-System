import { useState, useEffect } from 'react';
import {
  exportSensorData,
  exportAlerts,
  exportRecommendations,
  exportIrrigationSchedule,
  exportYieldHistory
} from '../services/exportService';
import { getSensors } from '../services/sensorService';

function DataExport() {
  const [sensors, setSensors] = useState([]);
  const [selectedSensor, setSelectedSensor] = useState('');
  const [timeframe, setTimeframe] = useState(24);
  const [cropType, setCropType] = useState('maize');
  const [exportStatus, setExportStatus] = useState({ message: '', type: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSensors();
  }, []);

  const fetchSensors = async () => {
    try {
      const sensorsData = await getSensors();
      setSensors(sensorsData);

      if (sensorsData.length > 0) {
        setSelectedSensor(sensorsData[0].id);
      }
    } catch (error) {
      console.error('Error fetching sensors:', error);
    }
  };

  const getSensorType = (sensorId) => {
    const sensor = sensors.find(s => s.id === sensorId);
    return sensor ? sensor.type : '';
  };

  const handleExportSensorData = async () => {
    try {
      setLoading(true);
      setExportStatus({ message: '', type: '' });

      const sensorType = getSensorType(selectedSensor);
      const result = await exportSensorData(selectedSensor, sensorType, timeframe);

      setExportStatus({ message: result.message, type: 'success' });
      setLoading(false);
    } catch (error) {
      setExportStatus({ message: 'Failed to export sensor data.', type: 'error' });
      setLoading(false);
    }
  };

  const handleExportAlerts = async () => {
    try {
      setLoading(true);
      setExportStatus({ message: '', type: '' });

      const result = await exportAlerts();

      setExportStatus({ message: result.message, type: 'success' });
      setLoading(false);
    } catch (error) {
      setExportStatus({ message: 'Failed to export alerts.', type: 'error' });
      setLoading(false);
    }
  };

  const handleExportRecommendations = async () => {
    try {
      setLoading(true);
      setExportStatus({ message: '', type: '' });

      const result = await exportRecommendations();

      setExportStatus({ message: result.message, type: 'success' });
      setLoading(false);
    } catch (error) {
      setExportStatus({ message: 'Failed to export recommendations.', type: 'error' });
      setLoading(false);
    }
  };

  const handleExportIrrigationSchedule = async () => {
    try {
      setLoading(true);
      setExportStatus({ message: '', type: '' });

      const result = await exportIrrigationSchedule({ crop_type: cropType });

      setExportStatus({ message: result.message, type: 'success' });
      setLoading(false);
    } catch (error) {
      setExportStatus({ message: 'Failed to export irrigation schedule.', type: 'error' });
      setLoading(false);
    }
  };

  const handleExportYieldHistory = async () => {
    try {
      setLoading(true);
      setExportStatus({ message: '', type: '' });

      const result = await exportYieldHistory(cropType);

      setExportStatus({ message: result.message, type: 'success' });
      setLoading(false);
    } catch (error) {
      setExportStatus({ message: 'Failed to export yield history.', type: 'error' });
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Data Export</h1>

      <div className="card">
        <h3>Export Farm Data</h3>
        <p style={{ marginTop: '10px' }}>
          Export your farm data in CSV format for analysis in other tools or for record-keeping.
        </p>

        {exportStatus.message && (
          <div
            style={{
              padding: '10px',
              margin: '15px 0',
              backgroundColor: exportStatus.type === 'success' ? '#f0fdf4' : '#fef2f2',
              border: `1px solid ${exportStatus.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
              borderRadius: '8px'
            }}
          >
            {exportStatus.message}
          </div>
        )}

        <div style={{ marginTop: '20px' }}>
          <div className="card" style={{ marginBottom: '20px' }}>
            <h4>Sensor Data</h4>
            <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Select Sensor</label>
                <select
                  value={selectedSensor}
                  onChange={(e) => setSelectedSensor(e.target.value)}
                  style={{ width: '100%', padding: '8px' }}
                  disabled={loading || sensors.length === 0}
                >
                  {sensors.length === 0 ? (
                    <option value="">No sensors available</option>
                  ) : (
                    sensors.map(sensor => (
                      <option key={sensor.id} value={sensor.id}>
                        {sensor.type === 'soil_moisture' ? 'Soil Moisture' :
                          sensor.type === 'temperature' ? 'Temperature' :
                            sensor.type === 'humidity' ? 'Humidity' : sensor.type}
                        {' - '}{sensor.location}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Timeframe (hours)</label>
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(parseInt(e.target.value))}
                  style={{ width: '100%', padding: '8px' }}
                  disabled={loading}
                >
                  <option value={24}>Last 24 hours</option>
                  <option value={48}>Last 48 hours</option>
                  <option value={72}>Last 72 hours</option>
                  <option value={168}>Last week</option>
                </select>
              </div>

              <div style={{ alignSelf: 'flex-end' }}>
                <button
                  onClick={handleExportSensorData}
                  className="btn"
                  disabled={loading || !selectedSensor}
                  style={{ marginBottom: '5px' }}
                >
                  Export CSV
                </button>
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: '20px' }}>
            <h4>Alerts & Recommendations</h4>
            <div style={{ marginTop: '10px', display: 'flex', gap: '15px' }}>
              <button
                onClick={handleExportAlerts}
                className="btn"
                disabled={loading}
              >
                Export Alerts
              </button>

              <button
                onClick={handleExportRecommendations}
                className="btn"
                disabled={loading}
              >
                Export Recommendations
              </button>
            </div>
          </div>

          <div className="card" style={{ marginBottom: '20px' }}>
            <h4>Crop Data</h4>
            <div style={{ marginTop: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Crop Type</label>
              <div style={{ display: 'flex', gap: '15px' }}>
                <select
                  value={cropType}
                  onChange={(e) => setCropType(e.target.value)}
                  style={{ flex: 1, padding: '8px' }}
                  disabled={loading}
                >
                  <option value="maize">Maize</option>
                  <option value="beans">Beans</option>
                  <option value="tomatoes">Tomatoes</option>
                  <option value="wheat">Wheat</option>
                  <option value="rice">Rice</option>
                  <option value="potatoes">Potatoes</option>
                </select>

                <button
                  onClick={handleExportIrrigationSchedule}
                  className="btn"
                  disabled={loading}
                >
                  Export Irrigation Schedule
                </button>

                <button
                  onClick={handleExportYieldHistory}
                  className="btn"
                  disabled={loading}
                >
                  Export Yield History
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '20px' }}>
        <h3>Data Privacy & Usage</h3>
        <p style={{ marginTop: '10px' }}>
          All exported data is for your personal use. The CSV files contain data collected from your farm
          and can be imported into spreadsheet software like Microsoft Excel or Google Sheets for further analysis.
        </p>
        <p style={{ marginTop: '10px' }}>
          Your data privacy is important. Exported files are not stored on our servers and are delivered directly
          to your device.
        </p>
      </div>
    </div>
  );
}

export default DataExport;