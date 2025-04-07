import { useState, useEffect } from 'react';
import { getAlerts, markAlertAsRead } from '../services/alertService';

function Alerts() {
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const data = await getAlerts();
      setAlerts(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching alerts:', err);
      setError('Failed to load alerts. Please try again later.');
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (alertId) => {
    try {
      await markAlertAsRead(alertId);
      // Update the local state to reflect the change
      setAlerts(alerts.map(alert =>
        alert.id === alertId ? { ...alert, is_read: true } : alert
      ));
    } catch (err) {
      console.error('Error marking alert as read:', err);
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'warning':
        return '⚠️';
      case 'danger':
        return '🚨';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  if (loading) {
    return <div className="loading">Loading alerts...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div>
      <h1>Alerts</h1>
      <div className="card">
        {alerts.length === 0 ? (
          <p>No alerts found.</p>
        ) : (
          <ul className="alerts-list">
            {alerts.map(alert => (
              <li key={alert.id} className={`alert-item ${alert.type}`}>
                <span className="alert-icon">{getAlertIcon(alert.type)}</span>
                <div className="alert-content">
                  <div className="alert-message">{alert.message}</div>
                  <div className="alert-time">
                    {new Date(alert.created_at).toLocaleString()}
                    {!alert.is_read && (
                      <button
                        onClick={() => handleMarkAsRead(alert.id)}
                        style={{ marginLeft: '10px', fontSize: '12px' }}
                        className="btn"
                      >
                        Mark as Read
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Alerts;