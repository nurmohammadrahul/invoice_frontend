import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Login from './components/Login.js';
import Dashboard from './components/Dashboard.js';
import CreateInvoice from './components/CreateInvoice.js';
import InvoiceList from './components/InvoiceList.js';
import InvoiceDetail from './components/InvoiceDetail.js';
import './App.css';

// Set base URL for axios - different for development and production
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? process.env.REACT_APP_API_URL || 'https://your-backend.vercel.app/api'
  : 'http://localhost:5000/api';

axios.defaults.baseURL = API_BASE_URL;
axios.defaults.timeout = 10000;

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [backendStatus, setBackendStatus] = useState('checking');

  useEffect(() => {
    checkBackendStatus();
  }, []);

  const checkBackendStatus = async () => {
    try {
      const response = await axios.get('/test');
      setBackendStatus('connected');
      console.log('✅ Backend connected');
      checkAuth();
    } catch (error) {
      setBackendStatus('disconnected');
      console.error('❌ Backend connection failed');
      setLoading(false);
    }
  };

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response = await axios.get('/auth/verify');
        setUser(response.data.user);
      }
    } catch (error) {
      console.log('Auth check failed');
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading Invoice System...</p>
        <p style={{fontSize: '14px', color: '#666'}}>
          Status: {backendStatus === 'checking' ? 'Connecting...' : backendStatus}
        </p>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        {backendStatus === 'disconnected' && (
          <div style={{
            background: '#dc3545',
            color: 'white',
            padding: '10px',
            textAlign: 'center',
            fontSize: '14px'
          }}>
            ⚠️ Cannot connect to backend server
          </div>
        )}
        <Routes>
          <Route 
            path="/login" 
            element={!user ? <Login onLogin={login} backendStatus={backendStatus} /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/dashboard" 
            element={user ? <Dashboard user={user} onLogout={logout} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/create-invoice" 
            element={user ? <CreateInvoice user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/invoices" 
            element={user ? <InvoiceList user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/invoices/:id" 
            element={user ? <InvoiceDetail user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/" 
            element={<Navigate to={user ? "/dashboard" : "/login"} />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;