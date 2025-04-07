import { Link } from 'react-router-dom';

function RecentAlertsWidget({ alerts }) {
  const getAlertIcon = (type) => {
    switch (type) {
      case 'warning':
        return '⚠️';
      case 'danger':
        return '🚨';
      case 'success':
        return '✅';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className="card">
      <h3>Recent Alerts</h3>
      {alerts.length === 0 ? (
        <p style={{ marginTop: '15px' }}>No recent alerts</p>
      ) : (
        <ul className="alerts-list" style={{ marginTop: '15px' }}>
          {alerts.slice(0, 3).map(alert => (
            <li key={alert.id} className={`alert-item ${alert.type}`}>
              <span className="alert-icon">{getAlertIcon(alert.type)}</span>
              <div className="alert-content">
                <div className="alert-message">{alert.message}</div>
                <div className="alert-time">{alert.time}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div style={{ textAlign: 'center', marginTop: '15px' }}>
        <Link to="/alerts" className="btn">View All Alerts</Link>
      </div>
    </div>
  );
}

export default RecentAlertsWidget;