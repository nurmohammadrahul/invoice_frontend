import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const InvoiceDetail = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    try {
      const response = await axios.get(`/billing/invoices/${id}`);
      setInvoice(response.data.invoice);
    } catch (error) {
      setError('Failed to fetch invoice details');
      console.error('Error fetching invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateInvoiceStatus = async (newStatus) => {
    try {
      const response = await axios.put(`/billing/invoices/${id}`, {
        status: newStatus
      });
      setInvoice(response.data.invoice);
      alert(`Invoice status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating invoice status:', error);
      alert('Failed to update invoice status');
    }
  };

  const deleteInvoice = async () => {
    try {
      await axios.delete(`/billing/invoices/${id}`);
      alert('Invoice deleted successfully');
      navigate('/invoices');
    } catch (error) {
      console.error('Error deleting invoice:', error);
      alert('Failed to delete invoice');
    }
  };

  const downloadPDF = async () => {
    try {
      const response = await axios.get(`/billing/invoices/${id}/pdf`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoice.invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF');
    }
  };

  const printInvoice = async () => {
    try {
      const response = await axios.get(`/billing/invoices/${id}/pdf`, {
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

  const shareInvoice = async () => {
    try {
      const response = await axios.get(`/billing/invoices/${id}/pdf`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const file = new File([blob], `invoice-${invoice.invoiceNumber}.pdf`, { type: 'application/pdf' });
      
      if (navigator.share) {
        await navigator.share({
          title: `Invoice ${invoice.invoiceNumber}`,
          text: `Invoice ${invoice.invoiceNumber} from ${user.companyName}`,
          files: [file]
        });
      } else {
        downloadPDF();
      }
    } catch (error) {
      console.error('Error sharing invoice:', error);
      downloadPDF();
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <nav className="navbar">
          <h1>Invoice Details</h1>
        </nav>
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading invoice details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <nav className="navbar">
          <h1>Invoice Details</h1>
          <button onClick={() => navigate('/invoices')} className="btn btn-secondary btn-sm">
            Back to Invoices
          </button>
        </nav>
        <div className="invoices-container">
          <div className="error">{error}</div>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="dashboard">
        <nav className="navbar">
          <h1>Invoice Details</h1>
        </nav>
        <div className="invoices-container">
          <div className="error">Invoice not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <nav className="navbar">
        <h1>Invoice #{invoice.invoiceNumber}</h1>
        <div className="nav-items">
          <button onClick={() => navigate('/invoices')} className="btn btn-secondary btn-sm">
            Back to List
          </button>
          
          {invoice.status === 'draft' && (
            <button 
              onClick={() => updateInvoiceStatus('sent')}
              className="btn btn-success btn-sm"
            >
              Mark as Sent
            </button>
          )}
          
          {invoice.status === 'sent' && (
            <button 
              onClick={() => updateInvoiceStatus('paid')}
              className="btn btn-success btn-sm"
            >
              Mark as Paid
            </button>
          )}
          
          <button onClick={downloadPDF} className="btn btn-secondary btn-sm">
            Download PDF
          </button>
          <button onClick={printInvoice} className="btn btn-secondary btn-sm">
            Print
          </button>
          <button onClick={shareInvoice} className="btn btn-sm">
            Share
          </button>
          
          <button 
            onClick={() => setShowDeleteConfirm(true)}
            className="btn btn-danger btn-sm"
          >
            Delete
          </button>
        </div>
      </nav>

      {showDeleteConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '10px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            maxWidth: '400px',
            width: '90%'
          }}>
            <h3 style={{ marginBottom: '1rem', color: '#dc3545' }}>Confirm Delete</h3>
            <p style={{ marginBottom: '1.5rem' }}>
              Are you sure you want to delete invoice <strong>#{invoice.invoiceNumber}</strong>? 
              This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="btn btn-secondary btn-sm"
              >
                Cancel
              </button>
              <button 
                onClick={deleteInvoice}
                className="btn btn-danger btn-sm"
              >
                Delete Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="invoices-container">
        <div className="invoice-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="invoice-header">
            <div>
              <div className="invoice-number" style={{ fontSize: '1.5rem' }}>
                INVOICE #{invoice.invoiceNumber}
              </div>
              <div style={{ color: '#666', marginTop: '0.5rem' }}>
                Created: {new Date(invoice.createdAt).toLocaleDateString()}
              </div>
              
              <div style={{ marginTop: '0.5rem' }}>
                <span className={`invoice-status status-${invoice.status}`}>
                  {invoice.status.toUpperCase()}
                </span>
                <div style={{ 
                  fontSize: '0.8rem', 
                  color: '#666', 
                  marginTop: '0.25rem',
                  fontStyle: 'italic'
                }}>
                  {invoice.status === 'draft' && '🔄 This invoice is still in draft mode - not sent to client yet'}
                  {invoice.status === 'sent' && '📤 Invoice has been sent to client - awaiting payment'}
                  {invoice.status === 'paid' && '✅ Invoice has been paid - thank you!'}
                  {invoice.status === 'overdue' && '⚠️ Payment is overdue - please follow up with client'}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', margin: '2rem 0' }}>
            <div>
              <h3 style={{ marginBottom: '1rem', color: '#333' }}>From:</h3>
              <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px' }}>
                <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>{invoice.from.name}</p>
                {invoice.from.address && <p>{invoice.from.address}</p>}
                {invoice.from.city && <p>{invoice.from.city}</p>}
                {invoice.from.phone && <p>{invoice.from.phone}</p>}
                {invoice.from.email && <p>{invoice.from.email}</p>}
              </div>
            </div>

            <div>
              <h3 style={{ marginBottom: '1rem', color: '#333' }}>To:</h3>
              <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px' }}>
                <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>{invoice.to.name}</p>
                {invoice.to.address && <p>{invoice.to.address}</p>}
                {invoice.to.city && <p>{invoice.to.city}</p>}
                {invoice.to.phone && <p>{invoice.to.phone}</p>}
                {invoice.to.email && <p>{invoice.to.email}</p>}
              </div>
            </div>
          </div>

          <div style={{ margin: '2rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <strong>Invoice Date:</strong> {new Date(invoice.date).toLocaleDateString()}
              </div>
              {invoice.dueDate && (
                <div>
                  <strong>Due Date:</strong> {new Date(invoice.dueDate).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>

          <div style={{ margin: '2rem 0' }}>
            <h3 style={{ marginBottom: '1rem', color: '#333' }}>Items</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Description</th>
                  <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>Qty</th>
                  <th style={{ padding: '1rem', textAlign: 'right', borderBottom: '2px solid #dee2e6' }}>Price</th>
                  <th style={{ padding: '1rem', textAlign: 'right', borderBottom: '2px solid #dee2e6' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <td style={{ padding: '1rem' }}>{item.description}</td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>{item.quantity}</td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>${item.price.toFixed(2)}</td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>${item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ textAlign: 'right', marginTop: '2rem' }}>
            <div style={{ display: 'inline-block', minWidth: '300px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Subtotal:</span>
                <span>${invoice.subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Tax ({invoice.taxRate}%):</span>
                <span>${invoice.taxAmount.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #333', paddingTop: '0.5rem', fontWeight: '700', fontSize: '1.2rem' }}>
                <span>Total:</span>
                <span>${invoice.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {invoice.notes && (
            <div style={{ marginTop: '2rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
              <h4 style={{ marginBottom: '0.5rem', color: '#333' }}>Notes:</h4>
              <p style={{ whiteSpace: 'pre-wrap' }}>{invoice.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetail;