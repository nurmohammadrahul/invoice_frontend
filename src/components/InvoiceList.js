import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const InvoiceList = ({ user }) => {
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredInvoices(invoices);
    } else {
      filterInvoices(searchTerm);
    }
  }, [searchTerm, invoices]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔄 Fetching invoices...');
      const response = await axios.get('/billing/invoices');
      
      console.log('✅ Invoices response:', response.data);
      
      if (response.data.success) {
        setInvoices(response.data.invoices);
        setFilteredInvoices(response.data.invoices);
      } else {
        throw new Error('Failed to fetch invoices');
      }
    } catch (error) {
      console.error('❌ Error fetching invoices:', error);
      setError('Failed to load invoices. Please try again.');
      
      // Set empty arrays as fallback
      setInvoices([]);
      setFilteredInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const filterInvoices = (term) => {
    setSearchLoading(true);
    
    const searchTerm = term.toLowerCase().trim();
    
    const results = invoices.filter(invoice => {
      const clientName = invoice.to?.name?.toLowerCase() || '';
      const clientPhone = invoice.to?.phone?.toLowerCase() || '';
      const clientEmail = invoice.to?.email?.toLowerCase() || '';
      const invoiceNumber = invoice.invoiceNumber?.toLowerCase() || '';
      const companyName = invoice.from?.name?.toLowerCase() || '';
      const itemDescriptions = invoice.items?.map(item => 
        item.description?.toLowerCase() || ''
      ).join(' ') || '';
      
      return (
        clientName.includes(searchTerm) ||
        clientPhone.includes(searchTerm) ||
        clientPhone.replace(/\D/g, '').includes(searchTerm.replace(/\D/g, '')) ||
        clientEmail.includes(searchTerm) ||
        invoiceNumber.includes(searchTerm) ||
        companyName.includes(searchTerm) ||
        itemDescriptions.includes(searchTerm)
      );
    });
    
    setFilteredInvoices(results);
    setSearchLoading(false);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const downloadPDF = async (invoiceId, invoiceNumber) => {
    try {
      const response = await axios.get(`/billing/invoices/${invoiceId}/pdf`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF');
    }
  };

  const printInvoice = async (invoiceId) => {
    try {
      const response = await axios.get(`/billing/invoices/${invoiceId}/pdf`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const printWindow = window.open(url);
      
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    } catch (error) {
      console.error('Error printing invoice:', error);
      alert('Failed to print invoice');
    }
  };

  const shareInvoice = async (invoiceId, invoiceNumber) => {
    try {
      const response = await axios.get(`/billing/invoices/${invoiceId}/pdf`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const file = new File([blob], `invoice-${invoiceNumber}.pdf`, { type: 'application/pdf' });
      
      if (navigator.share) {
        await navigator.share({
          title: `Invoice ${invoiceNumber}`,
          text: `Invoice ${invoiceNumber} from ${user?.companyName || 'Our Company'}`,
          files: [file]
        });
      } else {
        downloadPDF(invoiceId, invoiceNumber);
      }
    } catch (error) {
      console.error('Error sharing invoice:', error);
      downloadPDF(invoiceId, invoiceNumber);
    }
  };

  const viewInvoice = (invoiceId) => {
    navigate(`/invoices/${invoiceId}`);
  };

  const deleteInvoice = async (invoiceId, invoiceNumber) => {
    if (window.confirm(`Are you sure you want to delete invoice ${invoiceNumber}? This action cannot be undone.`)) {
      try {
        await axios.delete(`/billing/invoices/${invoiceId}`);
        alert('Invoice deleted successfully!');
        fetchInvoices(); // Refresh the list
      } catch (error) {
        console.error('Error deleting invoice:', error);
        alert('Failed to delete invoice');
      }
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <nav className="navbar">
          <h1>My Invoices</h1>
        </nav>
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading invoices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <nav className="navbar">
        <h1>My Invoices</h1>
        <div className="nav-items">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="btn btn-secondary btn-sm"
          >
            Dashboard
          </button>
          <button 
            onClick={() => navigate('/create-invoice')} 
            className="btn btn-sm"
          >
            Create New
          </button>
        </div>
      </nav>

      <div className="invoices-container">
        {error && (
          <div className="error" style={{ marginBottom: '1rem' }}>
            {error}
            <button 
              onClick={fetchInvoices} 
              className="btn btn-secondary btn-sm"
              style={{ marginLeft: '1rem' }}
            >
              Retry
            </button>
          </div>
        )}
        
        {/* Demo Mode Indicator */}
        {invoices.length > 0 && invoices[0]._id?.includes('mock') && (
          <div style={{
            background: '#d4edda',
            color: '#155724',
            padding: '0.75rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            border: '1px solid #c3e6cb',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span>💡</span>
            <div>
              <strong>Demo Mode:</strong> Using mock data. Search is working locally.
            </div>
          </div>
        )}
        
        <div className="search-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by client name, invoice number, email, phone, or item description..."
              value={searchTerm}
              onChange={handleSearchChange}
              style={{ paddingRight: '3rem' }}
            />
            <div className="search-icon">
              {searchLoading ? '⏳' : '🔍'}
            </div>
          </div>
          {searchTerm && (
            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ color: '#666', fontSize: '0.9rem' }}>
                Found {filteredInvoices.length} invoice(s) matching "{searchTerm}"
              </span>
              <button 
                onClick={clearSearch}
                className="btn btn-secondary btn-sm"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>

        {filteredInvoices.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem', 
            background: 'white', 
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
            <h3 style={{ marginBottom: '1rem', color: '#333' }}>
              {searchTerm ? 'No invoices found' : 'No invoices yet'}
            </h3>
            <p style={{ color: '#666', marginBottom: '2rem' }}>
              {searchTerm 
                ? 'Try adjusting your search terms or clear the search to see all invoices.'
                : 'Get started by creating your first invoice.'
              }
            </p>
            {!searchTerm && (
              <button 
                onClick={() => navigate('/create-invoice')}
                className="btn"
              >
                Create Your First Invoice
              </button>
            )}
            {searchTerm && (
              <button 
                onClick={clearSearch}
                className="btn btn-secondary"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="invoices-list">
            {filteredInvoices.map((invoice) => (
              <div key={invoice._id} className="invoice-card">
                <div className="invoice-header">
                  <div>
                    <div className="invoice-number">INVOICE #{invoice.invoiceNumber}</div>
                    <div className="invoice-client">
                      <strong>Client:</strong> {invoice.to.name}
                    </div>
                    <div className="invoice-dates">
                      <span>
                        <strong>Date:</strong> {new Date(invoice.date).toLocaleDateString()}
                      </span>
                      {invoice.dueDate && (
                        <span>
                          <strong>Due:</strong> {new Date(invoice.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
                      <strong>Items:</strong> {invoice.items.map(item => item.description).join(', ')}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className={`invoice-status status-${invoice.status}`}>
                      {invoice.status.toUpperCase()}
                    </div>
                    <div style={{ 
                      fontSize: '1.5rem', 
                      fontWeight: '700', 
                      color: '#333',
                      marginTop: '0.5rem'
                    }}>
                      ${invoice.total.toFixed(2)}
                    </div>
                  </div>
                </div>
                
                <div className="invoice-actions">
                  <button 
                    onClick={() => viewInvoice(invoice._id)}
                    className="btn btn-sm"
                  >
                    View Details
                  </button>
                  <button 
                    onClick={() => downloadPDF(invoice._id, invoice.invoiceNumber)}
                    className="btn btn-secondary btn-sm"
                  >
                    Download PDF
                  </button>
                  <button 
                    onClick={() => printInvoice(invoice._id)}
                    className="btn btn-secondary btn-sm"
                  >
                    Print
                  </button>
                  <button 
                    onClick={() => shareInvoice(invoice._id, invoice.invoiceNumber)}
                    className="btn btn-secondary btn-sm"
                  >
                    Share
                  </button>
                  <button 
                    onClick={() => deleteInvoice(invoice._id, invoice.invoiceNumber)}
                    className="btn btn-danger btn-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceList;