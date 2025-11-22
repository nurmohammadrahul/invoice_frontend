import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ onLogin, backendStatus }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (backendStatus === 'disconnected') {
      setError('Invoice System backend not available. Please start the server.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/auth/login', formData);
      onLogin(response.data.user, response.data.token);
    } catch (error) {
      setError(error.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Invoice Management System</h2>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '1.5rem' }}>
          Administrator Login
        </p>
        
        {backendStatus === 'disconnected' && (
          <div style={{
            background: '#fff3cd',
            color: '#856404',
            padding: '0.875rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            border: '1px solid #ffeaa7'
          }}>
            ⚠️ <strong>Backend Not Connected</strong><br/>
            Please start the Invoice System backend on port 5000.
          </div>
        )}
        
        {error && <div className="error">{error}</div>}
        
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter admin email"
            required
            disabled={loading || backendStatus === 'disconnected'}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter admin password"
            required
            disabled={loading || backendStatus === 'disconnected'}
          />
        </div>
        
        <button 
          type="submit" 
          className="btn" 
          disabled={loading || backendStatus === 'disconnected'}
        >
          {loading ? 'Signing In...' : 'Sign In as Administrator'}
        </button>
      </form>
    </div>
  );
};

export default Login;