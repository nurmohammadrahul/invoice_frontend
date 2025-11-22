import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateInvoice = ({ user }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    from: {
      name: user.companyName || 'Your Company Name',
      address: user.address || '123 Business Street',
      city: user.city || 'City, State 12345',
      phone: user.phone || '+1 (555) 123-4567',
      email: user.email || 'billing@company.com'
    },
    to: {
      name: '',
      address: '',
      city: '',
      phone: '',
      email: ''
    },
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    items: [
      { 
        description: '', 
        quantity: 1, 
        price: 0, 
        total: 0 
      }
    ],
    taxRate: 10,
    notes: '',
    status: 'draft'
  });

  const calculateItemTotal = (quantity, price) => {
    return quantity * price;
  };

  const calculateTotals = (items, taxRate) => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const taxAmount = (subtotal * taxRate) / 100;
    const total = subtotal + taxAmount;
    
    return { subtotal, taxAmount, total };
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    const item = { ...newItems[index] };
    
    if (field === 'quantity' || field === 'price') {
      value = field === 'quantity' ? parseInt(value) || 0 : parseFloat(value) || 0;
    }
    
    item[field] = value;
    
    if (field === 'quantity' || field === 'price') {
      item.total = calculateItemTotal(item.quantity, item.price);
    }
    
    newItems[index] = item;
    
    const totals = calculateTotals(newItems, formData.taxRate);
    
    setFormData({
      ...formData,
      items: newItems,
      ...totals
    });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { description: '', quantity: 1, price: 0, total: 0 }
      ]
    });
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      const totals = calculateTotals(newItems, formData.taxRate);
      
      setFormData({
        ...formData,
        items: newItems,
        ...totals
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.post('/billing/invoices', formData);
      setSuccess('Invoice created successfully!');
      setTimeout(() => {
        navigate('/invoices');
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  const { subtotal, taxAmount, total } = calculateTotals(formData.items, formData.taxRate);

  return (
    <div className="dashboard">
      <nav className="navbar">
        <h1>Create New Invoice</h1>
        <div className="nav-items">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="btn btn-secondary btn-sm"
          >
            Dashboard
          </button>
          <button 
            onClick={() => navigate('/invoices')} 
            className="btn btn-secondary btn-sm"
          >
            View Invoices
          </button>
        </div>
      </nav>

      <div className="invoice-form-container">
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
        
        <form onSubmit={handleSubmit} className="invoice-form">
          <div className="form-section">
            <h3>From (Your Company)</h3>
            <div className="form-row">
              {Object.keys(formData.from).map(field => (
                <div key={field} className="form-group-full">
                  <label>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                  <input
                    type="text"
                    value={formData.from[field]}
                    onChange={(e) => setFormData({
                      ...formData,
                      from: { ...formData.from, [field]: e.target.value }
                    })}
                    required={field === 'name'}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="form-section">
            <h3>To (Client)</h3>
            <div className="form-row">
              {Object.keys(formData.to).map(field => (
                <div key={field} className="form-group-full">
                  <label>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                  <input
                    type="text"
                    value={formData.to[field]}
                    onChange={(e) => setFormData({
                      ...formData,
                      to: { ...formData.to, [field]: e.target.value }
                    })}
                    required={field === 'name'}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="form-section">
            <h3>Invoice Details</h3>
            <div className="form-row">
              <div className="form-group-full">
                <label>Invoice Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div className="form-group-full">
                <label>Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
              <div className="form-group-full">
                <label>Tax Rate (%)</label>
                <input
                  type="number"
                  value={formData.taxRate}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    taxRate: parseFloat(e.target.value) || 0 
                  })}
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Items</h3>
            <div className="items-section">
              <table className="items-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th width="100">Qty</th>
                    <th width="120">Price ($)</th>
                    <th width="120">Total ($)</th>
                    <th width="80">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          placeholder="Item description"
                          required
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                          min="1"
                          required
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => updateItem(index, 'price', e.target.value)}
                          min="0"
                          step="0.01"
                          required
                        />
                      </td>
                      <td className="item-total">
                        ${item.total.toFixed(2)}
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="btn btn-danger btn-sm"
                          disabled={formData.items.length <= 1}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button type="button" onClick={addItem} className="btn btn-secondary">
                Add Item
              </button>
            </div>
          </div>

          <div className="totals-section">
            <div className="totals-row">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="totals-row">
              <span>Tax ({formData.taxRate}%):</span>
              <span>${taxAmount.toFixed(2)}</span>
            </div>
            <div className="totals-row">
              <span><strong>Total:</strong></span>
              <span><strong>${total.toFixed(2)}</strong></span>
            </div>
          </div>

          <div className="form-section">
            <h3>Additional Notes</h3>
            <div className="form-group-full">
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional notes or terms for the client..."
                rows="4"
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/invoices')}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn"
              disabled={loading}
            >
              {loading ? 'Creating Invoice...' : 'Create Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateInvoice;