import { NavLink } from 'react-router-dom';

function Sidebar() {
  return (
    <aside className="sidebar">
      <h2>Smart Farming</h2>
      <ul className="nav-links">
        <li>
          <NavLink to="/" className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }>
            <span className="nav-link-icon">📊</span>
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/farms" className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }>
            <span className="nav-link-icon">🌾</span>
            Farms
          </NavLink>
        </li>
        <li>
          <NavLink to="/alerts" className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }>
            <span className="nav-link-icon">🚨</span>
            Alerts
          </NavLink>
        </li>
        <li>
          <NavLink to="/recommendations" className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }>
            <span className="nav-link-icon">💡</span>
            Recommendations
          </NavLink>
        </li>
        <li>
          <NavLink to="/irrigation" className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }>
            <span className="nav-link-icon">💧</span>
            Irrigation
          </NavLink>
        </li>
        <li>
          <NavLink to="/diseases" className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }>
            <span className="nav-link-icon">🦠</span>
            Pest & Disease
          </NavLink>
        </li>
        <li>
          <NavLink to="/yield" className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }>
            <span className="nav-link-icon">📈</span>
            Yield Prediction
          </NavLink>
        </li>
        <li>
          <NavLink to="/sensors" className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }>
            <span className="nav-link-icon">📡</span>
            Sensors
          </NavLink>
        </li>
        <li>
          <NavLink to="/export" className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }>
            <span className="nav-link-icon">📤</span>
            Data Export
          </NavLink>
        </li>
        <li>
          <NavLink to="/notifications" className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }>
            <span className="nav-link-icon">📱</span>
            Notifications
          </NavLink>
        </li>
        <li>
          <NavLink to="/profile" className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }>
            <span className="nav-link-icon">👨‍🌾</span>
            Profile
          </NavLink>
        </li>
        <li>
          <NavLink to="/settings" className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }>
            <span className="nav-link-icon">⚙️</span>
            Settings
          </NavLink>
        </li>
      </ul>
    </aside>
  );
}

export default Sidebar;