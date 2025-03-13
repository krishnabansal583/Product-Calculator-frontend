import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaSearch, FaWhatsapp, FaBell } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./dashboard.css";
import statesData from "../statesData.js";

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [userName, setUserName] = useState("");
  const [userState, setUserState] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserState = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
          throw new Error("User ID not found in localStorage");
        }

        const res = await axios.get(
          `http://localhost:5000/api/admin/user-state/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setUserState(res.data.state);
      } catch (err) {
        console.error("Failed to fetch user state", err);
      }
    };
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get("http://localhost:5000/api/products", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setProducts(res.data);
      } catch (err) {
        console.error(err.response?.data?.msg || "Failed to fetch products");
      } finally {
        setIsLoading(false);
      }
    };

    const fetchNotifications = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) return;

        const res = await axios.get(
          `http://localhost:5000/api/notifications/user/${userId}`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );
        
        setNotifications(res.data);
        // Count unread notifications
        const unread = res.data.filter(notif => !notif.read).length;
        setUnreadCount(unread);
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      }
    };

    fetchUserState();
    fetchProducts();
    fetchNotifications();

    // Set up polling for new notifications (every 30 seconds)
    const notificationInterval = setInterval(fetchNotifications, 30000);

    // Retrieve user name from localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user && user.name) {
          setUserName(user.name);
        }
      } catch (error) {
        console.error("Failed to parse user data:", error);
      }
    }

    // Retrieve selected products from localStorage
    const storedSelectedProducts = localStorage.getItem("selectedProducts");
    if (storedSelectedProducts) {
      try {
        const parsedSelectedProducts = JSON.parse(storedSelectedProducts);
        setSelectedProducts(parsedSelectedProducts);
      } catch (error) {
        console.error("Failed to parse selected products:", error);
      }
    }

    return () => {
      clearInterval(notificationInterval);
    };
  }, []);

  // Determine the pricing category based on user's state
  const getPricingCategory = () => {
    const stateInfo = statesData.find(
      (s) => s.stateName.toLowerCase() === userState.toLowerCase()
    );

    if (!stateInfo) {
      return "";
    }

    switch (stateInfo.pricingSlab) {
      case "PREMIUM ( -5% )":
        return "premiumMinus5";
      case "PREMIUM ( ROI )":
        return "premiumROI";
      case "PREMIUM ( 5% )":
        return "premium5";
      default:
        return "premiumROI";
    }
  };
  const pricingCategory = getPricingCategory();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("selectedProducts");
    navigate("/login");
  };

  const filteredProducts = products.filter((product) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      product.productName.toLowerCase().includes(searchLower) ||
      product.sampleType?.toLowerCase().includes(searchLower) ||
      product.reportingTAT?.toLowerCase().includes(searchLower) ||
      product.fastingRequired?.toString().toLowerCase().includes(searchLower) ||
      product.testCode?.toLowerCase().includes(searchLower)
    );
  });

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleCheckboxChange = (product) => {
    setSelectedProducts((prev) => {
      const isSelected = prev.find((p) => p._id === product._id);
      let updatedSelectedProducts;
      if (isSelected) {
        updatedSelectedProducts = prev.filter((p) => p._id !== product._id);
      } else {
        updatedSelectedProducts = [...prev, product];
      }
      localStorage.setItem(
        "selectedProducts",
        JSON.stringify(updatedSelectedProducts)
      );
      return updatedSelectedProducts;
    });
  };

  const handleWhatsAppShareTotal = () => {
    if (selectedProducts.length === 0) {
      alert("No products selected to share.");
      return;
    }

    let message = `*Total Price Details:*\n\n`;
    message += `*Selected Products:*\n`;
    selectedProducts.forEach((product) => {
      message += `- ${product.productName}: ₹${product[pricingCategory]} (B2B), ₹${product.mrp} (MRP)\n`;
    });
    message += `\n*Total B2B Price:* ₹${totalB2BPrice.toFixed(2)}\n`;
    message += `*Total MRP Price:* ₹${totalMRPPrice.toFixed(2)}\n`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappLink = `https://wa.me/?text=${encodedMessage}`;

    window.open(whatsappLink, "_blank");
  };

  const handleProductNameClick = (product) => {
    setSelectedProduct({
      ...product,
      productImage: product.productImage || "https://via.placeholder.com/150",
    });
    setIsPopupVisible(true);
  };

  const closePopup = () => {
    setIsPopupVisible(false);
    setSelectedProduct(null);
  };

  const handleWhatsAppShare = (product) => {
    if (!product) {
      alert("Please select a product to share.");
      return;
    }

    let message = `*Product Details:*\n`;
    message += `Name: ${product.productName}\n`;
    message += `B2B Price: ₹${product[pricingCategory]}\n`;
    message += `MRP Price: ₹${product.mrp}\n`;
    message += `Sample Type: ${product.sampleType || "N/A"}\n`;
    message += `Fasting Required: ${product.fastingRequired ? "Yes" : "No"}\n`;
    message += `Reporting TAT: ${product.reportingTAT || "N/A"}\n`;
    message += `Product Image: ${product.productImage || "N/A"}\n\n`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappLink = `https://wa.me/?text=${encodedMessage}`;
    window.open(whatsappLink, "_blank");
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    
    // If opening notifications, mark them as read
    if (!showNotifications && unreadCount > 0) {
      markNotificationsAsRead();
    }
  };

  const markNotificationsAsRead = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      // Call API to mark notifications as read
      await axios.put(
        `http://localhost:5000/api/notifications/mark-read/${userId}`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      // Update local state
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark notifications as read", err);
    }
  };

  // Update this function in Dashboard.jsx
  const handleViewInvoice = (notification) => {
    if (notification && notification.invoiceNo) {
      navigate(`/view-invoice/${notification.invoiceNo}`);
      return;
    }
    
    // Check if notification.data is the invoice
    if (notification && notification.data && notification.data.invoiceNo) {
      navigate(`/view-invoice/${notification.data.invoiceNo}`);
      return;
    }
    
    // Check for _id as fallback (original logic)
    if (notification && notification.data && notification.data._id) {
      navigate(`/view-invoice/${notification.data._id}`);
      return;
    } else if (notification && notification._id) {
      navigate(`/view-invoice/${notification._id}`);
      return;
    }
    
    console.error("Invalid invoice data:", notification);
    alert("Could not retrieve invoice details. Please try again.");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalB2BPrice = selectedProducts.reduce(
    (sum, p) => sum + parseFloat(p[pricingCategory]),
    0
  );
  const totalMRPPrice = selectedProducts.reduce(
    (sum, p) => sum + parseFloat(p.mrp),
    0
  );

  useEffect(() => {
    const searchBar = document.getElementById("search-bar");
    if (window.innerWidth <= 480) {
      searchBar.placeholder = "search";
    } else {
      searchBar.placeholder =
        "Search by product name, test code, or other details";
    }

    const handleResize = () => {
      if (window.innerWidth <= 480) {
        searchBar.placeholder = "search";
      } else {
        searchBar.placeholder =
          "Search by product name, test code, or other details";
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="dashboard-container">
      <div className="heading">
        {userName && <span className="user-name">Welcome, {userName}</span>}
        <h1>Product Price Calculator</h1>
        <div className="header-actions">
          <div className="notification-container">
            <button className="notification-btn" onClick={toggleNotifications}>
              <FaBell size={20} />
              {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </button>
            
            {showNotifications && (
              <div className="notifications-dropdown">
                <h3>Notifications</h3>
                <div className="notifications-list">
                  {notifications.length === 0 ? (
                    <div className="no-notifications">No notifications yet</div>
                  ) : (
                    notifications.map((notification) => (
                      <div 
                        key={notification._id} 
                        className={`notification-item ${!notification.read ? 'unread' : ''}`}
                      >
                        <div className="notification-title">{notification.title}</div>
                        <div className="notification-message">{notification.message}</div>
                        <div className="notification-date">{formatDate(notification.createdAt)}</div>
                        {notification.type === 'invoice' && notification.data && (
                          <button 
                            className="view-invoice-btn"
                            onClick={() => handleViewInvoice(notification.data)}
                          >
                            View Invoice
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="main-content">
        {/* Left Section - Price Calculator */}
        <div className="price-calculator">
          <div className="calculator-header">
            <h3>Product Name</h3>
            <h3>B2B Price</h3>
            <h3>MRP Price</h3>
          </div>
          <div className="calculator-content">
            {selectedProducts.map((product) => (
              <div key={product._id} className="selected-product">
                <p>{product.productName}</p>
                <p>₹{product[pricingCategory]}</p>
                <p>₹{product.mrp}</p>
              </div>
            ))}
            <div className="total-price">
              <div>
                <p>
                  <strong>Total B2B Price:</strong> ₹{totalB2BPrice.toFixed(2)}
                </p>
                <p>
                  <strong>Total MRP Price:</strong> ₹{totalMRPPrice.toFixed(2)}
                </p>
              </div>
              <button
                className="whatsapp-total-btn"
                onClick={handleWhatsAppShareTotal}
              >
                <FaWhatsapp size={20} color="#25D366" /> Share Total
              </button>
            </div>
          </div>
        </div>
        {/* Right Section - Product List */}
        <div className="user-product-section">
          <div className="search-container">
            <input
              type="text"
              id="search-bar"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search by product name, test code, or other details"
              className="search-bar"
            />
            <FaSearch className="search-icon" />
          </div>

          <div className="user-product-table-container">
  <table className="user-product-table">
    <thead>
      <tr>
        <th>Product Name</th>
        <th>B2B Price</th>
        <th>MRP Price</th>
        <th>Share</th>
      </tr>
    </thead>
    <tbody>
      {isLoading ? (
        // Show skeleton rows while loading
        Array(6).fill(0).map((_, index) => (
          <tr key={index} className="skeleton-row">
            <td colSpan="4"></td>
          </tr>
        ))
      ) : filteredProducts.length > 0 ? (
        filteredProducts.map((product) => (
          <tr key={product._id}>
            <td>
              <div className="product-name-container">
                <input
                  className="checkbox"
                  type="checkbox"
                  onChange={() => handleCheckboxChange(product)}
                  checked={selectedProducts.some((p) => p._id === product._id)}
                />
                <div className="product-name-wrapper">
                  <span
                    className="product-name"
                    onClick={() => handleProductNameClick(product)}
                  >
                    {product.productName}
                  </span>
                  {product.testCode && (
                    <span className="test-code">({product.testCode})</span>
                  )}
                </div>
              </div>
            </td>
            <td>₹{product[pricingCategory]}</td>
            <td>₹{product.mrp}</td>
            <td>
              <button
                className="whatsapp-btn"
                onClick={() => handleWhatsAppShare(product)}
              >
                <FaWhatsapp size={20} color="#25D366" />
              </button>
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan="4" style={{ textAlign: "center", padding: "30px" }}>
            No products found matching your search.
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>
        </div>
      </div>

      {/* Popup Section */}
      {isPopupVisible && selectedProduct && (
        <div className="popup-overlay">
          <div className="popup-content">
            {/* Close Button */}
            <button className="close-btn" onClick={closePopup}>
              &times;
            </button>

            {/* Main Content - 50:50 Ratio */}
            <div className="popup-main-content">
              {/* Left Side - Product Image (50%) */}
              <img
                src={
                  selectedProduct.productImage ||
                  "https://via.placeholder.com/400"
                }
                alt="Product"
                className="product-image"
              />

              {/* Right Side - Product Details (50%) */}
              <div className="popup-right">
                <h3>Product Details</h3>
                <div className="details-grid">
                  <div>
                    <span className="tick-icon">✔</span>
                    <strong>Test Code:</strong>{" "}
                    {selectedProduct.testCode || "N/A"}
                  </div>
                  <div>
                    <span className="tick-icon">✔</span>
                    <strong>Category:</strong>{" "}
                    {selectedProduct.category || "N/A"}
                  </div>
                  <div>
                    <span className="tick-icon">✔</span>
                    <strong>Sample Type:</strong>{" "}
                    {selectedProduct.sampleType || "N/A"}
                  </div>
                  <div>
                    <span className="tick-icon">✔</span>
                    <strong>Fasting Required:</strong>{" "}
                    {selectedProduct.fastingRequired ? "Yes" : "No"}
                  </div>
                  <div>
                    <span className="tick-icon">✔</span>
                    <strong>Reporting TAT:</strong>{" "}
                    {selectedProduct.reportingTAT || "N/A"}
                  </div>
                  <div>
                    <span className="tick-icon">✔</span>
                    <strong>Process Location:</strong>{" "}
                    {selectedProduct.processLocation || "N/A"}
                  </div>
                  <div>
                    <span className="tick-icon">✔</span>
                    <strong>B2B Price:</strong> ₹
                    {selectedProduct[pricingCategory]}
                  </div>
                  <div>
                    <span className="tick-icon">✔</span>
                    <strong>Lab Partner:</strong>{" "}
                    {selectedProduct.labPartner || "N/A"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;