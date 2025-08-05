import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import api from '../services/api';
import { Trash2 } from 'lucide-react';

export default function CreateOrder() {
  const [customerName, setCustomerName] = useState('');
  const [items, setItems] = useState([{ productId: '', quantity: 1 }]);
  const [products, setProducts] = useState([]);
  const [invoiceFile, setInvoiceFile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get('/api/products', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setProducts(res.data);
      } catch (err) {
        toast.error('Failed to load products');
        console.error(err);
      }
    };
    fetchProducts();
  }, []);

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = field === 'quantity' ? Number(value) : value;
    setItems(updated);
  };

  const addItem = () => setItems([...items, { productId: '', quantity: 1 }]);
  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));

  const calculateTotal = () =>
    items.reduce((sum, item) => {
      const product = products.find(p => p.productId === item.productId);
      return sum + (item.quantity * (product?.price || 0));
    }, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!invoiceFile) {
      toast.error('Please upload an invoice PDF.');
      return;
    }

    const enrichedItems = items.map(item => {
      const product = products.find(p => p.productId === item.productId);
      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product?.price || 0
      };
    });

    const formData = new FormData();
    formData.append('customerName', customerName);
    formData.append('amount', calculateTotal());
    formData.append('invoice', invoiceFile);
    formData.append('items', JSON.stringify(enrichedItems));

    try {
      await api.post('/orders', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Order created successfully!');
      navigate('/', { state: { orderId: '', pendingInvoice: true } });
    } catch (err) {
      toast.error('Failed to create order.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100 px-4 py-10">
      <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-sm p-6 sm:p-8 rounded-xl shadow-md border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Create New Order</h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Customer Name */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">
              Customer Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full border border-gray-300 px-4 py-2 rounded-md focus:ring focus:ring-blue-200"
              placeholder="Enter customer name"
              required
            />
          </div>

          {/* Order Items */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-semibold text-gray-700">
                Order Items <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={addItem}
                className="text-blue-600 hover:underline text-sm"
              >
                + Add Item
              </button>
            </div>

            {items.length === 0 && (
              <p className="text-sm text-gray-500 mb-2">No items added yet.</p>
            )}

            <div className="space-y-3">
              {items.map((item, index) => {
                const product = products.find(p => p.productId === item.productId);
                const price = product?.price || 0;
                const subtotal = price * item.quantity;

                return (
                  <div
                    key={index}
                    className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center bg-gray-100 px-3 py-4 rounded-md border"
                  >
                    <select
                      value={item.productId}
                      onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                      className="col-span-12 sm:col-span-5 border border-gray-300 px-3 py-2 rounded-md focus:ring focus:ring-blue-200"
                      required
                    >
                      <option value="">Select Product</option>
                      {products.map((p) => (
                        <option key={p.productId} value={p.productId}>
                          {p.name} (₹{p.price})
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      className="col-span-6 sm:col-span-2 border border-gray-300 px-3 py-2 rounded-md text-center"
                      required
                    />

                    <div className="col-span-6 sm:col-span-3 text-sm text-gray-700 font-medium text-right sm:text-left">
                      ₹{subtotal.toFixed(2)}
                    </div>

                    <div className="col-span-12 sm:col-span-2 text-right">
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Remove Item"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Invoice Upload */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">
              Invoice (PDF) <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setInvoiceFile(e.target.files[0])}
                className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 border border-gray-300 rounded-md"
              />
              {invoiceFile && (
                <p className="text-xs text-gray-500">Selected: {invoiceFile.name}</p>
              )}
            </div>
          </div>

          {/* Total Price */}
          <div className="bg-blue-50 p-4 rounded-md text-right text-lg font-semibold text-blue-800 border border-blue-200 shadow-sm">
            Total: ₹{calculateTotal().toFixed(2)}
          </div>

          {/* Submit Button */}
          <div className="text-right">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-semibold transition"
            >
              Submit Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
