import { useState } from 'react';

function Settings() {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      sms: true,
      app: true
    },
    alertThresholds: {
      soilMoisture: 30,
      temperature: 35,
      humidity: 40
    },
    displayUnits: {
      temperature: 'celsius', // celsius or fahrenheit
      volume: 'metric' // metric or imperial
    }
  });

  const handleNotificationChange = (type) => {
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [type]: !settings.notifications[type]
      }
    });
  };

  const handleThresholdChange = (type, value) => {
    setSettings({
      ...settings,
      alertThresholds: {
        ...settings.alertThresholds,
        [type]: parseInt(value)
      }
    });
  };

  const handleUnitChange = (type, value) => {
    setSettings({
      ...settings,
      displayUnits: {
        ...settings.displayUnits,
        [type]: value
      }
    });
  };

  return (
    <div>
      <h1>Settings</h1>

      <div className="card">
        <h2>Notification Preferences</h2>
        <div style={{ marginTop: '15px' }}>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                checked={settings.notifications.email}
                onChange={() => handleNotificationChange('email')}
                style={{ marginRight: '10px' }}
              />
              Receive Email Notifications
            </label>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                checked={settings.notifications.sms}
                onChange={() => handleNotificationChange('sms')}
                style={{ marginRight: '10px' }}
              />
              Receive SMS Notifications
            </label>
          </div>
          <div>
            <label style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                checked={settings.notifications.app}
                onChange={() => handleNotificationChange('app')}
                style={{ marginRight: '10px' }}
              />
              Receive In-App Notifications
            </label>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Alert Thresholds</h2>
        <div style={{ marginTop: '15px' }}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Soil Moisture Alert Threshold (%)
            </label>
            <input
              type="range"
              min="10"
              max="90"
              value={settings.alertThresholds.soilMoisture}
              onChange={(e) => handleThresholdChange('soilMoisture', e.target.value)}
              style={{ width: '100%' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>10%</span>
              <span>Current: {settings.alertThresholds.soilMoisture}%</span>
              <span>90%</span>
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Temperature Alert Threshold (°C)
            </label>
            <input
              type="range"
              min="0"
              max="50"
              value={settings.alertThresholds.temperature}
              onChange={(e) => handleThresholdChange('temperature', e.target.value)}
              style={{ width: '100%' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>0°C</span>
              <span>Current: {settings.alertThresholds.temperature}°C</span>
              <span>50°C</span>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Humidity Alert Threshold (%)
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.alertThresholds.humidity}
              onChange={(e) => handleThresholdChange('humidity', e.target.value)}
              style={{ width: '100%' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>0%</span>
              <span>Current: {settings.alertThresholds.humidity}%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Display Units</h2>
        <div style={{ marginTop: '15px' }}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Temperature Units</label>
            <div>
              <label style={{ marginRight: '15px' }}>
                <input
                  type="radio"
                  name="tempUnit"
                  value="celsius"
                  checked={settings.displayUnits.temperature === 'celsius'}
                  onChange={() => handleUnitChange('temperature', 'celsius')}
                  style={{ marginRight: '5px' }}
                />
                Celsius (°C)
              </label>
              <label>
                <input
                  type="radio"
                  name="tempUnit"
                  value="fahrenheit"
                  checked={settings.displayUnits.temperature === 'fahrenheit'}
                  onChange={() => handleUnitChange('temperature', 'fahrenheit')}
                  style={{ marginRight: '5px' }}
                />
                Fahrenheit (°F)
              </label>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Volume Units</label>
            <div>
              <label style={{ marginRight: '15px' }}>
                <input
                  type="radio"
                  name="volumeUnit"
                  value="metric"
                  checked={settings.displayUnits.volume === 'metric'}
                  onChange={() => handleUnitChange('volume', 'metric')}
                  style={{ marginRight: '5px' }}
                />
                Metric (Liters)
              </label>
              <label>
                <input
                  type="radio"
                  name="volumeUnit"
                  value="imperial"
                  checked={settings.displayUnits.volume === 'imperial'}
                  onChange={() => handleUnitChange('volume', 'imperial')}
                  style={{ marginRight: '5px' }}
                />
                Imperial (Gallons)
              </label>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '20px' }}>
        <button className="btn">Save Settings</button>
      </div>
    </div>
  );
}

export default Settings;