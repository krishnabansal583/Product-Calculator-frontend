

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import './viewInvoice.css';

const ViewInvoice = () => {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInvoice = async () => {
      if (!invoiceId) {
        setError("Invoice Number is missing. Please check the URL.");
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Authentication token missing. Please login again.");
          setLoading(false);
          return;
        }

        // Updated endpoint to match the server.js route configuration
        const res = await axios.get(
          `https://backend-1-2nnq.onrender.com/api/admin/invoices/by-number/${invoiceId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.data) {
          setInvoice(res.data);
        } else {
          setError("No invoice data received");
        }
      } catch (err) {
        console.error("Failed to fetch invoice", err);

        if (err.response) {
          if (err.response.status === 404) {
            setError("Invoice not found. Please check the invoice number.");
          } else if (err.response.status === 401 || err.response.status === 403) {
            setError("Authentication failed. Please login again.");
          } else {
            setError(`Server error: ${err.response.data.msg || 'Unknown error'}`);
          }
        } else if (err.request) {
          setError("No response from server. Please check your connection.");
        } else {
          setError(`Error: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [invoiceId, navigate]);

  const handleBackClick = () => {
    navigate(-1);
  };

  if (loading) return <div className="loading-indicator">Loading invoice details...</div>;
  if (error) return (
    <div className="error-container">
      <div className="error-message">{error}</div>
      <button className="back-button" onClick={handleBackClick}>Back to Dashboard</button>
    </div>
  );
  if (!invoice) return (
    <div className="not-found-container">
      <div>Invoice not found</div>
      <button className="back-button" onClick={handleBackClick}>Back to Dashboard</button>
    </div>
  );

  const taxTotal = invoice.products.reduce((sum, p) => sum + p.taxAmount, 0);
  const additionalChargesTotal = invoice.products.reduce((sum, p) => sum + p.additionalCharges, 0);
  const subtotal = invoice.totalAmount - (taxTotal + additionalChargesTotal);

  return (
    <div className="invoice-viewer">
      <div className="invoice-header">
        <h2>Invoice #{invoice.invoiceNo}</h2>
        <button className="back-button" onClick={handleBackClick}>
          Back to Dashboard
        </button>
      </div>

      <div className="invoice-details">
        <div className="info-grid">
          <div>
            <strong>Date:</strong> {new Date(invoice.date).toLocaleDateString()}
          </div>
          <div>
            <strong>Bill To:</strong> {invoice.userName}
          </div>
          <div>
            <strong>Email:</strong> {invoice.email}
          </div>
          <div>
            <strong>Status:</strong> <span className={`status-${invoice.status}`}>{invoice.status}</span>
          </div>
        </div>

        <div className="products-table-container">
          <table className="products-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Price (₹)</th>
                <th>Tax (%)</th>
                <th>Tax Amount (₹)</th>
                <th>Additional (₹)</th>
                <th>Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              {invoice.products.map((product, index) => (
                <tr key={index}>
                  <td>{product.productName}</td>
                  <td>{product.quantity}</td>
                  <td>{product.price.toFixed(2)}</td>
                  <td>{product.tax}</td>
                  <td>{product.taxAmount.toFixed(2)}</td>
                  <td>{product.additionalCharges.toFixed(2)}</td>
                  <td>{product.totalAmount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="invoice-summary">
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Tax:</span>
            <span>₹{taxTotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Additional Charges:</span>
            <span>₹{additionalChargesTotal.toFixed(2)}</span>
          </div>
          <div className="summary-row total">
            <span>Total Amount:</span>
            <span>₹{invoice.totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewInvoice;