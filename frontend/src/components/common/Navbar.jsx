import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../services/authService';

function Navbar({ user }) {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="logo">AI-Driven Agricultural System</div>

      <div className="user-menu">
        {user && (
          <>
            <div
              className="user-profile"
              onClick={() => setShowMenu(!showMenu)}
              style={{ position: 'relative', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold'
                  }}
                >
                  {user.name.charAt(0)}
                </div>
                <span>{user.name}</span>
              </div>

              {showMenu && (
                <div
                  style={{
                    position: 'absolute',
                    top: '40px',
                    right: '0',
                    backgroundColor: 'white',
                    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                    borderRadius: '4px',
                    padding: '10px',
                    minWidth: '150px',
                    zIndex: 100
                  }}
                >
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    <li
                      style={{ padding: '8px 10px', cursor: 'pointer' }}
                      onClick={() => navigate('/profile')}
                    >
                      Profile
                    </li>
                    <li
                      style={{ padding: '8px 10px', cursor: 'pointer' }}
                      onClick={() => navigate('/settings')}
                    >
                      Settings
                    </li>
                    <li
                      style={{
                        padding: '8px 10px',
                        borderTop: '1px solid #eee',
                        marginTop: '5px',
                        cursor: 'pointer',
                        color: '#ef4444'
                      }}
                      onClick={handleLogout}
                    >
                      Logout
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;