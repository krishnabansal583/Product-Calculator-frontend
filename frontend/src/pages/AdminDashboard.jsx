
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [createFormData, setCreateFormData] = useState({
    productName: '',
    b2bPrice: '',
    mrp: '',
    sampleType: '',
    fastingRequired: false,
    reportingTAT: '',
    productImage: '',
    srNo: '',
    testCode: '',
    category: '',
    labPartner: '',
    premiumMinus5: '',
    premiumROI: '',
    premium5: '',
    processLocation: '',
  });
  const [editFormData, setEditFormData] = useState({
    productName: '',
    b2bPrice: '',
    mrp: '',
    sampleType: '',
    fastingRequired: false,
    reportingTAT: '',
    productImage: '',
    srNo: '',
    testCode: '',
    category: '',
    labPartner: '',
    premiumMinus5: '',
    premiumROI: '',
    premium5: '',
    processLocation: '',
  });
  const [file, setFile] = useState(null); // State for file upload
  const [sidebarOpen, setSidebarOpen] = useState(false); // State for sidebar
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllProducts();
  }, []);

  const fetchAllProducts = async () => {
    try {
      const response = await axios.get('https://backend-1-2nnq.onrender.com/api/admin/get-all-products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchProductById = async (id) => {
    try {
      const response = await axios.get(`https://backend-1-2nnq.onrender.com/api/admin/get-product/${id}`);
      setSelectedProduct(response.data);
      setEditFormData(response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
    }
  };

  const handleEditProduct = async (id) => {
    try {
      await axios.put(`https://backend-1-2nnq.onrender.com/api/admin/update-product/${id}`, editFormData);
      alert('Product updated successfully!');
      fetchAllProducts();
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await axios.delete(`https://backend-1-2nnq.onrender.com/api/admin/delete-product/${id}`);
      alert('Product deleted successfully!');
      fetchAllProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleCreateInputChange = (e) => {
    const { name, value } = e.target;
    setCreateFormData({ ...createFormData, [name]: value });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://backend-1-2nnq.onrender.com/api/admin/add-product', createFormData);
      alert('Product added successfully!');
      fetchAllProducts();
      setCreateFormData({
        productName: '',
        b2bPrice: '',
        mrp: '',
        sampleType: '',
        fastingRequired: false,
        reportingTAT: '',
        productImage: '',
        srNo: '',
        testCode: '',
        category: '',
        labPartner: '',
        premiumMinus5: '',
        premiumROI: '',
        premium5: '',
        processLocation: '',
      });
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]); // Set the selected file
  };

  const handleFileUpload = async () => {
    if (!file) {
      alert('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('https://backend-1-2nnq.onrender.com/api/admin/add-products-from-file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Products added successfully!');
      fetchAllProducts(); // Refresh the product list
      setFile(null); // Clear the file input
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("selectedProducts");
    navigate("/login");
  };
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const navigateToUsers = () => {
    navigate('/admin/users');
  };

  const navigateToProducts = () => {
    navigate('/admin/products');
  };

  const navigateToInvoice = () => {
    navigate('/generate-invoice');
  };

  return (
    <div className="admin-dashboard">
      {/* Navbar */}
      <div className="admin-navbar">
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          &#9776;
        </button>
        <h1 className="dashboard-title">Admin Dashboard</h1>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </div>

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <button className="close-sidebar" onClick={toggleSidebar}>
          &times;
        </button>
        <ul>
          <li onClick={navigateToUsers}>Users</li>
          <li onClick={navigateToProducts}>Products</li>
          <li onClick={navigateToInvoice}>Generate Invoice</li>
        </ul>
      </div>

      <div className="main-content">
        {/* Left Section - Add Product Form */}
        <div className="add-product-form">
          <h2 className="form-heading">Add New Product</h2>
          <form onSubmit={handleCreateProduct}>
            <label>
              Product Name:
              <input
                type="text"
                name="productName"
                value={createFormData.productName}
                onChange={handleCreateInputChange}
                required
              />
            </label>
            <label>
              B2B Price:
              <input
                type="number"
                name="b2bPrice"
                value={createFormData.b2bPrice}
                onChange={handleCreateInputChange}
                required
              />
            </label>
            <label>
              MRP:
              <input
                type="number"
                name="mrp"
                value={createFormData.mrp}
                onChange={handleCreateInputChange}
                required
              />
            </label>
            <label>
              Sample Type:
              <input
                type="text"
                name="sampleType"
                value={createFormData.sampleType}
                onChange={handleCreateInputChange}
                required
              />
            </label>
            <label>
              Fasting Required:
              <select
                name="fastingRequired"
                value={createFormData.fastingRequired}
                onChange={handleCreateInputChange}
                required
              >
                <option value={true}>Yes</option>
                <option value={false}>No</option>
              </select>
            </label>
            <label>
              Reporting TAT:
              <input
                type="text"
                name="reportingTAT"
                value={createFormData.reportingTAT}
                onChange={handleCreateInputChange}
                required
              />
            </label>
            <label>
              Product Image URL:
              <input
                type="text"
                name="productImage"
                value={createFormData.productImage}
                onChange={handleCreateInputChange}
                required
              />
            </label>
            <label>
              Sr No:
              <input
                type="number"
                name="srNo"
                value={createFormData.srNo}
                onChange={handleCreateInputChange}
                required
              />
            </label>
            <label>
              Test Code:
              <input
                type="text"
                name="testCode"
                value={createFormData.testCode}
                onChange={handleCreateInputChange}
                required
              />
            </label>
            <label>
              Category:
              <input
                type="text"
                name="category"
                value={createFormData.category}
                onChange={handleCreateInputChange}
                required
              />
            </label>
            <label>
              Lab Partner:
              <input
                type="text"
                name="labPartner"
                value={createFormData.labPartner}
                onChange={handleCreateInputChange}
                required
              />
            </label>
            <label>
              -5% Premium:
              <input
                type="number"
                name="premiumMinus5"
                value={createFormData.premiumMinus5}
                onChange={handleCreateInputChange}
                required
              />
            </label>
            <label>
              ROI Premium:
              <input
                type="number"
                name="premiumROI"
                value={createFormData.premiumROI}
                onChange={handleCreateInputChange}
                required
              />
            </label>
            <label>
              5% Premium:
              <input
                type="number"
                name="premium5"
                value={createFormData.premium5}
                onChange={handleCreateInputChange}
                required
              />
            </label>
            <label>
              Process Location:
              <input
                type="text"
                name="processLocation"
                value={createFormData.processLocation}
                onChange={handleCreateInputChange}
                required
              />
            </label>
            <button type="submit">Add Product</button>
          </form>

          {/* File Upload Section */}
          <div className="file-upload-section">
            <h3>Or Upload a CSV/Excel File</h3>
            <label>
              Upload File:
              <input type="file" accept=".csv, .xlsx, .xls" onChange={handleFileChange} />
            </label>
            <button type="button" onClick={handleFileUpload}>
              Upload and Add Products
            </button>
          </div>
        </div>

        {/* Right Section - Display All Products */}
        <div className="product-list-section">
          <h2 className="form-heading">All Products</h2>
          <ul className="product-list">
            {products.map((product) => (
              <li key={product._id}>
                <div className="product-info">
                  <strong>{product.productName}</strong>
                  <p>Test Code: {product.testCode}</p>
                  <p>Category: {product.category}</p>
                  <p>Lab Partner: {product.labPartner}</p>
                </div>
                <div className="product-actions">
                  <button onClick={() => fetchProductById(product._id)}>Edit</button>
                  <button onClick={() => handleDeleteProduct(product._id)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Edit Product admin-Popup */}
      {selectedProduct && (
        <div className="admin-popup-overlay">
          <div className="admin-popup-content">
            <h2>Edit Product</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleEditProduct(selectedProduct._id);
              }}
            >
              <label>
                Product Name:
                <input
                  type="text"
                  name="productName"
                  value={editFormData.productName}
                  onChange={handleEditInputChange}
                  required
                />
              </label>
              <label>
                B2B Price:
                <input
                  type="number"
                  name="b2bPrice"
                  value={editFormData.b2bPrice}
                  onChange={handleEditInputChange}
                  required
                />
              </label>
              <label>
                MRP:
                <input
                  type="number"
                  name="mrp"
                  value={editFormData.mrp}
                  onChange={handleEditInputChange}
                  required
                />
              </label>
              <label>
                Sample Type:
                <input
                  type="text"
                  name="sampleType"
                  value={editFormData.sampleType}
                  onChange={handleEditInputChange}
                  required
                />
              </label>
              <label>
                Fasting Required:
                <select
                  name="fastingRequired"
                  value={editFormData.fastingRequired}
                  onChange={handleEditInputChange}
                  required
                >
                  <option value={true}>Yes</option>
                  <option value={false}>No</option>
                </select>
              </label>
              <label>
                Reporting TAT:
                <input
                  type="text"
                  name="reportingTAT"
                  value={editFormData.reportingTAT}
                  onChange={handleEditInputChange}
                  required
                />
              </label>
              <label>
                Product Image URL:
                <input
                  type="text"
                  name="productImage"
                  value={editFormData.productImage}
                  onChange={handleEditInputChange}
                  required
                />
              </label>
              <label>
                Sr No:
                <input
                  type="number"
                  name="srNo"
                  value={editFormData.srNo}
                  onChange={handleEditInputChange}
                  required
                />
              </label>
              <label>
                Test Code:
                <input
                  type="text"
                  name="testCode"
                  value={editFormData.testCode}
                  onChange={handleEditInputChange}
                  required
                />
              </label>
              <label>
                Category:
                <input
                  type="text"
                  name="category"
                  value={editFormData.category}
                  onChange={handleEditInputChange}
                  required
                />
              </label>
              <label>
                Lab Partner:
                <input
                  type="text"
                  name="labPartner"
                  value={editFormData.labPartner}
                  onChange={handleEditInputChange}
                  required
                />
              </label>
              <label>
                -5% Premium:
                <input
                  type="number"
                  name="premiumMinus5"
                  value={editFormData.premiumMinus5}
                  onChange={handleEditInputChange}
                  required
                />
              </label>
              <label>
                ROI Premium:
                <input
                  type="number"
                  name="premiumROI"
                  value={editFormData.premiumROI}
                  onChange={handleEditInputChange}
                  required
                />
              </label>
              <label>
                5% Premium:
                <input
                  type="number"
                  name="premium5"
                  value={editFormData.premium5}
                  onChange={handleEditInputChange}
                  required
                />
              </label>
              <label>
                Process Location:
                <input
                  type="text"
                  name="processLocation"
                  value={editFormData.processLocation}
                  onChange={handleEditInputChange}
                  required
                />
              </label>
              <div className="admin-popup-buttons">
                <button type="submit">Update Product</button>
                <button type="button" onClick={() => setSelectedProduct(null)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;