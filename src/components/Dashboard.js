import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = ({ user, onLogout }) => {
  return (
    <div className="dashboard">
      <nav className="navbar">
        <h1>Billing System</h1>
        <div className="nav-items">
          <div className="user-welcome">
            <span>Welcome, {user.email}</span>
            <span className="user-badge">{user.role}</span>
          </div>
          <button onClick={onLogout} className="btn btn-danger btn-sm">
            Logout
          </button>
        </div>
      </nav>
      
      <div className="dashboard-content">
        <div className="dashboard-grid">
          <div className="card">
            <div className="card-icon">📄</div>
            <h2>Create Invoice</h2>
            <p>Generate a new professional invoice for your clients with itemized billing and automatic calculations.</p>
            <Link to="/create-invoice" className="btn">
              Create New Invoice
            </Link>
          </div>
          
          <div className="card">
            <div className="card-icon">📋</div>
            <h2>View Invoices</h2>
            <p>Access all your created invoices, view details, download PDFs, print, and share with clients.</p>
            <Link to="/invoices" className="btn btn-secondary">
              Manage Invoices
            </Link>
          </div>
          
          <div className="card">
            <div className="card-icon">🏢</div>
            <h2>Company Profile</h2>
            <p>Update your company information that appears on all your invoices and billing documents.</p>
            <button className="btn btn-secondary" disabled>
              Coming Soon
            </button>
          </div>
        </div>

        <div className="card">
          <h2>Quick Stats</h2>
          <p>Dashboard analytics and reporting features will be available in the next update.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            <div style={{ textAlign: 'center', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
              <h3 style={{ color: '#667eea', marginBottom: '0.5rem' }}>0</h3>
              <p style={{ color: '#666', fontSize: '0.9rem' }}>Total Invoices</p>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
              <h3 style={{ color: '#28a745', marginBottom: '0.5rem' }}>$0.00</h3>
              <p style={{ color: '#666', fontSize: '0.9rem' }}>Total Revenue</p>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
              <h3 style={{ color: '#17a2b8', marginBottom: '0.5rem' }}>0</h3>
              <p style={{ color: '#666', fontSize: '0.9rem' }}>Pending Invoices</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;