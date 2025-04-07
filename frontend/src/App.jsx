// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/common/PrivateRoute';
import AppLayout from './components/common/AppLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Alerts from './pages/Alerts';
import Recommendations from './pages/Recommendations';
import Irrigation from './pages/Irrigation';
import DiseaseDetection from './pages/DiseaseDetection';
import YieldPrediction from './pages/YieldPrediction';
import SensorManagement from './pages/SensorManagement';
import SensorDetail from './pages/SensorDetail';
import DataExport from './pages/DataExport';
import Notifications from './pages/Notifications';
import Farms from './pages/Farms';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import './assets/styles/main.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/alerts"
            element={
              <PrivateRoute>
                <AppLayout>
                  <Alerts />
                </AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/recommendations"
            element={
              <PrivateRoute>
                <AppLayout>
                  <Recommendations />
                </AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/irrigation"
            element={
              <PrivateRoute>
                <AppLayout>
                  <Irrigation />
                </AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/diseases"
            element={
              <PrivateRoute>
                <AppLayout>
                  <DiseaseDetection />
                </AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/yield"
            element={
              <PrivateRoute>
                <AppLayout>
                  <YieldPrediction />
                </AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/sensors"
            element={
              <PrivateRoute>
                <AppLayout>
                  <SensorManagement />
                </AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/sensors/:sensorId"
            element={
              <PrivateRoute>
                <AppLayout>
                  <SensorDetail />
                </AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/export"
            element={
              <PrivateRoute>
                <AppLayout>
                  <DataExport />
                </AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <PrivateRoute>
                <AppLayout>
                  <Notifications />
                </AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/farms"
            element={
              <PrivateRoute>
                <AppLayout>
                  <Farms />
                </AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <AppLayout>
                  <Profile />
                </AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <AppLayout>
                  <Settings />
                </AppLayout>
              </PrivateRoute>
            }
          />

          {/* Redirect to login for unknown routes */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;