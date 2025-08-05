// App.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import CreateOrder from './pages/CreateOrder';
import OrderDetail from './pages/OrderDetail';
import Login from './pages/Login';
import ProductAdmin from './pages/ProductAdmin';
import DashboardAnalytics from './pages/DashboardAnalytics';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';

export default function App() {
  const [auth, setAuth] = useState(!!localStorage.getItem('token'));
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    setAuth(false);
    navigate('/login');
  };

  useEffect(() => {
    const syncAuth = () => {
      setAuth(!!localStorage.getItem('token'));
    };
    window.addEventListener('storage', syncAuth);
    return () => window.removeEventListener('storage', syncAuth);
  }, []);

  return (
    <div>
      {auth && <Navbar onLogout={handleLogout} />}

      <main className="p-4">
        <Routes>
          <Route path="/login" element={<Login setAuth={setAuth} />} />
          <Route path="/" element={auth ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/create" element={auth ? <CreateOrder /> : <Navigate to="/login" />} />
          <Route path="/orders/:id" element={auth ? <OrderDetail /> : <Navigate to="/login" />} />
          <Route path="/admin/products" element={auth ? <ProductAdmin /> : <Navigate to="/login" />} />
          <Route path="/analytics" element={auth ? <DashboardAnalytics /> : <Navigate to="/login" />} />
        </Routes>
      </main>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
