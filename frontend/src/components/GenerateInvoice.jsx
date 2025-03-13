import { useState, useEffect } from "react";
import axios from "axios";
import "./GenerateInvoice.css"; 
import statesData from "../statesData.js"; 

const GenerateInvoice = () => {
  const [userId, setUserId] = useState("");
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentDate, setCurrentDate] = useState("");
  const [userState, setUserState] = useState(""); 
  const [sendingNotification, setSendingNotification] = useState(false);
  const [notificationSent, setNotificationSent] = useState(false);
  const [savingToDatabase, setSavingToDatabase] = useState(false);
  const [savedToDatabase, setSavedToDatabase] = useState(false);

  useEffect(() => {
    const now = new Date();
    setCurrentDate(now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }));

    const fetchData = async () => {
      setLoading(true);
      try {
        const usersResponse = await axios.get(
          "https://backend-1-2nnq.onrender.com/api/admin/get-all-users"
        );
        const productsResponse = await axios.get(
          "https://backend-1-2nnq.onrender.com/api/admin/get-all-products"
        );

        setUsers(usersResponse.data);
        setProducts(productsResponse.data);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Failed to load user and product data. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

 
  const getPricingCategory = (state) => {
    if (!state) return "b2bPrice"; 

    const stateInfo = statesData.find(
      (s) => s.stateName.toLowerCase() === state.toLowerCase()
    );

    if (!stateInfo) {
      return "b2bPrice"; 
    }

    switch (stateInfo.pricingSlab) {
      case "PREMIUM ( -5% )":
        return "premiumMinus5";
      case "PREMIUM ( ROI )":
        return "premiumROI";
      case "PREMIUM ( 5% )":
        return "premium5";
      default:
        return "b2bPrice";
    }
  };

  const handleAddProduct = () => {
    setSelectedProducts([
      ...selectedProducts,
      { productId: "", quantity: 1, tax: 0, additionalCharges: 0, brp: 0 },
    ]);
  };

  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...selectedProducts];
    
    if (field === "quantity" || field === "tax" || field === "additionalCharges") {
      // Ensure tax is stored as a number without the % symbol
      if (field === "tax" && typeof value === "string" && value.includes("%")) {
        value = value.replace("%", "");
      }
      updatedProducts[index][field] = Number(value);
    } else {
      updatedProducts[index][field] = value;
    }
  
    
  
  
    if (field === "productId" && value) {
      const selectedProduct = products.find((p) => p._id === value);
      const pricingCategory = getPricingCategory(userState);
      
      if (selectedProduct) {
        updatedProducts[index].brp = Number(selectedProduct[pricingCategory] || selectedProduct.b2bPrice);
      }
    }
  
    setSelectedProducts(updatedProducts);
  };

  const handleRemoveProduct = (index) => {
    const updatedProducts = selectedProducts.filter((_, i) => i !== index);
    setSelectedProducts(updatedProducts);
  };

  const calculateSubtotal = () => {
    if (!selectedProducts.length) return 0;
    
    const pricingCategory = getPricingCategory(userState);
    
    return selectedProducts.reduce((total, product) => {
      const productData = products.find(p => p._id === product.productId);
      const price = productData ? (productData[pricingCategory] || productData.b2bPrice) : 0;
      return total + (price * product.quantity);
    }, 0).toFixed(2);
  };

  const calculateTotalTax = () => {
    if (!selectedProducts.length) return 0;
    
    const pricingCategory = getPricingCategory(userState);
    
    return selectedProducts.reduce((total, product) => {
      const productData = products.find(p => p._id === product.productId);
      const price = productData ? (productData[pricingCategory] || productData.b2bPrice) : 0;
      const taxAmount = (price * product.quantity * product.tax) / 100;
      return total + taxAmount;
    }, 0).toFixed(2);
  };

  const calculateAdditionalCharges = () => {
    if (!selectedProducts.length) return 0;
    
    return selectedProducts.reduce((total, product) => {
      return total + product.additionalCharges;
    }, 0).toFixed(2);
  };

  const calculateEstimatedTotal = () => {
    const subtotal = parseFloat(calculateSubtotal());
    const tax = parseFloat(calculateTotalTax());
    const additionalCharges = parseFloat(calculateAdditionalCharges());
    
    return (subtotal + tax + additionalCharges).toFixed(2);
  };

  // Function to send the invoice notification to the user
  const sendInvoiceNotification = async () => {
    if (!invoice || !userId) return;
    
    setSendingNotification(true);
    setNotificationSent(false);
    
    try {
      // Get the token from localStorage
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error("Authentication token not found");
      }
      
      // Create a notification object
      const notification = {
        userId: userId,
        type: "invoice",
        title: `New Invoice #${invoice.invoiceNo}`,
        message: `Invoice #${invoice.invoiceNo} has been generated for you with total amount ₹${invoice.totalAmount.toFixed(2)}`,
        data: invoice,
        read: false,
        createdAt: new Date()
      };
      
      // Send notification to server with proper authorization header
      await axios.post(
        "https://backend-1-2nnq.onrender.comhttps://backend-1-2nnq.onrender./api/notifications/create",
        notification,
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        }
      );
      
      setNotificationSent(true);
      setTimeout(() => setNotificationSent(false), 5000); // Hide success message after 5 seconds
    } catch (err) {
      console.error("Failed to send notification:", err);
      setError("Failed to send invoice notification to the user.");
    } finally {
      setSendingNotification(false);
    }
  };

 const saveInvoiceToDatabase = async (invoiceData) => {
  if (!invoiceData) return;
  
  setSavingToDatabase(true);
  setSavedToDatabase(false);
  
  try {
    // Get the token from localStorage
    const token = localStorage.getItem("token");
    
    if (!token) {
      throw new Error("Authentication token not found");
    }
    
    // Format the invoice data to match the expected schema
    const formattedInvoice = {
      invoiceNo: invoiceData.invoiceNo, // Important: Include the existing invoice number
      userName: invoiceData.userName,
      email: invoiceData.email,
      products: invoiceData.products.map(product => ({
        productId: product.productId,
        productName: product.productName,
        quantity: Number(product.quantity),
        price: Number(product.price),
        tax: Number(product.tax),
        taxAmount: Number(product.taxAmount),
        additionalCharges: Number(product.additionalCharges),
        totalAmount: Number(product.totalAmount)
      })),
      totalAmount: Number(invoiceData.totalAmount),
      status: "pending"
    };
    
    console.log("Sending invoice payload:", JSON.stringify(formattedInvoice, null, 2));
    
    // Send invoice to server with proper authorization header
    const response = await axios.post(
      "https://backend-1-2nnq.onrender.comhttps://backend-1-2nnq.onrender./api/admin/invoices",
      formattedInvoice,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      }
    );
    
    console.log("API response:", response.data);
    
    setSavedToDatabase(true);
    setTimeout(() => setSavedToDatabase(false), 5000);
  } catch (err) {
    console.error("Failed to save invoice to database:", err);
    if (err.response) {
      console.error("Error response data:", err.response.data);
      console.error("Error response status:", err.response.status);
      setError(`Failed to save invoice: ${err.response.data.msg || err.response.data.error || "Unknown error"}`);
    } else {
      setError("Failed to save invoice to the database. Check the console for details.");
    }
  } finally {
    setSavingToDatabase(false);
  }
};

const handleGenerateInvoice = async () => {
  if (!userId) {
    setError("Please select a user");
    return;
  }

  if (selectedProducts.length === 0) {
    setError("Please add at least one product");
    return;
  }

  for (const product of selectedProducts) {
    if (!product.productId) {
      setError("Please select a product for all rows");
      return;
    }
  }

  try {
    setLoading(true);
    setError("");
    setInvoice(null);

    const pricingCategory = getPricingCategory(userState);
    const productsWithCalculatedTax = selectedProducts.map(product => {
      const productData = products.find(p => p._id === product.productId);
      const price = productData ? (productData[pricingCategory] || productData.b2bPrice) : 0;
      
      const taxAmount = (price * product.quantity * product.tax) / 100;
      
      return {
        productId: product.productId, // Ensure productId is included
        productName: getProductName(product.productId),
        quantity: Number(product.quantity),
        price: Number(price),
        tax: Number(product.tax),
        taxAmount: Number(taxAmount),
        additionalCharges: Number(product.additionalCharges || 0),
        totalAmount: Number(price * product.quantity + taxAmount + (product.additionalCharges || 0))
      };
    });

    const response = await axios.post(
      "https://backend-1-2nnq.onrender.com/api/admin/generate-invoice",
      {
        userId,
        products: productsWithCalculatedTax,
      }
    );

    const generatedInvoice = response.data.invoice;
    
    // Make sure the invoice has all the required fields
    const completeInvoice = {
      ...generatedInvoice,
      products: productsWithCalculatedTax,
      userName: selectedUser?.name || "Unknown",
      email: selectedUser?.email || "unknown@example.com",
      status: "pending"
    };
    
    setInvoice(completeInvoice);
    
    // Now save the invoice to the database
    await saveInvoiceToDatabase(completeInvoice);
    
    setTimeout(() => {
      const invoiceDetails = document.querySelector(".invoice-details");
      if (invoiceDetails) {
        invoiceDetails.scrollIntoView({ behavior: "smooth" });
      }
    }, 500);
  } catch (err) {
    console.error("Error generating invoice:", err);
    setError("Failed to generate invoice. Please check the details.");
  } finally {
    setLoading(false);
  }
};

  const handleUserSelect = (e) => {
    const selectedUserId = e.target.value;
    setUserId(selectedUserId);

    const user = users.find((user) => user._id === selectedUserId);
    setSelectedUser(user);
    
    if (user && user.state) {
      setUserState(user.state);
      
      // Update BRP prices for any already selected products based on new state
      if (selectedProducts.length > 0) {
        const pricingCategory = getPricingCategory(user.state);
        
        const updatedProducts = selectedProducts.map(product => {
          if (product.productId) {
            const productData = products.find(p => p._id === product.productId);
            if (productData) {
              // Update the BRP price based on the user's state
              return {
                ...product,
                brp: Number(productData[pricingCategory] || productData.b2bPrice)
              };
            }
          }
          return product;
        });
        
        setSelectedProducts(updatedProducts);
      }
    } else {
      setUserState("");
    }
  };

  const getProductName = (productId) => {
    const product = products.find(p => p._id === productId);
    return product ? product.productName : "Product not found";
  };

  // Get the current pricing category based on user state
  const pricingCategory = getPricingCategory(userState);

  return (
    <div className="invoice-container">
      {/* Header Section */}
      <div className="invoice-header">
        <div className="company-info">
          <img
            src="/medifinder_logo.jpeg"
            alt="Company Logo"
            className="company-logo"
          />
          <h1 className="company-name">Medifinder Healthcare</h1>
        </div>
        <div className="invoice-label">
          INVOICE
        </div>
      </div>

      {/* Invoice Meta Information */}
      <div className="invoice-meta">
        <div className="meta-item">
          <span className="meta-label">Date:</span>
          <span className="meta-value">{currentDate}</span>
        </div>
        {invoice && (
          <div className="meta-item">
            <span className="meta-label">Invoice No:</span>
            <span className="meta-value">{invoice.invoiceNo}</span>
          </div>
        )}
      </div>

      {/* Bill From and Bill To Section */}
      <div className="bill-section">
        <div className="bill-from">
          <h3>Bill From</h3>
          <p>Arbindu Kumar</p>
          <p>Navi Mumbai, Maharashtra</p>
          <p>Contact: +91-9096272663</p>
          <p>GSTIN: 27ABCDE1234F1Z5</p>
        </div>
        <div className="bill-to">
          <h3>Bill To</h3>
          <div className="user-field">
            <label>Name:</label>
            <select
              value={userId}
              onChange={handleUserSelect}
              className="user-dropdown"
              disabled={loading}
            >
              <option value="">Select User</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
          {selectedUser && (
            <>
              <div className="user-field">
                <label>Email:</label>
                <span>{selectedUser.email}</span>
              </div>
              <div className="user-field">
                <label>Mobile:</label>
                <span>{selectedUser.mobile}</span>
              </div>
              <div className="user-field">
                <label>State:</label>
                <span>{selectedUser.state}</span>
              </div>
              {userState && (
                <div className="user-field">
                  <label>Pricing Category:</label>
                  <span>{pricingCategory}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Product Details Section */}
      <div className="product-details">
        <h3>Product Details</h3>
        <table className="product-table">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>BRP Price (₹)</th>
              <th>Quantity</th>
              <th>Tax (%)</th>
              <th>Additional Charges (₹)</th>
              <th>Amount (₹)</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {selectedProducts.map((product, index) => {
              const productData = products.find(p => p._id === product.productId);
              // Use the appropriate pricing based on state
              const price = productData ? 
                (productData[pricingCategory] || productData.b2bPrice) : 0;
              const amount = productData ? 
                (price * product.quantity).toFixed(2) : 
                "0.00";
              
              return (
                <tr key={index}>
                  <td>
                    <select
                      value={product.productId}
                      onChange={(e) =>
                        handleProductChange(index, "productId", e.target.value)
                      }
                      disabled={loading}
                    >
                      <option value="">Select Product</option>
                      {products.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.productName}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input type="number" value={product.brp} readOnly />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={product.quantity}
                      onChange={(e) =>
                        handleProductChange(index, "quantity", e.target.value)
                      }
                      min="1"
                      disabled={loading}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={product.tax}
                      onChange={(e) =>
                        handleProductChange(index, "tax", e.target.value)
                      }
                      placeholder="Tax %"
                      min="0"
                      disabled={loading}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={product.additionalCharges}
                      onChange={(e) =>
                        handleProductChange(
                          index,
                          "additionalCharges",
                          e.target.value
                        )
                      }
                      min="0"
                      disabled={loading}
                    />
                  </td>
                  <td>
                    <div className="amount-display">{amount}</div>
                  </td>
                  <td>
                    <button
                      className="remove-button"
                      onClick={() => handleRemoveProduct(index)}
                      disabled={loading}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {selectedProducts.length > 0 && (
          <div className="invoice-summary">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>₹{calculateSubtotal()}</span>
            </div>
            <div className="summary-row">
              <span>Total Tax:</span>
              <span>₹{calculateTotalTax()}</span>
            </div>
            <div className="summary-row">
              <span>Additional Charges:</span>
              <span>₹{calculateAdditionalCharges()}</span>
            </div>
            <div className="summary-row total">
              <span>Estimated Total:</span>
              <span>₹{calculateEstimatedTotal()}</span>
            </div>
          </div>
        )}
        
        <div className="button-group">
          <button className="add-product-button" onClick={handleAddProduct} disabled={loading}>
            <span className="icon">+</span> Add Product
          </button>
        </div>
      </div>

      {/* Generate Invoice Button */}
      <button
        onClick={handleGenerateInvoice}
        className="generate-button"
        disabled={loading || !userId || selectedProducts.length === 0}
      >
        {loading ? "Generating Invoice..." : "Generate Invoice"}
      </button>

      {/* Error Message */}
      {error && <div className="error-message">{error}</div>}

      {/* Database Save Status Message */}
      {savedToDatabase && (
        <div className="database-success">
          <span className="success-icon">✓</span>
          <span>Invoice saved to database successfully!</span>
        </div>
      )}

      {/* Invoice Details Section */}
      {invoice && (
        <div className="invoice-details">
          <div className="invoice-success">
            <span className="success-icon">✓</span>
            <span>Invoice generated successfully!</span>
          </div>
          
          <h3>Invoice Details</h3>
          
          <div className="invoice-info-grid">
            <div className="info-item">
              <strong>Invoice No:</strong> {invoice.invoiceNo}
            </div>
            <div className="info-item">
              <strong>Date:</strong> {new Date(invoice.date).toLocaleDateString()}
            </div>
            <div className="info-item">
              <strong>Customer:</strong> {invoice.userName}
            </div>
            <div className="info-item">
              <strong>Email:</strong> {invoice.email}
            </div>
            <div className="info-item">
              <strong>State:</strong> {selectedUser?.state || "N/A"}
            </div>
            <div className="info-item">
              <strong>Pricing Category:</strong> {pricingCategory}
            </div>
          </div>
          
          <table className="invoice-table">
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
          
          <div className="invoice-footer">
            <div className="payment-terms">
              <h4>Payment Terms</h4>
              <p>Payment due within 30 days</p>
              <p>Bank Transfer: HDFC Bank</p>
              <p>Account No: 12345678901234</p>
              <p>IFSC: HDFC0001234</p>
            </div>
            
            <div className="total-section">
              <div className="total-row">
                <span>Subtotal:</span>
                <span>₹{(invoice.totalAmount - invoice.products.reduce((sum, p) => sum + p.taxAmount + p.additionalCharges, 0)).toFixed(2)}</span>
              </div>
              <div className="total-row">
                <span>Tax:</span>
                <span>₹{invoice.products.reduce((sum, p) => sum + p.taxAmount, 0).toFixed(2)}</span>
              </div>
              <div className="total-row">
                <span>Additional Charges:</span>
                <span>₹{invoice.products.reduce((sum, p) => sum + p.additionalCharges, 0).toFixed(2)}</span>
              </div>
              <div className="total-row grand-total">
                <span>Total Amount:</span>
                <span>₹{invoice.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div className="invoice-actions">
            <button className="print-button">Print Invoice</button>
            <button className="download-button">Download PDF</button>
            <button 
              className="send-notification-button"
              onClick={sendInvoiceNotification}
              disabled={sendingNotification}
            >
              {sendingNotification ? "Sending..." : "Send to Customer"}
            </button>
            {notificationSent && (
              <div className="notification-success">
                <span className="success-icon">✓</span>
                <span>Invoice notification sent successfully!</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GenerateInvoice;