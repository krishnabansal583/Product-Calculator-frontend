import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllProducts();
  }, []);

  const fetchAllProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/admin/get-all-products');
      setProducts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    alert('Logged out successfully!');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const navigateToDashboard = () => {
    navigate('/admindashboard');
  };
  const navigateToGenerateInvoice = () => {
    navigate('/generate-invoice');
  };

  const navigateToUsers = () => {
    navigate('/admin/users');
  };

  const filteredProducts = products.filter(product =>
    product.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container">
      {/* Navbar */}
      <div className="heading">
        <div className="sidebar-toggle" onClick={toggleSidebar}>
          &#9776;
        </div>
        <h1>Admin Dashboard</h1>
        <div className="header-actions">
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <button className="close-sidebar" onClick={toggleSidebar}>
          &times;
        </button>
        <ul>
          <li onClick={navigateToDashboard}>Dashboard</li>
          <li onClick={navigateToGenerateInvoice}>Gernerate Invoice</li>
          <li onClick={navigateToUsers}>Users</li>
        </ul>
      </div>

      <div className="main-content">
        {/* Product List Section */}
        <div className="user-product-section">
          <h2 className="section-title">All Products</h2>
          
          <div className="search-container">
            <input
              type="text"
              className="product-search-bar"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="product-search-icon">🔍</span>
          </div>
          
          {loading ? (
            <div className="loader-container">
              <div className="loader"></div>
              <p className="loader-text">Loading products...</p>
            </div>
          ) : (
            <div className="user-product-table-container">
              <table className="user-product-table">
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>B2B Price</th>
                    <th>MRP</th>
                    <th>Sample Type</th>
                    <th>Fasting</th>
                    <th>TAT</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <tr key={product._id}>
                        <td>
                          <div className="product-name-container">
                            <div className="product-name-wrapper">
                              <span className="product-name">{product.productName}</span>
                            </div>
                          </div>
                        </td>
                        <td>₹{product.b2bPrice}</td>
                        <td>₹{product.mrp}</td>
                        <td>{product.sampleType}</td>
                        <td>{product.fastingRequired ? 'Yes' : 'No'}</td>
                        <td>{product.reportingTAT}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="no-products">
                        No products found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;