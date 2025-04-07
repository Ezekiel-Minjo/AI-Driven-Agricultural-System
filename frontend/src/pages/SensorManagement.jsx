// src/pages/SensorManagement.jsx
import { useState, useEffect } from 'react';
import { getSensors } from '../services/sensorService';

function SensorManagement() {
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedSensor, setSelectedSensor] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    type: 'soil_moisture',
    location: '',
    status: 'active'
  });

  useEffect(() => {
    fetchSensors();
  }, []);

  const fetchSensors = async () => {
    try {
      setLoading(true);
      const data = await getSensors();
      setSensors(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching sensors:', err);
      setError('Failed to load sensors. Please try again later.');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSelectSensor = (sensor) => {
    setSelectedSensor(sensor);
    setIsEditing(false);
    setIsAddingNew(false);
  };

  const handleEditSensor = () => {
    if (!selectedSensor) return;
    setFormData({
      type: selectedSensor.type,
      location: selectedSensor.location,
      status: selectedSensor.status
    });
    setIsEditing(true);
    setIsAddingNew(false);
  };

  const handleAddNewSensor = () => {
    setFormData({
      type: 'soil_moisture',
      location: '',
      status: 'active'
    });
    setIsAddingNew(true);
    setIsEditing(false);
    setSelectedSensor(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // In a real app, this would call the API to create/update a sensor
    console.log('Submitting form:', formData);
    // Reset form and states
    setIsAddingNew(false);
    setIsEditing(false);
  };

  if (loading) {
    return <div className="loading">Loading sensors...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div>
      <h1>Sensor Management</h1>

      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ width: '250px' }}>
          <div className="card">
            <h3>My Sensors</h3>
            <ul style={{ listStyle: 'none', padding: 0, marginTop: '15px' }}>
              {sensors.map(sensor => (
                <li
                  key={sensor.id}
                  onClick={() => handleSelectSensor(sensor)}
                  style={{
                    padding: '10px',
                    marginBottom: '5px',
                    cursor: 'pointer',
                    backgroundColor: selectedSensor && selectedSensor.id === sensor.id ? '#f0f9ff' : 'transparent',
                    borderRadius: '4px'
                  }}
                >
                  <div style={{ fontWeight: 'bold' }}>
                    {sensor.type === 'soil_moisture' ? 'Soil Moisture' :
                      sensor.type === 'temperature' ? 'Temperature' :
                        sensor.type === 'humidity' ? 'Humidity' : sensor.type}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    {sensor.location}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    padding: '2px 6px',
                    borderRadius: '9999px',
                    backgroundColor: sensor.status === 'active' ? '#dcfce7' : '#fee2e2',
                    color: sensor.status === 'active' ? '#16a34a' : '#dc2626',
                    display: 'inline-block',
                    marginTop: '5px'
                  }}>
                    {sensor.status}
                  </div>
                </li>
              ))}
            </ul>
            <button
              className="btn"
              onClick={handleAddNewSensor}
              style={{ width: '100%', marginTop: '15px' }}
            >
              Add New Sensor
            </button>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          {isAddingNew || isEditing ? (
            <div className="card">
              <h3>{isAddingNew ? 'Add New Sensor' : 'Edit Sensor'}</h3>
              <form onSubmit={handleSubmit} style={{ marginTop: '15px' }}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>
                    Sensor Type
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '8px' }}
                  >
                    <option value="soil_moisture">Soil Moisture</option>
                    <option value="temperature">Temperature</option>
                    <option value="humidity">Humidity</option>
                    <option value="rainfall">Rainfall</option>
                  </select>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g., Field 1, North Corner"
                    style={{ width: '100%', padding: '8px' }}
                  />
                </div>
                {isEditing && (
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '8px' }}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                )}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" className="btn">
                    {isAddingNew ? 'Add Sensor' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => {
                      setIsAddingNew(false);
                      setIsEditing(false);
                    }}
                    style={{ backgroundColor: '#6b7280' }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : selectedSensor ? (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>Sensor Details</h3>
                <div>
                  <button
                    className="btn"
                    onClick={handleEditSensor}
                    style={{ marginRight: '10px' }}
                  >
                    Edit
                  </button>
                  <button
                    className="btn"
                    onClick={() => {
                      // In a real app, this would call the API to delete the sensor
                      if (window.confirm('Are you sure you want to delete this sensor?')) {
                        console.log('Deleting sensor:', selectedSensor.id);
                      }
                    }}
                    style={{ backgroundColor: '#ef4444' }}
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div style={{ marginTop: '20px' }}>
                <div style={{ marginBottom: '10px' }}>
                  <strong>ID:</strong> {selectedSensor.id}
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <strong>Type:</strong> {
                    selectedSensor.type === 'soil_moisture' ? 'Soil Moisture' :
                      selectedSensor.type === 'temperature' ? 'Temperature' :
                        selectedSensor.type === 'humidity' ? 'Humidity' : selectedSensor.type
                  }
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <strong>Location:</strong> {selectedSensor.location}
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <strong>Status:</strong>
                  <span style={{
                    padding: '2px 6px',
                    borderRadius: '9999px',
                    backgroundColor: selectedSensor.status === 'active' ? '#dcfce7' : '#fee2e2',
                    color: selectedSensor.status === 'active' ? '#16a34a' : '#dc2626',
                    display: 'inline-block',
                    marginLeft: '5px'
                  }}>
                    {selectedSensor.status}
                  </span>
                </div>
              </div>

              <div style={{ marginTop: '20px' }}>
                <h4>Current Reading</h4>
                <div
                  style={{
                    marginTop: '10px',
                    padding: '15px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px'
                  }}
                >
                  {selectedSensor.type === 'soil_moisture' && (
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                      65% <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#6b7280' }}>Moisture Level</span>
                    </div>
                  )}
                  {selectedSensor.type === 'temperature' && (
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                      25°C <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#6b7280' }}>Temperature</span>
                    </div>
                  )}
                  {selectedSensor.type === 'humidity' && (
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                      70% <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#6b7280' }}>Humidity</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="card">
              <h3>Sensor Management</h3>
              <p style={{ marginTop: '15px' }}>
                Select a sensor from the list or add a new one to get started.
              </p>
              <div style={{ marginTop: '20px' }}>
                <button
                  className="btn"
                  onClick={handleAddNewSensor}
                >
                  Add New Sensor
                </button>
              </div>
            </div>
          )}

          <div className="card" style={{ marginTop: '20px' }}>
            <h3>About Sensors</h3>
            <p style={{ marginTop: '10px' }}>
              Sensors collect real-time data about your farm's conditions. The system supports the following sensor types:
            </p>
            <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
              <li><strong>Soil Moisture Sensors</strong> - Measure water content in soil</li>
              <li><strong>Temperature Sensors</strong> - Monitor air temperature</li>
              <li><strong>Humidity Sensors</strong> - Track atmospheric humidity</li>
              <li><strong>Rainfall Sensors</strong> - Measure precipitation</li>
            </ul>
            <p style={{ marginTop: '10px' }}>
              In this simulation, sensor readings are generated automatically. In a real-world deployment,
              these would connect to physical IoT sensors in your fields.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SensorManagement;