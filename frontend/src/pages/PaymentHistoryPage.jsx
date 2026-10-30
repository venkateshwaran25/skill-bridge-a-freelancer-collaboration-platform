import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './PaymentHistoryPage.css';

const PaymentHistoryPage = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, [filter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('skillbridge_token');
      const response = await axios.get('/api/payments/user/history', {
        params: { role: filter !== 'all' ? filter : 'all', limit: 50 },
        headers: { Authorization: `Bearer ${token}` },
      });
      setPayments(response.data.payments || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'status-completed';
      case 'pending':
        return 'status-pending';
      case 'processing':
        return 'status-processing';
      case 'failed':
        return 'status-failed';
      case 'refunded':
        return 'status-refunded';
      default:
        return '';
    }
  };

  if (loading) {
    return <div className="payment-page loading">Loading payment history...</div>;
  }

  return (
    <div className="payment-page">
      <div className="page-header">
        <h1>💰 Payment History</h1>
        <p>Track all your payments and invoices</p>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button
          className={`tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Payments
        </button>
        <button
          className={`tab ${filter === 'payer' ? 'active' : ''}`}
          onClick={() => setFilter('payer')}
        >
          Paid Out
        </button>
        <button
          className={`tab ${filter === 'recipient' ? 'active' : ''}`}
          onClick={() => setFilter('recipient')}
        >
          Received
        </button>
      </div>

      {/* Payments Table */}
      {payments.length === 0 ? (
        <div className="empty-state">
          <p>No payments found</p>
        </div>
      ) : (
        <div className="payments-container">
          <div className="payments-grid">
            {payments.map((payment) => (
              <div key={payment._id} className="payment-card">
                <div className="payment-header">
                  <div className="payment-info">
                    <h3>
                      {filter === 'payer'
                        ? `Paid to ${payment.recipientId?.name}`
                        : `Received from ${payment.payerId?.name}`}
                    </h3>
                    <p className="payment-date">{formatDate(payment.createdAt)}</p>
                  </div>
                  <div className={`payment-status ${getStatusColor(payment.status)}`}>
                    {payment.status.toUpperCase()}
                  </div>
                </div>

                <div className="payment-details">
                  <div className="detail-row">
                    <span className="label">Amount</span>
                    <span className="value">{formatCurrency(payment.amount)}</span>
                  </div>
                  {payment.projectId?.title && (
                    <div className="detail-row">
                      <span className="label">Project</span>
                      <span className="value">{payment.projectId.title}</span>
                    </div>
                  )}
                  {payment.invoiceNumber && (
                    <div className="detail-row">
                      <span className="label">Invoice</span>
                      <span className="value">{payment.invoiceNumber}</span>
                    </div>
                  )}
                  {payment.description && (
                    <div className="detail-row">
                      <span className="label">Description</span>
                      <span className="value">{payment.description}</span>
                    </div>
                  )}
                </div>

                {payment.dueDate && (
                  <div className="payment-dates">
                    <p>Due: {formatDate(payment.dueDate)}</p>
                    {payment.paidDate && (
                      <p className="paid-date">Paid: {formatDate(payment.paidDate)}</p>
                    )}
                  </div>
                )}

                <div className="payment-actions">
                  <button className="btn-view">View Details</button>
                  {payment.status === 'pending' && (
                    <button className="btn-pay">Pay Now</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentHistoryPage;
