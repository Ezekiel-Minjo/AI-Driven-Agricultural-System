// src/pages/Irrigation.jsx
import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { getIrrigationSchedule } from '../services/irrigationService';

function Irrigation() {
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cropType, setCropType] = useState('maize');
  const [area, setArea] = useState(10000);

  useEffect(() => {
    fetchIrrigationSchedule();
  }, []);

  const fetchIrrigationSchedule = async () => {
    try {
      setLoading(true);
      const data = await getIrrigationSchedule({
        crop_type: cropType,
        area: area
      });
      setSchedule(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching irrigation schedule:', err);
      setError('Failed to load irrigation schedule. Please try again later.');
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchIrrigationSchedule();
  };

  if (loading) {
    return <div className="loading">Loading irrigation schedule...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div>
      <h1>Irrigation Management</h1>

      <div className="card">
        <h3>Farm Settings</h3>
        <form onSubmit={handleSubmit} style={{ marginTop: '15px' }}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Crop Type</label>
            <select
              value={cropType}
              onChange={(e) => setCropType(e.target.value)}
              style={{ width: '100%', padding: '8px' }}
            >
              <option value="maize">Maize</option>
              <option value="beans">Beans</option>
              <option value="tomatoes">Tomatoes</option>
            </select>
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Farm Area (square meters)</label>
            <input
              type="number"
              value={area}
              onChange={(e) => setArea(Number(e.target.value))}
              min="100"
              max="100000"
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          <button type="submit" className="btn">Update Schedule</button>
        </form>
      </div>

      {schedule && (
        <>
          <div className="card" style={{ marginTop: '20px' }}>
            <h3>Irrigation Recommendation</h3>
            <div style={{ marginTop: '15px' }}>
              {schedule.needs_irrigation ? (
                <>
                  <div style={{
                    padding: '15px',
                    backgroundColor: '#f0f9ff',
                    borderRadius: '8px',
                    border: '1px solid #bae6fd',
                    marginBottom: '15px'
                  }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>Next Scheduled Irrigation:</div>
                    <div style={{ fontSize: '24px', marginBottom: '10px' }}>
                      {format(parseISO(schedule.next_irrigation), 'EEEE, MMMM d, yyyy')}
                    </div>
                    <div>Water Volume: <strong>{schedule.water_volume_liters.toLocaleString()} liters</strong></div>
                    <div>Water per Area: <strong>{(schedule.water_volume_liters / area).toFixed(1)} L/m²</strong></div>
                  </div>
                  <div>{schedule.recommendation}</div>
                </>
              ) : (
                <div>
                  <div style={{
                    padding: '15px',
                    backgroundColor: '#f0fdf4',
                    borderRadius: '8px',
                    border: '1px solid #bbf7d0',
                    marginBottom: '15px'
                  }}>
                    <div style={{ fontWeight: 'bold', fontSize: '18px' }}>No Irrigation Needed</div>
                  </div>
                  <div>{schedule.recommendation}</div>
                </div>
              )}
            </div>
          </div>

          <div className="card" style={{ marginTop: '20px' }}>
            <h3>7-Day Irrigation Schedule</h3>
            <div style={{ marginTop: '15px', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Day</th>
                    <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Date</th>
                    <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Activity</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.schedule.map((day, index) => (
                    <tr key={index} style={{
                      backgroundColor: day.is_irrigation_day ? '#f0f9ff' : day.is_rain_day ? '#f0fdf4' : 'transparent'
                    }}>
                      <td style={{ padding: '10px', borderBottom: '1px solid #e5e7eb' }}>{day.day_of_week}</td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #e5e7eb' }}>
                        {format(parseISO(day.date), 'MMM d, yyyy')}
                      </td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #e5e7eb' }}>
                        {day.is_irrigation_day && (
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ fontSize: '18px', marginRight: '8px' }}>💧</span>
                            <span>{day.recommendation}</span>
                          </div>
                        )}
                        {day.is_rain_day && (
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ fontSize: '18px', marginRight: '8px' }}>🌧️</span>
                            <span>{day.recommendation}</span>
                          </div>
                        )}
                        {!day.is_irrigation_day && !day.is_rain_day && (
                          <span style={{ color: '#6b7280' }}>No irrigation needed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Irrigation;