import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Users.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/admin/get-all-users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/approve-user/${id}`);
      alert('User approved successfully!');
      fetchAllUsers();
    } catch (error) {
      console.error('Error approving user:', error);
    }
  };

  const handleLogout = () => {
    // Implement logout logic here
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
  const navigateToProducts = () => {
    navigate('/admin/products');
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-dashboard">
      {/* Navbar */}
      <div className="admin-navbar">
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          &#9776;
        </button>
        <h1>Admin Dashboard</h1>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </div>

      {/* Sidebar - Updated to match admin dashboard */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <button className="close-sidebar" onClick={toggleSidebar}>
          &times;
        </button>
        <ul>
          <li onClick={navigateToDashboard}>Dashboard</li>
          <li onClick={navigateToGenerateInvoice} >Generate Invoice</li>
          <li onClick={navigateToProducts}>Products</li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="user-management-section" style={{ width: '100%', background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)', border: '3px solid #a0e8a0' }}>
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
            <h2 className="user-form-heading">User Management</h2>
            <div style={{ position: 'relative', maxWidth: '500px', flex: '1' }}>
              <input 
                type="text" 
                style={{
                  width: '85%',
                  padding: '12px 20px',
                  paddingRight: '40px',
                  borderRadius: '30px',
                  border: '1px solid rgba(10, 50, 50, 0.2)',
                  fontSize: '16px',
                  outline: 'none',
                  backgroundColor: '#fff'
                }}
                placeholder="Search users by name or email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span style={{ position: 'absolute', right: '30px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px' }}>🔍</span>
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
              <div className="loader" style={{ 
                border: '5px solid rgba(160, 232, 160, 0.3)',
                borderRadius: '50%',
                borderTop: '5px solid #0a3232',
                width: '50px',
                height: '50px',
                animation: 'spin 1s linear infinite'
              }}></div>
              <p style={{ marginTop: '15px', color: '#0a3232', fontSize: '16px', fontWeight: '600' }}>Loading users...</p>
            </div>
          ) : (
            <div style={{ maxHeight: '500px', overflowY: 'auto', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0', borderRadius: '12px', overflow: 'hidden' }}>
                <thead>
                  <tr>
                    <th style={{ background: 'linear-gradient(to right, #0a3232, #104442)', color: 'white', fontWeight: 'bold', padding: '18px 15px', textAlign: 'center' }}>Name</th>
                    <th style={{ background: 'linear-gradient(to right, #0a3232, #104442)', color: 'white', fontWeight: 'bold', padding: '18px 15px', textAlign: 'center' }}>Email</th>
                    <th style={{ background: 'linear-gradient(to right, #0a3232, #104442)', color: 'white', fontWeight: 'bold', padding: '18px 15px', textAlign: 'center' }}>Status</th>
                    <th style={{ background: 'linear-gradient(to right, #0a3232, #104442)', color: 'white', fontWeight: 'bold', padding: '18px 15px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr key={user._id} style={{ transition: 'background-color 0.2s ease' }}>
                        <td style={{ padding: '15px', borderBottom: '1px solid rgba(10, 50, 50, 0.1)', color: '#0a3232',textAlign: 'center'  }}>{user.name}</td>
                        <td style={{ padding: '15px', borderBottom: '1px solid rgba(10, 50, 50, 0.1)', color: '#0a3232',textAlign: 'center'  }}>{user.email}</td>
                        <td style={{ padding: '15px', borderBottom: '1px solid rgba(10, 50, 50, 0.1)', color: '#0a3232', textAlign: 'center' }}>
                          <span style={{
                            padding: '6px 12px',
                            borderRadius: '30px',
                            fontSize: '14px',
                            fontWeight: '600',
                            display: 'inline-block',
                            backgroundColor: user.isApproved ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 152, 0, 0.2)',
                            color: user.isApproved ? '#388e3c' : '#ef6c00'
                          }}>
                            {user.isApproved ? 'Approved' : 'Pending'}
                          </span>
                        </td>
                        <td style={{ padding: '15px', borderBottom: '1px solid rgba(10, 50, 50, 0.1)', color: '#0a3232', textAlign: 'center' }}>
                          {!user.isApproved && (
                            <button 
                              style={{
                                background: '#0a3232',
                                color: 'white',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                transition: 'all 0.3s ease'
                              }}
                              onClick={() => handleApproveUser(user._id)}
                            >
                              Approve
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#666', fontStyle: 'italic' }}>No users found matching your search.</td>
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

export default Users;