import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

export default function Navbar({ onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const logout = () => {
    setMenuOpen(false);
    onLogout();
    navigate('/login');
  };

  const navItemClass = ({ isActive }) =>
    `block py-2 px-4 rounded hover:bg-blue-100 transition ${
      isActive ? 'text-blue-700 font-semibold bg-blue-50' : 'text-gray-700'
    }`;

  return (
    <nav className="bg-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="text-xl font-bold text-blue-600">Order Management</div>

        {/* Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden focus:outline-none transition-transform"
        >
          <svg
            className={`w-6 h-6 text-gray-600 transform ${menuOpen ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Links */}
        <div className={`flex-col md:flex md:flex-row md:items-center md:space-x-4 ${menuOpen ? 'flex' : 'hidden'} md:flex`}>
          <NavLink to="/" className={navItemClass} onClick={() => setMenuOpen(false)}>Dashboard</NavLink>
          <NavLink to="/analytics" className={navItemClass} onClick={() => setMenuOpen(false)}>Analytics</NavLink>
          <NavLink to="/create" className={navItemClass} onClick={() => setMenuOpen(false)}>Create Order</NavLink>
          <NavLink to="/admin/products" className={navItemClass} onClick={() => setMenuOpen(false)}>Manage Products</NavLink>
          <button
            onClick={logout}
            className="block mt-2 md:mt-0 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
