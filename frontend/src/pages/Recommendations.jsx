import { useState, useEffect } from 'react';
import { getRecommendations, markRecommendationAsRead } from '../services/recommendationService';

function Recommendations() {
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchRecommendations(false);
  }, []);

  const fetchRecommendations = async (generateNew = false) => {
    try {
      setLoading(true);
      if (generateNew) setGenerating(true);

      const data = await getRecommendations('farmer-001', generateNew);
      setRecommendations(data);

      setLoading(false);
      setGenerating(false);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError('Failed to load recommendations. Please try again later.');
      setLoading(false);
      setGenerating(false);
    }
  };

  const handleMarkAsRead = async (recommendationId) => {
    try {
      await markRecommendationAsRead(recommendationId);
      // Update the local state to reflect the change
      setRecommendations(recommendations.map(rec =>
        rec.id === recommendationId ? { ...rec, is_read: true } : rec
      ));
    } catch (err) {
      console.error('Error marking recommendation as read:', err);
    }
  };

  const getRecommendationIcon = (type) => {
    switch (type) {
      case 'irrigation':
        return '💧';
      case 'planting':
        return '🌱';
      case 'fertilization':
        return '🧪';
      case 'pest_control':
        return '🐛';
      case 'harvesting':
        return '🌾';
      case 'temperature':
        return '🌡️';
      case 'humidity':
        return '💦';
      default:
        return '📝';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#3b82f6';
      default:
        return '#3b82f6';
    }
  };

  if (loading && !generating) {
    return <div className="loading">Loading recommendations...</div>;
  }

  return (
    <div>
      <h1>AI-Driven Recommendations</h1>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <p>These recommendations are generated based on analysis of your farm's sensor data.</p>
        <button
          className="btn"
          onClick={() => fetchRecommendations(true)}
          disabled={generating}
        >
          {generating ? 'Generating...' : 'Generate New Recommendations'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="card">
        {recommendations.length === 0 ? (
          <p>No recommendations found. Click "Generate New Recommendations" to analyze your farm data.</p>
        ) : (
          <div>
            {recommendations.map(rec => {
              const details = rec.details || {};
              const message = details.message || rec.message || 'No message available';
              const severity = details.severity || rec.priority || 'low';

              return (
                <div
                  key={rec.id}
                  className="card"
                  style={{
                    marginBottom: '15px',
                    borderLeft: `4px solid ${getSeverityColor(severity)}`
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '24px', marginRight: '10px' }}>
                      {getRecommendationIcon(rec.type)}
                    </span>
                    <h3 style={{ textTransform: 'capitalize' }}>{rec.type.replace('_', ' ')} Recommendation</h3>
                    <span
                      style={{
                        marginLeft: 'auto',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: 'white',
                        backgroundColor: getSeverityColor(severity)
                      }}
                    >
                      {severity.toUpperCase()}
                    </span>
                  </div>

                  <p style={{ marginBottom: '10px' }}>{message}</p>

                  {details.data && Object.keys(details.data).length > 0 && (
                    <div style={{
                      backgroundColor: '#f8fafc',
                      padding: '10px',
                      borderRadius: '4px',
                      marginBottom: '10px',
                      fontSize: '14px'
                    }}>
                      <h4 style={{ marginBottom: '5px' }}>Additional Data</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
                        {Object.entries(details.data).map(([key, value]) => (
                          <div key={key}>
                            <strong>{key.replace('_', ' ')}:</strong> {
                              typeof value === 'object'
                                ? Array.isArray(value)
                                  ? value.join(', ')
                                  : JSON.stringify(value)
                                : value.toFixed ? value.toFixed(2) : value
                            }
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#666' }}>
                    <span>Generated: {new Date(rec.created_at || rec.timestamp).toLocaleString()}</span>

                    {!rec.is_read && (
                      <button
                        onClick={() => handleMarkAsRead(rec.id)}
                        className="btn"
                        style={{ fontSize: '12px', padding: '3px 8px' }}
                      >
                        Mark as Read
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Recommendations;
