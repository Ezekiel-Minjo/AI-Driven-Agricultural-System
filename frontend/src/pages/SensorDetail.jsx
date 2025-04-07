import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSensor } from '../services/sensorManagementService';
import SensorReadings from '../components/sensors/SensorReadings';
import SensorModal from '../components/sensors/SensorModal';
import SensorCalibration from '../components/sensors/SensorCalibration';

function SensorDetail() {
  const { sensorId } = useParams();
  const navigate = useNavigate();

  const [sensor, setSensor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState(24);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sensorTypes, setSensorTypes] = useState({});
  const [farms, setFarms] = useState([]);

  useEffect(() => {
    fetchSensor();
  }, [sensorId]);

  const fetchSensor = async () => {
    try {
      setLoading(true);
      const data = await getSensor(sensorId);
      setSensor(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching sensor details:', err);
      setError('Failed to load sensor details. Please try again later.');
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = (sensorUpdated = false) => {
    setIsModalOpen(false);
    if (sensorUpdated) {
      fetchSensor();
    }
  };

  if (loading) {
    return <div className="loading">Loading sensor details...</div>;
  }

  if (error) {
    return (
      <div>
        <div className="error-message">{error}</div>
        <button className="btn" onClick={() => navigate('/sensors')}>
          Back to Sensors
        </button>
      </div>
    );
  }

  if (!sensor) {
    return (
      <div>
        <h1>Sensor Not Found</h1>
        <p>The requested sensor could not be found.</p>
        <button className="btn" onClick={() => navigate('/sensors')}>
          Back to Sensors
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>{sensor.name}</h1>
        <div>
          <button
            className="btn"
            style={{ marginRight: '10px' }}
            onClick={handleEdit}
          >
            Edit Sensor
          </button>
          <button
            className="btn"
            onClick={() => navigate('/sensors')}
          >
            Back to Sensors
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3>Sensor Readings</h3>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(parseInt(e.target.value))}
            style={{ padding: '5px' }}
          >
            <option value={6}>Last 6 hours</option>
            <option value={12}>Last 12 hours</option>
            <option value={24}>Last 24 hours</option>
            <option value={48}>Last 48 hours</option>
            <option value={168}>Last week</option>
          </select>
        </div>

        <SensorReadings sensor={sensor} timeframe={timeframe} />
      </div>
      <div className="card" style={{ marginBottom: '20px' }}>
        <SensorCalibration
          sensor={sensor}
          onCalibrationComplete={(updatedConfig) => {
            setSensor({
              ...sensor,
              configuration: updatedConfig
            });
          }}
        />
      </div>

      {isModalOpen && (
        <SensorModal
          sensor={sensor}
          mode="edit"
          sensorTypes={sensorTypes}
          farms={farms}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}

export default SensorDetail;