// src/components/dashboard/CropStatusCard.jsx
import { useState } from 'react';

function CropStatusCard({ crop }) {
  const [showDetails, setShowDetails] = useState(false);

  const getHealthColor = (health) => {
    switch (health.toLowerCase()) {
      case 'excellent':
        return '#10b981'; // Green
      case 'good':
        return '#3b82f6'; // Blue
      case 'fair':
        return '#f59e0b'; // Orange
      case 'poor':
        return '#ef4444'; // Red
      default:
        return '#3b82f6';
    }
  };

  const getProgressPercentage = () => {
    // Calculate percentage of growth cycle completed
    const growthDuration = 120; // Default days for maize
    const daysGrown = growthDuration - (crop.daysToHarvest || 0);
    return Math.min(100, Math.max(0, Math.round((daysGrown / growthDuration) * 100)));
  };

  return (
    <div className="card">
      <h3>Crop Status</h3>
      <div className="crop-info" style={{ marginTop: '15px' }}>
        <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontWeight: 'bold', marginRight: '5px' }}>Type:</span> {crop.type}
          </div>
          <div>
            <span
              style={{
                fontWeight: 'bold',
                color: getHealthColor(crop.health),
                padding: '2px 8px',
                backgroundColor: `${getHealthColor(crop.health)}20`,
                borderRadius: '12px',
                fontSize: '14px'
              }}
            >
              {crop.health}
            </span>
          </div>
        </div>

        <div style={{ marginBottom: '8px' }}>
          <span style={{ fontWeight: 'bold', marginRight: '5px' }}>Growth Stage:</span> {crop.stage}
        </div>

        <div style={{ marginBottom: '15px' }}>
          <span style={{ fontWeight: 'bold', marginRight: '5px' }}>Days to Harvest:</span> {crop.daysToHarvest}
        </div>

        <div style={{ marginBottom: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span style={{ fontWeight: 'bold' }}>Growth Progress</span>
            <span>{getProgressPercentage()}%</span>
          </div>
          <div style={{
            width: '100%',
            height: '8px',
            backgroundColor: '#e5e7eb',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${getProgressPercentage()}%`,
              height: '100%',
              backgroundColor: '#10b981'
            }}></div>
          </div>
        </div>

        <button
          className="btn"
          style={{ width: '100%', marginTop: '10px' }}
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>

        {showDetails && (
          <div style={{ marginTop: '15px', fontSize: '14px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Optimal Conditions:</div>
            <div style={{ marginBottom: '5px' }}>• Temperature: 18-32°C</div>
            <div style={{ marginBottom: '5px' }}>• Soil Moisture: 50-70%</div>
            <div style={{ marginBottom: '5px' }}>• Humidity: 45-75%</div>
            <div style={{ marginBottom: '5px' }}>• pH Level: 5.8-6.8</div>

            <div style={{ fontWeight: 'bold', marginTop: '15px', marginBottom: '8px' }}>Growth Timeline:</div>
            <div style={{ marginBottom: '5px' }}>• Germination: 5-10 days</div>
            <div style={{ marginBottom: '5px' }}>• Vegetative: 25-35 days</div>
            <div style={{ marginBottom: '5px' }}>• Flowering: 15-20 days</div>
            <div style={{ marginBottom: '5px' }}>• Grain filling: 35-45 days</div>
            <div style={{ marginBottom: '5px' }}>• Maturity: 15-20 days</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CropStatusCard;