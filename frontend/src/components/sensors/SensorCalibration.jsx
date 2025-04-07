import { useState } from 'react';
import { updateSensor } from '../../services/sensorManagementService';

function SensorCalibration({ sensor, onCalibrationComplete }) {
  const [referenceValue, setReferenceValue] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

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

  const handleCalibrate = async (e) => {
    e.preventDefault();

    if (!referenceValue || !currentValue) {
      setError('Both values are required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Calculate new calibration factor
      const refVal = parseFloat(referenceValue);
      const currVal = parseFloat(currentValue);

      if (currVal === 0) {
        setError('Current sensor value cannot be zero');
        setLoading(false);
        return;
      }

      const newCalibrationFactor = refVal / currVal;

      // Update sensor with new calibration factor
      const updatedConfiguration = {
        ...sensor.configuration,
        calibration_factor: newCalibrationFactor
      };

      await updateSensor(sensor.id, {
        configuration: updatedConfiguration
      });

      setSuccess(true);
      setLoading(false);

      // Notify parent component
      if (onCalibrationComplete) {
        onCalibrationComplete(updatedConfiguration);
      }
    } catch (err) {
      console.error('Error calibrating sensor:', err);
      setError('Failed to calibrate sensor. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3>Sensor Calibration</h3>

      <p style={{ marginTop: '15px' }}>
        Calibrate your sensor by comparing its readings with a reference measurement.
        This will adjust the calibration factor to improve accuracy.
      </p>

      {error && (
        <div style={{
          backgroundColor: '#fef2f2',
          color: '#ef4444',
          padding: '10px',
          borderRadius: '4px',
          marginTop: '15px'
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          backgroundColor: '#f0fdf4',
          color: '#10b981',
          padding: '10px',
          borderRadius: '4px',
          marginTop: '15px'
        }}>
          Sensor calibrated successfully! New calibration factor: {(sensor.configuration?.calibration_factor || 1).toFixed(3)}
        </div>
      )}

      <form onSubmit={handleCalibrate} style={{ marginTop: '15px' }}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Reference Measurement ({getUnit()})
          </label>
          <input
            type="number"
            value={referenceValue}
            onChange={(e) => setReferenceValue(e.target.value)}
            step="0.1"
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #d1d5db'
            }}
            placeholder={`Enter reference ${sensor.type} value`}
            required
          />
          <small style={{ color: '#6b7280' }}>
            Enter a value from a calibrated reference instrument
          </small>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Current Sensor Reading ({getUnit()})
          </label>
          <input
            type="number"
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            step="0.1"
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #d1d5db'
            }}
            placeholder={`Enter current ${sensor.type} reading`}
            required
          />
          <small style={{ color: '#6b7280' }}>
            Enter the current uncalibrated sensor value
          </small>
        </div>

        <button
          type="submit"
          className="btn"
          disabled={loading}
        >
          {loading ? 'Calibrating...' : 'Calibrate Sensor'}
        </button>
      </form>

      <div style={{ marginTop: '20px' }}>
        <h4>Calibration Tips</h4>
        <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
          <li>Use a high-quality reference instrument for accurate calibration</li>
          <li>Perform calibration under stable conditions</li>
          <li>Repeat calibration periodically to maintain accuracy</li>
          <li>For soil moisture sensors, calibrate in the soil type where they will be used</li>
          <li>Temperature sensors should be calibrated at multiple temperature points if possible</li>
        </ul>
      </div>
    </div>
  );
}

export default SensorCalibration;