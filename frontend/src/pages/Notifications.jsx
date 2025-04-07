// src/pages/Notifications.jsx
import { useState, useEffect } from 'react';
import {
  getNotificationHistory,
  sendEmailNotification,
  sendSMSNotification
} from '../services/notificationService';
import { format, parseISO } from 'date-fns';

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState('history');

  // Form states
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState({ message: '', type: '' });

  useEffect(() => {
    if (activeTab === 'history') {
      fetchNotificationHistory();
    }
  }, [activeTab]);

  const fetchNotificationHistory = async () => {
    try {
      setLoading(true);
      const data = await getNotificationHistory();
      setNotifications(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching notification history:', err);
      setError('Failed to load notification history.');
      setLoading(false);
    }
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();

    if (!email || !subject || !message) {
      setSendResult({
        message: 'Please fill in all fields',
        type: 'error'
      });
      return;
    }

    try {
      setSending(true);
      setSendResult({ message: '', type: '' });

      const result = await sendEmailNotification({
        email,
        subject,
        message
      });

      setSendResult({
        message: 'Email notification sent successfully!',
        type: 'success'
      });

      // Reset form
      setSubject('');
      setMessage('');

      setSending(false);
    } catch (err) {
      console.error('Error sending email notification:', err);
      setSendResult({
        message: 'Failed to send email notification.',
        type: 'error'
      });
      setSending(false);
    }
  };

  const handleSendSMS = async (e) => {
    e.preventDefault();

    if (!phone || !message) {
      setSendResult({
        message: 'Please fill in all fields',
        type: 'error'
      });
      return;
    }

    try {
      setSending(true);
      setSendResult({ message: '', type: '' });

      const result = await sendSMSNotification({
        phone,
        message
      });

      setSendResult({
        message: 'SMS notification sent successfully!',
        type: 'success'
      });

      // Reset form
      setMessage('');

      setSending(false);
    } catch (err) {
      console.error('Error sending SMS notification:', err);
      setSendResult({
        message: 'Failed to send SMS notification.',
        type: 'error'
      });
      setSending(false);
    }
  };

  return (
    <div>
      <h1>Notifications</h1>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          className={`btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
          style={{
            backgroundColor: activeTab === 'history' ? '#3b82f6' : '#6b7280'
          }}
        >
          Notification History
        </button>
        <button
          className={`btn ${activeTab === 'email' ? 'active' : ''}`}
          onClick={() => setActiveTab('email')}
          style={{
            backgroundColor: activeTab === 'email' ? '#3b82f6' : '#6b7280'
          }}
        >
          Send Email
        </button>
        <button
          className={`btn ${activeTab === 'sms' ? 'active' : ''}`}
          onClick={() => setActiveTab('sms')}
          style={{
            backgroundColor: activeTab === 'sms' ? '#3b82f6' : '#6b7280'
          }}
        >
          Send SMS
        </button>
      </div>

      {activeTab === 'history' && (
        <div className="card">
          <h3>Notification History</h3>

          {loading ? (
            <div className="loading">Loading notification history...</div>
          ) : error ? (
            <div style={{ color: '#ef4444', marginTop: '15px' }}>{error}</div>
          ) : notifications.length === 0 ? (
            <p style={{ marginTop: '15px' }}>No notifications sent yet.</p>
          ) : (
            <div style={{ marginTop: '15px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #e5e7eb' }}>Type</th>
                    <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #e5e7eb' }}>Recipient</th>
                    <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #e5e7eb' }}>Subject</th>
                    <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #e5e7eb' }}>Message</th>
                    <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #e5e7eb' }}>Date</th>
                    <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #e5e7eb' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {notifications.map(notification => (
                    <tr key={notification.id}>
                      <td style={{ padding: '10px', borderBottom: '1px solid #e5e7eb' }}>
                        {notification.type === 'email' ? '📧' : '📱'} {notification.type.toUpperCase()}
                      </td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #e5e7eb' }}>{notification.recipient}</td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #e5e7eb' }}>{notification.subject}</td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #e5e7eb' }}>
                        {notification.message.length > 30
                          ? `${notification.message.substring(0, 30)}...`
                          : notification.message}
                      </td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #e5e7eb' }}>
                        {format(parseISO(notification.timestamp), 'MMM d, yyyy h:mm a')}
                      </td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #e5e7eb' }}>
                        <span
                          style={{
                            backgroundColor: notification.status === 'sent' ? '#10b981' : '#ef4444',
                            color: 'white',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '12px'
                          }}
                        >
                          {notification.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'email' && (
        <div className="card">
          <h3>Send Email Notification</h3>

          {sendResult.message && (
            <div
              style={{
                padding: '10px',
                margin: '15px 0',
                backgroundColor: sendResult.type === 'success' ? '#f0fdf4' : '#fef2f2',
                border: `1px solid ${sendResult.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
                borderRadius: '8px'
              }}
            >
              {sendResult.message}
            </div>
          )}

          <form onSubmit={handleSendEmail} style={{ marginTop: '15px' }}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                Recipient Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="farmer@example.com"
                style={{ width: '100%', padding: '8px' }}
                required
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Notification Subject"
                style={{ width: '100%', padding: '8px' }}
                required
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your message here..."
                style={{ width: '100%', padding: '8px', minHeight: '150px' }}
                required
              />
            </div>

            <button
              type="submit"
              className="btn"
              disabled={sending}
            >
              {sending ? 'Sending...' : 'Send Email'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'sms' && (
        <div className="card">
          <h3>Send SMS Notification</h3>

          {sendResult.message && (
            <div
              style={{
                padding: '10px',
                margin: '15px 0',
                backgroundColor: sendResult.type === 'success' ? '#f0fdf4' : '#fef2f2',
                border: `1px solid ${sendResult.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
                borderRadius: '8px'
              }}
            >
              {sendResult.message}
            </div>
          )}

          <form onSubmit={handleSendSMS} style={{ marginTop: '15px' }}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                Recipient Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+254712345678"
                style={{ width: '100%', padding: '8px' }}
                required
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your message here... (160 characters max for SMS)"
                style={{ width: '100%', padding: '8px', minHeight: '100px' }}
                maxLength={160}
                required
              />
              <div style={{ textAlign: 'right', marginTop: '5px', fontSize: '12px', color: '#6b7280' }}>
                {message.length}/160 characters
              </div>
            </div>

            <button
              type="submit"
              className="btn"
              disabled={sending}
            >
              {sending ? 'Sending...' : 'Send SMS'}
            </button>
          </form>
        </div>
      )}

      <div className="card" style={{ marginTop: '20px' }}>
        <h3>About Notifications</h3>
        <p style={{ marginTop: '10px' }}>
          The notification system allows you to send important updates to farmers via email or SMS.
          Use this feature to:
        </p>
        <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
          <li>Alert farmers about critical conditions (low soil moisture, extreme temperatures)</li>
          <li>Remind farmers about upcoming tasks (irrigation schedules, harvest dates)</li>
          <li>Distribute important advisories (weather warnings, pest alerts)</li>
        </ul>
        <p style={{ marginTop: '10px' }}>
          <strong>Note:</strong> In this demo version, notifications are simulated and not actually sent.
          In a production environment, real email and SMS gateways would be integrated.
        </p>
      </div>
    </div>
  );
}

export default Notifications;