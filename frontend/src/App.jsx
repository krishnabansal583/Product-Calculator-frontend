import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Users from './pages/Users';
import Products from './pages/Products';
import GenerateInvoice from './components/GenerateInvoice';
import ViewInvoice from "./components/ViewInvoice";
// Protected Route component for regular users
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!token) {
    return <Navigate to="/login" />;
  }
  
  // Check if user is approved
  if (!user.isApproved && user.role !== 'admin') {
    return <Navigate to="/login" />;
  }
  
  return children;
};

// Admin Route component
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!token || user.role !== 'admin') {
    return <Navigate to="/login" />;
  }
  
  return children;
};

function App() {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simple check to ensure auth state is loaded
    setIsLoading(false);
  }, []);
  
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected User Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/generate-invoice" 
          element={
            <ProtectedRoute>
              <GenerateInvoice />
            </ProtectedRoute>
          } 
        />
       <Route path="/view-invoice/:invoiceId" element={
          <ProtectedRoute>
            <ViewInvoice />
          </ProtectedRoute>
         } />
        
        {/* Protected Admin Routes */}
        <Route 
          path="/adminDashboard" 
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } 
        />
        
        <Route 
          path="/admin/users" 
          element={
            <AdminRoute>
              <Users />
            </AdminRoute>
          } 
        />
        
        <Route 
          path="/admin/products" 
          element={
            <AdminRoute>
              <Products />
            </AdminRoute>
          } 
        />

        {/* Default route */}
        <Route path="/" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;