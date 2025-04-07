import { useState, useEffect } from 'react';
import { createSensor, updateSensor } from '../../services/sensorManagementService';

function SensorModal({ sensor, mode, sensorTypes, farms, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    location: '',
    field_id: '',
    farmer_id: 'farmer-001', // Default farmer ID
    configuration: {}
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [fields, setFields] = useState([]);

  useEffect(() => {
    // If editing, pre-fill the form with sensor data
    if (mode === 'edit' && sensor) {
      setFormData({
        name: sensor.name,
        type: sensor.type,
        location: sensor.location,
        field_id: sensor.field_id,
        farmer_id: sensor.farmer_id,
        configuration: { ...sensor.configuration }
      });
      setSelectedType(sensor.type);
    } else if (sensorTypes && Object.keys(sensorTypes).length > 0) {
      // For new sensor, set default type to the first available
      const defaultType = Object.keys(sensorTypes)[0];
      setFormData(prev => ({
        ...prev,
        type: defaultType,
        configuration: getDefaultConfiguration(defaultType)
      }));
      setSelectedType(defaultType);
    }

    // If farms are available, get fields from the first farm
    if (farms.length > 0) {
      const firstFarm = farms[0];
      if (firstFarm.crops && firstFarm.crops.length > 0) {
        setFields(firstFarm.crops.map(crop => ({
          id: crop.field_id || firstFarm._id,
          name: `${firstFarm.name} - ${crop.name}`
        })));

        // Set default field
        if (!formData.field_id && firstFarm._id) {
          setFormData(prev => ({
            ...prev,
            field_id: firstFarm._id
          }));
        }
      }
    }
  }, [sensor, mode, sensorTypes, farms]);

  const getDefaultConfiguration = (type) => {
    if (!sensorTypes[type]) return {};

    const defaultConfig = {};
    const configOptions = sensorTypes[type].configuration_options;

    for (const [key, option] of Object.entries(configOptions)) {
      defaultConfig[key] = option.default;
    }

    return defaultConfig;
  };

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setSelectedType(newType);

    // Update form data with new type and default configuration
    setFormData(prev => ({
      ...prev,
      type: newType,
      configuration: getDefaultConfiguration(newType)
    }));
  };

  const handleFarmChange = (e) => {
    const farmId = e.target.value;

    // Find the selected farm
    const selectedFarm = farms.find(farm => farm._id === farmId);

    // Update fields based on the selected farm
    if (selectedFarm && selectedFarm.crops) {
      setFields(selectedFarm.crops.map(crop => ({
        id: crop.field_id || selectedFarm._id,
        name: `${selectedFarm.name} - ${crop.name}`
      })));

      // Set default field
      if (selectedFarm._id) {
        setFormData(prev => ({
          ...prev,
          field_id: selectedFarm._id
        }));
      }
    } else {
      setFields([]);
    }
  };

  const handleConfigChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      configuration: {
        ...prev.configuration,
        [key]: value
      }
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      if (mode === 'edit') {
        await updateSensor(sensor.id, formData);
      } else {
        await createSensor(formData);
      }

      setLoading(false);
      onClose(true); // Close modal and refresh
    } catch (err) {
      console.error('Error saving sensor:', err);
      setError('Failed to save sensor. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div className="modal-content" style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '20px',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>{mode === 'edit' ? 'Edit Sensor' : 'Add New Sensor'}</h2>
          <button
            onClick={() => onClose(false)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer'
            }}
          >
            &times;
          </button>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            color: '#ef4444',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Sensor Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Main Field Moisture Sensor"
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #d1d5db'
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Sensor Type *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleTypeChange}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #d1d5db'
              }}
              required
            >
              <option value="">Select a sensor type</option>
              {Object.entries(sensorTypes).map(([type, info]) => (
                <option key={type} value={type}>{info.name}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Farm *
            </label>
            <select
              name="farm_id"
              value={farms.find(farm => farm._id === formData.field_id)?._id || ''}
              onChange={handleFarmChange}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #d1d5db'
              }}
              required
            >
              <option value="">Select a farm</option>
              {farms.map(farm => (
                <option key={farm._id} value={farm._id}>{farm.name}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Field *
            </label>
            <select
              name="field_id"
              value={formData.field_id}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #d1d5db'
              }}
              required
            >
              <option value="">Select a field</option>
              {fields.map(field => (
                <option key={field.id} value={field.id}>{field.name}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Location Description *
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., North corner, 50m from the road"
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #d1d5db'
              }}
              required
            />
          </div>

          {selectedType && sensorTypes[selectedType] && (
            <div style={{ marginBottom: '15px' }}>
              <h3 style={{ marginBottom: '10px' }}>Configuration Options</h3>

              {Object.entries(sensorTypes[selectedType].configuration_options).map(([key, option]) => (
                <div key={key} style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>
                    {option.label}
                  </label>
                  <input
                    type={option.type}
                    value={formData.configuration[key] || option.default}
                    onChange={(e) => handleConfigChange(key, option.type === 'number' ? parseFloat(e.target.value) : e.target.value)}
                    min={option.min}
                    max={option.max}
                    step={option.step || (option.type === 'number' ? 0.1 : undefined)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '4px',
                      border: '1px solid #d1d5db'
                    }}
                  />
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                    Range: {option.min} - {option.max} {sensorTypes[selectedType].unit}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button
              type="button"
              onClick={() => onClose(false)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn"
              disabled={loading}
              style={{
                padding: '8px 16px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {loading ? 'Saving...' : mode === 'edit' ? 'Update Sensor' : 'Add Sensor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SensorModal;