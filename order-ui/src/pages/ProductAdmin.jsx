import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Trash2 } from 'lucide-react';

export default function ProductAdmin() {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('');

  const token = localStorage.getItem('token');
  const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API}/products`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setProducts(res.data);
    } catch (err) {
      toast.error('Failed to fetch products');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newProduct = {
      name,
      price: parseFloat(price),
      category,
      stock: parseInt(stock),
    };

    try {
      await axios.post(`${API}/products`, newProduct, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      toast.success('Product added!');
      setName('');
      setPrice('');
      setCategory('');
      setStock('');
      fetchProducts();
    } catch (err) {
      toast.error('Failed to add product');
      console.error(err);
    }
  };

  const handleDelete = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await axios.delete(`${API}/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Product deleted');
      fetchProducts();
    } catch (err) {
      toast.error('Failed to delete product');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100 px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-sm p-6 sm:p-8 rounded-xl shadow-md border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Product Admin</h2>

        {/* Product Form */}
        <form onSubmit={handleSubmit} className="space-y-6 mb-10 border-b pb-6">
          <h3 className="text-2xl font-semibold text-gray-700">Add New Product</h3>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g., Wireless Mouse"
              className="w-full border border-gray-300 px-4 py-2 rounded-md focus:ring focus:ring-blue-200"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">Price (₹)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                placeholder="e.g., 1499"
                className="w-full border border-gray-300 px-4 py-2 rounded-md focus:ring focus:ring-blue-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">Stock</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
                placeholder="e.g., 100"
                className="w-full border border-gray-300 px-4 py-2 rounded-md focus:ring focus:ring-blue-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Category</label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              placeholder="e.g., Electronics"
              className="w-full border border-gray-300 px-4 py-2 rounded-md focus:ring focus:ring-blue-200"
            />
          </div>

          <div className="text-right">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-semibold transition"
            >
              Add Product
            </button>
          </div>
        </form>

        {/* Product List */}
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Product List</h3>

        {/* Table for Desktop */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="min-w-full text-sm border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border">Name</th>
                <th className="px-4 py-2 border">Price</th>
                <th className="px-4 py-2 border">Category</th>
                <th className="px-4 py-2 border">Stock</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.productId} className="text-center">
                  <td className="px-4 py-2 border">{p.name}</td>
                  <td className="px-4 py-2 border">₹{p.price.toFixed(2)}</td>
                  <td className="px-4 py-2 border">
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded">
                      {p.category}
                    </span>
                  </td>
                  <td className="px-4 py-2 border">{p.stock}</td>
                  <td className="px-4 py-2 border">
                    <button
                      onClick={() => handleDelete(p.productId)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cards for Mobile */}
        <div className="sm:hidden space-y-4">
          {products.map((p) => (
            <div key={p.productId} className="bg-gray-100 p-4 rounded-md shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-lg font-semibold">{p.name}</h4>
                <button
                  onClick={() => handleDelete(p.productId)}
                  className="text-red-600 hover:text-red-800"
                  title="Delete Product"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              <div className="text-sm text-gray-700 space-y-1">
                <div>Price: ₹{p.price.toFixed(2)}</div>
                <div>Stock: {p.stock}</div>
                <div>
                  Category:{' '}
                  <span className="inline-block bg-blue-200 text-blue-900 px-2 py-0.5 rounded text-xs">
                    {p.category}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
