// src/pages/YieldPrediction.jsx
import { useState, useEffect } from 'react';
import { predictYield, getYieldHistory } from '../services/yieldService';
import { format, parseISO } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function YieldPrediction() {
  const [cropType, setCropType] = useState('maize');
  const [areaHectares, setAreaHectares] = useState(1);
  const [rainfall, setRainfall] = useState(500);
  const [sunlight, setSunlight] = useState(7);
  const [pestLevel, setPestLevel] = useState(10);
  const [fertilizerLevel, setFertilizerLevel] = useState(80);

  const [predicting, setPredicting] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchYieldHistory();
  }, [cropType]);

  const fetchYieldHistory = async () => {
    try {
      const historyData = await getYieldHistory(cropType, 5);
      setHistory(historyData);
    } catch (err) {
      console.error('Error fetching yield history:', err);
      setError('Failed to load historical yield data.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setPredicting(true);
      setError(null);

      const data = {
        crop_type: cropType,
        area_hectares: parseFloat(areaHectares),
        rainfall: parseInt(rainfall),
        sunlight: parseFloat(sunlight),
        pest_disease_level: parseInt(pestLevel) / 100, // Convert to 0-1 range
        fertilizer_adequacy: parseInt(fertilizerLevel) / 100 // Convert to 0-1 range
      };

      const result = await predictYield(data);
      setPrediction(result);
      setPredicting(false);
    } catch (err) {
      console.error('Error predicting yield:', err);
      setError('Failed to generate yield prediction. Please try again.');
      setPredicting(false);
    }
  };

  // Format historical data for chart
  const chartData = [...history].map(item => ({
    year: item.year,
    yield: item.yield_per_hectare
  }));

  // If we have a prediction, add it to the chart
  if (prediction) {
    chartData.push({
      year: new Date().getFullYear(),
      yield: prediction.predicted_yield_per_hectare,
      isPrediction: true
    });
  }

  return (
    <div>
      <h1>Yield Prediction</h1>

      <div className="card">
        <h3>Input Parameters</h3>
        <p style={{ marginTop: '10px' }}>Adjust the parameters to predict crop yield based on your specific conditions.</p>

        <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Crop Type</label>
              <select
                value={cropType}
                onChange={(e) => setCropType(e.target.value)}
                style={{ width: '100%', padding: '8px' }}
              >
                <option value="maize">Maize</option>
                <option value="beans">Beans</option>
                <option value="tomatoes">Tomatoes</option>
                <option value="wheat">Wheat</option>
                <option value="rice">Rice</option>
                <option value="potatoes">Potatoes</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Area (hectares)</label>
              <input
                type="number"
                value={areaHectares}
                onChange={(e) => setAreaHectares(e.target.value)}
                min="0.1"
                max="100"
                step="0.1"
                style={{ width: '100%', padding: '8px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                Rainfall (mm/season)
              </label>
              <input
                type="number"
                value={rainfall}
                onChange={(e) => setRainfall(e.target.value)}
                min="100"
                max="2000"
                step="10"
                style={{ width: '100%', padding: '8px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                Sunlight (hours/day)
              </label>
              <input
                type="number"
                value={sunlight}
                onChange={(e) => setSunlight(e.target.value)}
                min="1"
                max="12"
                step="0.5"
                style={{ width: '100%', padding: '8px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                Pest/Disease Pressure (0-100%)
              </label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="range"
                  value={pestLevel}
                  onChange={(e) => setPestLevel(e.target.value)}
                  min="0"
                  max="100"
                  style={{ flex: 1, marginRight: '10px' }}
                />
                <span>{pestLevel}%</span>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                Fertilizer Application (0-100%)
              </label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="range"
                  value={fertilizerLevel}
                  onChange={(e) => setFertilizerLevel(e.target.value)}
                  min="0"
                  max="100"
                  style={{ flex: 1, marginRight: '10px' }}
                />
                <span>{fertilizerLevel}%</span>
              </div>
            </div>
          </div>

          {error && (
            <div style={{ color: '#ef4444', marginTop: '15px' }}>
              {error}
            </div>
          )}

          <div style={{ marginTop: '20px' }}>
            <button
              type="submit"
              className="btn"
              disabled={predicting}
            >
              {predicting ? 'Generating Prediction...' : 'Predict Yield'}
            </button>
          </div>
        </form>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
        <div className="card">
          <h3>Historical Yields</h3>

          <div style={{ height: '300px', marginTop: '15px' }}>
            {history.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis label={{ value: 'Yield (kg/ha)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="yield"
                    name="Yield (kg/ha)"
                    fill="#3b82f6"
                    fillOpacity={d => d.isPrediction ? 0.5 : 1}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <p>No historical data available</p>
              </div>
            )}
          </div>

          {history.length > 0 && (
            <div style={{ marginTop: '15px' }}>
              <h4>Historical Notes</h4>
              {history.map((item, index) => (
                <div key={index} style={{ marginTop: '10px' }}>
                  <div style={{ fontWeight: 'bold' }}>{item.year}:</div>
                  <div>{item.notes}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {prediction && (
          <div className="card">
            <h3>Yield Prediction</h3>

            <div style={{
              padding: '15px',
              backgroundColor: '#f0f9ff',
              borderRadius: '8px',
              border: '1px solid #bae6fd',
              marginTop: '15px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                  {cropType.charAt(0).toUpperCase() + cropType.slice(1)} Yield Forecast
                </div>
                <div style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '14px'
                }}>
                  {prediction.yield_category}
                </div>
              </div>

              <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '15px' }}>
                {prediction.predicted_yield_per_hectare.toLocaleString()} kg/ha
              </div>

              <div>
                <div style={{ marginBottom: '5px' }}>
                  <strong>Total Estimated Yield:</strong> {prediction.total_predicted_yield.toLocaleString()} kg
                </div>
                <div style={{ marginBottom: '5px' }}>
                  <strong>Harvest Window:</strong> {format(parseISO(prediction.harvest_window.start_date), 'MMM d')} - {format(parseISO(prediction.harvest_window.end_date), 'MMM d, yyyy')}
                </div>
                <div>
                  <strong>Confidence Level:</strong> {Math.round(prediction.confidence_level * 100)}%
                </div>
              </div>
            </div>

            <div style={{ marginTop: '20px' }}>
              <h4>Limiting Factors</h4>
              {prediction.limiting_factors.length > 0 ? (
                <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
                  {prediction.limiting_factors.map((factor, index) => (
                    <li key={index}>{factor}</li>
                  ))}
                </ul>
              ) : (
                <p style={{ marginTop: '10px' }}>No significant limiting factors identified.</p>
              )}
            </div>

            <div style={{ marginTop: '20px' }}>
              <h4>Recommendations</h4>
              {prediction.improvement_recommendations.length > 0 ? (
                <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
                  {prediction.improvement_recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              ) : (
                <p style={{ marginTop: '10px' }}>No specific recommendations at this time.</p>
              )}
            </div>

            <div style={{ marginTop: '20px' }}>
              <h4>Impact Analysis</h4>
              <div style={{ marginTop: '10px' }}>
                {Object.entries(prediction.impact_factors).map(([factor, data], index) => (
                  <div
                    key={factor}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: index < Object.keys(prediction.impact_factors).length - 1 ? '10px' : 0
                    }}
                  >
                    <div style={{ width: '120px' }}>
                      {factor.charAt(0).toUpperCase() + factor.slice(1).replace('_', ' ')}:
                    </div>
                    <div
                      style={{
                        flex: 1,
                        height: '15px',
                        backgroundColor: '#e5e7eb',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        marginRight: '10px'
                      }}
                    >
                      <div
                        style={{
                          width: `${data.impact * 100}%`,
                          height: '100%',
                          backgroundColor: data.impact >= 0.8 ? '#10b981' : data.impact >= 0.6 ? '#f59e0b' : '#ef4444'
                        }}
                      ></div>
                    </div>
                    <div style={{ width: '40px', textAlign: 'right' }}>
                      {Math.round(data.impact * 100)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default YieldPrediction;