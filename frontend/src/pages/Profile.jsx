// src/pages/Profile.jsx
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

function Profile() {
  const { currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would update the user profile via API
    console.log('Profile update:', formData);
    setIsEditing(false);
  };

  if (!currentUser) {
    return <div>Loading user profile...</div>;
  }

  return (
    <div>
      <h1>User Profile</h1>

      <div className="card">
        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <h3>Edit Profile</h3>

            <div style={{ marginTop: '20px' }}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '8px' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '8px' }}
                  required
                  disabled
                />
                <small style={{ color: '#6b7280' }}>Email cannot be changed</small>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '8px' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button type="submit" className="btn">
                Save Changes
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => setIsEditing(false)}
                style={{ backgroundColor: '#6b7280' }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Profile Information</h3>
              <button
                className="btn"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </button>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              marginTop: '20px',
              marginBottom: '20px',
              padding: '20px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px'
            }}>
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  fontWeight: 'bold'
                }}
              >
                {currentUser.name.charAt(0)}
              </div>

              <div>
                <h2 style={{ marginBottom: '5px' }}>{currentUser.name}</h2>
                <div style={{ color: '#6b7280' }}>
                  {currentUser.role === 'admin' ? 'Administrator' : 'Farmer'}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '20px' }}>
              <div style={{ marginBottom: '15px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Username</div>
                <div>{currentUser.username}</div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Email</div>
                <div>{currentUser.email}</div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Phone</div>
                <div>{currentUser.phone || 'Not provided'}</div>
              </div>

              <div>
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Account Created</div>
                <div>{new Date(currentUser.created_at).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: '20px' }}>
        <h3>Security</h3>

        <div style={{ marginTop: '20px' }}>
          <button className="btn">
            Change Password
          </button>
          <p style={{ marginTop: '10px', color: '#6b7280', fontSize: '14px' }}>
            For security reasons, changing your password will require you to log in again.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Profile;