function SensorCard({ title, value, unit, icon, onClick }) {
  // Determine color based on value ranges
  const getStatusColor = () => {
    if (title === 'Soil Moisture') {
      if (value < 30) return 'red';
      if (value > 80) return 'blue';
      return 'green';
    }
    if (title.includes('Temperature')) {
      if (value < 10) return 'blue';
      if (value > 35) return 'red';
      return 'green';
    }
    if (title === 'Humidity') {
      if (value < 40) return 'red';
      if (value > 90) return 'blue';
      return 'green';
    }
    return 'green';
  };

  return (
    <div
      className="card"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="sensor-card-header">
        <span className="sensor-icon">{icon}</span>
        <h3>{title}</h3>
      </div>
      <div className="sensor-value" style={{ color: getStatusColor() }}>
        {value}{unit}
      </div>
      <div className="sensor-status">
        Status: <span style={{ color: getStatusColor() }}>
          {getStatusColor() === 'green' ? 'Optimal' :
            getStatusColor() === 'red' ? 'Critical' : 'Warning'}
        </span>
      </div>
    </div>
  );
}

export default SensorCard;