// src/pages/DiseaseDetection.jsx
import { useState, useRef } from 'react';
import { analyzeImage, getDetectionHistory } from '../services/diseaseService';
import { format, parseISO } from 'date-fns';

function DiseaseDetection() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [cropType, setCropType] = useState('maize');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);

      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Reset previous results
      setResult(null);
      setError(null);
    }
  };

  const handleCropTypeChange = (e) => {
    setCropType(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      setError('Please select an image to analyze');
      return;
    }

    try {
      setAnalyzing(true);

      // Convert image to base64
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      reader.onloadend = async () => {
        const base64data = reader.result;

        // Send for analysis
        const analysisResult = await analyzeImage(base64data, cropType);
        setResult(analysisResult);
        setAnalyzing(false);
      };

    } catch (err) {
      console.error('Error analyzing image:', err);
      setError('Failed to analyze image. Please try again.');
      setAnalyzing(false);
    }
  };

  const fetchHistory = async () => {
    try {
      setShowHistory(true);
      const historyData = await getDetectionHistory();
      setHistory(historyData);
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <h1>Pest & Disease Detection</h1>

      <div className="card">
        <h3>Analyze Crop Image</h3>
        <p style={{ marginTop: '10px' }}>Upload an image of your crop to identify potential pests or diseases.</p>

        <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Select Crop Type</label>
            <select
              value={cropType}
              onChange={handleCropTypeChange}
              style={{ width: '100%', padding: '8px' }}
            >
              <option value="maize">Maize</option>
              <option value="beans">Beans</option>
              <option value="tomatoes">Tomatoes</option>
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Upload Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              ref={fileInputRef}
              style={{ marginBottom: '10px' }}
            />

            {preview && (
              <div style={{ marginTop: '10px', textAlign: 'center' }}>
                <img
                  src={preview}
                  alt="Preview"
                  style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }}
                />
              </div>
            )}
          </div>

          {error && (
            <div style={{ color: '#ef4444', marginBottom: '15px' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="submit"
              className="btn"
              disabled={analyzing || !selectedFile}
            >
              {analyzing ? 'Analyzing...' : 'Analyze Image'}
            </button>

            <button
              type="button"
              onClick={resetForm}
              className="btn"
              style={{ backgroundColor: '#6b7280' }}
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {result && (
        <div className="card" style={{ marginTop: '20px' }}>
          <h3>Analysis Results</h3>

          <div style={{
            padding: '15px',
            backgroundColor: '#f0f9ff',
            borderRadius: '8px',
            border: '1px solid #bae6fd',
            marginTop: '15px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{
                fontSize: '24px',
                marginRight: '10px'
              }}>
                {result.detection_type === 'disease' ? '🦠' : '🐛'}
              </span>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{result.name}</div>
                <div style={{ fontSize: '14px', fontStyle: 'italic', color: '#666' }}>{result.scientific_name}</div>
              </div>
              <div style={{
                marginLeft: 'auto',
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '14px'
              }}>
                {Math.round(result.confidence * 100)}% Confidence
              </div>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Symptoms:</div>
              <div>{result.symptoms}</div>
            </div>

            <div>
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Recommended Treatment:</div>
              <div>{result.treatment}</div>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <button
          className="btn"
          onClick={fetchHistory}
          style={{ display: showHistory ? 'none' : 'inline-block' }}
        >
          View Detection History
        </button>
      </div>

      {showHistory && (
        <div className="card" style={{ marginTop: '20px' }}>
          <h3>Detection History</h3>

          {history.length === 0 ? (
            <p style={{ marginTop: '15px' }}>No detection history available.</p>
          ) : (
            <div style={{ marginTop: '15px' }}>
              {history.map(item => (
                <div
                  key={item.id}
                  style={{
                    padding: '15px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    marginBottom: '10px',
                    borderLeft: `4px solid ${item.detection_type === 'disease' ? '#ef4444' : '#f59e0b'}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div>
                      <span style={{
                        fontSize: '18px',
                        marginRight: '10px'
                      }}>
                        {item.detection_type === 'disease' ? '🦠' : '🐛'}
                      </span>
                      <span style={{ fontWeight: 'bold' }}>{item.name}</span>
                    </div>
                    <div style={{
                      backgroundColor: item.status === 'Treated' ? '#10b981' : '#f59e0b',
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}>
                      {item.status}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#666' }}>
                    <div>Crop: {item.crop_type}</div>
                    <div>Location: {item.field_location}</div>
                    <div>Date: {format(parseISO(item.timestamp), 'MMM d, yyyy')}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DiseaseDetection;